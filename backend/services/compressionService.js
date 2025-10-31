// --- backend/services/compressionService.js ---

import { Jimp } from 'jimp';
import { Buffer } from 'node:buffer';

/**
 * Comprime um buffer de imagem ajustando a qualidade.
 * @param {Uint8Array} fileUint8Array - O buffer da imagem original.
 * @param {string} originalFormat - O formato original (ex: 'png', 'jpeg').
 * @param {string} targetFormat - O formato de destino (ex: 'jpg', 'webp' ou 'png' para compressão sem mudança de formato).
 * @returns {Promise<{buffer: ArrayBuffer, extension: string}>} - O buffer da imagem comprimida e a extensão final.
 */
export async function compressImage(fileUint8Array, originalFormat, targetFormat = originalFormat) {
    try {
        const image = await Jimp.read(Buffer.from(fileUint8Array));

        let quality = 80; // Qualidade padrão
        let requested = (targetFormat || originalFormat).toLowerCase();
        let preset = null;

        if (['low', 'medium', 'high'].includes(requested)) {
            preset = requested;
            requested = originalFormat.toLowerCase();
        }

        let finalExtension = requested;
        let mime;

        switch (requested) {
            case 'jpg':
            case 'jpeg':
                mime = 'image/jpeg';
                break;
            case 'png':
                mime = 'image/png';
                break;
            default:
                throw new Error(`Formato de compressão "${originalFormat}" não suportado.`);
        }

        if (mime === 'image/webp') {
            throw new Error('Compressão de arquivos WEBP não é suportada neste ambiente.');
        }

        if (preset) {
            switch (preset) {
                case 'low':
                    quality = 85;
                    break;
                case 'medium':
                    quality = 70;
                    break;
                case 'high':
                    quality = 55;
                    break;
            }
        } else if (mime === 'image/jpeg') {
            quality = 70;
        }

        const options = {};
        if (mime === 'image/jpeg') {
            options.quality = quality;
        }

        const buffer = await image.getBuffer(mime, options);

        return {
            buffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
            extension: finalExtension
        };

    } catch (error) {
        console.error('Erro na compressão de imagem com Jimp:', error);
        throw new Error(`Falha na compressão de imagem: ${error.message}.`);
    }
}

// Exportações vazias para manter a interface de serviço, mas removendo as funções não suportadas
export async function compressPDF() {
    throw new Error('Compressão de PDF não suportada no Cloudflare Worker nesta versão.');
}

export async function compressVideo() {
    throw new Error('Compressão de Vídeo não suportada no Cloudflare Worker nesta versão.');
}
