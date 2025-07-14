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
      'pdf': ['jpeg', 'png'], // <--- REMOVA o 'docx' daqui
      'docx': ['pdf'],
      'mkv': ['mp4'],
      'mov': ['mp4'],
      'jpeg': ['png', 'pdf', 'webp'],
      'jpg': ['png', 'pdf', 'webp'],
      'png': ['jpeg', 'jpg', 'pdf', 'webp']
    };

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
        alert("Por favor, selecione um arquivo e um formato de destino.");
        return;
      }

      // Feedback visual: desabilitar o botão e mudar o texto
      convertButton.disabled = true;
      convertButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Convertendo...';

      // 1. Criar um objeto FormData para enviar o arquivo
      const formData = new FormData();
      formData.append("file", selectedFile); // A chave 'file' deve ser a mesma que o multer espera no back-end
      formData.append("targetFormat", targetFormat);

      // --- DENTRO DO js/script.js, substitua apenas esta parte ---

      // 2. Usar a API fetch() para enviar os dados para o servidor
      fetch("http://localhost:3000/api/convert", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          // Se a resposta NÃO for OK, algo deu errado no servidor
          if (!response.ok) {
            // Tentamos ler o corpo do erro como JSON para mostrar uma mensagem mais clara
            return response.json().then((err) => {
              throw new Error(err.error || "Erro no servidor");
            });
          }
          // Se a resposta for OK, o corpo da resposta é o arquivo para download
          return response.blob();
        })
        .then((blob) => {
          // Sucesso! O servidor enviou o arquivo convertido.
          // 3. Criar um link de download para o arquivo que recebemos (blob)
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;

          // Define o nome do arquivo para o download
          const originalName = fileInput.files[0].name
            .split(".")
            .slice(0, -1)
            .join(".");
          a.download = `${originalName}.${targetFormat}`;

          document.body.appendChild(a);
          a.click();

          // Limpa a URL do objeto para liberar memória
          window.URL.revokeObjectURL(url);

          alert("Conversão concluída! O download deve começar em breve.");
          resetUI();
        })
        .catch((error) => {
          // Ocorreu um erro na comunicação ou o servidor retornou um erro
          console.error("Erro na conversão:", error);
          alert(`Ocorreu um erro: ${error.message}`);
        })
        .finally(() => {
          // Reabilitar o botão, independentemente de ter dado certo ou errado
          convertButton.disabled = false;
          convertButton.innerHTML = "Converter";
        });
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