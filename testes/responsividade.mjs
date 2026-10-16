#!/usr/bin/env node
/**
 * Responsividade em dispositivos reais: ecrã, densidade, toque e motor de cada aparelho
 * (Safari/WebKit nos iPhone e iPad, Chromium nos Android, Firefox nos portáteis), do
 * iPhone SE ao ecrã 4K.
 *
 * Por página e dispositivo: nada mais largo que o ecrã, texto que não transborda, letra
 * de pelo menos 12px, alvos de toque de pelo menos 24×24px (WCAG 2.5.8) e sem erros na
 * consola. O menu do telemóvel tem de abrir.
 *
 * Uso: node testes/responsividade.mjs [--motores=chromium,webkit,firefox]   (gere antes: node scripts/gerar-site.mjs --local)
 * Resultado: testes/resultado/dispositivos/*.png e relatorio.json
 */
import { chromium, webkit, firefox, devices } from "playwright-core";
import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { RAIZ } from "../scripts/docs.mjs";
import { cabecalhosPara } from "../scripts/site/alojamento.mjs";

const MOTORES = (process.argv.find((a) => a.startsWith("--motores="))?.split("=")[1] || "chromium,webkit,firefox").split(",");
const PAGINAS = ["", "componentes/", "componentes/modal/", "componentes/tabela/", "exemplos/", "sistemas/", "pro/", "animacoes/", "pagina-que-nao-existe/"];
const DIST = path.join(RAIZ, "dist");
const SAIDA = path.join(RAIZ, "testes", "resultado", "dispositivos");
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };

const servidor = createServer(async (req, res) => {
  let caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (caminho.endsWith("/")) caminho += "index.html";
  const arquivo = path.join(DIST, caminho);
  try {
    if (!arquivo.startsWith(DIST) || !(await stat(arquivo)).isFile()) throw new Error();
    res.writeHead(200, { ...cabecalhosPara(caminho), "Content-Type": TIPOS[path.extname(arquivo)] || "application/octet-stream" });
    res.end(await readFile(arquivo));
  } catch {
    res.writeHead(404, { ...cabecalhosPara(caminho), "Content-Type": "text/html; charset=utf-8" });
    res.end(await readFile(path.join(DIST, "404.html")));
  }
});
await new Promise((ok) => servidor.listen(0, "127.0.0.1", ok));
const BASE = `http://127.0.0.1:${servidor.address().port}/`;

// [nome, perfil do Playwright ou tamanho, motor]
const DISPOSITIVOS = [
  ["iPhone SE", "iPhone SE", "webkit"],
  ["iPhone 12 mini", "iPhone 12 Mini", "webkit"],
  ["iPhone 15", "iPhone 15", "webkit"],
  ["iPhone 15 Pro Max", "iPhone 15 Pro Max", "webkit"],
  ["iPhone 15 horizontal", "iPhone 15 landscape", "webkit"],
  ["Galaxy S24", "Galaxy S24", "chromium"],
  ["Galaxy A55", "Galaxy A55", "chromium"],
  ["Pixel 7", "Pixel 7", "chromium"],
  ["Galaxy Z Fold 6 (fechado)", "Galaxy Z Fold 6 Cover", "chromium"],
  ["Galaxy Z Fold 6 (aberto)", "Galaxy Z Fold 6", "chromium"],
  ["Galaxy Z Flip 6", "Galaxy Z Flip 6", "chromium"],
  ["Pixel 7 horizontal", "Pixel 7 landscape", "chromium"],
  ["iPad mini", "iPad Mini", "webkit"],
  ["iPad Pro 11", "iPad Pro 11", "webkit"],
  ["iPad Pro 11 horizontal", "iPad Pro 11 landscape", "webkit"],
  ["Galaxy Tab S9", "Galaxy Tab S9", "chromium"],
  ["Portátil 1280×720 (Firefox)", { viewport: { width: 1280, height: 720 } }, "firefox"],
  ["Portátil 1366×768", { viewport: { width: 1366, height: 768 } }, "chromium"],
  ["MacBook Air 1440×900 (Safari)", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }, "webkit"],
  ["Full HD 1920×1080", { viewport: { width: 1920, height: 1080 } }, "chromium"],
  ["Full HD 1920×1080 (Firefox)", { viewport: { width: 1920, height: 1080 } }, "firefox"],
  ["2K 2560×1440", { viewport: { width: 2560, height: 1440 } }, "chromium"],
  ["Ultrawide 3440×1440", { viewport: { width: 3440, height: 1440 } }, "chromium"],
  ["4K 3840×2160", { viewport: { width: 3840, height: 2160 } }, "chromium"],
];

const lancar = { chromium: () => chromium.launch({ channel: process.env.CI ? "chrome" : "msedge" }), webkit: () => webkit.launch(), firefox: () => firefox.launch() };

/** Corre dentro da página. */
function inspecionar() {
  const vw = document.documentElement.clientWidth;
  const visivel = (e) => {
    const s = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    return s.visibility !== "hidden" && s.display !== "none" && r.width > 0 && r.height > 0 && !e.closest("[hidden], .at-sr, .at-pular-conteudo, dialog:not([open]), [popover]:not(:popover-open), [inert]");
  };
  // Áreas com scroll horizontal próprio (tabelas, código, separadores, carrosséis) podem ser mais largas
  const rolavel = (e) => {
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) return true;
    return false;
  };
  const desc = (e) => (e.id ? "#" + e.id : e.tagName.toLowerCase() + (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/)[0] : "")) + (e.textContent ? ` "${e.textContent.trim().slice(0, 30)}"` : "");
  const problemas = [];
  if (document.documentElement.scrollWidth > vw + 1) problemas.push(`página mais larga que o ecrã (${document.documentElement.scrollWidth}px > ${vw}px)`);
  [...document.querySelectorAll("main *, header *, footer *")].filter((e) => visivel(e) && !rolavel(e) && getComputedStyle(e).position !== "fixed" && e.getBoundingClientRect().right > vw + 1).slice(0, 3).forEach((e) => problemas.push(`sai do ecrã: ${desc(e)}`));
  [...document.querySelectorAll("h1, h2, h3, p, button, label, strong")].filter((e) => visivel(e) && !rolavel(e)).forEach((e) => {
    const s = getComputedStyle(e);
    if (/(hidden|clip)/.test(s.overflowX) || s.display === "inline" || s.textOverflow === "ellipsis") return;
    if (e.scrollWidth > e.clientWidth + 2) problemas.push(`texto a transbordar: ${desc(e)}`);
  });
  [...document.querySelectorAll("p, a, li, label, span, small, button")].filter((e) => visivel(e) && e.childElementCount === 0 && e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 12 && !e.closest('svg, kbd, .site-versao, pre, code, [aria-hidden="true"]')).slice(0, 3).forEach((e) => problemas.push(`letra < 12px: ${desc(e)}`));
  [...document.querySelectorAll("a, button, input, select, textarea, summary")]
    .filter((e) => visivel(e) && !e.closest("p, li p, td, .at-trilha, pre") && getComputedStyle(e).display !== "inline" && !(e.matches("input[type=checkbox], input[type=radio]") && e.closest("label")))
    .forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) problemas.push(`alvo de toque pequeno (${Math.round(r.width)}×${Math.round(r.height)}): ${desc(e)}`);
    });
  return { largura: vw, altura: innerHeight, problemas: [...new Set(problemas)] };
}

await mkdir(SAIDA, { recursive: true });
const relatorio = [];
const navegadores = {};
for (const [nome, perfil, motor] of DISPOSITIVOS) {
  if (!MOTORES.includes(motor)) continue;
  const config = typeof perfil === "string" ? { ...devices[perfil] } : { ...perfil };
  if (motor === "firefox") delete config.isMobile;
  if (!(motor in navegadores)) {
    try { navegadores[motor] = await lancar[motor](); } catch (e) { console.log(`⚠ motor ${motor} indisponível: ${e.message.split("\n")[0]}`); navegadores[motor] = null; }
  }
  if (!navegadores[motor]) continue;
  const ctx = await navegadores[motor].newContext({ ...config, locale: "pt-PT", reducedMotion: "reduce" });
  // Sem serviços reais (contas, IA, moradas, vídeos): o teste é do layout
  await ctx.route(/supabase\.co|workers\.dev|viacep|geoapi|dummyjson|youtube/, (rota) => rota.abort());
  const p = await ctx.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push(e.message));
  // Pedidos que o próprio teste bloqueia (Supabase, IA…) não contam: o Firefox chama-lhes "Cross-Origin Request Blocked"
  const bloqueadoPeloTeste = (t) => /Cross-Origin Request Blocked|access control checks/.test(t) && /supabase\.co|workers\.dev|viacep|geoapi|dummyjson/.test(t);
  p.on("console", (m) => m.type() === "error" && !/Failed to load resource|net::ERR_/.test(m.text()) && !bloqueadoPeloTeste(m.text()) && erros.push(m.text().slice(0, 200)));
  const linha = { nome, motor, paginas: {} };
  for (const u of PAGINAS) {
    await p.goto(BASE + u, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } scrollTo(0, 0); });
    const r = await p.evaluate(inspecionar);
    linha.paginas[u || "/"] = r.problemas;
    if (u === "") {
      linha.ecra = `${r.largura}×${r.altura}`;
      await p.screenshot({ path: path.join(SAIDA, `${nome.replace(/[^\w]+/g, "-")}.png`) });
      const menu = p.locator(".at-barra-menu");
      if (await menu.isVisible()) {
        await menu.click();
        await p.waitForTimeout(300);
        if (!(await p.locator("#links-topo a").first().isVisible())) linha.paginas["/"].push("menu do telemóvel não abre");
        await menu.click();
      }
    }
  }
  linha.erros = [...new Set(erros)];
  relatorio.push(linha);
  const lista = Object.entries(linha.paginas).flatMap(([pg, ps]) => ps.map((x) => `${pg}: ${x}`)).concat(linha.erros);
  console.log(`${lista.length ? "✗" : "✓"} ${nome.padEnd(30)} ${motor.padEnd(8)} ${linha.ecra || ""}${lista.length ? "\n   " + lista.slice(0, 8).join("\n   ") : ""}`);
  await ctx.close();
}
for (const n of Object.values(navegadores)) await n?.close();
servidor.close();
await writeFile(path.join(SAIDA, "relatorio.json"), JSON.stringify(relatorio, null, 2));
const falhas = relatorio.filter((l) => Object.values(l.paginas).flat().length || l.erros.length).length;
console.log(`\n${relatorio.length} dispositivos testados, ${falhas} com problemas.`);
process.exit(falhas ? 1 : 0);
