/*
 * Assistente do Atalho (lado do navegador).
 * Envia a pergunta ao Worker da Cloudflare (servicos/assistente) e mostra:
 * explicação, componentes relacionados, código e uma prévia isolada.
 * Sem Worker configurado ou se a IA falhar, mostra a busca local.
 */
(function () {
  "use strict";

  const config = (window.ATALHO_CONFIG || {}).assistente || {};
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  let dialogo;

  function base() {
    return new URL(document.body.dataset.base || "/", location.origin).href;
  }

  function montar() {
    if (dialogo) return dialogo;
    dialogo = document.createElement("dialog");
    dialogo.className = "at-modal at-grande site-assistente";
    dialogo.setAttribute("aria-labelledby", "assistente-titulo");
    dialogo.innerHTML = `
      <div class="at-modal-cabecalho">
        <h2 id="assistente-titulo">✨ Assistente do Atalho</h2>
        <button type="button" class="at-botao at-icone at-fantasma at-pequeno" data-at-fechar aria-label="Fechar">×</button>
      </div>
      <div class="at-modal-corpo at-pilha">
        <form class="at-grupo-entrada" data-assistente-form>
          <input class="at-entrada" name="pergunta" maxlength="400" required autocomplete="off"
                 placeholder="Ex.: formulário de contato com CPF e telefone" aria-label="Descreva o que você quer construir">
          <button class="at-botao at-primario">Perguntar</button>
        </form>
        <div data-assistente-saida aria-live="polite"></div>
        <p class="at-texto-suave at-texto-pequeno at-mb-0">Respostas geradas por IA podem ter erros: confira antes de usar. Não digite dados pessoais.</p>
      </div>`;
    document.body.append(dialogo);
    $("[data-assistente-form]", dialogo).addEventListener("submit", (e) => {
      e.preventDefault();
      perguntar(e.target.pergunta.value);
    });
    return dialogo;
  }

  function sugestoesLocais(pergunta) {
    const achados = window.AtalhoSite?.buscar(pergunta, 5) || [];
    if (!achados.length) return '<p class="at-texto-suave">Não encontrei nada parecido. Tente descrever de outro jeito.</p>';
    return `<p>Componentes que combinam com a sua busca:</p><div class="site-relacionados">${achados
      .map((c) => `<a href="${c.url}"><strong>${esc(c.nome)}</strong><span>${esc(c.resumo)}</span></a>`)
      .join("")}</div>`;
  }

  function previa(html) {
    const raiz = base();
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="${raiz}atalho/atalho.css"><script src="${raiz}atalho/atalho.js" defer><\/script>
<style>body{padding:16px;background:transparent}</style></head><body>${html}</body></html>`;
  }

  async function perguntar(pergunta) {
    const saida = $("[data-assistente-saida]", dialogo);
    const botao = $("[data-assistente-form] button", dialogo);
    pergunta = String(pergunta || "").trim().slice(0, 400);
    if (!pergunta) return;

    if (!config.url) {
      saida.innerHTML = sugestoesLocais(pergunta);
      return;
    }

    botao.setAttribute("aria-busy", "true");
    saida.innerHTML = '<div class="at-pilha" style="--at-gap:8px"><span class="at-esqueleto at-titulo"></span><span class="at-esqueleto"></span><span class="at-esqueleto" style="width:70%"></span></div>';
    try {
      const resposta = await window.Atalho.requisitar(`${config.url.replace(/\/$/, "")}/perguntar`, {
        metodo: "POST",
        corpo: { pergunta },
        tempoLimite: 45000,
      });
      const indice = new Map((window.ATALHO_INDICE || []).map((c) => [c.id, c]));
      const relacionados = (resposta.componentes || []).map((id) => indice.get(id)).filter(Boolean);
      saida.innerHTML = `
        <div class="site-explicacao"><p>${esc(resposta.resposta)}</p></div>
        ${relacionados.length ? `<div class="site-relacionados at-mt-4">${relacionados.map((c) => `<a href="${c.url}"><strong>${esc(c.nome)}</strong><span>${esc(c.resumo)}</span></a>`).join("")}</div>` : ""}
        ${
          resposta.html
            ? `<div class="site-exemplo-caixa at-mt-4">
                <iframe class="site-assistente-previa" title="Prévia do código gerado" sandbox="allow-scripts" loading="lazy"></iframe>
                <div class="site-codigo-abas"><span class="site-codigo-rotulo">HTML gerado</span><button type="button" class="at-botao at-pequeno site-copiar" data-copiar-codigo>Copiar</button></div>
                <pre class="site-codigo" tabindex="0"><code>${esc(resposta.html)}</code></pre>
              </div>`
            : ""
        }`;
      const iframe = $(".site-assistente-previa", saida);
      if (iframe) iframe.srcdoc = previa(resposta.html);
    } catch (erro) {
      const limite = erro.status === 429;
      saida.innerHTML = `<div class="at-alerta at-aviso"><div class="at-alerta-conteudo"><strong>${limite ? "O assistente atingiu o limite de uso por agora" : "O assistente não respondeu"}</strong><p>${
        limite ? "Tente de novo em alguns minutos." : "Enquanto isso, veja o que a busca encontrou."
      }</p></div></div>${sugestoesLocais(pergunta)}`;
    } finally {
      botao.removeAttribute("aria-busy");
    }
  }

  window.AtalhoAssistente = {
    disponivel: () => Boolean(config.url),
    abrir(pergunta = "") {
      montar();
      const campo = $("[name=pergunta]", dialogo);
      campo.value = pergunta;
      $("[data-assistente-saida]", dialogo).innerHTML = "";
      dialogo.showModal();
      campo.focus();
      if (pergunta.trim()) perguntar(pergunta);
    },
  };

  document.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-abrir-assistente]");
    if (botao) window.AtalhoAssistente.abrir(botao.dataset.abrirAssistente || "");
  });
})();
