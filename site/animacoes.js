/*
 * Estúdio de animações. O catálogo (nomes, níveis e controles) vem na própria
 * página; o código de cada animação vem do Supabase, e o banco só entrega o que
 * a pessoa pode usar: nada para visitantes, as simples para membros, todas no Pro.
 *
 * A prévia roda num iframe isolado (sandbox sem acesso ao site). Cada controle
 * vira uma variável CSS em :root, que o código da animação lê com var().
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const raiz = $(".site-anim");
  if (!raiz) return;

  const { ativo, cliente, traduzir, notificar, usuario, linkConta } = window.AtalhoSupabase;
  const { animacoes, precos } = JSON.parse($("#anim-catalogo").textContent);
  const porId = new Map(animacoes.map((a) => [a.id, a]));
  const base = new URL(document.body.dataset.base || "/", location.origin).href;
  const estudio = $("#anim-estudio");
  const codigos = new Map(); // id → código liberado pelo banco
  let pessoa = null;
  let atual = null; // animação aberta no estúdio
  let valores = {}; // ajustes da animação aberta

  /* ------------------------------------------------------------------------
     Acesso
     ------------------------------------------------------------------------ */

  function aviso(titulo, texto, acoes = []) {
    $("[data-anim-aviso-titulo]").textContent = titulo;
    $("[data-anim-aviso-texto]").textContent = texto;
    const caixa = $("[data-anim-aviso-acoes]");
    caixa.replaceChildren(...acoes);
    caixa.hidden = !acoes.length;
  }

  const link = (texto, href, primario = false) =>
    Object.assign(document.createElement("a"), { className: `at-botao at-pequeno${primario ? " at-primario" : ""}`, href, textContent: texto });

  function marcarCartoes() {
    for (const cartao of $$("[data-animacao]")) {
      const liberada = codigos.has(cartao.dataset.animacao);
      cartao.dataset.liberada = String(liberada);
      $("[data-anim-estado]", cartao).lastChild.textContent = liberada ? " Abrir no estúdio" : " Bloqueada";
    }
  }

  async function carregar() {
    if (!ativo) {
      aviso("Estúdio em breve", "As contas estão sendo ativadas. Volte em alguns dias para usar as animações.");
      return marcarCartoes();
    }
    pessoa = await usuario();
    if (!pessoa) {
      aviso(
        "Crie sua conta grátis para começar",
        `Com a conta você libera ${animacoes.filter((a) => a.nivel === "membro").length} animações na hora. O Pro libera todas as ${animacoes.length}.`,
        [link("Criar conta grátis", linkConta({ criar: true }), true), link("Já tenho conta", linkConta())]
      );
      return marcarCartoes();
    }
    const { data, error } = await cliente.from("conteudos").select("id, html").eq("tipo", "animacao");
    if (error) {
      aviso("Não foi possível carregar as animações", traduzir(error));
      return marcarCartoes();
    }
    for (const linha of data) codigos.set(linha.id.replace(/^anim-/, ""), linha.html);
    const temPro = animacoes.some((a) => a.nivel === "pro" && codigos.has(a.id));
    if (temPro) aviso("Todas as animações liberadas", "Você tem o Atalho Pro. Abra qualquer efeito, ajuste e copie.");
    else
      aviso(
        `Você tem ${codigos.size} animações liberadas`,
        `Assine o Pro (${precos.proMensal}/mês ou ${precos.proAnual}/ano) para liberar as ${animacoes.length - codigos.size} avançadas: rolagem, 3D, partículas, transições e mais.`,
        [link("Conhecer o Pro", `${base}pro/`, true)]
      );
    marcarCartoes();
  }

  /* ------------------------------------------------------------------------
     Filtros
     ------------------------------------------------------------------------ */

  raiz.addEventListener("click", (evento) => {
    const filtro = evento.target.closest("[data-anim-filtro]");
    if (filtro) {
      for (const botao of $$("[data-anim-filtro]")) botao.setAttribute("aria-pressed", String(botao === filtro));
      for (const cartao of $$("[data-animacao]")) {
        cartao.parentElement.hidden = Boolean(filtro.dataset.animFiltro) && cartao.dataset.categoria !== filtro.dataset.animFiltro;
      }
      return;
    }
    const cartao = evento.target.closest("[data-animacao]");
    if (cartao) abrir(cartao.dataset.animacao);
  });

  /* ------------------------------------------------------------------------
     Estúdio
     ------------------------------------------------------------------------ */

  const valorCss = (p, valor) => (p.tipo === "numero" ? `${valor}${p.unidade || ""}` : String(valor));
  const reduzir = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function blocoAjustes() {
    const linhas = atual.parametros.map((p) => `    ${p.var}: ${valorCss(p, valores[p.var])};`).join("\n");
    return `<style>\n  /* Seus ajustes: mude aqui quando quiser */\n  :root {\n${linhas}\n  }\n</style>`;
  }

  /** O código entregue: ajustes + a animação, com um cabeçalho dizendo de onde veio. */
  const codigoFinal = () =>
    `<!-- Animação "${atual.nome}" · Estúdio de animações do Atalho -->\n${blocoAjustes()}\n\n${codigos.get(atual.id)}`;

  function documentoPrevia() {
    let codigo = codigos.get(atual.id);
    // Quem pediu "reduzir movimento" vê a versão parada; o botão permite ver mesmo assim
    if ($("[data-estudio-forcar-caixa]").checked) codigo = codigo.replace(/prefers-reduced-motion: reduce/g, "prefers-reduced-motion: desligado-na-previa");
    const tema = document.documentElement.dataset.tema;
    // Centraliza o exemplo sem deixar passar da largura da prévia (celular)
    const centralizar = atual.rolagem
      ? ""
      : "body { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; padding: 24px; box-sizing: border-box; } body > :not(script, style) { max-width: 100%; }";
    return `<!doctype html>
<html lang="pt-BR"${tema ? ` data-tema="${tema}"` : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${base}">
<link rel="stylesheet" href="${base}atalho/atalho.css">
<style>body { margin: 0; } ${centralizar}</style>
${blocoAjustes()}
<script src="${base}atalho/atalho.js" defer><\/script>
</head>
<body>
${codigo}
</body>
</html>`;
  }

  let temporizador;
  function atualizar({ imediato = false } = {}) {
    $("[data-estudio-fonte]").textContent = codigoFinal();
    $("[data-estudio-editor]").href = `${base}editor/#${codificarEditor(codigoFinal())}`;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => ($("[data-estudio-previa]").srcdoc = documentoPrevia()), imediato ? 0 : 180);
  }

  function codificarEditor(texto) {
    const bytes = new TextEncoder().encode(JSON.stringify({ html: texto, css: "", js: "" }));
    let binario = "";
    bytes.forEach((b) => (binario += String.fromCharCode(b)));
    return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function criarControle(p, indice) {
    const id = `anim-controle-${indice}`;
    const campo = document.createElement("div");
    campo.className = "at-campo";
    const rotulo = Object.assign(document.createElement("label"), { className: "at-rotulo", htmlFor: id, textContent: p.rotulo });
    campo.append(rotulo);
    let entrada;
    if (p.tipo === "numero") {
      const linha = document.createElement("div");
      linha.className = "site-anim-faixa";
      entrada = Object.assign(document.createElement("input"), { type: "range", id, min: p.min, max: p.max, step: p.passo, value: valores[p.var] });
      const saida = Object.assign(document.createElement("output"), { htmlFor: id, textContent: valorCss(p, valores[p.var]) });
      entrada.addEventListener("input", () => {
        valores[p.var] = Number(entrada.value);
        saida.textContent = valorCss(p, valores[p.var]);
        atualizar();
      });
      linha.append(entrada, saida);
      campo.append(linha);
    } else if (p.tipo === "cor") {
      entrada = Object.assign(document.createElement("input"), { type: "color", id, value: valores[p.var], className: "site-anim-cor" });
      entrada.addEventListener("input", () => {
        valores[p.var] = entrada.value;
        atualizar();
      });
      campo.append(entrada);
    } else {
      entrada = Object.assign(document.createElement("select"), { id, className: "at-entrada" });
      for (const [valor, texto] of p.opcoes) entrada.append(new Option(texto, valor, false, valor === valores[p.var]));
      entrada.addEventListener("change", () => {
        valores[p.var] = entrada.value;
        atualizar({ imediato: true });
      });
      campo.append(entrada);
    }
    return campo;
  }

  function montarControles() {
    const formulario = $("[data-estudio-controles]");
    formulario.replaceChildren(...atual.parametros.map(criarControle));
  }

  function bloquear() {
    const ehPro = atual.nivel === "pro";
    $("[data-estudio-bloqueio]").hidden = false;
    $("[data-estudio-area]").hidden = true;
    const acoes = $("[data-estudio-bloqueio-acoes]");
    if (!pessoa) {
      $("[data-estudio-bloqueio-titulo]").textContent = ehPro ? "Animação do Atalho Pro" : "Grátis para quem tem conta";
      $("[data-estudio-bloqueio-texto]").textContent = ehPro
        ? "Crie sua conta grátis e depois assine o Pro para liberar esta e todas as outras animações avançadas."
        : "Crie sua conta grátis e use esta animação agora, com todos os controles.";
      acoes.replaceChildren(link("Criar conta grátis", linkConta({ criar: true }), true), link("Já tenho conta", linkConta()));
    } else {
      $("[data-estudio-bloqueio-titulo]").textContent = "Animação do Atalho Pro";
      $("[data-estudio-bloqueio-texto]").textContent = `O Pro libera esta e mais ${animacoes.filter((a) => a.nivel === "pro").length - 1} animações avançadas, todas as páginas Pro e os componentes premium, por ${precos.proMensal}/mês.`;
      acoes.replaceChildren(link("Conhecer o Pro", `${base}pro/`, true));
    }
  }

  function abrir(id) {
    atual = porId.get(id);
    if (!atual) return;
    $("[data-estudio-nome]").textContent = atual.nome;
    $("[data-estudio-descricao]").textContent = atual.descricao;
    const nivel = $("[data-estudio-nivel]");
    nivel.dataset.nivel = atual.nivel;
    nivel.textContent = atual.nivel === "pro" ? "★ Pro" : "Membro";
    if (!codigos.has(id)) {
      bloquear();
      return estudio.showModal();
    }
    $("[data-estudio-bloqueio]").hidden = true;
    $("[data-estudio-area]").hidden = false;
    valores = Object.fromEntries(atual.parametros.map((p) => [p.var, p.padrao]));
    $("[data-estudio-dica]").textContent = atual.rolagem ? "Role dentro da prévia para ver o efeito." : "";
    $("[data-estudio-forcar]").hidden = !reduzir();
    montarControles();
    atualizar({ imediato: true });
    estudio.showModal();
    history.replaceState(null, "", `#${id}`);
  }

  estudio.addEventListener("close", () => {
    $("[data-estudio-previa]").srcdoc = "";
    if (location.hash) history.replaceState(null, "", location.pathname);
  });

  estudio.addEventListener("click", async (evento) => {
    if (evento.target.closest("[data-estudio-repetir]")) return atualizar({ imediato: true });
    const acao = evento.target.closest("[data-estudio-acao]")?.dataset.estudioAcao;
    if (!acao || !atual) return;
    if (acao === "copiar") {
      await navigator.clipboard.writeText(codigoFinal());
      notificar("Código copiado com os seus ajustes.", "sucesso");
    }
    if (acao === "baixar") {
      const pagina = `<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${atual.nome}</title>\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho/atalho.css">\n</head>\n<body>\n${codigoFinal()}\n<script src="https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho/atalho.js" defer><\/script>\n</body>\n</html>\n`;
      const endereco = URL.createObjectURL(new Blob([pagina], { type: "text/html;charset=utf-8" }));
      Object.assign(document.createElement("a"), { href: endereco, download: `animacao-${atual.id}.html` }).click();
      setTimeout(() => URL.revokeObjectURL(endereco), 1000);
    }
    if (acao === "restaurar") {
      valores = Object.fromEntries(atual.parametros.map((p) => [p.var, p.padrao]));
      montarControles();
      atualizar({ imediato: true });
    }
  });
  $("[data-estudio-forcar-caixa]").addEventListener("change", () => atualizar({ imediato: true }));

  // Entrou ou saiu em outra aba: atualiza sem recarregar
  cliente?.auth.onAuthStateChange((evento) => {
    if (evento === "SIGNED_IN" && !pessoa) carregar();
    if (evento === "SIGNED_OUT") location.reload();
  });

  carregar()
    .then(() => {
      // Link direto: /animacoes/#parallax abre o estúdio naquela animação
      const id = decodeURIComponent(location.hash.slice(1));
      if (porId.has(id)) abrir(id);
    })
    .catch((erro) => {
      console.error(erro);
      aviso("Não foi possível carregar as animações", traduzir(erro));
    });
})();
