// Função do Supabase (Deno) que recebe os avisos da Revolut Business (Merchant API).
// Publicar: npx supabase functions deploy revolut-webhook --no-verify-jwt
// (sem JWT porque quem chama é a Revolut; a segurança é a assinatura HMAC conferida em _shared/revolut.ts)
// Segredos (Supabase → Edge Functions → Secrets):
//   REVOLUT_SECRET_KEY       chave secreta da Merchant API (sk_...)
//   REVOLUT_WEBHOOK_SECRET   "signing secret" do webhook (wsk_...). Opcional: o botão "Ligar a loja"
//                            do painel cria o webhook e guarda o segredo na tabela config_revolut.
//   REVOLUT_SANDBOX          "1" para testar no ambiente de testes da Revolut (opcional)
import { bancoSupabase, criarWebhook, revolutApi } from "../_shared/revolut.ts";
import { ambiente } from "../_shared/ambiente.ts";

const a = ambiente();
if (!a.revolutChave || !a.url || !a.chaveServico) console.error("Faltam REVOLUT_SECRET_KEY ou as chaves do Supabase.");
const banco = bancoSupabase(a.url, a.chaveServico);

// Segredo guardado na base de dados: lido uma vez e guardado em memória durante 5 minutos
let guardado = { valor: "", ate: 0 };
async function segredo(): Promise<string> {
  if (a.webhookSecreto) return a.webhookSecreto;
  if (Date.now() < guardado.ate) return guardado.valor;
  guardado = { valor: (await banco.lerConfig("webhook_segredo")) ?? "", ate: Date.now() + 5 * 60 * 1000 };
  return guardado.valor;
}

a.deno.serve(criarWebhook({ segredo, banco, revolut: revolutApi(a.revolutChave, { sandbox: a.sandbox }) }));
