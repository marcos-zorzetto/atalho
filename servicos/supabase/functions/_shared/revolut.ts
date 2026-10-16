/**
 * Pagamentos do Atalho pela Revolut Business (Merchant API).
 * O dinheiro entra diretamente na conta Revolut Business; a Revolut cobra as
 * renovações sozinha. Aqui fica só o que o Atalho precisa:
 *
 *   - checkout: cria (ou reaproveita) o cliente na Revolut, cria a subscrição
 *     ou o pedido avulso e devolve a página de pagamento da Revolut;
 *   - webhook: confere a assinatura do aviso, pergunta à Revolut o estado
 *     atual (o aviso é só um "algo mudou") e grava no banco;
 *   - cancelar: cancela a subscrição da própria pessoa.
 *
 * Sem dependências e sem nada específico do Deno, para ser testado no Node.
 * Documentação: https://developer.revolut.com/docs/merchant
 */

export type Status = "on_trial" | "active" | "paused" | "past_due" | "unpaid" | "cancelled" | "expired";

export interface Produto {
  id: string;
  tipo: "assinatura" | "pagina" | "componente";
  nome: string;
  preco_centavos: number;
  variante_revolut: string | null;
}

/** O que as funções precisam do banco (API REST do Supabase com a chave de serviço). */
export interface Banco {
  produto(id: string): Promise<Produto | null>;
  produtoDaVariante(variante: string): Promise<Produto | null>;
  clienteRevolut(usuario: string): Promise<string | null>;
  guardarClienteRevolut(usuario: string, cliente: string): Promise<void>;
  usuarioDoClienteRevolut(cliente: string): Promise<string | null>;
  donoDaAssinatura(assinatura: string): Promise<string | null>;
  gravarAssinatura(linha: { id: string; usuario_id: string; produto_id: string | null; status: Status; renova_em: string | null; termina_em: string | null; portal_url: null }): Promise<void>;
  gravarCompra(linha: { id: string; usuario_id: string; produto_id: string; pedido_revolut: string }): Promise<void>;
  gravarPagamento(linha: { id: string; usuario_id: string | null; produto_id: string | null; valor_centavos: number; moeda: string }): Promise<void>;
  reembolsarPedido(pedido: string): Promise<void>;
  reembolsarPagamento(id: string): Promise<void>;
}

/** A parte da Merchant API que o Atalho usa. */
export interface Revolut {
  criarCliente(dados: { email: string; full_name?: string }): Promise<{ id: string }>;
  criarSubscricao(dados: { plan_variation_id: string; customer_id: string; external_reference: string; setup_order_redirect_url: string }): Promise<{ id: string; setup_order_id?: string }>;
  obterSubscricao(id: string): Promise<any>;
  obterCiclo(subscricao: string, ciclo: string): Promise<any>;
  cancelarSubscricao(id: string): Promise<void>;
  criarPedido(dados: { amount: number; currency: string; customer: { id: string }; description: string; merchant_order_data: { reference: string }; redirect_url: string }): Promise<{ id: string; checkout_url?: string }>;
  obterPedido(id: string): Promise<any>;
}

export interface Resultado {
  status: number;
  mensagem: string;
  corpo?: unknown;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const texto = (valor: unknown): string | null => (valor === null || valor === undefined || valor === "" ? null : String(valor));

/* --------------------------------------------------------------------------
   Assinatura dos avisos (webhooks)
   Revolut-Signature: "v1=<hex>" (pode trazer várias, separadas por vírgula,
   quando o segredo é rodado). Assina-se "v1.<Revolut-Request-Timestamp>.<corpo>"
   com HMAC SHA-256 e o "signing secret" do webhook.
   -------------------------------------------------------------------------- */

/** Avisos com mais de 5 minutos são recusados (contra repetição de avisos antigos). */
export const TOLERANCIA_MS = 5 * 60 * 1000;

export async function assinaturaValida(
  corpo: string,
  cabecalhoAssinatura: string | null,
  carimbo: string | null,
  segredo: string,
  agora = Date.now(),
): Promise<boolean> {
  if (!cabecalhoAssinatura || !carimbo || !segredo || !/^\d{10,13}$/.test(carimbo)) return false;
  // A Revolut envia o carimbo em milissegundos (alguns exemplos mostram segundos): aceita os dois
  const ms = carimbo.length <= 10 ? Number(carimbo) * 1000 : Number(carimbo);
  if (Math.abs(agora - ms) > TOLERANCIA_MS) return false;
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const mensagem = new TextEncoder().encode(`v1.${carimbo}.${corpo}`);
  for (const parte of cabecalhoAssinatura.split(",")) {
    const hex = parte.trim().replace(/^v1=/, "");
    if (!/^[0-9a-f]{64}$/i.test(hex)) continue;
    const bytes = new Uint8Array(hex.match(/../g)!.map((par) => parseInt(par, 16)));
    // verify() compara em tempo constante: não vaza o segredo pelo tempo de resposta
    if (await crypto.subtle.verify("HMAC", chave, bytes, mensagem)) return true;
  }
  return false;
}

/* --------------------------------------------------------------------------
   Estados
   -------------------------------------------------------------------------- */

/** Estado da subscrição na Revolut → estado guardado no Atalho (o mesmo vocabulário de antes). */
export function estadoParaStatus(estado: string, emTeste = false): Status | null {
  switch (estado) {
    case "active":
      return emTeste ? "on_trial" : "active";
    case "overdue":
      return "past_due"; // a Revolut ainda está a tentar cobrar: o acesso mantém-se
    case "paused":
      return "paused";
    case "cancelled":
      return "cancelled";
    case "finished":
      return "expired";
    default:
      return null; // "pending": ainda não pagou o primeiro ciclo
  }
}

/* --------------------------------------------------------------------------
   Checkout (pedido de uma pessoa com sessão iniciada)
   -------------------------------------------------------------------------- */

export async function criarCheckout(
  pedido: { usuario: { id: string; email: string | null }; produtoId: string },
  config: { banco: Banco; revolut: Revolut; site: string },
): Promise<Resultado> {
  const { banco, revolut, site } = config;
  if (!UUID.test(pedido.usuario.id)) return { status: 401, mensagem: "Sessão inválida." };
  if (!pedido.usuario.email) return { status: 400, mensagem: "A conta não tem e-mail confirmado." };
  if (!/^[a-z0-9-]{1,60}$/.test(pedido.produtoId)) return { status: 400, mensagem: "Produto inválido." };
  const produto = await banco.produto(pedido.produtoId);
  if (!produto) return { status: 404, mensagem: "Produto não encontrado." };

  let cliente = await banco.clienteRevolut(pedido.usuario.id);
  if (!cliente) {
    cliente = (await revolut.criarCliente({ email: pedido.usuario.email })).id;
    await banco.guardarClienteRevolut(pedido.usuario.id, cliente);
  }
  const volta = new URL("conta/?pagamento=ok", site).href;

  if (produto.tipo === "assinatura") {
    if (!produto.variante_revolut) return { status: 503, mensagem: "Este plano ainda não está à venda." };
    const subscricao = await revolut.criarSubscricao({
      plan_variation_id: produto.variante_revolut,
      customer_id: cliente,
      external_reference: pedido.usuario.id,
      setup_order_redirect_url: volta,
    });
    if (!subscricao.setup_order_id) return { status: 502, mensagem: "A Revolut não devolveu o pedido de pagamento." };
    const ordem = await revolut.obterPedido(subscricao.setup_order_id);
    const url = texto(ordem?.checkout_url);
    if (!url || !paginaRevolut(url)) return { status: 502, mensagem: "A Revolut não devolveu a página de pagamento." };
    return { status: 200, mensagem: "ok", corpo: { url } };
  }

  // Compra avulsa (uma página ou um componente, para sempre)
  const ordem = await revolut.criarPedido({
    amount: produto.preco_centavos,
    currency: "EUR",
    customer: { id: cliente },
    description: produto.nome,
    merchant_order_data: { reference: `${pedido.usuario.id}:${produto.id}` },
    redirect_url: volta,
  });
  const url = texto(ordem.checkout_url);
  if (!url || !paginaRevolut(url)) return { status: 502, mensagem: "A Revolut não devolveu a página de pagamento." };
  return { status: 200, mensagem: "ok", corpo: { url } };
}

/** Só se envia a pessoa para páginas da própria Revolut, em https. */
export function paginaRevolut(texto: string): boolean {
  try {
    const u = new URL(texto);
    return u.protocol === "https:" && /(^|\.)revolut\.com$/.test(u.hostname);
  } catch {
    return false;
  }
}

/* --------------------------------------------------------------------------
   Cancelar (a pessoa cancela a própria subscrição)
   -------------------------------------------------------------------------- */

export async function cancelar(pedido: { usuarioId: string; assinaturaId: string }, config: { banco: Banco; revolut: Revolut }): Promise<Resultado> {
  if (!UUID.test(pedido.usuarioId)) return { status: 401, mensagem: "Sessão inválida." };
  if (!/^[0-9a-zA-Z_-]{3,80}$/.test(pedido.assinaturaId)) return { status: 400, mensagem: "Subscrição inválida." };
  const dono = await config.banco.donoDaAssinatura(pedido.assinaturaId);
  if (dono !== pedido.usuarioId) return { status: 404, mensagem: "Subscrição não encontrada." };
  await config.revolut.cancelarSubscricao(pedido.assinaturaId);
  // O webhook SUBSCRIPTION_CANCELLED atualiza o estado; gravamos já para a página refletir na hora
  await sincronizarSubscricao(pedido.assinaturaId, config.banco, config.revolut);
  return { status: 200, mensagem: "Subscrição cancelada." };
}

/* --------------------------------------------------------------------------
   Avisos da Revolut
   -------------------------------------------------------------------------- */

/** Lê o estado atual da subscrição na Revolut e grava-o. */
export async function sincronizarSubscricao(id: string, banco: Banco, revolut: Revolut, referencia: string | null = null): Promise<Resultado> {
  const s = await revolut.obterSubscricao(id);
  const usuario = texto(s?.external_reference) ?? referencia ?? (await banco.donoDaAssinatura(id)) ?? (s?.customer_id ? await banco.usuarioDoClienteRevolut(String(s.customer_id)) : null);
  if (!usuario || !UUID.test(usuario)) return { status: 422, mensagem: `subscrição ${id} sem utilizador conhecido` };
  const emTeste = Boolean(s?.trial_end_date && new Date(s.trial_end_date) > new Date());
  const status = estadoParaStatus(String(s?.state ?? ""), emTeste);
  if (!status) return { status: 200, mensagem: `subscrição ${id} ainda ${s?.state ?? "sem estado"}` };
  const ciclo = s?.current_cycle_id ? await revolut.obterCiclo(id, String(s.current_cycle_id)).catch(() => null) : null;
  const fimDoCiclo = texto(ciclo?.end_date);
  // Cancelada (ou com cancelamento marcado): o acesso vai até ao fim do ciclo já pago
  const cancelamentoMarcado = s?.scheduled_action && /cancel/i.test(JSON.stringify(s.scheduled_action));
  const produto = s?.plan_variation_id ? await banco.produtoDaVariante(String(s.plan_variation_id)) : null;
  await banco.gravarAssinatura({
    id,
    usuario_id: usuario,
    produto_id: produto?.id ?? null,
    status: cancelamentoMarcado && status === "active" ? "cancelled" : status,
    renova_em: status === "active" && !cancelamentoMarcado ? fimDoCiclo : null,
    termina_em: status === "cancelled" || cancelamentoMarcado ? fimDoCiclo : status === "expired" ? new Date().toISOString() : null,
    portal_url: null,
  });
  return { status: 200, mensagem: `subscrição ${id}: ${status}` };
}

/** Pedido pago (compra avulsa ou cobrança de um ciclo): regista o pagamento e liberta a compra. */
async function pedidoPago(id: string, banco: Banco, revolut: Revolut): Promise<Resultado> {
  const ordem = await revolut.obterPedido(id);
  const estado = String(ordem?.state ?? "");
  if (estado !== "completed") return { status: 200, mensagem: `pedido ${id} ainda ${estado}` };
  const referencia = texto(ordem?.merchant_order_data?.reference);
  const [usuarioRef, produtoRef] = referencia?.split(":") ?? [];
  const cliente = texto(ordem?.customer?.id ?? ordem?.customer_id);
  const usuario = usuarioRef && UUID.test(usuarioRef) ? usuarioRef : cliente ? await banco.usuarioDoClienteRevolut(cliente) : null;
  const produto = produtoRef ? await banco.produto(produtoRef) : null;
  const valor = Number(ordem?.amount ?? ordem?.order_amount?.value) || 0;
  await banco.gravarPagamento({ id: `revolut-${id}`, usuario_id: usuario, produto_id: produto?.id ?? null, valor_centavos: valor, moeda: String(ordem?.currency ?? ordem?.order_amount?.currency ?? "EUR").toUpperCase() });
  if (produto && produto.tipo !== "assinatura") {
    if (!usuario) return { status: 422, mensagem: "compra sem utilizador: não há a quem libertar" };
    await banco.gravarCompra({ id: `revolut-${id}-${produto.id}`, usuario_id: usuario, produto_id: produto.id, pedido_revolut: id });
    return { status: 200, mensagem: `compra de ${produto.id} libertada` };
  }
  return { status: 200, mensagem: `pagamento ${id} registado` };
}

export async function processarEvento(evento: any, banco: Banco, revolut: Revolut): Promise<Resultado> {
  const nome = String(evento?.event ?? "");
  if (nome.startsWith("SUBSCRIPTION_")) {
    const id = texto(evento?.subscription_id);
    if (!id) return { status: 400, mensagem: "aviso sem subscription_id" };
    const referencia = texto(evento?.external_reference);
    return sincronizarSubscricao(id, banco, revolut, referencia && UUID.test(referencia) ? referencia : null);
  }
  if (nome === "ORDER_COMPLETED") {
    const id = texto(evento?.order_id);
    return id ? pedidoPago(id, banco, revolut) : { status: 400, mensagem: "aviso sem order_id" };
  }
  if (nome === "ORDER_PAYMENT_REFUNDED" || nome === "ORDER_REFUNDED") {
    const id = texto(evento?.order_id);
    if (!id) return { status: 400, mensagem: "aviso sem order_id" };
    await banco.reembolsarPedido(id);
    await banco.reembolsarPagamento(`revolut-${id}`);
    return { status: 200, mensagem: `pedido ${id} reembolsado` };
  }
  return { status: 200, mensagem: `evento ${nome || "(sem nome)"} ignorado` };
}

/** Recebe o aviso HTTP inteiro: confere a assinatura, processa e responde. */
export function criarWebhook(config: { segredo: string; banco: Banco; revolut: Revolut }) {
  return async (requisicao: Request): Promise<Response> => {
    if (requisicao.method !== "POST") return new Response("Use POST", { status: 405 });
    const corpo = await requisicao.text();
    const valida = await assinaturaValida(corpo, requisicao.headers.get("revolut-signature"), requisicao.headers.get("revolut-request-timestamp"), config.segredo);
    if (!valida) return new Response("Assinatura inválida", { status: 401 });
    let evento: unknown;
    try {
      evento = JSON.parse(corpo);
    } catch {
      return new Response("JSON inválido", { status: 400 });
    }
    try {
      const r = await processarEvento(evento, config.banco, config.revolut);
      return new Response(r.mensagem, { status: r.status });
    } catch (erro) {
      // 4xx/5xx faz a Revolut repetir o aviso (3 vezes, de 10 em 10 minutos)
      console.error(erro);
      return new Response("Erro ao gravar", { status: 500 });
    }
  };
}

/* --------------------------------------------------------------------------
   Ligações reais (Merchant API e banco do Supabase)
   -------------------------------------------------------------------------- */

export function revolutApi(chaveSecreta: string, opcoes: { sandbox?: boolean; versao?: string; buscar?: typeof fetch } = {}): Revolut {
  const base = opcoes.sandbox ? "https://sandbox-merchant.revolut.com" : "https://merchant.revolut.com";
  const buscar = opcoes.buscar ?? fetch;
  const pedir = async (metodo: string, caminho: string, corpo?: unknown) => {
    const r = await buscar(`${base}${caminho}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${chaveSecreta}`,
        "Revolut-Api-Version": opcoes.versao ?? "2026-08-17",
        Accept: "application/json",
        ...(corpo ? { "Content-Type": "application/json" } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    if (!r.ok) throw new Error(`Revolut ${r.status} em ${metodo} ${caminho}: ${(await r.text()).slice(0, 300)}`);
    return r.status === 204 ? null : r.json();
  };
  const seg = encodeURIComponent;
  return {
    criarCliente: (d) => pedir("POST", "/api/customers", d),
    criarSubscricao: (d) => pedir("POST", "/api/subscriptions", d),
    obterSubscricao: (id) => pedir("GET", `/api/subscriptions/${seg(id)}`),
    obterCiclo: (s, c) => pedir("GET", `/api/subscriptions/${seg(s)}/cycles/${seg(c)}`),
    cancelarSubscricao: (id) => pedir("POST", `/api/subscriptions/${seg(id)}/cancel`).then(() => {}),
    criarPedido: (d) => pedir("POST", "/api/orders", d),
    obterPedido: (id) => pedir("GET", `/api/orders/${seg(id)}`),
  };
}

export function bancoSupabase(url: string, chave: string, buscar: typeof fetch = fetch): Banco {
  const cabecalhos: Record<string, string> = { apikey: chave, "Content-Type": "application/json" };
  if (chave.startsWith("eyJ")) cabecalhos.Authorization = `Bearer ${chave}`;
  const rest = async (caminho: string, opcoes: RequestInit = {}) => {
    const r = await buscar(`${url}/rest/v1/${caminho}`, { ...opcoes, headers: { ...cabecalhos, ...(opcoes.headers as Record<string, string>) } });
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 300)}`);
    return r.status === 204 || r.headers.get("content-length") === "0" ? null : r.json();
  };
  const um = async (caminho: string) => (await rest(caminho))?.[0] ?? null;
  const inserir = (tabela: string, linha: object, conflito: "merge" | "ignore", coluna = "id") =>
    rest(`${tabela}?on_conflict=${coluna}`, { method: "POST", body: JSON.stringify(linha), headers: { Prefer: `resolution=${conflito}-duplicates,return=minimal` } }).then(() => {});
  const e = encodeURIComponent;
  const CAMPOS = "id,tipo,nome,preco_centavos,variante_revolut";
  return {
    produto: (id) => um(`produtos?select=${CAMPOS}&id=eq.${e(id)}&ativo=is.true`),
    produtoDaVariante: (v) => um(`produtos?select=${CAMPOS}&variante_revolut=eq.${e(v)}`),
    clienteRevolut: async (u) => (await um(`clientes_revolut?select=cliente_id&usuario_id=eq.${e(u)}`))?.cliente_id ?? null,
    guardarClienteRevolut: (u, c) => inserir("clientes_revolut", { usuario_id: u, cliente_id: c }, "ignore", "usuario_id"),
    usuarioDoClienteRevolut: async (c) => (await um(`clientes_revolut?select=usuario_id&cliente_id=eq.${e(c)}`))?.usuario_id ?? null,
    donoDaAssinatura: async (a) => (await um(`assinaturas?select=usuario_id&id=eq.${e(a)}`))?.usuario_id ?? null,
    gravarAssinatura: (l) => inserir("assinaturas", { ...l, atualizado_em: new Date().toISOString() }, "merge"),
    gravarCompra: (l) => inserir("compras", l, "ignore"),
    gravarPagamento: (l) => inserir("pagamentos", l, "ignore"),
    reembolsarPedido: (p) => rest(`compras?pedido_revolut=eq.${e(p)}`, { method: "PATCH", body: JSON.stringify({ reembolsada: true }), headers: { Prefer: "return=minimal" } }).then(() => {}),
    reembolsarPagamento: (id) => rest(`pagamentos?id=eq.${e(id)}`, { method: "PATCH", body: JSON.stringify({ reembolsado: true }), headers: { Prefer: "return=minimal" } }).then(() => {}),
  };
}

/** Quem está a pedir: confere o token da sessão no próprio Supabase. */
export async function usuarioDoToken(url: string, chavePublica: string, token: string | null, buscar: typeof fetch = fetch): Promise<{ id: string; email: string | null } | null> {
  if (!token) return null;
  const r = await buscar(`${url}/auth/v1/user`, { headers: { apikey: chavePublica, Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const u = await r.json();
  return u?.id ? { id: String(u.id), email: u.email && u.email_confirmed_at ? String(u.email) : null } : null;
}
