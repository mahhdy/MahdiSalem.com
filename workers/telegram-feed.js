/**
 * Cloudflare Worker for fetching Telegram Channel Feed
 *
 * This worker fetches the latest posts from a Telegram channel using the Telegram Bot API
 * and caches the results in Cloudflare KV to minimize API calls.
 *
 * Environment Variables Required:
 * - TELEGRAM_BOT_TOKEN: Your Telegram Bot API token
 * - TELEGRAM_CHANNEL: Your channel username (e.g., @yourchannelname)
 * - KV (binding): Cloudflare KV namespace for caching
 */

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const CHANNEL_USERNAME = env.TELEGRAM_CHANNEL; // e.g., '@yourusername'
      const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
      const CACHE_KEY = 'telegram_feed_cache';
      const CACHE_TTL = 300; // 5 minutes in seconds

      // Validate environment variables
      if (!CHANNEL_USERNAME || !BOT_TOKEN) {
        return new Response(
          JSON.stringify({ error: 'Missing environment variables' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Check cache first
      const cachedData = await env.KV.get(CACHE_KEY, 'json');
      if (cachedData) {
        console.log('Returning cached data');
        return new Response(JSON.stringify(cachedData), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
            'X-Cache': 'HIT',
          },
        });
      }

      // Fetch from Telegram API
      // Note: We'll use getUpdates for simplicity, but in production you might want to use
      // getChat or web scraping for public channels
      const chatId = CHANNEL_USERNAME;

      // Alternative approach: Fetch channel posts using getUpdates with channel filter
      // For public channels, we can also use the web endpoint
      const posts = await fetchChannelPosts(BOT_TOKEN, chatId);

      // Process and extract latest 5 posts
      const processedPosts = posts.slice(0, 5);

      // Cache the result
      await env.KV.put(CACHE_KEY, JSON.stringify(processedPosts), {
        expirationTtl: CACHE_TTL,
      });

      console.log('Fetched and cached new data');
      return new Response(JSON.stringify(processedPosts), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          'X-Cache': 'MISS',
        },
      });
    } catch (error) {
      console.error('Error fetching Telegram feed:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch Telegram feed',
          message: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

/**
 * Fetch channel posts from Telegram
 *
 * Note: The Telegram Bot API has limitations for fetching channel posts.
 * For production, consider using:
 * 1. Telegram's RSS feed (if available)
 * 2. Telegram's web preview API
 * 3. A bot that listens to channel updates
 *
 * This implementation uses a placeholder approach that you'll need to adapt
 * based on your specific Telegram channel setup.
 */
async function fetchChannelPosts(botToken, channelId) {
  // Option 1: If you have a bot in the channel, use getUpdates
  // const apiUrl = `https://api.telegram.org/bot${botToken}/getUpdates?allowed_updates=["channel_post"]`;

  // Option 2: Use getChat to get channel info (doesn't return posts)
  // const apiUrl = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${channelId}`;

  // Option 3: For public channels, we can construct a web preview URL
  // This is a fallback that scrapes the public channel page
  const channelUsername = channelId.replace('@', '');
  const webUrl = `https://t.me/s/${channelUsername}`;

  // Fetch the web page and parse it (simple HTML parsing)
  const response = await fetch(webUrl);
  const html = await response.text();

  // Parse posts from HTML (this is a simplified parser)
  const posts = parseChannelHTML(html, channelUsername);

  return posts;
}

/**
 * Parse Telegram channel HTML to extract posts
 * This is a simplified parser - in production, you might want to use a proper HTML parser
 */
function parseChannelHTML(html, channelUsername) {
  const posts = [];

  // Match post blocks
  const postRegex = /<div class="tgme_widget_message[^"]*"[^>]*data-post="[^"]*\/(\d+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;

  let match;
  while ((match = postRegex.exec(html)) && posts.length < 10) {
    const messageId = match[1];
    const postHtml = match[2];

    // Extract text content
    const textMatch = postHtml.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    const text = textMatch
      ? textMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
      : '';

    // Extract date
    const dateMatch = postHtml.match(/<time[^>]*datetime="([^"]*)"[^>]*>/);
    const dateStr = dateMatch ? dateMatch[1] : new Date().toISOString();
    const timestamp = Math.floor(new Date(dateStr).getTime() / 1000);

    // Extract views
    const viewsMatch = postHtml.match(/<span class="tgme_widget_message_views">([^<]*)</);
    let views = 0;
    if (viewsMatch) {
      const viewsStr = viewsMatch[1].trim();
      if (viewsStr.endsWith('K')) {
        views = parseFloat(viewsStr) * 1000;
      } else if (viewsStr.endsWith('M')) {
        views = parseFloat(viewsStr) * 1000000;
      } else {
        views = parseInt(viewsStr) || 0;
      }
    }

    if (text) {
      posts.push({
        id: messageId,
        text: text.substring(0, 500), // Limit text length
        date: timestamp,
        views: Math.floor(views),
        link: `https://t.me/${channelUsername}/${messageId}`,
      });
    }
  }

  return posts;
}
