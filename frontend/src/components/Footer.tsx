import { Link } from 'react-router';

const CUSTOMER_CARE_LINKS = [
  { label: 'Contact Us', to: '#' },
  { label: 'Shipping', to: '#' },
  { label: 'Returns', to: '#' },
  { label: 'FAQ', to: '#' },
];

const CONNECT_LINKS = [
  { label: 'Instagram', to: '#' },
  { label: 'Facebook', to: '#' },
  { label: 'Twitter / X', to: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="font-heading text-xl font-bold text-neutral-900">
            KuHu Apparels
          </Link>
          <p className="mt-1 text-sm text-neutral-600">
            Premium fashion, crafted for you.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">Customer Care</h3>
            <ul className="space-y-2">
              {CUSTOMER_CARE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-neutral-600 transition-colors hover:text-primary-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">Connect</h3>
            <ul className="space-y-2">
              {CONNECT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-neutral-600 transition-colors hover:text-primary-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-600">
          &copy; {new Date().getFullYear()} KuHu Apparels. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
