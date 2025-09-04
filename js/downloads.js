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

    // Obter sessionId da URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');

    if (!sessionId) {
        showError('ID da sessão não encontrado. Por favor, inicie uma nova conversão.');
        return;
    }

    // Carregar arquivos da sessão
    loadSessionFiles(sessionId);

    // Event listener para download de todos os arquivos
    downloadAllBtn.addEventListener('click', downloadAllFiles);

    async function loadSessionFiles(sessionId) {
        try {
            showLoading();
            
            const response = await fetch(`/api/session/${sessionId}/files`);
            
            if (!response.ok) {
                throw new Error('Falha ao carregar arquivos da sessão');
            }
            
            const data = await response.json();
            
            if (data.success && data.files) {
                displayFiles(data.files);
                showDownloads();
            } else {
                throw new Error(data.error || 'Nenhum arquivo encontrado');
            }
            
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
            showError(error.message);
        }
    }

    function displayFiles(files) {
        downloadsList.innerHTML = '';
        
        let totalFiles = files.length;
        let successFiles = 0;
        let errorFiles = 0;

        files.forEach(file => {
            if (file.status === 'success') {
                successFiles++;
            } else {
                errorFiles++;
            }

            const fileItem = createFileItem(file);
            downloadsList.appendChild(fileItem);
        });

        // Atualizar resumo
        totalFilesSpan.textContent = totalFiles;
        successFilesSpan.textContent = successFiles;
        errorFilesSpan.textContent = errorFiles;

        // Mostrar/esconder botão de download de todos
        downloadAllBtn.style.display = successFiles > 0 ? 'inline-flex' : 'none';
    }

    function createFileItem(file) {
        const item = document.createElement('div');
        item.className = `download-item ${file.status}`;

        const isSuccess = file.status === 'success';
        const iconClass = isSuccess ? 'fa-file-check' : 'fa-file-exclamation';
        const statusText = isSuccess ? 'Convertido' : 'Erro';
        const statusClass = isSuccess ? 'success' : 'error';

        item.innerHTML = `
            <div class="file-info">
                <div class="file-icon ${statusClass}">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="file-details">
                    <h4>${file.originalName}</h4>
                    <div class="file-meta">
                        <span>Tamanho: ${formatFileSize(file.size)}</span>
                        ${isSuccess ? `<span class="conversion-info">${file.originalFormat.toUpperCase()} → ${file.targetFormat.toUpperCase()}</span>` : ''}
                    </div>
                    ${!isSuccess && file.error ? `<div class="error-message">${file.error}</div>` : ''}
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

    async function downloadAllFiles() {
        const downloadLinks = document.querySelectorAll('.download-btn:not([disabled])');
        
        if (downloadLinks.length === 0) {
            alert('Nenhum arquivo disponível para download.');
            return;
        }

        // Desabilitar botão temporariamente
        downloadAllBtn.disabled = true;
        downloadAllBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Baixando...';

        // Fazer download de cada arquivo com um pequeno delay
        for (let i = 0; i < downloadLinks.length; i++) {
            const link = downloadLinks[i];
            
            // Simular clique no link
            link.click();
            
            // Pequeno delay entre downloads para evitar problemas
            if (i < downloadLinks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Reabilitar botão
        setTimeout(() => {
            downloadAllBtn.disabled = false;
            downloadAllBtn.innerHTML = '<i class="fa-solid fa-download"></i> Baixar Todos';
        }, 2000);
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

