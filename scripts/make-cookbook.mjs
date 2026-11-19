// Builds the "Date Night In" e-cookbook PDF from the site's recipes and cookbook/menus.yaml.
//
//   node scripts/make-cookbook.mjs
//
// Output (not published on the website; this is the paid product):
//   cookbook/dist/date-night-in.pdf
// Public preview images for the cookbook sales page:
//   public/cookbook/cover.jpg, public/cookbook/preview-1.jpg, preview-2.jpg, preview-3.jpg
//
// Needs Playwright + Chromium, and pdftoppm (poppler) for the preview images.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import yaml from 'js-yaml';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RECIPES = path.join(ROOT, 'src/content/recipes');
const DIST = path.join(ROOT, 'cookbook/dist');
const PREVIEWS = path.join(ROOT, 'public/cookbook');
const SITE = (fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8').match(/site:\s*'([^']+)'/) || [])[1];
const DOMAIN = new URL(SITE).host;

export const BOOK = {
  title: 'Date Night In',
  subtitle: '12 complete dinners for two to cook together',
  file: 'date-night-in.pdf',
  edition: `First edition · ${new Date().getFullYear()}`,
};

// ---------- data ----------
const recipes = new Map(
  fs.readdirSync(RECIPES).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(RECIPES, f), 'utf8');
    const [, front, ...rest] = raw.split(/^---\s*$/m);
    const data = yaml.load(front);
    return [f.replace(/\.md$/, ''), { id: f.replace(/\.md$/, ''), ...data, body: rest.join('---').trim(), photo: data.image ? path.join(RECIPES, data.image) : null }];
  }),
);
const menus = yaml.load(fs.readFileSync(path.join(ROOT, 'cookbook/menus.yaml'), 'utf8'));
for (const m of menus) for (const id of m.recipes) if (!recipes.has(id)) throw new Error(`Menu ${m.slug}: unknown recipe ${id}`);

// Recipe order in Part 2: first appearance in the menus, then anything not in a menu (bonus recipes)
const order = [...new Set(menus.flatMap((m) => m.recipes))];
const bonus = [...recipes.keys()].filter((id) => !order.includes(id)).sort();
const recipeOrder = [...order, ...bonus];

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FRACS = [[0, ''], [0.125, '⅛'], [0.25, '¼'], [0.333, '⅓'], [0.5, '½'], [0.667, '⅔'], [0.75, '¾'], [1, '']];
const fmtQty = (n) => {
  let whole = Math.floor(n); let best = FRACS.reduce((a, b) => (Math.abs(b[0] - (n - whole)) < Math.abs(a[0] - (n - whole)) ? b : a));
  if (best[0] === 1) { whole += 1; best = FRACS[0]; }
  return (whole ? String(whole) : '') + best[1] || '0';
};
const isGroup = (i) => i.qty === undefined && !i.unit && i.item.trim().endsWith(':');
const ingText = (i) => [i.qty !== undefined ? fmtQty(i.qty) : '', i.unit, i.item].filter(Boolean).join(' ');
const minutes = (m) => (m >= 90 ? `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);
const total = (r) => r.prepMinutes + r.cookMinutes;
const md = (text) => text.split(/\n\s*\n/).map((p) => `<p>${esc(p.trim())
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.+?)\*/g, '<em>$1</em>')
  .replace(/\[(.+?)\]\((\/[^)]*)\)/g, (_, t, u) => `<a href="${SITE}${u}">${t}</a>`)}</p>`).join('');
const WHO = { both: 'Together', chef1: 'Chef 1', chef2: 'Chef 2' };

const imgCache = new Map();
async function photo(file, width = 1400) {
  const key = `${file}@${width}`;
  if (!imgCache.has(key)) {
    const buf = await sharp(file).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    imgCache.set(key, `data:image/jpeg;base64,${buf.toString('base64')}`);
  }
  return imgCache.get(key);
}
const font = (pkg, file) => fs.readFileSync(path.join(ROOT, 'node_modules/@fontsource', pkg, 'files', file)).toString('base64');
const FONTS = `
@font-face{font-family:Fraunces;font-weight:500;src:url(data:font/woff2;base64,${font('fraunces', 'fraunces-latin-500-normal.woff2')})}
@font-face{font-family:Fraunces;font-weight:700;src:url(data:font/woff2;base64,${font('fraunces', 'fraunces-latin-700-normal.woff2')})}
@font-face{font-family:Fraunces;font-weight:500;font-style:italic;src:url(data:font/woff2;base64,${font('fraunces', 'fraunces-latin-500-italic.woff2')})}
@font-face{font-family:'DM Sans';font-weight:400;src:url(data:font/woff2;base64,${font('dm-sans', 'dm-sans-latin-400-normal.woff2')})}
@font-face{font-family:'DM Sans';font-weight:500;src:url(data:font/woff2;base64,${font('dm-sans', 'dm-sans-latin-500-normal.woff2')})}
@font-face{font-family:'DM Sans';font-weight:700;src:url(data:font/woff2;base64,${font('dm-sans', 'dm-sans-latin-700-normal.woff2')})}`;

const CSS = `${FONTS}
:root{--ink:#2b1621;--muted:#6f5560;--wine:#9f1239;--coral:#e8574a;--blush:#ffe1dc;--cream:#fff6ee;--line:#efd9cf;--gold:#c98a12}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:'DM Sans',sans-serif;font-size:10.5pt;line-height:1.5;color:var(--ink)}
h1,h2,h3{font-family:Fraunces,serif;font-weight:700;letter-spacing:-.01em;line-height:1.1;margin:0 0 .35em}
h1{font-size:30pt} h2{font-size:21pt} h3{font-size:13pt}
p{margin:0 0 .7em}
a{color:var(--wine);text-decoration:none}
.page{break-before:page}
.eyebrow{font-size:8pt;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--coral);margin-bottom:6pt}
.muted{color:var(--muted)}
.chip{display:inline-block;font-size:8pt;font-weight:700;padding:2pt 8pt;border-radius:99pt;background:var(--blush);color:#6d0b27;margin-right:4pt}
.box{background:var(--cream);border-radius:10pt;padding:12pt 14pt}
/* divider */
.divider{height:9.6in;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.divider .num{font-family:Fraunces;font-style:italic;font-weight:500;font-size:20pt;color:var(--coral)}
.divider h1{font-size:46pt;margin:8pt 0 12pt}
.divider p{max-width:4.6in;font-size:12pt;color:var(--muted)}
.heart{color:var(--wine);font-size:22pt}
/* welcome & toc */
.legend{display:flex;gap:10pt;margin:10pt 0 16pt}
.legend div{flex:1;border-radius:10pt;padding:10pt 12pt}
.toc{columns:2;column-gap:28pt}
.toc{font-size:9.5pt}
.toc li{break-inside:avoid;margin-bottom:3pt}
.toc h1{margin-bottom:6pt}
.toc h3{font-size:11.5pt;margin-bottom:4pt}
.toc ol{padding-left:16pt;margin:0}
.toc small{display:block;color:var(--muted);font-size:7.5pt;line-height:1.35}
/* menus */
.menu-hero{width:100%;height:2.9in;object-fit:cover;border-radius:12pt;display:block;margin-bottom:14pt}
.menu-hero.empty{display:flex;align-items:center;justify-content:center;font-size:80pt}
.courses{list-style:none;padding:0;margin:6pt 0 10pt}
.courses li{display:flex;align-items:baseline;gap:10pt;padding:5pt 0;border-bottom:1px dashed var(--line)}
.courses .c{width:62pt;flex:none;font-size:7.5pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--coral)}
.courses a{font-family:Fraunces;font-weight:700;font-size:12.5pt;color:var(--ink)}
.courses .t{margin-left:auto;font-size:8.5pt;color:var(--muted);white-space:nowrap}
.mood{display:grid;grid-template-columns:repeat(3,1fr);gap:8pt}
.mood div{background:var(--cream);border-radius:10pt;padding:9pt 11pt;font-size:9pt}
.mood b{display:block;font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:var(--wine);margin-bottom:3pt}
.m1 .menu-hero{height:2.2in}.m2 .menu-hero{height:1.6in}.m2 .courses li{padding:3pt 0}
.plan{list-style:none;padding:0;margin:0 0 16pt}
.plan li{display:grid;grid-template-columns:1.35in 1fr;gap:12pt;padding:5pt 0;border-bottom:1px solid var(--line);break-inside:avoid}
.plan b{color:var(--wine)}
.shop{columns:3;column-gap:16pt;font-size:8.3pt;line-height:1.35}
.shop section{break-inside:avoid;margin-bottom:9pt}
.shop h4{font-family:Fraunces;font-size:10pt;margin:0 0 3pt}
.shop ul{list-style:none;padding:0;margin:0}
.shop li{padding-left:14pt;position:relative;margin-bottom:2pt}
.shop li::before{content:'';position:absolute;left:0;top:3.5pt;width:7pt;height:7pt;border:1.2px solid var(--wine);border-radius:2pt}
.talk{margin-top:12pt;background:var(--ink);color:#fff;border-radius:12pt;padding:14pt 18pt;break-inside:avoid}
.talk .eyebrow{color:#f6b93b}
.talk ol{margin:0;padding-left:16pt;font-family:Fraunces;font-style:italic;font-weight:500;font-size:10.5pt}
.talk li{margin-bottom:5pt}
/* recipes */
.r-photo{width:100%;height:2.45in;object-fit:cover;border-radius:12pt;display:block;margin-bottom:12pt}
.r-photo.empty{display:flex;align-items:center;justify-content:center;font-size:72pt}
.stats{display:flex;gap:8pt;margin:6pt 0 8pt}
.stats div{background:var(--cream);border-radius:8pt;padding:5pt 10pt;font-size:8pt;color:var(--muted)}
.stats b{display:block;font-family:Fraunces;font-size:11.5pt;color:var(--ink)}
.intro{font-size:9.5pt;color:#4a3640;line-height:1.45}
.intro p{margin-bottom:.45em}
.r-grid{display:grid;grid-template-columns:2.25in 1fr;gap:18pt;margin-top:6pt}
.ings{list-style:none;padding:0;margin:0;font-size:8.8pt;line-height:1.35}
.ings li{padding:3pt 0;border-bottom:1px dashed var(--line);break-inside:avoid}
.ings li.g{border:0;padding-top:9pt;font-family:Fraunces;font-weight:700;color:var(--wine)}
.ings b{color:#6d0b27}
.steps{list-style:none;counter-reset:s;padding:0;margin:0}
.steps{font-size:9.2pt;line-height:1.42}
.steps li{counter-increment:s;position:relative;padding:0 0 7pt 26pt;break-inside:avoid}
.steps li::before{content:counter(s);position:absolute;left:0;top:0;width:18pt;height:18pt;border-radius:50%;background:var(--cream);color:var(--wine);font-family:Fraunces;font-weight:700;font-size:9pt;display:flex;align-items:center;justify-content:center}
.who{display:inline-block;font-size:6.5pt;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:1pt 6pt;border-radius:99pt;margin-bottom:2pt}
.who.both{background:var(--blush);color:#6d0b27}.who.chef1{background:#dbeafe;color:#1e40af}.who.chef2{background:#fef3c7;color:#92400e}
.c1 .r-photo{height:1.95in}
.c2 .r-photo{height:1.45in}.c2 .intro{font-size:9pt}
.c3 .steps{font-size:8.7pt}.c3 .ings{font-size:8.3pt}.c3 .intro{font-size:8.6pt}
.pair{margin-top:10pt;font-size:9pt;border-top:2px solid var(--line);padding-top:8pt;break-inside:avoid}
/* planner */
.lines div{border-bottom:1.2px solid var(--line);padding:16pt 0 4pt;font-size:9pt;color:var(--muted)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:24pt}
`;

const footer = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:7.5px;color:#9a7f8a;width:100%;padding:0 0.7in;display:flex;justify-content:space-between">
<span>Table for Two · ${BOOK.title}</span><span class="pageNumber"></span></div>`;

// ---------- page builders ----------
const courseLabel = (r) => r.course === 'Full Menu' ? 'Main' : r.course;

async function coverHtml() {
  const withPhotos = ['garlic-butter-steak-for-two', 'handmade-gnocchi-brown-butter-sage', 'molten-chocolate-lava-cakes', 'crispy-fish-taco-night', 'beef-bourguignon-for-two', 'tiramisu-for-two']
    .map((id) => recipes.get(id)).filter((r) => r?.photo && fs.existsSync(r.photo));
  const tiles = await Promise.all(withPhotos.slice(0, 6).map((r) => photo(r.photo, 700)));
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
@page{size:8.5in 11in;margin:0}
body{width:8.5in;height:11in;overflow:hidden;background:var(--wine);color:#fff;display:flex;flex-direction:column}
.mosaic{height:5.6in;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;gap:4pt;background:var(--wine)}
.mosaic img{width:100%;height:100%;object-fit:cover;display:block}
.t{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 .8in}
.t .k{font-family:Fraunces;font-style:italic;font-weight:500;font-size:17pt;color:#ffd3dc}
.t h1{font-size:62pt;margin:6pt 0 10pt;color:#fff}
.t p{font-size:15pt;color:#ffe4ea;margin:0}
.brand{padding:0 0 .5in;text-align:center;font-family:Fraunces;font-weight:700;font-size:17pt;letter-spacing:.02em}
.brand span{display:inline-flex;width:28pt;height:28pt;border-radius:50%;background:#fff;color:var(--wine);align-items:center;justify-content:center;margin-right:8pt;font-size:14pt;vertical-align:middle}
</style></head><body>
<div class="mosaic">${tiles.map((t) => `<img src="${t}">`).join('')}</div>
<div class="t"><div class="k">Table for Two presents</div><h1>${BOOK.title}</h1><p>${BOOK.subtitle}</p></div>
<div class="brand"><span>♥</span>Table for Two</div>
</body></html>`;
}

async function menuPages(m, i) {
  const rs = m.recipes.map((id) => recipes.get(id));
  const main = rs.find((r) => ['Main', 'Full Menu'].includes(r.course)) ?? rs[0];
  const drinkRecipe = rs.find((r) => r.course === 'Drink');
  const hero = main.photo && fs.existsSync(main.photo)
    ? `<img class="menu-hero" src="${await photo(main.photo)}" alt="">`
    : `<div class="menu-hero empty" style="background:${main.color}">${main.emoji}</div>`;
  const shop = rs.map((r) => `<section><h4>${esc(r.title)}</h4><ul>${r.ingredients.map((x) => isGroup(x) ? '' : `<li>${esc(ingText(x))}</li>`).join('')}</ul></section>`).join('');
  return `
<section class="page menu-a" id="menu-${m.slug}">
  ${hero}
  <div class="eyebrow">Date night ${i + 1} of ${menus.length}</div>
  <h1>${esc(m.title)}</h1>
  <span class="chip">${esc(m.vibe)} night</span><span class="chip">${minutes(Math.max(...rs.map(total)))} longest recipe</span>
  <p style="margin-top:10pt;font-size:11.5pt">${esc(m.intro)}</p>
  <ul class="courses">${rs.map((r) => `<li><span class="c">${courseLabel(r)}</span><a href="#r-${r.id}">${esc(r.title)}</a><span class="t">${minutes(total(r))}</span></li>`).join('')}</ul>
  <div class="mood">
    <div><b>Drink</b>${esc(drinkRecipe ? `${drinkRecipe.title} (recipe included). Or: ${main.pairing.drink}` : main.pairing.drink)}</div>
    <div><b>Playlist</b>${esc(main.pairing.playlist)}</div>
    <div><b>Setting</b>${esc(m.setting)}</div>
  </div>
  <div class="talk"><div class="eyebrow">Talk about this</div><ol>${m.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol></div>
</section>
<section class="page">
  <div class="eyebrow">${esc(m.title)}</div>
  <h2>Your game plan</h2>
  <ul class="plan">${m.plan.map((p) => `<li><b>${esc(p.when)}</b><span>${esc(p.what)}</span></li>`).join('')}</ul>
  <h2>Shopping list</h2>
  <p class="muted" style="font-size:9pt">Everything for the whole menu. Check off what you already have.</p>
  <div class="shop">${shop}</div>
</section>`;
}

async function recipePage(r, n) {
  const img = r.photo && fs.existsSync(r.photo)
    ? `<img class="r-photo" src="${await photo(r.photo)}" alt="">`
    : `<div class="r-photo empty" style="background:${r.color}">${r.emoji}</div>`;
  const inMenus = menus.filter((m) => m.recipes.includes(r.id));
  return `
<section class="page recipe" id="r-${r.id}">
  ${img}
  <div class="eyebrow">${inMenus.length ? `Recipe ${n} · ${inMenus.map((m) => esc(m.title)).join(' · ')}` : `Recipe ${n} · Bonus recipe`}</div>
  <h1 style="font-size:24pt">${esc(r.title)}</h1>
  <div class="stats">
    <div><b>${minutes(r.prepMinutes)}</b>Prep</div><div><b>${r.cookMinutes ? minutes(r.cookMinutes) : 'None'}</b>Cook</div>
    <div><b>${esc(r.difficulty)}</b>Level</div><div><b>${r.servings}</b>Serves</div>
    ${r.diet?.length ? `<div><b>${esc(r.diet.join(', '))}</b>Diet</div>` : ''}
  </div>
  <div class="intro">${md(r.body)}</div>
  <div class="r-grid">
    <div><h3>Ingredients</h3><ul class="ings">${r.ingredients.map((x) => isGroup(x)
      ? `<li class="g">${esc(x.item.trim().slice(0, -1))}</li>`
      : `<li>${x.qty !== undefined ? `<b>${fmtQty(x.qty)}</b> ` : ''}${esc([x.unit, x.item].filter(Boolean).join(' '))}</li>`).join('')}</ul></div>
    <div><h3>Steps</h3><ol class="steps">${r.steps.map((s) => `<li><span class="who ${s.who}">${WHO[s.who]}</span><br>${esc(s.text)}</li>`).join('')}</ol>
      <div class="pair"><b>Pair it with:</b> ${esc(r.pairing.drink)} · <b>Play:</b> ${esc(r.pairing.playlist)}</div></div>
  </div>
</section>`;
}

async function bodyHtml() {
  const menuHtml = (await Promise.all(menus.map(menuPages))).join('');
  const recipeHtml = (await Promise.all(recipeOrder.map((id, n) => recipePage(recipes.get(id), n + 1)))).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
@page{size:8.5in 11in;margin:.6in .7in .7in}
</style></head><body>

<section>
  <div class="eyebrow">Welcome</div>
  <h1>Date night, made at home.</h1>
  <p style="font-size:12pt">The best date nights don't need a reservation. They happen in your own kitchen, with the music on, a glass of something good, and the two of you swapping tasks and stealing tastes.</p>
  <p>This book is ${menus.length} complete date nights: the menu, the drink, the playlist, the setting, a game plan so everything is ready at the same time, a shopping list, and a few questions to get you talking. Every recipe serves two and is written for <strong>two people cooking together</strong>.</p>
  <h3 style="margin-top:14pt">How the steps work</h3>
  <div class="legend">
    <div style="background:#dbeafe"><span class="who chef1">Chef 1</span><br>One of you takes these steps.</div>
    <div style="background:#fef3c7"><span class="who chef2">Chef 2</span><br>The other takes these, at the same time.</div>
    <div style="background:var(--blush)"><span class="who both">Together</span><br>Do these side by side.</div>
  </div>
  <p>Decide who's Chef 1 before you start. Swap roles next time.</p>
  <div class="box" style="margin-top:14pt"><b>Tip:</b> read the game plan for your menu first. It tells you what to make the day before or in the afternoon, so dinner is relaxed, not rushed.</div>
</section>

<section class="page toc">
  <div class="eyebrow" style="column-span:all">Contents</div>
  <h1 style="column-span:all">What's inside</h1>
  <h3>Part 1 · The date nights</h3>
  <ol>${menus.map((m) => `<li><a href="#menu-${m.slug}">${esc(m.title)}</a><small>${m.recipes.map((id) => esc(recipes.get(id).title)).join(' · ')}</small></li>`).join('')}</ol>
  <h3 style="margin-top:12pt">Part 2 · The recipes</h3>
  <ol>${recipeOrder.map((id) => `<li><a href="#r-${id}">${esc(recipes.get(id).title)}</a></li>`).join('')}</ol>
  <h3 style="margin-top:12pt">Extras</h3>
  <ul style="padding-left:16pt;margin:0"><li><a href="#pantry">The date night pantry</a></li><li><a href="#planner">Printable date night planner</a></li></ul>
</section>

<section class="page" id="pantry">
  <div class="eyebrow">Before you start</div>
  <h1>The date night pantry</h1>
  <p>Keep these on hand and most of the shopping for any menu in this book is just the fresh stuff.</p>
  <div class="two" style="margin-top:10pt">
    <div><h3>Staples</h3><ul class="ings">
      <li>Good olive oil, plus a neutral high-heat oil</li><li>Unsalted butter</li><li>Kosher salt and flaky sea salt</li><li>Whole black peppercorns</li>
      <li>Garlic and shallots</li><li>A wedge of Parmesan</li><li>Honey and maple syrup</li><li>Dijon and whole-grain mustard</li>
      <li>Chicken, beef and vegetable broth</li><li>All-purpose flour and cornstarch</li><li>Dried pasta and arborio rice</li></ul></div>
    <div><h3>Flavor makers</h3><ul class="ings">
      <li>Fresh herbs: thyme, rosemary, sage, parsley</li><li>Lemons, limes and an orange</li><li>Cinnamon sticks, cloves, star anise</li><li>Red chili flakes</li>
      <li>A bottle of dry red and dry white wine for cooking</li><li>Bittersweet chocolate (60–70%)</li><li>Heavy cream</li></ul>
      <h3 style="margin-top:14pt">The gear that helps most</h3><ul class="ings">
      <li>A cast-iron or heavy stainless skillet</li><li>An instant-read thermometer</li><li>Two 6-oz ramekins</li><li>A sharp chef's knife, and a second one for your partner</li></ul></div>
  </div>
  <div class="box" style="margin-top:16pt"><b>And the most important ingredients:</b> candles, a playlist, and your phones in another room.</div>
</section>

<section class="page"><div class="divider"><div class="num">Part 1</div><h1>The date nights</h1><p>${menus.length} complete menus, from a 25-minute weeknight to a slow Sunday braise.</p><div class="heart">♥</div></div></section>
${menuHtml}
<section class="page"><div class="divider"><div class="num">Part 2</div><h1>The recipes</h1><p>Every recipe serves two, with the steps split between Chef 1 and Chef 2.</p><div class="heart">♥</div></div></section>
${recipeHtml}

<section class="page" id="planner">
  <div class="eyebrow">Print me</div>
  <h1>Our date night plan</h1>
  <div class="two">
    <div class="lines"><div>Date</div><div>Our menu</div><div>Chef 1</div><div>Chef 2</div><div>Drink</div><div>Playlist</div></div>
    <div class="lines"><div>What to make ahead</div><div></div><div>Still need to buy</div><div></div><div></div><div>Our question for tonight</div></div>
  </div>
  <h3 style="margin-top:22pt">Afterward: how was it?</h3>
  <div class="lines"><div>Best bite</div><div>What we'd change next time</div><div>Next date night we want to try</div></div>
</section>

<section class="page"><div class="divider">
  <div class="heart">♥</div><h1 style="font-size:36pt">Thank you</h1>
  <p>We hope this book brings you many nights at home together. Find new recipes, seasonal menus and the date night planner at</p>
  <p><a href="${SITE}" style="font-weight:700">${DOMAIN}</a></p>
  <p style="font-size:9pt;margin-top:24pt">${BOOK.edition} · © Table for Two. For your personal use; please don't share or resell this file.</p>
</div></section>
</body></html>`;
}

// ---------- render ----------
fs.mkdirSync(DIST, { recursive: true });
fs.mkdirSync(PREVIEWS, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

await page.setContent(await coverHtml(), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const coverPdf = await page.pdf({ width: '8.5in', height: '11in', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

await page.setContent(await bodyHtml(), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
// Fit each recipe on one page where possible: measure at the printed width and step down the photo/text size
const fit = await page.evaluate(() => {
  document.body.style.width = '7.1in';
  const limit = 9.7 * 96 - 8; // printable height of a Letter page with our margins, in CSS px
  const report = [];
  for (const s of document.querySelectorAll('section.menu-a')) {
    let lvl = 0;
    while (s.scrollHeight > limit && lvl < 2) s.classList.add(`m${++lvl}`);
    if (s.scrollHeight > limit) report.push({ id: s.id, lvl, fits: false });
  }
  for (const s of document.querySelectorAll('section.recipe')) {
    let lvl = 0;
    while (s.scrollHeight > limit && lvl < 3) s.classList.add(`c${++lvl}`);
    const fits = s.scrollHeight <= limit;
    // If it needs two pages anyway, keep the normal-size photo and text
    if (!fits) { s.classList.remove('c1', 'c2', 'c3'); lvl = 0; }
    report.push({ id: s.id, lvl, fits });
  }
  document.body.style.width = '';
  return report;
});
const twoPage = fit.filter((f) => !f.fits).map((f) => f.id.replace(/^(r|menu)-/, ''));
console.log(`recipes compacted: ${fit.filter((f) => f.lvl).length}; still 2 pages: ${twoPage.join(', ') || 'none'}`);
const bodyPdf = await page.pdf({
  format: 'Letter', printBackground: true, displayHeaderFooter: true,
  headerTemplate: '<span></span>', footerTemplate: footer,
  margin: { top: '0.6in', right: '0.7in', bottom: '0.7in', left: '0.7in' },
});
await browser.close();

const out = await PDFDocument.create();
for (const bytes of [coverPdf, bodyPdf]) {
  const src = await PDFDocument.load(bytes);
  for (const p of await out.copyPages(src, src.getPageIndices())) out.addPage(p);
}
out.setTitle(`${BOOK.title}: ${BOOK.subtitle}`);
out.setAuthor('Table for Two');
out.setSubject('Date night recipes and menus for two');
out.setCreator(DOMAIN);
const pdfPath = path.join(DIST, BOOK.file);
fs.writeFileSync(pdfPath, await out.save());
const pages = out.getPageCount();
console.log(`${pdfPath}: ${pages} pages, ${(fs.statSync(pdfPath).size / 1e6).toFixed(1)} MB`);

// ---------- preview images for the sales page ----------
// cover, the first menu (2 pages side by side) and its first recipe
const tmp = fs.mkdtempSync(path.join(DIST, 'tmp-'));
// Find pages by their text so the previews stay right if page counts change
const pdfText = execFileSync('pdftotext', ['-layout', pdfPath, '-'], { maxBuffer: 50e6 }).toString().split('\f');
const pageOf = (re) => { const i = pdfText.findIndex((t) => re.test(t.replace(/\s+/g, ''))); if (i < 0) throw new Error(`Preview page not found: ${re}`); return i + 1; };
const menu1 = pageOf(/datenight1of/i);
const want = { 'cover': 1, 'preview-1': menu1, 'preview-2': menu1 + 1, 'preview-3': pageOf(/recipe1·/i) };
for (const [name, n] of Object.entries(want)) {
  execFileSync('pdftoppm', ['-jpeg', '-r', '110', '-f', String(n), '-l', String(n), '-singlefile', pdfPath, path.join(tmp, name)]);
}
for (const name of ['cover', 'preview-1', 'preview-2', 'preview-3']) {
  await sharp(path.join(tmp, `${name}.jpg`)).resize({ width: 900 }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(PREVIEWS, `${name}.jpg`));
}
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync(path.join(PREVIEWS, 'book.json'), JSON.stringify({ title: BOOK.title, subtitle: BOOK.subtitle, pages, menus: menus.map((m) => ({ title: m.title, recipes: m.recipes.map((id) => recipes.get(id).title) })), recipeCount: recipeOrder.length }, null, 2));
console.log('previews written to public/cookbook/');
