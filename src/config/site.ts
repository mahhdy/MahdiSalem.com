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
    linkedin: '',
  },
};

export type SiteConfig = typeof siteConfig;
