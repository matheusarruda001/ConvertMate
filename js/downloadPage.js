        document.addEventListener('DOMContentLoaded', () => {
            // Pega os parâmetros da URL
            const params = new URLSearchParams(window.location.search);
            const filename = params.get('file');

            if (filename) {
                const downloadButton = document.getElementById('download-button');
                const filenameDisplay = document.getElementById('filename-display');

                // Define o nome do arquivo na tela e o link de download
                filenameDisplay.textContent = filename;
                // O link de download aponta para uma nova rota que iremos criar no back-end
                downloadButton.href = `/api/download/${filename}`; 
            } else {
                // Se não houver nome de arquivo, mostra uma mensagem de erro
                document.querySelector('.download-card').innerHTML = '<h2>Erro: Nenhum arquivo especificado para download.</h2>';
            }
        });
