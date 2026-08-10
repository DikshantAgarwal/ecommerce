export interface NavLink {
  label: string;
  to: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Men', to: '/products?section=men' },
  { label: 'Women', to: '/products?section=women' },
  { label: 'Themes', to: '/products' },
];

export function isLinkActive(
  link: NavLink,
  current: string,
  section: string | null,
): boolean {
  const [, query = ''] = link.to.split('?');
  if (query.startsWith('section=')) {
    return link.to.startsWith(current) && section === query.replace('section=', '');
  }
  return !section && current === link.to;
}