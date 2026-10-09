(function () {
  const { pt, en, icone: i } = window.ATALHO_DOCS.util;

  window.ATALHO_DOCS.componentes.push(
    /* ======================================================================
       NAVEGAÇÃO
       ====================================================================== */
    {
      id: "barra",
      nome: "Barra de navegação",
      categoria: "navegacao",
      resumo: "Topo do site com marca, links, busca e ações. Fica fixa ao rolar, tem fundo translúcido e vira menu no celular.",
      apelidos: ["navbar", "menu", "header", "cabeçalho", "topo", "menu do site", "hambúrguer", "menu mobile", "nav"],
      inspiradoEm: ["Stripe e Vercel (barra translúcida fixa)", "Mercado Livre (busca e carrinho no topo)", "Apple (menu compacto no celular)"],
      quandoUsar: ["No topo de todo site e landing page."],
      comoFunciona:
        "No celular os links ficam escondidos; o botão com data-at-alternar=\"#id\" mostra/esconde a lista e atualiza aria-expanded. No desktop, a lista aparece sempre. Com muitos links, adicione at-barra-expandir-desktop: o menu fica recolhido também no tablet (até 1023px), para nada vazar da tela. Marque a página atual com aria-current=\"page\".",
      recursos: ["sticky-positioning", "backdrop-filter", "color-mix"],
      mdn: [pt("<nav>", "Web/HTML/Reference/Elements/nav"), pt("position: sticky", "Web/CSS/Reference/Properties/position")],
      conectaCom: ["menu-suspenso", "comando", "gaveta", "lateral"],
      acessibilidade: [
        "Comece a página com um link \"Pular para o conteúdo\" (classe at-pular-conteudo) para quem navega por teclado.",
        "aria-current=\"page\" faz o leitor de tela anunciar qual é a página atual.",
      ],
      api: [
        { nome: "at-barra / at-barra-conteudo", tipo: "classe", descricao: "Barra e container interno." },
        { nome: "at-barra-marca / at-barra-links / at-barra-acoes", tipo: "classe", descricao: "Partes da barra." },
        { nome: "at-barra-menu", tipo: "classe", descricao: "Botão que só aparece no celular." },
        { nome: "at-barra-expandir-desktop", tipo: "classe", descricao: "Na .at-barra: recolhe os links no menu até 1023px (celular e tablet). Use quando há mais de 4 ou 5 links." },
        { nome: "data-at-alternar=\"#id\"", tipo: "atributo", descricao: "Mostra/esconde o alvo (adiciona data-aberto)." },
      ],
      exemplos: [
        {
          titulo: "Barra de loja",
          descricao: "Diminua a janela para ver o menu do celular.",
          html: `<header class="at-barra">
  <div class="at-container at-barra-conteudo">
    <a href="#" class="at-barra-marca">◆ Minha Loja</a>

    <button class="at-botao at-icone at-fantasma at-barra-menu"
            data-at-alternar="#links-loja" aria-expanded="false" aria-controls="links-loja"
            aria-label="Abrir menu">
      ${i.menu}
    </button>

    <ul class="at-barra-links" id="links-loja">
      <li><a href="#" aria-current="page">Início</a></li>
      <li><a href="#">Ofertas do dia</a></li>
      <li><a href="#">Mais vendidos</a></li>
      <li><a href="#">Atendimento</a></li>
    </ul>

    <div class="at-barra-acoes">
      <a href="#" class="at-botao at-fantasma at-so-desktop">Entrar</a>
      <button class="at-botao at-icone at-contador-selo" aria-label="Carrinho: 2 itens">
        ${i.carrinho}
        <span data-contador aria-hidden="true">2</span>
      </button>
    </div>
  </div>
</header>`,
        },
      ],
    },

    {
      id: "lateral",
      nome: "Menu lateral de sistema",
      categoria: "navegacao",
      resumo: "O esqueleto de todo painel administrativo: menu à esquerda com seções e contadores, conteúdo à direita.",
      apelidos: ["sidebar", "menu lateral", "dashboard", "painel", "admin", "layout de sistema", "drawer menu", "aside"],
      inspiradoEm: ["Gmail", "Notion", "Linear", "Painel da Shopify"],
      quandoUsar: ["Em sistemas e painéis com muitas seções que a pessoa usa todos os dias."],
      comoFunciona:
        "O .at-app divide a tela em duas colunas. No celular, o menu vira uma faixa horizontal com rolagem no topo, sem JavaScript.",
      recursos: ["grid", "sticky-positioning"],
      mdn: [pt("Grid Layout", "Web/CSS/Guides/Grid_layout")],
      conectaCom: ["barra", "indicador", "tabela", "receita-painel"],
      acessibilidade: ["Use <nav aria-label=\"Menu principal\"> e aria-current=\"page\" no item ativo."],
      api: [
        { nome: "at-app", tipo: "classe", descricao: "Layout de duas colunas." },
        { nome: "at-lateral / at-lateral-topo / at-lateral-rodape", tipo: "classe", descricao: "Menu lateral." },
        { nome: "at-lateral-titulo / at-lateral-link", tipo: "classe", descricao: "Seção e link." },
        { nome: "at-app-conteudo", tipo: "classe", descricao: "Área de conteúdo." },
        { nome: "--at-largura-lateral", tipo: "variável", descricao: "Largura do menu (padrão 248px)." },
      ],
      exemplos: [
        {
          titulo: "Painel",
          html: `<div class="at-app">
  <aside class="at-lateral">
    <div class="at-lateral-topo"><a href="#" class="at-barra-marca">◆ Painel</a></div>
    <nav aria-label="Menu principal">
      <a href="#" class="at-lateral-link" aria-current="page">${i.casa} Início</a>
      <a href="#" class="at-lateral-link">${i.caixa} Pedidos <span class="at-selo at-primario">12</span></a>
      <a href="#" class="at-lateral-link">${i.usuarios} Clientes</a>
      <a href="#" class="at-lateral-link">${i.grafico} Relatórios</a>
      <span class="at-lateral-titulo">Conta</span>
      <a href="#" class="at-lateral-link">${i.ajustes} Configurações</a>
    </nav>
    <div class="at-lateral-rodape at-linha">
      <span class="at-avatar at-pequeno">MZ</span>
      <span class="at-texto-pequeno">Marcos Zorzetto</span>
    </div>
  </aside>
  <main class="at-app-conteudo">
    <h2 class="at-titulo-3">Bom dia, Marcos</h2>
    <p class="at-texto-suave">Você tem 12 pedidos aguardando envio.</p>
  </main>
</div>`,
        },
      ],
    },

    {
      id: "abas",
      nome: "Abas",
      categoria: "navegacao",
      resumo: "Divide conteúdo relacionado em painéis, mostrando um por vez. Funciona com mouse, teclado e leitor de tela.",
      apelidos: ["tabs", "aba", "guias", "segmented control", "alternar conteúdo", "painéis"],
      inspiradoEm: ["GitHub (Code, Issues, Pull requests)", "Configurações do Google", "iOS (controle segmentado)"],
      quandoUsar: ["Conteúdos do mesmo assunto que não precisam ser vistos ao mesmo tempo (Perfil / Segurança / Faturas)."],
      evitar: ["Etapas em sequência. Para isso, use Etapas."],
      comoFunciona:
        "Cada .at-aba aponta para seu painel com aria-controls. O Atalho completa os papéis ARIA, mostra o painel certo e ativa as setas do teclado, como recomenda o guia WAI-ARIA. Use .at-segmentado para o visual de botões encaixados.",
      recursos: [],
      mdn: [en("Papel tablist (ARIA)", "Web/Accessibility/ARIA/Reference/Roles/tablist_role")],
      conectaCom: ["cartao", "planos", "estado"],
      acessibilidade: ["Setas trocam de aba, Home/End vão para a primeira/última, e só a aba ativa entra no Tab."],
      api: [
        { nome: "data-at=\"abas\"", tipo: "atributo", descricao: "No container das abas." },
        { nome: "aria-controls=\"id-do-painel\"", tipo: "atributo", descricao: "Em cada .at-aba." },
        { nome: "aria-selected=\"true\"", tipo: "atributo", descricao: "Aba inicial (padrão: a primeira)." },
        { nome: "at-segmentado", tipo: "classe", descricao: "Visual de controle segmentado." },
        { nome: "at:aba", tipo: "evento", descricao: "Aba trocada. detail.aba e detail.painel." },
      ],
      exemplos: [
        {
          titulo: "Configurações da conta",
          html: `<div class="at-abas" data-at="abas" aria-label="Configurações">
  <button class="at-aba" aria-controls="painel-perfil">Perfil</button>
  <button class="at-aba" aria-controls="painel-seguranca">Segurança</button>
  <button class="at-aba" aria-controls="painel-faturas">Faturas</button>
</div>
<div class="at-painel" id="painel-perfil">Nome, foto e informações públicas.</div>
<div class="at-painel" id="painel-seguranca">Senha, verificação em duas etapas e dispositivos conectados.</div>
<div class="at-painel" id="painel-faturas">Histórico de pagamentos e notas fiscais.</div>`,
        },
        {
          titulo: "Segmentado",
          html: `<div class="at-abas at-segmentado" data-at="abas" aria-label="Visualização">
  <button class="at-aba" aria-controls="vis-lista">Lista</button>
  <button class="at-aba" aria-controls="vis-quadro">Quadro</button>
  <button class="at-aba" aria-controls="vis-calendario">Calendário</button>
</div>
<div class="at-painel" id="vis-lista">Visualização em lista.</div>
<div class="at-painel" id="vis-quadro">Visualização em quadro.</div>
<div class="at-painel" id="vis-calendario">Visualização em calendário.</div>`,
        },
      ],
    },

    {
      id: "trilha",
      nome: "Trilha (breadcrumb)",
      categoria: "navegacao",
      resumo: "Mostra onde a pessoa está e o caminho de volta: Início / Eletrônicos / Celulares.",
      apelidos: ["breadcrumb", "migalhas", "caminho", "trilha de navegação", "onde estou"],
      inspiradoEm: ["Amazon e Mercado Livre (categorias)", "Google Drive (pastas)"],
      quandoUsar: ["Sites com hierarquia: lojas, documentação, pastas de arquivos."],
      comoFunciona: "Uma lista ordenada dentro de <nav>. O separador é desenhado pelo CSS.",
      recursos: [],
      mdn: [en("aria-current", "Web/Accessibility/ARIA/Reference/Attributes/aria-current")],
      conectaCom: ["barra", "lateral"],
      acessibilidade: ["Dê um nome ao <nav> (aria-label=\"Você está em\") e marque o item atual com aria-current=\"page\"."],
      api: [{ nome: "at-trilha", tipo: "classe", descricao: "No <nav>." }],
      exemplos: [
        {
          titulo: "Categoria de loja",
          html: `<nav class="at-trilha" aria-label="Você está em">
  <ol>
    <li><a href="#">Início</a></li>
    <li><a href="#">Eletrônicos</a></li>
    <li><a href="#">Celulares</a></li>
    <li aria-current="page">Smartphone 128 GB</li>
  </ol>
</nav>`,
        },
      ],
    },

    {
      id: "paginacao",
      nome: "Paginação",
      categoria: "navegacao",
      resumo: "Navegação entre páginas de resultados com a contagem \"Mostrando 1–10 de 248\".",
      apelidos: ["pagination", "páginas", "próxima página", "anterior", "resultados"],
      inspiradoEm: ["Google (resultados de busca)", "Stripe Dashboard (tabelas)"],
      quandoUsar: ["Listas longas em que a pessoa precisa voltar a um ponto específico."],
      evitar: ["Feeds de redes sociais: lá, \"Carregar mais\" ou rolagem infinita funcionam melhor."],
      comoFunciona:
        "Para tabelas, a paginação é criada automaticamente (veja Tabela de dados). Este é o HTML para quando você pagina pelo servidor, com links de verdade.",
      recursos: [],
      mdn: [en("aria-current", "Web/Accessibility/ARIA/Reference/Attributes/aria-current")],
      conectaCom: ["tabela", "requisitar"],
      acessibilidade: ["Dê nome aos botões de seta (aria-label=\"Próxima página\")."],
      api: [
        { nome: "at-paginacao / at-paginacao-info / at-paginacao-botoes", tipo: "classe", descricao: "Estrutura." },
        { nome: "at-pagina", tipo: "classe", descricao: "Cada botão/link. Atual com aria-current=\"page\"." },
      ],
      exemplos: [
        {
          titulo: "Resultados",
          html: `<nav class="at-paginacao" aria-label="Paginação">
  <span class="at-paginacao-info">Mostrando 11–20 de 248</span>
  <div class="at-paginacao-botoes">
    <a class="at-pagina" href="?pagina=1" aria-label="Página anterior">‹</a>
    <a class="at-pagina" href="?pagina=1">1</a>
    <a class="at-pagina" href="?pagina=2" aria-current="page">2</a>
    <a class="at-pagina" href="?pagina=3">3</a>
    <span class="at-pagina" aria-hidden="true">…</span>
    <a class="at-pagina" href="?pagina=25">25</a>
    <a class="at-pagina" href="?pagina=3" aria-label="Próxima página">›</a>
  </div>
</nav>`,
        },
      ],
    },

    {
      id: "etapas",
      nome: "Etapas",
      categoria: "navegacao",
      resumo: "Mostra o progresso num processo em partes, como carrinho → entrega → pagamento → confirmação.",
      apelidos: ["stepper", "passos", "wizard", "checkout", "progresso do cadastro", "etapas do pedido", "steps"],
      inspiradoEm: ["Mercado Livre e Amazon (checkout)", "Abertura de conta em bancos digitais"],
      quandoUsar: ["Processos com 3 a 5 etapas em ordem fixa."],
      comoFunciona:
        "Marque as etapas concluídas com data-estado=\"feito\" e a atual com aria-current=\"step\". Os números e as linhas são desenhados pelo CSS.",
      recursos: [],
      mdn: [en("aria-current", "Web/Accessibility/ARIA/Reference/Attributes/aria-current")],
      conectaCom: ["validacao", "receita-login", "estado"],
      acessibilidade: ["aria-current=\"step\" faz o leitor de tela anunciar \"etapa atual\"."],
      api: [
        { nome: "at-etapas", tipo: "classe", descricao: "No <ol>." },
        { nome: "data-estado=\"feito\"", tipo: "atributo", descricao: "Etapa concluída." },
        { nome: "aria-current=\"step\"", tipo: "atributo", descricao: "Etapa atual." },
      ],
      exemplos: [
        {
          titulo: "Checkout",
          html: `<ol class="at-etapas" id="etapas-checkout">
  <li data-estado="feito">Carrinho</li>
  <li aria-current="step">Entrega</li>
  <li>Pagamento</li>
  <li>Confirmação</li>
</ol>
<div class="at-linha at-centro at-mt-6">
  <button class="at-botao" id="etapa-voltar">Voltar</button>
  <button class="at-botao at-primario" id="etapa-avancar">Continuar</button>
</div>`,
          js: `const etapas = [...document.querySelectorAll("#etapas-checkout li")];
let atual = 1;

function mostrar() {
  etapas.forEach((etapa, indice) => {
    if (indice === atual) etapa.setAttribute("aria-current", "step");
    else etapa.removeAttribute("aria-current");
    if (indice < atual) etapa.dataset.estado = "feito";
    else delete etapa.dataset.estado;
  });
}

document.querySelector("#etapa-avancar").addEventListener("click", () => {
  atual = Math.min(atual + 1, etapas.length - 1);
  mostrar();
});
document.querySelector("#etapa-voltar").addEventListener("click", () => {
  atual = Math.max(atual - 1, 0);
  mostrar();
});`,
        },
      ],
    },

    {
      id: "comando",
      nome: "Busca rápida (Ctrl+K)",
      categoria: "navegacao",
      resumo: "Uma caixa de busca que abre com Ctrl+K e leva a qualquer página ou ação em segundos. É a busca deste site.",
      apelidos: ["command palette", "ctrl k", "cmd k", "paleta de comandos", "busca", "pesquisa", "spotlight", "atalho de teclado", "search"],
      inspiradoEm: ["GitHub", "Vercel", "Linear", "Slack", "macOS Spotlight"],
      quandoUsar: ["Sistemas com muitas páginas ou ações, para quem usa todo dia e prefere o teclado."],
      comoFunciona:
        "É um <dialog> com um campo e uma lista. O filtro ignora acentos e maiúsculas, as setas escolhem o item e Enter abre. Com data-at-tecla, Ctrl+K (⌘K no Mac) abre de qualquer lugar da página. Use data-palavras nos itens para sinônimos.",
      recursos: ["dialog"],
      mdn: [pt("<dialog>", "Web/HTML/Reference/Elements/dialog"), en("Papel combobox (ARIA)", "Web/Accessibility/ARIA/Reference/Roles/combobox_role")],
      conectaCom: ["barra", "modal"],
      acessibilidade: ["O campo usa role=\"combobox\" com aria-activedescendant, para o leitor de tela anunciar o item escolhido com as setas."],
      api: [
        { nome: "dialog.at-comando + data-at=\"comando\"", tipo: "atributo", descricao: "A paleta." },
        { nome: "data-at-tecla", tipo: "atributo", descricao: "Abre com Ctrl+K / ⌘K." },
        { nome: "at-comando-item + data-palavras", tipo: "classe", descricao: "Item e sinônimos para a busca." },
        { nome: "at-comando-grupo / at-comando-vazio", tipo: "classe", descricao: "Título de grupo e mensagem sem resultados." },
      ],
      exemplos: [
        {
          titulo: "Paleta de um sistema",
          descricao: "Clique no botão. Na sua página, com data-at-tecla, Ctrl+K também abre.",
          html: `<button class="at-botao" commandfor="paleta-demo" command="show-modal">
  ${i.busca} Buscar… <kbd class="at-tecla">Ctrl K</kbd>
</button>

<dialog class="at-comando" id="paleta-demo" data-at="comando" aria-label="Busca rápida">
  <div class="at-comando-busca">
    ${i.busca}
    <input placeholder="O que você procura?" aria-label="Buscar" autofocus>
  </div>
  <ul class="at-comando-lista">
    <li class="at-comando-grupo">Páginas</li>
    <li><a class="at-comando-item" href="#">${i.casa} Início</a></li>
    <li><a class="at-comando-item" href="#" data-palavras="vendas compras">${i.caixa} Pedidos</a></li>
    <li><a class="at-comando-item" href="#" data-palavras="usuários pessoas">${i.usuarios} Clientes</a></li>
    <li class="at-comando-grupo">Ações</li>
    <li><button class="at-comando-item" data-at-notificar="Pedido criado">Novo pedido <small>N</small></button></li>
    <li><button class="at-comando-item" data-at-tema="alternar" data-palavras="dark escuro claro">${i.lua} Alternar tema</button></li>
  </ul>
  <p class="at-comando-vazio" hidden>Nada encontrado.</p>
  <div class="at-comando-rodape"><span>↑↓ navegar</span><span>Enter abrir</span><span>Esc fechar</span></div>
</dialog>`,
        },
      ],
    },

    /* ======================================================================
       JANELAS E AVISOS
       ====================================================================== */
    {
      id: "modal",
      nome: "Modal (janela de diálogo)",
      categoria: "sobreposicoes",
      resumo: "Janela por cima da página para confirmar algo importante ou preencher um formulário rápido. Abre sem escrever JavaScript.",
      apelidos: ["modal", "popup", "pop-up", "janela", "dialog", "caixa de diálogo", "confirmação", "overlay", "alerta de confirmação"],
      inspiradoEm: ["GitHub (excluir repositório digitando o nome)", "Google Drive (compartilhar)", "Stripe (confirmações)"],
      quandoUsar: ["Confirmar ações irreversíveis.", "Formulários curtos que não merecem uma página (renomear, convidar)."],
      evitar: ["Conteúdo longo ou abrir um modal de dentro de outro. Use uma página ou uma gaveta."],
      comoFunciona:
        "É o elemento nativo <dialog>. O botão com commandfor=\"id\" command=\"show-modal\" abre o modal sem nenhuma linha de JavaScript (invoker commands, padrão dos navegadores desde 2025; o Atalho cobre os mais antigos). O navegador cuida do foco, da tecla Esc e de bloquear o resto da página; o Atalho fecha ao clicar no fundo e trava a rolagem. Botões dentro de <form method=\"dialog\"> fecham o modal e o value do botão fica em dialog.returnValue.",
      recursos: ["dialog", "invoker-commands", "has", "starting-style"],
      mdn: [
        pt("<dialog>", "Web/HTML/Reference/Elements/dialog"),
        en("Invoker Commands API", "Web/API/Invoker_Commands_API"),
        en("showModal()", "Web/API/HTMLDialogElement/showModal"),
      ],
      conectaCom: ["botao", "validacao", "notificacao", "gaveta"],
      acessibilidade: [
        "Dê um título ao modal e ligue com aria-labelledby.",
        "O foco vai para dentro do modal ao abrir e volta para o botão ao fechar (o navegador faz isso).",
      ],
      api: [
        { nome: "commandfor=\"id\" command=\"show-modal\"", tipo: "atributo", descricao: "No botão que abre (HTML nativo)." },
        { nome: "command=\"close\"", tipo: "atributo", descricao: "No botão que fecha." },
        { nome: "dialog.at-modal", tipo: "classe", descricao: "O modal. Tamanhos: at-pequeno, at-grande." },
        { nome: "at-modal-cabecalho / -corpo / -rodape", tipo: "classe", descricao: "Partes." },
        { nome: "data-at-fixo", tipo: "atributo", descricao: "Não fecha ao clicar fora." },
        { nome: "dialog.showModal() / .close()", tipo: "função", descricao: "Abrir/fechar por JavaScript." },
      ],
      exemplos: [
        {
          titulo: "Confirmação simples",
          html: `<button class="at-botao at-perigo" commandfor="modal-sair" command="show-modal">Cancelar assinatura</button>

<dialog class="at-modal at-pequeno" id="modal-sair" aria-labelledby="modal-sair-titulo">
  <form method="dialog">
    <div class="at-modal-corpo">
      <h3 id="modal-sair-titulo" class="at-titulo-4">Cancelar assinatura?</h3>
      <p class="at-texto-suave">Você continua com acesso até 30/11. Depois disso, seus projetos ficam somente leitura.</p>
    </div>
    <div class="at-modal-rodape">
      <button class="at-botao at-fantasma" value="manter">Manter assinatura</button>
      <button class="at-botao at-perigo" value="cancelar">Cancelar assinatura</button>
    </div>
  </form>
</dialog>`,
          js: `document.querySelector("#modal-sair").addEventListener("close", (evento) => {
  if (evento.target.returnValue === "cancelar") {
    Atalho.notificar("Assinatura cancelada.", { tipo: "aviso" });
  }
});`,
        },
        {
          titulo: "Excluir digitando o nome (padrão GitHub)",
          descricao: "Para ações destrutivas, exigir que a pessoa digite o nome evita cliques por engano.",
          html: `<button class="at-botao at-perigo" commandfor="modal-excluir" command="show-modal">${i.lixo} Excluir projeto</button>

<dialog class="at-modal" id="modal-excluir" aria-labelledby="modal-excluir-titulo">
  <form method="dialog">
    <div class="at-modal-cabecalho">
      <h3 id="modal-excluir-titulo">Excluir loja-virtual</h3>
      <button type="button" class="at-botao at-icone at-fantasma at-pequeno" commandfor="modal-excluir" command="close" aria-label="Fechar">${i.fechar}</button>
    </div>
    <div class="at-modal-corpo at-pilha">
      <div class="at-alerta at-perigo">
        <div class="at-alerta-conteudo">Isso apaga o projeto, os pedidos e as configurações. Não dá para desfazer.</div>
      </div>
      <div class="at-campo">
        <label class="at-rotulo" for="confirma-nome">Digite <strong>loja-virtual</strong> para confirmar</label>
        <input class="at-entrada" id="confirma-nome" autocomplete="off" autofocus>
      </div>
    </div>
    <div class="at-modal-rodape">
      <button class="at-botao at-perigo at-bloco" id="botao-excluir" value="excluir" disabled>Entendi, excluir este projeto</button>
    </div>
  </form>
</dialog>`,
          js: `const campo = document.querySelector("#confirma-nome");
const botao = document.querySelector("#botao-excluir");
const modal = document.querySelector("#modal-excluir");

campo.addEventListener("input", () => {
  botao.disabled = campo.value !== "loja-virtual";
});

modal.addEventListener("close", () => {
  if (modal.returnValue === "excluir") {
    Atalho.notificar("Projeto excluído.", { tipo: "perigo" });
  }
  campo.value = "";
  botao.disabled = true;
  modal.returnValue = "";
});`,
        },
      ],
    },

    {
      id: "gaveta",
      nome: "Gaveta (painel lateral)",
      categoria: "sobreposicoes",
      resumo: "Painel que desliza da lateral: carrinho de compras, filtros, detalhes de um item ou menu no celular.",
      apelidos: ["drawer", "offcanvas", "painel lateral", "carrinho lateral", "sheet", "slide over", "side panel", "filtros"],
      inspiradoEm: ["Amazon e iFood (carrinho lateral)", "Airbnb (filtros)", "Linear (detalhes da tarefa)"],
      quandoUsar: ["Conteúdo de apoio que não deve tirar a pessoa da página atual."],
      comoFunciona:
        "É um <dialog> com a classe at-gaveta: abre e fecha igual ao modal (commandfor/command) e ganha animação de deslizar. Use at-esquerda para abrir pelo outro lado.",
      recursos: ["dialog", "invoker-commands", "starting-style", "transition-behavior"],
      mdn: [pt("<dialog>", "Web/HTML/Reference/Elements/dialog"), en("@starting-style", "Web/CSS/Reference/At-rules/@starting-style")],
      conectaCom: ["modal", "estado", "receita-loja", "barra"],
      acessibilidade: ["Como é um dialog modal, o foco fica preso dentro da gaveta enquanto está aberta."],
      api: [
        { nome: "dialog.at-gaveta", tipo: "classe", descricao: "Gaveta pela direita." },
        { nome: "at-esquerda", tipo: "classe", descricao: "Abre pela esquerda." },
      ],
      exemplos: [
        {
          titulo: "Filtros de busca",
          html: `<button class="at-botao" commandfor="gaveta-filtros" command="show-modal">${i.filtro} Filtros</button>

<dialog class="at-gaveta" id="gaveta-filtros" aria-labelledby="filtros-titulo">
  <div class="at-modal-cabecalho">
    <h3 id="filtros-titulo">Filtros</h3>
    <button class="at-botao at-icone at-fantasma at-pequeno" commandfor="gaveta-filtros" command="close" aria-label="Fechar">${i.fechar}</button>
  </div>
  <div class="at-modal-corpo at-pilha">
    <fieldset style="border:0;padding:0;margin:0" class="at-pilha">
      <legend class="at-rotulo at-mb-2">Entrega</legend>
      <label class="at-check"><input type="checkbox" checked> Frete grátis</label>
      <label class="at-check"><input type="checkbox"> Chega amanhã</label>
    </fieldset>
    <div class="at-campo">
      <label class="at-rotulo" for="filtro-ordem">Ordenar por</label>
      <select class="at-entrada" id="filtro-ordem">
        <option>Mais relevantes</option>
        <option>Menor preço</option>
        <option>Maior preço</option>
      </select>
    </div>
  </div>
  <div class="at-modal-rodape">
    <button class="at-botao at-fantasma" commandfor="gaveta-filtros" command="close">Limpar</button>
    <button class="at-botao at-primario" commandfor="gaveta-filtros" command="close">Ver 128 resultados</button>
  </div>
</dialog>`,
        },
      ],
    },

    {
      id: "dica",
      nome: "Dica (tooltip)",
      categoria: "sobreposicoes",
      resumo: "Texto curto que aparece ao passar o mouse ou focar com o teclado, explicando um ícone.",
      apelidos: ["tooltip", "dica", "hint", "balão", "title", "legenda do ícone", "hover"],
      inspiradoEm: ["Google Docs (botões da barra de ferramentas)", "Figma"],
      quandoUsar: ["Explicar botões que só têm ícone."],
      evitar: ["Informação essencial: no celular não existe \"passar o mouse\"."],
      comoFunciona: "Só CSS: data-at-dica=\"texto\". Use data-at-dica-lado=\"baixo\" quando o elemento estiver no topo da tela.",
      recursos: [],
      mdn: [pt("aria-label", "Web/Accessibility/ARIA/Reference/Attributes/aria-label")],
      conectaCom: ["botao"],
      acessibilidade: ["A dica é visual. Em botões só com ícone, mantenha também o aria-label com o mesmo texto."],
      api: [
        { nome: "data-at-dica=\"texto\"", tipo: "atributo", descricao: "Texto da dica." },
        { nome: "data-at-dica-lado=\"baixo\"", tipo: "atributo", descricao: "Mostra abaixo do elemento." },
      ],
      exemplos: [
        {
          titulo: "Barra de ferramentas",
          html: `<div class="at-linha" style="padding-top: 2rem">
  <button class="at-botao at-icone" data-at-dica="Editar" aria-label="Editar">${i.editar}</button>
  <button class="at-botao at-icone" data-at-dica="Copiar link" aria-label="Copiar link">${i.copiar}</button>
  <button class="at-botao at-icone" data-at-dica="Baixar PDF" aria-label="Baixar PDF">${i.baixar}</button>
  <button class="at-botao at-icone" data-at-dica="Mover para a lixeira" data-at-dica-lado="baixo" aria-label="Mover para a lixeira">${i.lixo}</button>
</div>`,
        },
      ],
    },

    {
      id: "notificacao",
      nome: "Notificação (toast)",
      categoria: "sobreposicoes",
      resumo: "Mensagem rápida no canto da tela confirmando o que aconteceu, com botão de Desfazer opcional.",
      apelidos: ["toast", "snackbar", "notificação", "aviso", "mensagem de sucesso", "alerta flutuante", "desfazer", "feedback"],
      inspiradoEm: ["Gmail (\"Mensagem arquivada. Desfazer\")", "Vercel (notificações empilhadas)", "Material Design (snackbar)"],
      quandoUsar: ["Confirmar uma ação que deu certo (salvou, copiou, enviou).", "Oferecer Desfazer em vez de pedir confirmação antes."],
      evitar: ["Erros que a pessoa precisa resolver: mostre perto do problema, com um Alerta."],
      comoFunciona:
        "Atalho.notificar(\"texto\", opções). As notificações empilham (no máximo 4), somem sozinhas e pausam quando o mouse está em cima. Elas aparecem até por cima de um modal aberto, porque usam a camada superior do navegador (popover).",
      recursos: ["popover"],
      mdn: [en("aria-live", "Web/Accessibility/ARIA/Reference/Attributes/aria-live")],
      conectaCom: ["validacao", "copiar", "estado", "receita-loja"],
      acessibilidade: ["A área de notificações tem aria-live=\"polite\": o leitor de tela lê a mensagem sem interromper. Erros usam role=\"alert\"."],
      api: [
        { nome: "Atalho.notificar(texto, opções)", tipo: "função", descricao: "Retorna { fechar() }." },
        { nome: "tipo", tipo: "opção", descricao: "\"sucesso\", \"perigo\", \"aviso\" ou \"info\"." },
        { nome: "titulo", tipo: "opção", descricao: "Texto em negrito acima da mensagem." },
        { nome: "duracao", tipo: "opção", descricao: "Milissegundos (padrão 4500). 0 = só fecha manualmente." },
        { nome: "acao: { texto, aoClicar }", tipo: "opção", descricao: "Botão de ação, como Desfazer." },
        { nome: "data-at-notificar=\"texto\" + data-at-tipo", tipo: "atributo", descricao: "Sem JavaScript, direto no botão." },
      ],
      exemplos: [
        {
          titulo: "Tipos",
          html: `<div class="at-linha">
  <button class="at-botao" data-at-notificar="Alterações salvas." data-at-tipo="sucesso">Sucesso</button>
  <button class="at-botao" data-at-notificar="Não foi possível conectar." data-at-tipo="perigo">Erro</button>
  <button class="at-botao" data-at-notificar="Seu plano vence em 3 dias." data-at-tipo="aviso">Aviso</button>
  <button class="at-botao" data-at-notificar="Nova versão disponível." data-at-tipo="info">Info</button>
</div>`,
        },
        {
          titulo: "Arquivar com Desfazer (padrão Gmail)",
          html: `<ul class="at-pilha" id="lista-emails" style="--at-gap: 8px; list-style: none; padding: 0; max-width: 420px">
  <li class="at-superficie at-linha at-entre" style="padding: 12px 16px">
    Fatura de outubro
    <button class="at-botao at-pequeno" data-arquivar>Arquivar</button>
  </li>
  <li class="at-superficie at-linha at-entre" style="padding: 12px 16px">
    Seu pedido foi enviado
    <button class="at-botao at-pequeno" data-arquivar>Arquivar</button>
  </li>
</ul>`,
          js: `document.querySelector("#lista-emails").addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-arquivar]");
  if (!botao) return;
  const item = botao.closest("li");
  item.hidden = true;

  Atalho.notificar("Conversa arquivada.", {
    acao: { texto: "Desfazer", aoClicar: () => (item.hidden = false) },
  });
});`,
        },
      ],
    }
  );
})();
