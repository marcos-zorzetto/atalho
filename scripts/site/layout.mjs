/**
 * Estrutura comum a todas as páginas: <head> com SEO, cabeçalho, rodapé
 * e o espaço de patrocínio.
 */
import { SITE, url, urlAbsoluta } from "./config.mjs";
import { esc } from "./realce.mjs";

const icone = (caminho, tamanho = 18) =>
  `<svg viewBox="0 0 24 24" width="${tamanho}" height="${tamanho}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${caminho}</svg>`;

/** Páginas que usam contas: o supabase-js (versão fixa) e a conexão compartilhada. */
const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js";
export const SCRIPTS_SUPABASE = [SUPABASE_JS, "site/supabase.js"];

/** Hash dos scripts de CDN (SRI): se o arquivo for alterado lá, o navegador não executa. */
const INTEGRIDADE = {
  [SUPABASE_JS]: "sha384-iLddHTLokph6Omwoyid4XKxHaWa6w41BnoEj0q5oOrzmYPpHIKt1wyjReA7s//pP",
};

export const ICONES_SITE = {
  busca: icone('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', 16),
  lua: icone('<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>'),
  menu: icone('<path d="M4 6h16M4 12h16M4 18h16"/>', 20),
  github: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>`,
  usuario: icone('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  seta: icone('<path d="M5 12h14M13 6l6 6-6 6"/>', 16),
  estrela: icone('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>', 16),
  coracao: icone('<path d="M12 20s-7-4.4-9.3-8.9A5 5 0 0 1 12 5.5a5 5 0 0 1 9.3 5.6C19 15.6 12 20 12 20z"/>', 16),
  faisca: icone('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>', 16),
  cadeado: icone('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', 16),
  abrir: icone('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', 16),
  baixar: icone('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', 16),
  codigo: icone('<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>', 16),
  check: icone('<path d="m5 12 4 4 10-10"/>', 16),
};

const NAVEGACAO = [
  { rotulo: "Começar", caminho: "componentes/instalacao/", chave: "comecar" },
  { rotulo: "Componentes", caminho: "componentes/", chave: "componentes" },
  { rotulo: "Exemplos", caminho: "exemplos/", chave: "exemplos" },
  { rotulo: "Ícones", caminho: "icones/", chave: "icones" },
  { rotulo: "Editor", caminho: "editor/", chave: "editor" },
  { rotulo: "Personalizar", caminho: "personalizar/", chave: "personalizar" },
  { rotulo: "Pro", caminho: "pro/", chave: "pro", destaque: true },
];

function jsonLd(dados) {
  if (!dados) return "";
  const lista = Array.isArray(dados) ? dados : [dados];
  return lista.map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, "\\u003c")}</script>`).join("\n  ");
}

/**
 * Página completa.
 * @param {object} p
 * @param {string} p.titulo        <title> (até ~60 caracteres)
 * @param {string} p.descricao     meta description (até ~160 caracteres)
 * @param {string} p.caminho       caminho da página, ex.: "componentes/modal/"
 * @param {string} p.pagina        identificador usado pelo site.js
 * @param {string} p.secao         item do menu marcado como atual
 * @param {string} p.conteudo      HTML do <main>
 * @param {object} [p.dadosEstruturados]  JSON-LD
 * @param {string[]} [p.scripts]   scripts extras (caminhos relativos ao site)
 * @param {string} [p.cabecaExtra] HTML extra no <head>
 * @param {boolean} [p.indexar]    false para noindex (ex.: conta)
 * @param {string} [p.classeCorpo]
 */
export function pagina(p) {
  const canonical = urlAbsoluta(p.caminho);
  const imagem = p.imagemSocial || urlAbsoluta("og.png");
  const scripts = ["atalho/atalho.js", "site/config.js", "site/indice-busca.js", "site/assistente.js", ...(p.scripts || []), "site/site.js"];

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(p.titulo)}</title>
  <meta name="description" content="${esc(p.descricao)}">
  <link rel="canonical" href="${canonical}">
  ${p.indexar === false ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
  <meta name="author" content="${esc(SITE.autor)}">
  <meta name="theme-color" content="#0f766e" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0c0a09" media="(prefers-color-scheme: dark)">
  <meta property="og:type" content="${p.tipoOg || "website"}">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${SITE.nome}">
  <meta property="og:title" content="${esc(p.tituloSocial || p.titulo)}">
  <meta property="og:description" content="${esc(p.descricao)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${imagem}">
  <meta property="og:image:width" content="${p.imagemTamanho?.[0] || 1200}">
  <meta property="og:image:height" content="${p.imagemTamanho?.[1] || 630}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${url("favicon.svg")}" type="image/svg+xml">
  <link rel="sitemap" type="application/xml" href="${url("sitemap.xml")}">
  <script>try{const t=JSON.parse(localStorage.getItem("atalho:tema"));if(t)document.documentElement.dataset.tema=t}catch{}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=JetBrains+Mono:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="${url("atalho/atalho.css")}">
  <link rel="stylesheet" href="${url("site/site.css")}">
  ${scripts
    .map((s) =>
      s.startsWith("http")
        ? `<script src="${s}"${INTEGRIDADE[s] ? ` integrity="${INTEGRIDADE[s]}" crossorigin="anonymous"` : ""} defer></script>`
        : `<script src="${url(s)}" defer></script>`
    )
    .join("\n  ")}
  ${jsonLd(p.dadosEstruturados)}
  ${p.cabecaExtra || ""}
</head>
<body data-pagina="${p.pagina}" data-base="${SITE.base}"${p.classeCorpo ? ` class="${p.classeCorpo}"` : ""}>
  <a class="at-pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
  ${cabecalho(p.secao)}
  <main id="conteudo">
${p.conteudo}
  </main>
  ${rodape()}
</body>
</html>
`;
}

function cabecalho(secaoAtual) {
  return `<header class="at-barra site-barra">
    <div class="at-barra-conteudo">
      <a href="${url()}" class="site-marca" aria-label="Atalho, página inicial"><span class="site-marca-tecla" aria-hidden="true">A</span>Atalho</a>
      <span class="site-versao">v${SITE.versao}</span>
      <button class="at-botao at-icone at-fantasma at-barra-menu" data-at-alternar="#links-topo" aria-expanded="false" aria-controls="links-topo" aria-label="Abrir menu">${ICONES_SITE.menu}</button>
      <ul class="at-barra-links" id="links-topo">
        ${NAVEGACAO.map(
          (n) =>
            `<li><a href="${url(n.caminho)}"${n.chave === secaoAtual ? ' aria-current="page"' : ""}${n.destaque ? ' class="site-link-pro"' : ""}>${n.rotulo}</a></li>`
        ).join("\n        ")}
      </ul>
      <div class="at-barra-acoes">
        <button class="at-botao site-busca-botao" data-abrir-busca aria-label="Buscar componentes (Ctrl + K)">
          ${ICONES_SITE.busca}<span>Buscar…</span><kbd class="at-tecla">Ctrl K</kbd>
        </button>
        <a class="at-botao at-icone at-fantasma at-so-desktop" href="${SITE.repositorio}" target="_blank" rel="noopener" aria-label="Código no GitHub">${ICONES_SITE.github}</a>
        <button class="at-botao at-icone at-fantasma" data-at-tema="alternar" aria-label="Alternar tema escuro">${ICONES_SITE.lua}</button>
        <a class="at-botao at-pequeno site-entrar" href="${url("conta/")}" data-conta-cabecalho>${ICONES_SITE.usuario}<span>Entrar</span></a>
      </div>
    </div>
  </header>`;
}

function rodape() {
  const coluna = (titulo, links) =>
    `<nav aria-label="${titulo}"><h2>${titulo}</h2><ul>${links
      .map(([rotulo, destino, externo]) => `<li><a href="${externo ? destino : url(destino)}"${externo ? ' target="_blank" rel="noopener"' : ""}>${rotulo}</a></li>`)
      .join("")}</ul></nav>`;
  return `<footer class="site-rodape">
    <div class="site-container">
      <div class="site-rodape-grade">
        <div class="site-rodape-sobre">
          <a href="${url()}" class="site-marca"><span class="site-marca-tecla" aria-hidden="true">A</span>Atalho</a>
          <p>Componentes de interface em português, nos padrões das grandes empresas. Grátis e de código aberto.</p>
          <p class="at-texto-pequeno">Versão ${SITE.versao} · Licença MIT</p>
        </div>
        ${coluna("Documentação", [["Instalação", "componentes/instalacao/"], ["Componentes", "componentes/"], ["Exemplos completos", "exemplos/"], ["Editor ao vivo", "editor/"], ["Ícones", "icones/"], ["Personalizar tema", "personalizar/"]])}
        ${coluna("Linguagens", [["TypeScript", "typescript/"], ["PHP no servidor", "php/"], ["Estado (reatividade)", "componentes/estado/"], ["Eventos", "componentes/eventos/"]])}
        ${coluna("Projeto", [["GitHub", SITE.repositorio, true], ["Relatar um problema", `${SITE.repositorio}/issues`, true], ["Atalho Pro", "pro/"], ["Anuncie no Atalho", "patrocinar/"]])}
        ${coluna("Legal", [["Privacidade", "privacidade/"], ["Termos de uso", "termos/"], ["Minha conta", "conta/"]])}
      </div>
      <div class="site-rodape-base">
        <span>Criado por <a href="${SITE.autorUrl}" target="_blank" rel="noopener">${SITE.autor}</a>. Empresas citadas são só referência de padrões de interface.</span>
        <span>Dados de suporte dos navegadores: web-features (Baseline)</span>
      </div>
    </div>
  </footer>`;
}

/**
 * Espaço de patrocínio. Mostra o patrocinador ativo ou um convite para anunciar.
 * Links de patrocinador usam rel="sponsored" (exigência do Google).
 */
export function espacoPatrocinio(patrocinadores, posicao = "lateral") {
  const hoje = new Date().toISOString().slice(0, 10);
  const ativos = (patrocinadores || []).filter((p) => (!p.ate || p.ate >= hoje) && (!p.posicoes || p.posicoes.includes(posicao)));
  if (ativos.length) {
    const p = ativos[Math.floor(Date.now() / 86400000) % ativos.length];
    return `<aside class="site-patrocinio" aria-label="Patrocinador">
      <a href="${esc(p.url)}" target="_blank" rel="sponsored noopener" class="site-patrocinio-link">
        ${p.imagem ? `<img src="${esc(p.imagem)}" alt="" width="64" height="64" loading="lazy">` : ""}
        <span><strong>${esc(p.nome)}</strong><span>${esc(p.texto)}</span></span>
      </a>
      <small>Patrocinado · <a href="${url("patrocinar/")}">Anuncie aqui</a></small>
    </aside>`;
  }
  return `<aside class="site-patrocinio site-patrocinio-vazio" aria-label="Espaço para patrocinador">
    <a href="${url("patrocinar/")}" class="site-patrocinio-link">
      <span class="site-patrocinio-icone" aria-hidden="true">${ICONES_SITE.faisca}</span>
      <span><strong>Sua marca aqui</strong><span>Alcance desenvolvedores que estão começando no Brasil.</span></span>
    </a>
    <small>Espaço publicitário</small>
  </aside>`;
}
