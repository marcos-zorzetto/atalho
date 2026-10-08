#!/usr/bin/env node
/**
 * Robô de atualização da documentação do Atalho.
 *
 * 1. Lê os recursos do navegador usados por cada componente (campo "recursos").
 * 2. Baixa a versão mais recente do web-features, a base oficial que alimenta
 *    os selos "Baseline" do MDN, e compara com o retrato salvo em
 *    site/dados/baseline.js.
 * 3. Com --links, confere se cada link do MDN ainda funciona e se páginas que
 *    só existiam em inglês ganharam tradução para português.
 * 4. Escreve um relatório em Markdown e, no GitHub Actions, avisa se algo mudou
 *    (saída "mudou=true"), para o workflow abrir um pull request.
 *
 * Uso: node scripts/atualizar-documentacao.mjs [--links] [--relatorio caminho.md]
 */
import { readFile, writeFile, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { carregarDocs } from "./docs.mjs";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ARQUIVO_BASELINE = path.join(RAIZ, "site/dados/baseline.js");
const argumentos = process.argv.slice(2);
const checarLinks = argumentos.includes("--links");
const caminhoRelatorio = argumentos.includes("--relatorio")
  ? argumentos[argumentos.indexOf("--relatorio") + 1]
  : path.join(RAIZ, "relatorio-atualizacao.md");

const STATUS = { high: "amplo", low: "recente", false: "limitado" };
const NOMES_STATUS = {
  amplo: "disponível em todos os navegadores há mais de 2 anos",
  recente: "disponível em todos os navegadores atuais (recente)",
  limitado: "ainda não está em todos os navegadores",
  desconhecido: "não encontrado no web-features",
};

async function baixarJSON(url) {
  const resposta = await fetch(url, { headers: { "User-Agent": "atalho-robo-documentacao" } });
  if (!resposta.ok) throw new Error(`${url} respondeu ${resposta.status}`);
  return resposta.json();
}

async function lerRetratoAnterior() {
  try {
    const texto = await readFile(ARQUIVO_BASELINE, "utf8");
    const json = texto.slice(texto.indexOf("{"), texto.lastIndexOf("}") + 1);
    return JSON.parse(json);
  } catch {
    return { recursos: {} };
  }
}

async function statusDoLink(url) {
  try {
    const resposta = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "User-Agent": "atalho-robo-documentacao" } });
    return resposta.status;
  } catch {
    return 0;
  }
}

function linhaTabela(colunas) {
  return `| ${colunas.map((c) => String(c ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

async function principal() {
  const docs = await carregarDocs();
  const usadoPor = new Map();
  for (const componente of docs.componentes) {
    for (const recurso of componente.recursos || []) {
      if (!usadoPor.has(recurso)) usadoPor.set(recurso, []);
      usadoPor.get(recurso).push(componente.id);
    }
  }

  console.log(`Baixando web-features (${usadoPor.size} recursos monitorados)...`);
  const [pacote, dados] = await Promise.all([
    baixarJSON("https://unpkg.com/web-features@latest/package.json"),
    baixarJSON("https://unpkg.com/web-features@latest/data.json"),
  ]);

  const recursos = {};
  for (const id of Array.from(usadoPor.keys()).sort()) {
    let item = dados.features[id];
    if (item?.kind === "moved") item = dados.features[item.redirect_target];
    if (!item || item.kind === "split") {
      recursos[id] = { nome: id, status: "desconhecido" };
      continue;
    }
    recursos[id] = {
      nome: item.name,
      status: STATUS[String(item.status?.baseline)] || "limitado",
      desde: item.status?.baseline_low_date || null,
      amplamenteDesde: item.status?.baseline_high_date || null,
    };
  }

  const anterior = await lerRetratoAnterior();
  const mudancas = [];
  for (const [id, atual] of Object.entries(recursos)) {
    const antes = anterior.recursos?.[id];
    if (!antes) mudancas.push({ id, de: "(novo)", para: atual.status });
    else if (antes.status !== atual.status || antes.desde !== atual.desde || antes.amplamenteDesde !== atual.amplamenteDesde) {
      mudancas.push({ id, de: antes.status, para: atual.status });
    }
  }
  for (const id of Object.keys(anterior.recursos || {})) {
    if (!recursos[id]) mudancas.push({ id, de: anterior.recursos[id].status, para: "(não usado mais)" });
  }

  const linksQuebrados = [];
  const traducoesNovas = [];
  if (checarLinks) {
    const links = new Map();
    for (const componente of docs.componentes) {
      for (const link of componente.mdn || []) {
        if (!links.has(link.url)) links.set(link.url, { ...link, componentes: [] });
        links.get(link.url).componentes.push(componente.id);
      }
    }
    console.log(`Conferindo ${links.size} links do MDN...`);
    for (const link of links.values()) {
      const status = await statusDoLink(link.url);
      if (status !== 200) linksQuebrados.push({ ...link, status });
      if (link.idioma === "en" && status === 200) {
        const emPortugues = link.url.replace("/en-US/", "/pt-BR/");
        if ((await statusDoLink(emPortugues)) === 200) traducoesNovas.push({ ...link, emPortugues });
      }
    }
  }

  const houveMudanca = mudancas.length > 0 || linksQuebrados.length > 0 || traducoesNovas.length > 0;
  const hoje = new Date().toISOString().slice(0, 10);

  if (mudancas.length) {
    const retrato = { versao: pacote.version, verificadoEm: hoje, recursos };
    const conteudo = `/* Gerado por scripts/atualizar-documentacao.mjs a partir do web-features ${pacote.version}. Não edite à mão. */
window.ATALHO_BASELINE = ${JSON.stringify(retrato, null, 2)};
`;
    await writeFile(ARQUIVO_BASELINE, conteudo, "utf8");
  }

  const relatorio = [
    `# Verificação semanal da documentação (${hoje})`,
    "",
    `Fonte: web-features ${pacote.version} (os mesmos dados dos selos Baseline do MDN).`,
    `Recursos monitorados: ${usadoPor.size}. Componentes: ${docs.componentes.length}.`,
    "",
  ];

  if (!houveMudanca) relatorio.push("Nada mudou desde a última verificação.");

  if (mudancas.length) {
    relatorio.push("## Mudanças no suporte dos navegadores", "", linhaTabela(["Recurso", "Antes", "Agora", "Componentes afetados"]), "|---|---|---|---|");
    for (const m of mudancas) relatorio.push(linhaTabela([`\`${m.id}\``, m.de, m.para, (usadoPor.get(m.id) || []).join(", ")]));
    relatorio.push("", "Significado: " + Object.entries(NOMES_STATUS).map(([k, v]) => `**${k}** = ${v}`).join("; ") + ".", "");
  }

  if (linksQuebrados.length) {
    relatorio.push("## Links do MDN que não abrem mais", "", linhaTabela(["Link", "Status", "Componentes"]), "|---|---|---|");
    for (const l of linksQuebrados) relatorio.push(linhaTabela([`[${l.titulo}](${l.url})`, l.status || "sem resposta", l.componentes.join(", ")]));
    relatorio.push("");
  }

  if (traducoesNovas.length) {
    relatorio.push("## Páginas do MDN que ganharam tradução para português", "", linhaTabela(["Página", "Link em português", "Componentes"]), "|---|---|---|");
    for (const l of traducoesNovas) relatorio.push(linhaTabela([l.titulo, l.emPortugues, l.componentes.join(", ")]));
    relatorio.push("");
  }

  await writeFile(caminhoRelatorio, relatorio.join("\n"), "utf8");
  console.log(relatorio.join("\n"));

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `mudou=${houveMudanca}\nrelatorio=${caminhoRelatorio}\n`);
  }
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
