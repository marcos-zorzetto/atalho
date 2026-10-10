(function () {
  const { pt, en, icone: i, produtos } = window.ATALHO_DOCS.util;
  const produtosJSON = JSON.stringify(produtos, null, 2).replace(/\n/g, "\n  ");

  window.ATALHO_DOCS.componentes.push(
    /* ======================================================================
       BLOCOS DE PÁGINA
       ====================================================================== */
    {
      id: "hero",
      nome: "Hero (topo da landing page)",
      categoria: "paginas",
      resumo: "A primeira dobra de uma landing page: chamada, título forte, subtítulo, botões e prova social.",
      apelidos: ["hero", "banner", "landing page", "capa", "topo da página", "primeira dobra", "chamada", "header da home"],
      inspiradoEm: ["Stripe", "Linear", "Revolut (página inicial)"],
      quandoUsar: ["No topo de páginas de produto, serviço ou portfólio."],
      comoFunciona: "Combine tipografia, linha de botões e avatares. Use at-centro para centrar tudo.",
      recursos: ["min-max-clamp", "text-wrap-balance"],
      mdn: [],
      conectaCom: ["barra", "tipografia", "planos", "avatar"],
      acessibilidade: ["O título do hero normalmente é o <h1> da página."],
      api: [{ nome: "at-hero", tipo: "classe", descricao: "Espaço vertical do topo. Junte at-centro para centrar." }],
      exemplos: [
        {
          titulo: "Produto SaaS",
          html: `<section class="at-hero at-centro">
  <div class="at-container">
    <span class="at-selo at-primario">Novo · Emissão de fatura</span>
    <!-- Na sua página, este é o título principal: use h1 (aqui é h2 porque a documentação já tem o seu) -->
    <h2 class="at-titulo-1 at-mt-4">A sua loja a vender no<br>piloto automático</h2>
    <p class="at-chamada">Catálogo, MB WAY, portes e faturas num só lugar. Configure em 10 minutos, sem programar.</p>
    <div class="at-linha at-mt-6">
      <a href="#" class="at-botao at-primario at-grande">Criar loja grátis</a>
      <a href="#" class="at-botao at-grande">Ver demonstração</a>
    </div>
    <div class="at-linha at-mt-6 at-texto-suave at-texto-pequeno">
      <div class="at-avatares">
        <span class="at-avatar at-pequeno">AO</span><span class="at-avatar at-pequeno">LP</span><span class="at-avatar at-pequeno">JS</span>
      </div>
      Mais de 12 mil lojistas em Portugal
    </div>
  </div>
</section>`,
        },
      ],
    },

    {
      id: "planos",
      nome: "Planos e preços",
      categoria: "paginas",
      resumo: "Tabela de planos com destaque no recomendado e alternância mensal/anual que recalcula os preços.",
      apelidos: ["pricing", "preços", "planos", "assinatura", "tabela de preços", "mensal", "anual", "plano pro"],
      inspiradoEm: ["Spotify (planos)", "Stripe", "Notion"],
      quandoUsar: ["Página de preços de produtos por assinatura."],
      comoFunciona: "A chave mensal/anual está ligada ao Estado com data-at-valor; os preços são calculados por getters e formatados com data-at-formato=\"moeda\".",
      recursos: ["grid"],
      mdn: [],
      conectaCom: ["estado", "sanfona", "botao"],
      acessibilidade: ["O plano em destaque precisa de ter o motivo em texto (data-destaque=\"Mais escolhido\"), não só a borda."],
      api: [
        { nome: "at-planos / at-plano", tipo: "classe", descricao: "Grade e cada plano." },
        { nome: "data-destaque=\"texto\"", tipo: "atributo", descricao: "Plano em destaque com a etiqueta." },
        { nome: "at-plano-preco", tipo: "classe", descricao: "Preço grande. Use <small> para \"/mês\"." },
      ],
      exemplos: [
        {
          titulo: "Mensal ou anual",
          html: `<label class="at-linha at-centro at-mb-6">
  Mensal
  <input type="checkbox" role="switch" class="at-chave" data-at-valor="planos.anual" aria-label="Cobrança anual">
  Anual <span class="at-selo at-sucesso">2 meses grátis</span>
</label>

<div class="at-planos">
  <div class="at-plano">
    <h3>Grátis</h3>
    <div class="at-plano-preco">0 € <small>/mês</small></div>
    <ul><li>Até 20 produtos</li><li>MB WAY e Multibanco</li><li>Domínio .loja</li></ul>
    <button class="at-botao at-bloco">Começar</button>
  </div>
  <div class="at-plano" data-destaque="Mais escolhido">
    <h3>Profissional</h3>
    <div class="at-plano-preco"><span data-at-texto="planos.pro" data-at-formato="moeda"></span> <small>/mês</small></div>
    <ul><li>Produtos ilimitados</li><li>Fatura automática</li><li>Domínio próprio</li><li>Suporte por WhatsApp</li></ul>
    <button class="at-botao at-primario at-bloco">Subscrever Profissional</button>
  </div>
  <div class="at-plano">
    <h3>Empresa</h3>
    <div class="at-plano-preco"><span data-at-texto="planos.empresa" data-at-formato="moeda"></span> <small>/mês</small></div>
    <ul><li>Tudo do Profissional</li><li>Várias lojas</li><li>API e integrações</li><li>Gestor de conta</li></ul>
    <button class="at-botao at-bloco">Falar com vendas</button>
  </div>
</div>`,
          js: `Atalho.estado("planos", {
  anual: false,
  // Anual: paga 10 meses e leva 12
  get pro() { return this.anual ? (79 * 10) / 12 : 79; },
  get empresa() { return this.anual ? (249 * 10) / 12 : 249; },
});`,
        },
      ],
    },

    {
      id: "rodape",
      nome: "Rodapé",
      categoria: "paginas",
      resumo: "Rodapé com colunas de links, redes e as informações que as lojas online em Portugal são obrigadas a mostrar (Livro de Reclamações, NIF, morada).",
      apelidos: ["footer", "rodapé", "rodape", "final da página", "links do rodapé", "livro de reclamações", "nif", "ral"],
      inspiradoEm: ["Worten e El Corte Inglés (dados da empresa)", "Stripe (colunas)"],
      quandoUsar: ["No fim de todo site."],
      comoFunciona:
        "As colunas ajustam-se sozinhas. Em Portugal, as lojas online têm de mostrar a firma, o NIF e a morada (Decreto-Lei 7/2004), o link do Livro de Reclamações Eletrónico e a informação sobre Resolução Alternativa de Litígios (Lei 144/2015). O rodapé é o lugar onde as pessoas (e as autoridades) procuram.",
      recursos: ["grid"],
      mdn: [],
      conectaCom: ["cookies", "barra"],
      acessibilidade: ["Use <footer> e títulos nas colunas para facilitar a navegação."],
      api: [
        { nome: "at-rodape / at-rodape-grade / at-rodape-base", tipo: "classe", descricao: "Estrutura." },
      ],
      exemplos: [
        {
          titulo: "Loja online",
          html: `<footer class="at-rodape">
  <div class="at-container">
    <div class="at-rodape-grade">
      <div>
        <a href="#" class="at-barra-marca">◆ Minha Loja</a>
        <p class="at-texto-suave at-mt-2">Moda e acessórios com entrega em todo o país.</p>
      </div>
      <nav aria-label="Ajuda"><h4>Ajuda</h4><ul><li><a href="#">Trocas e devoluções</a></li><li><a href="#">Prazos de entrega</a></li><li><a href="#">Fale connosco</a></li></ul></nav>
      <nav aria-label="Institucional"><h4>Institucional</h4><ul><li><a href="#">Quem somos</a></li><li><a href="#">Trabalhe connosco</a></li><li><a href="#">Política de privacidade</a></li></ul></nav>
      <div><h4>Pagamento</h4><p class="at-texto-suave">MB WAY · Multibanco · Cartão · PayPal</p><p class="at-mt-2"><a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener">Livro de Reclamações</a></p></div>
    </div>
    <div class="at-rodape-base">
      <span>Minha Loja, Lda. · NIF 509 999 999 · Av. da Liberdade, 100, 1250-096 Lisboa · <a href="https://www.consumidor.gov.pt/resolucao-de-litigios.aspx" target="_blank" rel="noopener">Resolução de litígios</a></span>
      <span>© 2026</span>
    </div>
  </div>
</footer>`,
        },
      ],
    },

    /* ======================================================================
       JAVASCRIPT
       ====================================================================== */
    {
      id: "estado",
      nome: "Estado (reatividade)",
      categoria: "javascript",
      resumo: "A ideia central do React, sem React: muda os dados e o ecrã atualiza-se sozinho. É assim que os componentes se conectam.",
      apelidos: ["estado", "state", "reatividade", "react", "vue", "usestate", "store", "variável global", "ligar componentes", "data binding", "atualizar ecrã", "localstorage"],
      inspiradoEm: ["React (useState e dados imutáveis)", "Vue e Pinia (estado com ações e getters)", "Alpine.js (atributos no HTML)"],
      quandoUsar: [
        "Quando várias partes do ecrã mostram o mesmo dado (o número do carrinho na barra e o total na gaveta).",
        "Quando dá por si a escrever document.querySelector(...).textContent = ... em vários lugares.",
      ],
      comoFunciona:
        "Atalho.estado(\"nome\", { dados, getters, ações }) cria o estado. No HTML, data-at-texto=\"nome.campo\" mostra o valor, data-at-mostrar esconde/mostra, data-at-lista repete um <template>, data-at-valor liga um campo nos dois sentidos e data-at-acao chama uma função. Como no React, para atualizar uma lista crie um array novo (this.itens = [...this.itens, novo]) em vez de usar push: é a troca de valor que avisa o ecrã. Com { salvar: true } os dados sobrevivem ao recarregar a página.",
      recursos: ["template", "localstorage"],
      mdn: [
        pt("Proxy (a técnica por trás)", "Web/JavaScript/Reference/Global_Objects/Proxy"),
        pt("<template>", "Web/HTML/Reference/Elements/template"),
        pt("localStorage", "Web/API/Window/localStorage"),
      ],
      conectaCom: ["receita-loja", "chat", "planos", "formatar", "eventos"],
      acessibilidade: ["Quando uma mudança de estado for importante (total do carrinho), coloque aria-live=\"polite\" no elemento."],
      api: [
        { nome: "Atalho.estado(nome, objeto, { salvar })", tipo: "função", descricao: "Cria o estado e devolve o objeto reativo." },
        { nome: "data-at-texto=\"nome.campo\" + data-at-formato", tipo: "atributo", descricao: "Mostra o valor (formatos: moeda, numero, data, relativo, porcentagem…)." },
        { nome: "data-at-mostrar / data-at-desabilitar", tipo: "atributo", descricao: "Mostra ou desativa conforme o valor. Use ! para negar: \"!nome.campo\"." },
        { nome: "data-at-valor=\"nome.campo\"", tipo: "atributo", descricao: "Liga input/checkbox ao estado nos dois sentidos." },
        { nome: "data-at-lista=\"nome.lista\" + <template>", tipo: "atributo", descricao: "Repete o template para cada item." },
        { nome: "data-at-campo / data-at-atributos", tipo: "atributo", descricao: "Dentro do template: texto e atributos vindos do item." },
        { nome: "data-at-acao=\"nome.metodo\" + data-at-dados", tipo: "atributo", descricao: "Chama o método. Dentro de lista, recebe o item automaticamente." },
        { nome: "Atalho.observar(nome, função)", tipo: "função", descricao: "Executa algo sempre que o estado mudar. Devolve função para parar." },
      ],
      exemplos: [
        {
          titulo: "Contador",
          html: `<div class="at-linha">
  <button class="at-botao at-icone" data-at-acao="contador.diminuir" aria-label="Diminuir">−</button>
  <strong class="at-titulo-3 at-mb-0 at-numero" data-at-texto="contador.valor" aria-live="polite"></strong>
  <button class="at-botao at-icone" data-at-acao="contador.aumentar" aria-label="Aumentar">+</button>
  <span class="at-selo at-aviso" data-at-mostrar="contador.alto">Passou de 5!</span>
</div>`,
          js: `Atalho.estado("contador", {
  valor: 0,
  get alto() { return this.valor > 5; },
  aumentar() { this.valor++; },
  diminuir() { this.valor = Math.max(0, this.valor - 1); },
});`,
        },
        {
          titulo: "Lista de tarefas que fica guardada",
          descricao: "Adicione tarefas e recarregue a página: elas continuam lá.",
          html: `<form class="at-grupo-entrada" style="max-width: 420px" data-at-acao="tarefas.adicionar">
  <input class="at-entrada" name="texto" placeholder="Nova tarefa" aria-label="Nova tarefa" required autocomplete="off">
  <button class="at-botao at-primario">Adicionar</button>
</form>

<p class="at-texto-suave at-texto-pequeno at-mt-4" data-at-texto="tarefas.resumo"></p>

<ul class="at-pilha" style="--at-gap: 6px; list-style: none; padding: 0; max-width: 420px" data-at-lista="tarefas.itens">
  <template>
    <li class="at-superficie at-linha at-entre" style="padding: 8px 12px">
      <span data-at-campo="texto"></span>
      <button class="at-botao at-fantasma at-pequeno" data-at-acao="tarefas.remover">Concluir</button>
    </li>
  </template>
</ul>`,
          js: `Atalho.estado("tarefas", {
  itens: [{ id: 1, texto: "Estudar o componente Estado" }],
  get resumo() {
    return this.itens.length
      ? Atalho.formatar.plural(this.itens.length, "tarefa pendente", "tarefas pendentes")
      : "Tudo feito por hoje!";
  },
  adicionar(dados, evento) {
    this.itens = [...this.itens, { id: Date.now(), texto: dados.texto }];
    evento.target.reset();
  },
  remover(tarefa) {
    this.itens = this.itens.filter((t) => t.id !== tarefa.id);
  },
}, { salvar: true });`,
        },
      ],
    },

    {
      id: "formatar",
      nome: "Formatar (moeda, datas, números)",
      categoria: "javascript",
      resumo: "Funções prontas no idioma da página: 1234,56 €, 08/10/2026, \"há 5 minutos\", 1,2 mil, 3,4 MB. Em inglês ou no Brasil, mudam sozinhas.",
      apelidos: ["formatar", "moeda", "euro", "dinheiro", "data", "hora", "intl", "toLocaleString", "número", "porcentagem", "tempo relativo", "há 5 minutos", "bytes"],
      inspiradoEm: ["Intl, a API de internacionalização dos navegadores"],
      quandoUsar: ["Sempre que mostrar dinheiro, data ou número para uma pessoa. Nunca monte valor + \" €\" à mão."],
      comoFunciona:
        "São atalhos para a API Intl do navegador, no idioma do <html lang> (pt-PT por omissão) e na moeda de <html data-at-moeda> (euro por omissão). Atalho.configurar({ idioma, moeda }) troca os dois. No HTML, use os mesmos nomes em data-at-formato.",
      recursos: ["intl", "intl-relative-time-format"],
      mdn: [
        pt("Intl.NumberFormat", "Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat"),
        en("Intl.DateTimeFormat", "Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat"),
        pt("Intl.RelativeTimeFormat", "Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat"),
      ],
      conectaCom: ["estado", "tabela", "indicador"],
      acessibilidade: [],
      api: [
        { nome: "moeda(1234.5, codigo?)", tipo: "função", descricao: "1234,50 € (ou moeda(10, \"GBP\") → 10,00 £)" },
        { nome: "numero(12345.5, casas?)", tipo: "função", descricao: "12 345,5" },
        { nome: "porcentagem(0.125, 1)", tipo: "função", descricao: "12,5%" },
        { nome: "compacto(1200)", tipo: "função", descricao: "1,2 mil" },
        { nome: "data(valor, \"short|medium|long|full\")", tipo: "função", descricao: "08/10/2026 ou 8 de outubro de 2026" },
        { nome: "dataHora(valor) / hora(valor)", tipo: "função", descricao: "08/10/2026, 14:30 / 14:30" },
        { nome: "relativo(valor)", tipo: "função", descricao: "há 5 minutos, amanhã, há 2 semanas" },
        { nome: "bytes(3500000)", tipo: "função", descricao: "3,3 MB" },
        { nome: "plural(2, \"item\")", tipo: "função", descricao: "2 itens" },
      ],
      exemplos: [
        {
          titulo: "Tudo de uma vez",
          html: `<div class="at-tabela-caixa" style="max-width: 560px">
  <table class="at-tabela">
    <thead><tr><th>Código</th><th>Resultado</th></tr></thead>
    <tbody id="tabela-formatos"></tbody>
  </table>
</div>`,
          js: `const f = Atalho.formatar;
const cincoMinutosAtras = Date.now() - 5 * 60 * 1000;

const exemplos = [
  ["f.moeda(1234.5)", f.moeda(1234.5)],
  ["f.numero(98765.432, 2)", f.numero(98765.432, 2)],
  ["f.porcentagem(0.125, 1)", f.porcentagem(0.125, 1)],
  ["f.compacto(1250000)", f.compacto(1250000)],
  ["f.data(new Date())", f.data(new Date())],
  ["f.data(new Date(), \\"long\\")", f.data(new Date(), "long")],
  ["f.relativo(cincoMinutosAtras)", f.relativo(cincoMinutosAtras)],
  ["f.bytes(3500000)", f.bytes(3500000)],
  ["f.plural(3, \\"item\\", \\"itens\\")", f.plural(3, "item", "itens")],
];

document.querySelector("#tabela-formatos").innerHTML = exemplos
  .map(([codigo, resultado]) => "<tr><td><code>" + codigo + "</code></td><td>" + resultado + "</td></tr>")
  .join("");`,
        },
      ],
    },

    {
      id: "requisitar",
      nome: "Obter dados de uma API",
      categoria: "javascript",
      resumo: "fetch com tempo limite, JSON automático e erros em português. Com o Estado, ganha os estados de carregamento, erro e resultado no ecrã sem esforço.",
      apelidos: ["fetch", "api", "ajax", "requisição", "http", "get", "post", "axios", "buscar dados", "json", "backend", "servidor", "carregar dados"],
      inspiradoEm: ["Axios (erros e tempo limite)", "TanStack Query (estados de carregamento/erro/sucesso)"],
      quandoUsar: ["Sempre que a página precisa de falar com um servidor."],
      comoFunciona:
        "Atalho.requisitar(url, opções) devolve os dados já convertidos de JSON. Se der erro, lança uma mensagem pronta para mostrar à pessoa (\"Sem ligação à internet\", \"O servidor demorou demasiado\"). Passe corpo como objeto e é convertido em JSON; passe um FormData para enviar ficheiros.",
      recursos: ["fetch", "abortable-fetch", "aborting"],
      mdn: [pt("Fetch API", "Web/API/Fetch_API"), pt("Utilizar o Fetch", "Web/API/Fetch_API/Using_Fetch"), en("AbortController", "Web/API/AbortController")],
      conectaCom: ["estado", "carregando", "validacao", "notificacao"],
      acessibilidade: ["Anuncie o resultado da pesquisa com aria-live (\"6 produtos encontrados\")."],
      api: [
        { nome: "Atalho.requisitar(url, opções)", tipo: "função", descricao: "Promise com os dados. Opções abaixo." },
        { nome: "metodo", tipo: "opção", descricao: "\"GET\" (predefinido), \"POST\", \"PUT\", \"PATCH\", \"DELETE\"." },
        { nome: "corpo", tipo: "opção", descricao: "Objeto (convertido em JSON) ou FormData." },
        { nome: "cabecalhos", tipo: "opção", descricao: "Ex.: { Authorization: \"Bearer ...\" }." },
        { nome: "tempoLimite", tipo: "opção", descricao: "Milissegundos (predefinido: 15000)." },
        { nome: "sinal", tipo: "opção", descricao: "AbortSignal para cancelar (pesquisa enquanto escreve)." },
        { nome: "erro.status / erro.dados", tipo: "propriedade", descricao: "No catch: código HTTP e resposta do servidor." },
      ],
      exemplos: [
        {
          titulo: "Pesquisa enquanto escreve",
          descricao: "Dados reais da API pública DummyJSON (preços fictícios). Tente \"phone\", \"watch\" ou \"shoes\".",
          html: `<div class="at-entrada-icone" style="max-width: 420px">
  ${i.busca}
  <input class="at-entrada" type="search" placeholder="Pesquisar produtos (em inglês)" aria-label="Pesquisar produtos" data-at-acao="catalogo.buscar" value="watch">
</div>

<p class="at-texto-suave at-texto-pequeno at-mt-4" aria-live="polite" data-at-texto="catalogo.status"></p>
<div class="at-alerta at-perigo" data-at-mostrar="catalogo.erro"><div class="at-alerta-conteudo" data-at-texto="catalogo.erro"></div></div>

<div class="at-grade" style="--min: 150px" data-at-mostrar="catalogo.carregando">
  <div class="at-esqueleto at-imagem"></div><div class="at-esqueleto at-imagem"></div><div class="at-esqueleto at-imagem"></div>
</div>

<div class="at-grade" style="--min: 150px" data-at-lista="catalogo.produtos" data-at-mostrar="!catalogo.carregando">
  <template>
    <article class="at-cartao at-produto">
      <img class="at-cartao-midia" data-at-atributos="src: thumbnail, alt: title" loading="lazy">
      <div class="at-cartao-corpo">
        <h4 class="at-produto-nome" data-at-campo="title"></h4>
        <span class="at-preco" data-at-campo="price" data-at-formato="moeda"></span>
      </div>
    </article>
  </template>
</div>`,
          js: `let controle;

const catalogo = Atalho.estado("catalogo", {
  produtos: [],
  carregando: false,
  erro: "",
  status: "",

  async buscar(termo) {
    controle?.abort(); // cancela a pesquisa anterior se a pessoa continuar a escrever
    controle = new AbortController();
    this.carregando = true;
    this.erro = "";

    try {
      const url = "https://dummyjson.com/products/search?limit=6&select=title,price,thumbnail&q=" + encodeURIComponent(termo);
      const resposta = await Atalho.requisitar(url, { sinal: controle.signal });
      this.produtos = resposta.products;
      this.status = Atalho.formatar.plural(resposta.total, "produto encontrado", "produtos encontrados");
    } catch (erro) {
      if (erro.name === "AbortError") return;
      this.produtos = [];
      this.erro = erro.message;
    }
    this.carregando = false;
  },
});

catalogo.buscar("watch");`,
        },
        {
          titulo: "Enviar (POST) e tratar erro",
          somenteCodigo: true,
          html: `<script>
  async function salvarCliente(dados) {
    try {
      const cliente = await Atalho.requisitar("/api/clientes", {
        metodo: "POST",
        corpo: dados,
        cabecalhos: { Authorization: "Bearer " + token },
      });
      Atalho.notificar("Cliente " + cliente.nome + " registado.", { tipo: "sucesso" });
    } catch (erro) {
      // erro.message já vem em português: "Verifique os dados do formulário."
      Atalho.notificar(erro.message, { tipo: "perigo" });
      console.log(erro.status, erro.dados); // 422, { campo: "email", ... }
    }
  }
</script>`,
        },
      ],
    },

    {
      id: "eventos",
      nome: "Eventos do Atalho",
      categoria: "javascript",
      resumo: "Todos os componentes avisam o que aconteceu com eventos do navegador. É a forma de ligar o Atalho ao seu código e ao seu servidor.",
      apelidos: ["eventos", "events", "addEventListener", "callback", "ouvir", "integração", "customevent", "hook"],
      inspiradoEm: ["Web Components (CustomEvent)", "Bootstrap (eventos show.bs.modal)"],
      quandoUsar: ["Guardar no servidor quando algo muda, ou reagir a um componente noutro lugar do ecrã."],
      comoFunciona:
        "São CustomEvents que borbulham até ao document. Escute no próprio elemento ou no document; os dados ficam em evento.detail.",
      recursos: ["js-modules"],
      mdn: [en("CustomEvent", "Web/API/CustomEvent"), en("Evento toggle", "Web/API/HTMLElement/toggle_event")],
      conectaCom: ["estado", "validacao", "tabela", "kanban"],
      acessibilidade: [],
      api: [
        { nome: "at:pronto", tipo: "evento", descricao: "Atalho carregado (no document)." },
        { nome: "at:enviar / at:invalido", tipo: "evento", descricao: "Formulário com data-at-validar." },
        { nome: "at:codigo-postal / at:codigo-postal-erro", tipo: "evento", descricao: "Morada pelo código postal (Portugal)." },
        { nome: "at:cep / at:cep-erro", tipo: "evento", descricao: "Endereço pelo CEP (Brasil)." },
        { nome: "at:codigo", tipo: "evento", descricao: "Código de verificação completo." },
        { nome: "at:arquivos", tipo: "evento", descricao: "Ficheiros escolhidos no upload." },
        { nome: "at:aba", tipo: "evento", descricao: "Aba trocada." },
        { nome: "at:selecao", tipo: "evento", descricao: "Linhas selecionadas na tabela." },
        { nome: "at:mover", tipo: "evento", descricao: "Cartão movido no kanban." },
        { nome: "at:cookies", tipo: "evento", descricao: "Escolha de cookies." },
        { nome: "at:tema", tipo: "evento", descricao: "Tema trocado." },
        { nome: "at:estado", tipo: "evento", descricao: "Qualquer estado mudou (detail.nome, detail.estado)." },
        { nome: "close (nativo)", tipo: "evento", descricao: "Modal/gaveta fechou. Leia dialog.returnValue." },
        { nome: "toggle (nativo)", tipo: "evento", descricao: "Popover ou <details> abriu/fechou." },
      ],
      exemplos: [
        {
          titulo: "Registo de eventos",
          descricao: "Interaja com as abas e veja o que é disparado.",
          html: `<div class="at-abas" data-at="abas">
  <button class="at-aba" aria-controls="ev-um">Primeira</button>
  <button class="at-aba" aria-controls="ev-dois">Segunda</button>
</div>
<div class="at-painel" id="ev-um">Conteúdo um</div>
<div class="at-painel" id="ev-dois">Conteúdo dois</div>
<pre id="registro-eventos" class="at-superficie" style="font-size: 12px; min-height: 80px; margin: 0"></pre>`,
          js: `const registro = document.querySelector("#registro-eventos");

document.addEventListener("at:aba", (evento) => {
  registro.textContent += "at:aba → " + evento.detail.aba.textContent + "\\n";
});`,
        },
      ],
    },

    /* ======================================================================
       RECEITAS
       ====================================================================== */
    {
      id: "receita-loja",
      nome: "Loja com carrinho",
      categoria: "receitas",
      resumo: "Montra, carrinho na gaveta, contador na barra, total, quantidade e notificação, tudo ligado pelo Estado e guardado no navegador.",
      apelidos: ["loja", "e-commerce", "carrinho", "carrinho de compras", "shopping cart", "comprar", "checkout", "loja online", "vitrine"],
      inspiradoEm: ["Amazon", "Zalando", "Uber Eats (cesto lateral)"],
      quandoUsar: ["Ponto de partida para qualquer loja ou menu digital."],
      comoFunciona:
        "Dois estados: vitrine (os produtos) e carrinho (os itens, guardado no navegador). O botão Comprar está dentro da lista da vitrine, por isso a ação carrinho.adicionar recebe o produto automaticamente. Contador, gaveta, total e botão de finalizar só leem do carrinho: nenhum código atualiza o ecrã diretamente.",
      recursos: ["dialog", "invoker-commands", "template", "localstorage"],
      mdn: [],
      conectaCom: ["produto", "gaveta", "barra", "estado", "notificacao", "formatar"],
      acessibilidade: ["O contador do botão do carrinho tem o número no aria-label, atualizado junto."],
      api: [],
      exemplos: [
        {
          titulo: "Loja completa",
          html: `<header class="at-barra" style="position: static">
  <div class="at-barra-conteudo" style="padding-inline: 16px">
    <span class="at-barra-marca">◆ Loja Exemplo</span>
    <div class="at-barra-acoes">
      <button class="at-botao at-icone at-contador-selo" commandfor="gaveta-carrinho" command="show-modal" aria-label="Abrir carrinho">
        ${i.carrinho}
        <span data-contador data-at-texto="carrinho.quantidade" data-at-mostrar="carrinho.quantidade"></span>
      </button>
    </div>
  </div>
</header>

<div class="at-grade at-mt-6" style="--min: 190px" data-at-lista="vitrine.produtos">
  <template>
    <article class="at-cartao at-produto">
      <img class="at-cartao-midia" data-at-atributos="src: imagem, alt: nome" loading="lazy">
      <div class="at-cartao-corpo">
        <h3 class="at-produto-nome" data-at-campo="nome"></h3>
        <span class="at-preco-antigo" data-at-campo="precoAntigo" data-at-formato="moeda"></span>
        <span class="at-preco" data-at-campo="preco" data-at-formato="moeda"></span>
        <button class="at-botao at-primario at-bloco" data-at-acao="carrinho.adicionar">Comprar</button>
      </div>
    </article>
  </template>
</div>

<dialog class="at-gaveta" id="gaveta-carrinho" aria-labelledby="carrinho-titulo">
  <div class="at-modal-cabecalho">
    <h3 id="carrinho-titulo">O seu carrinho</h3>
    <button class="at-botao at-icone at-fantasma at-pequeno" commandfor="gaveta-carrinho" command="close" aria-label="Fechar">${i.fechar}</button>
  </div>

  <div class="at-modal-corpo">
    <div class="at-vazio" data-at-mostrar="carrinho.vazio">
      ${i.vazio}
      <h3>O seu carrinho está vazio</h3>
      <p>Que tal espreitar as ofertas?</p>
    </div>

    <ul class="at-pilha" style="--at-gap: 12px; list-style: none; padding: 0; margin: 0" data-at-lista="carrinho.itens">
      <template>
        <li class="at-linha at-topo">
          <img data-at-atributos="src: imagem, alt: nome" width="64" height="64" style="object-fit: contain; background: #fff; border-radius: 8px">
          <div class="at-cresce">
            <div class="at-texto-pequeno" data-at-campo="nome"></div>
            <strong data-at-campo="subtotal" data-at-formato="moeda"></strong>
            <div class="at-linha at-mt-2" style="--at-gap: 4px">
              <button class="at-botao at-icone at-pequeno" data-at-acao="carrinho.diminuir" aria-label="Diminuir">−</button>
              <span class="at-numero" style="min-width: 2ch; text-align: center" data-at-campo="quantidade"></span>
              <button class="at-botao at-icone at-pequeno" data-at-acao="carrinho.aumentar" aria-label="Aumentar">+</button>
              <button class="at-botao at-link at-pequeno" style="margin-left: auto" data-at-acao="carrinho.remover">Remover</button>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </div>

  <div class="at-modal-rodape" style="flex-direction: column; align-items: stretch">
    <div class="at-linha at-entre">
      <span>Total</span>
      <strong class="at-titulo-4 at-mb-0" data-at-texto="carrinho.total" data-at-formato="moeda" aria-live="polite"></strong>
    </div>
    <button class="at-botao at-primario at-grande at-bloco" data-at-desabilitar="carrinho.vazio" data-at-acao="carrinho.finalizar">Finalizar compra</button>
  </div>
</dialog>`,
          js: `Atalho.estado("vitrine", {
  produtos: ${produtosJSON},
});

const recalcular = (itens) => itens.map((item) => ({ ...item, subtotal: item.preco * item.quantidade }));

Atalho.estado("carrinho", {
  itens: [],

  get quantidade() { return this.itens.reduce((soma, item) => soma + item.quantidade, 0); },
  get total() { return this.itens.reduce((soma, item) => soma + item.subtotal, 0); },
  get vazio() { return this.itens.length === 0; },

  adicionar(produto) {
    const existe = this.itens.find((item) => item.id === produto.id);
    this.itens = recalcular(existe
      ? this.itens.map((item) => (item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item))
      : [...this.itens, { ...produto, quantidade: 1 }]);

    Atalho.notificar(produto.nome, {
      tipo: "sucesso",
      titulo: "Adicionado ao carrinho",
      acao: { texto: "Ver carrinho", aoClicar: () => document.querySelector("#gaveta-carrinho").showModal() },
    });
  },
  aumentar(item) {
    this.itens = recalcular(this.itens.map((i) => (i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i)));
  },
  diminuir(item) {
    this.itens = recalcular(this.itens
      .map((i) => (i.id === item.id ? { ...i, quantidade: i.quantidade - 1 } : i))
      .filter((i) => i.quantidade > 0));
  },
  remover(item) { this.itens = this.itens.filter((i) => i.id !== item.id); },
  finalizar() {
    Atalho.notificar("Total de " + Atalho.formatar.moeda(this.total) + ". Agora é só ligar ao seu pagamento!", { titulo: "Encomenda criada" });
    this.itens = [];
    document.querySelector("#gaveta-carrinho").close();
  },
}, { salvar: true });`,
        },
      ],
    },

    {
      id: "receita-cadastro",
      nome: "Registo com morada automática",
      categoria: "receitas",
      resumo: "Registo completo: dados pessoais com NIF e telemóvel, morada automática pelo código postal, palavra-passe com força, termos e confirmação.",
      apelidos: ["cadastro", "formulário de registo", "registro", "sign up", "criar conta", "registo de cliente", "endereço"],
      inspiradoEm: ["Worten e Fnac (registo)", "Bancos digitais (abertura de conta)"],
      quandoUsar: ["Registo de clientes, checkout como visitante, ficha de matrícula."],
      comoFunciona:
        "Um único formulário com data-at-validar junta Campos, Máscaras, Morada pelo código postal, Palavra-passe e Validação. Ao enviar, o botão mostra o estado de carregamento e um modal confirma, usando o evento at:enviar.",
      recursos: ["constraint-validation", "fetch", "dialog"],
      mdn: [],
      conectaCom: ["campo", "mascaras", "cep", "senha", "validacao", "modal"],
      acessibilidade: ["Os grupos de campos usam <fieldset> e <legend> para o leitor de ecrã anunciar a secção."],
      api: [],
      exemplos: [
        {
          titulo: "Ficha de registo",
          html: `<div class="at-cartao" style="max-width: 760px; margin-inline: auto">
  <div class="at-cartao-corpo" style="border-bottom: 1px solid var(--at-borda)">
    <h2 class="at-titulo-3 at-mb-0">Crie a sua conta</h2>
    <p class="at-texto-suave at-mb-0">Leva menos de 2 minutos: a morada preenche-se sozinha pelo código postal.</p>
  </div>
  <form id="form-cadastro" data-at-validar class="at-cartao-corpo at-pilha" style="--at-gap: 28px">
    <fieldset class="at-formulario" style="border: 0; padding: 0; margin: 0">
      <legend class="at-titulo-4">Os seus dados</legend>
      <div class="at-campo">
        <label class="at-rotulo" for="cad-nome">Nome completo</label>
        <input class="at-entrada" id="cad-nome" name="nome" required minlength="5" autocomplete="name">
      </div>
      <div class="at-campo at-meio">
        <label class="at-rotulo" for="cad-nif">NIF</label>
        <input class="at-entrada" id="cad-nif" name="nif" required data-at-mascara="nif" inputmode="numeric">
      </div>
      <div class="at-campo at-meio">
        <label class="at-rotulo" for="cad-nasc">Data de nascimento</label>
        <input class="at-entrada" id="cad-nasc" name="nascimento" type="date" required max="2010-12-31" autocomplete="bday">
      </div>
      <div class="at-campo at-meio">
        <label class="at-rotulo" for="cad-email">E-mail</label>
        <input class="at-entrada" id="cad-email" name="email" type="email" required autocomplete="email">
      </div>
      <div class="at-campo at-meio">
        <label class="at-rotulo" for="cad-cel">Telemóvel</label>
        <input class="at-entrada" id="cad-cel" name="telemovel" type="tel" required data-at-mascara="telemovel" autocomplete="tel-national">
      </div>
    </fieldset>

    <fieldset class="at-formulario" style="border: 0; border-top: 1px solid var(--at-borda); padding: 4px 0 0; margin: 0">
      <legend class="at-titulo-4">Morada</legend>
      <div class="at-campo at-terco">
        <label class="at-rotulo" for="cad-cp">Código postal</label>
        <input class="at-entrada" id="cad-cp" name="codigo_postal" required data-at-mascara="codigo-postal" data-at-codigo-postal autocomplete="postal-code" placeholder="0000-000">
      </div>
      <div class="at-campo at-dois-tercos">
        <label class="at-rotulo" for="cad-rua">Rua</label>
        <input class="at-entrada" id="cad-rua" name="rua" required data-at-cp-preencher="rua" autocomplete="address-line1">
      </div>
      <div class="at-campo at-terco">
        <label class="at-rotulo" for="cad-num">N.º</label>
        <input class="at-entrada" id="cad-num" name="numero" required data-at-cp-foco>
      </div>
      <div class="at-campo at-dois-tercos">
        <label class="at-rotulo" for="cad-comp">Andar / porta <span class="at-opcional">(opcional)</span></label>
        <input class="at-entrada" id="cad-comp" name="andar" autocomplete="address-line2">
      </div>
      <div class="at-campo at-meio">
        <label class="at-rotulo" for="cad-localidade">Localidade</label>
        <input class="at-entrada" id="cad-localidade" name="localidade" required data-at-cp-preencher="localidade" autocomplete="address-level2">
      </div>
      <div class="at-campo at-meio">
        <label class="at-rotulo" for="cad-distrito">Distrito</label>
        <input class="at-entrada" id="cad-distrito" name="distrito" required data-at-cp-preencher="distrito" autocomplete="address-level1">
      </div>
    </fieldset>

    <fieldset class="at-formulario" style="border: 0; border-top: 1px solid var(--at-borda); padding: 4px 0 0; margin: 0">
      <legend class="at-titulo-4">Acesso</legend>
      <div class="at-campo at-meio">
        <label class="at-rotulo" for="cad-senha">Palavra-passe</label>
        <div class="at-senha">
          <input class="at-entrada" id="cad-senha" name="senha" type="password" required minlength="8" autocomplete="new-password">
          <button type="button" data-at-ver-senha>Mostrar</button>
        </div>
        <div class="at-forca" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        <span class="at-forca-texto" aria-live="polite"></span>
      </div>
      <div class="at-campo at-meio">
        <label class="at-rotulo" for="cad-senha2">Confirme a palavra-passe</label>
        <input class="at-entrada" id="cad-senha2" type="password" required data-at-igual="#cad-senha" data-msg-igual="As palavras-passe não são iguais." autocomplete="new-password">
      </div>
      <div class="at-campo">
        <label class="at-check">
          <input type="checkbox" name="termos" required data-msg-obrigatorio="Aceite os termos para continuar.">
          <span>Li e aceito os <a href="#">termos de uso</a> e a <a href="#">política de privacidade</a>.</span>
        </label>
      </div>
    </fieldset>

    <button class="at-botao at-primario at-grande at-bloco">Criar a minha conta</button>
    <p class="at-texto-pequeno at-texto-suave at-texto-centro at-mb-0">Já tem conta? <a href="#">Entrar</a></p>
  </form>
</div>

<dialog class="at-modal at-pequeno" id="modal-cadastro">
  <div class="at-modal-corpo at-texto-centro">
    <div class="at-titulo-1" aria-hidden="true">🎉</div>
    <h3 class="at-titulo-4">Conta criada!</h3>
    <p class="at-texto-suave" id="cadastro-mensagem"></p>
    <button class="at-botao at-primario at-bloco" commandfor="modal-cadastro" command="close">Começar</button>
  </div>
</dialog>`,
          js: `document.querySelector("#form-cadastro").addEventListener("at:enviar", (evento) => {
  const { dados, botao, formulario } = evento.detail;
  botao.setAttribute("aria-busy", "true");

  // Troque o setTimeout pela sua API:
  // await Atalho.requisitar("/api/clientes", { metodo: "POST", corpo: dados });
  setTimeout(() => {
    botao.removeAttribute("aria-busy");
    const primeiroNome = dados.nome.split(" ")[0];
    document.querySelector("#cadastro-mensagem").textContent =
      "Bem-vindo(a), " + primeiroNome + ". Enviámos a confirmação para " + dados.email + ".";
    document.querySelector("#modal-cadastro").showModal();
    formulario.reset();
  }, 1200);
});`,
        },
      ],
    },

    {
      id: "receita-painel",
      nome: "Painel administrativo",
      categoria: "receitas",
      resumo: "Menu lateral, indicadores, pesquisa, tabela com ordenação, ações por linha e exportação. O ecrã que todo sistema de empresa tem.",
      apelidos: ["dashboard", "painel", "admin", "sistema", "erp", "crm", "backoffice", "painel de controle"],
      inspiradoEm: ["Shopify Admin", "Stripe Dashboard", "Linear"],
      quandoUsar: ["Base para sistemas internos, ERPs, CRMs e painéis de loja."],
      comoFunciona: "Junta Menu lateral, Indicadores, Tabela de dados, Menu suspenso e Trilha. Nenhuma linha de JavaScript além das ações específicas do seu negócio.",
      recursos: ["grid", "popover", "has"],
      mdn: [],
      conectaCom: ["lateral", "indicador", "tabela", "menu-suspenso", "trilha", "comando"],
      acessibilidade: ["Cada menu de linha tem aria-label com o nome do item (\"Ações da encomenda 1048\")."],
      api: [],
      exemplos: [
        {
          titulo: "Encomendas",
          html: `<div class="at-app" style="min-height: 560px">
  <aside class="at-lateral" style="height: auto">
    <div class="at-lateral-topo"><span class="at-barra-marca">◆ Gestão</span></div>
    <nav aria-label="Menu principal">
      <a href="#" class="at-lateral-link">${i.casa} Início</a>
      <a href="#" class="at-lateral-link" aria-current="page">${i.caixa} Pedidos <span class="at-selo at-primario">3</span></a>
      <a href="#" class="at-lateral-link">${i.usuarios} Clientes</a>
      <a href="#" class="at-lateral-link">${i.grafico} Relatórios</a>
    </nav>
  </aside>

  <main class="at-app-conteudo at-pilha" style="--at-gap: 24px">
    <div>
      <nav class="at-trilha" aria-label="Você está em"><ol><li><a href="#">Início</a></li><li aria-current="page">Pedidos</li></ol></nav>
      <div class="at-linha at-entre at-mt-2">
        <h2 class="at-titulo-3 at-mb-0">Encomendas</h2>
        <button class="at-botao at-primario" data-at-notificar="Abra aqui o formulário de novo pedido" data-at-tipo="info">Novo pedido</button>
      </div>
    </div>

    <div class="at-colunas-3" style="--at-gap: 16px">
      <div class="at-indicador"><span class="at-indicador-rotulo">Hoje</span><strong class="at-indicador-valor">3840 €</strong><span class="at-indicador-variacao" data-direcao="sobe">↑ 18% vs. ontem</span></div>
      <div class="at-indicador"><span class="at-indicador-rotulo">A enviar</span><strong class="at-indicador-valor">3</strong><span class="at-indicador-variacao">1 atrasada</span></div>
      <div class="at-indicador"><span class="at-indicador-rotulo">Ticket médio</span><strong class="at-indicador-valor">412 €</strong><span class="at-indicador-variacao" data-direcao="desce">↓ 2% vs. setembro</span></div>
    </div>

    <div>
      <div class="at-tabela-ferramentas">
        <div class="at-entrada-icone at-cresce" style="max-width: 300px">
          ${i.busca}
          <input class="at-entrada" id="painel-busca" type="search" placeholder="Pesquisar encomendas" aria-label="Pesquisar encomendas">
        </div>
        <button class="at-botao" data-at-exportar="#painel-tabela" data-arquivo="pedidos.csv">${i.baixar} Exportar</button>
      </div>
      <div class="at-tabela-caixa">
        <table class="at-tabela" id="painel-tabela" data-at="tabela" data-filtro="#painel-busca">
          <thead><tr><th data-ordenar="numero">Encomenda</th><th data-ordenar>Cliente</th><th>Estado</th><th data-ordenar="numero" class="at-direita">Total</th><th data-nao-exportar><span class="at-sr">Ações</span></th></tr></thead>
          <tbody>
            ${[
              ["1048", "Maria Oliveira", "sucesso", "Paga", 1250],
              ["1047", "João Santos", "aviso", "A enviar", 389.9],
              ["1046", "Ana Costa", "perigo", "Atrasada", 89.9],
              ["1045", "Lucas Pereira", "info", "Enviada", 2100],
            ]
              .map(
                ([numero, cliente, cor, status, total]) => `<tr>
              <td>#${numero}</td><td>${cliente}</td><td><span class="at-selo at-${cor}">${status}</span></td>
              <td class="at-direita" data-valor="${total}">${new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(total)}</td>
              <td class="at-encolher" data-nao-exportar>
                <button class="at-botao at-icone at-fantasma at-pequeno" popovertarget="acoes-${numero}" aria-label="Ações do pedido ${numero}">${i.mais}</button>
                <div id="acoes-${numero}" popover class="at-menu" data-alinhar="fim">
                  <button class="at-menu-item">Ver detalhes</button>
                  <button class="at-menu-item" data-at-notificar="Etiqueta do pedido ${numero} gerada">Gerar etiqueta</button>
                  <hr class="at-menu-separador">
                  <button class="at-menu-item at-perigo">Cancelar encomenda</button>
                </div>
              </td>
            </tr>`
              )
              .join("\n            ")}
          </tbody>
        </table>
      </div>
    </div>
  </main>
</div>`,
        },
      ],
    },

    {
      id: "receita-login",
      nome: "Login em duas etapas",
      categoria: "receitas",
      resumo: "E-mail e palavra-passe, depois o código de verificação, depois a confirmação. Os ecrãs trocam pelo Estado, sem recarregar a página.",
      apelidos: ["login", "entrar", "autenticação", "2fa", "dois fatores", "verificação em duas etapas", "sign in", "acesso"],
      inspiradoEm: ["Google (verificação em duas etapas)", "Revolut e bancos digitais"],
      quandoUsar: ["Ecrãs de login com segurança extra."],
      comoFunciona:
        "Um estado guarda a etapa atual; cada ecrã tem data-at-mostrar com um getter (login.naSenha, login.noCodigo, login.pronto). O formulário chama login.entrar e o código dispara at:codigo, que chama login.verificar.",
      recursos: ["constraint-validation"],
      mdn: [],
      conectaCom: ["validacao", "senha", "codigo", "etapas", "estado"],
      acessibilidade: ["Ao trocar de etapa, o foco vai para o primeiro campo do novo ecrã."],
      api: [],
      exemplos: [
        {
          titulo: "Entrar",
          descricao: "Use qualquer e-mail, palavra-passe com 8+ caracteres e o código 123456.",
          html: `<div class="at-cartao" style="max-width: 400px; margin-inline: auto">
  <div class="at-cartao-corpo at-pilha">
    <ol class="at-etapas">
      <li id="passo-1" aria-current="step">Palavra-passe</li>
      <li id="passo-2">Código</li>
      <li id="passo-3">Pronto</li>
    </ol>

    <form class="at-pilha" data-at-validar data-at-acao="login.entrar" data-at-mostrar="login.naSenha">
      <h3 class="at-titulo-4 at-mb-0">Entrar na sua conta</h3>
      <div class="at-campo">
        <label class="at-rotulo" for="login-email">E-mail</label>
        <input class="at-entrada" id="login-email" name="email" type="email" required autocomplete="username">
      </div>
      <div class="at-campo">
        <label class="at-rotulo" for="login-senha">Palavra-passe</label>
        <div class="at-senha">
          <input class="at-entrada" id="login-senha" name="senha" type="password" required minlength="8" autocomplete="current-password">
          <button type="button" data-at-ver-senha>Mostrar</button>
        </div>
      </div>
      <button class="at-botao at-primario at-bloco" id="login-entrar">Continuar</button>
    </form>

    <div class="at-pilha" data-at-mostrar="login.noCodigo" hidden>
      <h3 class="at-titulo-4 at-mb-0">Escreva o código</h3>
      <p class="at-texto-suave at-mb-0">Enviámos para <strong data-at-texto="login.email"></strong>.</p>
      <div class="at-codigo" data-at="codigo" id="login-codigo"><input><input><input><input><input><input></div>
      <button class="at-botao at-link" data-at-acao="login.voltar">Usar outro e-mail</button>
    </div>

    <div class="at-texto-centro" data-at-mostrar="login.pronto" hidden>
      <div class="at-titulo-1" aria-hidden="true">✓</div>
      <h3 class="at-titulo-4">Tudo certo!</h3>
      <p class="at-texto-suave">Entrou como <span data-at-texto="login.email"></span>.</p>
      <button class="at-botao at-bloco" data-at-acao="login.voltar">Sair</button>
    </div>
  </div>
</div>`,
          js: `const passos = [...document.querySelectorAll("#passo-1, #passo-2, #passo-3")];

const login = Atalho.estado("login", {
  etapa: 0,
  email: "",
  get naSenha() { return this.etapa === 0; },
  get noCodigo() { return this.etapa === 1; },
  get pronto() { return this.etapa === 2; },

  entrar(dados) {
    this.email = dados.email;
    this.etapa = 1;
  },
  verificar(codigo) {
    const campo = document.querySelector("#login-codigo");
    if (codigo !== "123456") {
      campo.setAttribute("aria-invalid", "true");
      return Atalho.notificar("Código incorreto.", { tipo: "perigo" });
    }
    this.etapa = 2;
  },
  voltar() { this.etapa = 0; },
});

document.querySelector("#login-codigo").addEventListener("at:codigo", (evento) => login.verificar(evento.detail.valor));

// Atualiza o indicador de etapas e o foco sempre que a etapa muda
let etapaAnterior = 0;
Atalho.observar("login", ({ etapa }) => {
  passos.forEach((passo, indice) => {
    if (indice < etapa) passo.dataset.estado = "feito"; else delete passo.dataset.estado;
    if (indice === etapa) passo.setAttribute("aria-current", "step"); else passo.removeAttribute("aria-current");
  });
  const telaAtual = document.querySelector("[data-at-mostrar='login." + ["naSenha", "noCodigo", "pronto"][etapa] + "']");
  if (etapa !== etapaAnterior) telaAtual?.querySelector("input, button")?.focus();
  etapaAnterior = etapa;
});`,
        },
      ],
    }
  );
})();
