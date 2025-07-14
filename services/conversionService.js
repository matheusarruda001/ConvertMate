// --- services/conversionService.js (VERSÃO EXPANDIDA COM VÍDEO E ÁUDIO) ---

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function convertImage(inputFile, targetFormat) {
    try {
        const outputFileName = `${path.parse(inputFile.originalname).name}.${targetFormat}`;
        const outputPath = path.join('uploads', outputFileName);
        await sharp(inputFile.path).toFormat(targetFormat).toFile(outputPath);
        console.log('Conversão de imagem concluída com sucesso.');
        return outputPath;
    } catch (error) {
        console.error('Erro durante a conversão da imagem:', error);
        throw new Error('Falha ao converter a imagem.');
    }
}

async function convertDocument(inputFile, targetFormat) {
    const outputDir = path.resolve('uploads');
    const inputPath = path.resolve(inputFile.path);

    // No Linux, o comando é simplesmente 'soffice'.
    const command = `soffice --headless --invisible --nologo --norestore --convert-to ${targetFormat} --outdir "${outputDir}" "${inputPath}"`;

    try {
        console.log(`Executando comando: ${command}`);
        await execPromise(command);

        // Lógica para renomear o arquivo de saída
        const inputFileNameWithoutExt = path.parse(inputFile.filename).name;
        const tempOutputName = `${inputFileNameWithoutExt}.${targetFormat}`;
        const tempOutputPath = path.join(outputDir, tempOutputName);
        
        const originalNameWithoutExt = path.parse(inputFile.originalname).name;
        const finalOutputPath = path.join(outputDir, `${originalNameWithoutExt}.${targetFormat}`);
        
        if (fs.existsSync(tempOutputPath)) {
            fs.renameSync(tempOutputPath, finalOutputPath);
            console.log('Conversão de documento concluída com sucesso.');
            return finalOutputPath;
        } else {
            throw new Error(`Arquivo de saída não encontrado após a conversão: ${tempOutputPath}`);
        }

    } catch (error) {
        console.error('Erro detalhado do LibreOffice:', error);
        throw new Error('Falha ao converter o documento. Verifique a instalação do LibreOffice.');
    }
}

async function convertVideo(inputFile, targetFormat) {
    try {
        const outputFileName = `${path.parse(inputFile.originalname).name}.${targetFormat}`;
        const outputPath = path.join('uploads', outputFileName);
        const inputPath = path.resolve(inputFile.path);
        const fullOutputPath = path.resolve(outputPath);

        // Configurações de conversão baseadas no formato de destino
        let ffmpegOptions = '';
        
        switch (targetFormat.toLowerCase()) {
            case 'mp4':
                ffmpegOptions = '-c:v libx264 -c:a aac -preset fast -crf 23';
                break;
            case 'avi':
                ffmpegOptions = '-c:v libx264 -c:a mp3 -preset fast';
                break;
            case 'mov':
                ffmpegOptions = '-c:v libx264 -c:a aac -preset fast';
                break;
            case 'mkv':
                ffmpegOptions = '-c:v libx264 -c:a aac -preset fast';
                break;
            case 'webm':
                ffmpegOptions = '-c:v libvpx-vp9 -c:a libopus -preset fast';
                break;
            default:
                ffmpegOptions = '-c:v libx264 -c:a aac -preset fast';
        }

        const command = `ffmpeg -i "${inputPath}" ${ffmpegOptions} "${fullOutputPath}" -y`;
        
        console.log(`Executando comando de vídeo: ${command}`);
        
        // FFmpeg pode demorar, então aumentamos o timeout
        const { stdout, stderr } = await execPromise(command, { timeout: 300000 }); // 5 minutos
        
        if (fs.existsSync(fullOutputPath)) {
            console.log('Conversão de vídeo concluída com sucesso.');
            return outputPath;
        } else {
            throw new Error('Arquivo de vídeo não foi gerado.');
        }

    } catch (error) {
        console.error('Erro durante a conversão do vídeo:', error);
        throw new Error(`Falha ao converter o vídeo: ${error.message}`);
    }
}

async function convertAudio(inputFile, targetFormat) {
    try {
        const outputFileName = `${path.parse(inputFile.originalname).name}.${targetFormat}`;
        const outputPath = path.join('uploads', outputFileName);
        const inputPath = path.resolve(inputFile.path);
        const fullOutputPath = path.resolve(outputPath);

        // Configurações de conversão baseadas no formato de destino
        let ffmpegOptions = '';
        
        switch (targetFormat.toLowerCase()) {
            case 'mp3':
                ffmpegOptions = '-c:a libmp3lame -b:a 192k';
                break;
            case 'wav':
                ffmpegOptions = '-c:a pcm_s16le';
                break;
            case 'aac':
                ffmpegOptions = '-c:a aac -b:a 192k';
                break;
            default:
                ffmpegOptions = '-c:a libmp3lame -b:a 192k';
        }

        const command = `ffmpeg -i "${inputPath}" ${ffmpegOptions} "${fullOutputPath}" -y`;
        
        console.log(`Executando comando de áudio: ${command}`);
        
        const { stdout, stderr } = await execPromise(command, { timeout: 120000 }); // 2 minutos
        
        if (fs.existsSync(fullOutputPath)) {
            console.log('Conversão de áudio concluída com sucesso.');
            return outputPath;
        } else {
            throw new Error('Arquivo de áudio não foi gerado.');
        }

    } catch (error) {
        console.error('Erro durante a conversão do áudio:', error);
        throw new Error(`Falha ao converter o áudio: ${error.message}`);
    }
}

module.exports = {
    convertImage,
    convertDocument,
    convertVideo,
    convertAudio,
};