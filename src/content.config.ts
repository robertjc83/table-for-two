import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    // Optional photo: put the file in src/content/recipes/images/ and reference it as ./images/name.jpg
    image: image().optional(),
    imageAlt: z.string().optional(),
    description: z.string(),
    emoji: z.string(),
    color: z.string().default('#ff6b6b'),
    vibe: z.enum(['Cozy', 'Fancy', 'Adventurous', 'Playful']),
    course: z.enum(['Main', 'Side', 'Dessert', 'Starter', 'Drink', 'Full Menu']),
    // Holiday collections this recipe belongs to (see src/data/holidays.ts)
    occasions: z.array(z.enum(['thanksgiving', 'christmas', 'fall'])).default([]),
    cuisine: z.string(),
    diet: z.array(z.string()).default([]),
    difficulty: z.enum(['Easy', 'Medium', 'Ambitious']),
    prepMinutes: z.number(),
    cookMinutes: z.number(),
    servings: z.number().default(2),
    published: z.coerce.date(),
    ingredients: z.array(z.object({
      qty: z.number().optional(),
      unit: z.string().optional(),
      item: z.string(),
    })),
    steps: z.array(z.object({
      who: z.enum(['both', 'chef1', 'chef2']),
      text: z.string(),
    })),
    pairing: z.object({
      drink: z.string(),
      playlist: z.string(),
      mood: z.string(),
      // Optional Spotify playlist/album link (copy it from Spotify: Share → Copy link).
      // When set, an embedded player appears on the recipe page.
      spotify: z.string().regex(/^https:\/\/open\.spotify\.com\/(intl-[a-z-]+\/)?(playlist|album)\/[A-Za-z0-9]+/, 'Must be an open.spotify.com playlist or album link').optional(),
    }),
    // Optional `url`: a specific product link. Without one, the item links to an Amazon search once AMAZON.tag is set.
    gear: z.array(z.object({ name: z.string(), url: z.string().url().optional() })).default([]),
  }),
});

export const collections = { recipes };
