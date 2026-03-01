
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User } from '@/api/entities';
import { Video } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play, Music, Users, Instagram, Twitter, ExternalLink, Heart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import TuneInButton from '../components/artist/TuneInButton';
import ShareButton from '../components/common/ShareButton';
import FavoriteButton from '../components/common/FavoriteButton';

export default function ArtistProfile() {
  const location = useLocation();
  const [artist, setArtist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [latestVideo, setLatestVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const artistId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const loadArtistProfile = async () => {
      if (!artistId) {
        setError("ID do artista não fornecido.");
        setIsLoading(false);
        return;
      }

      try {
        // Buscar dados do artista
        const artistData = await User.get(artistId);
        if (!artistData) {
          setError("Usuário não encontrado.");
          setIsLoading(false);
          return;
        }
        
        setArtist(artistData);

        // Buscar vídeos do artista (sem filtro de status)
        const artistVideos = await Video.filter({
          artist_id: artistId,
          is_deleted: false
        }, '-created_date');

        setVideos(artistVideos);
        
        // Definir o vídeo mais recente como "último lançamento"
        if (artistVideos.length > 0) {
          setLatestVideo(artistVideos[0]);
        }

      } catch (err) {
        console.error("Erro ao carregar perfil do artista:", err);
        setError("Erro ao carregar dados do artista.");
      } finally {
        setIsLoading(false);
      }
    };

    loadArtistProfile();
  }, [artistId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
          <p className="text-white">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Erro</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const artistDisplayName = artist.artist_name || artist.full_name;

  const genreColors = {
    pop: 'from-pink-500 to-purple-500',
    rock: 'from-red-500 to-orange-500', 
    sertanejo: 'from-yellow-500 to-green-500',
    hiphop: 'from-purple-500 to-blue-500',
    mpb: 'from-blue-500 to-teal-500',
    eletronica: 'from-cyan-500 to-purple-500',
    gospel: 'from-yellow-400 to-orange-500',
    reggae: 'from-green-500 to-yellow-500',
    metal: 'from-gray-500 to-red-500',
    infantil: 'from-pink-400 to-blue-400'
  };

  const gradientClass = genreColors[artist?.genre] || 'from-[#7B61FF] to-[#FF4F81]';

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Banner com foto de capa */}
      <div className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r opacity-90"
          style={{
            backgroundImage: `url(${artist.cover_photo || artist.artist_avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} mix-blend-multiply opacity-60`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
        
        {/* Conteúdo do banner */}
        <div className="relative z-10 h-full flex items-end">
          <div className="w-full max-w-7xl mx-auto p-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row items-end gap-8"
            >
              {/* Foto do artista */}
              <div className="relative">
                <img
                  src={artist.artist_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(artistDisplayName)}&background=7B61FF&color=fff&size=200`}
                  alt={artistDisplayName}
                  className="w-48 h-48 rounded-2xl border-4 border-white/20 shadow-2xl object-cover"
                />
                {artist.role === 'artist' && (
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                        <Music className="w-3 h-3 mr-1" />
                        Artista
                    </Badge>
                )}
              </div>

              {/* Informações do artista */}
              <div className="flex-1 text-white">
                <h1 className="text-5xl md:text-7xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {artistDisplayName}
                </h1>
                <p className="text-xl text-white/80 mb-6 max-w-2xl leading-relaxed">
                  {artist.artist_bio || "Explorando novos sons e melodias."}
                </p>
                
                {/* Botões de ação */}
                <div className="flex flex-wrap gap-4 items-center">
                  <TuneInButton artistId={artist.id} />
                  
                  <FavoriteButton 
                    video={latestVideo} 
                    className={latestVideo ? '' : 'opacity-50 cursor-not-allowed pointer-events-none'}
                  />
                  
                  <ShareButton 
                    url={window.location.href}
                    title={`${artistDisplayName} - LONGEVID`}
                    description={`Conheça ${artistDisplayName} e seus incríveis videoclips no LONGEVID!`}
                  />

                  {/* Links sociais */}
                  <div className="flex gap-3 ml-4">
                    {artist.social_links?.instagram && (
                      <a 
                        href={artist.social_links.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {artist.social_links?.twitter && (
                      <a 
                        href={artist.social_links.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {artist.social_links?.spotify && (
                      <a 
                        href={artist.social_links.spotify} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Último Lançamento */}
        {latestVideo && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Último lançamento</h2>
            
            <div className="flex flex-col lg:flex-row gap-8 bg-[#1E1E2F] rounded-2xl overflow-hidden p-8">
              <div className="lg:w-80 flex-shrink-0">
                <Link to={createPageUrl(`Watch?v=${latestVideo.id}`)}>
                  <div className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer">
                    <img
                      src={latestVideo.thumbnail_url}
                      alt={latestVideo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="flex-1">
                <h3 className="text-4xl font-bold text-white mb-2">{latestVideo.title}</h3>
                <p className="text-lg text-[#B0B0B0] mb-4">{artistDisplayName}</p>
                
                {latestVideo.description && (
                  <p className="text-[#B0B0B0] mb-6 leading-relaxed">
                    {latestVideo.description}
                  </p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-[#6A6A7A] mb-8">
                  <span>{(latestVideo.views || 0).toLocaleString('pt-BR')} visualizações</span>
                  <span>{latestVideo.duration}</span>
                  <Badge className={`bg-gradient-to-r ${gradientClass} text-white`}>
                    {latestVideo.category?.toUpperCase()}
                  </Badge>
                </div>

                <Link to={createPageUrl(`Watch?v=${latestVideo.id}`)}>
                  <Button className={`bg-gradient-to-r ${gradientClass} text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-transform`}>
                    <Play className="w-5 h-5 mr-2" />
                    Assistir Agora
                  </Button>
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        {/* Discografia */}
        {videos.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8">Discografia</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (index * 0.1), duration: 0.4 }}
                >
                  <Link to={createPageUrl(`Watch?v=${video.id}`)} className="block group">
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg group-hover:text-[#7B61FF] transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {(video.views || 0).toLocaleString('pt-BR')} visualizações
                        </p>
                      </div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Galeria (usando thumbnails dos vídeos) */}
        {videos.length > 3 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8">Galeria</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.slice(0, 8).map((video, index) => (
                <motion.div
                  key={`gallery-${video.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + (index * 0.05), duration: 0.3 }}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={video.thumbnail_url}
                    alt={`Galeria ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Mensagem quando não há vídeos */}
        {videos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center py-16"
          >
            <Music className="w-16 h-16 text-[#6A6A7A] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum conteúdo ainda
            </h3>
            <p className="text-[#B0B0B0]">
              Este usuário ainda não publicou nenhum videoclipe.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
