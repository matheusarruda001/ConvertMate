// --- START OF FILE js/script.js ---

document.addEventListener('DOMContentLoaded', () => {
    // Selecionando os elementos do DOM
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const conversionArea = document.getElementById('conversion-area');
    const fileList = document.getElementById('file-list');
    const targetFormatSelect = document.getElementById('target-format');
    const convertButton = document.getElementById('convert-button');

    // Mapeamento de conversões possíveis
    const conversionMap = {
        'pdf': ['docx', 'jpeg', 'png'],
        'docx': ['pdf'],
        'mkv': ['mp4'],
        'mov': ['mp4'],
        'jpeg': ['png', 'pdf', 'webp'],
        'jpg': ['png', 'pdf', 'webp'],
        'png': ['jpeg', 'jpg', 'pdf', 'webp']
    };

    // Evento de clique para abrir o seletor de arquivos
    dropZone.addEventListener('click', () => fileInput.click());

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
        if (files.length === 0) return;
        fileList.innerHTML = ''; 
        const file = files[0];
        displayFile(file);
        uploadArea.classList.add('hidden');
        conversionArea.classList.remove('hidden');
    }

    function displayFile(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        const fileSize = (file.size / 1024 / 1024).toFixed(2); // em MB

        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fa-solid fa-file"></i>
                <div>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${fileSize} MB</span>
                </div>
            </div>
            <button class="remove-file" title="Remover arquivo">×</button>
        `;
        
        fileList.appendChild(fileItem);
        
        fileItem.querySelector('.remove-file').addEventListener('click', () => {
            resetUI();
        });

        populateConversionOptions(fileExtension);
    }
    
    function populateConversionOptions(extension) {
        targetFormatSelect.innerHTML = '';
        const possibleFormats = conversionMap[extension] || [];
        
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

    function resetUI() {
        fileList.innerHTML = '';
        fileInput.value = '';
        uploadArea.classList.remove('hidden');
        conversionArea.classList.add('hidden');
    }

    // --- LÓGICA DE CONEXÃO COM O BACK-END ---
    convertButton.addEventListener('click', () => {
        const selectedFile = fileInput.files[0];
        const targetFormat = targetFormatSelect.value;
        
        if (!selectedFile || !targetFormat) {
            alert('Por favor, selecione um arquivo e um formato de destino.');
            return;
        }

        // Feedback visual: desabilitar o botão e mudar o texto
        convertButton.disabled = true;
        convertButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Convertendo...';

        // 1. Criar um objeto FormData para enviar o arquivo
        const formData = new FormData();
        formData.append('file', selectedFile); // A chave 'file' deve ser a mesma que o multer espera no back-end
        formData.append('targetFormat', targetFormat);

        // 2. Usar a API fetch() para enviar os dados para o servidor
        fetch('http://localhost:3000/api/convert', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                // Se a resposta do servidor não for de sucesso (ex: erro 400, 500)
                throw new Error(`Erro do servidor: ${response.statusText}`);
            }
            return response.json(); // Converte a resposta do servidor para JSON
        })
        .then(data => {
            // Sucesso! O servidor respondeu.
            console.log('Resposta do servidor:', data);
            alert(`Sucesso! Mensagem do servidor: "${data.message}"`);
            // Por enquanto, apenas resetamos a UI após o sucesso.
            resetUI();
        })
        .catch(error => {
            // Ocorreu um erro na comunicação ou no servidor
            console.error('Erro na conversão:', error);
            alert('Ocorreu um erro durante a comunicação com o servidor. Verifique o console.');
        })
        .finally(() => {
            // Reabilitar o botão, independentemente de ter dado certo ou errado
            convertButton.disabled = false;
            convertButton.innerHTML = 'Converter';
        });
    });
});