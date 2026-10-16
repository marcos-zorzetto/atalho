#!/usr/bin/env node
/**
 * Prepara o site para a PTServidor (Apache/cPanel): gera o dist/ com o endereço final,
 * sem acesso ao repositório privado, confere segurança e SEO e cria o zip para o
 * File Manager do cPanel (Upload → Extract).
 *
 * Uso: node scripts/empacotar-ptservidor.mjs https://atalhoui.com/
 * Saída: atalho-site.zip na raiz (não vai para o Git).
 * Guia: servicos/PTSERVIDOR.md
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { RAIZ } from "./docs.mjs";

const [endereco] = process.argv.slice(2);
let url;
try {
  url = new URL(endereco);
  if (url.protocol !== "https:" || url.pathname !== "/") throw new Error();
} catch {
  console.error("Indique o endereço final, com https e na raiz do domínio: node scripts/empacotar-ptservidor.mjs https://atalhoui.com/");
  process.exit(1);
}

const correr = (comando, argumentos, env = {}) => {
  const r = spawnSync(comando, argumentos, { cwd: RAIZ, stdio: "inherit", env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// 1. Site gerado para o domínio final, com o atalho-pro "invisível" (nada privado pode entrar)
const ambiente = { ATALHO_URL: url.href, ATALHO_HOSPEDAGEM: "ptservidor", ATALHO_PRO: path.join(RAIZ, "nao-existe-atalho-pro") };
correr(process.execPath, ["scripts/gerar-site.mjs"], ambiente);

// 2. Conferências do que vai para o ar
const ler = (f) => readFileSync(path.join(RAIZ, "dist", f), "utf8");
const problemas = [];
const htaccess = ler(".htaccess");
if (!htaccess.includes(`RewriteRule ^ https://${url.host}%{REQUEST_URI} [L,R=301]`)) problemas.push(".htaccess sem o redirecionamento para o domínio final");
if (!htaccess.includes("Content-Security-Policy")) problemas.push(".htaccess sem CSP");
if (!ler("sitemap.xml").includes(`<loc>${url.href}</loc>`)) problemas.push("sitemap.xml não usa o domínio final");
if (!ler("robots.txt").includes(`Sitemap: ${url.href}sitemap.xml`)) problemas.push("robots.txt não aponta para o sitemap");
if (!ler("index.html").includes(`<link rel="canonical" href="${url.href}">`)) problemas.push("canonical da página inicial errado");
if (existsSync(path.join(RAIZ, "dist", "CNAME"))) problemas.push("CNAME do GitHub Pages não devia existir");
const todo = spawnSync("git", ["grep", "-I", "-l", "-E", "sb_secret_[A-Za-z0-9_-]{10,}|service_role\":|sk-ant-", "--no-index", "--", "dist"], { cwd: RAIZ, encoding: "utf8" });
if (todo.stdout.trim()) problemas.push(`possível segredo em: ${todo.stdout.trim()}`);
if (problemas.length) {
  console.error(`Não empacotei:\n- ${problemas.join("\n- ")}`);
  process.exit(1);
}

// 3. Zip (o tar do Windows faz zip com -a; no Linux/macOS usa-se o zip)
const zip = path.join(RAIZ, "atalho-site.zip");
rmSync(zip, { force: true });
if (process.platform === "win32") correr("C:/Windows/System32/tar.exe", ["-a", "-c", "-f", zip, "-C", "dist", "."]);
else correr("sh", ["-c", `cd dist && zip -qr "${zip}" .`]);
console.log(`\nPronto: ${path.relative(RAIZ, zip)} para ${url.href}\nNo cPanel: File Manager → pasta do domínio → Upload (Overwrite) → Extract. Teste com ${url.href}?x=1`);
