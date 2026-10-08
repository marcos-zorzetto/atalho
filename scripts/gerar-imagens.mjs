#!/usr/bin/env node
/**
 * Gera as imagens do site num navegador sem janela (Edge no Windows, Chrome no CI):
 *  - exemplos/miniaturas/<id>.png  640×400, galeria de exemplos
 *  - exemplos/capturas/<id>.jpg    1280×800, vitrine e compartilhamento
 *  - og.png                         1200×630, imagem ao compartilhar o site
 *
 * As páginas completas vêm do repositório privado atalho-pro (veja scripts/pro.mjs).
 * Uso: npm run imagens    (rode de novo quando mudar um exemplo)
 */
import { chromium } from "playwright-core";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { RAIZ } from "./docs.mjs";
import { EXEMPLOS } from "./site/exemplos.mjs";
import { proDisponivel, arquivoExemplo, PASTA_PRO } from "./pro.mjs";

const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png" };
const ORIGEM = "http://atalho.local";

const navegador = await chromium.launch({ channel: process.env.CI ? "chrome" : "msedge" });

/** Serve a biblioteca do repositório público e as páginas do atalho-pro, sem servidor de verdade. */
async function novaAba(largura, altura, escala) {
  const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala, colorScheme: "light", reducedMotion: "reduce" });
  await contexto.route(`${ORIGEM}/**`, async (rota) => {
    const caminho = decodeURIComponent(new URL(rota.request().url()).pathname);
    const exemplo = caminho.match(/^\/exemplos\/([a-z0-9-]+)\.html$/);
    const arquivo = exemplo ? arquivoExemplo(exemplo[1]) : path.join(RAIZ, caminho);
    try {
      await rota.fulfill({ body: await readFile(arquivo), contentType: TIPOS[path.extname(arquivo)] || "application/octet-stream" });
    } catch {
      await rota.fulfill({ status: 404, body: "não encontrado" });
    }
  });
  return contexto.newPage();
}

async function capturar(endereco, destino, { largura, altura, escala = 1, tipo = "png" }) {
  const aba = await novaAba(largura, altura, escala);
  await aba.goto(endereco, { waitUntil: "networkidle", timeout: 30000 });
  await aba.evaluate(() => document.fonts.ready);
  await aba.screenshot({ path: destino, type: tipo, ...(tipo === "jpeg" ? { quality: 82 } : {}) });
  await aba.context().close();
  console.log(`✓ ${path.relative(RAIZ, destino)}`);
}

if (proDisponivel) {
  await mkdir(path.join(RAIZ, "exemplos", "miniaturas"), { recursive: true });
  await mkdir(path.join(RAIZ, "exemplos", "capturas"), { recursive: true });
  for (const { id } of EXEMPLOS) {
    const endereco = `${ORIGEM}/exemplos/${id}.html`;
    await capturar(endereco, path.join(RAIZ, "exemplos", "miniaturas", `${id}.png`), { largura: 1280, altura: 800, escala: 0.5 });
    await capturar(endereco, path.join(RAIZ, "exemplos", "capturas", `${id}.jpg`), { largura: 1280, altura: 800, tipo: "jpeg" });
  }
} else {
  console.warn(`Pasta do atalho-pro não encontrada (${PASTA_PRO}). As imagens das páginas completas foram mantidas.`);
}
await capturar(`${ORIGEM}/scripts/og.html`, path.join(RAIZ, "og.png"), { largura: 1200, altura: 630 });
await navegador.close();
