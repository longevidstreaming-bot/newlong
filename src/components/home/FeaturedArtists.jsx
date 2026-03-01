import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Music, Users } from 'lucide-react';

export default function FeaturedArtists() {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArtists = async () => {
      try {
        const allUsers = await User.filter({ role: 'artist' }, '-created_date', 8);
        setArtists(allUsers);
      } catch (error) {
        console.error('Erro ao carregar artistas:', error);
      }
      setIsLoading(false);
    };
    loadArtists();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Artistas em Destaque</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 space-y-3 animate-pulse">
              <div className="w-40 h-40 bg-gray-800 rounded-2xl"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (artists.length === 0) return null;

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#7B61FF' }}>
          <Music className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Artistas em Destaque
        </h2>
      </motion.div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {artists.map((artist, index) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-shrink-0 group"
          >
            <Link to={createPageUrl(`ArtistProfile?id=${artist.id}`)}>
              <div className="w-40 space-y-3 cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={artist.artist_avatar || `https://ui-avatars.com/api/?name=${artist.artist_name}&background=7B61FF&color=fff&size=160`}
                    alt={artist.artist_name}
                    className="w-40 h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-1 text-white text-xs">
                        <Users className="w-3 h-3" />
                        <span>Ver perfil</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-sm group-hover:text-[#7B61FF] transition-colors duration-200 truncate">
                    {artist.artist_name}
                  </h3>
                  <p className="text-[#B0B0B0] text-xs truncate">
                    {artist.artist_bio || 'Artista'}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}