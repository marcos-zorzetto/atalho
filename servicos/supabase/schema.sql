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

-- Lista de espera do Atalho Pro (consentimento explícito, LGPD art. 7º, I)
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

-- "Excluir minha conta": apaga o usuário logado e, em cascata, perfil, favoritos e lista (LGPD art. 18)
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
