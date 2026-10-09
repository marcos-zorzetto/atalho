/*
 * Área de membros: nas vitrines /exemplos/<id>/, mostra a página completa a quem
 * entrou na conta. O conteúdo vem do Supabase, e quem decide se a pessoa pode ler
 * é o banco (regra "conteudos: quem tem acesso lê"), não este arquivo. Páginas Pro
 * só voltam do banco para quem assina, comprou ou é administrador.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const raiz = $("[data-exclusivo]");
  if (!raiz) return;

  const { ativo, cliente, traduzir, notificar, usuario, linkConta } = window.AtalhoSupabase;
  const id = raiz.dataset.exclusivo;
  const base = new URL(document.body.dataset.base || "/", location.origin).href;
  const CDN = "https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho/";
  const cartao = $("[data-exclusivo-estado]", raiz);
  let html = "";

  function mostrar(estado) {
    cartao.dataset.exclusivoEstado = estado;
    for (const nome of ["carregando", "visitante", "pro", "indisponivel", "erro"]) {
      $(`[data-exclusivo-${nome}]`, cartao).hidden = nome !== estado;
    }
  }

  /** Os exemplos usam ../atalho/: na prévia, apontamos para o site; no download, para a CDN. */
  const paraPrevia = (codigo) => codigo.replace(/<head>/i, `<head>\n  <base href="${base}exemplos/">`);
  const paraDownload = (codigo) => codigo.replace(/(["'])\.\.\/atalho\//g, `$1${CDN}`);

  function codificarEditor(texto) {
    // O editor recebe HTML, CSS e JS separados; aqui vai o arquivo inteiro como HTML
    const bytes = new TextEncoder().encode(JSON.stringify({ html: texto, css: "", js: "" }));
    let binario = "";
    bytes.forEach((b) => (binario += String.fromCharCode(b)));
    return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function liberar(conteudo) {
    html = conteudo.html;
    $("[data-exclusivo-vitrine]", raiz).hidden = true;
    $("[data-exclusivo-membro]", raiz).hidden = false;
    $("[data-exclusivo-previa]", raiz).srcdoc = paraPrevia(html);
    $("[data-exclusivo-fonte]", raiz).textContent = html;
    $("[data-exclusivo-editor]", raiz).href = `${base}editor/#${codificarEditor(paraDownload(corpoParaEditor(html)))}`;
  }

  /** O editor monta o próprio <head> com o Atalho: levamos o <style> e o <body>. */
  function corpoParaEditor(codigo) {
    const estilos = [...codigo.matchAll(/<style>([\s\S]*?)<\/style>/gi)].map((m) => `<style>${m[1]}</style>`).join("\n");
    const corpo = codigo.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? codigo;
    return `${estilos}\n${corpo.trim()}`;
  }

  async function carregar() {
    mostrar("carregando");
    if (!ativo) return mostrar("indisponivel");
    $("[data-exclusivo-criar]", raiz).href = linkConta({ criar: true });
    $("[data-exclusivo-entrar]", raiz).href = linkConta();
    const pessoa = await usuario();
    if (!pessoa) return mostrar("visitante");
    const { data, error } = await cliente.from("conteudos").select("html, titulo").eq("id", id).maybeSingle();
    // Página Pro sem assinatura nem compra: o banco não devolve nada; oferece as opções
    if (!error && !data && raiz.dataset.exclusivoAcesso === "pro") return mostrar("pro");
    if (error || !data) {
      $("[data-exclusivo-erro-texto]", raiz).textContent = error
        ? traduzir(error)
        : "Esta página ainda está sendo publicada. Volte em alguns minutos.";
      return mostrar("erro");
    }
    liberar(data);
  }

  raiz.addEventListener("click", async (evento) => {
    if (evento.target.closest("[data-exclusivo-tentar]")) return carregar();
    const acao = evento.target.closest("[data-exclusivo-acao]")?.dataset.exclusivoAcao;
    if (!acao || !html) return;
    if (acao === "abrir") {
      const endereco = URL.createObjectURL(new Blob([paraPrevia(html)], { type: "text/html;charset=utf-8" }));
      window.open(endereco, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(endereco), 60000);
    }
    if (acao === "copiar") {
      await navigator.clipboard.writeText(paraDownload(html));
      notificar("Código copiado, já apontando para a CDN do Atalho.", "sucesso");
    }
    if (acao === "baixar") {
      const link = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(new Blob([paraDownload(html)], { type: "text/html;charset=utf-8" })),
        download: `${id}.html`,
      });
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }
  });

  // Entrou ou saiu em outra aba: atualiza sem recarregar
  cliente?.auth.onAuthStateChange((evento) => {
    if (evento === "SIGNED_IN" && !html) carregar();
    if (evento === "SIGNED_OUT") location.reload();
  });

  carregar().catch((erro) => {
    console.error(erro);
    $("[data-exclusivo-erro-texto]", raiz).textContent = traduzir(erro);
    mostrar("erro");
  });
})();
