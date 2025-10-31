// --- backend/services/conversionControl.js ---

import { convertImage } from './conversionService';
import { compressImage } from './compressionService';

const categoryFormats = {
    images: {
        formats: ['jpeg', 'jpg', 'png', 'webp'], // supported as source
        targetFormats: ['jpeg', 'jpg', 'png'], // destinations we can encode
        converter: convertImage,
    },
    compression: {
        formats: {
            jpeg: compressImage,
            jpg: compressImage,
            png: compressImage,
        },
        isCompression: true,
    },
};

/**
 * Core processing logic (upload, convert/compress, store on R2).
 * @param {Request} request - Worker Request object.
 * @param {Env} env - Worker environment bindings (expects R2_BUCKET).
 * @returns {Promise<Object>} - Processing result object.
 */
export async function handleConversion(request, env) {
    const R2_BUCKET = env.R2_BUCKET;
    if (!R2_BUCKET) {
        throw new Error('R2_BUCKET binding not found in environment.');
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const targetFormat = formData.get('targetFormat')?.toLowerCase();
    const category = formData.get('category')?.toLowerCase();

    if (!file || !(file instanceof File)) {
        throw new Error('Nenhum arquivo enviado ou formato invalido.');
    }

    if (!category || !categoryFormats[category]) {
        throw new Error('Categoria invalida.');
    }

    const categoryData = categoryFormats[category];
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop().toLowerCase();
    const fileBuffer = await file.arrayBuffer();
    const fileUint8Array = new Uint8Array(fileBuffer);

    let processedFileBuffer;
    let newFilename;

    try {
        if (categoryData.isCompression) {
            const compressor = categoryData.formats[fileExtension];
            if (!compressor) {
                throw new Error(`Formato .${fileExtension} nao suportado para compressao.`);
            }

            const result = await compressor(fileUint8Array, fileExtension, targetFormat);
            processedFileBuffer = result.buffer;
            newFilename = `${crypto.randomUUID()}.${result.extension || fileExtension}`;
        } else if (category === 'images') {
            if (!categoryData.formats.includes(fileExtension)) {
                throw new Error(`Formato de origem .${fileExtension} nao suportado para conversao de imagem.`);
            }

            const allowedTargets = categoryData.targetFormats || categoryData.formats;
            if (!allowedTargets.includes(targetFormat)) {
                throw new Error(`Formato de destino .${targetFormat} nao suportado para conversao de imagem.`);
            }

            processedFileBuffer = await categoryData.converter(fileUint8Array, targetFormat);
            newFilename = `${crypto.randomUUID()}.${targetFormat}`;
        } else {
            throw new Error('Categoria de processamento nao implementada.');
        }

        const contentType = getContentType(newFilename);

        await R2_BUCKET.put(newFilename, processedFileBuffer, {
            httpMetadata: {
                contentType,
            },
            customMetadata: {
                originalName,
                category,
            },
        });

        return {
            success: true,
            originalName,
            convertedFilename: newFilename,
            contentType,
            size: processedFileBuffer.byteLength,
        };
    } catch (error) {
        console.error('Erro no processamento:', error.message);
        throw new Error(`Falha no processamento: ${error.message}`);
    }
}

/**
 * Download logic for files stored in R2.
 * @param {Request} request - Worker Request object.
 * @param {Env} env - Worker environment bindings.
 * @param {string} filename - File name stored in R2.
 * @returns {Promise<Response>} - Worker response with binary file.
 */
export async function handleDownload(request, env, filename) {
    const R2_BUCKET = env.R2_BUCKET;
    if (!R2_BUCKET) {
        return new Response('R2_BUCKET binding not found.', { status: 500 });
    }

    const object = await R2_BUCKET.get(filename);

    if (!object) {
        return new Response('Arquivo nao encontrado no R2.', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Content-Type', object.httpMetadata.contentType);
    headers.set('Content-Disposition', `attachment; filename="${object.customMetadata.originalName || filename}"`);

    return new Response(object.body, { headers });
}

function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'webp':
            return 'image/webp';
        case 'gif':
            return 'image/gif';
        case 'avif':
            return 'image/avif';
        case 'tiff':
            return 'image/tiff';
        default:
            return 'application/octet-stream';
    }
}
