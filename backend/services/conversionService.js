// --- backend/services/conversionService.js ---

import { Jimp } from 'jimp';
import { Buffer } from 'node:buffer';

const MIME_TYPES = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
};

// Usaremos a biblioteca Jimp, pois é uma das poucas que funciona bem em Workers (com algumas ressalvas).
// Nota: Em um ambiente de produção, para a melhor performance e menor uso de memória,
// a abordagem ideal seria usar o Cloudflare Images Transform.
// O Jimp é usado aqui para demonstrar a capacidade de processamento de imagem em JS puro.

// O Jimp usa o Buffer do Node.js internamente, mas a versão 'browser' tenta se adaptar.
// Em Workers, precisamos garantir que o Jimp consiga ler o ArrayBuffer.
// O Jimp.read aceita Buffer, então convertemos o Uint8Array para Buffer.
// O Jimp.getBufferAsync retorna um Buffer, então precisamos converter para ArrayBuffer para o R2.

// Importação do Jimp (certifique-se de que a instalação inclua a compatibilidade com Workers)
// Para Workers, o Jimp é geralmente importado como 'jimp' e o bundler (como o Wrangler) cuida da compatibilidade.
// Se houver problemas, podemos tentar Jimp/browser, mas vamos começar com o padrão.

/**
 * Converte um buffer de imagem para um formato de destino.
 * @param {Uint8Array} fileUint8Array - O buffer da imagem original.
 * @param {string} targetFormat - O formato de destino (ex: 'png', 'jpeg', 'webp').
 * @returns {Promise<ArrayBuffer>} - O buffer da imagem convertida.
 */
export async function convertImage(fileUint8Array, targetFormat) {
    try {
        // Jimp.read aceita um Buffer, então criamos um Buffer a partir do Uint8Array
        const image = await Jimp.read(Buffer.from(fileUint8Array));

        const format = targetFormat.toLowerCase();
        const mime = MIME_TYPES[format];

        if (!mime) {
            throw new Error(`Formato de destino "${targetFormat}" nao suportado.`);
        }

        if (mime === 'image/webp') {
            throw new Error('Conversao para WEBP nao suportada neste ambiente.');
        }
        // Define opções específicas por formato (qualidade para formatos com perdas)
        const options = {};
        if (mime === 'image/jpeg') {
            options.quality = 80;
        }

        // getBufferAsync retorna um Buffer, que tem uma propriedade .buffer que é um ArrayBuffer
        const buffer = await image.getBuffer(mime, options);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    } catch (error) {
        console.error('Erro na conversão de imagem com Jimp:', error);
        throw new Error(`Falha ao converter a imagem: ${error.message}. Verifique se o formato de destino é suportado pelo Jimp.`);
    }
}

// Exportações vazias para manter a interface de serviço, mas removendo as funções não suportadas
export async function convertDocument() {
    throw new Error('Conversão de Documentos não suportada no Cloudflare Worker nesta versão.');
}

export async function convertVideo() {
    throw new Error('Conversão de Vídeo não suportada no Cloudflare Worker nesta versão.');
}

export async function convertAudio() {
    throw new Error('Conversão de Áudio não suportada no Cloudflare Worker nesta versão.');
}

