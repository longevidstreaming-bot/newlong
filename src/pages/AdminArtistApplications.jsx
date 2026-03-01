
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { ArtistApplication } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Clock, Mail, Music, UserCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminArtistApplications() {
  const [adminUser, setAdminUser] = useState(null); // Changed from isAdmin to adminUser
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' }); // New state for notifications

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }
        setAdminUser(currentUser); // Store the admin user object
        
        // Buscar candidaturas na entidade ArtistApplication
        console.log('🔍 Buscando candidaturas de artista...');
        const artistApplications = await ArtistApplication.list('-created_date');
        console.log('📋 Candidaturas encontradas:', artistApplications);
        
        setApplications(artistApplications);
      } catch (error) {
        console.error('❌ Erro ao carregar candidaturas:', error);
        setNotification({ type: 'error', message: 'Erro ao carregar dados. Tente recarregar a página.' }); // Show error notification
        // window.location.href = createPageUrl('Home'); // Removed automatic redirect on error loading applications
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleApplication = async (applicationId, newStatus) => {
    setNotification({ type: '', message: '' }); // Clear previous notifications
    try {
      console.log(`🔄 Atualizando candidatura ${applicationId} para ${newStatus}...`);
      
      const application = applications.find(app => app.id === applicationId);
      if (!application) throw new Error("Candidatura não encontrada.");

      // Sempre atualize o status da candidatura primeiro
      await ArtistApplication.update(applicationId, { status: newStatus });

      // Se aprovado, também atualizar o usuário para artista
      if (newStatus === 'approved') {
        // If the user who made the application is the admin/app creator themselves
        if (adminUser && application.user_id === adminUser.id) {
          const warningMessage = "Candidatura aprovada, mas o cargo do criador do app não pode ser alterado automaticamente.";
          console.warn(warningMessage);
          setNotification({ type: 'warning', message: warningMessage }); // Show warning notification
        } else {
          // For all other users, promote to artist
          console.log(`✅ Promovendo usuário ${application.user_id} para artista...`);
          await User.update(application.user_id, { 
            role: 'artist',
            artist_name: application.artist_name,
            genre: application.genre,
            cover_photo: application.cover_photo
          });
          setNotification({ type: 'success', message: 'Artista aprovado e promovido com sucesso!' });
        }
      } else if (newStatus === 'rejected') {
        setNotification({ type: 'success', message: 'Candidatura rejeitada com sucesso.' });
      }
      
      // Atualizar lista local
      const updatedApplications = applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApplications);
      
      console.log(`✅ Candidatura ${newStatus === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    } catch (error) {
      console.error(`❌ Erro ao ${newStatus === 'approved' ? 'aprovar' : 'rejeitar'} candidatura:`, error);
      // Improve error message for specific cases or general error
      const errorMessage = error.message.includes("update the role of the creator") 
        ? "Erro: O cargo do criador do app não pode ser alterado."
        : `Erro ao processar a candidatura. Detalhes: ${error.message}`;
      setNotification({ type: 'error', message: errorMessage });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF]"></div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock, text: 'Pendente' },
      approved: { color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: Check, text: 'Aprovado' },
      rejected: { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: X, text: 'Rejeitado' },
    };
    const config = statusConfig[status || 'pending'];
    return <Badge className={`${config.color} border flex items-center gap-1.5`}><config.icon className="w-3.5 h-3.5" />{config.text}</Badge>;
  };
  
  const ApplicationCard = ({ app }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1E1E2F] p-6 rounded-2xl border border-[#2C2C3E] space-y-4"
    >
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                <img 
                  src={app.cover_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.artist_name)}&background=7B61FF&color=fff`}
                  alt={app.artist_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#2C2C3E]"
                />
                <div>
                    <h3 className="text-xl font-bold text-white">{app.artist_name}</h3>
                    <p className="text-[#B0B0B0]">{app.user_email}</p>
                </div>
            </div>
            {getStatusBadge(app.status)}
        </div>
        
        <div className="border-t border-[#2C2C3E] pt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2 text-[#B0B0B0]">
              <Mail className="w-4 h-4 text-[#7B61FF]" /> 
              {app.user_email}
            </p>
            <p className="flex items-center gap-2 text-[#B0B0B0]">
              <Music className="w-4 h-4 text-[#7B61FF]" /> 
              Gênero: <span className="font-semibold text-white capitalize">{app.genre}</span>
            </p>
            <p className="text-[#B0B0B0] text-xs">
              Enviado em: {new Date(app.created_date).toLocaleString('pt-BR')}
            </p>
        </div>

        {app.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t border-[#2C2C3E]">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  onClick={() => handleApplication(app.id, 'approved')}
                >
                    <Check className="w-4 h-4 mr-2" /> Aprovar
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={() => handleApplication(app.id, 'rejected')}
                >
                    <X className="w-4 h-4 mr-2" /> Rejeitar
                </Button>
            </div>
        )}
    </motion.div>
  );
  
  const pendingApps = applications.filter(app => app.status === 'pending');
  const approvedApps = applications.filter(app => app.status === 'approved');
  const rejectedApps = applications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-title text-white">Candidaturas de Artistas</h1>
          <p className="text-[#B0B0B0]">
            Gerencie as solicitações para se tornar um artista na plataforma.
            {/* Removed the applications.length message here as it's less dynamic */}
          </p>
        </motion.div>

        {/* Notification display */}
        {notification.message && (
          <Alert 
            className={`mb-6 ${
              notification.type === 'error' 
                ? 'bg-red-500/10 border-red-500/30' 
                : notification.type === 'warning' 
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-green-500/10 border-green-500/30' // For success messages
            }`}
          >
            <AlertCircle className="w-4 h-4" /> {/* Using AlertCircle for all notifications, could be conditional */}
            <AlertDescription 
              className={`${
                notification.type === 'error' 
                  ? 'text-red-300' 
                  : notification.type === 'warning' 
                    ? 'text-yellow-300'
                    : 'text-green-300'
              }`}
            >
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#1E1E2F] border border-[#2C2C3E]">
              <TabsTrigger value="pending">Pendentes ({pendingApps.length})</TabsTrigger>
              <TabsTrigger value="approved">Aprovados ({approvedApps.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados ({rejectedApps.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
                {pendingApps.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {pendingApps.map(app => <ApplicationCard key={app.id} app={app} />)}
                    </div>
                ) : (
                  <div className="text-center py-16">
                    <Clock className="w-16 h-16 text-[#B0B0B0] mx-auto mb-4" />
                    <p className="text-center text-[#B0B0B0]">Nenhuma candidatura pendente.</p>
                  </div>
                )}
            </TabsContent>
            
            <TabsContent value="approved" className="mt-6">
                {approvedApps.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {approvedApps.map(app => <ApplicationCard key={app.id} app={app} />)}
                    </div>
                ) : (
                  <div className="text-center py-16">
                    <UserCheck className="w-16 h-16 text-[#B0B0B0] mx-auto mb-4" />
                    <p className="text-center text-[#B0B0B0]">Nenhum artista aprovado ainda.</p>
                  </div>
                )}
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-6">
                {rejectedApps.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {rejectedApps.map(app => <ApplicationCard key={app.id} app={app} />)}
                    </div>
                ) : (
                  <div className="text-center py-16">
                    <X className="w-16 h-16 text-[#B0B0B0] mx-auto mb-4" />
                    <p className="text-center text-[#B0B0B0]">Nenhuma candidatura rejeitada.</p>
                  </div>
                )}
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
