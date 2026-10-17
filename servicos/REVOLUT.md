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

## Ligar a loja (4 passos, uns 10 minutos depois de a Revolut aprovar)

1. **Conta Revolut Business** (o plano *Free* de freelancer chega) e, dentro dela,
   **Merchant** → *Get started*. Indique o site `https://atalho.com.pt` e a atividade
   "venda de software / conteúdo digital por subscrição". A Revolut aprova em 1 a 3 dias úteis.
2. **Chave da API**: *Merchant* → *API* → **Production API Secret key** → *Generate*
   (começa por `sk_`).
3. **Colar a chave no Supabase** (e só aí; nunca por chat, e-mail ou WhatsApp):
   [Edge Functions → Secrets](https://supabase.com/dashboard/project/onjmugnpjvflomrevknh/functions/secrets)
   → *Add new secret* → nome `REVOLUT_SECRET_KEY`, valor = a chave.
4. Em **https://atalho.com.pt/admin/** (com a conta de administrador) → cartão
   **Pagamentos** → **Ligar a loja**. O painel cria na Revolut:
   - o plano **Atalho Pro** com as variações **9 €/mês** e **79 €/ano** (os preços vêm da
     tabela `produtos`) e guarda o id de cada variação;
   - o **webhook** para `revolut-webhook` (eventos `ORDER_COMPLETED` e `SUBSCRIPTION_*`)
     e guarda o segredo na tabela `config_revolut`, que só o servidor lê.

Pronto: o site pergunta à função `revolut-loja` se a loja está ligada (`pagamentos.ativo: "auto"`
em `site/config.js`) e os botões passam de "lista de espera" a "Subscrever" sozinhos, sem
publicar nada. Carregar outra vez em *Ligar a loja* não duplica planos nem webhooks.

> Preferir fazer à mão? Crie o plano e o webhook no painel da Revolut, ponha o *signing
> secret* em `REVOLUT_WEBHOOK_SECRET` e os ids das variações em `produtos.variante_revolut`.
> Reembolsos feitos no painel da Revolut: retire a compra no painel do Atalho (a lista de
> eventos de webhook da Revolut não tem, por agora, um aviso de reembolso).

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
- A função antiga `lemon-webhook` fica no repositório para o histórico. No Supabase recusa tudo
  (sem `LEMON_WEBHOOK_SECRET` nenhuma assinatura é válida) e pode ser apagada quando quiser.

## Faturas e IVA (confirme com o contabilista)

- Cada pagamento recebido precisa de **fatura-recibo** (Portal das Finanças ou programa de
  faturação certificado). O e-mail do cliente está no painel do Atalho e na Revolut.
- Com a **isenção do artigo 53.º** (faturação anual até 15 000 €), a fatura leva a menção
  "IVA - regime de isenção [art. 53.º do CIVA]".
- Vendas de serviços digitais a **consumidores de outros países da UE**: até 10 000 €/ano no
  total, aplicam-se as regras de Portugal. Acima disso, é preciso o regime **OSS** (balcão
  único do IVA) e cobrar o IVA do país do cliente.
