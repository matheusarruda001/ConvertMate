// --- backend/services/compressionService.js ---


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

        let mime;
        let finalExtension = targetFormat.toLowerCase();
        let quality = 80; // Qualidade de compressão padrão

        switch (finalExtension) {
            case 'jpg':
            case 'jpeg':
                mime = Jimp.MIME_JPEG;
                quality = 70; // Um pouco mais de compressão para JPEG
                break;
            case 'png':
                mime = Jimp.MIME_PNG;
                // PNG é lossless, mas Jimp pode otimizar paletas/chunks
                break;
            case 'webp':
                mime = 'image/webp';
                quality = 70;
                break;
            default:
                // Se o formato de destino não for um dos formatos de compressão, usamos o original
                finalExtension = originalFormat.toLowerCase();
                switch (finalExtension) {
                    case 'jpg':
                    case 'jpeg':
                        mime = Jimp.MIME_JPEG;
                        quality = 70;
                        break;
                    case 'png':
                        mime = Jimp.MIME_PNG;
                        break;
                    default:
                        throw new Error(`Formato de compressão \"${originalFormat}\" não suportado.`);
                }
        }

        // Aplica a qualidade (só tem efeito em formatos com perdas como JPEG/WebP)
        image.quality(quality);

        // getBufferAsync retorna um Buffer
        const buffer = await image.getBufferAsync(mime);

        return {
            buffer: buffer.buffer, // ArrayBuffer para o R2
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
