
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Video } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, AlertCircle, Music, Video as VideoIcon } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import VideoThumbnailSelector from '../components/upload/VideoThumbnailSelector';

const genres = [
  { label: "Pop", value: "pop" },
  { label: "Rock", value: "rock" },
  { label: "Sertanejo", value: "sertanejo" },
  { label: "Hip Hop", value: "hiphop" },
  { label: "MPB", value: "mpb" },
  { label: "Eletrônica", value: "eletronica" },
  { label: "Gospel", value: "gospel" },
  { label: "Reggae", value: "reggae" },
  { label: "Metal", value: "metal" },
  { label: "Infantil", value: "infantil" }
];

export default function UploadVideo() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    category: 'pop',
    uploader_type: 'artista_independente',
    copyright_declaration: false,
    is_for_kids: null, // Initial state for kids content declaration
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [copyrightFile, setCopyrightFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      console.log('🔍 Verificando permissões na página de upload...');
      
      try {
        const user = await User.me();
        console.log('👤 Usuário carregado:', user);
        
        if (!user) {
          console.log('❌ Usuário não logado');
          window.location.href = createPageUrl('AuthPage');
          return;
        }
        // Qualquer usuário logado pode fazer upload
        console.log('✅ Usuário logado pode enviar vídeo');
        setCurrentUser(user);
        setIsLoading(false);
        
      } catch (error) {
        console.error('❌ Erro geral na verificação:', error);
        // Em caso de erro, permitir acesso se o usuário existir
        try {
          const user = await User.me();
          if (user) {
            setCurrentUser(user);
            setIsLoading(false);
            console.log('⚠️ Permitindo acesso apesar do erro');
          } else {
            window.location.href = createPageUrl('AuthPage');
          }
        } catch {
          window.location.href = createPageUrl('AuthPage');
        }
      }
    };

    checkUser();
  }, []);

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (file) {
      if (fileType === 'video') {
        setVideoFile(file);
        // Clear thumbnail when video changes, as the old thumbnail might not be valid
        setThumbnailFile(null); 
      } else if (fileType === 'thumbnail') {
        setThumbnailFile(file);
      } else if (fileType === 'copyright') {
        setCopyrightFile(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("Você precisa estar logado para fazer upload.");
      return;
    }

    if (!videoFile) {
      setError('Por favor, selecione um arquivo de vídeo.');
      return;
    }

    if (!thumbnailFile) {
      setError("Por favor, selecione uma capa para o vídeo.");
      return;
    }
    
    if (!videoData.title) {
      setError("Por favor, insira um título para o vídeo.");
      return;
    }

    if (videoData.is_for_kids === null) {
      setError("Por favor, declare se o conteúdo é para crianças.");
      return;
    }

    if (!videoData.copyright_declaration) {
      setError('Você deve declarar que possui os direitos autorais da música.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Upload do arquivo de vídeo
      const videoUpload = await UploadFile({ file: videoFile });
      const uploadedName = (videoUpload?.name || '').split('/').pop() || '';
      const baseId = uploadedName.replace(/\.[^/.]+$/, '');
      
      // Upload da thumbnail
      const thumbnailUpload = await UploadFile({ file: thumbnailFile }, 'uploads', `${baseId}_thumbnail`);
      const thumbnailUrl = thumbnailUpload.file_url;

      // Upload do comprovante de direitos autorais (se fornecido)
      let copyrightProofUrl = null;
      if (copyrightFile) {
        const copyrightUpload = await UploadFile({ file: copyrightFile });
        copyrightProofUrl = copyrightUpload.file_url;
      }

      // Criar o registro do vídeo no banco
      const newVideo = await Video.create({
        id: baseId,
        title: videoData.title,
        description: videoData.description,
        video_url: videoUpload.file_url,
        thumbnail_url: thumbnailUrl,
        artist_id: currentUser.id,
        artist_name: currentUser.artist_name || currentUser.full_name,
        artist_avatar: currentUser.artist_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name)}&background=7B61FF&color=fff`,
        category: videoData.category,
        is_for_kids: videoData.is_for_kids,
        uploader_type: videoData.uploader_type,
        copyright_declaration: videoData.copyright_declaration,
        copyright_proof_url: copyrightProofUrl,
        status: 'approved',
        views: 0,
        likes: 0
      });

      console.log("Vídeo criado com sucesso:", newVideo);
      
      // Redirect to the video watch page immediately upon success
      window.location.href = createPageUrl(`Watch?v=${newVideo.id}`);
      
    } catch (err) {
      console.error('Erro no upload:', err);
      setError('Erro ao fazer upload do vídeo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
          <p className="text-white">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 mt-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-r from-[#FF4F81] to-[#7B61FF]">
              <VideoIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Upload de Videoclipe</h1>
          </div>
          <p className="text-[#B0B0B0] text-lg">
            Compartilhe sua música com o mundo no LONGEVID
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1E1E2F] rounded-2xl border border-[#2C2C3E] p-8"
        >
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Título da Música *
              </label>
              <Input
                type="text"
                value={videoData.title}
                onChange={(e) => setVideoData({...videoData, title: e.target.value})}
                placeholder="Ex: Minha Nova Música"
                required
                className="bg-[#121212] border-[#2C2C3E] text-white"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Descrição
              </label>
              <Textarea
                value={videoData.description}
                onChange={(e) => setVideoData({...videoData, description: e.target.value})}
                placeholder="Descreva sua música, conte a história por trás dela..."
                className="bg-[#121212] border-[#2C2C3E] text-white h-24"
              />
            </div>

            {/* Gênero */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Gênero Musical *
              </label>
              <Select 
                value={videoData.category} 
                onValueChange={(value) => setVideoData({...videoData, category: value})}
              >
                <SelectTrigger className="bg-[#121212] border-[#2C2C3E] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E2F] border-[#2C2C3E]">
                  {genres.map(genre => (
                    <SelectItem key={genre.value} value={genre.value} className="text-white hover:bg-[#2C2C3E]">
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Declaração de conteúdo infantil */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Este conteúdo é para crianças? *
              </label>
              <RadioGroup
                value={videoData.is_for_kids === null ? '' : String(videoData.is_for_kids)}
                onValueChange={(value) => {
                  const isForKids = value === 'true';
                  const newCategory = isForKids ? 'infantil' : videoData.category === 'infantil' ? 'pop' : videoData.category;
                  setVideoData({...videoData, is_for_kids: isForKids, category: newCategory });
                }}
                className="bg-[#121212] p-4 rounded-xl border border-[#2C2C3E] space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="true" id="r1" className="border-[#2C2C3E] text-[#7B61FF] data-[state=checked]:bg-[#7B61FF] data-[state=checked]:border-[#7B61FF]" />
                  <Label htmlFor="r1" className="text-white font-normal cursor-pointer">Sim, é conteúdo para crianças.</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="false" id="r2" className="border-[#2C2C3E] text-[#7B61FF] data-[state=checked]:bg-[#7B61FF] data-[state=checked]:border-[#7B61FF]" />
                  <Label htmlFor="r2" className="text-white font-normal cursor-pointer">Não, não é conteúdo para crianças.</Label>
                </div>
              </RadioGroup>
              <p className="text-[#B0B0B0] text-xs mt-2">
                Independentemente da sua localização, você tem a obrigação legal de cumprir leis como a Lei de Proteção da Privacidade Online das Crianças (COPPA). Você deve nos informar se seus vídeos são para crianças.
              </p>
            </div>

            {/* Upload de Vídeo */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Arquivo de Vídeo * (.mp4, .mov, .avi)
              </label>
              <div className="border-2 border-dashed border-[#2C2C3E] rounded-xl p-6 text-center hover:border-[#7B61FF] transition-colors">
                <Upload className="w-8 h-8 text-[#B0B0B0] mx-auto mb-2" />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  {videoFile ? (
                    <p className="text-green-400">✓ {videoFile.name}</p>
                  ) : (
                    <div>
                      <p className="text-white mb-1">Clique para selecionar o vídeo</p>
                      <p className="text-[#B0B0B0] text-sm">Máximo 100MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Seletor de Thumbnail */}
            {videoFile && (
              <VideoThumbnailSelector 
                videoFile={videoFile}
                onThumbnailSelected={setThumbnailFile}
                selectedThumbnailFile={thumbnailFile} // Pass selected thumbnail to allow component to show preview
              />
            )}

            {/* Tipo de Uploader */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Você é *
              </label>
              <Select 
                value={videoData.uploader_type} 
                onValueChange={(value) => setVideoData({...videoData, uploader_type: value})}
              >
                <SelectTrigger className="bg-[#121212] border-[#2C2C3E] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E2F] border-[#2C2C3E]">
                  <SelectItem value="artista_independente" className="text-white hover:bg-[#2C2C3E]">
                    Artista Independente
                  </SelectItem>
                  <SelectItem value="selo_gravadora" className="text-white hover:bg-[#2C2C3E]">
                    Selo / Gravadora
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comprovante de Direitos Autorais (opcional) */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Comprovante de Direitos Autorais (opcional)
              </label>
              <div className="border-2 border-dashed border-[#2C2C3E] rounded-xl p-6 text-center hover:border-[#7B61FF] transition-colors">
                <Upload className="w-8 h-8 text-[#B0B0B0] mx-auto mb-2" />
                <input
                  type="file"
                  accept=".pdf,.jpg,.png,.jpeg"
                  onChange={(e) => handleFileChange(e, 'copyright')}
                  className="hidden"
                  id="copyright-upload"
                />
                <label htmlFor="copyright-upload" className="cursor-pointer">
                  {copyrightFile ? (
                    <p className="text-green-400">✓ {copyrightFile.name}</p>
                  ) : (
                    <div>
                      <p className="text-white mb-1">Documento que comprove seus direitos</p>
                      <p className="text-[#B0B0B0] text-sm">PDF, JPG, PNG</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Declaração de Direitos Autorais */}
            <div className="bg-[#121212] p-4 rounded-xl border border-[#2C2C3E]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={videoData.copyright_declaration}
                  onChange={(e) => setVideoData({...videoData, copyright_declaration: e.target.checked})}
                  className="mt-1"
                />
                <div>
                  <p className="text-white font-semibold">Declaração de Direitos Autorais *</p>
                  <p className="text-[#B0B0B0] text-sm mt-1">
                    Declaro que sou o proprietário dos direitos autorais desta música e videoclipe, 
                    ou possuo autorização legal para distribuí-los na plataforma LONGEVID.
                  </p>
                </div>
              </label>
            </div>

            {/* Botão de Submit */}
            <Button
              type="submit"
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-[#FF4F81] to-[#7B61FF] font-bold text-lg py-6"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Enviar Videoclipe
                </div>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
