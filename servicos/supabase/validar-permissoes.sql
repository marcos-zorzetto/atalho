-- Validação de permissões no banco de PRODUÇÃO, sem deixar rastro.
-- Cole no SQL Editor do Supabase, troque o e-mail na última linha pelo e-mail do
-- administrador e clique em Run. Cada linha do resultado é uma verificação: a
-- coluna "ok" precisa ser ✓ em todas.
--
-- Como funciona: cria dois membros de teste, executa cada ação como visitante
-- (anon), como membro (authenticated) e como administrador, e no fim desfaz
-- tudo (os membros de teste, favoritos, alterações). Só o resultado sobra.

create or replace function pg_temp.validar_permissoes(email_admin text)
returns table (ordem int, quem text, teste text, esperado text, obtido text, ok text)
language plpgsql
as $$
declare
  admin_id uuid := (select id from auth.users where email = email_admin);
  membro uuid := '00000000-0000-4000-8000-00000000a001';
  outro uuid := '00000000-0000-4000-8000-00000000a002';
  resultados jsonb := '[]';
  c record;
  valor text;
  n int := 0;
  total_usuarios int;
begin
  if admin_id is null then
    raise exception 'Nenhuma conta com o e-mail %', email_admin;
  end if;

  begin
    -- Dois membros de teste (somem no fim)
    insert into auth.users (id, aud, role, email, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
    values (membro, 'authenticated', 'authenticated', 'membro.teste@exemplo.com', '{"nome":"Membro Teste"}', now(), now(), now()),
           (outro, 'authenticated', 'authenticated', 'outro.teste@exemplo.com', '{"nome":"Outro Teste"}', now(), now(), now());
    insert into public.favoritos (usuario_id, componente_id) values (outro, 'modal');
    total_usuarios := (select count(*) from auth.users);

    for c in
      select * from (values
        -- Visitante, sem cadastro
        ('Visitante', null::uuid, 'Ler as páginas completas', 'negado', 'select count(*)::text from public.conteudos'),
        ('Visitante', null, 'Ler perfis', 'negado', 'select count(*)::text from public.perfis'),
        ('Visitante', null, 'Ler favoritos', 'negado', 'select count(*)::text from public.favoritos'),
        ('Visitante', null, 'Ler a lista de espera', 'negado', 'select count(*)::text from public.lista_espera_pro'),
        ('Visitante', null, 'Ler administradores', 'negado', 'select count(*)::text from public.administradores'),
        ('Visitante', null, 'Ler e-mails e senhas (auth.users)', 'negado', 'select count(*)::text from auth.users'),
        ('Visitante', null, 'Publicar conteúdo', 'negado', 'with x as (insert into public.conteudos (id, titulo, html) values (''invasao'', ''x'', ''x'') returning 1) select count(*)::text from x'),
        ('Visitante', null, 'Virar administrador', 'negado', 'with x as (insert into public.administradores (usuario_id) values (''' || membro || ''') returning 1) select count(*)::text from x'),
        ('Visitante', null, 'Saber se é administrador', 'negado', 'select public.eh_admin()::text'),
        ('Visitante', null, 'Painel: resumo', 'negado', 'select public.admin_resumo()::text'),
        ('Visitante', null, 'Painel: lista de usuários', 'negado', 'select count(*)::text from public.admin_usuarios()'),
        ('Visitante', null, 'Excluir uma conta', 'negado', 'select public.excluir_minha_conta()::text'),
        -- Membro cadastrado (comum)
        ('Membro', membro, 'Ler as páginas completas', 'permitido: 6', 'select count(*)::text from public.conteudos'),
        ('Membro', membro, 'Ler o próprio perfil', 'permitido: 1', 'select count(*)::text from public.perfis where id = auth.uid()'),
        ('Membro', membro, 'Ler o perfil dos outros', 'permitido: 0', 'select count(*)::text from public.perfis where id <> auth.uid()'),
        ('Membro', membro, 'Mudar o próprio nome', 'permitido: 1', 'with x as (update public.perfis set nome = ''Novo Nome'' where id = auth.uid() returning 1) select count(*)::text from x'),
        ('Membro', membro, 'Mudar o nome de outra pessoa', 'permitido: 0', 'with x as (update public.perfis set nome = ''Hacker'' where id <> auth.uid() returning 1) select count(*)::text from x'),
        ('Membro', membro, 'Favoritar um componente', 'permitido: 1', 'with x as (insert into public.favoritos (componente_id) values (''tabela'') returning 1) select count(*)::text from x'),
        ('Membro', membro, 'Favoritar em nome de outra pessoa', 'negado', 'with x as (insert into public.favoritos (usuario_id, componente_id) values (''' || outro || ''', ''tabela'') returning 1) select count(*)::text from x'),
        ('Membro', membro, 'Ver favoritos de outra pessoa', 'permitido: 0', 'select count(*)::text from public.favoritos where usuario_id <> auth.uid()'),
        ('Membro', membro, 'Apagar favoritos de outra pessoa', 'permitido: 0', 'with x as (delete from public.favoritos where usuario_id <> auth.uid() returning 1) select count(*)::text from x'),
        ('Membro', membro, 'Entrar na lista do Pro', 'permitido: 1', 'with x as (insert into public.lista_espera_pro default values returning 1) select count(*)::text from x'),
        ('Membro', membro, 'Alterar páginas completas', 'negado', 'with x as (update public.conteudos set html = ''x'' returning 1) select count(*)::text from x'),
        ('Membro', membro, 'Apagar páginas completas', 'negado', 'with x as (delete from public.conteudos returning 1) select count(*)::text from x'),
        ('Membro', membro, 'Ler administradores', 'negado', 'select count(*)::text from public.administradores'),
        ('Membro', membro, 'Virar administrador', 'negado', 'with x as (insert into public.administradores (usuario_id) values (auth.uid()) returning 1) select count(*)::text from x'),
        ('Membro', membro, 'Ler e-mails e senhas (auth.users)', 'negado', 'select count(*)::text from auth.users'),
        ('Membro', membro, 'Saber se é administrador', 'permitido: false', 'select public.eh_admin()::text'),
        ('Membro', membro, 'Painel: resumo', 'negado', 'select public.admin_resumo()::text'),
        ('Membro', membro, 'Painel: lista de usuários', 'negado', 'select count(*)::text from public.admin_usuarios()'),
        ('Membro', membro, 'Painel: lista de espera', 'negado', 'select count(*)::text from public.admin_lista_espera()'),
        ('Membro', membro, 'Painel: conteúdos', 'negado', 'select count(*)::text from public.admin_conteudos()'),
        -- Administrador (a sua conta)
        ('Administrador', admin_id, 'É reconhecido como administrador', 'permitido: true', 'select public.eh_admin()::text'),
        ('Administrador', admin_id, 'Ler as páginas completas', 'permitido: 6', 'select count(*)::text from public.conteudos'),
        ('Administrador', admin_id, 'Painel: resumo', 'permitido: {%', 'select public.admin_resumo()::text'),
        ('Administrador', admin_id, 'Painel: vê todos os usuários', 'permitido: ' || total_usuarios, 'select count(*)::text from public.admin_usuarios()'),
        ('Administrador', admin_id, 'Painel: busca usuários', 'permitido: 1', 'select count(*)::text from public.admin_usuarios(''membro.teste'')'),
        ('Administrador', admin_id, 'Painel: lista de espera', 'permitido: %', 'select count(*)::text from public.admin_lista_espera()'),
        ('Administrador', admin_id, 'Painel: conteúdos publicados', 'permitido: 6', 'select count(*)::text from public.admin_conteudos()'),
        ('Administrador', admin_id, 'Painel: cadastros por dia', 'permitido: 30', 'select count(*)::text from public.admin_cadastros_por_dia(30)'),
        ('Administrador', admin_id, 'Não vê senhas (nem o admin)', 'negado', 'select count(*)::text from auth.users'),
        -- Chave secreta (usada só pelo repositório atalho-pro)
        ('Chave secreta', null, 'Publicar e atualizar páginas', 'permitido: 6', 'with x as (update public.conteudos set atualizado_em = atualizado_em returning 1) select count(*)::text from x')
      ) as t (quem, sub, teste, esperado, consulta)
    loop
      n := n + 1;
      begin
        perform set_config('request.jwt.claim.sub', coalesce(c.sub::text, ''), true);
        perform set_config('request.jwt.claims', case when c.sub is null then '{"role":"anon"}' else json_build_object('sub', c.sub, 'role', 'authenticated')::text end, true);
        execute format('set local role %I', case when c.quem = 'Chave secreta' then 'service_role' when c.sub is null then 'anon' else 'authenticated' end);
        execute c.consulta into valor;
        execute 'reset role';
        valor := 'permitido: ' || coalesce(valor, '');
      exception
        when insufficient_privilege then valor := 'negado';
        when others then valor := 'erro ' || sqlstate || ': ' || sqlerrm;
      end;
      resultados := resultados || jsonb_build_object('ordem', n, 'quem', c.quem, 'teste', c.teste, 'esperado', c.esperado, 'obtido', valor);
    end loop;

    -- Desfaz tudo o que os testes criaram ou mudaram
    raise exception using errcode = 'P0099', message = 'desfazer';
  exception
    when sqlstate 'P0099' then null;
  end;

  return query
    select (r ->> 'ordem')::int, r ->> 'quem', r ->> 'teste', r ->> 'esperado', r ->> 'obtido',
           case when (r ->> 'obtido') like (r ->> 'esperado') then '✓' else '✗ FALHOU' end
    from jsonb_array_elements(resultados) r
    order by 1;
end;
$$;

select * from pg_temp.validar_permissoes('SEU-EMAIL@exemplo.com');
