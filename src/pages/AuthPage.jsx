import React, { useEffect, useState } from 'react';
import { signInWithGoogle, onAuthChanged } from '@/firebase';
import { createPageUrl } from '@/utils';

export default function AuthPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChanged(user => {
      if (user) {
        window.location.href = createPageUrl('Home');
      } else {
        setLoading(false);
        // try popup sign-in immediately
        signInWithGoogle().then(() => {
          window.location.href = createPageUrl('Home');
        }).catch(err => {
          setError(err.message || 'Falha ao iniciar login Google');
        });
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#121212' }}>
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Entrar com Google</h1>
        {loading ? (
          <p className="text-[#B0B0B0]">Abrindo janela de login...</p>
        ) : (
          <>
            <button
              onClick={async () => {
                setError('');
                try {
                  await signInWithGoogle();
                  window.location.href = createPageUrl('Home');
                } catch (e) {
                  setError(e.message || 'Erro no login Google');
                }
              }}
              className="px-4 py-2 rounded font-bold"
              style={{ background: 'linear-gradient(135deg, #FF4F81, #7B61FF)', color: '#fff' }}
            >
              Continuar com Google
            </button>
            {error && <p className="mt-3 text-red-400">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
