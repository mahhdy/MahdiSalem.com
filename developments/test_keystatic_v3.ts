import { collection, fields } from '@keystatic/core';
const c = collection({
  label: 'Test',
  path: 'test/*',
  format: { contentField: 'content' },
  // @ts-ignore
  schema: {
    title: fields.text({ label: 'Title' }),
    content: fields.markdoc({ label: 'Content' }),
  },
});
console.log('Valid');
