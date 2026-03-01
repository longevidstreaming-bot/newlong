import { User } from '@/api/entities';
import { Campaign } from '@/api/entities';
import { AdMetric } from '@/api/entities';

/**
 * Gerenciador central de anúncios do LONGEVID
 * Controla quando e como os anúncios são exibidos
 */
export class AdManager {
  /**
   * Configura bloqueio de categorias indesejadas
   */
  static blockedCategories = [
    'adult-content',
    'gambling', 
    'violence',
    'inappropriate-music'
  ];

  /**
   * Verifica se uma categoria de anúncio é permitida
   */
  static isAdCategoryAllowed(adCategory) {
    if (!adCategory) return true;
    return !this.blockedCategories.includes(adCategory.toLowerCase());
  }

  /**
   * Verifica se o usuário deve ver anúncios
   */
  static async shouldShowAds(user = null) {
    try {
      if (!user) {
        const currentUser = await User.me().catch(() => null);
        if (!currentUser) return true;
        user = currentUser;
      }
      return user.ads_enabled === true && user.subscription_type === 'free';
    } catch (error) {
      console.error('Erro ao verificar se deve mostrar anúncios:', error);
      return true;
    }
  }

  /**
   * Controla a frequência de anúncios: 1 a cada 3 clipes
   */
  static shouldShowAdByFrequency() {
    const viewCount = parseInt(localStorage.getItem('videoViewCount') || '0');
    const lastAdShown = parseInt(localStorage.getItem('lastAdShown') || '0');
    
    const newCount = viewCount + 1;
    localStorage.setItem('videoViewCount', newCount.toString());
    
    const shouldShow = (newCount - lastAdShown) >= 3;
    
    if (shouldShow) {
      localStorage.setItem('lastAdShown', newCount.toString());
    }
    
    return shouldShow;
  }

  /**
   * Busca uma campanha ativa para exibir com segmentação
   */
  static async getActiveAd(videoCategory = null) {
    try {
      let activeCampaigns = await Campaign.filter({ 
        is_active: true
      });
      
      if (activeCampaigns.length === 0) return null;

      if (videoCategory) {
        const segmentedCampaigns = activeCampaigns.filter(campaign => 
          !campaign.target_genres || 
          campaign.target_genres.length === 0 || 
          campaign.target_genres.includes(videoCategory)
        );
        
        if (segmentedCampaigns.length > 0) {
          activeCampaigns = segmentedCampaigns;
        }
      }

      const randomIndex = Math.floor(Math.random() * activeCampaigns.length);
      return activeCampaigns[randomIndex];
    } catch (error) {
      console.error('Erro ao buscar anúncio ativo:', error);
      return null;
    }
  }

  /**
   * Registra uma impressão de anúncio
   */
  static async recordImpression(campaign, userId, videoId) {
    try {
      const cpmRate = campaign.format === 'preroll' ? 12.00 : 7.00;
      const costPerImpression = cpmRate / 1000;

      await AdMetric.create({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        advertiser_name: campaign.advertiser_name,
        event_type: 'impression',
        user_id: userId,
        video_id: videoId,
        cost: costPerImpression,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao registrar impressão:', error);
    }
  }

  /**
   * Registra um clique no anúncio
   */
  static async recordClick(campaign, userId, videoId) {
    try {
      await AdMetric.create({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        advertiser_name: campaign.advertiser_name,
        event_type: 'click',
        user_id: userId,
        video_id: videoId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  }

  /**
   * Registra conclusão/skip do anúncio
   */
  static async recordCompletion(campaign, userId, videoId, completed = true) {
    try {
      await AdMetric.create({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        advertiser_name: campaign.advertiser_name,
        event_type: completed ? 'completion' : 'skip',
        user_id: userId,
        video_id: videoId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao registrar completion:', error);
    }
  }

  /**
   * Função principal para decidir se deve exibir anúncio pré-roll
   */
  static async shouldShowPreRoll(userId, videoId, videoCategory = null) {
    try {
      const user = await User.me().catch(() => null);
      
      if (!await this.shouldShowAds(user)) {
        return { shouldShow: false, reason: 'premium_user' };
      }

      if (!this.shouldShowAdByFrequency()) {
        return { shouldShow: false, reason: 'frequency_control' };
      }

      const campaign = await this.getActiveAd(videoCategory);
      if (!campaign) {
        return { shouldShow: false, reason: 'no_ads_available' };
      }

      return {
        shouldShow: true,
        campaign,
        user: user || undefined
      };
    } catch (error) {
      console.error('Erro ao verificar pré-roll:', error);
      return { shouldShow: false, reason: 'error' };
    }
  }
}