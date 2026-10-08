import { SITE, url } from "./config.mjs";
import { pagina, ICONES_SITE } from "./layout.mjs";
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
    "Telas inteiras feitas só com o Atalho. Abra, veja o código-fonte (Ctrl + U) e use como ponto de partida do seu projeto."
  )}
    <div class="site-container site-secao-curta">
      <div class="site-galeria">
        ${exemplos
          .map(
            (e) => `<a class="site-galeria-item" href="${url(`exemplos/${e.id}.html`)}">
          <span class="site-galeria-moldura"><img src="${url(`exemplos/miniaturas/${e.id}.png`)}" alt="Prévia do exemplo ${esc(e.nome)}" loading="lazy" width="600" height="375"></span>
          <strong>${esc(e.nome)}</strong><span>${esc(e.resumo)}</span>
          <span class="site-galeria-componentes">${e.componentes.map((c) => `<span class="at-selo">${esc(c)}</span>`).join("")}</span>
        </a>`
          )
          .join("")}
      </div>
    </div>`;
  return pagina({
    titulo: "Exemplos de páginas completas · Atalho",
    descricao: "Landing page, painel administrativo, loja, login, checkout e blog prontos em HTML, CSS e JavaScript, feitos com o Atalho. Copie e adapte.",
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
    `${nomes.length} ícones desenhados para o Atalho`,
    "Traço de 2px, grade 24×24, herdam a cor do texto. Clique em um ícone para copiar o SVG e cole direto no seu HTML.",
    `<div class="at-entrada-icone site-filtro">${ICONES_SITE.busca}<input class="at-entrada" type="search" id="filtro-icones" placeholder="Filtrar ícones: carrinho, seta, usuário…" aria-label="Filtrar ícones" autocomplete="off"></div>`
  )}
    <div class="site-container site-secao-curta">
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
        `<button class="at-botao at-icone" aria-label="Buscar">
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    ${icones.icones.busca}
  </svg>
</button>`
      )}
    </div>`;
  return pagina({
    titulo: "Ícones SVG grátis · Atalho",
    descricao: `${nomes.length} ícones SVG gratuitos (licença MIT) para sites e sistemas: carrinho, usuário, setas, WhatsApp, Pix e mais. Clique para copiar.`,
    caminho: "icones/",
    pagina: "icones",
    secao: "icones",
    conteudo,
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

export function paginaPro() {
  const itens = [
    ["Painel administrativo completo", "Login, menu lateral, gráficos, tabelas com filtros, formulários de cadastro e permissões."],
    ["Loja virtual", "Vitrine, página de produto, carrinho, checkout com Pix e cartão, área do cliente com pedidos."],
    ["Landing pages de venda", "Modelos para curso, SaaS, evento e serviço, com seções testadas em conversão."],
    ["Back-end em PHP", "API com login seguro, banco de dados e validações prontas para os modelos acima."],
  ];
  const conteudo = `${cabecalhoPagina(
    "Atalho Pro",
    "Sistemas inteiros, prontos para usar",
    "O Atalho continua grátis. O Pro é para quem quer economizar semanas: modelos completos de front e back-end, feitos com o mesmo cuidado da documentação."
  )}
    ${artigo(`
      <div class="site-recursos">${itens.map(([t, d]) => `<div class="site-recurso"><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>

      <div class="site-pro-cartao at-mt-6" id="lista-espera">
        <h2 class="site-titulo site-h2">Entre na lista de espera</h2>
        <p>Quem entrar na lista recebe o aviso do lançamento e o preço de pré-venda. Sem spam: um e-mail no lançamento.</p>
        <div data-lista-espera>
          <p class="at-texto-suave" data-lista-espera-estado>Para entrar na lista, <a href="${url("conta/")}">crie sua conta grátis</a>.</p>
          <button class="at-botao at-primario" data-entrar-lista hidden>Quero ser avisado do lançamento</button>
        </div>
      </div>
    `)}`;
  return pagina({
    titulo: "Atalho Pro · Modelos de sistemas e lojas prontos",
    descricao: "Atalho Pro: painel administrativo, loja virtual e landing pages completas em HTML, CSS, JavaScript e PHP. Entre na lista de espera.",
    caminho: "pro/",
    pagina: "pro",
    secao: "pro",
    conteudo,
    scripts: ["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js", "site/conta.js"],
  });
}

/* ------------------------------------------------------------------------ */

export function paginaConta() {
  const conteudo = `${cabecalhoPagina("Sua conta", "Minha conta", "Salve componentes favoritos e entre na lista do Atalho Pro.")}
    <div class="site-container site-conta" data-conta>
      <div class="at-alerta at-aviso" data-conta-indisponivel hidden>
        <div class="at-alerta-conteudo"><strong>Contas em breve</strong><p>A área de contas ainda está sendo ativada. Enquanto isso, tudo no Atalho continua liberado sem cadastro.</p></div>
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
            <button class="at-botao" data-sair>Sair</button>
          </div>
        </div>
        <h2 class="site-secao-titulo at-mt-6">Componentes favoritos</h2>
        <div class="site-relacionados" data-conta-favoritos></div>
        <p class="at-texto-suave" data-conta-sem-favoritos hidden>Você ainda não favoritou nenhum componente. Use o botão ♡ Favoritar nas páginas dos componentes.</p>
        <h2 class="site-secao-titulo at-mt-6">Atalho Pro</h2>
        <label class="at-linha"><input type="checkbox" role="switch" class="at-chave" data-conta-lista-espera> Quero ser avisado do lançamento do Atalho Pro</label>
        <h2 class="site-secao-titulo at-mt-6">Seus dados</h2>
        <p class="at-texto-suave">Guardamos só nome, e-mail, favoritos e a sua escolha sobre a lista do Pro. Veja a <a href="${url("privacidade/")}">política de privacidade</a>.</p>
        <button class="at-botao at-perigo" commandfor="modal-excluir-conta" command="show-modal">Excluir minha conta</button>
        <dialog class="at-modal at-pequeno" id="modal-excluir-conta" aria-labelledby="excluir-conta-titulo">
          <form method="dialog">
            <div class="at-modal-corpo"><h3 class="at-titulo-4" id="excluir-conta-titulo">Excluir sua conta?</h3><p class="at-texto-suave">Seus dados e favoritos serão apagados de forma definitiva.</p></div>
            <div class="at-modal-rodape"><button class="at-botao at-fantasma" value="cancelar">Cancelar</button><button class="at-botao at-perigo" value="excluir" data-excluir-conta>Excluir definitivamente</button></div>
          </form>
        </dialog>
      </div>
    </div>`;
  return pagina({
    titulo: "Minha conta · Atalho",
    descricao: "Entre ou crie sua conta grátis no Atalho para salvar componentes favoritos.",
    caminho: "conta/",
    pagina: "conta",
    secao: "",
    indexar: false,
    conteudo,
    scripts: ["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js", "site/conta.js"],
  });
}

/* ------------------------------------------------------------------------ */

export function paginaPrivacidade() {
  const atualizado = "8 de outubro de 2026";
  const conteudo = `${cabecalhoPagina("Legal", "Política de privacidade", `Última atualização: ${atualizado}.`)}
    ${artigo(`
      <p>Esta política explica quais dados o Atalho trata, por quê e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD). O controlador dos dados é ${SITE.autor}.</p>
      <h2 class="site-secao-titulo">1. Sem conta, quase nada</h2>
      <p>Para ler a documentação e copiar componentes, você não precisa de cadastro. O site não usa cookies de rastreamento nem de publicidade. Preferências como tema escuro ficam guardadas só no seu navegador (localStorage) e não são enviadas para nós.</p>
      <h2 class="site-secao-titulo">2. Se você criar uma conta</h2>
      <ul class="site-lista">
        <li><strong>Dados:</strong> nome, e-mail, senha (guardada de forma criptografada pelo provedor de autenticação, nunca em texto puro), componentes favoritos e se você quer receber o aviso do Atalho Pro.</li>
        <li><strong>Finalidade:</strong> permitir o acesso à conta, guardar seus favoritos e, se você pedir, avisar sobre o lançamento do Atalho Pro.</li>
        <li><strong>Base legal:</strong> execução do serviço que você pediu (art. 7º, V) e consentimento para o aviso do Pro (art. 7º, I), que você pode retirar a qualquer momento na sua conta.</li>
        <li><strong>Onde ficam:</strong> no Supabase, provedor de banco de dados e autenticação, que pode armazenar dados fora do Brasil com as garantias exigidas pela LGPD.</li>
        <li><strong>Por quanto tempo:</strong> enquanto a conta existir. Ao excluir a conta, os dados são apagados.</li>
      </ul>
      <h2 class="site-secao-titulo">3. Assistente de IA</h2>
      <p>O texto que você digita no assistente é enviado ao serviço de IA da Cloudflare para gerar a resposta. Não peça ajuda com dados pessoais (CPF, senhas, endereços reais). As perguntas não são associadas à sua conta.</p>
      <h2 class="site-secao-titulo">4. Serviços de terceiros</h2>
      <p>O site carrega fontes do Google Fonts e a biblioteca do jsDelivr, e os exemplos consultam ViaCEP e DummyJSON quando você interage com eles. Esses serviços recebem dados técnicos da conexão (como o endereço IP), conforme as políticas deles.</p>
      <h2 class="site-secao-titulo">5. Seus direitos</h2>
      <p>Você pode, a qualquer momento: confirmar e acessar seus dados, corrigir, pedir a portabilidade, retirar o consentimento e <strong>excluir a conta</strong> (botão em "Minha conta", que apaga tudo na hora).</p>
      <h2 class="site-secao-titulo">6. Contato</h2>
      <p data-contato-privacidade>Para assuntos de privacidade, fale com o responsável pelo projeto pelo <a href="${SITE.repositorio}/issues/new?title=${encodeURIComponent("Privacidade: ")}">GitHub</a>.</p>
    `)}`;
  return pagina({
    titulo: "Política de privacidade · Atalho",
    descricao: "Como o Atalho trata dados pessoais conforme a LGPD: o que é coletado, por quê, por quanto tempo e como excluir sua conta.",
    caminho: "privacidade/",
    pagina: "legal",
    secao: "",
    conteudo,
  });
}

export function paginaTermos() {
  const conteudo = `${cabecalhoPagina("Legal", "Termos de uso", "Última atualização: 8 de outubro de 2026.")}
    ${artigo(`
      <h2 class="site-secao-titulo">1. O que é o Atalho</h2>
      <p>O Atalho é uma biblioteca gratuita de componentes de interface e a documentação que a acompanha, mantida por ${SITE.autor}.</p>
      <h2 class="site-secao-titulo">2. Licença do código</h2>
      <p>O código da biblioteca é distribuído sob a <a href="${SITE.repositorio}/blob/main/LICENSE">licença MIT</a>: você pode usar em projetos pessoais e comerciais, modificar e redistribuir, mantendo o aviso de licença. O conteúdo do Atalho Pro, quando lançado, terá licença própria.</p>
      <h2 class="site-secao-titulo">3. Sem garantias</h2>
      <p>O Atalho é oferecido "como está". Revise e teste o código antes de usar em produção, especialmente tudo que envolve segurança, pagamentos e dados pessoais.</p>
      <h2 class="site-secao-titulo">4. Conta</h2>
      <p>Você é responsável pela sua senha. Contas usadas para abuso (como tentar sobrecarregar o assistente de IA) podem ser removidas.</p>
      <h2 class="site-secao-titulo">5. Assistente de IA</h2>
      <p>As respostas são geradas automaticamente e podem conter erros. Confira o código sugerido antes de usar.</p>
      <h2 class="site-secao-titulo">6. Patrocínios</h2>
      <p>Conteúdos patrocinados são sempre identificados. O Atalho não se responsabiliza por produtos de patrocinadores.</p>
      <h2 class="site-secao-titulo">7. Mudanças</h2>
      <p>Estes termos podem ser atualizados; a data no topo indica a última versão.</p>
    `)}`;
  return pagina({
    titulo: "Termos de uso · Atalho",
    descricao: "Termos de uso do Atalho: licença MIT do código, conta, assistente de IA e patrocínios.",
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
