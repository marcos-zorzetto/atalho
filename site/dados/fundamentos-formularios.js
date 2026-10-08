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
        "Quando você quer resultado profissional sem montar um ambiente com Node, React e bundler.",
      ],
      comoFunciona:
        "O CSS traz o visual de todos os componentes. O JavaScript observa a página e liga sozinho tudo que tiver atributos data-at-..., inclusive HTML que chegar depois via fetch. Você não precisa chamar nenhuma função de inicialização. Use defer nos scripts: eles rodam na ordem em que aparecem, depois que o HTML terminou de carregar.",
      recursos: ["js-modules", "custom-properties", "dialog", "popover"],
      mdn: [
        pt("Aprenda desenvolvimento web (curso do MDN)", "Learn_web_development"),
        pt("Estruturando conteúdo com HTML", "Learn_web_development/Core/Structuring_content"),
        pt("JavaScript: primeiros passos", "Learn_web_development/Core/Scripting"),
      ],
      conectaCom: ["cores-e-temas", "estado", "eventos"],
      acessibilidade: [
        "Mantenha lang=\"pt-BR\" no <html>: leitores de tela usam isso para pronunciar o texto corretamente.",
        "O meta viewport é obrigatório para o site funcionar bem no celular.",
      ],
      api: [
        { nome: "atalho.css", tipo: "arquivo", descricao: "Estilos de todos os componentes. Classes começam com at-." },
        { nome: "atalho.js", tipo: "arquivo", descricao: "Comportamentos. Cria o objeto global window.Atalho." },
        { nome: "data-at=\"...\"", tipo: "atributo", descricao: "Liga um componente com comportamento (abas, tabela, kanban...)." },
        { nome: "at:pronto", tipo: "evento", descricao: "Disparado no document quando o Atalho terminou de ligar a página." },
      ],
      exemplos: [
        {
          titulo: "Página mínima",
          descricao: "Copie, salve como index.html e abra no navegador. Pronto.",
          somenteCodigo: true,
          html: `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Meu projeto</title>

  <link rel="stylesheet" href="${CDN}/atalho.css">
  <script src="${CDN}/atalho.js" defer></script>
  <!-- Seu código depois do Atalho, também com defer -->
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
          titulo: "Testando agora",
          descricao: "O mesmo botão do exemplo acima, rodando nesta página.",
          html: `<button class="at-botao at-primario" data-at-notificar="Funcionou! O Atalho está instalado.">
  Clique aqui
</button>`,
        },
        {
          titulo: "Baixar os arquivos (sem internet)",
          descricao: "Se preferir não depender de CDN, baixe atalho.css e atalho.js do GitHub e aponte para a sua pasta.",
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
        "Variáveis CSS (custom properties) são herdadas como qualquer propriedade. Redefinir --at-cor-primaria no :root muda o site todo; redefinir dentro de um elemento muda só aquele trecho. O tema escuro segue o sistema operacional automaticamente; o botão com data-at-tema troca e lembra a escolha.",
      recursos: ["custom-properties", "prefers-color-scheme", "color-mix", "color-scheme"],
      mdn: [
        pt("Usando variáveis CSS (custom properties)", "Web/CSS/Guides/Cascading_variables/Using_custom_properties"),
        pt("prefers-color-scheme", "Web/CSS/Reference/At-rules/@media/prefers-color-scheme"),
        en("color-mix()", "Web/CSS/Reference/Values/color_value/color-mix"),
      ],
      conectaCom: ["instalacao", "botao", "barra"],
      acessibilidade: [
        "Ao trocar a cor primária, confira o contraste do texto sobre ela (mínimo 4.5:1). Use --at-cor-sobre-primaria para ajustar.",
        "O botão de tema recebe aria-pressed automaticamente, então leitores de tela anunciam se o modo escuro está ligado.",
      ],
      api: [
        { nome: "--at-cor-primaria", tipo: "variável", descricao: "Cor principal (botões, links, foco)." },
        { nome: "--at-cor-primaria-forte / -suave", tipo: "variável", descricao: "Tons para hover e fundos leves." },
        { nome: "--at-cor-sobre-primaria", tipo: "variável", descricao: "Cor do texto em cima da cor primária." },
        { nome: "--at-fonte", tipo: "variável", descricao: "Família de fonte do texto." },
        { nome: "--at-raio / --at-raio-lg", tipo: "variável", descricao: "Arredondamento dos cantos." },
        { nome: "data-tema=\"claro|escuro\"", tipo: "atributo", descricao: "No <html>, força um tema." },
        { nome: "data-at-tema=\"alternar\"", tipo: "atributo", descricao: "Botão que troca o tema e salva a preferência." },
        { nome: "Atalho.definirTema(\"escuro\")", tipo: "função", descricao: "Troca o tema via JavaScript (\"claro\", \"escuro\" ou \"sistema\")." },
        { nome: "at:tema", tipo: "evento", descricao: "Disparado quando o tema muda. detail.tema traz o tema atual." },
      ],
      exemplos: [
        {
          titulo: "Sua marca em uma linha",
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
          titulo: "Trocando só um trecho",
          descricao: "Variáveis definidas num elemento valem só para ele e seus filhos.",
          html: `<div class="at-linha">
  <button class="at-botao at-primario">Padrão</button>

  <div class="at-linha" style="--at-cor-primaria: #7c3aed; --at-cor-primaria-forte: #6d28d9;">
    <button class="at-botao at-primario">Roxo</button>
  </div>

  <div class="at-linha" style="--at-cor-primaria: #ea580c; --at-cor-primaria-forte: #c2410c; --at-raio: 999px;">
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
        "at-grade: listas de cartões, produtos, fotos. O número de colunas se adapta à tela.",
        "at-colunas-2/3/4: quando você quer no máximo N colunas. Funciona até dentro de painéis e cartões, porque olha o espaço do container, não o tamanho da tela.",
        "at-pilha: empilhar coisas com o mesmo espaço entre elas (formulários, seções).",
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
        { nome: "at-container", tipo: "classe", descricao: "Centraliza com largura máxima. Some at-estreito para textos." },
        { nome: "at-secao", tipo: "classe", descricao: "Espaço vertical generoso para seções de página." },
        { nome: "at-grade", tipo: "classe", descricao: "Grade automática. Ajuste com --min (largura mínima do item)." },
        { nome: "at-colunas-2 / -3 / -4", tipo: "classe", descricao: "No máximo 2, 3 ou 4 colunas. Usa menos quando o espaço do container não comporta (ajuste com --min)." },
        { nome: "at-pilha", tipo: "classe", descricao: "Coluna com espaço igual. Ajuste com --at-gap." },
        { nome: "at-linha", tipo: "classe", descricao: "Lado a lado com quebra. Combine com at-entre, at-fim, at-centro, at-topo." },
        { nome: "at-cresce", tipo: "classe", descricao: "Item da linha que ocupa o espaço que sobrar." },
      ],
      exemplos: [
        {
          titulo: "Grade automática",
          descricao: "Diminua a janela: as colunas se reorganizam sozinhas.",
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
          descricao: "O padrão de quase todo cabeçalho de seção: título à esquerda, ação à direita.",
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
        "As classes at-titulo-* mudam só a aparência, então você escolhe a tag pela importância (h1, h2...) e o tamanho pela classe. O título principal usa clamp() e cresce junto com a tela.",
      recursos: ["min-max-clamp", "text-wrap-balance"],
      mdn: [pt("Estruturando conteúdo com HTML", "Learn_web_development/Core/Structuring_content")],
      conectaCom: ["hero", "layout"],
      acessibilidade: ["Use só um <h1> por página e não pule níveis (h2 depois de h1, h3 depois de h2)."],
      api: [
        { nome: "at-titulo-1 ... at-titulo-4", tipo: "classe", descricao: "Tamanhos de título." },
        { nome: "at-sobretitulo", tipo: "classe", descricao: "Texto pequeno em caixa alta acima do título." },
        { nome: "at-chamada", tipo: "classe", descricao: "Parágrafo de introdução maior e mais suave." },
        { nome: "at-texto-suave / at-texto-pequeno", tipo: "classe", descricao: "Texto secundário." },
        { nome: "at-tecla", tipo: "classe", descricao: "Desenho de tecla. Use com <kbd>." },
      ],
      exemplos: [
        {
          titulo: "Hierarquia de uma seção",
          html: `<span class="at-sobretitulo">Novidade</span>
<h2 class="at-titulo-2">Relatórios em tempo real</h2>
<p class="at-chamada">Acompanhe vendas, estoque e clientes num só lugar, atualizado a cada minuto.</p>
<p class="at-texto-suave at-texto-pequeno">
  Pressione <kbd class="at-tecla">Ctrl</kbd> + <kbd class="at-tecla">K</kbd> para buscar.
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
      inspiradoEm: ["gov.br (Design System do governo federal)", "Nubank e Inter (formulários de abertura de conta)", "Stripe Checkout"],
      quandoUsar: ["Sempre que a pessoa precisar digitar ou escolher algo."],
      evitar: ["Placeholder no lugar do rótulo: ele some quando a pessoa começa a digitar e ela esquece o que era o campo."],
      comoFunciona:
        "Envolva cada campo em .at-campo com um <label> ligado pelo for/id. Use o type certo (email, tel, number) e o autocomplete certo: no celular isso abre o teclado adequado e permite preencher com um toque.",
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
        "Todo campo precisa de <label>. Clicar no rótulo foca o campo e o leitor de tela lê o nome.",
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
        { nome: "at-grupo-entrada + at-adicional", tipo: "classe", descricao: "Prefixo/sufixo colado ao campo (R$, @, .com.br, botão)." },
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
    <label class="at-rotulo" for="estado-campo">Estado</label>
    <select class="at-entrada" id="estado-campo" autocomplete="address-level1">
      <option value="">Selecione</option>
      <option>São Paulo</option>
      <option>Rio de Janeiro</option>
      <option>Minas Gerais</option>
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
      <label class="at-check"><input type="radio" name="pagamento" checked> Pix</label>
      <label class="at-check"><input type="radio" name="pagamento"> Cartão</label>
      <label class="at-check"><input type="radio" name="pagamento"> Boleto</label>
    </div>
  </fieldset>

  <label class="at-linha">
    <input type="checkbox" role="switch" class="at-chave" checked>
    Notificações no celular
  </label>
</div>`,
        },
        {
          titulo: "Prefixo, sufixo e busca",
          html: `<div class="at-pilha" style="max-width: 420px">
  <div class="at-grupo-entrada">
    <span class="at-adicional">https://</span>
    <input class="at-entrada" aria-label="Endereço do site" placeholder="minhaloja">
    <span class="at-adicional">.com.br</span>
  </div>

  <div class="at-grupo-entrada">
    <input class="at-entrada" type="email" aria-label="Seu e-mail" placeholder="Seu melhor e-mail">
    <button class="at-botao at-primario">Assinar</button>
  </div>

  <div class="at-entrada-icone">
    ${i.busca}
    <input class="at-entrada" type="search" aria-label="Buscar" placeholder="Buscar produtos, marcas e muito mais">
  </div>
</div>`,
        },
      ],
    },

    {
      id: "mascaras",
      nome: "Máscaras (CPF, CNPJ, telefone...)",
      categoria: "formularios",
      resumo: "Formata enquanto a pessoa digita: CPF, CNPJ (inclusive o novo alfanumérico), telefone, CEP, moeda, cartão, validade, data e placa.",
      apelidos: ["máscara", "mask", "cpf", "cnpj", "telefone", "celular", "cep", "dinheiro", "moeda", "real", "cartão de crédito", "placa", "formatar campo", "pontos e traços"],
      inspiradoEm: ["Mercado Livre e Magalu (checkout)", "Bancos digitais (Pix e cadastro)", "Receita Federal (CNPJ alfanumérico)"],
      quandoUsar: ["Em todo campo de documento ou número brasileiro. Reduz erro de digitação e deixa claro o formato esperado."],
      evitar: ["Data de nascimento: prefira <input type=\"date\">, que já abre um calendário no celular."],
      comoFunciona:
        "Basta data-at-mascara=\"tipo\". O Atalho formata a cada tecla, mantém o cursor no lugar certo (sem pular para o fim), escolhe o teclado numérico no celular e limita o tamanho. Se o formulário usar data-at-validar, CPF e CNPJ têm os dígitos verificadores conferidos. Desde julho de 2026 a Receita emite CNPJ com letras e números; a máscara e a validação já aceitam os dois formatos.",
      recursos: ["inputmode", "input-event"],
      mdn: [en("Atributo inputmode", "Web/HTML/Reference/Global_attributes/inputmode")],
      conectaCom: ["validacao", "cep", "campo"],
      acessibilidade: ["Mostre o formato esperado na ajuda (ex.: 000.000.000-00). A máscara ajuda quem enxerga, mas o leitor de tela precisa do texto."],
      api: [
        { nome: "data-at-mascara=\"cpf\"", tipo: "atributo", descricao: "000.000.000-00" },
        { nome: "data-at-mascara=\"cnpj\"", tipo: "atributo", descricao: "00.000.000/0000-00, aceita letras (CNPJ alfanumérico)" },
        { nome: "data-at-mascara=\"telefone\"", tipo: "atributo", descricao: "(11) 98765-4321 ou (11) 3456-7890" },
        { nome: "data-at-mascara=\"cep\"", tipo: "atributo", descricao: "00000-000" },
        { nome: "data-at-mascara=\"moeda\"", tipo: "atributo", descricao: "R$ 1.234,56. O número puro fica em data-at-numero." },
        { nome: "data-at-mascara=\"cartao\" / \"validade\"", tipo: "atributo", descricao: "0000 0000 0000 0000 e 00/00" },
        { nome: "data-at-mascara=\"data\" / \"placa\"", tipo: "atributo", descricao: "00/00/0000 e ABC-1D23 (Mercosul)" },
        { nome: "Atalho.validar.cpf(texto)", tipo: "função", descricao: "true/false. Também .cnpj, .email, .telefone, .cep" },
      ],
      exemplos: [
        {
          titulo: "Todos os formatos",
          descricao: "Digite só números (ou letras, no CNPJ e na placa).",
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
    <label class="at-rotulo" for="m-tel">Celular</label>
    <input class="at-entrada" id="m-tel" type="tel" data-at-mascara="telefone" autocomplete="tel-national" placeholder="(11) 98765-4321">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-cep">CEP</label>
    <input class="at-entrada" id="m-cep" data-at-mascara="cep" autocomplete="postal-code" placeholder="00000-000">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-valor">Valor</label>
    <input class="at-entrada" id="m-valor" data-at-mascara="moeda" placeholder="R$ 0,00">
  </div>
  <div class="at-campo at-meio">
    <label class="at-rotulo" for="m-placa">Placa</label>
    <input class="at-entrada" id="m-placa" data-at-mascara="placa" placeholder="ABC-1D23">
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
          titulo: "Validando por JavaScript",
          descricao: "Útil antes de enviar dados para uma API.",
          html: `<div class="at-linha">
  <input class="at-entrada" id="cpf-teste" data-at-mascara="cpf" aria-label="CPF" style="max-width: 200px" value="529.982.247-25">
  <button class="at-botao" id="cpf-conferir">Conferir</button>
</div>`,
          js: `document.querySelector("#cpf-conferir").addEventListener("click", () => {
  const cpf = document.querySelector("#cpf-teste").value;
  if (Atalho.validar.cpf(cpf)) {
    Atalho.notificar("CPF válido.", { tipo: "sucesso" });
  } else {
    Atalho.notificar("CPF inválido.", { tipo: "perigo" });
  }
});`,
        },
      ],
    },

    {
      id: "cep",
      nome: "Endereço pelo CEP",
      categoria: "formularios",
      resumo: "A pessoa digita o CEP e rua, bairro, cidade e estado se preenchem sozinhos. Usa a API gratuita do ViaCEP, sem cadastro.",
      apelidos: ["cep", "endereço", "viacep", "buscar endereço", "autocompletar endereço", "logradouro", "correios", "frete"],
      inspiradoEm: ["Mercado Livre, Amazon e iFood (cadastro de endereço)", "Correios"],
      quandoUsar: ["Em qualquer cadastro de endereço brasileiro: checkout, entrega, nota fiscal."],
      comoFunciona:
        "Coloque data-at-cep no campo do CEP e data-at-cep-preencher=\"chave\" nos campos de destino, usando os nomes da resposta do ViaCEP: logradouro, bairro, localidade (cidade), uf, estado, complemento, ddd. Ao completar 8 dígitos, o Atalho consulta a API, preenche, e foca o campo marcado com data-at-cep-foco (normalmente o número). Os resultados ficam em cache para não repetir a consulta.",
      recursos: ["fetch", "abortable-fetch"],
      mdn: [pt("Fetch API", "Web/API/Fetch_API"), pt("Usando Fetch", "Web/API/Fetch_API/Using_Fetch")],
      conectaCom: ["mascaras", "validacao", "receita-cadastro"],
      acessibilidade: ["O campo do CEP recebe aria-busy enquanto consulta, e o erro aparece em texto ligado ao campo por aria-describedby."],
      api: [
        { nome: "data-at-cep", tipo: "atributo", descricao: "Marca o campo que dispara a busca. Combine com data-at-mascara=\"cep\"." },
        { nome: "data-at-cep-preencher=\"logradouro\"", tipo: "atributo", descricao: "Campo que recebe um dado do endereço." },
        { nome: "data-at-cep-foco", tipo: "atributo", descricao: "Campo que recebe o foco depois de preencher." },
        { nome: "at:cep", tipo: "evento", descricao: "detail traz o endereço completo retornado pelo ViaCEP." },
        { nome: "at:cep-erro", tipo: "evento", descricao: "CEP inexistente ou sem conexão. detail.mensagem explica." },
      ],
      exemplos: [
        {
          titulo: "Cadastro de endereço",
          descricao: "Teste com 01310-100 (Av. Paulista) ou o CEP da sua casa.",
          html: `<form class="at-formulario" style="max-width: 640px" data-at-validar>
  <div class="at-campo at-terco">
    <label class="at-rotulo" for="end-cep">CEP</label>
    <input class="at-entrada" id="end-cep" name="cep" required data-at-mascara="cep" data-at-cep autocomplete="postal-code">
    <a class="at-ajuda" href="https://buscacepinter.correios.com.br/" target="_blank" rel="noopener">Não sei meu CEP</a>
  </div>
  <div class="at-campo at-dois-tercos">
    <label class="at-rotulo" for="end-rua">Rua</label>
    <input class="at-entrada" id="end-rua" name="rua" required data-at-cep-preencher="logradouro" autocomplete="address-line1">
  </div>
  <div class="at-campo at-terco">
    <label class="at-rotulo" for="end-numero">Número</label>
    <input class="at-entrada" id="end-numero" name="numero" required data-at-cep-foco inputmode="numeric">
  </div>
  <div class="at-campo at-dois-tercos">
    <label class="at-rotulo" for="end-bairro">Bairro</label>
    <input class="at-entrada" id="end-bairro" name="bairro" required data-at-cep-preencher="bairro">
  </div>
  <div class="at-campo at-dois-tercos">
    <label class="at-rotulo" for="end-cidade">Cidade</label>
    <input class="at-entrada" id="end-cidade" name="cidade" required data-at-cep-preencher="localidade" autocomplete="address-level2">
  </div>
  <div class="at-campo at-terco">
    <label class="at-rotulo" for="end-uf">UF</label>
    <input class="at-entrada" id="end-uf" name="uf" required maxlength="2" data-at-cep-preencher="uf" autocomplete="address-level1">
  </div>
</form>`,
          js: `document.querySelector("#end-cep").addEventListener("at:cep", (evento) => {
  const { localidade, uf, ddd } = evento.detail;
  console.log("Endereço encontrado:", localidade, uf, "DDD", ddd);
});`,
        },
      ],
    },

    {
      id: "validacao",
      nome: "Validação de formulário",
      categoria: "formularios",
      resumo: "Mensagens de erro claras, em português, no lugar certo e na hora certa. Sem biblioteca extra, usando a validação nativa do navegador.",
      apelidos: ["validar", "validação", "erro", "obrigatório", "required", "form validation", "enviar formulário", "submit", "mensagem de erro", "confirmar senha"],
      inspiradoEm: ["GOV.UK Design System (padrão de mensagens de erro)", "Stripe (validação ao sair do campo)", "Google (cadastro de conta)"],
      quandoUsar: ["Em todo formulário que a pessoa envia."],
      evitar: ["Mostrar erro enquanto a pessoa ainda está digitando pela primeira vez. Espere ela sair do campo."],
      comoFunciona:
        "Adicione data-at-validar ao <form> e use os atributos nativos: required, type=\"email\", minlength, pattern, min, max. O Atalho troca as mensagens do navegador (que variam e às vezes vêm em inglês) por mensagens consistentes em português. O erro aparece quando a pessoa sai do campo ou tenta enviar, e some assim que ela corrige. Se o formulário não tiver action, o envio não recarrega a página: você recebe os dados no evento at:enviar, pronto para mandar a uma API.",
      recursos: ["constraint-validation", "input-event"],
      mdn: [
        en("Validação de formulários (Constraint validation)", "Web/HTML/Guides/Constraint_validation"),
        en("<form>", "Web/HTML/Reference/Elements/form"),
        pt("FormData", "Web/API/FormData"),
      ],
      conectaCom: ["campo", "mascaras", "senha", "notificacao", "requisitar"],
      acessibilidade: [
        "O campo inválido recebe aria-invalid=\"true\" e aria-describedby apontando para a mensagem, então o leitor de tela lê o erro.",
        "Ao enviar com erro, o foco vai para o primeiro campo errado.",
      ],
      api: [
        { nome: "data-at-validar", tipo: "atributo", descricao: "No <form>. Liga a validação em português." },
        { nome: "data-msg-obrigatorio / data-msg-formato", tipo: "atributo", descricao: "Troca a mensagem padrão de um campo." },
        { nome: "data-at-igual=\"#outro\"", tipo: "atributo", descricao: "Exige o mesmo valor de outro campo (confirmar senha ou e-mail)." },
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
    <label class="at-rotulo" for="cc-cpf">CPF</label>
    <input class="at-entrada" id="cc-cpf" name="cpf" required data-at-mascara="cpf">
  </div>
  <div class="at-campo">
    <label class="at-rotulo" for="cc-senha">Senha</label>
    <input class="at-entrada" id="cc-senha" name="senha" type="password" required minlength="8" autocomplete="new-password">
    <span class="at-ajuda">Mínimo de 8 caracteres.</span>
  </div>
  <div class="at-campo">
    <label class="at-rotulo" for="cc-senha2">Confirme a senha</label>
    <input class="at-entrada" id="cc-senha2" type="password" required data-at-igual="#cc-senha" data-msg-igual="As senhas não são iguais." autocomplete="new-password">
  </div>
  <div class="at-campo">
    <label class="at-check">
      <input type="checkbox" name="termos" required data-msg-obrigatorio="Você precisa aceitar os termos.">
      Li e aceito os termos de uso
    </label>
  </div>
  <button class="at-botao at-primario at-bloco">Criar conta</button>
</form>`,
          js: `document.querySelector("#form-conta").addEventListener("at:enviar", (evento) => {
  const { dados, botao } = evento.detail;
  botao.setAttribute("aria-busy", "true");

  // Aqui você mandaria para a sua API:
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
      nome: "Senha (mostrar e força)",
      categoria: "formularios",
      resumo: "Campo de senha com botão Mostrar/Ocultar e medidor de força que avisa enquanto a pessoa digita.",
      apelidos: ["senha", "password", "mostrar senha", "olho", "força da senha", "senha forte", "login"],
      inspiradoEm: ["Google (criar conta)", "Microsoft (login)", "Bancos digitais"],
      quandoUsar: ["Em cadastro e troca de senha. No login, use só o Mostrar/Ocultar (sem medidor)."],
      comoFunciona:
        "Envolva o input em .at-senha com um botão data-at-ver-senha. Para o medidor, coloque .at-forca (com 4 spans) e .at-forca-texto no mesmo .at-campo. A força considera tamanho, maiúsculas e minúsculas, números, símbolos e sequências óbvias (123, senha...).",
      recursos: [],
      mdn: [pt("<input>", "Web/HTML/Reference/Elements/input")],
      conectaCom: ["validacao", "codigo", "receita-login"],
      acessibilidade: [
        "O botão recebe aria-pressed e troca o texto entre Mostrar e Ocultar.",
        "Use autocomplete=\"new-password\" no cadastro e \"current-password\" no login: gerenciadores de senha dependem disso.",
      ],
      api: [
        { nome: "at-senha", tipo: "classe", descricao: "Container do campo com o botão." },
        { nome: "data-at-ver-senha", tipo: "atributo", descricao: "Botão que mostra/oculta a senha." },
        { nome: "at-forca + at-forca-texto", tipo: "classe", descricao: "Medidor de força (data-nivel de 1 a 4)." },
      ],
      exemplos: [
        {
          titulo: "Nova senha",
          html: `<div class="at-campo" style="max-width: 360px">
  <label class="at-rotulo" for="nova-senha">Crie uma senha</label>
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
      resumo: "Seis caixinhas para o código recebido por SMS ou e-mail. Avança sozinho, aceita colar e preenche automático pelo SMS no celular.",
      apelidos: ["otp", "código", "token", "sms", "verificação em duas etapas", "2fa", "pin", "código de segurança", "autenticação"],
      inspiradoEm: ["WhatsApp (confirmação de número)", "Nubank e bancos (token)", "Google (verificação em duas etapas)"],
      quandoUsar: ["Confirmação de telefone, e-mail ou login em duas etapas."],
      comoFunciona:
        "Envolva os inputs em .at-codigo com data-at=\"codigo\". O primeiro campo recebe autocomplete=\"one-time-code\", que faz iPhone e Android sugerirem o código do SMS. Quando todos os dígitos estão preenchidos, o evento at:codigo traz o valor completo.",
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
          titulo: "Confirme seu número",
          descricao: "O código certo é 123456. Teste também colar.",
          html: `<div class="at-pilha" style="--at-gap: 12px">
  <p class="at-mb-0">Enviamos um código por SMS para <strong>(11) 9••••-4321</strong>.</p>
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
    Atalho.notificar("Código incorreto. Confira o SMS.", { tipo: "perigo" });
  }
});`,
        },
      ],
    },

    {
      id: "upload",
      nome: "Enviar arquivos",
      categoria: "formularios",
      resumo: "Área para arrastar e soltar arquivos, com prévia das imagens, tamanho formatado, botão de remover e limite de tamanho.",
      apelidos: ["upload", "arquivo", "anexo", "arrastar e soltar", "drag and drop", "enviar foto", "imagem", "file input", "dropzone"],
      inspiradoEm: ["Google Drive", "WeTransfer", "Notion (anexos)"],
      quandoUsar: ["Envio de documentos, fotos de produtos, comprovantes."],
      comoFunciona:
        "É um <input type=\"file\"> de verdade dentro de um <label>: clicar abre o seletor, e arrastar também funciona. O Atalho mostra a lista em .at-upload-lista (logo depois da área, ou onde data-lista indicar). Para enviar ao servidor, use FormData com o próprio formulário.",
      recursos: ["input-file", "input-file-multiple", "draganddrop", "file"],
      mdn: [
        en("<input type=\"file\">", "Web/HTML/Reference/Elements/input/file"),
        pt("API de arrastar e soltar", "Web/API/HTML_Drag_and_Drop_API"),
        pt("URL.createObjectURL()", "Web/API/URL/createObjectURL_static"),
      ],
      conectaCom: ["validacao", "requisitar", "notificacao"],
      acessibilidade: ["Como é um input real, funciona com teclado (Tab + Enter) e leitores de tela, o que muitas áreas de arrastar feitas só com div não fazem."],
      api: [
        { nome: "data-at=\"upload\"", tipo: "atributo", descricao: "No <label class=\"at-upload\">." },
        { nome: "data-tamanho-maximo=\"5\"", tipo: "atributo", descricao: "Limite em MB por arquivo (avisa se passar)." },
        { nome: "data-lista=\"#id\"", tipo: "atributo", descricao: "Onde mostrar a lista (padrão: próximo elemento)." },
        { nome: "at:arquivos", tipo: "evento", descricao: "Arquivos escolhidos. detail.arquivos é uma lista de File." },
      ],
      exemplos: [
        {
          titulo: "Fotos do produto",
          html: `<label class="at-upload" data-at="upload" data-tamanho-maximo="5">
  ${i.upload}
  <span><strong>Clique para escolher</strong> ou arraste as fotos aqui</span>
  <small>PNG, JPG ou WEBP, até 5 MB cada</small>
  <input type="file" accept="image/*" multiple class="at-sr">
</label>
<ul class="at-upload-lista"></ul>`,
          js: `document.addEventListener("at:arquivos", (evento) => {
  console.log(evento.detail.arquivos.length + " arquivo(s) pronto(s) para enviar");

  // Para enviar ao servidor:
  // const dados = new FormData();
  // evento.detail.arquivos.forEach((arquivo) => dados.append("fotos", arquivo));
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
      resumo: "Botões para cada nível de importância, tamanhos, ícones, estado de carregando, grupo e contador.",
      apelidos: ["button", "btn", "botão", "cta", "call to action", "carregando", "loading", "ícone", "grupo de botões"],
      inspiradoEm: ["GitHub (Primer)", "Stripe Dashboard", "Shopify Polaris"],
      quandoUsar: [
        "at-primario: a ação principal da tela. Uma só por área.",
        "Botão padrão (sem modificador): ações secundárias.",
        "at-fantasma ou at-link: ações discretas, como Cancelar.",
        "at-perigo: excluir, cancelar assinatura. Sempre com confirmação.",
      ],
      evitar: ["<div> ou <a> clicável no lugar de <button>: não funciona com teclado nem com leitor de tela."],
      comoFunciona:
        "Use <button> para ações e <a class=\"at-botao\"> para navegação (ir para outra página). Para mostrar que algo está carregando, coloque aria-busy=\"true\": o texto dá lugar a um indicador girando e o botão para de aceitar cliques, o que evita pedidos duplicados.",
      recursos: [],
      mdn: [pt("<button>", "Web/HTML/Reference/Elements/button")],
      conectaCom: ["menu-suspenso", "modal", "notificacao", "dica"],
      acessibilidade: [
        "Botão só com ícone precisa de aria-label descrevendo a ação.",
        "Em grupos de alternância (Dia/Semana/Mês), use aria-pressed.",
      ],
      api: [
        { nome: "at-botao", tipo: "classe", descricao: "Base." },
        { nome: "at-primario / at-suave / at-perigo / at-sucesso / at-fantasma / at-link", tipo: "classe", descricao: "Variações." },
        { nome: "at-pequeno / at-grande / at-bloco / at-icone", tipo: "classe", descricao: "Tamanhos e formatos." },
        { nome: "aria-busy=\"true\"", tipo: "atributo", descricao: "Estado carregando." },
        { nome: "at-grupo-botoes", tipo: "classe", descricao: "Botões colados. Marque o ativo com aria-pressed=\"true\"." },
        { nome: "at-contador-selo + [data-contador]", tipo: "classe", descricao: "Número sobre o botão (carrinho, notificações)." },
        { nome: "data-at-notificar=\"texto\"", tipo: "atributo", descricao: "Mostra uma notificação ao clicar (atalho rápido)." },
      ],
      exemplos: [
        {
          titulo: "Variações",
          html: `<div class="at-linha">
  <button class="at-botao at-primario">Salvar alterações</button>
  <button class="at-botao">Exportar</button>
  <button class="at-botao at-suave">Convidar</button>
  <button class="at-botao at-fantasma">Cancelar</button>
  <button class="at-botao at-perigo">Excluir</button>
  <button class="at-botao at-link">Ver detalhes</button>
</div>`,
        },
        {
          titulo: "Tamanhos e ícones",
          html: `<div class="at-linha">
  <button class="at-botao at-primario at-pequeno">Pequeno</button>
  <button class="at-botao at-primario">Normal</button>
  <button class="at-botao at-primario at-grande">Grande</button>
  <button class="at-botao">${i.baixar} Baixar PDF</button>
  <button class="at-botao at-icone" aria-label="Editar">${i.editar}</button>
  <button class="at-botao at-icone at-fantasma" aria-label="Excluir">${i.lixo}</button>
</div>`,
        },
        {
          titulo: "Carregando ao salvar",
          html: `<button class="at-botao at-primario" id="botao-salvar">Salvar</button>`,
          js: `const botao = document.querySelector("#botao-salvar");

botao.addEventListener("click", () => {
  botao.setAttribute("aria-busy", "true");

  setTimeout(() => {
    botao.removeAttribute("aria-busy");
    Atalho.notificar("Alterações salvas.", { tipo: "sucesso" });
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
      resumo: "Lista de ações que abre ao clicar num botão: o famoso menu dos três pontinhos e o menu do usuário.",
      apelidos: ["dropdown", "menu", "três pontos", "kebab", "popover", "menu do usuário", "opções", "mais ações", "context menu"],
      inspiradoEm: ["GitHub (menu de cada repositório)", "Gmail (mais opções)", "Notion (menu de bloco)"],
      quandoUsar: ["Quando há várias ações secundárias e pouco espaço, como em cada linha de uma tabela."],
      evitar: ["Esconder a ação principal num menu. Se é o que a pessoa mais faz, deixe à vista."],
      comoFunciona:
        "Usa o atributo nativo popover, disponível em todos os navegadores atuais desde 2025. O próprio navegador fecha o menu ao clicar fora ou apertar Esc. O Atalho posiciona o menu ao lado do botão, troca de lado se faltar espaço na tela e deixa navegar com as setas.",
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
  <button class="at-menu-item at-perigo" data-at-notificar="Projeto excluído" data-at-tipo="perigo">
    ${i.lixo} Excluir
  </button>
</div>`,
        },
        {
          titulo: "Menu do usuário",
          html: `<div class="at-linha at-fim">
  <button class="at-botao at-fantasma" popovertarget="menu-usuario" style="padding-inline: 6px">
    <span class="at-avatar at-pequeno">MZ</span> Marcos ▾
  </button>
</div>

<div id="menu-usuario" popover class="at-menu" data-alinhar="fim">
  <div class="at-menu-titulo">marcos@exemplo.com</div>
  <a class="at-menu-item" href="#">Meu perfil</a>
  <a class="at-menu-item" href="#">Configurações</a>
  <button class="at-menu-item" data-at-tema="alternar" data-manter-aberto>${i.lua} Tema escuro</button>
  <hr class="at-menu-separador">
  <a class="at-menu-item" href="#">${i.sair} Sair</a>
</div>`,
        },
      ],
    },

    {
      id: "copiar",
      nome: "Copiar (Pix, cupom, link)",
      categoria: "acoes",
      resumo: "Botão que copia um texto para a área de transferência e confirma com \"Copiado!\". Perfeito para Pix copia e cola, cupom e link de convite.",
      apelidos: ["copiar", "clipboard", "área de transferência", "pix", "copia e cola", "cupom", "compartilhar link", "copy"],
      inspiradoEm: ["Apps de banco (Pix copia e cola)", "GitHub (copiar URL do repositório)", "iFood (cupom)"],
      quandoUsar: ["Sempre que a pessoa precisar levar um texto para outro lugar: chave Pix, código de rastreio, link."],
      comoFunciona:
        "data-at-copiar=\"#id\" copia o valor (ou texto) do elemento indicado; data-at-copiar=\"texto\" copia o texto literal. Usa a Clipboard API, que só funciona em HTTPS ou em localhost.",
      recursos: ["async-clipboard"],
      mdn: [en("Clipboard API", "Web/API/Clipboard_API")],
      conectaCom: ["campo", "notificacao", "botao"],
      acessibilidade: ["A troca do texto para \"Copiado!\" confirma a ação para quem enxerga; o botão mantém o foco."],
      api: [
        { nome: "data-at-copiar=\"#id\" ou \"texto\"", tipo: "atributo", descricao: "O que copiar." },
        { nome: "data-texto-copiado", tipo: "atributo", descricao: "Troca a confirmação (padrão: Copiado!)." },
      ],
      exemplos: [
        {
          titulo: "Pix copia e cola",
          html: `<div class="at-campo" style="max-width: 460px">
  <label class="at-rotulo" for="pix-codigo">Pix copia e cola</label>
  <div class="at-grupo-entrada">
    <input class="at-entrada" id="pix-codigo" readonly value="00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540529.905802BR5913LOJA EXEMPLO6009SAO PAULO62070503***6304ABCD">
    <button class="at-botao at-primario" data-at-copiar="#pix-codigo">${i.copiar} Copiar</button>
  </div>
  <span class="at-ajuda">Abra o app do seu banco, escolha Pix copia e cola e cole o código.</span>
</div>`,
        },
        {
          titulo: "Cupom",
          html: `<button class="at-botao at-suave" data-at-copiar="BEMVINDO10" data-texto-copiado="Cupom copiado!">
  Cupom BEMVINDO10 · 10% off
</button>`,
        },
      ],
    }
  );
})();
