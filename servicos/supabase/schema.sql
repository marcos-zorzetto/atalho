-- Banco de dados das contas do Atalho (Supabase / PostgreSQL)
-- Como usar: no painel do Supabase, abra "SQL Editor", cole este arquivo inteiro e clique em "Run".
-- Pode rodar de novo sem problema: tudo usa "if not exists" / "or replace".
--
-- Segurança: todas as tabelas têm RLS (Row Level Security) ligado. Cada pessoa só
-- lê e altera as PRÓPRIAS linhas, mesmo usando a chave pública do navegador.

-- Perfil público mínimo (nome). E-mail e senha ficam no sistema de autenticação do Supabase.
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 120),
  criado_em timestamptz not null default now()
);

-- Componentes favoritos
create table if not exists public.favoritos (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  componente_id text not null check (componente_id ~ '^[a-z0-9-]{1,60}$'),
  criado_em timestamptz not null default now(),
  primary key (usuario_id, componente_id)
);

-- Lista de espera do Atalho Pro (consentimento explícito: RGPD art. 6.º, n.º 1, a; LGPD art. 7º, I)
create table if not exists public.lista_espera_pro (
  usuario_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;
alter table public.favoritos enable row level security;
alter table public.lista_espera_pro enable row level security;

-- Regras: só o dono enxerga e altera
drop policy if exists "perfil: dono lê" on public.perfis;
create policy "perfil: dono lê" on public.perfis for select to authenticated using (id = (select auth.uid()));
drop policy if exists "perfil: dono atualiza" on public.perfis;
create policy "perfil: dono atualiza" on public.perfis for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "favoritos: dono lê" on public.favoritos;
create policy "favoritos: dono lê" on public.favoritos for select to authenticated using (usuario_id = (select auth.uid()));
drop policy if exists "favoritos: dono cria" on public.favoritos;
create policy "favoritos: dono cria" on public.favoritos for insert to authenticated with check (usuario_id = (select auth.uid()));
drop policy if exists "favoritos: dono apaga" on public.favoritos;
create policy "favoritos: dono apaga" on public.favoritos for delete to authenticated using (usuario_id = (select auth.uid()));

drop policy if exists "lista: dono lê" on public.lista_espera_pro;
create policy "lista: dono lê" on public.lista_espera_pro for select to authenticated using (usuario_id = (select auth.uid()));
drop policy if exists "lista: dono entra" on public.lista_espera_pro;
create policy "lista: dono entra" on public.lista_espera_pro for insert to authenticated with check (usuario_id = (select auth.uid()));
drop policy if exists "lista: dono sai" on public.lista_espera_pro;
create policy "lista: dono sai" on public.lista_espera_pro for delete to authenticated using (usuario_id = (select auth.uid()));

-- Cria o perfil automaticamente quando alguém se cadastra (usa o nome enviado no cadastro)
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users for each row execute function public.criar_perfil();
-- Só o gatilho usa a função: ninguém a chama pela API (/rest/v1/rpc)
revoke all on function public.criar_perfil() from public, anon, authenticated;
-- O mesmo para a função que o Supabase cria com a opção "ligar RLS automaticamente"
do $$
begin
  if exists (select 1 from pg_proc where proname = 'rls_auto_enable' and pronamespace = 'public'::regnamespace) then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;

-- "Excluir minha conta": apaga o usuário logado e, em cascata, perfil, favoritos e lista (RGPD art. 17; LGPD art. 18)
create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'não autenticado';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;

-- ---------------------------------------------------------------------------
-- Permissões explícitas (projetos novos do Supabase podem não liberar tabelas
-- novas para a API automaticamente). O RLS acima continua decidindo as linhas.
-- ---------------------------------------------------------------------------
grant select, update on public.perfis to authenticated;
grant select, insert, delete on public.favoritos to authenticated;
grant select, insert, delete on public.lista_espera_pro to authenticated;
revoke all on public.perfis, public.favoritos, public.lista_espera_pro from anon;

-- ---------------------------------------------------------------------------
-- Administradores
-- Ninguém se torna administrador pelo site: a única forma é rodar, aqui no
-- SQL Editor, o comando do guia (servicos/LEIA-ME.md). A tabela não tem
-- nenhuma regra de acesso, então a API não lê nem altera nada nela.
-- ---------------------------------------------------------------------------
create table if not exists public.administradores (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);
alter table public.administradores enable row level security;
revoke all on public.administradores from anon, authenticated;

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.administradores where usuario_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------------
-- Conteúdo exclusivo para membros (páginas completas e o que vier depois)
-- Só quem entrou na conta lê. Quem escreve é o repositório privado atalho-pro,
-- com a chave secreta guardada nos segredos do GitHub (nunca no site).
-- ---------------------------------------------------------------------------
create table if not exists public.conteudos (
  id text primary key check (id ~ '^[a-z0-9-]{1,60}$'),
  tipo text not null default 'exemplo' check (tipo in ('exemplo', 'modelo', 'guia')),
  titulo text not null check (char_length(titulo) between 1 and 160),
  html text not null check (char_length(html) <= 500000),
  atualizado_em timestamptz not null default now()
);
alter table public.conteudos enable row level security;
drop policy if exists "conteudos: membros leem" on public.conteudos;
create policy "conteudos: membros leem" on public.conteudos for select to authenticated using (true);
revoke all on public.conteudos from anon, authenticated;
grant select on public.conteudos to authenticated;
-- A chave secreta (papel service_role) publica o conteúdo. Ela ignora o RLS,
-- mas ainda precisa da permissão da tabela quando o projeto não expõe tabelas sozinho.
grant select, insert, update, delete on public.conteudos to service_role;

-- ---------------------------------------------------------------------------
-- Painel do administrador. Cada função confere eh_admin() no servidor: mesmo
-- que alguém abra a página /admin/, sem ser administrador recebe só um erro.
-- ---------------------------------------------------------------------------
create or replace function public.exigir_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'acesso restrito ao administrador' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.admin_resumo()
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.exigir_admin();
  return json_build_object(
    'usuarios', (select count(*) from auth.users),
    'confirmados', (select count(*) from auth.users where email_confirmed_at is not null),
    'novos_7_dias', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'ativos_30_dias', (select count(*) from auth.users where last_sign_in_at > now() - interval '30 days'),
    'lista_espera', (select count(*) from public.lista_espera_pro),
    'favoritos', (select count(*) from public.favoritos),
    'conteudos', (select count(*) from public.conteudos)
  );
end;
$$;

create or replace function public.admin_cadastros_por_dia(dias integer default 30)
returns table (dia date, cadastros bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.exigir_admin();
  dias := least(greatest(coalesce(dias, 30), 1), 365);
  return query
    select d::date, count(u.id)
    from generate_series(current_date - (dias - 1), current_date, interval '1 day') as d
    left join auth.users u on u.created_at::date = d::date
    group by d
    order by d;
end;
$$;

create or replace function public.admin_usuarios(busca text default '', limite integer default 25, deslocamento integer default 0)
returns table (
  id uuid, email text, nome text, criado_em timestamptz, ultimo_acesso timestamptz,
  confirmado boolean, lista_espera boolean, favoritos bigint, admin boolean, total bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  termo text := lower(trim(coalesce(busca, '')));
begin
  perform public.exigir_admin();
  return query
    select u.id, u.email::text, p.nome, u.created_at, u.last_sign_in_at,
           u.email_confirmed_at is not null,
           exists (select 1 from public.lista_espera_pro l where l.usuario_id = u.id),
           (select count(*) from public.favoritos f where f.usuario_id = u.id),
           exists (select 1 from public.administradores a where a.usuario_id = u.id),
           count(*) over ()
    from auth.users u
    left join public.perfis p on p.id = u.id
    -- position() em vez de LIKE: % e _ digitados na busca não viram curinga
    where termo = '' or position(termo in lower(u.email)) > 0 or position(termo in lower(coalesce(p.nome, ''))) > 0
    order by u.created_at desc
    limit least(greatest(coalesce(limite, 25), 1), 200)
    offset greatest(coalesce(deslocamento, 0), 0);
end;
$$;

create or replace function public.admin_lista_espera()
returns table (email text, nome text, entrou_em timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.exigir_admin();
  return query
    select u.email::text, p.nome, l.criado_em
    from public.lista_espera_pro l
    join auth.users u on u.id = l.usuario_id
    left join public.perfis p on p.id = l.usuario_id
    order by l.criado_em desc;
end;
$$;

create or replace function public.admin_conteudos()
returns table (id text, tipo text, titulo text, tamanho integer, atualizado_em timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.exigir_admin();
  return query
    select c.id, c.tipo, c.titulo, char_length(c.html), c.atualizado_em
    from public.conteudos c
    order by c.atualizado_em desc;
end;
$$;

-- Funções: ninguém de fora executa; quem entrou executa, e as admin_* ainda conferem o administrador
revoke all on function public.eh_admin(), public.exigir_admin(), public.admin_resumo(), public.admin_cadastros_por_dia(integer),
  public.admin_usuarios(text, integer, integer), public.admin_lista_espera(), public.admin_conteudos()
  from public, anon;
grant execute on function public.eh_admin(), public.admin_resumo(), public.admin_cadastros_por_dia(integer),
  public.admin_usuarios(text, integer, integer), public.admin_lista_espera(), public.admin_conteudos()
  to authenticated;

-- ===========================================================================
-- LOJA (versão 1.3): Atalho Pro por assinatura e compras avulsas
-- Quem cobra é a Lemon Squeezy (vendedor oficial: recolhe o IVA e emite a
-- fatura). O banco só guarda o resultado, que chega pelo webhook
-- (servicos/supabase/functions/lemon-webhook), escrito com a chave secreta.
-- ===========================================================================

-- O que se vende. O preço aqui é só para exibir; o cobrado é o da Lemon Squeezy.
create table if not exists public.produtos (
  id text primary key check (id ~ '^[a-z0-9-]{1,60}$'),
  tipo text not null check (tipo in ('assinatura', 'pagina', 'componente')),
  nome text not null check (char_length(nome) between 1 and 120),
  preco_centavos integer not null check (preco_centavos >= 0),
  intervalo text check (intervalo in ('mes', 'ano')),
  variante_lemon text unique,
  ativo boolean not null default true
);
alter table public.produtos enable row level security;
drop policy if exists "produtos: todos veem os ativos" on public.produtos;
create policy "produtos: todos veem os ativos" on public.produtos for select to anon, authenticated using (ativo);
revoke all on public.produtos from anon, authenticated;
grant select on public.produtos to anon, authenticated;
grant select, insert, update, delete on public.produtos to service_role;

insert into public.produtos (id, tipo, nome, preco_centavos, intervalo) values
  ('pro-mensal', 'assinatura', 'Atalho Pro (mensal)', 490, 'mes'),
  ('pro-anual', 'assinatura', 'Atalho Pro (anual)', 3900, 'ano')
on conflict (id) do nothing;

-- Assinaturas: uma linha por assinatura da Lemon Squeezy
create table if not exists public.assinaturas (
  id text primary key,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  produto_id text references public.produtos (id),
  status text not null check (status in ('on_trial', 'active', 'paused', 'past_due', 'unpaid', 'cancelled', 'expired')),
  renova_em timestamptz,
  termina_em timestamptz,
  portal_url text,
  atualizado_em timestamptz not null default now()
);
create index if not exists assinaturas_usuario on public.assinaturas (usuario_id);
alter table public.assinaturas enable row level security;
drop policy if exists "assinaturas: dono lê" on public.assinaturas;
create policy "assinaturas: dono lê" on public.assinaturas for select to authenticated using (usuario_id = (select auth.uid()));
revoke all on public.assinaturas from anon, authenticated;
grant select on public.assinaturas to authenticated;
grant select, insert, update, delete on public.assinaturas to service_role;

-- Compras avulsas (uma página ou um componente, para sempre)
create table if not exists public.compras (
  id text primary key,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  produto_id text not null references public.produtos (id),
  pedido_lemon text not null,
  reembolsada boolean not null default false,
  criado_em timestamptz not null default now()
);
create index if not exists compras_usuario on public.compras (usuario_id);
alter table public.compras enable row level security;
drop policy if exists "compras: dono lê" on public.compras;
create policy "compras: dono lê" on public.compras for select to authenticated using (usuario_id = (select auth.uid()));
revoke all on public.compras from anon, authenticated;
grant select on public.compras to authenticated;
grant select, insert, update, delete on public.compras to service_role;

-- Pagamentos recebidos (para o painel do administrador). Ninguém lê pela API.
create table if not exists public.pagamentos (
  id text primary key,
  usuario_id uuid references auth.users (id) on delete set null,
  produto_id text references public.produtos (id),
  valor_centavos integer not null,
  moeda text not null default 'EUR',
  reembolsado boolean not null default false,
  criado_em timestamptz not null default now()
);
alter table public.pagamentos enable row level security;
revoke all on public.pagamentos from anon, authenticated;
grant select, insert, update, delete on public.pagamentos to service_role;

-- Conteúdo: "membro" (grátis com conta) ou "pro" (assinatura ou compra avulsa)
alter table public.conteudos add column if not exists acesso text not null default 'membro';
alter table public.conteudos add column if not exists produto_id text references public.produtos (id);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'conteudos_acesso_valido') then
    alter table public.conteudos add constraint conteudos_acesso_valido check (acesso in ('membro', 'pro'));
  end if;
end;
$$;

-- Tipos de conteúdo (versão 1.4): animações do estúdio, componentes premium e negócios prontos
alter table public.conteudos drop constraint if exists conteudos_tipo_check;
alter table public.conteudos add constraint conteudos_tipo_check
  check (tipo in ('exemplo', 'modelo', 'guia', 'animacao', 'componente', 'negocio'));

-- Tem o Pro? Ativo, em teste, com pagamento atrasado (a Lemon Squeezy ainda
-- tenta cobrar) ou cancelado mas dentro do período já pago.
create or replace function public.tem_pro()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.assinaturas a
    where a.usuario_id = (select auth.uid())
      and (a.status in ('on_trial', 'active', 'past_due') or (a.status = 'cancelled' and a.termina_em > now()))
  );
$$;

create or replace function public.comprou(produto text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select produto is not null and exists (
    select 1 from public.compras c
    where c.usuario_id = (select auth.uid()) and c.produto_id = produto and not c.reembolsada
  );
$$;

-- Nova regra de leitura: membro lê o grátis; o Pro, só quem assina, comprou ou é administrador
drop policy if exists "conteudos: membros leem" on public.conteudos;
drop policy if exists "conteudos: quem tem acesso lê" on public.conteudos;
create policy "conteudos: quem tem acesso lê" on public.conteudos for select to authenticated
  using (acesso = 'membro' or public.tem_pro() or public.comprou(produto_id) or public.eh_admin());

revoke all on function public.tem_pro(), public.comprou(text) from public, anon;
grant execute on function public.tem_pro(), public.comprou(text) to authenticated;

-- Painel: números da loja
create or replace function public.admin_loja()
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.exigir_admin();
  return json_build_object(
    'assinantes_ativos', (select count(distinct usuario_id) from public.assinaturas where status in ('on_trial', 'active', 'past_due') or (status = 'cancelled' and termina_em > now())),
    'compras_avulsas', (select count(*) from public.compras where not reembolsada),
    'receita_30_dias_centavos', (select coalesce(sum(valor_centavos), 0) from public.pagamentos where not reembolsado and criado_em > now() - interval '30 days'),
    'receita_total_centavos', (select coalesce(sum(valor_centavos), 0) from public.pagamentos where not reembolsado)
  );
end;
$$;
revoke all on function public.admin_loja() from public, anon;
grant execute on function public.admin_loja() to authenticated;
