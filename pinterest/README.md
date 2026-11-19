# Pinterest

## Files
- `public/pins/*.jpg`: one 1000×1500 pin per recipe that has a photo, plus one collage pin per seasonal page.
  They're live at `https://dinner-for-two-tonight.netlify.app/pins/<name>.jpg`.
- `pins.csv`: title, description, link, image URL, suggested board and keywords for every pin.
  This is a reference sheet, not Pinterest's upload template. To bulk-upload, download the template
  from Pinterest's "Create Pins in bulk" screen and copy these columns into it.

Regenerate after adding or changing photos:

```bash
node scripts/make-pins.mjs
```

## One-time setup
1. Create a free **Pinterest business account** (pinterest.com/business/create) named "Table for Two".
2. **Claim your website** (Settings → Claimed accounts → Websites). Choose the HTML tag option and send the tag to Claude to add to the site.
3. Create these boards:
   - Date Night Dinners for Two
   - Romantic Desserts for Two
   - Date Night Drinks
   - Fall Date Night Recipes
   - Holiday Dinners for Two
4. Recipe pages already include Recipe structured data, which Pinterest uses for rich pins (ingredients and cook time on the pin).

## Pinning routine (the "passive" part)
- Pin 1–3 times a day rather than everything at once. Pinterest's scheduler can queue pins weeks ahead.
- Start with seasonal pins: Thanksgiving and fall now, then Christmas. People search Pinterest 30–60 days before a holiday.
- Every recipe page also has a **Save to Pinterest** button, so visitors can pin for you.
