import { config, fields, collection } from '@keystatic/core';

const commonFields = {
  title: fields.slug({ name: { label: 'Title' } }),
  description: fields.text({ label: 'Description', multiline: true }),
  lang: fields.select({ 
    label: 'Language', 
    options: [{ label: 'Persian', value: 'fa' }, { label: 'English', value: 'en' }], 
    defaultValue: 'fa' 
  }),
  publishDate: fields.date({ label: 'Publish Date' }),
  author: fields.text({ label: 'Author', defaultValue: 'مهدی سالم' }),
  draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
  hidden: fields.checkbox({ label: 'Hidden', defaultValue: false }),
  showInContents: fields.checkbox({ label: 'Show in Contents', defaultValue: true }),
  imageDisplay: fields.select({
    label: 'Image Display',
    options: [
      { label: 'Full', value: 'full' },
      { label: 'Side', value: 'side' },
      { label: 'Thumbnail', value: 'thumbnail' },
      { label: 'Hidden', value: 'hidden' }
    ],
    defaultValue: 'full'
  }),
  cardImage: fields.select({
    label: 'Card Image',
    options: [
      { label: 'Show', value: 'show' },
      { label: 'Hidden', value: 'hidden' }
    ],
    defaultValue: 'show'
  }),
  coverImage: fields.image({ 
    label: 'Cover Image', 
    directory: 'public/images/articles', 
    publicPath: '/images/articles' 
  }),
  category: fields.text({ label: 'Category' }),
  tags: fields.array(fields.text({ label: 'Tag' }), {
    label: 'Tags',
    itemLabel: props => props.value
  }),
  pdfUrl: fields.text({ label: 'PDF URL' }),
  hasSlide: fields.checkbox({ label: 'Has Slide', defaultValue: false }),
  slideArray: fields.array(fields.text({ label: 'Slide Image URL' }), {
    label: 'Slide Array',
    itemLabel: props => props.value
  }),
  slideAlbums: fields.array(
    fields.object({
      title: fields.text({ label: 'Album Title' }),
      slides: fields.array(fields.text({ label: 'Slide Image URL' }), {
        label: 'Slides',
        itemLabel: props => props.value
      })
    }),
    {
      label: 'Slide Albums',
      itemLabel: props => props.fields.title.value
    }
  ),
  content: fields.markdoc({
    label: 'Content',
    extension: 'mdx'
  }),
};

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    articles: collection({
      label: 'Articles / مقالات',
      slugField: 'title',
      path: 'src/content/articles/*/*',
      format: { contentField: 'content' },
      schema: {
        ...commonFields,
        type: fields.select({ 
          label: 'Article Type', 
          options: [{ label: 'Statement', value: 'statement' }, { label: 'Press', value: 'press' }, { label: 'Position', value: 'position' }], 
          defaultValue: 'statement' 
        }),
      },
    }),
    books: collection({
      label: 'Books / کتاب‌ها',
      slugField: 'title',
      path: 'src/content/books/*/*',
      format: { contentField: 'content' },
      schema: {
        ...commonFields,
        bookSlug: fields.text({ label: 'Book Slug (for chapters)' }),
        chapterNumber: fields.number({ label: 'Chapter Number' }),
      },
    }),
    proposals: collection({
      label: 'Proposals / طرح‌ها',
      slugField: 'title',
      path: 'src/content/proposals/*/*',
      format: { contentField: 'content' },
      schema: {
        ...commonFields,
      },
    }),
    statements: collection({
      label: 'Statements / بیانیه‌ها',
      slugField: 'title',
      path: 'src/content/statements/*/*',
      format: { contentField: 'content' },
      schema: {
        ...commonFields,
        type: fields.select({ 
          label: 'Type', 
          options: [{ label: 'Statement', value: 'statement' }, { label: 'Press', value: 'press' }, { label: 'Position', value: 'position' }], 
          defaultValue: 'statement' 
        }),
      },
    }),
    multimedia: collection({
      label: 'Multimedia / چندرسانه‌ای',
      slugField: 'title',
      path: 'src/content/multimedia/*/*',
      format: { contentField: 'content' },
      schema: {
        ...commonFields,
        type: fields.select({ 
          label: 'Media Type', 
          options: [{ label: 'Video', value: 'video' }, { label: 'Audio', value: 'audio' }, { label: 'Podcast', value: 'podcast' }], 
          defaultValue: 'video' 
        }),
        mediaUrl: fields.text({ label: 'Media URL (required)' }),
        thumbnailUrl: fields.text({ label: 'Thumbnail URL' }),
        duration: fields.number({ label: 'Duration (seconds)' }),
        platform: fields.select({ 
          label: 'Platform', 
          options: [{ label: 'YouTube', value: 'youtube' }, { label: 'Vimeo', value: 'vimeo' }, { label: 'Soundcloud', value: 'soundcloud' }, { label: 'Self-hosted', value: 'self-hosted' }] 
        }),
        podcastName: fields.text({ label: 'Podcast Name' }),
      },
    }),
    dialogues: collection({
      label: 'Dialogues / گفتگوها',
      slugField: 'title',
      path: 'src/content/dialogues/*/*',
      format: { contentField: 'content' },
      schema: {
        ...commonFields,
        participants: fields.array(fields.text({ label: 'Participant' }), {
          label: 'Participants',
          itemLabel: props => props.value
        }),
      },
    }),
    wiki: collection({
      label: 'Wiki / دانشنامه',
      slugField: 'title',
      path: 'src/content/wiki/*/*',
      format: { contentField: 'content' },
      schema: {
        ...commonFields,
        section: fields.text({ label: 'Section' }),
        order: fields.number({ label: 'Order', defaultValue: 0 }),
      },
    }),
  },
});
