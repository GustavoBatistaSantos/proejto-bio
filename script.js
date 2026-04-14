let model;
let bancoDados = JSON.parse(localStorage.getItem('bioDB')) || [];

// 1. Carregar o modelo de IA assim que a página abrir
async function carregarModelo() {
    const status = document.getElementById('statusIA');
    status.innerText = "Carregando Inteligência Artificial...";
    model = await mobilenet.load();
    status.innerText = "IA Pronta! Carregue uma foto.";
}

// 2. Processar a imagem escolhida pelo usuário
async function processarImagem(event) {
    const reader = new FileReader();
    const status = document.getElementById('statusIA');
    const preview = document.getElementById('preview');

    reader.onload = async function() {
        preview.src = reader.result;
        preview.style.display = 'block';
        
        status.innerText = "Analisando espécie...";
        
        // Pequena pausa para garantir que a imagem foi renderizada
        setTimeout(async () => {
            const predictions = await model.classify(preview);
            
            // Tradução simples (opcional, o modelo retorna em inglês)
            const resultado = predictions[0].className;
            document.getElementById('nomeEspecie').value = resultado.split(',')[0];
            document.getElementById('btnSalvar').disabled = false;
            status.innerText = "Identificação concluída!";
        }, 500);
    }
    reader.readAsDataURL(event.target.files[0]);
}

// 3. "Banco de Dados" - Salvar no LocalStorage
function salvarNoBanco() {
    const nome = document.getElementById('nomeEspecie').value;
    const tipo = document.getElementById('tipoEspecie').value;
    const foto = document.getElementById('preview').src;

    const registro = {
        id: Date.now(),
        nome,
        tipo,
        foto
    };

    bancoDados.push(registro);
    localStorage.setItem('bioDB', JSON.stringify(bancoDados));
    
    renderizarCatalogo();
    limparFormulario();
}

// 4. Exibir o catálogo na tela
function renderizarCatalogo() {
    const grid = document.getElementById('gridCatalogo');
    grid.innerHTML = '';

    bancoDados.forEach(item => {
        grid.innerHTML += `
            <div class="card">
                <img src="${item.foto}">
                <div class="card-info">
                    <h4>${item.nome}</h4>
                    <span>${item.tipo === 'Flora' ? '🌿' : '🐾'} ${item.tipo}</span>
                    <button class="btn-delete" onclick="removerItem(${item.id})">Excluir</button>
                </div>
            </div>
        `;
    });
}

function removerItem(id) {
    bancoDados = bancoDados.filter(i => i.id !== id);
    localStorage.setItem('bioDB', JSON.stringify(bancoDados));
    renderizarCatalogo();
}

function limparFormulario() {
    document.getElementById('nomeEspecie').value = '';
    document.getElementById('preview').style.display = 'none';
    document.getElementById('btnSalvar').disabled = true;
    document.getElementById('inputFoto').value = '';
}

// Inicialização
carregarModelo();
renderizarCatalogo();