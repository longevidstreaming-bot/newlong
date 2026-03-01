
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArtistApplication } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Star, X, Loader2, Image } from 'lucide-react';
import { motion } from 'framer-motion';

const genres = [
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "sertanejo", label: "Sertanejo" },
  { value: "hiphop", label: "Hip Hop" },
  { value: "mpb", label: "MPB" },
  { value: "eletronica", label: "Eletrônica" },
  { value: "gospel", label: "Gospel" },
  { value: "reggae", label: "Reggae" },
  { value: "metal", label: "Metal" }
];

export default function ArtistApplicationForm({ currentUser, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({ artist_name: '', genre: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/jpg')) {
        alert('Por favor, selecione apenas arquivos JPEG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 5MB.');
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadCoverFile = async () => {
    if (!coverFile) return null;
    
    setIsUploadingCover(true);
    try {
      const { file_url } = await UploadFile({ file: coverFile });
      return file_url;
    } catch (error) {
      console.error('Erro ao fazer upload da capa:', error);
      alert('Erro ao fazer upload da imagem de capa. Tente novamente.');
      throw error; // Interrompe o envio se o upload falhar
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 ===== INICIANDO DEBUG DO FORMULÁRIO =====');
    console.log('👤 currentUser:', currentUser);
    console.log('📝 formData:', formData);
    console.log('🖼️ coverFile:', coverFile);
    
    if (!formData.artist_name.trim() || !formData.genre) {
      console.log('❌ Validação falhou: campos obrigatórios não preenchidos');
      alert('Por favor, preencha o nome artístico e o gênero musical.');
      return;
    }

    if (!currentUser || !currentUser.id || !currentUser.email) {
      console.log('❌ Validação falhou: currentUser inválido');
      alert('Erro: dados do usuário não encontrados. Faça login novamente.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('📤 PASSO 1: Fazendo upload da capa (se houver)...');
      const coverUrl = await uploadCoverFile();
      console.log('✅ Upload da capa concluído. URL:', coverUrl);
      
      console.log('📋 PASSO 2: Preparando dados da aplicação...');
      const applicationData = {
        user_id: currentUser.id,
        user_email: currentUser.email,
        artist_name: formData.artist_name.trim(),
        genre: formData.genre,
        cover_photo: coverUrl,
        status: 'pending'
      };
      
      console.log('📋 Dados preparados:', JSON.stringify(applicationData, null, 2));
      
      console.log('💾 PASSO 3: Tentando criar a aplicação no banco...');
      const result = await ArtistApplication.create(applicationData);
      console.log('✅ Aplicação criada com sucesso! Resultado:', result);
      
      console.log('🎉 ===== FORMULÁRIO ENVIADO COM SUCESSO =====');
      alert('✅ Sua solicitação foi enviada com sucesso!');
      onSuccess();
      
    } catch (error) {
      console.log('❌ ===== ERRO NO FORMULÁRIO =====');
      console.error('Erro completo:', error);
      console.error('Erro message:', error.message);
      console.error('Erro stack:', error.stack);
      
      // Mostrar detalhes específicos do erro
      let errorMessage = 'Erro ao processar formulário.';
      if (error.message) {
        errorMessage += ` Detalhes: ${error.message}`;
      }
      
      alert(`❌ ${errorMessage}\n\nVerifique o console do navegador para mais detalhes.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-[var(--border-soft)]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-title text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Solicitação para Artista
        </h3>
        <Button 
          onClick={onCancel} 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-white"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="font-semibold mb-2 block text-gray-300">Nome Artístico *</label>
          <Input
            placeholder="Seu nome no palco"
            value={formData.artist_name}
            onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
            className="bg-[var(--surface-dark)] border-gray-600 text-white rounded-lg"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="font-semibold mb-2 block text-gray-300">Gênero Musical *</label>
          <Select 
            onValueChange={(value) => setFormData({ ...formData, genre: value })} 
            required
            disabled={isSubmitting}
          >
            <SelectTrigger className="bg-[var(--surface-dark)] border-gray-600 text-white rounded-lg">
              <SelectValue placeholder="Selecione o gênero principal" />
            </SelectTrigger>
            <SelectContent className="bg-[#2A0E4F] border-[#7B61FF] text-white">
              {genres.map(genre => (
                <SelectItem key={genre.value} value={genre.value}>{genre.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="font-semibold mb-2 block text-gray-300">Foto de Perfil (JPEG - Opcional)</label>
          <label
            htmlFor="cover-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
          >
            {coverPreview ? (
              <img src={coverPreview} alt="Preview" className="w-full h-full object-cover rounded-lg"/>
            ) : (
              <div className="text-center">
                <Image className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Arraste ou clique para selecionar</p>
                <p className="text-xs text-gray-500 mt-1">Máx 5MB, JPEG</p>
              </div>
            )}
          </label>
          <input
            type="file"
            accept=".jpeg,.jpg,image/jpeg"
            onChange={handleCoverFileChange}
            className="hidden"
            id="cover-upload"
            disabled={isSubmitting || isUploadingCover}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            onClick={onCancel} 
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg disabled:opacity-50"
            disabled={isSubmitting || isUploadingCover || !formData.artist_name.trim() || !formData.genre}
          >
            {isSubmitting || isUploadingCover ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
            ) : (
              'Enviar Solicitação'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
