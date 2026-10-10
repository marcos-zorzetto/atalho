"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { escaparSnippet, classeNoCursor, palavraNoCursor, paginaInicial, montarAvancados, nomePlano } = require("../lib/trechos");
const { Conta } = require("../lib/conta");

const CONFIG = require("../dados/config.json");
const TRECHOS = require("../dados/trechos-base.json");
const CLASSES = require("../dados/classes.json");
const COMPONENTES = require("../dados/componentes-avancados.json");
const ANIMACOES = require("../dados/animacoes.json");

test("dados: só a chave publicável, prefixos únicos e catálogos completos", () => {
  assert.match(CONFIG.supabase.chavePublica, /^sb_publishable_/);
  assert.doesNotMatch(JSON.stringify(CONFIG), /sb_secret_|service_role/);
  const prefixos = TRECHOS.map((t) => t.prefixo);
  assert.equal(new Set(prefixos).size, prefixos.length);
  assert.ok(prefixos.every((p) => /^at-[a-z0-9-]+$/.test(p)));
  assert.ok(TRECHOS.length >= 70);
  assert.ok(CLASSES.length > 300 && CLASSES.every((c) => c.nome.startsWith("at-")));
  assert.ok(COMPONENTES.itens.length >= 100);
  assert.ok(ANIMACOES.itens.length >= 48);
  for (const nivel of ["publico", "membro"]) assert.ok(COMPONENTES.itens.some((i) => i.nivel === nivel));
});

test("escaparSnippet protege $, } e \\", () => {
  assert.equal(escaparSnippet('a ${b} \\c $1'), "a \\${b\\} \\\\c \\$1");
});

test("classeNoCursor só reconhece dentro de class=\"…\"", () => {
  assert.equal(classeNoCursor('<div class="at-botao at-pri'), "at-pri");
  assert.equal(classeNoCursor("<div className='at-"), "at-");
  assert.equal(classeNoCursor('<div class="at-botao '), "");
  assert.equal(classeNoCursor('<div class="x">at-'), null);
  assert.equal(classeNoCursor("at-modal"), null);
  assert.equal(palavraNoCursor("  <p>at-mod"), "at-mod");
});

test("paginaInicial inclui o CSS e o JS da CDN e o conteúdo recuado", () => {
  const html = paginaInicial("https://cdn.exemplo/atalho", "<h1>Oi</h1>\n<p>x</p>");
  assert.match(html, /href="https:\/\/cdn.exemplo\/atalho\/atalho.css"/);
  assert.match(html, /src="https:\/\/cdn.exemplo\/atalho\/atalho.js" defer/);
  assert.match(html, /\n    <h1>Oi<\/h1>\n    <p>x<\/p>\n/);
});

test("montarAvancados libera só o que o banco mandou", () => {
  const linhas = [
    { id: "comp-hero-gradiente", tipo: "componente", html: "<section>oi</section>" },
    { id: "anim-surgir", tipo: "animacao", html: "<style></style>" },
  ];
  const comps = montarAvancados(COMPONENTES, linhas, "componente");
  const hero = comps.find((c) => c.id === "hero-gradiente");
  assert.equal(hero.liberado, true);
  assert.equal(hero.prefixo, "atx-hero-gradiente");
  assert.equal(hero.corpo, "<section>oi</section>");
  assert.equal(comps.filter((c) => c.liberado).length, 1);
  const anims = montarAvancados(ANIMACOES, linhas, "animacao");
  assert.equal(anims.find((a) => a.id === "surgir").prefixo, "anim-surgir");
  assert.equal(anims.filter((a) => a.liberado).length, 1);
  assert.equal(nomePlano({ pessoa: null }), "entrar");
  assert.equal(nomePlano({ pessoa: {}, pro: false }), "Membro");
  assert.equal(nomePlano({ pessoa: {}, pro: true }), "Pro");
  assert.equal(nomePlano({ pessoa: {}, pro: false, admin: true }), "Admin");
});

/** Supabase de mentira: registra os pedidos e responde conforme a rota. */
function servidor(rotas) {
  const pedidos = [];
  const f = async (url, opcoes) => {
    pedidos.push({ url, ...opcoes, corpo: opcoes.body && JSON.parse(opcoes.body) });
    const caminho = new URL(url).pathname + new URL(url).search;
    const [status, dados] = (rotas[Object.keys(rotas).find((r) => caminho.startsWith(r))] || (() => [404, {}]))(opcoes);
    return { ok: status < 300, status, text: async () => JSON.stringify(dados) };
  };
  return { f, pedidos };
}

function cofre(inicial) {
  let valor = inicial;
  return { ler: async () => valor, gravar: async (v) => (valor = v), apagar: async () => (valor = undefined), get valor() { return valor; } };
}

const SESSAO = { access_token: "acesso-1", refresh_token: "renova-1", expires_in: 3600, user: { email: "a@b.com" } };

test("Conta: entra, guarda só o refresh token e pede conteúdos com o token", async () => {
  const { f, pedidos } = servidor({
    "/auth/v1/token?grant_type=password": () => [200, SESSAO],
    "/rest/v1/rpc/tem_pro": () => [200, false],
    "/rest/v1/conteudos": () => [200, [{ id: "comp-x", tipo: "componente", html: "" }]],
  });
  const c = cofre();
  const conta = new Conta({ url: "https://x.supabase.co/", chavePublica: "sb_publishable_teste", cofre: c, fetch: f });
  const sessao = await conta.entrar("a@b.com", "segredo");
  assert.equal(sessao.email, "a@b.com");
  assert.equal(c.valor, "renova-1");
  assert.equal(await conta.temPro(), false);
  assert.equal((await conta.conteudos()).length, 1);
  assert.equal(pedidos[0].headers.apikey, "sb_publishable_teste");
  assert.equal(pedidos[0].headers.Authorization, undefined);
  assert.equal(pedidos[2].headers.Authorization, "Bearer acesso-1");
  assert.match(pedidos[2].url, /tipo=in\.\(componente,animacao\)/);
});

test("Conta: traduz erros e esquece token recusado", async () => {
  const { f } = servidor({
    "/auth/v1/token?grant_type=password": () => [400, { error_code: "invalid_credentials" }],
    "/auth/v1/token?grant_type=refresh_token": () => [400, { error_code: "refresh_token_not_found", msg: "Invalid Refresh Token" }],
  });
  const c = cofre("velho");
  const conta = new Conta({ url: "https://x.supabase.co", chavePublica: "k", cofre: c, fetch: f });
  await assert.rejects(conta.entrar("a@b.com", "errada"), /E-mail ou senha incorretos/);
  assert.equal(await conta.restaurar(), null);
  assert.equal(c.valor, undefined);
});

test("Conta: sem internet mantém o token para a próxima vez", async () => {
  const c = cofre("guardado");
  const conta = new Conta({ url: "https://x.supabase.co", chavePublica: "k", cofre: c, fetch: async () => { throw new TypeError("fetch failed"); } });
  assert.equal(await conta.restaurar(), null);
  assert.equal(c.valor, "guardado");
});

test("Conta: renova o token perto de expirar e sair apaga tudo", async () => {
  let agora = 0;
  const { f, pedidos } = servidor({
    "/auth/v1/token?grant_type=password": () => [200, { ...SESSAO, expires_in: 120 }],
    "/auth/v1/token?grant_type=refresh_token": () => [200, { ...SESSAO, access_token: "acesso-2", refresh_token: "renova-2" }],
    "/rest/v1/rpc/tem_pro": () => [200, true],
    "/auth/v1/logout": () => [204, null],
  });
  const c = cofre();
  const conta = new Conta({ url: "https://x.supabase.co", chavePublica: "k", cofre: c, fetch: f, agora: () => agora });
  await conta.entrar("a@b.com", "s");
  agora = 70_000; // faltam 50 s: renova antes de pedir
  assert.equal(await conta.temPro(), true);
  assert.equal(pedidos.at(-1).headers.Authorization, "Bearer acesso-2");
  assert.equal(c.valor, "renova-2");
  await conta.sair();
  assert.equal(conta.sessao, null);
  assert.equal(c.valor, undefined);
  await assert.rejects(conta.temPro(), /Entre na sua conta/);
});
