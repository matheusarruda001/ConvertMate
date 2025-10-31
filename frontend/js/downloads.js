// Downloads Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const loadingState = document.getElementById('loading-state');
    const downloadsContainer = document.getElementById('downloads-container');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const downloadsList = document.getElementById('downloads-list');
    const totalFilesSpan = document.getElementById('total-files');
    const successFilesSpan = document.getElementById('success-files');
    const errorFilesSpan = document.getElementById('error-files');
    const downloadAllBtn = document.getElementById('download-all-btn');

    // Obter o nome do arquivo (filename) da URL
    const urlParams = new URLSearchParams(window.location.search);
    const filename = urlParams.get('file');

    // O botão de download de todos não é mais necessário
    if (downloadAllBtn) {
        downloadAllBtn.remove();
    }

    if (!filename) {
        showError('Nome do arquivo não encontrado. Por favor, inicie uma nova conversão.');
        return;
    }

    // Como é um arquivo único, simulamos os dados de uma sessão
    const fileData = {
        filename: filename,
        originalName: filename, // O nome original será obtido pelo Worker
        status: 'success',
        size: 0, // O tamanho será obtido pelo Worker
        originalFormat: '...',
        targetFormat: '...'
    };

    // Exibir o arquivo
    displayFile(fileData);
    showDownloads();

    function displayFile(file) {
        downloadsList.innerHTML = '';
        
        // Atualizar resumo (simulando 1 arquivo)
        totalFilesSpan.textContent = 1;
        successFilesSpan.textContent = 1;
        errorFilesSpan.textContent = 0;

        const fileItem = createFileItem(file);
        downloadsList.appendChild(fileItem);
    }

    function createFileItem(file) {
        const item = document.createElement('div');
        item.className = `download-item ${file.status}`;

        const isSuccess = file.status === 'success';
        const iconClass = isSuccess ? 'fa-file-check' : 'fa-file-exclamation';
        const statusText = isSuccess ? 'Convertido' : 'Erro';
        const statusClass = isSuccess ? 'success' : 'error';

        // O Worker (handleDownload) lidará com o Content-Disposition para fornecer o nome original e o Content-Length para o tamanho.
        // O frontend simplesmente aponta para a rota de download.
        item.innerHTML = `
            <div class="file-info">
                <div class="file-icon ${statusClass}">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="file-details">
                    <h4>${file.originalName}</h4>
                    <div class="file-meta">
                        <span>Tamanho: ${file.size === 0 ? 'Calculando...' : formatFileSize(file.size)}</span>
                        <span class="conversion-info">Pronto para Download</span>
                    </div>
                </div>
            </div>
            <div class="file-status">
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="file-actions">
                ${isSuccess ? 
                    `<a href="/api/download/${file.filename}" class="download-btn" download>
                        <i class="fa-solid fa-download"></i> Baixar
                    </a>` : 
                    `<button class="download-btn" disabled>
                        <i class="fa-solid fa-times"></i> Indisponível
                    </button>`
                }
            </div>
        `;

        return item;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showLoading() {
        loadingState.classList.remove('hidden');
        downloadsContainer.classList.add('hidden');
        errorState.classList.add('hidden');
    }

    function showDownloads() {
        loadingState.classList.add('hidden');
        downloadsContainer.classList.remove('hidden');
        errorState.classList.add('hidden');
    }

    function showError(message) {
        loadingState.classList.add('hidden');
        downloadsContainer.classList.add('hidden');
        errorState.classList.remove('hidden');
        errorMessage.textContent = message;
    }
});
