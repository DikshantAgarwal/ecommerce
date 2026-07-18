import { useState } from 'react';
import { Navigate } from 'react-router';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuthStore } from '../store/auth.store';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="h-32 w-full max-w-sm animate-pulse rounded-md bg-neutral-200" />
      </section>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-md border border-neutral-200 p-8 text-center shadow-sm">
        <h1 className="mb-2 text-2xl font-bold font-heading text-neutral-900">Sign In</h1>
        <p className="mb-8 text-sm text-neutral-500">
          Sign in to access your cart, orders, and more.
        </p>

        <GoogleSignInButton onError={setError} />

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
