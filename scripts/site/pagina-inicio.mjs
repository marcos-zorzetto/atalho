import { SITE, url } from "./config.mjs";
import { svgPhosphor } from "./icones-phosphor.mjs";
import { pagina, espacoPatrocinio, ICONES_SITE } from "./layout.mjs";
import { esc, realcarHTML, realcarTS, realcarPHP } from "./realce.mjs";
import { urlComponente } from "./pagina-componente.mjs";
import { conteudoInicio } from "./inicio-cinema.mjs";

const ICONE_CATEGORIA = {
  fundamentos: "rocket-launch", formularios: "textbox", acoes: "cursor-click", navegacao: "compass", sobreposicoes: "app-window",
  dados: "table", feedback: "bell-ringing", paginas: "layout", javascript: "brackets-curly", receitas: "cooking-pot",
};

export function paginaInicio({ docs, baseline, patrocinadores, exemplos }) {
  const total = docs.componentes.length;
  const recursos = Object.values(baseline.recursos);
  const amplos = recursos.filter((r) => r.status === "amplo").length;
  const linksPt = docs.componentes.flatMap((c) => c.mdn || []);
  const dataDados = baseline.verificadoEm
    ? new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(new Date(`${baseline.verificadoEm}T12:00:00`))
    : "—";

  const instalacao = `<link rel="stylesheet" href="${SITE.cdn}/atalho.css">
<script src="${SITE.cdn}/atalho.js" defer></script>`;

  const vitrine = {
    html: `<input class="at-entrada" data-at-mascara="nif">

<button commandfor="confirmar" command="show-modal">
  Eliminar
</button>`,
    ts: `interface Carrinho {
  itens: { nome: string; preco: number }[];
  readonly total: number;
}

const carrinho = Atalho.estado<Carrinho>("carrinho", {
  itens: [],
  get total(): number {
    return this.itens.reduce((s, i) => s + i.preco, 0);
  },
});`,
    php: `<?php
require 'atalho.php';

$dados = Atalho\\lerJson();
if (!Atalho\\validarNif($dados['nif'] ?? '')) {
    Atalho\\responderErro('NIF inválido', 422);
}`,
  };

  const conteudo = conteudoInicio({
    total,
    exemplos,
    vitrine,
    baseline,
    dataDados,
    autor: SITE.autor,
    recursos: recursos.length,
    amplos,
    linksPt: `${linksPt.filter((l) => l.idioma === "pt").length}/${linksPt.length}`,
    categorias: docs.categorias.map((cat) => { const itens = docs.componentes.filter((c) => c.categoria === cat.id); return `<a class="site-categoria" href="${url(`componentes/#${cat.id}`)}" data-revelar><span class="site-recurso-icone">${svgPhosphor(ICONE_CATEGORIA[cat.id] || "squares-four", "duotone", 24)}</span><span class="site-contagem">${String(itens.length).padStart(2, "0")} ${itens.length === 1 ? "item" : "itens"}</span><h3>${esc(cat.nome)}</h3><p>${esc(cat.descricao)}</p><span class="site-categoria-itens">${itens.slice(0, 8).map((c) => esc(c.nome)).join(" · ")}${itens.length > 8 ? " …" : ""}</span></a>`; }).join(""),
  });

  return pagina({
    titulo: "Atalho · Componentes HTML, CSS e JavaScript em português",
    descricao: `${total} componentes de interface em português, prontos a copiar: NIF, código postal, carrinho, tabelas, modais e mais. Com TypeScript e PHP. Grátis.`,
    caminho: "",
    pagina: "inicio",
    secao: "",
    conteudo,
    classeCorpo: "site-cinema",
    scripts: ["site/inicio.js"],
    cabecaExtra: `<link rel="stylesheet" href="${url("site/inicio.css")}">`,
    dadosEstruturados: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.nome,
        url: SITE.url,
        inLanguage: "pt-PT",
        description: SITE.descricao,
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}componentes/?busca={termo}` },
          "query-input": "required name=termo",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: SITE.nome,
        description: SITE.descricao,
        codeRepository: SITE.repositorio,
        programmingLanguage: ["HTML", "CSS", "JavaScript", "TypeScript", "PHP"],
        license: "https://opensource.org/licenses/MIT",
        author: { "@type": "Person", name: SITE.autor, url: SITE.autorUrl },
        version: SITE.versao,
      },
    ],
  });
}

export function paginaCatalogo({ docs }) {
  const conteudo = `
    <section class="site-cabecalho-pagina">
      <div class="site-container">
        <span class="at-sobretitulo">Documentação</span>
        <h1 class="site-titulo site-h2">Componentes</h1>
        <p class="at-chamada">${docs.componentes.length} componentes e receitas, cada um com explicação em português, exemplos que funcionam na página, acessibilidade e TypeScript/PHP quando faz sentido.</p>
        <div class="at-entrada-icone site-filtro">
          ${ICONES_SITE.busca}
          <input class="at-entrada" type="search" id="filtro-catalogo" placeholder="Filtrar: modal, nif, tabela, carrinho…" aria-label="Filtrar componentes" autocomplete="off">
        </div>
        <nav class="site-ancoras" aria-label="Categorias">
          ${docs.categorias.map((cat) => `<a href="#${cat.id}">${esc(cat.nome)}</a>`).join("")}
        </nav>
      </div>
    </section>
    <div class="site-container site-catalogo">
      ${docs.categorias
        .map(
          (cat) => `<section class="site-catalogo-secao" aria-labelledby="${cat.id}">
        <h2 id="${cat.id}" class="site-secao-titulo">${esc(cat.nome)} <small>${esc(cat.descricao)}</small></h2>
        <div class="site-catalogo-grade">
          ${docs.componentes
            .filter((c) => c.categoria === cat.id)
            .map(
              (c) => `<a class="site-catalogo-item" href="${urlComponente(c)}" data-busca="${esc([c.nome, c.resumo, ...(c.apelidos || [])].join(" "))}">
            <strong>${esc(c.nome)}${c.novo ? ' <span class="site-novo">novo</span>' : ""}</strong>
            <span>${esc(c.resumo)}</span>
          </a>`
            )
            .join("")}
        </div>
      </section>`
        )
        .join("\n")}
      <p class="site-catalogo-vazio at-texto-suave" hidden>Nenhum componente com esse nome. Experimente a pesquisa (Ctrl K), que reconhece sinónimos.</p>
    </div>`;

  return pagina({
    titulo: "Componentes · Atalho",
    descricao: `Todos os ${docs.componentes.length} componentes do Atalho: formulários, máscaras, código postal, modais, tabelas, carrinho, login e mais, explicados em português.`,
    caminho: "componentes/",
    pagina: "catalogo",
    secao: "componentes",
    conteudo,
    dadosEstruturados: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Componentes do Atalho",
      inLanguage: "pt-PT",
      hasPart: docs.componentes.map((c) => ({ "@type": "TechArticle", name: c.nome, url: `${SITE.url}componentes/${c.id}/` })),
    },
  });
}
