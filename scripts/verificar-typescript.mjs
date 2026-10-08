#!/usr/bin/env node
/**
 * Compila todos os exemplos de TypeScript da documentação contra atalho.d.ts.
 * Garante que nenhum exemplo publicado tem erro de tipo.
 * Uso: node scripts/verificar-typescript.mjs [caminho-do-tsc]
 */
import { mkdtemp, writeFile, rm, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { carregarDocs, RAIZ } from "./docs.mjs";

const docs = await carregarDocs();
const pasta = await mkdtemp(path.join(os.tmpdir(), "atalho-ts-"));
const arquivos = [];

for (const componente of docs.componentes) {
  componente.exemplos.forEach((exemplo, i) => {
    if (!exemplo.ts) return;
    arquivos.push({ nome: `${componente.id}-${i}.ts`, codigo: exemplo.ts, origem: `${componente.id} › ${exemplo.titulo}` });
  });
}

// Exemplos das páginas de guia (TypeScript e página inicial)
for (const arquivo of ["scripts/site/paginas-extras.mjs", "scripts/site/pagina-inicio.mjs"]) {
  const texto = await readFile(path.join(RAIZ, arquivo), "utf8");
  for (const [, bloco] of texto.matchAll(/(?:codigo\(\s*"ts",\s*|\bts:\s*)`((?:\\[\s\S]|[^`\\])*)`/g)) {
    if (bloco.includes('"compilerOptions"')) continue; // é um tsconfig.json, não TypeScript
    // Interpreta o texto como o próprio JavaScript faria (resolve os escapes \` e \${)
    const codigo = new Function(`return \`${bloco}\`;`)();
    arquivos.push({ nome: `guia-${arquivos.length}.ts`, codigo, origem: arquivo });
  }
}

for (const a of arquivos) {
  // Cada exemplo vira um módulo isolado; "declare" cobre variáveis que o exemplo supõe existir
  await writeFile(path.join(pasta, a.nome), `${a.codigo}\n\nexport {};\n`, "utf8");
}
await writeFile(
  path.join(pasta, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: { target: "ES2022", module: "ES2022", lib: ["ES2022", "DOM", "DOM.Iterable"], strict: true, noEmit: true, types: [] },
    files: [path.join(RAIZ, "atalho", "atalho.d.ts"), ...arquivos.map((a) => a.nome)],
  })
);

const tsc = process.argv[2] || path.join(RAIZ, "servicos", "assistente", "node_modules", ".bin", process.platform === "win32" ? "tsc.cmd" : "tsc");
const resultado =
  process.platform === "win32"
    ? spawnSync(`"${tsc}" -p "${pasta}"`, { encoding: "utf8", shell: true })
    : spawnSync(tsc, ["-p", pasta], { encoding: "utf8" });
const saida = `${resultado.stdout || ""}${resultado.stderr || ""}`;
await rm(pasta, { recursive: true, force: true });

if (resultado.status !== 0) {
  const porArquivo = new Map(arquivos.map((a) => [a.nome, a.origem]));
  console.error(saida.replace(/^.*?([\w-]+\.ts)\((\d+),(\d+)\)/gm, (_, nome, linha) => `${porArquivo.get(nome) || nome} (linha ${linha})`));
  console.error(`\n${arquivos.length} exemplos de TypeScript verificados: há erros.`);
  process.exit(1);
}
console.log(`${arquivos.length} exemplos de TypeScript compilam sem erros.`);
