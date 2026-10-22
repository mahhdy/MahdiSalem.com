const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  '@netlify',
  'edge-functions-dev',
  'dist',
  'node',
  'main.js'
);

try {
  if (fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, 'utf8');
    if (content.includes('"--allow-scripts",')) {
      content = content.replace('"--allow-scripts",', '');
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('[patch-netlify] Successfully patched @netlify/edge-functions-dev (removed --allow-scripts).');
    } else {
      console.log('[patch-netlify] @netlify/edge-functions-dev is already patched or up-to-date.');
    }
  }
} catch (err) {
  console.warn('[patch-netlify] Warning:', err.message);
}
