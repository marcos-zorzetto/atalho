// temporário: fotografa um trecho em vários pontos de scroll / tempo
import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";
const [arquivo, saida, ...pos] = process.argv.slice(2);
const html = await readFile(arquivo, "utf8");
const css = await readFile("C:/Users/marco/Documents/claude/loja-ajax-json/atalho/atalho.css", "utf8");
const nav = await chromium.launch({ channel: "msedge", args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const reduz = process.env.REDUZ === "1";
const ctx = await nav.newContext({ viewport: { width: +(process.env.W||1280), height: +(process.env.H||800) }, reducedMotion: reduz ? "reduce" : "no-preference" });
const aba = await ctx.newPage();
aba.on("pageerror", (e) => console.log("ERRO", e.message));
aba.on("console", (m) => console.log("CONSOLE", m.type(), m.text().slice(0,200)));
await aba.setContent(`<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style><style>body { margin: 0; min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); place-items: start center; padding: 16px; box-sizing: border-box; }</style></head><body>${html}</body></html>`, { waitUntil: "load" });
await aba.waitForTimeout(1500);
let i = 0;
for (const p of pos) {
  const [y, espera, mx, my] = p.split(",").map(Number);
  await aba.evaluate((y) => scrollTo(0, y), y);
  if (!isNaN(mx)) await aba.mouse.move(mx, my, { steps: 6 });
  await aba.waitForTimeout(espera || 900);
  await aba.screenshot({ path: `${saida}-${i++}.png` });
}
await nav.close();
