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
  lang: fields.select({
    label: 'Language',
    options: [{ label: 'Persian (fa)', value: 'fa' }, { label: 'English (en)', value: 'en' }],
    defaultValue: 'fa',
  }),
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
    ],
    defaultValue: 'متوسط',
  }),
  readingTime: fields.number({ label: 'Reading Time (min)' }),
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
  title:       fields.slug({ name: { label: 'Title' } }),
  description: fields.text({ label: 'Description', multiline: true }),
  publishDate: fields.date({ label: 'Publish Date' }),
  ...identityFields,
  ...classificationFields,
  ...visibilityFields,
  ...mediaFields,
  ...arrayFields,
  ...slideFields,
  content: fields.markdoc({ label: 'Content' }),
};

// ─── Config ────────────────────────────────────────────────────────────────

export default config({
  storage: { kind: 'local' },
  collections: {

    articles: collection({
      label: 'Articles / مقالات',
      slugField: 'title',
      path: 'src/content/articles/*/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'lang', 'draft'],
      schema: {
        ...commonFields,
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

    books: collection({
      label: 'Books / کتاب‌ها',
      slugField: 'title',
      path: 'src/content/books/*/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'lang', 'draft'],
      schema: {
        ...commonFields,
        bookSlug:      fields.text({ label: 'Book Slug (parent)' }),
        chapterNumber: fields.number({ label: 'Chapter Number' }),
      },
    }),

    proposals: collection({
      label: 'Proposals / طرح‌ها',
      slugField: 'title',
      path: 'src/content/proposals/*/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'lang', 'draft'],
      schema: { ...commonFields },
    }),

    statements: collection({
      label: 'Statements / بیانیه‌ها',
      slugField: 'title',
      path: 'src/content/statements/*/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'lang', 'draft'],
      schema: {
        ...commonFields,
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Statement', value: 'statement' },
            { label: 'Press',     value: 'press' },
            { label: 'Position',  value: 'position' },
          ],
          defaultValue: 'statement',
        }),
      },
    }),

    // ─── Multimedia: 3 dedicated collections with templates ───────────────────

    videos: collection({
      label: '🎬 Videos / ویدئو',
      slugField: 'title',
      path: 'src/content/multimedia/videos/*/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      template: 'src/templates/video-template',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFields,
        // ── Video Specific Fields ──
        type: fields.select({
          label: 'Type',
          options: [{ label: 'Video', value: 'video' }],
          defaultValue: 'video',
        }),
        mediaUrl:     fields.text({ label: '🔗 Media URL (YouTube/Vimeo/direct)' }),
        platform: fields.select({
          label: 'Platform',
          options: [
            { label: 'YouTube',     value: 'youtube' },
            { label: 'Vimeo',       value: 'vimeo' },
            { label: 'Self-hosted', value: 'self-hosted' },
          ],
          defaultValue: 'youtube',
        }),
        thumbnailUrl: fields.text({ label: 'Thumbnail URL' }),
        duration:     fields.number({ label: 'Duration (seconds)' }),
      },
    }),

    audio: collection({
      label: '🎵 Audio / صوتی',
      slugField: 'title',
      path: 'src/content/multimedia/audio/*/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      template: 'src/templates/audio-template',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFields,
        // ── Audio Specific Fields ──
        type: fields.select({
          label: 'Type',
          options: [{ label: 'Audio', value: 'audio' }],
          defaultValue: 'audio',
        }),
        mediaUrl: fields.text({ label: '🔗 Audio File URL (mp3 / direct link)' }),
        platform: fields.select({
          label: 'Platform',
          options: [
            { label: 'Self-hosted', value: 'self-hosted' },
            { label: 'Soundcloud',  value: 'soundcloud' },
          ],
          defaultValue: 'self-hosted',
        }),
        duration: fields.number({ label: 'Duration (seconds)' }),
      },
    }),

    podcasts: collection({
      label: '🎙️ Podcasts / پادکست',
      slugField: 'title',
      path: 'src/content/multimedia/podcasts/*/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      template: 'src/templates/podcast-template',
      columns: ['title', 'publishDate', 'draft'],
      schema: {
        ...commonFields,
        // ── Podcast Specific Fields ──
        type: fields.select({
          label: 'Type',
          options: [{ label: 'Podcast', value: 'podcast' }],
          defaultValue: 'podcast',
        }),
        mediaUrl:      fields.text({ label: '🔗 Audio File URL (mp3 / Podbean link)' }),
        platform: fields.select({
          label: 'Platform',
          options: [
            { label: 'Self-hosted', value: 'self-hosted' },
            { label: 'Soundcloud',  value: 'soundcloud' },
          ],
          defaultValue: 'self-hosted',
        }),
        podcastName:   fields.text({ label: 'Podcast Name / نام پادکست' }),
        episodeNumber: fields.number({ label: 'Episode Number' }),
        seasonNumber:  fields.number({ label: 'Season Number' }),
        duration:      fields.number({ label: 'Duration (seconds)' }),
      },
    }),

    dialogues: collection({
      label: 'Dialogues / گفتگوها',
      slugField: 'title',
      path: 'src/content/dialogues/*/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishDate', 'lang', 'draft'],
      schema: {
        ...commonFields,
        participants: fields.array(fields.text({ label: 'Participant' }), {
          label: 'Participants',
          itemLabel: props => props.value,
        }),
      },
    }),

    wiki: collection({
      label: 'Wiki / دانشنامه',
      slugField: 'title',
      path: 'src/content/wiki/*/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'lang', 'draft'],
      schema: {
        ...commonFields,
        section: fields.text({ label: 'Section' }),
        order:   fields.number({ label: 'Order', defaultValue: 0 }),
      },
    }),

  },
});
