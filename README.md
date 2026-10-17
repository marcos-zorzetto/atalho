<p align="center">
  <img src="favicon.svg" width="72" alt="">
</p>

<h1 align="center">Atalho</h1>

<p align="center">
  <strong>Componentes de interface em português. Deixe de juntar tutoriais: comece pelo componente pronto.</strong>
</p>

<p align="center">
  <a href="https://atalho.com.pt/">Site e documentação</a> ·
  <a href="https://atalho.com.pt/componentes/">Componentes</a> ·
  <a href="https://atalho.com.pt/exemplos/">Exemplos completos</a> ·
  <a href="https://atalho.com.pt/sistemas/">Sistemas</a> ·
  <a href="https://atalho.com.pt/editor/">Editor ao vivo</a>
</p>

<p align="center">
  <a href="https://github.com/marcos-zorzetto/atalho/actions/workflows/validar.yml"><img src="https://github.com/marcos-zorzetto/atalho/actions/workflows/validar.yml/badge.svg" alt="Validação"></a>
  <img src="https://img.shields.io/badge/licen%C3%A7a-MIT-0f766e" alt="Licença MIT">
  <img src="https://img.shields.io/badge/depend%C3%AAncias-0-0f766e" alt="Zero dependências">
  <img src="https://img.shields.io/badge/WCAG-2.1%20AA-0f766e" alt="WCAG 2.1 AA">
</p>

---

O Atalho é uma biblioteca de HTML, CSS e JavaScript com **77 componentes e receitas** e **6 páginas completas**, nos padrões que empresas como a Stripe, o GitHub e a Apple usam, tudo explicado em português de Portugal. Traz tipos para **TypeScript** e uma biblioteca **PHP** para o lado do servidor. Os formatos são os portugueses e europeus: NIF, IBAN, código postal 0000-000, telemóvel +351, euro, MB WAY e Multibanco (o português do Brasil continua disponível como opção).

Cada componente mostra:

- **quando usar e quando evitar**;
- **como funciona**, em linguagem simples;
- **exemplos que correm na página**, gerados do mesmo código que copia, com botão para abrir no editor;
- o mesmo exemplo em **HTML, JavaScript, TypeScript e PHP**, quando faz sentido;
- **acessibilidade**: o que já vem pronto e o que fica a seu cargo;
- **com que outros componentes se liga**;
- **suporte dos navegadores**, com dados oficiais atualizados todas as semanas.

## Porque existe

Quem está a começar aprende aos bocados: um tutorial de formulários, outro de fetch, outro de janelas modais. Na hora de juntar tudo num projeto real, nada encaixa, e a documentação oficial (quase toda em inglês) mostra cada peça isolada. O Atalho entrega o ecrã pronto e mostra como as peças se ligam.

## Começar em 30 segundos

Ponha no `<head>` da sua página:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho/atalho.css">
<script src="https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho/atalho.js" defer></script>
```

E use:

```html
<!-- Máscara e validação de NIF -->
<input class="at-entrada" data-at-mascara="nif">

<!-- Janela modal sem JavaScript -->
<button class="at-botao at-perigo" commandfor="confirmar" command="show-modal">Apagar</button>
<dialog class="at-modal" id="confirmar">...</dialog>

<!-- Morada preenchida pelo código postal -->
<input class="at-entrada" data-at-mascara="codigo-postal" data-at-codigo-postal>
<input class="at-entrada" data-at-cp-preencher="rua">
<input class="at-entrada" data-at-cp-preencher="localidade">
```

Sem npm, sem build, sem framework. Prefere não depender de uma CDN? Descarregue a pasta [`atalho/`](atalho/). Quer experimentar antes? Abra o [editor ao vivo](https://atalho.com.pt/editor/).

## Componentes ligados (a ideia do React, sem React)

```js
Atalho.estado("carrinho", {
  itens: [],
  get total() { return this.itens.reduce((soma, item) => soma + item.preco, 0); },
  adicionar(produto) { this.itens = [...this.itens, produto]; },
}, { salvar: true });
```

```html
<button data-at-acao="carrinho.adicionar" data-at-dados='{"nome":"Caneca","preco":14.9}'>Comprar</button>
<strong data-at-texto="carrinho.total" data-at-formato="moeda"></strong>
```

Mude os dados e tudo o que depende deles atualiza-se sozinho. Veja a [receita da loja com carrinho](https://atalho.com.pt/componentes/receita-loja/).

## TypeScript

O ficheiro [`atalho/atalho.d.ts`](atalho/atalho.d.ts) descreve toda a API: o editor completa os nomes e confere os tipos do estado e dos eventos `at:*`.

```ts
/// <reference path="./atalho/atalho.d.ts" />
interface Carrinho { itens: { nome: string; preco: number }[]; readonly total: number }
const carrinho = Atalho.estado<Carrinho>("carrinho", {
  itens: [],
  get total(): number { return this.itens.reduce((s, i) => s + i.preco, 0); },
});
```

Guia completo: [TypeScript no Atalho](https://atalho.com.pt/typescript/).

## PHP

[`php/atalho.php`](php/atalho.php) (PHP 8.1+, um só ficheiro) repete no servidor as mesmas regras do navegador: NIF, IBAN, código postal, validação com mensagens em português, respostas JSON, CSRF, upload seguro e paginação. Exemplos prontos em [`php/exemplos/`](php/exemplos/) e o guia em [PHP no servidor](https://atalho.com.pt/php/).

## O que tem dentro

| Área | Componentes |
|---|---|
| Formulários | campos, máscaras (NIF, IBAN, código postal, telemóvel, moeda, cartão, matrícula), morada pelo código postal, validação em português, palavra-passe com força, código de verificação, upload, autocompletar, quantidade, etiquetas, intervalo de valores, contador de caracteres |
| Ações | botão, menu suspenso, copiar (referência Multibanco, IBAN), botão do WhatsApp, voltar ao topo |
| Navegação | barra, menu largo, menu lateral de sistema, separadores, trilho, paginação, carregar mais, etapas, pesquisa rápida Ctrl+K |
| Janelas e avisos | modal, gaveta, dica, notificação com Desfazer, centro de notificações |
| Mostrar dados | cartão, cartão de produto, tabela (ordenar, filtrar, paginar, selecionar, exportar para Excel), indicadores, selos, avatar, seguimento de encomenda, estrelas, carrossel, galeria com visualizador, vídeo leve, contagem animada, contagem decrescente, perguntas frequentes, chat, kanban |
| Feedback | alertas, a carregar e esqueleto, estado vazio, aviso de cookies (RGPD) |
| Blocos de página | hero, recursos, testemunhos, planos e preços, rodapé |
| JavaScript | estado reativo, formatação europeia (Intl), pedidos com erros em português, eventos |
| Receitas | loja com carrinho, registo com código postal, painel de administração, login em dois passos |
| Páginas completas (grátis com conta) | landing page de produto, painel de administração, loja online, checkout com MB WAY, login, blog |
| Atalho Pro | **44 sistemas completos** em PHP + SQLite (CRM, marcações, orçamentos, loja, reservas, helpdesk, inventário, alojamento local…), 119 componentes avançados e 79 animações, incluindo 3D em WebGL |

## Qualidade verificada a cada mudança

Todos os pushes passam por uma bateria automática ([`validar.yml`](.github/workflows/validar.yml)):

- **consistência**: todas as classes usadas nos exemplos existem no CSS, todos os `data-at` existem no JS, nenhum link interno partido, SEO de cada página (título, descrição, canonical, um único `h1`), sitemap;
- **segurança**: nenhum código do Pro nem segredo no site público; `.htaccess` com HTTPS, CSP e cabeçalhos de segurança, e os testes no navegador correm com essa mesma CSP;
- **TypeScript**: os tipos e todos os exemplos de TypeScript da documentação compilam;
- **base de dados**: as regras de segurança das contas correm num PostgreSQL a sério ([PGlite](https://pglite.dev)), a confirmar que um visitante não lê conteúdo exclusivo, que um membro não passa a administrador e que cada pessoa só vê os próprios dados;
- **PHP**: sintaxe e testes da biblioteca;
- **navegador a sério**: 80 testes de interação (cliques, teclado, arrastar, telemóvel) e auditoria de acessibilidade **WCAG 2.1 AA** com [axe-core](https://github.com/dequelabs/axe-core) em todas as páginas, no tema claro, no escuro, no tablet e no telemóvel.

## Atualizado sozinho

Todas as segundas-feiras, um [workflow](.github/workflows/atualizar-documentacao.yml) do GitHub Actions:

1. compara os recursos do navegador usados em cada componente com o [web-features](https://github.com/web-platform-dx/web-features), a base oficial que alimenta os selos Baseline do MDN;
2. confirma que os links do MDN continuam a funcionar e se alguma página em inglês ganhou tradução;
3. se algo mudou, um assistente de IA revê os componentes afetados;
4. os testes correm e é aberto um **pull request** para revisão. Nada vai para o ar sem aprovação.

Para ligar a etapa de IA, crie o segredo `ANTHROPIC_API_KEY` em *Settings → Secrets and variables → Actions*. Sem a chave, o robô continua a abrir o PR com o relatório.

## Área de membros e Atalho Pro

Os componentes e a documentação são abertos a todos. As **páginas completas** ficam disponíveis para quem cria uma conta grátis: a montra de cada uma (`/exemplos/<id>/`) é pública e aparece no Google, e o código só chega ao navegador de quem entrou na conta. Esse código não está neste repositório: vive no repositório privado `atalho-pro` e é entregue pelo Supabase, que confere a sessão em cada pedido.

O **Atalho Pro** (9 €/mês ou 79 €/ano, IVA incluído) junta os [44 sistemas completos](https://atalho.com.pt/sistemas/), os componentes avançados e as animações. Cada sistema instala-se num passo em qualquer alojamento com PHP 8.1 (enviar o zip e abrir o endereço), com dados de exemplo, documentação em português e ferramentas do RGPD.

O administrador do site tem um painel em `/admin/` com utilizadores, registos por dia, lista de espera do Pro (exportável para folha de cálculo) e o conteúdo publicado. Os dados vêm de funções da base de dados que recusam quem não é administrador.

## Serviços opcionais

O site funciona inteiro como páginas estáticas. Os recursos abaixo ficam desligados até os configurar, e todos cabem em planos gratuitos:

- **Contas, área de membros e painel de administração** com [Supabase](https://supabase.com) e e-mails pelo [Brevo](https://www.brevo.com);
- **Pagamentos** com a [Lemon Squeezy](https://www.lemonsqueezy.com) (revendedora oficial: cobra, trata do IVA e emite a fatura);
- **Assistente de IA** que monta o componente a partir de uma descrição, com [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/);
- **Espaços de patrocínio** com rótulo claro e `rel="sponsored"`.

O passo a passo está em [`servicos/LEIA-ME.md`](servicos/LEIA-ME.md). O alojamento na PTServidor (cPanel), com domínio próprio, está em [`servicos/PTSERVIDOR.md`](servicos/PTSERVIDOR.md).

## Desenvolvimento

```bash
npm test               # consistência, SEO, segurança e site gerado
npm run tipos          # exemplos de TypeScript da documentação
npm run e2e            # interações num navegador a sério (Edge ou Chrome)
npm run auditoria      # acessibilidade WCAG 2.1 AA e layout em 5 vistas
npm run site           # serve o site em http://localhost:3000
npm run atualizar      # corre o robô de atualização localmente
node scripts/empacotar-ptservidor.mjs https://atalho.com.pt/   # zip para o cPanel
```

Estrutura:

```
atalho/          a biblioteca (atalho.css, atalho.js e atalho.d.ts)
php/             a biblioteca PHP, exemplos e testes
site/dados/      a documentação de cada componente (fonte única do site, da pesquisa e dos testes)
site/            código do site de documentação, do editor e das contas
scripts/         gerador do site, robô de atualização e testes de consistência
testes/          testes de ponta a ponta e auditoria de acessibilidade
servicos/        assistente de IA (Cloudflare Worker), base de dados (Supabase) e guias de alojamento
docs/            roadmap e decisões do projeto
exemplos/        miniaturas e capturas das páginas completas (o código fica no atalho-pro)
```

Encontrou um erro ou quer sugerir um componente? [Abra uma issue](https://github.com/marcos-zorzetto/atalho/issues). Quer apoiar o projeto? Veja [como patrocinar](https://atalho.com.pt/patrocinar/). O que vem a seguir está no [roadmap](docs/ROADMAP-SUPERAR-BOOTSTRAP.md).

## Créditos

Criado por **Marcos Zorzetto**. As empresas citadas aparecem só como referência de padrões de interface; o Atalho não tem relação com elas e todo o código foi escrito de raiz. Dados de suporte dos navegadores: [web-features](https://github.com/web-platform-dx/web-features) (Apache 2.0). Moradas: [GEO API PT](https://json.geoapi.pt) (Portugal) e [ViaCEP](https://viacep.com.br) (Brasil). Produtos de exemplo: [DummyJSON](https://dummyjson.com). Vídeo de exemplo: *Big Buck Bunny* (© Blender Foundation, CC BY 3.0).

Licença [MIT](LICENSE).

O projeto anterior deste repositório, a Loja Mamonas Assassinas (conclusão de módulo do curso Full Stack Web Developer da Master D), está preservado na branch [`loja-original`](https://github.com/marcos-zorzetto/atalho/tree/loja-original).
