import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play } from 'lucide-react';

export default function TopVideoCard({ video, rank }) {
  const videoTitle = video?.title || 'Vídeo sem título';
  const artistName = video?.artist_name || 'Artista desconhecido';
  const thumbnailUrl = video?.thumbnail_url || 'https://placehold.co/400x225/121212/7B61FF?text=LONGEVID';

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="flex-shrink-0 w-64 group"
    >
      <Link to={createPageUrl(`Watch?v=${video.id}`)}>
        <div className="flex items-start gap-4">
          <div className="text-5xl font-bold text-[#4A4A5E] -mt-1 w-12 text-right">
            {rank}
          </div>
          <div className="flex-1">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800 mb-3">
              <img
                src={thumbnailUrl}
                alt={videoTitle}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 text-white ml-1" />
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-white group-hover:text-[#7B61FF] transition-colors duration-200 leading-tight truncate">
              {videoTitle}
            </h3>
            <p className="text-sm text-[#B0B0B0] group-hover:text-white transition-colors duration-200 truncate">
              {artistName}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}