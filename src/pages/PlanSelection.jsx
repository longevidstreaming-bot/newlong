import React, { useState, useEffect } from "react";
import { Plan } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown, Star, Zap, Music, Eye, EyeOff, PlayCircle, Heart, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from '@/utils';

export default function PlanSelection() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const handleFreePlan = async () => {
    if (!currentUser) {
      await User.login();
      return;
    }
    
    // Manter usuário como free
    await User.updateMyUserData({
      subscription_type: 'free',
      subscription_status: 'inactive',
      ads_enabled: true
    });
    
    window.location.href = createPageUrl('Home');
  };

  const handlePremiumPlan = async () => {
    if (!currentUser) {
      await User.loginWithRedirect(window.location.href);
      return;
    }
    
    window.location.href = createPageUrl('Pricing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
          <p style={{ color: '#FFFFFF' }}>Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121212', color: '#FFFFFF' }}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B61FF, #FF4F81)' }}>
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide">LONGEVID</h1>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Escolha seu plano
          </h2>
          <p className="text-lg md:text-xl" style={{ color: '#B0B0B0' }}>
            Desfrute da melhor experiência musical do Brasil
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-8">
          
          {/* FREE PLAN */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: '#1E1E2F',
              borderColor: '#2C2C3E'
            }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" 
                   style={{ backgroundColor: '#2C2C3E' }}>
                <PlayCircle className="w-8 h-8" style={{ color: '#7B61FF' }} />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Plano Free</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl font-bold">Grátis</span>
              </div>
              <p style={{ color: '#B0B0B0' }}>Experimente o LONGEVID</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#7B61FF' }} />
                <span style={{ color: '#B0B0B0' }}>Acesso limitado aos videoclipes</span>
              </li>
              <li className="flex items-center gap-3">
                <Eye className="w-5 h-5 flex-shrink-0" style={{ color: '#FF4F81' }} />
                <span style={{ color: '#B0B0B0' }}>Exibição de anúncios</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: '#4A4A5A' }}>
                  <div className="w-2 h-2 bg-gray-500 rounded-full m-auto mt-0.5"></div>
                </div>
                <span style={{ color: '#6A6A7A' }}>Sem playlists personalizadas</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#7B61FF' }} />
                <span style={{ color: '#B0B0B0' }}>Qualidade padrão</span>
              </li>
            </ul>

            <Button
              onClick={handleFreePlan}
              className="w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: '#2C2C3E',
                color: '#FFFFFF',
                border: '2px solid #7B61FF'
              }}
            >
              Continuar Grátis
            </Button>
          </motion.div>

          {/* PREMIUM PLAN */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-2xl p-8 border-2 relative transition-all duration-300 hover:scale-105 shadow-2xl"
            style={{ 
              background: 'linear-gradient(135deg, #1E1E2F 0%, #2A1B3D 100%)',
              borderColor: '#7B61FF',
              boxShadow: '0 0 40px rgba(123, 97, 255, 0.3)'
            }}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                   style={{ background: 'linear-gradient(135deg, #FF4F81, #7B61FF)' }}>
                <Star className="w-4 h-4" />
                Mais Popular
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                   style={{ background: 'linear-gradient(135deg, #7B61FF, #FF4F81)' }}>
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Plano Premium</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl font-bold">R$ 9,90</span>
                <span style={{ color: '#B0B0B0' }}>/mês</span>
              </div>
              <p style={{ color: '#B0B0B0' }}>Experiência completa sem limites</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#00D4AA' }} />
                <span>Acesso ilimitado a todos os videoclipes</span>
              </li>
              <li className="flex items-center gap-3">
                <EyeOff className="w-5 h-5 flex-shrink-0" style={{ color: '#00D4AA' }} />
                <span><strong>SEM ANÚNCIOS</strong></span>
              </li>
              <li className="flex items-center gap-3">
                <Heart className="w-5 h-5 flex-shrink-0" style={{ color: '#00D4AA' }} />
                <span>Criação de playlists personalizadas</span>
              </li>
              <li className="flex items-center gap-3">
                <Zap className="w-5 h-5 flex-shrink-0" style={{ color: '#00D4AA' }} />
                <span>Qualidade HD e Full HD</span>
              </li>
              <li className="flex items-center gap-3">
                <Shield className="w-5 h-5 flex-shrink-0" style={{ color: '#00D4AA' }} />
                <span>Suporte prioritário</span>
              </li>
            </ul>

            {/* No Ads Badge */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-300 font-semibold">
                <EyeOff className="w-5 h-5" />
                100% Sem Anúncios
              </div>
            </div>

            <Button
              onClick={handlePremiumPlan}
              className="w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #FF4F81, #FF6B9D)',
                color: '#FFFFFF',
                boxShadow: '0 8px 25px rgba(255, 79, 129, 0.4)'
              }}
            >
              Assinar Agora
            </Button>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-lg mb-2" style={{ color: '#B0B0B0' }}>
            ✨ Cancele quando quiser
          </p>
          <p className="text-sm" style={{ color: '#6A6A7A' }}>
            Sem taxas de cancelamento • Suporte 24/7 • Experiência premium garantida
          </p>
        </motion.div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Por que escolher Premium?</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#1E1E2F' }}>
              <EyeOff className="w-12 h-12 mx-auto mb-4" style={{ color: '#FF4F81' }} />
              <h4 className="font-bold mb-2">Zero Anúncios</h4>
              <p style={{ color: '#B0B0B0' }}>Assista seus clipes favoritos sem interrupções</p>
            </div>
            
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#1E1E2F' }}>
              <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: '#7B61FF' }} />
              <h4 className="font-bold mb-2">Qualidade Superior</h4>
              <p style={{ color: '#B0B0B0' }}>HD e Full HD para a melhor experiência visual</p>
            </div>
            
            <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#1E1E2F' }}>
              <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: '#00D4AA' }} />
              <h4 className="font-bold mb-2">Playlists Ilimitadas</h4>
              <p style={{ color: '#B0B0B0' }}>Organize seus clipes do seu jeito</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}