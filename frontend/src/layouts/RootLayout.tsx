import { Link, Outlet } from 'react-router';
import { useAuthStore } from '../store/auth.store';

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold">
            E-Commerce
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <Link to="/" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="size-8 rounded-full"
                    />
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-600">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.full_name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-neutral-500 hover:text-neutral-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-900"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
