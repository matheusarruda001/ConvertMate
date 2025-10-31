// --- services/compressionService.js ---

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function compressPDF(inputFile, quality) {
    try {
        const outputFileName = `${path.parse(inputFile.originalname).name}_compressed.pdf`;
        const outputPath = path.join('uploads', outputFileName);
        const inputPath = path.resolve(inputFile.path);
        const fullOutputPath = path.resolve(outputPath);

        // Configurações de qualidade para Ghostscript
        let pdfSettings = '';
        switch (quality) {
            case 'low':
                pdfSettings = '/printer'; // Melhor qualidade, menor compressão
                break;
            case 'medium':
                pdfSettings = '/ebook'; // Qualidade média
                break;
            case 'high':
                pdfSettings = '/screen'; // Menor qualidade, maior compressão
                break;
            default:
                pdfSettings = '/ebook';
        }

        const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${pdfSettings} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${fullOutputPath}" "${inputPath}"`;
        
        console.log(`Executando comando de compressão PDF: ${command}`);
        
        const { stdout, stderr } = await execPromise(command, { timeout: 60000 }); // 1 minuto
        
        if (fs.existsSync(fullOutputPath)) {
            console.log('Compressão de PDF concluída com sucesso.');
            return outputPath;
        } else {
            throw new Error('Arquivo PDF comprimido não foi gerado.');
        }

    } catch (error) {
        console.error('Erro durante a compressão do PDF:', error);
        throw new Error(`Falha ao comprimir o PDF: ${error.message}`);
    }
}

async function compressVideo(inputFile, quality) {
    try {
        const outputFileName = `${path.parse(inputFile.originalname).name}_compressed.mp4`;
        const outputPath = path.join('uploads', outputFileName);
        const inputPath = path.resolve(inputFile.path);
        const fullOutputPath = path.resolve(outputPath);

        // Configurações de CRF baseadas na qualidade
        let crf = '';
        let preset = '';
        
        switch (quality) {
            case 'low':
                crf = '20'; // Melhor qualidade, menor compressão
                preset = 'slow';
                break;
            case 'medium':
                crf = '26'; // Qualidade média
                preset = 'medium';
                break;
            case 'high':
                crf = '32'; // Menor qualidade, maior compressão
                preset = 'fast';
                break;
            default:
                crf = '26';
                preset = 'medium';
        }

        const command = `ffmpeg -i "${inputPath}" -c:v libx264 -crf ${crf} -preset ${preset} -c:a aac -b:a 128k "${fullOutputPath}" -y`;
        
        console.log(`Executando comando de compressão de vídeo: ${command}`);
        
        // Vídeos podem demorar mais, então aumentamos o timeout
        const { stdout, stderr } = await execPromise(command, { timeout: 600000 }); // 10 minutos
        
        if (fs.existsSync(fullOutputPath)) {
            console.log('Compressão de vídeo concluída com sucesso.');
            return outputPath;
        } else {
            throw new Error('Arquivo de vídeo comprimido não foi gerado.');
        }

    } catch (error) {
        console.error('Erro durante a compressão do vídeo:', error);
        throw new Error(`Falha ao comprimir o vídeo: ${error.message}`);
    }
}

async function compressImage(inputFile, quality) {
    try {
        const fileExtension = path.extname(inputFile.originalname).toLowerCase();
        const outputFileName = `${path.parse(inputFile.originalname).name}_compressed${fileExtension}`;
        const outputPath = path.join('uploads', outputFileName);
        const fullOutputPath = path.resolve(outputPath);

        // Configurações de qualidade
        let qualityValue = 75;
        let pngQuality = 80;
        
        switch (quality) {
            case 'low':
                qualityValue = 90; // Melhor qualidade, menor compressão
                pngQuality = 95;
                break;
            case 'medium':
                qualityValue = 75; // Qualidade média
                pngQuality = 80;
                break;
            case 'high':
                qualityValue = 60; // Menor qualidade, maior compressão
                pngQuality = 65;
                break;
            default:
                qualityValue = 75;
                pngQuality = 80;
        }

        let sharpInstance = sharp(inputFile.path);

        // Aplicar compressão baseada no formato
        if (fileExtension === '.png' || fileExtension === '.webp') {
            if (fileExtension === '.png') {
                sharpInstance = sharpInstance.png({ 
                    quality: pngQuality,
                    compressionLevel: quality === 'high' ? 9 : quality === 'medium' ? 6 : 3
                });
            } else {
                sharpInstance = sharpInstance.webp({ quality: qualityValue });
            }
        } else {
            // JPEG/JPG
            sharpInstance = sharpInstance.jpeg({ quality: qualityValue });
        }

        await sharpInstance.toFile(fullOutputPath);
        
        if (fs.existsSync(fullOutputPath)) {
            console.log('Compressão de imagem concluída com sucesso.');
            return outputPath;
        } else {
            throw new Error('Arquivo de imagem comprimido não foi gerado.');
        }

    } catch (error) {
        console.error('Erro durante a compressão da imagem:', error);
        throw new Error(`Falha ao comprimir a imagem: ${error.message}`);
    }
}

module.exports = {
    compressPDF,
    compressVideo,
    compressImage,
};

