/**
 * Testes de consistência do Atalho. Rodam no GitHub a cada push (npm test).
 * Pegam os erros mais comuns: classe usada e inexistente no CSS, link interno
 * quebrado, JavaScript de exemplo com erro, página sem título ou descrição.
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { carregarDocs, carregarBaseline, RAIZ } from "./docs.mjs";

const docs = await carregarDocs();
const baseline = await carregarBaseline();
const css = await readFile(path.join(RAIZ, "atalho/atalho.css"), "utf8");
const js = await readFile(path.join(RAIZ, "atalho/atalho.js"), "utf8");
const DIST = path.join(RAIZ, "dist");

const classesDoCSS = new Set(Array.from(css.matchAll(/\.(at-[a-z0-9-]+)/g), (m) => m[1]));
const ids = new Set(docs.componentes.map((c) => c.id));
const categorias = new Set(docs.categorias.map((c) => c.id));

/* --------------------------------------------------------------------------
   Biblioteca e dados
   -------------------------------------------------------------------------- */

test("arquivos JavaScript não têm erro de sintaxe", async () => {
  for (const arquivo of ["atalho/atalho.js", "site/site.js", "site/conta.js", "site/assistente.js", "site/config.js"]) {
    const codigo = await readFile(path.join(RAIZ, arquivo), "utf8");
    assert.doesNotThrow(() => new vm.Script(codigo, { filename: arquivo }), arquivo);
  }
});

test("cada componente tem os campos obrigatórios", () => {
  for (const c of docs.componentes) {
    for (const campo of ["id", "nome", "categoria", "resumo"]) assert.ok(c[campo], `"${c.id}" está sem o campo ${campo}`);
    assert.ok(Array.isArray(c.exemplos) && c.exemplos.length > 0, `"${c.id}" precisa de pelo menos um exemplo`);
    assert.ok(Array.isArray(c.apelidos) && c.apelidos.length >= 3, `"${c.id}" precisa de pelo menos 3 apelidos para a busca`);
    assert.ok(c.resumo.length <= 220, `"${c.id}": resumo longo demais para a descrição do Google (${c.resumo.length})`);
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
  const fontes = docs.componentes.flatMap((c) => c.exemplos.map((ex) => [c.id, `${ex.html}\n${ex.js || ""}`]));
  for (const [id, codigo] of fontes) {
    for (const [, lista] of codigo.matchAll(/class(?:Name)?="([^"]*)"/g)) {
      for (const classe of lista.split(/\s+/)) if (classe.startsWith("at-") && !classesDoCSS.has(classe)) faltando.set(classe, id);
    }
  }
  assert.deepEqual(Object.fromEntries(faltando), {}, "classes usadas nos exemplos e ausentes no CSS");
});

test("data-at=\"...\" dos exemplos é um componente que o atalho.js conhece", () => {
  const conhecidos = new Set(["upload", ...Array.from(js.matchAll(/^ {4}"?([\w-]+)"?\(\w*\) \{/gm), (m) => m[1])]);
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
      if (ex.js) assert.doesNotThrow(() => new Function(ex.js), `JavaScript inválido em "${c.id}" › "${ex.titulo}"`);
    }
  }
});

test("todo recurso usado tem dados de suporte (rode npm run atualizar)", () => {
  for (const c of docs.componentes) {
    for (const recurso of c.recursos || []) assert.ok(baseline.recursos[recurso], `"${c.id}" usa "${recurso}", que não está em site/dados/baseline.js`);
  }
});

test("links do MDN usam o idioma declarado", () => {
  for (const c of docs.componentes) {
    for (const link of c.mdn || []) {
      assert.ok(link.url.includes(link.idioma === "pt" ? "/pt-BR/" : "/en-US/"), `"${c.id}": ${link.url}`);
    }
  }
});

/* --------------------------------------------------------------------------
   Busca
   -------------------------------------------------------------------------- */

test("a busca encontra o que iniciantes digitam", async () => {
  const ordem = docs.categorias.flatMap((cat) => docs.componentes.filter((c) => c.categoria === cat.id));
  const indice = ordem.map((c) => ({
    id: c.id,
    nome: c.nome,
    categoria: docs.categorias.find((cat) => cat.id === c.categoria).nome,
    resumo: c.resumo,
    apelidos: c.apelidos || [],
    api: (c.api || []).map((a) => a.nome),
    url: `/componentes/${c.id}/`,
  }));
  const contexto = {
    ATALHO_INDICE: indice,
    document: { readyState: "loading", addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; } },
    Intl,
    console,
  };
  contexto.window = contexto;
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
    "slider": "faixa",
    "lightbox": "galeria",
    "zap": "whatsapp",
    "infinite scroll": "carregar-mais",
  };
  for (const [termo, esperado] of Object.entries(casos)) {
    const resultados = buscar(termo);
    assert.ok(resultados.slice(0, 3).includes(esperado), `"${termo}" deveria trazer "${esperado}" entre os 3 primeiros, trouxe ${JSON.stringify(resultados.slice(0, 3))}`);
  }
});

/* --------------------------------------------------------------------------
   Site gerado
   -------------------------------------------------------------------------- */

let paginas = [];
before(async () => {
  const { gerarSite } = await import("./gerar-site.mjs");
  ({ paginas } = await gerarSite());
});

const ler = (arquivo) => readFile(path.join(DIST, arquivo), "utf8");

test("toda página tem título, descrição, canonical e um único h1", async () => {
  for (const pagina of paginas) {
    const html = await ler(pagina);
    assert.match(html, /<title>[^<]{10,}<\/title>/, `${pagina}: sem <title>`);
    const descricao = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
    assert.ok(descricao.length >= 30 && descricao.length <= 170, `${pagina}: descrição com ${descricao.length} caracteres`);
    assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+">/, `${pagina}: sem canonical`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${pagina}: precisa de exatamente um <h1>`);
    assert.match(html, /<html lang="pt-BR">/, `${pagina}: sem lang`);
  }
});

test("cada componente tem a sua página", async () => {
  for (const c of docs.componentes) assert.ok(existsSync(path.join(DIST, "componentes", c.id, "index.html")), c.id);
});

test("nenhum link interno quebrado", async () => {
  const base = "/atalho/";
  const quebrados = [];
  for (const pagina of paginas) {
    const html = await ler(pagina);
    for (const [, destino] of html.matchAll(/(?:href|src)="(\/atalho\/[^"#?]*)/g)) {
      let caminho = destino.slice(base.length);
      if (caminho === "" || caminho.endsWith("/")) caminho += "index.html";
      if (!existsSync(path.join(DIST, caminho))) quebrados.push(`${pagina} → ${destino}`);
    }
  }
  assert.deepEqual([...new Set(quebrados)], []);
});

test("sitemap lista todas as páginas indexáveis e robots.txt aponta para ele", async () => {
  const sitemap = await ler("sitemap.xml");
  for (const c of docs.componentes) assert.ok(sitemap.includes(`/componentes/${c.id}/</loc>`), `sitemap sem ${c.id}`);
  assert.ok(!sitemap.includes("/conta/"), "a página de conta não deve ser indexada");
  assert.match(await ler("robots.txt"), /Sitemap: https:\/\/.+sitemap\.xml/);
});

test("exemplos completos têm página e miniatura", async () => {
  const { EXEMPLOS } = await import("./site/exemplos.mjs");
  for (const e of EXEMPLOS) {
    assert.ok(existsSync(path.join(RAIZ, "exemplos", `${e.id}.html`)), `falta exemplos/${e.id}.html`);
    assert.ok(existsSync(path.join(RAIZ, "exemplos", "miniaturas", `${e.id}.png`)), `falta a miniatura de ${e.id} (rode npm run miniaturas)`);
  }
});

test("os exemplos de PHP do guia existem", async () => {
  const arquivos = await readdir(path.join(RAIZ, "php", "exemplos"));
  for (const nome of ["cadastro.php", "cep.php", "upload.php", "login.php", "pedidos.php"]) assert.ok(arquivos.includes(nome), nome);
});
