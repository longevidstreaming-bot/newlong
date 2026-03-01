import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { FavoriteVideo } from '@/api/entities';
import { User } from '@/api/entities';
import { motion } from 'framer-motion';

export default function FavoriteButton({ video, variant = "outline", className = "" }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!video?.id) return;
      
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        // Verificar se o vídeo já está nos favoritos
        const favorites = await FavoriteVideo.filter({
          user_id: user.id,
          video_id: video.id
        });
        
        setIsFavorited(favorites.length > 0);
      } catch (error) {
        // Usuário não logado
        setCurrentUser(null);
        setIsFavorited(false);
      }
    };

    checkFavoriteStatus();
  }, [video?.id]);

  const handleFavorite = async () => {
    if (!video) return;
    
    // Se não estiver logado, redirecionar para login
    if (!currentUser) {
      await User.loginWithRedirect(window.location.href);
      return;
    }

    setIsLoading(true);
    
    try {
      if (isFavorited) {
        // Remover dos favoritos
        const favorites = await FavoriteVideo.filter({
          user_id: currentUser.id,
          video_id: video.id
        });
        
        if (favorites.length > 0) {
          await FavoriteVideo.delete(favorites[0].id);
          setIsFavorited(false);
        }
      } else {
        // Adicionar aos favoritos
        await FavoriteVideo.create({
          user_id: currentUser.id,
          video_id: video.id,
          artist_id: video.artist_id
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Erro ao gerenciar favorito:', error);
      // Reverter estado em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleFavorite}
      disabled={isLoading}
      variant={variant}
      className={`${
        isFavorited
          ? 'border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:border-red-400'
          : 'border-[#7B61FF]/30 bg-[#7B61FF]/10 text-[#7B61FF] hover:bg-[#7B61FF]/20 hover:border-[#7B61FF]'
      } flex items-center gap-2 transition-all duration-300 ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isFavorited ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`w-4 h-4 transition-all duration-300 ${
            isFavorited ? 'fill-current text-red-400' : ''
          }`} 
        />
      </motion.div>
      
      <span className="font-medium">
        {isLoading ? 'Aguarde...' : (isFavorited ? 'Favoritado' : 'Favoritar')}
      </span>
    </Button>
  );
}