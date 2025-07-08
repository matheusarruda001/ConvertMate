// --- services/conversionService.js (VERSÃO FINAL E ROBUSTA) ---

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const os = require('os');
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
    
    // 1. Criar um diretório de perfil de usuário temporário e isolado para o LibreOffice
    const tempProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'libreoffice-profile-'));
    
    // 2. Montar o caminho para o perfil no formato que o LibreOffice espera (URI)
    const userProfilePath = `file://${tempProfileDir.replace(/\\/g, '/')}`;

    // 3. Montar o comando com o novo argumento -env:UserInstallation
    const command = `"${process.env.LIBREOFFICE_PATH || "C:\\Program Files\\LibreOffice\\program\\soffice.exe"}" -env:UserInstallation=${userProfilePath} --headless --convert-to ${targetFormat} --outdir "${outputDir}" "${inputPath}"`;

    try {
        console.log(`Executando comando: ${command}`);
        await execPromise(command);

        const inputFileNameWithoutExt = path.parse(inputFile.filename).name;
        const tempOutputName = `${inputFileNameWithoutExt}.${targetFormat}`;
        const tempOutputPath = path.join(outputDir, tempOutputName);
        
        const originalNameWithoutExt = path.parse(inputFile.originalname).name;
        const finalOutputPath = path.join(outputDir, `${originalNameWithoutExt}.${targetFormat}`);
        
        fs.renameSync(tempOutputPath, finalOutputPath);
        
        console.log('Conversão de documento concluída com sucesso.');
        return finalOutputPath;

    } catch (error) {
        console.error('Erro detalhado do LibreOffice:', error);
        throw new Error('Falha ao converter o documento. Verifique se o LibreOffice está instalado.');
    } finally {
        // 4. Limpeza: Sempre deletar o diretório de perfil temporário, mesmo se houver erro
        if (fs.existsSync(tempProfileDir)) {
            fs.rmSync(tempProfileDir, { recursive: true, force: true });
            console.log(`Diretório de perfil temporário deletado: ${tempProfileDir}`);
        }
    }
}

module.exports = {
    convertImage,
    convertDocument,
};