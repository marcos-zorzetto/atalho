#!/usr/bin/env node
/**
 * Captura rápida de uma página do dist/ em várias larguras, para revisão visual.
 * Uso: node testes/captura-rapida.mjs sistemas/ [--larguras=390,768,1440] [--seletor=.site-sistemas-grupo] [--escuro]
 * Resultado: testes/resultado/rapida/<pagina>-<largura>.png
 */
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { RAIZ } from "../scripts/docs.mjs";

const args = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => { const i = a.indexOf("="); return i < 0 ? [a.slice(2), ""] : [a.slice(2, i), a.slice(i + 1)]; }));
const pagina = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "";
const larguras = (args.larguras || "390,768,1440").split(",").map(Number);
const DIST = path.join(RAIZ, "dist");
const SAIDA = path.join(RAIZ, "testes", "resultado", "rapida");
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2" };

const servidor = createServer(async (req, res) => {
  let caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (caminho.endsWith("/")) caminho += "index.html";
  const ficheiro = path.join(DIST, caminho);
  try {
    if ((await stat(ficheiro)).isFile()) {
      res.writeHead(200, { "content-type": TIPOS[path.extname(ficheiro)] || "application/octet-stream" });
      return res.end(await readFile(ficheiro));
    }
  } catch {}
  res.writeHead(404);
  res.end();
});
await new Promise((r) => servidor.listen(0, r));
const base = `http://localhost:${servidor.address().port}/`;
await mkdir(SAIDA, { recursive: true });
const navegador = await chromium.launch({ channel: "msedge" });
const nome = (pagina.replace(/[\/#=]+/g, "-").replace(/-$/, "") || "inicio");
for (const largura of larguras) {
  const ctx = await navegador.newContext({ viewport: { width: largura, height: 900 }, deviceScaleFactor: 1, colorScheme: "escuro" in args ? "dark" : "light", reducedMotion: "reduce" });
  const p = await ctx.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push(e.message));
  p.on("console", (m) => m.type() === "error" && erros.push(m.text()));
  await p.goto(base + pagina, { waitUntil: "networkidle" });
  const alvo = args.seletor ? p.locator(args.seletor).first() : null;
  const destino = path.join(SAIDA, `${nome}-${largura}.png`);
  if (alvo) await alvo.screenshot({ path: destino });
  else await p.screenshot({ path: destino, fullPage: true });
  const largo = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${largura}px → ${path.relative(RAIZ, destino)}${largo > 0 ? ` · rolagem horizontal de ${largo}px` : ""}${erros.length ? ` · erros: ${erros.join(" | ")}` : ""}`);
  await ctx.close();
}
await navegador.close();
servidor.close();
