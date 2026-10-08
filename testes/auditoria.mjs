#!/usr/bin/env node
/**
 * Auditoria completa do site com um navegador de verdade (Edge/Chrome via Playwright).
 *
 * Para cada página, em computador (claro e escuro) e celular:
 *  - erros de JavaScript e no console, requisições do próprio site que falharam
 *  - elementos vazando para fora da tela (rolagem horizontal)
 *  - acessibilidade com axe-core (WCAG 2.1 A/AA), incluindo contraste de cores
 *  - captura de tela da página inteira (para revisão visual)
 *
 * Uso: node testes/auditoria.mjs [--paginas=inicio,componentes/modal] [--sem-capturas]
 */
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { RAIZ } from "../scripts/docs.mjs";
import { proDisponivel, arquivoExemplo } from "../scripts/pro.mjs";
import { supabaseFalso, semServicosReais } from "./supabase-falso.mjs";

const require = createRequire(import.meta.url);
const DIST = path.join(RAIZ, "dist");
const SAIDA = path.join(RAIZ, "testes", "resultado");
// --nome=valor (o valor pode ter "=", como em "admin/#como=admin")
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split(/=(.*)/s).slice(0, 2)));
const comCapturas = !("sem-capturas" in args);

/* Servidor estático simples para dist/ */
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".xml": "application/xml", ".txt": "text/plain", ".php": "text/plain" };
const servidor = createServer(async (req, res) => {
  let caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (caminho.endsWith("/")) caminho += "index.html";
  const arquivo = path.join(DIST, caminho);
  try {
    if (!arquivo.startsWith(DIST) || !(await stat(arquivo)).isFile()) throw new Error();
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(arquivo)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(await readFile(arquivo));
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(await readFile(path.join(DIST, "404.html")));
  }
});
await new Promise((ok) => servidor.listen(0, "127.0.0.1", ok));
const BASE = `http://127.0.0.1:${servidor.address().port}`;

/* Lista de páginas a partir do próprio site gerado */
const sitemap = await readFile(path.join(DIST, "sitemap.xml"), "utf8");
let paginas = Array.from(sitemap.matchAll(/<loc>[^<]*?\/atalho\/([^<]*)<\/loc>/g), (m) => m[1]);
if (!paginas.length) paginas = Array.from(sitemap.matchAll(/<loc>https?:\/\/[^/]+\/(?:atalho\/)?([^<]*)<\/loc>/g), (m) => m[1]);
paginas.push("conta/", "admin/", "pagina-que-nao-existe/");
// Telas de quem entrou na conta, com o Supabase simulado ("#como=" não vai para o servidor)
paginas.push("exemplos/loja/#como=visitante", "exemplos/loja/#como=membro", "conta/#como=admin", "admin/#como=membro", "admin/#como=admin");
const lojaMembro = proDisponivel
  ? await readFile(arquivoExemplo("loja"), "utf8")
  : '<!doctype html><html lang="pt-BR"><head><title>Loja</title></head><body><main><h1>Loja</h1></main></body></html>';
if (args.paginas) paginas = args.paginas.split(",").map((p) => (p === "inicio" ? "" : p.replace(/^\//, "")));

const navegador = await chromium.launch({
  channel: process.env.CI ? "chrome" : "msedge",
  args: ["--disable-features=PaintHolding"],
});

const VISOES = [
  { nome: "computador", viewport: { width: 1440, height: 900 }, colorScheme: "light", axe: true },
  { nome: "escuro", viewport: { width: 1440, height: 900 }, colorScheme: "dark", axe: true },
  { nome: "celular", viewport: { width: 390, height: 844 }, colorScheme: "light", isMobile: true, hasTouch: true, axe: false },
];

const axeFonte = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const problemas = [];
const registrar = (pagina, visao, tipo, detalhe) => problemas.push({ pagina: pagina || "/", visao, tipo, detalhe });

await mkdir(path.join(SAIDA, "capturas"), { recursive: true });

for (const visao of VISOES) {
  const opcoesContexto = {
    viewport: visao.viewport,
    colorScheme: visao.colorScheme,
    isMobile: visao.isMobile,
    hasTouch: visao.hasTouch,
    deviceScaleFactor: 1,
    locale: "pt-BR",
    reducedMotion: "reduce",
  };
  const contexto = await navegador.newContext(opcoesContexto);
  await semServicosReais(contexto);
  for (const pagina of paginas) {
    const [caminho, como] = pagina.split("#como=");
    const contextoPagina = como ? await navegador.newContext(opcoesContexto) : contexto;
    if (como) await semServicosReais(contextoPagina);
    if (como) await supabaseFalso(contextoPagina, { pessoa: como === "visitante" ? null : como, conteudos: { loja: lojaMembro }, usuarios: 31 });
    const aba = await contextoPagina.newPage();
    aba.on("pageerror", (erro) => registrar(pagina, visao.nome, "erro de JavaScript", erro.message));
    aba.on("console", (msg) => {
      if (msg.type() === "error" && !/Failed to load resource|net::ERR_|youtube|ytimg/i.test(msg.text())) registrar(pagina, visao.nome, "console", msg.text().slice(0, 300));
    });
    aba.on("response", (resposta) => {
      const endereco = resposta.url();
      if (endereco.startsWith(BASE) && resposta.status() >= 400 && pagina !== "pagina-que-nao-existe/") registrar(pagina, visao.nome, "arquivo não encontrado", endereco.replace(BASE, ""));
    });
    try {
      await aba.goto(`${BASE}/${caminho}`, { waitUntil: "load", timeout: 30000 });
      if (como) await aba.waitForTimeout(1200); // tempo para a sessão e as consultas simuladas
      await aba.waitForTimeout(900);

      const vazamentos = await aba.evaluate(() => {
        const largura = document.documentElement.clientWidth;
        const rolaveis = (el) => {
          for (let p = el.parentElement; p; p = p.parentElement) {
            const estilo = getComputedStyle(p);
            if (/(auto|scroll|hidden|clip)/.test(estilo.overflowX) && p !== document.documentElement && p !== document.body) return true;
          }
          return false;
        };
        const saida = [];
        for (const el of document.querySelectorAll("body *")) {
          const caixa = el.getBoundingClientRect();
          if (caixa.width === 0 || caixa.right <= largura + 1 || getComputedStyle(el).position === "fixed") continue;
          if (rolaveis(el) || el.closest("dialog:not([open]), [popover]:not(:popover-open), [hidden]")) continue;
          saida.push(`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${[...el.classList].join(".")} (${Math.round(caixa.right - largura)}px)`);
          if (saida.length > 4) break;
        }
        return { rolagemHorizontal: document.documentElement.scrollWidth > largura + 1, elementos: saida };
      });
      if (vazamentos.rolagemHorizontal || vazamentos.elementos.length) registrar(pagina, visao.nome, "vaza da tela", vazamentos.elementos.join(" | ") || "rolagem horizontal");

      if (visao.axe) {
        await aba.evaluate(axeFonte);
        const resultado = await aba.evaluate(async () =>
          window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, resultTypes: ["violations"] })
        );
        for (const v of resultado.violations) {
          registrar(pagina, visao.nome, `acessibilidade: ${v.id} (${v.impact})`, `${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")} [${v.nodes.length}]`);
        }
      }

      if (comCapturas) {
        // Imagens com loading="lazy" fora da tela não carregam numa captura de página inteira
        await aba.evaluate(() =>
          Promise.all(
            [...document.images].map((img) => {
              img.loading = "eager";
              return img.complete ? null : new Promise((ok) => { img.onload = img.onerror = ok; setTimeout(ok, 3000); });
            })
          )
        );
        const nome = `${(caminho || "inicio").replace(/\/$/, "").replace(/\//g, "_") || "inicio"}${como ? `-${como}` : ""}-${visao.nome}.png`;
        await aba.screenshot({ path: path.join(SAIDA, "capturas", nome), fullPage: true });
      }
    } catch (erro) {
      registrar(pagina, visao.nome, "não carregou", erro.message.slice(0, 200));
    }
    await aba.close();
    if (como) await contextoPagina.close();
  }
  await contexto.close();
  console.log(`✓ ${visao.nome}: ${paginas.length} páginas`);
}

await navegador.close();
servidor.close();

await writeFile(path.join(SAIDA, "auditoria.json"), JSON.stringify(problemas, null, 2));
const porTipo = problemas.reduce((m, p) => ((m[p.tipo] = (m[p.tipo] || 0) + 1), m), {});
console.log(`\n${problemas.length} problemas encontrados`);
console.table(porTipo);
for (const p of problemas.slice(0, 60)) console.log(`- [${p.visao}] /${p.pagina} · ${p.tipo}: ${p.detalhe}`);
process.exitCode = problemas.length ? 1 : 0;
