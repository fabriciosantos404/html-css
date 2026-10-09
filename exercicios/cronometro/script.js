/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const MATERIAS = [
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
const CHAVE_TEMA = "tema";          // também lido pelo script do <head>
const CHAVE_CATEGORIA = "ultimaCategoria";

const ATRASO_TICK = 500;             // ms entre verificações do cronômetro
const INTERVALO_SALVAMENTO = 5000;   // ms entre salvamentos enquanto roda


/* =========================================================
   ESTADO
========================================================= */

const estado = {
    segundos: 0,        // segundos acumulados quando pausado
    iniciadoEm: null,   // timestamp em que foi iniciado
    rodando: false,
    ultimaExibicao: "",
    ultimoSalvoEm: 0
};

let acaoConfirmacao = null;
let intervaloTick = null;


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
const botaoTema = $("botaoTema");

const listaHistorico = $("listaHistorico");
const semHistorico = $("semHistorico");

const resumoCategorias = $("resumoCategorias");
const totalHoje = $("totalHoje");
const totalSemana = $("totalSemana");
const historicoSemanal = $("historicoSemanal");

const popupConfirmacao = $("popupConfirmacao");
const popupConfirmacaoTitulo = $("popupConfirmacaoTitulo");
const popupConfirmacaoMensagem = $("popupConfirmacaoMensagem");
const botaoCancelar = $("botaoCancelar");
const botaoConfirmar = $("botaoConfirmar");

const popupSessao = $("popupSessao");
const formSessao = $("formSessao");
const categoriasSessao = $("categoriasSessao");
const botaoCancelarSessao = $("botaoCancelarSessao");

const popupManual = $("popupManual");
const formManual = $("formManual");
const categoriasManual = $("categoriasManual");
const entradaTempo = $("entradaTempo");
const horasManual = $("horasManual");
const minutosManual = $("minutosManual");
const segundosManual = $("segundosManual");
const camposTempo = [horasManual, minutosManual, segundosManual];
const erroTempo = $("erroTempo");
const botaoCancelarManual = $("botaoCancelarManual");


/* =========================================================
   ARMAZENAMENTO
   Todas as leituras/gravações passam por aqui para não
   quebrar em navegadores que bloqueiam o localStorage.
========================================================= */

function lerChave(chave) {
    try {
        return localStorage.getItem(chave);
    } catch {
        return null;
    }
}

function gravarChave(chave, valor) {
    try {
        localStorage.setItem(chave, valor);
    } catch {
        // Armazenamento indisponível: o app continua funcionando
        // apenas em memória.
    }
}

function removerChave(chave) {
    try {
        localStorage.removeItem(chave);
    } catch {
        // Nada a fazer.
    }
}


/* =========================================================
   TEMPO
========================================================= */

function formatarTempo(total) {
    total = Math.max(0, Math.floor(total));

    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = total % 60;

    return [
        horas,
        minutos,
        segundos
    ]
        .map(valor => String(valor).padStart(2, "0"))
        .join(":");
}


/* =========================================================
   CRONÔMETRO
   O tempo exibido é sempre recalculado a partir do relógio,
   então o display nunca "atrasa" mesmo se o navegador
   reduzir a frequência dos intervalos em segundo plano.
========================================================= */

function segundosAtuais() {
    if (!estado.rodando) return estado.segundos;

    return estado.segundos +
        Math.floor((Date.now() - estado.iniciadoEm) / 1000);
}

function atualizarTela() {
    const tempo = formatarTempo(segundosAtuais());

    if (tempo === estado.ultimaExibicao) return;

    estado.ultimaExibicao = tempo;
    cronometro.textContent = tempo;
    document.title = `${tempo} | Cronômetro de Estudos`;
}

function salvarEstadoCronometro() {
    estado.ultimoSalvoEm = Date.now();

    gravarChave(
        CHAVE_CRONOMETRO,
        JSON.stringify({ segundos: segundosAtuais() })
    );
}

function carregarEstadoCronometro() {
    const bruto = lerChave(CHAVE_CRONOMETRO);

    if (!bruto) return 0;

    try {
        const salvo = JSON.parse(bruto);

        return typeof salvo?.segundos === "number"
            ? Math.max(0, Math.floor(salvo.segundos))
            : 0;
    } catch {
        return 0;
    }
}

function iniciarTick() {
    pararTick();

    intervaloTick = setInterval(() => {
        atualizarTela();

        if (Date.now() - estado.ultimoSalvoEm >= INTERVALO_SALVAMENTO) {
            salvarEstadoCronometro();
        }
    }, ATRASO_TICK);
}

function pararTick() {
    if (intervaloTick === null) return;

    clearInterval(intervaloTick);
    intervaloTick = null;
}

function iniciar() {
    if (estado.rodando) return;

    estado.rodando = true;
    estado.iniciadoEm = Date.now();

    botaoIniciar.textContent = "Pausar";
    cronometro.classList.add("cronometro--rodando");

    iniciarTick();
}

function pausar() {
    if (!estado.rodando) return;

    estado.segundos = segundosAtuais();
    estado.rodando = false;
    estado.iniciadoEm = null;

    botaoIniciar.textContent = "Iniciar";
    cronometro.classList.remove("cronometro--rodando");

    pararTick();
    salvarEstadoCronometro();
    atualizarTela();
}

function alternarCronometro() {
    if (estado.rodando) {
        pausar();
    } else {
        iniciar();
    }
}

function zerarCronometro() {
    pararTick();

    estado.segundos = 0;
    estado.iniciadoEm = null;
    estado.rodando = false;
    estado.ultimaExibicao = "";

    removerChave(CHAVE_CRONOMETRO);

    botaoIniciar.textContent = "Iniciar";
    cronometro.classList.remove("cronometro--rodando");

    atualizarTela();
}

function solicitarZerar() {
    const total = segundosAtuais();

    if (total === 0) return;

    confirmar({
        titulo: "Zerar cronômetro?",
        mensagem: `O tempo de ${formatarTempo(total)} será descartado. Deseja continuar?`,
        rotulo: "Zerar",
        acao: zerarCronometro
    });
}

function recuperarCronometro() {
    estado.segundos = carregarEstadoCronometro();
    estado.iniciadoEm = null;
    estado.rodando = false;

    botaoIniciar.textContent = "Iniciar";
    atualizarTela();
}


/* =========================================================
   TEMAS
========================================================= */

function atualizarRotuloTema() {
    const escuro = document.documentElement.dataset.tema === "escuro";

    botaoTema.setAttribute(
        "aria-label",
        escuro ? "Alternar para tema claro" : "Alternar para tema escuro"
    );
    botaoTema.setAttribute("aria-pressed", String(escuro));
}

function definirTema(tema, persistir = true) {
    document.documentElement.dataset.tema = tema;

    if (persistir) gravarChave(CHAVE_TEMA, tema);

    atualizarRotuloTema();
}


/* =========================================================
   DIÁLOGOS
========================================================= */

function abrirDialogo(dialogo) {
    if (dialogo.open) return;

    dialogo.returnValue = "";
    dialogo.showModal();
}

function confirmar({ titulo, mensagem, rotulo, acao = null }) {
    popupConfirmacaoTitulo.textContent = titulo;
    popupConfirmacaoMensagem.textContent = mensagem;
    botaoConfirmar.textContent = rotulo;

    // Sem ação a confirmar, vira apenas um aviso com botão neutro.
    botaoConfirmar.classList.toggle("botao--perigo", acao !== null);
    botaoConfirmar.classList.toggle("botao--primario", acao === null);
    botaoCancelar.hidden = acao === null;

    acaoConfirmacao = acao;
    abrirDialogo(popupConfirmacao);
}

function fecharNoCliqueExterno(dialogo) {
    dialogo.addEventListener("click", event => {
        if (event.target === dialogo) {
            dialogo.close();
        }
    });
}


/* =========================================================
   CATEGORIAS
========================================================= */

function ultimaCategoriaSalva() {
    return lerChave(CHAVE_CATEGORIA) || MATERIAS[0];
}

function selecionarCategoria(container, categoria) {
    const opcoes = container.querySelectorAll("input[type='radio']");

    const alvo = Array.from(opcoes)
        .find(radio => radio.value === categoria) || opcoes[0];

    if (alvo) alvo.checked = true;
}

function categoriaSelecionada(container) {
    const marcado = container.querySelector("input:checked");

    return marcado ? marcado.value : null;
}

function montarCategorias(container, nomeGrupo) {
    const fragmento = document.createDocumentFragment();

    MATERIAS.forEach(materia => {
        const rotulo = document.createElement("label");
        rotulo.className = "opcao-categoria";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = nomeGrupo;
        radio.value = materia;

        rotulo.append(radio, document.createTextNode(materia));
        fragmento.append(rotulo);
    });

    container.replaceChildren(fragmento);
    selecionarCategoria(container, ultimaCategoriaSalva());
}


/* =========================================================
   SESSÕES
========================================================= */

function registrarSessao(tempo, categoria) {
    const dados = carregarHistorico();

    dados.push({
        id: gerarId(),
        tempo,
        categoria,
        data: new Date().toISOString()
    });

    salvarHistorico(dados);
    gravarChave(CHAVE_CATEGORIA, categoria);
}

function abrirDialogoSessao() {
    if (segundosAtuais() === 0) {
        confirmar({
            titulo: "Cronômetro zerado",
            mensagem: "Não é possível salvar uma sessão com tempo 00:00:00.",
            rotulo: "Fechar",
            acao: null
        });
        return;
    }

    if (estado.rodando) pausar();

    selecionarCategoria(categoriasSessao, ultimaCategoriaSalva());
    abrirDialogo(popupSessao);
}


/* =========================================================
   TEMPO MANUAL
   Três campos (HH | MM | SS) em vez de uma máscara única:
   - dois dígitos completos avançam para o próximo campo;
   - Backspace em campo vazio volta para o anterior;
   - o conteúdo é selecionado ao focar, então basta digitar;
   - colar "HH:MM:SS" preenche os três campos de uma vez.
========================================================= */

function focarSegmento(campo) {
    campo.focus();
    campo.select();
}

function aoDigitarTempo(evento) {
    const campo = evento.target;

    if (!camposTempo.includes(campo)) return;

    campo.value = campo.value.replace(/\D/g, "").slice(0, 2);

    limparErro();

    const indice = camposTempo.indexOf(campo);

    if (campo.value.length === 2 && indice < camposTempo.length - 1) {
        focarSegmento(camposTempo[indice + 1]);
    }
}

function aoPressionarTempo(evento) {
    if (evento.key !== "Backspace") return;

    const campo = evento.target;

    if (campo.value !== "") return;

    const indice = camposTempo.indexOf(campo);

    if (indice <= 0) return;

    evento.preventDefault();
    focarSegmento(camposTempo[indice - 1]);
}

function aoSairSegmento(evento) {
    const campo = evento.target;

    if (!camposTempo.includes(campo)) return;

    if (campo.value.length !== 2 || Number.isNaN(Number(campo.value))) {
        campo.value = String(Number(campo.value) || 0).padStart(2, "0");
    }
}

function aoColarTempo(evento) {
    const campo = evento.target;

    if (!camposTempo.includes(campo)) return;

    const texto = evento.clipboardData?.getData("text") ?? "";
    const digitos = texto.replace(/\D/g, "");

    // Só assume o controle quando o conteúdo é uma duração completa;
    // caso contrário deixa o navegador colar normalmente.
    if (digitos.length !== 6) return;

    evento.preventDefault();

    horasManual.value = digitos.slice(0, 2);
    minutosManual.value = digitos.slice(2, 4);
    segundosManual.value = digitos.slice(4, 6);

    limparErro();
    focarSegmento(campo);
}

function lerTempoManual() {
    const horas = Number(horasManual.value);
    const minutos = Number(minutosManual.value);
    const segundos = Number(segundosManual.value);

    if (!Number.isFinite(horas) || horas < 0 || horas > 99) {
        return {
            erro: {
                mensagem: "Horas devem ficar entre 00 e 99.",
                campo: horasManual
            }
        };
    }

    if (!Number.isFinite(minutos) || minutos < 0 || minutos > 59) {
        return {
            erro: {
                mensagem: "Minutos devem ficar entre 00 e 59.",
                campo: minutosManual
            }
        };
    }

    if (!Number.isFinite(segundos) || segundos < 0 || segundos > 59) {
        return {
            erro: {
                mensagem: "Segundos devem ficar entre 00 e 59.",
                campo: segundosManual
            }
        };
    }

    const total = horas * 3600 + minutos * 60 + segundos;

    if (total <= 0) {
        return {
            erro: {
                mensagem: "O tempo precisa ser maior que 00:00:00.",
                campo: null
            }
        };
    }

    return { total };
}

function mostrarErro(mensagem) {
    erroTempo.textContent = mensagem;
    erroTempo.hidden = false;
}

function limparErro() {
    erroTempo.hidden = true;
    erroTempo.textContent = "";

    camposTempo.forEach(campo => campo.removeAttribute("aria-invalid"));
}

function abrirDialogoManual() {
    // Abre vazio (o placeholder mostra "00"): assim a primeira tecla
    // nunca é engolida, mesmo em celulares que ignoram o select() no foco.
    camposTempo.forEach(campo => {
        campo.value = "";
    });

    limparErro();

    abrirDialogo(popupManual);
    focarSegmento(horasManual);
}


/* =========================================================
   HISTÓRICO (dados)
========================================================= */

function gerarId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizarSessao(sessao) {
    if (!sessao || typeof sessao !== "object") return null;

    return {
        id: typeof sessao.id === "string" ? sessao.id : gerarId(),
        tempo: Number.isFinite(sessao.tempo)
            ? Math.max(0, Math.floor(sessao.tempo))
            : 0,
        categoria: typeof sessao.categoria === "string"
            ? sessao.categoria
            : "Sem categoria",
        data: typeof sessao.data === "string" ? sessao.data : null
    };
}

function carregarHistorico() {
    const bruto = lerChave(CHAVE_HISTORICO);

    if (!bruto) return [];

    try {
        const dados = JSON.parse(bruto);

        if (!Array.isArray(dados)) return [];

        return dados
            .map(normalizarSessao)
            .filter(sessao => sessao !== null);
    } catch {
        return [];
    }
}

function salvarHistorico(dados) {
    gravarChave(CHAVE_HISTORICO, JSON.stringify(dados));
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

function ehMesmoDia(data, referencia) {
    return Boolean(data) &&
        data.getFullYear() === referencia.getFullYear() &&
        data.getMonth() === referencia.getMonth() &&
        data.getDate() === referencia.getDate();
}


/* =========================================================
   HISTÓRICO (exibição)
========================================================= */

function formatarDataSessao(sessao) {
    const data = obterDataSessao(sessao);

    return data
        ? data.toLocaleString("pt-BR")
        : "Data inválida";
}

function criarItemHistorico(sessao) {
    const item = document.createElement("li");

    const informacao = document.createElement("div");
    informacao.className = "informacao-sessao";

    const categoria = document.createElement("span");
    categoria.className = "categoria";
    categoria.textContent = sessao.categoria;

    const tempo = document.createElement("span");
    tempo.className = "tempo-sessao";
    tempo.textContent = formatarTempo(sessao.tempo);

    const data = document.createElement("span");
    data.className = "data";
    data.textContent = formatarDataSessao(sessao);

    informacao.append(categoria, tempo, data);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "botao botao--perigo-claro botao-excluir";
    botaoExcluir.dataset.excluir = sessao.id;
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.setAttribute(
        "aria-label",
        `Excluir sessão de ${sessao.categoria} (${formatarTempo(sessao.tempo)})`
    );

    item.append(informacao, botaoExcluir);

    return item;
}

function renderizarHistorico() {
    const dados = carregarHistorico()
        .sort((a, b) => {
            const dataA = obterDataSessao(a)?.getTime() ?? 0;
            const dataB = obterDataSessao(b)?.getTime() ?? 0;

            return dataB - dataA;
        });

    listaHistorico.replaceChildren(...dados.map(criarItemHistorico));

    const vazio = dados.length === 0;

    semHistorico.hidden = !vazio;
    botaoLimpar.hidden = vazio;
}


/* =========================================================
   RESUMOS
========================================================= */

function criarLinhaResumo(materia, total) {
    const linha = document.createElement("div");
    linha.className = "categoria-resumo";

    const nome = document.createElement("dt");
    nome.className = "nome-categoria";
    nome.textContent = materia;

    const tempo = document.createElement("dd");
    tempo.className = "tempo-categoria";
    tempo.textContent = formatarTempo(total);

    linha.append(nome, tempo);

    return linha;
}

function calcularTotaisPorMateria(dados) {
    const totais = Object.fromEntries(
        MATERIAS.map(materia => [materia, 0])
    );

    dados.forEach(sessao => {
        if (Object.hasOwn(totais, sessao.categoria)) {
            totais[sessao.categoria] += sessao.tempo;
        }
    });

    return totais;
}

function calcularTotalHoje(dados) {
    const hoje = new Date();

    return dados.reduce((soma, sessao) => {
        return ehMesmoDia(obterDataSessao(sessao), hoje)
            ? soma + sessao.tempo
            : soma;
    }, 0);
}

function calcularTotalSemana(dados) {
    const agora = new Date();
    const inicio = obterInicioSemana(agora);
    const fim = obterFimSemana(agora);

    return dados.reduce((soma, sessao) => {
        const data = obterDataSessao(sessao);

        return data && data >= inicio && data <= fim
            ? soma + sessao.tempo
            : soma;
    }, 0);
}

function criarItemSemana(inicio, total) {
    const fim = obterFimSemana(inicio);

    const item = document.createElement("div");
    item.className = "semana-resumo";

    const periodo = document.createElement("span");
    periodo.textContent =
        `${inicio.toLocaleDateString("pt-BR")} - ${fim.toLocaleDateString("pt-BR")}`;

    const tempo = document.createElement("strong");
    tempo.textContent = formatarTempo(total);

    item.append(periodo, tempo);

    return item;
}

function renderizarHistoricoSemanal(dados) {
    const semanas = new Map();

    dados.forEach(sessao => {
        const data = obterDataSessao(sessao);

        if (!data) return;

        const inicio = obterInicioSemana(data);
        // Chave estável no formato AAAA-MM-DD.
        const chave = inicio.toLocaleDateString("sv-SE");

        if (!semanas.has(chave)) {
            semanas.set(chave, { inicio, total: 0 });
        }

        semanas.get(chave).total += sessao.tempo;
    });

    const ordenadas = Array.from(semanas.values())
        .sort((a, b) => b.inicio - a.inicio);

    if (!ordenadas.length) {
        const vazio = document.createElement("p");
        vazio.className = "estado-vazio";
        vazio.textContent = "Nenhuma semana registrada.";

        historicoSemanal.replaceChildren(vazio);
        return;
    }

    historicoSemanal.replaceChildren(
        ...ordenadas.map(semana => criarItemSemana(semana.inicio, semana.total))
    );
}

function renderizarResumo() {
    const dados = carregarHistorico();
    const totais = calcularTotaisPorMateria(dados);

    resumoCategorias.replaceChildren(
        ...MATERIAS.map(materia => criarLinhaResumo(materia, totais[materia]))
    );

    totalHoje.textContent = formatarTempo(calcularTotalHoje(dados));
    totalSemana.textContent = formatarTempo(calcularTotalSemana(dados));

    renderizarHistoricoSemanal(dados);
}


/* =========================================================
   EXCLUIR / LIMPAR
========================================================= */

function excluirSessao(id) {
    const sessao = carregarHistorico()
        .find(item => item.id === id);

    if (!sessao) return;

    confirmar({
        titulo: "Excluir sessão?",
        mensagem: `Deseja excluir a sessão de ${formatarTempo(sessao.tempo)} de ${sessao.categoria}?`,
        rotulo: "Excluir",
        acao: () => {
            salvarHistorico(
                carregarHistorico().filter(item => item.id !== id)
            );

            renderizarTudo();
        }
    });
}

function limparHistorico() {
    confirmar({
        titulo: "Apagar histórico?",
        mensagem: "Deseja realmente apagar TODO o histórico? Essa ação não poderá ser desfeita.",
        rotulo: "Apagar tudo",
        acao: () => {
            removerChave(CHAVE_HISTORICO);
            renderizarTudo();
        }
    });
}


/* =========================================================
   RENDERIZAÇÃO GERAL
========================================================= */

function renderizarTudo() {
    renderizarHistorico();
    renderizarResumo();
}


/* =========================================================
   EVENTOS
========================================================= */

function registrarEventos() {
    botaoIniciar.addEventListener("click", alternarCronometro);
    botaoZerar.addEventListener("click", solicitarZerar);
    botaoSalvar.addEventListener("click", abrirDialogoSessao);
    botaoEditar.addEventListener("click", abrirDialogoManual);
    botaoLimpar.addEventListener("click", limparHistorico);
    botaoTema.addEventListener("click", () => {
        definirTema(
            document.documentElement.dataset.tema === "escuro"
                ? "claro"
                : "escuro"
        );
    });

    // Exclusão delegada à lista: funciona mesmo com a lista re-renderizada.
    listaHistorico.addEventListener("click", event => {
        const botao = event.target.closest("[data-excluir]");

        if (botao) excluirSessao(botao.dataset.excluir);
    });

    // Diálogo de confirmação.
    botaoCancelar.addEventListener("click", () => {
        popupConfirmacao.close("cancelar");
    });

    botaoConfirmar.addEventListener("click", () => {
        popupConfirmacao.close("confirmar");
    });

    popupConfirmacao.addEventListener("close", () => {
        const acao = acaoConfirmacao;

        acaoConfirmacao = null;

        if (popupConfirmacao.returnValue === "confirmar" && acao) {
            acao();
        }
    });

    // Salvar sessão.
    botaoCancelarSessao.addEventListener("click", () => {
        popupSessao.close("cancelar");
    });

    formSessao.addEventListener("submit", event => {
        event.preventDefault();

        const categoria = categoriaSelecionada(categoriasSessao);

        if (!categoria) return;

        registrarSessao(segundosAtuais(), categoria);
        popupSessao.close("confirmar");

        zerarCronometro();
        renderizarTudo();
    });

    // Tempo manual: delegado ao container dos três campos.
    entradaTempo.addEventListener("input", aoDigitarTempo);
    entradaTempo.addEventListener("keydown", aoPressionarTempo);
    entradaTempo.addEventListener("focusin", evento => {
        if (camposTempo.includes(evento.target)) {
            focarSegmento(evento.target);
        }
    });
    entradaTempo.addEventListener("focusout", aoSairSegmento);
    entradaTempo.addEventListener("paste", aoColarTempo);

    botaoCancelarManual.addEventListener("click", () => {
        popupManual.close("cancelar");
    });

    formManual.addEventListener("submit", event => {
        event.preventDefault();

        const resultado = lerTempoManual();

        if (resultado.erro) {
            mostrarErro(resultado.erro.mensagem);

            if (resultado.erro.campo) {
                resultado.erro.campo.setAttribute("aria-invalid", "true");
                focarSegmento(resultado.erro.campo);
            } else {
                focarSegmento(horasManual);
            }

            return;
        }

        const categoria = categoriaSelecionada(categoriasManual);

        if (!categoria) return;

        registrarSessao(resultado.total, categoria);
        popupManual.close("confirmar");
        renderizarTudo();
    });

    // Fechar ao clicar fora do cartão.
    [popupConfirmacao, popupSessao, popupManual].forEach(fecharNoCliqueExterno);

    // Ao voltar para a aba (ou fechar a página), o tempo não se perde.
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            if (estado.rodando) salvarEstadoCronometro();
        } else {
            atualizarTela();
        }
    });

    window.addEventListener("beforeunload", () => {
        if (estado.rodando) salvarEstadoCronometro();
    });

    // Segue o sistema enquanto o usuário não escolher um tema manualmente.
    window.matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", evento => {
            if (!lerChave(CHAVE_TEMA)) {
                definirTema(evento.matches ? "escuro" : "claro", false);
            }
        });
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function iniciarAplicacao() {
    montarCategorias(categoriasSessao, "categoriaSessao");
    montarCategorias(categoriasManual, "categoriaManual");

    atualizarRotuloTema();
    recuperarCronometro();

    registrarEventos();
    renderizarTudo();
}

iniciarAplicacao();
