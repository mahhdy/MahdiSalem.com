/**
 * site.ts — Central site configuration
 *
 * Edit values here or via the Admin → Config page.
 */

export const siteConfig = {
  /**
   * Telegram section on homepage.
   * "full"    – full card view (one column, current behaviour)
   * "compact" – 2-column compact grid with a link to /social
   */
  telegramView: 'compact' as 'full' | 'compact',
  /** Number of columns for article list view: 1 or 2 (default 2) */
  articleListColumns: 2 as 1 | 2,

  /** How many Telegram posts to show on the homepage */
  telegramHomeLimit: 6,

  /**
   * Social media channel handles / page IDs.
   * Leave as empty string '' to hide that platform tab on /social.
   */
  social: {
    telegram: '@mahhdy57',
    x: 'mahhdy57',
    instagram: 'mahhdy57',
    facebook: 'mahhdy',
    linkedin: 'mahhdy',
  },
  feedLimits: {
    telegram: 12,
    x: 15,
    instagram: 30,
    linkedin: 10,
  },
  feedIds: {
    instagram: import.meta.env.PUBLIC_INSTAGRAM_FEED_ID || 'RzC3RaQ4Nsnydi63ycsL',
    x: import.meta.env.PUBLIC_X_FEED_ID || 'HZm9MUOpxj54TfEk',
    linkedin: import.meta.env.PUBLIC_LINKEDIN_FEED_ID || '',
  },
  /** Analytics configuration */
  analytics: {
    /** Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX) */
    googleAnalyticsId: 'G-SCZFSM9GPM',
    /** Google Tag Manager ID (e.g. GTM-XXXXXXX) */
    googleTagManagerId: 'GTM-5B75PNDC',
    /** Cloudflare Web Analytics Token (Optional if using automatic setup) */
    cloudflareToken: '',
  },
};

export type SiteConfig = typeof siteConfig;
