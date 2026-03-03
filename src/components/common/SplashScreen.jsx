import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import AudioBranding from './AudioBranding';

export default function SplashScreen({ onComplete }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Audio branding do localStorage
  const audioBrandingUrl = localStorage.getItem('longevid_audio_branding');
  const logoUrl = localStorage.getItem('longevid_logo_url');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#121212' }}
    >
      {/* Audio Branding - Reproduz automaticamente */}
      {audioBrandingUrl && (
        <AudioBranding 
          audioUrl={audioBrandingUrl} 
          trigger="immediate" 
          volume={0.4} 
          delay={800}
          fadeIn={false}
        />
      )}

      {/* Logo Animado */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative mb-8"
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="LONGEVID"
            className="w-28 h-28 object-contain"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl" style={{ backgroundColor: '#1E1E2F' }}>
            <span className="text-white text-xl font-bold">LONGEVID</span>
          </div>
        )}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#FF4F81' }}
        >
          <Play className="w-4 h-4 text-white ml-0.5" />
        </motion.div>
      </motion.div>

      {/* Nome da Marca */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold tracking-wider mb-4"
        style={{ 
          color: '#FFFFFF',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        LONGEVID
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="text-lg md:text-xl text-center max-w-md mx-auto px-4"
        style={{ color: '#B0B0B0' }}
      >
        Onde a música vive mais
      </motion.p>

      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.4 }}
        className="mt-12"
      >
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#7B61FF' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
