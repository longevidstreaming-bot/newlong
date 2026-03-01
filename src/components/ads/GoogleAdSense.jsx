import React, { useEffect } from 'react';

export default function GoogleAdSense({ 
  adSlot, 
  adFormat = 'auto',
  style = {},
  className = '',
  responsive = true 
}) {
  useEffect(() => {
    // Carrega o script do AdSense de forma assíncrona
    if (typeof window !== 'undefined') {
      try {
        // Inicializa os anúncios do AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Erro ao carregar AdSense:', error);
      }
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-XXXXXXXXXX" // Substitua pelo seu publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
      ></ins>
    </div>
  );
}