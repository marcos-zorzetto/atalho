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

/** Animações do estúdio: { id: { nivel, html } }, lidas do atalho-pro (vazio se não houver). */
export const PASTA_ANIMACOES_PRO = path.join(PASTA_PRO, "conteudos", "animacoes");
export function lerAnimacoesPro() {
  const animacoes = {};
  for (const nivel of ["membro", "pro"]) {
    const pasta = path.join(PASTA_ANIMACOES_PRO, nivel);
    if (!existsSync(pasta)) continue;
    for (const arquivo of readdirSync(pasta).filter((a) => a.endsWith(".html"))) {
      animacoes[arquivo.replace(/\.html$/, "")] = { nivel, html: readFileSync(path.join(pasta, arquivo), "utf8") };
    }
  }
  return animacoes;
}
