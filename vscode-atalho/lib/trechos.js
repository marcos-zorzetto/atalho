/**
 * Regras dos trechos (sem depender do VS Code, para testar com node:test).
 */
"use strict";

/** Escapa o texto para a sintaxe de snippet do VS Code ($, } e \ têm significado especial). */
const escaparSnippet = (texto) => texto.replace(/[\\$}]/g, "\\$&");

/**
 * Se o cursor está dentro de class="…" (ou className, ou :class), devolve a
 * classe que está sendo digitada; senão, null.
 */
function classeNoCursor(linhaAntes) {
  const m = linhaAntes.match(/\b(?:class|className)\s*=\s*(["'])([^"']*)$/);
  if (!m) return null;
  return m[2].split(/\s+/).pop();
}

/** Palavra que está sendo digitada (letras, números e hífen), para filtrar os trechos. */
const palavraNoCursor = (linhaAntes) => (linhaAntes.match(/[a-z0-9-]*$/i) || [""])[0];

/** Página HTML inicial com o Atalho pela CDN. */
function paginaInicial(cdn, corpo = "") {
  return [
    "<!doctype html>",
    '<html lang="pt-BR">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    "  <title>Minha página</title>",
    `  <link rel="stylesheet" href="${cdn}/atalho.css">`,
    `  <script src="${cdn}/atalho.js" defer></script>`,
    "</head>",
    "<body>",
    '  <main class="at-container at-pilha">',
    corpo
      .split("\n")
      .map((l) => (l ? "    " + l : l))
      .join("\n"),
    "  </main>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

const NIVEL = { publico: "Grátis", membro: "Membro", pro: "Pro" };

/**
 * Junta o catálogo (todos os itens, com nível) ao que o banco liberou para a
 * pessoa. O banco decide o acesso (RLS): o que não veio está bloqueado.
 */
function montarAvancados(catalogo, linhas, tipo) {
  const prefixoBanco = tipo === "animacao" ? "anim-" : "comp-";
  const prefixoTrecho = tipo === "animacao" ? "anim-" : "atx-";
  const codigos = new Map(linhas.filter((l) => l.tipo === tipo).map((l) => [l.id.slice(prefixoBanco.length), l.html]));
  return catalogo.itens.map((item) => ({
    ...item,
    tipo,
    prefixo: prefixoTrecho + item.id,
    rotuloNivel: NIVEL[item.nivel] || item.nivel,
    categoriaNome: (catalogo.categorias.find((c) => c.id === item.categoria) || {}).nome || item.categoria,
    corpo: codigos.get(item.id) || null,
    liberado: codigos.has(item.id),
  }));
}

/** Nome do plano para mostrar na barra de status. */
const nomePlano = (estado) => (!estado.pessoa ? "entrar" : estado.admin ? "Admin" : estado.pro ? "Pro" : "Membro");


module.exports = { escaparSnippet, classeNoCursor, palavraNoCursor, paginaInicial, montarAvancados, nomePlano, NIVEL };
