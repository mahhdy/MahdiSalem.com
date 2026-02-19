/**
 * Astro Content Schema - Zod-based validation for MDX frontmatter
 * پشتیبانی کامل فارسی و انگلیسی
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// تعریف Schema
// ═══════════════════════════════════════════════════════════════

export const ContentFrontmatterSchema = z.object({
  // ✅ فیلد‌های اجباری
  title: z.string()
    .min(3, 'عنوان باید حداقل ۳ کاراکتر باشد')
    .max(200, 'عنوان بیش از حد طولانی است'),

  description: z.string()
    .min(10, 'توضیح باید حداقل ۱۰ کاراکتر باشد')
    .max(500, 'توضیح بیش از حد طولانی است'),

  lang: z.enum(['fa', 'en'])
    .default('fa'),

  publishDate: z.coerce.date()
    .max(new Date(), 'تاریخ انتشار نمی‌تواند در آینده باشد'),

  author: z.string()
    .min(2, 'نام نویسنده لازم است'),

  // ✅ فیلد‌های اختیاری
  tags: z.array(z.string()
    .min(1, 'تگ نمی‌تواند خالی باشد')
    .max(50, 'تگ بیش از حد طولانی است'))
    .min(1, 'حداقل یک تگ لازم است')
    .max(10, 'حداکثر ۱۰ تگ مجاز است')
    .optional()
    .default([]),

  categories: z.array(z.string()
    .min(1, 'دسته‌بندی نمی‌تواند خالی باشد')
    .max(100, 'دسته‌بندی بیش از حد طولانی است'))
    .min(1, 'حداقل یک دسته‌بندی لازم است')
    .max(5, 'حداکثر ۵ دسته‌بندی مجاز است')
    .optional()
    .default([]),

  interface: z.enum([
    'descriptive-politics',
    'comparative-politics',
    'theoretical-politics',
    'prescriptive-politics',
    'iran'
  ])
    .optional()
    .default('descriptive-politics'),

  draft: z.boolean()
    .optional()
    .default(false),

  // ✅ اختیاری: metadata اضافی
  readingTime: z.number()
    .positive('زمان مطالعه باید مثبت باشد')
    .optional(),

  difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
    .optional(),

  featured: z.boolean()
    .optional()
    .default(false),

  // ✅ اختیاری: SEO
  keywords: z.array(z.string())
    .max(10, 'حداکثر ۱۰ کلیدواژه')
    .optional(),

  // ✅ اختیاری: Display options
  'show-header': z.boolean()
    .optional()
    .default(true),

  'show-toc': z.boolean()
    .optional()
    .default(true),
})
  .strict() // عدم پذیرش فیلد‌های اضافی
  .passthrough() // یا passthrough برای فیلد‌های اضافی
  .refine(
    (data) => {
      // ✅ Custom validation: تاریخ باید معقول باشد
      const minDate = new Date('2000-01-01');
      return data.publishDate >= minDate;
    },
    {
      message: 'تاریخ انتشار باید پس از سال ۲۰۰۰ باشد',
      path: ['publishDate'],
    }
  );

// ✅ Schema برای image metadata
export const ImageMetadataSchema = z.object({
  src: z.string()
    .url('مسیر تصویر باید URL معتبر باشد')
    .or(z.string().startsWith('/')),
  alt: z.string()
    .min(5, 'متن جایگزین نمی‌تواند خالی باشد'),
  title: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  quality: z.number().min(1).max(100).optional().default(80),
  format: z.enum(['webp', 'png', 'jpg', 'avif']).optional().default('webp'),
  lazy: z.boolean().optional().default(true),
});

// ✅ Schema برای link metadata
export const LinkMetadataSchema = z.object({
  href: z.string()
    .url('لینک باید URL معتبر باشد')
    .or(z.string().startsWith('/'))
    .or(z.string().startsWith('#')),
  text: z.string(),
  title: z.string().optional(),
  external: z.boolean().optional(),
  nofollow: z.boolean().optional(),
});

// ═══════════════════════════════════════════════════════════════
// Validation Functions
// ═══════════════════════════════════════════════════════════════

export class ContentValidator {
  /**
   * Validate frontmatter against schema
   */
  static validateFrontmatter(frontmatter) {
    try {
      const validated = ContentFrontmatterSchema.parse(frontmatter);
      return { success: true, data: validated, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          data: null,
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        };
      }
      throw error;
    }
  }

  /**
   * Validate image metadata
   */
  static validateImage(imageData) {
    try {
      const validated = ImageMetadataSchema.parse(imageData);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors[0]?.message || 'Invalid image metadata',
        };
      }
      throw error;
    }
  }

  /**
   * Validate link metadata
   */
  static validateLink(linkData) {
    try {
      const validated = LinkMetadataSchema.parse(linkData);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors[0]?.message || 'Invalid link metadata',
        };
      }
      throw error;
    }
  }

  /**
   * Generate default frontmatter with validation
   */
  static generateDefaultFrontmatter(overrides = {}) {
    const defaults = {
      title: 'Untitled',
      description: 'No description provided',
      lang: 'fa',
      publishDate: new Date(),
      author: 'Anonymous',
      tags: [],
      categories: [],
      interface: 'descriptive-politics',
      draft: true,
      'show-header': true,
      'show-toc': true,
    };

    return this.validateFrontmatter({ ...defaults, ...overrides });
  }
}

export default ContentValidator;
