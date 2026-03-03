import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import TopVideoCard from '../video/TopVideoCard';

export default function Top10Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopVideos = async () => {
      try {
        console.log('🏆 Carregando Top 10 vídeos...');
        const topVideos = await Video.filter();
        const ordered = [...topVideos]
          .filter(v => !v.is_deleted)
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 10);
        console.log('📊 Top 10 vídeos encontrados:', ordered.length);
        setVideos(ordered);
      } catch (error) {
        console.error('Erro ao carregar Top 10 vídeos:', error);
      }
      setIsLoading(false);
    };
    loadTopVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="w-full h-40 bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Top 10 da Semana
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className=""
          >
            <Link to={createPageUrl(`Watch?v=${video.id}`)}>
              <TopVideoCard video={video} rank={index + 1} />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
