/**
 * Catálogo dos Componentes avançados: só os dados públicos. O código de cada um
 * fica no repositório privado atalho-pro (conteudos/componentes/<nivel>/<id>.html)
 * e no Supabase, que só entrega a quem tem acesso:
 *   publico (10, sem registo) · membro (+10, com conta grátis) · pro (todos)
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
  { id: "loja", nome: "Loja online" },
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
  c("hero-gradiente", "Topo com gradiente e chamada", "publico", "topo", "Título forte, texto de apoio, dois botões e selo de confiança sobre um gradiente elegante.", { parametros: [cor("hero-gradiente"), { var: "--hero-gradiente-cor2", rotulo: "Cor secundária", tipo: "cor", padrao: "#4f46e5" }], dicas: ["Use um título que diga o resultado para o cliente (\"Agenda cheia em 30 dias\"), não o que faz."] }),
  c("precos-tres-planos", "Tabela de preços com 3 planos", "publico", "vendas", "Planos lado a lado com o recomendado em destaque, alternância mensal/anual e lista de benefícios.", { parametros: [cor("precos-tres-planos")], dicas: ["Coloque o plano que mais quer vender no meio: é o que mais recebe cliques."] }),
  c("depoimentos-carrossel", "Testemunhos em carrossel", "publico", "prova", "Testemunhos com foto, nome, cargo e estrelas, a passar sozinhos e com setas.", { parametros: [cor("depoimentos-carrossel")], dicas: ["Peça autorização ao cliente antes de publicar nome e foto (RGPD)."] }),
  c("logos-clientes", "Faixa de logos de clientes", "publico", "prova", "Logos de clientes ou parceiros em tons de cinzento que ganham cor ao passar o rato.", { dicas: ["Use logos em SVG ou PNG com fundo transparente."] }),
  c("faq-busca", "Perguntas frequentes com pesquisa", "publico", "comunicacao", "Acordeão de perguntas com campo de pesquisa que filtra na hora e destaca o termo.", { parametros: [cor("faq-busca")] }),
  c("rodape-empresa", "Rodapé completo de empresa", "publico", "rodape", "Logótipo, colunas de links, redes sociais, contacto, NIF, Livro de Reclamações e direitos de autor.", { parametros: [cor("rodape-empresa", "#0f172a", "Cor de fundo")] }),
  c("botao-whatsapp-pedido", "Botão de pedido pelo WhatsApp", "publico", "comunicacao", "Botão flutuante que abre o WhatsApp com a mensagem já escrita, com balão de \"posso ajudar?\".", { parametros: [cor("botao-whatsapp-pedido", "#25d366")], dicas: ["Troque o número no código: só algarismos, com o indicativo do país (351 para Portugal, 34 para Espanha)."] }),
  c("kpis-sparkline", "Indicadores com minigráfico", "publico", "dados", "Cartões de faturação, encomendas e clientes com variação e um minigráfico de tendência.", { parametros: [cor("kpis-sparkline")] }),
  c("galeria-lightbox", "Galeria com ampliação", "publico", "midia", "Grelha de fotos em mosaico que abre em ecrã inteiro com setas, teclado e legenda.", { dicas: ["Use fotos com no máximo 300 KB cada para o site ficar rápido (o site squoosh.app reduz de graça)."] }),
  c("aberto-agora", "Horário de funcionamento \"aberto agora\"", "publico", "agenda", "Mostra se o negócio está aberto neste momento, quando abre e o horário da semana.", { parametros: [cor("aberto-agora", "#16a34a", "Cor de aberto")], dicas: ["Os horários ficam numa lista no começo do script: mude e pronto."] }),

  /* --------------------------- Com conta grátis (10) --------------------------- */
  c("hero-dividido", "Topo dividido com foto", "membro", "topo", "Texto à esquerda e foto à direita, com números de prova social e botão principal.", { parametros: [cor("hero-dividido"), raio("hero-dividido", 24)] }),
  c("navbar-transparente", "Menu que muda ao fazer scroll", "membro", "navegacao", "Menu transparente sobre a foto do topo que fica sólido com sombra ao fazer scroll, com menu de telemóvel.", { parametros: [cor("navbar-transparente")], rolagem: true, paginaInteira: true }),
  c("formulario-etapas", "Formulário em etapas", "membro", "formularios", "Registo dividido em passos com barra de progresso, validação por etapa e revisão final.", { parametros: [cor("formulario-etapas")] }),
  c("upload-previa", "Envio de ficheiros com pré-visualização", "membro", "formularios", "Arraste fotos e documentos, veja a pré-visualização, o tamanho e remova antes de enviar.", { parametros: [cor("upload-previa")] }),
  c("calendario-eventos", "Calendário do mês com eventos", "membro", "agenda", "Calendário mensal com eventos coloridos, navegação entre meses e detalhes do dia.", { parametros: [cor("calendario-eventos")] }),
  c("grafico-barras", "Gráfico de barras animado", "membro", "dados", "Barras em SVG com valores, legenda e dica ao passar o rato, sem biblioteca.", { parametros: [cor("grafico-barras")] }),
  c("carrinho-lateral", "Carrinho lateral", "membro", "loja", "Gaveta com os itens, quantidade, subtotal, portes grátis a partir de um valor e botão de finalizar.", { parametros: [cor("carrinho-lateral")] }),
  c("data-horario", "Escolha de data e horário", "membro", "agenda", "Seleção de dia e dos horários livres, como nas apps de agendamento de salão e clínica.", { parametros: [cor("data-horario")] }),
  c("antes-depois", "Comparador antes e depois", "membro", "midia", "Duas fotos sobrepostas com uma barra que a pessoa arrasta para comparar.", { dicas: ["Use as duas fotos com o mesmo tamanho e enquadramento."] }),
  c("cookies-preferencias", "Aviso de cookies com preferências", "membro", "utilidades", "Aviso de cookies (RGPD) com aceitar, recusar e escolher categorias, e que guarda a escolha.", { parametros: [cor("cookies-preferencias")] }),

  /* ------------------------------------ Pro ------------------------------------ */
  // Topo
  c("hero-video", "Topo com vídeo de fundo", "pro", "topo", "Vídeo em loop no fundo com camada escura, título e botão; passa a imagem no telemóvel para poupar dados.", { parametros: [numero("hero-video", "escurecer", "Escurecer o vídeo", 0, 0.9, 0.05, 0.55)] }),
  c("hero-formulario", "Topo com formulário de captura", "pro", "topo", "Proposta à esquerda e formulário de contacto à direita: ideal para gerar orçamentos.", { parametros: [cor("hero-formulario")] }),
  c("hero-app", "Topo de app com telemóvel", "pro", "topo", "Moldura de telemóvel com o ecrã da app, selos das lojas e avaliações.", { parametros: [cor("hero-app")] }),
  c("hero-oferta", "Topo de oferta com contagem decrescente", "pro", "topo", "Promoção com preço riscado, desconto e contador até ao fim da oferta.", { parametros: [cor("hero-oferta", "#dc2626")] }),
  c("hero-busca-imoveis", "Topo com pesquisa de imóveis", "pro", "topo", "Foto de fundo e pesquisa com cidade, tipologia, quartos e gama de preços.", { parametros: [cor("hero-busca-imoveis")] }),
  c("hero-delivery", "Topo de entregas com morada", "pro", "topo", "Campo de código postal ou morada, tempo de entrega e categorias do menu.", { parametros: [cor("hero-delivery", "#ea580c")] }),
  c("hero-agendamento", "Topo com agendamento rápido", "pro", "topo", "Escolha de serviço e dia direto no topo, com botão de confirmar.", { parametros: [cor("hero-agendamento")] }),
  c("hero-carrossel", "Topo em carrossel", "pro", "topo", "Vários destaques a passar com transição suave, pontos e setas.", { parametros: [numero("hero-carrossel", "intervalo", "Tempo de cada slide", 2000, 10000, 500, 5000, "ms")] }),
  c("hero-metricas", "Topo com métricas de resultado", "pro", "topo", "Título, chamada e uma faixa de números grandes que provam resultado.", { parametros: [cor("hero-metricas")] }),

  // Navegação
  c("mega-menu", "Mega menu", "pro", "navegacao", "Menu com painéis grandes, colunas, ícones e destaque, acessível pelo teclado.", { parametros: [cor("mega-menu")], paginaInteira: true }),
  c("menu-lateral-recolhivel", "Menu lateral que recolhe", "pro", "navegacao", "Menu de sistema que recolhe para só ícones e lembra a escolha.", { parametros: [cor("menu-lateral-recolhivel")], paginaInteira: true }),
  c("barra-inferior-app", "Barra inferior de app", "pro", "navegacao", "Navegação fixa no rodapé do telemóvel, com ícone ativo e botão central de destaque.", { parametros: [cor("barra-inferior-app")] }),
  c("abas-indicador", "Abas com indicador deslizante", "pro", "navegacao", "Abas em que a marcação desliza até à aba escolhida.", { parametros: [cor("abas-indicador")] }),
  c("indice-flutuante", "Índice flutuante do artigo", "pro", "navegacao", "Sumário fixo ao lado do texto que marca a secção que está a ser lida.", { rolagem: true, paginaInteira: true }),
  c("barra-anuncio", "Barra de anúncio no topo", "pro", "navegacao", "Faixa fina com aviso ou cupão, que a pessoa pode fechar (e não volta).", { parametros: [cor("barra-anuncio")] }),
  c("trilha-icones", "Trilha de navegação com ícones", "pro", "navegacao", "\"Está aqui\" com ícones, que encurta no telemóvel.", {}),
  c("paginacao-numeros", "Paginação completa", "pro", "navegacao", "Números, reticências, anterior/próximo e \"itens por página\".", { parametros: [cor("paginacao-numeros")] }),

  // Vendas
  c("comparativo-planos", "Tabela comparativa de recursos", "pro", "vendas", "Recursos em linhas e planos em colunas, com ✓ e ✕ e cabeçalho fixo.", { parametros: [cor("comparativo-planos")] }),
  c("calculadora-orcamento", "Calculadora de orçamento", "pro", "vendas", "O cliente marca o que precisa e vê o valor estimado na hora, com botão para pedir proposta.", { parametros: [cor("calculadora-orcamento")], dicas: ["Os itens e preços ficam numa lista no começo do script."] }),
  c("oferta-relampago", "Oferta relâmpago", "pro", "vendas", "Produto em oferta com contador, barra de stock a acabar e botão de compra.", { parametros: [cor("oferta-relampago", "#dc2626")] }),
  c("simulador-parcelas", "Simulador de prestações", "pro", "vendas", "Mostra o valor a pronto ou em 3 a 12 prestações, com e sem juros, e o desconto no MB WAY.", { parametros: [cor("simulador-parcelas")] }),
  c("selo-garantia", "Selo de garantia", "pro", "vendas", "Bloco de garantia de 7 ou 30 dias que reduz o medo de comprar.", { parametros: [cor("selo-garantia")] }),
  c("upsell", "Ofertas para levar junto", "pro", "vendas", "\"Quem comprou também levou\": produtos sugeridos com um clique para adicionar.", { parametros: [cor("upsell")] }),
  c("precos-alternancia", "Preços com seletor de moeda", "pro", "vendas", "Plano em euros, libras ou dólares, e mensal ou anual, com a poupança calculada.", { parametros: [cor("precos-alternancia")] }),
  c("cupom-desconto", "Campo de cupão de desconto", "pro", "vendas", "Aplica o cupão, mostra o desconto e o novo total, com mensagens de erro claras.", { parametros: [cor("cupom-desconto")] }),

  // Prova social
  c("avaliacoes-google", "Avaliações estilo Google", "pro", "prova", "Nota média, total de avaliações, barras de 1 a 5 estrelas e comentários.", { parametros: [cor("avaliacoes-google", "#f59e0b", "Cor das estrelas")] }),
  c("numeros-resultados", "Números de resultado", "pro", "prova", "Contadores animados de clientes, projetos e anos de experiência.", { parametros: [cor("numeros-resultados")] }),
  c("estudo-de-caso", "Cartão de estudo de caso", "pro", "prova", "Cliente, desafio, solução e resultado em números, com foto.", { parametros: [cor("estudo-de-caso")] }),
  c("venda-recente", "Aviso de compra recente", "pro", "prova", "Pequeno aviso no canto: \"Ana, de Lisboa, comprou há 5 minutos\".", { parametros: [cor("venda-recente")] }),
  c("depoimento-video", "Depoimento em vídeo", "pro", "prova", "Capa do vídeo com botão de play que só carrega o vídeo ao clicar.", {}),
  c("mural-depoimentos", "Mural de depoimentos", "pro", "prova", "Vários depoimentos em mosaico, como um mural de posts.", { parametros: [cor("mural-depoimentos")] }),
  c("selos-confianca", "Selos de confiança", "pro", "prova", "Site seguro, pagamento protegido, entrega garantida e formas de pagamento.", {}),

  // Loja
  c("produto-variacoes", "Produto com variações", "pro", "loja", "Fotos, cor e tamanho selecionáveis, preço, prestações, stock e botão de compra.", { parametros: [cor("produto-variacoes")] }),
  c("galeria-produto", "Galeria de produto com zoom", "pro", "loja", "Miniaturas e foto grande com zoom ao passar o rato.", { parametros: [numero("galeria-produto", "zoom", "Zoom", 1.5, 3, 0.1, 2)] }),
  c("mini-carrinho", "Mini carrinho no topo", "pro", "loja", "Ícone com contador que abre a lista resumida do carrinho.", { parametros: [cor("mini-carrinho")] }),
  c("checkout-etapas", "Checkout em etapas", "pro", "loja", "Identificação, entrega e pagamento com resumo da encomenda sempre visível.", { parametros: [cor("checkout-etapas")] }),
  c("frete-cep", "Cálculo de portes pelo código postal", "pro", "loja", "Escreve o código postal e vê as opções de entrega com prazo e valor (continente, ilhas e recolha em loja).", { parametros: [cor("frete-cep")], dicas: ["Os valores de exemplo ficam no script: troque pelos da sua transportadora ou pela API dela."] }),
  c("lista-desejos", "Lista de desejos", "pro", "loja", "Coração que guarda o produto, com contador e lista guardada no navegador.", { parametros: [cor("lista-desejos", "#e11d48")] }),
  c("filtros-loja", "Filtros de loja", "pro", "loja", "Categorias, faixa de preço, marcas e ordenação que filtram os produtos na hora.", { parametros: [cor("filtros-loja")] }),
  c("comparar-produtos", "Comparar produtos", "pro", "loja", "Selecione até 3 produtos e compare as características lado a lado.", { parametros: [cor("comparar-produtos")] }),
  c("rastreio-pedido", "Seguimento de encomenda", "pro", "loja", "Cronologia da encomenda: paga, preparada, enviada, saiu para entrega e entregue.", { parametros: [cor("rastreio-pedido")] }),
  c("vitrine-categorias", "Montra de categorias", "pro", "loja", "Categorias com foto grande em grelha elegante, como as grandes lojas.", { parametros: [raio("vitrine-categorias", 20)] }),

  // Agenda e serviços
  c("agenda-semanal", "Agenda semanal", "pro", "agenda", "Grelha da semana com compromissos por horário, como a agenda do Google.", { parametros: [cor("agenda-semanal")] }),
  c("escolher-profissional", "Escolher profissional", "pro", "agenda", "Cartões dos profissionais com foto, especialidade, nota e próximo horário livre.", { parametros: [cor("escolher-profissional")] }),
  c("menu-servicos", "Menu de serviços com preços", "pro", "agenda", "Serviços com duração, preço e botão de agendar, separados por categoria.", { parametros: [cor("menu-servicos")] }),
  c("confirmacao-agendamento", "Confirmação de agendamento", "pro", "agenda", "Resumo com data, hora, profissional, endereço e botões de lembrete e WhatsApp.", { parametros: [cor("confirmacao-agendamento")] }),
  c("fila-espera", "Fila de espera online", "pro", "agenda", "Pessoa entra na fila e vê a posição e o tempo estimado em tempo real.", { parametros: [cor("fila-espera")] }),
  c("unidades-mapa", "Unidades com mapa", "pro", "agenda", "Lista de unidades com endereço, telefone e mapa que muda ao escolher.", { dicas: ["O mapa usa o OpenStreetMap, grátis e sem chave."] }),
  c("cardapio-digital", "Menu digital", "pro", "agenda", "Menu com categorias fixas no topo, fotos, preços e botão de pedir.", { parametros: [cor("cardapio-digital", "#ea580c")] }),
  c("planos-academia", "Planos de ginásio ou curso", "pro", "agenda", "Planos com horários, modalidades e inscrição pelo WhatsApp.", { parametros: [cor("planos-academia")] }),

  // Formulários
  c("intervalo-datas", "Escolha de intervalo de datas", "pro", "formularios", "Calendário duplo para check-in e check-out, com noites contadas.", { parametros: [cor("intervalo-datas")] }),
  c("autocompletar-cidades", "Pesquisa de cidades com sugestões", "pro", "formularios", "Sugestões enquanto escreve, ignorando acentos, com teclado e destaque.", { parametros: [cor("autocompletar-cidades")] }),
  c("assinatura-digital", "Assinatura no ecrã", "pro", "formularios", "Área para assinar com o dedo ou rato, limpar e guardar como imagem.", { parametros: [{ var: "--assinatura-digital-tinta", rotulo: "Cor da tinta", tipo: "cor", padrao: "#1e3a8a" }] }),
  c("avaliar-estrelas", "Avaliação com estrelas e comentário", "pro", "formularios", "Escolha de 1 a 5 estrelas com texto de apoio e comentário opcional.", { parametros: [cor("avaliar-estrelas", "#f59e0b")] }),
  c("contato-whatsapp", "Contacto que envia para o WhatsApp", "pro", "formularios", "Formulário que monta a mensagem e abre o WhatsApp do negócio.", { parametros: [cor("contato-whatsapp", "#25d366")] }),
  c("cpf-cnpj", "Campo NIF inteligente", "pro", "formularios", "Formata o NIF enquanto escreve, valida o dígito de controlo e diz se é de pessoa ou de empresa.", {}),
  c("seletor-cores", "Seletor de cores", "pro", "formularios", "Paleta de cores prontas e cor personalizada, com pré-visualização.", {}),
  c("enquete", "Sondagem com resultado", "pro", "formularios", "Pergunta com opções que mostra as percentagens depois do voto.", { parametros: [cor("enquete")] }),
  c("newsletter-avancada", "Newsletter com interesses", "pro", "formularios", "Inscrição com escolha de temas e consentimento conforme o RGPD.", { parametros: [cor("newsletter-avancada")] }),
  c("orcamento-detalhado", "Pedido de orçamento detalhado", "pro", "formularios", "Formulário com tipo de serviço, prazo, verba e anexos.", { parametros: [cor("orcamento-detalhado")] }),

  // Painéis
  c("grafico-linha", "Gráfico de linha", "pro", "dados", "Linha com área, pontos, eixo e dica do valor ao passar o rato.", { parametros: [cor("grafico-linha")] }),
  c("grafico-rosca", "Gráfico de anel", "pro", "dados", "Divisão em percentagens com legenda e total no centro.", {}),
  c("tabela-edicao", "Tabela com edição na linha", "pro", "dados", "Edite células com duplo clique, adicione e elimine linhas, exporte para folha de cálculo.", { parametros: [cor("tabela-edicao")] }),
  c("kanban", "Quadro Kanban", "pro", "dados", "Colunas de tarefas com arrastar e largar, contadores e nova tarefa.", { parametros: [cor("kanban")] }),
  c("linha-tempo-atividades", "Cronologia de atividades", "pro", "dados", "Últimas atividades do sistema com ícones, horários e agrupamento por dia.", { parametros: [cor("linha-tempo-atividades")] }),
  c("lista-tarefas", "Lista de tarefas", "pro", "dados", "Adicione, marque, filtre e reordene tarefas, guardadas no navegador.", { parametros: [cor("lista-tarefas")] }),
  c("resumo-financeiro", "Resumo financeiro", "pro", "dados", "Saldo, entradas, saídas e últimas movimentações com cores.", { parametros: [cor("resumo-financeiro")] }),
  c("mapa-calor", "Mapa de calor de atividade", "pro", "dados", "Quadradinhos do ano inteiro, como as contribuições do GitHub.", { parametros: [cor("mapa-calor", "#16a34a")] }),
  c("medidor-meta", "Medidor de meta", "pro", "dados", "Velocímetro com a percentagem da meta do mês.", { parametros: [cor("medidor-meta")] }),
  c("tabela-ranking", "Ranking de vendedores", "pro", "dados", "Pódio dos 3 primeiros e lista com barras de progresso.", { parametros: [cor("tabela-ranking")] }),

  // Mídia
  c("carrossel-cartoes", "Carrossel de cartões", "pro", "midia", "Cartões que deslizam com o dedo, setas e encaixe suave.", {}),
  c("player-video", "Leitor de vídeo personalizado", "pro", "midia", "Play, barra de progresso, volume, velocidade e ecrã inteiro com o seu visual.", { parametros: [cor("player-video")] }),
  c("player-podcast", "Leitor de podcast", "pro", "midia", "Capa, episódio, avançar 15 segundos, velocidade e lista de episódios.", { parametros: [cor("player-podcast")] }),
  c("stories", "Stories estilo Instagram", "pro", "midia", "Círculos de stories que abrem em ecrã inteiro com barras de tempo.", { parametros: [cor("stories", "#d946ef")] }),
  c("mapa-leve", "Mapa que carrega ao clicar", "pro", "midia", "Pré-visualização leve do mapa que só carrega o Google Maps ou OpenStreetMap ao clicar.", {}),
  c("slideshow-ken-burns", "Slideshow com zoom lento", "pro", "midia", "Fotos a mudar com zoom suave, estilo documentário.", { parametros: [numero("slideshow-ken-burns", "intervalo", "Tempo de cada foto", 3000, 12000, 500, 6000, "ms")] }),
  c("portfolio-filtro", "Portfólio com filtro", "pro", "midia", "Trabalhos em grelha com filtro por categoria e animação ao trocar.", { parametros: [cor("portfolio-filtro")] }),
  c("video-modal", "Vídeo em janela", "pro", "midia", "Botão de play que abre o vídeo do YouTube numa janela elegante.", {}),

  // Comunicação
  c("chat-atendimento", "Chat de atendimento", "pro", "comunicacao", "Janela de chat flutuante com respostas rápidas e envio para o WhatsApp.", { parametros: [cor("chat-atendimento")] }),
  c("central-notificacoes", "Central de notificações", "pro", "comunicacao", "Sino com contador, lista de avisos lidos e não lidos e \"marcar todas\".", { parametros: [cor("central-notificacoes")] }),
  c("popup-saida", "Pop-up de saída", "pro", "comunicacao", "Oferta que aparece quando a pessoa vai sair do site (uma vez só).", { parametros: [cor("popup-saida")] }),
  c("toasts", "Avisos rápidos (toasts)", "pro", "comunicacao", "Avisos de sucesso, erro e aviso que se empilham e desaparecem sozinhos.", {}),
  c("banner-promocional", "Banner promocional fixo", "pro", "comunicacao", "Faixa no rodapé com oferta e botão, que fecha e lembra.", { parametros: [cor("banner-promocional")] }),
  c("perfil-cartao", "Cartão de perfil", "pro", "comunicacao", "Foto, nome, cargo, redes sociais e botão de seguir/contacto.", { parametros: [cor("perfil-cartao")] }),
  c("comentarios", "Comentários com respostas", "pro", "comunicacao", "Lista de comentários com respostas, gostos e campo para comentar.", { parametros: [cor("comentarios")] }),
  c("equipe", "Secção de equipa", "pro", "comunicacao", "Fotos da equipa com cargo e redes ao passar o rato.", { parametros: [raio("equipe", 20)] }),

  // Rodapé e chamadas
  c("cta-dividido", "Chamada final dividida", "pro", "rodape", "Bloco de encerramento com benefício, prova e dois botões.", { parametros: [cor("cta-dividido")] }),
  c("cta-app", "Chamada para descarregar a app", "pro", "rodape", "Telemóvel com a app, QR Code e selos das lojas.", { parametros: [cor("cta-app")] }),
  c("rodape-minimo", "Rodapé minimalista", "pro", "rodape", "Uma linha com logo, links essenciais e redes, elegante e leve.", {}),
  c("contato-mapa", "Secção de contacto com mapa", "pro", "rodape", "Endereço, telefone, WhatsApp, horário e mapa lado a lado.", { parametros: [cor("contato-mapa")] }),
  c("cta-newsletter", "Chamada de newsletter", "pro", "rodape", "Faixa com benefício da newsletter e campo de e-mail em destaque.", { parametros: [cor("cta-newsletter")] }),

  // Utilidades
  c("tema-escuro", "Botão de tema escuro", "pro", "utilidades", "Alterna claro e escuro com animação do ícone e lembra a escolha.", {}),
  c("seletor-idioma", "Seletor de idioma", "pro", "utilidades", "Bandeiras e nomes dos idiomas num menu compacto.", {}),
  c("voltar-topo-progresso", "Voltar ao topo com progresso", "pro", "utilidades", "Botão redondo que mostra quanto da página já foi lido.", { parametros: [cor("voltar-topo-progresso")], rolagem: true }),
  c("compartilhar", "Partilhar nas redes", "pro", "utilidades", "Partilha nativa do telemóvel e botões de WhatsApp, Facebook, LinkedIn e copiar link.", {}),
  c("recibo-impressao", "Recibo pronto para imprimir", "pro", "utilidades", "Recibo ou orçamento com logo e itens, que fica bem impresso (ou guarda em PDF).", {}),
  c("contador-evento", "Contagem para evento", "pro", "utilidades", "Dias, horas, minutos e segundos até à data marcada, com \"adicionar à agenda\".", { parametros: [cor("contador-evento")] }),
  c("qr-code", "Gerador de QR Code", "pro", "utilidades", "Gera QR Code de link, WhatsApp ou Wi-Fi na hora, para descarregar e imprimir.", {}),
  c("busca-site", "Pesquisa no site com atalho", "pro", "utilidades", "Caixa de pesquisa que abre com Ctrl+K e lista resultados com o teclado.", { parametros: [cor("busca-site")] }),
];
