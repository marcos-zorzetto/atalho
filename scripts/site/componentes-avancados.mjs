/**
 * Catálogo dos Componentes avançados: só os dados públicos. O código de cada um
 * fica no repositório privado atalho-pro (conteudos/componentes/<nivel>/<id>.html)
 * e no Supabase, que só entrega a quem tem acesso:
 *   publico (10, sem cadastro) · membro (+10, com conta grátis) · pro (todos)
 *
 * Os componentes básicos da biblioteca (os equivalentes ao Bootstrap) continuam
 * grátis na documentação; estes são blocos completos, prontos para usar.
 */

const cor = (id, padrao = "#0f766e", rotulo = "Cor principal") => ({ var: `--${id}-cor`, rotulo, tipo: "cor", padrao });
const raio = (id, padrao = 16) => ({ var: `--${id}-raio`, rotulo: "Arredondamento", tipo: "numero", min: 0, max: 32, passo: 1, padrao, unidade: "px" });
const numero = (id, nome, rotulo, min, max, passo, padrao, unidade = "") => ({ var: `--${id}-${nome}`, rotulo, tipo: "numero", min, max, passo, padrao, unidade });

export const CATEGORIAS_COMPONENTES = [
  { id: "topo", nome: "Topo (hero)" },
  { id: "navegacao", nome: "Navegação" },
  { id: "vendas", nome: "Vendas e preços" },
  { id: "prova", nome: "Prova social" },
  { id: "loja", nome: "Loja virtual" },
  { id: "agenda", nome: "Agenda e serviços" },
  { id: "formularios", nome: "Formulários" },
  { id: "dados", nome: "Painéis e gráficos" },
  { id: "midia", nome: "Fotos e vídeos" },
  { id: "comunicacao", nome: "Comunicação" },
  { id: "rodape", nome: "Rodapé e chamadas" },
  { id: "utilidades", nome: "Utilidades" },
];

const c = (id, nome, nivel, categoria, descricao, extra = {}) => ({ id, nome, nivel, categoria, descricao, ...extra });

export const COMPONENTES_AVANCADOS = [
  /* ------------------------------ Grátis (10) ------------------------------ */
  c("hero-gradiente", "Topo com gradiente e chamada", "publico", "topo", "Título forte, texto de apoio, dois botões e selo de confiança sobre um gradiente elegante.", { parametros: [cor("hero-gradiente"), { var: "--hero-gradiente-cor2", rotulo: "Cor secundária", tipo: "cor", padrao: "#4f46e5" }], dicas: ["Use um título que diga o resultado para o cliente (\"Agenda cheia em 30 dias\"), não o que você faz."] }),
  c("precos-tres-planos", "Tabela de preços com 3 planos", "publico", "vendas", "Planos lado a lado com o recomendado em destaque, alternância mensal/anual e lista de benefícios.", { parametros: [cor("precos-tres-planos")], dicas: ["Coloque o plano que você mais quer vender no meio: é o que mais recebe cliques."] }),
  c("depoimentos-carrossel", "Depoimentos em carrossel", "publico", "prova", "Depoimentos com foto, nome, cargo e estrelas, passando sozinhos e com setas.", { parametros: [cor("depoimentos-carrossel")], dicas: ["Peça autorização ao cliente antes de publicar nome e foto (LGPD/RGPD)."] }),
  c("logos-clientes", "Faixa de logos de clientes", "publico", "prova", "Logos de clientes ou parceiros em tons de cinza que ganham cor ao passar o mouse.", { dicas: ["Use logos em SVG ou PNG com fundo transparente."] }),
  c("faq-busca", "Perguntas frequentes com busca", "publico", "comunicacao", "Sanfona de perguntas com campo de busca que filtra na hora e destaca o termo.", { parametros: [cor("faq-busca")] }),
  c("rodape-empresa", "Rodapé completo de empresa", "publico", "rodape", "Logo, colunas de links, redes sociais, contato, CNPJ/NIF e direitos autorais.", { parametros: [cor("rodape-empresa", "#0f172a", "Cor de fundo")] }),
  c("botao-whatsapp-pedido", "Botão de pedido pelo WhatsApp", "publico", "comunicacao", "Botão flutuante que abre o WhatsApp com a mensagem já escrita, com balão de \"posso ajudar?\".", { parametros: [cor("botao-whatsapp-pedido", "#25d366")], dicas: ["Troque o número no código: só dígitos, com o código do país (55 para o Brasil, 351 para Portugal)."] }),
  c("kpis-sparkline", "Indicadores com minigráfico", "publico", "dados", "Cartões de faturamento, pedidos e clientes com variação e um minigráfico de tendência.", { parametros: [cor("kpis-sparkline")] }),
  c("galeria-lightbox", "Galeria com ampliação", "publico", "midia", "Grade de fotos em mosaico que abre em tela cheia com setas, teclado e legenda.", { dicas: ["Use fotos com no máximo 300 KB cada para o site ficar rápido (o site squoosh.app reduz de graça)."] }),
  c("aberto-agora", "Horário de funcionamento \"aberto agora\"", "publico", "agenda", "Mostra se o negócio está aberto neste momento, quando abre e o horário da semana.", { parametros: [cor("aberto-agora", "#16a34a", "Cor de aberto")], dicas: ["Os horários ficam numa lista no começo do script: mude e pronto."] }),

  /* --------------------------- Com conta grátis (10) --------------------------- */
  c("hero-dividido", "Topo dividido com foto", "membro", "topo", "Texto à esquerda e foto à direita, com números de prova social e botão principal.", { parametros: [cor("hero-dividido"), raio("hero-dividido", 24)] }),
  c("navbar-transparente", "Menu que muda ao rolar", "membro", "navegacao", "Menu transparente sobre a foto do topo que fica sólido com sombra ao rolar, com menu de celular.", { parametros: [cor("navbar-transparente")], rolagem: true, paginaInteira: true }),
  c("formulario-etapas", "Formulário em etapas", "membro", "formularios", "Cadastro dividido em passos com barra de progresso, validação por etapa e revisão final.", { parametros: [cor("formulario-etapas")] }),
  c("upload-previa", "Envio de arquivos com prévia", "membro", "formularios", "Arraste fotos e documentos, veja a prévia, o tamanho e remova antes de enviar.", { parametros: [cor("upload-previa")] }),
  c("calendario-eventos", "Calendário do mês com eventos", "membro", "agenda", "Calendário mensal com eventos coloridos, navegação entre meses e detalhes do dia.", { parametros: [cor("calendario-eventos")] }),
  c("grafico-barras", "Gráfico de barras animado", "membro", "dados", "Barras em SVG com valores, legenda e dica ao passar o mouse, sem biblioteca.", { parametros: [cor("grafico-barras")] }),
  c("carrinho-lateral", "Carrinho lateral", "membro", "loja", "Gaveta com os itens, quantidade, subtotal, frete grátis a partir de um valor e botão de finalizar.", { parametros: [cor("carrinho-lateral")] }),
  c("data-horario", "Escolha de data e horário", "membro", "agenda", "Seleção de dia e dos horários livres, como nos apps de agendamento de salão e clínica.", { parametros: [cor("data-horario")] }),
  c("antes-depois", "Comparador antes e depois", "membro", "midia", "Duas fotos sobrepostas com uma barra que a pessoa arrasta para comparar.", { dicas: ["Use as duas fotos com o mesmo tamanho e enquadramento."] }),
  c("cookies-preferencias", "Aviso de cookies com preferências", "membro", "utilidades", "Aviso de cookies (LGPD/RGPD) com aceitar, recusar e escolher categorias, salvando a escolha.", { parametros: [cor("cookies-preferencias")] }),

  /* ------------------------------------ Pro ------------------------------------ */
  // Topo
  c("hero-video", "Topo com vídeo de fundo", "pro", "topo", "Vídeo em loop no fundo com camada escura, título e botão; vira imagem no celular para economizar dados.", { parametros: [numero("hero-video", "escurecer", "Escurecer o vídeo", 0, 0.9, 0.05, 0.55)] }),
  c("hero-formulario", "Topo com formulário de captura", "pro", "topo", "Proposta à esquerda e formulário de contato à direita: ideal para gerar orçamentos.", { parametros: [cor("hero-formulario")] }),
  c("hero-app", "Topo de aplicativo com celular", "pro", "topo", "Moldura de celular com a tela do app, selos das lojas e avaliações.", { parametros: [cor("hero-app")] }),
  c("hero-oferta", "Topo de oferta com contagem regressiva", "pro", "topo", "Promoção com preço riscado, desconto e contador até o fim da oferta.", { parametros: [cor("hero-oferta", "#dc2626")] }),
  c("hero-busca-imoveis", "Topo com busca de imóveis", "pro", "topo", "Foto de fundo e busca com cidade, tipo, quartos e faixa de preço.", { parametros: [cor("hero-busca-imoveis")] }),
  c("hero-delivery", "Topo de delivery com endereço", "pro", "topo", "Campo de CEP ou endereço, tempo de entrega e categorias do cardápio.", { parametros: [cor("hero-delivery", "#ea580c")] }),
  c("hero-agendamento", "Topo com agendamento rápido", "pro", "topo", "Escolha de serviço e dia direto no topo, com botão de confirmar.", { parametros: [cor("hero-agendamento")] }),
  c("hero-carrossel", "Topo em carrossel", "pro", "topo", "Vários destaques passando com transição suave, pontos e setas.", { parametros: [numero("hero-carrossel", "intervalo", "Tempo de cada slide", 2000, 10000, 500, 5000, "ms")] }),
  c("hero-metricas", "Topo com métricas de resultado", "pro", "topo", "Título, chamada e uma faixa de números grandes que provam resultado.", { parametros: [cor("hero-metricas")] }),

  // Navegação
  c("mega-menu", "Mega menu", "pro", "navegacao", "Menu com painéis grandes, colunas, ícones e destaque, acessível pelo teclado.", { parametros: [cor("mega-menu")], paginaInteira: true }),
  c("menu-lateral-recolhivel", "Menu lateral que recolhe", "pro", "navegacao", "Menu de sistema que recolhe para só ícones e lembra a escolha.", { parametros: [cor("menu-lateral-recolhivel")], paginaInteira: true }),
  c("barra-inferior-app", "Barra inferior de aplicativo", "pro", "navegacao", "Navegação fixa no rodapé do celular, com ícone ativo e botão central de destaque.", { parametros: [cor("barra-inferior-app")] }),
  c("abas-indicador", "Abas com indicador deslizante", "pro", "navegacao", "Abas em que a marcação desliza até a aba escolhida.", { parametros: [cor("abas-indicador")] }),
  c("indice-flutuante", "Índice flutuante do artigo", "pro", "navegacao", "Sumário fixo ao lado do texto que marca a seção que está sendo lida.", { rolagem: true, paginaInteira: true }),
  c("barra-anuncio", "Barra de anúncio no topo", "pro", "navegacao", "Faixa fina com aviso ou cupom, que a pessoa pode fechar (e não volta).", { parametros: [cor("barra-anuncio")] }),
  c("trilha-icones", "Trilha de navegação com ícones", "pro", "navegacao", "\"Você está em\" com ícones, que encurta no celular.", {}),
  c("paginacao-numeros", "Paginação completa", "pro", "navegacao", "Números, reticências, anterior/próximo e \"itens por página\".", { parametros: [cor("paginacao-numeros")] }),

  // Vendas
  c("comparativo-planos", "Tabela comparativa de recursos", "pro", "vendas", "Recursos em linhas e planos em colunas, com ✓ e ✕ e cabeçalho fixo.", { parametros: [cor("comparativo-planos")] }),
  c("calculadora-orcamento", "Calculadora de orçamento", "pro", "vendas", "O cliente marca o que precisa e vê o valor estimado na hora, com botão para pedir proposta.", { parametros: [cor("calculadora-orcamento")], dicas: ["Os itens e preços ficam numa lista no começo do script."] }),
  c("oferta-relampago", "Oferta relâmpago", "pro", "vendas", "Produto em oferta com contador, barra de estoque acabando e botão de compra.", { parametros: [cor("oferta-relampago", "#dc2626")] }),
  c("simulador-parcelas", "Simulador de parcelas", "pro", "vendas", "Mostra o valor em 1x a 12x, com e sem juros, e o desconto no Pix.", { parametros: [cor("simulador-parcelas")] }),
  c("selo-garantia", "Selo de garantia", "pro", "vendas", "Bloco de garantia de 7 ou 30 dias que reduz o medo de comprar.", { parametros: [cor("selo-garantia")] }),
  c("upsell", "Ofertas para levar junto", "pro", "vendas", "\"Quem comprou também levou\": produtos sugeridos com um clique para adicionar.", { parametros: [cor("upsell")] }),
  c("precos-alternancia", "Preços com seletor de moeda", "pro", "vendas", "Plano em reais, euros ou dólares, e mensal ou anual, com a economia calculada.", { parametros: [cor("precos-alternancia")] }),
  c("cupom-desconto", "Campo de cupom de desconto", "pro", "vendas", "Aplica o cupom, mostra o desconto e o novo total, com mensagens de erro claras.", { parametros: [cor("cupom-desconto")] }),

  // Prova social
  c("avaliacoes-google", "Avaliações estilo Google", "pro", "prova", "Nota média, total de avaliações, barras de 1 a 5 estrelas e comentários.", { parametros: [cor("avaliacoes-google", "#f59e0b", "Cor das estrelas")] }),
  c("numeros-resultados", "Números de resultado", "pro", "prova", "Contadores animados de clientes, projetos e anos de experiência.", { parametros: [cor("numeros-resultados")] }),
  c("estudo-de-caso", "Cartão de estudo de caso", "pro", "prova", "Cliente, desafio, solução e resultado em números, com foto.", { parametros: [cor("estudo-de-caso")] }),
  c("venda-recente", "Aviso de compra recente", "pro", "prova", "Pequeno aviso no canto: \"Ana, de Lisboa, comprou há 5 minutos\".", { parametros: [cor("venda-recente")] }),
  c("depoimento-video", "Depoimento em vídeo", "pro", "prova", "Capa do vídeo com botão de play que só carrega o vídeo ao clicar.", {}),
  c("mural-depoimentos", "Mural de depoimentos", "pro", "prova", "Vários depoimentos em mosaico, como um mural de posts.", { parametros: [cor("mural-depoimentos")] }),
  c("selos-confianca", "Selos de confiança", "pro", "prova", "Site seguro, pagamento protegido, entrega garantida e formas de pagamento.", {}),

  // Loja
  c("produto-variacoes", "Produto com variações", "pro", "loja", "Fotos, cor e tamanho selecionáveis, preço, parcelas, estoque e botão de compra.", { parametros: [cor("produto-variacoes")] }),
  c("galeria-produto", "Galeria de produto com zoom", "pro", "loja", "Miniaturas e foto grande com zoom ao passar o mouse.", { parametros: [numero("galeria-produto", "zoom", "Zoom", 1.5, 3, 0.1, 2)] }),
  c("mini-carrinho", "Mini carrinho no topo", "pro", "loja", "Ícone com contador que abre a lista resumida do carrinho.", { parametros: [cor("mini-carrinho")] }),
  c("checkout-etapas", "Checkout em etapas", "pro", "loja", "Identificação, entrega e pagamento com resumo do pedido sempre visível.", { parametros: [cor("checkout-etapas")] }),
  c("frete-cep", "Cálculo de frete pelo CEP", "pro", "loja", "Digita o CEP e vê opções de entrega com prazo e valor.", { parametros: [cor("frete-cep")], dicas: ["Os valores de exemplo ficam no script: troque pelos da sua transportadora ou pela API dela."] }),
  c("lista-desejos", "Lista de desejos", "pro", "loja", "Coração que salva o produto, com contador e lista guardada no navegador.", { parametros: [cor("lista-desejos", "#e11d48")] }),
  c("filtros-loja", "Filtros de loja", "pro", "loja", "Categorias, faixa de preço, marcas e ordenação que filtram os produtos na hora.", { parametros: [cor("filtros-loja")] }),
  c("comparar-produtos", "Comparar produtos", "pro", "loja", "Selecione até 3 produtos e compare as características lado a lado.", { parametros: [cor("comparar-produtos")] }),
  c("rastreio-pedido", "Rastreio de pedido", "pro", "loja", "Linha do tempo do pedido: pago, separado, enviado, saiu para entrega e entregue.", { parametros: [cor("rastreio-pedido")] }),
  c("vitrine-categorias", "Vitrine de categorias", "pro", "loja", "Categorias com foto grande em grade elegante, como as grandes lojas.", { parametros: [raio("vitrine-categorias", 20)] }),

  // Agenda e serviços
  c("agenda-semanal", "Agenda semanal", "pro", "agenda", "Grade da semana com compromissos por horário, como a agenda do Google.", { parametros: [cor("agenda-semanal")] }),
  c("escolher-profissional", "Escolher profissional", "pro", "agenda", "Cartões dos profissionais com foto, especialidade, nota e próximo horário livre.", { parametros: [cor("escolher-profissional")] }),
  c("menu-servicos", "Cardápio de serviços com preços", "pro", "agenda", "Serviços com duração, preço e botão de agendar, separados por categoria.", { parametros: [cor("menu-servicos")] }),
  c("confirmacao-agendamento", "Confirmação de agendamento", "pro", "agenda", "Resumo com data, hora, profissional, endereço e botões de lembrete e WhatsApp.", { parametros: [cor("confirmacao-agendamento")] }),
  c("fila-espera", "Fila de espera online", "pro", "agenda", "Pessoa entra na fila e vê a posição e o tempo estimado em tempo real.", { parametros: [cor("fila-espera")] }),
  c("unidades-mapa", "Unidades com mapa", "pro", "agenda", "Lista de unidades com endereço, telefone e mapa que muda ao escolher.", { dicas: ["O mapa usa o OpenStreetMap, grátis e sem chave."] }),
  c("cardapio-digital", "Cardápio digital", "pro", "agenda", "Cardápio com categorias fixas no topo, fotos, preços e botão de pedir.", { parametros: [cor("cardapio-digital", "#ea580c")] }),
  c("planos-academia", "Planos de academia ou curso", "pro", "agenda", "Planos com horários, modalidades e matrícula pelo WhatsApp.", { parametros: [cor("planos-academia")] }),

  // Formulários
  c("intervalo-datas", "Escolha de intervalo de datas", "pro", "formularios", "Calendário duplo para check-in e check-out, com noites contadas.", { parametros: [cor("intervalo-datas")] }),
  c("autocompletar-cidades", "Busca de cidades com sugestões", "pro", "formularios", "Sugestões enquanto digita, ignorando acentos, com teclado e destaque.", { parametros: [cor("autocompletar-cidades")] }),
  c("assinatura-digital", "Assinatura na tela", "pro", "formularios", "Área para assinar com o dedo ou mouse, limpar e salvar como imagem.", { parametros: [{ var: "--assinatura-digital-tinta", rotulo: "Cor da tinta", tipo: "cor", padrao: "#1e3a8a" }] }),
  c("avaliar-estrelas", "Avaliação com estrelas e comentário", "pro", "formularios", "Escolha de 1 a 5 estrelas com texto de apoio e comentário opcional.", { parametros: [cor("avaliar-estrelas", "#f59e0b")] }),
  c("contato-whatsapp", "Contato que envia para o WhatsApp", "pro", "formularios", "Formulário que monta a mensagem e abre o WhatsApp do negócio.", { parametros: [cor("contato-whatsapp", "#25d366")] }),
  c("cpf-cnpj", "Campo CPF/CNPJ inteligente", "pro", "formularios", "Detecta CPF ou CNPJ enquanto digita, aplica a máscara e valida.", {}),
  c("seletor-cores", "Seletor de cores", "pro", "formularios", "Paleta de cores prontas e cor personalizada, com prévia.", {}),
  c("enquete", "Enquete com resultado", "pro", "formularios", "Pergunta com opções que mostra as porcentagens depois do voto.", { parametros: [cor("enquete")] }),
  c("newsletter-avancada", "Newsletter com interesses", "pro", "formularios", "Inscrição com escolha de temas e consentimento da LGPD/RGPD.", { parametros: [cor("newsletter-avancada")] }),
  c("orcamento-detalhado", "Pedido de orçamento detalhado", "pro", "formularios", "Formulário com tipo de serviço, prazo, verba e anexos.", { parametros: [cor("orcamento-detalhado")] }),

  // Painéis
  c("grafico-linha", "Gráfico de linha", "pro", "dados", "Linha com área, pontos, eixo e dica do valor ao passar o mouse.", { parametros: [cor("grafico-linha")] }),
  c("grafico-rosca", "Gráfico de rosca", "pro", "dados", "Divisão em porcentagens com legenda e total no centro.", {}),
  c("tabela-edicao", "Tabela com edição na linha", "pro", "dados", "Edite células com duplo clique, adicione e exclua linhas, exporte para planilha.", { parametros: [cor("tabela-edicao")] }),
  c("kanban", "Quadro Kanban", "pro", "dados", "Colunas de tarefas com arrastar e soltar, contadores e nova tarefa.", { parametros: [cor("kanban")] }),
  c("linha-tempo-atividades", "Linha do tempo de atividades", "pro", "dados", "Últimas atividades do sistema com ícones, horários e agrupamento por dia.", { parametros: [cor("linha-tempo-atividades")] }),
  c("lista-tarefas", "Lista de tarefas", "pro", "dados", "Adicione, marque, filtre e reordene tarefas, salvas no navegador.", { parametros: [cor("lista-tarefas")] }),
  c("resumo-financeiro", "Resumo financeiro", "pro", "dados", "Saldo, entradas, saídas e últimas movimentações com cores.", { parametros: [cor("resumo-financeiro")] }),
  c("mapa-calor", "Mapa de calor de atividade", "pro", "dados", "Quadradinhos do ano inteiro, como as contribuições do GitHub.", { parametros: [cor("mapa-calor", "#16a34a")] }),
  c("medidor-meta", "Medidor de meta", "pro", "dados", "Velocímetro com a porcentagem da meta do mês.", { parametros: [cor("medidor-meta")] }),
  c("tabela-ranking", "Ranking de vendedores", "pro", "dados", "Pódio dos 3 primeiros e lista com barras de progresso.", { parametros: [cor("tabela-ranking")] }),

  // Mídia
  c("carrossel-cartoes", "Carrossel de cartões", "pro", "midia", "Cartões que deslizam com o dedo, setas e encaixe suave.", {}),
  c("player-video", "Player de vídeo personalizado", "pro", "midia", "Play, barra de progresso, volume, velocidade e tela cheia com o seu visual.", { parametros: [cor("player-video")] }),
  c("player-podcast", "Player de podcast", "pro", "midia", "Capa, episódio, avançar 15 segundos, velocidade e lista de episódios.", { parametros: [cor("player-podcast")] }),
  c("stories", "Stories estilo Instagram", "pro", "midia", "Círculos de stories que abrem em tela cheia com barras de tempo.", { parametros: [cor("stories", "#d946ef")] }),
  c("mapa-leve", "Mapa que carrega ao clicar", "pro", "midia", "Prévia leve do mapa que só carrega o Google Maps ou OpenStreetMap ao clicar.", {}),
  c("slideshow-ken-burns", "Slideshow com zoom lento", "pro", "midia", "Fotos trocando com zoom suave, estilo documentário.", { parametros: [numero("slideshow-ken-burns", "intervalo", "Tempo de cada foto", 3000, 12000, 500, 6000, "ms")] }),
  c("portfolio-filtro", "Portfólio com filtro", "pro", "midia", "Trabalhos em grade com filtro por categoria e animação ao trocar.", { parametros: [cor("portfolio-filtro")] }),
  c("video-modal", "Vídeo em janela", "pro", "midia", "Botão de play que abre o vídeo do YouTube numa janela elegante.", {}),

  // Comunicação
  c("chat-atendimento", "Chat de atendimento", "pro", "comunicacao", "Janela de chat flutuante com respostas rápidas e envio para o WhatsApp.", { parametros: [cor("chat-atendimento")] }),
  c("central-notificacoes", "Central de notificações", "pro", "comunicacao", "Sino com contador, lista de avisos lidos e não lidos e \"marcar todas\".", { parametros: [cor("central-notificacoes")] }),
  c("popup-saida", "Pop-up de saída", "pro", "comunicacao", "Oferta que aparece quando a pessoa vai sair do site (uma vez só).", { parametros: [cor("popup-saida")] }),
  c("toasts", "Avisos rápidos (toasts)", "pro", "comunicacao", "Avisos de sucesso, erro e aviso que se empilham e somem sozinhos.", {}),
  c("banner-promocional", "Banner promocional fixo", "pro", "comunicacao", "Faixa no rodapé com oferta e botão, que fecha e lembra.", { parametros: [cor("banner-promocional")] }),
  c("perfil-cartao", "Cartão de perfil", "pro", "comunicacao", "Foto, nome, cargo, redes sociais e botão de seguir/contato.", { parametros: [cor("perfil-cartao")] }),
  c("comentarios", "Comentários com respostas", "pro", "comunicacao", "Lista de comentários com respostas, curtidas e campo para comentar.", { parametros: [cor("comentarios")] }),
  c("equipe", "Seção de equipe", "pro", "comunicacao", "Fotos da equipe com cargo e redes ao passar o mouse.", { parametros: [raio("equipe", 20)] }),

  // Rodapé e chamadas
  c("cta-dividido", "Chamada final dividida", "pro", "rodape", "Bloco de fechamento com benefício, prova e dois botões.", { parametros: [cor("cta-dividido")] }),
  c("cta-app", "Chamada para baixar o app", "pro", "rodape", "Celular com o app, QR Code e selos das lojas.", { parametros: [cor("cta-app")] }),
  c("rodape-minimo", "Rodapé minimalista", "pro", "rodape", "Uma linha com logo, links essenciais e redes, elegante e leve.", {}),
  c("contato-mapa", "Seção de contato com mapa", "pro", "rodape", "Endereço, telefone, WhatsApp, horário e mapa lado a lado.", { parametros: [cor("contato-mapa")] }),
  c("cta-newsletter", "Chamada de newsletter", "pro", "rodape", "Faixa com benefício da newsletter e campo de e-mail em destaque.", { parametros: [cor("cta-newsletter")] }),

  // Utilidades
  c("tema-escuro", "Botão de tema escuro", "pro", "utilidades", "Alterna claro e escuro com animação do ícone e lembra a escolha.", {}),
  c("seletor-idioma", "Seletor de idioma", "pro", "utilidades", "Bandeiras e nomes dos idiomas num menu compacto.", {}),
  c("voltar-topo-progresso", "Voltar ao topo com progresso", "pro", "utilidades", "Botão redondo que mostra quanto da página já foi lido.", { parametros: [cor("voltar-topo-progresso")], rolagem: true }),
  c("compartilhar", "Compartilhar nas redes", "pro", "utilidades", "Compartilhamento nativo do celular e botões de WhatsApp, Facebook, LinkedIn e copiar link.", {}),
  c("recibo-impressao", "Recibo pronto para imprimir", "pro", "utilidades", "Recibo ou orçamento com logo e itens, que imprime bonito (ou salva em PDF).", {}),
  c("contador-evento", "Contagem para evento", "pro", "utilidades", "Dias, horas, minutos e segundos até a data, com \"adicionar à agenda\".", { parametros: [cor("contador-evento")] }),
  c("qr-code", "Gerador de QR Code", "pro", "utilidades", "Gera QR Code de link, Pix ou Wi-Fi na hora, para baixar e imprimir.", {}),
  c("busca-site", "Busca do site com atalho", "pro", "utilidades", "Caixa de busca que abre com Ctrl+K e lista resultados com o teclado.", { parametros: [cor("busca-site")] }),
];
