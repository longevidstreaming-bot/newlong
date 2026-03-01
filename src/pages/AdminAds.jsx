import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Campaign } from '@/api/entities';
import { AdMetric } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, TrendingUp, Eye, MousePointerClick, DollarSign, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function AdminAds() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const [allCampaigns, allMetrics] = await Promise.all([
            Campaign.list('-created_date'),
            AdMetric.list()
        ]);
        setCampaigns(allCampaigns);
        setMetrics(allMetrics);
      } catch (error) {
        window.location.href = createPageUrl('Home');
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleCampaignStatus = async (campaignId, newStatus) => {
    try {
      await Campaign.update(campaignId, { status: newStatus });
      setCampaigns(campaigns.map(c => c.id === campaignId ? { ...c, status: newStatus } : c));
    } catch (error) {
      console.error(`Erro ao atualizar status da campanha para ${newStatus}:`, error);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock, text: 'Pendente' },
      active: { color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: Check, text: 'Ativa' },
      paused: { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', text: 'Pausada' },
      completed: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'Concluída' },
      rejected: { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: X, text: 'Rejeitada' }
    };
    const config = statusConfig[status || 'pending'];
    return <Badge className={`${config.color} border flex items-center gap-1.5`}><config.icon className="w-3.5 h-3.5" />{config.text}</Badge>;
  };
  
  const totalRevenue = metrics
    .filter(m => m.event_type === 'impression')
    .reduce((sum, metric) => sum + (metric.cost || 0), 0);
    
  const totalImpressions = metrics.filter(m => m.event_type === 'impression').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background-dark)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }
  
  const pendingCampaigns = campaigns.filter(c => c.status === 'pending');
  const otherCampaigns = campaigns.filter(c => c.status !== 'pending');

  return (
    <div className="min-h-screen bg-[var(--background-dark)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-title text-white">Gerenciador de Anúncios</h1>
          <p className="text-[var(--text-secondary)]">Monitore e aprove as campanhas de anúncios da plataforma.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)]"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Receita Total</CardTitle><DollarSign className="h-4 w-4 text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</div></CardContent></Card>
          <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)]"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Impressões Totais</CardTitle><Eye className="h-4 w-4 text-[var(--brand-secondary)]" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">{totalImpressions.toLocaleString()}</div></CardContent></Card>
        </div>

        {pendingCampaigns.length > 0 && (
          <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)] mb-8">
            <CardHeader><CardTitle className="text-white">Campanhas para Aprovação</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead className="text-white">Campanha</TableHead><TableHead className="text-white">Anunciante</TableHead><TableHead className="text-white">Orçamento</TableHead><TableHead className="text-white">Criativo</TableHead><TableHead className="text-center text-white">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pendingCampaigns.map(campaign => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium text-white">{campaign.name}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">{campaign.advertiser_name}</TableCell>
                      <TableCell className="text-[var(--text-secondary)]">R$ {(campaign.budget || 0).toFixed(2)}</TableCell>
                       <TableCell>
                          <a href={campaign.ad_creative_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            <ExternalLink className="w-4 h-4 inline-block mr-1" />
                            Ver Vídeo
                          </a>
                        </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-center gap-2">
                          <Button size="icon" className="bg-green-500/20 hover:bg-green-500/30" onClick={() => handleCampaignStatus(campaign.id, 'active')}><Check className="w-4 h-4 text-green-300" /></Button>
                          <Button size="icon" className="bg-red-500/20 hover:bg-red-500/30" onClick={() => handleCampaignStatus(campaign.id, 'rejected')}><X className="w-4 h-4 text-red-300" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="bg-[var(--surface-dark)] border-[var(--border-soft)]">
          <CardHeader><CardTitle className="text-white">Todas as Campanhas</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead className="text-white">Campanha</TableHead><TableHead className="text-white">Status</TableHead><TableHead className="text-white">Gasto</TableHead><TableHead className="text-white">Impressões</TableHead><TableHead className="text-white">Cliques</TableHead></TableRow></TableHeader>
              <TableBody>
                {otherCampaigns.map(campaign => {
                    const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
                    const impressions = campaignMetrics.filter(m => m.event_type === 'impression').length;
                    const clicks = campaignMetrics.filter(m => m.event_type === 'click').length;
                    return (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium text-white">{campaign.name}</TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                          <TableCell className="text-[var(--text-secondary)]">R$ {(campaign.budget_spent || 0).toFixed(2)} / R$ {(campaign.budget || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-[var(--text-secondary)]">{impressions}</TableCell>
                          <TableCell className="text-[var(--text-secondary)]">{clicks}</TableCell>
                        </TableRow>
                    );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}