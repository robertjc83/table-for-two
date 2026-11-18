import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    emoji: z.string(),
    color: z.string().default('#ff6b6b'),
    vibe: z.enum(['Cozy', 'Fancy', 'Adventurous', 'Playful']),
    course: z.enum(['Main', 'Dessert', 'Starter', 'Full Menu']),
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
    }),
    gear: z.array(z.object({ name: z.string(), url: z.string() })).default([]),
  }),
});

export const collections = { recipes };
