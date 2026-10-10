"use strict";
/**
 * Supabase de mentira para os testes no VS Code de verdade. Imita só o que a
 * extensão usa: login por senha, renovação, sair, tem_pro, eh_admin e conteudos,
 * com as mesmas regras de acesso do banco (RLS): membro lê "publico" e "membro";
 * Pro lê tudo.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const CATALOGOS = {
  componente: require("../dados/componentes-avancados.json"),
  animacao: require("../dados/animacoes.json"),
};
// Com o repositório privado ao lado, usa o código real; senão, um trecho simples
const PRO = path.join(__dirname, "..", "..", "..", "atalho-pro", "conteudos");
const PASTA = { componente: "componentes", animacao: "animacoes" };

function codigo(tipo, item) {
  const arquivo = path.join(PRO, PASTA[tipo], item.nivel, item.id + ".html");
  return !process.env.ATALHO_TESTE_SEM_PRO && fs.existsSync(arquivo) ? fs.readFileSync(arquivo, "utf8").replace(/\r\n/g, "\n") : `<div class="cx-teste">${item.nome} $1 \${x}</div>`;
}

const LINHAS = Object.entries(CATALOGOS).flatMap(([tipo, cat]) =>
  cat.itens.map((item) => ({ id: (tipo === "animacao" ? "anim-" : "comp-") + item.id, tipo, acesso: item.nivel, html: codigo(tipo, item) })),
);

const CONTAS = {
  "membro@teste.pt": { senha: "certa", pro: false },
  "pro@teste.pt": { senha: "certa", pro: true },
};

function iniciar() {
  const estado = { revogados: new Set(), pedidos: [] };
  const sessoes = new Map(); // token → email

  const servidor = http.createServer((req, res) => {
    let corpo = "";
    req.on("data", (d) => (corpo += d));
    req.on("end", () => {
      const url = new URL(req.url, "http://x");
      estado.pedidos.push(url.pathname + url.search);
      const responder = (status, dados) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(dados === undefined ? "" : JSON.stringify(dados));
      };
      // Controle do teste: simula conta excluída ou senha trocada (a renovação passa a ser recusada)
      if (url.pathname === "/teste/revogar") return estado.revogados.add(JSON.parse(corpo).email), responder(200, true);
      if (url.pathname === "/teste/pedidos") return responder(200, estado.pedidos);
      if (req.headers.apikey !=="sb_publishable__6ZgOxk9Ir-zZjz_QuDmdQ_rdxDSIhF") return responder(401, { message: "apikey inválida" });
      const dados = corpo ? JSON.parse(corpo) : {};
      const novaSessao = (email) => {
        const token = `acesso-${email}-${Math.random()}`;
        const renovacao = `renova-${email}-${Math.random()}`;
        sessoes.set(token, email);
        sessoes.set(renovacao, email);
        return { access_token: token, refresh_token: renovacao, expires_in: 3600, user: { email } };
      };

      if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "password") {
        const conta = CONTAS[dados.email];
        if (!conta || conta.senha !== dados.password) return responder(400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" });
        return responder(200, novaSessao(dados.email));
      }
      if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "refresh_token") {
        const email = sessoes.get(dados.refresh_token);
        if (!email || estado.revogados.has(email)) return responder(400, { code: 400, error_code: "refresh_token_not_found", msg: "Invalid Refresh Token" });
        sessoes.delete(dados.refresh_token);
        return responder(200, novaSessao(email));
      }

      const email = sessoes.get((req.headers.authorization || "").replace(/^Bearer /, ""));
      if (!email) return responder(401, { message: "JWT inválido" });
      if (url.pathname === "/auth/v1/logout") return responder(204);
      if (url.pathname === "/rest/v1/rpc/tem_pro") return responder(200, CONTAS[email].pro);
      if (url.pathname === "/rest/v1/rpc/eh_admin") return responder(200, false);
      if (url.pathname === "/rest/v1/conteudos") {
        const tipos = (url.searchParams.get("tipo") || "").replace(/^in\.\(|\)$/g, "").split(",");
        const linhas = LINHAS.filter((l) => tipos.includes(l.tipo) && (CONTAS[email].pro || l.acesso !== "pro"));
        return responder(200, linhas.map(({ id, tipo, html }) => ({ id, tipo, html })));
      }
      responder(404, { message: "rota desconhecida" });
    });
  });

  return new Promise((resolver) => servidor.listen(0, "127.0.0.1", () => resolver({ servidor, estado, url: `http://127.0.0.1:${servidor.address().port}` })));
}

module.exports = { iniciar, LINHAS };
