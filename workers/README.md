# Cloudflare Workers

This directory contains Cloudflare Workers for the website.

## Telegram Feed Worker

Fetches and caches the latest posts from a Telegram channel.

### Setup

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Create KV Namespace**:
   ```bash
   cd workers
   wrangler kv:namespace create "KV"
   ```
   Copy the returned namespace ID and update it in `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "KV"
   id = "your_namespace_id_here"
   ```

4. **Set Environment Secrets**:
   ```bash
   wrangler secret put TELEGRAM_BOT_TOKEN
   # Enter your Telegram Bot API token when prompted

   wrangler secret put TELEGRAM_CHANNEL
   # Enter your channel username (e.g., @yourchannelname)
   ```

5. **Deploy**:
   ```bash
   wrangler deploy
   ```

6. **Get Worker URL**:
   After deployment, Wrangler will display your worker URL. It will look like:
   ```
   https://telegram-feed.YOUR-SUBDOMAIN.workers.dev
   https://telegram-feed.mahhdy.workers.dev
   ```

7. **Update Environment Variables**:
   Add the worker URL to your main project's `.env` file:
   ```env
   PUBLIC_TELEGRAM_WORKER_URL=https://telegram-feed.YOUR-SUBDOMAIN.workers.dev
   ```

### Getting a Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions
3. Copy the API token provided
4. Add your bot to your channel as an administrator (optional, for some API methods)

### Testing

Test your deployed worker:
```bash
curl https://telegram-feed.YOUR-SUBDOMAIN.workers.dev
```

You should receive a JSON response with your latest channel posts.

### Caching

The worker caches responses in Cloudflare KV for 5 minutes (300 seconds). This reduces API calls and improves performance. You can adjust the `CACHE_TTL` constant in `telegram-feed.js`.

### Monitoring

View worker logs:
```bash
wrangler tail
```

### Troubleshooting

- **Empty response**: Make sure your Telegram channel is public and the username is correct
- **403 Forbidden**: Check that your bot token is valid
- **KV errors**: Ensure the KV namespace is created and the ID is correct in wrangler.toml
- **CORS errors**: The worker includes CORS headers by default, but check browser console for details

### Local Development

Test the worker locally:
```bash
wrangler dev
```

This starts a local server at `http://localhost:8787`.

Note: You'll need to set up `.dev.vars` file for local environment variables:
```
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHANNEL=@yourchannelname
```

### Production Deployment

For production, consider:
1. Setting up a custom domain for your worker
2. Enabling rate limiting
3. Adding authentication if needed
4. Monitoring usage and costs in Cloudflare dashboard

### Cost

Cloudflare Workers Free plan includes:
- 100,000 requests per day
- 10ms CPU time per request

This should be more than sufficient for a personal website's Telegram feed.
