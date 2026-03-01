import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Share2, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShareButton({ 
  url, 
  title, 
  description = "Confira este incrível conteúdo no LONGEVID!", 
  variant = "outline" 
}) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const currentUrl = url || window.location.href;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: currentUrl,
        });
        setIsOpen(false);
      } catch (error) {
        console.log('Compartilhamento cancelado pelo usuário');
      }
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n\n${description}\n\n${currentUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setIsOpen(false);
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`${title}\n\n${description}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${text}`, '_blank');
    setIsOpen(false);
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`${title}\n\n${description}`);
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${text}`, '_blank');
    setIsOpen(false);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={variant}
          className="border-[#FF4F81]/30 bg-[#FF4F81]/10 text-[#FF4F81] hover:bg-[#FF4F81]/20 hover:border-[#FF4F81] flex items-center gap-2 transition-all duration-300"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1E1E2F] border-[#2C2C3E] text-white p-4">
        <div className="space-y-4">
          <h4 className="font-semibold text-white mb-3">Compartilhar</h4>
          
          {/* Web Share API (se disponível) */}
          {navigator.share && (
            <Button
              onClick={shareViaWebAPI}
              className="w-full bg-[#7B61FF] hover:bg-[#8B71FF] text-white justify-start gap-3"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar via sistema
            </Button>
          )}

          {/* Copiar Link */}
          <Button
            onClick={copyToClipboard}
            className="w-full bg-[#2C2C3E] hover:bg-[#3C3C4E] text-white justify-start gap-3"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Link copiado!' : 'Copiar link'}
          </Button>

          <div className="border-t border-[#2C2C3E] pt-3">
            <p className="text-sm text-[#B0B0B0] mb-3">Compartilhar em:</p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={shareWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white justify-start gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              
              <Button
                onClick={shareTelegram}
                className="bg-blue-500 hover:bg-blue-600 text-white justify-start gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                Telegram
              </Button>
              
              <Button
                onClick={shareTwitter}
                className="bg-black hover:bg-gray-800 text-white justify-start gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter)
              </Button>
              
              <Button
                onClick={shareFacebook}
                className="bg-blue-600 hover:bg-blue-700 text-white justify-start gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}