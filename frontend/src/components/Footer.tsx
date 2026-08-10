import { Link } from 'react-router';
import { ChevronDown } from 'lucide-react';

const CUSTOMER_CARE_LINKS = [
  { label: 'Contact Us', to: '#' },
  { label: 'Shipping', to: '#' },
  { label: 'Returns', to: '#' },
  { label: 'FAQ', to: '#' },
];

const CONNECT_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/koohooapparel' },
  { label: 'Facebook', href: '#' },
];

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="font-heading text-xl font-bold text-neutral-900">
              KuHu Apparels
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-600">
              Premium fashion, crafted for you.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Customer Care
            </h3>
            <ul className="space-y-1">
              {CUSTOMER_CARE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-block py-1.5 text-sm text-neutral-600 transition-colors hover:text-primary-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Connect
            </h3>
            <ul className="space-y-1">
              {CONNECT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="inline-block py-1.5 text-sm text-neutral-600 transition-colors hover:text-primary-900"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-neutral-200 pt-6 text-sm text-neutral-600 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} KuHu Apparels. All rights reserved.</p>
          <button
            type="button"
            onClick={backToTop}
            className="inline-flex w-full items-center justify-center gap-1 rounded-lg py-3 text-sm transition-colors hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 sm:w-auto sm:py-0"
          >
            Back to top
            <ChevronDown aria-hidden="true" className="size-4 rotate-180" />
          </button>
        </div>
      </div>
    </footer>
  );
}