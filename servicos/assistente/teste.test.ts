// Testes do assistente: node --test servicos/assistente/teste.test.ts (Node 22.18+ roda TypeScript direto)
import { test } from "node:test";
import assert from "node:assert/strict";
import { limparHtml, lerJson, escolherCandidatos } from "./src/index.ts";

test("limparHtml remove tudo que executa código", () => {
  const sujo = `<div class="at-cartao" onclick="alert(1)"><script>roubar()</script><a href="javascript:alert(1)">x</a><iframe src="https://mal.com"></iframe><img src=x onerror=alert(1)></div>`;
  const limpo = limparHtml(sujo);
  assert.doesNotMatch(limpo, /<script|onclick|onerror|javascript:|<iframe/i);
  assert.match(limpo, /class="at-cartao"/);
});

test("limparHtml tira cercas de código markdown", () => {
  assert.equal(limparHtml("```html\n<p>oi</p>\n```"), "<p>oi</p>");
});

test("lerJson aceita objeto, texto com JSON e recusa lixo", () => {
  assert.deepEqual(lerJson({ resposta: "ok", componentes: ["modal"], html: "<p></p>" }), { resposta: "ok", componentes: ["modal"], html: "<p></p>" });
  assert.equal(lerJson('Aqui está:\n```json\n{"resposta":"oi","componentes":[1,"botao"],"html":""}\n```')?.componentes[0], "botao");
  assert.equal(lerJson("sem json aqui"), null);
  assert.equal(lerJson({ html: "<p></p>" }), null);
});

test("escolherCandidatos prioriza o que a pergunta cita", () => {
  const catalogo = [
    { id: "campo", nome: "Campos", resumo: "inputs", apelidos: [], api: [], exemplo: "" },
    { id: "mascaras", nome: "Máscaras", resumo: "CPF e telefone", apelidos: ["cpf"], api: [], exemplo: "" },
    { id: "modal", nome: "Modal", resumo: "janela", apelidos: ["popup"], api: [], exemplo: "" },
  ];
  const ids = escolherCandidatos(catalogo, "Formulário com CPF", 3).map((c) => c.id);
  assert.equal(ids[0], "mascaras");
});
