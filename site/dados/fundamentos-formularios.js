(function () {
  const { pt, en, icone: i } = window.ATALHO_DOCS.util;
  const CDN = "https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho";

  window.ATALHO_DOCS.componentes.push(
    /* ======================================================================
       COMECE AQUI
       ====================================================================== */
    {
      id: "instalacao",
      nome: "Instalação",
      categoria: "fundamentos",
      resumo: "Duas linhas no seu HTML e todos os componentes funcionam. Sem npm, sem build, sem configuração.",
      apelidos: ["instalar", "começar", "como usar", "cdn", "setup", "importar", "download", "getting started"],
      inspiradoEm: ["Bootstrap (uso por CDN)", "Alpine.js (atributos no HTML)"],
      quandoUsar: [
        "Em qualquer página HTML, do primeiro projeto do curso ao sistema da empresa.",
        "Quando quer um resultado profissional sem montar um ambiente com Node, React e bundler.",
      ],
      comoFunciona:
        "O CSS traz o visual de todos os componentes. O JavaScript observa a página e liga sozinho tudo o que tiver atributos data-at-..., inclusive HTML que chegar depois via fetch. Não precisa de chamar nenhuma função de inicialização. Use defer nos scripts: são executados pela ordem em que aparecem, depois de o HTML terminar de carregar.",
      recursos: ["js-modules", "custom-properties", "dialog", "popover"],
      mdn: [
        pt("Aprenda desenvolvimento web (curso do MDN)", "Learn_web_development"),
        pt("Estruturar conteúdo com HTML", "Learn_web_development/Core/Structuring_content"),
        pt("JavaScript: primeiros passos", "Learn_web_development/Core/Scripting"),
      ],
      conectaCom: ["cores-e-temas", "estado", "eventos"],
      acessibilidade: [
        "Mantenha lang=\"pt-PT\" no <html> (ou \"pt-BR\", \"en\"): os leitores de ecrã usam isso para pronunciar o texto, e o Atalho escolhe o idioma das mensagens e a moeda (euro, ou real no pt-BR).",
        "O meta viewport é obrigatório para o site funcionar bem no telemóvel.",
      ],
      api: [
        { nome: "atalho.css", tipo: "ficheiro", descricao: "Estilos de todos os componentes. Classes começam com at-." },
        { nome: "atalho.js", tipo: "ficheiro", descricao: "Comportamentos. Cria o objeto global window.Atalho." },
        { nome: "data-at=\"...\"", tipo: "atributo", descricao: "Liga um componente com comportamento (abas, tabela, kanban...)." },
        { nome: "at:pronto", tipo: "evento", descricao: "Disparado no document quando o Atalho terminou de ligar a página." },
      ],
      exemplos: [
        {
          titulo: "Página mínima",
          descricao: "Copie, guarde como index.html e abra no navegador. Pronto.",
          somenteCodigo: true,
          html: `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>O meu projeto</title>

  <link rel="stylesheet" href="${CDN}/atalho.css">
  <script src="${CDN}/atalho.js" defer></script>
  <!-- O seu código depois do Atalho, também com defer -->
  <script src="app.js" defer></script>
</head>
<body>
  <main class="at-container at-secao">
    <h1 class="at-titulo-2">Olá, mundo</h1>
    <button class="at-botao at-primario" data-at-notificar="Funcionou!">
      Clique aqui
    </button>
  </main>
</body>
</html>`,
        },
        {
          titulo: "A testar agora",
          descricao: "O mesmo botão do exemplo acima, a correr nesta página.",
          html: `<button class="at-botao at-primario" data-at-notificar="Funcionou! O Atalho está instalado.">
  Clique aqui
</button>`,
        },
        {
          titulo: "Descarregar os ficheiros (sem internet)",
          descricao: "Se preferir não depender de CDN, descarregue atalho.css e atalho.js do GitHub e aponte para a sua pasta.",
          somenteCodigo: true,
          html: `<link rel="stylesheet" href="css/atalho.css">
<script src="js/atalho.js" defer></script>`,
        },
      ],
    },

    {
      id: "cores-e-temas",
      nome: "Cores e tema escuro",
      categoria: "fundamentos",
      resumo: "Todas as cores, espaços e cantos vêm de variáveis CSS. Troque uma linha e o site inteiro muda de identidade.",
      apelidos: ["cor", "cores", "tema", "dark mode", "modo escuro", "personalizar", "variáveis", "tokens", "paleta", "identidade visual", "css variables"],
      inspiradoEm: ["GitHub (Primer: tokens de design)", "Material Design 3 (tokens de cor)", "Tailwind CSS (escala de espaçamento)"],
      quandoUsar: [
        "Para aplicar as cores da sua marca sem mexer no CSS da biblioteca.",
        "Para oferecer tema escuro, que hoje é esperado em qualquer sistema.",
      ],
      comoFunciona:
        "Variáveis CSS (custom properties) são herdadas como qualquer propriedade. Redefinir --at-cor-primaria no :root muda o site todo; redefinir dentro de um elemento muda só aquele trecho. O tema escuro segue o sistema operativo automaticamente; o botão com data-at-tema troca e lembra a escolha.",
      recursos: ["custom-properties", "prefers-color-scheme", "color-mix", "color-scheme"],
      mdn: [
        pt("Utilizar variáveis CSS (custom properties)", "Web/CSS/Guides/Cascading_variables/Using_custom_properties"),
        pt("prefers-color-scheme", "Web/CSS/Reference/At-rules/@media/prefers-color-scheme"),
        en("color-mix()", "Web/CSS/Reference/Values/color_value/color-mix"),
      ],
      conectaCom: ["instalacao", "botao", "barra"],
      acessibilidade: [
        "Ao trocar a cor primária, verifique o contraste do texto sobre ela (mínimo 4.5:1). Use --at-cor-sobre-primaria para ajustar.",
        "O botão de tema recebe aria-pressed automaticamente, por isso os leitores de ecrã anunciam se o modo escuro está ligado.",
      ],
      api: [
        { nome: "--at-cor-primaria", tipo: "variável", descricao: "Cor principal (botões, links, foco)." },
        { nome: "--at-cor-primaria-forte / -suave", tipo: "variável", descricao: "Tons para hover e fundos leves." },
        { nome: "--at-cor-sobre-primaria", tipo: "variável", descricao: "Cor do texto em cima da cor primária." },
        { nome: "--at-fonte", tipo: "variável", descricao: "Família de fonte do texto." },
        { nome: "--at-raio / --at-raio-lg", tipo: "variável", descricao: "Arredondamento dos cantos." },
        { nome: "data-tema=\"claro|escuro\"", tipo: "atributo", descricao: "No <html>, força um tema." },
        { nome: "data-at-tema=\"alternar\"", tipo: "atributo", descricao: "Botão que troca o tema e guarda a preferência." },
        { nome: "Atalho.definirTema(\"escuro\")", tipo: "função", descricao: "Troca o tema via JavaScript (\"claro\", \"escuro\" ou \"sistema\")." },
        { nome: "at:tema", tipo: "evento", descricao: "Disparado quando o tema muda. detail.tema traz o tema atual." },
      ],
      exemplos: [
        {
          titulo: "A sua marca numa linha",
          descricao: "Coloque isto no seu CSS, depois do atalho.css.",
          somenteCodigo: true,
          html: `<style>
  :root {
    --at-cor-primaria: #7c3aed;        /* roxo da sua marca */
    --at-cor-primaria-forte: #6d28d9;  /* hover */
    --at-cor-primaria-suave: #ede9fe;  /* fundos leves */
    --at-raio: 12px;                   /* cantos mais redondos */
    --at-fonte: "Inter", system-ui, sans-serif;
  }
</style>`,
        },
        {
          titulo: "Trocar só um trecho",
          descricao: "Variáveis definidas num elemento valem só para ele e os seus filhos.",
          html: `<div class="at-linha">
  <button class="at-botao at-primario">Padrão</button>

  <div class="at-linha" style="--at-cor-primaria: #7c3aed; --at-cor-primaria-forte: #6d28d9; --at-cor-sobre-primaria: #fff;">
    <button class="at-botao at-primario">Roxo</button>
  </div>

  <div class="at-linha" style="--at-cor-primaria: #c2410c; --at-cor-primaria-forte: #9a3412; --at-cor-sobre-primaria: #fff; --at-raio: 999px;">
    <button class="at-botao at-primario">Laranja arredondado</button>
  </div>
</div>`,
        },
        {
          titulo: "Botão de tema claro/escuro",
          html: `<button class="at-botao at-icone" data-at-tema="alternar" aria-label="Alternar tema escuro">
  ${i.lua}
</button>`,
        },
        {
          titulo: "Sem \"piscar\" ao carregar",
          descricao: "Cole no <head>, antes do CSS, para a página já abrir no tema que a pessoa escolheu.",
          somenteCodigo: true,
          html: `<script>
  try {
    const tema = JSON.parse(localStorage.getItem("atalho:tema"));
    if (tema) document.documentElement.dataset.tema = tema;
  } catch {}
</script>`,
        },
      ],
    },

    {
      id: "layout",
      nome: "Layout e grade",
      categoria: "fundamentos",
      resumo: "Container, grade que se ajusta sozinha, colunas, pilha e linha. Resolve 95% dos layouts sem escrever media query.",
      apelidos: ["grid", "grade", "colunas", "container", "flex", "flexbox", "responsivo", "alinhar", "centralizar", "row", "col", "espaçamento", "lado a lado"],
      inspiradoEm: ["Every Layout (pilha, linha e grade intrínseca)", "Bootstrap (container)", "Vercel e Linear (grades de cartões)"],
      quandoUsar: [
        "at-grade: listas de cartões, produtos, fotos. O número de colunas adapta-se ao ecrã.",
        "at-colunas-2/3/4: quando quer no máximo N colunas. Funciona até dentro de painéis e cartões, porque olha para o espaço do container, não o tamanho do ecrã.",
        "at-pilha: empilhar coisas com o mesmo espaço entre elas (formulários, secções).",
        "at-linha: colocar itens lado a lado (botões, ícone + texto).",
      ],
      comoFunciona:
        "A grade usa repeat(auto-fill, minmax(...)): o navegador calcula quantas colunas cabem. Por isso não existem classes como col-md-6 aqui; mude a largura mínima com style=\"--min: 200px\" e o espaçamento com --at-gap.",
      recursos: ["grid", "flexbox", "flexbox-gap", "min-max-clamp"],
      mdn: [
        pt("Grid Layout", "Web/CSS/Guides/Grid_layout"),
        pt("Flexbox", "Web/CSS/Guides/Flexible_box_layout"),
      ],
      conectaCom: ["cartao", "produto", "indicador"],
      acessibilidade: ["Mantenha a ordem do HTML igual à ordem visual. Quem navega com Tab segue a ordem do código."],
      api: [
        { nome: "at-container", tipo: "classe", descricao: "Centra com largura máxima. Junte at-estreito para textos." },
        { nome: "at-secao", tipo: "classe", descricao: "Espaço vertical generoso para secções de página." },
        { nome: "at-grade", tipo: "classe", descricao: "Grade automática. Ajuste com --min (largura mínima do item)." },
        { nome: "at-colunas-2 / -3 / -4", tipo: "classe", descricao: "No máximo 2, 3 ou 4 colunas. Usa menos quando o espaço do container não comporta (ajuste com --min). A de 4 vai diretamente para 2, sem deixar um item sozinho (3 + 1)." },
        { nome: "at-pilha", tipo: "classe", descricao: "Coluna com espaço igual. Ajuste com --at-gap." },
        { nome: "at-linha", tipo: "classe", descricao: "Lado a lado com quebra. Combine com at-entre, at-fim, at-centro, at-topo." },
        { nome: "at-cresce", tipo: "classe", descricao: "Item da linha que ocupa o espaço que sobrar." },
      ],
      exemplos: [
        {
          titulo: "Grade automática",
          descricao: "Diminua a janela: as colunas reorganizam-se sozinhas.",
          html: `<div class="at-grade" style="--min: 160px; --at-gap: 12px;">
  <div class="at-superficie">1</div>
  <div class="at-superficie">2</div>
  <div class="at-superficie">3</div>
  <div class="at-superficie">4</div>
  <div class="at-superficie">5</div>
</div>`,
        },
        {
          titulo: "Linha com itens nas pontas",
          descricao: "O padrão de quase todos os cabeçalhos de secção: título à esquerda, ação à direita.",
          html: `<div class="at-linha at-entre">
  <h3 class="at-titulo-4 at-mb-0">Pedidos recentes</h3>
  <button class="at-botao at-primario at-pequeno">Novo pedido</button>
</div>`,
        },
        {
          titulo: "Pilha",
          html: `<div class="at-pilha" style="--at-gap: 8px; max-width: 320px;">
  <div class="at-superficie">Primeiro</div>
  <div class="at-superficie">Segundo</div>
  <div class="at-superficie">Terceiro</div>
</div>`,
        },
      ],
    },

    {
      id: "tipografia",
      nome: "Texto e tipografia",
      categoria: "fundamentos",
      resumo: "Títulos, chamadas, texto secundário e teclas de atalho com hierarquia clara.",
      apelidos: ["título", "fonte", "texto", "heading", "h1", "parágrafo", "kbd", "tecla", "tamanho da letra"],
      inspiradoEm: ["Stripe e Vercel (títulos grandes com letras próximas)", "GitHub (teclas <kbd>)"],
      quandoUsar: ["Para dar hierarquia: o olho precisa saber o que ler primeiro."],
      comoFunciona:
        "As classes at-titulo-* mudam só a aparência, por isso escolhe a tag pela importância (h1, h2...) e o tamanho pela classe. O título principal usa clamp() e cresce com o ecrã.",
      recursos: ["min-max-clamp", "text-wrap-balance"],
      mdn: [pt("Estruturar conteúdo com HTML", "Learn_web_development/Core/Structuring_content")],
      conectaCom: ["hero", "layout"],
      acessibilidade: ["Use só um <h1> por página e não salte níveis (h2 depois de h1, h3 depois de h2)."],
      api: [
        { nome: "at-titulo-1 ... at-titulo-4", tipo: "classe", descricao: "Tamanhos de título." },
        { nome: "at-sobretitulo", tipo: "classe", descricao: "Texto pequeno em maiúsculas acima do título." },
        { nome: "at-chamada", tipo: "classe", descricao: "Parágrafo de introdução maior e mais suave." },
        { nome: "at-texto-suave / at-texto-pequeno", tipo: "classe", descricao: "Texto secundário." },
        { nome: "at-tecla", tipo: "classe", descricao: "Desenho de tecla. Use com <kbd>." },
      ],
      exemplos: [
        {
          titulo: "Hierarquia de uma secção",
          html: `<span class="at-sobretitulo">Novidade</span>
<h2 class="at-titulo-2">Relatórios em tempo real</h2>
<p class="at-chamada">Acompanhe vendas, stock e clientes num só lugar, atualizado a cada minuto.</p>
<p class="at-texto-suave at-texto-pequeno">
  Prima <kbd class="at-tecla">Ctrl</kbd> + <kbd class="at-tecla">K</kbd> para pesquisar.
</p>`,
        },
      ],
    },

    /* ======================================================================
       FORMULÁRIOS
       ====================================================================== */
    {
      id: "campo",
      nome: "Campos de formulário",
      categoria: "formularios",
      resumo: "Texto, seleção, área de texto, caixas de marcação, opções e chave liga/desliga com rótulo, ajuda e erro.",
      apelidos: ["input", "formulário", "form", "campo de texto", "select", "textarea", "checkbox", "radio", "switch", "toggle", "label", "caixa de seleção", "dropdown de opções"],
      inspiradoEm: ["GOV.UK Design System (formulários de serviços públicos)", "Revolut e N26 (formulários de abertura de conta)", "Stripe Checkout"],
      quandoUsar: ["Sempre que a pessoa precisar de escrever ou escolher algo."],
      evitar: ["Placeholder no lugar do rótulo: desaparece quando a pessoa começa a escrever e ela esquece o que era o campo."],
      comoFunciona:
        "Envolva cada campo em .at-campo com um <label> ligado pelo for/id. Use o type certo (email, tel, number) e o autocomplete certo: no telemóvel isso abre o teclado adequado e permite preencher com um toque.",
      recursos: ["input-email-tel-url", "inputmode", "field-sizing", "accent-color"],
      mdn: [
        pt("<input>", "Web/HTML/Reference/Elements/input"),
        pt("<label>", "Web/HTML/Reference/Elements/label"),
        pt("<select>", "Web/HTML/Reference/Elements/select"),
        en("Atributo autocomplete", "Web/HTML/Reference/Attributes/autocomplete"),
        en("Papel switch (chave)", "Web/Accessibility/ARIA/Reference/Roles/switch_role"),
      ],
      conectaCom: ["mascaras", "validacao", "cep", "senha"],
      acessibilidade: [
        "Todos os campos precisam de <label>. Clicar no rótulo foca o campo e o leitor de ecrã lê o nome.",
        "Na chave liga/desliga, use role=\"switch\" para que seja anunciada como \"ligado/desligado\".",
        "Agrupe opções (radio) com <fieldset> e <legend>.",
      ],
      api: [
        { nome: "at-campo", tipo: "classe", descricao: "Agrupa rótulo, campo, ajuda e erro." },
        { nome: "at-rotulo", tipo: "classe", descricao: "Rótulo. Use <span class=\"at-opcional\">(opcional)</span> dentro." },
        { nome: "at-entrada", tipo: "classe", descricao: "Visual de input, select e textarea." },
        { nome: "at-ajuda", tipo: "classe", descricao: "Texto de ajuda abaixo do campo." },
        { nome: "at-check", tipo: "classe", descricao: "Label que envolve checkbox ou radio." },
        { nome: "at-chave", tipo: "classe", descricao: "Checkbox com aparência de chave liga/desliga." },
        { nome: "at-grupo-entrada + at-adicional", tipo: "classe", descricao: "Prefixo/sufixo colado ao campo (€, @, .pt, botão)." },
        { nome: "at-entrada-icone", tipo: "classe", descricao: "Campo com ícone à esquerda." },
        { nome: "at-formulario + at-meio/at-terco/at-dois-tercos", tipo: "classe", descricao: "Grade de formulário com campos lado a lado." },
      ],
      exemplos: [
        {
          titulo: "Campos básicos",
          html: `<form class="at-formulario" style="max-width: 560px">
  <div class="at-campo">
    <label class="at-rotulo" for="nome-completo">Nome completo</label>
    <input class="at-entrada" id="nome-completo" name="nome" autocomplete="name">
  </div>

  <div class="at-campo at-meio">
    <label class="at-rotulo" for="email-campo">E-mail</label>
    <input class="at-entrada" id="email-campo" type="email" autocomplete="email" placeholder="nome@exemplo.com">
    <span class="at-ajuda">Enviaremos a confirmação para este endereço.</span>
  </div>

  <div class="at-campo at-meio">
    <label class="at-rotulo" for="estado-campo">Distrito</label>
    <select class="at-entrada" id="estado-campo" autocomplete="address-level1">
      <option value="">Selecione</option>
      <option>Lisboa</option>
      <option>Porto</option>
      <option>Braga</option>
      <option>Faro</option>
    </select>
  </div>

  <div class="at-campo">
    <label class="at-rotulo" for="obs">Observações <span class="at-opcional">(opcional)</span></label>
    <textarea class="at-entrada" id="obs" rows="3"></textarea>
  </div>
</form>`,
        },
        {
          titulo: "Marcação, opções e chave",
          html: `<div class="at-pilha" style="--at-gap: 12px">
  <label class="at-check">
    <input type="checkbox" checked> Quero receber ofertas por e-mail
  </label>

  <fieldset style="border: 0; padding: 0; margin: 0">
    <legend class="at-rotulo at-mb-2">Forma de pagamento</legend>
    <div class="at-linha">
      <label class="at-check"><input type="radio" name="pagamento" checked> MB WAY</label>
      <label class="at-check"><input type="radio" name="pagamento"> Cartão</label>
      <label class="at-check"><input type="radio" name="pagamento"> Multibanco</label>
    </div>
  </fieldset>

  <label class="at-linha">
    <input type="checkbox" role="switch" class="at-chave" checked>
    Notificações no telemóvel
  </label>
</div>`,
        },
        {
          titulo: "Prefixo, sufixo e pesquisa",
          html: `<div class="at-pilha" style="max-width: 420px">
  <div class="at-grupo-entrada">
    <span class="at-adicional">https://</span>
    <input class="at-entrada" aria-label="Endereço do site" placeholder="minhaloja">
    <span class="at-adicional">.pt</span>
  </div>

  <div class="at-grupo-entrada">
    <input class="at-entrada" type="email" aria-label="O seu e-mail" placeholder="O seu melhor e-mail">
    <button class="at-botao at-primario">Subscrever</button>
  </div>

  <div class="at-entrada-icone">
    ${i.busca}
    <input class="at-entrada" type="search" aria-label="Pesquisar" placeholder="Pesquisar produtos, marcas e muito mais">
  </div>
</div>`,
        },
      ],
    },

    {
      id: "mascaras",
      nome: "Máscaras (NIF, IBAN, telemóvel...)",
      categoria: "formularios",
      resumo: "Formata enquanto a pessoa escreve: NIF, IBAN, código postal, telemóvel, telefone internacional, moeda, cartão, validade, data e matrícula. Também CPF, CNPJ e CEP para clientes do Brasil.",
      apelidos: ["máscara", "mask", "nif", "nipc", "contribuinte", "iban", "código postal", "telemóvel", "telefone", "dinheiro", "moeda", "euro", "cartão de crédito", "matrícula", "formatar campo", "cpf", "cnpj", "cep"],
      inspiradoEm: ["Portal das Finanças (NIF)", "Bancos online europeus (IBAN)", "CTT (código postal)", "Stripe Checkout (cartão)"],
      quandoUsar: ["Em todo o campo de documento, conta ou número. Reduz erros e deixa claro o formato esperado."],
      evitar: ["Data de nascimento: prefira <input type=\"date\">, que já abre um calendário no telemóvel."],
      comoFunciona:
        "Basta data-at-mascara=\"tipo\". O Atalho formata a cada tecla, mantém o cursor no lugar certo (sem saltar para o fim), escolhe o teclado numérico no telemóvel e limita o tamanho. Se o formulário usar data-at-validar, o NIF e o IBAN têm os dígitos de controlo verificados (o IBAN funciona para qualquer país da Europa). Para clientes do Brasil, há também CPF, CNPJ (incluindo o alfanumérico) e CEP.",
      recursos: ["inputmode", "input-event"],
      mdn: [en("Atributo inputmode", "Web/HTML/Reference/Global_attributes/inputmode")],
      conectaCom: ["validacao", "cep", "campo"],
      acessibilidade: ["Mostre o formato esperado na ajuda (ex.: 123 456 789). A máscara ajuda quem vê, mas o leitor de ecrã precisa do texto."],
      api: [
        { nome: "data-at-mascara=\"nif\"", tipo: "atributo", descricao: "123 456 789 (NIF e NIPC, com dígito de controlo)" },
        { nome: "data-at-mascara=\"iban\"", tipo: "atributo", descricao: "PT50 0002 0123 1234 5678 9015 4 (qualquer país)" },
        { nome: "data-at-mascara=\"codigo-postal\"", tipo: "atributo", descricao: "1250-096. Com data-at-codigo-postal, preenche a morada." },
        { nome: "data-at-mascara=\"telemovel\"", tipo: "atributo", descricao: "912 345 678 (Portugal)" },
        { nome: "data-at-mascara=\"telefone\"", tipo: "atributo", descricao: "Nacional (212 345 678) ou internacional (+44 2079 460 958). No pt-BR: (11) 98765-4321." },
        { nome: "data-at-mascara=\"moeda\"", tipo: "atributo", descricao: "1234,56 € (euro por omissão; segue <html data-at-moeda>). O número puro fica em data-at-numero." },
        { nome: "data-at-mascara=\"cartao\" / \"validade\"", tipo: "atributo", descricao: "0000 0000 0000 0000 e 00/00" },
        { nome: "data-at-mascara=\"data\" / \"matricula\"", tipo: "atributo", descricao: "00/00/0000 e AA-00-AA" },
        { nome: "data-at-mascara=\"cpf\" / \"cnpj\" / \"cep\" / \"placa\"", tipo: "atributo", descricao: "Formatos do Brasil: 000.000.000-00, 00.000.000/0000-00, 00000-000, ABC-1D23" },
        { nome: "Atalho.validar.nif(texto)", tipo: "função", descricao: "true/false. Também .iban, .codigoPostal, .telemovel, .telefone, .email, .cpf, .cnpj, .cep" },
      ],
      exemplos: [
        {
          titulo: "Portugal e Europa",
          descricao: "Escreva só os números (no IBAN e na matrícula, também letras).",
          html: `<div class="at-formulario" style="max-width: 640px">
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-nif">NIF</label>
    <input class="at-entrada" id="m-nif" data-at-mascara="nif" placeholder="123 456 789">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-tel">Telemóvel</label>
    <input class="at-entrada" id="m-tel" type="tel" data-at-mascara="telemovel" autocomplete="tel-national" placeholder="912 345 678">
  </div>
  <div class="at-campo">
    <label class="at-rotulo" for="m-iban">IBAN</label>
    <input class="at-entrada" id="m-iban" data-at-mascara="iban" placeholder="PT50 0000 0000 0000 0000 0000 0">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-cp">Código postal</label>
    <input class="at-entrada" id="m-cp" data-at-mascara="codigo-postal" autocomplete="postal-code" placeholder="0000-000">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-valor">Valor</label>
    <input class="at-entrada" id="m-valor" data-at-mascara="moeda" placeholder="0,00 €">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-matricula">Matrícula</label>
    <input class="at-entrada" id="m-matricula" data-at-mascara="matricula" placeholder="AA-00-AA">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-intl">Telefone internacional</label>
    <input class="at-entrada" id="m-intl" type="tel" data-at-mascara="telefone" autocomplete="tel" placeholder="+351 212 345 678">
  </div>
  <div class="at-campo at-dois-tercos">
    <label class="at-rotulo" for="m-cartao">Número do cartão</label>
    <input class="at-entrada" id="m-cartao" data-at-mascara="cartao" autocomplete="cc-number" placeholder="0000 0000 0000 0000">
  </div>
  <div class="at-campo at-terco">
    <label class="at-rotulo" for="m-validade">Validade</label>
    <input class="at-entrada" id="m-validade" data-at-mascara="validade" autocomplete="cc-exp" placeholder="MM/AA">
  </div>
</div>`,
        },
        {
          titulo: "Validar por JavaScript",
          descricao: "Útil antes de enviar dados para uma API. Experimente trocar o último algarismo.",
          html: `<div class="at-linha">
  <input class="at-entrada" id="nif-teste" data-at-mascara="nif" aria-label="NIF" style="max-width: 200px" value="123 456 789">
  <button class="at-botao" id="nif-conferir">Verificar</button>
</div>`,
          js: `document.querySelector("#nif-conferir").addEventListener("click", () => {
  const nif = document.querySelector("#nif-teste").value;
  if (Atalho.validar.nif(nif)) {
    Atalho.notificar("NIF válido.", { tipo: "sucesso" });
  } else {
    Atalho.notificar("NIF inválido.", { tipo: "perigo" });
  }
});`,
        },
        {
          titulo: "Clientes do Brasil",
          descricao: "Com <html lang=\"pt-BR\">, as mensagens e a moeda (R$) passam para o Brasil.",
          html: `<div class="at-formulario" style="max-width: 640px">
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-cpf">CPF</label>
    <input class="at-entrada" id="m-cpf" data-at-mascara="cpf" placeholder="000.000.000-00">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-cnpj">CNPJ</label>
    <input class="at-entrada" id="m-cnpj" data-at-mascara="cnpj" placeholder="12.ABC.345/01DE-35">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-cep">CEP</label>
    <input class="at-entrada" id="m-cep" data-at-mascara="cep" autocomplete="postal-code" placeholder="00000-000">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-placa">Placa</label>
    <input class="at-entrada" id="m-placa" data-at-mascara="placa" placeholder="ABC-1D23">
  </div>
</div>`,
        },
      ],
    },

    {
      id: "cep",
      nome: "Morada pelo código postal",
      categoria: "formularios",
      resumo: "A pessoa escreve o código postal e a rua, a localidade, o concelho e o distrito preenchem-se sozinhos. Usa a GEO API PT, gratuita e sem registo. Também funciona com o CEP do Brasil.",
      apelidos: ["código postal", "morada", "endereço", "codigo postal", "cp", "ctt", "buscar morada", "autocompletar morada", "geoapi", "cep", "viacep"],
      inspiradoEm: ["CTT (pesquisa de códigos postais)", "Lojas online portuguesas (checkout)", "Mercado Livre e iFood (CEP)"],
      quandoUsar: ["Em qualquer registo de morada: checkout, entregas, faturação, inscrições."],
      comoFunciona:
        "Em Portugal: coloque data-at-codigo-postal no campo (com data-at-mascara=\"codigo-postal\") e data-at-cp-preencher=\"rua | localidade | concelho | distrito\" nos campos de destino. Ao completar os 7 algarismos, o Atalho consulta a GEO API PT, preenche e foca o campo marcado com data-at-cp-foco (normalmente o número da porta). No Brasil: data-at-cep e data-at-cep-preencher com os nomes do ViaCEP (logradouro, bairro, localidade, uf). Os resultados ficam em memória para não repetir a consulta.",
      recursos: ["fetch", "abortable-fetch"],
      mdn: [pt("Fetch API", "Web/API/Fetch_API"), pt("Utilizar o Fetch", "Web/API/Fetch_API/Using_Fetch")],
      conectaCom: ["mascaras", "validacao", "receita-cadastro"],
      acessibilidade: ["O campo recebe aria-busy enquanto consulta, e o erro aparece em texto ligado ao campo por aria-describedby."],
      api: [
        { nome: "data-at-codigo-postal", tipo: "atributo", descricao: "Marca o campo que dispara a pesquisa (Portugal). Combine com data-at-mascara=\"codigo-postal\"." },
        { nome: "data-at-cp-preencher=\"localidade\"", tipo: "atributo", descricao: "Campo que recebe um dado: rua, localidade, concelho ou distrito." },
        { nome: "data-at-cp-foco", tipo: "atributo", descricao: "Campo que recebe o foco depois de preencher." },
        { nome: "at:codigo-postal", tipo: "evento", descricao: "detail traz { codigoPostal, rua, localidade, concelho, distrito }." },
        { nome: "at:codigo-postal-erro", tipo: "evento", descricao: "Código inexistente ou sem ligação. detail.mensagem explica." },
        { nome: "data-at-cep / data-at-cep-preencher / at:cep", tipo: "atributo", descricao: "O mesmo para o CEP do Brasil (ViaCEP)." },
      ],
      exemplos: [
        {
          titulo: "Morada em Portugal",
          descricao: "Experimente 1250-096 (Lisboa), 4000-322 (Porto) ou o código postal da sua casa.",
          html: `<form class="at-formulario" style="max-width: 640px" data-at-validar>
  <div class="at-campo at-terco">
    <label class="at-rotulo" for="end-cp">Código postal</label>
    <input class="at-entrada" id="end-cp" name="codigo_postal" required data-at-mascara="codigo-postal" data-at-codigo-postal autocomplete="postal-code" placeholder="0000-000">
    <a class="at-ajuda" href="https://www.ctt.pt/feapl_2/app/open/postalCodeSearch/postalCodeSearch.jspx" target="_blank" rel="noopener">Não sei o código postal</a>
  </div>
  <div class="at-campo at-dois-tercos">
    <label class="at-rotulo" for="end-rua">Rua</label>
    <input class="at-entrada" id="end-rua" name="rua" required data-at-cp-preencher="rua" autocomplete="address-line1">
  </div>
  <div class="at-campo at-terco">
    <label class="at-rotulo" for="end-numero">N.º e andar</label>
    <input class="at-entrada" id="end-numero" name="numero" required data-at-cp-foco>
  </div>
  <div class="at-campo at-dois-tercos">
    <label class="at-rotulo" for="end-localidade">Localidade</label>
    <input class="at-entrada" id="end-localidade" name="localidade" required data-at-cp-preencher="localidade" autocomplete="address-level2">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="end-concelho">Concelho</label>
    <input class="at-entrada" id="end-concelho" name="concelho" data-at-cp-preencher="concelho">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="end-distrito">Distrito</label>
    <input class="at-entrada" id="end-distrito" name="distrito" data-at-cp-preencher="distrito" autocomplete="address-level1">
  </div>
</form>`,
          js: `document.querySelector("#end-cp").addEventListener("at:codigo-postal", (evento) => {
  const { localidade, concelho, distrito } = evento.detail;
  console.log("Morada encontrada:", localidade, concelho, distrito);
});`,
        },
        {
          titulo: "Endereço no Brasil (CEP)",
          descricao: "Para clientes do Brasil. Teste com 01310-100.",
          html: `<form class="at-formulario" style="max-width: 640px" data-at-validar>
  <div class="at-campo at-terco">
    <label class="at-rotulo" for="br-cep">CEP</label>
    <input class="at-entrada" id="br-cep" name="cep" required data-at-mascara="cep" data-at-cep autocomplete="postal-code">
  </div>
  <div class="at-campo at-dois-tercos">
    <label class="at-rotulo" for="br-rua">Rua</label>
    <input class="at-entrada" id="br-rua" name="rua" required data-at-cep-preencher="logradouro" autocomplete="address-line1">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="br-cidade">Cidade</label>
    <input class="at-entrada" id="br-cidade" name="cidade" required data-at-cep-preencher="localidade" autocomplete="address-level2">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="br-uf">Estado (UF)</label>
    <input class="at-entrada" id="br-uf" name="uf" required maxlength="2" data-at-cep-preencher="uf" autocomplete="address-level1">
  </div>
</form>`,
        },
      ],
    },

    {
      id: "validacao",
      nome: "Validação de formulário",
      categoria: "formularios",
      resumo: "Mensagens de erro claras, em português, no lugar certo e na hora certa. Sem biblioteca extra, com a validação nativa do navegador.",
      apelidos: ["validar", "validação", "erro", "obrigatório", "required", "form validation", "enviar formulário", "submit", "mensagem de erro", "confirmar palavra-passe"],
      inspiradoEm: ["GOV.UK Design System (padrão de mensagens de erro)", "Stripe (validação ao sair do campo)", "Google (registo de conta)"],
      quandoUsar: ["Em todos os formulários que a pessoa envia."],
      evitar: ["Mostrar erro enquanto a pessoa ainda está a escrever pela primeira vez. Espere que ela saia do campo."],
      comoFunciona:
        "Adicione data-at-validar ao <form> e use os atributos nativos: required, type=\"email\", minlength, pattern, min, max. O Atalho troca as mensagens do navegador (que variam e às vezes vêm em inglês) por mensagens consistentes em português. O erro aparece quando a pessoa sai do campo ou tenta enviar, e desaparece assim que ela corrige. Se o formulário não tiver action, o envio não recarrega a página: recebe os dados no evento at:enviar, prontos a enviar para uma API.",
      recursos: ["constraint-validation", "input-event"],
      mdn: [
        en("Validação de formulários (Constraint validation)", "Web/HTML/Guides/Constraint_validation"),
        en("<form>", "Web/HTML/Reference/Elements/form"),
        pt("FormData", "Web/API/FormData"),
      ],
      conectaCom: ["campo", "mascaras", "senha", "notificacao", "requisitar"],
      acessibilidade: [
        "O campo inválido recebe aria-invalid=\"true\" e aria-describedby a apontar para a mensagem, por isso o leitor de ecrã lê o erro.",
        "Ao enviar com erro, o foco vai para o primeiro campo errado.",
      ],
      api: [
        { nome: "data-at-validar", tipo: "atributo", descricao: "No <form>. Liga a validação em português." },
        { nome: "data-msg-obrigatorio / data-msg-formato", tipo: "atributo", descricao: "Troca a mensagem predefinida de um campo." },
        { nome: "data-at-igual=\"#outro\"", tipo: "atributo", descricao: "Exige o mesmo valor de outro campo (confirmar palavra-passe ou e-mail)." },
        { nome: "data-at-acao=\"estado.metodo\"", tipo: "atributo", descricao: "No <form>: chama a ação com os dados quando for válido." },
        { nome: "at:enviar", tipo: "evento", descricao: "Formulário válido. detail.dados tem os valores; detail.botao, o botão usado." },
        { nome: "at:invalido", tipo: "evento", descricao: "Tentou enviar com erro. detail.campos lista os campos inválidos." },
      ],
      exemplos: [
        {
          titulo: "Criar conta",
          descricao: "Tente enviar vazio, depois preencha errado e corrija.",
          html: `<form id="form-conta" class="at-pilha" style="max-width: 420px" data-at-validar>
  <div class="at-campo">
    <label class="at-rotulo" for="cc-nome">Nome</label>
    <input class="at-entrada" id="cc-nome" name="nome" required minlength="3" autocomplete="name">
  </div>
  <div class="at-campo">
    <label class="at-rotulo" for="cc-email">E-mail</label>
    <input class="at-entrada" id="cc-email" name="email" type="email" required autocomplete="email">
  </div>
  <div class="at-campo">
    <label class="at-rotulo" for="cc-nif">NIF</label>
    <input class="at-entrada" id="cc-nif" name="nif" required data-at-mascara="nif">
  </div>
  <div class="at-campo">
    <label class="at-rotulo" for="cc-senha">Palavra-passe</label>
    <input class="at-entrada" id="cc-senha" name="senha" type="password" required minlength="8" autocomplete="new-password">
    <span class="at-ajuda">Mínimo de 8 caracteres.</span>
  </div>
  <div class="at-campo">
    <label class="at-rotulo" for="cc-senha2">Confirme a palavra-passe</label>
    <input class="at-entrada" id="cc-senha2" type="password" required data-at-igual="#cc-senha" data-msg-igual="As palavras-passe não são iguais." autocomplete="new-password">
  </div>
  <div class="at-campo">
    <label class="at-check">
      <input type="checkbox" name="termos" required data-msg-obrigatorio="Tem de aceitar os termos.">
      Li e aceito os termos de utilização
    </label>
  </div>
  <button class="at-botao at-primario at-bloco">Criar conta</button>
</form>`,
          js: `document.querySelector("#form-conta").addEventListener("at:enviar", (evento) => {
  const { dados, botao } = evento.detail;
  botao.setAttribute("aria-busy", "true");

  // Aqui enviaria os dados para a sua API:
  // await Atalho.requisitar("/api/contas", { metodo: "POST", corpo: dados });
  setTimeout(() => {
    botao.removeAttribute("aria-busy");
    Atalho.notificar("Conta criada para " + dados.email, { tipo: "sucesso", titulo: "Tudo certo!" });
  }, 1200);
});`,
        },
      ],
    },

    {
      id: "senha",
      nome: "Palavra-passe (mostrar e força)",
      categoria: "formularios",
      resumo: "Campo de palavra-passe com botão Mostrar/Ocultar e medidor de força que avisa enquanto a pessoa escreve.",
      apelidos: ["senha", "password", "mostrar palavra-passe", "olho", "força da palavra-passe", "palavra-passe forte", "login"],
      inspiradoEm: ["Google (criar conta)", "Microsoft (login)", "Bancos digitais"],
      quandoUsar: ["Em registo e troca de palavra-passe. No login, use só o Mostrar/Ocultar (sem medidor)."],
      comoFunciona:
        "Envolva o input em .at-senha com um botão data-at-ver-senha. Para o medidor, coloque .at-forca (com 4 spans) e .at-forca-texto no mesmo .at-campo. A força considera tamanho, maiúsculas e minúsculas, números, símbolos e sequências óbvias (123, palavra-passe...).",
      recursos: [],
      mdn: [pt("<input>", "Web/HTML/Reference/Elements/input")],
      conectaCom: ["validacao", "codigo", "receita-login"],
      acessibilidade: [
        "O botão recebe aria-pressed e troca o texto entre Mostrar e Ocultar.",
        "Use autocomplete=\"new-password\" no registo e \"current-password\" no login: os gestores de palavras-passe dependem disso.",
      ],
      api: [
        { nome: "at-senha", tipo: "classe", descricao: "Container do campo com o botão." },
        { nome: "data-at-ver-senha", tipo: "atributo", descricao: "Botão que mostra/oculta a palavra-passe." },
        { nome: "at-forca + at-forca-texto", tipo: "classe", descricao: "Medidor de força (data-nivel de 1 a 4)." },
      ],
      exemplos: [
        {
          titulo: "Nova palavra-passe",
          html: `<div class="at-campo" style="max-width: 360px">
  <label class="at-rotulo" for="nova-senha">Crie uma palavra-passe</label>
  <div class="at-senha">
    <input class="at-entrada" id="nova-senha" type="password" autocomplete="new-password">
    <button type="button" data-at-ver-senha>Mostrar</button>
  </div>
  <div class="at-forca" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
  <span class="at-forca-texto" aria-live="polite"></span>
</div>`,
        },
      ],
    },

    {
      id: "codigo",
      nome: "Código de verificação",
      categoria: "formularios",
      resumo: "Seis caixinhas para o código recebido por SMS ou e-mail. Avança sozinho, aceita colar e preenche-se automaticamente a partir do SMS no telemóvel.",
      apelidos: ["otp", "código", "token", "sms", "verificação em duas etapas", "2fa", "pin", "código de segurança", "autenticação"],
      inspiradoEm: ["WhatsApp (confirmação de número)", "Revolut e bancos (token)", "Google (verificação em duas etapas)"],
      quandoUsar: ["Confirmação de telefone, e-mail ou login em duas etapas."],
      comoFunciona:
        "Envolva os inputs em .at-codigo com data-at=\"codigo\". O primeiro campo recebe autocomplete=\"one-time-code\", que faz com que o iPhone e o Android sugiram o código do SMS. Quando todos os dígitos estão preenchidos, o evento at:codigo traz o valor completo.",
      recursos: ["input-event", "clipboard-events"],
      mdn: [en("Atributo autocomplete", "Web/HTML/Reference/Attributes/autocomplete")],
      conectaCom: ["senha", "etapas", "receita-login"],
      acessibilidade: ["Cada caixinha recebe um nome (Dígito 1 de 6...). Para marcar erro, coloque aria-invalid=\"true\" no .at-codigo."],
      api: [
        { nome: "data-at=\"codigo\"", tipo: "atributo", descricao: "Liga o comportamento." },
        { nome: "at:codigo", tipo: "evento", descricao: "Todos os dígitos preenchidos. detail.valor tem o código." },
      ],
      exemplos: [
        {
          titulo: "Confirme o seu número",
          descricao: "O código certo é 123456. Teste também colar.",
          html: `<div class="at-pilha" style="--at-gap: 12px">
  <p class="at-mb-0">Enviámos um código por SMS para <strong>+351 9•• ••• 321</strong>.</p>
  <div class="at-codigo" data-at="codigo" id="codigo-sms">
    <input><input><input><input><input><input>
  </div>
  <button class="at-botao at-link" type="button">Reenviar código em 30 s</button>
</div>`,
          js: `const codigo = document.querySelector("#codigo-sms");

codigo.addEventListener("at:codigo", (evento) => {
  if (evento.detail.valor === "123456") {
    Atalho.notificar("Número confirmado!", { tipo: "sucesso" });
  } else {
    codigo.setAttribute("aria-invalid", "true");
    Atalho.notificar("Código incorreto. Verifique o SMS.", { tipo: "perigo" });
  }
});`,
        },
      ],
    },

    {
      id: "upload",
      nome: "Enviar ficheiros",
      categoria: "formularios",
      resumo: "Área para arrastar e largar ficheiros, com pré-visualização das imagens, tamanho formatado, botão de remover e limite de tamanho.",
      apelidos: ["upload", "arquivo", "anexo", "arrastar e soltar", "drag and drop", "enviar foto", "imagem", "file input", "dropzone"],
      inspiradoEm: ["Google Drive", "WeTransfer", "Notion (anexos)"],
      quandoUsar: ["Envio de documentos, fotos de produtos, comprovativos."],
      comoFunciona:
        "É um <input type=\"file\"> de verdade dentro de um <label>: clicar abre o seletor, e arrastar também funciona. O Atalho mostra a lista em .at-upload-lista (logo depois da área, ou onde data-lista indicar). Para enviar ao servidor, use FormData com o próprio formulário.",
      recursos: ["input-file", "input-file-multiple", "draganddrop", "file"],
      mdn: [
        en("<input type=\"file\">", "Web/HTML/Reference/Elements/input/file"),
        pt("API de arrastar e largar", "Web/API/HTML_Drag_and_Drop_API"),
        pt("URL.createObjectURL()", "Web/API/URL/createObjectURL_static"),
      ],
      conectaCom: ["validacao", "requisitar", "notificacao"],
      acessibilidade: ["Como é um input real, funciona com teclado (Tab + Enter) e leitores de ecrã, o que muitas áreas de arrastar feitas só com div não fazem."],
      api: [
        { nome: "data-at=\"upload\"", tipo: "atributo", descricao: "No <label class=\"at-upload\">." },
        { nome: "data-tamanho-maximo=\"5\"", tipo: "atributo", descricao: "Limite em MB por ficheiro (avisa se passar)." },
        { nome: "data-lista=\"#id\"", tipo: "atributo", descricao: "Onde mostrar a lista (por omissão: o elemento seguinte)." },
        { nome: "at:arquivos", tipo: "evento", descricao: "Ficheiros escolhidos. detail.arquivos é uma lista de File." },
      ],
      exemplos: [
        {
          titulo: "Fotos do produto",
          html: `<label class="at-upload" data-at="upload" data-tamanho-maximo="5">
  ${i.upload}
  <span><strong>Clique para escolher</strong> ou arraste as fotos para aqui</span>
  <small>PNG, JPG ou WEBP, até 5 MB cada</small>
  <input type="file" accept="image/*" multiple class="at-sr">
</label>
<ul class="at-upload-lista"></ul>`,
          js: `document.addEventListener("at:arquivos", (evento) => {
  console.log(evento.detail.arquivos.length + " ficheiro(s) pronto(s) para enviar");

  // Para enviar ao servidor:
  // const dados = new FormData();
  // evento.detail.arquivos.forEach((ficheiro) => dados.append("fotos", ficheiro));
  // await Atalho.requisitar("/api/fotos", { metodo: "POST", corpo: dados });
});`,
        },
      ],
    },

    /* ======================================================================
       AÇÕES
       ====================================================================== */
    {
      id: "botao",
      nome: "Botão",
      categoria: "acoes",
      resumo: "Botões para cada nível de importância, tamanhos, ícones, estado de a carregar, grupo e contador.",
      apelidos: ["button", "btn", "botão", "cta", "call to action", "carregando", "loading", "ícone", "grupo de botões"],
      inspiradoEm: ["GitHub (Primer)", "Stripe Dashboard", "Shopify Polaris"],
      quandoUsar: [
        "at-primario: a ação principal do ecrã. Uma só por área.",
        "Botão normal (sem modificador): ações secundárias.",
        "at-fantasma ou at-link: ações discretas, como Cancelar.",
        "at-perigo: eliminar, cancelar subscrição. Sempre com confirmação.",
      ],
      evitar: ["<div> ou <a> clicável no lugar de <button>: não funciona com teclado nem com leitor de ecrã."],
      comoFunciona:
        "Use <button> para ações e <a class=\"at-botao\"> para navegação (ir para outra página). Para mostrar que algo está a carregar, coloque aria-busy=\"true\": o texto dá lugar a um indicador a girar e o botão deixa de aceitar cliques, o que evita pedidos duplicados.",
      recursos: [],
      mdn: [pt("<button>", "Web/HTML/Reference/Elements/button")],
      conectaCom: ["menu-suspenso", "modal", "notificacao", "dica"],
      acessibilidade: [
        "Botão só com ícone precisa de aria-label a descrever a ação.",
        "Em grupos de alternância (Dia/Semana/Mês), use aria-pressed.",
      ],
      api: [
        { nome: "at-botao", tipo: "classe", descricao: "Base." },
        { nome: "at-primario / at-suave / at-perigo / at-sucesso / at-fantasma / at-link", tipo: "classe", descricao: "Variações." },
        { nome: "at-pequeno / at-grande / at-bloco / at-icone", tipo: "classe", descricao: "Tamanhos e formatos." },
        { nome: "aria-busy=\"true\"", tipo: "atributo", descricao: "Estado a carregar." },
        { nome: "at-grupo-botoes", tipo: "classe", descricao: "Botões colados. Marque o ativo com aria-pressed=\"true\"." },
        { nome: "at-contador-selo + [data-contador]", tipo: "classe", descricao: "Número sobre o botão (carrinho, notificações)." },
        { nome: "data-at-notificar=\"texto\"", tipo: "atributo", descricao: "Mostra uma notificação ao clicar (atalho rápido)." },
      ],
      exemplos: [
        {
          titulo: "Variações",
          html: `<div class="at-linha">
  <button class="at-botao at-primario">Guardar alterações</button>
  <button class="at-botao">Exportar</button>
  <button class="at-botao at-suave">Convidar</button>
  <button class="at-botao at-fantasma">Cancelar</button>
  <button class="at-botao at-perigo">Eliminar</button>
  <button class="at-botao at-link">Ver detalhes</button>
</div>`,
        },
        {
          titulo: "Tamanhos e ícones",
          html: `<div class="at-linha">
  <button class="at-botao at-primario at-pequeno">Pequeno</button>
  <button class="at-botao at-primario">Normal</button>
  <button class="at-botao at-primario at-grande">Grande</button>
  <button class="at-botao">${i.baixar} Descarregar PDF</button>
  <button class="at-botao at-icone" aria-label="Editar">${i.editar}</button>
  <button class="at-botao at-icone at-fantasma" aria-label="Eliminar">${i.lixo}</button>
</div>`,
        },
        {
          titulo: "A carregar ao guardar",
          html: `<button class="at-botao at-primario" id="botao-salvar">Guardar</button>`,
          js: `const botao = document.querySelector("#botao-salvar");

botao.addEventListener("click", () => {
  botao.setAttribute("aria-busy", "true");

  setTimeout(() => {
    botao.removeAttribute("aria-busy");
    Atalho.notificar("Alterações guardadas.", { tipo: "sucesso" });
  }, 1500);
});`,
        },
        {
          titulo: "Grupo e contador",
          html: `<div class="at-linha">
  <div class="at-grupo-botoes" role="group" aria-label="Período">
    <button class="at-botao" aria-pressed="false">Dia</button>
    <button class="at-botao" aria-pressed="true">Semana</button>
    <button class="at-botao" aria-pressed="false">Mês</button>
  </div>

  <button class="at-botao at-icone at-contador-selo" aria-label="Notificações: 3 novas">
    ${i.sino}
    <span data-contador aria-hidden="true">3</span>
  </button>
</div>`,
          js: `document.querySelectorAll("[aria-label='Período'] .at-botao").forEach((botao, _, todos) => {
  botao.addEventListener("click", () => {
    todos.forEach((b) => b.setAttribute("aria-pressed", String(b === botao)));
  });
});`,
        },
      ],
    },

    {
      id: "menu-suspenso",
      nome: "Menu suspenso",
      categoria: "acoes",
      resumo: "Lista de ações que abre ao clicar num botão: o famoso menu dos três pontinhos e o menu do utilizador.",
      apelidos: ["dropdown", "menu", "três pontos", "kebab", "popover", "menu do utilizador", "opções", "mais ações", "context menu"],
      inspiradoEm: ["GitHub (menu de cada repositório)", "Gmail (mais opções)", "Notion (menu de bloco)"],
      quandoUsar: ["Quando há várias ações secundárias e pouco espaço, como em cada linha de uma tabela."],
      evitar: ["Esconder a ação principal num menu. Se é o que a pessoa mais faz, deixe à vista."],
      comoFunciona:
        "Usa o atributo nativo popover, disponível em todos os navegadores atuais desde 2025. O próprio navegador fecha o menu ao clicar fora ou premir Esc. O Atalho posiciona o menu ao lado do botão, troca de lado se faltar espaço no ecrã e deixa navegar com as setas.",
      recursos: ["popover"],
      mdn: [
        en("Atributo popover", "Web/HTML/Reference/Global_attributes/popover"),
        en("Popover API", "Web/API/Popover_API"),
      ],
      conectaCom: ["botao", "tabela", "barra", "modal"],
      acessibilidade: ["O menu abre com o foco no primeiro item; setas, Home e End percorrem os itens e Esc fecha e devolve o foco ao botão."],
      api: [
        { nome: "popovertarget=\"id\"", tipo: "atributo", descricao: "No botão: abre/fecha o menu (nativo do HTML)." },
        { nome: "popover + class=\"at-menu\"", tipo: "atributo", descricao: "No menu." },
        { nome: "data-alinhar=\"fim\"", tipo: "atributo", descricao: "Alinha o menu pela direita do botão." },
        { nome: "at-menu-item / at-menu-separador / at-menu-titulo", tipo: "classe", descricao: "Partes do menu." },
        { nome: "data-manter-aberto", tipo: "atributo", descricao: "No item: não fecha o menu ao clicar." },
      ],
      exemplos: [
        {
          titulo: "Três pontinhos",
          html: `<button class="at-botao at-icone" popovertarget="menu-projeto" aria-label="Mais ações">
  ${i.mais}
</button>

<div id="menu-projeto" popover class="at-menu">
  <button class="at-menu-item">${i.editar} Renomear <kbd>F2</kbd></button>
  <button class="at-menu-item">${i.copiar} Duplicar</button>
  <hr class="at-menu-separador">
  <button class="at-menu-item at-perigo" data-at-notificar="Projeto eliminado" data-at-tipo="perigo">
    ${i.lixo} Eliminar
  </button>
</div>`,
        },
        {
          titulo: "Menu do utilizador",
          html: `<div class="at-linha at-fim">
  <button class="at-botao at-fantasma" popovertarget="menu-usuario" style="padding-inline: 6px">
    <span class="at-avatar at-pequeno">MZ</span> Marcos ▾
  </button>
</div>

<div id="menu-usuario" popover class="at-menu" data-alinhar="fim">
  <div class="at-menu-titulo">marcos@exemplo.com</div>
  <a class="at-menu-item" href="#">O meu perfil</a>
  <a class="at-menu-item" href="#">Definições</a>
  <button class="at-menu-item" data-at-tema="alternar" data-manter-aberto>${i.lua} Tema escuro</button>
  <hr class="at-menu-separador">
  <a class="at-menu-item" href="#">${i.sair} Sair</a>
</div>`,
        },
      ],
    },

    {
      id: "copiar",
      nome: "Copiar (IBAN, referência, cupão, link)",
      categoria: "acoes",
      resumo: "Botão que copia um texto para a área de transferência e confirma com \"Copiado!\". Perfeito para IBAN, referência Multibanco, cupão de desconto e link de convite.",
      apelidos: ["copiar", "clipboard", "área de transferência", "iban", "referência multibanco", "mb way", "cupão", "cupom", "partilhar link", "copy", "pix"],
      inspiradoEm: ["Bancos online (copiar IBAN)", "Lojas portuguesas (pagamento por referência Multibanco)", "GitHub (copiar URL do repositório)"],
      quandoUsar: ["Sempre que a pessoa precisar de levar um texto para outro lugar: IBAN, referência de pagamento, código de seguimento, link."],
      comoFunciona:
        "data-at-copiar=\"#id\" copia o valor (ou texto) do elemento indicado; data-at-copiar=\"texto\" copia o texto literal. Usa a Clipboard API, que só funciona em HTTPS ou em localhost.",
      recursos: ["async-clipboard"],
      mdn: [en("Clipboard API", "Web/API/Clipboard_API")],
      conectaCom: ["campo", "notificacao", "botao"],
      acessibilidade: ["A troca do texto para \"Copiado!\" confirma a ação para quem vê; o botão mantém o foco."],
      api: [
        { nome: "data-at-copiar=\"#id\" ou \"texto\"", tipo: "atributo", descricao: "O que copiar." },
        { nome: "data-texto-copiado", tipo: "atributo", descricao: "Troca a confirmação (por omissão: Copiado!)." },
      ],
      exemplos: [
        {
          titulo: "Pagamento por referência Multibanco",
          html: `<div class="at-cartao at-pilha" style="max-width: 420px; --at-gap: 10px">
  <strong>Pague no Multibanco ou no homebanking</strong>
  <div class="at-linha at-entre"><span>Entidade <strong id="mb-entidade">21312</strong></span><button class="at-botao at-pequeno at-suave" data-at-copiar="#mb-entidade">${i.copiar} Copiar</button></div>
  <div class="at-linha at-entre"><span>Referência <strong id="mb-referencia">123 456 789</strong></span><button class="at-botao at-pequeno at-suave" data-at-copiar="#mb-referencia">${i.copiar} Copiar</button></div>
  <div class="at-linha at-entre"><span>Valor <strong>29,90 €</strong></span><span class="at-texto-suave at-texto-pequeno">válida por 3 dias</span></div>
</div>`,
        },
        {
          titulo: "IBAN para transferência",
          html: `<div class="at-campo" style="max-width: 460px">
  <label class="at-rotulo" for="iban-loja">IBAN da loja</label>
  <div class="at-grupo-entrada">
    <input class="at-entrada" id="iban-loja" readonly value="PT50 0002 0123 1234 5678 9015 4">
    <button class="at-botao at-primario" data-at-copiar="#iban-loja">${i.copiar} Copiar</button>
  </div>
  <span class="at-ajuda">Indique o número da encomenda no descritivo da transferência.</span>
</div>`,
        },
        {
          titulo: "Cupão",
          html: `<button class="at-botao at-suave" data-at-copiar="BEMVINDO10" data-texto-copiado="Cupão copiado!">
  Cupão BEMVINDO10 · 10% de desconto
</button>`,
        },
      ],
    }
  );
})();
