let model;
let bancoDados = JSON.parse(localStorage.getItem('bioDB')) || [];

// 1. Carregar o modelo MobileNet
async function carregarModelo() {
    try {
        model = await mobilenet.load();
        document.getElementById('statusIA').innerText = "IA Pronta! Selecione uma foto.";
    } catch (error) {
        document.getElementById('statusIA').innerText = "Erro ao carregar IA. Verifique a internet.";
    }
}

// 2. Processar Imagem e Identificar
async function processarImagem(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const status = document.getElementById('statusIA');
    const preview = document.getElementById('preview');

    reader.onload = function() {
        preview.src = reader.result;
        preview.style.display = 'block';
        
        preview.onload = async () => {
            status.innerText = "IA analisando...";
            const predictions = await model.classify(preview);
            
            // Pega o primeiro resultado da IA
            const resultadoIA = predictions[0].className.split(',')[0];
            document.getElementById('nomeEspecie').value = resultadoIA;
            document.getElementById('btnSalvar').disabled = false;
            status.innerText = "Identificação concluída!";
        };
    }
    reader.readAsDataURL(file);
}

// 3. Salvar no Banco (LocalStorage)
function salvarNoBanco() {
    const nome = document.getElementById('nomeEspecie').value;
    const tipo = document.getElementById('tipoEspecie').value;
    const foto = document.getElementById('preview').src;

    if (!nome || foto === "") return;

    const novaEspecie = {
        id: Date.now(),
        nome: nome,
        tipo: tipo,
        foto: foto
    };

    try {
        bancoDados.push(novaEspecie);
        localStorage.setItem('bioDB', JSON.stringify(bancoDados));
        renderizarCatalogo();
        limparFormulario();
    } catch (e) {
        alert("O banco está cheio! Tente excluir fotos antigas ou usar imagens menores.");
    }
}

// 4. Mostrar itens na tela
function renderizarCatalogo() {
    const grid = document.getElementById('gridCatalogo');
    grid.innerHTML = '';

    bancoDados.forEach(item => {
        grid.innerHTML += `
            <div class="card">
                <img src="${item.foto}">
                <div class="card-info">
                    <h4>${item.nome}</h4>
                    <span>${item.tipo === 'Flora' ? '🌿 Flora' : '🐾 Fauna'}</span>
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
    document.getElementById('inputFoto').value = '';
    document.getElementById('btnSalvar').disabled = true;
    document.getElementById('statusIA').innerText = "IA Pronta! Selecione uma foto.";
}

// Iniciar app
carregarModelo();
renderizarCatalogo();