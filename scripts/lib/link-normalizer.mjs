/**
 * Link Normalizer - تبدیل لینک‌ها برای Astro
 * پشتیبانی relative، absolute، hash links
 */

import path from 'path';
import url from 'url';

export class LinkNormalizer {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.defaultLang = options.defaultLang || 'fa';
    this.supportedLangs = options.supportedLangs || ['fa', 'en'];
    this.contentDir = options.contentDir || 'src/content';
  }

  /**
   * Extract links from content
   * Supports: [text](href), [text]: href, <a href="">
   */
  extractLinks(content) {
    const links = [];

    // Pattern ۱: Markdown links [text](href)
    const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        href: match[2],
        type: 'markdown',
        fullMatch: match[0],
      });
    }

    // Pattern ۲: Reference-style [text]: href
    const refRegex = /^\[([^\]]+)\]:\s*(.+)$/gm;
    while ((match = refRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        href: match[2].trim(),
        type: 'reference',
        fullMatch: match[0],
      });
    }

    // Pattern ۳: HTML links <a href="">
    const htmlRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'](?:[^>]*)>([^<]+)<\/a>/g;
    while ((match = htmlRegex.exec(content)) !== null) {
      links.push({
        href: match[1],
        text: match[2],
        type: 'html',
        fullMatch: match[0],
      });
    }

    return links;
  }

  /**
   * Determine link type
   */
  detectLinkType(href) {
    if (href.startsWith('#')) return 'anchor';
    if (href.startsWith('http://') || href.startsWith('https://')) return 'external';
    if (href.startsWith('mailto:')) return 'email';
    if (href.startsWith('tel:')) return 'phone';
    if (href.startsWith('/')) return 'absolute';
    if (href.startsWith('.') || !href.startsWith('/')) return 'relative';
    return 'unknown';
  }

  /**
   * Normalize relative path links
   * Example: '../folder/file.md' → '/fa/folder/file'
   */
  normalizeRelativePath(href, sourceFile) {
    // معالجه relative paths
    let normalized = href;

    // تبدیل ../ به path-based navigation
    const segments = sourceFile.split('/');
    const hrefSegments = normalized.split('/');

    let upCount = 0;
    while (hrefSegments[0] === '..') {
      upCount++;
      hrefSegments.shift();
    }

    // Remove file extension (.md, .mdx, .tex, etc.)
    const lastSegment = hrefSegments[hrefSegments.length - 1];
    if (lastSegment.includes('.')) {
      hrefSegments[hrefSegments.length - 1] = lastSegment.split('.')[0];
    }

    // Reconstruct path
    const basePath = segments.slice(0, segments.length - 1 - upCount);
    const finalPath = [...basePath, ...hrefSegments].filter(Boolean).join('/');

    return `/${finalPath}`;
  }

  /**
   * Handle language-specific links
   */
  addLanguagePrefix(href, lang = this.defaultLang) {
    if (href.startsWith('#') || href.startsWith('http')) return href;
    if (href.startsWith('/')) {
      // اگر قبلاً lang prefix دارد، skip کن
      const segments = href.split('/').filter(Boolean);
      if (this.supportedLangs.includes(segments[0])) return href;

      // اگر lang prefix ندارد، اضافه کن
      return `/${lang}${href}`;
    }
    return href;
  }

  /**
   * Sanitize URL for safety
   */
  sanitizeUrl(href) {
    try {
      // اگر absolute URL
      if (href.startsWith('http')) {
        const parsed = new url.URL(href);
        // Check for malicious protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          console.warn(`⚠️ خطرناک: ${href}`);
          return null;
        }
        return parsed.href;
      }

      // اگر relative یا anchor
      if (href.startsWith('/') || href.startsWith('#') || href.startsWith('.')) {
        // تحقق برای path traversal attacks
        if (href.includes('..\\') || href.includes('%2e%2e')) {
          console.warn(`⚠️ خطرناک: ${href}`);
          return null;
        }
        return href;
      }

      return null;
    } catch (error) {
      console.warn(`⚠️ URL غیرمعتبر: ${href}`);
      return null;
    }
  }

  /**
   * Transform link metadata for Astro
   */
  transformLink(link, sourceFile, options = {}) {
    const { addLangPrefix = true, lang = this.defaultLang } = options;

    const linkType = this.detectLinkType(link.href);

    let normalizedHref = link.href;

    // ۱. Sanitize
    const sanitized = this.sanitizeUrl(link.href);
    if (!sanitized && !link.href.startsWith('#')) {
      console.warn(`❌ حذف لینک خطرناک: ${link.href}`);
      return null;
    }

    // ۲. Transform based on type
    switch (linkType) {
      case 'relative':
        normalizedHref = this.normalizeRelativePath(link.href, sourceFile);
        if (addLangPrefix) {
          normalizedHref = this.addLanguagePrefix(normalizedHref, lang);
        }
        break;

      case 'absolute':
        if (addLangPrefix && !link.href.includes(`/${lang}/`)) {
          normalizedHref = this.addLanguagePrefix(link.href, lang);
        }
        break;

      case 'external':
        // Keep as-is, add target="_blank"
        return { ...link, href: link.href, external: true, target: '_blank' };

      case 'anchor':
        // لینک‌های hash برای TOC
        normalizedHref = link.href.toLowerCase();
        break;

      default:
        normalizedHref = link.href;
    }

    return {
      ...link,
      href: normalizedHref,
      type: linkType,
      external: linkType === 'external',
      target: linkType === 'external' ? '_blank' : undefined,
      rel: linkType === 'external' ? 'noopener noreferrer' : undefined,
    };
  }

  /**
   * Transform all links in content
   */
  normalizeLinksInContent(content, sourceFile, options = {}) {
    const links = this.extractLinks(content);
    let result = content;

    for (const link of links) {
      const transformed = this.transformLink(link, sourceFile, options);

      if (transformed) {
        let replacement;
        if (link.type === 'markdown') {
          // ✅ Update Markdown links
          replacement = `[${transformed.text}](${transformed.href})`;
        } else if (link.type === 'html') {
          // ✅ Update HTML links with attributes
          const attrs = [
            `href="${transformed.href}"`,
            transformed.target ? `target="${transformed.target}"` : '',
            transformed.rel ? `rel="${transformed.rel}"` : '',
          ]
            .filter(Boolean)
            .join(' ');
          replacement = `<a ${attrs}>${transformed.text}</a>`;
        } else if (link.type === 'reference') {
          replacement = `[${transformed.text}]: ${transformed.href}`;
        }

        if (replacement) {
          result = result.replace(link.fullMatch, replacement);
        }
      }
    }

    return result;
  }

  /**
   * Generate nav structure from links
   */
  generateNavStructure(links) {
    const nav = {
      internal: [],
      external: [],
      anchors: [],
    };

    for (const link of links) {
      const type = this.detectLinkType(link.href);
      if (type === 'external') {
        nav.external.push(link);
      } else if (type === 'anchor') {
        nav.anchors.push(link);
      } else {
        nav.internal.push(link);
      }
    }

    return nav;
  }

  /**
   * Check if link is valid
   */
  async validateLink(href, basePath = '') {
    const type = this.detectLinkType(href);

    if (type === 'external') {
      // TODO: Implement HTTP check
      return { valid: true, type };
    }

    if (type === 'absolute' || type === 'relative') {
      // TODO: Check if file exists
      return { valid: true, type };
    }

    return { valid: true, type };
  }
}

export default LinkNormalizer;
