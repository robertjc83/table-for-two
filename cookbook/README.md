# Date Night In: the e-cookbook

- **The product:** `cookbook/dist/date-night-in.pdf`. This is the file you sell. It's kept in this private repository
  and is **not** published on the website.
- **Menus:** `cookbook/menus.yaml` holds the 12 date nights (recipes, intro, setting, game plan, conversation starters).
- **Sales page:** `/cookbook/` on the site. The price and buy link are in `src/data/shop.ts`.

## Rebuild the book (after new photos, recipes or menu edits)

```bash
node scripts/make-cookbook.mjs
```

This regenerates the PDF and the preview images on the sales page (`public/cookbook/`).
Recipes are fitted onto one page automatically when possible; very long recipes use two pages.
After rebuilding, upload the new PDF to your store so buyers get the latest version.

## Start selling (about 15 minutes)

1. Create a free account on a digital-product store. **Gumroad**, **Payhip** and **Stan Store** are the simplest.
   Etsy also works and has built-in shoppers, but charges listing and transaction fees.
2. Create a new digital product:
   - Name: *Date Night In: 12 Complete Dinners for Two to Cook Together*
   - Price: $12 (or a $9 launch price)
   - File: upload `date-night-in.pdf`
   - Cover image: `public/cookbook/cover.jpg`; extra images: `public/cookbook/preview-1.jpg` to `preview-3.jpg`
   - Description: reuse the "What's inside" text from the sales page
3. Copy the product's link and paste it into `buyUrl` in `src/data/shop.ts` (or send it to Claude).
   The "Coming soon" buttons become "Get the cookbook" everywhere.
4. Optional: put the price in `salePrice` (e.g. `'$9'`) to show a launch discount.
