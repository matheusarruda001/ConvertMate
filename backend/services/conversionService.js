// --- backend/services/conversionService.js ---

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

        let mime;
        switch (targetFormat.toLowerCase()) {
            case 'png':
                mime = Jimp.MIME_PNG;
                break;
            case 'jpg':
            case 'jpeg':
                mime = Jimp.MIME_JPEG;
                break;
            case 'webp':
                // O Jimp pode precisar de um plugin (como jimp-compact-webp) para WebP,
                // mas vamos assumir que a versão padrão é suficiente para formatos comuns.
                // Se falhar, o usuário precisará instalar o plugin.
                mime = 'image/webp';
                break;
            case 'gif':
                mime = Jimp.MIME_GIF;
                break;
            case 'bmp':
                mime = Jimp.MIME_BMP;
                break;
            default:
                throw new Error(`Formato de destino "${targetFormat}" não suportado.`);
        }

        // Se for JPEG, podemos aplicar uma qualidade padrão de 80
        if (mime === Jimp.MIME_JPEG) {
            image.quality(80);
        }

        // getBufferAsync retorna um Buffer, que tem uma propriedade .buffer que é um ArrayBuffer
        const buffer = await image.getBufferAsync(mime);
        return buffer.buffer;

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
