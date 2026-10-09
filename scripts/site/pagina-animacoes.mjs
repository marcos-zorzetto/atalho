import { SITE, url } from "./config.mjs";
import { pagina, ICONES_SITE, SCRIPTS_SUPABASE } from "./layout.mjs";
import { esc } from "./realce.mjs";
import { ANIMACOES, CATEGORIAS, NIVEIS } from "./animacoes.mjs";
import { PRECOS } from "./paginas-extras.mjs";

const euro = (valor) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "EUR" }).format(valor).replace(/,00$/, "");

/**
 * Estúdio de animações. A página e o catálogo são públicos; o código de cada
 * animação chega do Supabase só para quem tem acesso (site/animacoes.js).
 */
export function paginaAnimacoes() {
  const membro = ANIMACOES.filter((a) => a.nivel === "membro").length;
  const pro = ANIMACOES.length - membro;
  const nomeCategoria = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.nome]));

  const cartoes = ANIMACOES.map(
    (a) => `<li>
          <button type="button" class="site-anim-cartao" data-animacao="${a.id}" data-nivel="${a.nivel}" data-categoria="${a.categoria}">
            <span class="site-anim-topo">
              <span class="site-anim-categoria">${esc(nomeCategoria[a.categoria])}</span>
              <span class="site-anim-nivel" data-nivel="${a.nivel}">${a.nivel === "pro" ? "★ " : ""}${NIVEIS[a.nivel]}</span>
            </span>
            <strong>${esc(a.nome)}</strong>
            <span class="site-anim-descricao">${esc(a.descricao)}</span>
            <span class="site-anim-estado" data-anim-estado>${ICONES_SITE.cadeado} Bloqueada</span>
          </button>
        </li>`
  ).join("\n        ");

  const conteudo = `
    <section class="site-cabecalho-pagina site-anim-cabecalho">
      <div class="site-container">
        <span class="at-sobretitulo">Estúdio de animações</span>
        <h1 class="site-titulo site-h2">Animações profissionais, <span class="site-anim-destaque">ajustadas no clique</span>.</h1>
        <p class="at-chamada">${ANIMACOES.length} efeitos prontos, do "surgir" à rolagem cinematográfica. Mexa nos controles, veja na hora e copie o código já com os seus valores. Sem biblioteca e sem escrever CSS.</p>
        <div class="site-anim-niveis">
          <div><strong>${membro}</strong><span>grátis com conta</span></div>
          <div><strong>${pro}</strong><span>avançadas no Pro</span></div>
          <div><strong>100%</strong><span>CSS e JS puro, acessível</span></div>
        </div>
      </div>
    </section>

    <div class="site-container site-anim">
      <div class="at-alerta site-anim-aviso" data-anim-aviso aria-live="polite">
        <div class="at-alerta-conteudo">
          <strong data-anim-aviso-titulo>Conferindo seu acesso…</strong>
          <p data-anim-aviso-texto></p>
          <div class="at-linha at-mt-2" data-anim-aviso-acoes hidden></div>
        </div>
      </div>

      <div class="site-anim-filtros" role="group" aria-label="Filtrar animações">
        <button type="button" class="site-sugestao" aria-pressed="true" data-anim-filtro="">Todas</button>
        ${CATEGORIAS.map((c) => `<button type="button" class="site-sugestao" aria-pressed="false" data-anim-filtro="${c.id}">${esc(c.nome)}</button>`).join("\n        ")}
      </div>

      <ul class="site-anim-grade" data-anim-grade>
        ${cartoes}
      </ul>
    </div>

    <dialog class="at-modal site-anim-estudio" id="anim-estudio" aria-labelledby="anim-estudio-titulo">
      <div class="site-anim-estudio-topo">
        <div>
          <span class="site-anim-nivel" data-estudio-nivel></span>
          <h2 class="at-titulo-4" id="anim-estudio-titulo" data-estudio-nome></h2>
          <p class="at-texto-suave at-texto-pequeno at-mb-0" data-estudio-descricao></p>
        </div>
        <button type="button" class="at-botao at-icone at-fantasma" commandfor="anim-estudio" command="close" aria-label="Fechar estúdio">✕</button>
      </div>

      <div class="site-anim-bloqueio" data-estudio-bloqueio hidden>
        <span class="site-exclusivo-icone">${ICONES_SITE.cadeado}</span>
        <h3 class="at-titulo-4" data-estudio-bloqueio-titulo></h3>
        <p class="at-texto-suave" data-estudio-bloqueio-texto></p>
        <div class="at-linha at-centro" data-estudio-bloqueio-acoes></div>
      </div>

      <div class="site-anim-area" data-estudio-area hidden>
        <div class="site-anim-previa">
          <div class="site-anim-previa-barra">
            <button type="button" class="at-botao at-pequeno" data-estudio-repetir>↻ Repetir</button>
            <span class="at-texto-pequeno at-texto-suave" data-estudio-dica></span>
            <label class="at-texto-pequeno site-anim-forcar" data-estudio-forcar hidden><input type="checkbox" data-estudio-forcar-caixa> Mostrar mesmo com "reduzir movimento"</label>
          </div>
          <iframe title="Prévia da animação" sandbox="allow-scripts" data-estudio-previa></iframe>
        </div>
        <form class="site-anim-controles" data-estudio-controles aria-label="Ajustes da animação"></form>
        <div class="site-anim-codigo">
          <div class="site-codigo-abas">
            <span class="site-codigo-rotulo">Código com os seus ajustes</span>
            <div class="at-linha">
              <button type="button" class="at-botao at-pequeno" data-estudio-acao="restaurar">Restaurar padrão</button>
              <button type="button" class="at-botao at-pequeno" data-estudio-acao="baixar">${ICONES_SITE.baixar} Baixar</button>
              <a class="at-botao at-pequeno" href="${url("editor/")}" data-estudio-editor>Abrir no editor</a>
              <button type="button" class="at-botao at-pequeno at-primario" data-estudio-acao="copiar">${ICONES_SITE.codigo} Copiar</button>
            </div>
          </div>
          <pre class="site-codigo" tabindex="0"><code data-estudio-fonte></code></pre>
        </div>
      </div>
    </dialog>

    <script type="application/json" id="anim-catalogo">${JSON.stringify({ animacoes: ANIMACOES, precos: { proMensal: euro(PRECOS.proMensal), proAnual: euro(PRECOS.proAnual) } }).replace(/</g, "\\u003c")}</script>`;

  return pagina({
    titulo: "Estúdio de animações CSS e JavaScript em português · Atalho",
    descricao: `${ANIMACOES.length} animações prontas e editáveis: revelar ao rolar, parallax, máquina de escrever, contador, cartão 3D, confete e mais. ${membro} grátis com conta; todas no Atalho Pro.`,
    caminho: "animacoes/",
    pagina: "animacoes",
    secao: "animacoes",
    conteudo,
    scripts: [...SCRIPTS_SUPABASE, "site/loja.js", "site/animacoes.js"],
    dadosEstruturados: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Estúdio de animações do Atalho",
      url: `${SITE.url}animacoes/`,
      hasPart: ANIMACOES.map((a) => ({ "@type": "CreativeWork", name: a.nome, description: a.descricao, isAccessibleForFree: false })),
    },
  });
}
