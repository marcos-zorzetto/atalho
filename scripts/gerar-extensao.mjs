#!/usr/bin/env node
/**
 * Prepara os dados da extensão do VS Code (vscode-atalho/dados/) a partir das
 * mesmas fontes do site: documentação, CSS, catálogos e configuração pública.
 *
 *   node scripts/gerar-extensao.mjs
 *
 * Os trechos grátis vão dentro da extensão; os avançados e as animações vêm do
 * banco depois do login, conforme o plano da pessoa (as regras de RLS decidem).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { carregarDocs, RAIZ } from "./docs.mjs";
import { SITE } from "./site/config.mjs";
import { COMPONENTES_AVANCADOS, CATEGORIAS_COMPONENTES } from "./site/componentes-avancados.mjs";
import { ANIMACOES, CATEGORIAS as CATEGORIAS_ANIMACOES } from "./site/animacoes.mjs";

export const DESTINO = path.join(RAIZ, "vscode-atalho", "dados");

/** Configuração pública do Supabase (a mesma chave publicável do site). */
async function configuracaoPublica() {
  const contexto = {};
  contexto.window = contexto;
  vm.createContext(contexto);
  vm.runInContext(await readFile(path.join(RAIZ, "site/config.js"), "utf8"), contexto);
  const { url, chavePublica } = contexto.ATALHO_CONFIG.supabase;
  if (!/^sb_publishable_/.test(chavePublica)) throw new Error("site/config.js: a extensão só aceita a chave publicável");
  return { site: SITE.url, cdn: SITE.cdn, versaoBiblioteca: SITE.versao, supabase: { url, chavePublica } };
}

/** Um trecho por exemplo com HTML: at-<id> para o primeiro, at-<id>-2… para os outros. */
function trechosBase(docs) {
  const categorias = new Map(docs.categorias.map((c) => [c.id, c.nome]));
  const trechos = [];
  for (const c of docs.componentes) {
    const exemplos = (c.exemplos || []).filter((e) => e.html && !e.somenteCodigo);
    exemplos.forEach((e, i) => {
      const corpo = e.js ? `${e.html.trim()}\n\n<script type="module">\n${e.js.trim()}\n</script>` : e.html.trim();
      trechos.push({
        prefixo: i === 0 ? `at-${c.id}` : `at-${c.id}-${i + 1}`,
        componente: c.id,
        nome: i === 0 ? c.nome : `${c.nome}: ${e.titulo}`,
        categoria: categorias.get(c.categoria) || c.categoria,
        resumo: c.resumo,
        corpo,
      });
    });
  }
  return trechos;
}

/** Classes at-… do CSS, com o componente onde cada uma aparece primeiro (para a dica ao passar o mouse). */
function classes(css, docs) {
  const nomes = [...new Set([...css.matchAll(/\.(at-[a-z0-9-]+)/g)].map((m) => m[1]))].sort();
  return nomes.map((nome) => {
    const dono = docs.componentes.find((c) => `at-${c.id}` === nome) || docs.componentes.find((c) => (c.exemplos || []).some((e) => new RegExp(`class="[^"]*\\b${nome}\\b`).test(e.html || "")));
    return dono ? { nome, componente: dono.id, titulo: dono.nome } : { nome };
  });
}

const catalogo = (itens, categorias) => ({
  categorias: categorias.map(({ id, nome }) => ({ id, nome })),
  itens: itens.map(({ id, nome, nivel, categoria, descricao }) => ({ id, nome, nivel, categoria, descricao })),
});

/** Conteúdo de cada arquivo de vscode-atalho/dados/ (o teste confere se os arquivos estão em dia). */
export async function dadosExtensao() {
  const docs = await carregarDocs();
  const css = await readFile(path.join(RAIZ, "atalho/atalho.css"), "utf8");
  const arquivos = {
    "config.json": await configuracaoPublica(),
    "trechos-base.json": trechosBase(docs),
    "classes.json": classes(css, docs),
    "componentes-avancados.json": catalogo(COMPONENTES_AVANCADOS, CATEGORIAS_COMPONENTES),
    "animacoes.json": catalogo(ANIMACOES, CATEGORIAS_ANIMACOES),
  };
  return Object.fromEntries(Object.entries(arquivos).map(([nome, dados]) => [nome, JSON.stringify(dados, null, 1) + "\n"]));
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  const arquivos = await dadosExtensao();
  await mkdir(DESTINO, { recursive: true });
  for (const [nome, texto] of Object.entries(arquivos)) await writeFile(path.join(DESTINO, nome), texto);
  console.log(
    `Extensão: ${JSON.parse(arquivos["trechos-base.json"]).length} trechos grátis, ${JSON.parse(arquivos["classes.json"]).length} classes, ` +
      `${COMPONENTES_AVANCADOS.length} componentes avançados e ${ANIMACOES.length} animações no catálogo.`,
  );
}
