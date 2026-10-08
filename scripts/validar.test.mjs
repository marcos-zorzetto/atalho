/**
 * Testes de consistência do Atalho. Rodam no GitHub a cada push (npm test).
 * Eles pegam os erros que mais acontecem num projeto assim: exemplo usando
 * classe que não existe no CSS, link para componente que não existe, JavaScript
 * de exemplo com erro de sintaxe, recurso sem dados de suporte.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { carregarDocs, carregarBaseline, RAIZ } from "./docs.mjs";

const docs = await carregarDocs();
const baseline = await carregarBaseline();
const css = await readFile(path.join(RAIZ, "atalho/atalho.css"), "utf8");
const js = await readFile(path.join(RAIZ, "atalho/atalho.js"), "utf8");

const classesDoCSS = new Set(Array.from(css.matchAll(/\.(at-[a-z0-9-]+)/g), (m) => m[1]));
const ids = new Set(docs.componentes.map((c) => c.id));
const categorias = new Set(docs.categorias.map((c) => c.id));

test("atalho.js não tem erro de sintaxe", () => {
  assert.doesNotThrow(() => new vm.Script(js, { filename: "atalho.js" }));
});

test("cada componente tem os campos obrigatórios", () => {
  for (const c of docs.componentes) {
    for (const campo of ["id", "nome", "categoria", "resumo"]) {
      assert.ok(c[campo], `"${c.id}" está sem o campo ${campo}`);
    }
    assert.ok(Array.isArray(c.exemplos) && c.exemplos.length > 0, `"${c.id}" precisa de pelo menos um exemplo`);
    assert.ok(Array.isArray(c.apelidos) && c.apelidos.length >= 3, `"${c.id}" precisa de pelo menos 3 apelidos para a busca`);
  }
});

test("ids são únicos e categorias existem", () => {
  assert.equal(ids.size, docs.componentes.length, "existem ids repetidos");
  for (const c of docs.componentes) assert.ok(categorias.has(c.categoria), `"${c.id}" usa a categoria inexistente "${c.categoria}"`);
});

test("\"Combina com\" aponta para componentes que existem", () => {
  for (const c of docs.componentes) {
    for (const outro of c.conectaCom || []) assert.ok(ids.has(outro), `"${c.id}" aponta para "${outro}", que não existe`);
  }
});

test("todas as classes at-* dos exemplos existem no atalho.css", () => {
  const faltando = new Map();
  for (const c of docs.componentes) {
    for (const ex of c.exemplos) {
      const codigo = `${ex.html}\n${ex.js || ""}`;
      for (const [, lista] of codigo.matchAll(/class(?:Name)?="([^"]*)"/g)) {
        for (const classe of lista.split(/\s+/)) {
          if (classe.startsWith("at-") && !classesDoCSS.has(classe)) faltando.set(classe, c.id);
        }
      }
    }
  }
  assert.deepEqual(Object.fromEntries(faltando), {}, "classes usadas nos exemplos e ausentes no CSS");
});

test("data-at=\"...\" dos exemplos é um componente que o atalho.js conhece", () => {
  const conhecidos = new Set(["upload", ...Array.from(js.matchAll(/^ {4}(\w+)\(\w+\) \{/gm), (m) => m[1])]);
  for (const c of docs.componentes) {
    for (const ex of c.exemplos) {
      for (const [, nome] of ex.html.matchAll(/data-at="([a-z-]+)"/g)) {
        assert.ok(conhecidos.has(nome), `"${c.id}" usa data-at="${nome}", que o atalho.js não conhece`);
      }
    }
  }
});

test("o JavaScript de cada exemplo é válido", () => {
  for (const c of docs.componentes) {
    for (const ex of c.exemplos) {
      if (!ex.js) continue;
      assert.doesNotThrow(() => new Function(ex.js), `JavaScript inválido em "${c.id}" › "${ex.titulo}"`);
    }
  }
});

test("todo recurso usado tem dados de suporte (rode npm run atualizar)", () => {
  for (const c of docs.componentes) {
    for (const recurso of c.recursos || []) {
      assert.ok(baseline.recursos[recurso], `"${c.id}" usa "${recurso}", que não está em site/dados/baseline.js`);
    }
  }
});

test("links do MDN usam o idioma declarado", () => {
  for (const c of docs.componentes) {
    for (const link of c.mdn || []) {
      const esperado = link.idioma === "pt" ? "/pt-BR/" : "/en-US/";
      assert.ok(link.url.includes(esperado), `"${c.id}": ${link.url} deveria conter ${esperado}`);
    }
  }
});

test("a busca encontra o que iniciantes digitam", async () => {
  // Carrega o site.js num DOM mínimo só para testar a função de busca
  const contexto = {
    window: {},
    document: { readyState: "loading", addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; } },
    Intl,
    console,
  };
  contexto.window = Object.assign(contexto, { ATALHO_DOCS: docs, ATALHO_BASELINE: baseline });
  vm.createContext(contexto);
  vm.runInContext(await readFile(path.join(RAIZ, "site/site.js"), "utf8"), contexto);
  const buscar = (termo) => contexto.AtalhoSite.buscar(termo).map((c) => c.id);

  const casos = {
    "popup": "modal",
    "janela de confirmação": "modal",
    "mascara de cpf": "mascaras",
    "carrinho de compras": "receita-loja",
    "dropdown": "menu-suspenso",
    "toast": "notificacao",
    "navbar": "barra",
    "tabela com filtro": "tabela",
    "skeleton": "carregando",
    "dark mode": "cores-e-temas",
    "fetch": "requisitar",
    "botao": "botao",
    "acordeon": "sanfona",
    "modl": "modal",
  };
  for (const [termo, esperado] of Object.entries(casos)) {
    const resultados = buscar(termo);
    assert.ok(resultados.slice(0, 3).includes(esperado), `buscar "${termo}" deveria trazer "${esperado}" entre os 3 primeiros, trouxe ${JSON.stringify(resultados.slice(0, 3))}`);
  }
});
