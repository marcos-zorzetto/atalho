/*!
 * Atalho 1.2.0 — componentes de interface em português
 * https://github.com/marcos-zorzetto/atalho
 * Licença MIT · Marcos Zorzetto
 *
 * Como funciona
 * -------------
 * Você escreve HTML com atributos "data-at-..." e o Atalho cuida do resto.
 * Não precisa chamar nenhuma função de inicialização: os eventos são
 * delegados ao documento e um MutationObserver liga automaticamente os
 * componentes que forem adicionados depois (via fetch, template etc.).
 *
 * API pública: window.Atalho
 *   Atalho.estado(nome, dados, opcoes)   estado reativo que atualiza a tela
 *   Atalho.notificar(mensagem, opcoes)   notificação flutuante (toast)
 *   Atalho.formatar.moeda(valor)         formatação brasileira (Intl)
 *   Atalho.requisitar(url, opcoes)       fetch com tempo limite e erros em português
 *   Atalho.validar.cpf(texto)            validação de CPF e CNPJ
 *   Atalho.iniciar(elemento)             liga componentes manualmente (raramente necessário)
 */
(function () {
  "use strict";

  if (window.Atalho) return;

  /* ------------------------------------------------------------------------
     Utilidades internas
     ------------------------------------------------------------------------ */

  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => Array.from(raiz.querySelectorAll(seletor));
  const emitir = (alvo, nome, detalhe) =>
    alvo.dispatchEvent(new CustomEvent(nome, { bubbles: true, detail: detalhe }));
  const somenteDigitos = (texto) => String(texto ?? "").replace(/\D/g, "");
  const normalizar = (texto) =>
    String(texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  function alvoDe(referencia, origem) {
    if (!referencia) return null;
    if (referencia.startsWith("#") || referencia.startsWith(".") || referencia.startsWith("[")) {
      return document.querySelector(referencia);
    }
    return document.getElementById(referencia) || origem?.closest(referencia);
  }

  function lerJSON(texto) {
    if (texto == null || texto === "") return undefined;
    try {
      return JSON.parse(texto);
    } catch {
      return texto;
    }
  }

  const armazenamento = {
    ler(chave) {
      try {
        return JSON.parse(localStorage.getItem(chave));
      } catch {
        return null;
      }
    },
    gravar(chave, valor) {
      try {
        localStorage.setItem(chave, JSON.stringify(valor));
      } catch {
        /* modo privado ou armazenamento cheio: segue sem salvar */
      }
    },
  };

  /* ------------------------------------------------------------------------
     Formatação brasileira (Intl)
     ------------------------------------------------------------------------ */

  const intlMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const intlNumero = new Intl.NumberFormat("pt-BR");
  const intlRelativo = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  const formatar = {
    moeda: (valor) => intlMoeda.format(Number(valor) || 0),
    numero: (valor, casas) =>
      casas == null
        ? intlNumero.format(Number(valor) || 0)
        : new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(Number(valor) || 0),
    porcentagem: (valor, casas = 0) =>
      new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: casas }).format(Number(valor) || 0),
    compacto: (valor) => new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(Number(valor) || 0),
    data: (valor, estilo = "medium") => new Intl.DateTimeFormat("pt-BR", { dateStyle: estilo }).format(new Date(valor)),
    dataHora: (valor) =>
      new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor)),
    hora: (valor) => new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(new Date(valor)),
    relativo(valor) {
      const segundos = Math.round((new Date(valor).getTime() - Date.now()) / 1000);
      const unidades = [
        ["year", 31536000], ["month", 2592000], ["week", 604800],
        ["day", 86400], ["hour", 3600], ["minute", 60],
      ];
      for (const [unidade, tamanho] of unidades) {
        if (Math.abs(segundos) >= tamanho) return intlRelativo.format(Math.round(segundos / tamanho), unidade);
      }
      return "agora mesmo";
    },
    bytes(bytes) {
      if (!bytes) return "0 B";
      const unidades = ["B", "KB", "MB", "GB"];
      const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), unidades.length - 1);
      return `${formatar.numero(bytes / 1024 ** i, i ? 1 : 0)} ${unidades[i]}`;
    },
    plural: (quantidade, singular, plural) =>
      `${formatar.numero(quantidade)} ${quantidade === 1 ? singular : plural || singular + "s"}`,
    maiusculas: (texto) => String(texto ?? "").toLocaleUpperCase("pt-BR"),
  };

  /* ------------------------------------------------------------------------
     Validação de documentos brasileiros
     ------------------------------------------------------------------------ */

  const validar = {
    cpf(texto) {
      const cpf = somenteDigitos(texto);
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
      const digito = (base, pesoInicial) => {
        let soma = 0;
        for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
      };
      return digito(cpf.slice(0, 9), 10) === Number(cpf[9]) && digito(cpf.slice(0, 10), 11) === Number(cpf[10]);
    },
    // Aceita o CNPJ numérico e o alfanumérico (Receita Federal, a partir de julho de 2026)
    cnpj(texto) {
      const cnpj = String(texto ?? "").toUpperCase().replace(/[^0-9A-Z]/g, "");
      if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(.)\1{13}$/.test(cnpj)) return false;
      const valor = (caractere) => caractere.charCodeAt(0) - 48;
      const digito = (base) => {
        const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const soma = base.split("").reduce((total, c, i) => total + valor(c) * pesos[i], 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
      };
      const primeiro = digito(cnpj.slice(0, 12));
      const segundo = digito(cnpj.slice(0, 12) + primeiro);
      return cnpj.endsWith(`${primeiro}${segundo}`);
    },
    email: (texto) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(texto ?? "").trim()),
    telefone: (texto) => /^\d{10,11}$/.test(somenteDigitos(texto)),
    cep: (texto) => /^\d{8}$/.test(somenteDigitos(texto)),
  };

  /* ------------------------------------------------------------------------
     Máscaras: data-at-mascara="cpf | cnpj | telefone | cep | moeda | data | cartao | placa"
     ------------------------------------------------------------------------ */

  function aplicarPadrao(caracteres, padrao) {
    let resultado = "";
    let i = 0;
    for (const simbolo of padrao) {
      if (i >= caracteres.length) break;
      if (simbolo === "0" || simbolo === "A" || simbolo === "*") resultado += caracteres[i++];
      else resultado += simbolo;
    }
    return resultado;
  }

  const mascaras = {
    cpf: { limpar: somenteDigitos, padrao: () => "000.000.000-00", modo: "numeric" },
    cnpj: {
      limpar: (v) => String(v).toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 14),
      padrao: () => "**.***.***/****-00",
      modo: "text",
    },
    telefone: {
      limpar: somenteDigitos,
      padrao: (d) => (d.length > 10 ? "(00) 00000-0000" : "(00) 0000-00000"),
      modo: "tel",
    },
    cep: { limpar: somenteDigitos, padrao: () => "00000-000", modo: "numeric" },
    data: { limpar: somenteDigitos, padrao: () => "00/00/0000", modo: "numeric" },
    cartao: { limpar: somenteDigitos, padrao: () => "0000 0000 0000 0000", modo: "numeric" },
    validade: { limpar: somenteDigitos, padrao: () => "00/00", modo: "numeric" },
    placa: {
      limpar: (v) => String(v).toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 7),
      padrao: () => "AAA-****",
      modo: "text",
    },
  };

  function aplicarMascara(campo) {
    const tipo = campo.dataset.atMascara;

    if (tipo === "moeda") {
      const centavos = Number(somenteDigitos(campo.value).slice(0, 13) || 0);
      campo.value = centavos ? formatar.moeda(centavos / 100) : "";
      campo.dataset.atNumero = String(centavos / 100);
      return;
    }

    const mascara = mascaras[tipo];
    if (!mascara) return;

    const cursor = campo.selectionStart ?? campo.value.length;
    const significativosAntes = mascara.limpar(campo.value.slice(0, cursor)).length;
    const limpo = mascara.limpar(campo.value);
    const formatado = aplicarPadrao(limpo, mascara.padrao(limpo));
    if (campo.value === formatado) return;

    campo.value = formatado;

    // Devolve o cursor para o lugar certo (ninguém gosta de cursor pulando para o fim)
    let posicao = 0;
    let contados = 0;
    while (posicao < formatado.length && contados < significativosAntes) {
      if (mascara.limpar(formatado[posicao])) contados++;
      posicao++;
    }
    if (document.activeElement === campo) campo.setSelectionRange(posicao, posicao);
  }

  function prepararMascara(campo) {
    const mascara = mascaras[campo.dataset.atMascara];
    if (!campo.inputMode) campo.inputMode = campo.dataset.atMascara === "moeda" ? "numeric" : mascara?.modo || "text";
    if (!campo.maxLength || campo.maxLength < 0) {
      const tamanhos = { cpf: 14, cnpj: 18, telefone: 15, cep: 9, data: 10, cartao: 19, validade: 5, placa: 8 };
      if (tamanhos[campo.dataset.atMascara]) campo.maxLength = tamanhos[campo.dataset.atMascara];
    }
    if (campo.value) aplicarMascara(campo);
  }

  /* ------------------------------------------------------------------------
     Requisições: fetch com tempo limite e mensagens em português
     ------------------------------------------------------------------------ */

  async function requisitar(url, opcoes = {}) {
    const { metodo = "GET", corpo, cabecalhos = {}, tempoLimite = 15000, sinal } = opcoes;
    const controle = new AbortController();
    const temporizador = setTimeout(() => controle.abort(new DOMException("tempo", "TimeoutError")), tempoLimite);
    sinal?.addEventListener("abort", () => controle.abort(sinal.reason));

    const configuracao = { method: metodo, headers: { Accept: "application/json", ...cabecalhos }, signal: controle.signal };
    if (corpo instanceof FormData) configuracao.body = corpo;
    else if (corpo !== undefined) {
      configuracao.body = JSON.stringify(corpo);
      configuracao.headers["Content-Type"] = "application/json";
    }

    try {
      const resposta = await fetch(url, configuracao);
      const tipo = resposta.headers.get("content-type") || "";
      const dados = tipo.includes("json") ? await resposta.json() : await resposta.text();
      if (!resposta.ok) {
        const mensagens = {
          400: "Algum dado enviado está incorreto.",
          401: "Você precisa entrar na sua conta.",
          403: "Você não tem permissão para fazer isso.",
          404: "Não encontramos o que você procurou.",
          422: "Confira os dados do formulário.",
          429: "Muitas tentativas. Aguarde um pouco e tente de novo.",
        };
        const erro = new Error(mensagens[resposta.status] || `O servidor respondeu com erro ${resposta.status}.`);
        erro.status = resposta.status;
        erro.dados = dados;
        throw erro;
      }
      return dados;
    } catch (erro) {
      if (erro.name === "TimeoutError" || controle.signal.reason?.name === "TimeoutError") {
        throw new Error("O servidor demorou demais para responder. Tente de novo.");
      }
      if (erro.name === "AbortError") throw erro;
      if (erro instanceof TypeError) {
        throw new Error(navigator.onLine === false ? "Sem conexão com a internet." : "Não foi possível conectar ao servidor.");
      }
      throw erro;
    } finally {
      clearTimeout(temporizador);
    }
  }

  /* ------------------------------------------------------------------------
     Notificações (toast)
     ------------------------------------------------------------------------ */

  let caixaNotificacoes;

  function obterCaixaNotificacoes() {
    if (caixaNotificacoes?.isConnected) return caixaNotificacoes;
    caixaNotificacoes = document.createElement("section");
    caixaNotificacoes.className = "at-notificacoes";
    caixaNotificacoes.setAttribute("aria-live", "polite");
    caixaNotificacoes.setAttribute("aria-label", "Notificações");
    if ("popover" in HTMLElement.prototype) caixaNotificacoes.popover = "manual";
    document.body.append(caixaNotificacoes);
    return caixaNotificacoes;
  }

  function trazerParaFrente(caixa) {
    // A camada superior (top layer) garante que a notificação apareça até sobre um modal aberto
    if (!caixa.popover) return;
    try {
      if (caixa.matches(":popover-open")) caixa.hidePopover();
      caixa.showPopover();
    } catch {
      /* navegador sem suporte a popover: continua como position: fixed */
    }
  }

  function notificar(mensagem, opcoes = {}) {
    const { tipo = "info", titulo, duracao = 4500, acao } = opcoes;
    const caixa = obterCaixaNotificacoes();
    const item = document.createElement("div");
    const classes = { sucesso: "at-sucesso", perigo: "at-perigo", erro: "at-perigo", aviso: "at-aviso", info: "at-info" };
    item.className = `at-notificacao ${classes[tipo] || ""}`;
    item.setAttribute("role", tipo === "perigo" || tipo === "erro" ? "alert" : "status");

    const texto = document.createElement("div");
    texto.className = "at-notificacao-texto";
    if (titulo) {
      const forte = document.createElement("strong");
      forte.textContent = titulo;
      const paragrafo = document.createElement("p");
      paragrafo.textContent = mensagem;
      texto.append(forte, paragrafo);
    } else {
      texto.textContent = mensagem;
    }
    item.append(texto);

    if (acao?.texto) {
      const botaoAcao = document.createElement("button");
      botaoAcao.type = "button";
      botaoAcao.className = "at-notificacao-acao";
      botaoAcao.textContent = acao.texto;
      botaoAcao.addEventListener("click", () => {
        acao.aoClicar?.();
        fechar();
      });
      item.append(botaoAcao);
    }

    const botaoFechar = document.createElement("button");
    botaoFechar.type = "button";
    botaoFechar.className = "at-notificacao-fechar";
    botaoFechar.setAttribute("aria-label", "Fechar notificação");
    botaoFechar.textContent = "×";
    botaoFechar.addEventListener("click", () => fechar());
    item.append(botaoFechar);

    caixa.append(item);
    while (caixa.children.length > 4) caixa.firstElementChild.remove();
    trazerParaFrente(caixa);

    let restante = duracao;
    let inicio = Date.now();
    let temporizador = duracao > 0 ? setTimeout(fechar, restante) : null;

    // Pausa enquanto o mouse está em cima: dá tempo de ler e clicar em "Desfazer"
    item.addEventListener("mouseenter", () => {
      clearTimeout(temporizador);
      restante -= Date.now() - inicio;
    });
    item.addEventListener("mouseleave", () => {
      if (duracao <= 0) return;
      inicio = Date.now();
      temporizador = setTimeout(fechar, Math.max(restante, 1200));
    });

    function fechar() {
      clearTimeout(temporizador);
      if (!item.isConnected || item.dataset.saindo != null) return;
      item.dataset.saindo = "";
      item.addEventListener("animationend", () => {
        item.remove();
        if (!caixa.children.length && caixa.popover) {
          try { caixa.hidePopover(); } catch { /* já fechado */ }
        }
      }, { once: true });
    }

    return { fechar };
  }

  /* ------------------------------------------------------------------------
     Estado reativo: a tela acompanha os dados
     ------------------------------------------------------------------------ */

  const estados = new Map();
  const observadores = new Map();
  const renderizacoesPendentes = new Set();
  let renderizacaoAgendada = false;

  function resolverCaminho(caminho) {
    let negar = false;
    let texto = String(caminho).trim();
    if (texto.startsWith("!")) {
      negar = true;
      texto = texto.slice(1);
    }
    const [nome, ...partes] = texto.split(".");
    let valor = estados.get(nome);
    if (valor === undefined) return { existe: false };
    for (const parte of partes) valor = valor?.[parte];
    return { existe: true, valor: negar ? !valor : valor, nome };
  }

  function aplicarFormato(valor, formato) {
    if (valor == null || valor === "") return "";
    if (!formato) return valor;
    const [nome, ...argumentos] = formato.split(":");
    const funcao = formatar[nome];
    return funcao ? funcao(valor, ...argumentos) : valor;
  }

  function preencherItem(clone, item, indice) {
    const elementos = [clone, ...$$("*", clone)];
    for (const el of elementos) {
      if (!(el instanceof Element)) continue;
      const campo = el.getAttribute("data-at-campo");
      if (campo) {
        const valor = campo === "$indice" ? indice + 1 : campo.split(".").reduce((v, p) => v?.[p], item);
        el.textContent = aplicarFormato(valor, el.getAttribute("data-at-formato"));
      }
      const atributos = el.getAttribute("data-at-atributos");
      if (atributos) {
        for (const par of atributos.split(",")) {
          const [atributo, chave] = par.split(":").map((s) => s.trim());
          const valor = chave.split(".").reduce((v, p) => v?.[p], item);
          if (valor == null || valor === false) el.removeAttribute(atributo);
          else el.setAttribute(atributo, valor === true ? "" : valor);
        }
      }
    }
  }

  function renderizarLigacoes(raiz = document, somenteNome) {
    const filtro = (atributo) =>
      somenteNome ? `[${atributo}^="${somenteNome}."], [${atributo}^="!${somenteNome}."], [${atributo}="${somenteNome}"]` : `[${atributo}]`;

    for (const el of $$(filtro("data-at-texto"), raiz)) {
      const r = resolverCaminho(el.dataset.atTexto);
      if (r.existe) el.textContent = aplicarFormato(r.valor, el.dataset.atFormato);
    }
    for (const el of $$(filtro("data-at-mostrar"), raiz)) {
      const r = resolverCaminho(el.dataset.atMostrar);
      if (r.existe) el.hidden = !r.valor || (Array.isArray(r.valor) && !r.valor.length);
    }
    for (const el of $$(filtro("data-at-desabilitar"), raiz)) {
      const r = resolverCaminho(el.dataset.atDesabilitar);
      if (r.existe) el.disabled = Boolean(r.valor);
    }
    for (const el of $$(filtro("data-at-valor"), raiz)) {
      const r = resolverCaminho(el.dataset.atValor);
      if (!r.existe || document.activeElement === el) continue;
      if (el.type === "checkbox") el.checked = Boolean(r.valor);
      else if (el.value !== String(r.valor ?? "")) el.value = r.valor ?? "";
    }
    for (const el of $$(filtro("data-at-lista"), raiz)) {
      const r = resolverCaminho(el.dataset.atLista);
      const modelo = $(":scope > template", el);
      if (!r.existe || !modelo) continue;
      for (const filho of Array.from(el.children)) if (filho !== modelo) filho.remove();
      const itens = Array.isArray(r.valor) ? r.valor : [];
      itens.forEach((item, indice) => {
        const fragmento = modelo.content.cloneNode(true);
        for (const raizItem of Array.from(fragmento.children)) {
          raizItem.atItem = item;
          raizItem.atIndice = indice;
          preencherItem(raizItem, item, indice);
        }
        el.append(fragmento);
      });
    }
  }

  function agendarRenderizacao(nome) {
    renderizacoesPendentes.add(nome);
    if (renderizacaoAgendada) return;
    renderizacaoAgendada = true;
    queueMicrotask(() => {
      renderizacaoAgendada = false;
      const nomes = Array.from(renderizacoesPendentes);
      renderizacoesPendentes.clear();
      for (const n of nomes) {
        renderizarLigacoes(document, n);
        const proxy = estados.get(n);
        for (const callback of observadores.get(n) || []) callback(proxy);
        emitir(document, "at:estado", { nome: n, estado: proxy });
      }
    });
  }

  function dadosParaSalvar(alvo) {
    const resultado = {};
    for (const [chave, descritor] of Object.entries(Object.getOwnPropertyDescriptors(alvo))) {
      if ("value" in descritor && typeof descritor.value !== "function") resultado[chave] = descritor.value;
    }
    return resultado;
  }

  function estado(nome, dadosIniciais = {}, opcoes = {}) {
    const { salvar = false } = opcoes;
    const chave = `atalho:${nome}`;
    const alvo = dadosIniciais;

    if (salvar) {
      const salvo = armazenamento.ler(chave);
      if (salvo && typeof salvo === "object") {
        for (const [k, v] of Object.entries(salvo)) {
          const descritor = Object.getOwnPropertyDescriptor(alvo, k);
          if (!descritor || "value" in descritor) alvo[k] = v;
        }
      }
    }

    const proxy = new Proxy(alvo, {
      set(objeto, propriedade, valor) {
        if (Object.is(objeto[propriedade], valor)) return true;
        objeto[propriedade] = valor;
        if (salvar) armazenamento.gravar(chave, dadosParaSalvar(objeto));
        agendarRenderizacao(nome);
        return true;
      },
    });

    estados.set(nome, proxy);
    agendarRenderizacao(nome);
    return proxy;
  }

  function observar(nome, callback) {
    if (!observadores.has(nome)) observadores.set(nome, new Set());
    observadores.get(nome).add(callback);
    return () => observadores.get(nome)?.delete(callback);
  }

  function executarAcao(caminho, origem, evento, dadosProntos) {
    const [nome, metodo] = caminho.split(".");
    const proxy = estados.get(nome);
    if (!proxy || typeof proxy[metodo] !== "function") {
      console.warn(`[Atalho] Ação "${caminho}" não existe. Crie com Atalho.estado("${nome}", { ${metodo}() { ... } }).`);
      return;
    }
    let dados = dadosProntos !== undefined ? dadosProntos : lerJSON(origem.dataset.atDados);
    if (dados === undefined) {
      const itemDaLista = origem.closest("[data-at-lista] > *");
      if (itemDaLista && "atItem" in itemDaLista) dados = itemDaLista.atItem;
    }
    if (dados === undefined && origem.form && origem.type === "submit") dados = Object.fromEntries(new FormData(origem.form));
    if (dados === undefined && "value" in origem && origem.tagName !== "BUTTON") dados = origem.type === "checkbox" ? origem.checked : origem.value;
    proxy[metodo](dados, evento);
  }

  /* ------------------------------------------------------------------------
     Popover: posiciona menus suspensos ao lado do botão que os abriu
     ------------------------------------------------------------------------ */

  const abridoresDePopover = new WeakMap();

  function posicionarPopover(popover) {
    const abridor = abridoresDePopover.get(popover);
    if (!abridor || !popover.matches(".at-menu, .at-balao")) return;
    const ref = abridor.getBoundingClientRect();
    const caixa = popover.getBoundingClientRect();
    const margem = 8;
    const alinharFim = popover.dataset.alinhar === "fim";

    let topo = ref.bottom + 6;
    if (topo + caixa.height > innerHeight - margem && ref.top - caixa.height - 6 > margem) topo = ref.top - caixa.height - 6;
    let esquerda = alinharFim ? ref.right - caixa.width : ref.left;
    esquerda = Math.min(Math.max(esquerda, margem), innerWidth - caixa.width - margem);

    popover.style.position = "fixed";
    popover.style.top = `${Math.round(topo)}px`;
    popover.style.left = `${Math.round(esquerda)}px`;
  }

  function popoversAbertos() {
    return $$(".at-menu, .at-balao").filter((p) => {
      try { return p.matches(":popover-open"); } catch { return false; }
    });
  }

  /* ------------------------------------------------------------------------
     Formulários: validação com mensagens em português
     ------------------------------------------------------------------------ */

  function mensagemDeErro(campo) {
    const v = campo.validity;
    const d = campo.dataset;
    if (v.valueMissing) {
      if (campo.type === "checkbox") return d.msgObrigatorio || "Marque esta opção para continuar.";
      if (campo.tagName === "SELECT" || campo.type === "radio") return d.msgObrigatorio || "Escolha uma opção.";
      return d.msgObrigatorio || "Preencha este campo.";
    }
    if (v.typeMismatch) {
      if (campo.type === "email") return d.msgFormato || "Digite um e-mail válido, como nome@exemplo.com.";
      if (campo.type === "url") return d.msgFormato || "Digite um endereço completo, começando com https://.";
      return d.msgFormato || "Formato inválido.";
    }
    if (v.tooShort) return `Use pelo menos ${campo.minLength} caracteres (agora são ${campo.value.length}).`;
    if (v.tooLong) return `Use no máximo ${campo.maxLength} caracteres.`;
    if (v.rangeUnderflow) return `O valor mínimo é ${campo.min}.`;
    if (v.rangeOverflow) return `O valor máximo é ${campo.max}.`;
    if (v.stepMismatch) return "Valor fora do intervalo permitido.";
    if (v.patternMismatch) return d.msgFormato || "O formato não está correto.";
    if (v.badInput) return "Valor inválido.";
    if (v.customError) return campo.validationMessage;
    return "";
  }

  function verificarRegrasExtras(campo) {
    if (!campo.willValidate) return;
    let erro = "";
    const valor = campo.value.trim();
    const tipo = campo.dataset.atMascara;
    if (valor && tipo === "cpf" && !validar.cpf(valor)) erro = "CPF inválido. Confira os números.";
    if (valor && tipo === "cnpj" && !validar.cnpj(valor)) erro = "CNPJ inválido. Confira os caracteres.";
    if (valor && tipo === "telefone" && !validar.telefone(valor)) erro = "Telefone incompleto. Inclua o DDD.";
    if (valor && tipo === "cep" && !validar.cep(valor)) erro = "CEP incompleto.";
    // O navegador aceita "nome@empresa" (sem .com). Para cadastro real, exigimos o domínio completo.
    if (valor && campo.type === "email" && !campo.validity.typeMismatch && !validar.email(valor)) {
      erro = campo.dataset.msgFormato || "Digite um e-mail válido, como nome@exemplo.com.";
    }
    if (campo.dataset.atIgual) {
      const outro = alvoDe(campo.dataset.atIgual, campo);
      if (outro && valor !== outro.value) erro = campo.dataset.msgIgual || "Os valores não são iguais.";
    }
    if (!erro && campo.dataset.atCepErro) erro = campo.dataset.atCepErro;
    campo.setCustomValidity(erro);
  }

  function elementoDeErro(campo) {
    const container = campo.closest(".at-campo") || campo.parentElement;
    let mensagem = $(":scope > .at-erro-msg", container);
    if (!mensagem) {
      mensagem = document.createElement("span");
      mensagem.className = "at-erro-msg";
      mensagem.id = `${campo.id || campo.name || "campo"}-erro-${Math.random().toString(36).slice(2, 7)}`;
      mensagem.setAttribute("aria-live", "polite");
      container.append(mensagem);
    }
    return mensagem;
  }

  function mostrarValidacao(campo) {
    if (campo.type === "radio") {
      const grupo = $$(`input[type="radio"][name="${CSS.escape(campo.name)}"]`, campo.form || document);
      campo = grupo[0];
    }
    verificarRegrasExtras(campo);
    const valido = campo.checkValidity();
    const mensagem = elementoDeErro(campo);
    mensagem.textContent = valido ? "" : mensagemDeErro(campo);
    if (valido) {
      campo.removeAttribute("aria-invalid");
    } else {
      campo.setAttribute("aria-invalid", "true");
      const descritores = new Set((campo.getAttribute("aria-describedby") || "").split(" ").filter(Boolean));
      descritores.add(mensagem.id);
      campo.setAttribute("aria-describedby", Array.from(descritores).join(" "));
    }
    return valido;
  }

  function camposDe(formulario) {
    return Array.from(formulario.elements).filter(
      (el) => el.willValidate && !el.disabled && el.type !== "submit" && el.type !== "button"
    );
  }

  /* ------------------------------------------------------------------------
     Busca de endereço pelo CEP (ViaCEP, gratuito e sem chave)
     ------------------------------------------------------------------------ */

  const cacheCep = new Map();

  async function buscarCep(campo) {
    const cep = somenteDigitos(campo.value);
    if (cep.length !== 8 || campo.dataset.atCepAtual === cep) return;
    campo.dataset.atCepAtual = cep;
    const escopo = campo.form || campo.closest("[data-at-cep-escopo]") || document;
    const container = campo.closest(".at-campo");
    container?.setAttribute("aria-busy", "true");
    delete campo.dataset.atCepErro;

    try {
      if (!cacheCep.has(cep)) cacheCep.set(cep, await requisitar(`https://viacep.com.br/ws/${cep}/json/`, { tempoLimite: 8000 }));
      const endereco = cacheCep.get(cep);
      if (endereco.erro) throw new Error("CEP não encontrado. Confira os números.");

      for (const destino of $$("[data-at-cep-preencher]", escopo)) {
        const chave = destino.dataset.atCepPreencher;
        if (endereco[chave] !== undefined) {
          destino.value = endereco[chave];
          destino.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
      $("[data-at-cep-foco]", escopo)?.focus();
      emitir(campo, "at:cep", endereco);
    } catch (erro) {
      cacheCep.delete(cep);
      campo.dataset.atCepErro = erro.message;
      delete campo.dataset.atCepAtual;
      emitir(campo, "at:cep-erro", { mensagem: erro.message });
    } finally {
      container?.removeAttribute("aria-busy");
      if (campo.form?.hasAttribute("data-at-validar") || campo.dataset.atCepErro) mostrarValidacao(campo);
    }
  }

  /* ------------------------------------------------------------------------
     Componentes que precisam preparar o HTML ao aparecer na página
     ------------------------------------------------------------------------ */

  const preparados = new WeakSet();

  const componentes = {
    abas(lista) {
      lista.setAttribute("role", "tablist");
      const abas = $$(".at-aba", lista);
      abas.forEach((aba, i) => {
        const painel = alvoDe(aba.getAttribute("aria-controls"));
        aba.setAttribute("role", "tab");
        if (!aba.id) aba.id = `${aba.getAttribute("aria-controls") || "aba"}-botao-${i}`;
        if (aba.getAttribute("aria-selected") == null) aba.setAttribute("aria-selected", i === 0 ? "true" : "false");
        const ativa = aba.getAttribute("aria-selected") === "true";
        aba.tabIndex = ativa ? 0 : -1;
        if (painel) {
          painel.setAttribute("role", "tabpanel");
          painel.setAttribute("aria-labelledby", aba.id);
          painel.tabIndex = 0;
          painel.hidden = !ativa;
        }
      });
    },

    tabela(tabela) {
      const config = {
        porPagina: Number(tabela.dataset.porPagina) || 0,
        pagina: 1,
        filtro: "",
        coluna: -1,
        direcao: "ascending",
      };
      tabela.atConfig = config;

      $$("th[data-ordenar]", tabela).forEach((th) => {
        if ($(":scope > button", th)) return;
        const botao = document.createElement("button");
        botao.type = "button";
        botao.innerHTML = th.innerHTML;
        th.textContent = "";
        th.append(botao);
        th.setAttribute("aria-sort", "none");
      });

      const filtro = alvoDe(tabela.dataset.filtro);
      if (filtro) {
        filtro.addEventListener("input", () => {
          config.filtro = normalizar(filtro.value);
          config.pagina = 1;
          atualizarTabela(tabela);
        });
      }

      if (config.porPagina && !tabela.atPaginacao) {
        const nav = document.createElement("nav");
        nav.className = "at-paginacao at-mt-4";
        nav.setAttribute("aria-label", "Paginação da tabela");
        (tabela.closest(".at-tabela-caixa") || tabela).after(nav);
        tabela.atPaginacao = nav;
      }
      atualizarTabela(tabela);
    },

    carrossel(carrossel) {
      const trilho = $(".at-carrossel-trilho", carrossel);
      if (!trilho) return;
      const atualizar = () => {
        const inicio = trilho.scrollLeft <= 2;
        const fim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 2;
        $$('[data-carrossel="anterior"]', carrossel).forEach((b) => (b.disabled = inicio));
        $$('[data-carrossel="proximo"]', carrossel).forEach((b) => (b.disabled = fim));
      };
      let quadro;
      trilho.addEventListener("scroll", () => {
        cancelAnimationFrame(quadro);
        quadro = requestAnimationFrame(atualizar);
      }, { passive: true });
      new ResizeObserver(atualizar).observe(trilho);
      atualizar();
    },

    kanban(quadro) {
      $$(".at-kanban-cartao", quadro).forEach((cartao) => {
        cartao.draggable = true;
        if (!cartao.hasAttribute("tabindex")) cartao.tabIndex = 0;
        if (!cartao.title) cartao.title = "Arraste ou use Alt + setas para mover";
      });
      atualizarContagensKanban(quadro);
    },

    codigo(grupo) {
      const campos = $$("input", grupo);
      campos.forEach((campo, i) => {
        campo.inputMode = "numeric";
        campo.maxLength = 1;
        campo.autocomplete = i === 0 ? "one-time-code" : "off";
        if (!campo.getAttribute("aria-label")) campo.setAttribute("aria-label", `Dígito ${i + 1} de ${campos.length}`);
      });
    },

    cookies(faixa) {
      const salvo = armazenamento.ler("atalho:cookies");
      if (!salvo) faixa.hidden = false;
      else emitir(document, "at:cookies", salvo);
    },

    comando(dialogo) {
      const campo = $("input", dialogo);
      campo?.setAttribute("role", "combobox");
      campo?.setAttribute("aria-expanded", "true");
      filtrarComando(dialogo);
    },
  };

  function iniciar(raiz = document) {
    const elementos = raiz instanceof Element ? [raiz, ...$$("[data-at], [data-at-mascara]", raiz)] : $$("[data-at], [data-at-mascara]", raiz);
    for (const el of elementos) {
      if (!(el instanceof Element) || preparados.has(el)) continue;
      if (el.dataset.atMascara) {
        preparados.add(el);
        prepararMascara(el);
      }
      const tipo = el.dataset.at;
      if (tipo && componentes[tipo]) {
        preparados.add(el);
        try {
          componentes[tipo](el);
        } catch (erro) {
          console.error(`[Atalho] Erro ao preparar "${tipo}":`, erro);
        }
      }
    }
    for (const formulario of raiz instanceof Element ? [raiz, ...$$("form[data-at-validar]", raiz)] : $$("form[data-at-validar]", raiz)) {
      if (formulario.matches?.("form[data-at-validar]")) formulario.noValidate = true;
    }
    const escopo = raiz instanceof Element ? raiz : document;
    for (const faixa of escopo.matches?.(".at-faixa-entrada") ? [escopo] : $$(".at-faixa-entrada", escopo)) atualizarFaixa(faixa);
    for (const campo of escopo.matches?.("[data-at-contar]") ? [escopo] : $$("[data-at-contar]", escopo)) atualizarContagem(campo);
    renderizarLigacoes(escopo);
  }

  /* ------------------------------------------------------------------------
     Tabela: ordenar, filtrar, paginar, selecionar, exportar
     ------------------------------------------------------------------------ */

  function valorDaCelula(celula, tipo) {
    const bruto = celula?.dataset.valor ?? celula?.textContent.trim() ?? "";
    if (tipo === "numero") {
      if (celula?.dataset.valor != null) return Number(bruto);
      return Number(bruto.replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
    }
    if (tipo === "data") return new Date(bruto).getTime() || 0;
    return normalizar(bruto);
  }

  function atualizarTabela(tabela) {
    const config = tabela.atConfig;
    const corpo = tabela.tBodies[0];
    if (!config || !corpo) return;
    const linhas = Array.from(corpo.rows).filter((l) => !l.classList.contains("at-tabela-vazia"));

    if (config.coluna >= 0) {
      const th = tabela.tHead.rows[0].cells[config.coluna];
      const tipo = th.dataset.ordenar || "texto";
      const fator = config.direcao === "ascending" ? 1 : -1;
      const colator = new Intl.Collator("pt-BR", { numeric: true });
      linhas.sort((a, b) => {
        const va = valorDaCelula(a.cells[config.coluna], tipo);
        const vb = valorDaCelula(b.cells[config.coluna], tipo);
        return (typeof va === "number" ? va - vb : colator.compare(va, vb)) * fator;
      });
      corpo.append(...linhas);
    }

    const visiveis = linhas.filter((l) => !config.filtro || normalizar(l.textContent).includes(config.filtro));
    const total = visiveis.length;
    const porPagina = config.porPagina || total || 1;
    const paginas = Math.max(1, Math.ceil(total / porPagina));
    config.pagina = Math.min(config.pagina, paginas);
    const inicio = (config.pagina - 1) * porPagina;

    for (const linha of linhas) linha.hidden = true;
    visiveis.slice(inicio, inicio + porPagina).forEach((l) => (l.hidden = false));

    let vazia = $(":scope > .at-tabela-vazia", corpo);
    if (!total) {
      if (!vazia) {
        vazia = corpo.insertRow();
        vazia.className = "at-tabela-vazia";
        const celula = vazia.insertCell();
        celula.colSpan = tabela.tHead?.rows[0].cells.length || 1;
      }
      vazia.cells[0].textContent = tabela.dataset.msgVazia || "Nenhum resultado para essa busca.";
      vazia.hidden = false;
    } else if (vazia) {
      vazia.hidden = true;
    }

    const nav = tabela.atPaginacao;
    if (nav) {
      const ate = Math.min(inicio + porPagina, total);
      const botoes = [];
      const botao = (rotulo, pagina, extra = "") =>
        `<button type="button" class="at-pagina" data-pagina="${pagina}" ${extra}>${rotulo}</button>`;
      botoes.push(botao("‹", config.pagina - 1, `aria-label="Página anterior" ${config.pagina === 1 ? "disabled" : ""}`));
      for (let p = 1; p <= paginas; p++) {
        const perto = p === 1 || p === paginas || Math.abs(p - config.pagina) <= 1;
        if (perto) botoes.push(botao(p, p, p === config.pagina ? 'aria-current="page"' : `aria-label="Página ${p}"`));
        else if (botoes[botoes.length - 1] !== "…") botoes.push("…");
      }
      botoes.push(botao("›", config.pagina + 1, `aria-label="Próxima página" ${config.pagina === paginas ? "disabled" : ""}`));
      nav.innerHTML = `<span class="at-paginacao-info">${total ? `Mostrando ${inicio + 1}–${ate} de ${total}` : "Nenhum resultado"}</span>
        <div class="at-paginacao-botoes">${botoes.map((b) => (b === "…" ? '<span class="at-pagina" aria-hidden="true">…</span>' : b)).join("")}</div>`;
      nav.atTabela = tabela;
    }

    atualizarSelecao(tabela);
  }

  function atualizarSelecao(tabela) {
    const caixas = $$("tbody [data-selecionar]", tabela);
    const marcadas = caixas.filter((c) => c.checked);
    caixas.forEach((c) => c.closest("tr")?.setAttribute("aria-selected", c.checked ? "true" : "false"));
    // "Selecionar todos" reflete só as linhas visíveis (página atual e filtro aplicado)
    const todas = $("[data-selecionar-todos]", tabela);
    if (todas) {
      const visiveis = caixas.filter((c) => !c.closest("tr")?.hidden);
      const marcadasVisiveis = visiveis.filter((c) => c.checked).length;
      todas.checked = visiveis.length > 0 && marcadasVisiveis === visiveis.length;
      todas.indeterminate = marcadasVisiveis > 0 && marcadasVisiveis < visiveis.length;
    }
    return marcadas;
  }

  function exportarCSV(tabela, nomeArquivo = "dados.csv") {
    const escapar = (texto) => {
      const t = String(texto).replace(/\s+/g, " ").trim();
      return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    const ignorar = (celula) => celula.querySelector("input[type=checkbox]") || celula.hasAttribute("data-nao-exportar");
    const linhas = [];
    const cabecalho = Array.from(tabela.tHead?.rows[0].cells || []);
    linhas.push(cabecalho.filter((c) => !ignorar(c)).map((c) => escapar(c.textContent)).join(";"));
    const filtro = tabela.atConfig?.filtro;
    for (const linha of tabela.tBodies[0].rows) {
      if (linha.classList.contains("at-tabela-vazia")) continue;
      if (filtro && !normalizar(linha.textContent).includes(filtro)) continue;
      linhas.push(Array.from(linha.cells).filter((c) => !ignorar(c)).map((c) => escapar(c.textContent)).join(";"));
    }
    // ";" e BOM UTF-8: é assim que o Excel em português abre o arquivo com acentos corretos
    const arquivo = new Blob(["﻿" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(arquivo);
    link.download = nomeArquivo;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  /* ------------------------------------------------------------------------
     Paleta de comandos
     ------------------------------------------------------------------------ */

  function itensComando(dialogo) {
    return $$(".at-comando-item", dialogo).filter((i) => !i.hidden);
  }

  function selecionarItemComando(dialogo, indice) {
    const itens = itensComando(dialogo);
    itens.forEach((item, i) => item.setAttribute("aria-selected", i === indice ? "true" : "false"));
    const atual = itens[indice];
    atual?.scrollIntoView({ block: "nearest" });
    const campo = $("input", dialogo);
    if (campo && atual) {
      if (!atual.id) atual.id = `at-comando-item-${Math.random().toString(36).slice(2, 8)}`;
      campo.setAttribute("aria-activedescendant", atual.id);
    }
    dialogo.atIndice = indice;
  }

  function filtrarComando(dialogo) {
    const termo = normalizar($("input", dialogo)?.value);
    const palavras = termo.split(/\s+/).filter(Boolean);
    let visiveis = 0;
    $(".at-comando-lista", dialogo)?.setAttribute("role", "listbox");
    for (const item of $$(".at-comando-item", dialogo)) {
      item.setAttribute("role", "option");
      const texto = normalizar(`${item.textContent} ${item.dataset.palavras || ""}`);
      const mostrar = palavras.every((p) => texto.includes(p));
      item.hidden = !mostrar;
      if (mostrar) visiveis++;
    }
    for (const grupo of $$(".at-comando-grupo", dialogo)) {
      let proximo = grupo.nextElementSibling;
      let temItem = false;
      while (proximo && !proximo.classList.contains("at-comando-grupo")) {
        if (proximo.matches(".at-comando-item:not([hidden])") || $(".at-comando-item:not([hidden])", proximo)) temItem = true;
        proximo = proximo.nextElementSibling;
      }
      grupo.hidden = !temItem;
    }
    const vazio = $(".at-comando-vazio", dialogo);
    if (vazio) vazio.hidden = visiveis > 0;
    selecionarItemComando(dialogo, 0);
  }

  /* ------------------------------------------------------------------------
     Kanban
     ------------------------------------------------------------------------ */

  let cartaoArrastado = null;

  function atualizarContagensKanban(quadro) {
    for (const coluna of $$(".at-kanban-coluna", quadro)) {
      const contagem = $("[data-contagem]", coluna);
      if (contagem) contagem.textContent = $$(".at-kanban-cartao", coluna).length;
    }
  }

  function posicaoDeInsercao(lista, y) {
    const cartoes = $$(".at-kanban-cartao:not([data-arrastando])", lista);
    return cartoes.find((c) => {
      const caixa = c.getBoundingClientRect();
      return y < caixa.top + caixa.height / 2;
    });
  }

  function moverCartao(cartao, lista, antesDe) {
    const de = cartao.closest(".at-kanban-coluna");
    lista.insertBefore(cartao, antesDe || null);
    const para = lista.closest(".at-kanban-coluna");
    const quadro = cartao.closest("[data-at='kanban']");
    if (quadro) atualizarContagensKanban(quadro);
    emitir(cartao, "at:mover", {
      cartao,
      id: cartao.dataset.id,
      de: de?.dataset.coluna,
      para: para?.dataset.coluna,
      posicao: $$(".at-kanban-cartao", lista).indexOf(cartao),
    });
  }

  /* ------------------------------------------------------------------------
     Upload
     ------------------------------------------------------------------------ */

  function mostrarArquivos(entrada) {
    const area = entrada.closest("[data-at='upload']");
    const lista = alvoDe(area?.dataset.lista) || area?.nextElementSibling;
    const arquivos = Array.from(entrada.files || []);
    const limite = Number(area?.dataset.tamanhoMaximo || 0) * 1024 * 1024;
    const grandes = limite ? arquivos.filter((a) => a.size > limite) : [];
    if (grandes.length) {
      notificar(`${grandes.map((a) => a.name).join(", ")} passa(m) do limite de ${area.dataset.tamanhoMaximo} MB.`, { tipo: "perigo" });
    }

    if (lista?.classList.contains("at-upload-lista")) {
      for (const img of $$("img", lista)) URL.revokeObjectURL(img.src);
      lista.innerHTML = "";
      arquivos.forEach((arquivo, i) => {
        const li = document.createElement("li");
        const extensao = arquivo.name.split(".").pop().slice(0, 4).toUpperCase();
        const previa = arquivo.type.startsWith("image/")
          ? Object.assign(document.createElement("img"), { src: URL.createObjectURL(arquivo), alt: "" })
          : Object.assign(document.createElement("span"), { className: "at-upload-tipo", textContent: extensao });
        const info = document.createElement("div");
        info.className = "at-cresce";
        info.innerHTML = `<div class="at-truncar"></div><small class="at-texto-suave"></small>`;
        info.firstElementChild.textContent = arquivo.name;
        info.lastElementChild.textContent = formatar.bytes(arquivo.size) + (limite && arquivo.size > limite ? " · grande demais" : "");
        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "at-botao at-fantasma at-pequeno";
        remover.textContent = "Remover";
        remover.dataset.removerArquivo = String(i);
        li.append(previa, info, remover);
        lista.append(li);
      });
    }
    emitir(entrada, "at:arquivos", { arquivos });
  }

  /* ------------------------------------------------------------------------
     Senha
     ------------------------------------------------------------------------ */

  function forcaDaSenha(senha) {
    if (!senha) return 0;
    let pontos = 0;
    if (senha.length >= 8) pontos++;
    if (senha.length >= 12) pontos++;
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
    if (/\d/.test(senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(senha)) pontos++;
    const comuns = ["123456", "12345678", "123456789", "1234567890", "senha", "senha123", "password", "qwerty", "abc123", "abcdefgh", "brasil", "102030"];
    if (/^(.)\1+$/.test(senha) || comuns.includes(senha.toLowerCase())) pontos = 1;
    return Math.max(1, Math.min(4, pontos));
  }

  /* ------------------------------------------------------------------------
     Tema claro/escuro
     ------------------------------------------------------------------------ */

  function temaAtual() {
    const definido = document.documentElement.dataset.tema;
    if (definido) return definido;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
  }

  function definirTema(tema) {
    if (tema === "sistema") {
      delete document.documentElement.dataset.tema;
      armazenamento.gravar("atalho:tema", null);
    } else {
      document.documentElement.dataset.tema = tema;
      armazenamento.gravar("atalho:tema", tema);
    }
    $$("[data-at-tema]").forEach((b) => b.setAttribute("aria-pressed", temaAtual() === "escuro" ? "true" : "false"));
    emitir(document, "at:tema", { tema: temaAtual() });
  }

  const temaSalvo = armazenamento.ler("atalho:tema");
  if (temaSalvo === "claro" || temaSalvo === "escuro") document.documentElement.dataset.tema = temaSalvo;

  /* ------------------------------------------------------------------------
     Eventos delegados
     ------------------------------------------------------------------------ */

  const temInvokers = "commandForElement" in HTMLButtonElement.prototype;

  document.addEventListener("click", (evento) => {
    const el = evento.target instanceof Element ? evento.target : null;
    if (!el) return;

    // Polyfill de invoker commands (commandfor/command) para navegadores antigos
    const invocador = el.closest("button[commandfor]");
    if (invocador && !temInvokers) {
      const alvo = document.getElementById(invocador.getAttribute("commandfor"));
      const comando = invocador.getAttribute("command");
      try {
        if (alvo && comando === "show-modal" && !alvo.open) alvo.showModal();
        else if (alvo && (comando === "close" || comando === "request-close")) alvo.close(invocador.value || undefined);
        else if (alvo && comando === "toggle-popover") alvo.togglePopover();
        else if (alvo && comando === "show-popover") alvo.showPopover();
        else if (alvo && comando === "hide-popover") alvo.hidePopover();
      } catch {
        /* estado inválido (ex.: já aberto) */
      }
    }

    // Guarda qual botão abriu cada popover, para posicionar o menu ao lado dele
    const abridor = el.closest("[popovertarget], button[commandfor]");
    if (abridor) {
      const alvo = document.getElementById(abridor.getAttribute("popovertarget") || abridor.getAttribute("commandfor"));
      if (alvo?.hasAttribute("popover")) abridoresDePopover.set(alvo, abridor);
    }

    // Fecha menu suspenso ao escolher um item
    const itemMenu = el.closest(".at-menu .at-menu-item");
    if (itemMenu && !itemMenu.hasAttribute("data-manter-aberto")) {
      try { itemMenu.closest(".at-menu").hidePopover(); } catch { /* fechado */ }
    }

    // Clique no fundo escurecido fecha modal, gaveta e paleta
    if (el.matches("dialog.at-modal, dialog.at-gaveta, dialog.at-comando") && el.open && !el.hasAttribute("data-at-fixo")) {
      const caixa = el.getBoundingClientRect();
      const fora = evento.clientX < caixa.left || evento.clientX > caixa.right || evento.clientY < caixa.top || evento.clientY > caixa.bottom;
      if (fora && evento.clientX !== 0) el.close();
    }

    const fechar = el.closest("[data-at-fechar]");
    if (fechar) {
      const alvo = alvoDe(fechar.dataset.atFechar, fechar) || fechar.closest("dialog, .at-alerta, .at-etiqueta, [data-at-fechavel]");
      if (alvo?.tagName === "DIALOG") alvo.close();
      else alvo?.remove();
    }

    const alternar = el.closest("[data-at-alternar]");
    if (alternar) {
      const alvo = alvoDe(alternar.dataset.atAlternar, alternar);
      if (alvo) {
        const aberto = !alvo.hasAttribute("data-aberto");
        alvo.toggleAttribute("data-aberto", aberto);
        alternar.setAttribute("aria-expanded", String(aberto));
      }
    }

    const acao = el.closest("[data-at-acao]");
    if (acao && !acao.matches("input, select, textarea, form")) {
      if (acao.tagName === "A") evento.preventDefault();
      executarAcao(acao.dataset.atAcao, acao, evento);
    }

    const aviso = el.closest("[data-at-notificar]");
    if (aviso) notificar(aviso.dataset.atNotificar, { tipo: aviso.dataset.atTipo || "sucesso" });

    const copiar = el.closest("[data-at-copiar]");
    if (copiar) {
      const ref = copiar.dataset.atCopiar;
      const fonte = ref.startsWith("#") ? $(ref) : null;
      const texto = fonte ? (fonte.value ?? fonte.textContent) : ref;
      navigator.clipboard?.writeText(texto.trim()).then(() => {
        if (copiar.dataset.atCopiado != null) return;
        const original = copiar.innerHTML;
        copiar.dataset.atCopiado = "";
        copiar.textContent = copiar.dataset.textoCopiado || "Copiado!";
        setTimeout(() => {
          copiar.innerHTML = original;
          delete copiar.dataset.atCopiado;
        }, 1800);
      }, () => notificar("Não foi possível copiar. Selecione o texto e use Ctrl+C.", { tipo: "perigo" }));
    }

    const tema = el.closest("[data-at-tema]");
    if (tema) {
      const valor = tema.dataset.atTema;
      definirTema(valor === "alternar" || !valor ? (temaAtual() === "escuro" ? "claro" : "escuro") : valor);
    }

    const verSenha = el.closest("[data-at-ver-senha]");
    if (verSenha) {
      const campo = $("input", verSenha.closest(".at-senha"));
      if (campo) {
        const mostrar = campo.type === "password";
        campo.type = mostrar ? "text" : "password";
        verSenha.textContent = mostrar ? "Ocultar" : "Mostrar";
        verSenha.setAttribute("aria-pressed", String(mostrar));
        campo.focus();
      }
    }

    // Abas
    const aba = el.closest("[data-at='abas'] .at-aba");
    if (aba) ativarAba(aba);

    // Tabela: ordenação
    const ordenar = el.closest("th[data-ordenar] > button");
    if (ordenar) {
      const th = ordenar.parentElement;
      const tabela = th.closest("table");
      const config = tabela.atConfig;
      if (config) {
        const indice = th.cellIndex;
        config.direcao = config.coluna === indice && config.direcao === "ascending" ? "descending" : "ascending";
        config.coluna = indice;
        $$("th[data-ordenar]", tabela).forEach((t) => t.setAttribute("aria-sort", "none"));
        th.setAttribute("aria-sort", config.direcao);
        atualizarTabela(tabela);
      }
    }

    // Tabela: paginação
    const pagina = el.closest(".at-paginacao [data-pagina]");
    if (pagina && pagina.closest(".at-paginacao").atTabela) {
      const tabela = pagina.closest(".at-paginacao").atTabela;
      tabela.atConfig.pagina = Number(pagina.dataset.pagina);
      atualizarTabela(tabela);
    }

    // Tabela: exportar
    const exportar = el.closest("[data-at-exportar]");
    if (exportar) {
      const tabela = alvoDe(exportar.dataset.atExportar, exportar);
      if (tabela) exportarCSV(tabela, exportar.dataset.arquivo || "dados.csv");
    }

    // Carrossel
    const passo = el.closest("[data-carrossel]");
    if (passo) {
      const trilho = $(".at-carrossel-trilho", passo.closest("[data-at='carrossel']"));
      if (trilho) {
        const direcao = passo.dataset.carrossel === "proximo" ? 1 : -1;
        trilho.scrollBy({ left: direcao * trilho.clientWidth * 0.9, behavior: "smooth" });
      }
    }

    // Cookies
    const cookie = el.closest("[data-at-cookies]");
    if (cookie) {
      const faixa = cookie.closest("[data-at='cookies']");
      const escolha = cookie.dataset.atCookies;
      const preferencias = {
        necessarios: true,
        analiticos: escolha === "aceitar" || (escolha === "salvar" && Boolean($("[name='analiticos']", faixa)?.checked)),
        marketing: escolha === "aceitar" || (escolha === "salvar" && Boolean($("[name='marketing']", faixa)?.checked)),
        data: new Date().toISOString(),
      };
      armazenamento.gravar("atalho:cookies", preferencias);
      if (faixa && !faixa.classList.contains("at-embutido")) faixa.hidden = true;
      emitir(document, "at:cookies", preferencias);
    }

    // Upload: remover arquivo
    const remover = el.closest("[data-remover-arquivo]");
    if (remover) {
      const lista = remover.closest(".at-upload-lista");
      const area = $$("[data-at='upload']").find((a) => (alvoDe(a.dataset.lista) || a.nextElementSibling) === lista);
      const entrada = area && $("input[type=file]", area);
      if (entrada) {
        const transferencia = new DataTransfer();
        Array.from(entrada.files).forEach((arquivo, i) => {
          if (i !== Number(remover.dataset.removerArquivo)) transferencia.items.add(arquivo);
        });
        entrada.files = transferencia.files;
        mostrarArquivos(entrada);
      }
    }

    // Paleta de comandos: clique em item fecha a paleta
    const itemComando = el.closest(".at-comando .at-comando-item");
    if (itemComando) itemComando.closest("dialog")?.close();
  });

  function ativarAba(aba, focar = false) {
    const lista = aba.closest("[data-at='abas']");
    for (const outra of $$(".at-aba", lista)) {
      const ativa = outra === aba;
      outra.setAttribute("aria-selected", String(ativa));
      outra.tabIndex = ativa ? 0 : -1;
      const painel = alvoDe(outra.getAttribute("aria-controls"));
      if (painel) painel.hidden = !ativa;
    }
    if (focar) aba.focus();
    emitir(aba, "at:aba", { aba, painel: alvoDe(aba.getAttribute("aria-controls")) });
  }

  document.addEventListener("input", (evento) => {
    const el = evento.target;
    if (!(el instanceof HTMLElement)) return;

    if (el.dataset.atMascara) {
      aplicarMascara(el);
      if (el.getAttribute("aria-invalid") === "true") mostrarValidacao(el);
    } else if (el.getAttribute("aria-invalid") === "true" && el.form?.hasAttribute("data-at-validar")) {
      mostrarValidacao(el);
    }

    if (el.hasAttribute("data-at-cep")) buscarCep(el);

    if (el.dataset.atValor && estados.has(el.dataset.atValor.split(".")[0])) {
      const [nome, ...caminho] = el.dataset.atValor.split(".");
      const proxy = estados.get(nome);
      if (caminho.length === 1) proxy[caminho[0]] = el.type === "checkbox" ? el.checked : el.type === "number" ? el.valueAsNumber : el.value;
    }

    if (el.matches("input, select, textarea") && el.dataset.atAcao) executarAcao(el.dataset.atAcao, el, evento);

    const senha = el.closest(".at-senha");
    if (senha) {
      const medidor = senha.parentElement.querySelector(".at-forca");
      const texto = senha.parentElement.querySelector(".at-forca-texto");
      const nivel = forcaDaSenha(el.value);
      if (medidor) medidor.dataset.nivel = String(nivel);
      if (texto) texto.textContent = el.value ? ["", "Fraca", "Razoável", "Boa", "Forte"][nivel] : "";
    }

    const codigo = el.closest("[data-at='codigo']");
    if (codigo) {
      const campos = $$("input", codigo);
      const digitos = somenteDigitos(el.value);
      if (digitos.length > 1) {
        // Colou ou o celular preencheu o código pelo SMS
        campos.forEach((c, i) => (c.value = digitos[i] || ""));
        campos[Math.min(digitos.length, campos.length) - 1].focus();
      } else {
        el.value = digitos;
        if (digitos) campos[campos.indexOf(el) + 1]?.focus();
      }
      codigo.removeAttribute("aria-invalid");
      const valor = campos.map((c) => c.value).join("");
      if (valor.length === campos.length) emitir(codigo, "at:codigo", { valor });
    }

    const comando = el.closest("dialog.at-comando[data-at='comando']");
    if (comando && el.matches("input")) filtrarComando(comando);
  });

  document.addEventListener("change", (evento) => {
    const el = evento.target;
    if (!(el instanceof HTMLElement)) return;
    if (el.matches("[data-at='upload'] input[type=file]")) mostrarArquivos(el);

    if (el.matches("[data-selecionar], [data-selecionar-todos]")) {
      const tabela = el.closest("table");
      if (el.hasAttribute("data-selecionar-todos")) {
        $$("tbody tr:not([hidden]) [data-selecionar]", tabela).forEach((c) => (c.checked = el.checked));
      }
      const marcadas = atualizarSelecao(tabela);
      emitir(tabela, "at:selecao", {
        quantidade: marcadas.length,
        linhas: marcadas.map((c) => c.closest("tr")),
        ids: marcadas.map((c) => c.value),
      });
    }

    if (el.form?.hasAttribute("data-at-validar") && el.matches("select, input[type=checkbox], input[type=radio]")) {
      if (el.getAttribute("aria-invalid") === "true" || el.form.dataset.atTentou != null) mostrarValidacao(el);
    }
  });

  document.addEventListener("focusin", (evento) => {
    if (evento.target instanceof HTMLInputElement && evento.target.closest("[data-at='codigo']")) evento.target.select();
  });

  document.addEventListener("focusout", (evento) => {
    const el = evento.target;
    if (!(el instanceof HTMLElement) || !el.form?.hasAttribute("data-at-validar")) return;
    if (!el.willValidate || el.type === "submit") return;
    // Só reclama depois que a pessoa preencheu algo ou já tentou enviar
    if (el.value || el.form.dataset.atTentou != null) mostrarValidacao(el);
  });

  document.addEventListener("submit", (evento) => {
    const formulario = evento.target;
    if (!(formulario instanceof HTMLFormElement)) return;
    const validarAtivo = formulario.hasAttribute("data-at-validar");
    if (!validarAtivo && !formulario.dataset.atAcao) return;

    if (validarAtivo) {
      formulario.dataset.atTentou = "";
      const invalidos = camposDe(formulario).filter((c) => !mostrarValidacao(c));
      if (invalidos.length) {
        evento.preventDefault();
        invalidos[0].focus();
        emitir(formulario, "at:invalido", { campos: invalidos });
        return;
      }
    }

    const dados = Object.fromEntries(new FormData(formulario));
    for (const campo of $$("[data-at-mascara='moeda']", formulario)) {
      if (campo.name) dados[campo.name] = Number(campo.dataset.atNumero || 0);
    }
    // Sem action: o formulário é tratado em JavaScript (padrão de aplicações modernas)
    if (!formulario.getAttribute("action")) evento.preventDefault();
    emitir(formulario, "at:enviar", { dados, formulario, botao: evento.submitter });
    if (formulario.dataset.atAcao) executarAcao(formulario.dataset.atAcao, formulario, evento, dados);
  });

  document.addEventListener("keydown", (evento) => {
    const el = evento.target instanceof HTMLElement ? evento.target : null;

    // Ctrl+K / ⌘K abre a paleta de comandos marcada com data-at-tecla
    if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
      const paleta = $("dialog.at-comando[data-at-tecla]");
      if (paleta) {
        evento.preventDefault();
        if (paleta.open) paleta.close();
        else {
          paleta.showModal();
          const campo = $("input", paleta);
          if (campo) {
            campo.value = "";
            if (paleta.dataset.at === "comando") filtrarComando(paleta);
            else campo.dispatchEvent(new Event("input", { bubbles: true }));
            campo.focus();
          }
        }
        return;
      }
    }

    // Navegação na paleta de comandos
    const paleta = el?.closest("dialog.at-comando");
    if (paleta && ["ArrowDown", "ArrowUp", "Enter"].includes(evento.key)) {
      const itens = itensComando(paleta);
      const atual = paleta.atIndice || 0;
      if (evento.key === "Enter") {
        if (itens[atual]) {
          evento.preventDefault();
          itens[atual].click();
        }
      } else {
        evento.preventDefault();
        const proximo = evento.key === "ArrowDown" ? Math.min(atual + 1, itens.length - 1) : Math.max(atual - 1, 0);
        selecionarItemComando(paleta, proximo);
      }
      return;
    }

    // Abas: setas, Home e End (padrão WAI-ARIA)
    if (el?.matches("[data-at='abas'] .at-aba")) {
      const abas = $$(".at-aba", el.closest("[data-at='abas']"));
      const i = abas.indexOf(el);
      const mapa = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: abas.length - 1 };
      if (evento.key in mapa) {
        evento.preventDefault();
        ativarAba(abas[(mapa[evento.key] + abas.length) % abas.length], true);
      }
    }

    // Menu suspenso: setas percorrem os itens
    const menu = el?.closest(".at-menu");
    if (menu && ["ArrowDown", "ArrowUp", "Home", "End"].includes(evento.key)) {
      evento.preventDefault();
      const itens = $$(".at-menu-item:not([disabled])", menu);
      const i = itens.indexOf(document.activeElement);
      const destino = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: itens.length - 1 }[evento.key];
      itens[(destino + itens.length) % itens.length]?.focus();
    }

    // Código: apagar volta para o campo anterior
    if (el?.closest("[data-at='codigo']") && evento.key === "Backspace" && !el.value) {
      const campos = $$("input", el.closest("[data-at='codigo']"));
      campos[campos.indexOf(el) - 1]?.focus();
    }

    // Kanban: Alt + setas move o cartão entre colunas (alternativa ao arrastar)
    if (el?.matches(".at-kanban-cartao") && evento.altKey && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(evento.key)) {
      evento.preventDefault();
      const coluna = el.closest(".at-kanban-coluna");
      const colunas = $$(".at-kanban-coluna", el.closest("[data-at='kanban']"));
      if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
        const destino = colunas[colunas.indexOf(coluna) + (evento.key === "ArrowRight" ? 1 : -1)];
        if (destino) moverCartao(el, $(".at-kanban-lista", destino));
      } else {
        if (evento.key === "ArrowUp" && el.previousElementSibling) moverCartao(el, el.parentElement, el.previousElementSibling);
        if (evento.key === "ArrowDown" && el.nextElementSibling) moverCartao(el, el.parentElement, el.nextElementSibling.nextElementSibling);
      }
      el.focus();
    }
  });

  document.addEventListener("paste", (evento) => {
    const codigo = evento.target instanceof Element && evento.target.closest("[data-at='codigo']");
    if (!codigo) return;
    const digitos = somenteDigitos(evento.clipboardData?.getData("text"));
    if (!digitos) return;
    evento.preventDefault();
    const campos = $$("input", codigo);
    campos.forEach((c, i) => (c.value = digitos[i] || ""));
    campos[Math.min(digitos.length, campos.length) - 1].focus();
    const valor = campos.map((c) => c.value).join("");
    if (valor.length === campos.length) emitir(codigo, "at:codigo", { valor });
  });

  // Menus suspensos e balões: posiciona ao abrir e acompanha rolagem
  document.addEventListener("toggle", (evento) => {
    const popover = evento.target;
    if (!(popover instanceof HTMLElement)) return;
    if (evento.newState !== "open") {
      delete popover.dataset.posicionado;
      return;
    }
    if (popover.matches(".at-menu, .at-balao")) {
      posicionarPopover(popover);
      // O CSS esconde até aqui: evita o "pulo" do canto da tela até o botão
      popover.dataset.posicionado = "";
    }
    if (popover.classList.contains("at-menu")) $(".at-menu-item", popover)?.focus({ preventScroll: true });
  }, true);

  const reposicionar = () => popoversAbertos().forEach(posicionarPopover);
  addEventListener("scroll", reposicionar, { passive: true, capture: true });
  addEventListener("resize", reposicionar, { passive: true });

  // Arrastar e soltar: kanban e upload
  document.addEventListener("dragstart", (evento) => {
    const cartao = evento.target instanceof Element && evento.target.closest(".at-kanban-cartao");
    if (!cartao) return;
    cartaoArrastado = cartao;
    cartao.dataset.arrastando = "";
    evento.dataTransfer.effectAllowed = "move";
    evento.dataTransfer.setData("text/plain", cartao.dataset.id || "");
  });

  document.addEventListener("dragend", () => {
    if (cartaoArrastado) delete cartaoArrastado.dataset.arrastando;
    cartaoArrastado = null;
    $$("[data-sobre]").forEach((l) => delete l.dataset.sobre);
  });

  document.addEventListener("dragover", (evento) => {
    const el = evento.target instanceof Element ? evento.target : null;
    const lista = el?.closest(".at-kanban-lista");
    if (lista && cartaoArrastado) {
      evento.preventDefault();
      $$("[data-sobre]").forEach((l) => l !== lista && delete l.dataset.sobre);
      lista.dataset.sobre = "";
    }
    const area = el?.closest("[data-at='upload']");
    if (area && evento.dataTransfer?.types.includes("Files")) {
      evento.preventDefault();
      area.dataset.arrastando = "";
    }
  });

  document.addEventListener("dragleave", (evento) => {
    const area = evento.target instanceof Element && evento.target.closest("[data-at='upload']");
    if (area && !area.contains(evento.relatedTarget)) delete area.dataset.arrastando;
  });

  document.addEventListener("drop", (evento) => {
    const el = evento.target instanceof Element ? evento.target : null;
    const lista = el?.closest(".at-kanban-lista");
    if (lista && cartaoArrastado) {
      evento.preventDefault();
      moverCartao(cartaoArrastado, lista, posicaoDeInsercao(lista, evento.clientY));
    }
    const area = el?.closest("[data-at='upload']");
    if (area && evento.dataTransfer?.files.length) {
      evento.preventDefault();
      delete area.dataset.arrastando;
      const entrada = $("input[type=file]", area);
      if (entrada) {
        const transferencia = new DataTransfer();
        const aceitos = Array.from(evento.dataTransfer.files).filter((f) => !entrada.accept || aceitaArquivo(f, entrada.accept));
        (entrada.multiple ? aceitos : aceitos.slice(0, 1)).forEach((f) => transferencia.items.add(f));
        entrada.files = transferencia.files;
        mostrarArquivos(entrada);
      }
    }
  });

  function aceitaArquivo(arquivo, accept) {
    return accept.split(",").map((s) => s.trim().toLowerCase()).some((regra) => {
      if (regra.startsWith(".")) return arquivo.name.toLowerCase().endsWith(regra);
      if (regra.endsWith("/*")) return arquivo.type.startsWith(regra.slice(0, -1));
      return arquivo.type === regra;
    });
  }

  /* ------------------------------------------------------------------------
     Componentes da versão 1.1
     ------------------------------------------------------------------------ */

  let contadorIds = 0;
  const novoId = (prefixo) => `${prefixo}-${++contadorIds}-${Math.random().toString(36).slice(2, 6)}`;

  // Autocompletar (combobox com lista de sugestões)
  function itensVisiveis(caixa) {
    return $$(".at-sugestoes > li[role=option]:not([hidden])", caixa);
  }

  function marcarSugestao(caixa, indice) {
    const itens = itensVisiveis(caixa);
    const campo = $("input", caixa);
    itens.forEach((li, i) => li.setAttribute("aria-selected", String(i === indice)));
    caixa.atIndice = indice;
    if (itens[indice]) {
      campo.setAttribute("aria-activedescendant", itens[indice].id);
      itens[indice].scrollIntoView({ block: "nearest" });
    } else {
      campo.removeAttribute("aria-activedescendant");
    }
  }

  function filtrarSugestoes(caixa) {
    const campo = $("input", caixa);
    const lista = $(".at-sugestoes", caixa);
    const termo = normalizar(campo.value);
    let visiveis = 0;
    for (const li of $$(":scope > li[role=option]", lista)) {
      const mostrar = !termo || normalizar(`${li.textContent} ${li.dataset.palavras || ""}`).includes(termo);
      li.hidden = !mostrar;
      if (mostrar) visiveis++;
    }
    let vazio = $(".at-sugestoes-vazio", lista);
    if (!visiveis) {
      if (!vazio) {
        vazio = document.createElement("li");
        vazio.className = "at-sugestoes-vazio";
        vazio.textContent = caixa.dataset.msgVazia || "Nada encontrado.";
        lista.append(vazio);
      }
      vazio.hidden = false;
    } else if (vazio) {
      vazio.hidden = true;
    }
    abrirSugestoes(caixa, true);
    marcarSugestao(caixa, visiveis ? 0 : -1);
  }

  function abrirSugestoes(caixa, abrir) {
    const lista = $(".at-sugestoes", caixa);
    lista.hidden = !abrir;
    $("input", caixa).setAttribute("aria-expanded", String(abrir));
  }

  function escolherSugestao(caixa, li) {
    const campo = $("input", caixa);
    campo.value = li.dataset.valor ?? li.textContent.trim();
    abrirSugestoes(caixa, false);
    campo.focus();
    campo.dispatchEvent(new Event("change", { bubbles: true }));
    emitir(caixa, "at:selecionar", { valor: campo.value, texto: li.textContent.trim(), item: li });
  }

  // Quantidade
  function ajustarQuantidade(grupo, passo) {
    const campo = $("input", grupo);
    const minimo = campo.min === "" ? -Infinity : Number(campo.min);
    const maximo = campo.max === "" ? Infinity : Number(campo.max);
    const atual = Number(campo.value) || 0;
    const novo = Math.min(maximo, Math.max(minimo, atual + passo * (Number(campo.step) || 1)));
    if (novo !== atual) {
      campo.value = String(novo);
      campo.dispatchEvent(new Event("input", { bubbles: true }));
      campo.dispatchEvent(new Event("change", { bubbles: true }));
    }
    atualizarQuantidade(grupo);
  }

  function atualizarQuantidade(grupo) {
    const campo = $("input", grupo);
    const valor = Number(campo.value) || 0;
    $$("[data-passo]", grupo).forEach((botao) => {
      const passo = Number(botao.dataset.passo);
      botao.disabled = (passo < 0 && campo.min !== "" && valor <= Number(campo.min)) || (passo > 0 && campo.max !== "" && valor >= Number(campo.max));
    });
  }

  // Contador de caracteres
  function atualizarContagem(campo) {
    const maximo = campo.maxLength > 0 ? campo.maxLength : Number(campo.dataset.atContar) || 0;
    let contagem = campo.id ? $(`[data-contagem-de="${CSS.escape(campo.id)}"]`) : null;
    if (!contagem) {
      contagem = campo.atContagem;
      if (!contagem) {
        contagem = document.createElement("span");
        contagem.className = "at-contagem";
        contagem.setAttribute("aria-live", "polite");
        campo.after(contagem);
        campo.atContagem = contagem;
      }
    }
    const usados = campo.value.length;
    contagem.textContent = maximo ? `${usados}/${maximo}` : String(usados);
    contagem.dataset.estado = maximo && usados >= maximo ? "cheio" : maximo && usados >= maximo * 0.9 ? "perto" : "";
  }

  // Faixa de valores
  function atualizarFaixa(faixa) {
    const minimo = Number(faixa.min) || 0;
    const maximo = Number(faixa.max) || 100;
    faixa.style.setProperty("--_progresso", `${((Number(faixa.value) - minimo) / (maximo - minimo)) * 100}%`);
    if (faixa.id) {
      for (const saida of $$(`output[for~="${CSS.escape(faixa.id)}"]`)) {
        saida.textContent = aplicarFormato(Number(faixa.value), faixa.dataset.atFormato || saida.dataset.atFormato);
      }
    }
  }

  // Etiquetas
  function sincronizarEtiquetas(caixa) {
    const valores = $$(".at-etiqueta", caixa).map((e) => e.dataset.valor);
    let escondido = $("input[type=hidden]", caixa);
    if (!escondido && caixa.dataset.nome) {
      escondido = document.createElement("input");
      escondido.type = "hidden";
      escondido.name = caixa.dataset.nome;
      caixa.append(escondido);
    }
    if (escondido) escondido.value = valores.join(",");
    emitir(caixa, "at:etiquetas", { lista: valores });
  }

  function adicionarEtiqueta(caixa, texto) {
    const valor = texto.trim().replace(/,$/, "").trim();
    if (!valor) return;
    const existentes = $$(".at-etiqueta", caixa).map((e) => normalizar(e.dataset.valor));
    const maximo = Number(caixa.dataset.maximo) || Infinity;
    if (existentes.includes(normalizar(valor)) || existentes.length >= maximo) return;
    const etiqueta = document.createElement("span");
    etiqueta.className = "at-etiqueta";
    etiqueta.dataset.valor = valor;
    etiqueta.append(valor + " ");
    const remover = document.createElement("button");
    remover.type = "button";
    remover.dataset.atFechar = "";
    remover.setAttribute("aria-label", `Remover ${valor}`);
    remover.textContent = "×";
    etiqueta.append(remover);
    $("input:not([type=hidden])", caixa).before(etiqueta);
    sincronizarEtiquetas(caixa);
  }

  // Galeria com tela cheia
  let visualizador;
  function abrirGaleria(galeria, indice) {
    const fotos = $$(":scope > a", galeria);
    if (!visualizador) {
      visualizador = document.createElement("dialog");
      visualizador.className = "at-visualizador";
      visualizador.setAttribute("aria-label", "Visualizador de imagens");
      visualizador.innerHTML = `<div class="at-visualizador-topo"><span data-posicao aria-live="polite"></span><button type="button" data-at-fechar aria-label="Fechar">×</button></div>
        <figure><img alt=""></figure>
        <div class="at-visualizador-rodape"><button type="button" data-ver="-1" aria-label="Imagem anterior">‹</button><span data-legenda></span><button type="button" data-ver="1" aria-label="Próxima imagem">›</button></div>`;
      document.body.append(visualizador);
      visualizador.addEventListener("click", (e) => {
        const passo = e.target.closest("[data-ver]");
        if (passo) mostrarFoto(Number(passo.dataset.ver));
        else if (e.target.matches("figure")) visualizador.close();
      });
      visualizador.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") mostrarFoto(1);
        if (e.key === "ArrowLeft") mostrarFoto(-1);
      });
    }
    function mostrarFoto(passo = 0) {
      visualizador.atIndice = (visualizador.atIndice + passo + fotos.length) % fotos.length;
      const link = fotos[visualizador.atIndice];
      const miniatura = $("img", link);
      const imagem = $("img", visualizador);
      imagem.src = link.href;
      imagem.alt = miniatura?.alt || "";
      $("[data-legenda]", visualizador).textContent = link.dataset.legenda || miniatura?.alt || "";
      $("[data-posicao]", visualizador).textContent = `${visualizador.atIndice + 1} de ${fotos.length}`;
    }
    visualizador.atIndice = indice;
    mostrarFoto(0);
    visualizador.showModal();
  }

  // Vídeo leve do YouTube
  function idDoYoutube(endereco) {
    const casou = String(endereco).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    return casou ? casou[1] : null;
  }

  // Contagem regressiva
  const contagens = new Set();
  function atualizarContagemRegressiva(caixa) {
    const fim = new Date(caixa.dataset.ate).getTime();
    const restante = Math.max(0, fim - Date.now());
    const partes = {
      dias: Math.floor(restante / 86400000),
      horas: Math.floor((restante % 86400000) / 3600000),
      minutos: Math.floor((restante % 3600000) / 60000),
      segundos: Math.floor((restante % 60000) / 1000),
    };
    for (const [chave, valor] of Object.entries(partes)) {
      const alvo = $(`[data-parte="${chave}"] strong`, caixa);
      if (alvo) alvo.textContent = String(valor).padStart(2, "0");
    }
    caixa.setAttribute("aria-label", `Faltam ${partes.dias} dias, ${partes.horas} horas e ${partes.minutos} minutos`);
    if (!restante) {
      contagens.delete(caixa);
      if (caixa.dataset.textoFim) caixa.textContent = caixa.dataset.textoFim;
      emitir(caixa, "at:fim", {});
    }
  }

  setInterval(() => {
    for (const caixa of contagens) {
      if (!caixa.isConnected) contagens.delete(caixa);
      else atualizarContagemRegressiva(caixa);
    }
  }, 1000);

  // Voltar ao topo
  const botoesTopo = new Set();
  addEventListener("scroll", () => {
    for (const botao of botoesTopo) {
      if (!botao.isConnected) botoesTopo.delete(botao);
      else botao.toggleAttribute("data-visivel", scrollY > (Number(botao.dataset.depois) || 600));
    }
  }, { passive: true });

  // Carregar mais
  const observadorCarregar = "IntersectionObserver" in window
    ? new IntersectionObserver((entradas) => {
        for (const entrada of entradas) {
          const alvo = entrada.target;
          if (entrada.isIntersecting && !alvo.hidden && alvo.getAttribute("aria-busy") !== "true") emitir(alvo, "at:carregar", {});
        }
      }, { rootMargin: "300px" })
    : null;

  Object.assign(componentes, {
    /** Índice que acompanha a leitura (scrollspy): marca o link da seção visível. */
    indice(nav) {
      const links = $$('a[href^="#"]', nav).filter((a) => a.hash.length > 1);
      const secoes = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
      if (!secoes.length || !("IntersectionObserver" in window)) return;
      const marcar = (id) =>
        links.forEach((a) => {
          if (decodeURIComponent(a.hash.slice(1)) === id) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
      // Seções dentro de uma caixa com rolagem própria: observa a caixa, não a página
      const rolavel = (el) => {
        for (let pai = el.parentElement; pai && pai !== document.body; pai = pai.parentElement) {
          const estilo = getComputedStyle(pai).overflowY;
          if ((estilo === "auto" || estilo === "scroll") && pai.scrollHeight > pai.clientHeight) return pai;
        }
        return null;
      };
      const raiz = nav.dataset.raiz ? $(nav.dataset.raiz) : rolavel(secoes[0]);
      const visiveis = new Map();
      const observador = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((e) => (e.isIntersecting ? visiveis.set(e.target.id, e.boundingClientRect.top) : visiveis.delete(e.target.id)));
          // A seção mais alta entre as visíveis é a "atual"
          const atual = [...visiveis.entries()].sort((a, b) => a[1] - b[1])[0];
          if (atual) marcar(atual[0]);
        },
        { root: raiz, rootMargin: nav.dataset.margem || "-20% 0px -60% 0px" }
      );
      secoes.forEach((s) => observador.observe(s));
      nav.addEventListener("click", (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link) marcar(decodeURIComponent(link.hash.slice(1)));
      });
    },

    autocompletar(caixa) {
      const campo = $("input", caixa);
      const lista = $(".at-sugestoes", caixa);
      if (!campo || !lista) return;
      lista.id ||= novoId("at-sugestoes");
      lista.setAttribute("role", "listbox");
      lista.hidden = true;
      $$(":scope > li", lista).forEach((li) => {
        li.setAttribute("role", "option");
        li.id ||= novoId("at-opcao");
      });
      campo.setAttribute("role", "combobox");
      campo.setAttribute("aria-autocomplete", "list");
      campo.setAttribute("aria-controls", lista.id);
      campo.setAttribute("aria-expanded", "false");
      campo.autocomplete = "off";
    },
    quantidade(grupo) {
      const campo = $("input", grupo);
      if (!campo) return;
      campo.inputMode = "numeric";
      $$("[data-passo]", grupo).forEach((botao) => {
        botao.type = "button";
        if (!botao.getAttribute("aria-label")) botao.setAttribute("aria-label", Number(botao.dataset.passo) > 0 ? "Aumentar" : "Diminuir");
      });
      atualizarQuantidade(grupo);
    },
    etiquetas(caixa) {
      const campo = $("input:not([type=hidden])", caixa);
      if (campo && !campo.getAttribute("aria-label")) campo.setAttribute("aria-label", "Adicionar etiqueta (Enter para confirmar)");
      for (const valor of (caixa.dataset.valores || "").split(",").filter(Boolean)) adicionarEtiqueta(caixa, valor);
      sincronizarEtiquetas(caixa);
    },
    galeria() {},
    video(link) {
      const id = idDoYoutube(link.href);
      if (id && !link.style.backgroundImage) link.style.backgroundImage = `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`;
      if (!link.getAttribute("aria-label")) link.setAttribute("aria-label", `Assistir ao vídeo: ${link.textContent.trim() || "vídeo"}`);
    },
    contagem(caixa) {
      if (!caixa.children.length) {
        caixa.innerHTML = ["dias", "horas", "minutos", "segundos"]
          .map((p) => `<span data-parte="${p}"><strong>00</strong><small>${p}</small></span>`)
          .join("");
      }
      caixa.setAttribute("role", "timer");
      contagens.add(caixa);
      atualizarContagemRegressiva(caixa);
    },
    "voltar-topo"(botao) {
      botoesTopo.add(botao);
      botao.toggleAttribute("data-visivel", scrollY > (Number(botao.dataset.depois) || 600));
    },
    "carregar-mais"(alvo) {
      observadorCarregar?.observe(alvo);
    },
  });

  document.addEventListener("input", (evento) => {
    const el = evento.target;
    if (!(el instanceof HTMLElement)) return;
    const caixa = el.closest("[data-at='autocompletar']");
    if (caixa && el.matches("input")) filtrarSugestoes(caixa);
    if (el.matches(".at-faixa-entrada")) atualizarFaixa(el);
    if (el.hasAttribute("data-at-contar")) atualizarContagem(el);
    const grupo = el.closest("[data-at='quantidade']");
    if (grupo) atualizarQuantidade(grupo);
  });

  document.addEventListener("click", (evento) => {
    const el = evento.target instanceof Element ? evento.target : null;
    if (!el) return;

    const opcao = el.closest("[data-at='autocompletar'] .at-sugestoes > li[role=option]");
    if (opcao) escolherSugestao(opcao.closest("[data-at='autocompletar']"), opcao);
    for (const caixa of $$("[data-at='autocompletar']")) {
      if (!caixa.contains(el)) abrirSugestoes(caixa, false);
    }

    const passo = el.closest("[data-at='quantidade'] [data-passo]");
    if (passo) ajustarQuantidade(passo.closest("[data-at='quantidade']"), Number(passo.dataset.passo));

    const etiquetas = el.closest("[data-at='etiquetas']");
    if (etiquetas) {
      if (el.closest("[data-at-fechar]")) queueMicrotask(() => sincronizarEtiquetas(etiquetas));
      else if (el === etiquetas) $("input:not([type=hidden])", etiquetas)?.focus();
    }

    const foto = el.closest("[data-at='galeria'] > a");
    if (foto) {
      evento.preventDefault();
      abrirGaleria(foto.parentElement, $$(":scope > a", foto.parentElement).indexOf(foto));
    }

    const video = el.closest("a[data-at='video']");
    if (video && !video.dataset.carregado) {
      const id = idDoYoutube(video.href);
      if (id) {
        evento.preventDefault();
        const iframe = document.createElement("iframe");
        // youtube-nocookie: o YouTube só grava cookies depois que a pessoa decide assistir
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        iframe.title = video.getAttribute("aria-label") || "Vídeo";
        iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
        iframe.allowFullscreen = true;
        video.dataset.carregado = "";
        video.append(iframe);
      }
    }

    const topo = el.closest("[data-at='voltar-topo']");
    if (topo) {
      evento.preventDefault();
      scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      const alvo = $("h1, main") || document.body;
      if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
      alvo.focus({ preventScroll: true });
    }

    const mais = el.closest("[data-at='carregar-mais'] button");
    if (mais) emitir(mais.closest("[data-at='carregar-mais']"), "at:carregar", {});
  });

  document.addEventListener("keydown", (evento) => {
    const el = evento.target instanceof HTMLElement ? evento.target : null;
    const caixa = el?.closest("[data-at='autocompletar']");
    if (caixa && el.matches("input")) {
      const itens = itensVisiveis(caixa);
      const aberto = !$(".at-sugestoes", caixa).hidden;
      if (evento.key === "ArrowDown") {
        evento.preventDefault();
        if (!aberto) filtrarSugestoes(caixa);
        else marcarSugestao(caixa, Math.min((caixa.atIndice ?? -1) + 1, itens.length - 1));
      } else if (evento.key === "ArrowUp" && aberto) {
        evento.preventDefault();
        marcarSugestao(caixa, Math.max((caixa.atIndice ?? 0) - 1, 0));
      } else if (evento.key === "Enter" && aberto && itens[caixa.atIndice]) {
        evento.preventDefault();
        escolherSugestao(caixa, itens[caixa.atIndice]);
      } else if (evento.key === "Escape" && aberto) {
        evento.preventDefault();
        abrirSugestoes(caixa, false);
      }
    }

    const etiquetas = el?.closest("[data-at='etiquetas']");
    if (etiquetas && el.matches("input:not([type=hidden])")) {
      if (evento.key === "Enter" || evento.key === ",") {
        evento.preventDefault();
        adicionarEtiqueta(etiquetas, el.value);
        el.value = "";
      } else if (evento.key === "Backspace" && !el.value) {
        const ultima = $$(".at-etiqueta", etiquetas).pop();
        if (ultima) {
          ultima.remove();
          sincronizarEtiquetas(etiquetas);
        }
      }
    }
  });

  /* ------------------------------------------------------------------------
     Partida
     ------------------------------------------------------------------------ */

  function comecar() {
    iniciar(document);
    $$("[data-at-tema]").forEach((b) => b.setAttribute("aria-pressed", temaAtual() === "escuro" ? "true" : "false"));
    new MutationObserver((mutacoes) => {
      for (const mutacao of mutacoes) {
        for (const no of mutacao.addedNodes) {
          if (no instanceof Element && !no.closest("[data-at-lista]")) iniciar(no);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
    emitir(document, "at:pronto", { versao: Atalho.versao });
  }

  const Atalho = {
    versao: "1.2.0",
    estado,
    observar,
    obterEstado: (nome) => estados.get(nome),
    notificar,
    formatar,
    validar,
    requisitar,
    iniciar,
    exportarCSV,
    definirTema,
    temaAtual,
    normalizar,
  };

  window.Atalho = Atalho;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", comecar, { once: true });
  else comecar();
})();
