import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";
const html = await readFile(process.argv[2], "utf8");
const css = await readFile("atalho/atalho.css", "utf8");
const b = await chromium.launch({ channel: "msedge" });
const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
p.on("console", m => console.log("console:", m.text()));
await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style><style>body { margin: 0; min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr); place-items: start center; padding: 16px; box-sizing: border-box; }</style></head><body>${html}</body></html>`, { waitUntil: "load" });
await p.waitForTimeout(800);
for (let i = 0; i < 4; i++) { await p.mouse.wheel(0, 400); await p.waitForTimeout(250); }
await p.waitForTimeout(800);
console.log(await p.evaluate(process.argv[3] || "1"));
await p.screenshot({ path: process.argv[4] || "testes/_dbg.png" });
await b.close();
