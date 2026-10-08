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
      "Grade de recursos, indicadores e linha do tempo de pedidos",
      "Perguntas frequentes em sanfona acessível pelo teclado",
      "Newsletter com validação de e-mail em português",
    ],
  },
  {
    id: "painel",
    nome: "Painel administrativo",
    resumo: "Menu lateral, indicadores, gráfico, atividade, tabela com busca e exportação e busca rápida Ctrl+K.",
    componentes: ["lateral", "indicador", "tabela", "comando", "gaveta"],
    destaques: [
      "Menu lateral de sistema e indicadores com variação",
      "Gráfico de barras feito só com CSS, sem biblioteca",
      "Tabela com busca, ordenação, paginação e exportação para planilha",
      "Busca rápida com Ctrl+K e gaveta para cadastrar um pedido",
    ],
  },
  {
    id: "loja",
    nome: "Loja virtual",
    resumo: "Vitrine com busca e filtro de preço, carrinho na gaveta salvo no navegador e notificações.",
    componentes: ["produto", "estado", "gaveta", "notificacao", "vazio"],
    destaques: [
      "Busca e filtro de preço atualizando a vitrine na hora",
      "Carrinho na gaveta lateral, salvo no navegador entre visitas",
      "Preços e parcelas formatados em reais",
      "Notificação com o botão Ver carrinho ao adicionar um produto",
    ],
  },
  {
    id: "checkout",
    nome: "Checkout com Pix",
    resumo: "Etapas, máscaras de CPF e celular, endereço pelo CEP, formas de pagamento e Pix copia e cola.",
    componentes: ["etapas", "mascaras", "cep", "validacao", "copiar", "modal"],
    destaques: [
      "Três etapas: dados, entrega e pagamento",
      "CPF e celular com máscara e validação de verdade",
      "Endereço preenchido pelo CEP (ViaCEP)",
      "Pix copia e cola em janela de confirmação, com resumo do pedido ao lado",
    ],
  },
  {
    id: "login",
    nome: "Tela de login",
    resumo: "Duas colunas com depoimento, login social, senha com mostrar/ocultar e validação.",
    componentes: ["campo", "senha", "validacao", "depoimentos"],
    destaques: [
      "Duas colunas com depoimento no computador; no celular, só o formulário",
      "Senha com botão de mostrar e ocultar",
      "Validação com mensagens claras, em português, no lugar certo",
      "Botão de login com Google pronto para ligar ao seu provedor",
    ],
  },
  {
    id: "blog",
    nome: "Blog",
    resumo: "Artigo em destaque, filtro por abas, lista de artigos, paginação e newsletter.",
    componentes: ["cartao", "abas", "paginacao", "newsletter", "cores-e-temas"],
    destaques: [
      "Artigo em destaque e grade de cartões responsiva",
      "Filtro por categoria com abas",
      "Paginação e newsletter com validação",
      "Botão de tema claro e escuro",
    ],
  },
];
