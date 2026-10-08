<p align="center">
  <img src="favicon.svg" width="72" alt="">
</p>

<h1 align="center">Atalho</h1>

<p align="center">
  <strong>Componentes de interface em português. Pare de juntar tutoriais: comece pelo componente pronto.</strong>
</p>

<p align="center">
  <a href="https://marcos-zorzetto.github.io/atalho/">Site e documentação</a> ·
  <a href="https://marcos-zorzetto.github.io/atalho/componentes/">Componentes</a> ·
  <a href="https://marcos-zorzetto.github.io/atalho/exemplos/">Exemplos completos</a> ·
  <a href="https://marcos-zorzetto.github.io/atalho/editor/">Editor ao vivo</a>
</p>

<p align="center">
  <a href="https://github.com/marcos-zorzetto/atalho/actions/workflows/validar.yml"><img src="https://github.com/marcos-zorzetto/atalho/actions/workflows/validar.yml/badge.svg" alt="Validação"></a>
  <img src="https://img.shields.io/badge/licen%C3%A7a-MIT-0f766e" alt="Licença MIT">
  <img src="https://img.shields.io/badge/depend%C3%AAncias-0-0f766e" alt="Zero dependências">
  <img src="https://img.shields.io/badge/WCAG-2.1%20AA-0f766e" alt="WCAG 2.1 AA">
</p>

---

O Atalho é uma biblioteca de HTML, CSS e JavaScript com **68 componentes e receitas** e **6 páginas completas**, nos padrões que empresas como Mercado Livre, GitHub, Stripe e Nubank usam, tudo explicado em português. Vem com tipos para **TypeScript** e uma biblioteca **PHP** para o lado do servidor.

Cada componente mostra:

- **quando usar e quando evitar**;
- **como funciona**, em linguagem simples;
- **exemplos que rodam na página**, gerados do mesmo código que você copia, com botão para abrir no editor;
- o mesmo exemplo em **HTML, JavaScript, TypeScript e PHP**, quando faz sentido;
- **acessibilidade**: o que já vem pronto e o que é responsabilidade sua;
- **com quais outros componentes ele se conecta**;
- **suporte dos navegadores**, com dados oficiais atualizados toda semana.

## Por que existe

Quem está começando costuma aprender em pedaços: um tutorial de formulário, outro de fetch, outro de modal. Na hora de juntar tudo num projeto real, nada se encaixa, e a documentação oficial (boa parte em inglês) mostra cada peça isolada. O Atalho entrega a tela pronta e mostra como as peças conversam.

## Começar em 30 segundos

Coloque no `<head>` da sua página:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho/atalho.css">
<script src="https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho/atalho.js" defer></script>
```

E use:

```html
<!-- Máscara e validação de CPF -->
<input class="at-entrada" data-at-mascara="cpf">

<!-- Modal sem JavaScript -->
<button class="at-botao at-perigo" commandfor="confirmar" command="show-modal">Excluir</button>
<dialog class="at-modal" id="confirmar">...</dialog>

<!-- Endereço preenchido pelo CEP -->
<input class="at-entrada" data-at-mascara="cep" data-at-cep>
<input class="at-entrada" data-at-cep-preencher="logradouro">
```

Sem npm, sem build, sem framework. Prefere não depender de CDN? Baixe a pasta [`atalho/`](atalho/). Quer testar antes? Abra o [editor ao vivo](https://marcos-zorzetto.github.io/atalho/editor/).

## Componentes conectados (a ideia do React, sem React)

```js
Atalho.estado("carrinho", {
  itens: [],
  get total() { return this.itens.reduce((soma, item) => soma + item.preco, 0); },
  adicionar(produto) { this.itens = [...this.itens, produto]; },
}, { salvar: true });
```

```html
<button data-at-acao="carrinho.adicionar" data-at-dados='{"nome":"Camiseta","preco":59.9}'>Comprar</button>
<strong data-at-texto="carrinho.total" data-at-formato="moeda"></strong>
```

Mude os dados e tudo que depende deles se atualiza sozinho. Veja a [receita da loja com carrinho](https://marcos-zorzetto.github.io/atalho/componentes/receita-loja/).

## TypeScript

O arquivo [`atalho/atalho.d.ts`](atalho/atalho.d.ts) descreve toda a API: o editor completa os nomes, confere os tipos do estado e dos eventos `at:*`.

```ts
/// <reference path="./atalho/atalho.d.ts" />
interface Carrinho { itens: { nome: string; preco: number }[]; readonly total: number }
const carrinho = Atalho.estado<Carrinho>("carrinho", {
  itens: [],
  get total(): number { return this.itens.reduce((s, i) => s + i.preco, 0); },
});
```

Guia completo: [TypeScript no Atalho](https://marcos-zorzetto.github.io/atalho/typescript/).

## PHP

[`php/atalho.php`](php/atalho.php) (PHP 8.1+, um arquivo só) repete no servidor as mesmas regras do navegador: CPF, CNPJ alfanumérico, validação com mensagens em português, respostas JSON, CSRF, CEP, upload seguro e paginação. Exemplos prontos em [`php/exemplos/`](php/exemplos/) e o guia em [PHP no servidor](https://marcos-zorzetto.github.io/atalho/php/).

## O que tem dentro

| Área | Componentes |
|---|---|
| Formulários | campos, máscaras (CPF, CNPJ alfanumérico, telefone, CEP, moeda, cartão, placa), endereço pelo CEP, validação em português, senha com força, código de verificação, upload, autocompletar, quantidade, etiquetas, faixa de valores, contador de caracteres |
| Ações | botão, menu suspenso, copiar (Pix copia e cola), botão do WhatsApp, voltar ao topo |
| Navegação | barra, menu largo, menu lateral de sistema, abas, trilha, paginação, carregar mais, etapas, busca rápida Ctrl+K |
| Janelas e avisos | modal, gaveta, dica, notificação com Desfazer, central de notificações |
| Exibir dados | cartão, cartão de produto, tabela (ordenar, filtrar, paginar, selecionar, exportar para Excel), indicadores, selos, avatar, rastreio, estrelas, carrossel, galeria com visualizador, vídeo leve, contagem animada, contagem regressiva, perguntas frequentes, chat, kanban |
| Feedback | alertas, carregando e esqueleto, estado vazio, aviso de cookies (LGPD) |
| Blocos de página | hero, recursos, depoimentos, planos e preços, rodapé |
| JavaScript | estado reativo, formatação brasileira (Intl), requisições com erros em português, eventos |
| Receitas | loja com carrinho, cadastro com CEP, painel administrativo, login em duas etapas |
| Páginas completas (grátis com conta) | landing page de produto, painel administrativo, loja virtual, checkout com Pix, login, blog |

## Qualidade verificada a cada mudança

Todo push passa por uma bateria automática ([`validar.yml`](.github/workflows/validar.yml)):

- **consistência**: toda classe usada nos exemplos existe no CSS, todo `data-at` existe no JS, nenhum link interno quebrado, SEO de cada página (título, descrição, canonical, um único `h1`), sitemap;
- **TypeScript**: os tipos e todos os exemplos de TypeScript da documentação compilam;
- **banco de dados**: as regras de segurança das contas rodam num PostgreSQL de verdade ([PGlite](https://pglite.dev)), conferindo que visitante não lê conteúdo exclusivo, que membro não vira administrador e que cada pessoa só vê os próprios dados;
- **PHP**: sintaxe e testes da biblioteca;
- **navegador de verdade**: 50 testes de interação (cliques, teclado, arrastar, celular) e auditoria de acessibilidade **WCAG 2.1 AA** com [axe-core](https://github.com/dequelabs/axe-core) em todas as páginas, no tema claro, no escuro e no celular.

## Atualizado sozinho

Toda segunda-feira, um [workflow](.github/workflows/atualizar-documentacao.yml) do GitHub Actions:

1. compara os recursos do navegador usados em cada componente com o [web-features](https://github.com/web-platform-dx/web-features), a base oficial que alimenta os selos Baseline do MDN;
2. confere se os links do MDN continuam funcionando e se alguma página em inglês ganhou tradução para português;
3. se algo mudou, o [Claude](https://github.com/anthropics/claude-code-action) revisa os componentes afetados;
4. os testes rodam e um **pull request** é aberto para revisão. Nada vai para o ar sem aprovação.

Para ligar a etapa de IA, crie o segredo `ANTHROPIC_API_KEY` em *Settings → Secrets and variables → Actions*. Sem a chave, o robô continua abrindo o PR com o relatório.

## Área de membros

Os componentes e a documentação são abertos para todos. As **páginas completas** ficam liberadas para quem cria uma conta grátis: a vitrine de cada uma (`/exemplos/<id>/`) é pública e aparece no Google, e o código só chega ao navegador de quem entrou na conta. Ele não fica neste repositório: vive no repositório privado `atalho-pro` e é entregue pelo Supabase, que confere a sessão de cada pedido.

O administrador do site tem um painel em `/admin/` com usuários, cadastros por dia, lista de espera do Atalho Pro (exportável para planilha) e o conteúdo publicado. Os dados vêm de funções do banco que recusam quem não é administrador.

## Serviços opcionais

O site funciona inteiro como páginas estáticas. Os recursos abaixo ficam desligados até você configurar, e todos cabem em planos gratuitos:

- **Contas, área de membros e painel do administrador** com [Supabase](https://supabase.com) e e-mails pelo [Brevo](https://www.brevo.com);
- **Assistente de IA** que monta o componente a partir de uma descrição, com [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (sem cartão de crédito, sem cobrança surpresa);
- **Espaços de patrocínio** com rótulo claro e `rel="sponsored"`.

O passo a passo está em [`servicos/LEIA-ME.md`](servicos/LEIA-ME.md).

## Desenvolvimento

```bash
npm test               # consistência, SEO e site gerado
npm run tipos          # exemplos de TypeScript da documentação
npm run e2e            # interações num navegador de verdade (Edge ou Chrome)
npm run auditoria      # acessibilidade WCAG 2.1 AA e layout em 3 visões
npm run site           # serve o site em http://localhost:3000
npm run atualizar      # roda o robô de atualização localmente
```

Estrutura:

```
atalho/          a biblioteca (atalho.css, atalho.js e atalho.d.ts)
php/             a biblioteca PHP, exemplos e testes
site/dados/      a documentação de cada componente (fonte única do site, da busca e dos testes)
site/            código do site de documentação, do editor e das contas
scripts/         gerador do site, robô de atualização e testes de consistência
testes/          testes de ponta a ponta e auditoria de acessibilidade
servicos/        assistente de IA (Cloudflare Worker) e banco de dados (Supabase)
exemplos/        miniaturas e capturas das páginas completas (o código fica no atalho-pro)
```

Encontrou um erro ou quer sugerir um componente? [Abra uma issue](https://github.com/marcos-zorzetto/atalho/issues). Quer apoiar o projeto? Veja [como patrocinar](https://marcos-zorzetto.github.io/atalho/patrocinar/).

## Créditos

Criado por **Marcos Zorzetto**. Empresas citadas aparecem só como referência de padrões de interface; o Atalho não tem relação com elas e todo o código foi escrito do zero. Dados de suporte dos navegadores: [web-features](https://github.com/web-platform-dx/web-features) (Apache 2.0). Endereços: [ViaCEP](https://viacep.com.br). Produtos de exemplo: [DummyJSON](https://dummyjson.com). Vídeo de exemplo: *Big Buck Bunny* (© Blender Foundation, CC BY 3.0).

Licença [MIT](LICENSE).

O projeto anterior deste repositório, a Loja Mamonas Assassinas (conclusão de módulo do curso Full Stack Web Developer da Master D), está preservado na branch [`loja-original`](https://github.com/marcos-zorzetto/atalho/tree/loja-original).
