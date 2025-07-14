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
    let selectedFiles = [];

    // Mapeamento de conversões por categoria
    const categoryConversions = {
        documents: {
            title: 'Conversor de Documentos',
            description: 'Converta seus documentos entre diferentes formatos.',
            formats: {
                'pdf': ['docx', 'doc'],
                'docx': ['pdf', 'doc'],
                'doc': ['pdf', 'docx'],
                'xlsx': ['pdf']
            },
            acceptedTypes: '.pdf,.docx,.doc,.xlsx'
        },
        images: {
            title: 'Conversor de Imagens',
            description: 'Transforme suas imagens mantendo a qualidade.',
            formats: {
                'jpeg': ['png', 'jpg', 'webp'],
                'jpg': ['png', 'jpeg', 'webp'],
                'png': ['jpeg', 'jpg', 'webp'],
                'webp': ['png', 'jpg', 'jpeg']
            },
            acceptedTypes: '.jpeg,.jpg,.png,.webp'
        },
        videos: {
            title: 'Conversor de Vídeos',
            description: 'Converta vídeos entre diferentes formatos.',
            formats: {
                'mp4': ['avi', 'mov', 'mkv', 'webm'],
                'avi': ['mp4', 'mov', 'mkv', 'webm'],
                'mov': ['mp4', 'avi', 'mkv', 'webm'],
                'mkv': ['mp4', 'avi', 'mov', 'webm'],
                'webm': ['mp4', 'avi', 'mov', 'mkv']
            },
            acceptedTypes: '.mp4,.avi,.mov,.mkv,.webm'
        },
        audio: {
            title: 'Conversor de Áudio',
            description: 'Transforme seus arquivos de áudio preservando a qualidade.',
            formats: {
                'mp3': ['wav', 'aac'],
                'wav': ['mp3', 'aac'],
                'aac': ['mp3', 'wav']
            },
            acceptedTypes: '.mp3,.wav,.aac'
        }
    };

    // Event listeners para cards de categoria
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            selectCategory(category);
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

        selectedFiles = validFiles;
        fileList.innerHTML = ''; 
        
        selectedFiles.forEach((file, index) => {
            displayFile(file, index);
        });
        
        uploadArea.classList.add('hidden');
        conversionArea.classList.remove('hidden');
        
        // Atualizar opções de conversão baseado no primeiro arquivo
        if (selectedFiles.length > 0) {
            const firstFileExtension = selectedFiles[0].name.split('.').pop().toLowerCase();
            populateConversionOptions(firstFileExtension);
        }
    }

    function displayFile(file, index) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
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
            const indexToRemove = parseInt(e.target.dataset.index);
            removeFile(indexToRemove);
        });
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        
        if (selectedFiles.length === 0) {
            resetUploadArea();
        } else {
            // Re-renderizar lista de arquivos
            fileList.innerHTML = '';
            selectedFiles.forEach((file, newIndex) => {
                displayFile(file, newIndex);
            });
            
            // Atualizar opções de conversão
            const firstFileExtension = selectedFiles[0].name.split('.').pop().toLowerCase();
            populateConversionOptions(firstFileExtension);
        }
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
            possibleFormats.forEach(format => {
                const option = document.createElement('option');
                option.value = format;
                option.textContent = format.toUpperCase();
                targetFormatSelect.appendChild(option);
            });
            convertButton.disabled = false;
        }
    }

    // Lógica de conversão
    convertButton.addEventListener('click', async () => {
        const targetFormat = targetFormatSelect.value;

        if (selectedFiles.length === 0 || !targetFormat || !currentCategory) {
            alert("Por favor, selecione pelo menos um arquivo e um formato de destino.");
            return;
        }

        // Feedback visual
        convertButton.disabled = true;
        convertButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Convertendo...';

        try {
            // Criar FormData para enviar múltiplos arquivos
            const formData = new FormData();
            
            // Adicionar todos os arquivos
            selectedFiles.forEach((file, index) => {
                formData.append('files', file);
            });
            
            formData.append('targetFormat', targetFormat);
            formData.append('category', currentCategory);

            // Enviar para o servidor
            const response = await fetch('/api/convert-multiple', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro no servidor');
            }

            const result = await response.json();
            
            if (result.success && result.sessionId) {
                // Redirecionar para página de downloads
                window.location.href = `/views/downloads.html?session=${result.sessionId}`;
            } else {
                throw new Error(result.error || 'Erro na conversão');
            }

        } catch (error) {
            console.error('Erro na conversão:', error);
            alert(`Ocorreu um erro: ${error.message}`);
        } finally {
            // Reabilitar o botão
            convertButton.disabled = false;
            convertButton.innerHTML = "Converter";
        }
    });
});

// Lógica para esconder/mostrar o header ao rolar a página
document.addEventListener('DOMContentLoaded', () => {
    // A lógica do conversor de arquivos que já existe fica aqui em cima...

    // --- NOVA LÓGICA DO HEADER ---
    const header = document.querySelector('header');
    let lastScrollTop = 0; // Armazena a última posição de rolagem

    window.addEventListener('scroll', function() {
        // Pega a posição atual da rolagem vertical
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            // Rolando para BAIXO
            // Esconde o header movendo-o para cima (fora da tela)
            // A altura do header é de aproximadamente -100px
            header.style.top = '-100px'; 
        } else {
            // Rolando para CIMA
            // Mostra o header novamente
            header.style.top = '0';
        }

        // Atualiza a última posição de rolagem
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
    }, false);
});