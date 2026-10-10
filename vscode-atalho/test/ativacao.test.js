"use strict";
/**
 * Ativa a extensão com um VS Code de mentira (só o que ela usa) para pegar
 * erros de execução: comandos registrados, autocompletar com e sem conta,
 * dica ao passar o mouse e painel lateral.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

const registrados = { comandos: {}, autocompletar: null, dicas: null, painel: null, contexto: {}, mensagens: [] };

class EventEmitter {
  constructor() { this.ouvintes = []; this.event = (f) => this.ouvintes.push(f); }
  fire(v) { this.ouvintes.forEach((f) => f(v)); }
  dispose() {}
}
class SnippetString { constructor(v) { this.value = v; } }
class MarkdownString {
  constructor(v = "") { this.value = v; }
  appendMarkdown(v) { this.value += v; return this; }
  appendCodeblock(v) { this.value += "\n```\n" + v + "\n```\n"; return this; }
}
class CompletionItem { constructor(label, kind) { this.label = label; this.kind = kind; } }
class TreeItem { constructor(label, estado) { this.label = label; this.collapsibleState = estado; } }

const vscodeFalso = {
  EventEmitter, SnippetString, MarkdownString, CompletionItem, TreeItem,
  ThemeIcon: class { constructor(id) { this.id = id; } },
  Hover: class { constructor(conteudo, intervalo) { this.contents = conteudo; this.range = intervalo; } },
  CompletionItemKind: { Snippet: 1, Value: 2, Event: 3 },
  TreeItemCollapsibleState: { None: 0, Collapsed: 1 },
  StatusBarAlignment: { Right: 2 },
  ProgressLocation: { Notification: 15, Window: 10 },
  QuickPickItemKind: { Separator: -1 },
  Uri: { parse: (u) => ({ toString: () => u }) },
  env: { openExternal: async () => true },
  commands: {
    registerCommand: (id, f) => ((registrados.comandos[id] = f), { dispose() {} }),
    executeCommand: async (id, chave, valor) => { if (id === "setContext") registrados.contexto[chave] = valor; },
  },
  languages: {
    registerCompletionItemProvider: (_l, p) => ((registrados.autocompletar = p), { dispose() {} }),
    registerHoverProvider: (_l, p) => ((registrados.dicas = p), { dispose() {} }),
  },
  window: {
    createStatusBarItem: () => ({ show() {}, dispose() {} }),
    registerTreeDataProvider: (_id, p) => ((registrados.painel = p), { dispose() {} }),
    showInformationMessage: async (m) => { registrados.mensagens.push(m); },
    showWarningMessage: async (m) => { registrados.mensagens.push(m); },
    showErrorMessage: async (m) => { registrados.mensagens.push(m); },
    withProgress: async (_o, f) => f(),
    activeTextEditor: undefined,
  },
  workspace: {},
};

const resolverOriginal = Module._resolveFilename;
Module._resolveFilename = function (pedido, ...resto) {
  return pedido === "vscode" ? "vscode" : resolverOriginal.call(this, pedido, ...resto);
};
require.cache.vscode = { id: "vscode", filename: "vscode", loaded: true, exports: vscodeFalso };

const documento = (linha) => ({
  lineAt: () => ({ text: linha }),
  getWordRangeAtPosition: (pos, re) => {
    const m = [...linha.matchAll(new RegExp(re.source, "g"))].find((x) => x.index <= pos.character && pos.character <= x.index + x[0].length);
    return m ? { inicio: m.index, fim: m.index + m[0].length } : undefined;
  },
  getText: (r) => linha.slice(r.inicio, r.fim),
});
const no = (texto) => ({ character: texto.length });

function supabaseFalso(pro) {
  return async (url) => {
    const caminho = new URL(url).pathname + new URL(url).search;
    let dados = null;
    if (caminho.includes("grant_type")) dados = { access_token: "a", refresh_token: "r", expires_in: 3600, user: { email: "membro@exemplo.com" } };
    else if (caminho.includes("tem_pro")) dados = pro;
    else if (caminho.includes("eh_admin")) dados = false;
    else if (caminho.includes("conteudos")) dados = [{ id: "comp-hero-gradiente", tipo: "componente", html: "<section class=\"cx-hg\">${x}</section>" }, { id: "anim-surgir", tipo: "animacao", html: "<style>.surgir{}</style>" }];
    return { ok: true, status: 200, text: async () => JSON.stringify(dados) };
  };
}

function contextoFalso(segredo) {
  const segredos = new Map(segredo ? [["atalho.renovacao", segredo]] : []);
  return {
    subscriptions: [],
    secrets: { get: async (k) => segredos.get(k), store: async (k, v) => void segredos.set(k, v), delete: async (k) => void segredos.delete(k) },
  };
}

test("sem conta: tudo bloqueado, só o convite para entrar", async () => {
  const extensao = require("../extension.js");
  globalThis.fetch = supabaseFalso(false);
  await extensao.activate(contextoFalso());
  for (const id of ["atalho.entrar", "atalho.sair", "atalho.inserir", "atalho.novaPagina", "atalho.atualizar", "atalho.assinarPro", "atalho.inserirItem", "atalho.criarConta", "atalho.documentacao"]) {
    assert.equal(typeof registrados.comandos[id], "function", id);
  }
  assert.equal(registrados.contexto["atalho.conectado"], false);
  const itens = registrados.autocompletar.provideCompletionItems(documento("<p>at-"), no("<p>at-"));
  assert.equal(itens.length, 1);
  assert.equal(itens[0].command.command, "atalho.entrar");
  assert.deepEqual(registrados.autocompletar.provideCompletionItems(documento("<p>ola"), no("<p>ola")), []);
  assert.deepEqual(registrados.painel.getChildren(), []);
});

test("com conta (membro): trechos, classes, dica e painel com cadeados", async () => {
  const extensao = require("../extension.js");
  globalThis.fetch = supabaseFalso(false);
  await extensao.activate(contextoFalso("token-guardado"));
  assert.equal(registrados.contexto["atalho.conectado"], true);

  const trechos = registrados.autocompletar.provideCompletionItems(documento("  at-"), no("  at-"));
  const rotulos = trechos.map((t) => t.label.label);
  assert.ok(rotulos.includes("at-modal"));
  assert.ok(rotulos.includes("atx-hero-gradiente"));
  assert.ok(rotulos.includes("anim-surgir"));
  assert.equal(rotulos.filter((r) => r.startsWith("atx-")).length, 1, "só aparece o que o banco liberou");
  const hero = trechos.find((t) => t.label.label === "atx-hero-gradiente");
  assert.equal(hero.insertText.value, '<section class="cx-hg">\\${x\\}</section>');

  const linha = '<button class="at-botao at-pri';
  const classes = registrados.autocompletar.provideCompletionItems(documento(linha), no(linha));
  assert.ok(classes.some((c) => c.label === "at-primario"));

  const dica = registrados.dicas.provideHover(documento('<div class="at-modal">'), { character: 15 });
  assert.match(dica.contents.value, /componentes\/modal\//);

  const [contaNo, proNo, base, avancados, animacoes] = registrados.painel.getChildren();
  assert.match(contaNo.description, /Membro/);
  assert.equal(contaNo.command, undefined, "clicar no e-mail não abre o site");
  assert.equal(proNo.command.command, "atalho.assinarPro");
  assert.equal(base.description, String(require("../dados/trechos-base.json").length));
  assert.match(avancados.description, /^1 de 119$/);
  assert.match(animacoes.description, /^1 de 48$/);
  const folhas = avancados.filhos.flatMap((c) => c.filhos);
  assert.equal(folhas.find((f) => f.label === "Topo com gradiente e chamada").iconPath.id, "symbol-snippet");
  assert.ok(folhas.some((f) => f.iconPath.id === "lock"));
});
