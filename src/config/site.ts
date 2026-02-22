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
  telegramView: 'full' as 'full' | 'compact',

  /** How many Telegram posts to show on the homepage */
  telegramHomeLimit: 5,

  /**
   * Social media channel handles / page IDs.
   * Leave as empty string '' to hide that platform tab on /social.
   */
  social: {
    telegram: '@mahhdy57',
    x: '',
    instagram: '',
    facebook: '',
    linkedin: '',
  },
};

export type SiteConfig = typeof siteConfig;
