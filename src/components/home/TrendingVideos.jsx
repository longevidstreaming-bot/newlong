
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video } from '@/api/entities';
import VideoGrid from '../video/VideoGrid';
import { Flame } from 'lucide-react';

export default function TrendingVideos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrendingVideos = async () => {
      try {
        console.log('🔥 Carregando vídeos em alta...');
        const trendingVideos = await Video.filter({
          is_deleted: false
        }, '-views', 8);
        console.log('📊 Vídeos em alta encontrados:', trendingVideos.length);
        setVideos(trendingVideos);
      } catch (error) {
        console.error('Erro ao carregar vídeos em alta:', error);
      }
      setIsLoading(false);
    };
    loadTrendingVideos();
  }, []);

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF4F81' }}>
          <Flame className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Clipes Mais Assistidos
        </h2>
      </motion.div>

      <VideoGrid videos={videos} isLoading={isLoading} />
    </section>
  );
}
