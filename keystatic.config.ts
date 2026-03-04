import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    articles: collection({
      label: 'Articles / مقالات',
      slugField: 'title',
      path: 'src/content/articles/fa/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        coverImage: fields.image({ label: 'Cover Image', directory: 'public/images/articles', publicPath: '/images/articles' }),
        lang: fields.text({ label: 'Language', defaultValue: 'fa' }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        publishDate: fields.date({ label: 'Publish Date' }),
        content: fields.markdoc({
          label: 'Content',
        }),
      },
    }),
  },
});
