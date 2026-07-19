import { useState } from 'react';
import { Link, Outlet } from 'react-router';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { CartIcon, Footer } from '../components';

const NAV_LINKS = [
  { label: 'Men', to: '/products?section=men' },
  { label: 'Women', to: '/products?section=women' },
  { label: 'Themes', to: '/products' },
];

export default function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-neutral-0">
      <header className="fixed top-0 z-50 h-20 w-full border-b border-neutral-200 bg-neutral-0 md:h-20">
        <div className="mx-auto hidden h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8 md:flex">
          <nav className="flex flex-1 items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm uppercase tracking-wide text-neutral-600 transition-colors duration-200 hover:text-primary-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link to="/" className="font-heading text-2xl font-bold text-neutral-900">
            KuHu
          </Link>

          <div className="flex flex-1 items-center justify-end gap-6">
            <button className="text-neutral-600 transition-colors duration-200 hover:text-primary-900" aria-label="Search">
              <Search className="size-6" />
            </button>
            <CartIcon />
            {isAuthenticated && user ? (
              <Link to="/" className="text-neutral-600 transition-colors duration-200 hover:text-primary-900" aria-label="Profile">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="size-6 rounded-full" />
                ) : (
                  <User className="size-6" />
                )}
              </Link>
            ) : (
              <Link to="/login" className="text-neutral-600 transition-colors duration-200 hover:text-primary-900" aria-label="Sign in">
                <User className="size-6" />
              </Link>
            )}
          </div>
        </div>

        <div className="flex h-full items-center justify-between px-4 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-neutral-600"
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>

          <Link to="/" className="font-heading text-xl font-bold text-neutral-900">
            KuHu
          </Link>

          <div className="flex items-center gap-4">
            <CartIcon />
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className="relative flex h-full w-72 flex-col bg-neutral-0 p-6 shadow-lg">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-heading text-xl font-bold text-neutral-900">KuHu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-neutral-600"
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
                  className="text-base font-medium text-neutral-900 transition-colors hover:text-primary-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-4 pt-8 border-t border-neutral-200">
              {isAuthenticated && user ? (
                <>
                  <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-600">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{user.full_name}</p>
                    <p className="text-xs text-neutral-600">{user.email}</p>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  <User className="size-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
