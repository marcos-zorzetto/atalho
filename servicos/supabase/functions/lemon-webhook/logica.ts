/**
 * Webhook da Lemon Squeezy: transforma cada aviso (pedido, assinatura,
 * renovação, cancelamento, reembolso) em linhas no banco. Sem dependências e
 * sem nada específico do Deno, para ser testado também no Node.
 *
 * Avisos repetidos (a Lemon Squeezy reenvia se não receber resposta) não
 * duplicam nada: tudo é gravado com o id da própria Lemon Squeezy.
 */

export type Status = "on_trial" | "active" | "paused" | "past_due" | "unpaid" | "cancelled" | "expired";

export interface Produto {
  id: string;
  tipo: "assinatura" | "pagina" | "componente";
}

/** O que o webhook precisa do banco (implementado com a API REST do Supabase). */
export interface Banco {
  produtoDaVariante(variante: string): Promise<Produto | null>;
  usuarioDaAssinatura(assinatura: string): Promise<string | null>;
  gravarAssinatura(linha: {
    id: string;
    usuario_id: string;
    produto_id: string | null;
    status: Status;
    renova_em: string | null;
    termina_em: string | null;
    portal_url: string | null;
  }): Promise<void>;
  gravarCompra(linha: { id: string; usuario_id: string; produto_id: string; pedido_lemon: string }): Promise<void>;
  reembolsarPedido(pedido: string): Promise<void>;
  gravarPagamento(linha: { id: string; usuario_id: string | null; produto_id: string | null; valor_centavos: number; moeda: string }): Promise<void>;
  reembolsarPagamento(id: string): Promise<void>;
}

export interface Resultado {
  status: number;
  mensagem: string;
}

const STATUS_VALIDOS = new Set<Status>(["on_trial", "active", "paused", "past_due", "unpaid", "cancelled", "expired"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Confere o cabeçalho X-Signature: HMAC SHA-256 (hex) do corpo, com o segredo do webhook. */
export async function assinaturaValida(corpo: string, assinatura: string | null, segredo: string): Promise<boolean> {
  if (!assinatura || !segredo || !/^[0-9a-f]{64}$/i.test(assinatura)) return false;
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const bytes = new Uint8Array(assinatura.match(/../g)!.map((par) => parseInt(par, 16)));
  // verify() compara em tempo constante: não vaza o segredo pelo tempo de resposta
  return crypto.subtle.verify("HMAC", chave, bytes, new TextEncoder().encode(corpo));
}

const texto = (valor: unknown): string | null => (valor === null || valor === undefined || valor === "" ? null : String(valor));

export async function processarEvento(evento: any, banco: Banco): Promise<Resultado> {
  const nome: string = evento?.meta?.event_name ?? "";
  const dados = evento?.data;
  const atributos = dados?.attributes ?? {};
  const usuarioInformado = texto(evento?.meta?.custom_data?.usuario_id);
  if (usuarioInformado && !UUID.test(usuarioInformado)) return { status: 400, mensagem: "usuario_id inválido" };

  if (nome === "order_created") {
    if (atributos.status !== "paid") return { status: 200, mensagem: `pedido ${dados.id} ainda não pago (${atributos.status})` };
    const variante = texto(atributos.first_order_item?.variant_id);
    const produto = variante ? await banco.produtoDaVariante(variante) : null;
    await banco.gravarPagamento({
      id: `pedido-${dados.id}`,
      usuario_id: usuarioInformado,
      produto_id: produto?.id ?? null,
      valor_centavos: Number(atributos.total) || 0,
      moeda: String(atributos.currency || "EUR").toUpperCase(),
    });
    // Assinaturas liberam acesso pelo evento subscription_created; aqui só compras avulsas
    if (produto && produto.tipo !== "assinatura") {
      if (!usuarioInformado) return { status: 422, mensagem: "compra sem usuario_id: não há a quem liberar" };
      await banco.gravarCompra({ id: `pedido-${dados.id}-${produto.id}`, usuario_id: usuarioInformado, produto_id: produto.id, pedido_lemon: String(dados.id) });
      return { status: 200, mensagem: `compra de ${produto.id} liberada` };
    }
    return { status: 200, mensagem: produto ? "pagamento da assinatura registrado" : `variante ${variante} sem produto cadastrado` };
  }

  if (nome === "order_refunded") {
    await banco.reembolsarPedido(String(dados.id));
    await banco.reembolsarPagamento(`pedido-${dados.id}`);
    return { status: 200, mensagem: `pedido ${dados.id} reembolsado` };
  }

  if (nome.startsWith("subscription_") && dados?.type === "subscriptions") {
    const status = atributos.status as Status;
    if (!STATUS_VALIDOS.has(status)) return { status: 400, mensagem: `status desconhecido: ${status}` };
    const usuario = usuarioInformado ?? (await banco.usuarioDaAssinatura(String(dados.id)));
    if (!usuario) return { status: 422, mensagem: "assinatura sem usuario_id" };
    const variante = texto(atributos.variant_id);
    const produto = variante ? await banco.produtoDaVariante(variante) : null;
    await banco.gravarAssinatura({
      id: String(dados.id),
      usuario_id: usuario,
      produto_id: produto?.id ?? null,
      status,
      renova_em: texto(atributos.renews_at),
      termina_em: texto(atributos.ends_at),
      portal_url: texto(atributos.urls?.customer_portal),
    });
    return { status: 200, mensagem: `assinatura ${dados.id}: ${status}` };
  }

  if (nome === "subscription_payment_success" || nome === "subscription_payment_refunded") {
    const assinatura = texto(atributos.subscription_id);
    const usuario = usuarioInformado ?? (assinatura ? await banco.usuarioDaAssinatura(assinatura) : null);
    const id = `fatura-${dados.id}`;
    if (nome === "subscription_payment_refunded") {
      await banco.reembolsarPagamento(id);
      return { status: 200, mensagem: `fatura ${dados.id} reembolsada` };
    }
    await banco.gravarPagamento({ id, usuario_id: usuario, produto_id: null, valor_centavos: Number(atributos.total) || 0, moeda: String(atributos.currency || "EUR").toUpperCase() });
    return { status: 200, mensagem: `renovação ${dados.id} registrada` };
  }

  return { status: 200, mensagem: `evento ${nome || "(sem nome)"} ignorado` };
}

/** Banco de verdade: API REST do Supabase com a chave de serviço (nunca sai do servidor). */
export function bancoSupabase(url: string, chave: string, buscar: typeof fetch = fetch): Banco {
  const cabecalhos: Record<string, string> = { apikey: chave, "Content-Type": "application/json" };
  if (chave.startsWith("eyJ")) cabecalhos.Authorization = `Bearer ${chave}`;
  const rest = async (caminho: string, opcoes: RequestInit = {}) => {
    const resposta = await buscar(`${url}/rest/v1/${caminho}`, { ...opcoes, headers: { ...cabecalhos, ...(opcoes.headers as Record<string, string>) } });
    if (!resposta.ok) throw new Error(`Supabase ${resposta.status}: ${(await resposta.text()).slice(0, 300)}`);
    return resposta.status === 204 || resposta.headers.get("content-length") === "0" ? null : resposta.json();
  };
  const inserir = (tabela: string, linha: object, conflito: "merge" | "ignore") =>
    rest(`${tabela}?on_conflict=id`, { method: "POST", body: JSON.stringify(linha), headers: { Prefer: `resolution=${conflito}-duplicates,return=minimal` } });
  return {
    async produtoDaVariante(variante) {
      const linhas = await rest(`produtos?select=id,tipo&variante_lemon=eq.${encodeURIComponent(variante)}`);
      return linhas?.[0] ?? null;
    },
    async usuarioDaAssinatura(assinatura) {
      const linhas = await rest(`assinaturas?select=usuario_id&id=eq.${encodeURIComponent(assinatura)}`);
      return linhas?.[0]?.usuario_id ?? null;
    },
    gravarAssinatura: (linha) => inserir("assinaturas", { ...linha, atualizado_em: new Date().toISOString() }, "merge").then(() => {}),
    gravarCompra: (linha) => inserir("compras", linha, "ignore").then(() => {}),
    gravarPagamento: (linha) => inserir("pagamentos", linha, "ignore").then(() => {}),
    reembolsarPedido: (pedido) =>
      rest(`compras?pedido_lemon=eq.${encodeURIComponent(pedido)}`, { method: "PATCH", body: JSON.stringify({ reembolsada: true }), headers: { Prefer: "return=minimal" } }).then(() => {}),
    reembolsarPagamento: (id) =>
      rest(`pagamentos?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ reembolsado: true }), headers: { Prefer: "return=minimal" } }).then(() => {}),
  };
}

/** Recebe a requisição HTTP inteira: confere a assinatura, processa e responde. */
export function criarWebhook(config: { segredo: string; banco: Banco }) {
  return async (requisicao: Request): Promise<Response> => {
    if (requisicao.method !== "POST") return new Response("Use POST", { status: 405 });
    const corpo = await requisicao.text();
    if (!(await assinaturaValida(corpo, requisicao.headers.get("x-signature"), config.segredo))) {
      return new Response("Assinatura inválida", { status: 401 });
    }
    let evento: unknown;
    try {
      evento = JSON.parse(corpo);
    } catch {
      return new Response("JSON inválido", { status: 400 });
    }
    try {
      const resultado = await processarEvento(evento, config.banco);
      return new Response(resultado.mensagem, { status: resultado.status });
    } catch (erro) {
      // 500 faz a Lemon Squeezy tentar de novo mais tarde
      console.error(erro);
      return new Response("Erro ao gravar", { status: 500 });
    }
  };
}
