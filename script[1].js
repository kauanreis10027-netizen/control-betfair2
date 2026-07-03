// ===============================
// BETFAIR CONTROL PRO
// ===============================

// ===============================
// BANCO DE DADOS
// ===============================
let apostas = JSON.parse(localStorage.getItem("apostas")) || [];

let bancaInicial = Number(localStorage.getItem("bancaInicial")) || 0;
let comissao = Number(localStorage.getItem("comissao")) || 6.5;

// ===============================
// ELEMENTOS
// ===============================

// Inputs
const data = document.getElementById("data");
const entrada = document.getElementById("entrada");
const mercado = document.getElementById("mercado");
const stake = document.getElementById("stake");
const odd = document.getElementById("odd");
const resultado = document.getElementById("resultado");
const valorRed = document.getElementById("valorRed");
const campoRed = document.getElementById("campoRed");

// Dashboard
const lucroTotal = document.getElementById("lucroTotal");
const roi = document.getElementById("roi");
const greens = document.getElementById("greens");
const reds = document.getElementById("reds");
const winrate = document.getElementById("winrate");
const bancaAtual = document.getElementById("bancaAtual");

// Configurações
const campoBanca = document.getElementById("bancaInicial");
const campoComissao = document.getElementById("comissao");

// Histórico
const tabela = document.querySelector("#tabela tbody");

// Menu
const menuItens = document.querySelectorAll(".menu li");
const secoes = document.querySelectorAll("[data-secao]");
const cards = document.querySelector(".cards");

// ===============================
// INICIALIZAÇÃO
// ===============================
function iniciarSistema() {
    data.value = new Date().toISOString().split("T")[0];

    campoBanca.value = bancaInicial;
    campoComissao.value = comissao;

    atualizarDashboard();
    atualizarTabela();

    configurarMenu();
}

iniciarSistema();

// ===============================
// MENU PROFISSIONAL (CORRIGIDO)
// ===============================
function configurarMenu() {

    menuItens.forEach((item, index) => {

        item.addEventListener("click", () => {

            // Ativo
            menuItens.forEach(i => i.classList.remove("ativo"));
            item.classList.add("ativo");

            // Esconde tudo
            secoes.forEach(sec => sec.style.display = "none");
            cards.style.display = "none";

            // Controle por índice
            switch(index) {

                case 0: // Dashboard
                    cards.style.display = "grid";
                    break;

                case 1: // Nova aposta
                    mostrarSecao("nova");
                    break;

                case 2: // Histórico
                    mostrarSecao("historico");
                    break;

                case 3: // Estatísticas
                    mostrarSecao("estatisticas");
                    break;

                case 4: // Banca
                    mostrarSecao("banca");
                    break;

                case 5: // Configurações
                    mostrarSecao("config");
                    break;
            }

        });

    });

}

function mostrarSecao(nome) {
    const secao = document.querySelector(`[data-secao="${nome}"]`);
    if (secao) secao.style.display = "block";
}

// ===============================
// EVENTOS
// ===============================

// Mostrar campo RED
resultado.addEventListener("change", () => {
    if (resultado.value === "Red") {
        campoRed.style.display = "block";
    } else {
        campoRed.style.display = "none";
        valorRed.value = "";
    }
});

// Botões
document.getElementById("salvar").addEventListener("click", salvarAposta);
document.getElementById("salvarBanca").addEventListener("click", salvarConfiguracoes);

// ===============================
// CONFIGURAÇÕES
// ===============================
function salvarConfiguracoes() {

    bancaInicial = Number(campoBanca.value) || 0;
    comissao = Number(campoComissao.value) || 6.5;

    localStorage.setItem("bancaInicial", bancaInicial);
    localStorage.setItem("comissao", comissao);

    atualizarDashboard();

    alert("Configurações salvas!");
}

// ===============================
// SALVAR APOSTA
// ===============================
function salvarAposta() {

    if (!mercado.value || !stake.value || !odd.value) {
        alert("Preencha todos os campos.");
        return;
    }

    let lucro = 0;

    if (resultado.value === "Green") {
        lucro = Number(stake.value) * (1 - (comissao / 100));
    } else {

        if (!valorRed.value) {
            alert("Informe o valor do Red.");
            return;
        }

        lucro = -Math.abs(Number(valorRed.value));
    }

    const aposta = {
        data: data.value,
        entrada: entrada.value,
        mercado: mercado.value,
        stake: Number(stake.value),
        odd: Number(odd.value),
        resultado: resultado.value,
        lucro: lucro
    };

    apostas.push(aposta);

    salvarLocalStorage();
    atualizarDashboard();
    atualizarTabela();
    limparCampos();
}

// ===============================
// STORAGE
// ===============================
function salvarLocalStorage() {
    localStorage.setItem("apostas", JSON.stringify(apostas));
}

// ===============================
// DASHBOARD
// ===============================
function atualizarDashboard() {

    let totalLucro = 0;
    let totalStake = 0;
    let totalGreens = 0;
    let totalReds = 0;
    let maiorGreen = 0;
    let maiorRed = 0;

    apostas.forEach(aposta => {

        totalLucro += aposta.lucro;
        totalStake += aposta.stake;

        if (aposta.resultado === "Green") {
            totalGreens++;
            if (aposta.lucro > maiorGreen) maiorGreen = aposta.lucro;
        } else {
            totalReds++;
            if (Math.abs(aposta.lucro) > maiorRed) {
                maiorRed = Math.abs(aposta.lucro);
            }
        }

    });

    const banca = bancaInicial + totalLucro;

    const roiCalc = totalStake ? (totalLucro / totalStake) * 100 : 0;
    const winRate = apostas.length ? (totalGreens / apostas.length) * 100 : 0;

    lucroTotal.textContent = `R$ ${totalLucro.toFixed(2)}`;
    roi.textContent = `${roiCalc.toFixed(2)}%`;
    greens.textContent = totalGreens;
    reds.textContent = totalReds;
    winrate.textContent = `${winRate.toFixed(2)}%`;
    bancaAtual.textContent = `R$ ${banca.toFixed(2)}`;

    // Extras
    document.getElementById("maiorGreen").textContent = `R$ ${maiorGreen.toFixed(2)}`;
    document.getElementById("maiorRed").textContent = `R$ ${maiorRed.toFixed(2)}`;
}

// ===============================
// TABELA
// ===============================
function atualizarTabela() {

    tabela.innerHTML = "";

    apostas.forEach((aposta, index) => {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${formatarData(aposta.data)}</td>
            <td>${aposta.entrada}</td>
            <td>${aposta.mercado}</td>
            <td>R$ ${aposta.stake.toFixed(2)}</td>
            <td>${aposta.odd.toFixed(2)}</td>
            <td>${aposta.resultado}</td>
            <td class="${aposta.lucro >= 0 ? "green" : "red"}">
                R$ ${aposta.lucro.toFixed(2)}
            </td>
            <td>
                <button class="btnExcluir" onclick="excluirAposta(${index})">
                    🗑️
                </button>
            </td>
        `;

        tabela.appendChild(linha);
    });
}

// ===============================
// EXCLUIR
// ===============================
function excluirAposta(index) {

    if (!confirm("Deseja excluir esta aposta?")) return;

    apostas.splice(index, 1);

    salvarLocalStorage();
    atualizarDashboard();
    atualizarTabela();
}

// ===============================
// LIMPAR
// ===============================
function limparCampos() {

    data.value = new Date().toISOString().split("T")[0];
    mercado.value = "";
    stake.value = "";
    odd.value = "";
    resultado.value = "Green";
    valorRed.value = "";
    campoRed.style.display = "none";
}

// ===============================
// FORMATAR DATA
// ===============================
function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}