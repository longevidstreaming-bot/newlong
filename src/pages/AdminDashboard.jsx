
import React, { useEffect, useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, Users, BarChart2, ArrowRight, Volume2, Image as ImageIcon, Upload } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AudioBrandingUpload from '../components/common/AudioBrandingUpload'; // New import
import { UploadFile } from '@/api/integrations';

const adminTools = [
  {
    title: "Moderação de Conteúdo",
    description: "Aprove ou rejeite novos videoclips.",
    icon: ShieldCheck,
    url: "ContentModeration",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Candidaturas de Artistas",
    description: "Gerencie as solicitações de novos artistas.",
    icon: Users,
    url: "AdminArtistApplications",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Gerenciador de Anúncios",
    description: "Monitore e aprove as campanhas de anúncios.",
    icon: BarChart2,
    url: "AdminAds",
    color: "from-green-500 to-lime-500"
  }
];

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('longevid_logo_url') || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await User.me();
        if (user.role !== 'admin') {
          window.location.href = createPageUrl('Home');
        }
      } catch (error) {
        window.location.href = createPageUrl('Home');
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setIsUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const isWhite = r > 240 && g > 240 && b > 240;
            data[i + 3] = isWhite ? 0 : 255;
          }
          ctx.putImageData(imageData, 0, 0);
          const transparentDataUrl = canvas.toDataURL('image/png');
          localStorage.setItem('longevid_logo_url', transparentDataUrl);
          setLogoUrl(transparentDataUrl);
          alert('Logo processada com fundo removido!');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(logoFile);
    } catch (e) {
      console.error('Erro ao processar logo:', e);
      alert('Falha ao processar logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background-dark)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-dark)] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-title text-white">Painel do Administrador</h1>
          <p className="text-[var(--text-secondary)] mt-2">Bem-vindo(a)! Gerencie a plataforma a partir daqui.</p>
        </motion.div>

        {/* Audio Branding Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Volume2 className="w-7 h-7 text-[#FF4F81]" />
            Audio Branding
          </h2>
          <AudioBrandingUpload />
        </section>

        {/* Logo Upload Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <ImageIcon className="w-7 h-7 text-[#FF4F81]" />
            Logo da Marca
          </h2>
          <div className="bg-[var(--surface-dark)] border-[var(--border-soft)] rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-xl bg-[#121212] border border-[#2C2C3E] flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[#B0B0B0] text-xs">Prévia</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload">
                    <Button variant="outline" className="text-white border-[#2C2C3E]">
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar imagem
                    </Button>
                  </label>
                  <Button 
                    onClick={handleLogoUpload} 
                    disabled={!logoFile || isUploadingLogo}
                    className="bg-gradient-to-r from-[#FF4F81] to-[#7B61FF] text-white"
                  >
                    {isUploadingLogo ? 'Enviando...' : 'Enviar logo'}
                  </Button>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mt-3">
                  Use PNG com fundo transparente para melhor resultado.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminTools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Link to={createPageUrl(tool.url)}>
                <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)] hover:border-[var(--brand-primary)] transition-all group h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${tool.color}`}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-white">{tool.title}</CardTitle>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                      <div className="text-sm text-[var(--brand-primary)] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                        Acessar ferramenta <ArrowRight className="w-4 h-4" />
                      </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
