import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown, Play, Zap, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl mb-12"
      style={{ 
        background: 'linear-gradient(135deg, #1E1E2F 0%, #7B61FF 50%, #FF4F81 100%)',
        minHeight: '300px'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/20"></div>
        <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-white/15"></div>
        <div className="absolute bottom-10 left-1/3 w-12 h-12 rounded-full bg-white/10"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white/20"></div>
      </div>

      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
        <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-center md:justify-start gap-2 mb-4"
          >
            <Crown className="w-6 h-6 text-yellow-300" />
            <span className="text-yellow-300 font-semibold tracking-wide">EXPERIÊNCIA PREMIUM</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Assine por <span className="text-yellow-300">R$ 9,90/mês</span><br />
            e curta sem anúncios!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-lg text-white/80 mb-8 max-w-lg"
          >
            Acesso ilimitado aos melhores videoclipes, sem interrupções, em qualidade HD.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start"
          >
            <Button
              onClick={() => window.location.href = createPageUrl('Pricing')}
              className="bg-white text-black hover:bg-gray-100 font-bold px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <Crown className="w-5 h-5 mr-2" />
              Assinar Agora
            </Button>
            
            <div className="flex items-center gap-3 text-white/80 flex-wrap justify-center md:justify-start">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">Sem anúncios</span>
              </div>
              <div className="w-1 h-1 bg-white/40 rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4 text-green-300" />
                <span className="text-sm font-medium">Qualidade HD</span>
              </div>
              <div className="w-1 h-1 bg-white/40 rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-medium">Conteúdo Exclusivo</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visual Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="hidden md:block relative"
        >
          <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-16 h-16 text-white ml-2" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}