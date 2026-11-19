# Table for Two: date night recipes for couples

A fast, SEO-friendly recipe site built with [Astro](https://astro.build).

## Run it

```bash
npm install
npm run dev       # local site at http://localhost:4321
npm run build     # production build in dist/
```

## Add a recipe

Copy any file in `src/content/recipes/` and edit it. The filename becomes the URL
(`my-recipe.md` → `/recipes/my-recipe/`). Each step has `who: chef1 | chef2 | both`.
The build fails with a clear message if a field is missing or misspelled.

## Add a Spotify player to a recipe

Every recipe already has a "Listen on Spotify" button that searches Spotify for its playlist mood.
To show an embedded player instead, open the playlist in Spotify, choose **Share → Copy link to playlist**,
and add it under `pairing:` in the recipe file:

```yaml
pairing:
  drink: "..."
  playlist: "Low-lit jazz: Chet Baker, Norah Jones"
  spotify: "https://open.spotify.com/playlist/XXXXXXXXXXXX"
  mood: "..."
```

Playlist and album links both work. The build stops with a clear message if the link isn't from open.spotify.com.

## Before launch checklist

- [ ] Buy a domain and if you buy a custom domain, update it in `astro.config.mjs` and `public/robots.txt`
- [ ] Deploy (free): push to GitHub, then import into Netlify / Vercel / Cloudflare Pages (build `npm run build`, output `dist`)
- [ ] Add real food photos and an `image` field to the Recipe JSON-LD (`src/pages/recipes/[slug].astro`)
- [ ] Connect the newsletter form (`src/components/Newsletter.astro`) to Kit / Beehiiv / Mailchimp
- [ ] Write your story on `/about` and review `/privacy`
- [ ] Submit the sitemap (`/sitemap-index.xml`) in Google Search Console

## Making money

1. **Affiliate links:** replace each `#affiliate-link` in the recipes' `gear:` lists with your Amazon Associates links.
2. **Display ads:** after ~20–30 recipes and some traffic, apply to Google AdSense, then Mediavine/Raptive once you qualify.
   Paste their code into `src/components/AdSlot.astro` (the slots are already placed).
3. **Email list → digital products:** e.g. a "12 Date Nights" e-cookbook or a monthly menu subscription.
