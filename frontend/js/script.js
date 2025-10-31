// --- frontend/js/script.js ---

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
    // Selecionando os elementos do DOM
    const categoriesSection = document.getElementById('categories-section');
    const converterSection = document.getElementById('converter-section');
    const categoryCards = document.querySelectorAll('.category-card');
    const backButton = document.getElementById('back-to-categories');
    const converterTitle = document.getElementById('converter-title');
    const converterDescription = document.getElementById('converter-description');
    
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const conversionArea = document.getElementById('conversion-area');
    const fileList = document.getElementById('file-list');
    const targetFormatSelect = document.getElementById('target-format');
    const convertButton = document.getElementById('convert-button');

    // Variável para armazenar categoria atual e arquivos selecionados
    let currentCategory = null;
    let selectedFiles = []; // Usaremos apenas o primeiro arquivo

    // Mapeamento de conversões por categoria (simplificado para Imagens/Compressão)
    // Apenas conversões de imagem estão ativas nesta versão
    const categoryConversions = {
        images: {
            title: 'Conversor de Imagens',
            description: 'Transforme suas imagens mantendo a qualidade.',
            formats: {
                'jpeg': ['png', 'jpg'],
                'jpg': ['png', 'jpeg'],
                'png': ['jpeg', 'jpg'],
                // 'webp': ['png', 'jpg', 'jpeg'] - Nao suportado pelo workers da cloudflare
            },
            acceptedTypes: '.jpeg,.jpg,.png,.webp'
        },
        compression: {
            title: 'Diminuir Tamanho',
            description: 'Reduza o tamanho de suas imagens mantendo qualidade aceitável.',
            formats: {
                'jpeg': ['low', 'medium', 'high'],
                'jpg': ['low', 'medium', 'high'],
                'png': ['low', 'medium', 'high']
            },
            acceptedTypes: '.jpeg,.jpg,.png',
            isCompression: true
        }
    };

    // Event listeners para cards de categoria
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            // Ignorar categorias não implementadas (documentos, áudio, vídeo)
            if (categoryConversions[category]) {
                selectCategory(category);
            } else {
                alert('Esta categoria será implementada em breve!');
            }
        });
    });

    // Event listener para botão voltar
    backButton.addEventListener('click', () => {
        showCategories();
    });

    function selectCategory(category) {
        currentCategory = category;
        const categoryData = categoryConversions[category];
        
        // Atualizar título e descrição
        converterTitle.textContent = categoryData.title;
        converterDescription.textContent = categoryData.description;
        
        // Atualizar texto do botão baseado na categoria
        const isCompression = categoryData.isCompression;
        convertButton.textContent = isCompression ? 'Comprimir' : 'Converter';
        
        // Configurar tipos aceitos no input
        fileInput.setAttribute('accept', categoryData.acceptedTypes);
        
        // Mostrar seção de conversão
        categoriesSection.classList.add('hidden');
        converterSection.classList.remove('hidden');
        
        // Reset do estado
        resetUploadArea();
    }

    function showCategories() {
        categoriesSection.classList.remove('hidden');
        converterSection.classList.add('hidden');
        currentCategory = null;
        resetUploadArea();
    }

    function resetUploadArea() {
        selectedFiles = [];
        fileList.innerHTML = '';
        fileInput.value = '';
        uploadArea.classList.remove('hidden');
        conversionArea.classList.add('hidden');
    }

    // Evento de mudança no input de arquivo
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Eventos de Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        if (files.length === 0 || !currentCategory) return;
        
        // Filtrar arquivos baseado na categoria
        const categoryData = categoryConversions[currentCategory];
        const validFiles = Array.from(files).filter(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            return Object.keys(categoryData.formats).includes(extension);
        });

        if (validFiles.length === 0) {
            alert(`Por favor, selecione arquivos válidos para ${categoryData.title.toLowerCase()}.`);
            return;
        }

        // Simplificação: Apenas o primeiro arquivo é processado
        selectedFiles = [validFiles[0]];
        fileList.innerHTML = ''; 
        
        displayFile(selectedFiles[0], 0);
        
        uploadArea.classList.add('hidden');
        conversionArea.classList.remove('hidden');
        
        // Atualizar opções de conversão
        const firstFileExtension = selectedFiles[0].name.split('.').pop().toLowerCase();
        populateConversionOptions(firstFileExtension);
    }

    function displayFile(file, index) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.index = index;
        const fileSize = (file.size / 1024 / 1024).toFixed(2); // em MB

        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fa-solid fa-file"></i>
                <div>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${fileSize} MB</span>
                </div>
            </div>
            <button class="remove-file" title="Remover arquivo" data-index="${index}">×</button>
        `;
        
        fileList.appendChild(fileItem);
        
        fileItem.querySelector('.remove-file').addEventListener('click', (e) => {
            removeFile(0); // Sempre remove o único arquivo
        });
    }

    function removeFile(index) {
        selectedFiles = [];
        resetUploadArea();
    }
    
    function populateConversionOptions(extension) {
        targetFormatSelect.innerHTML = '';
        
        if (!currentCategory) return;
        
        const categoryData = categoryConversions[currentCategory];
        const possibleFormats = categoryData.formats[extension] || [];
        
        if (possibleFormats.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'Nenhuma conversão disponível';
            targetFormatSelect.appendChild(option);
            convertButton.disabled = true;
        } else {
            // Se for categoria de compressão, mostrar opções de qualidade
            if (categoryData.isCompression) {
                const qualityOptions = [
                    { value: 'low', text: 'Baixa Compressão (melhor qualidade)' },
                    { value: 'medium', text: 'Compressão Média (balanceada)' },
                    { value: 'high', text: 'Alta Compressão (menor tamanho)' }
                ];
                
                qualityOptions.forEach(quality => {
                    const option = document.createElement('option');
                    option.value = quality.value;
                    option.textContent = quality.text;
                    targetFormatSelect.appendChild(option);
                });
                
                // Atualizar label para compressão
                const label = document.querySelector('label[for="target-format"]');
                if (label) {
                    label.textContent = 'Nível de compressão:';
                }
                
                // Adicionar informações sobre compressão
                addCompressionInfo();
            } else {
                // Lógica normal para conversão
                possibleFormats.forEach(format => {
                    const option = document.createElement('option');
                    option.value = format;
                    option.textContent = format.toUpperCase();
                    targetFormatSelect.appendChild(option);
                });
                
                // Restaurar label para conversão
                const label = document.querySelector('label[for="target-format"]');
                if (label) {
                    label.textContent = 'Converter para:';
                }
                
                // Remover informações de compressão se existirem
                removeCompressionInfo();
            }
            convertButton.disabled = false;
        }
    }

    function addCompressionInfo() {
        // Remover info existente
        removeCompressionInfo();
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'compression-info';
        infoDiv.id = 'compression-info';
        
        infoDiv.innerHTML = `
            <h4>Informações sobre Compressão</h4>
            <p><strong>Baixa Compressão:</strong> Reduz o tamanho em 10-30% mantendo alta qualidade</p>
            <p><strong>Compressão Média:</strong> Reduz o tamanho em 30-60% com qualidade balanceada</p>
            <p><strong>Alta Compressão:</strong> Reduz o tamanho em 50-80% com qualidade reduzida</p>
        `;
        
        const formatWrapper = document.querySelector('.format-select-wrapper');
        if (formatWrapper) {
            formatWrapper.appendChild(infoDiv);
        }
    }

    function removeCompressionInfo() {
        const existingInfo = document.getElementById('compression-info');
        if (existingInfo) {
            existingInfo.remove();
        }
    }

    // Lógica de conversão
    convertButton.addEventListener('click', async () => {
        const targetFormat = targetFormatSelect.value;
        const fileToUpload = selectedFiles[0];

        if (!fileToUpload || !targetFormat || !currentCategory) {
            alert("Por favor, selecione um arquivo e um formato de destino.");
            return;
        }

        // Feedback visual
        convertButton.disabled = true;
        const isCompression = categoryConversions[currentCategory]?.isCompression;
        const buttonText = isCompression ? 'Comprimindo...' : 'Convertendo...';
        convertButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${buttonText}`;

        try {
            // Criar FormData para enviar o arquivo
            const formData = new FormData();
            formData.append('file', fileToUpload); // Apenas um arquivo
            
            // Para compressão, o targetFormat é o nível de qualidade (low, medium, high)
            // Para conversão, é o formato (png, jpg, etc.)
            formData.append('targetFormat', targetFormat);
            formData.append('category', currentCategory);

            // Enviar para o servidor (nova rota /api/convert)
            const response = await fetch(`${API_BASE_URL}/api/convert`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    throw new Error(`Erro desconhecido: ${errorText}`);
                }
                throw new Error(errorData.error || 'Erro no servidor');
            }

            const result = await response.json();
            
            if (result.success && result.downloadFilename) {
                const downloadNameParam = result.downloadName || result.originalName || result.downloadFilename;
                const query = new URLSearchParams({
                    file: result.downloadFilename,
                    name: downloadNameParam,
                });
                if (result.size) {
                    query.set('size', String(result.size));
                }
                if (result.originalName) {
                    query.set('original', result.originalName);
                }
                if (result.contentType) {
                    query.set('type', result.contentType);
                }
                window.location.href = `/downloads.html?${query.toString()}`;
            } else {
                throw new Error(result.error || 'Erro na conversão');
            }

        } catch (error) {
            console.error('Erro na conversão:', error);
            alert(`Ocorreu um erro: ${error.message}`);
        } finally {
            // Reabilitar o botão
            convertButton.disabled = false;
            const isCompression = categoryConversions[currentCategory]?.isCompression;
            const buttonText = isCompression ? 'Comprimir' : 'Converter';
            convertButton.innerHTML = buttonText;
        }
    });
});

// Lógica para esconder/mostrar o header ao rolar a página
document.addEventListener('DOMContentLoaded', () => {
    // A lógica do conversor de arquivos que já existe fica aqui em cima...

    // --- NOVA LÓGICA DO HEADER ---
    const header = document.querySelector('header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            // Scroll down
            header.style.top = '-100px'; // Esconde o header
        } else {
            // Scroll up
            header.style.top = '0'; // Mostra o header
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Para evitar números negativos
    });
});

