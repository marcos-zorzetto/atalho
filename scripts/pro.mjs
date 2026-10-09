/**
 * Onde estão as páginas completas (repositório privado atalho-pro).
 * Por padrão, a pasta ao lado deste repositório; ou a variável ATALHO_PRO.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { RAIZ } from "./docs.mjs";

export const PASTA_PRO = path.resolve(process.env.ATALHO_PRO || path.join(RAIZ, "..", "atalho-pro"));
export const PASTA_EXEMPLOS_PRO = path.join(PASTA_PRO, "conteudos", "exemplos");
export const proDisponivel = existsSync(PASTA_EXEMPLOS_PRO);
export const arquivoExemplo = (id) => path.join(PASTA_EXEMPLOS_PRO, `${id}.html`);

/** Trechos do atalho-pro ("animacoes" ou "componentes"): { id: { nivel, html } } (vazio se não houver). */
export function lerTrechosPro(tipo) {
  const animacoes = {};
  for (const nivel of ["publico", "membro", "pro"]) {
    const pasta = path.join(PASTA_PRO, "conteudos", tipo, nivel);
    if (!existsSync(pasta)) continue;
    for (const arquivo of readdirSync(pasta).filter((a) => a.endsWith(".html"))) {
      animacoes[arquivo.replace(/\.html$/, "")] = { nivel, html: readFileSync(path.join(pasta, arquivo), "utf8") };
    }
  }
  return animacoes;
}
export const lerAnimacoesPro = () => lerTrechosPro("animacoes");
export const lerComponentesPro = () => lerTrechosPro("componentes");
