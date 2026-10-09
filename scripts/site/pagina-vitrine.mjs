import { SITE, url } from "./config.mjs";
import { pagina, ICONES_SITE, SCRIPTS_SUPABASE } from "./layout.mjs";
import { esc } from "./realce.mjs";
import { ANIMACOES, CATEGORIAS as CATEGORIAS_ANIMACOES } from "./animacoes.mjs";
import { COMPONENTES_AVANCADOS, CATEGORIAS_COMPONENTES } from "./componentes-avancados.mjs";
import { PRECOS } from "./paginas-extras.mjs";

const euro = (valor) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "EUR" }).format(valor).replace(/,00$/, "");
export const NIVEIS = { publico: "Grátis", membro: "Membro", pro: "Pro" };

/**
 * Vitrine com prévia ao vivo, ajustes, código e tutorial: usada pelo Estúdio de
 * animações e pelos Componentes avançados. Catálogo público; o código de cada
 * item vem do Supabase só para quem tem acesso (site/vitrine.js):
 *   visitante → nível "publico"; membro → publico + membro; Pro → todos.
 */
function paginaVitrine({ tipo, prefixo, caminho, secao, itens, categorias, textos, titulo, descricao }) {
  const conta = (nivel) => itens.filter((a) => a.nivel === nivel).length;
  const nomeCategoria = Object.fromEntries(categorias.map((c) => [c.id, c.nome]));
  const ordem = { publico: 0, membro: 1, pro: 2 };
  const ordenados = [...itens].sort((a, b) => ordem[a.nivel] - ordem[b.nivel]);

  const cartoes = ordenados
    .map(
      (a) => `<li>
          <button type="button" class="site-anim-cartao" data-item="${a.id}" data-nivel="${a.nivel}" data-categoria="${a.categoria}">
            <span class="site-anim-topo">
              <span class="site-anim-categoria">${esc(nomeCategoria[a.categoria] || a.categoria)}</span>
              <span class="site-anim-nivel" data-nivel="${a.nivel}">${a.nivel === "pro" ? "★ " : ""}${NIVEIS[a.nivel]}</span>
            </span>
            <strong>${esc(a.nome)}</strong>
            <span class="site-anim-descricao">${esc(a.descricao)}</span>
            <span class="site-anim-estado" data-item-estado>${ICONES_SITE.cadeado} Bloqueado</span>
          </button>
        </li>`
    )
    .join("\n        ");

  const conteudo = `
    <section class="site-cabecalho-pagina site-anim-cabecalho">
      <div class="site-container">
        <span class="at-sobretitulo">${esc(textos.sobretitulo)}</span>
        <h1 class="site-titulo site-h2">${textos.titulo}</h1>
        <p class="at-chamada">${esc(textos.chamada)}</p>
        <div class="site-anim-niveis">
          <div><strong>${conta("publico")}</strong><span>grátis, sem cadastro</span></div>
          <div><strong>${conta("publico") + conta("membro")}</strong><span>com conta grátis</span></div>
          <div><strong>${itens.length}</strong><span>no Atalho Pro</span></div>
        </div>
      </div>
    </section>

    <div class="site-container site-anim" data-vitrine>
      <div class="at-alerta site-anim-aviso" data-vitrine-aviso aria-live="polite">
        <div class="at-alerta-conteudo">
          <strong data-vitrine-aviso-titulo>Conferindo seu acesso…</strong>
          <p data-vitrine-aviso-texto></p>
          <div class="at-linha at-mt-2" data-vitrine-aviso-acoes hidden></div>
        </div>
      </div>

      <div class="site-anim-filtros" role="group" aria-label="Filtrar por categoria">
        <button type="button" class="site-sugestao" aria-pressed="true" data-vitrine-filtro="">Todas</button>
        ${categorias.map((c) => `<button type="button" class="site-sugestao" aria-pressed="false" data-vitrine-filtro="${c.id}">${esc(c.nome)}</button>`).join("\n        ")}
      </div>

      <ul class="site-anim-grade" data-vitrine-grade>
        ${cartoes}
      </ul>
    </div>

    <dialog class="at-modal site-anim-estudio" id="vitrine-estudio" aria-labelledby="vitrine-titulo">
      <div class="site-anim-estudio-topo">
        <div>
          <span class="site-anim-nivel" data-estudio-nivel></span>
          <h2 class="at-titulo-4" id="vitrine-titulo" data-estudio-nome></h2>
          <p class="at-texto-suave at-texto-pequeno at-mb-0" data-estudio-descricao></p>
        </div>
        <button type="button" class="at-botao at-icone at-fantasma" commandfor="vitrine-estudio" command="close" aria-label="Fechar">✕</button>
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
            <button type="button" class="at-botao at-pequeno" data-estudio-repetir>↻ Recarregar</button>
            <div class="at-abas at-segmentado site-vitrine-telas" role="radiogroup" aria-label="Tamanho da tela">
              <button type="button" class="at-aba" role="radio" aria-checked="true" data-tela="100%">Computador</button>
              <button type="button" class="at-aba" role="radio" aria-checked="false" data-tela="768px">Tablet</button>
              <button type="button" class="at-aba" role="radio" aria-checked="false" data-tela="390px">Celular</button>
            </div>
            <span class="at-texto-pequeno at-texto-suave" data-estudio-dica></span>
            <label class="at-texto-pequeno site-anim-forcar" data-estudio-forcar hidden><input type="checkbox" data-estudio-forcar-caixa> Mostrar mesmo com "reduzir movimento"</label>
          </div>
          <div class="site-vitrine-moldura"><iframe title="Prévia" sandbox="allow-scripts allow-forms allow-modals" data-estudio-previa></iframe></div>
        </div>
        <form class="site-anim-controles" data-estudio-controles aria-label="Ajustes"></form>
        <div class="site-anim-codigo">
          <div class="at-abas at-segmentado site-vitrine-abas" data-at="abas" aria-label="Código ou tutorial">
            <button type="button" class="at-aba" aria-controls="vitrine-painel-codigo">Código</button>
            <button type="button" class="at-aba" aria-controls="vitrine-painel-tutorial">Como usar (passo a passo)</button>
          </div>
          <div class="at-painel" id="vitrine-painel-codigo">
            <div class="site-codigo-abas">
              <span class="site-codigo-rotulo">Código com os seus ajustes</span>
              <div class="at-linha">
                <button type="button" class="at-botao at-pequeno" data-estudio-acao="restaurar">Restaurar padrão</button>
                <button type="button" class="at-botao at-pequeno" data-estudio-acao="baixar">${ICONES_SITE.baixar} Baixar página</button>
                <a class="at-botao at-pequeno" href="${url("editor/")}" data-estudio-editor>Abrir no editor</a>
                <button type="button" class="at-botao at-pequeno at-primario" data-estudio-acao="copiar">${ICONES_SITE.codigo} Copiar</button>
              </div>
            </div>
            <pre class="site-codigo" tabindex="0"><code data-estudio-fonte></code></pre>
          </div>
          <div class="at-painel site-vitrine-tutorial" id="vitrine-painel-tutorial" data-estudio-tutorial></div>
        </div>
      </div>
    </dialog>

    <script type="application/json" id="vitrine-catalogo">${JSON.stringify({
      tipo,
      prefixo,
      itens,
      precos: { proMensal: euro(PRECOS.proMensal), proAnual: euro(PRECOS.proAnual) },
      textos: { item: textos.item, itens: textos.itens },
    }).replace(/</g, "\\u003c")}</script>`;

  return pagina({
    titulo,
    descricao,
    caminho,
    pagina: secao,
    secao,
    conteudo,
    scripts: [...SCRIPTS_SUPABASE, "site/loja.js", "site/vitrine.js"],
    dadosEstruturados: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: textos.sobretitulo,
      url: `${SITE.url}${caminho}`,
      hasPart: itens.map((a) => ({ "@type": "CreativeWork", name: a.nome, description: a.descricao, isAccessibleForFree: a.nivel === "publico" })),
    },
  });
}

export function paginaAnimacoes() {
  return paginaVitrine({
    tipo: "animacao",
    prefixo: "anim-",
    caminho: "animacoes/",
    secao: "animacoes",
    itens: ANIMACOES,
    categorias: CATEGORIAS_ANIMACOES,
    titulo: "Estúdio de animações CSS e JavaScript em português · Atalho",
    descricao: `${ANIMACOES.length} animações prontas e editáveis: revelar ao rolar, parallax, máquina de escrever, contador, cartão 3D, confete e mais. Teste grátis, sem cadastro.`,
    textos: {
      sobretitulo: "Estúdio de animações",
      titulo: `Animações profissionais, <span class="site-anim-destaque">ajustadas no clique</span>.`,
      chamada: `${ANIMACOES.length} efeitos prontos, do "surgir" à rolagem cinematográfica. Mexa nos controles, veja na hora e copie o código já com os seus valores. Cada um vem com o passo a passo para usar no seu site.`,
      item: "animação",
      itens: "animações",
    },
  });
}

export function paginaComponentesAvancados() {
  return paginaVitrine({
    tipo: "componente",
    prefixo: "comp-",
    caminho: "avancados/",
    secao: "avancados",
    itens: COMPONENTES_AVANCADOS,
    categorias: CATEGORIAS_COMPONENTES,
    titulo: `${COMPONENTES_AVANCADOS.length} componentes avançados prontos para sites e sistemas · Atalho`,
    descricao: `${COMPONENTES_AVANCADOS.length} componentes prontos para usar: hero, preços, depoimentos, carrinho, agenda, gráficos, checkout e mais. Prévia ao vivo, código e passo a passo em português.`,
    textos: {
      sobretitulo: "Componentes avançados",
      titulo: `Blocos prontos para <span class="site-anim-destaque">vender, agendar e encantar</span>.`,
      chamada: `${COMPONENTES_AVANCADOS.length} componentes completos, com visual profissional e funcionando de verdade: preços, agenda, carrinho, gráficos, formulários. Veja no computador, no tablet e no celular, ajuste as cores e copie. Cada um explica como usar, mesmo para quem nunca programou.`,
      item: "componente",
      itens: "componentes",
    },
  });
}
