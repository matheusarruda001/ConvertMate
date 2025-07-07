// --- routes/conversionRoutes.js ---

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// Importamos ambas as funções do nosso serviço
const { convertImage, convertDocument } = require('../services/conversionService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Listas de tipos de arquivo suportados por cada conversor
const imageFormats = ['jpeg', 'jpg', 'png', 'webp'];
const documentFormats = ['pdf', 'docx'];

router.post('/convert', upload.single('file'), async (req, res) => {
    const uploadedFile = req.file;
    const targetFormat = req.body.targetFormat;

    if (!uploadedFile) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    // LINHA CORRIGIDA
    const fileExtension = path.extname(uploadedFile.originalname).substring(1).toLowerCase();

    let outputPath;

    try {
        // --- LÓGICA DE DIRECIONAMENTO APRIMORADA ---
        if (imageFormats.includes(fileExtension) && imageFormats.includes(targetFormat)) {
            console.log('Direcionando para o conversor de IMAGEM.');
            outputPath = await convertImage(uploadedFile, targetFormat);

        } else if (documentFormats.includes(fileExtension) && documentFormats.includes(targetFormat)) {
            console.log('Direcionando para o conversor de DOCUMENTO.');
            outputPath = await convertDocument(uploadedFile, targetFormat);

        } else {
            // Se não for uma conversão suportada, retorna um erro.
            throw new Error(`Conversão de .${fileExtension} para .${targetFormat} ainda não é suportada.`);
        }

        // Se a conversão foi bem-sucedida, envia o arquivo para download
        res.download(outputPath, (err) => {
            if (err) {
                console.error('Erro ao enviar o arquivo para download:', err);
            }

            // --- LIMPEZA DOS ARQUIVOS ---
            fs.unlink(uploadedFile.path, (err) => {
                if (err) console.error("Erro ao deletar arquivo original:", err);
                else console.log("Arquivo original deletado:", uploadedFile.path);
            });
            fs.unlink(outputPath, (err) => {
                if (err) console.error("Erro ao deletar arquivo convertido:", err);
                else console.log("Arquivo convertido deletado:", outputPath);
            });
        });

    } catch (error) {
        console.error('Erro no processo de conversão:', error.message);
        res.status(500).json({ success: false, error: error.message });

        fs.unlink(uploadedFile.path, (err) => {
            if (err) console.error("Erro ao deletar arquivo original após falha:", err);
        });
    }
});

module.exports = router;