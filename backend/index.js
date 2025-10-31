// --- backend/index.js ---

// Importa nosso roteador (que também vamos adaptar)
import conversionRouter from './routes/conversionRoutes';

// A função principal de um Worker. Todo pedido passa por aqui.
export default {
  async fetch(request, env, ctx) {
    // Lida com requisições "preflight" de CORS. Essencial para a comunicação entre domínios.
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);

    // Se o caminho da URL começar com '/api', passamos para nosso roteador.
    if (url.pathname.startsWith('/api')) {
      // O método 'handle' será uma nova função que criaremos em conversionRoutes.js
      return conversionRouter.handle(request, env);
    }

    // Se não for uma rota de API, o Worker não tem nada a fazer.
    return new Response('Not Found', { status: 404 });
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
        'Access-Control-Allow-Headers': 'Content-Type',
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