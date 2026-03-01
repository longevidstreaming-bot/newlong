
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play, Clock, BarChart, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import FavoriteButton from '../common/FavoriteButton';

export default function VideoCard({ video, index, currentUser }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const viewsText = (video?.views || 0).toLocaleString('pt-BR');
  const dateText = video?.created_date 
    ? formatDistanceToNow(new Date(video.created_date), { addSuffix: true, locale: ptBR })
    : 'Data desconhecida';

  const isAdmin = currentUser?.role === 'admin';
  const isPending = video?.status === 'pending';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03, zIndex: 10 }}
      className="flex-shrink-0"
    >
      <Link to={createPageUrl(`Watch?v=${video.id}`)} className="block group">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800">
          <img
            src={video.thumbnail_url || 'https://placehold.co/1600x900/121212/7B61FF?text=LONGEVID'}
            alt={video.title || 'Vídeo sem título'}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isPending && isAdmin ? 'opacity-60' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          {isAdmin && isPending && (
            <Badge 
              variant="default" 
              className="absolute top-3 left-3 bg-yellow-500 text-black font-semibold text-xs"
            >
              <EyeOff className="w-3 h-3 mr-1" />
              Pendente
            </Badge>
          )}
          <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
            <span className="text-sm font-medium">{video.duration || '00:00'}</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          {video.artist_id ? (
            <Link to={createPageUrl(`ArtistProfile?id=${video.artist_id}`)}>
              <img
                src={video.artist_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.artist_name || 'A')}&background=7B61FF&color=fff`}
                alt={video.artist_name || 'Artista desconhecido'}
                className="w-10 h-10 rounded-full mt-1"
              />
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-full mt-1 bg-gray-700"></div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-white group-hover:text-[#7B61FF] transition-colors duration-200 leading-tight">
              {video.title || 'Vídeo sem título'}
            </h3>
            <p className="text-sm text-[#B0B0B0] group-hover:text-white transition-colors duration-200">
              {video.artist_name || 'Artista desconhecido'}
            </p>
            <div className="flex items-center gap-3 text-xs text-[#6A6A7A] mt-1">
              <div className="flex items-center gap-1">
                <BarChart className="w-3 h-3" />
                <span>{viewsText}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{dateText}</span>
              </div>
            </div>
            
            {/* Botão de favorito no card */}
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <FavoriteButton 
                video={video} 
                variant="ghost" 
                className="h-8 px-2 text-xs border-none bg-black/60 backdrop-blur-sm text-white hover:bg-black/80" 
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
