import { useEffect } from 'react';

export default function AdSenseScript() {
  useEffect(() => {
    // Carregar script do Google AdSense apenas uma vez
    if (typeof window !== 'undefined' && !window.adsbygoogleLoaded) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        window.adsbygoogleLoaded = true;
        console.log('✅ Google AdSense carregado com sucesso');
      };
      
      script.onerror = () => {
        console.error('❌ Erro ao carregar Google AdSense');
      };

      document.head.appendChild(script);
    }
  }, []);

  return null; // Este componente não renderiza nada
}