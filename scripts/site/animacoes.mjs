/**
 * Catálogo do Estúdio de animações: só os dados públicos (nome, descrição,
 * nível e os controles editáveis). O código de cada animação fica no
 * repositório privado atalho-pro (conteudos/animacoes/<nivel>/<id>.html) e no
 * Supabase, que só entrega a quem tem acesso:
 *   - visitante: nenhuma
 *   - membro (conta grátis): as de nível "membro"
 *   - Pro: todas
 *
 * Cada controle vira uma variável CSS (ex.: --surgir-duracao) que o código da
 * animação lê com var(--surgir-duracao, 700ms). O atalho-pro testa essa ligação.
 */

const duracao = (id, padrao, max = 4000, min = 100) => ({ var: `--${id}-duracao`, rotulo: "Duração", tipo: "numero", min, max, passo: 50, padrao, unidade: "ms" });
const atraso = (id, padrao = 0) => ({ var: `--${id}-atraso`, rotulo: "Atraso", tipo: "numero", min: 0, max: 2000, passo: 50, padrao, unidade: "ms" });
const distancia = (id, padrao, max = 160, rotulo = "Distância") => ({ var: `--${id}-distancia`, rotulo, tipo: "numero", min: 0, max, passo: 2, padrao, unidade: "px" });
const cor = (id, nome, padrao, rotulo = "Cor") => ({ var: `--${id}-${nome}`, rotulo, tipo: "cor", padrao });
const numero = (id, nome, rotulo, min, max, passo, padrao, unidade = "") => ({ var: `--${id}-${nome}`, rotulo, tipo: "numero", min, max, passo, padrao, unidade });
const opcao = (id, nome, rotulo, opcoes, padrao) => ({ var: `--${id}-${nome}`, rotulo, tipo: "opcao", opcoes, padrao });

export const CURVAS = [
  ["cubic-bezier(0.22, 1, 0.36, 1)", "Suave (recomendada)"],
  ["ease-out", "Desacelerando"],
  ["ease-in-out", "Acelera e desacelera"],
  ["linear", "Constante"],
  ["cubic-bezier(0.34, 1.56, 0.64, 1)", "Com mola (passa e volta)"],
  ["steps(6, end)", "Em passos (estilo retrô)"],
];
const curva = (id, padrao = CURVAS[0][0]) => ({ var: `--${id}-curva`, rotulo: "Curva", tipo: "opcao", opcoes: CURVAS, padrao });
const repeticoes = (id, padrao = "infinite") => opcao(id, "repeticoes", "Repetições", [["1", "Uma vez"], ["2", "Duas vezes"], ["3", "Três vezes"], ["infinite", "Sem parar"]], padrao);

export const CATEGORIAS = [
  { id: "entrada", nome: "Entrada" },
  { id: "atencao", nome: "Chamar atenção" },
  { id: "rolagem", nome: "Ao rolar a página" },
  { id: "texto", nome: "Texto" },
  { id: "interacao", nome: "Mouse e toque" },
  { id: "fundo", nome: "Fundos" },
  { id: "feedback", nome: "Carregando e sucesso" },
  { id: "transicao", nome: "Transições" },
];

/** rolagem: true → a prévia precisa ser rolada (não centraliza o conteúdo). */
export const ANIMACOES = [
  /* --------------------------- Membro (conta grátis) --------------------------- */
  { id: "surgir", nome: "Surgir", nivel: "membro", categoria: "entrada", descricao: "O elemento aparece suavemente. A entrada mais elegante para cartões, imagens e textos.", parametros: [duracao("surgir", 700), atraso("surgir"), curva("surgir")] },
  { id: "subir", nome: "Subir aparecendo", nivel: "membro", categoria: "entrada", descricao: "Sobe alguns pixels enquanto aparece. O padrão de sites como Apple e Stripe.", parametros: [duracao("subir", 700), distancia("subir", 24), atraso("subir"), curva("subir")] },
  { id: "deslizar", nome: "Entrar pelo lado", nivel: "membro", categoria: "entrada", descricao: "Entra pela esquerda ou pela direita. Bom para listas e notificações.", parametros: [duracao("deslizar", 600), distancia("deslizar", 48), opcao("deslizar", "sentido", "Vem da", [["-1", "Esquerda"], ["1", "Direita"]], "-1"), curva("deslizar")] },
  { id: "zoom", nome: "Zoom de entrada", nivel: "membro", categoria: "entrada", descricao: "Cresce até o tamanho real. Destaca modais, selos e ofertas.", parametros: [duracao("zoom", 500), numero("zoom", "escala", "Tamanho inicial", 0.2, 1, 0.05, 0.85), curva("zoom", CURVAS[4][0])] },
  { id: "pulsar", nome: "Pulsar", nivel: "membro", categoria: "atencao", descricao: "Aumenta e diminui sem parar. Ideal para o botão principal ou um aviso ao vivo.", parametros: [duracao("pulsar", 1600), numero("pulsar", "intensidade", "Intensidade", 1, 1.3, 0.01, 1.06), repeticoes("pulsar")] },
  { id: "balancar", nome: "Balançar", nivel: "membro", categoria: "atencao", descricao: "Balança de um lado para o outro, como quem diz \"aqui!\". Use em erros de formulário.", parametros: [duracao("balancar", 600), distancia("balancar", 6, 30, "Intensidade"), repeticoes("balancar", "1")] },
  { id: "quicar", nome: "Quicar", nivel: "membro", categoria: "atencao", descricao: "Pula e cai como uma bola. Divertido para setas de \"role para baixo\" e ícones.", parametros: [duracao("quicar", 1000), distancia("quicar", 16, 80, "Altura"), repeticoes("quicar")] },
  { id: "girar", nome: "Girar", nivel: "membro", categoria: "feedback", descricao: "Gira sem parar. O indicador de carregamento clássico.", parametros: [duracao("girar", 900, 4000, 200), opcao("girar", "sentido", "Sentido", [["normal", "Horário"], ["reverse", "Anti-horário"]], "normal")] },
  { id: "brilho", nome: "Brilho pulsante", nivel: "membro", categoria: "atencao", descricao: "Uma luz que acende e apaga em volta do elemento. Chama o olhar sem mexer o layout.", parametros: [duracao("brilho", 2000), cor("brilho", "cor", "#14b8a6"), numero("brilho", "tamanho", "Alcance da luz", 4, 40, 1, 18, "px")] },
  { id: "flutuar", nome: "Flutuar", nivel: "membro", categoria: "atencao", descricao: "Sobe e desce devagar, como se estivesse no ar. Dá vida a ilustrações e mockups.", parametros: [duracao("flutuar", 3200, 8000, 500), distancia("flutuar", 10, 40, "Altura")] },

  /* ------------------------------------ Pro ------------------------------------ */
  // Ao rolar a página
  { id: "revelar-rolagem", nome: "Revelar ao rolar", nivel: "pro", categoria: "rolagem", rolagem: true, descricao: "Cada bloco aparece quando entra na tela, ligado à rolagem (scroll-driven). Com plano B automático para navegadores antigos.", parametros: [distancia("revelar-rolagem", 48), numero("revelar-rolagem", "escala", "Tamanho inicial", 0.7, 1, 0.01, 0.96), opcao("revelar-rolagem", "fim", "Termina quando", [["cover 25%", "Entrou um quarto"], ["cover 40%", "Entrou quase a metade"], ["entry 100%", "Entrou inteiro"]], "cover 25%")] },
  { id: "progresso-leitura", nome: "Barra de progresso da leitura", nivel: "pro", categoria: "rolagem", rolagem: true, descricao: "Uma barra no topo que enche conforme a pessoa lê. Padrão de blogs e artigos longos.", parametros: [cor("progresso-leitura", "cor", "#14b8a6"), numero("progresso-leitura", "altura", "Espessura", 2, 12, 1, 4, "px")] },
  { id: "parallax", nome: "Parallax em camadas", nivel: "pro", categoria: "rolagem", rolagem: true, descricao: "As camadas andam em velocidades diferentes ao rolar e criam profundidade.", parametros: [numero("parallax", "intensidade", "Profundidade", 0, 300, 10, 140, "px")] },
  { id: "zoom-rolagem", nome: "Zoom na rolagem", nivel: "pro", categoria: "rolagem", rolagem: true, descricao: "A imagem cresce devagar enquanto passa pela tela. Efeito cinematográfico.", parametros: [numero("zoom-rolagem", "escala", "Tamanho final", 1, 1.8, 0.05, 1.3), numero("zoom-rolagem", "arredondar", "Cantos no início", 0, 64, 2, 32, "px")] },
  { id: "cabecalho-encolhe", nome: "Cabeçalho que encolhe", nivel: "pro", categoria: "rolagem", rolagem: true, descricao: "O topo do site diminui e ganha sombra ao rolar, liberando espaço para o conteúdo.", parametros: [numero("cabecalho-encolhe", "alto", "Altura inicial", 64, 140, 2, 96, "px"), numero("cabecalho-encolhe", "baixo", "Altura final", 40, 80, 2, 56, "px")] },
  { id: "cascata", nome: "Lista em cascata", nivel: "pro", categoria: "rolagem", rolagem: true, descricao: "Os itens aparecem um depois do outro quando a lista entra na tela.", parametros: [duracao("cascata", 600), numero("cascata", "intervalo", "Intervalo entre itens", 20, 300, 10, 80, "ms"), distancia("cascata", 20)] },

  // Texto
  { id: "maquina-escrever", nome: "Máquina de escrever", nivel: "pro", categoria: "texto", descricao: "Digita, apaga e troca as frases sozinho, com cursor piscando. Perfeito para o título do hero.", parametros: [numero("maquina-escrever", "velocidade", "Tempo por letra", 20, 200, 5, 60, "ms"), numero("maquina-escrever", "pausa", "Pausa na frase pronta", 300, 5000, 100, 1600, "ms"), cor("maquina-escrever", "cursor", "#14b8a6", "Cor do cursor")] },
  { id: "palavra-a-palavra", nome: "Palavra por palavra", nivel: "pro", categoria: "texto", descricao: "O texto surge palavra por palavra, saindo do desfoque. Títulos com impacto de apresentação.", parametros: [duracao("palavra-a-palavra", 700), numero("palavra-a-palavra", "intervalo", "Intervalo entre palavras", 20, 300, 10, 70, "ms"), numero("palavra-a-palavra", "desfoque", "Desfoque inicial", 0, 20, 1, 8, "px")] },
  { id: "texto-gradiente", nome: "Texto em gradiente animado", nivel: "pro", categoria: "texto", descricao: "As cores correm por dentro das letras. Destaque premium para palavras-chave.", parametros: [duracao("texto-gradiente", 6000, 20000, 1000), cor("texto-gradiente", "cor1", "#14b8a6", "Cor 1"), cor("texto-gradiente", "cor2", "#6366f1", "Cor 2"), cor("texto-gradiente", "cor3", "#f59e0b", "Cor 3")] },
  { id: "texto-embaralhado", nome: "Texto que se decifra", nivel: "pro", categoria: "texto", descricao: "Letras aleatórias se organizam até formar a palavra, estilo filme de hacker. Repete ao passar o mouse.", parametros: [duracao("texto-embaralhado", 1200, 4000, 300)] },
  { id: "contador", nome: "Contador animado", nivel: "pro", categoria: "texto", descricao: "Os números sobem até o valor quando aparecem na tela, já formatados em reais, porcentagem ou milhar.", parametros: [duracao("contador", 2000, 6000, 300), opcao("contador", "formato", "Formato", [["numero", "Número (1.234)"], ["moeda", "Dinheiro (R$)"], ["porcentagem", "Porcentagem"]], "numero")] },
  { id: "sublinhado", nome: "Sublinhado que se desenha", nivel: "pro", categoria: "texto", descricao: "A linha cresce da esquerda para a direita ao passar o mouse. Links com acabamento de revista.", parametros: [duracao("sublinhado", 350, 1500, 100), cor("sublinhado", "cor", "#14b8a6"), numero("sublinhado", "espessura", "Espessura", 1, 8, 1, 2, "px")] },
  { id: "marca-texto", nome: "Marca-texto", nivel: "pro", categoria: "texto", descricao: "Uma faixa de marca-texto passa por trás da frase quando ela aparece.", parametros: [duracao("marca-texto", 900), cor("marca-texto", "cor", "#fde047"), atraso("marca-texto", 200)] },

  // Mouse e toque
  { id: "botao-magnetico", nome: "Botão magnético", nivel: "pro", categoria: "interacao", descricao: "O botão é atraído pelo cursor quando ele chega perto. Detalhe de sites premiados.", parametros: [numero("botao-magnetico", "forca", "Força do ímã", 0.1, 0.8, 0.05, 0.35)] },
  { id: "inclinacao-3d", nome: "Cartão com inclinação 3D", nivel: "pro", categoria: "interacao", descricao: "O cartão inclina seguindo o mouse, com reflexo de luz. Ótimo para produtos e planos.", parametros: [numero("inclinacao-3d", "angulo", "Inclinação máxima", 2, 25, 1, 12, "deg"), numero("inclinacao-3d", "reflexo", "Reflexo", 0, 0.6, 0.05, 0.25)] },
  { id: "holofote", nome: "Holofote que segue o mouse", nivel: "pro", categoria: "interacao", descricao: "Uma luz suave acompanha o cursor dentro dos cartões, como no site da Vercel e da Linear.", parametros: [numero("holofote", "tamanho", "Tamanho da luz", 100, 600, 10, 320, "px"), cor("holofote", "cor", "#14b8a6")] },
  { id: "ondulacao", nome: "Ondulação no clique", nivel: "pro", categoria: "interacao", descricao: "Uma onda sai do ponto tocado, como nos apps do Android. Confirma o toque no celular.", parametros: [duracao("ondulacao", 600, 2000, 200), cor("ondulacao", "cor", "#ffffff")] },
  { id: "brilho-passando", nome: "Reflexo passando", nivel: "pro", categoria: "interacao", descricao: "Um reflexo de luz atravessa o botão de tempos em tempos. Faz o botão de compra brilhar.", parametros: [duracao("brilho-passando", 2400, 8000, 600), numero("brilho-passando", "largura", "Largura do reflexo", 10, 80, 5, 35, "%")] },
  { id: "borda-giratoria", nome: "Borda em gradiente girando", nivel: "pro", categoria: "interacao", descricao: "Uma borda colorida gira em volta do cartão. Destaca o plano recomendado.", parametros: [duracao("borda-giratoria", 4000, 15000, 800), cor("borda-giratoria", "cor1", "#14b8a6", "Cor 1"), cor("borda-giratoria", "cor2", "#6366f1", "Cor 2"), numero("borda-giratoria", "espessura", "Espessura", 1, 8, 1, 2, "px")] },
  { id: "cortina", nome: "Imagem revelada por cortina", nivel: "pro", categoria: "interacao", rolagem: true, descricao: "A imagem se revela com um corte que abre quando ela entra na tela.", parametros: [duracao("cortina", 1100, 3000, 300), opcao("cortina", "direcao", "Abre para", [["inset(0 100% 0 0)", "Direita"], ["inset(0 0 0 100%)", "Esquerda"], ["inset(100% 0 0 0)", "Cima"], ["inset(50% 50% 50% 50% round 50%)", "Do centro"]], "inset(0 100% 0 0)")] },
  { id: "virar-cartao", nome: "Cartão que vira", nivel: "pro", categoria: "interacao", descricao: "Gira em 3D e mostra o verso. Use para perguntas e respostas, preços e equipe.", parametros: [duracao("virar-cartao", 700, 2000, 200), opcao("virar-cartao", "eixo", "Gira em", [["rotateY(180deg)", "Horizontal"], ["rotateX(180deg)", "Vertical"]], "rotateY(180deg)")] },

  // Fundos
  { id: "gradiente-animado", nome: "Gradiente animado", nivel: "pro", categoria: "fundo", descricao: "As cores do fundo se movem devagar. Dá vida ao hero sem pesar a página.", parametros: [duracao("gradiente-animado", 12000, 40000, 2000), cor("gradiente-animado", "cor1", "#0f766e", "Cor 1"), cor("gradiente-animado", "cor2", "#4f46e5", "Cor 2"), cor("gradiente-animado", "cor3", "#db2777", "Cor 3")] },
  { id: "aurora", nome: "Aurora", nivel: "pro", categoria: "fundo", descricao: "Manchas de luz desfocadas que dançam ao fundo, como uma aurora boreal.", parametros: [duracao("aurora", 18000, 60000, 4000), cor("aurora", "cor1", "#22d3ee", "Cor 1"), cor("aurora", "cor2", "#a78bfa", "Cor 2"), cor("aurora", "cor3", "#34d399", "Cor 3")] },
  { id: "letreiro", nome: "Letreiro infinito", nivel: "pro", categoria: "fundo", descricao: "Logos ou frases passando sem parar e sem emendas. Pausa quando o mouse passa por cima.", parametros: [duracao("letreiro", 22000, 60000, 4000), opcao("letreiro", "sentido", "Sentido", [["normal", "Para a esquerda"], ["reverse", "Para a direita"]], "normal")] },
  { id: "particulas", nome: "Partículas conectadas", nivel: "pro", categoria: "fundo", descricao: "Pontos flutuando e se ligando por linhas. Clássico de sites de tecnologia.", parametros: [numero("particulas", "quantidade", "Quantidade", 10, 160, 5, 60), cor("particulas", "cor", "#14b8a6"), numero("particulas", "alcance", "Distância das ligações", 40, 220, 10, 120, "px")] },
  { id: "ondas", nome: "Ondas", nivel: "pro", categoria: "fundo", descricao: "Ondas em camadas no rodapé do hero, com movimento contínuo.", parametros: [duracao("ondas", 9000, 30000, 2000), cor("ondas", "cor", "#14b8a6")] },
  { id: "grade-pontos", nome: "Grade de pontos com luz", nivel: "pro", categoria: "fundo", descricao: "Uma grade de pontos discreta com uma luz que percorre o fundo.", parametros: [duracao("grade-pontos", 8000, 30000, 2000), cor("grade-pontos", "cor", "#14b8a6"), numero("grade-pontos", "espaco", "Espaço entre pontos", 12, 48, 2, 22, "px")] },

  // Carregando e sucesso
  { id: "esqueleto", nome: "Esqueleto com brilho", nivel: "pro", categoria: "feedback", descricao: "Formas cinzas com um brilho passando enquanto o conteúdo carrega. Padrão do YouTube e do LinkedIn.", parametros: [duracao("esqueleto", 1400, 4000, 500)] },
  { id: "pontos", nome: "Três pontinhos", nivel: "pro", categoria: "feedback", descricao: "Pontos pulando em sequência: \"digitando…\" ou \"carregando…\".", parametros: [duracao("pontos", 1200, 3000, 400), cor("pontos", "cor", "#14b8a6"), numero("pontos", "tamanho", "Tamanho", 4, 20, 1, 10, "px")] },
  { id: "check-sucesso", nome: "Check de sucesso", nivel: "pro", categoria: "feedback", descricao: "O círculo se desenha e o check aparece. Confirmação de pagamento ou cadastro.", parametros: [duracao("check-sucesso", 900, 3000, 300), cor("check-sucesso", "cor", "#16a34a")] },
  { id: "desenhar-svg", nome: "Desenho de linha (SVG)", nivel: "pro", categoria: "feedback", rolagem: true, descricao: "Logos, assinaturas e ilustrações se desenham sozinhos quando entram na tela.", parametros: [duracao("desenhar-svg", 2200, 6000, 400), numero("desenhar-svg", "espessura", "Espessura", 1, 10, 0.5, 3, "px"), cor("desenhar-svg", "cor", "#14b8a6")] },
  { id: "confete", nome: "Confete", nivel: "pro", categoria: "feedback", descricao: "Uma explosão de confete ao clicar. Comemore compras, cadastros e metas batidas.", parametros: [numero("confete", "quantidade", "Quantidade", 20, 300, 10, 120), numero("confete", "forca", "Força", 4, 20, 1, 11)] },
  { id: "menu-icone", nome: "Ícone de menu que vira X", nivel: "pro", categoria: "feedback", descricao: "As três linhas do menu se transformam em um X ao abrir.", parametros: [duracao("menu-icone", 350, 1200, 100), cor("menu-icone", "cor", "#1c1917")] },

  // Transições
  { id: "transicao-tela", nome: "Transição entre telas", nivel: "pro", categoria: "transicao", descricao: "Troca de conteúdo com a API View Transitions: o navegador anima de uma tela para a outra.", parametros: [duracao("transicao-tela", 450, 1500, 150), opcao("transicao-tela", "efeito", "Efeito", [["deslizar", "Deslizar"], ["desvanecer", "Desvanecer"], ["zoom", "Zoom"]], "deslizar")] },
  { id: "lista-flip", nome: "Lista que se reorganiza", nivel: "pro", categoria: "transicao", descricao: "Ao ordenar ou filtrar, cada item desliza para o novo lugar em vez de pular (técnica FLIP).", parametros: [duracao("lista-flip", 500, 1500, 150), curva("lista-flip")] },
  { id: "modal-mola", nome: "Modal com efeito mola", nivel: "pro", categoria: "transicao", descricao: "A janela abre com um leve quique natural, usando a curva linear() de mola.", parametros: [duracao("modal-mola", 600, 1500, 200), opcao("modal-mola", "elasticidade", "Elasticidade", [
      ["linear(0, 0.5 12%, 1.04 28%, 0.99 45%, 1)", "Suave"],
      ["linear(0, 0.4 9%, 0.95 20%, 1.12 30%, 1.05 42%, 0.98 56%, 1.01 72%, 1)", "Média"],
      ["linear(0, 0.3 6%, 1.2 18%, 0.85 30%, 1.08 42%, 0.96 56%, 1.02 70%, 0.99 84%, 1)", "Forte"],
    ], "linear(0, 0.4 9%, 0.95 20%, 1.12 30%, 1.05 42%, 0.98 56%, 1.01 72%, 1)")] },
  { id: "acordeao", nome: "Sanfona suave", nivel: "pro", categoria: "transicao", descricao: "Perguntas que abrem e fecham deslizando, sem pulo, com o elemento nativo <details>.", parametros: [duracao("acordeao", 350, 1200, 100), curva("acordeao")] },
  { id: "notificacoes", nome: "Notificações empilhadas", nivel: "pro", categoria: "transicao", descricao: "Avisos que chegam, se empilham e saem deslizando, como no iPhone.", parametros: [duracao("notificacoes", 400, 1200, 150), numero("notificacoes", "tempo", "Tempo na tela", 1500, 8000, 250, 3500, "ms")] },
];

export const NIVEIS = { membro: "Membro", pro: "Pro" };
