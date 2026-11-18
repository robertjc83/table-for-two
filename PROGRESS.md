# Table for Two: progress notes

_Last updated: November 18, 2026_

## Where things stand

- **Live site:** https://dinner-for-two-tonight.netlify.app/ (Netlify auto-deploys every push to `main`)
- **Code:** https://github.com/robertjc83/table-for-two
- **Google Search Console:** site verified (file `public/googlecba71771707e178d.html`; do not delete it)
- **Recipes:** 19 total (12 everyday + 7 holiday)
- **Pages:** home, recipe list with filters, 19 recipe pages, Date Night Planner,
  Holidays (Thanksgiving + Christmas for two), About, Privacy, 404

## Recipe photos

Done (12): chicken marsala, honey garlic salmon, garlic butter steak, crispy fish tacos,
chocolate fondue, lava cakes, gnocchi, shrimp scampi, Thai red curry, mushroom risotto,
tiramisu, burrata board.

Still needed (7 holiday recipes; Thanksgiving ones first):
- [ ] herb-roasted-turkey-breast-for-two
- [ ] sausage-apple-herb-stuffing-for-two
- [ ] pumpkin-creme-brulee-for-two
- [ ] filet-mignon-red-wine-sauce
- [ ] cranberry-pecan-baked-brie
- [ ] mulled-wine-for-two
- [ ] small-batch-gingerbread-cookies

Photos go in `src/content/recipes/images/` and are linked with `image:` + `imageAlt:` in the recipe's front matter.
Most current photos look AI-generated; over time, replace the most popular ones with your own.

## To-do list

### Google Search Console
- [ ] Request indexing (daily quota was reached on Nov 18, so continue the next day):
  1. /holidays/thanksgiving-dinner-for-two/
  2. /recipes/herb-roasted-turkey-breast-for-two/
  3. /holidays/christmas-dinner-for-two/
- [ ] Confirm `sitemap-index.xml` is listed under Sitemaps

### Before launch / monetization
- [ ] Write the About page story (`src/pages/about.astro`); a photo of you two helps
- [ ] Connect the newsletter form to Kit / Beehiiv / Mailchimp (`src/components/Newsletter.astro`)
- [ ] Review the Privacy page template (`src/pages/privacy.astro`) and add a real contact email
- [ ] Join Amazon Associates, then replace every `#affiliate-link` in the recipes' `gear:` lists
- [ ] Reach ~25 recipes, then apply to Google AdSense (paste ad code into `src/components/AdSlot.astro`)
- [ ] Optional: buy a custom domain and update `astro.config.mjs` + `public/robots.txt`
- [ ] Optional: start a Pinterest account and pin the holiday pages

### Recipe ideas for next batches
- Valentine's Day (publish by early January so it can rank)
- New Year's Eve menu with champagne
- Budget date nights (under $20)
- Cocktails for two
