/**
 * Testa servicos/supabase/schema.sql num PostgreSQL de verdade (PGlite), imitando
 * o Supabase: papéis anon/authenticated, auth.users e auth.uid() lendo o token.
 * Garante que as regras de segurança fazem o que prometem antes de irem ao ar.
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { RAIZ } from "./docs.mjs";

const ADMIN = "00000000-0000-4000-8000-000000000001";
const ANA = "00000000-0000-4000-8000-000000000002";
const BRUNO = "00000000-0000-4000-8000-000000000003";

// ATALHO_SCHEMA permite testar outra versão do arquivo (ex.: a que foi colada no Supabase)
const SCHEMA = process.env.ATALHO_SCHEMA || path.join(RAIZ, "servicos", "supabase", "schema.sql");

let db;

/** Roda a consulta como um visitante (anon) ou como um usuário logado. */
async function como(usuario, sql, parametros = []) {
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [usuario || ""]);
    await tx.exec(`set local role ${usuario ? "authenticated" : "anon"}`);
    return (await tx.query(sql, parametros)).rows;
  });
}

const negado = /permission denied|acesso restrito|violates row-level security/i;

before(async () => {
  db = new PGlite();
  // O mínimo do Supabase que o schema usa
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text unique,
      raw_user_meta_data jsonb default '{}'::jsonb,
      created_at timestamptz default now(),
      last_sign_in_at timestamptz,
      email_confirmed_at timestamptz
    );
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    -- Como o Supabase faz por padrão: tabelas novas ficam visíveis para a API (o RLS filtra)
    grant usage on schema public to service_role;
    -- Igual ao projeto de produção: "Automatically expose new tables" desligado, então
    -- só vale o que o schema.sql concede. ATALHO_EXPOR=1 imita a opção ligada.
    ${process.env.ATALHO_EXPOR ? "alter default privileges in schema public grant all on tables to anon, authenticated, service_role;" : ""}
  `);
  await db.exec(await readFile(SCHEMA, "utf8"));
  // Rodar duas vezes não pode quebrar (o guia diz que pode)
  await db.exec(await readFile(SCHEMA, "utf8"));

  await db.exec(`
    insert into auth.users (id, email, raw_user_meta_data, created_at, last_sign_in_at, email_confirmed_at) values
      ('${ADMIN}', 'dono@exemplo.com', '{"nome":"Dono do Site"}', now() - interval '40 days', now(), now()),
      ('${ANA}', 'ana@exemplo.com', '{"nome":"Ana Souza"}', now() - interval '2 days', now(), now()),
      ('${BRUNO}', 'bruno_100%@exemplo.com', '{}', now(), null, null);
    insert into public.administradores (usuario_id) values ('${ADMIN}');
    insert into public.conteudos (id, titulo, html) values ('loja', 'Loja virtual', '<!doctype html><title>Loja</title>');
  `);
});

test("cadastro cria o perfil com o nome enviado (ou a parte antes do @)", async () => {
  const { rows } = await db.query(`select id, nome from public.perfis order by nome`);
  assert.deepEqual(rows.map((r) => r.nome).sort(), ["Ana Souza", "Dono do Site", "bruno_100%"]);
});

test("visitante não lê conteúdo exclusivo; quem entrou lê", async () => {
  // Visitante só enxerga o nível "publico" (nenhum aqui): a lista volta vazia
  assert.deepEqual(await como(null, `select id from public.conteudos where acesso <> 'publico'`), []);
  assert.deepEqual(await como(ANA, `select id, titulo from public.conteudos`), [{ id: "loja", titulo: "Loja virtual" }]);
});

test("a chave secreta (service_role) publica e atualiza o conteúdo", async () => {
  await db.transaction(async (tx) => {
    await tx.exec("set local role service_role");
    await tx.query(`insert into public.conteudos (id, titulo, html) values ('teste-publicacao', 'Teste', '<p>1</p>')
      on conflict (id) do update set html = excluded.html`);
    await tx.query(`insert into public.conteudos (id, titulo, html) values ('teste-publicacao', 'Teste', '<p>2</p>')
      on conflict (id) do update set html = excluded.html`);
  });
  const { rows } = await db.query(`select html from public.conteudos where id = 'teste-publicacao'`);
  assert.equal(rows[0].html, "<p>2</p>");
  await db.query(`delete from public.conteudos where id = 'teste-publicacao'`);
});

test("membro não altera conteúdo exclusivo", async () => {
  await assert.rejects(como(ANA, `update public.conteudos set html = 'invadido'`), negado);
  await assert.rejects(como(ANA, `insert into public.conteudos (id, titulo, html) values ('x', 'x', 'x')`), negado);
  await assert.rejects(como(ANA, `delete from public.conteudos`), negado);
});

test("ninguém se promove a administrador pela API", async () => {
  await assert.rejects(como(ANA, `insert into public.administradores (usuario_id) values ('${ANA}')`), negado);
  await assert.rejects(como(ANA, `select * from public.administradores`), negado);
  assert.equal((await como(ANA, `select public.eh_admin() as admin`))[0].admin, false);
  assert.equal((await como(ADMIN, `select public.eh_admin() as admin`))[0].admin, true);
  await assert.rejects(como(null, `select public.eh_admin()`), negado);
});

test("funções do painel recusam quem não é administrador", async () => {
  for (const funcao of ["admin_resumo()", "admin_usuarios()", "admin_lista_espera()", "admin_conteudos()", "admin_cadastros_por_dia(7)"]) {
    await assert.rejects(como(ANA, `select * from public.${funcao}`), negado, `${funcao} liberou para um membro comum`);
    await assert.rejects(como(null, `select * from public.${funcao}`), negado, `${funcao} liberou para visitante`);
  }
});

test("painel: resumo, usuários, busca e paginação", async () => {
  await como(ANA, `insert into public.lista_espera_pro default values`);
  await como(ANA, `insert into public.favoritos (componente_id) values ('modal'), ('tabela')`);

  const [{ admin_resumo: resumo }] = await como(ADMIN, `select public.admin_resumo()`);
  assert.deepEqual(resumo, { usuarios: 3, confirmados: 2, novos_7_dias: 2, ativos_30_dias: 2, lista_espera: 1, favoritos: 2, conteudos: 1 });

  const todos = await como(ADMIN, `select * from public.admin_usuarios()`);
  assert.deepEqual(todos.map((u) => u.email), ["bruno_100%@exemplo.com", "ana@exemplo.com", "dono@exemplo.com"]);
  const ana = todos.find((u) => u.email === "ana@exemplo.com");
  assert.equal(ana.lista_espera, true);
  assert.equal(Number(ana.favoritos), 2);
  assert.equal(todos.find((u) => u.email === "dono@exemplo.com").admin, true);
  assert.equal(Number(todos[0].total), 3);

  // "%" na busca é texto, não curinga
  assert.deepEqual((await como(ADMIN, `select email from public.admin_usuarios('100%')`)).map((u) => u.email), ["bruno_100%@exemplo.com"]);
  assert.deepEqual((await como(ADMIN, `select email from public.admin_usuarios('souza')`)).map((u) => u.email), ["ana@exemplo.com"]);
  const pagina2 = await como(ADMIN, `select email, total from public.admin_usuarios('', 2, 2)`);
  assert.deepEqual(pagina2.map((u) => [u.email, Number(u.total)]), [["dono@exemplo.com", 3]]);

  assert.deepEqual((await como(ADMIN, `select email, nome from public.admin_lista_espera()`)), [{ email: "ana@exemplo.com", nome: "Ana Souza" }]);
  const [conteudo] = await como(ADMIN, `select id, tamanho from public.admin_conteudos()`);
  assert.equal(conteudo.id, "loja");

  const dias = await como(ADMIN, `select dia, cadastros from public.admin_cadastros_por_dia(7)`);
  assert.equal(dias.length, 7);
  assert.equal(dias.reduce((soma, d) => soma + Number(d.cadastros), 0), 2);
});

test("cada membro só vê os próprios favoritos e a própria entrada na lista", async () => {
  assert.equal((await como(BRUNO, `select * from public.favoritos`)).length, 0);
  assert.equal((await como(BRUNO, `select * from public.lista_espera_pro`)).length, 0);
  await assert.rejects(como(BRUNO, `insert into public.favoritos (usuario_id, componente_id) values ('${ANA}', 'modal')`), negado);
  assert.equal((await como(ANA, `select * from public.favoritos`)).length, 2);
});

test("loja: preços são públicos; assinaturas, compras e pagamentos não", async () => {
  const precos = await como(null, `select id, preco_centavos from public.produtos where tipo = 'assinatura' order by id`);
  assert.deepEqual(precos, [{ id: "pro-anual", preco_centavos: 3900 }, { id: "pro-mensal", preco_centavos: 490 }]);
  for (const tabela of ["assinaturas", "compras", "pagamentos"]) {
    await assert.rejects(como(null, `select * from public.${tabela}`), negado, `visitante leu ${tabela}`);
  }
  await assert.rejects(como(BRUNO, `select * from public.pagamentos`), negado);
});

test("loja: ninguém se dá o Pro nem compra sem pagar pela API", async () => {
  await assert.rejects(como(BRUNO, `insert into public.assinaturas (id, usuario_id, status) values ('falsa', '${BRUNO}', 'active')`), negado);
  await assert.rejects(como(BRUNO, `insert into public.compras (id, usuario_id, produto_id, pedido_lemon) values ('falsa', '${BRUNO}', 'pro-mensal', 'x')`), negado);
  await assert.rejects(como(BRUNO, `update public.produtos set preco_centavos = 0`), negado);
  await assert.rejects(como(BRUNO, `update public.conteudos set acesso = 'membro'`), negado);
});

test("loja: conteúdo Pro só para quem assina, comprou ou é administrador", async () => {
  await db.exec(`
    insert into public.produtos (id, tipo, nome, preco_centavos) values ('pagina-crm', 'pagina', 'CRM', 900), ('pagina-agenda', 'pagina', 'Agenda', 900);
    insert into public.conteudos (id, titulo, html, acesso, produto_id) values
      ('crm', 'CRM', '<p>crm</p>', 'pro', 'pagina-crm'),
      ('agenda', 'Agenda', '<p>agenda</p>', 'pro', 'pagina-agenda');
  `);
  const ve = async (quem, id) => (await como(quem, `select count(*)::int as n from public.conteudos where id = '${id}'`))[0].n === 1;

  // Membro sem nada: só o grátis
  assert.equal(await ve(BRUNO, "loja"), true);
  assert.equal(await ve(BRUNO, "crm"), false);

  // Comprou só o CRM: lê o CRM, não a Agenda
  await db.exec(`insert into public.compras (id, usuario_id, produto_id, pedido_lemon) values ('pedido-1-crm', '${BRUNO}', 'pagina-crm', 'pedido-1')`);
  assert.equal(await ve(BRUNO, "crm"), true);
  assert.equal(await ve(BRUNO, "agenda"), false);

  // Reembolsou: perde o acesso
  await db.exec(`update public.compras set reembolsada = true where id = 'pedido-1-crm'`);
  assert.equal(await ve(BRUNO, "crm"), false);

  // Assinou o Pro: lê tudo
  await db.exec(`insert into public.assinaturas (id, usuario_id, produto_id, status) values ('sub-1', '${BRUNO}', 'pro-mensal', 'active')`);
  assert.equal(await ve(BRUNO, "crm"), true);
  assert.equal(await ve(BRUNO, "agenda"), true);
  assert.equal((await como(BRUNO, `select public.tem_pro() as pro`))[0].pro, true);

  // Cancelou: continua até o fim do período pago, depois perde
  await db.exec(`update public.assinaturas set status = 'cancelled', termina_em = now() + interval '5 days' where id = 'sub-1'`);
  assert.equal(await ve(BRUNO, "agenda"), true);
  await db.exec(`update public.assinaturas set termina_em = now() - interval '1 minute' where id = 'sub-1'`);
  assert.equal(await ve(BRUNO, "agenda"), false);
  await db.exec(`update public.assinaturas set status = 'expired' where id = 'sub-1'`);
  assert.equal(await ve(BRUNO, "agenda"), false);

  // Cada um vê só as próprias assinaturas
  assert.equal((await como(ADMIN, `select count(*)::int as n from public.assinaturas`))[0].n, 0);
  assert.equal((await como(BRUNO, `select count(*)::int as n from public.assinaturas`))[0].n, 1);

  // Administrador lê o Pro sem assinar
  assert.equal(await ve(ADMIN, "agenda"), true);
  // Visitante continua sem nada
  assert.equal((await como(null, `select count(*)::int as n from public.conteudos where id = 'crm'`))[0].n, 0);
});

test("loja: o webhook (chave secreta) registra assinatura, compra e pagamento", async () => {
  await db.transaction(async (tx) => {
    await tx.exec("set local role service_role");
    await tx.query(`insert into public.assinaturas (id, usuario_id, produto_id, status, renova_em) values ('sub-2', '${ADMIN}', 'pro-anual', 'active', now() + interval '1 year')
      on conflict (id) do update set status = excluded.status`);
    await tx.query(`insert into public.compras (id, usuario_id, produto_id, pedido_lemon) values ('pedido-2-agenda', '${ADMIN}', 'pagina-agenda', 'pedido-2') on conflict (id) do nothing`);
    await tx.query(`insert into public.pagamentos (id, usuario_id, produto_id, valor_centavos) values ('pag-1', '${ADMIN}', 'pro-anual', 3900), ('pag-2', '${ADMIN}', 'pagina-agenda', 900)`);
  });
  const [{ admin_loja: loja }] = await como(ADMIN, `select public.admin_loja()`);
  assert.equal(loja.assinantes_ativos, 1);
  assert.equal(loja.receita_30_dias_centavos, 4800);
  await assert.rejects(como(BRUNO, `select public.admin_loja()`), negado);
});

test("excluir a conta apaga o usuário e tudo dele", async () => {
  await como(ANA, `select public.excluir_minha_conta()`);
  const { rows } = await db.query(`select
    (select count(*) from auth.users where id = '${ANA}') as usuario,
    (select count(*) from public.favoritos where usuario_id = '${ANA}') as favoritos,
    (select count(*) from public.lista_espera_pro where usuario_id = '${ANA}') as lista`);
  assert.deepEqual(rows[0], { usuario: 0, favoritos: 0, lista: 0 });
  await assert.rejects(como(null, `select public.excluir_minha_conta()`), negado);
});

test("animações: membro recebe as simples; as do Pro só com assinatura; tipo inválido é recusado", async () => {
  await db.exec(`
    insert into public.conteudos (id, tipo, titulo, html, acesso) values
      ('anim-surgir-teste', 'animacao', 'Surgir', '<style>.x{}</style>', 'membro'),
      ('anim-aurora-teste', 'animacao', 'Aurora', '<style>.y{}</style>', 'pro');
  `);
  const ids = async (quem) => (await como(quem, `select id from public.conteudos where tipo = 'animacao' and id like '%-teste' order by id`)).map((l) => l.id);
  const outro = "00000000-0000-4000-8000-0000000000aa";
  await db.exec(`insert into auth.users (id, email) values ('${outro}', 'sem-pro@exemplo.com') on conflict do nothing`);
  assert.deepEqual(await ids(outro), ["anim-surgir-teste"], "membro sem Pro só vê a simples");
  assert.deepEqual(await como(null, `select id from public.conteudos where tipo = 'animacao' and id like '%-teste'`), [], "visitante não vê as de membro nem as do Pro");
  assert.deepEqual(await ids(ADMIN), ["anim-aurora-teste", "anim-surgir-teste"], "administrador vê todas");
  await assert.rejects(db.exec(`insert into public.conteudos (id, tipo, titulo, html) values ('x-teste', 'virus', 'x', 'x')`), /check constraint|conteudos_tipo_check/);
});

test("nível público: visitante lê só o público; membro lê público e membro; Pro lê tudo", async () => {
  await db.exec(`
    insert into public.conteudos (id, tipo, titulo, html, acesso) values
      ('pub-teste', 'componente', 'Público', '<p>a</p>', 'publico'),
      ('mem-teste', 'componente', 'Membro', '<p>b</p>', 'membro'),
      ('pro-teste', 'componente', 'Pro', '<p>c</p>', 'pro');
  `);
  const ids = async (quem) => (await como(quem, `select id from public.conteudos where id in ('pub-teste', 'mem-teste', 'pro-teste') order by id`)).map((l) => l.id);
  assert.deepEqual(await ids(null), ["pub-teste"], "visitante");
  const membro = "00000000-0000-4000-8000-0000000000ab";
  await db.exec(`insert into auth.users (id, email) values ('${membro}', 'membro-publico@exemplo.com') on conflict do nothing`);
  assert.deepEqual(await ids(membro), ["mem-teste", "pub-teste"], "membro sem Pro");
  assert.deepEqual(await ids(ADMIN), ["mem-teste", "pro-teste", "pub-teste"], "administrador");
  await assert.rejects(como(null, `update public.conteudos set html = 'x' where id = 'pub-teste'`), negado, "visitante não altera");
  await assert.rejects(como(null, `insert into public.conteudos (id, titulo, html, acesso) values ('inv', 'x', 'x', 'publico')`), negado);
});
