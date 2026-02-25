/**
 * Hidden content utility.
 * Checks if `hidden: true` content should be shown based on URL query params.
 * 
 * Content with `hidden: true` is only accessible when:
 *   - The URL contains `?force=true`
 *   - Or the URL path ends with `--force`
 * 
 * Usage in Astro pages:
 *   import { shouldShowHidden } from '../../lib/hidden';
 *   if (article.data.hidden && !shouldShowHidden(Astro.url)) return Astro.redirect('/404');
 */

export function shouldShowHidden(url: URL): boolean {
    // Check ?force=true query parameter
    if (url.searchParams.get('force') === 'true') return true;
    // Check --force suffix in pathname
    if (url.pathname.endsWith('--force')) return true;
    return false;
}

/**
 * Filter function to exclude hidden items from collection listings.
 * Pass the current URL to allow hidden content to still show when force is active.
 */
export function filterHidden<T extends { data: { hidden?: boolean; draft?: boolean } }>(
    items: T[],
    url?: URL,
): T[] {
    const forceShow = url ? shouldShowHidden(url) : false;
    return items.filter(item => {
        if (item.data.hidden && !forceShow) return false;
        return true;
    });
}
