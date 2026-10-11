#!/usr/bin/env node
/**
 * Verifica um trecho (animação ou componente do atalho-pro) num navegador de verdade:
 * erros de JavaScript, conteúdo a vazar no telemóvel, se algo se mexe, e tira
 * fotografias para ver como ficou.
 *
 *   node testes/verificar-trecho.mjs <ficheiro.html> [--rolar] [--saida=pasta]
 *
 * Imprime um JSON com o resultado e os caminhos das fotografias (PNG).
 */
import { chromium } from "playwright-core";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arquivo = process.argv[2];
if (!arquivo) {
  console.error("Uso: node testes/verificar-trecho.mjs <ficheiro.html> [--rolar] [--saida=pasta]");
  process.exit(2);
}
const rolar = process.argv.includes("--rolar");
const saida = (process.argv.find((a) => a.startsWith("--saida=")) || "").slice(8) || path.join(RAIZ, "testes", "resultado", "trechos");
await mkdir(saida, { recursive: true });

const html = await readFile(arquivo, "utf8");
const css = await readFile(path.join(RAIZ, "atalho", "atalho.css"), "utf8");
const nome = path.basename(arquivo, ".html");
const navegador = await chromium.launch({ channel: process.env.CI ? "chrome" : "msedge", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const resultado = { ficheiro: arquivo, erros: [], avisos: [], fotos: [], vazaNoTelemovel: false, mexe: false };

for (const [rotulo, largura, altura] of [["computador", 1280, 800], ["telemovel", 390, 844]]) {
  const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const aba = await contexto.newPage();
  aba.on("pageerror", (e) => resultado.erros.push(`[${rotulo}] ${e.message}`));
  aba.on("console", (m) => { if (m.type() === "error") resultado.avisos.push(`[${rotulo}] ${m.text().slice(0, 300)}`); });
  await aba.setContent(
    `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style><style>body { margin: 0; min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); place-items: ${rolar ? "start center" : "center"}; padding: 16px; box-sizing: border-box; }</style></head><body>${html}</body></html>`,
    { waitUntil: "load" },
  );
  await aba.waitForTimeout(1200);
  const antes = await aba.screenshot({ type: "png" });
  await aba.mouse.move(largura * 0.6, altura * 0.45);
  await aba.mouse.move(largura * 0.4, altura * 0.55, { steps: 8 });
  if (rolar) {
    for (let i = 0; i < 4; i++) { await aba.mouse.wheel(0, altura * 0.5); await aba.waitForTimeout(250); }
  }
  await aba.waitForTimeout(800);
  const depois = await aba.screenshot({ type: "png" });
  if (!antes.equals(depois)) resultado.mexe = true;
  const foto = path.join(saida, `${nome}-${rotulo}.png`);
  await aba.screenshot({ path: foto, type: "png" });
  resultado.fotos.push(foto);
  if (rotulo === "telemovel") {
    resultado.vazaNoTelemovel = await aba.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  }
  await contexto.close();
}

// Com "reduzir movimento" não pode haver animação infinita de CSS
const contexto = await navegador.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
const aba = await contexto.newPage();
aba.on("pageerror", (e) => resultado.erros.push(`[reduzir-movimento] ${e.message}`));
await aba.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`, { waitUntil: "load" });
await aba.waitForTimeout(500);
resultado.loopsComReduzirMovimento = await aba.evaluate(() => document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity).length);
await navegador.close();

console.log(JSON.stringify(resultado, null, 2));
process.exitCode = resultado.erros.length || resultado.vazaNoTelemovel ? 1 : 0;
