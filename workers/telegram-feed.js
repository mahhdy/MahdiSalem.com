// telegram-feed.js - نسخه کامل با Webhook
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // REGISTER WEBHOOK
    if (url.pathname === '/registerWebhook') {
      const webhookUrl = 'https://telegram-feed.mahhdy.workers.dev';
      const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          drop_pending_updates: true
        })
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // TELEGRAM WEBHOOK POST
    if (request.method === 'POST' && url.pathname === '/') {
      const update = await request.json();
      console.log('New Telegram post:', update);
      
      // Cache new post
      const posts = await env.KV.get('telegram_feed_cache', 'json') || [];
      posts.unshift(update.channel_post || update.message);
      await env.KV.put('telegram_feed_cache', JSON.stringify(posts.slice(0, 10)), {
        expirationTtl: 300
      });
      
      return new Response('OK');
    }

    // GET CHANNEL POSTS (قدیمی + کش)
    if (request.method === 'GET') {
      const CHANNEL_USERNAME = env.TELEGRAM_CHANNEL;
      const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
      const CACHE_KEY = 'telegram_feed_cache';
      
      if (!CHANNEL_USERNAME || !BOT_TOKEN) {
        return new Response(JSON.stringify({ error: 'Missing env vars' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Cache first
      const cachedData = await env.KV.get(CACHE_KEY, 'json');
      if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
        });
      }

      // Fetch + parse HTML (کد قبلی‌ات)
      const channelUsername = CHANNEL_USERNAME.replace('@', '');
      const webUrl = `https://t.me/s/${channelUsername}`;
      const response = await fetch(webUrl);
      const html = await response.text();
      const posts = parseChannelHTML(html, channelUsername);

      await env.KV.put(CACHE_KEY, JSON.stringify(posts.slice(0, 5)), { expirationTtl: 300 });
      
      return new Response(JSON.stringify(posts.slice(0, 5)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

// parseChannelHTML function (کد قبلی‌ات بدون تغییر)
async function parseChannelHTML(html, channelUsername) {
  // همون کد قبلی‌ات...
  const posts = [];
  const postRegex = /<div class="tgme_widget_message[^"]*"[^>]*data-post="[^"]*\/(\d+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  
  let match;
  while ((match = postRegex.exec(html)) && posts.length < 15) {
    const messageId = match[1];
    const postHtml = match[2];
    
    const textMatch = postHtml.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    const text = textMatch ? textMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim() : '';
    
    const dateMatch = postHtml.match(/<time[^>]*datetime="([^"]*)"[^>]*>/);
    const dateStr = dateMatch ? dateMatch[1] : new Date().toISOString();
    const timestamp = Math.floor(new Date(dateStr).getTime() / 1000);
    
    const viewsMatch = postHtml.match(/<span class="tgme_widget_message_views">([^<]*)</);
    let views = 0;
    if (viewsMatch) {
      const viewsStr = viewsMatch[1].trim();
      if (viewsStr.endsWith('K')) views = parseFloat(viewsStr) * 1000;
      else if (viewsStr.endsWith('M')) views = parseFloat(viewsStr) * 1000000;
      else views = parseInt(viewsStr) || 0;
    }
    
    if (text) {
      posts.push({
        id: messageId,
        text: text.substring(0, 500),
        date: timestamp,
        views: Math.floor(views),
        link: `https://t.me/${channelUsername}/${messageId}`,
      });
    }
  }
  
  return posts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
}
