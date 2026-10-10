/**
 * Funções puras da biblioteca (atalho.js) rodando no Node, com um documento
 * de mentira: validações de Portugal/Europa/Brasil, formatação por idioma e
 * moeda, e os textos em pt-PT, pt-BR e inglês.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { RAIZ } from "./docs.mjs";

const codigo = await readFile(path.join(RAIZ, "atalho/atalho.js"), "utf8");

/** Carrega o atalho.js com <html lang> e data-at-moeda escolhidos. */
function carregar(lang = "", moeda) {
  const nada = () => {};
  const documentElement = { lang, dataset: moeda ? { atMoeda: moeda } : {} };
  const document = {
    documentElement,
    readyState: "loading",
    addEventListener: nada,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, dataset: {}, setAttribute: nada, append: nada }),
  };
  const janela = { document, addEventListener: nada, matchMedia: () => ({ matches: false, addEventListener: nada }), navigator: {} };
  const contexto = { window: janela, document, navigator: {}, Intl, CustomEvent: class {}, HTMLElement: class {}, MutationObserver: class { observe() {} }, setTimeout, clearTimeout, console };
  janela.window = janela;
  // Classes do navegador que o atalho.js só cita (instanceof, prototype): viram classes vazias
  for (let tentativas = 0; tentativas < 40; tentativas++) {
    const ctx = vm.createContext({ ...contexto });
    try {
      vm.runInContext(codigo, ctx, { filename: "atalho.js" });
      return janela.Atalho;
    } catch (erro) {
      const nome = erro.message.match(/^(\w+) is not defined/)?.[1];
      if (!nome) throw erro;
      contexto[nome] = function () {};
    }
  }
  throw new Error("atalho.js precisa de globais demais para o teste");
}

test("NIF de Portugal: dígito de controlo", () => {
  const { validar } = carregar();
  for (const bom of ["123456789", "123 456 789", "501442600", "999999990"]) assert.equal(validar.nif(bom), true, bom);
  for (const mau of ["123456780", "12345678", "023456789", "abc", ""]) assert.equal(validar.nif(mau), false, mau);
});

test("IBAN: módulo 97 e tamanho por país", () => {
  const { validar } = carregar();
  for (const bom of ["PT50 0002 0123 1234 5678 9015 4", "DE89370400440532013000", "GB82 WEST 1234 5698 7654 32", "ES9121000418450200051332", "FR1420041010050500013M02606"]) {
    assert.equal(validar.iban(bom), true, bom);
  }
  for (const mau of ["PT50 0002 0123 1234 5678 9015 5", "PT50000201231234567890", "DE8937040044053201300", "XX", ""]) assert.equal(validar.iban(mau), false, mau);
});

test("código postal e telemóvel de Portugal", () => {
  const { validar } = carregar();
  assert.equal(validar.codigoPostal("1250-096"), true);
  assert.equal(validar.codigoPostal("1250096"), true);
  assert.equal(validar.codigoPostal("125-096"), false);
  for (const bom of ["912345678", "+351 912 345 678", "00351936123456", "961234567"]) assert.equal(validar.telemovel(bom), true, bom);
  for (const mau of ["212345678", "94123456", "9123456789"]) assert.equal(validar.telemovel(mau), false, mau);
});

test("telefone: internacional fora do Brasil, DDD no Brasil", () => {
  assert.equal(carregar("pt-PT").validar.telefone("+351 212 345 678"), true);
  assert.equal(carregar("pt-PT").validar.telefone("212345678"), true);
  assert.equal(carregar("en").validar.telefone("+44 20 7946 0958"), true);
  assert.equal(carregar("pt-PT").validar.telefone("1234"), false);
  assert.equal(carregar("pt-BR").validar.telefone("(11) 98765-4321"), true);
  assert.equal(carregar("pt-BR").validar.telefone("98765-4321"), false);
});

test("CPF e CNPJ continuam a funcionar (clientes do Brasil)", () => {
  const { validar } = carregar();
  assert.equal(validar.cpf("529.982.247-25"), true);
  assert.equal(validar.cpf("111.111.111-11"), false);
  assert.equal(validar.cnpj("11.222.333/0001-81"), true);
});

test("moeda: euro por padrão, real no pt-BR, configurável", () => {
  const sem = (t) => t.replace(/\s/g, " ");
  assert.equal(sem(carregar().formatar.moeda(1234.5)), "1234,50 €");
  assert.equal(sem(carregar("pt-PT").formatar.moeda(12345.5)), "12 345,50 €");
  assert.equal(sem(carregar("pt-BR").formatar.moeda(1234.5)), "R$ 1.234,50");
  assert.equal(carregar("en").formatar.moeda(1234.5), "€1,234.50");
  assert.equal(sem(carregar("pt-PT", "GBP").formatar.moeda(10)), "10,00 £");
  const a = carregar("pt-PT");
  assert.deepEqual({ ...a.configurar({ idioma: "en", moeda: "USD" }) }, { idioma: "en", moeda: "USD" });
  assert.equal(a.formatar.moeda(10), "$10.00");
  assert.equal(sem(a.formatar.moeda(10, "EUR")), "€10.00");
});

test("datas e relativo seguem o idioma", () => {
  const data = new Date(2026, 9, 17, 9, 30);
  assert.match(carregar("pt-PT").formatar.data(data, "long"), /17 de outubro de 2026/);
  assert.match(carregar("en").formatar.data(data, "long"), /October 17, 2026|17 October 2026/);
  assert.equal(carregar("pt-PT").formatar.relativo(Date.now()), "agora mesmo");
  assert.equal(carregar("en").formatar.relativo(Date.now()), "just now");
});
