/**
 * Onde estão as páginas completas (repositório privado atalho-pro).
 * Por padrão, a pasta ao lado deste repositório; ou a variável ATALHO_PRO.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { RAIZ } from "./docs.mjs";

export const PASTA_PRO = path.resolve(process.env.ATALHO_PRO || path.join(RAIZ, "..", "atalho-pro"));
export const PASTA_EXEMPLOS_PRO = path.join(PASTA_PRO, "conteudos", "exemplos");
export const proDisponivel = existsSync(PASTA_EXEMPLOS_PRO);
export const arquivoExemplo = (id) => path.join(PASTA_EXEMPLOS_PRO, `${id}.html`);
