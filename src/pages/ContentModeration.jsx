
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Video } from '@/api/entities';
import { Subscription } from '@/api/entities';
import { Notification } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Eye, AlertTriangle, Clock, ExternalLink, UserIcon, Building, RefreshCw, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function ContentModeration() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingVideos, setPendingVideos] = useState([]);
  const [approvedVideos, setApprovedVideos] = useState([]);
  const [rejectedVideos, setRejectedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        setIsAdmin(true);
        await loadVideos();
      } catch (error) {
        console.error('Erro ao verificar permissões de admin:', error);
        window.location.href = createPageUrl('Home');
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const loadVideos = async () => {
    try {
      console.log('Carregando vídeos para moderação...');
      const [pending, approved, rejected] = await Promise.all([
        Video.filter({ status: 'in_review' }, '-created_date'),
        Video.filter({ status: 'approved' }, '-created_date', 20),
        Video.filter({ status: 'rejected' }, '-created_date', 20)
      ]);
      
      console.log('Vídeos carregados:', { 
        pending: pending.length, 
        approved: approved.length, 
        rejected: rejected.length 
      });
      
      setPendingVideos(pending);
      setApprovedVideos(approved);
      setRejectedVideos(rejected);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    }
  };

  const createNotificationsForFollowers = async (video) => {
    try {
      const followers = await Subscription.filter({ artist_id: video.artist_id });
      console.log(`Criando notificações para ${followers.length} seguidores`);
      
      const notificationPromises = followers.map(follower => {
        return Notification.create({
          user_id: follower.fan_id,
          message: `${video.artist_name} lançou um novo clipe: "${video.title}"`,
          video_id: video.id,
          artist_id: video.artist_id
        });
      });
      
      await Promise.all(notificationPromises);
      console.log('Notificações criadas com sucesso');
    } catch (error) {
      console.error('Erro ao criar notificações:', error);
      throw error; // Re-throw to be caught by the outer catch
    }
  };

  const handleApprove = async (video) => {
    setIsProcessing(true);
    try {
      console.log('Aprovando vídeo:', video.id);
      
      // Processo simplificado: apenas atualizar status
      await Video.update(video.id, { 
        status: 'approved',
        rejection_reason: null
      });
      
      console.log('Status do vídeo atualizado com sucesso');

      // Create notifications only if the video was previously in review
      // This ensures notifications are not sent again if re-approved
      if (video.status === 'in_review') {
        await createNotificationsForFollowers(video);
      }
      
      // Recarregar lista de vídeos
      await loadVideos();
      
      console.log('Vídeo aprovado com sucesso');
      
    } catch (error) {
      console.error('Erro detalhado ao aprovar vídeo:', error);
      
      // Mostrar erro mais específico
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        alert(`Erro ${error.response.status}: ${error.response.data?.message || 'Erro desconhecido'}`);
      } else {
        alert('Erro ao aprovar vídeo: ' + error.message);
      }
    }
    setIsProcessing(false);
  };

  const handleReject = async (video, reason) => {
    if (!reason.trim()) {
      alert('Por favor, informe o motivo da rejeição.');
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log('Rejeitando vídeo:', video.id, 'Motivo:', reason);
      await Video.update(video.id, { 
        status: 'rejected',
        rejection_reason: reason.trim()
      });
      
      await loadVideos();
      // No need to clear selectedVideo as it's now context-aware within VideoRow
      setRejectionReason(''); // Clear the text field
      
      console.log('Vídeo rejeitado com sucesso');
    } catch (error) {
      console.error('Erro ao rejeitar vídeo:', error);
      alert('Erro ao rejeitar vídeo: ' + error.message);
    }
    setIsProcessing(false);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
          <p className="text-white">Carregando painel de moderação...</p>
        </div>
      </div>
    );
  }
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      in_review: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock, text: 'Em Análise' },
      pending: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: Clock, text: 'Pendente' },
      approved: { color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: CheckCircle, text: 'Aprovado' },
      rejected: { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle, text: 'Rejeitado' },
      blocked_copyright: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: AlertTriangle, text: 'Bloqueado (Copyright)' }
    };
    const config = statusConfig[status || 'pending'];
    return <Badge className={`${config.color} border flex items-center gap-1.5`}><config.icon className="w-3.5 h-3.5" />{config.text}</Badge>;
  };
  
  const UploaderTypeBadge = ({ type }) => {
    const isArtist = type === 'artista_independente';
    const Icon = isArtist ? UserIcon : Building;
    return (
      <Badge variant="secondary" className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {isArtist ? 'Artista Indep.' : 'Selo/Gravadora'}
      </Badge>
    );
  };
  
  const VideoRow = ({ video }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1E1E2F] p-4 rounded-lg border border-[#2C2C3E] flex flex-col md:flex-row items-center gap-4"
    >
      <img src={video.thumbnail_url} alt={video.title} className="w-full md:w-32 h-auto md:h-20 object-cover rounded-md" />
      <div className="flex-grow text-center md:text-left">
        <h3 className="font-semibold text-white">{video.title}</h3>
        <p className="text-sm text-[#B0B0B0]">{video.artist_name}</p>
        <div className="flex gap-2 mt-2 justify-center md:justify-start">
          {getStatusBadge(video.status)}
          <UploaderTypeBadge type={video.uploader_type} />
        </div>
        {video.rejection_reason && (
          <p className="text-sm text-red-400 mt-2 italic">Motivo: {video.rejection_reason}</p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <a href={video.video_url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="icon" className="border-[#2C2C3E] text-white" title="Ver arquivo original">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
        
        {/* Botão de Preview/Teste para vídeos aprovados */}
        {video.status === 'approved' && (
          <a href={createPageUrl(`Watch?v=${video.id}`)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="icon" className="border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20" title="Testar experiência do usuário">
              <Play className="w-4 h-4" />
            </Button>
          </a>
        )}
        
        {video.status === 'in_review' && (
          <>
            <Button 
              size="icon" 
              className="bg-green-500/20 hover:bg-green-500/30" 
              onClick={() => handleApprove(video)} 
              disabled={isProcessing}
              title="Aprovar vídeo"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="icon" 
                  className="bg-red-500/20 hover:bg-red-500/30"
                  disabled={isProcessing}
                  title="Rejeitar vídeo"
                  onClick={() => setRejectionReason('')} // Clear reason when opening dialog
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1E1E2F] border-[#2C2C3E] text-white">
                <DialogHeader>
                  <DialogTitle>Rejeitar Vídeo: {video.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <p className="text-[#B0B0B0]">Informe o motivo da rejeição:</p>
                  <Textarea 
                    placeholder="Ex: Qualidade do vídeo abaixo do padrão, violação de direitos autorais, conteúdo impróprio..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="bg-[#121212] border-[#2C2C3E] text-white min-h-[120px]"
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setRejectionReason('')} className="border-[#2C2C3E]">Cancelar</Button>
                    <Button 
                      onClick={() => handleReject(video, rejectionReason)} 
                      disabled={isProcessing || !rejectionReason.trim()}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Moderação de Conteúdo</h1>
            <p className="text-[#B0B0B0]">Aprove ou rejeite novos videoclipes enviados.</p>
          </div>
          <Button variant="outline" onClick={loadVideos} disabled={isProcessing} className="border-[#2C2C3E] text-white">
            <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Atualizar Listas
          </Button>
        </motion.div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1E1E2F] border border-[#2C2C3E]">
            <TabsTrigger value="pending">Pendentes ({pendingVideos.length})</TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-6">
            {pendingVideos.length > 0 ? (
              <div className="space-y-4">
                {pendingVideos.map(video => <VideoRow key={video.id} video={video} />)}
              </div>
            ) : <p className="text-center text-[#B0B0B0] py-12">Nenhum vídeo pendente de moderação.</p>}
          </TabsContent>
          <TabsContent value="approved" className="mt-6">
             {approvedVideos.length > 0 ? (
              <div className="space-y-4">
                {approvedVideos.map(video => <VideoRow key={video.id} video={video} />)}
              </div>
            ) : <p className="text-center text-[#B0B0B0] py-12">Nenhum vídeo aprovado recentemente.</p>}
          </TabsContent>
          <TabsContent value="rejected" className="mt-6">
            {rejectedVideos.length > 0 ? (
              <div className="space-y-4">
                {rejectedVideos.map(video => <VideoRow key={video.id} video={video} />)}
              </div>
            ) : <p className="text-center text-[#B0B0B0] py-12">Nenhum vídeo rejeitado recentemente.</p>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
