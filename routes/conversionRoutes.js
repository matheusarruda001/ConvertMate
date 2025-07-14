// --- routes/conversionRoutes.js (MODIFICADO) ---

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { convertImage, convertDocument } = require('../services/conversionService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const imageFormats = ['jpeg', 'jpg', 'png', 'webp'];
const documentFormats = ['pdf', 'docx'];

// ROTA DE CONVERSÃO - Agora responde com JSON
router.post('/convert', upload.single('file'), async (req, res) => {
    const uploadedFile = req.file;
    const targetFormat = req.body.targetFormat;

    if (!uploadedFile) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const fileExtension = path.extname(uploadedFile.originalname).slice(1).toLowerCase();
    let outputPath;

    try {
        if (imageFormats.includes(fileExtension) && imageFormats.includes(targetFormat)) {
            outputPath = await convertImage(uploadedFile, targetFormat);
        } else if (documentFormats.includes(fileExtension) && documentFormats.includes(targetFormat)) {
            outputPath = await convertDocument(uploadedFile, targetFormat);
        } else {
            throw new Error(`Conversão de .${fileExtension} para .${targetFormat} ainda não é suportada.`);
        }

        // --- MUDANÇA PRINCIPAL ---
        // Apagamos apenas o arquivo original. O convertido fica esperando o download.
        fs.unlink(uploadedFile.path, (err) => {
            if (err) console.error("Erro ao deletar arquivo original:", err);
        });

        const outputFilename = path.basename(outputPath);
        
        // Respondemos com um JSON contendo a URL para a página de download
        res.status(200).json({
            success: true,
            downloadUrl: `/views/download.html?file=${encodeURIComponent(outputFilename)}`
        });

    } catch (error) {
        console.error('Erro no processo de conversão:', error.message);
        fs.unlink(uploadedFile.path, (err) => {
            if (err) console.error("Erro ao deletar arquivo original após falha:", err);
        });
        res.status(500).json({ success: false, error: error.message });
    }
});

// NOVA ROTA DE DOWNLOAD
router.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    // O caminho completo para o arquivo na pasta de uploads
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    // Envia o arquivo para download e, no callback, o deleta do servidor
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error("Erro ao enviar arquivo para download:", err);
            // Se o arquivo não for encontrado (ex: usuário recarregou a página), envia um erro 404
            if (!res.headersSent) {
                res.status(404).send('Arquivo não encontrado. Ele pode ter expirado ou já foi baixado.');
            }
            return;
        }
        
        // Sucesso! O download começou, agora podemos deletar o arquivo.
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error("Erro ao deletar arquivo convertido após download:", unlinkErr);
            } else {
                console.log("Arquivo convertido deletado com sucesso:", filePath);
            }
        });
    });
});

module.exports = router;