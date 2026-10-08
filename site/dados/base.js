/*
 * Fonte única da documentação do Atalho.
 * Cada arquivo em site/dados/ acrescenta componentes em ATALHO_DOCS.componentes.
 * O site, a busca, a validação (npm test) e o robô de atualização leem daqui.
 *
 * Formato de um componente:
 * {
 *   id, nome, categoria, resumo,
 *   apelidos: [],          // como iniciantes procuram (inclui termos em inglês)
 *   inspiradoEm: [],       // onde o padrão é usado no mundo real
 *   quandoUsar: [], evitar: [],
 *   comoFunciona: "",      // explicação em português simples
 *   recursos: [],          // ids do web-features (dados do Baseline/MDN)
 *   mdn: [],               // links, marcados como pt ou en
 *   conectaCom: [],        // ids de outros componentes
 *   acessibilidade: [],
 *   api: [{ nome, tipo, descricao }],
 *   exemplos: [{ titulo, descricao, html, js, somenteCodigo }]
 * }
 */
(function () {
  const MDN = "https://developer.mozilla.org";

  const util = {
    pt: (titulo, caminho) => ({ titulo, url: `${MDN}/pt-BR/docs/${caminho}`, idioma: "pt" }),
    en: (titulo, caminho) => ({ titulo, url: `${MDN}/en-US/docs/${caminho}`, idioma: "en" }),
    svg: (conteudo, tamanho = 18) =>
      `<svg viewBox="0 0 24 24" width="${tamanho}" height="${tamanho}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${conteudo}</svg>`,
    produtos: [
      {
        id: 101,
        nome: "Tênis cano alto vermelho e preto",
        preco: 599.9,
        precoAntigo: 799.9,
        imagem: "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp",
      },
      {
        id: 102,
        nome: "Óculos de sol clássico com proteção UV",
        preco: 189.9,
        precoAntigo: 229.9,
        imagem: "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/thumbnail.webp",
      },
      {
        id: 103,
        nome: "Relógio com pulseira de couro marrom",
        preco: 349,
        precoAntigo: null,
        imagem: "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp",
      },
      {
        id: 104,
        nome: "Notebook 14 polegadas 16 GB RAM 512 GB SSD",
        preco: 8999,
        precoAntigo: 10499,
        imagem: "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp",
      },
    ],
  };

  const s = util.svg;
  util.icone = {
    busca: s('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    carrinho: s('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6"/>'),
    lixo: s('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
    editar: s('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
    copiar: s('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>'),
    casa: s('<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>'),
    caixa: s('<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
    usuarios: s('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7"/>'),
    grafico: s('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    ajustes: s('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
    sino: s('<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>'),
    info: s('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>'),
    ok: s('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
    alerta: s('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
    fechar: s('<path d="M18 6 6 18M6 6l12 12"/>'),
    menu: s('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    mais: s('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'),
    seta: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    voltar: s('<path d="M19 12H5M11 18l-6-6 6-6"/>'),
    enviar: s('<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>'),
    upload: s('<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>'),
    vazio: s('<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6H3v-6z"/>', 48),
    caminhao: s('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
    sair: s('<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>'),
    lua: s('<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>'),
    filtro: s('<path d="M3 5h18l-7 8v6l-4 2v-8z"/>'),
    baixar: s('<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>'),
  };

  window.ATALHO_DOCS = {
    util,
    categorias: [
      { id: "fundamentos", nome: "Comece aqui", descricao: "Instalação, cores, layout e texto." },
      { id: "formularios", nome: "Formulários", descricao: "Campos, máscaras, CEP, validação e envio." },
      { id: "acoes", nome: "Ações", descricao: "Botões, menus e copiar." },
      { id: "navegacao", nome: "Navegação", descricao: "Menus do site, abas, etapas e busca rápida." },
      { id: "sobreposicoes", nome: "Janelas e avisos", descricao: "Modal, gaveta, dica e notificações." },
      { id: "dados", nome: "Exibir dados", descricao: "Cartões, produtos, tabelas, listas e quadros." },
      { id: "feedback", nome: "Feedback", descricao: "Alertas, carregamento, estados vazios e LGPD." },
      { id: "paginas", nome: "Blocos de página", descricao: "Seções prontas para landing pages." },
      { id: "javascript", nome: "JavaScript", descricao: "Estado, formatação, requisições e eventos." },
      { id: "receitas", nome: "Receitas completas", descricao: "Componentes conectados em telas reais." },
    ],
    componentes: [],
  };
})();
