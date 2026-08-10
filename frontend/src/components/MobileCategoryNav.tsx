import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { NAV_LINKS } from '../utils/nav';

export default function MobileCategoryNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const section = params.get('section');
  const theme = params.get('theme');

  const { data: categories } = useCategories();

  const themes = useMemo(() => {
    if (!categories) return [];
    const seen = new Set<string>();
    return categories
      .filter((c) => {
        if (seen.has(c.name)) return false;
        seen.add(c.name);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      close();
      toggleRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const menLink = NAV_LINKS.find((l) => l.label === 'Men');
  const womenLink = NAV_LINKS.find((l) => l.label === 'Women');

  const menActive = section === 'men';
  const womenActive = section === 'women';
  const themesActive = Boolean(theme) || open;

  const tabClass = (active: boolean) =>
    `relative flex h-full min-w-[7rem] shrink-0 flex-1 items-center justify-center gap-1 whitespace-nowrap text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-700 ${
      active
        ? 'font-semibold text-primary-900'
        : 'font-normal text-neutral-600 hover:text-primary-900'
    }`;

  const underline = (active: boolean) =>
    active ? (
      <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 mx-auto h-0.5 w-10 bg-primary-900" />
    ) : null;

  return (
    <>
      <nav
        aria-label="Primary sections"
        className="absolute inset-x-0 top-full z-40 flex h-11 w-full items-stretch overflow-x-auto border-b border-neutral-200 bg-neutral-0 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          to={menLink!.to}
          aria-current={menActive ? 'page' : undefined}
          className={tabClass(menActive)}
        >
          {menLink!.label}
          {underline(menActive)}
        </Link>

        <Link
          to={womenLink!.to}
          aria-current={womenActive ? 'page' : undefined}
          className={tabClass(womenActive)}
        >
          {womenLink!.label}
          {underline(womenActive)}
        </Link>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="mobile-themes-panel"
          className={tabClass(themesActive)}
        >
          Themes
          <ChevronDown
            aria-hidden="true"
            className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
          {underline(themesActive)}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-themes-panel"
          ref={panelRef}
          role="region"
          aria-label="Theme selector"
          className="absolute inset-x-0 top-[6.25rem] z-40 border-t border-neutral-200 bg-neutral-0 shadow-[0_16px_32px_rgba(0,0,0,0.10)] md:hidden"
        >
          <div className="p-4">
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Themes
            </p>

            {themes.length > 0 ? (
              <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                {themes.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/products?theme=${encodeURIComponent(t.name)}`}
                      onClick={close}
                      className="flex items-center justify-between gap-2 rounded px-1 py-2 text-sm text-neutral-700 transition-colors hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-700"
                    >
                      {t.name}
                      <ChevronRight
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-neutral-300"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-1 py-1 text-sm text-neutral-500">Loading themes…</p>
            )}

            <Link
              to="/products"
              onClick={close}
              className="mt-3 block border-t border-neutral-100 px-1 py-3 text-sm font-semibold text-primary-900 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-700"
            >
              View All Themes &rarr;
            </Link>
          </div>
        </div>
      )}
    </>
  );
}