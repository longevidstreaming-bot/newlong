import React, { useState, useEffect } from 'react';
import { AdManager } from './AdManager';
import { Button } from '@/components/ui/button';
import { SkipForward, Volume2, VolumeX, ExternalLink, Music } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PreRollAdPlayer({ onAdComplete, targetVideoId, videoCategory, userId }) {
  const [campaign, setCampaign] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Começar mudo por padrão
  const [isLoading, setIsLoading] = useState(true);
  const [adDuration, setAdDuration] = useState(15);

  useEffect(() => {
    const loadAd = async () => {
      setIsLoading(true);
      
      const activeCampaign = await AdManager.getActiveAd(videoCategory);
      
      if (!activeCampaign) {
        onAdComplete();
        return;
      }

      setCampaign(activeCampaign);
      await AdManager.recordImpression(activeCampaign, userId, targetVideoId);
      
      const duration = Math.min(activeCampaign.duration || 15, 15);
      setAdDuration(duration);
      setTimeLeft(duration);
      
      setIsLoading(false);

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAdComplete();
            return 0;
          }
          if (prev <= duration - 4) { // Permitir skip após 5 segundos
            setCanSkip(true);
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    };

    loadAd();
  }, [targetVideoId, videoCategory, userId, onAdComplete]);

  const handleAdComplete = async (wasSkipped = false) => {
    if (campaign) {
      await AdManager.recordCompletion(campaign, userId, targetVideoId, !wasSkipped);
    }
    onAdComplete();
  };

  const handleSkip = () => {
    if (canSkip) {
      handleAdComplete(true);
    }
  };

  const handleAdClick = async () => {
    if (campaign && campaign.click_through_url) {
      await AdManager.recordClick(campaign, userId, targetVideoId);
      window.open(campaign.click_through_url, '_blank');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const video = document.getElementById('ad-video');
    if (video) {
      video.muted = !video.muted;
    }
  };
  
  // Tela de carregamento com a marca
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #7B61FF, #FF4F81)' }}>
            <Music className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold font-title">LONGEVID</h2>
        <p className="text-sm text-[var(--text-secondary)] italic">Onde a música vive mais</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mt-6"></div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-black/50 px-4 py-2 flex items-center justify-between absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-2 text-white">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold">Anúncio</span>
        </div>
        <div className="text-white text-sm font-medium">
          {timeLeft}s restantes
        </div>
      </div>

      <div className="flex-1 relative">
        {campaign.format === 'preroll' ? (
          <video
            id="ad-video"
            src={campaign.ad_creative_url}
            autoPlay
            muted={isMuted}
            className="w-full h-full object-contain cursor-pointer"
            onClick={handleAdClick}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-900"
            onClick={handleAdClick}
          >
            <img
              src={campaign.ad_creative_url}
              alt={campaign.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 rounded-lg p-3 backdrop-blur-sm max-w-sm"
            >
              <h3 className="text-white font-bold text-md mb-1">{campaign.name}</h3>
              <p className="text-white/80 text-xs">Por {campaign.advertiser_name}</p>
            </motion.div>
            
            <div className="flex items-center gap-2 pointer-events-auto">
               {campaign.click_through_url && (
                <Button
                  onClick={handleAdClick}
                  className="bg-white/90 text-black hover:bg-white font-semibold"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Saiba Mais
                </Button>
              )}
               {canSkip && (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Pular
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          {campaign.format === 'preroll' && (
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className="bg-black/50 text-white hover:bg-black/70 rounded-full"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            className="h-full bg-yellow-400"
            initial={{ width: '0%' }}
            animate={{ width: `${((adDuration) - timeLeft) / (adDuration) * 100}%` }}
            transition={{ duration: 0.2, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}