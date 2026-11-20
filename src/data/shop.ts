// E-cookbook sales settings. After creating the product on Gumroad, Payhip, Etsy, Stan Store, etc.,
// paste the product link into buyUrl. While buyUrl is empty the site shows "Coming soon".
export const COOKBOOK = {
  price: '$12',
  salePrice: '', // e.g. '$9' for a launch sale; leave empty for no sale
  buyUrl: 'https://payhip.com/b/LPqe3',
};

// Amazon Associates. Paste your tracking ID (e.g. 'tablefortwo-20') once approved.
// Gear items then link to Amazon (a search for the item, or a product link if the recipe gives one),
// and the required Amazon disclosure appears in the footer and on the Privacy page.
export const AMAZON = {
  tag: 'tablefortwo0b-20',
  store: 'https://www.amazon.com',
};

/** Link for a recipe's gear item, or null when there's nothing to link to yet. */
export function gearLink(g: { name: string; url?: string }): string | null {
  const real = g.url && /^https?:\/\//.test(g.url) ? g.url : null;
  if (real) {
    if (!AMAZON.tag || !/(^|\.)amazon\.[a-z.]+$/.test(new URL(real).hostname)) return real;
    const u = new URL(real); u.searchParams.set('tag', AMAZON.tag); return u.href;
  }
  if (!AMAZON.tag) return null;
  const u = new URL('/s', AMAZON.store);
  u.searchParams.set('k', g.name.replace(/\(.*?\)/g, '').trim());
  u.searchParams.set('tag', AMAZON.tag);
  return u.href;
}
