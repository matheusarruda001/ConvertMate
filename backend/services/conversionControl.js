// --- routes/conversionRoutes.js (MODIFICADO PARA MÚLTIPLOS ARQUIVOS E CATEGORIAS) ---

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { convertImage, convertDocument, convertVideo, convertAudio } = require('./conversionService');
const { compressPDF, compressVideo, compressImage } = require('./compressionService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Definir formatos suportados por categoria
const categoryFormats = {
    documents: {
        formats: ['pdf', 'docx', 'doc', 'xlsx'],
        converter: convertDocument
    },
    images: {
        formats: ['jpeg', 'jpg', 'png', 'webp'],
        converter: convertImage
    },
    videos: {
        formats: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
        converter: convertVideo
    },
    audio: {
        formats: ['mp3', 'wav', 'aac'],
        converter: convertAudio
    },
    compression: {
        formats: {
            // PDFs
            'pdf': compressPDF,
            // Vídeos
            'mp4': compressVideo,
            'avi': compressVideo,
            'mov': compressVideo,
            'mkv': compressVideo,
            'webm': compressVideo,
            // Imagens
            'jpeg': compressImage,
            'jpg': compressImage,
            'png': compressImage,
            'webp': compressImage
        },
        isCompression: true
    }
};

// Armazenamento temporário de sessões (em produção, usar banco de dados)
const sessions = new Map();

// Função para gerar ID de sessão único
function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// NOVA ROTA DE CONVERSÃO MÚLTIPLA COM CATEGORIAS
router.post('/convert-multiple', upload.array('files', 10), async (req, res) => {
    const uploadedFiles = req.files;
    const targetFormat = req.body.targetFormat;
    const category = req.body.category;

    if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    if (!category || !categoryFormats[category]) {
        return res.status(400).json({ error: 'Categoria inválida.' });
    }

    const categoryData = categoryFormats[category];
    const sessionId = generateSessionId();
    const sessionData = {
        id: sessionId,
        category: category,
        files: [],
        createdAt: new Date()
    };

    // Processar cada arquivo
    for (const uploadedFile of uploadedFiles) {
        const fileExtension = path.extname(uploadedFile.originalname).slice(1).toLowerCase();
        const fileData = {
            originalName: uploadedFile.originalname,
            originalFormat: fileExtension,
            targetFormat: targetFormat,
            size: uploadedFile.size,
            status: 'processing',
            filename: null,
            error: null,
            category: category
        };

        try {
            // Verificar se o formato é suportado pela categoria
            if (category === 'compression') {
                // Para compressão, verificar se o formato tem compressor
                if (!categoryData.formats[fileExtension]) {
                    throw new Error(`Formato .${fileExtension} não suportado para compressão`);
                }

                // Executar compressão usando o compressor apropriado
                const compressor = categoryData.formats[fileExtension];
                const outputPath = await compressor(uploadedFile, targetFormat);
                fileData.status = 'success';
                fileData.filename = path.basename(outputPath);
            } else {
                // Lógica normal de conversão
                if (!categoryData.formats.includes(fileExtension)) {
                    throw new Error(`Formato .${fileExtension} não suportado para ${category}`);
                }

                // Verificar se a conversão é possível
                if (!categoryData.formats.includes(targetFormat)) {
                    throw new Error(`Formato de destino .${targetFormat} não suportado para ${category}`);
                }

                // Executar conversão usando o conversor apropriado
                const outputPath = await categoryData.converter(uploadedFile, targetFormat);
                fileData.status = 'success';
                fileData.filename = path.basename(outputPath);
            }

        } catch (error) {
            console.error(`Erro na conversão de ${uploadedFile.originalname}:`, error.message);
            fileData.status = 'error';
            fileData.error = error.message;
        }

        // Limpar arquivo original
        fs.unlink(uploadedFile.path, (err) => {
            if (err) console.error("Erro ao deletar arquivo original:", err);
        });

        sessionData.files.push(fileData);
    }

    // Armazenar sessão
    sessions.set(sessionId, sessionData);

    // Limpar sessões antigas (mais de 1 hora)
    cleanOldSessions();

    res.status(200).json({
        success: true,
        sessionId: sessionId,
        category: category,
        totalFiles: sessionData.files.length,
        successCount: sessionData.files.filter(f => f.status === 'success').length,
        errorCount: sessionData.files.filter(f => f.status === 'error').length
    });
});

// ROTA PARA LISTAR ARQUIVOS DE UMA SESSÃO
router.get('/session/:sessionId/files', (req, res) => {
    const sessionId = req.params.sessionId;
    const sessionData = sessions.get(sessionId);

    if (!sessionData) {
        return res.status(404).json({ 
            success: false, 
            error: 'Sessão não encontrada ou expirada.' 
        });
    }

    res.status(200).json({
        success: true,
        sessionId: sessionId,
        category: sessionData.category,
        files: sessionData.files,
        createdAt: sessionData.createdAt
    });
});

// Função para limpar sessões antigas
function cleanOldSessions() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [sessionId, sessionData] of sessions.entries()) {
        if (sessionData.createdAt < oneHourAgo) {
            // Deletar arquivos da sessão
            sessionData.files.forEach(file => {
                if (file.filename && file.status === 'success') {
                    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Erro ao deletar arquivo expirado:", err);
                    });
                }
            });
            
            // Remover sessão
            sessions.delete(sessionId);
        }
    }
}

// ROTA DE CONVERSÃO ORIGINAL (mantida para compatibilidade)
router.post('/convert', upload.single('file'), async (req, res) => {
    const uploadedFile = req.file;
    const targetFormat = req.body.targetFormat;

    if (!uploadedFile) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const fileExtension = path.extname(uploadedFile.originalname).slice(1).toLowerCase();
    let outputPath;

    try {
        // Determinar categoria baseada na extensão
        let category = null;
        let converter = null;

        for (const [cat, data] of Object.entries(categoryFormats)) {
            if (data.formats.includes(fileExtension)) {
                category = cat;
                converter = data.converter;
                break;
            }
        }

        if (!category || !converter) {
            throw new Error(`Formato .${fileExtension} não suportado.`);
        }

        outputPath = await converter(uploadedFile, targetFormat);

        // Apagar arquivo original
        fs.unlink(uploadedFile.path, (err) => {
            if (err) console.error("Erro ao deletar arquivo original:", err);
        });

        const outputFilename = path.basename(outputPath);
        
        // Responder com JSON contendo URL para download
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

// ROTA DE DOWNLOAD (mantida)
router.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error("Erro ao enviar arquivo para download:", err);
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