/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const materias = [
    "Html + CSS",
    "JS/TypeScript",
    "TryHackMe",
    "C# Unity",
    "Desenho",
    "Python",
    "DaVinci"
];

const CHAVE_HISTORICO = "historicoCronometro";
const CHAVE_CRONOMETRO = "cronometroAtivo";


/* =========================================================
   ESTADO
========================================================= */

let segundos = 0;
let intervalo = null;
let rodando = false;
let acaoConfirmacao = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = id => document.getElementById(id);

const cronometro = $("cronometro");
const botaoIniciar = $("botaoIniciar");
const botaoZerar = $("botaoZerar");
const botaoSalvar = $("botaoSalvar");
const botaoEditar = $("botaoEditar");
const botaoLimpar = $("botaoLimpar");

const listaHistorico = $("listaHistorico");
const semHistorico = $("semHistorico");

const totalSemana = $("totalSemana");
const totalHoje = $("totalHoje");
const historicoSemanal = $("historicoSemanal");

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

const resumoCategorias = $("resumoCategorias");


/* =========================================================
   LOCAL STORAGE
========================================================= */

function historico() {
    try {
        return JSON.parse(
            localStorage.getItem(CHAVE_HISTORICO)
        ) || [];
    } catch {
        return [];
    }
}

function salvarHistorico(dados) {
    localStorage.setItem(
        CHAVE_HISTORICO,
        JSON.stringify(dados)
    );
}

function salvarEstadoCronometro() {
    localStorage.setItem(
        CHAVE_CRONOMETRO,
        JSON.stringify({ segundos })
    );
}

function carregarEstadoCronometro() {
    try {
        const salvo = JSON.parse(
            localStorage.getItem(CHAVE_CRONOMETRO)
        );

        if (typeof salvo?.segundos === "number") {
            segundos = Math.max(
                0,
                Math.floor(salvo.segundos)
            );
        }
    } catch {
        segundos = 0;
    }
}


/* =========================================================
   CATEGORIAS
========================================================= */

function criarCategorias(container, nome) {
    container.innerHTML = materias.map((materia, index) => `
        <label class="opcao-categoria">
            <input
                type="radio"
                name="${nome}"
                value="${materia}"
                ${index === 0 ? "checked" : ""}
            >
            ${materia}
        </label>
    `).join("");
}

criarCategorias(categoriasSessao, "categoria");
criarCategorias(categoriasManual, "categoriaManual");


/* =========================================================
   TEMPO
========================================================= */

function formatarTempo(total) {
    total = Math.max(0, Math.floor(total));

    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const seg = total % 60;

    return [
        horas,
        minutos,
        seg
    ]
        .map(valor => String(valor).padStart(2, "0"))
        .join(":");
}

function atualizarTela() {
    const tempo = formatarTempo(segundos);

    cronometro.textContent = tempo;
    document.title = `${tempo} | Cronômetro`;
}


/* =========================================================
   CRONÔMETRO
========================================================= */

function iniciarPausar() {
    if (rodando) {
        clearInterval(intervalo);

        intervalo = null;
        rodando = false;

        salvarEstadoCronometro();

        botaoIniciar.textContent = "Iniciar";
        return;
    }

    rodando = true;
    botaoIniciar.textContent = "Pausar";

    intervalo = setInterval(() => {
        segundos++;

        atualizarTela();
        salvarEstadoCronometro();
    }, 1000);
}

function zerar() {
    clearInterval(intervalo);

    intervalo = null;
    rodando = false;
    segundos = 0;

    localStorage.removeItem(CHAVE_CRONOMETRO);

    botaoIniciar.textContent = "Iniciar";

    atualizarTela();
}

function recuperarCronometro() {
    carregarEstadoCronometro();

    rodando = false;
    intervalo = null;

    botaoIniciar.textContent = "Iniciar";

    atualizarTela();
}


/* =========================================================
   DATAS
========================================================= */

function obterDataSessao(sessao) {
    if (!sessao.data) return null;

    // Data antiga: DD/MM/YYYY, HH:MM:SS
    const antiga = sessao.data.match(
        /^(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2}):(\d{2})$/
    );

    if (antiga) {
        const [, dia, mes, ano, hora, minuto, segundo] = antiga;

        return new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(hora),
            Number(minuto),
            Number(segundo)
        );
    }

    // Data nova: ISO
    const data = new Date(sessao.data);

    return isNaN(data.getTime()) ? null : data;
}

function obterInicioSemana(data) {
    const inicio = new Date(data);

    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(
        inicio.getDate() - inicio.getDay()
    );

    return inicio;
}

function obterFimSemana(data) {
    const fim = obterInicioSemana(data);

    fim.setDate(fim.getDate() + 6);
    fim.setHours(23, 59, 59, 999);

    return fim;
}


/* =========================================================
   REGISTROS
========================================================= */

function salvarRegistro(nomeCategoria, tempo) {
    const elemento = document.querySelector(
        `input[name="${nomeCategoria}"]:checked`
    );

    if (!elemento) return;

    const dados = historico();

    dados.push({
        tempo,
        categoria: elemento.value,
        data: new Date().toISOString()
    });

    salvarHistorico(dados);
}


/* =========================================================
   SALVAR SESSÃO
========================================================= */

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

    if (rodando) {
        clearInterval(intervalo);

        intervalo = null;
        rodando = false;

        salvarEstadoCronometro();

        botaoIniciar.textContent = "Iniciar";
    }

    popupSessao.style.display = "flex";
}

function salvarSessao() {
    salvarRegistro("categoria", segundos);

    popupSessao.style.display = "none";

    zerar();
    mostrarHistorico();
}


/* =========================================================
   TEMPO MANUAL
========================================================= */

function abrirTempoManual() {
    tempoManual.value = "00:00:00";

    popupManual.style.display = "flex";

    tempoManual.focus();
    tempoManual.select();
}

function formatarEntradaTempo(valor) {
    let numeros = valor.replace(/\D/g, "");

    if (!numeros) return "00:00:00";

    numeros = numeros
        .replace(/^0+(?=\d)/, "")
        .padStart(6, "0");

    const segundos = numeros.slice(-2);
    const minutos = numeros.slice(-4, -2);
    const horas = numeros.slice(0, -4);

    return `${horas.padStart(2, "0")}:${minutos}:${segundos}`;
}

tempoManual.addEventListener("input", () => {
    tempoManual.value =
        formatarEntradaTempo(tempoManual.value);

    tempoManual.selectionStart =
        tempoManual.value.length;

    tempoManual.selectionEnd =
        tempoManual.value.length;
});

function converterTempo() {
    const partes = tempoManual.value.split(":");

    if (partes.length !== 3) return null;

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

    salvarRegistro("categoriaManual", tempo);

    popupManual.style.display = "none";

    mostrarHistorico();
}


/* =========================================================
   HISTÓRICO
========================================================= */

function formatarDataHistorico(sessao) {
    const data = obterDataSessao(sessao);

    return data
        ? data.toLocaleString("pt-BR")
        : "Data inválida";
}

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
                    ${formatarDataHistorico(sessao)}
                </span>
            </div>

            <button
                class="botaoExcluir"
                onclick="excluirSessao(${index})"
            >
                Excluir
            </button>
        `;

        listaHistorico.appendChild(item);
    });

    atualizarResumo();
}


/* =========================================================
   RESUMOS
========================================================= */

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

    resumoCategorias.innerHTML = materias.map(materia => `
        <div class="categoria-resumo">
            <span class="nome-categoria">
                ${materia}
            </span>

            <span class="tempo-categoria">
                ${formatarTempo(totais[materia])}
            </span>
        </div>
    `).join("");

    atualizarTotalSemana(dados);
    atualizarHistoricoSemanal(dados);
    atualizarTotalHoje(dados);
}

function atualizarTotalSemana(dados) {
    const agora = new Date();
    const inicio = obterInicioSemana(agora);
    const fim = obterFimSemana(agora);

    const total = dados
        .filter(sessao => {
            const data = obterDataSessao(sessao);

            return data &&
                data >= inicio &&
                data <= fim;
        })
        .reduce(
            (soma, sessao) => soma + sessao.tempo,
            0
        );

    totalSemana.textContent =
        formatarTempo(total);
}

function atualizarTotalHoje(dados) {
    const hoje = new Date();

    const total = dados
        .filter(sessao => {
            const data = obterDataSessao(sessao);

            return data &&
                data.getFullYear() === hoje.getFullYear() &&
                data.getMonth() === hoje.getMonth() &&
                data.getDate() === hoje.getDate();
        })
        .reduce(
            (soma, sessao) => soma + sessao.tempo,
            0
        );

    totalHoje.textContent =
        formatarTempo(total);
}

function atualizarHistoricoSemanal(dados) {
    const semanas = {};

    dados.forEach(sessao => {
        const data = obterDataSessao(sessao);

        if (!data) return;

        const inicio = obterInicioSemana(data);
        const chave = inicio.toLocaleDateString("sv-SE");

        if (!semanas[chave]) {
            semanas[chave] = {
                inicio,
                total: 0
            };
        }

        semanas[chave].total += sessao.tempo;
    });

    const semanasOrdenadas = Object.values(semanas)
        .sort((a, b) => b.inicio - a.inicio);

    historicoSemanal.innerHTML = "";

    if (!semanasOrdenadas.length) {
        historicoSemanal.innerHTML =
            "<p>Nenhuma semana registrada.</p>";

        return;
    }

    semanasOrdenadas.forEach(semana => {
        const fim = obterFimSemana(semana.inicio);

        const item = document.createElement("div");

        item.className = "semana-resumo";

        item.innerHTML = `
            <span>
                ${semana.inicio.toLocaleDateString("pt-BR")}
                -
                ${fim.toLocaleDateString("pt-BR")}
            </span>

            <strong>
                ${formatarTempo(semana.total)}
            </strong>
        `;

        historicoSemanal.appendChild(item);
    });
}


/* =========================================================
   POPUP
========================================================= */

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


/* =========================================================
   EXCLUIR / LIMPAR
========================================================= */

function excluirSessao(index) {
    const dados = historico();
    const sessao = dados[index];

    if (!sessao) return;

    abrirPopup(
        "Excluir sessão?",
        `Deseja realmente excluir a sessão de ${formatarTempo(sessao.tempo)} de ${sessao.categoria}?`,
        () => {
            dados.splice(index, 1);

            salvarHistorico(dados);
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


/* =========================================================
   EVENTOS
========================================================= */

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


/* =========================================================
   FECHAR POPUPS AO CLICAR FORA
========================================================= */

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


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

recuperarCronometro();
mostrarHistorico();
