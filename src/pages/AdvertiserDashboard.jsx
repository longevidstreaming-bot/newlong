import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Advertiser } from '@/api/entities';
import { Campaign } from '@/api/entities';
import { AdMetric } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  Eye, 
  MousePointerClick,
  DollarSign, 
  Play, 
  Image, 
  PlusCircle,
  BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper to format data for chart
const formatChartData = (metrics) => {
    const impressionsByDay = metrics
        .filter(m => m.event_type === 'impression')
        .reduce((acc, metric) => {
            const day = new Date(metric.created_date).toLocaleDateString('pt-BR');
            if (!acc[day]) acc[day] = 0;
            acc[day]++;
            return acc;
        }, {});

    return Object.keys(impressionsByDay)
        .map(day => ({ date: day, impressions: impressionsByDay[day] }))
        .sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
};

export default function AdvertiserDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [advertiser, setAdvertiser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    budget: 100,
    target_genres: [],
    click_through_url: '',
    video_file: null,
    banner_file: null
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        const advertisers = await Advertiser.filter({ contact_email: user.email });
        let advertiserProfile;
        
        if (advertisers.length === 0) {
          advertiserProfile = await Advertiser.create({
            name: user.full_name || user.email,
            contact_email: user.email
          });
        } else {
          advertiserProfile = advertisers[0];
        }
        
        setAdvertiser(advertiserProfile);

        const userCampaigns = await Campaign.filter({ advertiser_id: advertiserProfile.id }, '-created_date');
        setCampaigns(userCampaigns);

        const campaignIds = userCampaigns.map(c => c.id);
        if (campaignIds.length > 0) {
          const campaignMetrics = await AdMetric.filter({
            campaign_id: { $in: campaignIds }
          }, '-created_date');
          setMetrics(campaignMetrics);
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        window.location.href = createPageUrl('Home');
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaign.name || !newCampaign.video_file || !advertiser) return;

    setIsCreatingCampaign(true);
    try {
      const { file_url: video_url } = await UploadFile({ file: newCampaign.video_file });
      let banner_url = '';
      if (newCampaign.banner_file) {
        const { file_url } = await UploadFile({ file: newCampaign.banner_file });
        banner_url = file_url;
      }

      await Campaign.create({
        name: newCampaign.name,
        advertiser_id: advertiser.id,
        advertiser_name: advertiser.name,
        format: 'preroll', // Apenas pré-roll por enquanto
        ad_creative_url: video_url,
        banner_creative_url: banner_url,
        click_through_url: newCampaign.click_through_url,
        duration: 15,
        budget: newCampaign.budget,
        budget_remaining: newCampaign.budget,
        target_genres: newCampaign.target_genres,
        cpm_rate: 12.00,
        status: 'pending'
      });
      
      window.location.reload();

    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    }
    setIsCreatingCampaign(false);
  };

  const getCampaignStats = (campaignId) => {
    const campaignMetrics = metrics.filter(m => m.campaign_id === campaignId);
    const impressions = campaignMetrics.filter(m => m.event_type === 'impression').length;
    const clicks = campaignMetrics.filter(m => m.event_type === 'click').length;
    const budgetSpent = campaigns.find(c => c.id === campaignId)?.budget_spent || 0;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
    return { impressions, clicks, budgetSpent: budgetSpent.toFixed(2), ctr };
  };

  const getTotalStats = () => {
    const totalImpressions = metrics.filter(m => m.event_type === 'impression').length;
    const totalClicks = metrics.filter(m => m.event_type === 'click').length;
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.budget_spent || 0), 0);
    const averageCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    return { totalImpressions, totalClicks, totalSpent: totalSpent.toFixed(2), averageCTR };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', text: 'Pendente' },
      active: { color: 'bg-green-500/20 text-green-300 border-green-500/30', text: 'Ativa' },
      paused: { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', text: 'Pausada' },
      completed: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'Concluída' },
      rejected: { color: 'bg-red-500/20 text-red-300 border-red-500/30', text: 'Rejeitada' }
    };
    const config = statusConfig[status || 'pending'];
    return <Badge className={`${config.color} border`}>{config.text}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-secondary)] mx-auto mb-4"></div>
          <p className="text-white">Carregando painel do anunciante...</p>
        </div>
      </div>
    );
  }

  const totalStats = getTotalStats();
  const chartData = formatChartData(metrics);

  return (
    <div className="min-h-screen bg-[var(--background-dark)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-title text-white">Painel do Anunciante</h1>
            <p className="text-[var(--text-secondary)]">
              Bem-vindo(a), {advertiser?.name}!
            </p>
          </div>
          
          <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--brand-secondary)] hover:bg-[var(--brand-accent)]">
                <PlusCircle className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--surface-dark)] border-[var(--border-soft)] text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Campanha Pré-Roll</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCampaign} className="space-y-6">
                <Input placeholder="Nome da Campanha" value={newCampaign.name} onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} className="bg-[var(--background-dark)] border-[var(--border-soft)]" required />
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-2 block">Vídeo do Anúncio (MP4, máx 15s)</label>
                  <Input type="file" accept="video/mp4" onChange={(e) => setNewCampaign({...newCampaign, video_file: e.target.files[0]})} className="bg-[var(--background-dark)] border-[var(--border-soft)]" required />
                </div>
                 <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-2 block">Banner de Acompanhamento (Opcional, JPG/PNG)</label>
                  <Input type="file" accept="image/*" onChange={(e) => setNewCampaign({...newCampaign, banner_file: e.target.files[0]})} className="bg-[var(--background-dark)] border-[var(--border-soft)]" />
                </div>
                <div>
                    <label className="text-sm text-[var(--text-secondary)] mb-2 block">Orçamento (R$)</label>
                    <Input type="number" min="100" value={newCampaign.budget} onChange={(e) => setNewCampaign({...newCampaign, budget: parseFloat(e.target.value)})} className="bg-[var(--background-dark)] border-[var(--border-soft)]" required/>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Mínimo: R$ 100,00 | CPM: R$ 12,00 (Pré-Roll)</p>
                </div>
                <Input type="url" placeholder="URL de Destino (ao clicar)" value={newCampaign.click_through_url} onChange={(e) => setNewCampaign({...newCampaign, click_through_url: e.target.value})} className="bg-[var(--background-dark)] border-[var(--border-soft)]" required />
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-2 block">Segmentação por Gênero (Opcional)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['pop', 'rock', 'sertanejo', 'hiphop', 'mpb', 'eletronica', 'reggae', 'metal'].map(genre => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox id={genre} checked={newCampaign.target_genres.includes(genre)} onCheckedChange={(checked) => setNewCampaign(prev => ({ ...prev, target_genres: checked ? [...prev.target_genres, genre] : prev.target_genres.filter(g => g !== genre) }))} />
                        <label htmlFor={genre} className="text-sm capitalize">{genre}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={isCreatingCampaign} className="flex-1 bg-[var(--brand-secondary)] hover:bg-[var(--brand-accent)]">
                    {isCreatingCampaign ? 'Criando...' : 'Publicar Campanha'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewCampaignDialog(false)} className="border-[var(--border-soft)]">Cancelar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)]"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Total Gasto</CardTitle><DollarSign className="h-4 w-4 text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">R$ {totalStats.totalSpent}</div></CardContent></Card>
          <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)]"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Impressões</CardTitle><Eye className="h-4 w-4 text-[var(--brand-secondary)]" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">{totalStats.totalImpressions.toLocaleString()}</div></CardContent></Card>
          <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)]"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Cliques</CardTitle><MousePointerClick className="h-4 w-4 text-[var(--brand-accent)]" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">{totalStats.totalClicks.toLocaleString()}</div></CardContent></Card>
          <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)]"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-[var(--text-secondary)]">CTR Médio</CardTitle><TrendingUp className="h-4 w-4 text-yellow-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">{totalStats.averageCTR}%</div></CardContent></Card>
        </div>

        <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)] mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><BarChart2 /> Desempenho Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="date" stroke="#B0B0B0" />
                  <YAxis stroke="#B0B0B0" />
                  <Tooltip contentStyle={{ backgroundColor: '#1E1E2F', border: '1px solid #2C2C3E' }} />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" name="Impressões" stroke="#7B61FF" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)]">
          <CardHeader><CardTitle className="text-white">Minhas Campanhas ({campaigns.length})</CardTitle></CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map(campaign => {
                  const stats = getCampaignStats(campaign.id);
                  const progress = (stats.budgetSpent / campaign.budget) * 100;
                  return (
                    <div key={campaign.id} className="bg-[var(--background-dark)] p-4 rounded-lg border border-[var(--border-soft)]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{campaign.name}</h3>
                          <div className="flex items-center gap-3 mt-1">{getStatusBadge(campaign.status)}</div>
                        </div>
                        <div className="text-right">
                          <p className="text-[var(--text-secondary)] text-sm">Orçamento</p>
                          <p className="font-semibold text-white">R$ {stats.budgetSpent} / R$ {campaign.budget?.toFixed(2)}</p>
                        </div>
                      </div>
                       <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                         <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                       </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div><p className="text-2xl font-bold text-white">{stats.impressions.toLocaleString()}</p><p className="text-[var(--text-secondary)] text-sm">Impressões</p></div>
                        <div><p className="text-2xl font-bold text-white">{stats.clicks}</p><p className="text-[var(--text-secondary)] text-sm">Cliques</p></div>
                        <div><p className="text-2xl font-bold text-white">{stats.ctr}%</p><p className="text-[var(--text-secondary)] text-sm">CTR</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--text-secondary)] mb-4">Você ainda não criou nenhuma campanha.</p>
                <Button onClick={() => setShowNewCampaignDialog(true)} className="bg-[var(--brand-secondary)] hover:bg-[var(--brand-accent)]">Criar Primeira Campanha</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}