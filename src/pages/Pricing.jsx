import React, { useState, useEffect } from "react";
import { Plan } from "@/api/entities";
import { Payment } from "@/api/entities";
import { User } from "@/api/entities";
import { AdManager } from "../components/ads/AdManager";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from '@/utils';
import PixPayment from "../components/payment/PixPayment";

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPixPayment, setShowPixPayment] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
      
      const activePlans = await Plan.filter({ is_active: true });
      setPlans(activePlans);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSelectPlan = async (plan) => {
    try {
      if (!currentUser) {
        await User.loginWithRedirect(window.location.href);
        return;
      }

      setSelectedPlan(plan);
      setShowPixPayment(true);
      
    } catch (e) {
      console.error('Erro ao selecionar plano:', e);
    }
  };

  const handlePaymentComplete = async (paymentData) => {
    if (!selectedPlan || !currentUser) return;

    try {
      const subscriptionStartDate = new Date().toISOString();
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      
      // Registrar pagamento
      await Payment.create({
        user_id: currentUser.id,
        plan_id: selectedPlan.id,
        transaction_id: paymentData.transactionId,
        amount: selectedPlan.price,
        payment_method: 'pix',
        status: 'completed',
        paid_at: new Date().toISOString(),
        subscription_start_date: subscriptionStartDate,
        subscription_end_date: subscriptionEndDate.toISOString()
      });

      // Atualizar usuário para premium
      await User.updateMyUserData({
        subscription_status: 'active',
        subscription_type: 'premium',
        ads_enabled: false,
        plan_id: selectedPlan.id,
        subscription_start_date: subscriptionStartDate,
        subscription_end_date: subscriptionEndDate.toISOString()
      });

      // Usar AdManager para atualizar status
      await AdManager.updateUserAdStatus(currentUser.id, 'premium', 'active');

      // Redirecionar com sucesso
      window.location.href = createPageUrl('Home?upgraded=true');
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    }
  };

  const handlePaymentCancel = () => {
    setShowPixPayment(false);
    setSelectedPlan(null);
  };

  if (showPixPayment && selectedPlan) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <PixPayment
            plan={selectedPlan}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handlePaymentCancel}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-12 mb-4">
            Escolha o seu plano
          </h1>
          <p className="text-lg text-[#B0B0B0] mb-6">
            Acesso ilimitado a todos os videoclipes. Cancele quando quiser.
          </p>
          
          {/* PIX Highlight */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PIX</span>
              </div>
              <h3 className="text-xl font-bold text-white">Pagamento Instantâneo</h3>
            </div>
            <p className="text-[#B0B0B0]">
              Pague com <span className="text-green-400 font-semibold">PIX</span> e tenha acesso 
              <strong> imediato</strong> ao seu plano Premium, sem taxas extras!
            </p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B61FF] mx-auto mb-4"></div>
            <p className="text-white">Carregando planos...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#1E1E2F] p-8 rounded-2xl border border-[#2C2C3E] flex flex-col"
            >
              <h2 className="text-2xl font-bold text-white">Plano Gratuito</h2>
              <p className="text-4xl font-bold text-white my-4">
                R$ 0,00 <span className="text-lg font-normal text-[#B0B0B0]">/mês</span>
              </p>
              <p className="text-[#B0B0B0] flex-grow">Acesso básico com anúncios</p>
              <ul className="text-left my-8 space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#7B61FF]" />
                  <span className="text-[#B0B0B0]">Acesso a todos os videoclipes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-red-400">Anúncios pré-roll (15s)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#7B61FF]" />
                  <span className="text-[#B0B0B0]">Qualidade padrão</span>
                </li>
              </ul>
              <Button 
                disabled
                className="w-full bg-gray-600 text-gray-300 font-semibold text-lg py-6 cursor-not-allowed"
              >
                Plano Atual
              </Button>
            </motion.div>

            {/* Premium Plans */}
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.2 }}
                className="bg-gradient-to-br from-[#1E1E2F] to-[#7B61FF]/5 p-8 rounded-2xl border-2 border-[#7B61FF]/50 flex flex-col relative overflow-hidden"
              >
                {/* Premium Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#7B61FF] to-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  PAGAMENTO PIX
                </div>
                
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Crown className="w-6 h-6 text-[#7B61FF]" />
                  {plan.name}
                </h2>
                <p className="text-4xl font-bold text-white my-4">
                  R$ {plan.price.toFixed(2).replace('.', ',')} <span className="text-lg font-normal text-[#B0B0B0]">/mês</span>
                </p>
                <p className="text-[#B0B0B0] flex-grow">{plan.description}</p>
                <ul className="text-left my-8 space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#7B61FF]" />
                      <span className="text-[#B0B0B0]">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-semibold">🚫 ZERO Anúncios</span>
                  </li>
                </ul>

                {/* PIX Highlight */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-green-300 font-semibold">
                    <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PIX</span>
                    </div>
                    Ativação Instantânea
                  </div>
                </div>

                <Button 
                  onClick={() => handleSelectPlan(plan)} 
                  className="w-full bg-gradient-to-r from-green-600 to-[#7B61FF] font-bold text-lg py-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-green-500/25"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Pagar com PIX
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}