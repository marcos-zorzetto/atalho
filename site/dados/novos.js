/* Componentes da versão 1.1 */
(function () {
  const { pt, en, icone: i, produtos } = window.ATALHO_DOCS.util;
  const whatsapp = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.2z"/></svg>';
  const daquiADez = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);

  window.ATALHO_DOCS.componentes.push(
    {
      id: "autocompletar",
      nome: "Autocompletar",
      categoria: "formularios",
      novo: true,
      resumo: "Campo que sugere opções enquanto a pessoa escreve, ignorando acentos. Escolha com o rato ou com as setas e Enter.",
      apelidos: ["autocomplete", "combobox", "sugestões", "select com busca", "typeahead", "busca com sugestão", "selecionar cidade", "datalist"],
      inspiradoEm: ["Google (sugestões da pesquisa)", "Amazon (pesquisa de produtos)", "Formulários de cidade e distrito"],
      quandoUsar: ["Listas longas em que a pessoa sabe o que procura: cidade, banco, produto, país."],
      evitar: ["Poucas opções (até 7): use um select comum ou opções de rádio."],
      comoFunciona:
        "Coloque as opções numa lista .at-sugestoes dentro de .at-autocompletar. O Atalho filtra enquanto a pessoa escreve (sem acentos e sem diferenciar maiúsculas), aplica o padrão combobox da WAI-ARIA e dispara at:selecionar com a opção escolhida. Use data-valor para guardar um código diferente do texto (ex.: código do distrito).",
      recursos: ["input-event"],
      mdn: [en("Papel combobox (ARIA)", "Web/Accessibility/ARIA/Reference/Roles/combobox_role")],
      conectaCom: ["campo", "validacao", "requisitar"],
      acessibilidade: ["O campo recebe role=\"combobox\" com aria-expanded e aria-activedescendant: o leitor de ecrã anuncia cada opção ao navegar com as setas."],
      api: [
        { nome: "data-at=\"autocompletar\"", tipo: "atributo", descricao: "No container .at-autocompletar." },
        { nome: "ul.at-sugestoes > li", tipo: "classe", descricao: "As opções. data-valor = valor guardado; data-palavras = sinónimos." },
        { nome: "data-msg-vazia", tipo: "atributo", descricao: "Texto quando nada combina (predefinido: Nada encontrado.)." },
        { nome: "at:selecionar", tipo: "evento", descricao: "detail: valor, texto, item." },
      ],
      exemplos: [
        {
          titulo: "Escolher o banco",
          html: `<div class="at-campo" style="max-width: 360px">
  <label class="at-rotulo" for="banco">Banco</label>
  <div class="at-autocompletar" data-at="autocompletar" id="caixa-banco">
    <input class="at-entrada" id="banco" placeholder="Escreva o nome ou o código">
    <ul class="at-sugestoes">
      <li data-valor="0035" data-palavras="cgd caixa">Caixa Geral de Depósitos <small>0035</small></li>
      <li data-valor="0033" data-palavras="bcp">Millennium bcp <small>0033</small></li>
      <li data-valor="0010" data-palavras="bpi">BPI <small>0010</small></li>
      <li data-valor="0018">Santander <small>0018</small></li>
      <li data-valor="0007" data-palavras="bes">Novo Banco <small>0007</small></li>
      <li data-valor="0045" data-palavras="credito agricola">Crédito Agrícola <small>0045</small></li>
      <li data-valor="0036" data-palavras="montepio">Banco Montepio <small>0036</small></li>
      <li data-valor="5581" data-palavras="cartao digital">Revolut <small>5581</small></li>
    </ul>
  </div>
</div>`,
          js: `document.querySelector("#caixa-banco").addEventListener("at:selecionar", (evento) => {
  Atalho.notificar("Banco escolhido: código " + evento.detail.valor);
});`,
          ts: `const caixa = document.querySelector<HTMLElement>("#caixa-banco")!;

caixa.addEventListener("at:selecionar", (evento) => {
  const { valor, texto } = evento.detail; // ambos são string
  console.log(\`Banco \${texto} (código \${valor})\`);
});`,
        },
      ],
    },

    {
      id: "quantidade",
      nome: "Quantidade (+ e −)",
      categoria: "formularios",
      novo: true,
      resumo: "Seletor de quantidade com botões de mais e menos, respeitando mínimo, máximo e stock.",
      apelidos: ["quantidade", "stepper", "contador", "mais e menos", "number input", "spinner", "itens no carrinho"],
      inspiradoEm: ["Uber Eats e Glovo (quantidade do prato)", "Amazon (quantidade no carrinho)"],
      quandoUsar: ["Quantidades pequenas que a pessoa ajusta de 1 em 1: itens do carrinho, bilhetes, pessoas na reserva."],
      comoFunciona:
        "É um <input type=\"number\"> de verdade entre dois botões com data-passo. Os botões param no min e no max e ficam desativados no limite. Cada mudança dispara os eventos input e change do próprio campo, por isso funciona com data-at-valor e formulários comuns.",
      recursos: [],
      mdn: [pt("<input>", "Web/HTML/Reference/Elements/input")],
      conectaCom: ["receita-loja", "estado", "produto"],
      acessibilidade: ["Os botões recebem nome (Aumentar/Diminuir) e o campo continua editável pelo teclado."],
      api: [
        { nome: "data-at=\"quantidade\"", tipo: "atributo", descricao: "No .at-quantidade." },
        { nome: "data-passo=\"1\" / \"-1\"", tipo: "atributo", descricao: "Botões de aumentar e diminuir." },
        { nome: "min / max / step", tipo: "atributo", descricao: "No input: limites e tamanho do passo." },
      ],
      exemplos: [
        {
          titulo: "Bilhetes",
          html: `<div class="at-linha">
  <span>Bilhete normal <strong>60,00 €</strong></span>
  <div class="at-quantidade" data-at="quantidade">
    <button data-passo="-1">−</button>
    <input type="number" value="1" min="0" max="6" aria-label="Quantidade de bilhetes" data-at-valor="ingressos.quantidade">
    <button data-passo="1">+</button>
  </div>
  <span>Total: <strong data-at-texto="ingressos.total" data-at-formato="moeda"></strong></span>
</div>`,
          js: `Atalho.estado("ingressos", {
  quantidade: 1,
  get total() { return this.quantidade * 60; },
});`,
        },
      ],
    },

    {
      id: "contador-caracteres",
      nome: "Contador de caracteres",
      categoria: "formularios",
      novo: true,
      resumo: "Mostra quantos caracteres faltam e avisa com cor quando a pessoa está perto do limite.",
      apelidos: ["contador", "caracteres", "limite de texto", "maxlength", "contagem", "bio", "tweet", "textarea"],
      inspiradoEm: ["X/Twitter (limite do post)", "LinkedIn (resumo do perfil)", "Instagram (bio)"],
      quandoUsar: ["Campos com limite: biografia, título de anúncio, mensagem de SMS."],
      comoFunciona: "Adicione data-at-contar ao campo com maxlength. O contador aparece logo depois do campo (ou num elemento com data-contagem-de=\"id-do-campo\") e fica amarelo a 90% e vermelho no limite.",
      recursos: [],
      mdn: [pt("<input>", "Web/HTML/Reference/Elements/input")],
      conectaCom: ["campo", "validacao"],
      acessibilidade: ["O contador usa aria-live=\"polite\", e o leitor de ecrã anuncia a contagem sem interromper a escrita."],
      api: [
        { nome: "data-at-contar", tipo: "atributo", descricao: "No input/textarea (use junto com maxlength)." },
        { nome: "data-contagem-de=\"id\"", tipo: "atributo", descricao: "Onde mostrar o contador (opcional)." },
      ],
      exemplos: [
        {
          titulo: "Biografia do perfil",
          html: `<div class="at-campo" style="max-width: 420px">
  <div class="at-linha at-entre">
    <label class="at-rotulo" for="bio">Biografia</label>
    <span class="at-contagem" data-contagem-de="bio" aria-live="polite"></span>
  </div>
  <textarea class="at-entrada" id="bio" maxlength="160" data-at-contar rows="3">Programador em formação, apaixonado por café e por interfaces simples.</textarea>
</div>`,
        },
      ],
    },

    {
      id: "faixa",
      nome: "Faixa de valores (slider)",
      categoria: "formularios",
      novo: true,
      resumo: "Controlo deslizante estilizado, com o valor mostrado ao lado e formatado no idioma e na moeda da página.",
      apelidos: ["slider", "range", "faixa", "deslizante", "filtro de preço", "volume", "input range", "simulador"],
      inspiradoEm: ["Simuladores de crédito dos bancos portugueses", "Airbnb (filtro de preço)"],
      quandoUsar: ["Valores aproximados em que a pessoa experimenta: simulador de crédito, filtro de preço, volume."],
      evitar: ["Valores exatos (NIF, idade): use um campo de texto."],
      comoFunciona: "É um <input type=\"range\"> nativo com a classe at-faixa-entrada. Um <output for=\"id\"> mostra o valor, formatado por data-at-formato (moeda, numero, porcentagem…).",
      recursos: [],
      mdn: [pt("<input>", "Web/HTML/Reference/Elements/input")],
      conectaCom: ["estado", "formatar", "planos"],
      acessibilidade: ["Por ser nativo, funciona com as setas do teclado e é anunciado com o valor atual."],
      api: [
        { nome: "at-faixa-entrada", tipo: "classe", descricao: "No input type=range." },
        { nome: "<output for=\"id\">", tipo: "atributo", descricao: "Mostra o valor atual." },
        { nome: "data-at-formato", tipo: "atributo", descricao: "No input ou no output: moeda, numero, porcentagem." },
      ],
      exemplos: [
        {
          titulo: "Simulador de crédito",
          html: `<div class="at-cartao" style="max-width: 420px">
  <div class="at-cartao-corpo at-pilha">
    <div class="at-campo">
      <div class="at-linha at-entre"><label class="at-rotulo" for="valor-emprestimo">De quanto precisa?</label><output for="valor-emprestimo" data-at-formato="moeda"></output></div>
      <input type="range" class="at-faixa-entrada" id="valor-emprestimo" min="1000" max="30000" step="500" value="8000" data-at-valor="simulador.valor">
    </div>
    <div class="at-campo">
      <div class="at-linha at-entre"><label class="at-rotulo" for="parcelas-emprestimo">Em quantos meses?</label><output for="parcelas-emprestimo"></output></div>
      <input type="range" class="at-faixa-entrada" id="parcelas-emprestimo" min="6" max="48" step="6" value="24" data-at-valor="simulador.parcelas">
    </div>
    <p class="at-mb-0">Prestação mensal estimada: <strong class="at-titulo-4" data-at-texto="simulador.parcela" data-at-formato="moeda"></strong></p>
  </div>
</div>`,
          js: `Atalho.estado("simulador", {
  valor: 8000,
  parcelas: 24,
  // Juros de exemplo: TAN de 9% ao ano (0,75% ao mês, prestação constante)
  get parcela() {
    const juros = 0.0075;
    const n = Number(this.parcelas);
    return (Number(this.valor) * juros) / (1 - (1 + juros) ** -n);
  },
});`,
        },
      ],
    },

    {
      id: "etiquetas-entrada",
      nome: "Entrada de etiquetas (tags)",
      categoria: "formularios",
      novo: true,
      resumo: "Campo em que cada palavra passa a ser uma etiqueta removível ao premir Enter ou vírgula. Ideal para habilidades, tags e e-mails.",
      apelidos: ["tags", "tag input", "etiquetas", "chips", "habilidades", "palavras-chave", "multiselect", "vários valores"],
      inspiradoEm: ["LinkedIn (habilidades do perfil)", "GitHub (tópicos do repositório)", "Gmail (destinatários)"],
      quandoUsar: ["Vários valores livres no mesmo campo: tags de um post, habilidades, e-mails para convidar."],
      comoFunciona:
        "Escreva e prima Enter (ou vírgula) para criar a etiqueta; Backspace com o campo vazio apaga a última. Com data-nome, um input escondido guarda os valores separados por vírgula e vai junto no envio do formulário.",
      recursos: [],
      mdn: [],
      conectaCom: ["selo", "validacao", "campo"],
      acessibilidade: ["Cada etiqueta tem um botão Remover com o nome dela, e o campo explica no aria-label como adicionar."],
      api: [
        { nome: "data-at=\"etiquetas\"", tipo: "atributo", descricao: "No .at-etiquetas." },
        { nome: "data-nome", tipo: "atributo", descricao: "Nome do campo escondido enviado no formulário." },
        { nome: "data-valores=\"a,b\"", tipo: "atributo", descricao: "Etiquetas iniciais." },
        { nome: "data-maximo", tipo: "atributo", descricao: "Limite de etiquetas." },
        { nome: "at:etiquetas", tipo: "evento", descricao: "detail.lista com os valores atuais." },
      ],
      exemplos: [
        {
          titulo: "Habilidades",
          html: `<div class="at-campo" style="max-width: 480px">
  <label class="at-rotulo" for="habilidades">Habilidades</label>
  <div class="at-etiquetas" data-at="etiquetas" data-nome="habilidades" data-valores="HTML,CSS" data-maximo="8">
    <input id="habilidades" placeholder="Escreva e prima Enter">
  </div>
  <span class="at-ajuda">Até 8 habilidades. Enter ou vírgula para adicionar.</span>
</div>`,
        },
      ],
    },

    {
      id: "galeria",
      nome: "Galeria de fotos",
      categoria: "dados",
      novo: true,
      resumo: "Grade de miniaturas que abre cada foto em ecrã inteiro, com setas, contador e legenda.",
      apelidos: ["galeria", "lightbox", "fotos", "imagens", "álbum", "zoom", "ecrã inteiro", "portfólio"],
      inspiradoEm: ["Airbnb (fotos do anúncio)", "OLX (fotos do anúncio)", "Instagram"],
      quandoUsar: ["Fotos de produto, imóvel, portfólio ou evento."],
      comoFunciona:
        "Cada miniatura é um link para a imagem grande: sem JavaScript, o link abre a foto normalmente. Com o Atalho, abre um visualizador em ecrã inteiro (<dialog>), com setas do teclado e Esc para fechar.",
      recursos: ["dialog", "loading-lazy", "aspect-ratio"],
      mdn: [pt("<dialog>", "Web/HTML/Reference/Elements/dialog"), pt("<img>", "Web/HTML/Reference/Elements/img")],
      conectaCom: ["produto", "carrossel", "upload"],
      acessibilidade: ["Use alt descritivo nas miniaturas: ele passa a ser a legenda e o texto alternativo da foto grande."],
      api: [
        { nome: "data-at=\"galeria\"", tipo: "atributo", descricao: "No .at-galeria. Tamanho mínimo da miniatura: --min." },
        { nome: "data-legenda", tipo: "atributo", descricao: "No link: legenda (padrão: alt da miniatura)." },
      ],
      exemplos: [
        {
          titulo: "Fotos do produto",
          html: `<div class="at-galeria" data-at="galeria" style="--min: 110px; max-width: 520px">
  ${[
    ["mens-shoes/nike-air-jordan-1-red-and-black", "Ténis vermelho e preto, vista lateral"],
    ["sunglasses/classic-sun-glasses", "Óculos de sol clássicos"],
    ["mens-watches/brown-leather-belt-watch", "Relógio com bracelete de pele"],
    ["laptops/apple-macbook-pro-14-inch-space-grey", "Portátil de 14 polegadas aberto"],
  ]
    .map(
      ([caminho, alt]) => `<a href="https://cdn.dummyjson.com/product-images/${caminho}/1.webp">
    <img src="https://cdn.dummyjson.com/product-images/${caminho}/thumbnail.webp" alt="${alt}" loading="lazy">
  </a>`
    )
    .join("\n  ")}
</div>`,
        },
      ],
    },

    {
      id: "video",
      nome: "Vídeo leve do YouTube",
      categoria: "dados",
      novo: true,
      resumo: "Mostra a capa do vídeo e só carrega o player do YouTube no clique: página até 1 MB mais leve e sem cookies antes da hora.",
      apelidos: ["youtube", "vídeo", "video", "embed", "lite youtube", "player", "incorporar vídeo", "iframe"],
      inspiradoEm: ["Google (lite-youtube-embed, recomendação de desempenho)", "Sites de cursos"],
      quandoUsar: ["Sempre que for incorporar um vídeo do YouTube numa página."],
      comoFunciona:
        "O link aponta para o vídeo no YouTube (funciona mesmo sem JavaScript). O Atalho põe a capa oficial como fundo e, no clique, troca pelo player do youtube-nocookie.com, que só grava cookies depois de a pessoa decidir ver o vídeo. Isso melhora o carregamento da página e evita cookies de terceiros sem consentimento.",
      recursos: [],
      mdn: [pt("<iframe>", "Web/HTML/Reference/Elements/iframe")],
      conectaCom: ["hero", "cookies"],
      acessibilidade: ["O link recebe aria-label \"Assistir ao vídeo: título\"."],
      api: [{ nome: "a.at-video[data-at=\"video\"]", tipo: "atributo", descricao: "href = endereço do vídeo no YouTube. Texto dentro de <span> passa a ser o título." }],
      exemplos: [
        {
          titulo: "Vídeo de apresentação",
          html: `<a class="at-video" data-at="video" href="https://www.youtube.com/watch?v=aqz-KE-bpKQ" style="max-width: 560px">
  <span>Big Buck Bunny · Blender Foundation (CC BY)</span>
</a>`,
        },
      ],
    },

    {
      id: "whatsapp",
      nome: "Botão do WhatsApp",
      categoria: "acoes",
      novo: true,
      resumo: "Botão flutuante que abre uma conversa no WhatsApp com mensagem pronta. No telemóvel fica só o ícone.",
      apelidos: ["whatsapp", "zap", "botão flutuante", "contacto", "atendimento", "wa.me", "chat whatsapp", "fale connosco"],
      inspiradoEm: ["Restaurantes, clínicas e lojas de bairro em Portugal", "WhatsApp Business (link wa.me)"],
      quandoUsar: ["Negócios que atendem pelo WhatsApp: lojas, clínicas, escolas, serviços."],
      comoFunciona:
        "Use o link oficial https://wa.me/351NUMERO?text=mensagem (só algarismos, com o indicativo do país: 351 em Portugal, 34 em Espanha, 44 no Reino Unido). A mensagem precisa de ser codificada para URL: o espaço passa a %20. Fora do telemóvel, o link abre o WhatsApp Web. No exemplo, at-embutido mostra o botão no lugar; no site, sem essa classe, ele fica fixo no canto.",
      recursos: [],
      mdn: [],
      conectaCom: ["chat", "rodape"],
      acessibilidade: ["No telemóvel o texto desaparece visualmente, mas continua no link para leitores de ecrã."],
      api: [
        { nome: "a.at-whatsapp", tipo: "classe", descricao: "Botão fixo no canto inferior direito." },
        { nome: "at-embutido", tipo: "classe", descricao: "Mostra no fluxo da página em vez de fixo." },
      ],
      exemplos: [
        {
          titulo: "Fale com a loja",
          html: `<a class="at-whatsapp at-embutido" href="https://wa.me/351912345678?text=Ol%C3%A1!%20Vi%20o%20site%20e%20quero%20saber%20mais." target="_blank" rel="noopener">
  ${whatsapp}
  <span>Fale connosco</span>
</a>`,
        },
      ],
    },

    {
      id: "contagem-regressiva",
      nome: "Contagem regressiva",
      categoria: "paginas",
      novo: true,
      resumo: "Dias, horas, minutos e segundos até uma data: promoção, lançamento, evento. Termina sozinha e avisa por evento.",
      apelidos: ["contagem regressiva", "countdown", "cronômetro", "timer", "black friday", "oferta termina", "lançamento", "tempo restante"],
      inspiradoEm: ["Black Friday das grandes lojas", "Lançamentos de cursos online"],
      quandoUsar: ["Prazos reais: fim de promoção, abertura de inscrições, data de evento."],
      evitar: ["Urgência falsa que recomeça a cada visita: além de pouco ético, é uma prática comercial desleal (Decreto-Lei 57/2008)."],
      comoFunciona: "Informe a data em data-ate no formato ISO com fuso (ex.: 2026-11-27T23:59:59+00:00, hora de Lisboa no inverno). O Atalho monta os blocos, atualiza a cada segundo e, no fim, mostra data-texto-fim e dispara at:fim.",
      recursos: [],
      mdn: [en("<time>", "Web/HTML/Reference/Elements/time")],
      conectaCom: ["hero", "faixa", "planos"],
      acessibilidade: ["Usa role=\"timer\" com um resumo no aria-label, sem anunciar cada segundo (o que seria irritante)."],
      api: [
        { nome: "data-at=\"contagem\"", tipo: "atributo", descricao: "No .at-contagem-regressiva." },
        { nome: "data-ate", tipo: "atributo", descricao: "Data e hora final (ISO, com fuso)." },
        { nome: "data-texto-fim", tipo: "atributo", descricao: "Texto exibido quando acabar." },
        { nome: "at:fim", tipo: "evento", descricao: "Disparado quando chega a zero." },
      ],
      exemplos: [
        {
          titulo: "Oferta de lançamento",
          html: `<div class="at-superficie at-texto-centro" style="max-width: 460px">
  <p class="at-sobretitulo">Pré-venda termina em</p>
  <div class="at-contagem-regressiva" data-at="contagem" data-ate="${daquiADez}T23:59:59+00:00" data-texto-fim="A pré-venda terminou."></div>
</div>`,
        },
      ],
    },

    {
      id: "notificacoes-sino",
      nome: "Central de notificações",
      categoria: "navegacao",
      novo: true,
      resumo: "O sino do topo com contador e lista de avisos, destacando os não lidos e com \"Marcar todas como lidas\".",
      apelidos: ["notificações", "sino", "bell", "avisos", "inbox", "alertas do sistema", "central de avisos", "dropdown de notificações"],
      inspiradoEm: ["GitHub", "LinkedIn", "Painel da Shopify"],
      quandoUsar: ["Sistemas em que algo acontece enquanto a pessoa não está a olhar: encomendas, mensagens, aprovações."],
      comoFunciona:
        "Combina Botão com contador, Menu suspenso (popover) e Estado: a lista vem de um estado, o contador mostra quantas não lidas existem e a ação \"Marcar todas como lidas\" atualiza tudo de uma vez.",
      recursos: ["popover", "template"],
      mdn: [en("Popover API", "Web/API/Popover_API")],
      conectaCom: ["menu-suspenso", "botao", "estado", "barra"],
      acessibilidade: ["O botão do sino diz quantas notificações não lidas existem no aria-label."],
      api: [
        { nome: "at-menu at-menu-largo", tipo: "classe", descricao: "Menu suspenso mais largo." },
        { nome: "at-menu-cabecalho / at-lista-notificacoes", tipo: "classe", descricao: "Estrutura do painel." },
        { nome: "data-nao-lida", tipo: "atributo", descricao: "Destaca o item não lido." },
      ],
      exemplos: [
        {
          titulo: "Sino com estado",
          html: `<button class="at-botao at-icone at-contador-selo" popovertarget="painel-notificacoes" aria-label="Notificações">
  ${i.sino}
  <span data-contador data-at-texto="avisos.naoLidas" data-at-mostrar="avisos.naoLidas"></span>
</button>

<div id="painel-notificacoes" popover class="at-menu at-menu-largo">
  <div class="at-menu-cabecalho">
    Notificações
    <button class="at-botao at-link at-pequeno" data-at-acao="avisos.lerTodas" data-at-desabilitar="!avisos.naoLidas">Marcar todas como lidas</button>
  </div>
  <ul class="at-lista-notificacoes" data-at-lista="avisos.itens">
    <template>
      <li data-at-atributos="data-nao-lida: naoLida">
        <span class="at-avatar at-pequeno" data-at-campo="sigla"></span>
        <div><span data-at-campo="texto"></span><time data-at-campo="quando"></time></div>
      </li>
    </template>
  </ul>
</div>`,
          js: `Atalho.estado("avisos", {
  itens: [
    { sigla: "MO", texto: "Maria Oliveira fez uma encomenda de 1250,00 €", quando: "há 2 min", naoLida: true },
    { sigla: "JS", texto: "João Santos respondeu à sua mensagem", quando: "há 1 hora", naoLida: true },
    { sigla: "MB", texto: "MB WAY de 389,90 € confirmado", quando: "ontem", naoLida: false },
  ],
  get naoLidas() { return this.itens.filter((item) => item.naoLida).length; },
  lerTodas() { this.itens = this.itens.map((item) => ({ ...item, naoLida: false })); },
});`,
        },
      ],
    },

    {
      id: "lista-detalhes",
      nome: "Lista de detalhes",
      categoria: "dados",
      novo: true,
      resumo: "Pares de rótulo e valor alinhados: dados da encomenda, ficha técnica, resumo de registo.",
      apelidos: ["detalhes", "chave valor", "description list", "dl", "ficha técnica", "especificações", "resumo do pedido", "dados do cliente"],
      inspiradoEm: ["Stripe (detalhes do pagamento)", "Amazon (informações do produto)"],
      quandoUsar: ["Mostrar informações de um item específico, como a encomenda ou o cliente."],
      comoFunciona: "Usa a lista de descrição do HTML (<dl>, <dt>, <dd>), feita exatamente para isso. No telemóvel, rótulo e valor ficam um por baixo do outro.",
      recursos: ["grid"],
      mdn: [pt("<dl>", "Web/HTML/Reference/Elements/dl")],
      conectaCom: ["cartao", "linha-do-tempo", "tabela"],
      acessibilidade: ["<dl> é anunciada como lista, com cada termo ligado ao seu valor."],
      api: [{ nome: "dl.at-detalhes", tipo: "classe", descricao: "Lista de detalhes." }],
      exemplos: [
        {
          titulo: "Encomenda #1048",
          html: `<dl class="at-detalhes" style="max-width: 480px">
  <dt>Cliente</dt><dd>Maria Oliveira</dd>
  <dt>Pagamento</dt><dd>MB WAY · aprovado em 07/10/2026, 14:32</dd>
  <dt>Entrega</dt><dd>Av. da Liberdade, 100 · 1250-096 Lisboa</dd>
  <dt>Status</dt><dd><span class="at-selo at-sucesso at-ponto">Pago</span></dd>
  <dt>Total</dt><dd>1250,00 €</dd>
</dl>`,
        },
      ],
    },

    {
      id: "depoimentos",
      nome: "Depoimentos",
      categoria: "paginas",
      novo: true,
      resumo: "Citações de clientes com foto, nome e cargo: a prova social que toda landing page precisa.",
      apelidos: ["depoimentos", "testimonials", "avaliações de clientes", "prova social", "citação", "review", "o que dizem"],
      inspiradoEm: ["Stripe e Notion (histórias de clientes)", "Udemy (depoimentos de alunos)"],
      quandoUsar: ["Landing pages de venda, perto do botão de compra."],
      evitar: ["Depoimentos inventados: além de enganar, são uma prática comercial desleal e dão coima (Decreto-Lei 57/2008)."],
      comoFunciona: "Cada depoimento é um <figure> com <blockquote> e <figcaption>, a estrutura semântica correta para citações.",
      recursos: [],
      mdn: [pt("<blockquote>", "Web/HTML/Reference/Elements/blockquote")],
      conectaCom: ["hero", "avaliacao", "avatar", "carrossel"],
      acessibilidade: ["A ligação entre citação e autor fica clara para leitores de ecrã com figure/figcaption."],
      api: [{ nome: "figure.at-depoimento", tipo: "classe", descricao: "Depoimento com blockquote e figcaption." }],
      exemplos: [
        {
          titulo: "Clientes",
          html: `<div class="at-grade" style="--min: 260px">
  <figure class="at-depoimento">
    <blockquote>Fechámos o mês em metade do tempo depois de termos tudo num só lugar.</blockquote>
    <figcaption><span class="at-avatar">CM</span><span><strong>Carla Mendes</strong><small>Dona da Loja Sol, Setúbal</small></span></figcaption>
  </figure>
  <figure class="at-depoimento">
    <blockquote>O MB WAY com confirmação automática acabou com o "envie o comprovativo".</blockquote>
    <figcaption><span class="at-avatar">RS</span><span><strong>Rafael Sousa</strong><small>Artesão, Braga</small></span></figcaption>
  </figure>
</div>`,
        },
      ],
    },

    {
      id: "recursos",
      nome: "Grade de recursos",
      categoria: "paginas",
      novo: true,
      resumo: "Ícone, título e uma frase para cada benefício do produto. O bloco \"porquê escolher-nos\".",
      apelidos: ["recursos", "features", "benefícios", "vantagens", "diferenciais", "por que escolher", "grade de ícones"],
      inspiradoEm: ["Stripe", "Linear", "Revolut (página de produtos)"],
      quandoUsar: ["Explicar de 3 a 6 benefícios principais numa landing page."],
      comoFunciona: "Combine at-recurso com a Grade ou com as Colunas. Os ícones vêm da página de Ícones do Atalho.",
      recursos: ["grid"],
      mdn: [],
      conectaCom: ["hero", "layout", "planos"],
      acessibilidade: ["Os ícones são decorativos (aria-hidden); o título carrega a informação."],
      api: [
        { nome: "at-recurso", tipo: "classe", descricao: "Bloco do recurso." },
        { nome: "at-recurso-icone", tipo: "classe", descricao: "Quadrado colorido com o ícone." },
      ],
      exemplos: [
        {
          titulo: "Benefícios",
          html: `<div class="at-colunas-3">
  <div class="at-recurso"><span class="at-recurso-icone">${i.caminhao}</span><h3>Portes calculados</h3><p>O cliente escreve o código postal e vê o prazo e o preço das transportadoras na hora.</p></div>
  <div class="at-recurso"><span class="at-recurso-icone">${i.ok}</span><h3>MB WAY na hora</h3><p>O cliente confirma no telemóvel e a encomenda é paga em segundos, com confirmação automática.</p></div>
  <div class="at-recurso"><span class="at-recurso-icone">${i.grafico}</span><h3>Relatórios</h3><p>Vendas, ticket médio e produtos mais vendidos, atualizados a cada minuto.</p></div>
</div>`,
        },
      ],
    },

    {
      id: "newsletter",
      nome: "Newsletter",
      categoria: "paginas",
      novo: true,
      resumo: "Formulário de inscrição com validação, estado de carregamento, mensagem de sucesso e consentimento conforme o RGPD.",
      apelidos: ["newsletter", "inscrição", "assinar", "lista de e-mails", "captura de leads", "e-mail marketing", "receba novidades"],
      inspiradoEm: ["Substack", "Blogs e lojas que capturam e-mails"],
      quandoUsar: ["Rodapé de blog, fim de artigo, landing page."],
      comoFunciona:
        "Junta Campo, Validação e Requisitar. O texto do consentimento diz exatamente para que o e-mail será usado (RGPD, art. 7.º). No exemplo, o envio é simulado; no seu site, troque pelo endereço do seu serviço de e-mail.",
      recursos: ["constraint-validation"],
      mdn: [en("<form>", "Web/HTML/Reference/Elements/form")],
      conectaCom: ["validacao", "requisitar", "rodape", "cookies"],
      acessibilidade: ["O resultado aparece numa região aria-live, anunciada pelo leitor de ecrã."],
      api: [],
      exemplos: [
        {
          titulo: "Inscrição com consentimento",
          html: `<form class="at-superficie at-pilha" id="form-newsletter" data-at-validar style="max-width: 460px">
  <h3 class="at-titulo-4 at-mb-0">Um artigo por semana no seu e-mail</h3>
  <div class="at-grupo-entrada">
    <input class="at-entrada" type="email" name="email" required placeholder="seu@email.com" aria-label="O seu e-mail" autocomplete="email">
    <button class="at-botao at-primario">Subscrever</button>
  </div>
  <label class="at-check at-texto-pequeno"><input type="checkbox" name="consentimento" required data-msg-obrigatorio="Marque para confirmar a inscrição.">
    <span>Aceito receber os artigos por e-mail. Posso cancelar a qualquer momento.</span></label>
  <p class="at-texto-pequeno at-mb-0" aria-live="polite" data-resultado></p>
</form>`,
          js: `document.querySelector("#form-newsletter").addEventListener("at:enviar", async (evento) => {
  const { dados, botao, formulario } = evento.detail;
  botao.setAttribute("aria-busy", "true");
  // Troque pela chamada ao seu serviço de e-mail:
  // await Atalho.requisitar("/api/newsletter", { metodo: "POST", corpo: dados });
  await new Promise((pronto) => setTimeout(pronto, 800));
  botao.removeAttribute("aria-busy");
  formulario.querySelector("[data-resultado]").textContent = "Pronto! Confirme a inscrição no e-mail que enviámos para " + dados.email + ".";
  formulario.reset();
});`,
          php: `<?php
// api/newsletter.php
require __DIR__ . '/atalho.php';
use function Atalho\\{exigirMetodo, lerJson, validar, responderErro, responderJson};

exigirMetodo('POST');
$dados = lerJson();
$erros = validar($dados, ['email' => ['obrigatorio', 'email'], 'consentimento' => ['obrigatorio']]);
if ($erros) {
    responderErro('Verifique os dados.', 422, $erros);
}
// Guarde o e-mail e a data do consentimento (o RGPD exige que consiga prová-lo)
responderJson(['ok' => true], 201);`,
        },
      ],
    },

    {
      id: "voltar-topo",
      nome: "Voltar ao topo",
      categoria: "navegacao",
      novo: true,
      resumo: "Botão discreto que aparece depois de a pessoa descer na página e leva de volta ao início.",
      apelidos: ["voltar ao topo", "back to top", "subir", "ir para o topo", "scroll top", "seta para cima"],
      inspiradoEm: ["Portais de notícias", "Lojas com páginas longas"],
      quandoUsar: ["Páginas longas: listas de produtos, artigos, documentação."],
      comoFunciona: "O botão fica escondido e aparece depois de 600px de deslocamento (ajuste com data-depois). Ao clicar, sobe a página e leva o foco do teclado para o título, para quem navega sem rato não se perder.",
      recursos: [],
      mdn: [],
      conectaCom: ["whatsapp", "barra"],
      acessibilidade: ["Deslocamento suave só para quem não pediu menos movimento no sistema (prefers-reduced-motion)."],
      api: [
        { nome: "a.at-voltar-topo[data-at=\"voltar-topo\"]", tipo: "atributo", descricao: "O botão." },
        { nome: "data-depois=\"600\"", tipo: "atributo", descricao: "Pixels de deslocamento até aparecer." },
        { nome: "--at-deslocamento-topo", tipo: "variável", descricao: "Sobe o botão (ex.: para não cobrir o WhatsApp)." },
      ],
      exemplos: [
        {
          titulo: "Botão",
          descricao: "Desça nesta página: o botão aparece no canto inferior direito.",
          html: `<a class="at-voltar-topo" href="#" data-at="voltar-topo" aria-label="Voltar ao topo">↑</a>`,
        },
      ],
    },

    {
      id: "carregar-mais",
      nome: "Carregar mais (scroll infinito)",
      categoria: "javascript",
      novo: true,
      resumo: "Carrega a próxima página de resultados quando a pessoa chega ao fim da lista, com botão de reserva.",
      apelidos: ["rolagem infinita", "infinite scroll", "carregar mais", "load more", "paginação automática", "feed", "lazy loading"],
      inspiradoEm: ["Instagram e X (feed)", "Pinterest", "Vinted (lista de resultados na app)"],
      quandoUsar: ["Feeds e vitrines em que a pessoa navega a explorar, sem procurar um item específico."],
      evitar: ["Listas em que a pessoa precisa de voltar a um ponto ou chegar ao rodapé: use Paginação."],
      comoFunciona:
        "Um IntersectionObserver percebe quando o marcador .at-carregar-mais chega perto do ecrã e dispara at:carregar. O seu código obtém a próxima página, coloca aria-busy enquanto carrega e esconde o marcador quando acabar. O botão dentro do marcador é a reserva para quem navega por teclado.",
      recursos: ["intersection-observer", "fetch"],
      mdn: [en("Intersection Observer API", "Web/API/Intersection_Observer_API"), pt("Fetch API", "Web/API/Fetch_API")],
      conectaCom: ["requisitar", "estado", "carregando", "produto"],
      acessibilidade: ["O botão \"Carregar mais\" garante o acesso para quem não faz scroll."],
      api: [
        { nome: "data-at=\"carregar-mais\"", tipo: "atributo", descricao: "No marcador .at-carregar-mais (coloque depois da lista)." },
        { nome: "at:carregar", tipo: "evento", descricao: "Hora de carregar mais itens." },
      ],
      exemplos: [
        {
          titulo: "Produtos de uma API",
          descricao: "Desça até ao fim da lista: novos produtos chegam sozinhos (dados reais do DummyJSON).",
          html: `<ul class="at-pilha" style="--at-gap: 8px; list-style: none; padding: 0; max-width: 420px" id="lista-infinita">
</ul>
<div class="at-carregar-mais" data-at="carregar-mais" id="marcador-infinito" style="max-width: 420px">
  <button class="at-botao at-pequeno">Carregar mais</button>
</div>`,
          js: `const lista = document.querySelector("#lista-infinita");
const marcador = document.querySelector("#marcador-infinito");
let pulados = 0;

async function carregar() {
  if (marcador.getAttribute("aria-busy") === "true") return;
  marcador.setAttribute("aria-busy", "true");
  try {
    const resposta = await Atalho.requisitar("https://dummyjson.com/products?limit=8&select=title,price&skip=" + pulados);
    for (const produto of resposta.products) {
      const item = document.createElement("li");
      item.className = "at-superficie at-linha at-entre";
      item.style.padding = "10px 14px";
      item.innerHTML = "<span></span><strong></strong>";
      item.querySelector("span").textContent = produto.title;
      item.querySelector("strong").textContent = Atalho.formatar.moeda(produto.price);
      lista.append(item);
    }
    pulados += resposta.products.length;
    if (pulados >= resposta.total) marcador.hidden = true;
  } catch (erro) {
    Atalho.notificar(erro.message, { tipo: "perigo" });
  } finally {
    marcador.removeAttribute("aria-busy");
  }
}

marcador.addEventListener("at:carregar", carregar);
carregar();`,
        },
      ],
    }
  );
})();
