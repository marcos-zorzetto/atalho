/**
 * Assistente do Atalho — Cloudflare Worker.
 *
 * POST /perguntar  { "pergunta": "formulário de contato com CPF" }
 *   → { resposta, componentes: ["campo", "mascaras"], html }
 *
 * Custos: usa o plano GRATUITO do Workers AI (10 mil "neurônios" por dia).
 * No plano gratuito, ao acabar a cota as chamadas param; não há cobrança.
 *
 * Proteções: só aceita chamadas do site (CORS), limita perguntas por IP,
 * limita o tamanho da pergunta e limpa o HTML gerado antes de devolver.
 */

interface Env {
  AI: Ai;
  LIMITE: RateLimit;
  ORIGENS: string;
  CATALOGO_URL: string;
}

interface RateLimit {
  limit(opcoes: { key: string }): Promise<{ success: boolean }>;
}

interface ItemCatalogo {
  id: string;
  nome: string;
  resumo: string;
  apelidos: string[];
  api: string[];
  exemplo: string;
}

interface RespostaIA {
  resposta: string;
  componentes: string[];
  html: string;
}

const MODELO_PRINCIPAL = "@cf/google/gemma-4-26b-a4b-it";
const MODELO_RESERVA = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const TAMANHO_MAXIMO_PERGUNTA = 400;

let cacheCatalogo: { itens: ItemCatalogo[]; ate: number } | null = null;

export default {
  async fetch(requisicao: Request, env: Env): Promise<Response> {
    const origem = requisicao.headers.get("Origin") ?? "";
    const permitidas = env.ORIGENS.split(",").map((o) => o.trim());
    const cors: Record<string, string> = permitidas.includes(origem)
      ? { "Access-Control-Allow-Origin": origem, Vary: "Origin", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Accept" }
      : {};
    const responder = (dados: unknown, status = 200) =>
      new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors } });

    const caminho = new URL(requisicao.url).pathname;
    if (requisicao.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (caminho === "/saude") return responder({ ok: true });
    if (caminho !== "/perguntar" || requisicao.method !== "POST") return responder({ erro: "Não encontrado." }, 404);
    if (!cors["Access-Control-Allow-Origin"]) return responder({ erro: "Origem não permitida." }, 403);

    const ip = requisicao.headers.get("CF-Connecting-IP") ?? "desconhecido";
    const { success } = await env.LIMITE.limit({ key: ip });
    if (!success) return responder({ erro: "Muitas perguntas seguidas. Aguarde um minuto." }, 429);

    let pergunta = "";
    try {
      const corpo = (await requisicao.json()) as { pergunta?: unknown };
      pergunta = typeof corpo.pergunta === "string" ? corpo.pergunta.trim() : "";
    } catch {
      return responder({ erro: "JSON inválido." }, 400);
    }
    if (!pergunta) return responder({ erro: "Escreva uma pergunta." }, 422);
    if (pergunta.length > TAMANHO_MAXIMO_PERGUNTA) return responder({ erro: "Pergunta longa demais." }, 422);

    try {
      const catalogo = await carregarCatalogo(env);
      const candidatos = escolherCandidatos(catalogo, pergunta, 6);
      const resultado = await perguntarIA(env, pergunta, candidatos);
      const ids = new Set(catalogo.map((c) => c.id));
      return responder({
        resposta: resultado.resposta.slice(0, 1200),
        componentes: resultado.componentes.filter((id) => ids.has(id)).slice(0, 4),
        html: limparHtml(resultado.html).slice(0, 6000),
      });
    } catch (erro) {
      const mensagem = String(erro instanceof Error ? erro.message : erro);
      // Cota diária esgotada ou serviço indisponível: o site cai para a busca local
      const status = /limit|quota|capacity|neuron/i.test(mensagem) ? 429 : 503;
      return responder({ erro: "O assistente está indisponível agora." }, status);
    }
  },
} satisfies ExportedHandler<Env>;

async function carregarCatalogo(env: Env): Promise<ItemCatalogo[]> {
  if (cacheCatalogo && cacheCatalogo.ate > Date.now()) return cacheCatalogo.itens;
  const resposta = await fetch(env.CATALOGO_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!resposta.ok) throw new Error(`catálogo ${resposta.status}`);
  const itens = (await resposta.json()) as ItemCatalogo[];
  cacheCatalogo = { itens, ate: Date.now() + 3_600_000 };
  return itens;
}

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Pré-seleciona os componentes mais parecidos com a pergunta: manda menos texto para a IA (mais rápido e mais barato). */
export function escolherCandidatos(catalogo: ItemCatalogo[], pergunta: string, quantidade: number): ItemCatalogo[] {
  const termos = normalizar(pergunta).split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const pontuados = catalogo.map((item) => {
    const texto = normalizar([item.nome, item.resumo, ...item.apelidos].join(" "));
    const pontos = termos.reduce((total, termo) => total + (texto.includes(termo) ? (normalizar(item.nome).includes(termo) ? 3 : 1) : 0), 0);
    return { item, pontos };
  });
  const melhores = pontuados.filter((p) => p.pontos > 0).sort((a, b) => b.pontos - a.pontos).map((p) => p.item);
  const basicos = ["campo", "botao", "cartao", "layout"].map((id) => catalogo.find((c) => c.id === id)).filter((c): c is ItemCatalogo => Boolean(c));
  return [...new Set([...melhores, ...basicos])].slice(0, quantidade);
}

function montarMensagens(pergunta: string, candidatos: ItemCatalogo[]) {
  const referencia = candidatos
    .map((c) => `### ${c.id} — ${c.nome}\n${c.resumo}\nAPI: ${c.api.join(" | ")}\nExemplo:\n${c.exemplo}`)
    .join("\n\n");
  const sistema = `Você é o assistente do Atalho, uma biblioteca de componentes HTML/CSS/JS em português para iniciantes.
Responda SEMPRE em português do Brasil, de forma simples e direta.
Monte o que a pessoa pediu usando SOMENTE as classes (at-*) e atributos (data-at-*) que aparecem na referência abaixo.
Não use frameworks, não invente classes e não inclua <script>, <style>, <html>, <head> ou <body>: devolva só o trecho do componente.
Responda apenas com um objeto JSON neste formato, sem texto fora dele:
{"resposta": "explicação curta em até 3 frases", "componentes": ["ids da referência usados"], "html": "trecho HTML"}

Referência dos componentes:
${referencia}`;
  return [
    { role: "system", content: sistema },
    { role: "user", content: pergunta },
  ];
}

const ESQUEMA = {
  type: "object",
  properties: {
    resposta: { type: "string" },
    componentes: { type: "array", items: { type: "string" } },
    html: { type: "string" },
  },
  required: ["resposta", "componentes", "html"],
};

async function perguntarIA(env: Env, pergunta: string, candidatos: ItemCatalogo[]): Promise<RespostaIA> {
  const messages = montarMensagens(pergunta, candidatos);
  try {
    const saida = (await env.AI.run(MODELO_PRINCIPAL as keyof AiModels, { messages, max_tokens: 1200, temperature: 0.2 } as never)) as { response?: unknown };
    const lido = lerJson(saida.response);
    if (lido) return lido;
  } catch {
    /* tenta o modelo reserva */
  }
  const saida = (await env.AI.run(MODELO_RESERVA as keyof AiModels, {
    messages,
    max_tokens: 1200,
    temperature: 0.2,
    response_format: { type: "json_schema", json_schema: ESQUEMA },
  } as never)) as { response?: unknown };
  const lido = lerJson(saida.response);
  if (!lido) throw new Error("resposta da IA em formato inesperado");
  return lido;
}

/** Aceita a resposta como objeto ou como texto com JSON dentro (alguns modelos cercam com ```json). */
export function lerJson(bruto: unknown): RespostaIA | null {
  let objeto: unknown = bruto;
  if (typeof bruto === "string") {
    const inicio = bruto.indexOf("{");
    const fim = bruto.lastIndexOf("}");
    if (inicio === -1 || fim <= inicio) return null;
    try {
      objeto = JSON.parse(bruto.slice(inicio, fim + 1));
    } catch {
      return null;
    }
  }
  if (!objeto || typeof objeto !== "object") return null;
  const o = objeto as Record<string, unknown>;
  if (typeof o.resposta !== "string") return null;
  return {
    resposta: o.resposta,
    componentes: Array.isArray(o.componentes) ? o.componentes.filter((x): x is string => typeof x === "string") : [],
    html: typeof o.html === "string" ? o.html : "",
  };
}

/** Remove o que pode executar código: <script>, <iframe>, atributos on*, javascript:. A prévia ainda roda isolada no navegador. */
export function limparHtml(html: string): string {
  return html
    .replace(/```(?:html)?/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base)\b[\s\S]*?(?:<\s*\/\s*\1\s*>|\/?>)/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src|action|formaction)\s*=\s*(["']?)\s*javascript:[^"'\s>]*/gi, "$1=$2#")
    .trim();
}
