import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { getProfile } from '../services/auth.service';

/**
 * Refreshes the persisted user profile (including is_staff) from the
 * server on app boot so staff status stays current across sessions.
 */
export function useRefreshProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    getProfile()
      .then((user) => {
        if (!cancelled) useAuthStore.getState().setUser(user);
      })
      .catch(() => {
        // token may be expired/invalid; the axios interceptor handles refresh/401
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
}
