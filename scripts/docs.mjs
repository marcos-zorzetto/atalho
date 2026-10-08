/**
 * Carrega os dados da documentação (site/dados/*.js) no Node.
 * Os arquivos foram feitos para o navegador (window.ATALHO_DOCS), então
 * rodamos cada um num contexto isolado com um "window" de mentira.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

export const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// A ordem importa: base.js cria ATALHO_DOCS e os outros acrescentam componentes
export const ARQUIVOS_DE_DADOS = [
  "site/dados/base.js",
  "site/dados/fundamentos-formularios.js",
  "site/dados/navegacao-janelas.js",
  "site/dados/dados-feedback.js",
  "site/dados/paginas-js-receitas.js",
  "site/dados/novos.js",
  "site/dados/linguagens.js",
];

export async function carregarDocs() {
  const contexto = { Intl, JSON, console };
  contexto.window = contexto;
  vm.createContext(contexto);
  for (const arquivo of ARQUIVOS_DE_DADOS) {
    const codigo = await readFile(path.join(RAIZ, arquivo), "utf8");
    vm.runInContext(codigo, contexto, { filename: arquivo });
  }
  return contexto.ATALHO_DOCS;
}

export async function carregarBaseline() {
  const contexto = {};
  contexto.window = contexto;
  vm.createContext(contexto);
  const codigo = await readFile(path.join(RAIZ, "site/dados/baseline.js"), "utf8");
  vm.runInContext(codigo, contexto);
  return contexto.ATALHO_BASELINE;
}
