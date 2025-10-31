// --- backend/index.js ---

import { Router } from 'itty-router';
import conversionRouter from './routes/conversionRoutes';

const router = Router();
router.all('/api/*', conversionRouter.handle);

const ALLOWED_ORIGINS = new Set([
  'https://convertmate.pages.dev',
  'http://127.0.0.1:8787',
  'http://localhost:8787',
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return handleOptions(request);
      }

      const response = await router.handle(request, env, ctx);
      return applyCors(request, response ?? new Response('Not Found.', { status: 404 }));
    }

    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }

    return new Response('Not Found.', { status: 404 });
  },
};

function handleOptions(request) {
  const origin = getAllowedOrigin(request);

  if (!origin) {
    return new Response(null, {
      status: 204,
      headers: { Allow: 'GET, POST, OPTIONS' },
    });
  }

  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': origin ?? '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-File-Name, X-Target-Format',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  });
}

function applyCors(request, response) {
  if (!(response instanceof Response)) {
    return response;
  }

  const origin = getAllowedOrigin(request);
  if (!origin) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.append('Vary', 'Origin');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function getAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) {
    return '*';
  }

  if (ALLOWED_ORIGINS.has(origin)) {
    return origin;
  }

  return null;
}
