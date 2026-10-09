import { SITE, url, urlAbsoluta } from "./config.mjs";
import { pagina, ICONES_SITE, SCRIPTS_SUPABASE } from "./layout.mjs";
import { esc } from "./realce.mjs";
import { PRECOS } from "./paginas-extras.mjs";

// "€ 39" em vez de "€ 39,00"; centavos só quando existem
const euro = (valor) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "EUR" }).format(valor).replace(/,00$/, "");

/**
 * Vitrine de uma página completa: pública (o Google lê nome, descrição, destaques
 * e miniatura) e com o código liberado só para quem entrou na conta.
 */
export function paginaExemplo({ exemplo: e, exemplos, docs }) {
  const componentes = e.componentes.map((id) => docs.componentes.find((c) => c.id === id)).filter(Boolean);
  const outros = exemplos.filter((x) => x.id !== e.id).slice(0, 3);
  // Captura grande (1280×800) para a vitrine e para o compartilhamento em redes sociais
  const captura = `exemplos/capturas/${e.id}.jpg`;
  // Pro: só para quem assina ou comprou esta página (as regras do banco decidem)
  const pro = e.acesso === "pro";

  const conteudo = `
    <div class="site-container site-exemplo-pagina">
      <nav class="at-trilha" aria-label="Você está em"><ol>
        <li><a href="${url()}">Início</a></li>
        <li><a href="${url("exemplos/")}">Exemplos</a></li>
        <li aria-current="page">${esc(e.nome)}</li>
      </ol></nav>

      <header class="site-exemplo-topo">
        <div class="at-pilha">
          <span class="site-exclusivo-selo${pro ? " site-exclusivo-pro" : ""}">${ICONES_SITE.cadeado} ${pro ? "Atalho Pro" : "Grátis para membros"}</span>
          <h1 class="site-titulo site-h2">${esc(e.nome)}</h1>
          <p class="at-chamada">${esc(e.resumo)}</p>
          <ul class="site-exemplo-destaques">
            ${e.destaques.map((d) => `<li>${ICONES_SITE.check}<span>${esc(d)}</span></li>`).join("")}
          </ul>
        </div>
      </header>

      <section class="site-exclusivo" data-exclusivo="${e.id}"${pro ? ` data-exclusivo-acesso="pro"` : ""} aria-label="Página completa">
        <div class="site-exclusivo-vitrine" data-exclusivo-vitrine>
          <img src="${url(captura)}" alt="Prévia da página ${esc(e.nome)}" width="1280" height="800" fetchpriority="high">
          <div class="site-exclusivo-cartao" data-exclusivo-estado="carregando" aria-live="polite">
            <div data-exclusivo-carregando>
              <span class="at-carregando" aria-hidden="true"></span>
              <p class="at-texto-suave">Conferindo seu acesso…</p>
            </div>
            <div data-exclusivo-visitante hidden>
              <span class="site-exclusivo-icone">${ICONES_SITE.cadeado}</span>
              <h2 class="at-titulo-4">${pro ? "Exclusivo do Atalho Pro" : "Exclusivo para membros"}</h2>
              <p class="at-texto-suave">${
                pro
                  ? "Entre na sua conta (é grátis) e depois assine o Pro ou compre só esta página."
                  : "Crie sua conta grátis para ver esta página funcionando, copiar o código completo e baixar o arquivo pronto."
              }</p>
              <div class="at-linha at-centro">
                <a class="at-botao at-primario" href="${url("conta/")}?criar" data-exclusivo-criar>Criar conta grátis</a>
                <a class="at-botao" href="${url("conta/")}" data-exclusivo-entrar>Já tenho conta</a>
              </div>
            </div>
            <div data-exclusivo-pro hidden>
              <span class="site-exclusivo-icone">${ICONES_SITE.cadeado}</span>
              <h2 class="at-titulo-4">Esta página é do Atalho Pro</h2>
              <p class="at-texto-suave">Assine o Pro para liberar esta e todas as outras páginas Pro, ou compre só esta e fique com ela para sempre.</p>
              <div class="at-linha at-centro">
                <a class="at-botao at-primario" href="${url("pro/")}">Ver o Pro · ${euro(PRECOS.proMensal)}/mês</a>
                ${e.produto ? `<button type="button" class="at-botao" data-comprar="${esc(e.produto)}">Comprar só esta · ${euro(PRECOS.pagina)}</button>` : ""}
              </div>
            </div>
            <div data-exclusivo-indisponivel hidden>
              <span class="site-exclusivo-icone">${ICONES_SITE.cadeado}</span>
              <h2 class="at-titulo-4">Área de membros em breve</h2>
              <p class="at-texto-suave">As contas estão sendo ativadas. Enquanto isso, explore os <a href="${url("componentes/")}">componentes</a>, que continuam liberados.</p>
            </div>
            <div data-exclusivo-erro hidden>
              <h2 class="at-titulo-4">Não foi possível abrir agora</h2>
              <p class="at-texto-suave" data-exclusivo-erro-texto></p>
              <button type="button" class="at-botao" data-exclusivo-tentar>Tentar de novo</button>
            </div>
          </div>
        </div>

        <div class="site-exclusivo-membro" data-exclusivo-membro hidden>
          <div class="site-exclusivo-barra">
            <div class="at-abas at-segmentado" data-at="abas" aria-label="Visualização">
              <button class="at-aba" aria-controls="exclusivo-previa">Prévia</button>
              <button class="at-aba" aria-controls="exclusivo-codigo">Código</button>
            </div>
            <div class="at-linha">
              <button type="button" class="at-botao at-pequeno" data-exclusivo-acao="abrir">${ICONES_SITE.abrir} Tela cheia</button>
              <button type="button" class="at-botao at-pequeno" data-exclusivo-acao="copiar">${ICONES_SITE.codigo} Copiar código</button>
              <button type="button" class="at-botao at-pequeno" data-exclusivo-acao="baixar">${ICONES_SITE.baixar} Baixar HTML</button>
              <a class="at-botao at-pequeno at-primario" href="${url("editor/")}" data-exclusivo-editor>Editar e testar</a>
            </div>
          </div>
          <div class="at-painel" id="exclusivo-previa">
            <iframe class="site-exclusivo-previa" title="Página ${esc(e.nome)} funcionando" sandbox="allow-scripts allow-forms allow-modals allow-popups" loading="lazy" data-exclusivo-previa></iframe>
          </div>
          <div class="at-painel" id="exclusivo-codigo">
            <pre class="site-codigo site-exclusivo-codigo" tabindex="0" aria-label="Código completo"><code data-exclusivo-fonte></code></pre>
          </div>
        </div>
      </section>

      <section class="site-secao-curta">
        <h2 class="site-secao-titulo">Componentes usados</h2>
        <p class="at-texto-suave">Cada parte desta página tem documentação própria, liberada para todos.</p>
        <div class="site-relacionados">
          ${componentes.map((c) => `<a href="${url(`componentes/${c.id}/`)}"><strong>${esc(c.nome)}</strong><span>${esc(c.resumo)}</span></a>`).join("")}
        </div>
      </section>

      <section class="site-secao-curta site-exemplo-outros">
        <h2 class="site-secao-titulo">Outras páginas completas</h2>
        <div class="site-galeria">
          ${outros
            .map(
              (x) => `<a class="site-galeria-item" href="${url(`exemplos/${x.id}/`)}">
            <span class="site-galeria-moldura"><img src="${url(`exemplos/miniaturas/${x.id}.png`)}" alt="" loading="lazy" width="600" height="375"></span>
            <strong>${esc(x.nome)}</strong><span>${esc(x.resumo)}</span>
          </a>`
            )
            .join("")}
        </div>
      </section>
    </div>`;

  const endereco = urlAbsoluta(`exemplos/${e.id}/`);
  return pagina({
    titulo: `${e.nome} em HTML, CSS e JavaScript · Atalho`,
    tituloSocial: `${e.nome} · Atalho`,
    descricao: `${e.nome} pronta em HTML, CSS e JavaScript. ${e.resumo}`,
    caminho: `exemplos/${e.id}/`,
    pagina: "exemplo",
    secao: "exemplos",
    imagemSocial: urlAbsoluta(captura),
    imagemTamanho: [1280, 800],
    conteudo,
    scripts: [...SCRIPTS_SUPABASE, "site/loja.js", "site/membros.js"],
    dadosEstruturados: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `${e.nome} em HTML, CSS e JavaScript`,
        description: e.resumo,
        inLanguage: "pt-BR",
        url: endereco,
        image: urlAbsoluta(captura),
        author: { "@type": "Person", name: SITE.autor, url: SITE.autorUrl },
        // Conteúdo para membros, marcado como o Google pede (não é cloaking)
        isAccessibleForFree: false,
        hasPart: { "@type": "WebPageElement", isAccessibleForFree: false, cssSelector: ".site-exclusivo" },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Exemplos", item: urlAbsoluta("exemplos/") },
          { "@type": "ListItem", position: 3, name: e.nome, item: endereco },
        ],
      },
    ],
  });
}

/** Endereço antigo (exemplos/loja.html) leva para a vitrine nova. */
export function redirecionamentoExemplo(e) {
  const destino = url(`exemplos/${e.id}/`);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(e.nome)} · Atalho</title>
<link rel="canonical" href="${urlAbsoluta(`exemplos/${e.id}/`)}"><meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${destino}">
</head><body><a href="${destino}">${esc(e.nome)}</a></body></html>`;
}
