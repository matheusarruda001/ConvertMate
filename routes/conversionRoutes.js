// --- routes/conversionRoutes.js ---

const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configuração do Multer para salvar os arquivos na pasta /uploads
const upload = multer({ dest: 'uploads/' });

// Rota para lidar com a conversão de arquivos
// POST /api/convert
router.post('/convert', upload.single('file'), (req, res) => {
    // 'upload.single('file')' processa um único arquivo enviado no campo 'file'
    // O arquivo fica disponível em req.file e os outros dados em req.body

    const uploadedFile = req.file;
    const targetFormat = req.body.targetFormat;

    if (!uploadedFile) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    console.log('Arquivo recebido:', uploadedFile.originalname);
    console.log('Converter para:', targetFormat);

    // --- LÓGICA DE CONVERSÃO ENTRARÁ AQUI ---
    // Por enquanto, vamos apenas simular um sucesso.

    res.json({ 
        success: true, 
        message: `Arquivo ${uploadedFile.originalname} recebido. Pronto para converter para ${targetFormat}.` 
    });
});

module.exports = router;