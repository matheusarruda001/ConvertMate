// --- services/conversionService.js (VERSÃO FINAL E LIMPA) ---

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

    // Usamos os flags de "modo seguro" que se provaram mais estáveis.
    const command = `"${process.env.LIBREOFFICE_PATH || "C:\\Program Files\\LibreOffice\\program\\soffice.exe"}" --headless --invisible --nologo --norestore --convert-to ${targetFormat} --outdir "${outputDir}" "${inputPath}"`;

    try {
        console.log(`Executando comando: ${command}`);
        await execPromise(command);

        // Lógica para renomear o arquivo de saída
        const inputFileNameWithoutExt = path.parse(inputFile.filename).name;
        const tempOutputName = `${inputFileNameWithoutExt}.${targetFormat}`;
        const tempOutputPath = path.join(outputDir, tempOutputName);
        
        const originalNameWithoutExt = path.parse(inputFile.originalname).name;
        const finalOutputPath = path.join(outputDir, `${originalNameWithoutExt}.${targetFormat}`);
        
        // Verifica se o arquivo temporário existe antes de renomear
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
    // O bloco 'finally' foi removido pois não é necessário nesta versão.
}

module.exports = {
    convertImage,
    convertDocument,
};