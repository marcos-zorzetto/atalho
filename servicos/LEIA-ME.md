# Ativando contas, área de membros e o assistente de IA

O site funciona sem nada disto: as contas aparecem como "em breve", as páginas completas mostram "área de membros em breve" e o assistente usa a busca local. Cada serviço abaixo é **gratuito** e independente. Ative quando quiser, nesta ordem.

## 1. Contas de usuário (Supabase, grátis)

1. Crie uma conta em [supabase.com](https://supabase.com) e um projeto novo (região **South America (São Paulo)**, para ficar mais rápido no Brasil). Guarde a senha do banco num gerenciador de senhas.
2. No projeto, abra **SQL Editor → New query**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Isso cria as tabelas, as regras de segurança e as funções do painel. Pode rodar de novo sempre que o arquivo mudar.
3. Em **Authentication → Sign In / Providers → Email**:
   - **Confirm email:** ligado (a pessoa confirma o e-mail antes de entrar);
   - **Minimum password length:** `8`.
4. Em **Authentication → URL Configuration**:
   - **Site URL:** `https://marcos-zorzetto.github.io/atalho/`
   - **Redirect URLs:** `https://marcos-zorzetto.github.io/atalho/**` e `http://localhost:5181/**`
5. Em **Project Settings → API Keys**, copie a **Project URL** e a chave **publishable** (`sb_publishable_...`) para [`../site/config.js`](../site/config.js). Nunca use a chave secreta (`sb_secret_...`) no site.

```js
supabase: {
  url: "https://SEU-PROJETO.supabase.co",
  chavePublica: "sb_publishable_...",
},
```

A chave publishable foi feita para ficar no navegador: quem protege os dados são as regras do `schema.sql`, testadas em `scripts/supabase.test.mjs`.

**Plano grátis:** até 50 mil usuários ativos por mês. Projetos sem nenhum acesso por 7 dias são pausados; o workflow [`manter-supabase-ativo.yml`](../.github/workflows/manter-supabase-ativo.yml) faz uma consulta a cada 3 dias para isso não acontecer.

## 2. E-mails de confirmação (Brevo, grátis)

O e-mail que já vem no Supabase só envia para a sua própria conta, e no máximo 2 por hora. Para o público conseguir se cadastrar, ligue um serviço de e-mail:

1. Crie uma conta em [brevo.com](https://www.brevo.com) (plano grátis: 300 e-mails por dia).
2. Em **Senders, Domains & Dedicated IPs → Senders**, adicione e confirme o e-mail que vai aparecer como remetente.
3. Em **SMTP & API → SMTP**, gere uma **SMTP key**.
4. No Supabase, em **Authentication → Emails → SMTP Settings**, ligue **Enable Custom SMTP** e preencha:
   - **Host:** `smtp-relay.brevo.com` · **Port:** `587`
   - **Username:** o login SMTP mostrado no Brevo · **Password:** a SMTP key
   - **Sender email:** o e-mail confirmado no passo 2 · **Sender name:** `Atalho`
5. Em **Authentication → Emails → Templates**, traduza os modelos **Confirm signup** e **Reset password** para o português.

Sem domínio próprio, o Brevo envia em nome de um endereço dele (`@brevosend.com`), e os e-mails chegam normalmente. Quando você tiver um domínio (o mesmo da hospedagem profissional), autentique-o no Brevo para os e-mails saírem com o seu endereço.

## 3. Seu login de administrador

1. Abra o site, vá em **Entrar → Criar conta** e cadastre-se com o seu e-mail, como qualquer pessoa. Confirme pelo link que chegar.
2. No Supabase, em **SQL Editor**, rode (trocando o e-mail pelo seu):

```sql
insert into public.administradores (usuario_id)
select id from auth.users where email = 'SEU-EMAIL@exemplo.com';
```

3. Volte ao site, entre na sua conta e clique em **Painel do administrador** (ou abra `/admin/`).

Ninguém consegue se tornar administrador pelo site: a tabela `administradores` só aceita mudanças pelo SQL Editor. Para tirar alguém, use `delete from public.administradores where usuario_id = '...';`.

## 4. Páginas completas para membros (repositório privado atalho-pro)

As páginas completas não ficam no repositório público. Elas estão em `marcos-zorzetto/atalho-pro` (privado), que as envia para o Supabase:

1. No GitHub, abra o `atalho-pro` → **Settings → Secrets and variables → Actions → New repository secret** e crie:
   - `SUPABASE_URL`: a Project URL;
   - `SUPABASE_SECRET_KEY`: a chave **secreta** (`sb_secret_...`), em Project Settings → API Keys.
2. Na aba **Actions** do `atalho-pro`, rode **Publicar conteúdos** (botão *Run workflow*).
3. No painel do administrador, a tabela **Conteúdo exclusivo** passa a mostrar as 6 páginas.

A chave secreta dá acesso total ao banco: ela fica só nos segredos do `atalho-pro`, nunca no site nem no código.

## 5. Assistente de IA (Cloudflare Workers AI, grátis)

1. Crie uma conta em [dash.cloudflare.com](https://dash.cloudflare.com/sign-up). Não cadastre cartão: no plano gratuito, quando a cota diária de IA acaba, o assistente só para até o dia seguinte. **Não há cobrança.**
2. No terminal, dentro desta pasta:

```bash
cd servicos/assistente
npm ci
npx wrangler login
npx wrangler deploy
```

O `wrangler login` abre o navegador para você autorizar. O `deploy` mostra o endereço do assistente, algo como `https://atalho-assistente.SEU-USUARIO.workers.dev`.

3. Coloque esse endereço em [`../site/config.js`](../site/config.js):

```js
assistente: {
  url: "https://atalho-assistente.SEU-USUARIO.workers.dev",
},
```

**Cota grátis:** 10 mil "neurônios" por dia, cerca de 200 perguntas com o modelo Gemma 4. Cada pessoa pode fazer até 6 perguntas por minuto.

## 6. Publicar

Faça commit e push do `site/config.js`. O GitHub gera e publica o site sozinho em alguns minutos.

## Muitas pessoas ao mesmo tempo

- **Páginas:** o GitHub Pages entrega o site por uma rede de servidores (CDN) e aguenta milhares de visitas simultâneas. O limite de uso é de 100 GB de tráfego por mês.
- **Contas:** cada pessoa tem a própria sessão, guardada no navegador dela; uma não interfere na outra. O Supabase grátis aceita até 50 mil usuários ativos por mês e limita tentativas de login repetidas do mesmo endereço (proteção contra robôs).
- **E-mails:** o limite é o do Brevo (300 por dia no plano grátis). Se passar disso, o cadastro avisa "muitas tentativas" e a pessoa tenta depois.
