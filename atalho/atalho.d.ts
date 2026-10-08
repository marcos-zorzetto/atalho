/*!
 * Tipos do Atalho 1.1 — https://github.com/marcos-zorzetto/atalho · Licença MIT
 *
 * Salve este arquivo no seu projeto (ex.: tipos/atalho.d.ts) e inclua a pasta
 * no "include" do tsconfig.json. O objeto global Atalho e os eventos at:*
 * passam a ter autocompletar e checagem de tipos.
 */

export {};

declare global {
  type AtalhoTipoNotificacao = "sucesso" | "perigo" | "erro" | "aviso" | "info";
  type AtalhoMetodoHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  interface AtalhoOpcoesNotificacao {
    /** Cor e ícone. Padrão: "info". */
    tipo?: AtalhoTipoNotificacao;
    /** Texto em negrito acima da mensagem. */
    titulo?: string;
    /** Milissegundos até sumir (padrão 4500). 0 = só fecha manualmente. */
    duracao?: number;
    /** Botão de ação, como "Desfazer". */
    acao?: { texto: string; aoClicar?: () => void };
  }

  interface AtalhoOpcoesRequisicao {
    metodo?: AtalhoMetodoHttp;
    /** Objeto (enviado como JSON) ou FormData (para arquivos). */
    corpo?: unknown;
    cabecalhos?: Record<string, string>;
    /** Milissegundos (padrão 15000). */
    tempoLimite?: number;
    /** Para cancelar a requisição (ex.: busca enquanto digita). */
    sinal?: AbortSignal;
  }

  /** Erro lançado por Atalho.requisitar: a mensagem já vem em português. */
  interface AtalhoErroRequisicao extends Error {
    status?: number;
    dados?: unknown;
  }

  interface AtalhoOpcoesEstado {
    /** Guarda os dados no navegador (localStorage) e recupera ao recarregar. */
    salvar?: boolean;
  }

  interface AtalhoFormatar {
    /** 1234.5 → "R$ 1.234,50" */
    moeda(valor: number): string;
    /** 1234.5 → "1.234,5" */
    numero(valor: number, casas?: number): string;
    /** 0.125 → "13%" (ou "12,5%" com casas = 1) */
    porcentagem(valor: number, casas?: number): string;
    /** 1200 → "1,2 mil" */
    compacto(valor: number): string;
    data(valor: Date | string | number, estilo?: "short" | "medium" | "long" | "full"): string;
    dataHora(valor: Date | string | number): string;
    hora(valor: Date | string | number): string;
    /** "há 5 minutos", "amanhã" */
    relativo(valor: Date | string | number): string;
    /** 3500000 → "3,3 MB" */
    bytes(bytes: number): string;
    /** (2, "item") → "2 itens" */
    plural(quantidade: number, singular: string, plural?: string): string;
    maiusculas(texto: string): string;
  }

  interface AtalhoValidar {
    cpf(texto: string): boolean;
    /** Aceita o CNPJ numérico e o alfanumérico (a partir de julho de 2026). */
    cnpj(texto: string): boolean;
    email(texto: string): boolean;
    telefone(texto: string): boolean;
    cep(texto: string): boolean;
  }

  interface AtalhoApi {
    readonly versao: string;
    /**
     * Cria um estado reativo: ao trocar um valor, tudo que usa data-at-texto,
     * data-at-mostrar, data-at-lista etc. se atualiza sozinho.
     * Para listas, crie um array novo (this.itens = [...this.itens, novo]).
     */
    estado<T extends object>(nome: string, dados: T & ThisType<T>, opcoes?: AtalhoOpcoesEstado): T;
    /** Executa a função sempre que o estado mudar. Devolve uma função para parar. */
    observar<T extends object = Record<string, unknown>>(nome: string, funcao: (estado: T) => void): () => void;
    obterEstado<T extends object = Record<string, unknown>>(nome: string): T | undefined;
    notificar(mensagem: string, opcoes?: AtalhoOpcoesNotificacao): { fechar(): void };
    readonly formatar: AtalhoFormatar;
    readonly validar: AtalhoValidar;
    /** fetch com JSON automático, tempo limite e erros em português (lança AtalhoErroRequisicao). */
    requisitar<T = unknown>(url: string, opcoes?: AtalhoOpcoesRequisicao): Promise<T>;
    /** Liga componentes num trecho de HTML (raramente necessário: já é automático). */
    iniciar(raiz?: Element | Document): void;
    exportarCSV(tabela: HTMLTableElement, nomeArquivo?: string): void;
    definirTema(tema: "claro" | "escuro" | "sistema"): void;
    temaAtual(): "claro" | "escuro";
    /** Remove acentos e deixa minúsculo: "Ação" → "acao" */
    normalizar(texto: string): string;
  }

  /** Endereço devolvido pelo ViaCEP (evento at:cep). */
  interface AtalhoEnderecoCep {
    cep: string;
    logradouro: string;
    complemento: string;
    unidade: string;
    bairro: string;
    localidade: string;
    uf: string;
    estado: string;
    regiao: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
  }

  interface AtalhoPreferenciasCookies {
    necessarios: true;
    analiticos: boolean;
    marketing: boolean;
    data: string;
  }

  /** Eventos do Atalho com o formato de evento.detail. */
  interface AtalhoEventos {
    "at:pronto": CustomEvent<{ versao: string }>;
    "at:enviar": CustomEvent<{ dados: Record<string, FormDataEntryValue>; formulario: HTMLFormElement; botao: HTMLElement | null }>;
    "at:invalido": CustomEvent<{ campos: HTMLElement[] }>;
    "at:cep": CustomEvent<AtalhoEnderecoCep>;
    "at:cep-erro": CustomEvent<{ mensagem: string }>;
    "at:codigo": CustomEvent<{ valor: string }>;
    "at:arquivos": CustomEvent<{ arquivos: File[] }>;
    "at:aba": CustomEvent<{ aba: HTMLElement; painel: HTMLElement | null }>;
    "at:selecao": CustomEvent<{ quantidade: number; linhas: HTMLTableRowElement[]; ids: string[] }>;
    "at:mover": CustomEvent<{ cartao: HTMLElement; id?: string; de?: string; para?: string; posicao: number }>;
    "at:cookies": CustomEvent<AtalhoPreferenciasCookies>;
    "at:tema": CustomEvent<{ tema: "claro" | "escuro" }>;
    "at:estado": CustomEvent<{ nome: string; estado: unknown }>;
    "at:selecionar": CustomEvent<{ valor: string; texto: string; item: HTMLElement }>;
    "at:etiquetas": CustomEvent<{ lista: string[] }>;
    "at:fim": CustomEvent<Record<string, never>>;
    "at:carregar": CustomEvent<Record<string, never>>;
  }

  interface HTMLElementEventMap extends AtalhoEventos {}
  interface DocumentEventMap extends AtalhoEventos {}
  interface WindowEventMap extends AtalhoEventos {}

  interface Window {
    Atalho: AtalhoApi;
  }

  var Atalho: AtalhoApi;
}
