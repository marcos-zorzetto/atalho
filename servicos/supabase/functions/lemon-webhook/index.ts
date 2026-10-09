// Função do Supabase (Deno) que recebe os avisos da Lemon Squeezy.
// Publicar: npx supabase functions deploy lemon-webhook --no-verify-jwt
// (sem JWT porque quem chama é a Lemon Squeezy; a segurança é a assinatura HMAC conferida em logica.ts)
// Segredo: LEMON_WEBHOOK_SECRET (o mesmo "Signing secret" do webhook na Lemon Squeezy).
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem em toda função do Supabase.
import { bancoSupabase, criarWebhook } from "./logica.ts";

// Deno já existe no ambiente do Supabase; o globalThis evita redeclarar o tipo
const deno = (globalThis as any).Deno as { env: { get(nome: string): string | undefined }; serve(handler: (r: Request) => Promise<Response>): void };

const segredo = deno.env.get("LEMON_WEBHOOK_SECRET") ?? "";
const url = deno.env.get("SUPABASE_URL") ?? "";
// Projetos com as chaves antigas desligadas recebem as novas em SUPABASE_SECRET_KEYS ({"default": "sb_secret_..."})
const secretas = (() => {
  try {
    return Object.values(JSON.parse(deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}")) as string[];
  } catch {
    return [];
  }
})();
const chave = deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || secretas[0] || "";
if (!segredo || !url || !chave) console.error("Faltam LEMON_WEBHOOK_SECRET, SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.");

deno.serve(criarWebhook({ segredo, banco: bancoSupabase(url, chave) }));
