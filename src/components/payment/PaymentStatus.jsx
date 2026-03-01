import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentStatus({ status, amount, transactionId, onClose }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          title: 'Pagamento Aprovado!',
          message: 'Seu plano Premium foi ativado com sucesso.'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          title: 'Pagamento Recusado',
          message: 'Houve um problema com seu pagamento. Tente novamente.'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          title: 'Pagamento Pendente',
          message: 'Aguardando confirmação do seu banco.'
        };
      default:
        return {
          icon: CreditCard,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          title: 'Processando Pagamento',
          message: 'Seu pagamento está sendo processado.'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <Card className={`bg-[#1E1E2F] ${config.borderColor} border-2`}>
        <CardContent className="p-8 text-center">
          <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className={`w-8 h-8 ${config.color}`} />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{config.title}</h2>
          <p className="text-[#B0B0B0] mb-6">{config.message}</p>
          
          {amount && (
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-[#B0B0B0]">Valor:</span>
                <span className="text-white font-semibold">R$ {amount.toFixed(2).replace('.', ',')}</span>
              </div>
              
              {transactionId && (
                <div className="flex justify-between">
                  <span className="text-[#B0B0B0]">Transação:</span>
                  <span className="text-white font-semibold font-mono text-sm">{transactionId}</span>
                </div>
              )}
            </div>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-[#7B61FF] hover:bg-[#6B51EF] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {status === 'completed' ? 'Continuar' : 'Fechar'}
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}