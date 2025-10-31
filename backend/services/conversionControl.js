// --- backend/services/conversionControl.js ---

import { convertImage } from './conversionService';
import { compressImage } from './compressionService';

// Formatos suportados para a primeira versão (apenas imagens)
const categoryFormats = {
    images: {
        formats: ['jpeg', 'jpg', 'png', 'webp', 'gif', 'avif', 'tiff'],
        converter: convertImage
    },
    compression: {
        formats: {
            'jpeg': compressImage,
            'jpg': compressImage,
            'png': compressImage,
            'webp': compressImage,
        },
        isCompression: true
    }
};

/**
 * Lógica principal de processamento (Upload, Conversão/Compressão, Armazenamento no R2).
 * @param {Request} request - O objeto Request do Worker.
 * @param {Env} env - O objeto de ambiente do Worker, contendo o binding R2_BUCKET.
 * @returns {Promise<Object>} - Objeto com o resultado do processamento.
 */
export async function handleConversion(request, env) {
    const R2_BUCKET = env.R2_BUCKET;
    if (!R2_BUCKET) {
        throw new Error('R2_BUCKET binding not found in environment.');
    }

    // 1. Parse do FormData (simulando multer)
    const formData = await request.formData();
    const file = formData.get('file');
    const targetFormat = formData.get('targetFormat')?.toLowerCase();
    const category = formData.get('category')?.toLowerCase();

    if (!file || !(file instanceof File)) {
        throw new Error('Nenhum arquivo enviado ou formato inválido.');
    }

    if (!category || (!categoryFormats[category] && category !== 'compression')) {
        throw new Error('Categoria inválida.');
    }

    const categoryData = categoryFormats[category];
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop().toLowerCase();
    const fileBuffer = await file.arrayBuffer();
    const fileUint8Array = new Uint8Array(fileBuffer);
    
    let processedFileBuffer;
    let newFilename;

    try {
        if (category === 'compression') {
            // Lógica de Compressão
            const compressor = categoryData.formats[fileExtension];
            if (!compressor) {
                throw new Error(`Formato .${fileExtension} não suportado para compressão.`);
            }
            
            // A compressão de imagem deve retornar um Buffer/Uint8Array e a nova extensão (se houver)
            const result = await compressor(fileUint8Array, fileExtension, targetFormat);
            processedFileBuffer = result.buffer;
            newFilename = `${crypto.randomUUID()}.${result.extension || fileExtension}`;

        } else if (category === 'images') {
            // Lógica de Conversão de Imagem
            if (!categoryData.formats.includes(fileExtension)) {
                throw new Error(`Formato de origem .${fileExtension} não suportado para conversão de imagem.`);
            }
            if (!categoryData.formats.includes(targetFormat)) {
                throw new Error(`Formato de destino .${targetFormat} não suportado para conversão de imagem.`);
            }

            // A conversão de imagem deve retornar um Buffer/Uint8Array
            processedFileBuffer = await categoryData.converter(fileUint8Array, targetFormat);
            newFilename = `${crypto.randomUUID()}.${targetFormat}`;

        } else {
            throw new Error('Categoria de processamento não implementada ou inválida.');
        }

        // 3. Armazenamento no R2
        const contentType = getContentType(newFilename);
        
        await R2_BUCKET.put(newFilename, processedFileBuffer, {
            httpMetadata: {
                contentType: contentType,
            },
            customMetadata: {
                originalName: originalName,
                category: category,
            }
        });

        // 4. Retorno do resultado
        return {
            success: true,
            originalName: originalName,
            convertedFilename: newFilename,
            contentType: contentType,
            size: processedFileBuffer.byteLength,
        };

    } catch (error) {
        console.error('Erro no processamento:', error.message);
        throw new Error(`Falha no processamento: ${error.message}`);
    }
}

/**
 * Lógica para download do arquivo do R2.
 * @param {Request} request - O objeto Request do Worker.
 * @param {Env} env - O objeto de ambiente do Worker, contendo o binding R2_BUCKET.
 * @param {string} filename - O nome do arquivo no R2.
 * @returns {Promise<Response>} - A resposta do Worker com o arquivo para download.
 */
export async function handleDownload(request, env, filename) {
    const R2_BUCKET = env.R2_BUCKET;
    if (!R2_BUCKET) {
        return new Response('R2_BUCKET binding not found.', { status: 500 });
    }

    const object = await R2_BUCKET.get(filename);

    if (!object) {
        return new Response('Arquivo não encontrado no R2.', { status: 404 });
    }

    // Deletar o arquivo após o download (opcional, dependendo da sua política de retenção)
    // await R2_BUCKET.delete(filename);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Content-Type', object.httpMetadata.contentType);
    headers.set('Content-Disposition', `attachment; filename="${object.customMetadata.originalName || filename}"`);

    return new Response(object.body, {
        headers,
    });
}

// Função auxiliar para determinar o Content-Type
function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'webp': return 'image/webp';
        case 'gif': return 'image/gif';
        case 'avif': return 'image/avif';
        case 'tiff': return 'image/tiff';
        default: return 'application/octet-stream';
    }
}
