import React, { useEffect, useRef, useCallback } from 'react';

export default function GoogleRecaptcha({ onVerify }) {
  const recaptchaRef = useRef(null);

  const renderRecaptcha = useCallback(() => {
    if (window.grecaptcha && recaptchaRef.current) {
      window.grecaptcha.render(recaptchaRef.current, {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Substitua pela sua chave site do reCAPTCHA
        theme: 'dark',
        callback: (token) => {
          onVerify(token);
        },
        'expired-callback': () => {
          onVerify('');
        }
      });
    }
  }, [onVerify]);

  useEffect(() => {
    // Carregar script do Google reCAPTCHA
    if (typeof window !== 'undefined' && !window.grecaptcha) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        renderRecaptcha();
      };
      
      document.head.appendChild(script);
    } else if (window.grecaptcha) {
      renderRecaptcha();
    }
  }, [renderRecaptcha]);

  return (
    <div className="flex justify-center">
      <div ref={recaptchaRef} className="transform scale-90 origin-center"></div>
    </div>
  );
}