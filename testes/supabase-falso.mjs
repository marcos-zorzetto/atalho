/**
 * Supabase de mentira para os testes de navegador: liga as contas no site
 * (site/config.js), coloca uma sessão no navegador e responde às consultas da
 * API REST como o Supabase real responderia. Nada sai para a internet.
 *
 * As regras de segurança de verdade são testadas no banco (scripts/supabase.test.mjs);
 * aqui o foco é a tela: o que cada tipo de pessoa vê.
 */
export const PROJETO = "https://teste-atalho.supabase.co";
const CHAVE = "sb_publishable_teste";

export const PESSOAS = {
  admin: { id: "00000000-0000-4000-8000-000000000001", email: "dono@exemplo.com", nome: "Dono do Site", admin: true },
  membro: { id: "00000000-0000-4000-8000-000000000002", email: "ana@exemplo.com", nome: "Ana Souza", admin: false },
};

const base64url = (objeto) => Buffer.from(JSON.stringify(objeto)).toString("base64url");

function sessao(pessoa) {
  const expira = Math.floor(Date.now() / 1000) + 3600;
  const token = `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url({ sub: pessoa.id, email: pessoa.email, role: "authenticated", aud: "authenticated", exp: expira })}.assinatura-de-teste`;
  return {
    access_token: token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: expira,
    refresh_token: "renovacao-de-teste",
    user: { id: pessoa.id, aud: "authenticated", role: "authenticated", email: pessoa.email, user_metadata: { nome: pessoa.nome }, app_metadata: {}, created_at: "2026-09-01T12:00:00Z" },
  };
}

const json = (rota, corpo, status = 200) =>
  rota.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" }, body: JSON.stringify(corpo) });

/**
 * Prepara a aba. `pessoa`: "admin", "membro" ou null (visitante).
 * `conteudos`: { id: html } servidos pela tabela "conteudos".
 * Retorna a lista de requisições feitas à API, para conferir nos testes.
 */
export async function supabaseFalso(contexto, { pessoa = null, conteudos = {}, usuarios = 3 } = {}) {
  const quem = pessoa ? PESSOAS[pessoa] : null;
  const pedidos = [];

  await contexto.route("**/site/config.js", (rota) =>
    rota.fulfill({
      contentType: "text/javascript",
      body: `window.ATALHO_CONFIG = { supabase: { url: "${PROJETO}", chavePublica: "${CHAVE}" }, assistente: { url: "" } };`,
    })
  );

  if (quem) {
    const chave = `sb-${new URL(PROJETO).hostname.split(".")[0]}-auth-token`;
    // Só na janela principal: o script também roda em iframes isolados, que não têm localStorage
    await contexto.addInitScript(([k, v]) => {
      if (window === window.top) localStorage.setItem(k, v);
    }, [chave, JSON.stringify(sessao(quem))]);
  }

  await contexto.route(`${PROJETO}/**`, async (rota) => {
    const pedido = rota.request();
    if (pedido.method() === "OPTIONS") return json(rota, {});
    const endereco = new URL(pedido.url());
    const caminho = endereco.pathname;
    const logado = Boolean(quem) && /Bearer ey/.test(pedido.headers().authorization || "");
    pedidos.push({ metodo: pedido.method(), caminho, logado });

    if (caminho.startsWith("/auth/v1/user")) return quem ? json(rota, sessao(quem).user) : json(rota, { message: "invalid JWT" }, 401);
    if (caminho.startsWith("/auth/v1/logout")) return rota.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
    if (caminho.startsWith("/auth/v1/")) return json(rota, {});

    // Mesmo comportamento das regras do banco: sem login, nada
    if (!logado) {
      if (caminho.startsWith("/rest/v1/rpc/")) return json(rota, { code: "42501", message: "permission denied for function" }, 401);
      return json(rota, { code: "42501", message: "permission denied for table" }, 401);
    }

    if (caminho === "/rest/v1/conteudos") {
      const id = endereco.searchParams.get("id")?.replace(/^eq\./, "");
      return json(rota, conteudos[id] ? [{ html: conteudos[id], titulo: id }] : []);
    }
    if (caminho === "/rest/v1/perfis") return json(rota, [{ nome: quem.nome }]);
    if (caminho === "/rest/v1/favoritos") return json(rota, [{ componente_id: "modal" }]);
    if (caminho === "/rest/v1/lista_espera_pro") return json(rota, []);
    if (caminho === "/rest/v1/rpc/eh_admin") return json(rota, quem.admin);

    if (caminho.startsWith("/rest/v1/rpc/admin_")) {
      if (!quem.admin) return json(rota, { code: "42501", message: "acesso restrito ao administrador" }, 403);
      const funcao = caminho.split("/").pop();
      const hoje = new Date();
      const lista = Array.from({ length: usuarios }, (_, i) => ({
        id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
        email: i === 0 ? PESSOAS.admin.email : `pessoa${i}@exemplo.com`,
        nome: i === 0 ? PESSOAS.admin.nome : `Pessoa ${i}`,
        criado_em: new Date(hoje - i * 86400000).toISOString(),
        ultimo_acesso: i % 3 ? null : hoje.toISOString(),
        confirmado: i % 4 !== 3,
        lista_espera: i % 2 === 1,
        favoritos: i,
        admin: i === 0,
        total: usuarios,
      }));
      const corpo = JSON.parse(pedido.postData() || "{}");
      const respostas = {
        admin_resumo: { usuarios, confirmados: usuarios - 1, novos_7_dias: Math.min(usuarios, 7), ativos_30_dias: 2, lista_espera: Math.floor(usuarios / 2), favoritos: 12, conteudos: 6 },
        admin_cadastros_por_dia: Array.from({ length: corpo.dias || 30 }, (_, i) => ({ dia: new Date(hoje - (29 - i) * 86400000).toISOString().slice(0, 10), cadastros: (i * 7) % 5 })),
        admin_usuarios: lista
          .filter((u) => !corpo.busca || `${u.email} ${u.nome}`.toLowerCase().includes(corpo.busca.toLowerCase()))
          .map((u, _, filtrados) => ({ ...u, total: filtrados.length }))
          .slice(corpo.deslocamento || 0, (corpo.deslocamento || 0) + (corpo.limite || 25)),
        admin_lista_espera: lista.filter((u) => u.lista_espera).map((u) => ({ email: u.email, nome: u.nome, entrou_em: u.criado_em })),
        admin_conteudos: [{ id: "loja", tipo: "exemplo", titulo: "Loja virtual", tamanho: 8816, atualizado_em: hoje.toISOString() }],
      };
      return json(rota, respostas[funcao] ?? []);
    }
    return json(rota, []);
  });

  return pedidos;
}
