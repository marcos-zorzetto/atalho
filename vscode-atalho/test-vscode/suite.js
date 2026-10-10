"use strict";
/**
 * Testes dentro do VS Code de verdade (rodados por executar.js).
 * Cobrem: sem conta, senha errada, membro, Pro, todos os trechos inseridos
 * letra por letra, autocompletar, dicas, painel, barra de status, página nova,
 * sessão renovada, sessão revogada e sair.
 */
const vscode = require("vscode");
const assert = require("node:assert/strict");

const SERVIDOR = process.env.ATALHO_TESTE_SUPABASE;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const rotulo = (item) => (typeof item.label === "string" ? item.label : item.label.label);

async function controlar(rota, dados) {
  const r = await fetch(SERVIDOR + rota, { method: "POST", body: JSON.stringify(dados || {}) });
  return r.json();
}

async function documento(texto, linguagem = "html") {
  const doc = await vscode.workspace.openTextDocument({ language: linguagem, content: texto });
  await vscode.window.showTextDocument(doc);
  return doc;
}

async function sugestoes(doc, texto) {
  const fim = doc.positionAt(doc.getText().length);
  const lista = await vscode.commands.executeCommand("vscode.executeCompletionItemProvider", doc.uri, fim);
  return lista.items.filter((i) => texto === undefined || rotulo(i).startsWith(texto));
}

/** Fecha tudo sem perguntar "salvar?" (os documentos de teste não têm nome). */
async function fecharTudo() {
  for (let i = 0; i < 50 && vscode.window.visibleTextEditors.length; i++) {
    await vscode.commands.executeCommand("workbench.action.revertAndCloseActiveEditor");
  }
}

/** Insere o item num documento vazio e devolve o texto resultante. */
async function inserirEmVazio(api, item) {
  const editor = vscode.window.activeTextEditor;
  await editor.edit((e) => e.delete(new vscode.Range(0, 0, editor.document.lineCount, 0)));
  const resultado = await vscode.commands.executeCommand("atalho.inserirItem", item);
  return { resultado, texto: editor.document.getText() };
}

const normalizar = (t) => t.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trimEnd();

const TESTES = [];
const teste = (nome, f) => TESTES.push({ nome, f });

let api;

teste("ativa sem conta: tudo bloqueado, convite para entrar", async () => {
  const ext = vscode.extensions.getExtension("marcos-zorzetto.atalho");
  api = await ext.activate();
  assert.equal(api.estado.pessoa, null);
  assert.match(api.barra.text, /Atalho: entrar/);
  assert.deepEqual(await api.painel.getChildren(), []);
  const doc = await documento("<p>at-");
  const itens = await sugestoes(doc, "at");
  const nossos = itens.filter((i) => i.command && i.command.command === "atalho.entrar");
  assert.equal(nossos.length, 1, "um convite para entrar");
  assert.equal(itens.filter((i) => rotulo(i) === "at-modal").length, 0, "nenhum trecho sem conta");
  assert.equal(await vscode.commands.executeCommand("atalho.inserirItem", api.catalogo.TRECHOS_BASE[0]), "sem-conta");
  assert.equal(await vscode.commands.executeCommand("atalho.novaPagina"), undefined);
});

teste("senha errada: não entra e explica em português", async () => {
  assert.equal(await vscode.commands.executeCommand("atalho.entrar", "membro@teste.pt", "errada"), false);
  assert.match(api.ultimoErro(), /E-mail ou senha incorretos/);
  assert.equal(api.estado.pessoa, null);
  assert.equal(await vscode.commands.executeCommand("atalho.entrar", "ninguem@teste.pt", "x"), false);
});

teste("membro: entra, plano Membro, 20 componentes e 10 animações liberados", async () => {
  assert.equal(await vscode.commands.executeCommand("atalho.entrar", "membro@teste.pt", "certa"), true);
  assert.equal(api.estado.pessoa.email, "membro@teste.pt");
  assert.equal(api.estado.pro, false);
  assert.match(api.barra.text, /Atalho: Membro/);
  assert.equal(api.estado.avancados.filter((i) => i.liberado).length, 20);
  assert.equal(api.estado.animacoes.filter((i) => i.liberado).length, 10);
  const raiz = await api.painel.getChildren();
  assert.ok(raiz.some((n) => n.label === "Liberar tudo com o Pro"));
  const avancados = raiz.find((n) => n.label === "Componentes avançados");
  assert.equal(avancados.description, "20 de 119");
});

teste("membro: autocompletar mostra só o que o plano libera", async () => {
  await fecharTudo();
  const doc = await documento("<main>\n  at");
  const nomes = (await sugestoes(doc)).map(rotulo);
  assert.ok(nomes.includes("at-modal"));
  assert.ok(nomes.includes("at-tabela"));
  for (const i of api.estado.avancados.concat(api.estado.animacoes)) {
    assert.equal(nomes.includes(i.prefixo), i.liberado, `${i.prefixo} ${i.liberado ? "devia" : "não devia"} aparecer`);
  }
});

teste("membro: classes dentro de class=\"…\" e dica com link da documentação", async () => {
  await fecharTudo();
  const doc = await documento('<button class="at-botao at-');
  const nomes = (await sugestoes(doc)).map(rotulo);
  assert.ok(nomes.includes("at-primario"));
  assert.ok(nomes.length >= api.catalogo.CLASSES.length);
  const outro = await documento('<div class="at-modal"></div>');
  const dicas = await vscode.commands.executeCommand("vscode.executeHoverProvider", outro.uri, new vscode.Position(0, 15));
  const texto = dicas.flatMap((d) => d.contents.map((c) => c.value || c)).join("\n");
  assert.match(texto, /at-modal/);
  assert.match(texto, /componentes\/modal\//);
});

teste("membro: item do Pro fica bloqueado", async () => {
  await fecharTudo();
  await documento("");
  const bloqueado = api.estado.avancados.find((i) => !i.liberado);
  const { resultado, texto } = await inserirEmVazio(api, bloqueado);
  assert.equal(resultado, "bloqueado");
  assert.equal(texto, "");
});

teste("membro: TODOS os trechos grátis entram no editor exatamente como são", async () => {
  await fecharTudo();
  await documento("");
  for (const t of api.catalogo.TRECHOS_BASE) {
    const { resultado, texto } = await inserirEmVazio(api, { ...t, liberado: true });
    assert.equal(resultado, "inserido", t.prefixo);
    assert.equal(normalizar(texto), normalizar(t.corpo), `${t.prefixo} foi alterado ao inserir`);
  }
});

teste("sem editor aberto: cria uma página nova com o Atalho e o trecho", async () => {
  await fecharTudo();
  const item = api.estado.avancados.find((i) => i.liberado);
  assert.equal(await vscode.commands.executeCommand("atalho.inserirItem", item), "inserido");
  await espera(200);
  const texto = vscode.window.activeTextEditor.document.getText();
  assert.match(texto, /<!doctype html>/);
  assert.match(texto, /cdn\.jsdelivr\.net\/gh\/marcos-zorzetto\/atalho@1\/atalho\/atalho\.css/);
  const linhas = item.corpo.split("\n").map((l) => l.trim()).filter(Boolean);
  assert.ok(linhas.every((l) => texto.includes(l)), "o trecho entrou inteiro na página");
  assert.equal(vscode.window.activeTextEditor.document.languageId, "html");
});

teste("nova página: HTML completo com CSS e JS do Atalho", async () => {
  const doc = await vscode.commands.executeCommand("atalho.novaPagina");
  assert.match(doc.getText(), /<html lang="pt/);
  assert.match(doc.getText(), /atalho\.js" defer/);
});

teste("renovação: 'Atualizar' renova a sessão sem pedir senha", async () => {
  await vscode.commands.executeCommand("atalho.atualizar");
  assert.equal(api.estado.pessoa.email, "membro@teste.pt");
  const pedidos = await controlar("/teste/pedidos");
  assert.ok(pedidos.some((p) => p.includes("grant_type=refresh_token")));
});

teste("sair: volta a bloquear tudo", async () => {
  await vscode.commands.executeCommand("atalho.sair");
  assert.equal(api.estado.pessoa, null);
  assert.match(api.barra.text, /entrar/);
  const doc = await documento("at-");
  const itens = await sugestoes(doc, "at");
  assert.ok(itens.some((i) => i.command && i.command.command === "atalho.entrar"), "convite para entrar de volta");
  const trechos = new Set(api.catalogo.TRECHOS_BASE.map((t) => t.prefixo));
  assert.equal(itens.filter((i) => trechos.has(rotulo(i))).length, 0, "nenhum trecho depois de sair");
});

teste("Pro: tudo liberado (119 componentes e 48 animações)", async () => {
  assert.equal(await vscode.commands.executeCommand("atalho.entrar", "pro@teste.pt", "certa"), true);
  assert.equal(api.estado.pro, true);
  assert.match(api.barra.text, /Atalho: Pro/);
  assert.equal(api.estado.avancados.filter((i) => i.liberado).length, api.estado.avancados.length);
  assert.equal(api.estado.animacoes.filter((i) => i.liberado).length, api.estado.animacoes.length);
  const raiz = await api.painel.getChildren();
  assert.ok(!raiz.some((n) => n.label === "Liberar tudo com o Pro"));
});

teste("Pro: TODOS os componentes avançados e animações entram no editor exatamente como são", async () => {
  await fecharTudo();
  await documento("");
  for (const i of api.estado.avancados.concat(api.estado.animacoes)) {
    const { resultado, texto } = await inserirEmVazio(api, i);
    assert.equal(resultado, "inserido", i.prefixo);
    assert.equal(normalizar(texto), normalizar(i.corpo), `${i.prefixo} foi alterado ao inserir`);
  }
});

teste("Pro: autocompletar funciona também em PHP", async () => {
  await fecharTudo();
  const doc = await documento("<?php echo 1; ?>\n<div>\n  atx-", "php");
  const nomes = (await sugestoes(doc)).map(rotulo);
  assert.ok(nomes.includes("atx-hero-gradiente"));
});

teste("sessão revogada (conta excluída ou senha trocada): sai sozinho", async () => {
  await controlar("/teste/revogar", { email: "pro@teste.pt" });
  await vscode.commands.executeCommand("atalho.atualizar");
  assert.equal(api.estado.pessoa, null);
  assert.match(api.barra.text, /entrar/);
});

async function run() {
  const falhas = [];
  for (const { nome, f } of TESTES) {
    const inicio = Date.now();
    try {
      await f();
      console.log(`✔ ${nome} (${Date.now() - inicio} ms)`);
    } catch (erro) {
      console.log(`✖ ${nome}\n  ${erro.message}`);
      falhas.push(nome);
    }
  }
  await fecharTudo();
  console.log(`\n${TESTES.length - falhas.length} de ${TESTES.length} testes da extensão passaram.`);
  // O executar.js lê este arquivo: sem ele, o VS Code caiu antes de terminar (e não é falha da extensão)
  if (process.env.ATALHO_TESTE_RESULTADO) require("node:fs").writeFileSync(process.env.ATALHO_TESTE_RESULTADO, JSON.stringify({ total: TESTES.length, falhas }));
  if (falhas.length) throw new Error(`${falhas.length} teste(s) falharam`);
}

module.exports = { run };
