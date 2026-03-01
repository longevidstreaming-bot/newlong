
import React, { useState, useEffect } from "react";
import { Video } from "@/api/entities";
import { User } from "@/api/entities";
import SplashScreen from "../components/common/SplashScreen";
import HeroBanner from "../components/home/HeroBanner";
import FeaturedArtists from "../components/home/FeaturedArtists";
import TrendingVideos from "../components/home/TrendingVideos";
import VideoGrid from "../components/video/VideoGrid";
import CategoryFilter from "../components/video/CategoryFilter";
import { motion } from "framer-motion";
import { createPageUrl } from '@/utils';
import Top10Videos from "../components/home/Top10Videos";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const categoryParam = urlParams.get('category');

  useEffect(() => {
    const checkUserAndLoad = async () => {
      const user = await User.me().catch(() => null);
      setCurrentUser(user);
      
      const initialCategory = categoryParam || "all";
      setActiveCategory(initialCategory);
      loadVideos(initialCategory, searchQuery, user);
    };
    checkUserAndLoad();
  }, [categoryParam, searchQuery]);

  const loadVideos = async (category, search, user) => {
    setIsLoading(true);
    try {
      let fetchedVideos;
      
      console.log('🔍 Carregando vídeos...');
      
      // Filtrar apenas por vídeos não deletados (sem verificar status)
      const baseFilter = { is_deleted: false };
      
      if (search) {
        const allVideos = await Video.filter(baseFilter, "-created_date");
        console.log('📊 Total de vídeos para busca:', allVideos.length);
        
        fetchedVideos = allVideos.filter(video => 
          video.title?.toLowerCase().includes(search.toLowerCase()) ||
          video.artist_name?.toLowerCase().includes(search.toLowerCase())
        );
        console.log('🔍 Vídeos encontrados na busca:', fetchedVideos.length);

      } else if (category && category !== "all") {
        if (category === 'trending') {
          fetchedVideos = await Video.filter(baseFilter, '-views', 12);
        } else {
          const categoryFilter = { ...baseFilter, category: category };
          fetchedVideos = await Video.filter(categoryFilter, "-created_date");
        }
      } else {
        fetchedVideos = await Video.filter(baseFilter, "-created_date");
      }
      
      console.log(`✅ Vídeos carregados: ${fetchedVideos.length}`);
      setVideos(fetchedVideos);
    } catch (error) {
      console.error("❌ Erro ao carregar vídeos:", error);
      setVideos([]);
    }
    setIsLoading(false);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    const url = category === "all" ? createPageUrl("Home") : createPageUrl(`Home?category=${category}`);
    window.history.pushState({}, '', url);
    loadVideos(category, null, currentUser);
  };
  
  const getPageTitle = () => {
    if (searchQuery) {
      return `Resultados para "${searchQuery}"`;
    }
    if (activeCategory && activeCategory !== 'all') {
      const genreMap = {
        pop: "Pop",
        rock: "Rock", 
        sertanejo: "Sertanejo",
        hiphop: "Hip Hop",
        mpb: "MPB",
        eletronica: "Eletrônica",
        gospel: "Gospel",
        reggae: "Reggae",
        metal: "Metal",
        trending: "Em Alta",
        infantil: "Infantil"
      }
      return genreMap[activeCategory] || "Videoclipes";
    }
    return "Descubra novos clipes";
  };
  
  const getPageSubtitle = () => {
    if (searchQuery) {
      return `${videos.length} ${videos.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;
    }
    return "Explore os maiores sucessos e lançamentos do mundo da música";
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121212' }}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Se não há busca ou categoria específica, mostrar página inicial completa */}
        {!searchQuery && (!categoryParam || categoryParam === 'all') && (
          <>
            <HeroBanner />
            <FeaturedArtists />
            <TrendingVideos />
            <Top10Videos />
          </>
        )}

        {/* Se há busca ou categoria específica, mostrar filtros e resultados */}
        {(searchQuery || (categoryParam && categoryParam !== 'all')) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {getPageTitle()}
              </h1>
              <p className="text-[#B0B0B0]">
                {getPageSubtitle()}
              </p>
            </div>
          
            {(!searchQuery) && <CategoryFilter 
              activeCategory={activeCategory} 
              onCategoryChange={handleCategoryChange} 
            />}
          </motion.div>
        )}

        {/* Grid de vídeos para busca/categoria ou seção "Mais vídeos" na home */}
        {(searchQuery || categoryParam) ? (
          <VideoGrid videos={videos} isLoading={isLoading} currentUser={currentUser} />
        ) : (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Mais Videoclipes
              </h2>
            </motion.div>
            <VideoGrid videos={videos} isLoading={isLoading} currentUser={currentUser} />
          </section>
        )}

        {!isLoading && videos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🎶</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum clipe encontrado
            </h3>
            <p className="text-[#B0B0B0]">
              {searchQuery 
                ? "Tente buscar por outros termos" 
                : "Parece que não há clipes nesta categoria ainda"
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
