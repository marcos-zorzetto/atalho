// Testes do webhook da Lemon Squeezy. Rodar: node --test servicos/supabase/functions/lemon-webhook/logica.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { assinaturaValida, bancoSupabase, criarWebhook, processarEvento, type Banco } from "./logica.ts";

const SEGREDO = "segredo-de-teste";
const USUARIO = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const assinar = (corpo: string, segredo = SEGREDO) => createHmac("sha256", segredo).update(corpo).digest("hex");

/** Banco em memória com o mesmo comportamento das tabelas (ids únicos, merge e ignore). */
function bancoFalso() {
  const tabelas = {
    produtos: new Map([
      ["111", { id: "pro-mensal", tipo: "assinatura" as const }],
      ["222", { id: "pagina-crm", tipo: "pagina" as const }],
    ]),
    assinaturas: new Map<string, any>(),
    compras: new Map<string, any>(),
    pagamentos: new Map<string, any>(),
  };
  const banco: Banco = {
    produtoDaVariante: async (v) => tabelas.produtos.get(v) ?? null,
    usuarioDaAssinatura: async (id) => tabelas.assinaturas.get(id)?.usuario_id ?? null,
    gravarAssinatura: async (l) => void tabelas.assinaturas.set(l.id, { ...tabelas.assinaturas.get(l.id), ...l }),
    gravarCompra: async (l) => void (tabelas.compras.has(l.id) || tabelas.compras.set(l.id, { ...l, reembolsada: false })),
    reembolsarPedido: async (p) => tabelas.compras.forEach((c) => c.pedido_lemon === p && (c.reembolsada = true)),
    gravarPagamento: async (l) => void (tabelas.pagamentos.has(l.id) || tabelas.pagamentos.set(l.id, { ...l, reembolsado: false })),
    reembolsarPagamento: async (id) => void (tabelas.pagamentos.has(id) && (tabelas.pagamentos.get(id).reembolsado = true)),
  };
  return { banco, tabelas };
}

const pedido = (variante: number, extra: object = {}) => ({
  meta: { event_name: "order_created", custom_data: { usuario_id: USUARIO } },
  data: { type: "orders", id: "9001", attributes: { status: "paid", total: 900, currency: "eur", first_order_item: { variant_id: variante }, ...extra } },
});

const assinatura = (status: string, extra: object = {}, meta: object = { custom_data: { usuario_id: USUARIO } }) => ({
  meta: { event_name: "subscription_updated", ...meta },
  data: {
    type: "subscriptions",
    id: "77",
    attributes: { status, variant_id: 111, renews_at: "2026-11-08T00:00:00Z", ends_at: null, urls: { customer_portal: "https://loja.lemonsqueezy.com/billing" }, ...extra },
  },
});

test("assinatura digital: aceita a correta, recusa alterada, faltando ou com outro segredo", async () => {
  const corpo = JSON.stringify(pedido(222));
  assert.equal(await assinaturaValida(corpo, assinar(corpo), SEGREDO), true);
  assert.equal(await assinaturaValida(corpo + " ", assinar(corpo), SEGREDO), false);
  assert.equal(await assinaturaValida(corpo, null, SEGREDO), false);
  assert.equal(await assinaturaValida(corpo, assinar(corpo, "outro"), SEGREDO), false);
  assert.equal(await assinaturaValida(corpo, "nao-e-hex", SEGREDO), false);
  assert.equal(await assinaturaValida(corpo, assinar(corpo), ""), false);
});

test("compra avulsa paga libera a página e registra o pagamento; aviso repetido não duplica", async () => {
  const { banco, tabelas } = bancoFalso();
  const r = await processarEvento(pedido(222), banco);
  assert.equal(r.status, 200);
  await processarEvento(pedido(222), banco);
  assert.deepEqual([...tabelas.compras.values()], [{ id: "pedido-9001-pagina-crm", usuario_id: USUARIO, produto_id: "pagina-crm", pedido_lemon: "9001", reembolsada: false }]);
  assert.equal(tabelas.pagamentos.size, 1);
  assert.equal(tabelas.pagamentos.get("pedido-9001").valor_centavos, 900);
  assert.equal(tabelas.pagamentos.get("pedido-9001").moeda, "EUR");
});

test("pedido ainda não pago não libera nada", async () => {
  const { banco, tabelas } = bancoFalso();
  await processarEvento(pedido(222, { status: "pending" }), banco);
  assert.equal(tabelas.compras.size, 0);
  assert.equal(tabelas.pagamentos.size, 0);
});

test("reembolso tira o acesso e marca o pagamento", async () => {
  const { banco, tabelas } = bancoFalso();
  await processarEvento(pedido(222), banco);
  await processarEvento({ meta: { event_name: "order_refunded" }, data: { type: "orders", id: "9001", attributes: {} } }, banco);
  assert.equal(tabelas.compras.get("pedido-9001-pagina-crm").reembolsada, true);
  assert.equal(tabelas.pagamentos.get("pedido-9001").reembolsado, true);
});

test("pedido da assinatura registra o pagamento, mas o acesso vem do evento da assinatura", async () => {
  const { banco, tabelas } = bancoFalso();
  await processarEvento(pedido(111, { total: 490 }), banco);
  assert.equal(tabelas.compras.size, 0);
  assert.equal(tabelas.pagamentos.get("pedido-9001").valor_centavos, 490);
});

test("assinatura: criada, cancelada (com fim do período) e expirada", async () => {
  const { banco, tabelas } = bancoFalso();
  await processarEvento({ ...assinatura("active"), meta: { event_name: "subscription_created", custom_data: { usuario_id: USUARIO } } }, banco);
  assert.deepEqual(tabelas.assinaturas.get("77"), {
    id: "77", usuario_id: USUARIO, produto_id: "pro-mensal", status: "active", renova_em: "2026-11-08T00:00:00Z", termina_em: null, portal_url: "https://loja.lemonsqueezy.com/billing",
  });
  // Eventos sem custom_data: o usuário vem da assinatura já gravada
  await processarEvento(assinatura("cancelled", { ends_at: "2026-11-08T00:00:00Z" }, {}), banco);
  assert.equal(tabelas.assinaturas.get("77").status, "cancelled");
  assert.equal(tabelas.assinaturas.get("77").termina_em, "2026-11-08T00:00:00Z");
  await processarEvento(assinatura("expired", {}, {}), banco);
  assert.equal(tabelas.assinaturas.get("77").status, "expired");
});

test("renovação mensal entra no faturamento", async () => {
  const { banco, tabelas } = bancoFalso();
  await processarEvento(assinatura("active"), banco);
  const fatura = { meta: { event_name: "subscription_payment_success" }, data: { type: "subscription-invoices", id: "5", attributes: { subscription_id: 77, total: 490, currency: "EUR" } } };
  await processarEvento(fatura, banco);
  await processarEvento(fatura, banco);
  assert.equal(tabelas.pagamentos.size, 1);
  assert.equal(tabelas.pagamentos.get("fatura-5").usuario_id, USUARIO);
});

test("dados estranhos são recusados em vez de gravados", async () => {
  const { banco, tabelas } = bancoFalso();
  assert.equal((await processarEvento(assinatura("hackeado"), banco)).status, 400);
  const injecao = pedido(222);
  injecao.meta.custom_data.usuario_id = "'; drop table compras; --";
  assert.equal((await processarEvento(injecao, banco)).status, 400);
  const semUsuario = pedido(222);
  delete (semUsuario.meta as any).custom_data;
  assert.equal((await processarEvento(semUsuario, banco)).status, 422);
  assert.equal(tabelas.compras.size, 0);
  assert.equal((await processarEvento({ meta: { event_name: "affiliate_activated" }, data: {} }, banco)).status, 200);
});

test("requisição HTTP completa: 401 sem assinatura, 200 com, 500 se o banco falhar (a Lemon tenta de novo)", async () => {
  const { banco } = bancoFalso();
  const webhook = criarWebhook({ segredo: SEGREDO, banco });
  const corpo = JSON.stringify(pedido(222));
  const req = (assinatura: string | null, b = corpo) =>
    new Request("https://x/functions/v1/lemon-webhook", { method: "POST", body: b, headers: assinatura ? { "x-signature": assinatura } : {} });
  assert.equal((await webhook(req(null))).status, 401);
  assert.equal((await webhook(req(assinar(corpo)))).status, 200);
  assert.equal((await webhook(new Request("https://x", { method: "GET" }))).status, 405);
  assert.equal((await webhook(req(assinar("{x"), "{x"))).status, 400);
  const quebrado = criarWebhook({ segredo: SEGREDO, banco: { ...banco, gravarCompra: async () => { throw new Error("fora do ar"); } } });
  const original = console.error;
  console.error = () => {};
  try {
    assert.equal((await quebrado(req(assinar(corpo)))).status, 500);
  } finally {
    console.error = original;
  }
});

test("banco do Supabase: monta as chamadas REST certas, com a chave só nos cabeçalhos", async () => {
  const chamadas: { url: string; metodo: string; corpo: any; cabecalhos: any }[] = [];
  const buscar = (async (url: string, opcoes: any) => {
    chamadas.push({ url, metodo: opcoes.method || "GET", corpo: opcoes.body ? JSON.parse(opcoes.body) : null, cabecalhos: opcoes.headers });
    if (url.includes("produtos?")) return new Response(JSON.stringify([{ id: "pagina-crm", tipo: "pagina" }]), { status: 200 });
    return new Response(null, { status: 201, headers: { "content-length": "0" } });
  }) as typeof fetch;
  const banco = bancoSupabase("https://abc.supabase.co", "sb_secret_x", buscar);
  await processarEvento(pedido(222), banco);
  assert.equal(chamadas[0].url, "https://abc.supabase.co/rest/v1/produtos?select=id,tipo&variante_lemon=eq.222");
  assert.equal(chamadas[1].url, "https://abc.supabase.co/rest/v1/pagamentos?on_conflict=id");
  assert.match(chamadas[1].cabecalhos.Prefer, /resolution=ignore-duplicates/);
  assert.equal(chamadas[2].url, "https://abc.supabase.co/rest/v1/compras?on_conflict=id");
  assert.equal(chamadas[2].corpo.produto_id, "pagina-crm");
  for (const c of chamadas) {
    assert.equal(c.cabecalhos.apikey, "sb_secret_x");
    assert.equal(c.cabecalhos.Authorization, undefined, "chave nova (sb_secret_) não pode ir no Authorization");
    assert.doesNotMatch(c.url, /sb_secret/);
  }
});
