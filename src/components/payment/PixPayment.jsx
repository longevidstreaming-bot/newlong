
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, QrCode, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PixPayment({ plan, onPaymentComplete, onCancel }) {
  const [pixCode, setPixCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutos

  const generatePixCode = useCallback(async () => {
    setIsGenerating(true);
    
    // Simular geração de código PIX
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockPixCode = `00020126580014BR.GOV.BCB.PIX013636401234-1234-1234-1234-12345678901052040000530398654${plan.price.toFixed(2).replace('.', '')}5802BR5913LONGEVID LTDA6009Sao Paulo62070503***6304${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    setPixCode(mockPixCode);
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockPixCode)}`);
    setIsGenerating(false);
  }, [plan.price]); // Dependency array includes plan.price because it's used in mockPixCode

  useEffect(() => {
    generatePixCode();
  }, [generatePixCode]); // Effect depends on the memoized generatePixCode function

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const simulatePayment = () => {
    // Simular confirmação de pagamento
    onPaymentComplete({
      transactionId: `pix_${Date.now()}`,
      amount: plan.price,
      method: 'pix',
      status: 'completed'
    });
  };

  if (isGenerating) {
    return (
      <Card className="max-w-md mx-auto bg-[#1E1E2F] border-[#2C2C3E]">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-[#7B61FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Gerando código PIX</h3>
          <p className="text-[#B0B0B0]">Aguarde um momento...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#7B61FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-white">Pagamento via PIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
            <p className="text-3xl font-bold text-[#7B61FF]">
              R$ {plan.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block mb-3">
              <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48" />
            </div>
            <p className="text-sm text-[#B0B0B0]">
              Escaneie o QR Code ou copie o código abaixo
            </p>
          </div>

          {/* Código PIX */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Código PIX:</label>
            <div className="flex gap-2">
              <Input
                value={pixCode}
                readOnly
                className="bg-[#121212] border-[#2C2C3E] text-white text-xs font-mono"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="icon"
                className="border-[#2C2C3E] text-[#B0B0B0] hover:text-white"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Timer */}
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <Clock className="w-4 h-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              Código expira em: <strong>{formatTime(timeRemaining)}</strong>
            </AlertDescription>
          </Alert>

          {/* Instruções */}
          <div className="bg-[#121212] p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-3">Como pagar:</h4>
            <ol className="space-y-2 text-sm text-[#B0B0B0]">
              <li>1. Abra o aplicativo do seu banco</li>
              <li>2. Escolha a opção PIX</li>
              <li>3. Escaneie o QR Code ou cole o código</li>
              <li>4. Confirme o pagamento de R$ {plan.price.toFixed(2).replace('.', ',')}</li>
            </ol>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={simulatePayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              ✅ Simular Pagamento Aprovado
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full border-[#2C2C3E] text-[#B0B0B0] hover:text-white"
            >
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-center text-[#6A6A7A]">
            Em produção, o pagamento seria detectado automaticamente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
