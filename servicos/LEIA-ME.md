# Ativando contas e o assistente de IA

O site funciona sem nada disto: contas aparecem como "em breve" e o assistente usa a busca local. Cada serviço abaixo é **gratuito** e independente; ative quando quiser.

## 1. Contas de usuário (Supabase, grátis)

1. Crie uma conta em [supabase.com](https://supabase.com) e um projeto novo (região **South America (São Paulo)**, para ficar mais rápido no Brasil).
2. No projeto, abra **SQL Editor** → **New query**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Isso cria as tabelas e as regras de segurança.
3. Em **Authentication → URL Configuration**:
   - **Site URL:** `https://marcos-zorzetto.github.io/atalho/`
   - **Redirect URLs:** `https://marcos-zorzetto.github.io/atalho/conta/` e `http://localhost:5181/conta/`
4. Em **Authentication → Emails**, traduza os modelos de e-mail (confirmação e recuperação de senha) para o português.
5. Em **Project Settings → API**, copie a **Project URL** e a chave **publishable/anon** (nunca a `service_role`) para [`../site/config.js`](../site/config.js):

```js
supabase: {
  url: "https://SEU-PROJETO.supabase.co",
  chavePublica: "sb_publishable_...",
},
```

A chave pública foi feita para ficar no navegador: quem protege os dados são as regras (RLS) do `schema.sql`.

**Plano grátis:** até 50 mil usuários ativos por mês. Projetos parados por uma semana são pausados; basta reativar no painel.

## 2. Assistente de IA (Cloudflare Workers AI, grátis)

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

## 3. Publicar

Faça commit e push do `site/config.js`. O GitHub gera e publica o site sozinho em alguns minutos.
