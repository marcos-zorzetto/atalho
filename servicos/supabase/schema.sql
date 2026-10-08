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
