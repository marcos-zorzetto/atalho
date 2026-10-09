import { SITE, url } from "./config.mjs";
import { pagina, ICONES_SITE, SCRIPTS_SUPABASE } from "./layout.mjs";
import { PESOS, CATEGORIAS_PT, VERSAO_PHOSPHOR } from "./icones-phosphor.mjs";
import { esc, realcarHTML, realcarTS, realcarPHP, realcarCSS, realcarTerminal } from "./realce.mjs";

const cabecalhoPagina = (sobretitulo, titulo, chamada, extra = "") => `
    <section class="site-cabecalho-pagina">
      <div class="site-container">
        <span class="at-sobretitulo">${sobretitulo}</span>
        <h1 class="site-titulo site-h2">${titulo}</h1>
        <p class="at-chamada">${chamada}</p>
        ${extra}
      </div>
    </section>`;

const codigo = (linguagem, texto, rotulo) => {
  const realce = { html: realcarHTML, ts: realcarTS, php: realcarPHP, css: realcarCSS, terminal: realcarTerminal }[linguagem];
  return `<div class="site-exemplo-caixa">
      <div class="site-codigo-abas"><span class="site-codigo-rotulo">${rotulo || { html: "HTML", ts: "TypeScript", php: "PHP", css: "CSS", terminal: "Terminal" }[linguagem]}</span><button type="button" class="at-botao at-pequeno site-copiar" data-copiar-codigo>Copiar</button></div>
      <pre class="site-codigo" tabindex="0"><code>${realce(texto)}</code></pre>
    </div>`;
};

const artigo = (html) => `<div class="site-container site-artigo-simples">${html}</div>`;

/* ------------------------------------------------------------------------ */

export function paginaExemplos({ exemplos }) {
  const conteudo = `${cabecalhoPagina(
    "Exemplos",
    "Páginas completas, prontas para copiar",
    "Telas inteiras feitas só com o Atalho, prontas para usar como ponto de partida do seu projeto. Grátis para quem tem conta.",
    `<div class="at-linha at-mt-4" data-exemplos-chamada><a class="at-botao at-primario" href="${url("conta/")}?criar">Criar conta grátis</a><a class="at-botao" href="${url("conta/")}">Já tenho conta</a></div>`
  )}
    <div class="site-container site-secao-curta">
      <div class="site-galeria">
        ${exemplos
          .map(
            (e) => `<a class="site-galeria-item" href="${url(`exemplos/${e.id}/`)}">
          <span class="site-galeria-moldura"><img src="${url(`exemplos/miniaturas/${e.id}.png`)}" alt="Prévia do exemplo ${esc(e.nome)}" loading="lazy" width="600" height="375"><span class="site-galeria-cadeado">${ICONES_SITE.cadeado} ${e.acesso === "pro" ? "Pro" : "Membros"}</span></span>
          <strong>${esc(e.nome)}</strong><span>${esc(e.resumo)}</span>
          <span class="site-galeria-componentes">${e.componentes.map((c) => `<span class="at-selo">${esc(c)}</span>`).join("")}</span>
        </a>`
          )
          .join("")}
      </div>
    </div>`;
  return pagina({
    titulo: "Exemplos de páginas completas · Atalho",
    descricao: "Landing page, painel administrativo, loja, login, checkout e blog prontos em HTML, CSS e JavaScript, feitos com o Atalho. Grátis com cadastro.",
    caminho: "exemplos/",
    pagina: "exemplos",
    secao: "exemplos",
    conteudo,
  });
}

/* ------------------------------------------------------------------------ */

export function paginaIcones({ icones }) {
  const nomes = Object.keys(icones.icones);
  const conteudo = `${cabecalhoPagina(
    "Ícones",
    "1.512 ícones em 6 estilos, grátis",
    "Do traço fino ao duas cores. Escolha o estilo, o tamanho e a cor, e clique para copiar o SVG pronto. Busque em português: carrinho, dinheiro, agenda, barbearia…",
    `<div class="at-entrada-icone site-filtro">${ICONES_SITE.busca}<input class="at-entrada" type="search" id="filtro-icones" placeholder="Buscar: carrinho, pix, usuário, seta…" aria-label="Buscar ícones" autocomplete="off"></div>`
  )}
    <div class="site-container site-secao-curta site-icones-explorador" data-icones-explorador>
      <div class="site-icones-barra">
        <div class="at-abas at-segmentado" role="radiogroup" aria-label="Estilo dos ícones" data-icones-pesos>
          ${PESOS.map(([id, nome], i) => `<button type="button" class="at-aba" role="radio" aria-checked="${i === 0}" data-peso="${id}">${nome}</button>`).join("")}
        </div>
        <label class="site-icones-controle">Tamanho <input type="range" min="16" max="64" step="4" value="32" data-icones-tamanho aria-label="Tamanho dos ícones"><output data-icones-tamanho-valor>32px</output></label>
        <label class="site-icones-controle">Cor <input type="color" value="#0f766e" data-icones-cor aria-label="Cor dos ícones"></label>
        <select class="at-entrada site-icones-categoria" data-icones-categoria aria-label="Categoria">
          <option value="">Todas as categorias</option>
          ${Object.values(CATEGORIAS_PT).sort((a, b) => a.localeCompare(b, "pt-BR")).map((c) => `<option>${c}</option>`).join("")}
        </select>
      </div>
      <p class="at-texto-suave at-texto-pequeno" data-icones-contagem aria-live="polite">Carregando ícones…</p>
      <ul class="site-icones site-icones-phosphor" data-icones-lista></ul>
      <p class="at-texto-pequeno at-texto-suave">Ícones <a href="https://phosphoricons.com" target="_blank" rel="noopener">Phosphor</a> ${VERSAO_PHOSPHOR}, licença MIT: use à vontade, inclusive em projetos comerciais.</p>

      <h2 class="site-secao-titulo at-mt-8">Feitos para o Brasil</h2>
      <p class="at-texto-suave">${nomes.length} ícones desenhados para o Atalho, com traço de 2px: Pix, boleto, CPF, WhatsApp e outros do dia a dia brasileiro.</p>
      <ul class="site-icones" id="lista-icones">
        ${nomes
          .map(
            (n) => `<li><button type="button" class="site-icone" data-icone="${n}" aria-label="Copiar ícone ${n}">
          ${icones.svg(n, 24)}<span>${n}</span></button></li>`
          )
          .join("")}
      </ul>
      <h2 class="site-secao-titulo at-mt-6">Como usar</h2>
      <p>Cole o SVG copiado. O tamanho vem de <code>width</code>/<code>height</code> e a cor, do texto ao redor (<code>currentColor</code>). Em botões só com ícone, sempre coloque <code>aria-label</code>.</p>
      ${codigo(
        "html",
        `<button class="at-botao at-icone" aria-label="Carrinho">
  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">…</svg>
</button>`
      )}
    </div>

    <dialog class="at-modal at-pequeno site-icone-detalhe" id="icone-detalhe" aria-labelledby="icone-detalhe-nome">
      <div class="at-modal-corpo at-pilha">
        <div class="site-icone-detalhe-previa" data-icone-previa></div>
        <h2 class="at-titulo-4 at-mb-0" id="icone-detalhe-nome" data-icone-nome></h2>
        <p class="at-texto-pequeno at-texto-suave at-mb-0" data-icone-info></p>
        <pre class="site-codigo site-icone-codigo" tabindex="0"><code data-icone-codigo></code></pre>
        <div class="at-linha">
          <button type="button" class="at-botao at-primario" data-icone-acao="copiar">Copiar SVG</button>
          <button type="button" class="at-botao" data-icone-acao="baixar">Baixar .svg</button>
          <button type="button" class="at-botao at-fantasma" commandfor="icone-detalhe" command="close">Fechar</button>
        </div>
      </div>
    </dialog>`;
  return pagina({
    titulo: "1.512 ícones SVG grátis em 6 estilos · Atalho",
    descricao: `1.512 ícones SVG gratuitos (MIT) em 6 estilos, com busca em português, mais ${nomes.length} ícones brasileiros: Pix, boleto, CPF, WhatsApp. Escolha cor e tamanho e clique para copiar.`,
    caminho: "icones/",
    pagina: "icones",
    secao: "icones",
    conteudo,
    scripts: ["site/icones.js"],
  });
}

/* ------------------------------------------------------------------------ */

export function paginaPersonalizar() {
  const conteudo = `${cabecalhoPagina(
    "Personalizar",
    "Gerador de tema",
    "Escolha a cor da sua marca e o Atalho calcula os tons, confere o contraste para acessibilidade e gera o CSS pronto para colar."
  )}
    <div class="site-container site-personalizar">
      <form class="site-personalizar-controles at-pilha" id="gerador-tema" aria-label="Opções do tema">
        <div class="at-campo">
          <label class="at-rotulo" for="tema-cor">Cor principal</label>
          <div class="at-grupo-entrada">
            <input type="color" id="tema-cor" value="#0f766e" class="site-cor" aria-label="Escolher cor">
            <input class="at-entrada" id="tema-cor-hex" value="#0f766e" pattern="#[0-9a-fA-F]{6}" aria-label="Cor em hexadecimal" spellcheck="false">
          </div>
          <div class="site-paletas" aria-label="Sugestões">
            ${["#0f766e", "#4f46e5", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#16a34a", "#0369a1", "#1c1917"]
              .map((c) => `<button type="button" style="--c:${c}" data-cor="${c}" aria-label="Usar ${c}"></button>`)
              .join("")}
          </div>
        </div>
        <div class="at-campo">
          <label class="at-rotulo" for="tema-raio">Arredondamento: <output id="tema-raio-valor">8px</output></label>
          <input type="range" id="tema-raio" min="0" max="20" value="8" class="at-faixa-entrada">
        </div>
        <div class="at-campo">
          <label class="at-rotulo" for="tema-fonte">Fonte</label>
          <select class="at-entrada" id="tema-fonte">
            <option value="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">Do sistema (mais rápida)</option>
            <option value="'Inter', system-ui, sans-serif">Inter</option>
            <option value="'Poppins', system-ui, sans-serif">Poppins</option>
            <option value="Georgia, 'Times New Roman', serif">Serifada</option>
          </select>
        </div>
        <div class="at-alerta" id="tema-contraste" role="status"></div>
      </form>
      <div class="site-personalizar-previa" id="tema-previa">
        <div class="at-cartao site-previa-clara">
          <div class="at-cartao-cabecalho"><h2 class="at-texto-pequeno">Prévia ao vivo · tema claro</h2><span class="at-selo at-primario">Novo</span></div>
          <div class="at-cartao-corpo at-pilha">
            <div class="at-linha"><button class="at-botao at-primario">Botão principal</button><button class="at-botao at-suave">Suave</button><button class="at-botao">Padrão</button></div>
            <div class="at-campo"><label class="at-rotulo" for="previa-email">E-mail</label><input class="at-entrada" id="previa-email" placeholder="nome@exemplo.com"></div>
            <label class="at-linha"><input type="checkbox" role="switch" class="at-chave" checked> Notificações</label>
            <div class="at-abas at-segmentado" data-at="abas"><button class="at-aba" aria-controls="pv1">Mensal</button><button class="at-aba" aria-controls="pv2">Anual</button></div>
            <div id="pv1" class="at-painel at-texto-suave">Plano mensal</div><div id="pv2" class="at-painel at-texto-suave">Plano anual</div>
            <progress class="at-progresso" max="100" value="64"></progress>
            <a href="#tema-css">Um link no texto</a>
          </div>
        </div>
        <h2 class="site-secao-titulo at-mt-6" id="tema-css">Seu CSS</h2>
        <div class="site-exemplo-caixa">
          <div class="site-codigo-abas"><span class="site-codigo-rotulo">CSS · cole depois do atalho.css</span><button type="button" class="at-botao at-pequeno site-copiar" data-copiar-codigo>Copiar</button></div>
          <pre class="site-codigo" tabindex="0"><code id="tema-saida"></code></pre>
        </div>
      </div>
    </div>`;
  return pagina({
    titulo: "Gerador de tema CSS · Atalho",
    descricao: "Crie o tema da sua marca: escolha a cor e o Atalho gera os tons, confere o contraste de acessibilidade (WCAG) e entrega o CSS pronto.",
    caminho: "personalizar/",
    pagina: "personalizar",
    secao: "personalizar",
    conteudo,
  });
}

/* ------------------------------------------------------------------------ */

export function paginaTypeScript() {
  const conteudo = `${cabecalhoPagina(
    "Guia",
    "TypeScript com o Atalho",
    "O Atalho vem com tipos completos: o editor completa nomes de funções, confere os dados do estado e sabe o formato de cada evento."
  )}
    ${artigo(`
      <h2 class="site-secao-titulo" id="instalar">1. Baixe os tipos</h2>
      <p>Salve o arquivo <a href="${SITE.cdn}/atalho.d.ts"><code>atalho.d.ts</code></a> na pasta do seu projeto (por exemplo, em <code>tipos/</code>). Ele descreve o objeto global <code>Atalho</code> e todos os eventos <code>at:*</code>.</p>
      ${codigo("terminal", `curl -o tipos/atalho.d.ts ${SITE.cdn}/atalho.d.ts`)}
      <p>E garanta que o <code>tsconfig.json</code> inclui a pasta:</p>
      ${codigo(
        "ts",
        `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true
  },
  "include": ["src", "tipos"]
}`,
        "tsconfig.json"
      )}

      <h2 class="site-secao-titulo" id="estado">2. Estado tipado</h2>
      <p>Descreva o formato dos dados com uma <code>interface</code>. O TypeScript passa a avisar se você digitar um campo errado ou esquecer um.</p>
      ${codigo(
        "ts",
        `interface Produto {
  id: number;
  nome: string;
  preco: number;
}

interface Carrinho {
  itens: Produto[];
  readonly total: number;
  adicionar(produto: Produto): void;
}

const carrinho = Atalho.estado<Carrinho>("carrinho", {
  itens: [],
  get total(): number {
    return this.itens.reduce((soma, item) => soma + item.preco, 0);
  },
  adicionar(produto) {
    this.itens = [...this.itens, produto]; // produto já é do tipo Produto
  },
}, { salvar: true });

carrinho.adicionar({ id: 1, nome: "Camiseta", preco: 59.9 });
console.log(Atalho.formatar.moeda(carrinho.total)); // "R$ 59,90"`
      )}

      <h2 class="site-secao-titulo" id="eventos">3. Eventos tipados</h2>
      <p>Os eventos do Atalho entram no mapa de eventos do navegador, então <code>evento.detail</code> já vem com o tipo certo.</p>
      ${codigo(
        "ts",
        `const formulario = document.querySelector<HTMLFormElement>("#cadastro")!;

formulario.addEventListener("at:enviar", (evento) => {
  const { dados, botao } = evento.detail; // dados: Record<string, FormDataEntryValue>
  botao?.setAttribute("aria-busy", "true");
});

document.addEventListener("at:cep", (evento) => {
  console.log(evento.detail.localidade, evento.detail.uf); // tipos do ViaCEP
});`
      )}

      <h2 class="site-secao-titulo" id="requisicoes">4. Requisições tipadas</h2>
      ${codigo(
        "ts",
        `interface Cliente {
  id: number;
  nome: string;
}

try {
  const cliente = await Atalho.requisitar<Cliente>("/api/clientes", {
    metodo: "POST",
    corpo: { nome: "Ana" },
  });
  Atalho.notificar(\`\${cliente.nome} cadastrada\`, { tipo: "sucesso" });
} catch (erro) {
  if (erro instanceof Error) Atalho.notificar(erro.message, { tipo: "perigo" });
}`
      )}

      <h2 class="site-secao-titulo" id="vite">5. Com Vite ou outro bundler</h2>
      <p>Carregue o Atalho pelo HTML (CDN) e use os tipos normalmente nos seus arquivos <code>.ts</code>. O Atalho não precisa ser importado: ele cria <code>window.Atalho</code> sozinho.</p>
      <p class="at-texto-suave">Quer ver os tipos de um componente específico? Muitas páginas de componentes têm a aba <strong>TypeScript</strong> nos exemplos.</p>
    `)}`;
  return pagina({
    titulo: "TypeScript com o Atalho · Guia em português",
    descricao: "Como usar o Atalho com TypeScript: tipos completos para estado reativo, eventos e requisições, com exemplos em português.",
    caminho: "typescript/",
    pagina: "guia",
    secao: "",
    conteudo,
  });
}

/* ------------------------------------------------------------------------ */

export function paginaPHP({ php }) {
  const conteudo = `${cabecalhoPagina(
    "Guia",
    "PHP no servidor",
    "O navegador facilita a vida de quem preenche; o servidor protege os seus dados. Tudo que o Atalho valida no navegador deve ser validado de novo no PHP."
  )}
    ${artigo(`
      <div class="at-alerta at-aviso"><div class="at-alerta-conteudo"><strong>Regra de ouro</strong><p>Nunca confie no que vem do navegador. Qualquer pessoa pode desligar o JavaScript ou mandar dados direto para a sua API.</p></div></div>

      <h2 class="site-secao-titulo" id="instalar">1. Baixe a biblioteca PHP</h2>
      <p>Um arquivo só, sem dependências, para PHP 8.1 ou mais novo: <a href="${SITE.repositorio}/blob/main/php/atalho.php"><code>atalho.php</code></a>.</p>
      ${codigo("terminal", `curl -o atalho.php https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/php/atalho.php`)}

      <h2 class="site-secao-titulo" id="funcoes">2. O que vem nela</h2>
      <div class="at-tabela-caixa" tabindex="0" role="region" aria-label="Funções da biblioteca PHP"><table class="at-tabela site-tabela-api">
        <thead><tr><th scope="col">Função</th><th scope="col">O que faz</th></tr></thead>
        <tbody>${php.funcoes.map(([nome, descricao]) => `<tr><td><code>${esc(nome)}</code></td><td>${esc(descricao)}</td></tr>`).join("")}</tbody>
      </table></div>

      ${php.exemplos
        .map(
          (e) => `<h2 class="site-secao-titulo" id="${e.id}">${esc(e.titulo)}</h2>
      <p>${esc(e.descricao)}</p>
      ${e.html ? codigo("html", e.html, "HTML (navegador)") : ""}
      ${codigo("php", e.php, e.arquivo)}`
        )
        .join("\n")}
    `)}`;
  return pagina({
    titulo: "PHP com o Atalho · validação, CEP, upload e login",
    descricao: "Biblioteca PHP do Atalho: validar CPF e CNPJ alfanumérico, receber formulários em JSON, CEP com cache, upload seguro e login com sessão, explicados em português.",
    caminho: "php/",
    pagina: "guia",
    secao: "",
    conteudo,
  });
}

/* ------------------------------------------------------------------------ */

export function paginaPatrocinar({ docs }) {
  const conteudo = `${cabecalhoPagina(
    "Patrocínio",
    "Anuncie para quem está aprendendo a programar",
    "O Atalho é lido por pessoas que estão construindo os primeiros sites e sistemas, exatamente quando escolhem hospedagem, cursos, ferramentas e o primeiro emprego."
  )}
    ${artigo(`
      <h2 class="site-secao-titulo">Formatos</h2>
      <div class="site-recursos">
        <div class="site-recurso"><h3>Lateral da documentação</h3><p>Cartão com logo, nome e uma frase ao lado de todos os ${docs.componentes.length} componentes. O formato mais visto.</p></div>
        <div class="site-recurso"><h3>Página inicial</h3><p>Destaque na seção de apoio da página inicial.</p></div>
        <div class="site-recurso"><h3>Exemplo patrocinado</h3><p>Uma página completa feita com o Atalho usando o seu produto (ex.: integração com a sua API ou gateway de pagamento).</p></div>
      </div>
      <h2 class="site-secao-titulo">Compromissos</h2>
      <ul class="site-lista">
        <li>Anúncios sempre identificados como patrocinados e com links marcados para o Google (<code>rel="sponsored"</code>).</li>
        <li>Sem pop-up, sem som, sem rastreamento invasivo e sem cookies de terceiros.</li>
        <li>Só produtos úteis para quem desenvolve. Apostas, golpes e "fique rico" não entram.</li>
      </ul>
      <h2 class="site-secao-titulo">Fale comigo</h2>
      <p>Conte qual é o seu produto e o formato de interesse. Respondo com números atualizados de visitas e valores.</p>
      <div class="at-linha">
        <a class="at-botao at-primario" data-contato-patrocinio href="${SITE.repositorio}/issues/new?title=${encodeURIComponent("Patrocínio: ")}&labels=patroc%C3%ADnio">Quero patrocinar</a>
      </div>
    `)}`;
  return pagina({
    titulo: "Anuncie no Atalho · Patrocínio",
    descricao: "Anuncie para desenvolvedores iniciantes no Brasil: espaços na documentação do Atalho, sem pop-ups e sem rastreamento invasivo.",
    caminho: "patrocinar/",
    pagina: "patrocinar",
    secao: "",
    conteudo,
  });
}

/* ------------------------------------------------------------------------ */

/** Preços exibidos (o cobrado é o da Lemon Squeezy; os valores ficam iguais aos da tabela produtos). */
export const PRECOS = { proMensal: 4.9, proAnual: 39, pagina: 9, componente: 3 };
// "€ 39" em vez de "€ 39,00"; centavos só quando existem
const euro = (valor) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "EUR" }).format(valor).replace(/,00$/, "");

export function paginaPro({ exemplos = [] } = {}) {
  const economia = PRECOS.proMensal * 12 - PRECOS.proAnual;
  const planos = [
    {
      nome: "Grátis",
      preco: euro(0),
      nota: "sem cadastro",
      itens: ["Todos os componentes e receitas, inclusive os equivalentes ao Bootstrap", "Documentação em português, com TypeScript e PHP", "Editor ao vivo e CDN", "Licença MIT: pode usar em projetos comerciais"],
      botao: `<a class="at-botao at-bloco" href="${url("componentes/instalacao/")}">Começar agora</a>`,
    },
    {
      nome: "Membro",
      preco: euro(0),
      nota: "com conta grátis",
      itens: ["Tudo do Grátis", `${exemplos.length} páginas completas: loja, painel, checkout, login e mais`, "Baixar o código ou abrir no editor", "Componentes favoritos guardados na conta"],
      botao: `<a class="at-botao at-bloco" href="${url("conta/?criar")}" data-plano-membro>Criar conta grátis</a>`,
    },
    {
      nome: "Pro",
      destaque: "Mais completo",
      preco: `<span data-at-mostrar="!precos.anual">${euro(PRECOS.proMensal)} <small>/mês</small></span><span data-at-mostrar="precos.anual" hidden>${euro(PRECOS.proAnual)} <small>/ano</small></span>`,
      nota: `<span data-at-mostrar="!precos.anual">cancele quando quiser</span><span data-at-mostrar="precos.anual" hidden>equivale a ${euro(PRECOS.proAnual / 12)}/mês</span>`,
      itens: ["Tudo do Membro", "Todas as páginas e modelos Pro, com novidades todo mês", "Blocos premium para landing pages, painéis e lojas", "Licença para usar em projetos de clientes", "Se cancelar, o acesso continua até o fim do período pago"],
      botao: `<button class="at-botao at-primario at-bloco" data-comprar="pro-mensal" data-at-mostrar="!precos.anual">Assinar o Pro mensal</button>
          <button class="at-botao at-primario at-bloco" data-comprar="pro-anual" data-at-mostrar="precos.anual" hidden>Assinar o Pro anual</button>`,
    },
  ];
  const perguntas = [
    ["Preciso pagar para usar o Atalho?", "Não. A biblioteca, a documentação e todos os componentes equivalentes aos do Bootstrap são grátis para sempre, inclusive em projetos comerciais (licença MIT). Com uma conta grátis você ainda libera as páginas completas."],
    ["O que muda no Pro?", "O Pro libera todas as páginas e modelos marcados como Pro, os blocos premium e tudo o que for lançado enquanto a assinatura estiver ativa. É para quem quer entregar projetos mais rápido."],
    ["Posso comprar só uma página, sem assinar?", `Sim. Cada página Pro pode ser comprada sozinha por ${euro(PRECOS.pagina)} e cada componente premium por ${euro(PRECOS.componente)}. É seu para sempre, sem mensalidade.`],
    ["Como cancelo a assinatura?", "Em Minha conta, no botão Gerenciar assinatura. O cancelamento é imediato e você continua com acesso até o fim do período que já pagou. Não há multa nem fidelidade."],
    ["Quem cobra? Tem fatura?", "O pagamento é processado pela Lemon Squeezy, que atua como revendedora oficial (merchant of record): ela cobra, recolhe o IVA do seu país e envia a fatura por e-mail. O Atalho nunca vê os dados do seu cartão."],
    ["Quais formas de pagamento?", "Cartão de crédito ou débito, PayPal, Apple Pay e Google Pay. O valor é cobrado em euros; se o seu cartão for de outro país, o banco faz a conversão."],
    ["E o direito de desistência?", "Na União Europeia, quem compra conteúdo digital tem 14 dias para desistir, a menos que peça o acesso imediato e reconheça que perde esse direito ao recebê-lo. Antes de pagar, perguntamos isso de forma clara. Se algo não funcionar como descrito, escreva para nós e resolvemos."],
    ["Posso usar em projetos de clientes?", "Sim. O que você baixa pode ser usado em quantos projetos quiser, seus ou de clientes. Só não pode revender ou redistribuir os modelos Pro como modelos (por exemplo, num marketplace de templates)."],
  ];
  const conteudo = `${cabecalhoPagina(
    "Planos",
    "Grátis para aprender. Pro para entregar mais rápido.",
    "O Atalho é e continua grátis. O Pro é para quem quer pular semanas de trabalho com páginas e sistemas completos, feitos com o mesmo cuidado da documentação."
  )}
    <div class="site-container site-precos">
      <label class="at-linha at-centro site-precos-alternar">
        Mensal
        <input type="checkbox" role="switch" class="at-chave" data-at-valor="precos.anual" aria-label="Cobrança anual">
        Anual <span class="at-selo at-sucesso">economize ${euro(economia)}</span>
      </label>

      <div class="at-planos">
        ${planos
          .map(
            (p) => `<div class="at-plano"${p.destaque ? ` data-destaque="${p.destaque}"` : ""}>
          <h2 class="at-titulo-4">${p.nome}</h2>
          <div>
            <div class="at-plano-preco">${p.preco}</div>
            <p class="at-texto-suave at-texto-pequeno at-mb-0 site-precos-nota">${p.nota}</p>
          </div>
          <ul>${p.itens.map((i) => `<li>${i}</li>`).join("")}</ul>
          ${p.botao}
        </div>`
          )
          .join("\n        ")}
      </div>
      <p class="at-texto-suave at-texto-pequeno site-precos-aviso" data-loja-aviso hidden></p>
      <div class="at-alerta at-sucesso at-mt-4" data-loja-plano-atual hidden><div class="at-alerta-conteudo"><strong>Você é Pro.</strong><p>Obrigado por apoiar o Atalho! Veja sua assinatura em <a href="${url("conta/")}">Minha conta</a>.</p></div></div>

      <h2 class="site-secao-titulo at-mt-8">Compra avulsa, sem assinatura</h2>
      <div class="at-colunas-2">
        <div class="site-recurso"><h3>Página completa · ${euro(PRECOS.pagina)}</h3><p>Uma página Pro inteira (por exemplo, um painel ou um checkout), com o código para baixar e abrir no editor. Paga uma vez, é sua para sempre.</p></div>
        <div class="site-recurso"><h3>Componente premium · ${euro(PRECOS.componente)}</h3><p>Um bloco pronto para encaixar no seu projeto, como uma seção de preços animada ou um gráfico de painel. Também sem mensalidade.</p></div>
      </div>
      <p class="at-texto-suave at-texto-pequeno at-mt-3">O botão de compra fica na página de cada item Pro, em <a href="${url("exemplos/")}">Exemplos completos</a>.</p>

      <h2 class="site-secao-titulo at-mt-8">Perguntas frequentes</h2>
      <div class="at-sanfona site-precos-faq">
        ${perguntas.map(([p, r], i) => `<details name="faq-precos"${i === 0 ? " open" : ""}><summary>${p}</summary><div class="at-sanfona-conteudo"><p>${r}</p></div></details>`).join("\n        ")}
      </div>

      <div class="site-pro-cartao at-mt-8" id="lista-espera" data-lista-espera hidden>
        <h2 class="site-titulo site-h2">Pagamentos abrem em breve</h2>
        <p>Entre na lista e receba o aviso do lançamento com o preço de pré-venda. Sem spam: um e-mail no lançamento.</p>
        <p class="at-texto-suave" data-lista-espera-estado>Para entrar na lista, <a href="${url("conta/")}">crie sua conta grátis</a>.</p>
        <button class="at-botao at-primario" data-entrar-lista hidden>Quero ser avisado do lançamento</button>
      </div>
    </div>`;
  return pagina({
    titulo: "Planos e preços · Atalho Pro",
    descricao: `O Atalho é grátis. O Pro custa ${euro(PRECOS.proMensal)}/mês ou ${euro(PRECOS.proAnual)}/ano e libera todas as páginas e modelos completos; páginas avulsas por ${euro(PRECOS.pagina)}.`,
    caminho: "pro/",
    pagina: "pro",
    secao: "pro",
    conteudo,
    scripts: [...SCRIPTS_SUPABASE, "site/loja.js", "site/conta.js"],
    dadosEstruturados: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Atalho Pro",
        description: "Páginas e modelos completos de interface em português, com HTML, CSS, JavaScript e PHP.",
        brand: { "@type": "Brand", name: SITE.nome },
        offers: [
          { "@type": "Offer", name: "Pro mensal", price: PRECOS.proMensal.toFixed(2), priceCurrency: "EUR", url: `${SITE.url}pro/` },
          { "@type": "Offer", name: "Pro anual", price: PRECOS.proAnual.toFixed(2), priceCurrency: "EUR", url: `${SITE.url}pro/` },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: perguntas.map(([p, r]) => ({ "@type": "Question", name: p, acceptedAnswer: { "@type": "Answer", text: r } })),
      },
    ],
  });
}

/* ------------------------------------------------------------------------ */

export function paginaConta({ exemplos }) {
  const conteudo = `${cabecalhoPagina("Sua conta", "Minha conta", "Conta grátis: libera as páginas completas, guarda seus componentes favoritos e avisa quando o Atalho Pro sair.")}
    <div class="site-container site-conta" data-conta>
      <div class="at-alerta at-aviso" data-conta-indisponivel hidden>
        <div class="at-alerta-conteudo"><strong>Contas em breve</strong><p>A área de contas está sendo ativada. Os componentes continuam liberados sem cadastro; as páginas completas abrem assim que as contas estiverem no ar.</p></div>
      </div>

      <div class="at-alerta" data-conta-motivo hidden>
        <div class="at-alerta-conteudo"><strong>Falta só entrar</strong><p>As páginas completas são liberadas para quem tem conta. É grátis e leva menos de um minuto.</p></div>
      </div>

      <div class="at-alerta at-sucesso site-conta-aguardando" data-conta-aguardando tabindex="-1" hidden>
        <div class="at-alerta-conteudo">
          <strong>Confirme seu e-mail para ativar a conta</strong>
          <p>Enviamos um link para <strong data-conta-confirmar-email></strong>. Abra o e-mail e clique no link; você volta para cá já conectado.</p>
          <p class="at-texto-pequeno">Não chegou em 2 minutos? Confira a caixa de spam ou <button type="button" class="at-botao at-link at-pequeno" data-conta-reenviar>reenvie o e-mail</button>.</p>
        </div>
      </div>

      <div class="at-cartao site-conta-cartao" data-conta-visitante hidden>
        <div class="at-cartao-corpo">
          <div class="at-abas at-segmentado" data-at="abas" aria-label="Entrar ou criar conta">
            <button class="at-aba" aria-controls="painel-entrar">Entrar</button>
            <button class="at-aba" aria-controls="painel-criar">Criar conta</button>
          </div>
          <div class="at-painel" id="painel-entrar">
            <form class="at-pilha" data-at-validar id="form-entrar">
              <div class="at-campo"><label class="at-rotulo" for="entrar-email">E-mail</label><input class="at-entrada" id="entrar-email" name="email" type="email" required autocomplete="username"></div>
              <div class="at-campo"><label class="at-rotulo" for="entrar-senha">Senha</label>
                <div class="at-senha"><input class="at-entrada" id="entrar-senha" name="senha" type="password" required minlength="8" autocomplete="current-password"><button type="button" data-at-ver-senha>Mostrar</button></div>
              </div>
              <button class="at-botao at-primario at-bloco">Entrar</button>
              <button type="button" class="at-botao at-link" data-esqueci-senha>Esqueci minha senha</button>
            </form>
          </div>
          <div class="at-painel" id="painel-criar">
            <form class="at-pilha" data-at-validar id="form-criar">
              <div class="at-campo"><label class="at-rotulo" for="criar-nome">Nome</label><input class="at-entrada" id="criar-nome" name="nome" required minlength="2" autocomplete="name"></div>
              <div class="at-campo"><label class="at-rotulo" for="criar-email">E-mail</label><input class="at-entrada" id="criar-email" name="email" type="email" required autocomplete="email"></div>
              <div class="at-campo"><label class="at-rotulo" for="criar-senha">Senha</label>
                <div class="at-senha"><input class="at-entrada" id="criar-senha" name="senha" type="password" required minlength="8" autocomplete="new-password"><button type="button" data-at-ver-senha>Mostrar</button></div>
                <div class="at-forca" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="at-forca-texto" aria-live="polite"></span>
              </div>
              <label class="at-check"><input type="checkbox" name="termos" required data-msg-obrigatorio="Aceite os termos para criar a conta."> <span>Li e aceito os <a href="${url("termos/")}">termos de uso</a> e a <a href="${url("privacidade/")}">política de privacidade</a>.</span></label>
              <button class="at-botao at-primario at-bloco">Criar conta grátis</button>
            </form>
          </div>
        </div>
      </div>

      <div class="site-conta-painel" data-conta-logado hidden>
        <div class="at-cartao">
          <div class="at-cartao-corpo at-linha at-entre">
            <div class="at-linha"><span class="at-avatar at-grande" data-conta-iniciais></span><div><strong data-conta-nome></strong><div class="at-texto-suave at-texto-pequeno" data-conta-email></div></div></div>
            <div class="at-linha">
              <a class="at-botao at-primario" href="${url("admin/")}" data-conta-admin hidden>Painel do administrador</a>
              <button class="at-botao" data-sair>Sair</button>
            </div>
          </div>
        </div>
        <h2 class="site-secao-titulo at-mt-6">Seu plano</h2>
        <div data-conta-plano><p class="at-texto-suave">Carregando…</p></div>
        <h2 class="site-secao-titulo at-mt-6">Páginas completas liberadas</h2>
        <div class="site-relacionados">
          ${exemplos.map((e) => `<a href="${url(`exemplos/${e.id}/`)}"><strong>${esc(e.nome)}</strong><span>${esc(e.resumo)}</span></a>`).join("")}
        </div>
        <h2 class="site-secao-titulo at-mt-6">Componentes favoritos</h2>
        <div class="site-relacionados" data-conta-favoritos></div>
        <p class="at-texto-suave" data-conta-sem-favoritos hidden>Você ainda não favoritou nenhum componente. Use o botão ♡ Favoritar nas páginas dos componentes.</p>
        <div data-conta-lista-bloco>
          <h2 class="site-secao-titulo at-mt-6">Atalho Pro</h2>
          <label class="at-linha"><input type="checkbox" role="switch" class="at-chave" data-conta-lista-espera> Quero ser avisado do lançamento do Atalho Pro</label>
        </div>
        <h2 class="site-secao-titulo at-mt-6">Seus dados</h2>
        <p class="at-texto-suave">Guardamos só nome, e-mail, favoritos, a sua escolha sobre a lista do Pro e, se você comprar, o plano e as compras (os dados de pagamento ficam só na Lemon Squeezy). Veja a <a href="${url("privacidade/")}">política de privacidade</a>.</p>
        <button class="at-botao at-perigo" commandfor="modal-excluir-conta" command="show-modal">Excluir minha conta</button>
        <dialog class="at-modal at-pequeno" id="modal-excluir-conta" aria-labelledby="excluir-conta-titulo">
          <form method="dialog">
            <div class="at-modal-corpo"><h3 class="at-titulo-4" id="excluir-conta-titulo">Excluir sua conta?</h3><p class="at-texto-suave">Seus dados e favoritos serão apagados de forma definitiva.</p><p class="at-texto-pequeno at-mb-0"><strong>Assina o Pro?</strong> Cancele antes em Gerenciar assinatura: excluir a conta não interrompe a cobrança na Lemon Squeezy.</p></div>
            <div class="at-modal-rodape"><button class="at-botao at-fantasma" value="cancelar">Cancelar</button><button class="at-botao at-perigo" value="excluir" data-excluir-conta>Excluir definitivamente</button></div>
          </form>
        </dialog>
      </div>

      <dialog class="at-modal at-pequeno" id="modal-nova-senha" aria-labelledby="nova-senha-titulo">
        <form data-at-validar id="form-nova-senha">
          <div class="at-modal-corpo at-pilha">
            <h3 class="at-titulo-4" id="nova-senha-titulo">Crie uma nova senha</h3>
            <div class="at-campo"><label class="at-rotulo" for="nova-senha">Nova senha</label>
              <div class="at-senha"><input class="at-entrada" id="nova-senha" name="senha" type="password" required minlength="8" autocomplete="new-password"><button type="button" data-at-ver-senha>Mostrar</button></div>
              <div class="at-forca" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="at-forca-texto" aria-live="polite"></span>
            </div>
            <div class="at-campo"><label class="at-rotulo" for="nova-senha-confirmar">Repita a nova senha</label><input class="at-entrada" id="nova-senha-confirmar" name="confirmar" type="password" required minlength="8" autocomplete="new-password"></div>
          </div>
          <div class="at-modal-rodape"><button type="button" class="at-botao at-fantasma" commandfor="modal-nova-senha" command="close">Agora não</button><button class="at-botao at-primario">Salvar nova senha</button></div>
        </form>
      </dialog>
    </div>`;
  return pagina({
    titulo: "Minha conta · Atalho",
    descricao: "Entre ou crie sua conta grátis no Atalho para abrir as páginas completas e salvar componentes favoritos.",
    caminho: "conta/",
    pagina: "conta",
    secao: "",
    indexar: false,
    conteudo,
    scripts: [...SCRIPTS_SUPABASE, "site/loja.js", "site/conta.js"],
  });
}

/* ------------------------------------------------------------------------ */

export function paginaPrivacidade() {
  const atualizado = "9 de outubro de 2026";
  const conteudo = `${cabecalhoPagina("Legal", "Política de privacidade", `Última atualização: ${atualizado}.`)}
    ${artigo(`
      <p>Esta política explica quais dados o Atalho trata, por quê e quais são os seus direitos, conforme o Regulamento Geral sobre a Proteção de Dados da União Europeia (RGPD) e, para quem está no Brasil, a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD). O responsável pelo tratamento é ${SITE.autor}, com sede em Portugal.</p>
      <h2 class="site-secao-titulo">1. Sem conta, quase nada</h2>
      <p>Para ler a documentação e copiar componentes, você não precisa de cadastro. As páginas completas são liberadas para quem cria uma conta grátis. O site não usa cookies de rastreamento nem de publicidade. Preferências como tema escuro ficam guardadas só no seu navegador (localStorage) e não são enviadas para nós.</p>
      <h2 class="site-secao-titulo">2. Se você criar uma conta</h2>
      <ul class="site-lista">
        <li><strong>Dados:</strong> nome, e-mail, senha (guardada de forma criptografada pelo provedor de autenticação, nunca em texto puro), componentes favoritos e se você quer receber o aviso do Atalho Pro.</li>
        <li><strong>Finalidade:</strong> permitir o acesso à conta e às páginas completas, guardar seus favoritos e, se você pedir, avisar sobre o lançamento do Atalho Pro.</li>
        <li><strong>Quem vê:</strong> só você e o administrador do Atalho, que enxerga nome, e-mail, datas de cadastro e de último acesso, quantidade de favoritos e se você está na lista do Pro, para manter o serviço funcionando. Ninguém vê a sua senha, nem o administrador. Os dados não são vendidos nem cedidos.</li>
        <li><strong>Base legal:</strong> execução do serviço que você pediu (RGPD art. 6.º, n.º 1, b; LGPD art. 7º, V) e consentimento para o aviso do Pro (RGPD art. 6.º, n.º 1, a; LGPD art. 7º, I), que você pode retirar a qualquer momento na sua conta.</li>
        <li><strong>Onde ficam:</strong> no Supabase, provedor de banco de dados e autenticação, em servidores na União Europeia, com as garantias exigidas pelo RGPD e pela LGPD.</li>
        <li><strong>E-mails:</strong> mensagens de confirmação de cadastro e de troca de senha são enviadas pelo Brevo, que recebe apenas o seu e-mail para fazer a entrega.</li>
        <li><strong>Por quanto tempo:</strong> enquanto a conta existir. Ao excluir a conta, os dados são apagados.</li>
      </ul>
      <h2 class="site-secao-titulo">2.1. Se você comprar ou assinar o Pro</h2>
      <ul>
        <li><strong>Quem processa o pagamento:</strong> a Lemon Squeezy (Lemon Squeezy LLC), que atua como revendedora oficial (merchant of record). Ela coleta e trata os dados de pagamento e de faturação (nome, e-mail, país, cartão ou PayPal) como responsável pelo tratamento, conforme a política de privacidade dela. O Atalho nunca recebe os dados do seu cartão.</li>
        <li><strong>O que o Atalho guarda:</strong> o identificador da sua conta ligado ao plano ou à compra, a situação da assinatura (ativa, cancelada, datas de renovação e de término), o valor pago e o endereço do portal de assinatura, recebidos da Lemon Squeezy por um aviso assinado digitalmente.</li>
        <li><strong>Finalidade e base legal:</strong> liberar o conteúdo que você comprou (execução do contrato: RGPD art. 6.º, n.º 1, b; LGPD art. 7º, V) e cumprir obrigações contábeis (RGPD art. 6.º, n.º 1, c; LGPD art. 7º, II).</li>
        <li><strong>Por quanto tempo:</strong> enquanto a conta existir; registros de pagamento podem ser mantidos pelo prazo exigido pela lei fiscal, mesmo após a exclusão da conta, sem os demais dados.</li>
      </ul>
      <h2 class="site-secao-titulo">3. Assistente de IA</h2>
      <p>O texto que você digita no assistente é enviado ao serviço de IA da Cloudflare para gerar a resposta. Não peça ajuda com dados pessoais (CPF, senhas, endereços reais). As perguntas não são associadas à sua conta.</p>
      <h2 class="site-secao-titulo">4. Serviços de terceiros</h2>
      <p>O site carrega fontes do Google Fonts e a biblioteca do jsDelivr, e os exemplos consultam ViaCEP e DummyJSON quando você interage com eles. Esses serviços recebem dados técnicos da conexão (como o endereço IP), conforme as políticas deles.</p>
      <h2 class="site-secao-titulo">5. Seus direitos</h2>
      <p>Você pode, a qualquer momento: confirmar e acessar seus dados, corrigir, pedir a portabilidade, opor-se ao tratamento, retirar o consentimento e <strong>excluir a conta</strong> (botão em "Minha conta", que apaga tudo na hora). Se achar que seus direitos não foram respeitados, pode reclamar à autoridade de proteção de dados: a CNPD, em Portugal, ou a ANPD, no Brasil.</p>
      <h2 class="site-secao-titulo">6. Contato</h2>
      <p data-contato-privacidade>Para assuntos de privacidade, fale com o responsável pelo projeto pelo <a href="${SITE.repositorio}/issues/new?title=${encodeURIComponent("Privacidade: ")}">GitHub</a>.</p>
    `)}`;
  return pagina({
    titulo: "Política de privacidade · Atalho",
    descricao: "Como o Atalho trata dados pessoais conforme o RGPD e a LGPD: o que é coletado, por quê, por quanto tempo e como excluir sua conta.",
    caminho: "privacidade/",
    pagina: "legal",
    secao: "",
    conteudo,
  });
}

export function paginaTermos() {
  const conteudo = `${cabecalhoPagina("Legal", "Termos de uso", "Última atualização: 9 de outubro de 2026.")}
    ${artigo(`
      <h2 class="site-secao-titulo">1. O que é o Atalho</h2>
      <p>O Atalho é uma biblioteca gratuita de componentes de interface e a documentação que a acompanha, mantida por ${SITE.autor}.</p>
      <h2 class="site-secao-titulo">2. Licença do código</h2>
      <p>O código da biblioteca é distribuído sob a <a href="${SITE.repositorio}/blob/main/LICENSE">licença MIT</a>: você pode usar em projetos pessoais e comerciais, modificar e redistribuir, mantendo o aviso de licença. O conteúdo do Atalho Pro tem licença própria, descrita abaixo.</p>
      <h2 class="site-secao-titulo">3. Sem garantias</h2>
      <p>O Atalho é oferecido "como está". Revise e teste o código antes de usar em produção, especialmente tudo que envolve segurança, pagamentos e dados pessoais.</p>
      <h2 class="site-secao-titulo">4. Conta</h2>
      <p>Você é responsável pela sua senha. Contas usadas para abuso (como tentar sobrecarregar o assistente de IA) podem ser removidas.</p>
      <h2 class="site-secao-titulo" id="venda">5. Atalho Pro e compras</h2>
      <ul>
        <li><strong>Vendedor:</strong> as vendas são feitas pela Lemon Squeezy, revendedora oficial (merchant of record) do Atalho. Ela cobra, emite a fatura e recolhe os impostos (como o IVA). Os termos de compra dela também se aplicam.</li>
        <li><strong>Assinatura Pro:</strong> cobrada por mês ou por ano, renova automaticamente até ser cancelada. Você cancela quando quiser em "Minha conta", sem multa; o acesso continua até o fim do período já pago. Mudanças de preço valem só para a próxima renovação e são avisadas antes.</li>
        <li><strong>Compra avulsa:</strong> pagamento único por uma página ou um componente, com acesso enquanto o Atalho existir. Se o serviço for encerrado, você recebe o arquivo para guardar.</li>
        <li><strong>Direito de desistência (UE):</strong> por ser conteúdo digital entregue na hora, antes de pagar você pede o acesso imediato e reconhece que, com isso, perde o direito de desistência de 14 dias. Se o conteúdo não funcionar como descrito, escreva para nós: corrigimos ou devolvemos o valor.</li>
        <li><strong>Licença do conteúdo Pro:</strong> você pode usar e modificar o que baixar em quantos projetos quiser, seus ou de clientes, inclusive comerciais. Não pode revender, redistribuir ou publicar os modelos Pro como modelos ou kits (por exemplo, em marketplaces de templates), nem compartilhar o acesso da sua conta.</li>
      </ul>
      <h2 class="site-secao-titulo">6. Assistente de IA</h2>
      <p>As respostas são geradas automaticamente e podem conter erros. Confira o código sugerido antes de usar.</p>
      <h2 class="site-secao-titulo">7. Patrocínios</h2>
      <p>Conteúdos patrocinados são sempre identificados. O Atalho não se responsabiliza por produtos de patrocinadores.</p>
      <h2 class="site-secao-titulo">8. Mudanças</h2>
      <p>Estes termos podem ser atualizados; a data no topo indica a última versão.</p>
    `)}`;
  return pagina({
    titulo: "Termos de uso · Atalho",
    descricao: "Termos de uso do Atalho: licença MIT do código, conta, Atalho Pro e compras, assistente de IA e patrocínios.",
    caminho: "termos/",
    pagina: "legal",
    secao: "",
    conteudo,
  });
}

export function pagina404() {
  const conteudo = `<section class="site-secao"><div class="site-container at-estreito">
      <div class="at-vazio">
        <h1 class="at-titulo-2">Essa página não existe</h1>
        <p>O endereço pode ter mudado ou estar digitado errado. Use a busca (Ctrl K) ou volte ao início.</p>
        <div class="at-linha at-centro"><a class="at-botao at-primario" href="${url()}">Ir para o início</a><a class="at-botao" href="${url("componentes/")}">Ver componentes</a></div>
      </div>
    </div></section>`;
  return pagina({ titulo: "Página não encontrada · Atalho", descricao: "Esta página não existe no Atalho. Use a busca para encontrar componentes em português.", caminho: "404.html", pagina: "404", secao: "", indexar: false, conteudo });
}
