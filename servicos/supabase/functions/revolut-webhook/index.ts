// Função do Supabase (Deno) que recebe os avisos da Revolut Business (Merchant API).
// Publicar: npx supabase functions deploy revolut-webhook --no-verify-jwt
// (sem JWT porque quem chama é a Revolut; a segurança é a assinatura HMAC conferida em _shared/revolut.ts)
// Segredos (Supabase → Edge Functions → Secrets):
//   REVOLUT_SECRET_KEY       chave secreta da Merchant API (sk_...)
//   REVOLUT_WEBHOOK_SECRET   "signing secret" do webhook (wsk_...)
//   REVOLUT_SANDBOX          "1" para testar no ambiente de testes da Revolut (opcional)
import { bancoSupabase, criarWebhook, revolutApi } from "../_shared/revolut.ts";
import { ambiente } from "../_shared/ambiente.ts";

const a = ambiente();
if (!a.webhookSecreto || !a.revolutChave || !a.url || !a.chaveServico) console.error("Faltam REVOLUT_WEBHOOK_SECRET, REVOLUT_SECRET_KEY ou as chaves do Supabase.");

a.deno.serve(criarWebhook({ segredo: a.webhookSecreto, banco: bancoSupabase(a.url, a.chaveServico), revolut: revolutApi(a.revolutChave, { sandbox: a.sandbox }) }));
