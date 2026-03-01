import React, { useRef, useEffect } from 'react';

export default function AudioBranding({ 
  audioUrl, 
  trigger = 'startup', 
  volume = 0.3, 
  fadeIn = true,
  delay = 0 
}) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioUrl) return;

    const playAudioBranding = async () => {
      try {
        if (audioRef.current) {
          audioRef.current.volume = fadeIn ? 0 : volume;
          
          // Delay opcional antes de reproduzir
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          await audioRef.current.play();

          // Fade in effect
          if (fadeIn) {
            const fadeInDuration = 1000; // 1 segundo
            const steps = 50;
            const volumeStep = volume / steps;
            const timeStep = fadeInDuration / steps;

            for (let i = 0; i <= steps; i++) {
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.volume = Math.min(volumeStep * i, volume);
                }
              }, timeStep * i);
            }
          }
        }
      } catch (error) {
        console.log('Audio branding não pôde ser reproduzido (interação do usuário necessária)');
      }
    };

    // Triggers diferentes
    switch (trigger) {
      case 'startup':
        // Reproduzir na inicialização da app
        const timer = setTimeout(playAudioBranding, 500);
        return () => clearTimeout(timer);
      
      case 'login':
        // Reproduzir no login
        playAudioBranding();
        break;
      
      case 'upload_success':
        // Reproduzir quando upload for bem sucedido
        playAudioBranding();
        break;
      
      case 'immediate':
        // Reproduzir imediatamente
        playAudioBranding();
        break;
    }
  }, [audioUrl, trigger, volume, fadeIn, delay]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
    >
      <source src={audioUrl} type="audio/mpeg" />
      <source src={audioUrl} type="audio/wav" />
      <source src={audioUrl} type="audio/ogg" />
    </audio>
  );
}