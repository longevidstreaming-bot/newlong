import React, { useState, useEffect } from 'react';
import { Payment } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const userPayments = await Payment.filter({ user_id: user.id }, '-created_date');
      setPayments(userPayments);
    } catch (error) {
      console.error('Erro ao carregar histórico de pagamentos:', error);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300',
      processing: 'bg-blue-500/20 text-blue-300',
      completed: 'bg-green-500/20 text-green-300',
      failed: 'bg-red-500/20 text-red-300',
      refunded: 'bg-gray-500/20 text-gray-300'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      processing: 'Processando',
      completed: 'Concluído',
      failed: 'Falhou',
      refunded: 'Reembolsado'
    };
    return texts[status] || 'Desconhecido';
  };

  const downloadInvoice = (payment) => {
    // Simular download de comprovante
    const blob = new Blob([`Comprovante de Pagamento LONGEVID
    
Transação: ${payment.transaction_id}
Valor: R$ ${payment.amount.toFixed(2)}
Data: ${format(new Date(payment.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
Status: ${getStatusText(payment.status)}
Método: ${payment.payment_method.toUpperCase()}
    `], { type: 'text/plain' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `longevid-comprovante-${payment.transaction_id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B61FF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Histórico de Pagamentos</h2>
        <Button
          onClick={loadPaymentHistory}
          variant="outline"
          size="sm"
          className="border-[#2C2C3E] text-[#B0B0B0] hover:text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {payments.length === 0 ? (
        <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
          <CardContent className="p-8 text-center">
            <CreditCard className="w-16 h-16 text-[#B0B0B0] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum pagamento encontrado</h3>
            <p className="text-[#B0B0B0]">Seus pagamentos aparecerão aqui quando você assinar um plano.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          Plano Premium
                        </h3>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusText(payment.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[#B0B0B0]">Valor:</span>
                          <span className="text-white font-semibold ml-2">
                            R$ {payment.amount.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#B0B0B0]">Método:</span>
                          <span className="text-white font-semibold ml-2 uppercase">
                            {payment.payment_method}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#B0B0B0]">Data:</span>
                          <span className="text-white font-semibold ml-2">
                            {format(new Date(payment.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#B0B0B0]">Transação:</span>
                          <span className="text-white font-semibold ml-2 font-mono text-xs">
                            {payment.transaction_id}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => downloadInvoice(payment)}
                        variant="outline"
                        size="sm"
                        className="border-[#2C2C3E] text-[#B0B0B0] hover:text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Comprovante
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}