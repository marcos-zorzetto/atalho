/*
 * Vitrine com prévia ao vivo, ajustes, código e tutorial (Estúdio de animações e
 * Componentes avançados). O catálogo vem na página; o código de cada item vem do
 * Supabase, e o banco só entrega o que a pessoa pode usar:
 *   visitante → nível "publico"; membro → publico + membro; Pro → todos.
 *
 * A prévia roda num iframe isolado (sandbox, sem acesso ao site). Cada ajuste
 * vira uma variável CSS em :root, que o código do item lê com var().
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const raiz = $("[data-vitrine]");
  if (!raiz) return;

  const { ativo, cliente, traduzir, notificar, usuario, linkConta } = window.AtalhoSupabase;
  const { tipo, prefixo, itens, precos, textos } = JSON.parse($("#vitrine-catalogo").textContent);
  const porId = new Map(itens.map((a) => [a.id, a]));
  const base = new URL(document.body.dataset.base || "/", location.origin).href;
  const CDN = "https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho";
  const estudio = $("#vitrine-estudio");
  const codigos = new Map(); // id → código liberado pelo banco
  const conta = (nivel) => itens.filter((a) => a.nivel === nivel).length;
  let pessoa = null;
  let atual = null;
  let valores = {};

  /* ------------------------------------------------------------------------
     Acesso
     ------------------------------------------------------------------------ */

  const link = (texto, href, primario = false) =>
    Object.assign(document.createElement("a"), { className: `at-botao at-pequeno${primario ? " at-primario" : ""}`, href, textContent: texto });

  function aviso(titulo, texto, acoes = []) {
    $("[data-vitrine-aviso-titulo]").textContent = titulo;
    $("[data-vitrine-aviso-texto]").textContent = texto;
    const caixa = $("[data-vitrine-aviso-acoes]");
    caixa.replaceChildren(...acoes);
    caixa.hidden = !acoes.length;
  }

  function marcarCartoes() {
    for (const cartao of $$("[data-item]")) {
      const liberado = codigos.has(cartao.dataset.item);
      cartao.dataset.liberada = String(liberado);
      $("[data-item-estado]", cartao).lastChild.textContent = liberado ? " Abrir e usar" : " Bloqueado";
    }
  }

  async function carregar() {
    if (!ativo) {
      aviso("Em breve", "As contas estão sendo ativadas. Volte em alguns dias.");
      return marcarCartoes();
    }
    pessoa = await usuario();
    // Sem conta, o banco entrega só o nível "publico" (a amostra grátis)
    const { data, error } = await cliente.from("conteudos").select("id, html").eq("tipo", tipo);
    if (error) {
      aviso(`Não foi possível carregar os ${textos.itens}`, traduzir(error));
      return marcarCartoes();
    }
    for (const linha of data) codigos.set(linha.id.slice(prefixo.length), linha.html);
    const temPro = itens.some((a) => a.nivel === "pro" && codigos.has(a.id));
    if (!pessoa) {
      aviso(
        `${codigos.size} ${textos.itens} grátis para você testar agora`,
        `Crie sua conta grátis para liberar ${conta("publico") + conta("membro")}. O Pro libera todos os ${itens.length}, além dos sistemas completos.`,
        [link("Criar conta grátis", linkConta({ criar: true }), true), link("Já tenho conta", linkConta())]
      );
    } else if (temPro) {
      aviso(`Todos os ${itens.length} ${textos.itens} liberados`, "Você tem o Atalho Pro. Abra qualquer um, ajuste e copie.");
    } else {
      aviso(
        `Você tem ${codigos.size} ${textos.itens} liberados`,
        `Assine o Pro (${precos.proMensal}/mês ou ${precos.proAnual}/ano) para liberar mais ${itens.length - codigos.size}, os sistemas completos e tudo o que for lançado.`,
        [link("Conhecer o Pro", `${base}pro/`, true)]
      );
    }
    marcarCartoes();
  }

  /* ------------------------------------------------------------------------
     Filtros
     ------------------------------------------------------------------------ */

  raiz.addEventListener("click", (evento) => {
    const filtro = evento.target.closest("[data-vitrine-filtro]");
    if (filtro) {
      for (const botao of $$("[data-vitrine-filtro]")) botao.setAttribute("aria-pressed", String(botao === filtro));
      for (const cartao of $$("[data-item]")) {
        cartao.parentElement.hidden = Boolean(filtro.dataset.vitrineFiltro) && cartao.dataset.categoria !== filtro.dataset.vitrineFiltro;
      }
      return;
    }
    const cartao = evento.target.closest("[data-item]");
    if (cartao) abrir(cartao.dataset.item);
  });

  /* ------------------------------------------------------------------------
     Estúdio
     ------------------------------------------------------------------------ */

  const parametros = () => atual.parametros || [];
  const valorCss = (p, valor) => (p.tipo === "numero" ? `${valor}${p.unidade || ""}` : String(valor));
  const reduzir = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function blocoAjustes() {
    if (!parametros().length) return "";
    const linhas = parametros().map((p) => `    ${p.var}: ${valorCss(p, valores[p.var])};`).join("\n");
    return `<style>\n  /* Seus ajustes: mude aqui quando quiser */\n  :root {\n${linhas}\n  }\n</style>\n\n`;
  }

  const codigoFinal = () => `<!-- ${textos.item[0].toUpperCase() + textos.item.slice(1)} "${atual.nome}" · Atalho -->\n${blocoAjustes()}${codigos.get(atual.id)}`;

  function documento({ previa }) {
    let codigo = codigos.get(atual.id);
    if (previa && $("[data-estudio-forcar-caixa]").checked) codigo = codigo.replace(/prefers-reduced-motion: reduce/g, "prefers-reduced-motion: desligado-na-previa");
    const caminho = previa ? `${base}atalho` : CDN;
    const tema = previa ? document.documentElement.dataset.tema : "";
    // Trechos ficam centralizados, sem passar da largura (celular)
    const centralizar =
      atual.rolagem || atual.paginaInteira
        ? ""
        : "body { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; padding: 24px; box-sizing: border-box; } body > :not(script, style) { max-width: 100%; }";
    return `<!doctype html>
<html lang="pt-BR"${tema ? ` data-tema="${tema}"` : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${atual.nome}</title>
${previa ? `<base href="${base}">\n` : ""}<link rel="stylesheet" href="${caminho}/atalho.css">
<style>body { margin: 0; } ${centralizar}</style>
${blocoAjustes()}<script src="${caminho}/atalho.js" defer><\/script>
</head>
<body>
${codigo}
</body>
</html>
`;
  }

  let temporizador;
  function atualizar({ imediato = false } = {}) {
    $("[data-estudio-fonte]").textContent = codigoFinal();
    $("[data-estudio-editor]").href = `${base}editor/#${codificarEditor(codigoFinal())}`;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => ($("[data-estudio-previa]").srcdoc = documento({ previa: true })), imediato ? 0 : 180);
  }

  function codificarEditor(texto) {
    const bytes = new TextEncoder().encode(JSON.stringify({ html: texto, css: "", js: "" }));
    let binario = "";
    bytes.forEach((b) => (binario += String.fromCharCode(b)));
    return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function criarControle(p, indice) {
    const id = `vitrine-controle-${indice}`;
    const campo = document.createElement("div");
    campo.className = "at-campo";
    campo.append(Object.assign(document.createElement("label"), { className: "at-rotulo", htmlFor: id, textContent: p.rotulo }));
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

  /** Passo a passo em linguagem simples: o geral do tipo + as dicas de cada item. */
  function montarTutorial() {
    const caixa = $("[data-estudio-tutorial]");
    caixa.textContent = "";
    const titulo = (texto) => caixa.append(Object.assign(document.createElement("h3"), { className: "at-titulo-4", textContent: texto }));
    const lista = (passos) => {
      const ol = document.createElement("ol");
      for (const passo of passos) {
        const li = document.createElement("li");
        if (Array.isArray(passo)) {
          // [texto antes, { link }, texto depois]
          for (const parte of passo) li.append(typeof parte === "string" ? parte : Object.assign(document.createElement("a"), { href: parte.href, textContent: parte.texto }));
        } else li.textContent = passo;
        ol.append(li);
      }
      caixa.append(ol);
    };
    const temAjustes = parametros().length > 0;
    titulo("Usar no seu site em 4 passos");
    lista([
      temAjustes ? `Ajuste nos controles ao lado (${parametros().map((p) => p.rotulo.toLowerCase()).join(", ")}) e veja o resultado na hora.` : "Veja a prévia e teste no computador, no tablet e no celular pelos botões acima dela.",
      "Clique em \"Copiar\" (ou em \"Baixar página\" para receber um arquivo .html pronto, que abre direto no navegador).",
      "No seu site, abra o arquivo .html num editor de texto (o Bloco de Notas serve; o VS Code é melhor e grátis) e cole o código dentro do <body>, onde o bloco deve aparecer.",
      [
        "Se a sua página ainda não usa o Atalho, cole também estas duas linhas dentro do <head>: o estilo (atalho.css) e o script (atalho.js). Elas estão no arquivo baixado e na ",
        { texto: "página de instalação", href: `${base}componentes/instalacao/` },
        ".",
      ],
    ]);
    titulo("Trocar textos, fotos e cores");
    lista([
      "Textos: troque direto no código copiado, entre as tags (por exemplo, o que está entre <h2> e </h2>).",
      "Fotos: troque o endereço que está em src=\"...\" pelo da sua imagem. Se ela estiver na mesma pasta, basta o nome do arquivo, como src=\"minha-foto.jpg\".",
      temAjustes ? "Cores e medidas: mude os valores no bloco \"Seus ajustes\", no começo do código." : "Cores: mude os valores em \"color\" e \"background\" dentro do <style> do código.",
    ]);
    if (atual.dicas?.length) {
      titulo("Dicas para este item");
      lista(atual.dicas);
    }
    titulo("Colocar o site no ar");
    lista([
      [{ texto: "Publicar o site de graça (passo a passo)", href: `${base}aprender/publicar-gratis/` }],
      [{ texto: "Comprar um domínio próprio (.com ou .com.br)", href: `${base}aprender/dominio/` }],
      [{ texto: "Ter e-mail profissional com o seu domínio", href: `${base}aprender/email-profissional/` }],
    ]);
  }

  function bloquear() {
    const nivel = atual.nivel;
    $("[data-estudio-bloqueio]").hidden = false;
    $("[data-estudio-area]").hidden = true;
    const acoes = $("[data-estudio-bloqueio-acoes]");
    if (nivel === "membro" && !pessoa) {
      $("[data-estudio-bloqueio-titulo]").textContent = "Grátis para quem tem conta";
      $("[data-estudio-bloqueio-texto]").textContent = `Crie sua conta grátis (leva 1 minuto) e use este e mais ${conta("publico") + conta("membro") - 1} ${textos.itens} agora, com prévia, ajustes e tutorial.`;
      acoes.replaceChildren(link("Criar conta grátis", linkConta({ criar: true }), true), link("Já tenho conta", linkConta()));
    } else {
      $("[data-estudio-bloqueio-titulo]").textContent = "Exclusivo do Atalho Pro";
      $("[data-estudio-bloqueio-texto]").textContent = `O Pro libera este e todos os ${itens.length} ${textos.itens}, os sistemas completos prontos para vender e tudo o que for lançado, por ${precos.proMensal}/mês.`;
      acoes.replaceChildren(
        ...(pessoa ? [link("Conhecer o Pro", `${base}pro/`, true)] : [link("Conhecer o Pro", `${base}pro/`, true), link("Criar conta grátis", linkConta({ criar: true }))])
      );
    }
  }

  function abrir(id) {
    atual = porId.get(id);
    if (!atual) return;
    $("[data-estudio-nome]").textContent = atual.nome;
    $("[data-estudio-descricao]").textContent = atual.descricao;
    const nivel = $("[data-estudio-nivel]");
    nivel.dataset.nivel = atual.nivel;
    nivel.textContent = { publico: "Grátis", membro: "Membro", pro: "★ Pro" }[atual.nivel];
    if (!codigos.has(id)) {
      bloquear();
      return estudio.showModal();
    }
    $("[data-estudio-bloqueio]").hidden = true;
    $("[data-estudio-area]").hidden = false;
    $("[data-estudio-controles]").hidden = !parametros().length;
    raiz.ownerDocument.querySelector(".site-anim-area").classList.toggle("site-vitrine-sem-ajustes", !parametros().length);
    valores = Object.fromEntries(parametros().map((p) => [p.var, p.padrao]));
    $("[data-estudio-dica]").textContent = atual.rolagem ? "Role dentro da prévia para ver o efeito." : "";
    $("[data-estudio-forcar]").hidden = !(reduzir() && tipo === "animacao");
    $("[data-estudio-controles]").replaceChildren(...parametros().map(criarControle));
    montarTutorial();
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
    const tela = evento.target.closest("[data-tela]");
    if (tela) {
      for (const b of $$("[data-tela]", estudio)) b.setAttribute("aria-checked", String(b === tela));
      $("[data-estudio-previa]").style.width = tela.dataset.tela;
      return;
    }
    const acao = evento.target.closest("[data-estudio-acao]")?.dataset.estudioAcao;
    if (!acao || !atual) return;
    if (acao === "copiar") {
      await navigator.clipboard.writeText(codigoFinal());
      notificar("Código copiado com os seus ajustes.", "sucesso");
    }
    if (acao === "baixar") {
      const endereco = URL.createObjectURL(new Blob([documento({ previa: false })], { type: "text/html;charset=utf-8" }));
      Object.assign(document.createElement("a"), { href: endereco, download: `${atual.id}.html` }).click();
      setTimeout(() => URL.revokeObjectURL(endereco), 1000);
    }
    if (acao === "restaurar") {
      valores = Object.fromEntries(parametros().map((p) => [p.var, p.padrao]));
      $("[data-estudio-controles]").replaceChildren(...parametros().map(criarControle));
      atualizar({ imediato: true });
    }
  });
  $("[data-estudio-forcar-caixa]").addEventListener("change", () => atualizar({ imediato: true }));

  cliente?.auth.onAuthStateChange((evento) => {
    if (evento === "SIGNED_IN" && !pessoa) carregar();
    if (evento === "SIGNED_OUT") location.reload();
  });

  carregar()
    .then(() => {
      // Link direto: /animacoes/#parallax abre o estúdio naquele item
      const id = decodeURIComponent(location.hash.slice(1));
      if (porId.has(id)) abrir(id);
    })
    .catch((erro) => {
      console.error(erro);
      aviso(`Não foi possível carregar os ${textos.itens}`, traduzir(erro));
    });
})();
