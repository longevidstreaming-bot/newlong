import React, { useEffect, useState } from 'react';
import { signInWithGoogle, onAuthChanged, signInWithGoogleRedirect, getRedirectUser } from '@/firebase';
import { createPageUrl } from '@/utils';

export default function AuthPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    const init = async () => {
      // Primeiro, tenta obter resultado de redirect (mobile)
      const redirected = await getRedirectUser();
      if (redirected) {
        window.location.href = createPageUrl('Home');
        return;
      }
      unsub = onAuthChanged(async (user) => {
        if (user) {
          window.location.href = createPageUrl('Home');
        } else {
          setLoading(false);
          // Tenta popup; se falhar por ambiente, usa redirect
          try {
            await signInWithGoogle();
            window.location.href = createPageUrl('Home');
          } catch (err) {
            try {
              // evita loop de redirect
              if (!sessionStorage.getItem('auth_redirect_in_progress')) {
                sessionStorage.setItem('auth_redirect_in_progress', '1');
                await signInWithGoogleRedirect();
              }
            } catch (e) {
              setError(err?.message || e?.message || 'Falha ao iniciar login Google');
            }
          }
        }
      });
    };
    init();
    return () => { try { unsub(); } catch {} };
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
                  try {
                    await signInWithGoogle();
                  } catch {
                    sessionStorage.setItem('auth_redirect_in_progress', '1');
                    await signInWithGoogleRedirect();
                  }
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
