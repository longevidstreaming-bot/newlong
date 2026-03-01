import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from './FirebaseAuthProvider';
import { Shield, Smartphone, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TwoFactorSetup({ onComplete }) {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { enable2FA } = useAuth();

  const generateQRCode = () => {
    // Simular geração de QR Code para autenticador
    // Em produção, isso viria do Firebase Authentication
    const secret = 'JBSWY3DPEHPK3PXP'; // Exemplo de secret
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/LONGEVID:user@example.com?secret=${secret}&issuer=LONGEVID`;
    setQrCode(qrCodeUrl);
    setStep(2);
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('O código deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simular verificação do código 2FA
    // Em produção, isso seria verificado com o Firebase
    if (verificationCode === '123456') {
      const result = await enable2FA();
      if (result.success) {
        setStep(3);
      } else {
        setError(result.error);
      }
    } else {
      setError('Código inválido. Tente novamente.');
    }

    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-[#1E1E2F] border-[#2C2C3E]">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #7B61FF, #FF4F81)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">
            Configurar Autenticação em Duas Etapas
          </CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            {step === 1 && 'Proteja sua conta com segurança extra'}
            {step === 2 && 'Escaneie o QR Code com seu autenticador'}
            {step === 3 && '2FA configurado com sucesso!'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Smartphone className="w-16 h-16 text-[#7B61FF] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Por que usar 2FA?
                </h3>
                <p className="text-[#B0B0B0] text-sm">
                  A autenticação em duas etapas adiciona uma camada extra de segurança à sua conta.
                  Mesmo se alguém souber sua senha, ainda precisará do código do seu celular.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#B0B0B0]">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Proteção contra acesso não autorizado</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#B0B0B0]">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Requisito para contas de artistas e administradores</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#B0B0B0]">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Funciona com Google Authenticator, Authy e outros</span>
                </div>
              </div>

              <Button
                onClick={generateQRCode}
                className="w-full bg-gradient-to-r from-[#7B61FF] to-[#FF4F81]"
              >
                Continuar Configuração
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Escaneie com seu Autenticador
                </h3>
                
                {qrCode && (
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <img src={qrCode} alt="QR Code para 2FA" className="w-48 h-48" />
                  </div>
                )}

                <div className="text-left bg-[#121212] p-4 rounded-lg mb-4">
                  <h4 className="text-white font-medium mb-2">Aplicativos recomendados:</h4>
                  <ul className="text-sm text-[#B0B0B0] space-y-1">
                    <li>• Google Authenticator</li>
                    <li>• Microsoft Authenticator</li>
                    <li>• Authy</li>
                    <li>• 1Password</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white">
                  Digite o código de verificação (6 dígitos)
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-wider bg-[#121212] border-[#2C2C3E] text-white"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-[#2C2C3E] text-[#B0B0B0]"
                >
                  Voltar
                </Button>
                <Button
                  onClick={verifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-[#7B61FF] to-[#FF4F81]"
                >
                  {isLoading ? 'Verificando...' : 'Verificar'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  2FA Configurado com Sucesso!
                </h3>
                <p className="text-[#B0B0B0]">
                  Sua conta agora está protegida com autenticação em duas etapas.
                  Guarde seus códigos de backup em local seguro.
                </p>
              </div>

              <div className="bg-[#121212] p-4 rounded-lg text-left">
                <h4 className="text-white font-medium mb-2">Códigos de Backup:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono text-[#B0B0B0]">
                  <div>ABC123</div>
                  <div>DEF456</div>
                  <div>GHI789</div>
                  <div>JKL012</div>
                  <div>MNO345</div>
                  <div>PQR678</div>
                </div>
                <p className="text-xs text-[#6A6A7A] mt-2">
                  Use estes códigos se não tiver acesso ao seu celular
                </p>
              </div>

              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-[#7B61FF] to-[#FF4F81]"
              >
                Concluir
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}