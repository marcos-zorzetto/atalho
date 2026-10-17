// Testes dos pagamentos pela Revolut (correm no Node: npm test). Nada sai para a internet:
// a Revolut e o banco são imitações em memória.
import { test } from "node:test";
import assert from "node:assert/strict";
import { assinaturaValida, cancelar, configurarLoja, criarCheckout, criarWebhook, EVENTOS_WEBHOOK, estadoLoja, estadoParaStatus, paginaRevolut, processarEvento, type Banco, type Produto, type Revolut } from "./revolut.ts";

const ANA = "11111111-1111-4111-8111-111111111111";
const BRUNO = "22222222-2222-4222-8222-222222222222";
const SEGREDO = "wsk_teste_segredo";
const SITE = "https://atalho.com.pt/";

const PRODUTOS: Produto[] = [
  { id: "pro-mensal", tipo: "assinatura", nome: "Atalho Pro (mensal)", preco_centavos: 900, variante_revolut: "var-mensal", intervalo: "mes" },
  { id: "pro-anual", tipo: "assinatura", nome: "Atalho Pro (anual)", preco_centavos: 7900, variante_revolut: null, intervalo: "ano" },
  { id: "pagina-agenda", tipo: "pagina", nome: "Página Agenda", preco_centavos: 900, variante_revolut: null },
];

function bancoFalso(produtos: Produto[] = PRODUTOS) {
  const lista = produtos.map((p) => ({ ...p }));
  const estado = { clientes: new Map<string, string>(), assinaturas: new Map<string, any>(), compras: new Map<string, any>(), pagamentos: new Map<string, any>(), config: new Map<string, string>(), admins: new Set<string>([ANA]), produtos: lista };
  const banco: Banco = {
    produto: async (id) => lista.find((p) => p.id === id) ?? null,
    produtoDaVariante: async (v) => lista.find((p) => p.variante_revolut === v) ?? null,
    clienteRevolut: async (u) => estado.clientes.get(u) ?? null,
    guardarClienteRevolut: async (u, c) => void estado.clientes.set(u, c),
    usuarioDoClienteRevolut: async (c) => [...estado.clientes].find(([, x]) => x === c)?.[0] ?? null,
    donoDaAssinatura: async (a) => estado.assinaturas.get(a)?.usuario_id ?? null,
    gravarAssinatura: async (l) => void estado.assinaturas.set(l.id, l),
    gravarCompra: async (l) => void estado.compras.set(l.id, l),
    gravarPagamento: async (l) => void (estado.pagamentos.has(l.id) || estado.pagamentos.set(l.id, l)),
    reembolsarPedido: async (p) => estado.compras.forEach((c) => c.pedido_revolut === p && (c.reembolsada = true)),
    reembolsarPagamento: async (id) => void (estado.pagamentos.get(id) && (estado.pagamentos.get(id).reembolsado = true)),
    produtosAssinatura: async () => lista.filter((p) => p.tipo === "assinatura"),
    definirVariante: async (p, v) => void (lista.find((x) => x.id === p)!.variante_revolut = v),
    lerConfig: async (c) => estado.config.get(c) ?? null,
    gravarConfig: async (c, v) => void estado.config.set(c, v),
    ehAdmin: async (u) => estado.admins.has(u),
  };
  return { banco, estado };
}

function revolutFalsa(subscricoes: Record<string, any> = {}, pedidos: Record<string, any> = {}) {
  const chamadas: string[] = [];
  const revolut: Revolut = {
    criarCliente: async (d) => (chamadas.push(`cliente ${d.email}`), { id: "cus_1" }),
    criarSubscricao: async (d) => (chamadas.push(`subscricao ${d.plan_variation_id} ${d.external_reference} ${d.setup_order_redirect_url}`), { id: "sub_1", setup_order_id: "ord_setup" }),
    obterSubscricao: async (id) => subscricoes[id],
    obterCiclo: async () => ({ end_date: "2026-11-16T10:00:00Z" }),
    cancelarSubscricao: async (id) => {
      chamadas.push(`cancelar ${id}`);
      subscricoes[id] = { ...subscricoes[id], state: "cancelled" };
    },
    criarPedido: async (d) => (chamadas.push(`pedido ${d.amount} ${d.merchant_order_data.reference}`), { id: "ord_avulso", checkout_url: "https://checkout.revolut.com/payment-link/abc" }),
    obterPedido: async (id) => pedidos[id] ?? { id, checkout_url: "https://checkout.revolut.com/payment-link/setup" },
    criarPlano: async (d) => (chamadas.push(`plano ${d.name} ${d.variations.map((v) => `${v.phases[0].cycle_duration}=${v.phases[0].amount}${v.phases[0].currency}`).join(" ")}`), { id: "plan_1", variations: d.variations.map((_, i) => ({ id: `var_${i + 1}` })) }),
    registarWebhook: async (d) => (chamadas.push(`webhook ${d.url} ${d.events.join(",")}`), { id: "wh_1", signing_secret: "wsk_novo" }),
  };
  return { revolut, chamadas };
}

async function assinar(corpo: string, carimbo: string, segredo = SEGREDO) {
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(`v1.${carimbo}.${corpo}`)));
  return "v1=" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------------- Assinatura dos avisos ---------------- */

test("assinatura: aceita a da Revolut e recusa corpo alterado, segredo errado e aviso antigo", async () => {
  const corpo = '{"event":"ORDER_COMPLETED","order_id":"o1"}';
  const agora = Date.now();
  const carimbo = String(agora);
  const assinatura = await assinar(corpo, carimbo);
  assert.equal(await assinaturaValida(corpo, assinatura, carimbo, SEGREDO, agora), true);
  assert.equal(await assinaturaValida(corpo + " ", assinatura, carimbo, SEGREDO, agora), false);
  assert.equal(await assinaturaValida(corpo, assinatura, carimbo, "outro", agora), false);
  assert.equal(await assinaturaValida(corpo, assinatura, carimbo, SEGREDO, agora + 6 * 60 * 1000), false);
  assert.equal(await assinaturaValida(corpo, null, carimbo, SEGREDO, agora), false);
  assert.equal(await assinaturaValida(corpo, assinatura, "abc", SEGREDO, agora), false);
});

test("assinatura: com o segredo a ser rodado, basta uma das assinaturas bater", async () => {
  const corpo = "{}";
  const carimbo = String(Date.now());
  const boa = await assinar(corpo, carimbo);
  const velha = await assinar(corpo, carimbo, "segredo-antigo");
  assert.equal(await assinaturaValida(corpo, `${velha},${boa}`, carimbo, SEGREDO), true);
});

/* ---------------- Estados e endereços ---------------- */

test("estados: o vocabulário da Revolut passa para o do Atalho", () => {
  assert.equal(estadoParaStatus("active"), "active");
  assert.equal(estadoParaStatus("active", true), "on_trial");
  assert.equal(estadoParaStatus("overdue"), "past_due");
  assert.equal(estadoParaStatus("cancelled"), "cancelled");
  assert.equal(estadoParaStatus("finished"), "expired");
  assert.equal(estadoParaStatus("pending"), null);
});

test("só se envia a pessoa para páginas da Revolut em https", () => {
  assert.equal(paginaRevolut("https://checkout.revolut.com/x"), true);
  assert.equal(paginaRevolut("http://checkout.revolut.com/x"), false);
  assert.equal(paginaRevolut("https://revolut.com.malicioso.pt/x"), false);
  assert.equal(paginaRevolut("nada"), false);
});

/* ---------------- Checkout ---------------- */

test("checkout do Pro: cria o cliente uma vez, a subscrição com o id da conta e devolve a página da Revolut", async () => {
  const { banco, estado } = bancoFalso();
  const { revolut, chamadas } = revolutFalsa();
  const r = await criarCheckout({ usuario: { id: ANA, email: "ana@exemplo.pt" }, produtoId: "pro-mensal" }, { banco, revolut, site: SITE });
  assert.equal(r.status, 200);
  assert.deepEqual(r.corpo, { url: "https://checkout.revolut.com/payment-link/setup" });
  assert.equal(estado.clientes.get(ANA), "cus_1");
  assert.deepEqual(chamadas, ["cliente ana@exemplo.pt", `subscricao var-mensal ${ANA} https://atalho.com.pt/conta/?pagamento=ok`]);
  await criarCheckout({ usuario: { id: ANA, email: "ana@exemplo.pt" }, produtoId: "pro-mensal" }, { banco, revolut, site: SITE });
  assert.equal(chamadas.filter((c) => c.startsWith("cliente")).length, 1, "o cliente é reaproveitado");
});

test("checkout: recusa produto sem plano na Revolut, produto inexistente, conta sem e-mail e sessão inválida", async () => {
  const { banco } = bancoFalso();
  const { revolut } = revolutFalsa();
  const cfg = { banco, revolut, site: SITE };
  assert.equal((await criarCheckout({ usuario: { id: ANA, email: "a@b.pt" }, produtoId: "pro-anual" }, cfg)).status, 503);
  assert.equal((await criarCheckout({ usuario: { id: ANA, email: "a@b.pt" }, produtoId: "nao-existe" }, cfg)).status, 404);
  assert.equal((await criarCheckout({ usuario: { id: ANA, email: null }, produtoId: "pro-mensal" }, cfg)).status, 400);
  assert.equal((await criarCheckout({ usuario: { id: "x", email: "a@b.pt" }, produtoId: "pro-mensal" }, cfg)).status, 401);
  assert.equal((await criarCheckout({ usuario: { id: ANA, email: "a@b.pt" }, produtoId: "../admin" }, cfg)).status, 400);
});

test("checkout: recusa uma página de pagamento que não seja da Revolut", async () => {
  const { banco } = bancoFalso();
  const { revolut } = revolutFalsa({}, { ord_setup: { checkout_url: "https://pagamento-falso.pt/x" } });
  const r = await criarCheckout({ usuario: { id: ANA, email: "a@b.pt" }, produtoId: "pro-mensal" }, { banco, revolut, site: SITE });
  assert.equal(r.status, 502);
});

test("checkout de compra avulsa: pedido com o valor do produto e a referência conta:produto", async () => {
  const { banco } = bancoFalso();
  const { revolut, chamadas } = revolutFalsa();
  const r = await criarCheckout({ usuario: { id: ANA, email: "a@b.pt" }, produtoId: "pagina-agenda" }, { banco, revolut, site: SITE });
  assert.equal(r.status, 200);
  assert.ok(chamadas.includes(`pedido 900 ${ANA}:pagina-agenda`));
});

/* ---------------- Avisos ---------------- */

test("aviso de subscrição ativa: grava o Pro com a data de renovação", async () => {
  const { banco, estado } = bancoFalso();
  const { revolut } = revolutFalsa({ sub_1: { id: "sub_1", state: "active", external_reference: ANA, plan_variation_id: "var-mensal", current_cycle_id: "cyc_1" } });
  const r = await processarEvento({ event: "SUBSCRIPTION_ACTIVATED", subscription_id: "sub_1", external_reference: ANA }, banco, revolut);
  assert.equal(r.status, 200);
  assert.deepEqual(estado.assinaturas.get("sub_1"), { id: "sub_1", usuario_id: ANA, produto_id: "pro-mensal", status: "active", renova_em: "2026-11-16T10:00:00Z", termina_em: null, portal_url: null });
});

test("aviso: o estado vem sempre da Revolut, não do aviso (subscrição ainda por pagar não dá acesso)", async () => {
  const { banco, estado } = bancoFalso();
  const { revolut } = revolutFalsa({ sub_1: { id: "sub_1", state: "pending", external_reference: ANA } });
  await processarEvento({ event: "SUBSCRIPTION_ACTIVATED", subscription_id: "sub_1" }, banco, revolut);
  assert.equal(estado.assinaturas.size, 0);
});

test("cancelamento marcado para o fim do ciclo: acesso até ao fim do período pago", async () => {
  const { banco, estado } = bancoFalso();
  const { revolut } = revolutFalsa({ sub_1: { id: "sub_1", state: "active", external_reference: ANA, plan_variation_id: "var-mensal", current_cycle_id: "c", scheduled_action: { type: "cancel" } } });
  await processarEvento({ event: "SUBSCRIPTION_UPDATED", subscription_id: "sub_1" }, banco, revolut);
  const linha = estado.assinaturas.get("sub_1");
  assert.equal(linha.status, "cancelled");
  assert.equal(linha.termina_em, "2026-11-16T10:00:00Z");
  assert.equal(linha.renova_em, null);
});

test("pedido pago de compra avulsa: regista o pagamento e liberta a compra; reembolso retira-a", async () => {
  const { banco, estado } = bancoFalso();
  const { revolut } = revolutFalsa({}, { ord_9: { id: "ord_9", state: "completed", amount: 900, currency: "EUR", merchant_order_data: { reference: `${ANA}:pagina-agenda` } } });
  assert.equal((await processarEvento({ event: "ORDER_COMPLETED", order_id: "ord_9" }, banco, revolut)).status, 200);
  assert.equal(estado.compras.get("revolut-ord_9-pagina-agenda")?.usuario_id, ANA);
  assert.equal(estado.pagamentos.get("revolut-ord_9")?.valor_centavos, 900);
  await processarEvento({ event: "ORDER_COMPLETED", order_id: "ord_9" }, banco, revolut);
  assert.equal(estado.pagamentos.size, 1, "aviso repetido não duplica");
  await processarEvento({ event: "ORDER_PAYMENT_REFUNDED", order_id: "ord_9" }, banco, revolut);
  assert.equal(estado.compras.get("revolut-ord_9-pagina-agenda")?.reembolsada, true);
  assert.equal(estado.pagamentos.get("revolut-ord_9")?.reembolsado, true);
});

test("cobrança de renovação (pedido sem referência): o pagamento fica ligado à conta pelo cliente da Revolut", async () => {
  const { banco, estado } = bancoFalso();
  estado.clientes.set(ANA, "cus_1");
  const { revolut } = revolutFalsa({}, { ord_r: { id: "ord_r", state: "completed", amount: 900, currency: "EUR", customer: { id: "cus_1" } } });
  await processarEvento({ event: "ORDER_COMPLETED", order_id: "ord_r" }, banco, revolut);
  assert.equal(estado.pagamentos.get("revolut-ord_r")?.usuario_id, ANA);
  assert.equal(estado.compras.size, 0);
});

/* ---------------- Cancelar ---------------- */

test("cancelar: só o dono cancela a própria subscrição", async () => {
  const { banco, estado } = bancoFalso();
  estado.assinaturas.set("sub_1", { id: "sub_1", usuario_id: ANA, status: "active" });
  const { revolut, chamadas } = revolutFalsa({ sub_1: { id: "sub_1", state: "active", external_reference: ANA, current_cycle_id: "c" } });
  assert.equal((await cancelar({ usuarioId: BRUNO, assinaturaId: "sub_1" }, { banco, revolut })).status, 404);
  assert.equal(chamadas.length, 0);
  assert.equal((await cancelar({ usuarioId: ANA, assinaturaId: "sub_1" }, { banco, revolut })).status, 200);
  assert.deepEqual(chamadas, ["cancelar sub_1"]);
  assert.equal(estado.assinaturas.get("sub_1").status, "cancelled");
});

/* ---------------- Pedido HTTP do webhook ---------------- */

test("webhook HTTP: recusa sem assinatura (401) e processa com a assinatura certa", async () => {
  const { banco, estado } = bancoFalso();
  const { revolut } = revolutFalsa({ sub_1: { id: "sub_1", state: "active", external_reference: ANA, plan_variation_id: "var-mensal" } });
  const webhook = criarWebhook({ segredo: SEGREDO, banco, revolut });
  const corpo = JSON.stringify({ event: "SUBSCRIPTION_ACTIVATED", subscription_id: "sub_1" });
  const sem = await webhook(new Request("https://x/", { method: "POST", body: corpo }));
  assert.equal(sem.status, 401);
  const carimbo = String(Date.now());
  const com = await webhook(new Request("https://x/", { method: "POST", body: corpo, headers: { "Revolut-Signature": await assinar(corpo, carimbo), "Revolut-Request-Timestamp": carimbo } }));
  assert.equal(com.status, 200);
  assert.equal(estado.assinaturas.get("sub_1")?.status, "active");
  assert.equal((await webhook(new Request("https://x/", { method: "GET" }))).status, 405);
});

/* ---------------- Ligar a loja pelo painel ---------------- */

test("ligar a loja: cria só o plano que falta (com o preço da tabela) e o webhook, e guarda o segredo", async () => {
  const { banco, estado } = bancoFalso();
  const { revolut, chamadas } = revolutFalsa();
  assert.deepEqual(await estadoLoja(banco, { chave: "sk_x", segredoAmbiente: "" }), { ativo: false });
  const r = await configurarLoja({ banco, revolut, webhookUrl: "https://x.supabase.co/functions/v1/revolut-webhook", segredoAmbiente: "" });
  assert.equal(r.status, 200);
  // O mensal já tinha variação: o plano novo só leva o anual, a 79 €/ano
  assert.deepEqual(chamadas, ["plano Atalho Pro P1Y=7900EUR", `webhook https://x.supabase.co/functions/v1/revolut-webhook ${EVENTOS_WEBHOOK.join(",")}`]);
  assert.equal(estado.produtos.find((p) => p.id === "pro-anual")!.variante_revolut, "var_1");
  assert.equal(estado.config.get("webhook_segredo"), "wsk_novo");
  assert.deepEqual(await estadoLoja(banco, { chave: "sk_x", segredoAmbiente: "" }), { ativo: true });
  // Sem a chave da API, nunca está a vender
  assert.deepEqual(await estadoLoja(banco, { chave: "", segredoAmbiente: "" }), { ativo: false });
});

test("ligar a loja duas vezes não duplica planos nem webhooks", async () => {
  const { banco } = bancoFalso();
  const { revolut, chamadas } = revolutFalsa();
  await configurarLoja({ banco, revolut, webhookUrl: "https://x/w", segredoAmbiente: "" });
  const antes = chamadas.length;
  const r = await configurarLoja({ banco, revolut, webhookUrl: "https://x/w", segredoAmbiente: "" });
  assert.equal(r.status, 200);
  assert.equal(chamadas.length, antes);
});

test("ligar a loja com REVOLUT_WEBHOOK_SECRET já definido: não cria outro webhook", async () => {
  const { banco } = bancoFalso();
  const { revolut, chamadas } = revolutFalsa();
  await configurarLoja({ banco, revolut, webhookUrl: "https://x/w", segredoAmbiente: SEGREDO });
  assert.ok(!chamadas.some((c) => c.startsWith("webhook")));
  assert.deepEqual(await estadoLoja(banco, { chave: "sk_x", segredoAmbiente: SEGREDO }), { ativo: true });
});

test("webhook HTTP: aceita o segredo guardado na base de dados", async () => {
  const { banco } = bancoFalso();
  const { revolut } = revolutFalsa({}, { o9: { state: "pending" } });
  const responder = criarWebhook({ segredo: async () => "wsk_da_base", banco, revolut });
  const corpo = '{"event":"ORDER_COMPLETED","order_id":"o9"}';
  const carimbo = String(Date.now());
  const pedido = (assinatura: string) => new Request("https://x/", { method: "POST", body: corpo, headers: { "revolut-signature": assinatura, "revolut-request-timestamp": carimbo } });
  assert.equal((await responder(pedido(await assinar(corpo, carimbo, "wsk_da_base")))).status, 200);
  assert.equal((await responder(pedido(await assinar(corpo, carimbo, SEGREDO)))).status, 401);
});
