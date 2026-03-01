
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Video } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Share2, AlertTriangle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdManager } from '../components/ads/AdManager';
import PreRollAdPlayer from '../components/ads/PreRollAdPlayer';
import TuneInButton from '../components/artist/TuneInButton';
import VideoPlayer from '../components/video/VideoPlayer';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ShareButton from '../components/common/ShareButton';
import FavoriteButton from '../components/common/FavoriteButton';

export default function Watch() {
  const location = useLocation();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [adCampaign, setAdCampaign] = useState(null);
  const [user, setUser] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const hasIncrementedView = useRef(false);

  const videoId = new URLSearchParams(location.search).get('v');

  const incrementViewCount = async (currentVideo) => {
    if (hasIncrementedView.current) return;
    
    try {
      console.log('🎬 Dados do vídeo para atualização:', currentVideo);
      
      // Verificar se todos os campos obrigatórios existem
      if (!currentVideo.artist_id) {
        console.warn('⚠️ artist_id não encontrado no vídeo, pulando incremento de visualização');
        return;
      }
      
      if (!currentVideo.title || !currentVideo.video_url) {
        console.warn('⚠️ Campos obrigatórios faltando, pulando incremento de visualização');
        return;
      }
      
      // Incluir todos os campos obrigatórios na atualização
      const updateData = {
        title: currentVideo.title,
        video_url: currentVideo.video_url,
        artist_id: currentVideo.artist_id,
        artist_name: currentVideo.artist_name || 'Artista Desconhecido',
        uploader_type: currentVideo.uploader_type || 'artista_independente',
        views: (currentVideo.views || 0) + 1
      };
      
      console.log('📊 Dados que serão enviados para atualização:', updateData);
      
      await Video.update(currentVideo.id, updateData);
      console.log('✅ Visualização incrementada com sucesso');
      hasIncrementedView.current = true;
      
    } catch (e) {
      console.error('❌ Falha ao incrementar visualização:', e);
      console.error('📋 Dados do vídeo atual:', currentVideo);
    }
  };

  const handleAdComplete = () => {
    setShowAd(false);
    if (video) {
      incrementViewCount(video);
    }
    if (adCampaign && user) {
        AdManager.recordCompletion(adCampaign, user.id, video.id, true);
    }
  };

  const handleAdSkipped = () => {
    setShowAd(false);
     if (video) {
      incrementViewCount(video);
    }
    if (adCampaign && user) {
        AdManager.recordCompletion(adCampaign, user.id, video.id, false);
    }
  };

  useEffect(() => {
    const fetchVideoAndRelated = async () => {
      if (!videoId) {
        setError("Nenhum ID de vídeo fornecido.");
        setIsLoading(false);
        return;
      }
      
      try {
        const fetchedVideo = await Video.get(videoId);
        console.log('🎯 Vídeo buscado:', fetchedVideo);

        if (!fetchedVideo || fetchedVideo.is_deleted) {
          setError("Este vídeo não está mais disponível.");
          setIsLoading(false);
          return;
        }
        
        setVideo(fetchedVideo);

        const currentUser = await User.me().catch(() => null);
        setUser(currentUser);
        
        const adDecision = await AdManager.shouldShowPreRoll(currentUser?.id, videoId, fetchedVideo.category);
        
        if (adDecision.shouldShow) {
          setAdCampaign(adDecision.campaign);
          setShowAd(true);
        } else {
          incrementViewCount(fetchedVideo);
        }

        // Placeholder for fetching related videos. Replace with actual API call if available.
        setRelatedVideos([
          { id: '123', title: 'Artista X - A canção do verão', artist_name: 'Artista X', thumbnail_url: 'https://picsum.photos/320/180?random=1', views: 12000, created_date: new Date('2023-01-15'), duration: '3:45' },
          { id: '124', title: 'Banda Y - Onde tudo começou (Clipe Oficial)', artist_name: 'Banda Y', thumbnail_url: 'https://picsum.photos/320/180?random=2', views: 8500, created_date: new Date('2023-03-20'), duration: '2:10' },
          { id: '125', title: 'Cantora Z feat. Produtor K - Batidas Urbanas', artist_name: 'Cantora Z', thumbnail_url: 'https://picsum.photos/320/180?random=3', views: 25000, created_date: new Date('2023-05-01'), duration: '5:00' },
          { id: '126', title: 'Guitarrista A - Solo Acústico na Montanha', artist_name: 'Guitarrista A', thumbnail_url: 'https://picsum.photos/320/180?random=4', views: 5000, created_date: new Date('2023-06-10'), duration: '4:20' },
        ]);
        
      } catch (err) {
        console.error("❌ Erro ao carregar vídeo:", err);
        setError("Não foi possível carregar o vídeo. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideoAndRelated();
  }, [videoId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
          <p className="text-white">Carregando vídeo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white text-center p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Vídeo Indisponível</h1>
            <p className="text-[#B0B0B0]">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!video) return null; // Should not happen if error is handled, but as a fallback.

  if (showAd) {
    return (
      <PreRollAdPlayer 
        campaign={adCampaign}
        onAdComplete={handleAdComplete}
        onAdSkipped={handleAdSkipped}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#121212' }}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-6 shadow-2xl shadow-black/30">
                <VideoPlayer
                  src={video.video_url}
                  poster={video.thumbnail_url}
                  className="w-full h-full"
                />
              </div>

              {/* Botões de ação logo abaixo do player */}
              <div className="flex items-center justify-center gap-4 mb-6">
                {video.artist_id && <TuneInButton artistId={video.artist_id} />}
                
                <FavoriteButton video={video} />
                
                <ShareButton 
                  url={window.location.href}
                  title={video.title}
                  description={`Assista "${video.title}" de ${video.artist_name} no LONGEVID - Onde a música vive mais!`}
                />
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl text-white leading-tight font-bold">
                  {video.title}
                </h1>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-[#2C2C3E]">
                  {/* Artist info */}
                  {video.artist_id ? (
                    <Link to={createPageUrl(`ArtistProfile?id=${video.artist_id}`)} className="flex items-center gap-3 group">
                        <img src={video.artist_avatar} alt={video.artist_name} className="w-12 h-12 rounded-full object-cover"/>
                        <div>
                            <p className="font-semibold text-white text-lg group-hover:text-[#7B61FF]">{video.artist_name}</p>
                        </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={video.artist_avatar} alt={video.artist_name} className="w-12 h-12 rounded-full object-cover"/>
                      <div>
                          <p className="font-semibold text-white text-lg">{video.artist_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Views, Date, Category Badge */}
                  <div className="flex items-center gap-6 text-sm text-[#6A6A7A]">
                    <span>{(video.views || 0).toLocaleString('pt-BR')} visualizações</span>
                    {video.created_date && <span>•</span>}
                    {video.created_date && <span>{formatDistanceToNow(new Date(video.created_date), { addSuffix: true, locale: ptBR })}</span>}
                    {video.category && (
                      <Badge className="bg-gradient-to-r from-[#7B61FF] to-[#FF4F81] text-white">
                        {video.category.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                {video.description && (
                  <div className="bg-[#1E1E2F] rounded-2xl p-6 border border-[#2C2C3E]">
                    <p className="text-[#B0B0B0] leading-relaxed">{video.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Vídeos relacionados */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-white">Vídeos relacionados</h3>
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <Link
                    key={relatedVideo.id}
                    to={createPageUrl(`Watch?v=${relatedVideo.id}`)}
                    className="flex gap-3 group hover:bg-[#1E1E2F] rounded-xl p-3 transition-colors"
                  >
                    <div className="relative w-40 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={relatedVideo.thumbnail_url}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {relatedVideo.duration && (
                         <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                           {relatedVideo.duration}
                         </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm leading-tight mb-2 group-hover:text-[#7B61FF] line-clamp-2">
                        {relatedVideo.title}
                      </h4>
                      <p className="text-xs text-[#B0B0B0] mb-1">{relatedVideo.artist_name}</p>
                      <div className="flex items-center gap-2 text-xs text-[#6A6A7A]">
                        <span>{(relatedVideo.views || 0).toLocaleString('pt-BR')} views</span>
                        {relatedVideo.created_date && <span>•</span>}
                        {relatedVideo.created_date && <span>{formatDistanceToNow(new Date(relatedVideo.created_date), { addSuffix: true, locale: ptBR })}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
