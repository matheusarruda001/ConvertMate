# ConvertMate - Conversor de Arquivos Online

![ConvertMate Logo](https://private-us-east-1.manuscdn.com/sessionFile/vtcMydLbrtwpJEMeeSqs74/sandbox/S22XlwCEAuBtLTT2wn77cq-images_1757632023575_na1fn_L2hvbWUvdWJ1bnR1L0NvbnZlcnRNYXRlL2ltZy9sb2dv.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdnRjTXlkTGJydHdwSkVNZWVTcXM3NC9zYW5kYm94L1MyMlhsd0NFQXVCdExUVDJ3bjc3Y3EtaW1hZ2VzXzE3NTc2MzIwMjM1NzVfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwwTnZiblpsY25STllYUmxMMmx0Wnk5c2IyZHYucG5nIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=LOvPWLpuUj9-gea0N230lL3EllZv5iAkZUcDcBmGq-DOOV8Vjht9ixehsRsRLYWvmxj5BDrzozv9oKL2~j9uC9XzZcJTW6izw06tw7WosVFdEQn-R5NGV40HsEvN5OF-FJYO9DFV7~VHEpjZkY3hD5Dnz3NFyj1RdAayOuGf2laPSno4thyfDbCU4z6fCc3qi53qNPUQlxtHbG1rmAOBJ7zKq3p3Z7Zc5gRBccpixyhpUJU9zEcf4CZjG8002iAOTS7lUEUvl4R7yC3xAM611LR11dBaYJcpbotN3cpU~y2on32zVASCXXtV9cLgYwmOjaGife7ID35VPBdUNrlYjQ__)

ConvertMate é uma aplicação web completa para conversão e compressão de arquivos online. Suporta múltiplos formatos de documentos, imagens, vídeos e áudios, oferecendo uma interface intuitiva e processamento rápido.

## 🚀 Funcionalidades

### Conversão de Arquivos
- **Documentos**: PDF ↔ DOCX ↔ DOC ↔ XLSX
- **Imagens**: PNG ↔ JPG ↔ JPEG ↔ WEBP
- **Vídeos**: MP4 ↔ AVI ↔ MOV ↔ MKV ↔ WEBM
- **Áudios**: MP3 ↔ WAV ↔ AAC

### Compressão de Arquivos
- **PDFs**: Redução de tamanho com diferentes níveis de qualidade
- **Imagens**: Compressão inteligente mantendo qualidade visual
- **Vídeos**: Otimização de tamanho com controle de qualidade

### Características Principais
- ✅ Interface web responsiva e intuitiva
- ✅ Processamento de múltiplos arquivos simultaneamente
- ✅ Três níveis de compressão (Baixa, Média, Alta)
- ✅ Sistema de sessões para gerenciar downloads
- ✅ API RESTful para integração
- ✅ Limpeza automática de arquivos temporários
- ✅ Suporte a drag & drop
- ✅ Feedback visual em tempo real

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Multer** - Upload de arquivos
- **Sharp** - Processamento de imagens
- **FFmpeg** - Processamento de vídeos
- **Ghostscript** - Processamento de PDFs

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização responsiva
- **JavaScript (ES6+)** - Interatividade
- **Font Awesome** - Ícones

## 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- **Node.js** (versão 14 ou superior)
- **npm** (gerenciador de pacotes do Node.js)
- **FFmpeg** (para conversão de vídeos)
- **Ghostscript** (para processamento de PDFs)

### Instalação das Dependências do Sistema

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y ffmpeg ghostscript
```

#### macOS (usando Homebrew)
```bash
brew install ffmpeg ghostscript
```

#### Windows
- Baixe e instale o FFmpeg do site oficial
- Baixe e instale o Ghostscript do site oficial

## 🚀 Instalação e Execução

1. **Clone o repositório**
```bash
git clone https://github.com/matheusarruda001/ConvertMate.git
cd ConvertMate
```

2. **Instale as dependências do Node.js**
```bash
npm install
```

3. **Crie o diretório de uploads**
```bash
mkdir -p uploads
```

4. **Execute o servidor**
```bash
npm start
# ou
node server.js
```

5. **Acesse a aplicação**
Abra seu navegador e vá para: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
ConvertMate/
├── server.js                 # Servidor principal
├── package.json              # Dependências e scripts
├── README.md                 # Documentação
├── routes/
│   └── conversionRoutes.js   # Rotas da API
├── services/
│   ├── conversionService.js  # Lógica de conversão
│   └── compressionService.js # Lógica de compressão
├── views/
│   ├── index.html           # Página principal
│   └── downloads.html       # Página de downloads
├── js/
│   ├── script.js            # JavaScript principal
│   └── downloads.js         # JavaScript da página de downloads
├── public/                  # Arquivos estáticos
├── img/                     # Imagens do projeto
└── uploads/                 # Diretório temporário para arquivos
```

## 🔧 API Endpoints

### Conversão de Arquivos

#### POST `/api/convert-multiple`
Converte múltiplos arquivos para um formato específico.

**Parâmetros:**
- `files`: Array de arquivos (multipart/form-data)
- `targetFormat`: Formato de destino
- `category`: Categoria do arquivo (documents, images, videos, audio)

**Resposta:**
```json
{
  "success": true,
  "sessionId": "abc123",
  "category": "images",
  "totalFiles": 2,
  "successCount": 2,
  "errorCount": 0
}
```

#### POST `/api/compress`
Comprime arquivos com diferentes níveis de qualidade.

**Parâmetros:**
- `files`: Array de arquivos (multipart/form-data)
- `targetFormat`: Nível de compressão (low, medium, high)

**Resposta:**
```json
{
  "success": true,
  "sessionId": "def456",
  "category": "compression",
  "totalFiles": 1,
  "successCount": 1,
  "errorCount": 0
}
```

### Gerenciamento de Sessões

#### GET `/api/session/:sessionId/files`
Retorna informações sobre os arquivos de uma sessão.

**Resposta:**
```json
{
  "success": true,
  "sessionId": "abc123",
  "category": "images",
  "files": [
    {
      "originalName": "foto.jpg",
      "originalFormat": "jpg",
      "targetFormat": "png",
      "size": 1024000,
      "status": "success",
      "filename": "foto_converted.png",
      "error": null,
      "category": "images"
    }
  ],
  "createdAt": "2025-09-11T23:00:00.000Z"
}
```

### Downloads

#### GET `/api/download/:filename`
Faz download de um arquivo convertido.

## 💡 Como Usar

### Interface Web

1. **Escolha a Categoria**: Selecione o tipo de arquivo (Documentos, Imagens, Vídeos, Áudio ou Compressão)

2. **Envie os Arquivos**: 
   - Clique em "Escolher Arquivos" ou
   - Arraste e solte os arquivos na área indicada

3. **Selecione o Formato**: 
   - Para conversão: escolha o formato de destino
   - Para compressão: escolha o nível de qualidade

4. **Processe**: Clique em "Converter" ou "Comprimir"

5. **Baixe os Resultados**: Acesse a página de downloads para baixar os arquivos processados

### Níveis de Compressão

- **Baixa Compressão**: Reduz 10-30% do tamanho, mantendo alta qualidade
- **Compressão Média**: Reduz 30-60% do tamanho, qualidade balanceada
- **Alta Compressão**: Reduz 60-80% do tamanho, menor qualidade

## 🔒 Segurança

- Arquivos são automaticamente removidos após 1 hora
- Validação de tipos de arquivo no frontend e backend
- Limpeza automática de sessões expiradas
- Sanitização de nomes de arquivos

## 🐛 Solução de Problemas

### Erro "Opção inválida" na compressão
- **Causa**: Problema corrigido na versão atual
- **Solução**: Certifique-se de usar a versão mais recente do código

### Erro de dependências
```bash
# Reinstale as dependências
npm install

# Verifique se FFmpeg e Ghostscript estão instalados
ffmpeg -version
gs --version
```

### Problemas de permissão
```bash
# Certifique-se de que o diretório uploads existe e tem permissões
mkdir -p uploads
chmod 755 uploads
```

## 📈 Melhorias Futuras

- [ ] Suporte a mais formatos de arquivo
- [ ] Interface de administração
- [ ] Autenticação de usuários
- [ ] Histórico de conversões
- [ ] API de webhook para notificações
- [ ] Processamento em lote via linha de comando
- [ ] Integração com serviços de nuvem

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Matheus Arruda**
- GitHub: [@matheusarruda001](https://github.com/matheusarruda001)

## 🙏 Agradecimentos

- Comunidade Node.js
- Desenvolvedores do Sharp, FFmpeg e Ghostscript
- Todos os contribuidores do projeto

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!

