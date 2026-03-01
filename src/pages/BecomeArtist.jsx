import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { ArtistApplication } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Music, Upload, CheckCircle, Star, Users, Trophy } from 'lucide-react';
import { createPageUrl } from '@/utils';

const genres = [
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "sertanejo", label: "Sertanejo" },
  { value: "hiphop", label: "Hip Hop" },
  { value: "mpb", label: "MPB" },
  { value: "eletronica", label: "Eletrônica" },
  { value: "gospel", label: "Gospel" },
  { value: "reggae", label: "Reggae" },
  { value: "metal", label: "Metal" },
];

export default function BecomeArtist() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [existingApplication, setExistingApplication] = useState(null);
  const [formData, setFormData] = useState({
    artist_name: '',
    genre: '',
    bio: '',
    social_instagram: '',
    social_spotify: ''
  });
  const [coverFile, setCoverFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const checkUserAndApplication = async () => {
      console.log('🔍 Verificando usuário na página BecomeArtist...');
      setIsCheckingUser(true);
      
      try {
        const user = await User.me();
        console.log('👤 Usuário carregado:', user);
        
        if (!user) {
          console.log('❌ Usuário não logado, redirecionando para login');
          window.location.href = createPageUrl('AuthPage');
          return;
        }
        
        console.log('🔍 Role do usuário:', user.role);
        
        // VERIFICAÇÃO MAIS AGRESSIVA: Se é artista, sair IMEDIATAMENTE
        if (user.role === 'artist') {
          console.log('✅ USUÁRIO JÁ É ARTISTA! Redirecionando para dashboard...');
          // Usar window.location.href em vez de replace para forçar o redirecionamento
          window.location.href = createPageUrl('ArtistDashboard');
          return;
        }

        setCurrentUser(user);
        
        // Só verificar aplicações se não for artista
        console.log('🔍 Verificando aplicações existentes...');
        const applications = await ArtistApplication.filter({ user_id: user.id });
        console.log('📋 Aplicações encontradas:', applications);
        
        if (applications.length > 0) {
          const app = applications[0];
          console.log('📋 Status da aplicação:', app.status);
          setExistingApplication(app);
          
          // Se a aplicação foi aprovada mas o usuário ainda não é artista, mostrar mensagem especial
          if (app.status === 'approved') {
            console.log('✅ Aplicação aprovada! Usuário deveria ser artista mas não é...');
          }
        }
        
      } catch (error) {
        console.error('❌ Erro ao verificar usuário:', error);
        window.location.href = createPageUrl('Home');
      } finally {
        setIsCheckingUser(false);
      }
    };
    
    checkUserAndApplication();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.artist_name || !formData.genre || !currentUser) return;

    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      let cover_photo = null;
      if (coverFile) {
        const { file_url } = await UploadFile({ file: coverFile });
        cover_photo = file_url;
      }

      await ArtistApplication.create({
        user_id: currentUser.id,
        user_email: currentUser.email,
        artist_name: formData.artist_name,
        genre: formData.genre,
        bio: formData.bio,
        social_instagram: formData.social_instagram,
        social_spotify: formData.social_spotify,
        cover_photo: cover_photo,
        status: 'pending'
      });

      setSubmitStatus('success');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error);
      setSubmitStatus('error');
    }
    setIsSubmitting(false);
  };

  if (isCheckingUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <p className="text-white">Verificando status do usuário...</p>
      </div>
    );
  }
  
  if (existingApplication) {
    if (existingApplication.status === 'approved') {
       return (
        <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-700 rounded-2xl p-8 text-center max-w-2xl"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-4 text-green-300">Candidatura Aprovada!</h1>
            <p className="text-gray-300 mb-6">
              Sua candidatura foi aprovada com sucesso! Agora você pode fazer upload de seus videoclipes.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = createPageUrl('ArtistDashboard')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold w-full"
              >
                Ir para o Dashboard
              </Button>
              <Button 
                onClick={() => window.location.href = createPageUrl('UploadVideo')}
                variant="outline"
                className="border-green-500 text-green-300 hover:bg-green-500/10 w-full"
              >
                Fazer Upload de Vídeo
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    const statusColors = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: '⏳' },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-300', icon: '❌' }
    };
    const status = statusColors[existingApplication.status];

    if(status) {
        return (
          <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${status.bg} border border-gray-700 rounded-2xl p-8 text-center`}
              >
                <div className="text-6xl mb-4">{status.icon}</div>
                <h1 className={`text-3xl font-bold mb-4 ${status.text}`}>
                  Candidatura {existingApplication.status === 'pending' ? 'Em Análise' : 'Rejeitada'}
                </h1>
                <p className="text-gray-400 mb-6">
                  {existingApplication.status === 'pending' && 'Nossa equipe está analisando sua candidatura. Você receberá uma resposta em até 48 horas.'}
                  {existingApplication.status === 'rejected' && 'Sua candidatura não foi aprovada. Verifique os critérios e tente novamente.'}
                </p>
                <Button 
                  onClick={() => window.location.href = createPageUrl('Home')}
                  variant="outline" 
                  className="border-gray-600 text-gray-300"
                >
                  Voltar ao Início
                </Button>
              </motion.div>
            </div>
          </div>
        );
    }
  }

  // Se chegou até aqui, é um usuário normal que quer se tornar artista
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Torne-se um Artista</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compartilhe sua música com milhares de fãs. Candidate-se para se tornar um artista verificado no LONGEVID.
          </p>
        </motion.div>

        {/* Benefícios */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <Star className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <CardTitle className="text-white">Exposição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center">Seus videoclips serão promovidos para milhares de usuários</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <CardTitle className="text-white">Comunidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center">Construa uma base de fãs e interaja com seu público</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-white">Crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center">Acesse estatísticas detalhadas e insights sobre seu público</p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Candidatura de Artista</CardTitle>
          </CardHeader>
          <CardContent>
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500 text-green-300 p-4 rounded-lg mb-6 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Candidatura enviada com sucesso! Nossa equipe irá analisá-la em até 48 horas.</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Nome Artístico *</label>
                  <Input
                    value={formData.artist_name}
                    onChange={(e) => handleInputChange('artist_name', e.target.value)}
                    placeholder="Como você quer ser conhecido"
                    className="bg-gray-900 border-gray-600 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Gênero Principal *</label>
                  <Select onValueChange={(value) => handleInputChange('genre', value)} required>
                    <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {genres.map(genre => (
                        <SelectItem key={genre.value} value={genre.value}>{genre.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Bio / Apresentação</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você e sua música..."
                  className="bg-gray-900 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Instagram</label>
                  <Input
                    value={formData.social_instagram}
                    onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                    placeholder="@seuinstagram"
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Spotify</label>
                  <Input
                    value={formData.social_spotify}
                    onChange={(e) => handleInputChange('social_spotify', e.target.value)}
                    placeholder="Link do seu perfil no Spotify"
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Foto de Capa (Opcional)</label>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setCoverFile(e.target.files[0]);
                        }
                    }}
                    className="bg-gray-900 border-gray-600 text-white file:text-white file:bg-gray-700 file:border-none file:px-4 file:py-2 file:rounded-lg file:mr-4 hover:file:bg-gray-600"
                />
                {coverFile && (
                    <p className="text-green-400 text-sm mt-2">Arquivo selecionado: {coverFile.name}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !formData.artist_name || !formData.genre}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 text-lg"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Candidatura'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}