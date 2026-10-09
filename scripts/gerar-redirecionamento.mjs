#!/usr/bin/env node
/**
 * Depois da mudança para um domínio próprio fora do GitHub Pages (Cloudflare),
 * o endereço antigo (marcos-zorzetto.github.io/atalho/) continua no ar só para
 * redirecionar: cada página antiga leva para a mesma página no domínio novo, e o
 * Google transfere a relevância (canonical + redirecionamento imediato).
 *
 * Uso: ATALHO_URL=https://novo-dominio/ node scripts/gerar-redirecionamento.mjs
 * Lê dist/ (já gerado para o domínio novo) e escreve dist-redirecionar/.
 */
import { readdir, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { RAIZ } from "./docs.mjs";
import { SITE } from "./site/config.mjs";

const DIST = path.join(RAIZ, "dist");
const SAIDA = path.join(RAIZ, "dist-redirecionar");
const NOVO = SITE.url;
if (new URL(NOVO).hostname.endsWith(".github.io")) {
  console.error("Defina ATALHO_URL com o domínio novo (ex.: https://atalhoui.com/).");
  process.exit(1);
}

const esc = (texto) => texto.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const pagina = (destino) => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>O Atalho mudou de endereço</title>
<link rel="canonical" href="${esc(destino)}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${esc(destino)}">
<script>location.replace(${JSON.stringify(destino)} + location.search + location.hash);</script>
</head><body><p>O Atalho mudou para <a href="${esc(destino)}">${esc(destino)}</a>.</p></body></html>
`;

async function* paginasHtml(pasta, relativo = "") {
  for (const item of await readdir(pasta, { withFileTypes: true })) {
    const caminho = path.posix.join(relativo, item.name);
    if (item.isDirectory()) yield* paginasHtml(path.join(pasta, item.name), caminho);
    else if (item.name.endsWith(".html")) yield caminho;
  }
}

await rm(SAIDA, { recursive: true, force: true });
let total = 0;
for await (const arquivo of paginasHtml(DIST)) {
  const destino = NOVO + arquivo.replace(/(^|\/)index\.html$/, "$1").replace(/^404\.html$/, "");
  await mkdir(path.join(SAIDA, path.dirname(arquivo)), { recursive: true });
  await writeFile(path.join(SAIDA, arquivo), pagina(destino));
  total++;
}

// Qualquer outro endereço antigo (arquivos, páginas que não existem mais): leva ao mesmo caminho no novo
await writeFile(
  path.join(SAIDA, "404.html"),
  `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>O Atalho mudou de endereço</title><meta name="robots" content="noindex">
<script>location.replace(${JSON.stringify(NOVO)} + location.pathname.replace(/^\\/atalho\\/?/, "") + location.search + location.hash);</script>
</head><body><p>O Atalho mudou para <a href="${esc(NOVO)}">${esc(NOVO)}</a>.</p></body></html>
`
);
await writeFile(path.join(SAIDA, ".nojekyll"), "");
await writeFile(path.join(SAIDA, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${NOVO}sitemap.xml\n`);
console.log(`dist-redirecionar/: ${total} páginas levando para ${NOVO}`);
