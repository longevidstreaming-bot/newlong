import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AdManager } from './AdManager';
import { Skip, Volume2, VolumeX, X } from 'lucide-react';
import GoogleAdSense from './GoogleAdSense';

export default function PreRollAdSense({ onAdComplete, targetVideoId, videoCategory, userId }) {
  const [campaign, setCampaign] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [adStarted, setAdStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const loadAd = async () => {
      try {
        const adData = await AdManager.shouldShowPreRoll(userId, targetVideoId, videoCategory);
        if (adData.shouldShow && adData.campaign) {
          setCampaign(adData.campaign);
          setAdStarted(true);
          
          // Registrar impressão
          await AdManager.recordImpression(adData.campaign, userId, targetVideoId);
        } else {
          onAdComplete();
        }
      } catch (error) {
        console.error('Erro ao carregar anúncio:', error);
        onAdComplete();
      }
    };

    loadAd();
  }, [userId, targetVideoId, videoCategory]);

  useEffect(() => {
    if (!adStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [adStarted, timeLeft]);

  const handleSkip = async () => {
    if (campaign) {
      await AdManager.recordCompletion(campaign, userId, targetVideoId, false); // false = skipped
    }
    onAdComplete();
  };

  const handleAdComplete = async () => {
    if (campaign) {
      await AdManager.recordCompletion(campaign, userId, targetVideoId, true); // true = completed
    }
    onAdComplete();
  };

  const handleAdClick = async () => {
    if (campaign) {
      await AdManager.recordClick(campaign, userId, targetVideoId);
      if (campaign.click_through_url) {
        window.open(campaign.click_through_url, '_blank');
      }
    }
  };

  if (!campaign) {
    return (
      <div className="fixed inset-0 bg-[#121212] flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
          <p>Carregando anúncio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#121212] flex flex-col items-center justify-center z-50">
      
      {/* Header com informações do anúncio */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#7B61FF] text-white text-sm font-semibold rounded-full">
            Anúncio
          </div>
          <span className="text-[#B0B0B0] text-sm">
            por {campaign.advertiser_name}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-[#1E1E2F] hover:bg-[#2C2C3E] rounded-full transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Área principal do anúncio */}
      <div className="flex-1 flex items-center justify-center w-full max-w-4xl px-4">
        
        {/* Google AdSense Video Ad */}
        <div className="relative w-full max-w-2xl aspect-video bg-[#1E1E2F] rounded-2xl overflow-hidden border border-[#2C2C3E] cursor-pointer"
             onClick={handleAdClick}>
          
          {/* Placeholder para anúncio de vídeo do Google */}
          <GoogleAdSense
            adSlot="9876543210" // Slot específico para anúncios de vídeo
            adFormat="fluid"
            style={{ 
              width: '100%', 
              height: '100%',
              minHeight: '400px'
            }}
            responsive={true}
          />
          
          {/* Overlay com timer e botão skip */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {!canSkip ? (
              <div className="px-3 py-2 bg-black/70 text-white text-sm rounded-lg backdrop-blur-sm">
                Pular anúncio em {timeLeft}s
              </div>
            ) : (
              <Button
                onClick={handleSkip}
                className="bg-[#1E1E2F]/90 hover:bg-[#2C2C3E] text-white border border-[#2C2C3E] backdrop-blur-sm"
                size="sm"
              >
                <Skip className="w-4 h-4 mr-1" />
                Pular Anúncio
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-[#B0B0B0] text-sm">
          Seu vídeo começará após este anúncio
        </p>
        
        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto mt-2 h-1 bg-[#2C2C3E] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#7B61FF] transition-all duration-1000 ease-linear"
            style={{ width: `${(1 - timeLeft/5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}