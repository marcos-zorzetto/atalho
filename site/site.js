/*
 * Código do site de documentação (não faz parte da biblioteca).
 * - Busca em português: ignora acentos, entende sinônimos e erros de digitação
 * - Paleta Ctrl+K em todas as páginas
 * - Página inicial: busca grande e números do robô
 * - Página de componentes: monta cada componente a partir de site/dados/
 */
(function () {
  "use strict";

  const docs = window.ATALHO_DOCS;
  const baseline = window.ATALHO_BASELINE || { recursos: {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const REPOSITORIO = "https://github.com/marcos-zorzetto/atalho";

  const esc = (texto) =>
    String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const normalizar = (texto) =>
    String(texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  const categoriaPorId = Object.fromEntries(docs.categorias.map((c) => [c.id, c]));
  const componentePorId = Object.fromEntries(docs.componentes.map((c) => [c.id, c]));

  // Ordem de leitura: segue a ordem das categorias e, dentro delas, a ordem dos arquivos
  const ordem = docs.categorias.flatMap((cat) => docs.componentes.filter((c) => c.categoria === cat.id));

  /* ------------------------------------------------------------------------
     Busca
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

  const indice = docs.componentes.map((c) => {
    const nome = normalizar(c.nome);
    const apelidos = (c.apelidos || []).map(normalizar);
    const palavras = new Set([...nome.split(/[^a-z0-9]+/), ...apelidos.flatMap((a) => a.split(/[^a-z0-9]+/))].filter((p) => p.length > 1));
    return {
      c,
      nome,
      apelidos,
      palavras: Array.from(palavras),
      texto: normalizar([c.resumo, c.comoFunciona, categoriaPorId[c.categoria]?.nome, ...(c.api || []).map((a) => a.nome)].join(" ")),
    };
  });

  function buscar(termo, limite = 8) {
    const q = normalizar(termo);
    if (!q) return [];
    const termos = q.split(/\s+/).filter((p) => p && !PALAVRAS_VAZIAS.has(p));
    if (!termos.length) termos.push(q);
    const frase = termos.join(" ");

    const resultados = [];
    for (const item of indice) {
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

      if (item.c.categoria === "receitas") pontos += 1;
      if (pontos > 8) resultados.push({ componente: item.c, pontos });
    }
    return resultados.sort((a, b) => b.pontos - a.pontos).slice(0, limite).map((r) => r.componente);
  }

  function destacar(texto, termo) {
    const termos = normalizar(termo).split(/\s+/).filter((t) => t.length > 1 && !PALAVRAS_VAZIAS.has(t));
    if (!termos.length) return esc(texto);
    const base = normalizar(texto);
    const marcas = new Array(texto.length).fill(false);
    for (const t of termos) {
      let i = base.indexOf(t);
      while (i !== -1) {
        for (let k = i; k < i + t.length; k++) marcas[k] = true;
        i = base.indexOf(t, i + t.length);
      }
    }
    let saida = "";
    let aberto = false;
    for (let i = 0; i < texto.length; i++) {
      if (marcas[i] && !aberto) { saida += "<mark>"; aberto = true; }
      if (!marcas[i] && aberto) { saida += "</mark>"; aberto = false; }
      saida += esc(texto[i]);
    }
    return saida + (aberto ? "</mark>" : "");
  }

  const linkDo = (componente) => `componentes.html#${componente.id}`;

  /* ------------------------------------------------------------------------
     Realce de código (HTML e JavaScript)
     ------------------------------------------------------------------------ */

  function realcarAtributos(trecho) {
    let saida = "";
    let i = 0;
    const re = /([^\s=]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'>]+)?/g;
    for (const m of trecho.matchAll(re)) {
      saida += esc(trecho.slice(i, m.index));
      saida += `<span class="tk-atr">${esc(m[1])}</span>`;
      if (m[2]) saida += `<span class="tk-pon">${esc(m[2])}</span>`;
      if (m[3]) saida += `<span class="tk-str">${esc(m[3])}</span>`;
      i = m.index + m[0].length;
    }
    return saida + esc(trecho.slice(i));
  }

  function realcarHTML(codigo) {
    let saida = "";
    let i = 0;
    const re = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^<>]*>/g;
    for (const m of codigo.matchAll(re)) {
      saida += esc(codigo.slice(i, m.index));
      const tag = m[0];
      if (tag.startsWith("<!--")) {
        saida += `<span class="tk-com">${esc(tag)}</span>`;
      } else {
        const partes = tag.match(/^(<\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?>)$/);
        if (partes) {
          saida += `<span class="tk-pon">${esc(partes[1])}</span><span class="tk-tag">${partes[2]}</span>${realcarAtributos(partes[3])}<span class="tk-pon">${esc(partes[4])}</span>`;
        } else {
          saida += esc(tag);
        }
      }
      i = m.index + tag.length;
    }
    return saida + esc(codigo.slice(i));
  }

  function realcarJS(codigo) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|of|in|new|async|await|try|catch|throw|class|this|true|false|null|undefined|get|typeof|break|continue)\b|\b(\d+(?:\.\d+)?)\b/g;
    let saida = "";
    let i = 0;
    for (const m of codigo.matchAll(re)) {
      saida += esc(codigo.slice(i, m.index));
      const classe = m[1] ? "tk-com" : m[2] ? "tk-str" : m[3] ? "tk-pal" : "tk-num";
      saida += `<span class="${classe}">${esc(m[0])}</span>`;
      i = m.index + m[0].length;
    }
    return saida + esc(codigo.slice(i));
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

    function desenhar() {
      const termo = campo.value;
      const resultados = termo.trim() ? buscar(termo, 12) : ordem.filter((c) => c.categoria === "receitas" || ["instalacao", "modal", "mascaras", "tabela", "estado"].includes(c.id));
      lista.innerHTML = resultados.length
        ? (termo.trim() ? "" : '<li class="at-comando-grupo">Comece por aqui</li>') +
          resultados
            .map(
              (c, i) => `<li><a class="at-comando-item" role="option" id="paleta-${c.id}" href="${linkDo(c)}" aria-selected="${i === 0}">
                <strong>${destacar(c.nome, termo)}</strong><small>${esc(categoriaPorId[c.categoria].nome)} · ${esc(c.resumo.slice(0, 90))}${c.resumo.length > 90 ? "…" : ""}</small></a></li>`
            )
            .join("")
        : `<li class="at-comando-vazio">Nada encontrado para "${esc(termo)}". Tente outra palavra, como "janela" ou "formulário".</li>`;
      paleta.atIndice = 0;
      campo.setAttribute("aria-activedescendant", resultados[0] ? `paleta-${resultados[0].id}` : "");
    }

    campo.addEventListener("input", desenhar);
    desenhar();

    // Ao escolher um item na mesma página (só muda o #), fecha a paleta
    lista.addEventListener("click", () => paleta.close());

    $$("[data-abrir-busca]").forEach((botao) =>
      botao.addEventListener("click", () => {
        campo.value = "";
        desenhar();
        paleta.showModal();
        campo.focus();
      })
    );
  }

  /* ------------------------------------------------------------------------
     Página inicial
     ------------------------------------------------------------------------ */

  function iniciarPaginaInicial() {
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
              (c, i) => `<li role="presentation"><a class="site-resultado" role="option" id="res-${c.id}" href="${linkDo(c)}" aria-selected="${i === 0}">
                <strong>${destacar(c.nome, campo.value)}</strong><small>${esc(categoriaPorId[c.categoria].nome)} · ${esc(c.resumo)}</small></a></li>`
            )
            .join("")
        : `<li class="site-resultado"><strong>Nada encontrado para "${esc(campo.value)}"</strong><small>Tente outra palavra. Ex.: janela, menu, formulário, carregando.</small></li>`;
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
      if (e.key === "Enter" && resultados[selecionado]) { e.preventDefault(); location.href = linkDo(resultados[selecionado]); }
      if (e.key === "Escape") { campo.value = ""; desenhar(); }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-busca")) lista.hidden = true;
    });
    campo.addEventListener("focus", () => campo.value.trim() && desenhar());

    $$("[data-sugestao]").forEach((botao) =>
      botao.addEventListener("click", () => {
        campo.value = botao.dataset.sugestao;
        desenhar();
        campo.focus();
      })
    );

    // Demonstração ao vivo: o botão Comprar e o contador do carrinho conversam pelo estado
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

    // Categorias
    const grade = $("#lista-categorias");
    if (grade) {
      grade.innerHTML = docs.categorias
        .map((cat) => {
          const itens = docs.componentes.filter((c) => c.categoria === cat.id);
          return `<a class="site-categoria" href="${linkDo(itens[0])}">
            <span class="site-contagem">${String(itens.length).padStart(2, "0")} ${itens.length === 1 ? "item" : "itens"}</span>
            <h3>${esc(cat.nome)}</h3>
            <p>${esc(cat.descricao)}</p>
            <span class="site-categoria-itens">${itens.map((c) => esc(c.nome)).join(" · ")}</span>
          </a>`;
        })
        .join("");
    }

    // Números do robô
    const recursos = Object.values(baseline.recursos);
    const preencher = (seletor, valor) => $$(seletor).forEach((el) => (el.textContent = valor));
    preencher("[data-total-componentes]", docs.componentes.length);
    preencher("[data-total-recursos]", recursos.length);
    preencher("[data-total-amplos]", recursos.filter((r) => r.status === "amplo").length);
    preencher("[data-versao-baseline]", baseline.versao || "—");
    if (baseline.verificadoEm) {
      preencher("[data-data-baseline]", new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(baseline.verificadoEm + "T12:00:00")));
    }
    const linksPt = docs.componentes.flatMap((c) => c.mdn || []);
    preencher("[data-total-links-pt]", linksPt.filter((l) => l.idioma === "pt").length);
    preencher("[data-total-links]", linksPt.length);
  }

  /* ------------------------------------------------------------------------
     Página de componentes
     ------------------------------------------------------------------------ */

  const SELOS_BASELINE = {
    amplo: { classe: "at-sucesso", texto: "Em todos os navegadores", dica: (r) => `Disponível em todos os navegadores principais desde ${ano(r.desde)}.` },
    recente: { classe: "at-info", texto: "Novo em todos os navegadores", dica: (r) => `Chegou a todos os navegadores atuais em ${ano(r.desde)}. Quem usa navegador muito desatualizado pode não ter.` },
    limitado: { classe: "at-aviso", texto: "Ainda não em todos", dica: () => "Melhoria progressiva: onde não houver suporte, o componente continua funcionando com um visual mais simples." },
    desconhecido: { classe: "", texto: "Sem dados", dica: () => "Recurso não encontrado na base web-features." },
  };

  function ano(data) {
    if (!data) return "há muito tempo";
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(data + "T12:00:00"));
  }

  // O que os exemplos registram (ouvintes e observadores) é desfeito ao trocar de página
  let limpezas = [];

  function executarExemplo(codigo) {
    const ouvintesOriginais = { documento: document.addEventListener };
    const observarOriginal = window.Atalho.observar;
    const setTimeoutOriginal = window.setTimeout;
    window.setTimeout = (funcao, ms, ...args) => {
      const id = setTimeoutOriginal(funcao, ms, ...args);
      limpezas.push(() => clearTimeout(id));
      return id;
    };
    document.addEventListener = function (tipo, funcao, opcoes) {
      limpezas.push(() => document.removeEventListener(tipo, funcao, opcoes));
      return ouvintesOriginais.documento.call(document, tipo, funcao, opcoes);
    };
    window.Atalho.observar = (nome, funcao) => {
      const parar = observarOriginal(nome, funcao);
      limpezas.push(parar);
      return parar;
    };
    try {
      new Function(codigo)();
    } catch (erro) {
      console.error("Erro no exemplo:", erro);
    } finally {
      document.addEventListener = ouvintesOriginais.documento;
      window.Atalho.observar = observarOriginal;
      window.setTimeout = setTimeoutOriginal;
    }
  }

  function blocoCodigo(exemplo, indiceExemplo) {
    const abas = [{ id: "html", nome: "HTML", codigo: exemplo.html, realce: realcarHTML }];
    if (exemplo.js) abas.push({ id: "js", nome: "JavaScript", codigo: exemplo.js, realce: realcarJS });
    const base = `ex${indiceExemplo}`;
    return `
      <div class="site-codigo-abas" role="tablist" aria-label="Código do exemplo">
        ${abas.map((a, i) => `<button role="tab" aria-selected="${i === 0}" aria-controls="${base}-${a.id}" id="${base}-aba-${a.id}">${a.nome}</button>`).join("")}
        <button class="at-botao at-pequeno site-copiar" data-copiar-de="${base}">Copiar</button>
      </div>
      ${abas
        .map(
          (a, i) => `<pre class="site-codigo" id="${base}-${a.id}" role="tabpanel" aria-labelledby="${base}-aba-${a.id}" ${i ? "hidden" : ""} tabindex="0"><code>${a.realce(a.codigo)}</code></pre>`
        )
        .join("")}`;
  }

  function renderizarComponente(componente) {
    const artigo = $("#artigo");
    const categoria = categoriaPorId[componente.categoria];
    const posicao = ordem.indexOf(componente);
    const anterior = ordem[posicao - 1];
    const proximo = ordem[posicao + 1];

    limpezas.forEach((desfazer) => desfazer());
    limpezas = [];
    $$("dialog[open]").forEach((d) => d.id !== "site-paleta" && d.close());

    const selos = (componente.recursos || [])
      .map((id) => {
        const r = baseline.recursos[id] || { nome: id, status: "desconhecido" };
        const s = SELOS_BASELINE[r.status] || SELOS_BASELINE.desconhecido;
        return `<span class="at-selo ${s.classe} site-selo-baseline" data-at-dica="${esc(s.dica(r))}" tabindex="0">${esc(r.nome)} · ${s.texto}</span>`;
      })
      .join("");

    const lista = (itens, classe = "") => `<ul class="site-lista ${classe}">${itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

    artigo.innerHTML = `
      <nav class="at-trilha" aria-label="Você está em"><ol>
        <li><a href="./">Início</a></li>
        <li><a href="${linkDo(ordem.find((c) => c.categoria === categoria.id))}">${esc(categoria.nome)}</a></li>
        <li aria-current="page">${esc(componente.nome)}</li>
      </ol></nav>
      <h1 class="site-titulo site-h2" tabindex="-1">${esc(componente.nome)}</h1>
      <p class="at-chamada">${esc(componente.resumo)}</p>

      ${componente.inspiradoEm?.length ? `<div class="site-meta"><span class="site-meta-rotulo">Padrão usado em</span>${componente.inspiradoEm.map((t) => `<span class="at-etiqueta" style="padding-right: .7rem">${esc(t)}</span>`).join("")}</div>` : ""}
      ${selos ? `<div class="site-meta"><span class="site-meta-rotulo">Suporte dos navegadores</span>${selos}</div>` : ""}

      ${
        componente.quandoUsar?.length || componente.evitar?.length
          ? `<section><div class="site-listas">
              ${componente.quandoUsar?.length ? `<div><h2 class="site-secao-titulo">Quando usar</h2>${lista(componente.quandoUsar)}</div>` : ""}
              ${componente.evitar?.length ? `<div><h2 class="site-secao-titulo">Evite</h2>${lista(componente.evitar, "site-evitar")}</div>` : ""}
            </div></section>`
          : ""
      }

      ${componente.comoFunciona ? `<section><h2 class="site-secao-titulo">Como funciona</h2><div class="site-explicacao"><p>${esc(componente.comoFunciona)}</p></div></section>` : ""}

      <section>
        <h2 class="site-secao-titulo">${componente.exemplos.length > 1 ? "Exemplos" : "Exemplo"}</h2>
        ${componente.exemplos
          .map(
            (ex, i) => `<div class="site-exemplo">
              <h3 class="site-exemplo-titulo">${esc(ex.titulo)}</h3>
              ${ex.descricao ? `<p class="at-texto-suave">${esc(ex.descricao)}</p>` : ""}
              <div class="site-exemplo-caixa">
                ${ex.somenteCodigo ? "" : `<div class="site-demo" data-demo="${i}"></div>`}
                ${blocoCodigo(ex, i)}
              </div>
            </div>`
          )
          .join("")}
      </section>

      ${
        componente.api?.length
          ? `<section><h2 class="site-secao-titulo">Referência</h2>
              <div class="at-tabela-caixa"><table class="at-tabela site-tabela-api">
                <thead><tr><th>Nome</th><th>Tipo</th><th>O que faz</th></tr></thead>
                <tbody>${componente.api.map((a) => `<tr><td><code>${esc(a.nome)}</code></td><td>${esc(a.tipo)}</td><td>${esc(a.descricao)}</td></tr>`).join("")}</tbody>
              </table></div></section>`
          : ""
      }

      ${componente.acessibilidade?.length ? `<section><h2 class="site-secao-titulo">Acessibilidade</h2>${lista(componente.acessibilidade)}</section>` : ""}

      ${
        componente.conectaCom?.length
          ? `<section><h2 class="site-secao-titulo">Combina com</h2><div class="at-linha">${componente.conectaCom
              .map((id) => componentePorId[id])
              .filter(Boolean)
              .map((c) => `<a class="at-botao at-pequeno" href="${linkDo(c)}">${esc(c.nome)}</a>`)
              .join("")}</div></section>`
          : ""
      }

      ${
        componente.mdn?.length
          ? `<section><h2 class="site-secao-titulo">Documentação oficial (MDN)</h2>
              <ul class="site-links-mdn">${componente.mdn
                .map(
                  (l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener"><span class="site-idioma" data-idioma="${l.idioma}">${l.idioma === "pt" ? "PT" : "EN"}</span>${esc(l.titulo)}</a>${l.idioma === "en" ? ' <small class="at-texto-suave">ainda sem tradução para português</small>' : ""}</li>`
                )
                .join("")}</ul></section>`
          : ""
      }

      <nav class="site-navegacao-docs" aria-label="Navegação entre componentes">
        ${anterior ? `<a href="${linkDo(anterior)}"><small>← Anterior</small><strong>${esc(anterior.nome)}</strong></a>` : "<span></span>"}
        ${proximo ? `<a href="${linkDo(proximo)}"><small>Próximo →</small><strong>${esc(proximo.nome)}</strong></a>` : ""}
      </nav>
      <p class="at-texto-suave at-texto-pequeno at-mt-6">Encontrou um erro ou tem uma sugestão? <a href="${REPOSITORIO}/issues/new?title=${encodeURIComponent("[" + componente.nome + "] ")}" target="_blank" rel="noopener">Abra uma issue</a> ou <a href="${REPOSITORIO}/tree/main/site/dados" target="_blank" rel="noopener">edite os dados no GitHub</a>.</p>`;

    // Monta as demonstrações a partir do mesmo HTML mostrado no código
    componente.exemplos.forEach((ex, i) => {
      const demo = $(`[data-demo="${i}"]`, artigo);
      if (demo) demo.innerHTML = ex.html;
    });
    componente.exemplos.forEach((ex) => ex.js && !ex.somenteCodigo && executarExemplo(ex.js));

    document.title = `${componente.nome} · Atalho`;
    $$(".site-menu-docs a").forEach((a) => {
      if (a.hash === `#${componente.id}`) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    $(".site-menu-docs")?.removeAttribute("data-aberto");
    $("[data-at-alternar='.site-menu-docs']")?.setAttribute("aria-expanded", "false");
  }

  function iniciarPaginaDocs() {
    const menu = $(".site-menu-docs");
    menu.innerHTML = docs.categorias
      .map(
        (cat) => `<h2>${esc(cat.nome)}</h2><ul>${docs.componentes
          .filter((c) => c.categoria === cat.id)
          .map((c) => `<li><a href="#${c.id}">${esc(c.nome)}</a></li>`)
          .join("")}</ul>`
      )
      .join("");

    // Abas de código e botão copiar
    $("#artigo").addEventListener("click", (e) => {
      const aba = e.target.closest(".site-codigo-abas [role=tab]");
      if (aba) {
        const caixa = aba.closest(".site-exemplo-caixa");
        $$("[role=tab]", caixa).forEach((a) => a.setAttribute("aria-selected", String(a === aba)));
        $$("[role=tabpanel]", caixa).forEach((p) => (p.hidden = p.id !== aba.getAttribute("aria-controls")));
      }
      const copiar = e.target.closest("[data-copiar-de]");
      if (copiar) {
        const caixa = copiar.closest(".site-exemplo-caixa");
        const visivel = $$("[role=tabpanel]", caixa).find((p) => !p.hidden);
        navigator.clipboard?.writeText(visivel.textContent).then(() => {
          copiar.textContent = "Copiado!";
          setTimeout(() => (copiar.textContent = "Copiar"), 1600);
        });
      }
    });

    function rota() {
      const id = decodeURIComponent(location.hash.slice(1)) || "instalacao";
      const componente = componentePorId[id] || componentePorId[docs.categorias.find((c) => c.id === id) && ordem.find((c) => c.categoria === id)?.id];
      if (!componente) {
        location.replace("#instalacao");
        return;
      }
      renderizarComponente(componente);
      if (location.hash) {
        window.scrollTo({ top: 0 });
        $("#artigo h1")?.focus({ preventScroll: true });
      }
    }

    addEventListener("hashchange", rota);
    rota();
  }

  /* ------------------------------------------------------------------------
     Partida
     ------------------------------------------------------------------------ */

  function comecar() {
    montarPaleta();
    const pagina = document.body.dataset.pagina;
    if (pagina === "inicio") iniciarPaginaInicial();
    if (pagina === "docs") iniciarPaginaDocs();
    $$("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  window.AtalhoSite = { buscar, realcarHTML, realcarJS };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", comecar, { once: true });
  else comecar();
})();
