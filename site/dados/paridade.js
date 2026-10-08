/* Componentes da versão 1.2: tudo o que o Bootstrap tem, grátis e em português */
(function () {
  const { pt, en, icone: i } = window.ATALHO_DOCS.util;
  const seta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  window.ATALHO_DOCS.componentes.push(
    {
      id: "lista-grupo",
      nome: "Lista agrupada (list group)",
      categoria: "dados",
      novo: true,
      resumo: "Lista em caixa, com itens separados por linha: links de menu, configurações, contatos ou passos numerados.",
      apelidos: ["list group", "lista", "lista de links", "menu em lista", "lista de configurações", "lista numerada", "itens"],
      inspiradoEm: ["Ajustes do iPhone", "Configurações do GitHub", "Bootstrap (list group)"],
      quandoUsar: ["Menus de configurações e listas de opções clicáveis.", "Listas curtas com um selo ou ação no fim de cada linha."],
      evitar: ["Dados com várias colunas: use a Tabela.", "Navegação principal do site: use a Barra ou o Menu lateral."],
      comoFunciona:
        "Uma .at-lista-grupo com itens .at-lista-item. Os itens podem ser texto, links (<a>) ou botões (<button>): links e botões ganham destaque ao passar o mouse e foco visível no teclado. O item atual usa aria-current e o desativado, aria-disabled=\"true\". O último elemento do item (selo, número, seta) vai sozinho para a direita.",
      recursos: ["flexbox"],
      mdn: [pt("Elemento <ul>", "Web/HTML/Reference/Elements/ul"), en("aria-current", "Web/Accessibility/ARIA/Reference/Attributes/aria-current")],
      conectaCom: ["selo", "lateral", "avatar", "menu-suspenso"],
      acessibilidade: ["Use <ul> com <li> para o leitor de tela anunciar quantos itens existem.", "O item atual tem aria-current: o leitor de tela diz \"página atual\", não só a cor."],
      api: [
        { nome: "at-lista-grupo", tipo: "classe", descricao: "A caixa da lista (ul ou div)." },
        { nome: "at-lista-item", tipo: "classe", descricao: "Cada linha. Pode ser li, a ou button." },
        { nome: "aria-current=\"page\"", tipo: "atributo", descricao: "Marca o item atual (fica destacado)." },
        { nome: "aria-disabled=\"true\"", tipo: "atributo", descricao: "Item desativado." },
        { nome: "at-numerada", tipo: "modificador", descricao: "Numera os itens automaticamente." },
        { nome: "at-sem-borda", tipo: "modificador", descricao: "Sem caixa externa, só as linhas." },
      ],
      exemplos: [
        {
          titulo: "Menu de configurações",
          html: `<ul class="at-lista-grupo" style="max-width: 380px">
  <li><a class="at-lista-item" href="#" aria-current="page">${i.usuarios} Perfil</a></li>
  <li><a class="at-lista-item" href="#">${i.sino} Notificações <span class="at-selo at-perigo">3</span></a></li>
  <li><a class="at-lista-item" href="#">${i.ajustes} Preferências</a></li>
  <li><a class="at-lista-item" href="#" aria-disabled="true">${i.caixa} Faturas (em breve)</a></li>
</ul>`,
        },
        {
          titulo: "Passos numerados",
          html: `<ol class="at-lista-grupo at-numerada" style="max-width: 420px">
  <li class="at-lista-item">Crie a sua conta grátis</li>
  <li class="at-lista-item">Confirme o e-mail</li>
  <li class="at-lista-item">Escolha um modelo e publique</li>
</ol>`,
        },
      ],
    },

    {
      id: "balao",
      nome: "Balão informativo (popover)",
      categoria: "sobreposicoes",
      novo: true,
      resumo: "Caixa que abre ao clicar, ao lado do botão, com um título e um texto mais longo que uma dica. Fecha com Esc ou clicando fora.",
      apelidos: ["popover", "balão", "explicação", "saiba mais", "ajuda contextual", "info", "o que é isso"],
      inspiradoEm: ["Nubank (\"O que é isso?\" nas taxas)", "Google Ads (ícones de ajuda)", "Bootstrap (popover)"],
      quandoUsar: ["Explicar um termo ou taxa sem tirar a pessoa da página.", "Conteúdo um pouco maior que uma Dica, com título."],
      evitar: ["Formulários inteiros: use um Modal ou uma Gaveta.", "Texto essencial para concluir uma tarefa: deixe-o visível na página."],
      comoFunciona:
        "Usa o popover nativo do navegador: o botão com popovertarget=\"id\" abre a caixa .at-balao com popover. O Atalho posiciona o balão ao lado do botão (acima, se não couber embaixo) e reposiciona ao rolar a página. Fecha com Esc, clicando fora ou no botão de novo, sem uma linha de JavaScript seu.",
      recursos: ["popover"],
      mdn: [en("API Popover", "Web/API/Popover_API")],
      conectaCom: ["dica", "botao", "planos"],
      acessibilidade: ["O navegador liga o botão ao balão: o leitor de tela anuncia que ele abre um conteúdo e se está aberto.", "Esc fecha e o foco volta ao botão."],
      api: [
        { nome: "popovertarget=\"id\"", tipo: "atributo", descricao: "No botão que abre o balão." },
        { nome: "at-balao + popover", tipo: "classe", descricao: "A caixa do balão." },
        { nome: "at-balao-titulo", tipo: "classe", descricao: "Título em negrito dentro do balão." },
        { nome: "data-alinhar=\"fim\"", tipo: "atributo", descricao: "Alinha pela borda direita do botão." },
      ],
      exemplos: [
        {
          titulo: "Explicar uma taxa",
          html: `<p class="at-linha">
  Taxa de entrega: <strong>R$ 7,90</strong>
  <button class="at-botao at-icone at-pequeno at-fantasma" popovertarget="balao-taxa" aria-label="Como a taxa é calculada?">${i.info}</button>
</p>
<div class="at-balao" id="balao-taxa" popover>
  <strong class="at-balao-titulo">Como a taxa é calculada?</strong>
  <p>Pela distância entre a loja e o seu CEP. Pedidos acima de R$ 99 têm entrega grátis.</p>
</div>`,
        },
      ],
    },

    {
      id: "rotulo-flutuante",
      nome: "Rótulo flutuante (floating label)",
      categoria: "formularios",
      novo: true,
      resumo: "O rótulo fica dentro do campo e sobe quando a pessoa começa a digitar. Visual compacto de telas de login de bancos e apps.",
      apelidos: ["floating label", "label flutuante", "rótulo dentro do campo", "material input", "placeholder que sobe"],
      inspiradoEm: ["Login do Google", "Itaú e Nubank (apps)", "Material Design"],
      quandoUsar: ["Formulários curtos, como login e cadastro, em que o espaço é pouco."],
      evitar: ["Formulários longos com muitos campos: o rótulo comum acima do campo lê mais rápido."],
      comoFunciona:
        "Envolva o campo e o rótulo em .at-flutuante, com o <label> depois do campo e placeholder=\" \" (um espaço). O rótulo sobe sozinho com o foco ou quando há texto, só com CSS. Funciona com input, select e textarea.",
      recursos: [],
      mdn: [en("Pseudo-classe :placeholder-shown", "Web/CSS/Reference/Selectors/:placeholder-shown")],
      conectaCom: ["campo", "validacao", "senha"],
      acessibilidade: ["O rótulo é um <label> de verdade, ligado ao campo pelo for: o leitor de tela lê o nome mesmo com o campo vazio."],
      api: [
        { nome: "at-flutuante", tipo: "classe", descricao: "Envolve o campo (.at-entrada) e o <label>, nessa ordem." },
        { nome: "placeholder=\" \"", tipo: "atributo", descricao: "Obrigatório: é o que permite ao CSS saber se há texto." },
      ],
      exemplos: [
        {
          titulo: "Login compacto",
          html: `<form class="at-pilha" style="max-width: 360px" data-at-validar>
  <div class="at-flutuante">
    <input class="at-entrada" id="flut-email" type="email" placeholder=" " required autocomplete="username">
    <label for="flut-email">E-mail</label>
  </div>
  <div class="at-flutuante">
    <input class="at-entrada" id="flut-senha" type="password" placeholder=" " required minlength="8" autocomplete="current-password">
    <label for="flut-senha">Senha</label>
  </div>
  <div class="at-flutuante">
    <select class="at-entrada" id="flut-pais"><option>Brasil</option><option>Portugal</option></select>
    <label for="flut-pais">País</label>
  </div>
  <button class="at-botao at-primario">Entrar</button>
</form>`,
        },
      ],
    },

    {
      id: "recolher",
      nome: "Recolher e expandir (collapse)",
      categoria: "acoes",
      novo: true,
      resumo: "Um botão mostra e esconde um bloco com animação suave: filtros, detalhes do pedido, \"ler mais\".",
      apelidos: ["collapse", "expandir", "recolher", "mostrar mais", "ler mais", "esconder", "toggle", "mostrar detalhes"],
      inspiradoEm: ["Mercado Livre (\"Ver detalhes do pedido\")", "Filtros de busca no celular", "Bootstrap (collapse)"],
      quandoUsar: ["Detalhes opcionais que ocupariam muito espaço.", "Filtros que no celular ficam fechados por padrão."],
      evitar: ["Várias perguntas e respostas: use a Sanfona, que já vem pronta para isso."],
      comoFunciona:
        "O botão com data-at-alternar=\"#id\" abre e fecha o bloco .at-recolher, que precisa ter um único filho. A altura anima sozinha (sem medir pixels no JavaScript), e o conteúdo fechado fica oculto também para o teclado e o leitor de tela. Para começar aberto, use data-aberto no bloco e aria-expanded=\"true\" no botão.",
      recursos: ["grid"],
      mdn: [en("aria-expanded", "Web/Accessibility/ARIA/Reference/Attributes/aria-expanded")],
      conectaCom: ["sanfona", "botao", "tabela"],
      acessibilidade: ["O botão atualiza aria-expanded: o leitor de tela anuncia \"recolhido\" ou \"expandido\".", "Fechado, o conteúdo fica com visibility: hidden e não recebe foco por Tab."],
      api: [
        { nome: "data-at-alternar=\"#id\"", tipo: "atributo", descricao: "No botão. Abre e fecha o bloco." },
        { nome: "at-recolher", tipo: "classe", descricao: "O bloco que abre e fecha (com um único filho)." },
        { nome: "data-aberto", tipo: "atributo", descricao: "Estado aberto. Coloque para começar aberto." },
      ],
      exemplos: [
        {
          titulo: "Detalhes do pedido",
          html: `<div class="at-superficie" style="max-width: 420px">
  <div class="at-linha at-entre">
    <strong>Pedido #1048 · R$ 189,90</strong>
    <button class="at-botao at-pequeno" data-at-alternar="#detalhes-pedido" aria-expanded="false" aria-controls="detalhes-pedido">Ver detalhes</button>
  </div>
  <div class="at-recolher" id="detalhes-pedido">
    <div>
      <ul class="at-mt-4 at-mb-0" style="padding-left: 1.2rem">
        <li>Tênis de corrida · R$ 159,90</li>
        <li>Frete · R$ 30,00</li>
        <li>Pagamento: Pix</li>
      </ul>
    </div>
  </div>
</div>`,
        },
      ],
    },

    {
      id: "indice",
      nome: "Índice que acompanha a leitura (scrollspy)",
      categoria: "navegacao",
      novo: true,
      resumo: "Lista de seções ao lado do texto que destaca sozinha a parte que a pessoa está lendo. Padrão de documentação e artigos longos.",
      apelidos: ["scrollspy", "índice", "sumário", "nesta página", "table of contents", "toc", "menu da página"],
      inspiradoEm: ["MDN (\"Nesta página\")", "Stripe Docs", "Bootstrap (scrollspy)"],
      quandoUsar: ["Páginas longas com várias seções: documentação, termos, artigos."],
      evitar: ["Páginas curtas: o índice ocupa espaço sem ajudar."],
      comoFunciona:
        "Um <nav class=\"at-indice\" data-at=\"indice\"> com links para os ids das seções. O Atalho observa as seções enquanto a página rola (IntersectionObserver, sem cálculo a cada pixel) e marca o link da seção atual com aria-current. Envolva o índice em .at-indice-pai para ele ficar fixo ao rolar. Se as seções estiverem dentro de uma caixa com rolagem própria (um painel, um modal), o Atalho percebe sozinho e observa a caixa.",
      recursos: ["intersection-observer", "sticky-positioning"],
      mdn: [en("API Intersection Observer", "Web/API/Intersection_Observer_API")],
      conectaCom: ["trilha", "voltar-topo", "lateral"],
      acessibilidade: ["O link atual recebe aria-current=\"location\": o leitor de tela anuncia em que parte a pessoa está."],
      api: [
        { nome: "data-at=\"indice\"", tipo: "atributo", descricao: "No <nav class=\"at-indice\"> com os links." },
        { nome: "data-margem", tipo: "atributo", descricao: "Faixa da tela que conta como \"lendo\" (padrão: -20% 0px -60% 0px)." },
        { nome: "data-raiz=\"#seletor\"", tipo: "atributo", descricao: "Caixa com rolagem própria a observar. Sem ele, o Atalho detecta sozinho." },
        { nome: "at-indice-pai", tipo: "classe", descricao: "Deixa o índice fixo enquanto a página rola." },
      ],
      exemplos: [
        {
          titulo: "Termos de uso com índice",
          html: `<div class="at-grade-12" style="max-height: 280px; overflow: auto">
  <div class="at-col-tablet-4">
    <div class="at-indice-pai">
      <nav class="at-indice" data-at="indice" aria-label="Nesta página">
        <a href="#termos-uso">Uso do serviço</a>
        <a href="#termos-pagamento">Pagamento</a>
        <a href="#termos-cancelamento">Cancelamento</a>
      </nav>
    </div>
  </div>
  <div class="at-col-tablet-8">
    <h3 id="termos-uso" class="at-titulo-4">Uso do serviço</h3>
    <p style="min-height: 180px">Você pode usar o serviço para fins pessoais e comerciais, respeitando a lei.</p>
    <h3 id="termos-pagamento" class="at-titulo-4">Pagamento</h3>
    <p style="min-height: 180px">A cobrança é mensal e o recibo chega por e-mail.</p>
    <h3 id="termos-cancelamento" class="at-titulo-4">Cancelamento</h3>
    <p style="min-height: 180px">Cancele quando quiser, sem multa, direto na sua conta.</p>
  </div>
</div>`,
        },
      ],
    },

    {
      id: "grupo-botoes",
      nome: "Grupo de botões e botão fechar",
      categoria: "acoes",
      novo: true,
      resumo: "Botões colados que funcionam como um conjunto (alinhar texto, escolher visualização) e o botão \"×\" padrão para fechar caixas.",
      apelidos: ["button group", "grupo de botões", "toolbar", "barra de ferramentas", "close button", "botão fechar", "x", "alternar visualização"],
      inspiradoEm: ["Google Docs (alinhamento)", "Windows Explorer (lista ou grade)", "Bootstrap (button group, close button)"],
      quandoUsar: ["Opções relacionadas lado a lado, como Lista/Grade ou Dia/Semana/Mês.", "O botão fechar em alertas, cartões e painéis personalizados."],
      evitar: ["Escolher uma opção num formulário: o segmentado das Abas ou rádios comunicam melhor."],
      comoFunciona:
        "Envolva .at-botao em .at-grupo-botoes. Para botões que ligam e desligam, use aria-pressed=\"true\" no ativo. O .at-fechar é um botão quadrado e discreto com \"×\": use sempre com aria-label.",
      recursos: [],
      mdn: [en("aria-pressed", "Web/Accessibility/ARIA/Reference/Attributes/aria-pressed")],
      conectaCom: ["botao", "abas", "alerta", "dica"],
      acessibilidade: ["Envolva o grupo num role=\"group\" com aria-label, para o leitor de tela anunciar o conjunto.", "Botões só com ícone ou \"×\" precisam de aria-label."],
      api: [
        { nome: "at-grupo-botoes", tipo: "classe", descricao: "Junta os botões, com cantos só nas pontas." },
        { nome: "aria-pressed=\"true\"", tipo: "atributo", descricao: "Botão ligado (destacado)." },
        { nome: "at-fechar", tipo: "classe", descricao: "Botão \"×\" para fechar." },
      ],
      exemplos: [
        {
          titulo: "Visualização e ferramentas",
          html: `<div class="at-linha">
  <div class="at-grupo-botoes" role="group" aria-label="Visualização">
    <button class="at-botao" aria-pressed="true">Lista</button>
    <button class="at-botao" aria-pressed="false">Grade</button>
    <button class="at-botao" aria-pressed="false">Mapa</button>
  </div>
  <div class="at-grupo-botoes" role="group" aria-label="Ações">
    <button class="at-botao at-icone" aria-label="Editar">${i.editar}</button>
    <button class="at-botao at-icone" aria-label="Copiar">${i.copiar}</button>
    <button class="at-botao at-icone" aria-label="Excluir">${i.lixo}</button>
  </div>
</div>`,
          js: `document.querySelectorAll('[aria-label="Visualização"] .at-botao').forEach((botao, _, todos) => {
  botao.addEventListener("click", () => todos.forEach((b) => b.setAttribute("aria-pressed", String(b === botao))));
});`,
        },
        {
          titulo: "Botão fechar",
          html: `<div class="at-superficie at-linha at-entre" style="max-width: 420px" id="aviso-novidade">
  <span>Temos novidades no seu painel.</span>
  <button class="at-fechar" aria-label="Fechar aviso" data-at-fechar="#aviso-novidade">×</button>
</div>`,
        },
      ],
    },

    {
      id: "imagens",
      nome: "Imagens, figuras e proporção",
      categoria: "dados",
      novo: true,
      resumo: "Imagens que se ajustam à tela, com cantos, miniatura e legenda, e caixas com proporção fixa (16:9, quadrada) para fotos e vídeos.",
      apelidos: ["imagem responsiva", "img fluid", "figure", "legenda", "miniatura", "thumbnail", "ratio", "proporção", "16:9", "aspect ratio", "foto redonda"],
      inspiradoEm: ["Instagram (fotos quadradas)", "YouTube (16:9)", "Bootstrap (images, figures, ratio)"],
      quandoUsar: ["Qualquer foto do site: a imagem nunca passa da largura da tela.", "Vídeos e mapas incorporados (iframe), que precisam manter a proporção."],
      evitar: ["Ícones: use SVG direto no HTML."],
      comoFunciona:
        "Use .at-imagem em qualquer <img> para ela encolher junto com a tela, com os modificadores at-arredondada, at-redonda e at-miniatura. Para proporção fixa, envolva a imagem ou o iframe em .at-proporcao e defina --proporcao (padrão 16 / 9). Sempre informe width e height na <img>: o navegador reserva o espaço e a página não \"pula\" ao carregar.",
      recursos: ["aspect-ratio", "object-fit", "loading-lazy"],
      mdn: [pt("Elemento <figure>", "Web/HTML/Reference/Elements/figure"), en("aspect-ratio", "Web/CSS/Reference/Properties/aspect-ratio")],
      conectaCom: ["cartao", "galeria", "video", "avatar"],
      acessibilidade: ["Toda imagem precisa de alt que descreva o que ela mostra; imagens só decorativas usam alt=\"\".", "A legenda em <figcaption> é lida junto com a imagem."],
      api: [
        { nome: "at-imagem", tipo: "classe", descricao: "Imagem que se ajusta à largura disponível." },
        { nome: "at-arredondada · at-redonda · at-miniatura", tipo: "modificador", descricao: "Cantos, círculo e moldura." },
        { nome: "at-figura", tipo: "classe", descricao: "<figure> com legenda em <figcaption>." },
        { nome: "at-proporcao", tipo: "classe", descricao: "Caixa com proporção fixa. Mude com --proporcao: 1 / 1, 4 / 3..." },
      ],
      exemplos: [
        {
          titulo: "Foto com legenda e miniaturas",
          html: `<div class="at-linha at-topo">
  <figure class="at-figura" style="max-width: 320px">
    <img class="at-imagem at-arredondada" src="https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp" alt="Tênis vermelho e preto de cano alto" width="320" height="320" loading="lazy">
    <figcaption>Tênis cano alto, coleção 2026.</figcaption>
  </figure>
  <div class="at-linha">
    <img class="at-imagem at-redonda" src="https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp" alt="Óculos de sol preto" width="72" height="72" loading="lazy">
    <img class="at-imagem at-miniatura" src="https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/1.webp" alt="Relógio com pulseira de couro" width="96" height="96" loading="lazy">
  </div>
</div>`,
        },
        {
          titulo: "Vídeo e foto com proporção fixa",
          html: `<div class="at-grade-12">
  <div class="at-col-tablet-8">
    <div class="at-proporcao at-cantos-grandes">
      <iframe src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ" title="Big Buck Bunny (vídeo de exemplo)" loading="lazy" allowfullscreen></iframe>
    </div>
  </div>
  <div class="at-col-tablet-4">
    <div class="at-proporcao at-cantos-grandes" style="--proporcao: 1 / 1">
      <img src="https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp" alt="Óculos de sol clássico" width="300" height="300" loading="lazy">
    </div>
  </div>
</div>`,
        },
      ],
    },

    {
      id: "grade-12",
      nome: "Grade de 12 colunas",
      categoria: "fundamentos",
      novo: true,
      resumo: "A grade clássica do Bootstrap, em português: divida a linha em 12 partes e diga quantas cada bloco ocupa no celular, tablet e computador.",
      apelidos: ["grid", "grid system", "colunas", "col-md-6", "row", "col", "bootstrap grid", "12 colunas", "layout responsivo"],
      inspiradoEm: ["Bootstrap (grid de 12 colunas)", "Material Design (layout grid)"],
      quandoUsar: ["Quando você já pensa em \"col-md-6\" ou precisa de proporções exatas (8 + 4, 3 + 9).", "Formulários com campos de larguras diferentes na mesma linha."],
      evitar: ["Listas de cartões iguais: as .at-colunas-N se ajustam sozinhas, sem você escolher tamanhos."],
      comoFunciona:
        "Um .at-grade-12 com filhos. No celular, cada filho ocupa a linha toda (12). Use .at-col-N para o tamanho em qualquer tela e .at-col-tablet-N (a partir de 720 px), .at-col-desktop-N (1024 px) e .at-col-largo-N (1280 px) para mudar em telas maiores, como col-md e col-lg do Bootstrap. .at-recuo-N empurra o bloco N colunas. O espaço entre colunas vem de --at-gap.",
      recursos: ["grid"],
      mdn: [pt("Layout de grade (CSS Grid)", "Web/CSS/Guides/Grid_layout")],
      conectaCom: ["layout", "campo", "cartao"],
      acessibilidade: ["A grade muda só o visual: mantenha no HTML a mesma ordem em que o conteúdo deve ser lido."],
      api: [
        { nome: "at-grade-12", tipo: "classe", descricao: "A linha com 12 colunas (equivale a row)." },
        { nome: "at-col-N", tipo: "classe", descricao: "Ocupa N de 12 colunas em qualquer tela (col-N)." },
        { nome: "at-col-tablet-N", tipo: "classe", descricao: "A partir de 720 px (col-md-N)." },
        { nome: "at-col-desktop-N", tipo: "classe", descricao: "A partir de 1024 px (col-lg-N)." },
        { nome: "at-col-largo-N", tipo: "classe", descricao: "A partir de 1280 px (col-xl-N)." },
        { nome: "at-recuo-1 · 2 · 3", tipo: "classe", descricao: "Começa 1, 2 ou 3 colunas depois (offset)." },
      ],
      exemplos: [
        {
          titulo: "Conteúdo e barra lateral (8 + 4)",
          html: `<div class="at-grade-12">
  <main class="at-col-desktop-8 at-superficie">Conteúdo principal: 12 colunas no celular, 8 no computador.</main>
  <aside class="at-col-desktop-4 at-superficie">Lateral: embaixo no celular, 4 colunas no computador.</aside>
</div>`,
        },
        {
          titulo: "Endereço com campos de larguras diferentes",
          html: `<form class="at-grade-12" style="max-width: 640px">
  <div class="at-campo at-col-tablet-4"><label class="at-rotulo" for="g-cep">CEP</label><input class="at-entrada" id="g-cep" data-at-mascara="cep"></div>
  <div class="at-campo at-col-tablet-8"><label class="at-rotulo" for="g-rua">Rua</label><input class="at-entrada" id="g-rua"></div>
  <div class="at-campo at-col-4 at-col-tablet-3"><label class="at-rotulo" for="g-num">Número</label><input class="at-entrada" id="g-num" inputmode="numeric"></div>
  <div class="at-campo at-col-8 at-col-tablet-9"><label class="at-rotulo" for="g-comp">Complemento <span class="at-opcional">(opcional)</span></label><input class="at-entrada" id="g-comp"></div>
</form>`,
        },
      ],
    },

    {
      id: "utilitarios",
      nome: "Utilitários (espaçamento, flex, cores...)",
      categoria: "fundamentos",
      novo: true,
      resumo: "Classes de uma função só para ajustar espaçamento, alinhamento, texto, cores, bordas e sombras direto no HTML, como os utilities do Bootstrap.",
      apelidos: ["utilities", "utilitários", "helpers", "margin", "padding", "mt-3", "d-flex", "justify-content", "text-center", "espaçamento", "margem", "sombra", "borda", "stretched-link", "visually-hidden", "sr-only"],
      inspiradoEm: ["Bootstrap (utilities)", "Tailwind CSS"],
      quandoUsar: ["Ajustes pontuais: um espaço a mais, centralizar, mudar a cor de um texto.", "Montar um layout rápido sem escrever CSS."],
      evitar: ["Repetir a mesma combinação longa em vários lugares: crie uma classe sua."],
      comoFunciona:
        "Espaçamento: at-{m|p}{t|b|s|e|x|y}-{0 a 8}, na mesma escala dos tokens --at-espaco-* (1 = 4 px, 4 = 16 px, 8 = 72 px). Ex.: at-mt-4, at-px-5, at-my-0, at-mx-auto. Flex: at-flex, at-flex-coluna, at-alinhar-centro, at-justificar-entre, at-gap-3. Texto: at-texto-direita, at-negrito, at-maiusculas, at-truncar-2. Cores: at-cor-sucesso, at-fundo-aviso. Bordas e sombras: at-borda, at-cantos-grandes, at-pilula, at-sombra. Também: at-oculto, at-sr (só para leitor de tela), at-link-esticado e at-link-icone.",
      recursos: ["flexbox", "flexbox-gap"],
      mdn: [pt("Box model (margem e preenchimento)", "Learn_web_development/Core/Styling_basics/Box_model")],
      conectaCom: ["layout", "cores-e-temas", "grade-12", "tipografia"],
      acessibilidade: ["at-sr esconde da tela mas mantém para o leitor de tela (visually-hidden do Bootstrap).", "As cores at-cor-* e at-fundo-* seguem os tokens, já testados para contraste no tema claro e no escuro."],
      api: [
        { nome: "at-m-N · at-mt-N · at-mb-N · at-ms-N · at-me-N · at-mx-N · at-my-N", tipo: "classe", descricao: "Margem (N de 0 a 8). Também at-mx-auto, at-ms-auto, at-me-auto." },
        { nome: "at-p-N · at-pt-N · at-pb-N · at-ps-N · at-pe-N · at-px-N · at-py-N", tipo: "classe", descricao: "Preenchimento (padding), N de 0 a 8." },
        { nome: "at-gap-N", tipo: "classe", descricao: "Espaço entre itens de flex e grid." },
        { nome: "at-flex · at-grid · at-oculto · at-inline-bloco", tipo: "classe", descricao: "Tipo de exibição (display)." },
        { nome: "at-flex-coluna · at-flex-quebra · at-flex-1", tipo: "classe", descricao: "Direção, quebra e crescimento no flex." },
        { nome: "at-alinhar-{inicio|centro|fim|base}", tipo: "classe", descricao: "align-items." },
        { nome: "at-justificar-{inicio|centro|fim|entre|ao-redor}", tipo: "classe", descricao: "justify-content." },
        { nome: "at-texto-{esquerda|direita|centro|grande|mini}", tipo: "classe", descricao: "Alinhamento e tamanho do texto." },
        { nome: "at-negrito · at-italico · at-maiusculas · at-truncar-2 · at-truncar-3", tipo: "classe", descricao: "Estilo e corte do texto em 2 ou 3 linhas." },
        { nome: "at-cor-{primaria|sucesso|aviso|perigo|info}", tipo: "classe", descricao: "Cor do texto." },
        { nome: "at-fundo-{primaria|sucesso|aviso|perigo|info|suave}", tipo: "classe", descricao: "Fundo suave com texto legível." },
        { nome: "at-borda · at-cantos · at-cantos-grandes · at-pilula", tipo: "classe", descricao: "Bordas e cantos arredondados." },
        { nome: "at-sombra-p · at-sombra · at-sombra-g", tipo: "classe", descricao: "Sombra pequena, média e grande." },
        { nome: "at-link-esticado", tipo: "classe", descricao: "Torna o cartão inteiro clicável (o pai precisa de at-relativo)." },
        { nome: "at-link-icone", tipo: "classe", descricao: "Link com ícone alinhado ao texto." },
        { nome: "at-sr", tipo: "classe", descricao: "Visível só para leitores de tela." },
      ],
      exemplos: [
        {
          titulo: "Cartão montado só com utilitários",
          html: `<div class="at-relativo at-flex at-alinhar-centro at-gap-4 at-p-5 at-borda at-cantos-grandes at-sombra" style="max-width: 460px; background: var(--at-superficie)">
  <span class="at-avatar at-grande">AL</span>
  <div class="at-flex-1">
    <p class="at-m-0 at-negrito">Ana Lima</p>
    <p class="at-m-0 at-texto-suave at-truncar-2">Designer de produto. Gosta de tipografia, café e de interfaces que explicam o que vão fazer antes de fazer.</p>
  </div>
  <a href="#" class="at-link-esticado at-link-icone at-nao-encolhe">Perfil ${seta}</a>
</div>`,
        },
        {
          titulo: "Espaçamento, cores e alinhamento",
          html: `<div class="at-flex at-flex-quebra at-gap-3">
  <span class="at-px-4 at-py-2 at-pilula at-fundo-sucesso">Pago</span>
  <span class="at-px-4 at-py-2 at-pilula at-fundo-aviso">Pendente</span>
  <span class="at-px-4 at-py-2 at-pilula at-fundo-perigo">Cancelado</span>
</div>
<p class="at-mt-5 at-texto-direita at-cor-primaria at-negrito">Total: R$ 1.250,00</p>`,
        },
      ],
    }
  );
})();
