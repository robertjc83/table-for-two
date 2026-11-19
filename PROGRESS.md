# Table for Two: progress notes

_Last updated: November 19, 2026_

## Where things stand

- **Live site:** https://dinner-for-two-tonight.netlify.app/ (Netlify auto-deploys every push to `main`)
- **Code:** https://github.com/robertjc83/table-for-two
- **Google Search Console:** site verified (file `public/googlecba71771707e178d.html`; do not delete it)
- **Recipes:** 26 total (12 everyday + 7 holiday + 7 fall)
- **Pages:** home, recipe list with filters, 26 recipe pages, Date Night Planner,
  Seasonal pages (Fall date nights, Thanksgiving for two, Christmas for two), About, Privacy, 404
- Recipes join a seasonal page via `occasions: [fall | thanksgiving | christmas]` (page text lives in `src/data/holidays.ts`)

## Recipe photos

Done (12): chicken marsala, honey garlic salmon, garlic butter steak, crispy fish tacos,
chocolate fondue, lava cakes, gnocchi, shrimp scampi, Thai red curry, mushroom risotto,
tiramisu, burrata board.

Still needed (6; Thanksgiving ones first):
- [x] herb-roasted-turkey-breast-for-two
- [ ] sausage-apple-herb-stuffing-for-two
- [ ] pumpkin-creme-brulee-for-two
- [ ] filet-mignon-red-wine-sauce
- [x] cranberry-pecan-baked-brie
- [x] mulled-wine-for-two
- [ ] small-batch-gingerbread-cookies
- [ ] roasted-butternut-squash-soup
- [x] apple-cider-pork-chops
- [x] beef-bourguignon-for-two
- [x] creamy-pumpkin-sage-pasta
- [x] maple-roasted-brussels-sprouts-bacon (also on the Thanksgiving menu)
- [ ] skillet-apple-crisp-for-two (also on the Thanksgiving menu)
- [x] hot-apple-cider-toddy

Photos go in `src/content/recipes/images/` and are linked with `image:` + `imageAlt:` in the recipe's front matter.
Most current photos look AI-generated; over time, replace the most popular ones with your own.

## To-do list

### Google Search Console
- [ ] Request indexing (daily quota was reached on Nov 18, so continue the next day):
  1. /holidays/thanksgiving-dinner-for-two/
  2. /recipes/herb-roasted-turkey-breast-for-two/
  3. /holidays/christmas-dinner-for-two/
  4. /holidays/fall-date-night-recipes/
- [ ] Confirm `sitemap-index.xml` is listed under Sitemaps

### Before launch / monetization
- [ ] Write the About page story (`src/pages/about.astro`); a photo of you two helps
- [ ] Connect the newsletter form to Kit / Beehiiv / Mailchimp (`src/components/Newsletter.astro`)
- [ ] Review the Privacy page template (`src/pages/privacy.astro`) and add a real contact email
- [ ] Join Amazon Associates, then replace every `#affiliate-link` in the recipes' `gear:` lists
- [ ] 26 recipes reached: apply to Google AdSense once the About page, privacy contact email and more photos are done (paste ad code into `src/components/AdSlot.astro`)
- [ ] Optional: buy a custom domain and update `astro.config.mjs` + `public/robots.txt`
- [ ] Optional: start a Pinterest account and pin the holiday pages

### Spotify
- [x] Every recipe has a "Listen on Spotify" button (searches the playlist's mood label)
- [ ] Create your own Table for Two playlists in Spotify (good for branding and followers)
      and add each link as `spotify:` under `pairing:`; an embedded player then appears on that recipe

### Recipe ideas for next batches
- Valentine's Day (publish by early January so it can rank)
- New Year's Eve menu with champagne
- Budget date nights (under $20)
- Cocktails for two
