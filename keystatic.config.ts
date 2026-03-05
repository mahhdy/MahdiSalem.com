import { config, fields, collection } from '@keystatic/core';

// ─── Field Groups ──────────────────────────────────────────────────────────

/** Identity & Attribution */
const identityFields = {
  author:      fields.text({ label: 'Author', defaultValue: 'مهدی سالم' }),
  authorTitle: fields.text({ label: 'Author Title' }),
  email:       fields.text({ label: 'Email' }),
  website:     fields.text({ label: 'Website' }),
  location:    fields.text({ label: 'Location' }),
};

/** Classification & Taxonomy */
const classificationFields = {
  sourceType: fields.text({ label: 'Source Type' }),
  interface:  fields.text({ label: 'Interface Taxonomy' }),
  category:   fields.text({ label: 'Category' }),
  book:       fields.text({ label: 'Related Book Slug' }),
  difficulty: fields.select({
    label: 'Difficulty',
    options: [
      { label: 'Beginner / مبتدی',        value: 'مبتدی' },
      { label: 'Intermediate / متوسط',    value: 'متوسط' },
      { label: 'Advanced / پیشرفته',      value: 'پیشرفته' },
      { label: 'High / زیاد',             value: 'زیاد' },
    ],
    defaultValue: 'متوسط',
  }),
  readingTime: fields.number({ label: 'Reading Time (min)' }),
  aiRole: fields.select({
    label: '🤖 AI Contribution',
    description: 'Level of AI involvement in producing this content',
    options: [
      { label: '✍️ Human Only — No AI at all',                    value: 'human' },
      { label: '🎨 AI-Enhanced Visuals — AI for graphics only',   value: 'ai-visual' },
      { label: '✨ AI-Polished — AI for editing & grammar',        value: 'ai-polish' },
      { label: '🤝 AI-Assisted — AI helped research & gather data', value: 'ai-assisted' },
      { label: '💡 AI-Extended — AI expanded the author\'s ideas', value: 'ai-extended' },
      { label: '🔍 AI Under Supervision — AI-written, human-reviewed', value: 'ai-supervised' },
      { label: '🤖 AI-Generated — Fully AI, no human review',     value: 'ai-generated' },
    ],
    defaultValue: 'human',
  }),
};

/** Visibility Toggles */
const visibilityFields = {
  draft:         fields.checkbox({ label: 'Draft',            defaultValue: false }),
  hidden:        fields.checkbox({ label: 'Hidden',           defaultValue: false }),
  showInContents: fields.checkbox({ label: 'Show in Contents', defaultValue: true }),
  pdfOnly:        fields.checkbox({ label: 'PDF Only',         defaultValue: false }),
  showPdfViewer:  fields.checkbox({ label: 'Show PDF Viewer',  defaultValue: false }),
  hasSlide:       fields.checkbox({ label: 'Has Slide',        defaultValue: false }),
  showheader:     fields.checkbox({ label: 'Show Header',      defaultValue: false }),
};

/** Presentation & Media */
const mediaFields = {
  coverImage: fields.image({
    label: 'Cover Image',
    directory: 'public/images/articles',
    publicPath: '/images/articles',
  }),
  imageDisplay: fields.select({
    label: 'Image Display',
    options: [
      { label: 'Full',      value: 'full' },
      { label: 'Side',      value: 'side' },
      { label: 'Thumbnail', value: 'thumbnail' },
      { label: 'Hidden',    value: 'hidden' },
    ],
    defaultValue: 'full',
  }),
  cardImage: fields.select({
    label: 'Card Image',
    options: [{ label: 'Show', value: 'show' }, { label: 'Hidden', value: 'hidden' }],
    defaultValue: 'show',
  }),
  pdfUrl: fields.text({ label: 'PDF URL' }),
};

/** Array / List Fields */
const arrayFields = {
  tags: fields.array(fields.text({ label: 'Tag' }), {
    label: 'Tags',
    itemLabel: props => props.value,
  }),
  keywords: fields.array(fields.text({ label: 'Keyword' }), {
    label: 'Keywords',
    itemLabel: props => props.value,
  }),
  categories: fields.array(fields.text({ label: 'Category' }), {
    label: 'Categories',
    itemLabel: props => props.value,
  }),
};

/** Slide Fields */
const slideFields = {
  slideArray: fields.array(fields.text({ label: 'Slide Image URL' }), {
    label: 'Slide Array (legacy)',
    itemLabel: props => props.value,
  }),
  slideAlbums: fields.array(
    fields.object({
      title:  fields.text({ label: 'Album Title' }),
      slides: fields.array(fields.text({ label: 'Slide Image URL' }), {
        label: 'Slides',
        itemLabel: props => props.value,
      }),
    }),
    {
      label: 'Slide Albums',
      itemLabel: props => props.fields.title.value || 'Album',
    }
  ),
};

/** Core content shared by all collections */
const commonFields = {
  title:       fields.text({ label: 'Title' }),
  slug:        fields.text({ label: 'Identifier (English/Slug)', description: 'MUST match the English filename for the URL to work.', validation: { isRequired: true } }),
  description: fields.text({ label: 'Description', multiline: true }),
  publishDate: fields.date({ label: 'Publish Date' }),
  ...identityFields,
  ...classificationFields,
  ...visibilityFields,
  ...mediaFields,
  ...arrayFields,
  ...slideFields,
  content: fields.mdx({ label: 'Content' }),
};

/** Specialized fields for specific languages if needed */
const commonFieldsFA = {
  ...commonFields,
  lang: fields.text({ label: 'Language', defaultValue: 'fa', validation: { isRequired: true } }),
};

const commonFieldsEN = {
  ...commonFields,
  lang: fields.text({ label: 'Language', defaultValue: 'en', validation: { isRequired: true } }),
};

// ─── Config ────────────────────────────────────────────────────────────────

export default config({
  storage: { kind: 'local' },
  
  ui: {
    brand: { name: 'MS Admin' },
    navigation: {
      'Stats': ['statistics'],
      '🌐 View Website': [],
      '🇮🇷 PERSIAN (FA)': [
        'articles_fa',
        'videos_fa',
        'audio_fa',
        'podcasts_fa',
        'books_fa',
        'dialogues_fa',
        'proposals_fa',
        'statements_fa',
        'wiki_fa'
      ],
      'ENGLISH (EN)': [
        'articles_en',
        'videos_en',
        'audio_en',
        'podcasts_en',
        'books_en',
        'dialogues_en',
        'proposals_en',
        'statements_en',
        'wiki_en'
      ],
    }
  },
  singletons: {
    statistics: {
      label: '📈 Statistics & Matrix',
      path: 'src/content/statistics',
      schema: {
        totalArticles: fields.integer({ label: 'Total Articles', defaultValue: 0 }),
        lastUpdate:    fields.date({ label: 'Last Build/Update' }),
        notes:         fields.text({ label: 'Growth Notes', multiline: true }),
      },
    },
  },

  collections: {

    // --- ARITICLES ---
    articles_fa: collection({
      slugField: 'slug',
      label: 'Articles / مقالات',
      path: 'src/content/articles/fa/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsFA,
        type: fields.select({
          label: 'Article Type',
          options: [
            { label: 'Statement', value: 'statement' },
            { label: 'Press',     value: 'press' },
            { label: 'Position',  value: 'position' },
          ],
          defaultValue: 'statement',
        }),
      },
    }),
    articles_en: collection({
      slugField: 'slug',
      label: 'Articles / مقالات (EN)',
      path: 'src/content/articles/en/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsEN,
        type: fields.select({
          label: 'Article Type',
          options: [
            { label: 'Statement', value: 'statement' },
            { label: 'Press',     value: 'press' },
            { label: 'Position',  value: 'position' },
          ],
          defaultValue: 'statement',
        }),
      },
    }),

    // --- VIDEOS ---
    videos_fa: collection({
      slugField: 'slug',
      label: '🎬 Videos / ویدئو',
      path: 'src/content/multimedia/videos/fa/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      template: 'src/templates/video-template',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsFA,
        type: fields.select({
          label: 'Type',
          options: [{ label: 'Video', value: 'video' }],
          defaultValue: 'video',
        }),
        mediaUrl: fields.text({ label: '🔗 Media URL' }),
        platform: fields.select({
          label: 'Platform',
          options: [{ label: 'YouTube', value: 'youtube' }, { label: 'Vimeo', value: 'vimeo' }, { label: 'Self', value: 'self-hosted' }],
          defaultValue: 'youtube',
        }),
        thumbnailUrl: fields.text({ label: 'Thumbnail URL' }),
        duration: fields.number({ label: 'Duration (s)' }),
      },
    }),
    videos_en: collection({
      slugField: 'slug',
      label: '🎬 Videos (EN)',
      path: 'src/content/multimedia/videos/en/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      template: 'src/templates/video-template',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsEN,
        type: fields.select({
          label: 'Type',
          options: [{ label: 'Video', value: 'video' }],
          defaultValue: 'video',
        }),
        mediaUrl: fields.text({ label: '🔗 Media URL' }),
        platform: fields.select({
          label: 'Platform',
          options: [{ label: 'YouTube', value: 'youtube' }, { label: 'Vimeo', value: 'vimeo' }, { label: 'Self', value: 'self-hosted' }],
          defaultValue: 'youtube',
        }),
        thumbnailUrl: fields.text({ label: 'Thumbnail URL' }),
        duration: fields.number({ label: 'Duration (s)' }),
      },
    }),

    // --- AUDIO ---
    audio_fa: collection({
      slugField: 'slug',
      label: '🎵 Audio / صوتی',
      path: 'src/content/multimedia/audio/fa/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      template: 'src/templates/audio-template',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsFA,
        type: fields.select({ label: 'Type', options: [{ label: 'Audio', value: 'audio' }], defaultValue: 'audio' }),
        mediaUrl: fields.text({ label: '🔗 Audio URL' }),
        platform: fields.select({ label: 'Platform', options: [{ label: 'Self', value: 'self-hosted' }, { label: 'SC', value: 'soundcloud' }], defaultValue: 'self-hosted' }),
        duration: fields.number({ label: 'Duration (s)' }),
      },
    }),
    audio_en: collection({
      slugField: 'slug',
      label: '🎵 Audio (EN)',
      path: 'src/content/multimedia/audio/en/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      template: 'src/templates/audio-template',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsEN,
        type: fields.select({ label: 'Type', options: [{ label: 'Audio', value: 'audio' }], defaultValue: 'audio' }),
        mediaUrl: fields.text({ label: '🔗 Audio URL' }),
        platform: fields.select({ label: 'Platform', options: [{ label: 'Self', value: 'self-hosted' }, { label: 'SC', value: 'soundcloud' }], defaultValue: 'self-hosted' }),
        duration: fields.number({ label: 'Duration (s)' }),
      },
    }),

    // --- PODCASTS ---
    podcasts_fa: collection({
      slugField: 'slug',
      label: '🎙️ Podcasts / پادکست',
      path: 'src/content/multimedia/podcasts/fa/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      template: 'src/templates/podcast-template',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsFA,
        type: fields.select({ label: 'Type', options: [{ label: 'Podcast', value: 'podcast' }], defaultValue: 'podcast' }),
        mediaUrl: fields.text({ label: '🔗 Podbean URL' }),
        platform: fields.select({ label: 'Platform', options: [{ label: 'Self', value: 'self-hosted' }], defaultValue: 'self-hosted' }),
        podcastName: fields.text({ label: 'Name' }),
        episodeNumber: fields.number({ label: 'Episode' }),
        seasonNumber: fields.number({ label: 'Season' }),
        duration: fields.number({ label: 'Duration' }),
      },
    }),
    podcasts_en: collection({
      slugField: 'slug',
      label: '🎙️ Podcasts (EN)',
      path: 'src/content/multimedia/podcasts/en/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      template: 'src/templates/podcast-template',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsEN,
        type: fields.select({ label: 'Type', options: [{ label: 'Podcast', value: 'podcast' }], defaultValue: 'podcast' }),
        mediaUrl: fields.text({ label: '🔗 Podbean URL' }),
        platform: fields.select({ label: 'Platform', options: [{ label: 'Self', value: 'self-hosted' }], defaultValue: 'self-hosted' }),
        podcastName: fields.text({ label: 'Name' }),
        episodeNumber: fields.number({ label: 'Episode' }),
        seasonNumber: fields.number({ label: 'Season' }),
        duration: fields.number({ label: 'Duration' }),
      },
    }),

    // --- BOOKS ---
    books_fa: collection({
      slugField: 'slug',
      label: 'Books / کتاب‌ها',
      path: 'src/content/books/fa/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsFA,
        bookSlug: fields.text({ label: 'Parent Slug' }),
        chapterNumber: fields.number({ label: 'Chapter' }),
      },
    }),
    books_en: collection({
      slugField: 'slug',
      label: 'Books (EN)',
      path: 'src/content/books/en/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsEN,
        bookSlug: fields.text({ label: 'Parent Slug' }),
        chapterNumber: fields.number({ label: 'Chapter' }),
      },
    }),

    // --- DIALOGUES ---
    dialogues_fa: collection({
      slugField: 'slug',
      label: 'Dialogues / گفتگوها',
      path: 'src/content/dialogues/fa/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsFA,
        participants: fields.array(fields.text({ label: 'Participant' }), { label: 'Participants', itemLabel: p => p.value }),
      },
    }),
    dialogues_en: collection({
      slugField: 'slug',
      label: 'Dialogues (EN)',
      path: 'src/content/dialogues/en/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsEN,
        participants: fields.array(fields.text({ label: 'Participant' }), { label: 'Participants', itemLabel: p => p.value }),
      },
    }),

    // --- PROPOSALS ---
    proposals_fa: collection({
      slugField: 'slug',
      label: 'Proposals / طرح‌ها',
      path: 'src/content/proposals/fa/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: { ...commonFieldsFA },
    }),
    proposals_en: collection({
      slugField: 'slug',
      label: 'Proposals (EN)',
      path: 'src/content/proposals/en/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: { ...commonFieldsEN },
    }),

    // --- STATEMENTS ---
    statements_fa: collection({
      slugField: 'slug',
      label: 'Statements / بیانیه‌ها',
      path: 'src/content/statements/fa/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsFA,
        type: fields.select({ label: 'Type', options: [{ label: 'Statement', value: 'statement' }, { label: 'Press', value: 'press' }, { label: 'Position', value: 'position' }], defaultValue: 'statement' }),
      },
    }),
    statements_en: collection({
      slugField: 'slug',
      label: 'Statements (EN)',
      path: 'src/content/statements/en/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFieldsEN,
        type: fields.select({ label: 'Type', options: [{ label: 'Statement', value: 'statement' }, { label: 'Press', value: 'press' }, { label: 'Position', value: 'position' }], defaultValue: 'statement' }),
      },
    }),

    // --- WIKI ---
    wiki_fa: collection({
      slugField: 'slug',
      label: 'Wiki / دانشنامه',
      path: 'src/content/wiki/fa/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'draft'],
      schema: {
        ...commonFieldsFA,
        section: fields.text({ label: 'Section' }),
        order:   fields.number({ label: 'Order', defaultValue: 0 }),
      },
    }),
    wiki_en: collection({
      slugField: 'slug',
      label: 'Wiki (EN)',
      path: 'src/content/wiki/en/**',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'draft'],
      schema: {
        ...commonFieldsEN,
        section: fields.text({ label: 'Section' }),
        order:   fields.number({ label: 'Order', defaultValue: 0 }),
      },
    }),

  },
});
