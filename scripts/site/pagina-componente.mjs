import { SITE, url, urlAbsoluta } from "./config.mjs";
import { pagina, espacoPatrocinio, ICONES_SITE } from "./layout.mjs";
import { esc, REALCES, NOMES_LINGUAGEM } from "./realce.mjs";
import { linkEditor } from "./pagina-editor.mjs";

const SELOS = {
  amplo: { classe: "at-sucesso", texto: "Em todos os navegadores", dica: (r) => `Disponível em todos os navegadores principais desde ${mesAno(r.desde)}.` },
  recente: { classe: "at-info", texto: "Novo em todos os navegadores", dica: (r) => `Chegou a todos os navegadores atuais em ${mesAno(r.desde)}. Navegadores muito desatualizados podem não ter.` },
  limitado: { classe: "at-aviso", texto: "Ainda não em todos", dica: () => "Melhoria progressiva: sem suporte, o componente continua funcionando com visual mais simples." },
  desconhecido: { classe: "", texto: "Sem dados", dica: () => "Recurso não encontrado na base web-features." },
};

function mesAno(data) {
  if (!data) return "há muito tempo";
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(`${data}T12:00:00`));
}

export const slug = (texto) =>
  String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const urlComponente = (c) => url(`componentes/${c.id}/`);

export function menuDocs(docs, atual) {
  return docs.categorias
    .map(
      (cat) => `<h2>${esc(cat.nome)}</h2><ul>${docs.componentes
        .filter((c) => c.categoria === cat.id)
        .map((c) => `<li><a href="${urlComponente(c)}"${c.id === atual ? ' aria-current="page"' : ""}>${esc(c.nome)}${c.novo ? ' <span class="site-novo">novo</span>' : ""}</a></li>`)
        .join("")}</ul>`
    )
    .join("");
}

function blocoCodigo(exemplo, base) {
  const linguagens = [
    ["html", exemplo.html],
    ["js", exemplo.js],
    ["ts", exemplo.ts],
    ["php", exemplo.php],
  ].filter(([, codigo]) => codigo);
  return `<div class="site-codigo-abas">
          <div class="site-codigo-lista" role="tablist" aria-label="Linguagem do código">${linguagens.map(([l], i) => `<button type="button" role="tab" aria-selected="${i === 0}" aria-controls="${base}-${l}" id="${base}-aba-${l}" tabindex="${i === 0 ? 0 : -1}">${NOMES_LINGUAGEM[l]}</button>`).join("")}</div>
          ${exemplo.somenteCodigo ? "" : `<a class="at-botao at-pequeno site-editar" href="${linkEditor({ html: exemplo.html, js: exemplo.js || "" })}">Editar e testar</a>`}
          <button type="button" class="at-botao at-pequeno site-copiar" data-copiar-codigo>Copiar</button>
        </div>
        ${linguagens
          .map(
            ([l, codigo], i) =>
              `<pre class="site-codigo" id="${base}-${l}" role="tabpanel" aria-labelledby="${base}-aba-${l}" tabindex="0"${i ? " hidden" : ""}><code>${REALCES[l](codigo)}</code></pre>`
          )
          .join("\n        ")}`;
}

export function paginaComponente({ docs, componente: c, ordem, baseline, patrocinadores }) {
  const categoria = docs.categorias.find((cat) => cat.id === c.categoria);
  const posicao = ordem.indexOf(c);
  const anterior = ordem[posicao - 1];
  const proximo = ordem[posicao + 1];
  const porId = Object.fromEntries(docs.componentes.map((x) => [x.id, x]));
  const primeiroDaCategoria = ordem.find((x) => x.categoria === c.categoria);

  const secoes = [];
  const lista = (itens, classe = "") => `<ul class="site-lista ${classe}">${itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

  if (c.quandoUsar?.length || c.evitar?.length) {
    secoes.push({
      id: "quando-usar",
      titulo: "Quando usar",
      html: `<div class="site-listas">
          ${c.quandoUsar?.length ? `<div>${lista(c.quandoUsar)}</div>` : ""}
          ${c.evitar?.length ? `<div><h3 class="site-subtitulo">Evite</h3>${lista(c.evitar, "site-evitar")}</div>` : ""}
        </div>`,
    });
  }
  if (c.comoFunciona) {
    secoes.push({ id: "como-funciona", titulo: "Como funciona", html: `<div class="site-explicacao"><p>${esc(c.comoFunciona)}</p></div>` });
  }

  const exemplosJs = [];
  secoes.push({
    id: "exemplos",
    titulo: c.exemplos.length > 1 ? "Exemplos" : "Exemplo",
    html: c.exemplos
      .map((ex, i) => {
        const id = `exemplo-${slug(ex.titulo)}`;
        exemplosJs.push(ex.js && !ex.somenteCodigo ? ex.js : null);
        return `<div class="site-exemplo">
        <h3 class="site-exemplo-titulo" id="${id}"><a href="#${id}">${esc(ex.titulo)}</a></h3>
        ${ex.descricao ? `<p class="at-texto-suave">${esc(ex.descricao)}</p>` : ""}
        <div class="site-exemplo-caixa">
          ${ex.somenteCodigo ? "" : `<div class="site-demo" data-demo="${i}">\n${ex.html}\n          </div>`}
          ${blocoCodigo(ex, `ex${i}`)}
        </div>
      </div>`;
      })
      .join("\n"),
  });

  if (c.api?.length) {
    secoes.push({
      id: "referencia",
      titulo: "Referência",
      html: `<div class="at-tabela-caixa" tabindex="0" role="region" aria-label="Referência de ${esc(c.nome)}"><table class="at-tabela site-tabela-api">
          <thead><tr><th scope="col">Nome</th><th scope="col">Tipo</th><th scope="col">O que faz</th></tr></thead>
          <tbody>${c.api.map((a) => `<tr><td><code>${esc(a.nome)}</code></td><td>${esc(a.tipo)}</td><td>${esc(a.descricao)}</td></tr>`).join("")}</tbody>
        </table></div>`,
    });
  }
  if (c.acessibilidade?.length) secoes.push({ id: "acessibilidade", titulo: "Acessibilidade", html: lista(c.acessibilidade) });
  const conecta = (c.conectaCom || []).map((id) => porId[id]).filter(Boolean);
  if (conecta.length) {
    secoes.push({
      id: "combina-com",
      titulo: "Combina com",
      html: `<div class="site-relacionados">${conecta
        .map((x) => `<a href="${urlComponente(x)}"><strong>${esc(x.nome)}</strong><span>${esc(x.resumo)}</span></a>`)
        .join("")}</div>`,
    });
  }
  if (c.mdn?.length) {
    secoes.push({
      id: "documentacao-oficial",
      titulo: "Documentação oficial (MDN)",
      html: `<ul class="site-links-mdn">${c.mdn
        .map(
          (l) =>
            `<li><a href="${esc(l.url)}" target="_blank" rel="noopener"><span class="site-idioma" data-idioma="${l.idioma}">${l.idioma === "pt" ? "PT" : "EN"}</span>${esc(l.titulo)}</a>${l.idioma === "en" ? ' <small class="at-texto-suave">ainda sem tradução para português</small>' : ""}</li>`
        )
        .join("")}</ul>`,
    });
  }

  const selos = (c.recursos || [])
    .map((id) => {
      const r = baseline.recursos[id] || { nome: id, status: "desconhecido" };
      const s = SELOS[r.status] || SELOS.desconhecido;
      return `<span class="at-selo ${s.classe} site-selo-baseline" data-at-dica="${esc(s.dica(r))}" tabindex="0">${esc(r.nome)} · ${s.texto}</span>`;
    })
    .join("");

  const linguagens = new Set(c.exemplos.flatMap((ex) => ["html", ex.js && "js", ex.ts && "ts", ex.php && "php"].filter(Boolean)));

  const conteudo = `<div class="site-docs">
    <nav class="site-menu-docs" id="menu-docs" aria-label="Todos os componentes">${menuDocs(docs, c.id)}</nav>
    <article class="site-artigo" data-componente="${c.id}">
      <div class="site-docs-barra-celular">
        <button class="at-botao at-pequeno" data-at-alternar="#menu-docs" aria-expanded="false" aria-controls="menu-docs">${ICONES_SITE.menu} Todos os componentes</button>
      </div>
      <nav class="at-trilha" aria-label="Você está em"><ol>
        <li><a href="${url()}">Início</a></li>
        <li><a href="${url("componentes/")}">Componentes</a></li>
        <li><a href="${urlComponente(primeiroDaCategoria)}">${esc(categoria.nome)}</a></li>
        <li aria-current="page">${esc(c.nome)}</li>
      </ol></nav>
      <div class="site-titulo-linha">
        <h1 class="site-titulo site-h2" tabindex="-1">${esc(c.nome)}</h1>
        <button class="at-botao at-pequeno site-favoritar" data-favoritar="${c.id}" aria-pressed="false" hidden>${ICONES_SITE.coracao}<span>Favoritar</span></button>
      </div>
      <p class="at-chamada">${esc(c.resumo)}</p>
      <div class="site-meta">
        ${[...linguagens].map((l) => `<span class="site-linguagem" data-linguagem="${l}">${NOMES_LINGUAGEM[l]}</span>`).join("")}
      </div>
      ${c.inspiradoEm?.length ? `<div class="site-meta"><span class="site-meta-rotulo">Padrão usado em</span>${c.inspiradoEm.map((t) => `<span class="site-referencia">${esc(t)}</span>`).join("")}</div>` : ""}
      ${selos ? `<div class="site-meta"><span class="site-meta-rotulo">Suporte dos navegadores</span>${selos}</div>` : ""}

      ${secoes.map((s) => `<section aria-labelledby="${s.id}"><h2 class="site-secao-titulo" id="${s.id}"><a href="#${s.id}">${s.titulo}</a></h2>\n${s.html}\n</section>`).join("\n\n")}

      <nav class="site-navegacao-docs" aria-label="Anterior e próximo">
        ${anterior ? `<a href="${urlComponente(anterior)}" rel="prev"><small>← Anterior</small><strong>${esc(anterior.nome)}</strong></a>` : "<span></span>"}
        ${proximo ? `<a href="${urlComponente(proximo)}" rel="next"><small>Próximo →</small><strong>${esc(proximo.nome)}</strong></a>` : ""}
      </nav>
      <p class="at-texto-suave at-texto-pequeno at-mt-6">Encontrou um erro? <a href="${SITE.repositorio}/issues/new?title=${encodeURIComponent(`[${c.nome}] `)}" target="_blank" rel="noopener">Abra uma issue</a> ou <a href="${SITE.repositorio}/tree/main/site/dados" target="_blank" rel="noopener">edite no GitHub</a>.</p>
    </article>
    <aside class="site-indice" aria-label="Nesta página">
      <div class="site-indice-fixo">
        <h2>Nesta página</h2>
        <ul>${secoes.map((s) => `<li><a href="#${s.id}">${s.titulo}</a></li>`).join("")}</ul>
        ${espacoPatrocinio(patrocinadores, "lateral")}
      </div>
    </aside>
  </div>
  <script type="application/json" id="exemplos-js">${JSON.stringify(exemplosJs).replace(/</g, "\\u003c")}</script>`;

  const titulo = `${c.nome} em HTML, CSS e JavaScript | Atalho`;
  return pagina({
    titulo: titulo.length > 65 ? `${c.nome} | Atalho` : titulo,
    tituloSocial: `${c.nome} · Atalho`,
    descricao: c.resumo.length > 158 ? `${c.resumo.slice(0, 155).replace(/\s+\S*$/, "")}…` : c.resumo,
    caminho: `componentes/${c.id}/`,
    pagina: "componente",
    secao: c.categoria === "fundamentos" ? "comecar" : "componentes",
    tipoOg: "article",
    conteudo,
    dadosEstruturados: [
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: `${c.nome} em HTML, CSS e JavaScript`,
        description: c.resumo,
        inLanguage: "pt-BR",
        url: urlAbsoluta(`componentes/${c.id}/`),
        author: { "@type": "Person", name: SITE.autor, url: SITE.autorUrl },
        publisher: { "@type": "Organization", name: SITE.nome, url: SITE.url },
        keywords: (c.apelidos || []).join(", "),
        proficiencyLevel: "Beginner",
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Componentes", item: urlAbsoluta("componentes/") },
          { "@type": "ListItem", position: 3, name: c.nome, item: urlAbsoluta(`componentes/${c.id}/`) },
        ],
      },
    ],
  });
}
