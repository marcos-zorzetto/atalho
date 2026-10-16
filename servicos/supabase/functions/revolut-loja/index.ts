// Função do Supabase (Deno) chamada pelo site com a sessão da pessoa:
//   POST { "acao": "checkout", "produto": "pro-mensal" }  → { url } da página de pagamento da Revolut
//   POST { "acao": "cancelar", "assinatura": "<id>" }     → cancela a própria subscrição
// Publicar: npx supabase functions deploy revolut-loja
// Segredos: REVOLUT_SECRET_KEY, ATALHO_URL (ex.: https://atalho.com.pt/) e, para testes, REVOLUT_SANDBOX=1.
import { bancoSupabase, cancelar, criarCheckout, revolutApi, usuarioDoToken } from "../_shared/revolut.ts";
import { ambiente } from "../_shared/ambiente.ts";

const a = ambiente();
const banco = bancoSupabase(a.url, a.chaveServico);
const revolut = revolutApi(a.revolutChave, { sandbox: a.sandbox });

const cors = (origem: string | null) => {
  const permitida = origem && (origem === new URL(a.site).origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origem)) ? origem : new URL(a.site).origin;
  return { "Access-Control-Allow-Origin": permitida, "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", Vary: "Origin" };
};

a.deno.serve(async (req: Request) => {
  const cabecalhos = { ...cors(req.headers.get("origin")), "Content-Type": "application/json; charset=utf-8" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cabecalhos });
  if (req.method !== "POST") return new Response(JSON.stringify({ erro: "Use POST" }), { status: 405, headers: cabecalhos });
  const responder = (status: number, corpo: unknown) => new Response(JSON.stringify(corpo), { status, headers: cabecalhos });
  if (!a.revolutChave) return responder(503, { erro: "Os pagamentos ainda não estão ligados." });
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const usuario = await usuarioDoToken(a.url, a.chavePublica, token);
  if (!usuario) return responder(401, { erro: "Entre na sua conta para continuar." });
  let pedido: any;
  try {
    pedido = await req.json();
  } catch {
    return responder(400, { erro: "Pedido inválido." });
  }
  try {
    const r =
      pedido?.acao === "checkout"
        ? await criarCheckout({ usuario, produtoId: String(pedido.produto ?? "") }, { banco, revolut, site: a.site })
        : pedido?.acao === "cancelar"
          ? await cancelar({ usuarioId: usuario.id, assinaturaId: String(pedido.assinatura ?? "") }, { banco, revolut })
          : { status: 400, mensagem: "Ação desconhecida." };
    return responder(r.status, r.status < 300 ? (r.corpo ?? { ok: true, mensagem: r.mensagem }) : { erro: r.mensagem });
  } catch (erro) {
    console.error(erro);
    return responder(502, { erro: "Não foi possível falar com a Revolut. Tente de novo daqui a pouco." });
  }
});
