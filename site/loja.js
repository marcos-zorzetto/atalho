/*
 * Loja do Atalho: assinatura Pro e compras avulsas, cobradas pela Lemon Squeezy.
 * Carregado em /pro/, /conta/ e nas vitrines /exemplos/<id>/.
 *
 * Fluxo: botão [data-comprar="produto"] → (entrar na conta, se precisar) →
 * consentimento sobre o direito de desistência → checkout da Lemon Squeezy com o
 * id da conta em checkout[custom][usuario_id] → webhook grava no banco → acesso liberado.
 *
 * Segurança: este arquivo só LÊ o que é da própria pessoa (as regras do banco
 * garantem). Liberar acesso só acontece pelo webhook, com a assinatura conferida.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { ativo, cliente, traduzir, notificar, usuario: usuarioAtual, linkConta } = window.AtalhoSupabase;
  const links = ((window.ATALHO_CONFIG || {}).pagamentos || {}).links || {};
  const base = document.body.dataset.base || "/";
  const pagina = document.body.dataset.pagina;

  const euro = (centavos) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "EUR" }).format(centavos / 100).replace(/,00$/, "");
  const data = (texto) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(texto));

  /** Só aceita checkout e portal da própria Lemon Squeezy, em https. */
  function enderecoLemon(texto) {
    try {
      const endereco = new URL(texto);
      return endereco.protocol === "https:" && /(^|\.)lemonsqueezy\.com$/.test(endereco.hostname) ? endereco : null;
    } catch {
      return null;
    }
  }

  const vendendo = (produto) => ativo && Boolean(enderecoLemon(links[produto] || ""));
  const ATIVOS = ["on_trial", "active", "past_due"];
  const daAcesso = (a) => ATIVOS.includes(a.status) || (a.status === "cancelled" && a.termina_em && new Date(a.termina_em) > new Date());

  /** O que a pessoa conectada tem: assinatura que dá acesso e compras não reembolsadas. */
  async function situacao() {
    const pessoa = ativo ? await usuarioAtual() : null;
    if (!pessoa) return { pessoa: null, pro: null, assinaturas: [], compras: [] };
    const [{ data: assinaturas = [] }, { data: compras = [] }] = await Promise.all([
      cliente.from("assinaturas").select("id, produto_id, status, renova_em, termina_em, portal_url").order("atualizado_em", { ascending: false }),
      cliente.from("compras").select("produto_id, criado_em, produtos(nome)").eq("reembolsada", false).order("criado_em", { ascending: false }),
    ]);
    return { pessoa, pro: (assinaturas || []).find(daAcesso) || null, assinaturas: assinaturas || [], compras: compras || [] };
  }

  /* ------------------------------------------------------------------------
     Compra
     ------------------------------------------------------------------------ */

  let produtos = null;
  async function produto(id) {
    if (!produtos) {
      const { data: linhas } = await cliente.from("produtos").select("id, tipo, nome, preco_centavos, intervalo");
      produtos = new Map((linhas || []).map((p) => [p.id, p]));
    }
    return produtos.get(id);
  }

  function dialogoConsentimento() {
    let dialogo = $("#modal-compra");
    if (dialogo) return dialogo;
    dialogo = document.createElement("dialog");
    dialogo.className = "at-modal at-pequeno";
    dialogo.id = "modal-compra";
    dialogo.setAttribute("aria-labelledby", "compra-titulo");
    dialogo.innerHTML = `
      <form method="dialog" class="at-modal-corpo at-pilha" id="form-compra">
        <h3 class="at-titulo-4" id="compra-titulo">Antes de ir para o pagamento</h3>
        <p class="at-mb-0"><strong data-compra-nome></strong> · <span data-compra-preco></span></p>
        <label class="at-check"><input type="checkbox" name="imediato" required data-compra-consentimento>
          <span>Quero acesso imediato ao conteúdo digital e reconheço que, ao recebê-lo, perco o direito de desistência de 14 dias.</span></label>
        <p class="at-texto-suave at-texto-pequeno at-mb-0">O pagamento é feito na Lemon Squeezy, revendedora oficial do Atalho: ela cobra, recolhe o IVA e envia a fatura. Ao continuar, você aceita os <a href="${base}termos/#venda">termos de venda</a>.</p>
        <div class="at-linha at-fim">
          <button class="at-botao at-fantasma" value="cancelar" formnovalidate>Cancelar</button>
          <button class="at-botao at-primario" value="pagar" data-compra-pagar disabled>Ir para o pagamento</button>
        </div>
      </form>`;
    document.body.append(dialogo);
    const caixa = $("[data-compra-consentimento]", dialogo);
    caixa.addEventListener("change", () => ($("[data-compra-pagar]", dialogo).disabled = !caixa.checked));
    return dialogo;
  }

  async function comprar(id, botao) {
    if (!vendendo(id)) {
      const lista = $("[data-lista-espera]");
      if (lista) {
        lista.hidden = false;
        lista.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        location.href = `${base}pro/#lista-espera`;
      }
      return notificar("Os pagamentos abrem em breve. Entre na lista para ser avisado.", "info");
    }
    const pessoa = await usuarioAtual();
    if (!pessoa) {
      notificar("Entre ou crie sua conta grátis para que a compra fique ligada a ela.", "info");
      return setTimeout(() => (location.href = linkConta({ criar: true })), 900);
    }
    botao?.setAttribute("aria-busy", "true");
    const item = await produto(id).catch(() => null);
    botao?.removeAttribute("aria-busy");
    const dialogo = dialogoConsentimento();
    $("[data-compra-nome]", dialogo).textContent = item?.nome || "Atalho Pro";
    $("[data-compra-preco]", dialogo).textContent = item
      ? `${euro(item.preco_centavos)}${item.intervalo === "mes" ? " por mês" : item.intervalo === "ano" ? " por ano" : ", pagamento único"}`
      : "";
    $("[data-compra-consentimento]", dialogo).checked = false;
    $("[data-compra-pagar]", dialogo).disabled = true;
    dialogo.returnValue = "";
    dialogo.onclose = () => {
      if (dialogo.returnValue !== "pagar") return;
      const destino = enderecoLemon(links[id]);
      // Só o id da conta vai no endereço (nada de e-mail ou nome): o webhook usa para liberar o acesso
      destino.searchParams.set("checkout[custom][usuario_id]", pessoa.id);
      location.href = destino.href;
    };
    dialogo.showModal();
  }

  document.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-comprar]");
    if (!botao) return;
    evento.preventDefault();
    comprar(botao.dataset.comprar, botao).catch((erro) => {
      console.error(erro);
      notificar(traduzir(erro), "perigo");
    });
  });

  /* ------------------------------------------------------------------------
     /pro/: plano atual e aviso de "em breve"
     ------------------------------------------------------------------------ */

  async function iniciarPrecos() {
    window.Atalho?.estado?.("precos", { anual: false });
    const algumAVenda = vendendo("pro-mensal") || vendendo("pro-anual");
    if (!algumAVenda) {
      $("[data-lista-espera]").hidden = false;
      const aviso = $("[data-loja-aviso]");
      aviso.textContent = "Os pagamentos abrem em breve. Até lá, entre na lista de espera no fim da página para receber o preço de pré-venda.";
      aviso.hidden = false;
      for (const botao of $$("[data-comprar]")) botao.textContent = "Entrar na lista de espera";
    }
    const { pessoa, pro } = await situacao();
    if (!pessoa) return;
    for (const link of $$("[data-plano-membro]")) {
      link.textContent = "Você já é membro";
      link.href = `${base}exemplos/`;
    }
    if (pro) {
      $("[data-loja-plano-atual]").hidden = false;
      for (const botao of $$("[data-comprar^='pro-']")) {
        botao.textContent = "Seu plano atual";
        botao.disabled = true;
      }
    }
  }

  /* ------------------------------------------------------------------------
     /conta/: seu plano, compras e volta do pagamento
     ------------------------------------------------------------------------ */

  function textoAssinatura(a) {
    const intervalo = a.produto_id === "pro-anual" ? "anual" : "mensal";
    if (a.status === "past_due") return { titulo: `Atalho Pro ${intervalo}`, detalhe: "Não conseguimos cobrar a última renovação. Atualize o cartão para não perder o acesso.", tipo: "aviso" };
    if (a.status === "cancelled") return { titulo: `Atalho Pro ${intervalo} (cancelado)`, detalhe: `Seu acesso continua até ${data(a.termina_em)}.`, tipo: "info" };
    if (a.status === "on_trial") return { titulo: `Atalho Pro ${intervalo} (teste grátis)`, detalhe: a.renova_em ? `A primeira cobrança é em ${data(a.renova_em)}.` : "", tipo: "sucesso" };
    return { titulo: `Atalho Pro ${intervalo}`, detalhe: a.renova_em ? `Renova em ${data(a.renova_em)}.` : "Assinatura ativa.", tipo: "sucesso" };
  }

  function desenharPlano({ pro, compras }) {
    const caixa = $("[data-conta-plano]");
    if (!caixa) return;
    caixa.textContent = "";
    const cartao = document.createElement("div");
    cartao.className = "at-cartao";
    const corpo = document.createElement("div");
    corpo.className = "at-cartao-corpo at-linha at-entre";
    const texto = document.createElement("div");
    const titulo = document.createElement("strong");
    const detalhe = document.createElement("div");
    detalhe.className = "at-texto-suave at-texto-pequeno";
    texto.append(titulo, detalhe);
    corpo.append(texto);
    if (pro) {
      const t = textoAssinatura(pro);
      titulo.textContent = t.titulo;
      detalhe.textContent = t.detalhe;
      const portal = enderecoLemon(pro.portal_url || "");
      if (portal) {
        const link = Object.assign(document.createElement("a"), { className: `at-botao${t.tipo === "aviso" ? " at-primario" : ""}`, href: portal.href, rel: "noopener", textContent: t.tipo === "aviso" ? "Atualizar pagamento" : "Gerenciar assinatura" });
        corpo.append(link);
      }
    } else {
      titulo.textContent = "Membro (grátis)";
      detalhe.textContent = "Você tem as páginas completas grátis. O Pro libera todas as páginas e modelos Pro.";
      corpo.append(Object.assign(document.createElement("a"), { className: "at-botao at-primario", href: `${base}pro/`, textContent: "Conhecer o Pro" }));
    }
    cartao.append(corpo);
    caixa.append(cartao);
    if (compras.length) {
      const lista = document.createElement("ul");
      lista.className = "site-conta-compras";
      for (const c of compras) {
        const li = document.createElement("li");
        li.textContent = `${c.produtos?.nome || c.produto_id} · comprado em ${data(c.criado_em)}`;
        lista.append(li);
      }
      const rotulo = Object.assign(document.createElement("p"), { className: "at-texto-pequeno at-mt-4 at-mb-0", textContent: "Compras avulsas (suas para sempre):" });
      caixa.append(rotulo, lista);
    }
  }

  async function iniciarConta() {
    if (!ativo) return;
    // Pagamentos no ar: a lista de espera do Pro deixa de fazer sentido
    if (vendendo("pro-mensal") || vendendo("pro-anual")) $("[data-conta-lista-bloco]")?.setAttribute("hidden", "");
    let atual = await situacao();
    if (!atual.pessoa) return;
    desenharPlano(atual);
    // Voltou do pagamento: o aviso da Lemon Squeezy leva alguns segundos para chegar
    if (new URLSearchParams(location.search).get("pagamento") === "ok") {
      notificar("Pagamento recebido! Liberando seu acesso…", "sucesso", { duracao: 8000 });
      const antes = atual.compras.length;
      for (let tentativa = 0; tentativa < 15 && !atual.pro && atual.compras.length === antes; tentativa++) {
        await new Promise((ok) => setTimeout(ok, 2000));
        atual = await situacao();
      }
      desenharPlano(atual);
      history.replaceState(null, "", location.pathname);
      if (atual.pro || atual.compras.length > antes) notificar("Acesso liberado. Bom proveito!", "sucesso");
      else notificar("O pagamento ainda está sendo confirmado. Atualize a página em alguns minutos.", "info", { duracao: 10000 });
    }
  }

  window.AtalhoLoja = { situacao, comprar, vendendo };

  const iniciar = pagina === "pro" ? iniciarPrecos : pagina === "conta" ? iniciarConta : null;
  iniciar?.().catch((erro) => {
    console.error(erro);
    notificar(traduzir(erro), "perigo");
  });
})();
