"use strict";
/**
 * Roda os testes da extensão dentro de um VS Code de verdade.
 *
 *   node vscode-atalho/test-vscode/executar.js
 *
 * Usa o VS Code instalado no computador (ou VSCODE_EXECUTAVEL); no GitHub,
 * baixa a versão estável. Abre numa pasta de perfil própria e sem outras
 * extensões, então não mexe no VS Code de quem está testando.
 */
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { runTests } = require("@vscode/test-electron");
const { iniciar } = require("./servidor-falso");

const INSTALADO = path.join(process.env.LOCALAPPDATA || "", "Programs", "Microsoft VS Code", "Code.exe");

(async () => {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "atalho-vscode-"));
  const executavel = process.env.VSCODE_EXECUTAVEL || (!process.env.CI && fs.existsSync(INSTALADO) ? INSTALADO : undefined);
  const resultado = path.join(perfil, "resultado.json");
  let codigo = 1;
  // Até 3 tentativas, mas só quando o VS Code fecha sem terminar (sem resultado).
  // Teste que falha de verdade não é repetido.
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    fs.rmSync(resultado, { force: true });
    const { servidor, url } = await iniciar(); // servidor novo: cada tentativa começa do zero
    try {
      await rodar(executavel, url, perfil, resultado, tentativa);
    } catch {}
    servidor.close();
    if (!fs.existsSync(resultado)) {
      console.log(`O VS Code fechou antes de terminar (tentativa ${tentativa} de 3).`);
      continue;
    }
    const { total, falhas } = JSON.parse(fs.readFileSync(resultado, "utf8"));
    console.log(falhas.length ? `Falharam: ${falhas.join("; ")}` : `Extensão: ${total} de ${total} testes passaram no VS Code.`);
    codigo = falhas.length ? 1 : 0;
    break;
  }
  fs.rmSync(perfil, { recursive: true, force: true, maxRetries: 5 });
  process.exit(codigo);
})();

function rodar(executavel, url, perfil, resultado, tentativa) {
  return runTests({
    ...(executavel ? { vscodeExecutablePath: executavel } : { version: "stable" }),
    extensionDevelopmentPath: path.join(__dirname, ".."),
    extensionTestsPath: path.join(__dirname, "suite.js"),
    extensionTestsEnv: { ATALHO_TESTE_SUPABASE: url, ATALHO_TESTE_RESULTADO: resultado },
    launchArgs: ["--disable-extensions", "--disable-workspace-trust", "--skip-welcome", "--skip-release-notes", "--user-data-dir", path.join(perfil, "dados" + tentativa), "--extensions-dir", path.join(perfil, "extensoes")],
  });
}
