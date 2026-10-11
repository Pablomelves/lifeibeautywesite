import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function shopifyDevPlugin(): Plugin {
  return {
    name: 'shopify-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/shopify')) {
          return next();
        }

        const domain = (process.env.SHOPIFY_STORE_DOMAIN || 'maison-co-store1.myshopify.com')
          .replace(/^https?:\/\//, '')
          .split('/')[0]
          .trim();
        const token = (process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '').trim();
        const privateToken = (process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || '').trim();
        const apiVersion = (process.env.SHOPIFY_API_VERSION || '2026-10').trim();

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ domain, apiVersion, authentication: privateToken ? 'private' : token ? 'public' : 'tokenless' }));
          return;
        }

        if (req.method === 'POST') {
          let bodyRaw = '';
          req.on('data', chunk => { bodyRaw += chunk; });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyRaw || '{}');
              const query = body?.query;
              const variables = body?.variables || {};

              if (typeof query !== 'string' || !query.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GraphQL query is required' }));
                return;
              }

              const shopifyEndpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
              const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              };
              if (token) headers['X-Shopify-Storefront-Access-Token'] = token;
              if (privateToken) headers['Shopify-Storefront-Private-Token'] = privateToken;

              const upstreamRes = await fetch(shopifyEndpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query, variables }),
                signal: AbortSignal.timeout(15000),
              });

              const data: any = await upstreamRes.json();
              const cart = data?.data?.cartCreate?.cart;
              if (typeof cart?.checkoutUrl === 'string') {
                const checkout = new URL(cart.checkoutUrl);
                if (['maison-co-store1.myshopify.com', 'checkout.lifeibeauty.com', 'lifeibeauty.com', 'www.lifeibeauty.com'].includes(checkout.hostname)) {
                  checkout.hostname = 'checkout.lifeibeauty.com';
                  checkout.searchParams.set('_fd', '0');
                  cart.checkoutUrl = checkout.toString();
                }
              }

              res.statusCode = upstreamRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-store');
              res.end(JSON.stringify(data));
            } catch (err: any) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Failed to connect to Shopify Storefront API' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), shopifyDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: {
        clientPort: 443,
      },
    },
  };
});
