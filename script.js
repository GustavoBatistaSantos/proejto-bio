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

// Substitua a função salvarNoBanco por esta:
function salvarNoBanco() {
    const nome = document.getElementById('nomeEspecie').value;
    const tipo = document.getElementById('tipoEspecie').value;
    const foto = document.getElementById('preview').src;

    if (!nome || foto.includes('#')) {
        alert("Por favor, identifique uma imagem antes de salvar.");
        return;
    }

    const registro = {
        id: Date.now(),
        nome: nome,
        tipo: tipo,
        foto: foto
    };

    try {
        bancoDados.push(registro);
        localStorage.setItem('bioDB', JSON.stringify(bancoDados));
        console.log("Salvo com sucesso!");
        
        renderizarCatalogo();
        limparFormulario();
    } catch (e) {
        alert("O banco de dados está cheio! Tente usar imagens menores ou limpe o catálogo.");
        console.error("Erro ao salvar no LocalStorage:", e);
    }
}

// Certifique-se de que a função renderizarCatalogo está exatamente assim:
function renderizarCatalogo() {
    const grid = document.getElementById('gridCatalogo');
    if (!grid) return; // Segurança caso o elemento não exista
    
    grid.innerHTML = '';

    bancoDados.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.foto}">
            <div class="card-info">
                <h4>${item.nome}</h4>
                <span>${item.tipo === 'Flora' ? '🌿' : '🐾'} ${item.tipo}</span>
                <button class="btn-delete" onclick="removerItem(${item.id})">Excluir</button>
            </div>
        `;
        grid.appendChild(card);
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