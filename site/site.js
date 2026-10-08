/*
 * JavaScript do site de documentação (não faz parte da biblioteca).
 * As páginas já chegam prontas do gerador; aqui só fica a interação.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const indice = window.ATALHO_INDICE || [];
  const config = window.ATALHO_CONFIG || {};

  const esc = (texto) =>
    String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const normalizar = (texto) =>
    String(texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  /* ------------------------------------------------------------------------
     Busca em português: acentos, sinônimos e erros de digitação
     ------------------------------------------------------------------------ */

  const PALAVRAS_VAZIAS = new Set(
    "a o as os um uma de da do das dos e em no na nos nas para pra por com como fazer faco criar crio colocar usar quero preciso meu minha site pagina".split(" ")
  );

  function distancia(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    const linha = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let anterior = linha[0];
      linha[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const temp = linha[j];
        linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1));
        anterior = temp;
      }
    }
    return linha[b.length];
  }

  const preparado = indice.map((c) => {
    const nome = normalizar(c.nome);
    const apelidos = c.apelidos.map(normalizar);
    const palavras = new Set([...nome.split(/[^a-z0-9]+/), ...apelidos.flatMap((a) => a.split(/[^a-z0-9]+/))].filter((p) => p.length > 1));
    return { c, nome, apelidos, palavras: [...palavras], texto: normalizar([c.resumo, c.categoria, ...c.api].join(" ")) };
  });

  function buscar(termo, limite = 8) {
    const q = normalizar(termo);
    if (!q) return [];
    const termos = q.split(/\s+/).filter((p) => p && !PALAVRAS_VAZIAS.has(p));
    if (!termos.length) termos.push(q);
    const frase = termos.join(" ");
    const resultados = [];
    for (const item of preparado) {
      let pontos = 0;
      if (item.nome === frase) pontos += 100;
      else if (item.nome.startsWith(frase)) pontos += 60;
      else if (item.nome.includes(frase)) pontos += 40;
      for (const apelido of item.apelidos) {
        if (apelido === frase) { pontos += 80; break; }
        if (apelido.startsWith(frase)) { pontos += 35; break; }
        if (frase.length > 3 && apelido.includes(frase)) { pontos += 20; break; }
      }
      for (const t of termos) {
        if (item.palavras.some((p) => p.startsWith(t))) pontos += 14;
        else if (t.length > 2 && item.texto.includes(t)) pontos += 5;
        else if (t.length >= 4 && item.palavras.some((p) => distancia(p, t) <= (t.length > 6 ? 2 : 1))) pontos += 10;
        else pontos -= 8;
      }
      if (pontos > 8) resultados.push({ c: item.c, pontos });
    }
    return resultados.sort((a, b) => b.pontos - a.pontos).slice(0, limite).map((r) => r.c);
  }

  function destacar(texto, termo) {
    const termos = normalizar(termo).split(/\s+/).filter((t) => t.length > 1 && !PALAVRAS_VAZIAS.has(t));
    if (!termos.length) return esc(texto);
    const base = normalizar(texto);
    const marcas = new Array(texto.length).fill(false);
    for (const t of termos) {
      for (let i = base.indexOf(t); i !== -1; i = base.indexOf(t, i + t.length)) {
        for (let k = i; k < i + t.length; k++) marcas[k] = true;
      }
    }
    let saida = "";
    let aberto = false;
    for (let i = 0; i < texto.length; i++) {
      if (marcas[i] !== aberto) {
        saida += marcas[i] ? "<mark>" : "</mark>";
        aberto = marcas[i];
      }
      saida += esc(texto[i]);
    }
    return saida + (aberto ? "</mark>" : "");
  }

  /* ------------------------------------------------------------------------
     Paleta Ctrl+K (todas as páginas)
     ------------------------------------------------------------------------ */

  function montarPaleta() {
    const paleta = document.createElement("dialog");
    paleta.className = "at-comando site-paleta";
    paleta.id = "site-paleta";
    paleta.dataset.atTecla = "";
    paleta.setAttribute("aria-label", "Buscar componentes");
    paleta.innerHTML = `
      <div class="at-comando-busca">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input placeholder="Buscar: modal, máscara de CPF, carrinho…" aria-label="Buscar componentes" role="combobox" aria-expanded="true" aria-controls="site-paleta-lista" autocomplete="off">
      </div>
      <ul class="at-comando-lista" id="site-paleta-lista" role="listbox"></ul>
      <div class="at-comando-rodape"><span>↑↓ navegar</span><span>Enter abrir</span><span>Esc fechar</span></div>`;
    document.body.append(paleta);
    const campo = $("input", paleta);
    const lista = $("ul", paleta);
    const sugeridos = ["instalacao", "modal", "mascaras", "tabela", "estado", "receita-loja"];

    function desenhar() {
      const termo = campo.value.trim();
      const resultados = termo ? buscar(termo, 10) : indice.filter((c) => sugeridos.includes(c.id));
      let html = termo ? "" : '<li class="at-comando-grupo">Comece por aqui</li>';
      html += resultados
        .map(
          (c, i) => `<li><a class="at-comando-item" role="option" id="paleta-${c.id}" href="${c.url}" aria-selected="${i === 0}">
            <strong>${destacar(c.nome, termo)}</strong><small>${esc(c.categoria)} · ${esc(c.resumo.slice(0, 90))}${c.resumo.length > 90 ? "…" : ""}</small></a></li>`
        )
        .join("");
      if (termo && window.AtalhoAssistente?.disponivel()) {
        html += `<li class="at-comando-grupo">Não achou?</li><li><button type="button" class="at-comando-item" role="option" id="paleta-ia" data-perguntar-ia aria-selected="${resultados.length === 0}">
          <strong>✨ Perguntar ao assistente: “${esc(termo)}”</strong><small>A IA monta o componente que você descreveu</small></button></li>`;
      } else if (termo && !resultados.length) {
        html += `<li class="at-comando-vazio">Nada encontrado para "${esc(termo)}". Tente outra palavra, como "janela" ou "formulário".</li>`;
      }
      lista.innerHTML = html;
      paleta.atIndice = 0;
      const primeiro = $(".at-comando-item", lista);
      campo.setAttribute("aria-activedescendant", primeiro?.id || "");
    }

    campo.addEventListener("input", desenhar);
    lista.addEventListener("click", (e) => {
      const ia = e.target.closest("[data-perguntar-ia]");
      paleta.close();
      if (ia) window.AtalhoAssistente.abrir(campo.value);
    });
    $$("[data-abrir-busca]").forEach((botao) =>
      botao.addEventListener("click", () => {
        campo.value = "";
        desenhar();
        paleta.showModal();
        campo.focus();
      })
    );
    desenhar();
  }

  /* ------------------------------------------------------------------------
     Abas de código e botão copiar (todas as páginas)
     ------------------------------------------------------------------------ */

  function ativarAbaCodigo(aba, focar) {
    const barra = aba.closest("[role=tablist]");
    const caixa = aba.closest(".site-codigo-abas").parentElement;
    $$("[role=tab]", barra).forEach((a) => {
      const ativa = a === aba;
      a.setAttribute("aria-selected", String(ativa));
      a.tabIndex = ativa ? 0 : -1;
      const painel = document.getElementById(a.getAttribute("aria-controls"));
      if (painel && caixa.contains(painel)) painel.hidden = !ativa;
    });
    if (focar) aba.focus();
  }

  document.addEventListener("click", (e) => {
    const aba = e.target.closest(".site-codigo-abas [role=tab]");
    if (aba) ativarAbaCodigo(aba);

    const copiar = e.target.closest("[data-copiar-codigo]");
    if (copiar) {
      const caixa = copiar.closest(".site-exemplo-caixa");
      const visivel = $$("pre.site-codigo", caixa).find((p) => !p.hidden);
      navigator.clipboard?.writeText(visivel.textContent).then(() => {
        copiar.textContent = "Copiado!";
        setTimeout(() => (copiar.textContent = "Copiar"), 1600);
      });
    }

    const sugestao = e.target.closest("[data-sugestao]");
    if (sugestao) {
      const campo = $("#busca-inicio");
      campo.value = sugestao.dataset.sugestao;
      campo.dispatchEvent(new Event("input"));
      campo.focus();
    }
  });

  document.addEventListener("keydown", (e) => {
    const aba = e.target.closest?.(".site-codigo-abas [role=tab]");
    if (!aba || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const abas = $$("[role=tab]", aba.parentElement);
    const i = abas.indexOf(aba) + (e.key === "ArrowRight" ? 1 : -1);
    ativarAbaCodigo(abas[(i + abas.length) % abas.length], true);
  });

  /* ------------------------------------------------------------------------
     Conta: estado leve (sem carregar a biblioteca do Supabase)
     ------------------------------------------------------------------------ */

  const contasAtivas = Boolean(config.supabase?.url && config.supabase?.chavePublica);

  function sessaoGuardada() {
    if (!contasAtivas) return null;
    try {
      const ref = new URL(config.supabase.url).hostname.split(".")[0];
      const sessao = JSON.parse(localStorage.getItem(`sb-${ref}-auth-token`));
      if (!sessao?.access_token || (sessao.expires_at && sessao.expires_at * 1000 < Date.now())) return null;
      return sessao;
    } catch {
      return null;
    }
  }

  async function apiSupabase(caminho, opcoes = {}) {
    const sessao = sessaoGuardada();
    if (!sessao) throw new Error("sem sessão");
    const resposta = await fetch(`${config.supabase.url}/rest/v1/${caminho}`, {
      ...opcoes,
      headers: {
        apikey: config.supabase.chavePublica,
        Authorization: `Bearer ${sessao.access_token}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
        ...(opcoes.headers || {}),
      },
    });
    if (!resposta.ok) throw new Error(`Supabase respondeu ${resposta.status}`);
    return resposta.status === 204 || resposta.headers.get("content-length") === "0" ? null : resposta.json();
  }

  function atualizarCabecalhoConta() {
    const link = $("[data-conta-cabecalho]");
    const sessao = sessaoGuardada();
    if (link && sessao) {
      link.querySelector("span").textContent = "Minha conta";
      link.classList.add("at-suave");
    }
  }

  async function prepararFavorito() {
    const botao = $("[data-favoritar]");
    if (!botao || !contasAtivas) return;
    botao.hidden = false;
    const id = botao.dataset.favoritar;
    const sessao = sessaoGuardada();
    const marcar = (favorito) => {
      botao.setAttribute("aria-pressed", String(favorito));
      botao.querySelector("span").textContent = favorito ? "Favorito" : "Favoritar";
    };
    if (sessao) {
      try {
        const lista = await apiSupabase(`favoritos?select=componente_id&componente_id=eq.${encodeURIComponent(id)}`, { headers: { Prefer: "" } });
        marcar(Array.isArray(lista) && lista.length > 0);
      } catch {
        /* sem conexão: botão continua funcionando ao clicar */
      }
    }
    botao.addEventListener("click", async () => {
      if (!sessaoGuardada()) {
        location.href = `${document.body.dataset.base}conta/?voltar=${encodeURIComponent(location.pathname)}`;
        return;
      }
      const favorito = botao.getAttribute("aria-pressed") === "true";
      botao.setAttribute("aria-busy", "true");
      try {
        if (favorito) await apiSupabase(`favoritos?componente_id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
        else await apiSupabase("favoritos", { method: "POST", body: JSON.stringify({ componente_id: id }) });
        marcar(!favorito);
        window.Atalho.notificar(favorito ? "Removido dos favoritos." : "Salvo nos favoritos.", { tipo: "sucesso" });
      } catch {
        window.Atalho.notificar("Não foi possível salvar agora. Entre de novo na sua conta.", { tipo: "perigo" });
      } finally {
        botao.removeAttribute("aria-busy");
      }
    });
  }

  /* ------------------------------------------------------------------------
     Páginas
     ------------------------------------------------------------------------ */

  function paginaInicio() {
    const campo = $("#busca-inicio");
    const lista = $("#busca-inicio-resultados");
    let selecionado = 0;
    let resultados = [];

    function desenhar() {
      resultados = buscar(campo.value, 7);
      selecionado = 0;
      const aberto = campo.value.trim().length > 0;
      lista.hidden = !aberto;
      campo.setAttribute("aria-expanded", String(aberto));
      if (!aberto) return;
      lista.innerHTML = resultados.length
        ? resultados
            .map(
              (c, i) => `<li role="presentation"><a class="site-resultado" role="option" id="res-${c.id}" href="${c.url}" aria-selected="${i === 0}">
                <strong>${destacar(c.nome, campo.value)}</strong><small>${esc(c.categoria)} · ${esc(c.resumo)}</small></a></li>`
            )
            .join("")
        : `<li class="site-resultado"><strong>Nada encontrado para "${esc(campo.value)}"</strong><small>Tente outra palavra${window.AtalhoAssistente?.disponivel() ? " ou aperte Enter para perguntar ao assistente" : ""}.</small></li>`;
      campo.setAttribute("aria-activedescendant", resultados[0] ? `res-${resultados[0].id}` : "");
    }

    function marcar(i) {
      const itens = $$(".site-resultado[role=option]", lista);
      if (!itens.length) return;
      selecionado = (i + itens.length) % itens.length;
      itens.forEach((el, k) => el.setAttribute("aria-selected", String(k === selecionado)));
      campo.setAttribute("aria-activedescendant", itens[selecionado].id);
      itens[selecionado].scrollIntoView({ block: "nearest" });
    }

    campo.addEventListener("input", desenhar);
    campo.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); marcar(selecionado + 1); }
      if (e.key === "ArrowUp") { e.preventDefault(); marcar(selecionado - 1); }
      if (e.key === "Enter") {
        e.preventDefault();
        if (resultados[selecionado]) location.href = resultados[selecionado].url;
        else if (campo.value.trim() && window.AtalhoAssistente?.disponivel()) window.AtalhoAssistente.abrir(campo.value);
      }
      if (e.key === "Escape") { campo.value = ""; desenhar(); }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-busca")) lista.hidden = true;
    });

    window.Atalho.estado("vitrineInicio", {
      quantidade: 0,
      adicionar() {
        this.quantidade++;
        window.Atalho.notificar("Tênis cano alto vermelho e preto", { tipo: "sucesso", titulo: "Adicionado ao carrinho" });
      },
    });
    $("#form-inicio")?.addEventListener("at:enviar", (e) =>
      window.Atalho.notificar(`CPF ${e.detail.dados.cpf} válido e endereço encontrado.`, { tipo: "sucesso", titulo: "Tudo certo!" })
    );
  }

  function paginaCatalogo() {
    const campo = $("#filtro-catalogo");
    const params = new URLSearchParams(location.search);
    function filtrar() {
      const termo = normalizar(campo.value);
      const ids = termo ? new Set(buscar(campo.value, 100).map((c) => c.url)) : null;
      let visiveis = 0;
      for (const item of $$(".site-catalogo-item")) {
        const mostrar = !termo || ids.has(item.getAttribute("href")) || normalizar(item.dataset.busca).includes(termo);
        item.hidden = !mostrar;
        if (mostrar) visiveis++;
      }
      for (const secao of $$(".site-catalogo-secao")) secao.hidden = !$(".site-catalogo-item:not([hidden])", secao);
      $(".site-catalogo-vazio").hidden = visiveis > 0;
    }
    campo.addEventListener("input", filtrar);
    if (params.get("busca")) {
      campo.value = params.get("busca");
      filtrar();
    }
  }

  function paginaComponente() {
    // Roda o JavaScript de cada exemplo, depois que o HTML da demonstração já está na página
    const exemplos = JSON.parse($("#exemplos-js")?.textContent || "[]");
    for (const codigo of exemplos) {
      if (!codigo) continue;
      try {
        new Function(codigo)();
      } catch (erro) {
        console.error("Erro no exemplo:", erro);
      }
    }
    prepararFavorito();

    // Marca no índice a seção visível
    const links = $$(".site-indice a[href^='#']");
    if ("IntersectionObserver" in window && links.length) {
      const observador = new IntersectionObserver(
        (entradas) => {
          for (const entrada of entradas) {
            if (!entrada.isIntersecting) continue;
            links.forEach((l) => l.toggleAttribute("aria-current", l.hash === `#${entrada.target.id}`));
          }
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      links.forEach((l) => {
        const alvo = document.getElementById(l.hash.slice(1));
        if (alvo) observador.observe(alvo);
      });
    }
  }

  function paginaIcones() {
    const campo = $("#filtro-icones");
    campo.addEventListener("input", () => {
      const termo = normalizar(campo.value);
      $$("#lista-icones li").forEach((li) => (li.hidden = termo && !normalizar(li.textContent).includes(termo)));
    });
    $("#lista-icones").addEventListener("click", (e) => {
      const botao = e.target.closest("[data-icone]");
      if (!botao) return;
      const svg = $("svg", botao).cloneNode(true);
      svg.setAttribute("width", "18");
      svg.setAttribute("height", "18");
      navigator.clipboard?.writeText(svg.outerHTML).then(() =>
        window.Atalho.notificar(`Ícone "${botao.dataset.icone}" copiado. Cole no seu HTML.`, { tipo: "sucesso" })
      );
    });
  }

  /* Gerador de tema: calcula tons e contraste (WCAG) a partir de uma cor */
  function paginaPersonalizar() {
    const hexParaRgb = (hex) => {
      const n = parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const rgbParaHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
    const misturar = (a, b, peso) => a.map((v, i) => v * (1 - peso) + b[i] * peso);
    const luminancia = (rgb) => {
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contraste = (a, b) => {
      const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    };

    const cor = $("#tema-cor");
    const hex = $("#tema-cor-hex");
    const raio = $("#tema-raio");
    const fonte = $("#tema-fonte");
    const previa = $("#tema-previa");

    function gerar() {
      const base = hexParaRgb(cor.value);
      const branco = [255, 255, 255];
      const preto = [12, 10, 9];
      const forte = rgbParaHex(misturar(base, [0, 0, 0], 0.18));
      const suave = rgbParaHex(misturar(base, branco, 0.86));
      const contrasteBranco = contraste(base, branco);
      const contrastePreto = contraste(base, preto);
      const sobre = contrasteBranco >= contrastePreto ? "#ffffff" : "#0c0a09";
      const melhor = Math.max(contrasteBranco, contrastePreto);
      const variaveis = {
        "--at-cor-primaria": cor.value,
        "--at-cor-primaria-forte": forte,
        "--at-cor-primaria-suave": suave,
        "--at-cor-sobre-primaria": sobre,
        "--at-raio": `${raio.value}px`,
        "--at-raio-lg": `${Math.round(raio.value * 1.75)}px`,
        "--at-fonte": fonte.value,
      };
      Object.entries(variaveis).forEach(([k, v]) => previa.style.setProperty(k, v));
      $("#tema-raio-valor").textContent = `${raio.value}px`;
      $("#tema-saida").textContent = `:root {\n${Object.entries(variaveis).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`;
      const aviso = $("#tema-contraste");
      aviso.className = `at-alerta ${melhor >= 4.5 ? "at-sucesso" : "at-aviso"}`;
      aviso.innerHTML = `<div class="at-alerta-conteudo"><strong>Contraste ${melhor.toFixed(1)}:1 ${melhor >= 4.5 ? "· aprovado (WCAG AA)" : "· baixo"}</strong><p>${
        melhor >= 4.5
          ? `Texto ${sobre === "#ffffff" ? "branco" : "escuro"} sobre a sua cor fica legível para todo mundo.`
          : "Texto sobre essa cor pode ficar difícil de ler. Escolha um tom mais escuro ou mais claro."
      }</p></div>`;
    }

    cor.addEventListener("input", () => { hex.value = cor.value; gerar(); });
    hex.addEventListener("input", () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) { cor.value = hex.value.toLowerCase(); gerar(); }
    });
    raio.addEventListener("input", gerar);
    fonte.addEventListener("change", gerar);
    $(".site-paletas").addEventListener("click", (e) => {
      const botao = e.target.closest("[data-cor]");
      if (!botao) return;
      cor.value = hex.value = botao.dataset.cor;
      gerar();
    });
    gerar();
  }

  /* ------------------------------------------------------------------------
     Partida
     ------------------------------------------------------------------------ */

  function comecar() {
    montarPaleta();
    atualizarCabecalhoConta();
    const paginas = { inicio: paginaInicio, catalogo: paginaCatalogo, componente: paginaComponente, icones: paginaIcones, personalizar: paginaPersonalizar };
    try {
      paginas[document.body.dataset.pagina]?.();
    } catch (erro) {
      console.error(erro);
    }
  }

  window.AtalhoSite = { buscar, normalizar, sessaoGuardada, apiSupabase, contasAtivas };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", comecar, { once: true });
  else comecar();
})();
