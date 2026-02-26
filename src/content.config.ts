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
    imageDisplay: z.enum(['full', 'side', 'thumbnail', 'hidden']).default('full'), // How cover image is displayed on the detail page
    cardImage: z.enum(['show', 'hidden']).default('show'), // Whether cover image is shown in card/list views
    pdfUrl: z.string().optional(),
    showPdfViewer: z.boolean().default(false),
    pdfOnly: z.boolean().default(false),
    hasSlide: z.boolean().default(false),
    slideArray: z.array(z.string()).nullable().optional(),
    publishDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    category: z.union([z.string(), z.array(z.string())]).optional(),
    categories: z.array(z.string()).optional(),
    subject: z.union([z.string(), z.array(z.string())]).optional(),
    interface: z.string().optional(), // Category taxonomy field
    tags: z.array(z.string()).default([]),
    'show-header': z.boolean().default(false),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false), // If true, content is not shown unless ?force=true in URL
    showInContents: z.boolean().default(true), // Control visibility in All Contents page
    order: z.number().default(0),
    // For chapters within a book
    bookSlug: z.string().optional(),
    chapterNumber: z.number().optional(),
    // Extra metadata fields (tolerated from content files)
    sourceType: z.string().optional(),
    book: z.string().optional(),
    authorTitle: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    location: z.string().optional(),
    date: z.coerce.date().optional(),
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
    category: z.union([z.string(), z.array(z.string())]).optional(),
    categories: z.array(z.string()).default([]),
    subject: z.union([z.string(), z.array(z.string())]).optional(),
    interface: z.string().optional(), // Category taxonomy field
    tags: z.array(z.string()).default([]),
    'show-header': z.boolean().default(false),
    coverImage: z.string().optional(),
    imageDisplay: z.enum(['full', 'side', 'thumbnail', 'hidden']).default('full'), // How cover image is displayed on the detail page
    cardImage: z.enum(['show', 'hidden']).default('show'), // Whether cover image is shown in card/list views
    pdfUrl: z.string().optional(),
    pdfOnly: z.boolean().default(false),
    hasSlide: z.boolean().default(false),
    slideArray: z.array(z.string()).nullable().optional(),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false), // If true, content is not shown unless ?force=true in URL
    showInContents: z.boolean().default(true), // Control visibility in All Contents page
    // Extra metadata fields (tolerated from content files)
    sourceType: z.string().optional(),
    authorTitle: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    location: z.string().optional(),
    date: z.coerce.date().optional(),
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
    category: z.union([z.string(), z.array(z.string())]).optional(),
    categories: z.array(z.string()).optional(),
    subject: z.union([z.string(), z.array(z.string())]).optional(),
    interface: z.string().optional(), // Category taxonomy field
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    imageDisplay: z.enum(['full', 'side', 'thumbnail', 'hidden']).default('full'), // How cover image is displayed on the detail page
    cardImage: z.enum(['show', 'hidden']).default('show'), // Whether cover image is shown in card/list views
    pdfUrl: z.string().optional(),
    pdfOnly: z.boolean().default(false),
    hasSlide: z.boolean().default(false),
    slideArray: z.array(z.string()).nullable().optional(),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false), // If true, content is not shown unless ?force=true in URL
    showInContents: z.boolean().default(true), // Control visibility in All Contents page
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
    subject: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    imageDisplay: z.enum(['full', 'side', 'thumbnail', 'hidden']).default('full'), // How cover image is displayed on the detail page
    cardImage: z.enum(['show', 'hidden']).default('show'), // Whether cover image is shown in card/list views
    lastUpdated: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false), // If true, content is not shown unless ?force=true in URL
    hasSlide: z.boolean().default(false),
    slideArray: z.array(z.string()).nullable().optional(),
    showInContents: z.boolean().default(true), // Control visibility in All Contents page
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
    category: z.union([z.string(), z.array(z.string())]).optional(),
    categories: z.array(z.string()).default([]),
    subject: z.union([z.string(), z.array(z.string())]).optional(),
    interface: z.string().optional(), // Category taxonomy field
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    imageDisplay: z.enum(['full', 'side', 'thumbnail', 'hidden']).default('side'), // Default to 'side' for multimedia — focus on the media player
    cardImage: z.enum(['show', 'hidden']).default('show'), // Whether cover image is shown in card/list views
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false), // If true, content is not shown unless ?force=true in URL
    hasSlide: z.boolean().default(false),
    slideArray: z.array(z.string()).nullable().optional(),
    showInContents: z.boolean().default(true), // Control visibility in All Contents page
  }),
});

const dialogues = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/dialogues' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(['fa', 'en']),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    participants: z.array(z.string()).default(['مهدی سالم']),
    category: z.union([z.string(), z.array(z.string())]).optional(),
    categories: z.array(z.string()).default([]),
    subject: z.union([z.string(), z.array(z.string())]).optional(),
    interface: z.string().optional(), // Category taxonomy field
    tags: z.array(z.string()).default([]),
    'show-header': z.boolean().default(false),
    coverImage: z.string().optional(),
    imageDisplay: z.enum(['full', 'side', 'thumbnail', 'hidden']).default('full'), // How cover image is displayed on the detail page
    cardImage: z.enum(['show', 'hidden']).default('show'), // Whether cover image is shown in card/list views
    pdfUrl: z.string().optional(),
    pdfOnly: z.boolean().default(false),
    hasSlide: z.boolean().default(false),
    slideArray: z.array(z.string()).nullable().optional(),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false), // If true, content is not shown unless ?force=true in URL
    showInContents: z.boolean().default(true), // Control visibility in All Contents page
    // Extra metadata fields (tolerated from content files)
    sourceType: z.string().optional(),
    authorTitle: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    location: z.string().optional(),
    date: z.coerce.date().optional(),
  }),
});

export const collections = { books, articles, statements, wiki, multimedia, dialogues };
