// --- backend/routes/conversionRoutes.js ---

import { Router } from 'itty-router';
import { handleConversion, handleDownload } from '../services/conversionControl';

// Cria um novo roteador itty-router para as rotas da API
const router = Router({ base: '/api' });

/**
 * Rota POST para conversão/compressão de arquivos.
 * O itty-router lida com a requisição, e o handleConversion faz o parse do FormData,
 * processamento e upload para o R2.
 */
router.post('/convert', async (request, env) => {
    try {
        // O handleConversion faz todo o trabalho de processamento e upload para o R2
        const result = await handleConversion(request, env);

        // Retorna o resultado com o nome do arquivo convertido no R2
        return new Response(JSON.stringify({
            success: true,
            message: 'Processamento concluído com sucesso.',
            downloadFilename: result.convertedFilename,
            originalName: result.originalName,
            size: result.size,
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Erro na rota /api/convert:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Erro interno do servidor.',
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});

/**
 * Rota GET para download do arquivo do R2.
 * O nome do arquivo é passado como parâmetro de rota.
 */
router.get('/download/:filename', async (request, env) => {
    const filename = request.params.filename;

    if (!filename) {
        return new Response('Nome do arquivo não fornecido.', { status: 400 });
    }

    try {
        // O handleDownload busca o arquivo no R2 e retorna a Response com o arquivo
        return await handleDownload(request, env, filename);
    } catch (error) {
        console.error('Erro na rota /api/download:', error);
        return new Response('Arquivo não encontrado ou erro no download.', { status: 404 });
    }
});


// Exporta o roteador para ser usado no index.js
export default router;
