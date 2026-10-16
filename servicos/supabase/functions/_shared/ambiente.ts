// Variáveis de ambiente comuns às funções da Revolut (lidas uma vez, no arranque).
// SUPABASE_URL, SUPABASE_ANON_KEY e a chave de serviço já existem em toda função do Supabase.
export function ambiente() {
  // Deno já existe no ambiente do Supabase; o globalThis evita redeclarar o tipo
  const deno = (globalThis as any).Deno as { env: { get(nome: string): string | undefined }; serve(handler: (r: Request) => Promise<Response>): void };
  const env = (nome: string) => deno.env.get(nome) ?? "";
  // Projetos com as chaves antigas desligadas recebem as novas em SUPABASE_SECRET_KEYS / SUPABASE_PUBLISHABLE_KEYS
  const primeira = (nome: string) => {
    try {
      return (Object.values(JSON.parse(env(nome) || "{}")) as string[])[0] ?? "";
    } catch {
      return "";
    }
  };
  return {
    deno,
    url: env("SUPABASE_URL"),
    chaveServico: env("SUPABASE_SERVICE_ROLE_KEY") || primeira("SUPABASE_SECRET_KEYS"),
    chavePublica: env("SUPABASE_ANON_KEY") || primeira("SUPABASE_PUBLISHABLE_KEYS"),
    revolutChave: env("REVOLUT_SECRET_KEY"),
    webhookSecreto: env("REVOLUT_WEBHOOK_SECRET"),
    sandbox: env("REVOLUT_SANDBOX") === "1",
    site: env("ATALHO_URL") || "https://atalho.com.pt/",
  };
}
