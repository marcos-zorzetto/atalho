/*
 * Loja do Atalho: assinatura Pro e compras avulsas, cobradas pela Revolut Business
 * (o dinheiro entra diretamente na conta Revolut).
 * Carregado em /pro/, /conta/ e nas vitrines /exemplos/<id>/.
 *
 * Fluxo: botão [data-comprar="produto"] → (entrar na conta, se precisar) →
 * consentimento sobre o direito de desistência → função revolut-loja do Supabase
 * (cria a subscrição ou o pedido com o id da conta) → página de pagamento da
 * Revolut → webhook revolut-webhook grava no banco → acesso libertado.
 *
 * Segurança: este ficheiro só LÊ o que é da própria pessoa (as regras do banco
 * garantem). Liberar acesso só acontece pelo webhook, com a assinatura conferida.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { ativo, cliente, traduzir, notificar, usuario: usuarioAtual, linkConta } = window.AtalhoSupabase;
  // pagamentos.ativo: "auto" pergunta ao servidor se a loja já está ligada à Revolut; true/false forçam
  const modoPagamentos = ((window.ATALHO_CONFIG || {}).pagamentos || {}).ativo;
  let pagamentosLigados = modoPagamentos === true;
  const base = document.body.dataset.base || "/";
  const pagina = document.body.dataset.pagina;

  const euro = (centavos) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(centavos / 100).replace(/,00(?=\s*€)/, "");
  const data = (texto) => new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(new Date(texto));

  /** Só se envia a pessoa para a página de pagamento da própria Revolut, em https. */
  function enderecoRevolut(texto) {
    try {
      const endereco = new URL(texto);
      return endereco.protocol === "https:" && /(^|\.)revolut\.com$/.test(endereco.hostname) ? endereco : null;
    } catch {
      return null;
    }
  }

  /** Erro já escrito para a pessoa (vem da loja ou da função revolut-loja): mostra-se tal como está. */
  class ErroLoja extends Error {}
  const mensagemErro = (erro) => (erro instanceof ErroLoja ? erro.message : traduzir(erro));

  /** Chama a função revolut-loja do Supabase com a sessão da pessoa. */
  async function loja(corpo) {
    const { data, error } = await cliente.functions.invoke("revolut-loja", { body: corpo });
    if (error) {
      let mensagem = "Não foi possível falar com o serviço de pagamentos.";
      try {
        mensagem = (await error.context.json()).erro || mensagem;
      } catch {}
      throw new ErroLoja(mensagem);
    }
    return data;
  }

  const vendendo = () => ativo && pagamentosLigados;
  // Uma pergunta por página, sem sessão; se falhar, fica a lista de espera (nunca um botão que dá erro)
  const prontos =
    ativo && modoPagamentos === "auto"
      ? loja({ acao: "estado" })
          .then((r) => (pagamentosLigados = Boolean(r && r.ativo)))
          .catch(() => (pagamentosLigados = false))
      : Promise.resolve(pagamentosLigados);
  const ATIVOS = ["on_trial", "active", "past_due"];
  const daAcesso = (a) => ATIVOS.includes(a.status) || (a.status === "cancelled" && a.termina_em && new Date(a.termina_em) > new Date());

  /** O que a pessoa ligada tem: assinatura que dá acesso e compras não reembolsadas. */
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
        <p class="at-texto-suave at-texto-pequeno at-mb-0">O pagamento é feito numa página segura da Revolut (cartão, Apple Pay, Google Pay ou Revolut Pay) e a fatura chega por e-mail. Ao continuar, aceita os <a href="${base}termos/#venda">termos de venda</a>.</p>
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
    await prontos;
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
      notificar("Entre ou crie a sua conta grátis para que a compra fique ligada a ela.", "info");
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
    dialogo.onclose = async () => {
      if (dialogo.returnValue !== "pagar") return;
      botao?.setAttribute("aria-busy", "true");
      try {
        // A função cria a subscrição na Revolut com o id da conta (nada de dados no endereço)
        const { url } = await loja({ acao: "checkout", produto: id });
        const destino = enderecoRevolut(url || "");
        if (!destino) throw new ErroLoja("A página de pagamento não é da Revolut.");
        location.href = destino.href;
      } catch (erro) {
        botao?.removeAttribute("aria-busy");
        notificar(mensagemErro(erro), "perigo");
      }
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
    await prontos;
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
      link.textContent = "Já é membro";
      link.href = `${base}exemplos/`;
    }
    if (pro) {
      $("[data-loja-plano-atual]").hidden = false;
      for (const botao of $$("[data-comprar^='pro-']")) {
        botao.textContent = "O seu plano atual";
        botao.disabled = true;
      }
    }
  }

  /* ------------------------------------------------------------------------
     /conta/: o seu plano, compras e volta do pagamento
     ------------------------------------------------------------------------ */

  function textoAssinatura(a) {
    const intervalo = a.produto_id === "pro-anual" ? "anual" : "mensal";
    if (a.status === "past_due") return { titulo: `Atalho Pro ${intervalo}`, detalhe: "Não conseguimos cobrar a última renovação. A Revolut vai tentar de novo; confirme que o cartão tem saldo e está válido.", tipo: "aviso" };
    if (a.status === "cancelled") return { titulo: `Atalho Pro ${intervalo} (cancelado)`, detalhe: `O seu acesso continua até ${data(a.termina_em)}.`, tipo: "info" };
    if (a.status === "on_trial") return { titulo: `Atalho Pro ${intervalo} (teste grátis)`, detalhe: a.renova_em ? `A primeira cobrança é em ${data(a.renova_em)}.` : "", tipo: "sucesso" };
    return { titulo: `Atalho Pro ${intervalo}`, detalhe: a.renova_em ? `Renova em ${data(a.renova_em)}.` : "Subscrição ativa.", tipo: "sucesso" };
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
      if (["active", "on_trial", "past_due"].includes(pro.status)) {
        const cancelarBotao = Object.assign(document.createElement("button"), { type: "button", className: "at-botao", textContent: "Cancelar subscrição" });
        cancelarBotao.addEventListener("click", () => cancelarSubscricao(pro, cancelarBotao));
        corpo.append(cancelarBotao);
      }
    } else {
      titulo.textContent = "Membro (grátis)";
      detalhe.textContent = "Tem as páginas completas grátis. O Pro desbloqueia todas as páginas e modelos Pro.";
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
      const rotulo = Object.assign(document.createElement("p"), { className: "at-texto-pequeno at-mt-4 at-mb-0", textContent: "Compras avulsas (as suas para sempre):" });
      caixa.append(rotulo, lista);
    }
  }

  async function cancelarSubscricao(assinatura, botao) {
    const fim = assinatura.renova_em ? ` Continua com acesso até ${data(assinatura.renova_em)}.` : "";
    if (!confirm(`Cancelar a subscrição do Atalho Pro?${fim} Não há multa.`)) return;
    botao.setAttribute("aria-busy", "true");
    try {
      await loja({ acao: "cancelar", assinatura: assinatura.id });
      notificar("Subscrição cancelada. Não haverá mais cobranças.", "sucesso");
      desenharPlano(await situacao());
    } catch (erro) {
      notificar(mensagemErro(erro), "perigo");
    } finally {
      botao.removeAttribute("aria-busy");
    }
  }

  async function iniciarConta() {
    if (!ativo) return;
    await prontos;
    // Pagamentos no ar: a lista de espera do Pro deixa de fazer sentido
    if (vendendo("pro-mensal") || vendendo("pro-anual")) $("[data-conta-lista-bloco]")?.setAttribute("hidden", "");
    let atual = await situacao();
    if (!atual.pessoa) return;
    desenharPlano(atual);
    // Voltou do pagamento: o aviso da Revolut leva alguns segundos para chegar
    if (new URLSearchParams(location.search).get("pagamento") === "ok") {
      notificar("Pagamento recebido! A desbloquear o seu acesso…", "sucesso", { duracao: 8000 });
      const antes = atual.compras.length;
      for (let tentativa = 0; tentativa < 15 && !atual.pro && atual.compras.length === antes; tentativa++) {
        await new Promise((ok) => setTimeout(ok, 2000));
        atual = await situacao();
      }
      desenharPlano(atual);
      history.replaceState(null, "", location.pathname);
      if (atual.pro || atual.compras.length > antes) notificar("Acesso desbloqueado. Bom proveito!", "sucesso");
      else notificar("O pagamento ainda está a ser confirmado. Atualize a página daqui a alguns minutos.", "info", { duracao: 10000 });
    }
  }

  window.AtalhoLoja = { situacao, comprar, vendendo, prontos, loja };

  const iniciar = pagina === "pro" ? iniciarPrecos : pagina === "conta" ? iniciarConta : null;
  iniciar?.().catch((erro) => {
    console.error(erro);
    notificar(traduzir(erro), "perigo");
  });
})();
