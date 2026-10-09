/*
 * Editor ao vivo do Atalho. O código fica no endereço (#...), então o link
 * pode ser compartilhado sem servidor. O resultado roda num iframe isolado
 * (sandbox sem allow-same-origin): o código não alcança o site nem a conta.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const raiz = $("[data-editor]");
  if (!raiz) return;

  const campos = {
    html: $('[data-linguagem="html"]', raiz),
    css: $('[data-linguagem="css"]', raiz),
    js: $('[data-linguagem="js"]', raiz),
  };
  const previa = $("[data-editor-previa]", raiz);
  const consoleLista = $("[data-editor-console]", raiz);
  const base = new URL(document.body.dataset.base || "/", location.origin).href;
  const CDN = "https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho";

  const INICIAL = {
    html: `<main class="at-container at-secao at-pilha">
  <h1 class="at-titulo-2">Olá, Atalho!</h1>
  <p class="at-chamada">Edite este código e veja o resultado ao lado.</p>
  <div class="at-linha">
    <button class="at-botao at-primario" id="botao">Clique aqui</button>
    <input class="at-entrada" data-at-mascara="cpf" placeholder="Digite um CPF" style="max-width: 220px">
  </div>
</main>`,
    css: `/* Personalize aqui. Ex.: troque a cor principal */
:root {
  --at-cor-primaria: #0f766e;
}`,
    js: `document.querySelector("#botao").addEventListener("click", () => {
  Atalho.notificar("Funcionou!", { tipo: "sucesso" });
  console.log("Botão clicado às", Atalho.formatar.hora(new Date()));
});`,
  };

  const codificar = (dados) => {
    const bytes = new TextEncoder().encode(JSON.stringify(dados));
    let binario = "";
    bytes.forEach((b) => (binario += String.fromCharCode(b)));
    return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const decodificar = (texto) => {
    const binario = atob(texto.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(binario, (c) => c.charCodeAt(0))));
  };

  function carregarDoEndereco() {
    try {
      if (location.hash.length > 1) return { ...INICIAL, css: "", ...decodificar(location.hash.slice(1)) };
    } catch {
      window.Atalho?.notificar("O link do editor está incompleto. Abrimos o exemplo inicial.", { tipo: "aviso" });
    }
    return INICIAL;
  }

  /** Página inteira (cabeçalho, menu, seções) ou só um trecho, como um formulário? */
  const ehPaginaInteira = (html) =>
    /<(header|main|nav|aside|section)/i.test(html) || /class="[^"]*at-(app|barra|hero|secao|container)/.test(html);

  // Trechos ganham margem e ficam centralizados, em vez de colados na borda da tela
  const ESPACO_TRECHO = `
    /* Espaço em volta do exemplo. Apague se o seu layout já tiver o próprio. */
    body { max-width: 1120px; margin-inline: auto; padding: clamp(16px, 4vw, 48px); }`;

  const documento = (dados, cdn = false) => {
    const caminho = cdn ? CDN : `${base}atalho`;
    // Envia console.log e erros para o painel de console do editor
    const ponte = cdn
      ? ""
      : `<script>
(function(){var enviar=function(tipo,args){try{parent.postMessage({atalhoEditor:true,tipo:tipo,texto:Array.prototype.map.call(args,function(a){try{return typeof a==="string"?a:JSON.stringify(a)}catch(e){return String(a)}}).join(" ")},"*")}catch(e){}};
["log","info","warn","error"].forEach(function(t){var original=console[t];console[t]=function(){enviar(t,arguments);original.apply(console,arguments)}});
addEventListener("error",function(e){enviar("error",["Erro: "+e.message+(e.lineno?" (linha "+e.lineno+")":"")])});})();
<\/script>`;
    return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Meu projeto com o Atalho</title>
  <link rel="stylesheet" href="${caminho}/atalho.css">
  <style>${ehPaginaInteira(dados.html) ? "" : ESPACO_TRECHO}
${dados.css}
  </style>
  ${ponte}
  <script src="${caminho}/atalho.js" defer><\/script>
</head>
<body>
${dados.html}
  <script>
document.addEventListener("DOMContentLoaded", function () {
${dados.js}
});
  <\/script>
</body>
</html>`;
  };

  const lerCampos = () => ({ html: campos.html.value, css: campos.css.value, js: campos.js.value });

  let temporizador;
  function atualizar() {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      consoleLista.textContent = "";
      const dados = lerCampos();
      previa.srcdoc = documento(dados);
      history.replaceState(null, "", `#${codificar(dados)}`);
    }, 350);
  }

  addEventListener("message", (evento) => {
    if (evento.source !== previa.contentWindow || !evento.data?.atalhoEditor) return;
    const item = document.createElement("li");
    item.dataset.tipo = evento.data.tipo;
    item.textContent = String(evento.data.texto).slice(0, 2000);
    consoleLista.append(item);
    while (consoleLista.children.length > 200) consoleLista.firstElementChild.remove();
    consoleLista.parentElement.scrollTop = consoleLista.parentElement.scrollHeight;
  });

  for (const campo of Object.values(campos)) {
    campo.addEventListener("input", atualizar);
    // Tab insere dois espaços em vez de sair do campo; Esc libera o Tab para navegar
    campo.addEventListener("keydown", (e) => {
      if (e.key === "Escape") campo.dataset.tabLivre = "";
      if (e.key !== "Tab" || e.shiftKey || campo.dataset.tabLivre != null) return;
      e.preventDefault();
      const { selectionStart: inicio, selectionEnd: fim, value } = campo;
      campo.value = value.slice(0, inicio) + "  " + value.slice(fim);
      campo.selectionStart = campo.selectionEnd = inicio + 2;
      atualizar();
    });
    campo.addEventListener("blur", () => delete campo.dataset.tabLivre);
  }

  raiz.addEventListener("click", async (e) => {
    const acao = e.target.closest("[data-editor-acao]")?.dataset.editorAcao;
    if (acao === "compartilhar") {
      history.replaceState(null, "", `#${codificar(lerCampos())}`);
      await navigator.clipboard?.writeText(location.href);
      window.Atalho.notificar("Link copiado. Quem abrir verá exatamente este código.", { tipo: "sucesso" });
    }
    if (acao === "baixar") {
      const arquivo = new Blob([documento(lerCampos(), true)], { type: "text/html;charset=utf-8" });
      const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(arquivo), download: "index.html" });
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }
    if (acao === "limpar") {
      Object.entries(INICIAL).forEach(([chave, valor]) => (campos[chave].value = valor));
      atualizar();
    }
    if (acao === "limpar-console") consoleLista.textContent = "";
  });

  const inicial = carregarDoEndereco();
  Object.entries(inicial).forEach(([chave, valor]) => (campos[chave].value = valor ?? ""));
  previa.srcdoc = documento(inicial);
})();
