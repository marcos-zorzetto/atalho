/**
 * Configuração do site gerado.
 * Ao mudar para um domínio próprio, troque só URL_SITE e BASE.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { RAIZ } from "../docs.mjs";

const pacote = JSON.parse(readFileSync(path.join(RAIZ, "package.json"), "utf8"));

export const SITE = {
  nome: "Atalho",
  versao: pacote.version,
  // Endereço público (usado em canonical, sitemap e compartilhamento)
  url: (process.env.ATALHO_URL || "https://marcos-zorzetto.github.io/atalho/").replace(/\/?$/, "/"),
  // Prefixo dos links internos. "/" para testar localmente na raiz.
  // "--local" gera com links na raiz (para testar com um servidor local)
  base: process.argv.includes("--local") ? "/" : (process.env.ATALHO_BASE || "/atalho/").replace(/\/?$/, "/"),
  repositorio: "https://github.com/marcos-zorzetto/atalho",
  autor: "Marcos Zorzetto",
  autorUrl: "https://github.com/marcos-zorzetto",
  descricao:
    "Biblioteca de componentes HTML, CSS e JavaScript em português, nos padrões das grandes empresas, com exemplos em TypeScript e PHP. Grátis e de código aberto.",
  cdn: "https://cdn.jsdelivr.net/gh/marcos-zorzetto/atalho@1/atalho",
};

/** Link interno: url("componentes/modal/") → "/atalho/componentes/modal/" */
export const url = (caminho = "") => SITE.base + caminho.replace(/^\//, "");

/** Endereço absoluto para canonical e redes sociais */
export const urlAbsoluta = (caminho = "") => SITE.url + caminho.replace(/^\//, "");
