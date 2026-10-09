#!/usr/bin/env node
/**
 * Gera o site completo em dist/ a partir de site/dados (fonte única).
 *
 *   node scripts/gerar-site.mjs                 → para publicar (links com /atalho/)
 *   ATALHO_BASE=/ node scripts/gerar-site.mjs   → para testar localmente na raiz
 *
 * Cada componente vira uma página própria (/componentes/<id>/), que o Google
 * consegue indexar. O realce de código é feito aqui, não no navegador.
 */
import { mkdir, rm, writeFile, cp, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { carregarDocs, carregarBaseline, RAIZ } from "./docs.mjs";
import { SITE, url, urlAbsoluta } from "./site/config.mjs";
import { paginaComponente } from "./site/pagina-componente.mjs";
import { paginaInicio, paginaCatalogo } from "./site/pagina-inicio.mjs";
import {
  paginaExemplos, paginaIcones, paginaPersonalizar, paginaTypeScript, paginaPHP,
  paginaPatrocinar, paginaPro, paginaConta, paginaPrivacidade, paginaTermos, pagina404,
} from "./site/paginas-extras.mjs";
import { carregarGuiaPHP } from "./site/php-guia.mjs";
import { EXEMPLOS } from "./site/exemplos.mjs";
import { paginaEditor } from "./site/pagina-editor.mjs";
import { paginaExemplo, redirecionamentoExemplo } from "./site/pagina-exemplo.mjs";
import { paginaAnimacoes } from "./site/pagina-animacoes.mjs";
import { paginaAdmin } from "./site/pagina-admin.mjs";

const DIST = path.join(RAIZ, "dist");

async function carregarScriptNavegador(arquivo, global) {
  const contexto = {};
  contexto.window = contexto;
  vm.createContext(contexto);
  vm.runInContext(await readFile(path.join(RAIZ, arquivo), "utf8"), contexto, { filename: arquivo });
  return contexto[global];
}

async function escrever(caminho, conteudo) {
  const destino = path.join(DIST, caminho);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, conteudo, "utf8");
}

export async function gerarSite() {
  const inicio = Date.now();
  const docs = await carregarDocs();
  const baseline = await carregarBaseline();
  const patrocinadores = (await carregarScriptNavegador("site/dados/patrocinadores.js", "ATALHO_PATROCINADORES")) || [];
  const icones = await carregarScriptNavegador("site/dados/icones.js", "ATALHO_ICONES");
  const php = await carregarGuiaPHP();
  const ordem = docs.categorias.flatMap((cat) => docs.componentes.filter((c) => c.categoria === cat.id));
  const contexto = { docs, baseline, patrocinadores, ordem, exemplos: EXEMPLOS, icones, php };

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // Arquivos estáticos
  await cp(path.join(RAIZ, "atalho"), path.join(DIST, "atalho"), { recursive: true });
  await cp(path.join(RAIZ, "php", "atalho.php"), path.join(DIST, "php", "atalho.php"));
  // Das páginas completas, só as imagens são públicas; o código fica no atalho-pro (Supabase)
  for (const pasta of ["miniaturas", "capturas"]) {
    await cp(path.join(RAIZ, "exemplos", pasta), path.join(DIST, "exemplos", pasta), { recursive: true });
  }
  for (const arquivo of ["site.css", "site.js", "conta.js", "config.js", "assistente.js", "editor.js", "supabase.js", "membros.js", "admin.js", "loja.js", "animacoes.js"]) {
    await cp(path.join(RAIZ, "site", arquivo), path.join(DIST, "site", arquivo));
  }
  for (const arquivo of ["favicon.svg", "og.png"]) {
    if (existsSync(path.join(RAIZ, arquivo))) await cp(path.join(RAIZ, arquivo), path.join(DIST, arquivo));
  }

  // Índice leve para a busca (todas as páginas)
  const indice = ordem.map((c) => ({
    id: c.id,
    nome: c.nome,
    categoria: docs.categorias.find((cat) => cat.id === c.categoria).nome,
    resumo: c.resumo,
    apelidos: c.apelidos || [],
    api: (c.api || []).map((a) => a.nome),
    url: url(`componentes/${c.id}/`),
  }));
  await escrever("site/indice-busca.js", `window.ATALHO_INDICE=${JSON.stringify(indice)};\n`);

  // Catálogo que o assistente de IA (Cloudflare Worker) consulta: atualiza sozinho a cada publicação
  const catalogoIA = ordem.map((c) => ({
    id: c.id,
    nome: c.nome,
    resumo: c.resumo,
    apelidos: c.apelidos || [],
    api: (c.api || []).map((a) => `${a.nome}: ${a.descricao}`).slice(0, 12),
    exemplo: (c.exemplos.find((e) => !e.somenteCodigo) || c.exemplos[0]).html.slice(0, 1600),
  }));
  await escrever("site/catalogo-ia.json", JSON.stringify(catalogoIA));

  // Páginas
  const paginas = new Map([
    ["index.html", paginaInicio(contexto)],
    ["componentes/index.html", paginaCatalogo(contexto)],
    ["exemplos/index.html", paginaExemplos(contexto)],
    ["icones/index.html", paginaIcones(contexto)],
    ["personalizar/index.html", paginaPersonalizar(contexto)],
    ["editor/index.html", paginaEditor(contexto)],
    ["typescript/index.html", paginaTypeScript(contexto)],
    ["php/index.html", paginaPHP(contexto)],
    ["patrocinar/index.html", paginaPatrocinar(contexto)],
    ["pro/index.html", paginaPro(contexto)],
    ["animacoes/index.html", paginaAnimacoes(contexto)],
    ["conta/index.html", paginaConta(contexto)],
    ["privacidade/index.html", paginaPrivacidade(contexto)],
    ["termos/index.html", paginaTermos(contexto)],
    ["admin/index.html", paginaAdmin(contexto)],
    ["404.html", pagina404(contexto)],
  ]);
  for (const componente of ordem) {
    paginas.set(`componentes/${componente.id}/index.html`, paginaComponente({ ...contexto, componente }));
  }
  for (const exemplo of EXEMPLOS) {
    paginas.set(`exemplos/${exemplo.id}/index.html`, paginaExemplo({ ...contexto, exemplo }));
  }
  for (const [caminho, html] of paginas) await escrever(caminho, html);

  // Endereços antigos das páginas completas (exemplos/loja.html) levam à vitrine nova
  for (const exemplo of EXEMPLOS) await escrever(`exemplos/${exemplo.id}.html`, redirecionamentoExemplo(exemplo));

  // Endereço antigo (componentes.html#modal) continua funcionando
  await escrever(
    "componentes.html",
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Componentes · Atalho</title>
<link rel="canonical" href="${urlAbsoluta("componentes/")}"><meta name="robots" content="noindex">
<script>location.replace("${url("componentes/")}" + (location.hash ? location.hash.slice(1) + "/" : ""));</script>
</head><body><a href="${url("componentes/")}">Ver componentes</a></body></html>`
  );

  // Sitemap e robots
  const hoje = new Date().toISOString().slice(0, 10);
  const indexaveis = [...paginas.entries()].filter(([, html]) => !html.includes('content="noindex'));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexaveis
  .map(([caminho]) => {
    const endereco = urlAbsoluta(caminho.replace(/index\.html$/, ""));
    const prioridade = caminho === "index.html" ? "1.0" : caminho.startsWith("componentes/") ? "0.8" : "0.6";
    return `  <url><loc>${endereco}</loc><lastmod>${hoje}</lastmod><priority>${prioridade}</priority></url>`;
  })
  .join("\n")}
</urlset>
`;
  await escrever("sitemap.xml", sitemap);
  await escrever("robots.txt", `User-agent: *\nAllow: /\nDisallow: ${url("conta/")}\nDisallow: ${url("admin/")}\n\nSitemap: ${urlAbsoluta("sitemap.xml")}\n`);

  // llms.txt: resumo para buscadores de IA
  await escrever(
    "llms.txt",
    `# Atalho\n\n> ${SITE.descricao}\n\n## Componentes\n\n${ordem
      .map((c) => `- [${c.nome}](${urlAbsoluta(`componentes/${c.id}/`)}): ${c.resumo}`)
      .join("\n")}\n\n## Guias\n\n- [TypeScript](${urlAbsoluta("typescript/")})\n- [PHP](${urlAbsoluta("php/")})\n- [Exemplos completos](${urlAbsoluta("exemplos/")})\n\n## Páginas completas (código para membros)\n\n${EXEMPLOS.map((e) => `- [${e.nome}](${urlAbsoluta(`exemplos/${e.id}/`)}): ${e.resumo}`).join("\n")}\n`
  );

  // .nojekyll: o GitHub Pages não processa nada, serve os arquivos como estão
  await escrever(".nojekyll", "");

  // Domínio próprio no GitHub Pages: o arquivo CNAME diz qual é
  const host = new URL(SITE.url).hostname;
  if (SITE.hospedagem === "github" && !host.endsWith(".github.io") && host !== "localhost") await escrever("CNAME", `${host}\n`);

  // Cloudflare: cabeçalhos de segurança e cache (o GitHub Pages ignora este arquivo)
  await escrever(
    "_headers",
    `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Frame-Options: SAMEORIGIN

${url("atalho/*")}
  Cache-Control: public, max-age=3600, must-revalidate

${url("exemplos/capturas/*")}
  Cache-Control: public, max-age=604800

${url("exemplos/miniaturas/*")}
  Cache-Control: public, max-age=604800

${url("admin/*")}
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-store

${url("conta/*")}
  X-Robots-Tag: noindex, nofollow
`
  );

  const total = (await listar(DIST)).length;
  console.log(`Site gerado em dist/ (${paginas.size} páginas, ${total} arquivos) em ${Date.now() - inicio} ms. Base: ${SITE.base}`);
  return { paginas: [...paginas.keys()] };
}

async function listar(pasta) {
  const itens = await readdir(pasta, { withFileTypes: true, recursive: true });
  return itens.filter((i) => i.isFile());
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("gerar-site.mjs")) {
  gerarSite().catch((erro) => {
    console.error(erro);
    process.exit(1);
  });
}
