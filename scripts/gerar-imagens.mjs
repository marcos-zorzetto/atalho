#!/usr/bin/env node
/**
 * Gera as imagens do site com um navegador sem janela (Chrome, Chromium ou Edge):
 *  - exemplos/miniaturas/<id>.png  (galeria de exemplos)
 *  - og.png                         (imagem ao compartilhar o link)
 *
 * Uso: npm run imagens    (rode de novo quando mudar um exemplo)
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { RAIZ } from "./docs.mjs";
import { EXEMPLOS } from "./site/exemplos.mjs";

const candidatos = [
  process.env.NAVEGADOR,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const navegador = candidatos.find((c) => existsSync(c));
if (!navegador) {
  console.error("Nenhum navegador encontrado. Defina a variável NAVEGADOR com o caminho do Chrome ou Edge.");
  process.exit(1);
}

function capturar(endereco, destino, largura, altura, escala = 1) {
  const resultado = spawnSync(
    navegador,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--blink-settings=preferredColorScheme=1",
      `--force-device-scale-factor=${escala}`,
      "--virtual-time-budget=8000",
      `--window-size=${largura},${altura}`,
      `--screenshot=${destino}`,
      endereco,
    ],
    { encoding: "utf8", timeout: 60000 }
  );
  if (!existsSync(destino)) throw new Error(`Falha ao capturar ${endereco}: ${resultado.stderr}`);
  console.log(`✓ ${path.relative(RAIZ, destino)}`);
}

await mkdir(path.join(RAIZ, "exemplos", "miniaturas"), { recursive: true });
for (const exemplo of EXEMPLOS) {
  const pagina = pathToFileURL(path.join(RAIZ, "exemplos", `${exemplo.id}.html`)).href;
  capturar(pagina, path.join(RAIZ, "exemplos", "miniaturas", `${exemplo.id}.png`), 1280, 800, 0.5);
}
capturar(pathToFileURL(path.join(RAIZ, "scripts", "og.html")).href, path.join(RAIZ, "og.png"), 1200, 630, 1);
