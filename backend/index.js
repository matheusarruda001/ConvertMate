// --- backend/index.js ---

import { Router } from 'itty-router';
import conversionRouter from './routes/conversionRoutes';

// Cria um novo roteador itty-router
const router = Router();

// Adiciona as rotas de conversão ao nosso roteador principal
router.all('/api/*', conversionRouter.handle);

// Função principal do Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // OPTIONS só precisa ser tratado para as rotas de API
    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return handleOptions(request);
      }
      return router.handle(request, env, ctx);
    }

    // Para demais rotas, tenta servir os assets estáticos configurados no wrangler.toml
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }

    // Caso nenhuma rota/asset seja encontrada, retorna 404
    return new Response('Not Found.', { status: 404 });
  },
};

// Função auxiliar para responder às requisições OPTIONS do CORS
function handleOptions(request) {
  const headers = request.headers;
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Responde com os cabeçalhos que o navegador espera, permitindo a requisição real.
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*', // Em produção, mude para o seu domínio do Pages!
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-File-Name, X-Target-Format',
        'Access-Control-Max-Age': '86400', // Cache a resposta preflight por 24 horas
      },
    });
  } else {
    // Lida com OPTIONS sem os cabeçalhos esperados
    return new Response(null, {
      headers: {
        Allow: 'GET, POST, OPTIONS',
      },
    });
  }
}
