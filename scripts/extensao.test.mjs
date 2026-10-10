/**
 * A extensão do VS Code leva uma cópia dos dados do site. Se a documentação,
 * o CSS ou os catálogos mudarem, este teste lembra de rodar:
 *   node scripts/gerar-extensao.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { dadosExtensao, DESTINO } from "./gerar-extensao.mjs";

test("vscode-atalho/dados está em dia com o site", async () => {
  for (const [nome, esperado] of Object.entries(await dadosExtensao())) {
    // Na publicação com domínio próprio (ATALHO_URL), o endereço muda: a extensão é atualizada à parte
    if (nome === "config.json" && process.env.ATALHO_URL) continue;
    const atual = (await readFile(path.join(DESTINO, nome), "utf8")).replace(/\r\n/g, "\n");
    assert.ok(atual === esperado, `vscode-atalho/dados/${nome} desatualizado: rode "node scripts/gerar-extensao.mjs"`);
  }
});
