# Pagamentos do Atalho pela Revolut Business

Desde 16 de outubro de 2026, o Atalho cobra o Pro e as compras avulsas pela **Revolut Business**.
O dinheiro entra **diretamente na conta Revolut Business**, normalmente no dia útil seguinte.

| | Revolut Business | Lemon Squeezy (antes) |
|---|---|---|
| Taxa por pagamento com cartão europeu | cerca de **1 % + 0,20 €** | 5 % + 0,50 € (+ extras) |
| Num Pro de 9 € fica com | cerca de **8,71 €** | cerca de 8,05 € (ou menos) |
| Mensalidade | 0 € no plano grátis | 0 € |
| Fatura ao cliente | **emite o vendedor** (Portal das Finanças) | emitia a Lemon Squeezy |
| IVA de clientes de outros países | por sua conta (ver abaixo) | tratava a Lemon Squeezy |

> Confirme as taxas atuais em Revolut Business → Merchant → *Fees*: variam por plano e por país.

## O que é preciso criar (no telemóvel ou em business.revolut.com)

1. **Conta Revolut Business** (plano *Free* de freelancer chega). A Revolut pede o NIF e a
   atividade aberta nas Finanças.
2. **Merchant account**: Revolut Business → *Merchant* → *Get started*. Indique o site
   `https://atalho.com.pt` e a atividade "venda de software / conteúdo digital por subscrição".
   A Revolut aprova em 1 a 3 dias úteis.
3. **Planos de subscrição**: *Merchant* → *Subscriptions* → *Create plan*:
   - **Atalho Pro**, com duas variações: **mensal 9,00 €** e **anual 79,00 €**.
   - Depois de criar, abra cada variação e copie o **ID da variação** (`plan_variation_id`).
4. **Chave da API**: *Merchant* → *API* → *Generate* → **Production API Secret key** (`sk_...`).
5. **Webhook**: *Merchant* → *API* → *Webhooks* → *Add*:
   - URL: `https://onjmugnpjvflomrevknh.supabase.co/functions/v1/revolut-webhook`
   - Eventos: `ORDER_COMPLETED`, `ORDER_PAYMENT_REFUNDED` e todos os `SUBSCRIPTION_*`
   - Guarde o **Signing secret** (`wsk_...`).

**Nunca envie as chaves por chat, e-mail ou WhatsApp.** Cole-as só no Supabase (passo seguinte).

## O que colar no Supabase

1. *Project Settings* → *Edge Functions* → *Secrets* → **Add new secret**:
   - `REVOLUT_SECRET_KEY` = a chave `sk_...`
   - `REVOLUT_WEBHOOK_SECRET` = o `wsk_...`
   - `ATALHO_URL` = `https://atalho.com.pt/`
2. *SQL Editor* → ligar os planos aos produtos (troque pelos IDs copiados no passo 3):
   ```sql
   update public.produtos set variante_revolut = 'ID-DA-VARIACAO-MENSAL' where id = 'pro-mensal';
   update public.produtos set variante_revolut = 'ID-DA-VARIACAO-ANUAL'  where id = 'pro-anual';
   ```
3. No site, `site/config.js` → `pagamentos: { ativo: true }` e publicar (push na `main`).

## Testar antes de vender (opcional, recomendado)

A Revolut tem um ambiente de testes: *Merchant* → *API* → **Sandbox**. Com a chave de
sandbox em `REVOLUT_SECRET_KEY` e o segredo `REVOLUT_SANDBOX = 1`, os pagamentos usam
cartões de teste e nada é cobrado. No fim, troque para a chave de produção e apague
`REVOLUT_SANDBOX`.

## Como funciona (para manutenção)

```
Botão "Subscrever" → função revolut-loja (com a sessão da pessoa)
   → cria o cliente e a subscrição na Revolut (external_reference = id da conta)
   → devolve a página de pagamento da Revolut → a pessoa paga
Revolut → aviso assinado → função revolut-webhook
   → confere a assinatura HMAC (v1.<carimbo>.<corpo>) e o carimbo (até 5 minutos)
   → pergunta à Revolut o estado atual da subscrição → grava em "assinaturas"
   → o Pro fica ativo (tem_pro()), com acesso até ao fim do período pago se cancelar
```

- Código: `servicos/supabase/functions/_shared/revolut.ts` (testes em `revolut.test.ts`),
  `revolut-loja/` e `revolut-webhook/`. Base de dados: fim de `servicos/supabase/schema.sql`.
- Publicar as funções: `npx supabase functions deploy revolut-loja` e
  `npx supabase functions deploy revolut-webhook --no-verify-jwt`.
- A função antiga `lemon-webhook` fica no repositório para o histórico; pode ser apagada
  no Supabase quando não houver subscrições antigas.

## Faturas e IVA (confirme com o contabilista)

- Cada pagamento recebido precisa de **fatura-recibo** (Portal das Finanças ou programa de
  faturação certificado). O e-mail do cliente está no painel do Atalho e na Revolut.
- Com a **isenção do artigo 53.º** (faturação anual até 15 000 €), a fatura leva a menção
  "IVA - regime de isenção [art. 53.º do CIVA]".
- Vendas de serviços digitais a **consumidores de outros países da UE**: até 10 000 €/ano no
  total, aplicam-se as regras de Portugal. Acima disso, é preciso o regime **OSS** (balcão
  único do IVA) e cobrar o IVA do país do cliente.
