/*
 * /sistemas/: descarregar um sistema completo (Pro).
 * O pacote (ficheiros de texto do sistema) vem da tabela "conteudos" do Supabase,
 * que só o devolve a quem tem o Pro, comprou ou é administrador. Aqui junta-se o
 * atalho.css/js do próprio site e monta-se o zip no navegador.
 */
(function () {
  "use strict";

  const aviso = document.querySelector("[data-sistemas-aviso]");
  const base = document.body.dataset.base || "/";
  const supa = window.AtalhoSupabase || {};

  /* ---------- Zip sem compressão (método "store"), suficiente para texto pequeno ---------- */
  const TABELA = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc32 = (bytes) => {
    let c = 0xffffffff;
    for (const b of bytes) c = TABELA[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  function zip(ficheiros) {
    const codificar = new TextEncoder();
    const partes = [];
    const central = [];
    let posicao = 0;
    for (const [nome, texto] of ficheiros) {
      const n = codificar.encode(nome);
      const dados = typeof texto === "string" ? codificar.encode(texto) : texto;
      const crc = crc32(dados);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, dados.length, true);
      local.setUint32(22, dados.length, true);
      local.setUint16(26, n.length, true);
      partes.push(local, n, dados);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true);
      c.setUint16(4, 20, true);
      c.setUint16(6, 20, true);
      c.setUint16(8, 0x0800, true);
      c.setUint32(16, crc, true);
      c.setUint32(20, dados.length, true);
      c.setUint32(24, dados.length, true);
      c.setUint16(28, n.length, true);
      c.setUint32(42, posicao, true);
      central.push(c, n);
      posicao += 30 + n.length + dados.length;
    }
    const tamanho = central.reduce((t, p) => t + p.byteLength, 0);
    const fim = new DataView(new ArrayBuffer(22));
    fim.setUint32(0, 0x06054b50, true);
    fim.setUint16(8, ficheiros.length, true);
    fim.setUint16(10, ficheiros.length, true);
    fim.setUint32(12, tamanho, true);
    fim.setUint32(16, posicao, true);
    return new Blob([...partes, ...central, fim], { type: "application/zip" });
  }

  function avisar(texto, link) {
    if (!aviso) return;
    aviso.hidden = false;
    aviso.replaceChildren(texto);
    if (link) {
      const a = Object.assign(document.createElement("a"), { href: link.href, textContent: link.texto });
      aviso.append(" ", a);
    }
    aviso.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  async function descarregar(botao) {
    const id = botao.dataset.sistemaBaixar;
    if (!supa.ativo) return avisar("A área de membros abre em breve. Entre na lista de espera do Pro para ser avisado.", { href: `${base}pro/`, texto: "Ver o Pro" });
    const pessoa = await supa.usuario();
    if (!pessoa) {
      location.href = supa.linkConta({ criar: true });
      return;
    }
    botao.disabled = true;
    const original = botao.textContent;
    botao.textContent = "A preparar…";
    try {
      const { data, error } = await supa.cliente.from("conteudos").select("html").eq("id", `sis-${id}`).maybeSingle();
      if (error) throw error;
      if (!data) return avisar(`O sistema "${botao.dataset.sistemaNome}" faz parte do Atalho Pro.`, { href: `${base}pro/`, texto: "Ver planos" });
      const pacote = JSON.parse(data.html);
      const ficheiros = Object.entries(pacote.ficheiros).map(([caminho, texto]) => [`${id}/${caminho}`, texto]);
      for (const nome of ["atalho.css", "atalho.js"]) {
        const resposta = await fetch(`${base}atalho/${nome}`);
        if (!resposta.ok) throw new Error("network");
        ficheiros.push([`${id}/atalho/${nome}`, await resposta.text()]);
      }
      const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(zip(ficheiros)), download: `${id}.zip` });
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 2000);
      supa.notificar?.(`${botao.dataset.sistemaNome}: zip descarregado. Siga o LEIA-ME.md para instalar.`, "sucesso");
    } catch (erro) {
      console.error(erro);
      avisar(supa.traduzir ? supa.traduzir(erro) : "Não foi possível descarregar. Tente de novo.");
    } finally {
      botao.disabled = false;
      botao.textContent = original;
    }
  }

  document.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-sistema-baixar]");
    if (botao) descarregar(botao);
  });

  /* ---------- Procurar e filtrar por área ---------- */
  const procura = document.querySelector("[data-sistemas-procura]");
  const contagem = document.querySelector("[data-sistemas-contagem]");
  const filtros = [...document.querySelectorAll("[data-sistemas-filtro]")];
  const cartoes = [...document.querySelectorAll("[data-sistema]")];
  const grupos = [...document.querySelectorAll("[data-sistemas-grupo]")];
  const vazio = document.querySelector("[data-sistemas-vazio]");
  const semAcentos = (t) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  cartoes.forEach((c) => (c.dataset.busca = semAcentos(c.dataset.busca || "")));
  let area = "todos";
  function aplicar() {
    const termos = semAcentos(procura?.value || "").split(/\s+/).filter(Boolean);
    let n = 0;
    for (const c of cartoes) {
      const mostra = (area === "todos" || c.dataset.grupo === area) && termos.every((t) => c.dataset.busca.includes(t));
      c.hidden = !mostra;
      if (mostra) n++;
    }
    for (const g of grupos) g.hidden = !g.querySelector("[data-sistema]:not([hidden])");
    if (vazio) vazio.hidden = n > 0;
    if (contagem) contagem.textContent = n === 1 ? "1 sistema" : `${n} sistemas`;
  }
  procura?.addEventListener("input", aplicar);
  for (const f of filtros) {
    f.addEventListener("click", () => {
      area = f.dataset.sistemasFiltro;
      filtros.forEach((x) => x.setAttribute("aria-pressed", String(x === f)));
      aplicar();
      document.querySelector("[data-sistemas-barra]")?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  }
})();
