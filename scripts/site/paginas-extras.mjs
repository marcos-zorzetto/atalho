import { SITE, url } from "./config.mjs";
import { SISTEMAS } from "./pagina-sistemas.mjs";
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
    "Ecrãs inteiros feitos só com o Atalho, prontas para usar como ponto de partida do seu projeto. Grátis para quem tem conta.",
    `<div class="at-linha at-mt-4" data-exemplos-chamada><a class="at-botao at-primario" href="${url("conta/")}?criar">Criar conta grátis</a><a class="at-botao" href="${url("conta/")}">Já tenho conta</a></div>`
  )}
    <div class="site-container site-secao-curta">
      <div class="site-galeria">
        ${exemplos
          .map(
            (e) => `<a class="site-galeria-item" href="${url(`exemplos/${e.id}/`)}">
          <span class="site-galeria-moldura"><img src="${url(`exemplos/miniaturas/${e.id}.png`)}" alt="Pré-visualização do exemplo ${esc(e.nome)}" loading="lazy" width="600" height="375"><span class="site-galeria-cadeado">${ICONES_SITE.cadeado} ${e.acesso === "pro" ? "Pro" : "Membros"}</span></span>
          <strong>${esc(e.nome)}</strong><span>${esc(e.resumo)}</span>
          <span class="site-galeria-componentes">${e.componentes.map((c) => `<span class="at-selo">${esc(c)}</span>`).join("")}</span>
        </a>`
          )
          .join("")}
      </div>
    </div>`;
  return pagina({
    titulo: "Exemplos de páginas completas · Atalho",
    descricao: "Landing page, painel administrativo, loja, login, checkout e blog prontos em HTML, CSS e JavaScript, feitos com o Atalho. Grátis com registo.",
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
    "Do traço fino ao duas cores. Escolha o estilo, o tamanho e a cor, e clique para copiar o SVG pronto. Pesquise em português: carrinho, dinheiro, agenda, barbearia…",
    `<div class="at-entrada-icone site-filtro">${ICONES_SITE.busca}<input class="at-entrada" type="search" id="filtro-icones" placeholder="Pesquisar: carrinho, euro, utilizador, seta…" aria-label="Pesquisar ícones" autocomplete="off"></div>`
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
          ${Object.values(CATEGORIAS_PT).sort((a, b) => a.localeCompare(b, "pt-PT")).map((c) => `<option>${c}</option>`).join("")}
        </select>
      </div>
      <p class="at-texto-suave at-texto-pequeno" data-icones-contagem aria-live="polite">A carregar ícones…</p>
      <ul class="site-icones site-icones-phosphor" data-icones-lista></ul>
      <p class="at-texto-pequeno at-texto-suave">Ícones <a href="https://phosphoricons.com" target="_blank" rel="noopener">Phosphor</a> ${VERSAO_PHOSPHOR}, licença MIT: use à vontade, incluindo em projetos comerciais.</p>

      <h2 class="site-secao-titulo at-mt-8">Pagamentos e documentos</h2>
      <p class="at-texto-suave">${nomes.length} ícones desenhados para o Atalho, com traço de 2px: WhatsApp, recibo, cartão e também Pix, boleto e CPF para quem vende para o Brasil.</p>
      <ul class="site-icones" id="lista-icones">
        ${nomes
          .map(
            (n) => `<li><button type="button" class="site-icone" data-icone="${n}" aria-label="Copiar ícone ${n}">
          ${icones.svg(n, 24)}<span>${n}</span></button></li>`
          )
          .join("")}
      </ul>
      <h2 class="site-secao-titulo at-mt-6">Como usar</h2>
      <p>Cole o SVG copiado. O tamanho vem de <code>width</code>/<code>height</code> e a cor, do texto à volta (<code>currentColor</code>). Em botões só com ícone, coloque sempre <code>aria-label</code>.</p>
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
          <button type="button" class="at-botao" data-icone-acao="baixar">Descarregar .svg</button>
          <button type="button" class="at-botao at-fantasma" commandfor="icone-detalhe" command="close">Fechar</button>
        </div>
      </div>
    </dialog>`;
  return pagina({
    titulo: "1.512 ícones SVG grátis em 6 estilos · Atalho",
    descricao: `1.512 ícones SVG gratuitos (MIT) em 6 estilos, com pesquisa em português, mais ${nomes.length} ícones de pagamentos e documentos. Escolha cor e tamanho e clique para copiar.`,
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
    "Escolha a cor da sua marca e o Atalho calcula os tons, verifica o contraste de acessibilidade e gera o CSS pronto para colar."
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
          <div class="at-cartao-cabecalho"><h2 class="at-texto-pequeno">Pré-visualização ao vivo · tema claro</h2><span class="at-selo at-primario">Novo</span></div>
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
        <h2 class="site-secao-titulo at-mt-6" id="tema-css">O seu CSS</h2>
        <div class="site-exemplo-caixa">
          <div class="site-codigo-abas"><span class="site-codigo-rotulo">CSS · cole depois do atalho.css</span><button type="button" class="at-botao at-pequeno site-copiar" data-copiar-codigo>Copiar</button></div>
          <pre class="site-codigo" tabindex="0"><code id="tema-saida"></code></pre>
        </div>
      </div>
    </div>`;
  return pagina({
    titulo: "Gerador de tema CSS · Atalho",
    descricao: "Crie o tema da sua marca: escolha a cor e o Atalho gera os tons, verifica o contraste de acessibilidade (WCAG) e entrega o CSS pronto.",
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
    "O Atalho vem com tipos completos: o editor completa nomes de funções, verifica os dados do estado e sabe o formato de cada evento."
  )}
    ${artigo(`
      <h2 class="site-secao-titulo" id="instalar">1. Descarregue os tipos</h2>
      <p>Guarde o ficheiro <a href="${SITE.cdn}/atalho.d.ts"><code>atalho.d.ts</code></a> na pasta do seu projeto (por exemplo, em <code>tipos/</code>). Descreve o objeto global <code>Atalho</code> e todos os eventos <code>at:*</code>.</p>
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
      <p>Descreva o formato dos dados com uma <code>interface</code>. O TypeScript passa a avisar se escrever um campo errado ou se esquecer de um.</p>
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

carrinho.adicionar({ id: 1, nome: "T-shirt", preco: 59.9 });
console.log(Atalho.formatar.moeda(carrinho.total)); // "59,90 €"`
      )}

      <h2 class="site-secao-titulo" id="eventos">3. Eventos tipados</h2>
      <p>Os eventos do Atalho entram no mapa de eventos do navegador, por isso <code>evento.detail</code> já vem com o tipo certo.</p>
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

      <h2 class="site-secao-titulo" id="requisicoes">4. Pedidos tipados</h2>
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
  Atalho.notificar(\`\${cliente.nome} registada\`, { tipo: "sucesso" });
} catch (erro) {
  if (erro instanceof Error) Atalho.notificar(erro.message, { tipo: "perigo" });
}`
      )}

      <h2 class="site-secao-titulo" id="vite">5. Com Vite ou outro bundler</h2>
      <p>Carregue o Atalho pelo HTML (CDN) e use os tipos normalmente nos seus ficheiros <code>.ts</code>. O Atalho não precisa de ser importado: cria <code>window.Atalho</code> sozinho.</p>
      <p class="at-texto-suave">Quer ver os tipos de um componente específico? Muitas páginas de componentes têm a aba <strong>TypeScript</strong> nos exemplos.</p>
    `)}`;
  return pagina({
    titulo: "TypeScript com o Atalho · Guia em português",
    descricao: "Como usar o Atalho com TypeScript: tipos completos para estado reativo, eventos e pedidos, com exemplos em português.",
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
    "O navegador facilita a vida de quem preenche; o servidor protege os seus dados. Tudo o que o Atalho valida no navegador deve ser validado de novo no PHP."
  )}
    ${artigo(`
      <div class="at-alerta at-aviso"><div class="at-alerta-conteudo"><strong>Regra de ouro</strong><p>Nunca confie no que vem do navegador. Qualquer pessoa pode desligar o JavaScript ou enviar dados diretamente para a sua API.</p></div></div>

      <h2 class="site-secao-titulo" id="instalar">1. Descarregue a biblioteca PHP</h2>
      <p>Um ficheiro só, sem dependências, para PHP 8.1 ou mais recente: <a href="${SITE.repositorio}/blob/main/php/atalho.php"><code>atalho.php</code></a>.</p>
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
    titulo: "PHP com o Atalho · validação, código postal, upload e login",
    descricao: "Biblioteca PHP do Atalho: validar NIF e IBAN, receber formulários em JSON, morada pelo código postal com cache, upload seguro e login com sessão, explicados em português.",
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
    "Anuncie para quem está a aprender a programar",
    "O Atalho é lido por pessoas que estão a construir os primeiros sites e sistemas, exatamente quando escolhem alojamento, cursos, ferramentas e o primeiro emprego."
  )}
    ${artigo(`
      <h2 class="site-secao-titulo">Formatos</h2>
      <div class="site-recursos">
        <div class="site-recurso"><h3>Lateral da documentação</h3><p>Cartão com logo, nome e uma frase ao lado de todos os ${docs.componentes.length} componentes. O formato mais visto.</p></div>
        <div class="site-recurso"><h3>Página inicial</h3><p>Destaque na secção de apoio da página inicial.</p></div>
        <div class="site-recurso"><h3>Exemplo patrocinado</h3><p>Uma página completa feita com o Atalho usando o seu produto (ex.: integração com a sua API ou gateway de pagamento).</p></div>
      </div>
      <h2 class="site-secao-titulo">Compromissos</h2>
      <ul class="site-lista">
        <li>Anúncios sempre identificados como patrocinados e com links marcados para o Google (<code>rel="sponsored"</code>).</li>
        <li>Sem pop-up, sem som, sem rastreamento invasivo e sem cookies de terceiros.</li>
        <li>Só produtos úteis para quem desenvolve. Apostas, burlas e "fique rico" não entram.</li>
      </ul>
      <h2 class="site-secao-titulo">Fale comigo</h2>
      <p>Conte qual é o seu produto e o formato de interesse. Respondo com números atualizados de visitas e valores.</p>
      <div class="at-linha">
        <a class="at-botao at-primario" data-contato-patrocinio href="${SITE.repositorio}/issues/new?title=${encodeURIComponent("Patrocínio: ")}&labels=patroc%C3%ADnio">Quero patrocinar</a>
      </div>
    `)}`;
  return pagina({
    titulo: "Anuncie no Atalho · Patrocínio",
    descricao: "Anuncie para programadores que estão a começar, em Portugal e no Brasil: espaços na documentação do Atalho, sem pop-ups e sem rastreamento invasivo.",
    caminho: "patrocinar/",
    pagina: "patrocinar",
    secao: "",
    conteudo,
  });
}

/* ------------------------------------------------------------------------ */

/** Preços exibidos (o cobrado é o configurado na Revolut; os valores ficam iguais aos da tabela produtos). */
// Preço final ao consumidor (obrigatório na UE mostrar o preço total). Os cobrados são os da Revolut:
// ao mudar aqui, mude lá e na tabela public.produtos (servicos/supabase/schema.sql).
export const PRECOS = { proMensal: 9, proAnual: 79, pagina: 9, componente: 3 };
// "39 €" em vez de "39,00 €"; cêntimos só quando existem
const euro = (valor) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(valor).replace(/,00(?=\s*€)/, "");

export function paginaPro({ exemplos = [] } = {}) {
  const economia = PRECOS.proMensal * 12 - PRECOS.proAnual;
  const planos = [
    {
      nome: "Grátis",
      preco: euro(0),
      nota: "sem registo",
      itens: ["Todos os componentes e receitas, incluindo os equivalentes ao Bootstrap", "Documentação em português, com TypeScript e PHP", "Editor ao vivo e CDN", "Licença MIT: pode usar em projetos comerciais"],
      botao: `<a class="at-botao at-bloco" href="${url("componentes/instalacao/")}">Começar agora</a>`,
    },
    {
      nome: "Membro",
      preco: euro(0),
      nota: "com conta grátis",
      itens: ["Tudo do Grátis", `${exemplos.length} páginas completas: loja, painel, checkout, login e mais`, "Descarregar o código ou abrir no editor", "Componentes favoritos guardados na conta"],
      botao: `<a class="at-botao at-bloco" href="${url("conta/?criar")}" data-plano-membro>Criar conta grátis</a>`,
    },
    {
      nome: "Pro",
      destaque: "Mais completo",
      preco: `<span data-at-mostrar="!precos.anual">${euro(PRECOS.proMensal)} <small>/mês</small></span><span data-at-mostrar="precos.anual" hidden>${euro(PRECOS.proAnual)} <small>/ano</small></span>`,
      nota: `<span data-at-mostrar="!precos.anual">cancele quando quiser</span><span data-at-mostrar="precos.anual" hidden>equivale a ${euro(PRECOS.proAnual / 12)}/mês</span>`,
      itens: ["Tudo do Membro", `<a href="${url("sistemas/")}">${SISTEMAS.length} sistemas completos</a> para instalar num passo: CRM, marcações, orçamentos, loja, reservas…`, "Todas as páginas, componentes premium e animações 3D, com novidades todos os meses", "Licença para usar em projetos de clientes", "Se cancelar, o acesso continua até ao fim do período pago"],
      botao: `<button class="at-botao at-primario at-bloco" data-comprar="pro-mensal" data-at-mostrar="!precos.anual">Subscrever o Pro mensal</button>
          <button class="at-botao at-primario at-bloco" data-comprar="pro-anual" data-at-mostrar="precos.anual" hidden>Subscrever o Pro anual</button>`,
    },
  ];
  const perguntas = [
    ["Preciso de pagar para usar o Atalho?", "Não. A biblioteca, a documentação e todos os componentes equivalentes aos do Bootstrap são grátis para sempre, incluindo em projetos comerciais (licença MIT). Com uma conta grátis, ainda desbloqueia as páginas completas."],
    ["O que muda no Pro?", `O Pro desbloqueia os ${SISTEMAS.length} sistemas completos (PHP e SQLite, instalam-se em qualquer alojamento português), todas as páginas e modelos Pro, os blocos premium e tudo o que for lançado enquanto a subscrição estiver ativa.`],
    ["O preço inclui tudo?", "Sim. O preço mostrado é o valor final que paga, sem taxas escondidas. Recebe a fatura por e-mail; se precisar do NIF da sua empresa na fatura, indique-o respondendo ao e-mail de confirmação."],
    ["Posso comprar só uma página, sem subscrever?", `Sim. Cada página Pro pode ser comprada sozinha por ${euro(PRECOS.pagina)} e cada componente premium por ${euro(PRECOS.componente)}. É seu para sempre, sem mensalidade.`],
    ["Como cancelo a subscrição?", "Na página A minha conta, no botão Cancelar subscrição. O cancelamento é imediato e continua a ter acesso até ao fim do período que já pagou. Não há multa nem período de fidelização."],
    ["Quem cobra? Há fatura?", "O pagamento é processado pela Revolut, numa página segura da própria Revolut, e o vendedor é o Atalho (Portugal). A fatura é enviada por e-mail. O Atalho nunca vê os dados do seu cartão."],
    ["Quais formas de pagamento?", "Cartão de crédito ou débito, Apple Pay, Google Pay e Revolut Pay. O valor é cobrado em euros; se o seu cartão for de outro país, o banco faz a conversão."],
    ["E o direito de desistência?", "Na União Europeia, quem compra conteúdo digital tem 14 dias para desistir, a menos que peça o acesso imediato e reconheça que perde esse direito ao recebê-lo. Antes de pagar, perguntamos isso de forma clara. Se algo não funcionar como descrito, escreva-nos e resolvemos."],
    ["Posso usar em projetos de clientes?", "Sim. O que descarregar pode ser usado em quantos projetos quiser, os seus ou de clientes. Só não pode revender ou redistribuir os modelos Pro como modelos (por exemplo, num marketplace de templates)."],
  ];
  const conteudo = `${cabecalhoPagina(
    "Planos",
    "Grátis para aprender. Pro para entregar mais rápido.",
    "O Atalho é e continua grátis. O Pro é para quem quer poupar semanas de trabalho com páginas e sistemas completos, feitos com o mesmo cuidado da documentação."
  )}
    <div class="site-container site-precos">
      <label class="at-linha at-centro site-precos-alternar">
        Mensal
        <input type="checkbox" role="switch" class="at-chave" data-at-valor="precos.anual" aria-label="Cobrança anual">
        Anual <span class="at-selo at-sucesso">poupe ${euro(economia)}</span>
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
      <div class="at-alerta at-sucesso at-mt-4" data-loja-plano-atual hidden><div class="at-alerta-conteudo"><strong>Já é Pro.</strong><p>Obrigado por apoiar o Atalho! Veja a sua subscrição em <a href="${url("conta/")}">A minha conta</a>.</p></div></div>

      <h2 class="site-secao-titulo at-mt-8">Compra avulsa, sem subscrição</h2>
      <div class="at-colunas-2">
        <div class="site-recurso"><h3>Página completa · ${euro(PRECOS.pagina)}</h3><p>Uma página Pro inteira (por exemplo, um painel ou um checkout), com o código para descarregar e abrir no editor. Paga uma vez, é sua para sempre.</p></div>
        <div class="site-recurso"><h3>Componente premium · ${euro(PRECOS.componente)}</h3><p>Um bloco pronto para encaixar no seu projeto, como uma secção de preços animada ou um gráfico de painel. Também sem mensalidade.</p></div>
      </div>
      <p class="at-texto-suave at-texto-pequeno at-mt-3">O botão de compra fica na página de cada item Pro, em <a href="${url("exemplos/")}">Exemplos completos</a>.</p>

      <h2 class="site-secao-titulo at-mt-8">Perguntas frequentes</h2>
      <div class="at-sanfona site-precos-faq">
        ${perguntas.map(([p, r], i) => `<details name="faq-precos"${i === 0 ? " open" : ""}><summary>${p}</summary><div class="at-sanfona-conteudo"><p>${r}</p></div></details>`).join("\n        ")}
      </div>

      <div class="site-pro-cartao at-mt-8" id="lista-espera" data-lista-espera hidden>
        <h2 class="site-titulo site-h2">Pagamentos abrem em breve</h2>
        <p>Entre na lista e receba o aviso do lançamento com o preço de pré-venda. Sem spam: um e-mail no lançamento.</p>
        <p class="at-texto-suave" data-lista-espera-estado>Para entrar na lista, <a href="${url("conta/")}">crie a sua conta grátis</a>.</p>
        <button class="at-botao at-primario" data-entrar-lista hidden>Quero ser avisado do lançamento</button>
      </div>
    </div>`;
  return pagina({
    titulo: "Planos e preços · Atalho Pro",
    descricao: `O Atalho é grátis. O Pro custa ${euro(PRECOS.proMensal)}/mês ou ${euro(PRECOS.proAnual)}/ano e desbloqueia todas as páginas e modelos completos; páginas avulsas por ${euro(PRECOS.pagina)}.`,
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
  const conteudo = `${cabecalhoPagina("A sua conta", "A minha conta", "Conta grátis: desbloqueia as páginas completas, guarda os seus componentes favoritos e avisa quando o Atalho Pro sair.")}
    <div class="site-container site-conta" data-conta>
      <div class="at-alerta at-aviso" data-conta-indisponivel hidden>
        <div class="at-alerta-conteudo"><strong>Contas em breve</strong><p>A área de contas está a ser ativada. Os componentes continuam disponíveis sem registo; as páginas completas abrem assim que as contas estiverem no ar.</p></div>
      </div>

      <div class="at-alerta" data-conta-motivo hidden>
        <div class="at-alerta-conteudo"><strong>Falta só entrar</strong><p>As páginas completas ficam disponíveis para quem tem conta. É grátis e leva menos de um minuto.</p></div>
      </div>

      <div class="at-alerta at-sucesso site-conta-aguardando" data-conta-aguardando tabindex="-1" hidden>
        <div class="at-alerta-conteudo">
          <strong>Confirme o seu e-mail para ativar a conta</strong>
          <p>Enviámos um link para <strong data-conta-confirmar-email></strong>. Abra o e-mail e clique no link; volta a esta página já com a sessão iniciada.</p>
          <p class="at-texto-pequeno">Não chegou em 2 minutos? Verifique a pasta de spam ou <button type="button" class="at-botao at-link at-pequeno" data-conta-reenviar>reenvie o e-mail</button>.</p>
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
              <div class="at-campo"><label class="at-rotulo" for="entrar-senha">Palavra-passe</label>
                <div class="at-senha"><input class="at-entrada" id="entrar-senha" name="senha" type="password" required minlength="8" autocomplete="current-password"><button type="button" data-at-ver-senha>Mostrar</button></div>
              </div>
              <button class="at-botao at-primario at-bloco">Entrar</button>
              <button type="button" class="at-botao at-link" data-esqueci-senha>Esqueci-me da palavra-passe</button>
            </form>
          </div>
          <div class="at-painel" id="painel-criar">
            <form class="at-pilha" data-at-validar id="form-criar">
              <div class="at-campo"><label class="at-rotulo" for="criar-nome">Nome</label><input class="at-entrada" id="criar-nome" name="nome" required minlength="2" autocomplete="name"></div>
              <div class="at-campo"><label class="at-rotulo" for="criar-email">E-mail</label><input class="at-entrada" id="criar-email" name="email" type="email" required autocomplete="email"></div>
              <div class="at-campo"><label class="at-rotulo" for="criar-senha">Palavra-passe</label>
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
        <h2 class="site-secao-titulo at-mt-6">O seu plano</h2>
        <div data-conta-plano><p class="at-texto-suave">A carregar…</p></div>
        <h2 class="site-secao-titulo at-mt-6">Páginas completas desbloqueadas</h2>
        <div class="site-relacionados">
          ${exemplos.map((e) => `<a href="${url(`exemplos/${e.id}/`)}"><strong>${esc(e.nome)}</strong><span>${esc(e.resumo)}</span></a>`).join("")}
        </div>
        <h2 class="site-secao-titulo at-mt-6">Componentes favoritos</h2>
        <div class="site-relacionados" data-conta-favoritos></div>
        <p class="at-texto-suave" data-conta-sem-favoritos hidden>Ainda não marcou nenhum componente como favorito. Use o botão ♡ Favoritar nas páginas dos componentes.</p>
        <div data-conta-lista-bloco>
          <h2 class="site-secao-titulo at-mt-6">Atalho Pro</h2>
          <label class="at-linha"><input type="checkbox" role="switch" class="at-chave" data-conta-lista-espera> Quero ser avisado do lançamento do Atalho Pro</label>
        </div>
        <h2 class="site-secao-titulo at-mt-6">Os seus dados</h2>
        <p class="at-texto-suave">Guardamos só nome, e-mail, favoritos, a sua escolha sobre a lista do Pro e, se comprar, o plano e as compras (os dados de pagamento ficam só na Revolut). Veja a <a href="${url("privacidade/")}">política de privacidade</a>.</p>
        <button class="at-botao at-perigo" commandfor="modal-excluir-conta" command="show-modal">Eliminar a minha conta</button>
        <dialog class="at-modal at-pequeno" id="modal-excluir-conta" aria-labelledby="excluir-conta-titulo">
          <form method="dialog">
            <div class="at-modal-corpo"><h3 class="at-titulo-4" id="excluir-conta-titulo">Eliminar a sua conta?</h3><p class="at-texto-suave">Os seus dados e favoritos serão apagados de forma definitiva.</p><p class="at-texto-pequeno at-mb-0"><strong>Tem o Pro?</strong> Cancele primeiro a subscrição em "O seu plano" (Cancelar subscrição); só depois é possível eliminar a conta.</p></div>
            <div class="at-modal-rodape"><button class="at-botao at-fantasma" value="cancelar">Cancelar</button><button class="at-botao at-perigo" value="excluir" data-excluir-conta>Eliminar definitivamente</button></div>
          </form>
        </dialog>
      </div>

      <dialog class="at-modal at-pequeno" id="modal-nova-senha" aria-labelledby="nova-senha-titulo">
        <form data-at-validar id="form-nova-senha">
          <div class="at-modal-corpo at-pilha">
            <h3 class="at-titulo-4" id="nova-senha-titulo">Crie uma nova palavra-passe</h3>
            <div class="at-campo"><label class="at-rotulo" for="nova-senha">Nova palavra-passe</label>
              <div class="at-senha"><input class="at-entrada" id="nova-senha" name="senha" type="password" required minlength="8" autocomplete="new-password"><button type="button" data-at-ver-senha>Mostrar</button></div>
              <div class="at-forca" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="at-forca-texto" aria-live="polite"></span>
            </div>
            <div class="at-campo"><label class="at-rotulo" for="nova-senha-confirmar">Repita a nova palavra-passe</label><input class="at-entrada" id="nova-senha-confirmar" name="confirmar" type="password" required minlength="8" autocomplete="new-password"></div>
          </div>
          <div class="at-modal-rodape"><button type="button" class="at-botao at-fantasma" commandfor="modal-nova-senha" command="close">Agora não</button><button class="at-botao at-primario">Guardar nova palavra-passe</button></div>
        </form>
      </dialog>
    </div>`;
  return pagina({
    titulo: "A minha conta · Atalho",
    descricao: "Entre ou crie a sua conta grátis no Atalho para abrir as páginas completas e guardar componentes favoritos.",
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
      <p>Esta política explica quais dados o Atalho trata, porquê e quais são os seus direitos, conforme o Regulamento Geral sobre a Proteção de Dados da União Europeia (RGPD) e, para quem está no Brasil, a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD). O responsável pelo tratamento é ${SITE.autor}, com sede em Portugal.</p>
      <h2 class="site-secao-titulo">1. Sem conta, quase nada</h2>
      <p>Para ler a documentação e copiar componentes, você não precisa de registo. As páginas completas ficam disponíveis para quem cria uma conta grátis. O site não usa cookies de rastreamento nem de publicidade. Preferências como tema escuro ficam guardadas só no seu navegador (localStorage) e não são enviadas para nós.</p>
      <h2 class="site-secao-titulo">2. Se criar uma conta</h2>
      <ul class="site-lista">
        <li><strong>Dados:</strong> nome, e-mail, palavra-passe (guardada de forma encriptada pelo fornecedor de autenticação, nunca em texto puro), componentes favoritos e se você quer receber o aviso do Atalho Pro.</li>
        <li><strong>Finalidade:</strong> permitir o acesso à conta e às páginas completas, guardar os seus favoritos e, se você pedir, avisar sobre o lançamento do Atalho Pro.</li>
        <li><strong>Quem vê:</strong> só você e o administrador do Atalho, que vê nome, e-mail, datas de registo e de último acesso, quantidade de favoritos e se você está na lista do Pro, para manter o serviço a funcionar. Ninguém vê a sua palavra-passe, nem o administrador. Os dados não são vendidos nem cedidos.</li>
        <li><strong>Base legal:</strong> execução do serviço que você pediu (RGPD art. 6.º, n.º 1, b; LGPD art. 7º, V) e consentimento para o aviso do Pro (RGPD art. 6.º, n.º 1, a; LGPD art. 7º, I), que você pode retirar a qualquer momento na sua conta.</li>
        <li><strong>Onde ficam:</strong> no Supabase, fornecedor de base de dados e autenticação, em servidores na União Europeia, com as garantias exigidas pelo RGPD e pela LGPD.</li>
        <li><strong>E-mails:</strong> mensagens de confirmação de registo e de troca de palavra-passe são enviadas pelo Brevo, que recebe apenas o seu e-mail para fazer a entrega.</li>
        <li><strong>Por quanto tempo:</strong> enquanto a conta existir. Ao eliminar a conta, os dados são apagados.</li>
      </ul>
      <h2 class="site-secao-titulo">2.1. Se comprar ou subscrever o Pro</h2>
      <ul>
        <li><strong>Quem processa o pagamento:</strong> a Revolut (Revolut Bank UAB), numa página de pagamento da própria Revolut. Ela trata os dados do cartão e de pagamento como responsável pelo tratamento, conforme a política de privacidade dela. O Atalho nunca recebe os dados do seu cartão; recebe da Revolut o seu e-mail e o resultado do pagamento.</li>
        <li><strong>O que o Atalho guarda:</strong> o identificador da sua conta ligado ao plano ou à compra, a situação da subscrição (ativa, cancelada, datas de renovação e de término), e o valor pago, recebidos da Revolut por um aviso assinado digitalmente, além dos dados necessários à fatura.</li>
        <li><strong>Finalidade e base legal:</strong> disponibilizar o conteúdo que comprou (execução do contrato: RGPD art. 6.º, n.º 1, b; LGPD art. 7º, V) e cumprir obrigações contabilísticas (RGPD art. 6.º, n.º 1, c; LGPD art. 7º, II).</li>
        <li><strong>Por quanto tempo:</strong> enquanto a conta existir; registos de pagamento podem ser mantidos pelo prazo exigido pela lei fiscal, mesmo após a eliminação da conta, sem os demais dados.</li>
      </ul>
      <h2 class="site-secao-titulo">3. Assistente de IA</h2>
      <p>O texto que você escreve no assistente é enviado ao serviço de IA da Cloudflare para gerar a resposta. Não peça ajuda com dados pessoais (NIF, palavras-passe, moradas reais). As perguntas não são associadas à sua conta.</p>
      <h2 class="site-secao-titulo">4. Serviços de terceiros</h2>
      <p>O site carrega fontes do Google Fonts e a biblioteca do jsDelivr, e os exemplos consultam ViaCEP e DummyJSON quando você interage com eles. Esses serviços recebem dados técnicos da ligação (como o endereço IP), conforme as políticas deles.</p>
      <h2 class="site-secao-titulo">5. Os seus direitos</h2>
      <p>Você pode, a qualquer momento: aceder aos seus dados e confirmá-los, corrigir, pedir a portabilidade, opor-se ao tratamento, retirar o consentimento e <strong>eliminar a conta</strong> (botão em "A minha conta", que apaga tudo na hora). Se achar que os seus direitos não foram respeitados, pode reclamar à autoridade de proteção de dados: a CNPD, em Portugal, ou a ANPD, no Brasil.</p>
      <h2 class="site-secao-titulo">6. Contacto</h2>
      <p data-contato-privacidade>Para assuntos de privacidade, fale com o responsável pelo projeto pelo <a href="${SITE.repositorio}/issues/new?title=${encodeURIComponent("Privacidade: ")}">GitHub</a>.</p>
    `)}`;
  return pagina({
    titulo: "Política de privacidade · Atalho",
    descricao: "Como o Atalho trata dados pessoais conforme o RGPD e a LGPD: o que é recolhido, porquê, por quanto tempo e como eliminar a sua conta.",
    caminho: "privacidade/",
    pagina: "legal",
    secao: "",
    conteudo,
  });
}

export function paginaTermos() {
  const conteudo = `${cabecalhoPagina("Legal", "Termos de uso", "Última atualização: 16 de outubro de 2026.")}
    ${artigo(`
      <h2 class="site-secao-titulo">1. O que é o Atalho</h2>
      <p>O Atalho é uma biblioteca gratuita de componentes de interface e a documentação que a acompanha, mantida por ${SITE.autor}.</p>
      <h2 class="site-secao-titulo">2. Licença do código</h2>
      <p>O código da biblioteca é distribuído sob a <a href="${SITE.repositorio}/blob/main/LICENSE">licença MIT</a>: você pode usar em projetos pessoais e comerciais, modificar e redistribuir, mantendo o aviso de licença. O conteúdo do Atalho Pro tem licença própria, descrita abaixo.</p>
      <h2 class="site-secao-titulo">3. Sem garantias</h2>
      <p>O Atalho é oferecido "como está". Revise e teste o código antes de usar em produção, especialmente tudo o que envolve segurança, pagamentos e dados pessoais.</p>
      <h2 class="site-secao-titulo">4. Conta</h2>
      <p>Você é responsável pela sua palavra-passe. Contas usadas para abuso (como tentar sobrecarregar o assistente de IA) podem ser removidas.</p>
      <h2 class="site-secao-titulo" id="venda">5. Atalho Pro e compras</h2>
      <ul>
        <li><strong>Vendedor:</strong> o Atalho, mantido por ${SITE.autor} (Portugal). O pagamento é processado pela Revolut; a fatura é emitida pelo vendedor e enviada por e-mail.</li>
        <li><strong>Subscrição Pro:</strong> cobrada por mês ou por ano, renova-se automaticamente até ser cancelada. Pode cancelar quando quiser em "A minha conta", sem multa; o acesso continua até ao fim do período já pago. Mudanças de preço valem só para a próxima renovação e são avisadas antes.</li>
        <li><strong>Compra avulsa:</strong> pagamento único por uma página ou um componente, com acesso enquanto o Atalho existir. Se o serviço for encerrado, você recebe o ficheiro para guardar.</li>
        <li><strong>Direito de desistência (UE):</strong> por ser conteúdo digital entregue na hora, antes de pagar você pede o acesso imediato e reconhece que, com isso, perde o direito de desistência de 14 dias. Se o conteúdo não funcionar como descrito, escreva-nos: corrigimos ou devolvemos o valor.</li>
        <li><strong>Licença do conteúdo Pro:</strong> você pode usar e modificar o que descarregar em quantos projetos quiser, os seus ou de clientes, incluindo comerciais. Não pode revender, redistribuir ou publicar os modelos Pro como modelos ou kits (por exemplo, em marketplaces de templates), nem partilhar o acesso da sua conta.</li>
      </ul>
      <h2 class="site-secao-titulo">6. Assistente de IA</h2>
      <p>As respostas são geradas automaticamente e podem conter erros. Verifique o código sugerido antes de usar.</p>
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
        <h1 class="at-titulo-2">Esta página não existe</h1>
        <p>O endereço pode ter mudado ou estar mal escrito. Use a pesquisa (Ctrl K) ou volte ao início.</p>
        <div class="at-linha at-centro"><a class="at-botao at-primario" href="${url()}">Ir para o início</a><a class="at-botao" href="${url("componentes/")}">Ver componentes</a></div>
      </div>
    </div></section>`;
  return pagina({ titulo: "Página não encontrada · Atalho", descricao: "Esta página não existe no Atalho. Use a pesquisa para encontrar componentes em português.", caminho: "404.html", pagina: "404", secao: "", indexar: false, conteudo });
}
