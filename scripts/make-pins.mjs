// Generates Pinterest pin images (1000×1500) for every recipe that has a photo,
// plus one collage pin per seasonal collection, and a reference sheet of pin text.
//
//   node scripts/make-pins.mjs
//
// Re-run after adding or changing photos, then commit public/pins/ and pinterest/.
// Needs Playwright + Chromium (pre-installed in Claude's cloud sessions; elsewhere: npx playwright install chromium).
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import sharp from 'sharp';
import { createRequire } from 'node:module';
// Playwright is installed globally in the cloud session (not a project dependency), so load it with require
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RECIPES = path.join(ROOT, 'src/content/recipes');
const OUT = path.join(ROOT, 'public/pins');
const SITE = (fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8').match(/site:\s*'([^']+)'/) || [])[1];
if (!SITE) throw new Error('Could not read `site` from astro.config.mjs');
const DOMAIN = new URL(SITE).host;

const COLLECTIONS = [
  { key: 'thanksgiving', slug: 'thanksgiving-dinner-for-two', kicker: 'Holiday menu for two', title: 'Thanksgiving Dinner for Two', sub: 'Turkey, gravy, stuffing & dessert, scaled down for two' },
  { key: 'christmas', slug: 'christmas-dinner-for-two', kicker: 'Holiday menu for two', title: 'Christmas Eve Dinner for Two', sub: 'A cozy, romantic menu + game plan' },
  { key: 'fall', slug: 'fall-date-night-recipes', kicker: 'Seasonal date nights', title: 'Fall Date Night Recipes', sub: 'Cozy dinners for two for sweater weather' },
];

const font = (pkg, file) => fs.readFileSync(path.join(ROOT, 'node_modules/@fontsource', pkg, 'files', file)).toString('base64');
const FONTS = `
@font-face{font-family:Fraunces;font-weight:700;src:url(data:font/woff2;base64,${font('fraunces', 'fraunces-latin-700-normal.woff2')})}
@font-face{font-family:Fraunces;font-weight:500;font-style:italic;src:url(data:font/woff2;base64,${font('fraunces', 'fraunces-latin-500-italic.woff2')})}
@font-face{font-family:'DM Sans';font-weight:500;src:url(data:font/woff2;base64,${font('dm-sans', 'dm-sans-latin-500-normal.woff2')})}
@font-face{font-family:'DM Sans';font-weight:700;src:url(data:font/woff2;base64,${font('dm-sans', 'dm-sans-latin-700-normal.woff2')})}`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const img64 = (file) => `data:image/jpeg;base64,${fs.readFileSync(file).toString('base64')}`;

function readRecipes() {
  return fs.readdirSync(RECIPES).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(RECIPES, f), 'utf8');
    const data = yaml.load(raw.split(/^---\s*$/m)[1]);
    return { id: f.replace(/\.md$/, ''), ...data, photo: data.image ? path.join(RECIPES, data.image) : null };
  });
}

const page = (photoHtml, kicker, title, sub, color) => `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
*{box-sizing:border-box;margin:0}
body{width:1000px;height:1500px;font-family:'DM Sans',sans-serif;background:#fff6ee;color:#2b1621;display:flex;flex-direction:column;overflow:hidden}
.photo{position:relative;height:900px;overflow:hidden;background:${color}}
.photo img{width:100%;height:100%;object-fit:cover;display:block}
.grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;height:100%;background:#fff6ee}
.badge{position:absolute;top:36px;left:36px;background:rgba(255,255,255,.94);color:#9f1239;font-weight:700;font-size:26px;letter-spacing:.12em;text-transform:uppercase;padding:14px 26px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.18)}
.panel{flex:1;display:flex;flex-direction:column;justify-content:center;padding:28px 64px 20px;text-align:center}
.kicker{font-family:Fraunces;font-style:italic;font-weight:500;color:${color};font-size:40px;margin-bottom:12px}
h1{font-family:Fraunces;font-weight:700;line-height:1.04;letter-spacing:-.02em;font-size:84px}
.sub{margin-top:18px;font-size:32px;font-weight:500;color:#7a5f6a}
.foot{height:118px;background:#9f1239;color:#fff;display:flex;align-items:center;justify-content:center;gap:18px}
.heart{width:58px;height:58px;border-radius:50%;background:#fff;display:grid;place-items:center}
.brand{font-family:Fraunces;font-weight:700;font-size:44px}
.dom{font-size:26px;opacity:.85;margin-left:10px}
</style></head><body>
<div class="photo">${photoHtml}<div class="badge">Date night for two</div></div>
<div class="panel"><div class="kicker">${esc(kicker)}</div><h1 id="t">${esc(title)}</h1><div class="sub">${esc(sub)}</div></div>
<div class="foot"><div class="heart"><svg width="32" height="32" viewBox="0 0 64 64"><path d="M32 54S10 40.5 10 25.5C10 17 16.3 11.6 23 11.6c4.2 0 7.3 2.2 9 5.2 1.7-3 4.8-5.2 9-5.2 6.7 0 13 5.4 13 13.9C54 40.5 32 54 32 54z" fill="#9f1239"/></svg></div><span class="brand">Table for Two</span><span class="dom">${esc(DOMAIN)}</span></div>
<script>
// shrink the title until the panel fits
const t=document.getElementById('t'),p=document.querySelector('.panel');let s=84;
while(p.scrollHeight>p.clientHeight&&s>44){s-=2;t.style.fontSize=s+'px'}
</script></body></html>`;

const recipeSub = (r) => {
  const mins = r.prepMinutes + r.cookMinutes;
  const time = mins >= 90 ? `${Math.floor(mins / 60)} hr${mins % 60 ? ` ${mins % 60} min` : ''}` : `${mins} min`;
  return `${time} · ${r.difficulty} · Cook it together`;
};
const recipeKicker = (r) => r.occasions?.includes('christmas') ? 'A Christmas date night'
  : r.occasions?.includes('thanksgiving') ? 'Thanksgiving for two'
  : r.occasions?.includes('fall') ? 'A cozy fall date night'
  : ({ Dessert: 'A romantic dessert for two', Drink: 'A cozy drink for two', Starter: 'A date night starter' })[r.course] ?? 'A date night dinner';

const BOARD = (r) => r.occasions?.includes('christmas') || r.occasions?.includes('thanksgiving') ? 'Holiday Dinners for Two'
  : r.course === 'Dessert' ? 'Romantic Desserts for Two'
  : r.course === 'Drink' ? 'Date Night Drinks'
  : r.occasions?.includes('fall') ? 'Fall Date Night Recipes'
  : 'Date Night Dinners for Two';

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const recipes = readRecipes();
const withPhotos = recipes.filter((r) => r.photo && fs.existsSync(r.photo));
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
const shoot = async (html, file) => {
  await tab.setContent(html, { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  const png = await tab.screenshot({ type: 'png' });
  await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, file));
};

const rows = [];
for (const r of withPhotos) {
  await shoot(page(`<img src="${img64(r.photo)}">`, recipeKicker(r), r.title, recipeSub(r), r.color ?? '#9f1239'), `${r.id}.jpg`);
  rows.push({
    title: r.title.slice(0, 100),
    description: `${r.description} Every recipe splits the steps between Chef 1 and Chef 2, with a drink pairing and a playlist. #datenight #dinnerfortwo`.slice(0, 500),
    link: `${SITE}/recipes/${r.id}/`,
    image: `${SITE}/pins/${r.id}.jpg`,
    board: BOARD(r),
    keywords: ['date night recipes', 'dinner for two', `${r.cuisine} recipes`.toLowerCase(), `${r.vibe} date night`.toLowerCase(), ...(r.occasions ?? []).map((o) => `${o} for two`)].join(', '),
  });
  console.log('pin', r.id);
}

for (const c of COLLECTIONS) {
  const pics = withPhotos.filter((r) => r.occasions?.includes(c.key)).slice(0, 4);
  if (pics.length < 2) { console.log('skip collection (needs 2+ photos)', c.key); continue; }
  const grid = pics.length >= 4
    ? `<div class="grid">${pics.map((r) => `<img src="${img64(r.photo)}">`).join('')}</div>`
    : `<div class="grid" style="grid-template-rows:1fr">${pics.slice(0, 2).map((r) => `<img src="${img64(r.photo)}">`).join('')}</div>`;
  const n = recipes.filter((r) => r.occasions?.includes(c.key)).length;
  await shoot(page(grid, c.kicker, c.title, `${n} recipes · ${c.sub}`, '#9f1239'), `${c.slug}.jpg`);
  rows.push({
    title: c.title,
    description: `${c.title}: ${c.sub.toLowerCase()}. ${n} recipes made for two people cooking together, with a full menu and a plan to time it all. #datenight #dinnerfortwo`.slice(0, 500),
    link: `${SITE}/holidays/${c.slug}/`,
    image: `${SITE}/pins/${c.slug}.jpg`,
    board: c.key === 'fall' ? 'Fall Date Night Recipes' : 'Holiday Dinners for Two',
    keywords: ['date night recipes', 'dinner for two', `${c.key} for two`, `${c.key} dinner ideas`].join(', '),
  });
  console.log('pin', c.slug);
}
await browser.close();

// Remove pins whose recipe no longer has a photo
const keep = new Set(rows.map((r) => path.basename(r.image)));
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.jpg') && !keep.has(f)) fs.unlinkSync(path.join(OUT, f));

const header = ['Title', 'Description', 'Link', 'Image URL', 'Suggested board', 'Keywords'];
const csv = [header, ...rows.map((r) => [r.title, r.description, r.link, r.image, r.board, r.keywords])].map((row) => row.map(csvCell).join(',')).join('\n');
fs.mkdirSync(path.join(ROOT, 'pinterest'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'pinterest/pins.csv'), csv + '\n');
console.log(`\n${rows.length} pins written to public/pins/ and pinterest/pins.csv`);
const missing = recipes.filter((r) => !withPhotos.includes(r)).map((r) => r.id);
if (missing.length) console.log('No photo yet (no pin):', missing.join(', '));
