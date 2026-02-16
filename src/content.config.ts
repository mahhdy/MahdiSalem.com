import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const books = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('مهدی سالم'),
    lang: z.enum(['fa', 'en']),
    coverImage: z.string().optional(),
    pdfUrl: z.string().optional(),
    showPdfViewer: z.boolean().default(false),
    publishDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    order: z.number().default(0),
    // For chapters within a book
    bookSlug: z.string().optional(),
    chapterNumber: z.number().optional(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(['fa', 'en']),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    type: z.enum(['statement', 'press', 'position']).default('statement'),
    author: z.string().default('مهدی سالم'),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const statements = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/statements' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(['fa', 'en']),
    publishDate: z.coerce.date(),
    type: z.enum(['statement', 'press', 'position']).default('statement'),
    draft: z.boolean().default(false),
  }),
});

const wiki = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/wiki' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(['fa', 'en']),
    section: z.string().optional(),
    order: z.number().default(0),
    lastUpdated: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const multimedia = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/multimedia' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(['fa', 'en']),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),

    // Media Type
    type: z.enum(['video', 'audio', 'podcast']),

    // Media URLs
    mediaUrl: z.string(),  // Main media file/embed URL
    thumbnailUrl: z.string().optional(),

    // Media Metadata
    duration: z.number().optional(),  // Duration in seconds
    platform: z.enum(['youtube', 'vimeo', 'soundcloud', 'self-hosted']).optional(),

    // Podcast-specific
    episodeNumber: z.number().optional(),
    seasonNumber: z.number().optional(),
    podcastName: z.string().optional(),

    // Standard fields
    author: z.string().default('مهدی سالم'),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { books, articles, statements, wiki, multimedia };
