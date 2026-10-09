#!/usr/bin/env node
/**
 * Troca o endereço antigo pelo domínio novo nos textos do projeto (README,
 * package.json, guias e o README do atalho-pro, se estiver ao lado).
 * O site em si não precisa: ele lê a variável ATALHO_URL na publicação.
 *
 * Uso: node scripts/migrar-dominio.mjs https://atalhoui.com/
 *      node scripts/migrar-dominio.mjs https://atalhoui.com/ --conferir   (só mostra o que mudaria)
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { RAIZ } from "./docs.mjs";
import { PASTA_PRO } from "./pro.mjs";

const ANTIGO = "https://marcos-zorzetto.github.io/atalho/";
const [novoTexto] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const soConferir = process.argv.includes("--conferir");

let novo;
try {
  novo = new URL(novoTexto);
  if (novo.protocol !== "https:") throw new Error();
} catch {
  console.error("Informe o domínio novo com https, ex.: node scripts/migrar-dominio.mjs https://atalhoui.com/");
  process.exit(1);
}
const NOVO = novo.href.replace(/\/?$/, "/");

const arquivos = ["README.md", "package.json", "servicos/LEIA-ME.md", "servicos/MIGRAR-DOMINIO.md"].map((a) => path.join(RAIZ, a));
if (existsSync(path.join(PASTA_PRO, "README.md"))) arquivos.push(path.join(PASTA_PRO, "README.md"));

let total = 0;
for (const arquivo of arquivos) {
  if (!existsSync(arquivo)) continue;
  const texto = await readFile(arquivo, "utf8");
  const vezes = texto.split(ANTIGO).length - 1;
  if (!vezes) continue;
  total += vezes;
  console.log(`${path.relative(RAIZ, arquivo)}: ${vezes} endereço(s)`);
  if (!soConferir) await writeFile(arquivo, texto.split(ANTIGO).join(NOVO));
}
console.log(soConferir ? `\n${total} endereços seriam trocados por ${NOVO}` : `\n${total} endereços trocados por ${NOVO}`);
if (!soConferir) {
  console.log(`
Falta fazer fora do código (detalhes em servicos/MIGRAR-DOMINIO.md):
  1. GitHub → Settings → Secrets and variables → Actions → Variables:
     ATALHO_URL = ${NOVO}   e   ATALHO_HOSPEDAGEM = cloudflare
  2. Supabase → Authentication → URL Configuration: Site URL e Redirect URLs com ${NOVO}
  3. Lemon Squeezy: botão do produto para ${NOVO}conta/?pagamento=ok
  4. Google Search Console: adicionar ${NOVO} e enviar ${NOVO}sitemap.xml`);
}
