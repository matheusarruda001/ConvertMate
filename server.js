// --- server.js ---

// 1. Importar os pacotes necessários
const express = require('express');
const cors = require('cors');
const path = require('path');
const conversionRoutes = require('./routes/conversionRoutes'); // Importa nossas rotas

// 2. Inicializar o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3000; // Define a porta do servidor

// 3. Configurar os Middlewares
app.use(cors()); // Habilita o CORS para todas as requisições
app.use(express.json()); // Permite que o servidor entenda JSON
app.use(express.urlencoded({ extended: true })); // Permite que o servidor entenda dados de formulários

// Servir os arquivos estáticos do front-end
app.use(express.static(path.join(__dirname)));

// 4. Definir as Rotas da API
app.use('/api', conversionRoutes); // Usa o prefixo /api para as rotas de conversão

// Rota principal para servir o index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Rota para servir a página de downloads
app.get("/downloads", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "downloads.html"));
});

// 5. Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor ConvertMate rodando na porta ${PORT}`);
    console.log(`Acesse em http://localhost:${PORT}`);
});