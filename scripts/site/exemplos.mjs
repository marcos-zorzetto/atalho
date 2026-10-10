/**
 * Páginas completas. A vitrine (/exemplos/<id>/) e a miniatura são públicas; o
 * código completo é exclusivo para membros e fica no Supabase (tabela
 * "conteudos"), enviado pelo repositório privado atalho-pro.
 *
 * componentes: ids das páginas de componentes usadas (viram links na vitrine).
 */
export const EXEMPLOS = [
  {
    id: "landing-saas",
    nome: "Landing page de produto",
    resumo: "Hero, integrações, recursos, planos com mensal/anual, perguntas frequentes e newsletter.",
    componentes: ["hero", "planos", "sanfona", "indicador", "linha-do-tempo", "estado"],
    destaques: [
      "Preços que mudam sozinhos entre mensal e anual, com o valor recalculado",
      "Grelha de recursos, indicadores e cronologia de encomendas",
      "Perguntas frequentes em acordeão acessível pelo teclado",
      "Newsletter com validação de e-mail em português",
    ],
  },
  {
    id: "painel",
    nome: "Painel administrativo",
    resumo: "Menu lateral, indicadores, gráfico, atividade, tabela com pesquisa e exportação e pesquisa rápida Ctrl+K.",
    componentes: ["lateral", "indicador", "tabela", "comando", "gaveta"],
    destaques: [
      "Menu lateral de sistema e indicadores com variação",
      "Gráfico de barras feito só com CSS, sem biblioteca",
      "Tabela com pesquisa, ordenação, paginação e exportação para folha de cálculo",
      "Pesquisa rápida com Ctrl+K e gaveta para registar uma encomenda",
    ],
  },
  {
    id: "loja",
    nome: "Loja online",
    resumo: "Montra com pesquisa e filtro de preço, carrinho na gaveta guardado no navegador e notificações.",
    componentes: ["produto", "estado", "gaveta", "notificacao", "vazio"],
    destaques: [
      "Pesquisa e filtro de preço a atualizar a montra na hora",
      "Carrinho na gaveta lateral, guardado no navegador entre visitas",
      "Preços e prestações formatados em euros",
      "Notificação com o botão Ver carrinho ao adicionar um produto",
    ],
  },
  {
    id: "checkout",
    nome: "Checkout com MB WAY",
    resumo: "Etapas, NIF e telemóvel com máscara, morada pelo código postal, formas de pagamento e confirmação por MB WAY.",
    componentes: ["etapas", "mascaras", "cep", "validacao", "copiar", "modal"],
    destaques: [
      "Três etapas: dados, entrega e pagamento",
      "NIF e telemóvel com máscara e validação de verdade",
      "Morada preenchida pelo código postal (GEO API PT)",
      "Pagamento por MB WAY em janela de confirmação, com o resumo da encomenda ao lado",
    ],
  },
  {
    id: "login",
    nome: "Ecrã de login",
    resumo: "Duas colunas com testemunho, login social, palavra-passe com mostrar/ocultar e validação.",
    componentes: ["campo", "senha", "validacao", "depoimentos"],
    destaques: [
      "Duas colunas com testemunho no computador; no telemóvel, só o formulário",
      "Palavra-passe com botão de mostrar e ocultar",
      "Validação com mensagens claras, em português, no lugar certo",
      "Botão de login com Google pronto para ligar ao seu fornecedor",
    ],
  },
  {
    id: "blog",
    nome: "Blog",
    resumo: "Artigo em destaque, filtro por abas, lista de artigos, paginação e newsletter.",
    componentes: ["cartao", "abas", "paginacao", "newsletter", "cores-e-temas"],
    destaques: [
      "Artigo em destaque e grelha de cartões responsiva",
      "Filtro por categoria com abas",
      "Paginação e newsletter com validação",
      "Botão de tema claro e escuro",
    ],
  },
];
