import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { UserIcon, Music, CreditCard, Hourglass, XCircle, CheckCircle } from 'lucide-react';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        
        if (user.role === 'artist') {
          window.location.href = createPageUrl('ArtistDashboard');
          return;
        }

        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        window.location.href = createPageUrl('Home');
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-12"
        >
          <img 
            src={`https://ui-avatars.com/api/?name=${currentUser.full_name || currentUser.email}&background=22c55e&color=fff&size=128`} 
            alt="User" 
            className="w-32 h-32 rounded-full border-4 border-green-500 mb-4"
          />
          <h1 className="text-4xl font-bold text-white">{currentUser.full_name || 'Usuário'}</h1>
          <p className="text-gray-400">{currentUser.email}</p>
        </motion.div>

        {currentUser.role !== 'artist' && (
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 mb-8">
            <div className="text-center">
              {currentUser.artist_status === 'pending' ? (
                <>
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hourglass className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Solicitação de Artista em Análise</h2>
                  <p className="text-gray-400 mb-6">
                    Sua solicitação para se tornar um artista está sendo revisada. Entraremos em contato em breve!
                  </p>
                  <Button 
                    disabled
                    className="bg-gray-600 cursor-not-allowed text-white font-bold px-8 py-3 opacity-70"
                  >
                    Em Análise
                  </Button>
                </>
              ) : currentUser.artist_status === 'rejected' ? (
                <>
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Solicitação de Artista Recusada</h2>
                  <p className="text-gray-400 mb-6">
                    Sua solicitação para se tornar um artista foi recusada. Para mais informações, entre em contato com o suporte ou tente novamente.
                  </p>
                  <Button 
                    onClick={() => window.location.href = createPageUrl('BecomeArtist')}
                    className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3"
                  >
                    Tentar Novamente
                  </Button>
                </>
              ) : currentUser.artist_status === 'approved' ? (
                <>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Parabéns! Sua solicitação foi aprovada.</h2>
                  <p className="text-gray-400 mb-6">
                    Você agora é um artista verificado no LONGEVID. Explore seu painel de artista.
                  </p>
                  <Button 
                    onClick={() => window.location.href = createPageUrl('ArtistDashboard')}
                    className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3"
                  >
                    Ir para o Painel do Artista
                  </Button>
                </>
              ) : ( 
                <>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Torne-se um Artista</h2>
                  <p className="text-gray-400 mb-6">
                    Compartilhe sua música com o mundo. Candidate-se para se tornar um artista verificado no LONGEVID.
                  </p>
                  <Button 
                    onClick={() => window.location.href = createPageUrl('BecomeArtist')}
                    className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3"
                  >
                    Saiba Mais
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <UserIcon className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Minha Conta</h3>
            <p className="text-gray-400">Gerencie suas informações pessoais e preferências.</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <CreditCard className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Assinatura</h3>
            <p className="text-gray-400">
              Status: <span className="text-green-400 font-semibold">
                {currentUser.subscription_type === 'premium' ? 'Premium' : 'Gratuito'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}