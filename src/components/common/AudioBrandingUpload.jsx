
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import AudioBranding from './AudioBranding';

export default function AudioBrandingUpload({ onAudioUploaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [previewAudio, setPreviewAudio] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav'))) {
      setAudioFile(file);
      // Criar URL para preview
      const url = URL.createObjectURL(file);
      setPreviewAudio(url);
    } else {
      alert('Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG)');
    }
  };

  const handleUpload = async () => {
    if (!audioFile) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file: audioFile });
      setAudioUrl(file_url);
      if (onAudioUploaded) {
        onAudioUploaded(file_url);
      }
      // Salvar no localStorage para usar na aplicação
      localStorage.setItem('longevid_audio_branding', file_url);
      alert('Audio branding estilo Netflix carregado! 🎬🔊');
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do áudio');
    } finally {
      setIsUploading(false);
    }
  };

  const togglePlay = () => {
    const audio = document.getElementById('preview-audio');
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.volume = volume;
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <Card className="bg-[#1E1E2F] border-[#2C2C3E] text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#7B61FF] to-[#FF4F81] flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          Audio Branding LONGEVID (Estilo Netflix)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
          <p className="text-red-300 font-semibold mb-2">🎬 Experiência Netflix</p>
          <p className="text-[#B0B0B0] text-sm">
            Carregue um áudio curto (1-3 segundos) que tocará automaticamente quando o usuário entrar na plataforma, 
            igual ao icônico som "ta-dum" da Netflix!
          </p>
        </div>

        <p className="text-[#B0B0B0]">
          <strong>Recomendações:</strong><br />
          • Duração: 1-3 segundos<br />
          • Volume: Impactante mas não agressivo<br />
          • Formato: MP3 para melhor compatibilidade<br />
          • Timing: Sincronizado com a animação do logo
        </p>

        {/* Upload Section */}
        <div>
          <Input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="bg-[#121212] border-[#2C2C3E] text-white file:bg-[#7B61FF] file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2"
          />
          {audioFile && (
            <p className="text-[#B0B0B0] text-sm mt-2">
              Arquivo selecionado: {audioFile.name}
            </p>
          )}
        </div>

        {/* Preview Section */}
        {previewAudio && (
          <div className="bg-[#121212] p-4 rounded-lg border border-[#2C2C3E]">
            <audio
              id="preview-audio"
              src={previewAudio}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlay}
                variant="outline"
                size="icon"
                className="border-[#7B61FF] text-[#7B61FF] hover:bg-[#7B61FF] hover:text-white"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex items-center gap-2 flex-1">
                <VolumeX className="w-4 h-4 text-[#B0B0B0]" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-[#7B61FF]"
                />
                <Volume2 className="w-4 h-4 text-[#B0B0B0]" />
              </div>
              <span className="text-[#B0B0B0] text-sm">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!audioFile || isUploading}
          className="w-full bg-gradient-to-r from-[#7B61FF] to-[#FF4F81] hover:from-[#8B71FF] hover:to-[#FF5F91] font-semibold"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Carregando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Carregar Audio Branding
            </>
          )}
        </Button>

        {/* Current Audio Branding */}
        {audioUrl && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 font-semibold mb-2">✅ Audio branding ativo!</p>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsPlaying(false)} // This should likely trigger the AudioBranding component to play
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-3 h-3 mr-1" />
                Testar
              </Button>
              {/* This AudioBranding component should likely play the current audioUrl when "Testar" is clicked */}
              <AudioBranding audioUrl={audioUrl} trigger="manual" volume={volume} />
            </div>
          </div>
        )}

        {/* Configurações de uso */}
        <div className="bg-[#121212] p-4 rounded-lg border border-[#2C2C3E]">
          <h4 className="text-white font-semibold mb-3">Quando reproduzir:</h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-[#7B61FF]" />
              <span className="text-[#B0B0B0]">Ao iniciar a aplicação</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-[#7B61FF]" />
              <span className="text-[#B0B0B0]">Após fazer login</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-[#7B61FF]" />
              <span className="text-[#B0B0B0]">Ao concluir upload de vídeo</span>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
