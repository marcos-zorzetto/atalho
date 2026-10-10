(function () {
  const { pt, en, icone: i, produtos } = window.ATALHO_DOCS.util;
  const [tenis, oculos, relogio, notebook] = produtos;

  window.ATALHO_DOCS.componentes.push(
    /* ======================================================================
       EXIBIR DADOS
       ====================================================================== */
    {
      id: "cartao",
      nome: "Cartão",
      categoria: "dados",
      resumo: "Caixa que agrupa informações de um mesmo assunto: artigo, resumo, configuração, item clicável.",
      apelidos: ["card", "cartão", "caixa", "box", "bloco", "painel", "tile"],
      inspiradoEm: ["Vercel (cartões de projeto)", "Medium (cartões de artigo)", "Stripe (secções de configuração)"],
      quandoUsar: ["Listas de coisas parecidas (artigos, projetos).", "Separar secções de uma página de configurações."],
      comoFunciona:
        "Combine as partes de que precisar: imagem, cabeçalho, corpo e rodapé. Quando o cartão inteiro leva a outra página, use <a class=\"at-cartao\">: o cartão ganha efeito ao passar o rato.",
      recursos: ["aspect-ratio", "object-fit"],
      mdn: [pt("<img>", "Web/HTML/Reference/Elements/img")],
      conectaCom: ["layout", "produto", "selo", "botao"],
      acessibilidade: ["Num cartão clicável, o texto do link é o conteúdo do cartão: mantenha o título no começo."],
      api: [
        { nome: "at-cartao", tipo: "classe", descricao: "Base. Em <a> vira clicável." },
        { nome: "at-cartao-midia", tipo: "classe", descricao: "Imagem do topo (proporção 16:10)." },
        { nome: "at-cartao-cabecalho / -corpo / -rodape", tipo: "classe", descricao: "Partes." },
        { nome: "at-cartao-titulo", tipo: "classe", descricao: "Título." },
      ],
      exemplos: [
        {
          titulo: "Artigo e configuração",
          html: `<div class="at-grade" style="--min: 240px">
  <a class="at-cartao" href="#">
    <img class="at-cartao-midia" src="${notebook.imagem}" alt="" loading="lazy">
    <div class="at-cartao-corpo">
      <span class="at-sobretitulo">Guia</span>
      <h3 class="at-cartao-titulo">Como escolher um portátil para programar</h3>
      <p class="at-texto-suave at-texto-pequeno">Memória, processador e ecrã: o que realmente importa.</p>
    </div>
  </a>

  <section class="at-cartao">
    <div class="at-cartao-cabecalho">
      <h3>Notificações</h3>
      <span class="at-selo at-sucesso">Ativas</span>
    </div>
    <div class="at-cartao-corpo at-pilha" style="--at-gap: 12px">
      <label class="at-linha at-entre">Novos pedidos <input type="checkbox" role="switch" class="at-chave" checked></label>
      <label class="at-linha at-entre">Mensagens <input type="checkbox" role="switch" class="at-chave" checked></label>
      <label class="at-linha at-entre">Novidades do produto <input type="checkbox" role="switch" class="at-chave"></label>
    </div>
    <div class="at-cartao-rodape">
      <span class="at-texto-suave at-texto-pequeno">Guardado automaticamente</span>
      <button class="at-botao at-pequeno">Testar</button>
    </div>
  </section>
</div>`,
        },
      ],
    },

    {
      id: "produto",
      nome: "Cartão de produto",
      categoria: "dados",
      resumo: "O cartão de produto de loja online completo: foto, nome em até duas linhas, preço antigo, desconto, pagamento em 3 vezes, portes grátis e botão de comprar.",
      apelidos: ["produto", "card de produto", "montra", "vitrine", "e-commerce", "loja", "preço", "prestações", "desconto", "comprar", "product card"],
      inspiradoEm: ["Worten", "Amazon", "Zalando"],
      quandoUsar: ["Montras, listas de pesquisa e recomendações de qualquer loja."],
      comoFunciona:
        "O nome é um link que cobre o cartão inteiro (clicar em qualquer parte abre o produto), mas o botão continua clicável por cima. Os preços usam números tabulares para alinhar em colunas. Combine com Estado para o botão adicionar ao carrinho.",
      recursos: ["aspect-ratio", "loading-lazy", "object-fit"],
      mdn: [pt("Intl.NumberFormat (formatar moeda)", "Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat")],
      conectaCom: ["layout", "carrossel", "estado", "receita-loja", "avaliacao"],
      acessibilidade: ["Informe o preço antigo em texto para leitores de ecrã (\"De 799,90 € por 599,90 €\"), não só com o risco."],
      api: [
        { nome: "at-cartao at-produto", tipo: "classe", descricao: "Base do cartão de produto." },
        { nome: "at-produto-nome", tipo: "classe", descricao: "Nome com no máximo duas linhas." },
        { nome: "at-preco-antigo / at-preco / at-preco-desconto", tipo: "classe", descricao: "Preços." },
        { nome: "at-parcelas / at-frete", tipo: "classe", descricao: "Linhas de pagamento em prestações e portes." },
      ],
      exemplos: [
        {
          titulo: "Montra",
          html: `<div class="at-grade" style="--min: 200px">
  <article class="at-cartao at-produto">
    <span class="at-selo at-destaque">MAIS VENDIDO</span>
    <img class="at-cartao-midia" src="${tenis.imagem}" alt="${tenis.nome}" loading="lazy">
    <div class="at-cartao-corpo">
      <h3 class="at-produto-nome"><a href="#">${tenis.nome}</a></h3>
      <span class="at-preco-antigo"><span class="at-sr">De </span>799,90 €</span>
      <div><span class="at-preco"><span class="at-sr">por </span>599,90 €</span><span class="at-preco-desconto">25% OFF</span></div>
      <span class="at-parcelas">ou 3x 199,97 € sem juros</span>
      <span class="at-frete">Portes grátis</span>
      <span><span class="at-estrelas" style="--nota: 4.7" role="img" aria-label="Nota 4,7 de 5"></span> <small class="at-texto-suave">(2381)</small></span>
      <button class="at-botao at-primario at-bloco" data-at-notificar="Adicionado ao carrinho">Comprar</button>
    </div>
  </article>

  <article class="at-cartao at-produto">
    <img class="at-cartao-midia" src="${oculos.imagem}" alt="${oculos.nome}" loading="lazy">
    <div class="at-cartao-corpo">
      <h3 class="at-produto-nome"><a href="#">${oculos.nome}</a></h3>
      <span class="at-preco-antigo"><span class="at-sr">De </span>229,90 €</span>
      <div><span class="at-preco"><span class="at-sr">por </span>189,90 €</span><span class="at-preco-desconto">17% OFF</span></div>
      <span class="at-parcelas">ou 3x 63,30 € sem juros</span>
      <button class="at-botao at-primario at-bloco" data-at-notificar="Adicionado ao carrinho">Comprar</button>
    </div>
  </article>

  <article class="at-cartao at-produto">
    <img class="at-cartao-midia" src="${relogio.imagem}" alt="${relogio.nome}" loading="lazy">
    <div class="at-cartao-corpo">
      <h3 class="at-produto-nome"><a href="#">${relogio.nome}</a></h3>
      <div><span class="at-preco">349,00 €</span></div>
      <span class="at-parcelas">ou 3x 116,33 € sem juros</span>
      <span class="at-frete">Chega amanhã</span>
      <button class="at-botao at-primario at-bloco" data-at-notificar="Adicionado ao carrinho">Comprar</button>
    </div>
  </article>
</div>`,
        },
      ],
    },

    {
      id: "tabela",
      nome: "Tabela de dados",
      categoria: "dados",
      resumo: "Tabela de sistema completa: ordenar por coluna, pesquisar, paginar, selecionar linhas e exportar para Excel. Tudo com atributos no HTML.",
      apelidos: ["table", "tabela", "grid de dados", "datatable", "listagem", "ordenar", "filtrar", "exportar", "excel", "csv", "planilha", "relatório"],
      inspiradoEm: ["Stripe Dashboard (pagamentos)", "Shopify (pedidos)", "Google Sheets (exportar)"],
      quandoUsar: ["Dados que a pessoa precisa comparar, ordenar e procurar: pedidos, clientes, lançamentos."],
      evitar: ["No telemóvel, tabelas com muitas colunas ficam difíceis. Considere cartões para ecrãs pequenos."],
      comoFunciona:
        "Adicione data-at=\"tabela\" e: data-ordenar nos <th> (\"numero\" ou \"data\" para ordenar como número/data), data-filtro=\"#campo\" para ligar uma pesquisa, data-por-pagina=\"5\" para paginar. Use data-valor nas células formatadas (1250,00 € → data-valor=\"1250\") para ordenar corretamente. A exportação gera CSV com ponto e vírgula e acentos corretos, tal como o Excel em português espera.",
      recursos: ["intl", "has"],
      mdn: [
        pt("<table>", "Web/HTML/Reference/Elements/table"),
        en("aria-sort", "Web/Accessibility/ARIA/Reference/Attributes/aria-sort"),
        pt("Intl.Collator (ordenar texto com acentos)", "Web/JavaScript/Reference/Global_Objects/Intl/Collator"),
      ],
      conectaCom: ["selo", "menu-suspenso", "paginacao", "estado", "receita-painel"],
      acessibilidade: [
        "Os cabeçalhos ordenáveis passam a ser botões e recebem aria-sort, por isso o leitor de ecrã anuncia \"ordenado crescente\".",
        "Linhas selecionadas recebem aria-selected.",
      ],
      api: [
        { nome: "data-at=\"tabela\"", tipo: "atributo", descricao: "Na <table class=\"at-tabela\">." },
        { nome: "data-ordenar=\"texto|numero|data\"", tipo: "atributo", descricao: "No <th>: coluna ordenável." },
        { nome: "data-valor", tipo: "atributo", descricao: "Na <td>: valor usado para ordenar." },
        { nome: "data-filtro=\"#campo\"", tipo: "atributo", descricao: "Campo de pesquisa que filtra as linhas." },
        { nome: "data-por-pagina=\"10\"", tipo: "atributo", descricao: "Liga a paginação." },
        { nome: "data-selecionar / data-selecionar-todos", tipo: "atributo", descricao: "Checkboxes de seleção." },
        { nome: "data-at-exportar=\"#tabela\" + data-arquivo", tipo: "atributo", descricao: "Botão que descarrega o CSV." },
        { nome: "data-msg-vazia", tipo: "atributo", descricao: "Texto quando a pesquisa não encontra nada." },
        { nome: "at:selecao", tipo: "evento", descricao: "detail.quantidade, detail.ids, detail.linhas." },
      ],
      exemplos: [
        {
          titulo: "Encomendas",
          descricao: "Clique nos títulos das colunas, pesquise \"mb way\" ou \"maria\", selecione linhas e exporte.",
          html: `<div class="at-tabela-ferramentas">
  <div class="at-entrada-icone at-cresce" style="max-width: 320px">
    ${i.busca}
    <input class="at-entrada" id="busca-pedidos" type="search" placeholder="Pesquisar encomenda, cliente, pagamento…" aria-label="Pesquisar encomendas">
  </div>
  <span class="at-texto-suave at-texto-pequeno" id="selecionados" aria-live="polite"></span>
  <button class="at-botao" data-at-exportar="#tabela-pedidos" data-arquivo="pedidos.csv">${i.baixar} Exportar</button>
</div>

<div class="at-tabela-caixa">
  <table class="at-tabela" id="tabela-pedidos" data-at="tabela" data-filtro="#busca-pedidos" data-por-pagina="5">
    <thead>
      <tr>
        <th class="at-encolher"><input type="checkbox" data-selecionar-todos aria-label="Selecionar todos"></th>
        <th data-ordenar="numero">Encomenda</th>
        <th data-ordenar>Cliente</th>
        <th data-ordenar="data">Data</th>
        <th>Pagamento</th>
        <th>Estado</th>
        <th data-ordenar="numero" class="at-direita">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><input type="checkbox" data-selecionar value="1048" aria-label="Selecionar encomenda 1048"></td><td>#1048</td><td>Maria Oliveira</td><td data-valor="2026-10-07">07/10/2026</td><td>MB WAY</td><td><span class="at-selo at-sucesso">Pago</span></td><td class="at-direita" data-valor="1250">1250,00 €</td></tr>
      <tr><td><input type="checkbox" data-selecionar value="1047" aria-label="Selecionar encomenda 1047"></td><td>#1047</td><td>João Santos</td><td data-valor="2026-10-07">07/10/2026</td><td>Klarna 3x</td><td><span class="at-selo at-aviso">A aguardar</span></td><td class="at-direita" data-valor="389.9">389,90 €</td></tr>
      <tr><td><input type="checkbox" data-selecionar value="1046" aria-label="Selecionar encomenda 1046"></td><td>#1046</td><td>Ana Costa</td><td data-valor="2026-10-06">06/10/2026</td><td>Multibanco</td><td><span class="at-selo at-perigo">Cancelado</span></td><td class="at-direita" data-valor="89.9">89,90 €</td></tr>
      <tr><td><input type="checkbox" data-selecionar value="1045" aria-label="Selecionar encomenda 1045"></td><td>#1045</td><td>Lucas Pereira</td><td data-valor="2026-10-05">05/10/2026</td><td>MB WAY</td><td><span class="at-selo at-info">Enviado</span></td><td class="at-direita" data-valor="2100">2100,00 €</td></tr>
      <tr><td><input type="checkbox" data-selecionar value="1044" aria-label="Selecionar encomenda 1044"></td><td>#1044</td><td>Juliana Lima</td><td data-valor="2026-10-05">05/10/2026</td><td>Cartão</td><td><span class="at-selo at-sucesso">Pago</span></td><td class="at-direita" data-valor="4599">4599,00 €</td></tr>
      <tr><td><input type="checkbox" data-selecionar value="1043" aria-label="Selecionar encomenda 1043"></td><td>#1043</td><td>Rafael Souza</td><td data-valor="2026-10-04">04/10/2026</td><td>MB WAY</td><td><span class="at-selo at-sucesso">Pago</span></td><td class="at-direita" data-valor="159.8">159,80 €</td></tr>
      <tr><td><input type="checkbox" data-selecionar value="1042" aria-label="Selecionar encomenda 1042"></td><td>#1042</td><td>Beatriz Rocha</td><td data-valor="2026-10-03">03/10/2026</td><td>Multibanco</td><td><span class="at-selo at-aviso">A aguardar</span></td><td class="at-direita" data-valor="740">740,00 €</td></tr>
      <tr><td><input type="checkbox" data-selecionar value="1041" aria-label="Selecionar encomenda 1041"></td><td>#1041</td><td>Mário Almeida</td><td data-valor="2026-10-02">02/10/2026</td><td>Cartão</td><td><span class="at-selo at-info">Enviado</span></td><td class="at-direita" data-valor="56">56,00 €</td></tr>
    </tbody>
  </table>
</div>`,
          js: `document.querySelector("#tabela-pedidos").addEventListener("at:selecao", (evento) => {
  const { quantidade } = evento.detail;
  document.querySelector("#selecionados").textContent =
    quantidade ? Atalho.formatar.plural(quantidade, "selecionado") : "";
});`,
        },
      ],
    },

    {
      id: "indicador",
      nome: "Indicadores (KPIs)",
      categoria: "dados",
      resumo: "Os números grandes do topo de qualquer painel: faturação, encomendas, clientes, com a variação em relação ao período anterior.",
      apelidos: ["kpi", "métrica", "estatística", "dashboard", "número", "card de métrica", "indicador", "stat"],
      inspiradoEm: ["Stripe Dashboard", "Google Analytics", "Shopify (resumo de vendas)"],
      quandoUsar: ["Topo de painéis, para responder \"como estamos?\" em 3 segundos."],
      comoFunciona: "Use data-direcao=\"sobe\" ou \"desce\" na variação para colorir. Os valores podem vir do Estado com data-at-texto e data-at-formato.",
      recursos: ["intl"],
      mdn: [pt("Intl.NumberFormat", "Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat")],
      conectaCom: ["lateral", "tabela", "estado", "formatar", "receita-painel"],
      acessibilidade: ["Escreva a variação em texto (\"+12% em relação a setembro\"), não só com cor ou seta."],
      api: [
        { nome: "at-indicador", tipo: "classe", descricao: "Caixa do indicador." },
        { nome: "at-indicador-rotulo / -valor / -variacao", tipo: "classe", descricao: "Partes." },
        { nome: "data-direcao=\"sobe|desce\"", tipo: "atributo", descricao: "Cor da variação." },
      ],
      exemplos: [
        {
          titulo: "Resumo do mês",
          html: `<div class="at-colunas-4" style="--at-gap: 16px">
  <div class="at-indicador">
    <span class="at-indicador-rotulo">Faturação</span>
    <strong class="at-indicador-valor">48 920 €</strong>
    <span class="at-indicador-variacao" data-direcao="sobe">↑ 12,5% vs. setembro</span>
  </div>
  <div class="at-indicador">
    <span class="at-indicador-rotulo">Encomendas</span>
    <strong class="at-indicador-valor">1284</strong>
    <span class="at-indicador-variacao" data-direcao="sobe">↑ 8,2% vs. setembro</span>
  </div>
  <div class="at-indicador">
    <span class="at-indicador-rotulo">Valor médio por encomenda</span>
    <strong class="at-indicador-valor">38,10 €</strong>
    <span class="at-indicador-variacao">Estável</span>
  </div>
  <div class="at-indicador">
    <span class="at-indicador-rotulo">Cancelamentos</span>
    <strong class="at-indicador-valor">23</strong>
    <span class="at-indicador-variacao" data-direcao="desce">↓ 3,1% vs. setembro</span>
  </div>
</div>`,
        },
      ],
    },

    {
      id: "selo",
      nome: "Selos e etiquetas",
      categoria: "dados",
      resumo: "Selos mostram o estado (Pago, Pendente, Novo). Etiquetas são filtros ou tags que a pessoa pode remover.",
      apelidos: ["badge", "tag", "chip", "status", "etiqueta", "label", "pill", "selo", "filtro ativo"],
      inspiradoEm: ["GitHub (labels de issues)", "Stripe (estado do pagamento)", "Airbnb (filtros ativos)"],
      quandoUsar: ["Selo: estado de um item. Etiqueta: filtros aplicados e tags editáveis."],
      comoFunciona: "Selos são só visuais. Na etiqueta, um botão com data-at-fechar remove a etiqueta da página.",
      recursos: [],
      mdn: [],
      conectaCom: ["tabela", "lateral", "produto"],
      acessibilidade: ["Não dependa só da cor: o texto do selo precisa de dizer o estado."],
      api: [
        { nome: "at-selo", tipo: "classe", descricao: "Cores: at-primario, at-sucesso, at-aviso, at-perigo, at-info, at-destaque. Acrescente at-ponto para uma bolinha." },
        { nome: "at-etiqueta", tipo: "classe", descricao: "Tag com botão de remover (data-at-fechar)." },
      ],
      exemplos: [
        {
          titulo: "Estado",
          html: `<div class="at-linha">
  <span class="at-selo">Rascunho</span>
  <span class="at-selo at-primario">Novo</span>
  <span class="at-selo at-sucesso at-ponto">Pago</span>
  <span class="at-selo at-aviso at-ponto">A aguardar</span>
  <span class="at-selo at-perigo at-ponto">Cancelado</span>
  <span class="at-selo at-info">Enviado</span>
  <span class="at-selo at-destaque">-25%</span>
</div>`,
        },
        {
          titulo: "Filtros aplicados",
          html: `<div class="at-linha">
  <span class="at-etiqueta">Portes grátis <button data-at-fechar aria-label="Remover filtro Portes grátis">×</button></span>
  <span class="at-etiqueta">Até 500 € <button data-at-fechar aria-label="Remover filtro Até 500 €">×</button></span>
  <span class="at-etiqueta">Novo <button data-at-fechar aria-label="Remover filtro Novo">×</button></span>
</div>`,
        },
      ],
    },

    {
      id: "avatar",
      nome: "Avatar",
      categoria: "dados",
      resumo: "Foto ou iniciais da pessoa, com estado (online, ocupado) e grupos sobrepostos.",
      apelidos: ["avatar", "foto de perfil", "usuário", "iniciais", "imagem de perfil", "online", "profile"],
      inspiradoEm: ["Slack (estado)", "Google Docs (quem está a editar)", "GitHub (contribuidores)"],
      quandoUsar: ["Identificar pessoas em comentários, listas, menus."],
      comoFunciona: "Funciona em <img> e em <span> com iniciais. Ajuste o tamanho com --tamanho ou at-pequeno/at-grande.",
      recursos: ["object-fit"],
      mdn: [pt("<img>", "Web/HTML/Reference/Elements/img")],
      conectaCom: ["menu-suspenso", "chat", "lateral"],
      acessibilidade: ["Em <img>, use alt com o nome da pessoa. Se o nome já aparece ao lado, alt=\"\"."],
      api: [
        { nome: "at-avatar", tipo: "classe", descricao: "Base. at-pequeno / at-grande ou --tamanho." },
        { nome: "data-status=\"online|ocupado|ausente\"", tipo: "atributo", descricao: "Bolinha de estado." },
        { nome: "at-avatares", tipo: "classe", descricao: "Grupo sobreposto." },
      ],
      exemplos: [
        {
          titulo: "Tamanhos, estado e grupo",
          html: `<div class="at-linha" style="--at-gap: 20px">
  <span class="at-avatar at-pequeno">AO</span>
  <span class="at-avatar" data-status="online">MZ</span>
  <span class="at-avatar at-grande" data-status="ocupado">JS</span>

  <div class="at-avatares" aria-label="5 pessoas a editar">
    <span class="at-avatar">AO</span>
    <span class="at-avatar" style="background:#fef3c7;color:#92400e">LP</span>
    <span class="at-avatar" style="background:#dbeafe;color:#1e40af">BR</span>
    <span class="at-avatar" style="background:var(--at-superficie-3);color:var(--at-texto)">+2</span>
  </div>

  <div class="at-linha">
    <span class="at-avatar" data-status="online">AO</span>
    <div><strong class="at-texto-pequeno" style="display:block">Ana Oliveira</strong><small class="at-texto-suave">Online agora</small></div>
  </div>
</div>`,
        },
      ],
    },

    {
      id: "linha-do-tempo",
      nome: "Linha do tempo (seguimento)",
      categoria: "dados",
      resumo: "Histórico de eventos em ordem: seguimento de encomendas, atividades de um projeto, etapas de um pedido de suporte.",
      apelidos: ["timeline", "linha do tempo", "rastreio", "rastreamento", "histórico", "atividades", "tracking", "status do pedido"],
      inspiradoEm: ["CTT e Amazon (seguimento de encomendas)", "GitHub (atividade do pull request)"],
      quandoUsar: ["Mostrar o que aconteceu e quando."],
      comoFunciona: "Uma lista com marcador e data. Use <time datetime> para a data ficar legível para máquinas também.",
      recursos: [],
      mdn: [pt("<time>", "Web/HTML/Reference/Elements/time")],
      conectaCom: ["cartao", "formatar"],
      acessibilidade: ["Use lista (<ol>) para que o leitor de ecrã informe quantos eventos existem."],
      api: [
        { nome: "at-linha-tempo", tipo: "classe", descricao: "No <ol>." },
        { nome: "at-linha-tempo-marca", tipo: "classe", descricao: "Ícone de cada evento." },
      ],
      exemplos: [
        {
          titulo: "Seguimento da encomenda",
          html: `<ol class="at-linha-tempo" style="max-width: 420px">
  <li>
    <span class="at-linha-tempo-marca" style="background:var(--at-cor-sucesso-suave);color:var(--at-cor-sucesso)">✓</span>
    <div><strong>Encomenda entregue</strong><time datetime="2026-10-08T14:32">Hoje, 14:32</time></div>
  </li>
  <li>
    <span class="at-linha-tempo-marca">${i.caminhao}</span>
    <div><strong>Saiu para entrega</strong><time datetime="2026-10-08T08:10">Hoje, 08:10 · Centro de distribuição, Lisboa</time></div>
  </li>
  <li>
    <span class="at-linha-tempo-marca">${i.caixa}</span>
    <div><strong>Encomenda enviada</strong><time datetime="2026-10-06T17:45">06/10, 17:45</time></div>
  </li>
  <li>
    <span class="at-linha-tempo-marca">✓</span>
    <div><strong>Pagamento aprovado</strong><time datetime="2026-10-06T10:02">06/10, 10:02 · MB WAY</time></div>
  </li>
</ol>`,
        },
      ],
    },

    {
      id: "avaliacao",
      nome: "Avaliação (estrelas)",
      categoria: "dados",
      resumo: "Mostra notas com estrelas (incluindo meias estrelas) e permite que a pessoa avalie com rato ou teclado.",
      apelidos: ["estrelas", "rating", "nota", "avaliação", "review", "classificação", "stars", "avaliar"],
      inspiradoEm: ["Amazon", "Google Maps", "Booking.com"],
      quandoUsar: ["Mostrar a média de avaliações e pedir uma nota após a compra."],
      comoFunciona:
        "Para mostrar: .at-estrelas com style=\"--nota: 4.5\". Para avaliar: radios dentro de .at-avaliar (só CSS, já funciona com setas do teclado).",
      recursos: [],
      mdn: [pt("<input>", "Web/HTML/Reference/Elements/input")],
      conectaCom: ["produto", "validacao"],
      acessibilidade: ["Na exibição, use role=\"img\" e aria-label com a nota em texto."],
      api: [
        { nome: "at-estrelas + --nota", tipo: "classe", descricao: "Exibição de 0 a 5." },
        { nome: "at-avaliar", tipo: "classe", descricao: "Fieldset com radios de 5 a 1 (nessa ordem no HTML)." },
      ],
      exemplos: [
        {
          titulo: "Mostrar e avaliar",
          html: `<div class="at-pilha">
  <div class="at-linha">
    <span class="at-estrelas" style="--nota: 4.6; font-size: 1.25rem" role="img" aria-label="Nota 4,6 de 5"></span>
    <strong>4,6</strong> <span class="at-texto-suave">(1284 avaliações)</span>
  </div>

  <fieldset class="at-avaliar">
    <legend class="at-sr">A sua nota</legend>
    <input type="radio" id="nota5" name="nota" value="5"><label for="nota5" title="Excelente">★</label>
    <input type="radio" id="nota4" name="nota" value="4"><label for="nota4" title="Bom">★</label>
    <input type="radio" id="nota3" name="nota" value="3"><label for="nota3" title="Regular">★</label>
    <input type="radio" id="nota2" name="nota" value="2"><label for="nota2" title="Mau">★</label>
    <input type="radio" id="nota1" name="nota" value="1"><label for="nota1" title="Péssimo">★</label>
  </fieldset>
</div>`,
          js: `document.querySelectorAll("[name='nota']").forEach((opcao) => {
  opcao.addEventListener("change", () => {
    Atalho.notificar("Obrigado! Deu nota " + opcao.value + ".", { tipo: "sucesso" });
  });
});`,
        },
      ],
    },

    {
      id: "carrossel",
      nome: "Carrossel",
      categoria: "dados",
      resumo: "Fileira de itens que desliza para o lado, com botões e encaixe suave. No telemóvel, é só arrastar com o dedo.",
      apelidos: ["carousel", "slider", "carrossel", "galeria", "vitrine horizontal", "swiper", "slides"],
      inspiradoEm: ["Netflix (fileiras de títulos)", "Amazon (\"Quem viu também viu\")", "App Store"],
      quandoUsar: ["Recomendações e listas secundárias, em que ver todos os itens não é essencial."],
      evitar: ["Banner principal que troca sozinho: as pessoas raramente veem além do primeiro."],
      comoFunciona:
        "O scroll é nativo do navegador (scroll-snap), por isso é leve e funciona no toque. O Atalho só liga os botões Anterior/Próximo e desativa cada um quando chega à ponta.",
      recursos: ["scroll-snap", "resize-observer"],
      mdn: [en("CSS Scroll Snap", "Web/CSS/Guides/Scroll_snap")],
      conectaCom: ["produto", "cartao"],
      acessibilidade: ["A trilha recebe tabindex=\"0\" e pode ser percorrida com as setas do teclado."],
      api: [
        { nome: "data-at=\"carrossel\"", tipo: "atributo", descricao: "No container." },
        { nome: "at-carrossel-trilho", tipo: "classe", descricao: "A fileira. Largura do item: --largura-item." },
        { nome: "data-carrossel=\"anterior|proximo\"", tipo: "atributo", descricao: "Botões." },
      ],
      exemplos: [
        {
          titulo: "Recomendados para si",
          html: `<section class="at-carrossel" data-at="carrossel" aria-label="Recomendados para si">
  <div class="at-linha at-entre at-mb-4">
    <h3 class="at-titulo-4 at-mb-0">Recomendados para si</h3>
    <div class="at-carrossel-controles">
      <button class="at-botao at-icone at-pequeno" data-carrossel="anterior" aria-label="Anterior">${i.voltar}</button>
      <button class="at-botao at-icone at-pequeno" data-carrossel="proximo" aria-label="Próximo">${i.seta}</button>
    </div>
  </div>
  <div class="at-carrossel-trilho" tabindex="0" style="--largura-item: 200px">
    ${[tenis, oculos, relogio, notebook, tenis, oculos]
      .map(
        (p) => `<article class="at-cartao at-produto">
      <img class="at-cartao-midia" src="${p.imagem}" alt="${p.nome}" loading="lazy">
      <div class="at-cartao-corpo">
        <h4 class="at-produto-nome"><a href="#">${p.nome}</a></h4>
        <span class="at-preco">${new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(p.preco)}</span>
      </div>
    </article>`
      )
      .join("\n    ")}
  </div>
</section>`,
        },
      ],
    },

    {
      id: "sanfona",
      nome: "Acordeão (perguntas frequentes)",
      categoria: "dados",
      resumo: "Perguntas que abrem e fecham ao clicar. Ideal para FAQ e detalhes opcionais.",
      apelidos: ["accordion", "faq", "perguntas frequentes", "expandir", "recolher", "details", "collapse", "dúvidas"],
      inspiradoEm: ["Revolut (central de ajuda)", "Spotify (FAQ de planos)", "ePortugal"],
      quandoUsar: ["Perguntas frequentes, detalhes técnicos, termos."],
      comoFunciona:
        "Usa <details> e <summary>, nativos do HTML: funciona sem JavaScript e o texto escondido ainda é encontrado pelo Ctrl+F do navegador. Se der o mesmo name a todos, só um fica aberto de cada vez.",
      recursos: ["details", "details-name"],
      mdn: [pt("<details>", "Web/HTML/Reference/Elements/details")],
      conectaCom: ["planos", "hero"],
      acessibilidade: ["<summary> já é anunciado como botão expansível pelos leitores de ecrã."],
      api: [
        { nome: "at-sanfona", tipo: "classe", descricao: "Container." },
        { nome: "<details name=\"grupo\">", tipo: "atributo", descricao: "Mesmo name = só um aberto." },
        { nome: "at-sanfona-conteudo", tipo: "classe", descricao: "Resposta." },
      ],
      exemplos: [
        {
          titulo: "Dúvidas frequentes",
          html: `<div class="at-sanfona" style="max-width: 640px">
  <details name="faq" open>
    <summary>Qual o prazo de entrega?</summary>
    <div class="at-sanfona-conteudo"><p>Portugal continental: 1 a 3 dias úteis. Açores e Madeira: até 7 dias úteis. O prazo exato aparece no checkout depois de indicar o código postal.</p></div>
  </details>
  <details name="faq">
    <summary>Posso trocar ou devolver?</summary>
    <div class="at-sanfona-conteudo"><p>Sim. Tem 14 dias depois de receber a encomenda para desistir da compra, sem precisar de justificar (Decreto-Lei 24/2014, direito de livre resolução).</p></div>
  </details>
  <details name="faq">
    <summary>Que formas de pagamento aceitam?</summary>
    <div class="at-sanfona-conteudo"><p>MB WAY, referência Multibanco, cartão (Visa e Mastercard), PayPal e pagamento em 3 vezes sem juros com Klarna.</p></div>
  </details>
</div>`,
        },
      ],
    },

    {
      id: "chat",
      nome: "Chat",
      categoria: "dados",
      resumo: "Conversa no estilo WhatsApp: balões dos dois lados, horário e campo de envio. Ligado ao Estado, a lista atualiza-se sozinha.",
      apelidos: ["chat", "mensagens", "conversa", "whatsapp", "suporte", "atendimento", "messenger", "bate-papo"],
      inspiradoEm: ["WhatsApp", "Intercom (atendimento em sites)", "OLX (perguntas ao vendedor)"],
      quandoUsar: ["Atendimento, mensagens entre comprador e vendedor, comentários em tempo real."],
      comoFunciona:
        "As mensagens ficam num Estado. O container com data-at-lista desenha um <template> para cada mensagem. Enviar é só criar um novo array com a mensagem nova (como no React).",
      recursos: ["template"],
      mdn: [pt("<template>", "Web/HTML/Reference/Elements/template")],
      conectaCom: ["estado", "avatar", "formatar"],
      acessibilidade: ["A área de mensagens usa role=\"log\" com aria-live, para novas mensagens serem lidas."],
      api: [
        { nome: "at-chat / at-chat-mensagens / at-chat-envio", tipo: "classe", descricao: "Estrutura." },
        { nome: "at-mensagem / at-minha", tipo: "classe", descricao: "Balão (at-minha = enviada por mim)." },
      ],
      exemplos: [
        {
          titulo: "Atendimento",
          html: `<div class="at-chat" style="max-width: 420px; --altura: 380px">
  <div class="at-linha" style="padding: 12px 16px; border-bottom: 1px solid var(--at-borda)">
    <span class="at-avatar at-pequeno" data-status="online">LJ</span>
    <div><strong class="at-texto-pequeno" style="display:block">Loja Exemplo</strong><small class="at-texto-suave">Responde em minutos</small></div>
  </div>
  <div class="at-chat-mensagens" role="log" aria-live="polite" data-at-lista="conversa.mensagens">
    <template>
      <div class="at-mensagem" data-at-atributos="class: classe">
        <span data-at-campo="texto"></span>
        <time data-at-campo="hora"></time>
      </div>
    </template>
  </div>
  <form class="at-chat-envio" data-at-acao="conversa.enviar">
    <input class="at-entrada" name="texto" placeholder="Escreva uma mensagem" aria-label="Mensagem" autocomplete="off" required>
    <button class="at-botao at-primario at-icone" aria-label="Enviar">${i.enviar}</button>
  </form>
</div>`,
          js: `const agora = () => Atalho.formatar.hora(new Date());

const conversa = Atalho.estado("conversa", {
  mensagens: [
    { texto: "Olá! Como posso ajudar?", hora: "10:02", classe: "at-mensagem" },
  ],
  enviar(dados, evento) {
    if (!dados.texto.trim()) return;
    this.mensagens = [...this.mensagens, { texto: dados.texto, hora: agora(), classe: "at-mensagem at-minha" }];
    evento.target.reset();

    setTimeout(() => {
      this.mensagens = [...this.mensagens, {
        texto: "Recebi a sua mensagem! Um assistente vai responder dentro de momentos.",
        hora: agora(),
        classe: "at-mensagem",
      }];
    }, 900);
  },
});

// Desloca para a última mensagem sempre que a conversa muda
Atalho.observar("conversa", () => {
  const area = document.querySelector(".at-chat-mensagens");
  area.scrollTop = area.scrollHeight;
});`,
        },
      ],
    },

    {
      id: "kanban",
      nome: "Quadro Kanban",
      categoria: "dados",
      resumo: "Colunas com cartões que se arrastam entre etapas: A fazer, Em curso, Feito. Também move pelo teclado.",
      apelidos: ["kanban", "trello", "quadro", "tarefas", "arrastar", "drag and drop", "board", "to do", "projeto"],
      inspiradoEm: ["Trello", "Jira", "GitHub Projects"],
      quandoUsar: ["Acompanhar tarefas, pedidos ou candidatos que passam por etapas."],
      comoFunciona:
        "Arrastar usa a API nativa de drag and drop. Para quem usa teclado: foque um cartão e use Alt + ← → para trocar de coluna e Alt + ↑ ↓ para reordenar. Cada movimento dispara at:mover com o id do cartão e as colunas de origem e destino, para guardar no servidor.",
      recursos: ["draganddrop"],
      mdn: [pt("API de arrastar e soltar", "Web/API/HTML_Drag_and_Drop_API")],
      conectaCom: ["selo", "avatar", "requisitar"],
      acessibilidade: ["Arrastar não é acessível para todos; por isso existe a alternativa pelo teclado."],
      api: [
        { nome: "data-at=\"kanban\"", tipo: "atributo", descricao: "No quadro." },
        { nome: "at-kanban-coluna + data-coluna", tipo: "classe", descricao: "Coluna e o seu identificador." },
        { nome: "at-kanban-lista / at-kanban-cartao + data-id", tipo: "classe", descricao: "Lista e cartões." },
        { nome: "[data-contagem]", tipo: "atributo", descricao: "Mostra quantos cartões a coluna tem." },
        { nome: "at:mover", tipo: "evento", descricao: "detail: id, de, para, posicao." },
      ],
      exemplos: [
        {
          titulo: "Tarefas do projeto",
          html: `<div class="at-kanban" data-at="kanban" id="quadro">
  <section class="at-kanban-coluna" data-coluna="fazer">
    <header>A fazer <span class="at-selo" data-contagem></span></header>
    <ul class="at-kanban-lista">
      <li class="at-kanban-cartao" data-id="1">Criar página de login</li>
      <li class="at-kanban-cartao" data-id="2">Integrar pagamento MB WAY <span class="at-selo at-perigo">Urgente</span></li>
    </ul>
  </section>
  <section class="at-kanban-coluna" data-coluna="fazendo">
    <header>Em curso <span class="at-selo" data-contagem></span></header>
    <ul class="at-kanban-lista">
      <li class="at-kanban-cartao" data-id="3">Tabela de pedidos</li>
    </ul>
  </section>
  <section class="at-kanban-coluna" data-coluna="feito">
    <header>Feito <span class="at-selo" data-contagem></span></header>
    <ul class="at-kanban-lista">
      <li class="at-kanban-cartao" data-id="4">Layout da home</li>
    </ul>
  </section>
</div>`,
          js: `document.querySelector("#quadro").addEventListener("at:mover", (evento) => {
  const { id, de, para } = evento.detail;
  if (de !== para) Atalho.notificar("Tarefa " + id + " movida para " + para + ".");
  // await Atalho.requisitar("/api/tarefas/" + id, { metodo: "PATCH", corpo: { coluna: para } });
});`,
        },
      ],
    },

    /* ======================================================================
       FEEDBACK
       ====================================================================== */
    {
      id: "alerta",
      nome: "Alertas e faixa",
      categoria: "feedback",
      resumo: "Mensagens fixas na página: informação, sucesso, atenção e erro. A faixa é o aviso no topo do site.",
      apelidos: ["alert", "alerta", "aviso", "mensagem", "banner", "faixa", "callout", "erro", "warning", "info"],
      inspiradoEm: ["GitHub (avisos em repositórios)", "Stripe (avisos de conta)", "Lojas (faixa de portes grátis no topo)"],
      quandoUsar: ["Informações que precisam de ficar visíveis até a pessoa resolver ou dispensar."],
      comoFunciona: "Um botão com data-at-fechar dentro do alerta remove o alerta.",
      recursos: [],
      mdn: [en("aria-live", "Web/Accessibility/ARIA/Reference/Attributes/aria-live")],
      conectaCom: ["notificacao", "validacao", "modal"],
      acessibilidade: ["Para erros que aparecem depois de uma ação, use role=\"alert\" para o leitor de ecrã anunciar na hora."],
      api: [
        { nome: "at-alerta", tipo: "classe", descricao: "Cores: at-sucesso, at-aviso, at-perigo (padrão: info)." },
        { nome: "at-alerta-conteudo", tipo: "classe", descricao: "Título (<strong>) e texto." },
        { nome: "at-faixa", tipo: "classe", descricao: "Faixa colorida do topo." },
        { nome: "data-at-fechar", tipo: "atributo", descricao: "Botão que remove o alerta." },
      ],
      exemplos: [
        {
          titulo: "Tipos",
          html: `<div class="at-pilha" style="--at-gap: 12px">
  <div class="at-alerta">
    ${i.info}
    <div class="at-alerta-conteudo"><strong>Manutenção programada</strong><p>O sistema ficará indisponível no domingo, das 2h às 4h.</p></div>
    <button data-at-fechar aria-label="Fechar aviso">×</button>
  </div>
  <div class="at-alerta at-sucesso">${i.ok}<div class="at-alerta-conteudo"><strong>Pagamento confirmado</strong><p>Enviámos o recibo para o seu e-mail.</p></div></div>
  <div class="at-alerta at-aviso">${i.alerta}<div class="at-alerta-conteudo"><strong>O seu certificado digital vence em 5 dias</strong><p>Renove para continuar a emitir faturas.</p></div></div>
  <div class="at-alerta at-perigo" role="alert">${i.alerta}<div class="at-alerta-conteudo"><strong>Cartão recusado</strong><p>Verifique os dados ou tente outro cartão.</p></div></div>
</div>`,
        },
        {
          titulo: "Faixa do topo",
          html: `<div class="at-faixa">Portes grátis acima de 199 € · <a href="#">Ver regras</a></div>`,
        },
      ],
    },

    {
      id: "carregando",
      nome: "A carregar e progresso",
      categoria: "feedback",
      resumo: "Indicador giratório, esqueleto do conteúdo (skeleton) e barra de progresso nativa.",
      apelidos: ["loading", "carregando", "spinner", "skeleton", "esqueleto", "progresso", "progress bar", "aguarde", "barra de progresso"],
      inspiradoEm: ["YouTube e LinkedIn (esqueleto)", "Google Drive (progresso de upload)"],
      quandoUsar: [
        "Esqueleto: quando sabe o formato do que vai chegar (listas, cartões).",
        "Giratório: esperas curtas e indefinidas.",
        "Progresso: quando é possível medir (upload, importação).",
      ],
      comoFunciona: "A barra é o elemento <progress> do HTML, só estilizado. Coloque aria-busy=\"true\" no container enquanto carrega.",
      recursos: [],
      mdn: [pt("<progress>", "Web/HTML/Reference/Elements/progress")],
      conectaCom: ["requisitar", "botao", "upload"],
      acessibilidade: ["Dê nome ao indicador giratório (role=\"status\" + aria-label=\"A carregar\")."],
      api: [
        { nome: "at-girando", tipo: "classe", descricao: "Indicador giratório (--tamanho)." },
        { nome: "at-esqueleto", tipo: "classe", descricao: "Bloco cinza animado. Variações: at-titulo, at-circulo, at-imagem." },
        { nome: "<progress class=\"at-progresso\">", tipo: "classe", descricao: "Barra. Cores: at-sucesso, at-aviso, at-perigo." },
      ],
      exemplos: [
        {
          titulo: "Esqueleto que se transforma em conteúdo",
          html: `<div class="at-cartao" style="max-width: 360px" id="perfil-cartao" aria-busy="true">
  <div class="at-cartao-corpo at-linha at-topo">
    <span class="at-esqueleto at-circulo"></span>
    <div class="at-cresce at-pilha" style="--at-gap: 8px">
      <span class="at-esqueleto at-titulo"></span>
      <span class="at-esqueleto"></span>
      <span class="at-esqueleto" style="width: 70%"></span>
    </div>
  </div>
</div>`,
          js: `setTimeout(() => {
  const cartao = document.querySelector("#perfil-cartao");
  cartao.removeAttribute("aria-busy");
  cartao.innerHTML = \`
    <div class="at-cartao-corpo at-linha at-topo">
      <span class="at-avatar at-grande">AO</span>
      <div class="at-cresce">
        <strong>Ana Oliveira</strong>
        <p class="at-texto-suave at-texto-pequeno at-mb-0">Programadora front-end em Lisboa. Gosta de café e de interfaces simples.</p>
      </div>
    </div>\`;
}, 1800);`,
        },
        {
          titulo: "Giratório e progresso",
          html: `<div class="at-pilha" style="max-width: 360px">
  <div class="at-linha"><span class="at-girando" role="status" aria-label="A carregar"></span> A procurar pedidos…</div>
  <label class="at-texto-pequeno">A enviar fotos (65%) <progress class="at-progresso" max="100" value="65"></progress></label>
  <label class="at-texto-pequeno">Armazenamento quase cheio <progress class="at-progresso at-aviso" max="100" value="92"></progress></label>
</div>`,
        },
      ],
    },

    {
      id: "vazio",
      nome: "Estado vazio",
      categoria: "feedback",
      resumo: "O que mostrar quando não há nada: explica o porquê e oferece o próximo passo.",
      apelidos: ["empty state", "vazio", "sem resultados", "nenhum item", "lista vazia", "zero resultados"],
      inspiradoEm: ["Dropbox", "Notion", "Gmail (caixa de entrada vazia)"],
      quandoUsar: ["Listas sem itens, pesquisas sem resultado, primeira vez num sistema."],
      comoFunciona: "Um bloco centrado com ícone, título, explicação e uma ação.",
      recursos: [],
      mdn: [],
      conectaCom: ["tabela", "estado", "botao"],
      acessibilidade: ["Ícone é decorativo (aria-hidden); a mensagem fica no texto."],
      api: [{ nome: "at-vazio", tipo: "classe", descricao: "Container do estado vazio." }],
      exemplos: [
        {
          titulo: "Nenhuma encomenda",
          html: `<div class="at-vazio">
  ${i.vazio}
  <h3>Ainda não há encomendas</h3>
  <p>Quando alguém comprar na sua loja, a encomenda aparece aqui com tudo o que precisa para enviar.</p>
  <button class="at-botao at-primario">Partilhar a minha loja</button>
</div>`,
        },
      ],
    },

    {
      id: "cookies",
      nome: "Aviso de cookies (RGPD)",
      categoria: "feedback",
      resumo: "Consentimento de cookies conforme o RGPD e a Diretiva ePrivacy: aceitar, recusar com o mesmo destaque e escolher por categoria. A escolha fica guardada.",
      apelidos: ["cookies", "rgpd", "gdpr", "consentimento", "privacidade", "lgpd", "aviso de cookies", "banner de cookies", "política de privacidade"],
      inspiradoEm: ["Orientações do Comité Europeu para a Proteção de Dados (EDPB)", "CNPD (Portugal)"],
      quandoUsar: ["Antes de carregar Google Analytics, Meta Pixel ou qualquer monitorização que não seja essencial."],
      evitar: ["Botão de recusar escondido ou menor que o de aceitar: as autoridades europeias (CNPD, CNIL, EDPB) consideram isso consentimento inválido."],
      comoFunciona:
        "O aviso aparece só se a pessoa ainda não escolheu. A escolha fica guardada em localStorage (atalho:cookies) e é enviada no evento at:cookies, para você carregar os scripts de análise só quando houver permissão. No exemplo abaixo ele está embutido na página (at-embutido); no seu site, retire essa classe e ele fica fixo no rodapé do ecrã.",
      recursos: ["localstorage"],
      mdn: [pt("localStorage", "Web/API/Window/localStorage")],
      conectaCom: ["modal", "rodape"],
      acessibilidade: ["Os dois botões têm o mesmo tamanho e destaque, e o aviso não bloqueia a navegação por teclado."],
      api: [
        { nome: "data-at=\"cookies\"", tipo: "atributo", descricao: "No .at-cookies (comece com hidden)." },
        { nome: "data-at-cookies=\"aceitar|recusar|salvar\"", tipo: "atributo", descricao: "Botões de escolha." },
        { nome: "name=\"analiticos|marketing\"", tipo: "atributo", descricao: "Checkboxes lidos ao guardar." },
        { nome: "at:cookies", tipo: "evento", descricao: "detail: necessarios, analiticos, marketing, data." },
      ],
      exemplos: [
        {
          titulo: "Aviso com categorias",
          html: `<div class="at-cookies at-embutido" data-at="cookies" role="region" aria-label="Aviso de cookies">
  <p>Usamos cookies essenciais para o site funcionar e, com a sua permissão, cookies de análise para melhorar a experiência. <a href="#">Política de privacidade</a></p>
  <div class="at-linha">
    <button class="at-botao" popovertarget="cookies-opcoes">Personalizar</button>
    <button class="at-botao" data-at-cookies="recusar">Recusar</button>
    <button class="at-botao at-primario" data-at-cookies="aceitar">Aceitar</button>
  </div>
  <div id="cookies-opcoes" popover class="at-menu" style="padding: 16px; min-width: 280px">
    <div class="at-pilha" style="--at-gap: 12px">
      <label class="at-check"><input type="checkbox" checked disabled> Essenciais (sempre ativos)</label>
      <label class="at-check"><input type="checkbox" name="analiticos"> Análise de uso</label>
      <label class="at-check"><input type="checkbox" name="marketing"> Marketing</label>
      <button class="at-botao at-primario at-pequeno" data-at-cookies="salvar" popovertarget="cookies-opcoes" popovertargetaction="hide">Guardar escolhas</button>
    </div>
  </div>
</div>`,
          js: `document.addEventListener("at:cookies", (evento) => {
  const { analiticos } = evento.detail;
  Atalho.notificar(analiticos ? "Análise de uso permitida." : "Só cookies essenciais.");
  // if (analiticos) carregarGoogleAnalytics();
});`,
        },
      ],
    }
  );
})();
