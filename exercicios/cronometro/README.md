# Cronômetro de Estudos

Cronômetro para acompanhar sessões de estudo, com histórico salvo no navegador,
resumo por categoria, totais diário/semanal e histórico semanal.

Feito em HTML, CSS e JavaScript puros — sem dependências, sem build.

## Funcionalidades

- **Iniciar / pausar** com exibição precisa (o tempo é calculado pelo relógio,
  então não "atrasa" mesmo com o aba em segundo plano).
- **Salvar sessão** escolhendo a matéria, **zerar** com confirmação e
  **registrar tempo manual** com campos separados de horas, minutos e
  segundos (avanço automático, validação por campo e colagem de `HH:MM:SS`).
- **Histórico** de sessões com exclusão individual (com confirmação) e limpeza
  total.
- **Resumo**: total por matéria, total de hoje, total da semana e histórico
  semana a semana (semana começa no domingo).
- **Persistência**: o cronômetro volta pausado de onde parou ao recarregar a
  página; o histórico fica salvo no `localStorage`.
- **Tema claro/escuro** com botão no cabeçalho; segue o sistema até que o
  usuário escolha um tema manualmente.
- **Funciona offline** (favicon local, nenhuma requisição externa).

## Estrutura

```
cronometro/
├── index.html    # marcação semântica + diálogos <dialog>
├── style.css     # design tokens, tema escuro, responsivo
├── script.js     # lógica do cronômetro, histórico e resumos
├── favicon.svg   # ícone local em SVG
└── README.md
```

## Como executar

Basta abrir o `index.html` no navegador.

Para desenvolvimento, é recomendado um servidor local (ex.: extensão
**Live Server** no VS Code), pois alguns navegadores limitam recursos em
`file://`.

## Dados salvos (`localStorage`)

| Chave               | Conteúdo                                            |
| ------------------- | --------------------------------------------------- |
| `cronometroAtivo`   | segundos acumulados do cronômetro (pausado)         |
| `historicoCronometro` | lista de sessões: `{ id, tempo, categoria, data }` |
| `ultimaCategoria`   | última matéria selecionada (pré-marcada na próxima) |
| `tema`              | `claro` ou `escuro`                                 |

> Limpar os dados do site apaga cronômetro e histórico.

## Acessibilidade

- Markup semântico (`main`, `section`, `fieldset`/`legend`, `dl`).
- Diálogos nativos (`<dialog>` + `showModal()`): foco preso, `Esc` fecha,
  foco retorna ao botão que abriu.
- Rótulos ARIA, `role="timer"` sem anúncio a cada segundo, `role="alert"` para
  erros de digitação e contorno de foco visível (`:focus-visible`).
- Suporte a `prefers-reduced-motion` (desliga animações) e
  `prefers-color-scheme` (tema automático).

## Navegadores

Chrome/Edge, Firefox e Safari modernos (uso de `<dialog>`, `crypto.randomUUID`
com fallback e CSS `clamp()`).

## Licença

[MIT](../../LICENSE) © Fabricio Santos
