import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Video } from '@/api/entities';
import { ArtistApplication } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Upload, BarChart3, Eye, Heart, TrendingUp, Users, Play, Music, VideoIcon, Calendar } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import MyVideosList from '../components/artist/MyVideosList';

export default function ArtistDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    pendingVideos: 0
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      console.log('🔍 Verificando permissões no Artist Dashboard...');
      setIsLoading(true);
      
      try {
        const user = await User.me();
        console.log('👤 Usuário carregado no dashboard:', user);
        
        if (!user) {
          console.log('❌ Usuário não logado');
          window.location.href = createPageUrl('AuthPage');
          return;
        }
        
        // Verificação 1: Role de artista
        if (user.role === 'artist') {
          console.log('✅ Acesso ao dashboard concedido pela role "artist"');
          setCurrentUser(user);
          await loadArtistStats(user);
          setIsLoading(false);
          return;
        }

        // Verificação 2: Candidatura aprovada (fallback)
        console.log('🔍 Role não é "artist". Verificando candidatura aprovada...');
        try {
          const applications = await ArtistApplication.filter({ user_id: user.id });
          const approvedApp = applications.find(app => app.status === 'approved');
          
          if (approvedApp) {
            console.log('✅ Acesso ao dashboard concedido por candidatura aprovada');
            setCurrentUser(user);
            await loadArtistStats(user);
            setIsLoading(false);
            return;
          }
        } catch (appError) {
          console.log('⚠️ Erro ao verificar candidatura:', appError);
        }
        
        // Se chegou aqui, não é artista
        console.log('❌ Usuário não é artista, redirecionando para BecomeArtist');
        window.location.href = createPageUrl('BecomeArtist');
        
      } catch (error) {
        console.error('❌ Erro geral no dashboard:', error);
        // Em caso de erro, tentar permitir acesso se o usuário existir
        try {
          const user = await User.me();
          if (user) {
            console.log('⚠️ Permitindo acesso ao dashboard apesar do erro');
            setCurrentUser(user);
            await loadArtistStats(user);
          } else {
            window.location.href = createPageUrl('Home');
          }
        } catch {
          window.location.href = createPageUrl('Home');
        }
        setIsLoading(false);
      }
    };
    
    loadDashboard();
  }, []);

  const loadArtistStats = async (user) => {
    try {
      // Carregar estatísticas
      const videos = await Video.filter({ artist_id: user.id });
      const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);
      const totalLikes = videos.reduce((acc, video) => acc + (video.likes || 0), 0);
      const pendingVideos = videos.filter(v => v.status === 'pending').length;
      
      setStats({
        totalVideos: videos.length,
        totalViews,
        totalLikes,
        pendingVideos
      });
      
      // Vídeos recentes (últimos 5)
      const recent = videos
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5);
      setRecentVideos(recent);
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Não redirecionar por erro nas estatísticas, apenas definir valores padrão
      setStats({
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        pendingVideos: 0
      });
      setRecentVideos([]);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
          <p className="text-white">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Se chegou aqui mas não tem currentUser, algo deu errado
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Erro ao carregar dados do usuário.</p>
          <Button 
            onClick={() => window.location.href = createPageUrl('Home')}
            className="mt-4"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Olá, {currentUser?.artist_name || currentUser?.full_name}! 🎵
            </h1>
            <p className="text-[#B0B0B0] text-lg">
              Gerencie seus videoclipes e acompanhe suas estatísticas
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = createPageUrl('UploadVideo')}
            className="bg-gradient-to-r from-[#FF4F81] to-[#7B61FF] font-semibold px-6"
          >
            <Upload className="w-5 h-5 mr-2" />
            Novo Upload
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <VideoIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-[#B0B0B0] text-sm">Total de Vídeos</p>
                  <p className="text-2xl font-bold text-white">{stats.totalVideos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-[#B0B0B0] text-sm">Total de Visualizações</p>
                  <p className="text-2xl font-bold text-white">{formatViews(stats.totalViews)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-[#B0B0B0] text-sm">Total de Curtidas</p>
                  <p className="text-2xl font-bold text-white">{formatViews(stats.totalLikes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-[#B0B0B0] text-sm">Vídeos Pendentes</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingVideos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1E1E2F] border-[#2C2C3E]">
              <TabsTrigger 
                value="videos" 
                className="data-[state=active]:bg-[#7B61FF] data-[state=active]:text-white text-[#B0B0B0]"
              >
                Meus Vídeos
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-[#7B61FF] data-[state=active]:text-white text-[#B0B0B0]"
              >
                Estatísticas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="videos" className="mt-6">
              <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-[#7B61FF]" />
                    Gerenciar Videoclipes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MyVideosList artistId={currentUser.id} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#7B61FF]" />
                    Estatísticas Detalhadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-[#B0B0B0] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Estatísticas Avançadas em Breve
                    </h3>
                    <p className="text-[#B0B0B0]">
                      Em breve você terá acesso a relatórios detalhados sobre suas visualizações, 
                      engagement e performance dos seus videoclipes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}