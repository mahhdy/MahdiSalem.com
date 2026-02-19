/**
 * Image Optimizer - برای Astro Image Component
 * پشتیبانی WebP، AVIF، responsive sizing
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class ImageOptimizer {
  constructor(options = {}) {
    this.publicDir = options.publicDir || 'public/images';
    this.extractedDir = path.join(this.publicDir, 'extracted');
    this.optimizedDir = path.join(this.publicDir, 'optimized');
    this.srcsetBreakpoints = options.breakpoints || [320, 640, 1024, 1536];
  }

  /**
   * Generate hash for image deduplication
   */
  generateImageHash(imagePath) {
    const content = require('fs').readFileSync(imagePath);
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 12);
  }

  /**
   * Parse image reference from content
   * Supports: ![alt](path), <img src="path">, HTML img tags
   */
  extractImages(content) {
    const images = [];

    // Pattern ۱: Markdown images
    const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownRegex.exec(content)) !== null) {
      images.push({
        alt: match[1] || 'تصویر',
        src: match[2],
        type: 'markdown',
        fullMatch: match[0],
      });
    }

    // Pattern ۲: HTML img tags
    const htmlRegex = /<img\s+(?:[^>]*?\s+)?src=["']([^"']+)["'](?:[^>]*?\s+)?alt=["']([^"']*)["']/g;
    while ((match = htmlRegex.exec(content)) !== null) {
      images.push({
        src: match[1],
        alt: match[2] || 'تصویر',
        type: 'html',
        fullMatch: match[0],
      });
    }

    return images;
  }

  /**
   * Generate Astro-compatible image metadata
   */
  generateImageMetadata(imagePath, options = {}) {
    const filename = path.basename(imagePath);
    const hash = this.generateImageHash(imagePath);
    const name = path.parse(filename).name;

    return {
      // ✅ Astro Image component
      src: `/images/optimized/${name}-${hash}.webp`,
      alt: options.alt || filename,
      title: options.title || undefined,
      
      // ✅ Dimensions (for performance)
      width: options.width || 1024,
      height: options.height || 768,

      // ✅ Responsive srcset
      srcset: this.generateSrcset(name, hash),

      // ✅ Format & quality
      format: 'webp',
      quality: options.quality || 80,

      // ✅ Loading strategy
      loading: 'lazy',
      decoding: 'async',

      // ✅ Optimization hints
      formats: ['image/webp', 'image/jpeg'],
    };
  }

  /**
   * Generate responsive srcset for breakpoints
   */
  generateSrcset(name, hash) {
    return this.srcsetBreakpoints
      .map(width => ({
        src: `/images/optimized/${name}-${width}w-${hash}.webp`,
        width,
      }))
      .reduce((acc, item) => {
        acc[`${item.width}w`] = item.src;
        return acc;
      }, {});
  }

  /**
   * Normalize image path for Astro
   */
  normalizePath(imagePath, baseDir = 'src/content/articles') {
    // اگر relative path: تبدیل به absolute
    if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
      return path.relative('public', path.join(baseDir, imagePath));
    }
    return imagePath;
  }

  /**
   * Transform image in content for MDX usage
   */
  transformImageInMDX(content) {
    const images = this.extractImages(content);
    let result = content;

    for (const image of images) {
      const metadata = this.generateImageMetadata(image.src, {
        alt: image.alt,
      });

      let replacement;
      if (image.type === 'markdown') {
        // ✅ Transform to MDX with Astro Image import
        replacement = `<Image
  src="${metadata.src}"
  alt="${metadata.alt}"
  width={${metadata.width}}
  height={${metadata.height}}
  loading="${metadata.loading}"
  decoding="${metadata.decoding}"
/>`;
      } else {
        // ✅ Keep HTML but enhance
        replacement = `<img
  src="${metadata.src}"
  alt="${metadata.alt}"
  width="${metadata.width}"
  height="${metadata.height}"
  loading="${metadata.loading}"
  decoding="${metadata.decoding}"
/>`;
      }

      result = result.replace(image.fullMatch, replacement);
    }

    return result;
  }

  /**
   * Generate MDX import statement for images
   */
  generateImageImport(images) {
    if (images.length === 0) return '';

    const imports = images
      .filter(img => !img.external)
      .map((img, i) => `Image${i} from '${img.src}'`)
      .join(',\n  ');

    return `import { Image as AstroImage } from 'astro:assets';\nimport {\n  ${imports}\n} from '../images';\n\n`;
  }

  /**
   * Validate image is accessible
   */
  async validateImage(imagePath) {
    try {
      await fs.access(imagePath);
      const stats = await fs.stat(imagePath);
      
      // Check file size (max 10MB)
      if (stats.size > 10 * 1024 * 1024) {
        return { valid: false, error: 'تصویر بیش از حد بزرگ است (max 10MB)' };
      }

      // Check if it's actually an image
      const validFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
      const ext = path.extname(imagePath).toLowerCase();
      if (!validFormats.includes(ext)) {
        return { valid: false, error: `فرمت نامعتبر: ${ext}` };
      }

      return { valid: true, stats };
    } catch (error) {
      return { valid: false, error: `تصویر یافت نشد: ${imagePath}` };
    }
  }

  /**
   * Process all images in content
   */
  async processImages(content, sourceDir) {
    const images = this.extractImages(content);
    const processed = [];

    for (const image of images) {
      const imagePath = path.resolve(sourceDir, image.src);
      const validation = await this.validateImage(imagePath);

      if (validation.valid) {
        const metadata = this.generateImageMetadata(imagePath, {
          alt: image.alt,
        });
        processed.push({ ...image, metadata, valid: true });
      } else {
        console.warn(`⚠️ تصویر نامعتبر: ${image.src} - ${validation.error}`);
        processed.push({ ...image, valid: false, error: validation.error });
      }
    }

    return processed;
  }
}

export default ImageOptimizer;
