/**
 * Configuração do site gerado.
 * Domínio próprio: defina só ATALHO_URL (no GitHub, em Settings → Secrets and
 * variables → Actions → Variables). A base dos links sai do próprio endereço:
 *   https://marcos-zorzetto.github.io/atalho/ → links com /atalho/
 *   https://atalhoui.com/                     → links na raiz (/)
 * Guia completo: servicos/MIGRAR-DOMINIO.md
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { RAIZ } from "../docs.mjs";

const pacote = JSON.parse(readFileSync(path.join(RAIZ, "package.json"), "utf8"));

// Endereço oficial do site. Variável vazia no GitHub Actions também cai no padrão.
const ENDERECO = (process.env.ATALHO_URL || "https://marcos-zorzetto.github.io/atalho/").replace(/\/?$/, "/");

export const SITE = {
  nome: "Atalho",
  versao: pacote.version,
  // Endereço público (usado em canonical, sitemap e compartilhamento)
  url: ENDERECO,
  // Prefixo dos links internos: o caminho do endereço ("/atalho/" ou "/").
  // "--local" gera com links na raiz (para testar com um servidor local)
  base: process.argv.includes("--local") ? "/" : (process.env.ATALHO_BASE || new URL(ENDERECO).pathname).replace(/\/?$/, "/"),
  // Onde o site está hospedado: "github" (GitHub Pages) ou "cloudflare"
  hospedagem: process.env.ATALHO_HOSPEDAGEM || "github",
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
