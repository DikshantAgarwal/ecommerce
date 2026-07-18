import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { googleLogin } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

const DEFAULT_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleSignInButtonProps {
  onError?: (error: string) => void;
  clientId?: string;
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });
}

export default function GoogleSignInButton({ onError, clientId = DEFAULT_CLIENT_ID }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const prevClientIdRef = useRef(clientId);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    loadGsiScript()
      .then(() => setLoaded(true))
      .catch((err) => {
        console.error('[GoogleSignInButton] Failed to load GIS script:', err);
        setLoadError(true);
      });
  }, []);

  useEffect(() => {
    if (prevClientIdRef.current !== clientId) {
      initializedRef.current = false;
      prevClientIdRef.current = clientId;
    }
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !buttonRef.current || !loaded || initializedRef.current) return;

    initializedRef.current = true;

    function handleCredentialResponse(response: CredentialResponse) {
      googleLogin(response.credential)
        .then((authResponse) => {
          setAuth(authResponse.user, authResponse.refresh, authResponse.access);
          navigate('/', { replace: true });
        })
        .catch((err) => {
          console.error('[GoogleSignInButton] Sign-in failed:', err);
          onError?.('Sign-in failed. Please try again.');
        });
    }

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });
    window.google?.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      shape: 'rectangular',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
    });
  }, [navigate, setAuth, onError, clientId, loaded]);

  if (loadError) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Failed to load Google Sign-In. Please check your internet connection and try again.
      </p>
    );
  }

  if (!loaded) {
    return (
      <div className="flex justify-center">
        <div className="h-10 w-64 animate-pulse rounded-md bg-neutral-200" />
      </div>
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
}
