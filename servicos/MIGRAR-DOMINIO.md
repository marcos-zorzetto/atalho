# Migrar para domínio próprio (melhor custo-benefício)

Plano preparado em 9 de outubro de 2026. O código já está pronto: a mudança é feita
com **duas variáveis no GitHub** e alguns ajustes nos painéis. Nada no código
precisa ser reescrito no dia.

## Resumo da recomendação

| Item | Escolha | Custo por ano |
|---|---|---|
| Domínio do Atalho | **atalhoui.com** na Cloudflare Registrar (preço de custo, sem margem e sem aumento na renovação) | ≈ US$ 10,50 (≈ €9,50) |
| Domínio da Alisense | **alisense.pt** num registrador português (a Cloudflare não vende .pt) | ≈ €12 a €19 |
| Hospedagem dos dois sites | **Cloudflare** (Workers com arquivos estáticos, plano grátis): CDN mundial, HTTPS, uso comercial permitido | €0 |
| E-mail que recebe (contato@...) | **Cloudflare Email Routing**: encaminha para o seu e-mail atual | €0 |
| E-mail que envia (confirmação de conta, respostas) | **Brevo** com o domínio autenticado (300 e-mails/dia grátis) | €0 |
| Banco e contas | Supabase (continua igual) | €0 |
| Pagamentos | Lemon Squeezy (só cobra por venda: cerca de 5% + €0,50) | €0 fixo |
| **Total fixo** | | **≈ €22 a €29 por ano** |

**Por que não uma hospedagem paga (Hostinger etc.)?** Os dois sites são estáticos:
o "servidor" de verdade é o Supabase. Uma hospedagem paga custaria €3 a €10 por mês
para fazer pior o que a Cloudflare faz de graça (CDN no mundo inteiro, sem limite
de tráfego para arquivos estáticos). Só valeria a pena se um dia o PHP do Atalho
precisar rodar num servidor seu; aí, um VPS pequeno (Hetzner, ≈ €4/mês) é melhor
negócio que hospedagem compartilhada.

**Por que sair do GitHub Pages?** Ele é ótimo para documentação, mas os termos do
GitHub não permitem usá-lo como hospedagem principal de um negócio com vendas, e
ele não deixa configurar cabeçalhos de segurança. Na Cloudflare, o arquivo
`_headers` (gerado sozinho) já aplica HSTS, `nosniff`, política de referência e cache.

### Domínios: situação em 9/10/2026

| Domínio | Situação |
|---|---|
| atalhoui.com | **livre** (recomendado: "Atalho UI", curto e internacional) |
| atalhocss.com | livre (alternativa) |
| atalho.com, atalho.dev | ocupados |
| alisense.pt | **livre** (recomendado: empresa em Portugal, passa confiança local) |
| alisense.com | ocupado |
| alisense.org | em resgate na Hostinger desde 27/09. Recuperar no resgate custa caro (em geral €80+). Se ninguém recuperar, fica livre por volta de **1 a 2 de novembro de 2026** e pode ser registrado pelo preço normal (≈ US$ 11 na Cloudflare) para redirecionar ao alisense.pt |

> Antes de comprar, confira o preço no carrinho: valores de terceiros mudam. Compare
> sempre o preço da **renovação**, não só o do primeiro ano.

---

## Parte 1 · Atalho em atalhoui.com

### 1. Conta e domínio na Cloudflare
1. Crie a conta em [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) (plano Free).
2. **Domain Registration → Register Domains** → `atalhoui.com` → pague com o seu cartão.
   Ative a renovação automática. A privacidade do WHOIS já vem incluída.

### 2. Chave para o GitHub publicar na Cloudflare
1. **My Profile → API Tokens → Create Token → modelo "Edit Cloudflare Workers"** →
   *Account Resources*: a sua conta; *Zone Resources*: atalhoui.com → **Create**.
2. Copie o token (aparece uma vez só) e o **Account ID** (na página inicial da conta, à direita).
3. No GitHub, repositório `atalho` → **Settings → Secrets and variables → Actions**:
   - aba **Secrets**: `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`
   - aba **Variables**: `ATALHO_URL` = `https://atalhoui.com/` e `ATALHO_HOSPEDAGEM` = `cloudflare`

### 3. Primeira publicação
1. No computador: `node scripts/migrar-dominio.mjs https://atalhoui.com/` (troca o endereço
   no README, no package.json e nos guias), depois commit e push.
2. O workflow **Publicar site** gera o site para a raiz do domínio, publica na Cloudflare
   e transforma o endereço antigo do GitHub Pages em redirecionamento (cada página antiga
   leva à mesma página no domínio novo).
3. Na Cloudflare: **Workers & Pages → atalho → Settings → Domains & Routes → Add →
   Custom domain** → `atalhoui.com`. Repita para `www.atalhoui.com`, se quiser.

### 4. Contas (Supabase)
**Authentication → URL Configuration**:
- *Site URL*: `https://atalhoui.com/`
- *Redirect URLs*: acrescente `https://atalhoui.com/**` e mantenha `http://localhost:5181/**`.
  Deixe o endereço antigo por umas semanas, para links de confirmação já enviados.

### 5. E-mail com o domínio (resolve o "Brevo não aceita github.io")
1. **Receber:** Cloudflare → atalhoui.com → **Email → Email Routing** → ative →
   crie `contato@atalhoui.com` encaminhando para o seu e-mail pessoal.
2. **Enviar:** no Brevo, **Senders, Domains & Dedicated IPs → Domains → Add a domain** →
   `atalhoui.com`. Escolha a autenticação automática pela Cloudflare (ou copie os registros
   DKIM e DMARC para **DNS → Records**). Crie o remetente `nao-responda@atalhoui.com`.
3. Supabase → **Authentication → Emails → SMTP Settings** → ative o SMTP próprio:
   - Host `smtp-relay.brevo.com`, porta `587`
   - Usuário: o login SMTP do Brevo; senha: a **chave SMTP** do Brevo (não a senha da conta)
   - Remetente: `nao-responda@atalhoui.com`, nome `Atalho`
4. Teste criando uma conta nova no site e veja se o e-mail chega fora do spam.

### 6. Pagamentos (Lemon Squeezy)
- No produto Atalho Pro: *Confirmation modal → Button link* = `https://atalhoui.com/conta/?pagamento=ok`.
- Nome e site da loja: `https://atalhoui.com/`. O webhook **não muda** (é o endereço do Supabase).

### 7. Google
1. [Search Console](https://search.google.com/search-console) → adicionar propriedade
   **Domínio** `atalhoui.com` (a verificação por DNS é automática com a Cloudflare).
2. **Sitemaps** → enviar `sitemap.xml`.
3. Na propriedade antiga (github.io), use **Mudança de endereço**, se disponível.

### 8. Conferir (10 minutos)
- [ ] `https://atalhoui.com/` abre, com cadeado
- [ ] `https://marcos-zorzetto.github.io/atalho/componentes/modal/` leva a `https://atalhoui.com/componentes/modal/`
- [ ] Criar conta → e-mail chega → link volta para atalhoui.com já conectado
- [ ] /exemplos/loja/ abre para membro; /admin/ abre para você
- [ ] /pro/ → assinar em modo de teste da Lemon Squeezy → plano aparece em Minha conta
- [ ] [securityheaders.com](https://securityheaders.com) com atalhoui.com mostra os cabeçalhos

**Voltar atrás**, se algo der errado: mude `ATALHO_HOSPEDAGEM` para `github`, apague
`ATALHO_URL` e rode o workflow **Publicar site** de novo. Tudo volta ao GitHub Pages
como hoje.

---

## Parte 2 · Alisense em alisense.pt

1. Registre `alisense.pt` num registrador português (compare OVHcloud, PTisp, Amen e
   Dominios.pt: veja o preço da **renovação com IVA**). Não contrate hospedagem nem e-mail
   no pacote.
2. Na Cloudflare: **Add a domain** → `alisense.pt` → plano Free. A Cloudflare mostra dois
   *nameservers*: troque os do registrador por eles (no painel do registrador, em DNS).
   Leva de minutos a algumas horas.
3. O site da Alisense é publicado do mesmo jeito (pasta `alisense-site`, que já tem o
   `wrangler.jsonc`): domínio próprio em **Workers → alisense → Domains & Routes**.
4. E-mail: Email Routing com `ola@alisense.pt` (ou `contato@`) para o seu e-mail e o da
   sua esposa; envio pelo Brevo com o domínio autenticado, como no passo 5 do Atalho.
   Precisa de caixa de entrada própria, com app no celular? Zoho Mail ou Hostinger Mail
   custam cerca de €1 a €3 por pessoa por mês. Google Workspace (≈ €7) só se precisarem
   de Drive e Meet com o domínio.
5. Atualize a bio do Instagram (@alisense86), o Facebook e o WhatsApp Business com o site novo.
6. Se o `alisense.org` ficar livre em novembro, registre-o na Cloudflare e crie uma
   regra de redirecionamento (**Rules → Redirect Rules**) para `https://alisense.pt`.

---

## O que já foi preparado no código

- `scripts/site/config.mjs`: tudo sai de `ATALHO_URL`. A base dos links (`/atalho/` ou `/`)
  é calculada a partir do endereço.
- `.github/workflows/publicar.yml`: publica no GitHub Pages (padrão) ou na Cloudflare,
  conforme `ATALHO_HOSPEDAGEM`.
- `wrangler.jsonc`: configuração da Cloudflare (página 404 do site, barra final automática).
- `dist/_headers`: cabeçalhos de segurança e cache, gerados a cada publicação.
- `dist/CNAME`: gerado sozinho se você preferir domínio próprio continuando no GitHub Pages.
- `scripts/gerar-redirecionamento.mjs`: o endereço antigo vira redirecionamento, página por página.
- `scripts/migrar-dominio.mjs`: troca o endereço nos textos (use `--conferir` para só ver).
- A CDN da biblioteca (`cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1`) **não muda**: quem já
  usa o Atalho em projetos continua funcionando.
