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
        'jpeg': ['png', 'pdf'],
        'jpg': ['png', 'pdf'],
        'png': ['jpeg', 'jpg', 'pdf']
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

    // Função para lidar com os arquivos selecionados
    function handleFiles(files) {
        if (files.length === 0) return;

        // Limpa a lista de arquivos anterior
        fileList.innerHTML = ''; 
        
        // Pega o primeiro arquivo (pode ser adaptado para múltiplos)
        const file = files[0];
        displayFile(file);

        // Atualiza a UI
        uploadArea.classList.add('hidden');
        conversionArea.classList.remove('hidden');
    }

    // Função para mostrar o arquivo na UI
    function displayFile(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        // Cria o elemento para o arquivo
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
        
        // Adiciona evento para remover o arquivo
        fileItem.querySelector('.remove-file').addEventListener('click', () => {
            resetUI();
        });

        populateConversionOptions(fileExtension);
    }
    
    // Função para popular as opções de conversão
    function populateConversionOptions(extension) {
        targetFormatSelect.innerHTML = ''; // Limpa opções antigas
        const possibleFormats = conversionMap[extension] || [];
        
        if (possibleFormats.length === 0) {
            targetFormatSelect.innerHTML = '<option>Nenhuma conversão disponível</option>';
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

    // Função para resetar a interface
    function resetUI() {
        fileList.innerHTML = '';
        fileInput.value = ''; // Limpa o input de arquivo
        uploadArea.classList.remove('hidden');
        conversionArea.classList.add('hidden');
    }

    // Evento do botão de converter
    convertButton.addEventListener('click', () => {
        const selectedFile = fileInput.files[0];
        const targetFormat = targetFormatSelect.value;
        
        if (!selectedFile || !targetFormat) {
            alert('Por favor, selecione um arquivo e um formato de destino.');
            return;
        }
        
        console.log(`Iniciando conversão de "${selectedFile.name}" para "${targetFormat}"...`);
        alert(`Simulação: Convertendo ${selectedFile.name} para ${targetFormat}. Verifique o console.`);

        //
        // ---> PONTO DE INTEGRAÇÃO COM O BACK-END <---
        //
        // 1. Criar um objeto FormData para enviar o arquivo.
        //    const formData = new FormData();
        //    formData.append('file', selectedFile);
        //    formData.append('targetFormat', targetFormat);
        //
        // 2. Usar a API fetch() para enviar os dados para o seu servidor.
        //    fetch('URL_DO_SEU_BACKEND/convert', {
        //        method: 'POST',
        //        body: formData
        //    })
        //    .then(response => response.blob()) // ou response.json() dependendo do que o backend retorna
        //    .then(blob => {
        //        // 3. Criar um link de download para o arquivo convertido.
        //        const url = window.URL.createObjectURL(blob);
        //        const a = document.createElement('a');
        //        a.style.display = 'none';
        //        a.href = url;
        //        a.download = `convertido.${targetFormat}`;
        //        document.body.appendChild(a);
        //        a.click();
        //        window.URL.revokeObjectURL(url);
        //        alert('Download iniciado!');
        //        resetUI();
        //    })
        //    .catch(error => {
        //        console.error('Erro na conversão:', error);
        //        alert('Ocorreu um erro durante a conversão.');
        //    });
        //
    });
});