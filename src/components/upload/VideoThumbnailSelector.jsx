import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Film, Wand2 } from 'lucide-react';

export default function VideoThumbnailSelector({ videoFile, onThumbnailSelected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [videoSrc, setVideoSrc] = useState(null);
  const [duration, setDuration] = useState(0);
  const [previewFrame, setPreviewFrame] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoSrc(url);
      setPreviewFrame(null);
      setSelectedFileName('');
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const captureFrame = (time) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      video.currentTime = time;
      video.onseeked = () => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewFrame(dataUrl);
      };
    }
  };
  
  const handleSliderChange = (value) => {
    captureFrame(value[0]);
  };

  const handleSetFrameAsThumbnail = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        const thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
        onThumbnailSelected(thumbnailFile);
        setSelectedFileName('frame_selecionado.jpg');
      }, 'image/jpeg');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onThumbnailSelected(file);
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewFrame(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <video ref={videoRef} src={videoSrc} onLoadedMetadata={handleLoadedMetadata} className="hidden" crossOrigin="anonymous" />
      <canvas ref={canvasRef} className="hidden" />

      <label className="block text-white font-semibold mb-2">Capa do Vídeo (Thumbnail)</label>
      
      <div className="bg-[#121212] p-4 rounded-xl border border-[#2C2C3E]">
        <Tabs defaultValue="frame" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1E1E2F] border-[#2C2C3E]">
            <TabsTrigger value="frame"><Film className="w-4 h-4 mr-2"/>Gerar do Vídeo</TabsTrigger>
            <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-2"/>Enviar Imagem</TabsTrigger>
          </TabsList>
          
          <TabsContent value="frame" className="mt-4">
            <p className="text-[#B0B0B0] text-sm mb-4">Arraste a barra para selecionar o melhor momento do seu vídeo.</p>
            <Slider
              defaultValue={[0]}
              max={duration}
              step={0.1}
              onValueChange={handleSliderChange}
              disabled={!duration}
              className="w-full mb-4"
            />
            <Button onClick={handleSetFrameAsThumbnail} disabled={!previewFrame} className="w-full">
              <Wand2 className="w-4 h-4 mr-2"/> Usar este frame
            </Button>
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <Button onClick={() => fileInputRef.current.click()} className="w-full">
              <Upload className="w-4 h-4 mr-2"/> Escolher arquivo de imagem
            </Button>
          </TabsContent>
        </Tabs>
        
        {(previewFrame || selectedFileName) && (
          <div className="mt-4 text-center">
            <p className="text-white font-semibold mb-2">Prévia da Capa:</p>
            {previewFrame && (
              <img src={previewFrame} alt="Prévia da capa" className="rounded-lg mx-auto max-h-48 border border-[#2C2C3E]" />
            )}
            {selectedFileName && (
               <p className="text-green-400 text-sm mt-2">✓ Arquivo selecionado: {selectedFileName}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}