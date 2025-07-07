// --- services/conversionService.js ---

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

// Transforma a função exec baseada em callback em uma função baseada em Promise
const execPromise = util.promisify(exec);

/**
 * Converte um arquivo de imagem para um formato de destino usando Sharp.
 * @param {object} inputFile - O objeto do arquivo vindo do multer (req.file).
 * @param {string} targetFormat - O formato de destino (ex: 'png', 'webp').
 * @returns {Promise<string>} O caminho para o arquivo de saída convertido.
 */
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

/**
 * Converte um arquivo de documento para um formato de destino usando LibreOffice.
 * @param {object} inputFile - O objeto do arquivo vindo do multer (req.file).
 * @param {string} targetFormat - O formato de destino (ex: 'pdf', 'docx').
 * @returns {Promise<string>} O caminho para o arquivo de saída convertido.
 */
async function convertDocument(inputFile, targetFormat) {
    const outputDir = path.join(__dirname, '..', 'uploads');
    const inputPath = inputFile.path;
    const originalNameWithoutExt = path.parse(inputFile.originalname).name;

    // Comando do LibreOffice para converter
    // Nota: 'soffice' é o executável do LibreOffice no Windows.
    const command = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to ${targetFormat} --outdir "${outputDir}" "${inputPath}"`;
    
    try {
        console.log(`Executando comando: ${command}`);
        await execPromise(command);

        // O LibreOffice mantém o nome do arquivo original, apenas muda a extensão.
        // Precisamos encontrar o nome do arquivo de saída.
        const inputFileNameWithoutExt = path.parse(inputFile.filename).name;
        const expectedOutputName = `${inputFileNameWithoutExt}.${targetFormat}`;
        const outputPath = path.join(outputDir, expectedOutputName);

        // Renomeamos para o nome original do arquivo do usuário para uma melhor UX
        const finalOutputPath = path.join(outputDir, `${originalNameWithoutExt}.${targetFormat}`);
        fs.renameSync(outputPath, finalOutputPath);
        
        console.log('Conversão de documento concluída com sucesso.');
        return finalOutputPath;

    } catch (error) {
        console.error('Erro durante a conversão do documento:', error);
        throw new Error('Falha ao converter o documento. Verifique se o LibreOffice está instalado.');
    }
}

module.exports = {
    convertImage,
    convertDocument,
};