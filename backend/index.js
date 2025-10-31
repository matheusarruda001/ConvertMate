// --- backend/index.js ---

import { Router } from 'itty-router';
import conversionRouter from './routes/conversionRoutes';

// Cria um novo roteador itty-router
const router = Router();

// Adiciona as rotas de conversão ao nosso roteador principal
// O itty-router permite que um router seja usado como middleware/sub-router
router.all('/api/*', conversionRouter.handle);

// Rota padrão para a raiz (pode ser útil para health check)
router.get('/', () => new Response('ConvertMate Worker is running!'));

// Rota de fallback para 404
router.all('*', () => new Response('Not Found.', { status: 404 }));

// Função principal do Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    // Lida com requisições "preflight" de CORS. Essencial para a comunicação entre domínios.
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Passa a requisição para o roteador e retorna a resposta
    return router.handle(request, env, ctx);
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
