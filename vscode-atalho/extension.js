/**
 * Extensão Atalho para o VS Code.
 *
 * Tudo precisa de uma conta (grátis) do Atalho:
 *   - conta grátis: os trechos da biblioteca (at-…), o autocompletar das classes
 *     e o que o site libera para membros (20 componentes avançados e 10 animações);
 *   - Pro: todos os componentes avançados (atx-…) e todas as animações (anim-…).
 * O banco (RLS) decide o que cada pessoa recebe, exatamente como no site.
 */
"use strict";

const vscode = require("vscode");
const { Conta } = require("./lib/conta");
const { escaparSnippet, classeNoCursor, palavraNoCursor, paginaInicial, montarAvancados, nomePlano } = require("./lib/trechos");

const CONFIG = require("./dados/config.json");
const TRECHOS_BASE = require("./dados/trechos-base.json");
const CLASSES = require("./dados/classes.json");
const CATALOGO_COMPONENTES = require("./dados/componentes-avancados.json");
const CATALOGO_ANIMACOES = require("./dados/animacoes.json");

const LINGUAGENS = ["html", "php", "vue", "svelte", "astro", "handlebars", "django-html", "blade", "erb"].map((language) => ({ language }));
const link = (caminho) => vscode.Uri.parse(CONFIG.site + caminho);

/** Estado da sessão, compartilhado pelo autocompletar, painel e barra de status. */
const estado = { pessoa: null, pro: false, admin: false, avancados: [], animacoes: [] };
const aoMudar = new vscode.EventEmitter();

let conta;

async function atualizarEstado(sessao) {
  estado.pessoa = sessao ? { email: sessao.email } : null;
  estado.pro = false;
  estado.admin = false;
  let linhas = [];
  if (sessao) {
    try {
      [estado.pro, estado.admin, linhas] = await Promise.all([conta.temPro(), conta.ehAdmin(), conta.conteudos()]);
    } catch (erro) {
      vscode.window.showWarningMessage(`Atalho: ${erro.message}`);
    }
  }
  estado.avancados = montarAvancados(CATALOGO_COMPONENTES, linhas || [], "componente");
  estado.animacoes = montarAvancados(CATALOGO_ANIMACOES, linhas || [], "animacao");
  await vscode.commands.executeCommand("setContext", "atalho.conectado", Boolean(estado.pessoa));
  aoMudar.fire();
}

/* --------------------------------------------------------------------------
   Comandos
   -------------------------------------------------------------------------- */

async function entrar() {
  const escolha = await vscode.window.showQuickPick(
    [
      { label: "$(account) Já tenho conta", description: "entrar com e-mail e senha", acao: "entrar" },
      { label: "$(add) Criar conta grátis", description: "abre o site do Atalho", acao: "criar" },
    ],
    { title: "Atalho", placeHolder: "A extensão é grátis com uma conta do Atalho" },
  );
  if (!escolha) return;
  if (escolha.acao === "criar") return criarConta();

  const email = await vscode.window.showInputBox({
    title: "Entrar no Atalho (1 de 2)",
    prompt: "Seu e-mail da conta do Atalho",
    placeHolder: "voce@email.com",
    ignoreFocusOut: true,
    validateInput: (v) => (/^\S+@\S+\.\S+$/.test(v.trim()) ? null : "Digite um e-mail válido."),
  });
  if (!email) return;
  const senha = await vscode.window.showInputBox({ title: "Entrar no Atalho (2 de 2)", prompt: "Sua senha", password: true, ignoreFocusOut: true });
  if (!senha) return;

  await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: "Atalho: entrando…" }, async () => {
    try {
      const sessao = await conta.entrar(email.trim(), senha);
      await atualizarEstado(sessao);
      const liberados = estado.avancados.filter((i) => i.liberado).length + estado.animacoes.filter((i) => i.liberado).length;
      const acoes = estado.pro || estado.admin ? [] : ["Conhecer o Pro"];
      vscode.window
        .showInformationMessage(`Bem-vindo(a)! Plano ${nomePlano(estado)}: ${TRECHOS_BASE.length} trechos grátis e ${liberados} avançados liberados. Digite "at-" num arquivo HTML.`, ...acoes)
        .then((r) => r && assinarPro());
    } catch (erro) {
      const r = await vscode.window.showErrorMessage(`Atalho: ${erro.message}`, "Tentar de novo", "Esqueci a senha");
      if (r === "Tentar de novo") entrar();
      if (r === "Esqueci a senha") vscode.env.openExternal(link("conta/"));
    }
  });
}

const criarConta = () => vscode.env.openExternal(link("conta/?criar"));
const assinarPro = () => vscode.env.openExternal(link("pro/"));

async function sair() {
  await conta.sair();
  await atualizarEstado(null);
  vscode.window.showInformationMessage("Atalho: você saiu da sua conta.");
}

/** Insere o código no editor aberto; sem editor, cria uma página nova já com o Atalho. */
async function inserirCodigo(corpo) {
  const editor = vscode.window.activeTextEditor;
  if (editor) return editor.insertSnippet(new vscode.SnippetString(escaparSnippet(corpo)));
  const documento = await vscode.workspace.openTextDocument({ language: "html", content: paginaInicial(CONFIG.cdn, corpo) });
  await vscode.window.showTextDocument(documento);
}

async function exigirConta() {
  if (estado.pessoa) return true;
  const r = await vscode.window.showInformationMessage("Os trechos do Atalho são liberados com uma conta grátis.", "Entrar", "Criar conta grátis");
  if (r === "Entrar") entrar();
  if (r === "Criar conta grátis") criarConta();
  return false;
}

async function inserirItem(item) {
  if (!(await exigirConta())) return;
  if (item.corpo) return inserirCodigo(item.corpo);
  const r = await vscode.window.showInformationMessage(`"${item.nome}" faz parte do Atalho Pro (todos os componentes e animações, com atualizações).`, "Conhecer o Pro", "Já assinei: atualizar");
  if (r === "Conhecer o Pro") assinarPro();
  if (r === "Já assinei: atualizar") atualizar();
}

/** Busca rápida em tudo (Ctrl+Shift+P → "Atalho: Inserir componente"). */
async function inserir() {
  if (!(await exigirConta())) return;
  const base = TRECHOS_BASE.map((t) => ({ label: t.nome, description: t.prefixo, detail: `${t.categoria} · ${t.resumo}`, item: t }));
  const avancados = [...estado.avancados, ...estado.animacoes].map((i) => ({
    label: `${i.liberado ? "" : "$(lock) "}${i.nome}`,
    description: `${i.prefixo} · ${i.rotuloNivel}`,
    detail: `${i.tipo === "animacao" ? "Animação" : "Avançado"} · ${i.categoriaNome} · ${i.descricao}`,
    item: i,
  }));
  const escolha = await vscode.window.showQuickPick(
    [{ label: "Avançados e animações", kind: vscode.QuickPickItemKind.Separator }, ...avancados, { label: "Biblioteca grátis", kind: vscode.QuickPickItemKind.Separator }, ...base],
    { title: "Atalho: inserir componente", placeHolder: "Busque em português: modal, carrinho, agenda, entrada suave…", matchOnDescription: true, matchOnDetail: true },
  );
  if (escolha) inserirItem(escolha.item);
}

async function novaPagina() {
  if (!(await exigirConta())) return;
  const documento = await vscode.workspace.openTextDocument({ language: "html", content: paginaInicial(CONFIG.cdn, "<h1>Olá!</h1>") });
  await vscode.window.showTextDocument(documento);
}

async function atualizar() {
  await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: "Atalho: atualizando" }, async () => {
    await atualizarEstado(conta.sessao ? await conta.restaurar() : null);
  });
}

/* --------------------------------------------------------------------------
   Autocompletar e dicas
   -------------------------------------------------------------------------- */

function itemTrecho(prefixo, nome, detalhe, corpo, ordem) {
  const item = new vscode.CompletionItem({ label: prefixo, description: nome }, vscode.CompletionItemKind.Snippet);
  item.insertText = new vscode.SnippetString(escaparSnippet(corpo));
  item.detail = detalhe;
  item.documentation = new vscode.MarkdownString().appendCodeblock(corpo.length > 1500 ? corpo.slice(0, 1500) + "\n…" : corpo, "html");
  item.sortText = ordem + prefixo;
  return item;
}

const autocompletar = {
  provideCompletionItems(documento, posicao) {
    const linhaAntes = documento.lineAt(posicao).text.slice(0, posicao.character);
    const classe = classeNoCursor(linhaAntes);

    if (!estado.pessoa) {
      const palavra = classe ?? palavraNoCursor(linhaAntes);
      if (!/^at/.test(palavra)) return [];
      const convite = new vscode.CompletionItem({ label: palavra || "at-", description: "Entre (grátis) para liberar o Atalho" }, vscode.CompletionItemKind.Event);
      convite.insertText = "";
      convite.filterText = palavra;
      convite.command = { command: "atalho.entrar", title: "Entrar" };
      convite.documentation = new vscode.MarkdownString("Crie sua conta grátis no Atalho para liberar os trechos, as classes e os componentes avançados.");
      return [convite];
    }

    if (classe !== null) {
      return CLASSES.map((c) => {
        const item = new vscode.CompletionItem(c.nome, vscode.CompletionItemKind.Value);
        if (c.titulo) item.detail = `Atalho · ${c.titulo}`;
        return item;
      });
    }

    const palavra = palavraNoCursor(linhaAntes);
    if (!/^(at|an)/i.test(palavra)) return [];
    const itens = TRECHOS_BASE.map((t) => itemTrecho(t.prefixo, t.nome, `Atalho · ${t.categoria}`, t.corpo, "1"));
    for (const i of [...estado.avancados, ...estado.animacoes]) {
      if (i.liberado) itens.push(itemTrecho(i.prefixo, i.nome, `Atalho ${i.rotuloNivel} · ${i.categoriaNome}`, i.corpo, i.tipo === "animacao" ? "3" : "2"));
    }
    return itens;
  },
};

const dicas = {
  provideHover(documento, posicao) {
    const intervalo = documento.getWordRangeAtPosition(posicao, /at-[a-z0-9-]+/);
    if (!intervalo) return;
    const nome = documento.getText(intervalo);
    const classe = CLASSES.find((c) => c.nome === nome);
    if (!classe) return;
    const texto = new vscode.MarkdownString(`**${nome}** · classe do Atalho`);
    if (classe.componente) texto.appendMarkdown(`\n\nUsada em [${classe.titulo}](${CONFIG.site}componentes/${classe.componente}/) (documentação com exemplos).`);
    return new vscode.Hover(texto, intervalo);
  },
};

/* --------------------------------------------------------------------------
   Painel lateral
   -------------------------------------------------------------------------- */

class Painel {
  constructor() {
    this.onDidChangeTreeData = aoMudar.event;
  }

  getTreeItem(no) {
    return no;
  }

  getChildren(no) {
    if (!estado.pessoa) return [];
    if (!no) {
      const tudo = estado.pro || estado.admin;
      const conta = new vscode.TreeItem(`${estado.pessoa.email}`, vscode.TreeItemCollapsibleState.None);
      conta.description = estado.admin ? "Administrador" : `Plano ${nomePlano(estado)}`;
      conta.iconPath = new vscode.ThemeIcon(tudo ? "star-full" : "account");
      conta.tooltip = tudo ? "Tudo liberado." : "Conta grátis: biblioteca inteira, 20 componentes avançados e 10 animações.";
      const nos = [conta];
      if (!tudo) {
        const pro = new vscode.TreeItem("Liberar tudo com o Pro", vscode.TreeItemCollapsibleState.None);
        pro.iconPath = new vscode.ThemeIcon("star-empty");
        pro.command = { command: "atalho.assinarPro", title: "Conhecer o Pro" };
        pro.tooltip = "Abre os planos no site do Atalho.";
        nos.push(pro);
      }
      return [
        ...nos,
        grupo("Biblioteca grátis", TRECHOS_BASE.map((t) => ({ ...t, liberado: true, categoriaNome: t.categoria, descricao: t.resumo }))),
        grupo("Componentes avançados", estado.avancados),
        grupo("Animações", estado.animacoes),
      ];
    }
    return no.filhos || [];
  }
}

function grupo(titulo, itens) {
  const liberados = itens.filter((i) => i.liberado).length;
  const no = new vscode.TreeItem(titulo, vscode.TreeItemCollapsibleState.Collapsed);
  no.description = liberados === itens.length ? `${itens.length}` : `${liberados} de ${itens.length}`;
  const categorias = [...new Set(itens.map((i) => i.categoriaNome))];
  no.filhos = categorias.map((nome) => {
    const daCategoria = itens.filter((i) => i.categoriaNome === nome);
    const c = new vscode.TreeItem(nome, vscode.TreeItemCollapsibleState.Collapsed);
    c.description = `${daCategoria.length}`;
    c.filhos = daCategoria.map(folha);
    return c;
  });
  return no;
}

function folha(item) {
  const no = new vscode.TreeItem(item.nome, vscode.TreeItemCollapsibleState.None);
  no.description = item.liberado ? item.prefixo : `${item.rotuloNivel || "Pro"}`;
  no.tooltip = new vscode.MarkdownString(`**${item.nome}**\n\n${item.descricao || ""}\n\n${item.liberado ? `Clique para inserir · ou digite \`${item.prefixo}\`` : "🔒 Disponível no Atalho Pro"}`);
  no.iconPath = new vscode.ThemeIcon(item.liberado ? (item.tipo === "animacao" ? "sparkle" : "symbol-snippet") : "lock");
  no.command = { command: "atalho.inserirItem", title: "Inserir", arguments: [item] };
  return no;
}

/* --------------------------------------------------------------------------
   Ativação
   -------------------------------------------------------------------------- */

async function activate(contexto) {
  const CHAVE = "atalho.renovacao";
  conta = new Conta({
    url: CONFIG.supabase.url,
    chavePublica: CONFIG.supabase.chavePublica,
    cofre: {
      ler: () => contexto.secrets.get(CHAVE),
      gravar: (valor) => contexto.secrets.store(CHAVE, valor),
      apagar: () => contexto.secrets.delete(CHAVE),
    },
  });

  const barra = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  const desenharBarra = () => {
    barra.text = `$(zap) Atalho: ${nomePlano(estado)}`;
    barra.tooltip = estado.pessoa ? `${estado.pessoa.email} · clique para buscar um componente` : "Entre (grátis) para liberar os trechos do Atalho";
    barra.command = estado.pessoa ? "atalho.inserir" : "atalho.entrar";
    barra.show();
  };
  aoMudar.event(desenharBarra);
  desenharBarra();

  contexto.subscriptions.push(
    barra,
    aoMudar,
    vscode.commands.registerCommand("atalho.entrar", entrar),
    vscode.commands.registerCommand("atalho.criarConta", criarConta),
    vscode.commands.registerCommand("atalho.sair", sair),
    vscode.commands.registerCommand("atalho.assinarPro", assinarPro),
    vscode.commands.registerCommand("atalho.inserir", inserir),
    vscode.commands.registerCommand("atalho.inserirItem", inserirItem),
    vscode.commands.registerCommand("atalho.novaPagina", novaPagina),
    vscode.commands.registerCommand("atalho.atualizar", atualizar),
    vscode.commands.registerCommand("atalho.documentacao", () => vscode.env.openExternal(link(""))),
    vscode.languages.registerCompletionItemProvider(LINGUAGENS, autocompletar, "-", '"', "'", " "),
    vscode.languages.registerHoverProvider(LINGUAGENS, dicas),
    vscode.window.registerTreeDataProvider("atalho.painel", new Painel()),
  );

  await atualizarEstado(await conta.restaurar());
}

function deactivate() {}

module.exports = { activate, deactivate };
