// Downloads Page JavaScript

const DEFAULT_API_BASE_URL = (() => {
    const origin = window.location.origin;
    if (
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('http://localhost:8787')
    ) {
        return origin;
    }
    return 'https://convertmate-backend.matheus-arruda-ribeiro.workers.dev';
})();

const API_BASE_URL = window.CONVERTMATE_API_BASE_URL || DEFAULT_API_BASE_URL;

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
    const displayNameParam = urlParams.get('name');
    const sizeParam = urlParams.get('size');
    const originalNameParam = urlParams.get('original');
    const contentTypeParam = urlParams.get('type');

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
        originalName: displayNameParam || filename,
        downloadName: displayNameParam || filename,
        displayName: displayNameParam || filename,
        status: 'success',
        size: sizeParam ? Number(sizeParam) : 0,
        originalNameRaw: originalNameParam || '',
        contentType: contentTypeParam || ''
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
        const statusText = isSuccess ? 'Convertido' : 'Erro';
        const statusClass = isSuccess ? 'success' : 'error';
        const displayName = file.displayName || file.downloadName || file.originalName || file.filename;
        const iconClasses = isSuccess ? 'fa-regular fa-file-image' : 'fa-solid fa-triangle-exclamation';
        const sizeText = file.size && !Number.isNaN(file.size) && file.size > 0
            ? formatFileSize(file.size)
            : '—';
        const metaParts = [];
        metaParts.push(`Tamanho: ${sizeText}`);
        if (file.contentType) {
            metaParts.push(file.contentType);
        }

        // O Worker (handleDownload) lidará com o Content-Disposition para fornecer o nome original e o Content-Length para o tamanho.
        // O frontend simplesmente aponta para a rota de download.
        item.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="${iconClasses}"></i>
                </div>
                <div class="file-details">
                    <h4>${displayName}</h4>
                    <div class="file-meta">
                        <span>${metaParts.join(' • ')}</span>
                        <span class="conversion-info">Pronto para download</span>
                    </div>
                </div>
            </div>
            <div class="file-status">
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="file-actions">
                ${
                    isSuccess
                        ? `<a href="${API_BASE_URL}/api/download/${file.filename}" class="download-btn" download="${file.downloadName || ''}">
                            <i class="fa-solid fa-download"></i> Baixar
                        </a>`
                        : `<button class="download-btn" disabled>
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
