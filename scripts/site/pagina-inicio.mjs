import { SITE, url } from "./config.mjs";
import { pagina, espacoPatrocinio, ICONES_SITE } from "./layout.mjs";
import { esc, realcarHTML, realcarTS, realcarPHP } from "./realce.mjs";
import { urlComponente } from "./pagina-componente.mjs";

export function paginaInicio({ docs, baseline, patrocinadores, exemplos }) {
  const total = docs.componentes.length;
  const recursos = Object.values(baseline.recursos);
  const amplos = recursos.filter((r) => r.status === "amplo").length;
  const linksPt = docs.componentes.flatMap((c) => c.mdn || []);
  const dataDados = baseline.verificadoEm
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(`${baseline.verificadoEm}T12:00:00`))
    : "—";

  const instalacao = `<link rel="stylesheet" href="${SITE.cdn}/atalho.css">
<script src="${SITE.cdn}/atalho.js" defer></script>`;

  const vitrine = {
    html: `<input class="at-entrada" data-at-mascara="cpf">

<button commandfor="confirmar" command="show-modal">
  Excluir
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
if (!Atalho\\validarCpf($dados['cpf'] ?? '')) {
    Atalho\\responderErro('CPF inválido', 422);
}`,
  };

  const conteudo = `
    <section class="site-hero">
      <div class="site-container site-hero-grade">
        <div>
          <button type="button" class="site-novidade" data-abrir-assistente>
            <span class="at-selo at-destaque">Novo</span> Descreva o que precisa e o assistente monta ${ICONES_SITE.seta}
          </button>
          <h1 class="site-titulo site-h1">Pare de juntar tutoriais. <span class="site-marcador">Comece pelo componente pronto.</span></h1>
          <p class="at-chamada">${total} componentes e receitas de HTML, CSS e JavaScript, nos padrões que Mercado Livre, GitHub, Stripe e Nubank usam. Explicados em português, com exemplos em TypeScript e PHP.</p>

          <div class="site-busca" role="search">
            <label class="site-busca-campo">
              ${ICONES_SITE.busca}
              <span class="at-sr">O que você quer construir?</span>
              <input id="busca-inicio" type="search" placeholder="O que você quer construir?" autocomplete="off"
                     role="combobox" aria-expanded="false" aria-controls="busca-inicio-resultados" aria-autocomplete="list">
              <kbd class="at-tecla at-so-desktop">Ctrl K</kbd>
            </label>
            <ul class="site-busca-resultados" id="busca-inicio-resultados" role="listbox" aria-label="Componentes encontrados" hidden></ul>
          </div>
          <div class="site-sugestoes">
            Experimente:
            ${["máscara de CPF", "carrinho de compras", "janela de confirmação", "tabela com filtro", "login com código"].map((s) => `<button type="button" class="site-sugestao" data-sugestao="${s}">${s}</button>`).join("")}
          </div>

          <div class="site-hero-acoes">
            <a class="at-botao at-primario at-grande" href="${url("componentes/instalacao/")}">Começar agora ${ICONES_SITE.seta}</a>
            <a class="at-botao at-grande" href="${url("exemplos/")}">Ver exemplos prontos</a>
          </div>
        </div>

        <div class="site-vitrine" aria-label="Demonstração ao vivo">
          <span class="site-etiqueta-viva">AO VIVO</span>
          <article class="at-cartao">
            <div class="at-cartao-cabecalho">
              <h2 class="at-texto-pequeno">Loja exemplo</h2>
              <button class="at-botao at-icone at-contador-selo at-pequeno" aria-label="Carrinho">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6"/></svg>
                <span data-contador data-at-texto="vitrineInicio.quantidade" data-at-mostrar="vitrineInicio.quantidade"></span>
              </button>
            </div>
            <div class="at-cartao-corpo at-linha at-topo" style="--at-gap: 16px">
              <img src="https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp" alt="Tênis cano alto vermelho e preto" width="104" height="104" style="background:#fff;border-radius:10px;object-fit:contain">
              <div class="at-cresce at-pilha" style="--at-gap: 2px">
                <span class="at-texto-pequeno">Tênis cano alto vermelho e preto</span>
                <span class="at-preco-antigo">R$ 799,90</span>
                <div><span class="at-preco">R$ 599,90</span><span class="at-preco-desconto">25% OFF</span></div>
                <span class="at-parcelas">em 10x R$ 59,99 sem juros</span>
                <button class="at-botao at-primario at-pequeno at-mt-2" data-at-acao="vitrineInicio.adicionar">Comprar</button>
              </div>
            </div>
          </article>
          <article class="at-cartao">
            <form class="at-cartao-corpo at-formulario" data-at-validar id="form-inicio" style="gap: 12px">
              <div class="at-campo at-meio">
                <label class="at-rotulo" for="inicio-cpf">CPF</label>
                <input class="at-entrada" id="inicio-cpf" name="cpf" required data-at-mascara="cpf" placeholder="000.000.000-00">
              </div>
              <div class="at-campo at-meio">
                <label class="at-rotulo" for="inicio-cep">CEP</label>
                <input class="at-entrada" id="inicio-cep" name="cep" required data-at-mascara="cep" data-at-cep placeholder="01310-100">
              </div>
              <div class="at-campo">
                <label class="at-rotulo" for="inicio-rua">Endereço</label>
                <input class="at-entrada" id="inicio-rua" name="rua" required data-at-cep-preencher="logradouro" placeholder="Preenche sozinho pelo CEP">
              </div>
              <button class="at-botao at-bloco">Validar</button>
            </form>
          </article>
          <p class="at-texto-suave at-texto-pequeno at-mb-0">Componentes do Atalho conectados pelo estado. Sem framework.</p>
        </div>
      </div>
    </section>

    <section class="site-faixa-numeros" aria-label="O Atalho em números">
      <div class="site-container">
        <div><strong>${total}</strong><span>componentes e receitas</span></div>
        <div><strong>${exemplos.length}</strong><span>páginas completas prontas</span></div>
        <div><strong>0</strong><span>dependências</span></div>
        <div><strong>100%</strong><span>em português</span></div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container">
        <span class="at-sobretitulo">Por que o Atalho</span>
        <h2 class="site-titulo site-h2">Tudo que o Bootstrap tem. Mais o que faltava para o Brasil.</h2>
        <div class="site-recursos at-mt-6">
          ${[
            ["Componentes completos", "Não só a peça isolada: quando usar, o que evitar, acessibilidade e como cada componente conversa com os outros."],
            ["Feito para o Brasil", "Máscaras de CPF e CNPJ alfanumérico, CEP automático, Pix copia e cola, parcelas sem juros, aviso de cookies da LGPD."],
            ["Estado reativo", "A ideia central do React em atributos HTML: muda o dado e a tela inteira acompanha. Sem build."],
            ["TypeScript e PHP", "Tipos completos da biblioteca e uma biblioteca PHP para o servidor: validação, CEP, respostas JSON e segurança."],
            ["Acessível de verdade", "Teclado, leitores de tela e ARIA corretos em cada componente, seguindo o guia WAI-ARIA."],
            ["Sempre atualizado", "Um robô confere toda semana os dados oficiais dos navegadores e os links do MDN, e propõe as atualizações."],
          ]
            .map(([t, d]) => `<div class="site-recurso"><h3>${t}</h3><p>${d}</p></div>`)
            .join("")}
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container site-duas-colunas">
        <div>
          <span class="at-sobretitulo">Do HTML ao servidor</span>
          <h2 class="site-titulo site-h2">Um só jeito de pensar, nas três camadas.</h2>
          <p class="at-chamada">No navegador, atributos em português. No TypeScript, tipos que completam sozinhos no editor. No PHP, as mesmas regras validadas no servidor, que é onde a segurança de verdade acontece.</p>
          <div class="at-linha at-mt-6">
            <a class="at-botao" href="${url("typescript/")}">Guia de TypeScript</a>
            <a class="at-botao" href="${url("php/")}">Guia de PHP</a>
          </div>
        </div>
        <div class="site-exemplo-caixa">
          <div class="site-codigo-abas">
            <div class="site-codigo-lista" role="tablist" aria-label="Linguagem do código">
              <button type="button" role="tab" aria-selected="true" aria-controls="vit-html" id="vit-aba-html">HTML</button>
              <button type="button" role="tab" aria-selected="false" aria-controls="vit-ts" id="vit-aba-ts" tabindex="-1">TypeScript</button>
              <button type="button" role="tab" aria-selected="false" aria-controls="vit-php" id="vit-aba-php" tabindex="-1">PHP</button>
            </div>
            <button type="button" class="at-botao at-pequeno site-copiar" data-copiar-codigo>Copiar</button>
          </div>
          <pre class="site-codigo" id="vit-html" role="tabpanel" aria-labelledby="vit-aba-html" tabindex="0"><code>${realcarHTML(vitrine.html)}</code></pre>
          <pre class="site-codigo" id="vit-ts" role="tabpanel" aria-labelledby="vit-aba-ts" tabindex="0" hidden><code>${realcarTS(vitrine.ts)}</code></pre>
          <pre class="site-codigo" id="vit-php" role="tabpanel" aria-labelledby="vit-aba-php" tabindex="0" hidden><code>${realcarPHP(vitrine.php)}</code></pre>
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container">
        <div class="at-linha at-entre at-topo">
          <div>
            <span class="at-sobretitulo">Páginas completas</span>
            <h2 class="site-titulo site-h2">Copie a tela inteira, não só o botão.</h2>
            <p class="at-texto-suave at-mt-2">Seis páginas prontas, liberadas de graça para quem cria uma conta.</p>
          </div>
          <a class="at-botao at-grande" href="${url("exemplos/")}">Todos os exemplos ${ICONES_SITE.seta}</a>
        </div>
        <div class="site-galeria at-mt-6">
          ${exemplos
            .slice(0, 6)
            .map(
              (e) => `<a class="site-galeria-item" href="${url(`exemplos/${e.id}/`)}">
            <span class="site-galeria-moldura"><img src="${url(`exemplos/miniaturas/${e.id}.png`)}" alt="" loading="lazy" width="600" height="375"><span class="site-galeria-cadeado">${ICONES_SITE.cadeado} ${e.acesso === "pro" ? "Pro" : "Membros"}</span></span>
            <strong>${esc(e.nome)}</strong><span>${esc(e.resumo)}</span>
          </a>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container">
        <span class="at-sobretitulo">O que tem dentro</span>
        <h2 class="site-titulo site-h2">${total} componentes e receitas</h2>
        <div class="site-categorias at-mt-6">
          ${docs.categorias
            .map((cat) => {
              const itens = docs.componentes.filter((c) => c.categoria === cat.id);
              return `<a class="site-categoria" href="${url(`componentes/#${cat.id}`)}">
              <span class="site-contagem">${String(itens.length).padStart(2, "0")} ${itens.length === 1 ? "item" : "itens"}</span>
              <h3>${esc(cat.nome)}</h3>
              <p>${esc(cat.descricao)}</p>
              <span class="site-categoria-itens">${itens.slice(0, 8).map((c) => esc(c.nome)).join(" · ")}${itens.length > 8 ? " …" : ""}</span>
            </a>`;
            })
            .join("")}
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container site-historia">
        <blockquote>“Eu desisti de programar mais de uma vez. Não foi por falta de vontade.”</blockquote>
        <div class="site-historia-texto">
          <p>Eu assistia a um tutorial e entendia uma coisa. Assistia a outro e entendia outra. Na hora de juntar tudo num projeto de verdade, nada se encaixava. E a documentação oficial ajudava pouco: boa parte só existe em inglês e mostra cada peça isolada, nunca a tela pronta.</p>
          <p>O Atalho é o material que eu queria ter tido no começo. <strong>Cada componente vem completo</strong>, resolvido do jeito que as empresas grandes resolvem, com a explicação em português e, principalmente, <strong>como ele se conecta com os outros</strong> para virar uma tela de verdade.</p>
          <p class="at-mb-0">— ${SITE.autor}, criador do Atalho</p>
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container">
        <div class="site-robo">
          <div>
            <span class="at-sobretitulo" style="color: var(--at-cor-destaque)">Atualizado sozinho</span>
            <h2 class="site-titulo site-h2">A documentação muda. O Atalho acompanha.</h2>
            <p class="at-chamada">Toda semana, um robô confere os dados oficiais de suporte dos navegadores (os mesmos dos selos Baseline do MDN) e todos os links da documentação, e propõe as atualizações. Nada vai para o ar sem revisão.</p>
            <p class="at-texto-pequeno" style="color:#a8a29e">Dados atuais: web-features ${esc(baseline.versao || "—")}, de ${dataDados}.</p>
          </div>
          <div class="site-robo-numeros">
            <div class="site-robo-numero"><strong>${recursos.length}</strong><span>recursos do navegador monitorados</span></div>
            <div class="site-robo-numero"><strong>${amplos}</strong><span>já funcionam em todos os navegadores</span></div>
            <div class="site-robo-numero"><strong>${linksPt.filter((l) => l.idioma === "pt").length}/${linksPt.length}</strong><span>links do MDN já em português</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container site-duas-colunas site-chamada-final">
        <div class="site-pro-cartao">
          <span class="at-selo at-destaque">Atalho Pro</span>
          <h2 class="site-titulo site-h2">Sistemas inteiros, prontos para usar.</h2>
          <p>Painéis administrativos, lojas e landing pages completas, feitas com o Atalho, para economizar semanas de trabalho.</p>
          <a class="at-botao at-primario" href="${url("pro/")}">Entrar na lista de espera</a>
        </div>
        <div class="site-pilha-chamadas">
          ${espacoPatrocinio(patrocinadores, "inicio")}
          <div class="site-chamada-pequena">
            <h3>Quer apoiar o projeto?</h3>
            <p>O Atalho é gratuito. Patrocínios mantêm a documentação crescendo.</p>
            <a class="at-botao at-pequeno" href="${url("patrocinar/")}">Ver formatos de patrocínio</a>
          </div>
        </div>
      </div>
    </section>`;

  return pagina({
    titulo: "Atalho · Componentes HTML, CSS e JavaScript em português",
    descricao: `${total} componentes de interface em português, prontos para copiar: máscaras de CPF, CEP automático, carrinho, tabelas, modais e mais. Com TypeScript e PHP. Grátis.`,
    caminho: "",
    pagina: "inicio",
    secao: "",
    conteudo,
    dadosEstruturados: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.nome,
        url: SITE.url,
        inLanguage: "pt-BR",
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
          <input class="at-entrada" type="search" id="filtro-catalogo" placeholder="Filtrar: modal, cpf, tabela, carrinho…" aria-label="Filtrar componentes" autocomplete="off">
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
      <p class="site-catalogo-vazio at-texto-suave" hidden>Nenhum componente com esse nome. Tente a busca (Ctrl K), que entende sinônimos.</p>
    </div>`;

  return pagina({
    titulo: "Componentes · Atalho",
    descricao: `Todos os ${docs.componentes.length} componentes do Atalho: formulários, máscaras, CEP, modais, tabelas, carrinho, login e mais, explicados em português.`,
    caminho: "componentes/",
    pagina: "catalogo",
    secao: "componentes",
    conteudo,
    dadosEstruturados: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Componentes do Atalho",
      inLanguage: "pt-BR",
      hasPart: docs.componentes.map((c) => ({ "@type": "TechArticle", name: c.nome, url: `${SITE.url}componentes/${c.id}/` })),
    },
  });
}
