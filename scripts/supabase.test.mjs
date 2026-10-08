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
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);
  await db.exec(await readFile(path.join(RAIZ, "servicos", "supabase", "schema.sql"), "utf8"));
  // Rodar duas vezes não pode quebrar (o guia diz que pode)
  await db.exec(await readFile(path.join(RAIZ, "servicos", "supabase", "schema.sql"), "utf8"));

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
  await assert.rejects(como(null, `select id from public.conteudos`), negado);
  assert.deepEqual(await como(ANA, `select id, titulo from public.conteudos`), [{ id: "loja", titulo: "Loja virtual" }]);
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

test("excluir a conta apaga o usuário e tudo dele", async () => {
  await como(ANA, `select public.excluir_minha_conta()`);
  const { rows } = await db.query(`select
    (select count(*) from auth.users where id = '${ANA}') as usuario,
    (select count(*) from public.favoritos where usuario_id = '${ANA}') as favoritos,
    (select count(*) from public.lista_espera_pro where usuario_id = '${ANA}') as lista`);
  assert.deepEqual(rows[0], { usuario: 0, favoritos: 0, lista: 0 });
  await assert.rejects(como(null, `select public.excluir_minha_conta()`), negado);
});
