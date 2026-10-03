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


const CHAVE_HISTORICO =
    "historicoCronometro";

const CHAVE_CRONOMETRO =
    "cronometroAtivo";


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

const $ = id =>
    document.getElementById(id);


const cronometro =
    $("cronometro");

const botaoIniciar =
    $("botaoIniciar");

const botaoZerar =
    $("botaoZerar");

const botaoSalvar =
    $("botaoSalvar");

const botaoEditar =
    $("botaoEditar");

const botaoLimpar =
    $("botaoLimpar");


const listaHistorico =
    $("listaHistorico");

const semHistorico =
    $("semHistorico");


const totalSemana =
    $("totalSemana");

const totalHoje =
    $("totalHoje");


const historicoSemanal =
    $("historicoSemanal");


const popupFundo =
    $("popupFundo");

const popupTitulo =
    $("popupTitulo");

const popupMensagem =
    $("popupMensagem");

const botaoCancelar =
    $("botaoCancelar");

const botaoConfirmar =
    $("botaoConfirmar");


const popupSessao =
    $("popupSessao");

const categoriasSessao =
    $("categoriasSessao");

const botaoCancelarSessao =
    $("botaoCancelarSessao");

const botaoSalvarSessao =
    $("botaoSalvarSessao");


const popupManual =
    $("popupManual");

const categoriasManual =
    $("categoriasManual");

const tempoManual =
    $("tempoManual");

const botaoCancelarManual =
    $("botaoCancelarManual");

const botaoSalvarManual =
    $("botaoSalvarManual");


/* =========================================================
   LOCAL STORAGE
========================================================= */

function historico() {

    try {

        return JSON.parse(
            localStorage.getItem(
                CHAVE_HISTORICO
            )
        ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar histórico:",
            erro
        );

        return [];

    }

}


/* =========================================================
   MATÉRIAS
========================================================= */

function criarCategorias(
    container,
    nome
) {

    container.innerHTML =
        materias
            .map(
                (materia, index) => `

                    <label
                        class="opcao-categoria">

                        <input
                            type="radio"
                            name="${nome}"
                            value="${materia}"
                            ${index === 0
                                ? "checked"
                                : ""}>

                        ${materia}

                    </label>

                `
            )
            .join("");

}


criarCategorias(
    categoriasSessao,
    "categoria"
);


criarCategorias(
    categoriasManual,
    "categoriaManual"
);


/* =========================================================
   TEMPO
========================================================= */

function formatarTempo(total) {

    total =
        Math.max(
            0,
            Math.floor(total)
        );


    const horas =
        Math.floor(
            total / 3600
        );


    const minutos =
        Math.floor(
            (total % 3600) / 60
        );


    const segundos =
        total % 60;


    return [

        String(horas)
            .padStart(2, "0"),

        String(minutos)
            .padStart(2, "0"),

        String(segundos)
            .padStart(2, "0")

    ].join(":");

}


/* =========================================================
   ATUALIZAR TELA
========================================================= */

function atualizarTela() {

    cronometro.textContent =
        formatarTempo(segundos);


    document.title =
        `${formatarTempo(segundos)} | Cronômetro`;

}


/* =========================================================
   ESTADO DO CRONÔMETRO
========================================================= */

/*
    O cronômetro salvo possui apenas
    o tempo acumulado.

    Exemplo:

    {
        segundos: 1837
    }

    O tempo não continua correndo
    quando o navegador está fechado.
*/


function salvarEstadoCronometro() {

    localStorage.setItem(

        CHAVE_CRONOMETRO,

        JSON.stringify({
            segundos
        })

    );

}


function carregarEstadoCronometro() {

    try {

        const salvo =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_CRONOMETRO
                )
            );


        if (
            salvo &&
            typeof salvo.segundos === "number"
        ) {

            segundos =
                Math.max(
                    0,
                    Math.floor(
                        salvo.segundos
                    )
                );

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar estado do cronômetro:",
            erro
        );

        segundos = 0;

    }

}


function apagarEstadoCronometro() {

    localStorage.removeItem(
        CHAVE_CRONOMETRO
    );

}


/* =========================================================
   CRONÔMETRO
========================================================= */

function iniciarPausar() {

    /*
        PAUSAR
    */

    if (rodando) {

        clearInterval(
            intervalo
        );

        intervalo = null;

        rodando = false;


        salvarEstadoCronometro();


        botaoIniciar.textContent =
            "Iniciar";

        return;

    }


    /*
        INICIAR / CONTINUAR
    */

    rodando = true;


    botaoIniciar.textContent =
        "Pausar";


    intervalo =
        setInterval(

            () => {

                segundos++;

                atualizarTela();

                salvarEstadoCronometro();

            },

            1000

        );

}


/* =========================================================
   ZERAR CRONÔMETRO
========================================================= */

function zerar() {

    clearInterval(
        intervalo
    );

    intervalo = null;

    segundos = 0;

    rodando = false;


    apagarEstadoCronometro();


    botaoIniciar.textContent =
        "Iniciar";


    atualizarTela();

}


/* =========================================================
   RECUPERAR AO ABRIR O SITE
========================================================= */

function recuperarCronometro() {

    carregarEstadoCronometro();


    /*
        O cronômetro não volta
        rodando automaticamente.
    */

    rodando = false;

    intervalo = null;


    botaoIniciar.textContent =
        "Iniciar";


    atualizarTela();

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


    /*
        Se estiver rodando,
        primeiro paramos e salvamos
        o estado atual.
    */

    if (rodando) {

        clearInterval(
            intervalo
        );

        intervalo = null;

        rodando = false;


        salvarEstadoCronometro();


        botaoIniciar.textContent =
            "Iniciar";

    }


    popupSessao.style.display =
        "flex";

}


function salvarSessao() {

    salvarRegistro(
        "categoria",
        segundos
    );


    popupSessao.style.display =
        "none";


    zerar();


    mostrarHistorico();

}


/* =========================================================
   SALVAR TEMPO MANUAL
========================================================= */

function salvarTempoManual() {

    const tempo =
        converterTempo();


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


    popupManual.style.display =
        "none";


    mostrarHistorico();

}


/* =========================================================
   SALVAR REGISTRO
========================================================= */

function salvarRegistro(
    nomeCategoria,
    tempo
) {

    const elemento =
        document.querySelector(
            `input[name="${nomeCategoria}"]:checked`
        );


    if (!elemento) {

        console.error(
            "Nenhuma categoria selecionada."
        );

        return;

    }


    const categoria =
        elemento.value;


    const dados =
        historico();


    dados.push({

        tempo,

        categoria,

        /*
            Agora salvamos em ISO.
            Isso facilita o cálculo
            das semanas.
        */

        data:
            new Date().toISOString()

    });


    localStorage.setItem(

        CHAVE_HISTORICO,

        JSON.stringify(dados)

    );

}


/* =========================================================
   CONVERTER DATA DA SESSÃO
========================================================= */

/*
    Esta função aceita:

    1. Datas novas em ISO:

       2026-10-02T23:30:00.000Z

    2. Datas antigas salvas pelo
       código anterior:

       02/10/2026, 20:30:00
*/


function obterDataSessao(sessao) {

    if (!sessao.data) {
        return null;
    }


    /*
        Tenta primeiro o formato ISO.
    */

    const dataISO =
        new Date(sessao.data);


    if (!isNaN(dataISO.getTime())) {

        /*
            Cuidado:

            Datas ISO com "Z" representam UTC.
            new Date() converte automaticamente
            para o horário local quando necessário.
        */

        return dataISO;

    }


    /*
        Tenta o formato antigo:

        DD/MM/YYYY, HH:MM:SS
    */

    const partes =
        sessao.data.split(",");


    const dataParte =
        partes[0];


    const horaParte =
        partes[1] || "00:00:00";


    const [dia, mes, ano] =
        dataParte
            .split("/")
            .map(Number);


    const [
        hora,
        minuto,
        segundo
    ] =
        horaParte
            .trim()
            .split(":")
            .map(Number);


    const data =
        new Date(

            ano,

            mes - 1,

            dia,

            hora || 0,

            minuto || 0,

            segundo || 0

        );


    return isNaN(data.getTime())
        ? null
        : data;

}


/* =========================================================
   HISTÓRICO
========================================================= */

function mostrarHistorico() {

    const dados =
        historico();


    listaHistorico.innerHTML =
        "";


    semHistorico.style.display =
        dados.length
            ? "none"
            : "block";


    botaoLimpar.style.display =
        dados.length
            ? "block"
            : "none";


    dados.forEach(

        (sessao, index) => {

            const item =
                document.createElement(
                    "li"
                );


            item.innerHTML = `

                <div
                    class="informacao-sessao">

                    <span class="categoria">
                        ${sessao.categoria}
                    </span>

                    <span class="tempo-sessao">
                        ${formatarTempo(
                            sessao.tempo
                        )}
                    </span>

                    <span class="data">
                        ${formatarDataHistorico(
                            sessao
                        )}
                    </span>

                </div>

                <button
                    class="botaoExcluir"
                    onclick="excluirSessao(${index})">

                    Excluir

                </button>

            `;


            listaHistorico.appendChild(
                item
            );

        }

    );


    atualizarResumo();

}


/* =========================================================
   FORMATAR DATA DO HISTÓRICO
========================================================= */

function formatarDataHistorico(
    sessao
) {

    const data =
        obterDataSessao(sessao);


    if (!data) {
        return "Data inválida";
    }


    return data.toLocaleString(
        "pt-BR"
    );

}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo() {

    const dados =
        historico();


    const totais =
        Object.fromEntries(

            materias.map(

                materia => [

                    materia,

                    0

                ]

            )

        );


    /*
        Total por matéria.

        Continua considerando
        todo o histórico.
    */

    dados.forEach(

        sessao => {

            if (
                totais[
                    sessao.categoria
                ] !== undefined
            ) {

                totais[
                    sessao.categoria
                ] += sessao.tempo;

            }

        }

    );


    const resumo =
        $("resumoCategorias");


    resumo.innerHTML =

        materias

            .map(

                materia => `

                    <div
                        class="categoria-resumo">

                        <span
                            class="nome-categoria">

                            ${materia}

                        </span>

                        <span
                            class="tempo-categoria">

                            ${formatarTempo(
                                totais[materia]
                            )}

                        </span>

                    </div>

                `

            )

            .join("");


    /*
        Agora não calculamos mais
        "Total geral".

        Calculamos:

        - Total da semana
        - Histórico semanal
        - Total de hoje
    */

    atualizarTotalSemana(
        dados
    );


    atualizarHistoricoSemanal(
        dados
    );


    atualizarTotalHoje(
        dados
    );

}


/* =========================================================
   INÍCIO DA SEMANA
========================================================= */

/*
    Semana começa no DOMINGO.

    getDay():

    Domingo  = 0
    Segunda  = 1
    Terça    = 2
    Quarta   = 3
    Quinta   = 4
    Sexta    = 5
    Sábado   = 6
*/


function obterInicioSemana(
    data
) {

    const inicio =
        new Date(data);


    inicio.setHours(
        0,
        0,
        0,
        0
    );


    const dia =
        inicio.getDay();


    /*
        Voltamos "dia" dias.

        Se hoje for:

        Domingo:
        0 dias

        Segunda:
        1 dia

        Terça:
        2 dias

        etc.
    */

    inicio.setDate(

        inicio.getDate() - dia

    );


    return inicio;

}


/* =========================================================
   FIM DA SEMANA
========================================================= */

function obterFimSemana(
    data
) {

    const inicio =
        obterInicioSemana(
            data
        );


    const fim =
        new Date(inicio);


    /*
        Domingo + 6 dias = sábado
    */

    fim.setDate(
        fim.getDate() + 6
    );


    fim.setHours(
        23,
        59,
        59,
        999
    );


    return fim;

}


/* =========================================================
   TOTAL DA SEMANA
========================================================= */

function atualizarTotalSemana(
    dados
) {

    const agora =
        new Date();


    const inicioSemana =
        obterInicioSemana(
            agora
        );


    const fimSemana =
        obterFimSemana(
            agora
        );


    const total =

        dados

            .filter(

                sessao => {

                    const dataSessao =
                        obterDataSessao(
                            sessao
                        );


                    if (!dataSessao) {
                        return false;
                    }


                    return (

                        dataSessao >=
                            inicioSemana &&

                        dataSessao <=
                            fimSemana

                    );

                }

            )

            .reduce(

                (soma, sessao) =>

                    soma + sessao.tempo,

                0

            );


    totalSemana.textContent =
        formatarTempo(total);

}


/* =========================================================
   HISTÓRICO SEMANAL
========================================================= */

function atualizarHistoricoSemanal(
    dados
) {

    const semanas = {};


    /*
        Agrupamos todas as sessões
        pelo domingo correspondente.
    */

    dados.forEach(

        sessao => {

            const dataSessao =
                obterDataSessao(
                    sessao
                );


            if (!dataSessao) {
                return;
            }


            const inicioSemana =
                obterInicioSemana(
                    dataSessao
                );


            /*
                A data do domingo será
                usada como identificador
                daquela semana.
            */

            const chave =
                inicioSemana.toISOString();


            if (!semanas[chave]) {

                semanas[chave] = {

                    inicio:
                        inicioSemana,

                    total: 0

                };

            }


            semanas[chave].total +=
                sessao.tempo;

        }

    );


    /*
        Ordena da semana mais recente
        para a mais antiga.
    */

    const semanasOrdenadas =

        Object.values(
            semanas
        )

        .sort(

            (a, b) =>
                b.inicio - a.inicio

        );


    historicoSemanal.innerHTML =
        "";


    /*
        Se ainda não existir nenhuma semana.
    */

    if (
        semanasOrdenadas.length === 0
    ) {

        historicoSemanal.innerHTML = `

            <p>
                Nenhuma semana registrada.
            </p>

        `;

        return;

    }


    semanasOrdenadas.forEach(

        semana => {

            const fimSemana =
                obterFimSemana(
                    semana.inicio
                );


            const inicioFormatado =
                semana.inicio.toLocaleDateString(
                    "pt-BR"
                );


            const fimFormatado =
                fimSemana.toLocaleDateString(
                    "pt-BR"
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "semana-resumo";


            item.innerHTML = `

                <span>

                    ${inicioFormatado}

                    -

                    ${fimFormatado}

                </span>

                <strong>

                    ${formatarTempo(
                        semana.total
                    )}

                </strong>

            `;


            historicoSemanal.appendChild(
                item
            );

        }

    );

}


/* =========================================================
   TOTAL DE HOJE
========================================================= */

function atualizarTotalHoje(
    dados
) {

    const hoje =
        new Date();


    const total =

        dados

            .filter(

                sessao => {

                    const dataSessao =
                        obterDataSessao(
                            sessao
                        );


                    if (!dataSessao) {
                        return false;
                    }


                    return (

                        dataSessao.getFullYear() ===
                            hoje.getFullYear()

                        &&

                        dataSessao.getMonth() ===
                            hoje.getMonth()

                        &&

                        dataSessao.getDate() ===
                            hoje.getDate()

                    );

                }

            )

            .reduce(

                (soma, sessao) =>

                    soma + sessao.tempo,

                0

            );


    totalHoje.textContent =
        formatarTempo(total);

}


/* =========================================================
   POPUP DE CONFIRMAÇÃO
========================================================= */

function abrirPopup(

    titulo,

    mensagem,

    acao,

    textoBotao

) {

    popupTitulo.textContent =
        titulo;


    popupMensagem.textContent =
        mensagem;


    botaoConfirmar.textContent =
        textoBotao;


    acaoConfirmacao =
        acao;


    popupFundo.style.display =
        "flex";

}


function fecharPopup() {

    popupFundo.style.display =
        "none";


    acaoConfirmacao =
        null;

}


/* =========================================================
   EXCLUIR SESSÃO
========================================================= */

function excluirSessao(
    index
) {

    const dados =
        historico();


    const sessao =
        dados[index];


    if (!sessao) {
        return;
    }


    abrirPopup(

        "Excluir sessão?",

        `Deseja realmente excluir a sessão de ${formatarTempo(sessao.tempo)} de ${sessao.categoria}?`,

        () => {

            dados.splice(
                index,
                1
            );


            localStorage.setItem(

                CHAVE_HISTORICO,

                JSON.stringify(dados)

            );


            mostrarHistorico();

        },

        "Excluir"

    );

}


/* =========================================================
   LIMPAR HISTÓRICO
========================================================= */

function limparHistorico() {

    abrirPopup(

        "Apagar histórico?",

        "Deseja realmente apagar TODO o histórico? Essa ação não poderá ser desfeita.",

        () => {

            localStorage.removeItem(
                CHAVE_HISTORICO
            );


            mostrarHistorico();

        },

        "Apagar tudo"

    );

}


/* =========================================================
   TEMPO MANUAL
========================================================= */

function abrirTempoManual() {

    tempoManual.value =
        "00:00:00";


    popupManual.style.display =
        "flex";


    tempoManual.focus();


    tempoManual.select();

}


function formatarEntradaTempo(
    numeros
) {

    numeros =
        numeros.replace(
            /\D/g,
            ""
        );


    numeros =
        numeros.replace(
            /^0+(?=\d)/,
            ""
        );


    if (!numeros) {

        return "00:00:00";

    }


    numeros =
        numeros.padStart(
            6,
            "0"
        );


    const segundos =
        numeros.slice(-2);


    const minutos =
        numeros.slice(
            -4,
            -2
        );


    const horas =
        numeros.slice(
            0,
            -4
        );


    return (

        horas.padStart(
            2,
            "0"
        )

        +

        ":"

        +

        minutos

        +

        ":"

        +

        segundos

    );

}


tempoManual.addEventListener(

    "input",

    () => {

        const numeros =
            tempoManual.value
                .replace(
                    /\D/g,
                    ""
                );


        tempoManual.value =
            formatarEntradaTempo(
                numeros
            );


        tempoManual.selectionStart =
            tempoManual.value.length;


        tempoManual.selectionEnd =
            tempoManual.value.length;

    }

);


function converterTempo() {

    const partes =
        tempoManual.value.split(":");


    if (
        partes.length !== 3
    ) {

        return null;

    }


    const horas =
        Number(
            partes[0]
        ) || 0;


    const minutos =
        Number(
            partes[1]
        ) || 0;


    const segundosDigitados =
        Number(
            partes[2]
        ) || 0;


    if (

        minutos > 59 ||

        segundosDigitados > 59

    ) {

        return null;

    }


    const total =

        horas * 3600 +

        minutos * 60 +

        segundosDigitados;


    return total > 0
        ? total
        : null;

}


/* =========================================================
   EVENTOS
========================================================= */

botaoIniciar.onclick =
    iniciarPausar;


botaoZerar.onclick =
    zerar;


botaoSalvar.onclick =
    abrirPopupSessao;


botaoEditar.onclick =
    abrirTempoManual;


botaoLimpar.onclick =
    limparHistorico;


botaoCancelar.onclick =
    fecharPopup;


botaoConfirmar.onclick =

    () => {

        if (acaoConfirmacao) {

            acaoConfirmacao();

        }

        fecharPopup();

    };


botaoCancelarSessao.onclick =

    () => {

        popupSessao.style.display =
            "none";

    };


botaoSalvarSessao.onclick =
    salvarSessao;


botaoCancelarManual.onclick =

    () => {

        popupManual.style.display =
            "none";

    };


botaoSalvarManual.onclick =
    salvarTempoManual;


/* =========================================================
   FECHAR POPUPS CLICANDO FORA
========================================================= */

popupFundo.onclick =

    event => {

        if (
            event.target ===
            popupFundo
        ) {

            fecharPopup();

        }

    };


popupSessao.onclick =

    event => {

        if (
            event.target ===
            popupSessao
        ) {

            popupSessao.style.display =
                "none";

        }

    };


popupManual.onclick =

    event => {

        if (
            event.target ===
            popupManual
        ) {

            popupManual.style.display =
                "none";

        }

    };


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

recuperarCronometro();

mostrarHistorico();