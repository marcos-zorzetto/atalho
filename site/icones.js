/*
 * Explorador de ícones Phosphor: busca em português, 6 estilos, tamanho e cor.
 * Os ícones vêm de um arquivo por estilo (icones/phosphor/<estilo>.svg), baixado
 * uma vez; cada ícone da lista aponta para ele com <use>.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const raiz = $("[data-icones-explorador]");
  if (!raiz) return;

  const base = document.body.dataset.base || "/";
  const lista = $("[data-icones-lista]", raiz);
  const busca = $("#filtro-icones");
  const detalhe = $("#icone-detalhe");
  const COR_PADRAO = "#0f766e";
  const sprites = new Map(); // estilo → documento SVG (para copiar o ícone sozinho)
  let icones = [];
  let peso = "regular";
  let tamanho = 32;
  let cor = COR_PADRAO;
  let aberto = null;

  const sem = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const arquivo = (estilo) => `${base}icones/phosphor/${estilo}.svg`;
  const nomeLegivel = (nome) => nome.replace(/-/g, " ");

  function desenhar() {
    const fragmento = document.createDocumentFragment();
    for (const [nome] of icones) {
      const li = document.createElement("li");
      li.dataset.nome = nome;
      li.innerHTML = `<button type="button" class="site-icone" aria-label="Ícone ${nomeLegivel(nome)}"><svg aria-hidden="true"><use href="${arquivo(peso)}#${nome}"></use></svg><span>${nome}</span></button>`;
      fragmento.append(li);
    }
    lista.replaceChildren(fragmento);
    filtrar();
  }

  function filtrar() {
    const palavras = sem(busca.value).split(/\s+/).filter(Boolean);
    const categoria = $("[data-icones-categoria]", raiz).value;
    let visiveis = 0;
    icones.forEach(([nome, categorias, termos, portugues], i) => {
      const texto = `${nome} ${termos} ${portugues}`;
      const mostrar = (!categoria || categorias.includes(categoria)) && palavras.every((p) => texto.includes(p));
      lista.children[i].hidden = !mostrar;
      if (mostrar) visiveis++;
    });
    $("[data-icones-contagem]", raiz).textContent =
      visiveis === icones.length ? `${icones.length} ícones` : visiveis ? `${visiveis} de ${icones.length} ícones` : "Nenhum ícone encontrado. Tente outra palavra, em português ou em inglês.";
  }

  function trocarPeso(novo) {
    peso = novo;
    for (const botao of $$("[data-peso]", raiz)) botao.setAttribute("aria-checked", String(botao.dataset.peso === novo));
    for (const uso of $$("use", lista)) uso.setAttribute("href", `${arquivo(peso)}#${uso.parentElement.parentElement.parentElement.dataset.nome}`);
  }

  async function svgSozinho(nome) {
    if (!sprites.has(peso)) {
      const texto = await (await fetch(arquivo(peso))).text();
      sprites.set(peso, new DOMParser().parseFromString(texto, "image/svg+xml"));
    }
    const simbolo = sprites.get(peso).getElementById(nome);
    const estilo = cor.toLowerCase() === COR_PADRAO ? "" : ` style="color: ${cor}"`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 256 256" fill="currentColor"${estilo} aria-hidden="true">${simbolo.innerHTML.replace(/ xmlns="[^"]*"/g, "")}</svg>`;
  }

  async function abrir(nome) {
    aberto = nome;
    const svg = await svgSozinho(nome);
    const icone = icones.find(([n]) => n === nome);
    $("[data-icone-nome]", detalhe).textContent = nomeLegivel(nome);
    $("[data-icone-info]", detalhe).textContent = `${icone[1].join(", ")} · ${$(`[data-peso="${peso}"]`, raiz).textContent} · ${tamanho}px`;
    $("[data-icone-previa]", detalhe).innerHTML = svg.replace(/width="\d+" height="\d+"/, 'width="96" height="96"');
    $("[data-icone-previa]", detalhe).style.color = cor;
    $("[data-icone-codigo]", detalhe).textContent = svg;
    detalhe.showModal();
  }

  raiz.addEventListener("click", (evento) => {
    const estilo = evento.target.closest("[data-peso]");
    if (estilo) return trocarPeso(estilo.dataset.peso);
    const item = evento.target.closest("[data-icones-lista] li");
    if (item) abrir(item.dataset.nome);
  });

  detalhe.addEventListener("click", async (evento) => {
    const acao = evento.target.closest("[data-icone-acao]")?.dataset.iconeAcao;
    if (!acao || !aberto) return;
    const svg = $("[data-icone-codigo]", detalhe).textContent;
    if (acao === "copiar") {
      await navigator.clipboard.writeText(svg);
      window.Atalho.notificar(`Ícone "${nomeLegivel(aberto)}" copiado. Cole no seu HTML.`, { tipo: "sucesso" });
    }
    if (acao === "baixar") {
      const endereco = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      Object.assign(document.createElement("a"), { href: endereco, download: `${aberto}-${peso}.svg` }).click();
      setTimeout(() => URL.revokeObjectURL(endereco), 1000);
    }
  });

  $("[data-icones-tamanho]", raiz).addEventListener("input", (evento) => {
    tamanho = Number(evento.target.value);
    $("[data-icones-tamanho-valor]", raiz).textContent = `${tamanho}px`;
    lista.style.setProperty("--icone-tamanho", `${tamanho}px`);
  });
  $("[data-icones-cor]", raiz).addEventListener("input", (evento) => {
    cor = evento.target.value;
    lista.style.setProperty("--icone-cor", cor);
  });
  $("[data-icones-categoria]", raiz).addEventListener("change", filtrar);
  busca.addEventListener("input", filtrar);

  fetch(`${base}icones/phosphor/indice.json`)
    .then((resposta) => resposta.json())
    .then((dados) => {
      icones = dados.icones;
      desenhar();
    })
    .catch(() => ($("[data-icones-contagem]", raiz).textContent = "Não foi possível carregar os ícones. Confira sua conexão e recarregue a página."));
})();
