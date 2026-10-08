/**
 * Realce de código feito na hora de gerar o site (o visitante não baixa
 * nenhum JavaScript para isso). Suporta HTML, CSS, JavaScript, TypeScript,
 * PHP e terminal.
 */

export const esc = (texto) =>
  String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function tokenizar(codigo, regras) {
  const fonte = regras.map(([, re]) => `(${re.source})`).join("|");
  const re = new RegExp(fonte, "g");
  let saida = "";
  let i = 0;
  for (const m of codigo.matchAll(re)) {
    saida += esc(codigo.slice(i, m.index));
    const indice = m.slice(1).findIndex((g) => g !== undefined);
    const classe = regras[indice]?.[0];
    saida += classe ? `<span class="tk-${classe}">${esc(m[0])}</span>` : esc(m[0]);
    i = m.index + m[0].length;
  }
  return saida + esc(codigo.slice(i));
}

const COMENTARIO_JS = /\/\/[^\n]*|\/\*[\s\S]*?\*\//;
const TEXTO = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/;
const NUMERO = /\b\d+(?:[.,]\d+)?\b/;

const PALAVRAS_JS =
  /\b(?:const|let|var|function|return|if|else|for|of|in|new|async|await|try|catch|finally|throw|class|extends|this|true|false|null|undefined|get|set|typeof|instanceof|break|continue|import|export|from|default|switch|case|while|do|static)\b/;
const PALAVRAS_TS =
  /\b(?:const|let|var|function|return|if|else|for|of|in|new|async|await|try|catch|finally|throw|class|extends|implements|this|true|false|null|undefined|get|set|typeof|keyof|instanceof|break|continue|import|export|from|default|switch|case|while|interface|type|enum|declare|namespace|readonly|as|satisfies|private|public|protected|static)\b/;
const TIPOS_TS = /\b(?:string|number|boolean|void|unknown|any|never|Record|Promise|Array|Partial|HTMLElement|HTMLFormElement|HTMLInputElement|CustomEvent|Event|Element)\b/;

export function realcarJS(codigo) {
  return tokenizar(codigo, [["com", COMENTARIO_JS], ["str", TEXTO], ["pal", PALAVRAS_JS], ["num", NUMERO]]);
}

export function realcarTS(codigo) {
  return tokenizar(codigo, [["com", COMENTARIO_JS], ["str", TEXTO], ["pal", PALAVRAS_TS], ["tip", TIPOS_TS], ["num", NUMERO]]);
}

export function realcarPHP(codigo) {
  return tokenizar(codigo, [
    ["com", /\/\/[^\n]*|#(?!\[)[^\n]*|\/\*[\s\S]*?\*\//],
    ["str", /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/],
    ["pon", /<\?php|\?>/],
    ["var", /\$[a-zA-Z_]\w*/],
    ["pal", /\b(?:function|return|if|else|elseif|foreach|for|as|new|try|catch|throw|class|public|private|protected|static|const|true|false|null|array|declare|namespace|use|match|fn|echo|require_once|exit|readonly|enum)\b/],
    ["tip", /\b(?:string|int|float|bool|void|mixed|never|self)\b/],
    ["num", NUMERO],
  ]);
}

export function realcarCSS(codigo) {
  return tokenizar(codigo, [
    ["com", /\/\*[\s\S]*?\*\//],
    ["str", /"[^"\n]*"|'[^'\n]*'/],
    ["var", /--[\w-]+/],
    ["atr", /[\w-]+(?=\s*:)/],
    ["tag", /[.#][\w-]+|@[\w-]+/],
    ["num", /\b\d+(?:\.\d+)?(?:px|rem|em|%|ms|s|vw|vh|fr)?\b/],
  ]);
}

export function realcarTerminal(codigo) {
  return tokenizar(codigo, [["com", /#[^\n]*/], ["str", /"[^"\n]*"|'[^'\n]*'/], ["pal", /^(?:npm|npx|node|git|php|composer|curl)\b/m]]);
}

function realcarAtributos(trecho) {
  let saida = "";
  let i = 0;
  for (const m of trecho.matchAll(/([^\s=]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'>]+)?/g)) {
    saida += esc(trecho.slice(i, m.index));
    saida += `<span class="tk-atr">${esc(m[1])}</span>`;
    if (m[2]) saida += `<span class="tk-pon">${esc(m[2])}</span>`;
    if (m[3]) saida += `<span class="tk-str">${esc(m[3])}</span>`;
    i = m.index + m[0].length;
  }
  return saida + esc(trecho.slice(i));
}

export function realcarHTML(codigo) {
  let saida = "";
  let i = 0;
  // Conteúdo de <script> e <style> recebe o realce da própria linguagem
  const re = /<!--[\s\S]*?-->|<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>|<\/?[a-zA-Z][^<>]*>/g;
  for (const m of codigo.matchAll(re)) {
    saida += esc(codigo.slice(i, m.index));
    const [tudo, blocoTag, blocoAtributos, blocoConteudo] = m;
    if (tudo.startsWith("<!--")) {
      saida += `<span class="tk-com">${esc(tudo)}</span>`;
    } else if (blocoTag) {
      const realce = blocoTag === "script" ? realcarJS : realcarCSS;
      saida += `<span class="tk-pon">&lt;</span><span class="tk-tag">${blocoTag}</span>${realcarAtributos(blocoAtributos)}<span class="tk-pon">&gt;</span>`;
      saida += realce(blocoConteudo);
      saida += `<span class="tk-pon">&lt;/</span><span class="tk-tag">${blocoTag}</span><span class="tk-pon">&gt;</span>`;
    } else {
      const partes = tudo.match(/^(<\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?>)$/);
      saida += partes
        ? `<span class="tk-pon">${esc(partes[1])}</span><span class="tk-tag">${partes[2]}</span>${realcarAtributos(partes[3])}<span class="tk-pon">${esc(partes[4])}</span>`
        : esc(tudo);
    }
    i = m.index + tudo.length;
  }
  return saida + esc(codigo.slice(i));
}

export const REALCES = {
  html: realcarHTML,
  css: realcarCSS,
  js: realcarJS,
  ts: realcarTS,
  php: realcarPHP,
  terminal: realcarTerminal,
};

export const NOMES_LINGUAGEM = { html: "HTML", css: "CSS", js: "JavaScript", ts: "TypeScript", php: "PHP", terminal: "Terminal" };
