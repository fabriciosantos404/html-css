/* CONFIGURAÇÃO */

const materias = [
    "HTML + CSS",
    "TryHackMe",
    "Python",
    "JavaScript",
    "Desenho",
    "C# Unity"
];

const CHAVE_HISTORICO = "historicoCronometro";


/* ESTADO */

let segundos = 0;
let intervalo = null;
let rodando = false;
let acaoConfirmacao = null;
let numerosDigitados = "";


/* ELEMENTOS */

const $ = id => document.getElementById(id);

const cronometro = $("cronometro");
const botaoIniciar = $("botaoIniciar");
const botaoZerar = $("botaoZerar");
const botaoSalvar = $("botaoSalvar");
const botaoEditar = $("botaoEditar");
const botaoLimpar = $("botaoLimpar");
const listaHistorico = $("listaHistorico");
const semHistorico = $("semHistorico");
const totalGeral = $("totalGeral");
const totalHoje = $("totalHoje");

const popupFundo = $("popupFundo");
const popupTitulo = $("popupTitulo");
const popupMensagem = $("popupMensagem");
const botaoCancelar = $("botaoCancelar");
const botaoConfirmar = $("botaoConfirmar");

const popupSessao = $("popupSessao");
const categoriasSessao = $("categoriasSessao");
const botaoCancelarSessao = $("botaoCancelarSessao");
const botaoSalvarSessao = $("botaoSalvarSessao");

const popupManual = $("popupManual");
const categoriasManual = $("categoriasManual");
const tempoManual = $("tempoManual");
const botaoCancelarManual = $("botaoCancelarManual");
const botaoSalvarManual = $("botaoSalvarManual");

const historico = () =>
    JSON.parse(localStorage.getItem(CHAVE_HISTORICO)) || [];


/* MATÉRIAS */

function criarCategorias(container, nome) {

    container.innerHTML = materias.map(
        (materia, index) => `
            <label class="opcao-categoria">
                <input
                    type="radio"
                    name="${nome}"
                    value="${materia}"
                    ${index === 0 ? "checked" : ""}>
                ${materia}
            </label>
        `
    ).join("");
}

criarCategorias(categoriasSessao, "categoria");
criarCategorias(categoriasManual, "categoriaManual");


/* TEMPO */

function formatarTempo(total) {

    const horas = Math.floor(total / 3600);

    const minutos =
        Math.floor((total % 3600) / 60);

    const segundos =
        total % 60;

    return [
        String(horas).padStart(2, "0"),
        String(minutos).padStart(2, "0"),
        String(segundos).padStart(2, "0")
    ].join(":");
}


function atualizarTela() {

    const tempo = formatarTempo(segundos);

    cronometro.textContent = tempo;

    document.title = `${tempo} | Cronômetro`;
}


/* CRONÔMETRO */

function iniciarPausar() {

    if (rodando) {

        clearInterval(intervalo);

        intervalo = null;
        rodando = false;
        botaoIniciar.textContent = "Iniciar";

        return;
    }

    intervalo = setInterval(() => {

        segundos++;
        atualizarTela();

    }, 1000);

    rodando = true;
    botaoIniciar.textContent = "Pausar";
}


function zerar() {

    clearInterval(intervalo);

    intervalo = null;
    segundos = 0;
    rodando = false;

    botaoIniciar.textContent = "Iniciar";

    atualizarTela();
}


/* SALVAR */

function abrirPopupSessao() {

    if (!segundos) {

        abrirPopup(
            "Cronômetro zerado",
            "Não é possível salvar uma sessão com tempo 00:00:00.",
            null,
            "Fechar"
        );

        return;
    }

    popupSessao.style.display = "flex";
}


function salvarSessao() {

    salvarRegistro(
        "categoria",
        segundos
    );

    popupSessao.style.display = "none";

    zerar();
    mostrarHistorico();
}


function salvarTempoManual() {

    const tempo = converterTempo();

    if (tempo === null) {

        abrirPopup(
            "Tempo inválido",
            "Digite um tempo válido.",
            null,
            "Fechar"
        );

        return;
    }

    salvarRegistro(
        "categoriaManual",
        tempo
    );

    popupManual.style.display = "none";

    zerar();
    mostrarHistorico();
}


function salvarRegistro(nomeCategoria, tempo) {

    const categoria =
        document.querySelector(
            `input[name="${nomeCategoria}"]:checked`
        ).value;

    const dados = historico();

    dados.push({
        tempo,
        categoria,
        data: new Date().toLocaleString("pt-BR")
    });

    localStorage.setItem(
        CHAVE_HISTORICO,
        JSON.stringify(dados)
    );
}


/* HISTÓRICO */

function mostrarHistorico() {

    const dados = historico();

    listaHistorico.innerHTML = "";

    semHistorico.style.display =
        dados.length ? "none" : "block";

    botaoLimpar.style.display =
        dados.length ? "block" : "none";

    dados.forEach((sessao, index) => {

        const item = document.createElement("li");

        item.innerHTML = `
            <div class="informacao-sessao">
                <span class="categoria">
                    ${sessao.categoria}
                </span>

                <span class="tempo-sessao">
                    ${formatarTempo(sessao.tempo)}
                </span>

                <span class="data">
                    ${sessao.data}
                </span>
            </div>

            <button
                class="botaoExcluir"
                onclick="excluirSessao(${index})">
                Excluir
            </button>
        `;

        listaHistorico.appendChild(item);
    });

    atualizarResumo();
}


/* RESUMO */

function atualizarResumo() {

    const dados = historico();

    const totais = Object.fromEntries(
        materias.map(materia => [materia, 0])
    );

    dados.forEach(sessao => {

        if (totais[sessao.categoria] !== undefined) {
            totais[sessao.categoria] += sessao.tempo;
        }

    });

    const resumo = $("resumoCategorias");

    resumo.innerHTML = materias.map(
        materia => `
            <div class="categoria-resumo">

                <span class="nome-categoria">
                    ${materia}
                </span>

                <span class="tempo-categoria">
                    ${formatarTempo(totais[materia])}
                </span>

            </div>
        `
    ).join("");

    const total =
        Object.values(totais)
            .reduce((soma, tempo) => soma + tempo, 0);

    totalGeral.textContent =
        formatarTempo(total);

    atualizarTotalHoje(dados);
}


/* TOTAL DE HOJE */

function atualizarTotalHoje(dados) {

    const hoje = new Date();

    const diaHoje =
        hoje.toLocaleDateString("pt-BR");

    const total =
        dados
            .filter(sessao => {

                const dataSessao =
                    sessao.data.split(",")[0];

                return dataSessao === diaHoje;

            })
            .reduce(
                (soma, sessao) => soma + sessao.tempo,
                0
            );

    totalHoje.textContent =
        formatarTempo(total);
}


/* POPUP DE CONFIRMAÇÃO */

function abrirPopup(
    titulo,
    mensagem,
    acao,
    textoBotao
) {

    popupTitulo.textContent = titulo;
    popupMensagem.textContent = mensagem;
    botaoConfirmar.textContent = textoBotao;
    acaoConfirmacao = acao;

    popupFundo.style.display = "flex";
}


function fecharPopup() {

    popupFundo.style.display = "none";
    acaoConfirmacao = null;
}


/* EXCLUIR */

function excluirSessao(index) {

    const dados = historico();
    const sessao = dados[index];

    abrirPopup(
        "Excluir sessão?",
        `Deseja realmente excluir a sessão de ${formatarTempo(sessao.tempo)} de ${sessao.categoria}?`,
        () => {

            dados.splice(index, 1);

            localStorage.setItem(
                CHAVE_HISTORICO,
                JSON.stringify(dados)
            );

            mostrarHistorico();
        },
        "Excluir"
    );
}


function limparHistorico() {

    abrirPopup(
        "Apagar histórico?",
        "Deseja realmente apagar TODO o histórico? Essa ação não poderá ser desfeita.",
        () => {

            localStorage.removeItem(CHAVE_HISTORICO);

            mostrarHistorico();
        },
        "Apagar tudo"
    );
}


/* TEMPO MANUAL */

function abrirTempoManual() {

    numerosDigitados = "";

    tempoManual.value = "00:00:00";

    popupManual.style.display = "flex";

    tempoManual.focus();
    tempoManual.select();
}


function formatarEntradaTempo(numeros) {

    numeros = numeros.replace(/\D/g, "");
    numeros = numeros.replace(/^0+(?=\d)/, "");

    if (!numeros) {
        return "00:00:00";
    }

    numeros = numeros.padStart(6, "0");

    const segundos = numeros.slice(-2);
    const minutos = numeros.slice(-4, -2);
    const horas = numeros.slice(0, -4);

    return (
        horas.padStart(2, "0") +
        ":" +
        minutos +
        ":" +
        segundos
    );
}


tempoManual.addEventListener("input", () => {

    numerosDigitados =
        tempoManual.value.replace(/\D/g, "");

    tempoManual.value =
        formatarEntradaTempo(numerosDigitados);

    tempoManual.selectionStart =
        tempoManual.value.length;

    tempoManual.selectionEnd =
        tempoManual.value.length;
});


function converterTempo() {

    const partes = tempoManual.value.split(":");

    if (partes.length !== 3) {
        return null;
    }

    const horas = Number(partes[0]) || 0;
    const minutos = Number(partes[1]) || 0;
    const segundos = Number(partes[2]) || 0;

    if (minutos > 59 || segundos > 59) {
        return null;
    }

    const total =
        horas * 3600 +
        minutos * 60 +
        segundos;

    return total > 0 ? total : null;
}


/* EVENTOS */

botaoIniciar.onclick = iniciarPausar;
botaoZerar.onclick = zerar;
botaoSalvar.onclick = abrirPopupSessao;
botaoEditar.onclick = abrirTempoManual;
botaoLimpar.onclick = limparHistorico;

botaoCancelar.onclick = fecharPopup;

botaoConfirmar.onclick = () => {

    if (acaoConfirmacao) {
        acaoConfirmacao();
    }

    fecharPopup();
};

botaoCancelarSessao.onclick = () => {
    popupSessao.style.display = "none";
};

botaoSalvarSessao.onclick = salvarSessao;

botaoCancelarManual.onclick = () => {
    popupManual.style.display = "none";
};

botaoSalvarManual.onclick = salvarTempoManual;


/* FECHAR CLICANDO FORA */

popupFundo.onclick = event => {

    if (event.target === popupFundo) {
        fecharPopup();
    }
};

popupSessao.onclick = event => {

    if (event.target === popupSessao) {
        popupSessao.style.display = "none";
    }
};

popupManual.onclick = event => {

    if (event.target === popupManual) {
        popupManual.style.display = "none";
    }
};


/* INICIALIZAÇÃO */

atualizarTela();
mostrarHistorico();