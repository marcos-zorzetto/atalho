# Roadmap: o que falta para o Atalho superar o Bootstrap

Análise de 16 de outubro de 2026. Compara o Atalho 1.3 com o Bootstrap 5.3, o Tailwind
(e o Tailwind Plus/UI), o shadcn/ui, o Flowbite e o DaisyUI, e define prioridades.

## Onde o Atalho já está à frente

| Ponto | Atalho | Bootstrap | Tailwind UI / shadcn / Flowbite / DaisyUI |
|---|---|---|---|
| Língua | Tudo em português de Portugal (documentação, mensagens de erro, validação) | Inglês | Inglês |
| Formatos europeus | NIF, IBAN, código postal 0000-000, +351, €, MB WAY e Multibanco | Nenhum | Nenhum |
| Zero dependências e sem build | Um CSS e um JS pela CDN | Sim | Tailwind e shadcn exigem build e React |
| Estado reativo sem framework | `Atalho.estado`, `data-at-texto`, `data-at-acao` | Não | Só com React/Vue (Alpine no Flowbite) |
| Documentação "quando usar / evitar / como se liga" | Em cada componente | Parcial | Parcial |
| Acessibilidade testada | axe-core em todas as páginas, claro, escuro e telemóvel | Manual | Varia (shadcn herda do Radix) |
| Lado do servidor | Biblioteca PHP com as mesmas regras | Não | Não |
| Animações e 3D de nível Apple | 79 animações, cena WebGL | Não | Só pagas e soltas |
| Extensão do VS Code | Sim, com conta | Não oficial | shadcn tem CLI |

## O que falta (por prioridade)

### P0 — Credibilidade imediata (bloqueia a comparação direta)

1. **Domínio próprio e alojamento com cabeçalhos de segurança.** O site ainda vive em
   `github.io`, que não permite CSP/HSTS e não deve alojar um negócio com vendas.
   → Mudança para a PTServidor com `.htaccess` gerado (ver `servicos/PTSERVIDOR.md`).
2. **README e textos públicos ainda em pt-BR** (você, CPF, CEP, Pix, LGPD). O mercado é
   Portugal e Europa: o pt-BR passa a opção secundária.
3. **Conformidade com a Lei Europeia da Acessibilidade (EAA, em vigor desde 28/06/2025)
   e a EN 301 549.** Nenhuma biblioteca concorrente vende isto. O Atalho já testa WCAG
   2.1 AA; falta subir para **WCAG 2.2 AA** (foco não tapado, alvo mínimo de 24 px,
   arrastar com alternativa, autenticação acessível) e publicar uma **declaração de
   conformidade** por componente.
4. **Versões e garantias.** Changelog público, versionamento semântico, política de
   suporte dos navegadores (Baseline "Widely available") e de quebras de API.

### P1 — Paridade técnica com o CSS moderno

5. **`@layer`** (`atalho.base`, `atalho.componentes`, `atalho.utilitarios`): quem usa o
   Atalho consegue sobrepor estilos sem `!important`. O Bootstrap ainda não tem; o
   Tailwind 4 tem.
6. **Cores em `oklch()` e `light-dark()`**, com paleta gerada a partir de uma só cor da
   marca (como o Radix Colors / DaisyUI themes). Hoje há 79 variáveis `--at-*` e um só
   bloco de tema escuro.
7. **Temas prontos** (10+, ao estilo DaisyUI) e um **gerador de tema** no site que
   exporta as variáveis.
8. **Container queries** nos componentes que mudam de forma (cartão, tabela, barra):
   reagem ao espaço que têm, não ao ecrã inteiro.
9. **Propriedades lógicas** (`margin-inline`, `inset-inline`) em todo o CSS, para RTL
   (árabe, hebraico) sem CSS extra.
10. **Utilitários** de espaçamento, texto, flex e grelha mais completos e consistentes
    (o Bootstrap tem ~1 000; o Atalho tem uma grelha de 12 colunas e alguns auxiliares).
11. **Tipos e pacote npm** publicados (`npm i atalho`), com ESM e importação por
    componente (só o que se usa).

### P2 — Volume e acabamento ("4k")

12. **Componentes "4k"**: só SVG, CSS e WebGL (nada rasterizado), nítidos a 3× e em
    3840×2160, com animação própria e versão `prefers-reduced-motion`. Critérios
    verificados na auditoria automática (`testes/auditoria.mjs`):
    - nenhuma imagem `png/jpg/webp` dentro do componente;
    - existe regra `@media (prefers-reduced-motion: reduce)` ou verificação em JS;
    - capturas a `deviceScaleFactor` 2 e 3 e a 3840×2160 sem cortes nem
      deslocamento horizontal.
13. **Mais páginas prontas** (hoje 6): agência, restaurante, clínica, imobiliária,
    portefólio, evento, alojamento local, página de espera, 404/500, estado do serviço.
14. **Blocos de aplicação** ao nível do Tailwind UI (≈ 500 blocos): painéis, definições,
    listas, formulários de vários passos, faturação, notificações.

### P3 — Ecossistema que nenhuma concorrente tem em português

15. **30+ sistemas completos para o Pro** (agendamentos, CRM, orçamentos, loja, reservas,
    helpdesk, inventário…), em PHP 8.1 + SQLite, instaláveis num alojamento partilhado
    português (cPanel) com um único passo: enviar o zip e abrir `instalar.php`.
    O código fica no repositório privado `atalho-pro`.
16. **Kit de Figma** com os mesmos tokens.
17. **Integrações locais**: MB WAY / Multibanco (Eupago, ifthenpay), faturação
    certificada (Moloni, InvoiceXpress, Vendus) por API, CTT para envios, Livro de
    Reclamações eletrónico.
18. **Comunidade**: galeria de sites feitos com o Atalho, modelos de contribuição.

## Cuidados legais (Portugal / UE)

- **Faturação:** em Portugal, só software certificado pela AT pode emitir faturas.
  Os sistemas do Atalho emitem **orçamentos e faturas pró-forma** e ligam-se a um
  programa certificado; nunca se apresentam como faturação legal.
- **RGPD:** CRM e newsletter com consentimento explícito, dupla confirmação (double
  opt-in), anular a subscrição num clique e exportação/eliminação dos dados.
- **Lojas:** Livro de Reclamações eletrónico, aviso de Resolução Alternativa de
  Litígios (RAL), direito de livre resolução de 14 dias e preços com IVA incluído.

## Ordem de execução

| Fase | Itens | Estado |
|---|---|---|
| 1 | 1, 2, 12 (critérios na auditoria), 15 (primeiros sistemas) | em curso (outubro de 2026) |
| 2 | 3, 5, 6, 9 | próximo |
| 3 | 7, 8, 10, 11, 13 | seguinte |
| 4 | 4, 14, 16, 17, 18 | contínuo |
