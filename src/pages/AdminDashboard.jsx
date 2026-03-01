
import React, { useEffect, useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, Users, BarChart2, ArrowRight, Volume2 } from 'lucide-react'; // Added Volume2
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AudioBrandingUpload from '../components/common/AudioBrandingUpload'; // New import

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
