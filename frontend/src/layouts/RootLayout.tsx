import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { User, Menu, X, LogOut, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { CartIcon, Footer, MobileCategoryNav } from '../components';
import { NAV_LINKS, isLinkActive } from '../utils/nav';
import { useRefreshProfile } from '../hooks/useRefreshProfile';

export default function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const section = new URLSearchParams(search).get('section');

  useRefreshProfile();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-0">
      <header className="fixed top-0 z-50 w-full border-b border-neutral-200 bg-neutral-0">
        <div className="mx-auto hidden h-20 max-w-7xl items-center px-4 sm:px-6 lg:px-8 md:flex">
          <nav className="flex flex-1 items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                aria-current={isLinkActive(link, pathname, section) ? 'page' : undefined}
                className={`text-sm uppercase tracking-wide transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 ${
                  isLinkActive(link, pathname, section)
                    ? 'font-semibold text-primary-900'
                    : 'text-neutral-600 hover:text-primary-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/"
            className="font-heading text-4xl font-bold tracking-tight text-neutral-900 transition-colors duration-200 hover:text-primary-900"
          >
            KuHu
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4">
            <CartIcon />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1">
                {user.is_staff && (
                  <Link
                    to="/fulfillment"
                    className="flex items-center gap-1.5 p-2 text-neutral-600 transition-colors duration-200 hover:text-primary-900"
                    aria-label="Fulfillment"
                  >
                    <ClipboardList className="size-6" />
                  </Link>
                )}
                <Link to="/" className="p-2 text-neutral-600 transition-colors duration-200 hover:text-primary-900" aria-label="Profile">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="size-6 rounded-full" />
                  ) : (
                    <User className="size-6" />
                  )}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-neutral-600 transition-colors duration-200 hover:text-primary-900"
                  aria-label="Log out"
                >
                  <LogOut className="size-6" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="p-2 text-neutral-600 transition-colors duration-200 hover:text-primary-900" aria-label="Sign in">
                <User className="size-6" />
              </Link>
            )}
          </div>
        </div>

        <div className="flex h-14 items-center justify-between px-4 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="-ml-2 rounded p-2 text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>

          <Link to="/" className="font-heading text-2xl font-bold tracking-tight text-neutral-900 transition-colors duration-200 hover:text-primary-900">
            KuHu
          </Link>

          <div className="flex items-center">
            <CartIcon />
          </div>
        </div>

        <MobileCategoryNav />
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className="relative flex h-full w-72 flex-col bg-neutral-0 p-6 shadow-lg">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-heading text-xl font-bold text-neutral-900">KuHu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
                aria-label="Close menu"
              >
                <X className="size-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isLinkActive(link, pathname, section) ? 'page' : undefined}
                  className={`text-base font-medium transition-colors ${
                    isLinkActive(link, pathname, section)
                      ? 'text-primary-900'
                      : 'text-neutral-900 hover:text-primary-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-4 pt-8 border-t border-neutral-200">
              {isAuthenticated && user ? (
                <>
                  {user.is_staff && (
                    <Link
                      to="/fulfillment"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mb-6 flex items-center gap-3 text-base font-medium text-neutral-900 transition-colors hover:text-primary-900"
                    >
                      <ClipboardList className="size-5" aria-hidden="true" />
                      Fulfillment
                    </Link>
                  )}
                  <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-600">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{user.full_name}</p>
                    <p className="truncate text-xs text-neutral-600">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
                >
                  <User className="size-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="pt-[calc(3.5rem+2.75rem)] md:pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
