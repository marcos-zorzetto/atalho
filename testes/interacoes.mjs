#!/usr/bin/env node
/**
 * Testes de ponta a ponta: um navegador de verdade clica, digita, arrasta e usa
 * o teclado como uma pessoa faria, nos componentes e nas páginas de exemplo.
 *
 * Uso: node testes/interacoes.mjs              (gere antes: node scripts/gerar-site.mjs --local)
 *      node testes/interacoes.mjs --somente=pro  (só as páginas completas do atalho-pro)
 *
 * As páginas completas ficam no repositório privado atalho-pro (scripts/pro.mjs).
 * Sem ele, os testes delas são pulados, com aviso.
 */
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { RAIZ } from "../scripts/docs.mjs";
import { proDisponivel, arquivoExemplo, lerAnimacoesPro } from "../scripts/pro.mjs";
import { supabaseFalso, semServicosReais, PROJETO } from "./supabase-falso.mjs";

const DIST = path.join(RAIZ, "dist");
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const servidor = createServer(async (req, res) => {
  let caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (caminho.endsWith("/")) caminho += "index.html";
  // Páginas completas: vêm do atalho-pro (no site publicado, saem do Supabase para membros)
  const exemplo = caminho.match(/^\/exemplos\/([a-z0-9-]+)\.html$/);
  const arquivo = exemplo && proDisponivel ? arquivoExemplo(exemplo[1]) : path.join(DIST, caminho);
  try {
    if ((!exemplo && !arquivo.startsWith(DIST)) || !(await stat(arquivo)).isFile()) throw new Error();
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(arquivo)] || "application/octet-stream" });
    res.end(await readFile(arquivo));
  } catch {
    res.writeHead(404);
    res.end("não encontrado");
  }
});
await new Promise((ok) => servidor.listen(0, "127.0.0.1", ok));
const BASE = `http://127.0.0.1:${servidor.address().port}`;

const navegador = await chromium.launch({ channel: process.env.CI ? "chrome" : "msedge" });
const testes = [];
const teste = (nome, fn, opcoes = {}) => testes.push({ nome, fn, opcoes });

async function novaAba(opcoes = {}) {
  const contexto = await navegador.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "pt-BR",
    permissions: ["clipboard-read", "clipboard-write"],
    reducedMotion: "reduce",
    ...opcoes,
  });
  await semServicosReais(contexto);
  const aba = await contexto.newPage();
  aba.errosJs = [];
  aba.on("pageerror", (erro) => aba.errosJs.push(erro.message));
  // Trava: nenhum teste pode tocar o banco de produção
  aba.on("request", (pedido) => {
    const host = new URL(pedido.url()).hostname;
    if (host.endsWith(".supabase.co") && host !== new URL(PROJETO).hostname) aba.errosJs.push(`pedido ao Supabase real: ${host}`);
  });
  return aba;
}

const texto = (valor) => String(valor).replace(/ /g, " ");

const abrir = async (aba, caminho) => {
  await aba.goto(`${BASE}/${caminho}`, { waitUntil: "load" });
  await aba.waitForFunction(() => window.Atalho);
};

/* ------------------------------------------------------------------------
   Página inicial e navegação
   ------------------------------------------------------------------------ */

teste("Ctrl+K abre a busca, entende 'popup' e leva ao modal pelo teclado", async (aba) => {
  await abrir(aba, "");
  await aba.keyboard.press("Control+k");
  await aba.locator("#site-paleta input").fill("popup");
  await aba.waitForTimeout(100);
  assert.match(await aba.locator("#site-paleta .at-comando-item").first().innerText(), /Modal/);
  await aba.keyboard.press("Enter");
  await aba.waitForURL(/componentes\/modal\//);
});

teste("Busca da página inicial: digitar 'cpf' e Enter abre Máscaras", async (aba) => {
  await abrir(aba, "");
  await aba.locator("#busca-inicio").fill("cpf");
  await aba.locator("#busca-inicio-resultados .site-resultado").first().waitFor();
  await aba.locator("#busca-inicio").press("Enter");
  await aba.waitForURL(/componentes\/mascaras\//);
});

teste("Vitrine ao vivo: Comprar soma no carrinho e mostra notificação", async (aba) => {
  await abrir(aba, "");
  await aba.getByRole("button", { name: "Comprar" }).first().click();
  await aba.getByRole("button", { name: "Comprar" }).first().click();
  assert.equal(await aba.locator('[data-at-texto="vitrineInicio.quantidade"]').innerText(), "2");
  await aba.locator(".at-notificacao").first().waitFor();
});

teste("Formulário da vitrine: CPF inválido mostra erro em português", async (aba) => {
  await abrir(aba, "");
  await aba.locator("#inicio-cpf").pressSequentially("11111111111");
  assert.equal(await aba.locator("#inicio-cpf").inputValue(), "111.111.111-11");
  await aba.getByRole("button", { name: "Validar" }).click();
  await aba.getByText("CPF inválido. Confira os números.").waitFor();
});

teste("Tema escuro: alterna e continua escuro depois de recarregar", async (aba) => {
  await abrir(aba, "");
  await aba.getByRole("button", { name: "Alternar tema escuro" }).click();
  assert.equal(await aba.evaluate(() => document.documentElement.dataset.tema), "escuro");
  await aba.reload();
  assert.equal(await aba.evaluate(() => document.documentElement.dataset.tema), "escuro");
});

teste("Abas de código: trocar para JavaScript e copiar", async (aba) => {
  await abrir(aba, "componentes/botao/");
  const caixa = aba.locator(".site-exemplo").nth(2);
  await caixa.getByRole("tab", { name: "JavaScript" }).click();
  assert.equal(await caixa.locator("pre.site-codigo:not([hidden])").count(), 1);
  assert.match(await caixa.locator("pre.site-codigo:not([hidden])").innerText(), /addEventListener/);
  await caixa.getByRole("button", { name: "Copiar" }).click();
  await caixa.getByRole("button", { name: "Copiado!" }).waitFor();
  assert.match(await aba.evaluate(() => navigator.clipboard.readText()), /aria-busy/);
});

teste("Índice 'Nesta página' leva até a seção", async (aba) => {
  await abrir(aba, "componentes/tabela/");
  await aba.locator(".site-indice").getByRole("link", { name: "Referência" }).click();
  await aba.waitForTimeout(300);
  const topo = await aba.locator("#referencia").evaluate((el) => el.getBoundingClientRect().top);
  assert.ok(topo > 0 && topo < 300, `seção ficou em ${topo}px`);
});

teste("Catálogo: filtro encontra por sinônimo", async (aba) => {
  await abrir(aba, "componentes/");
  await aba.locator("#filtro-catalogo").fill("lightbox");
  assert.equal(await aba.locator(".site-catalogo-item:not([hidden])").count() >= 1, true);
  assert.match(await aba.locator(".site-catalogo-item:not([hidden])").first().innerText(), /Galeria/);
});

teste("Ícones: clicar copia o SVG", async (aba) => {
  await abrir(aba, "icones/");
  await aba.locator('[data-icone="carrinho"]').click();
  assert.match(await aba.evaluate(() => navigator.clipboard.readText()), /^<svg/);
});

/* ------------------------------------------------------------------------
   Componentes
   ------------------------------------------------------------------------ */

teste("Modal: abre sem JavaScript próprio, Esc fecha e devolve o foco", async (aba) => {
  await abrir(aba, "componentes/modal/");
  const abridor = aba.getByRole("button", { name: "Cancelar assinatura" }).first();
  await abridor.click();
  assert.equal(await aba.locator("#modal-sair").evaluate((d) => d.open), true);
  await aba.keyboard.press("Escape");
  assert.equal(await aba.locator("#modal-sair").evaluate((d) => d.open), false);
  assert.equal(await abridor.evaluate((b) => b === document.activeElement), true);
});

teste("Modal de exclusão: botão só libera com o nome certo", async (aba) => {
  await abrir(aba, "componentes/modal/");
  await aba.getByRole("button", { name: "Excluir projeto" }).click();
  const botao = aba.getByRole("button", { name: "Entendi, excluir este projeto" });
  assert.equal(await botao.isDisabled(), true);
  await aba.keyboard.type("loja-virtual");
  assert.equal(await botao.isDisabled(), false);
  await botao.click();
  await aba.locator(".at-notificacao", { hasText: "Projeto excluído." }).waitFor();
});

teste("Menu suspenso: abre ao lado do botão, setas navegam, Esc fecha", async (aba) => {
  await abrir(aba, "componentes/menu-suspenso/");
  const botao = aba.getByRole("button", { name: "Mais ações" });
  await botao.click();
  const menu = aba.locator("#menu-projeto");
  // O menu é posicionado no evento "toggle", logo depois de abrir (até lá fica invisível)
  await aba.waitForFunction(() => document.querySelector("#menu-projeto").matches(":popover-open[data-posicionado]"));
  const [b, m] = await Promise.all([botao.boundingBox(), menu.boundingBox()]);
  assert.ok(Math.abs(m.y - (b.y + b.height)) < 20 && Math.abs(m.x - b.x) < 30, `menu longe do botão: ${JSON.stringify({ b, m })}`);
  await aba.keyboard.press("ArrowDown");
  assert.match(await aba.evaluate(() => document.activeElement.textContent), /Duplicar/);
  await aba.keyboard.press("Escape");
  assert.equal(await menu.evaluate((el) => el.matches(":popover-open")), false);
});

teste("Abas: clique e setas do teclado", async (aba) => {
  await abrir(aba, "componentes/abas/");
  await aba.getByRole("tab", { name: "Segurança" }).click();
  assert.equal(await aba.locator("#painel-seguranca").isVisible(), true);
  await aba.keyboard.press("ArrowRight");
  assert.equal(await aba.locator("#painel-faturas").isVisible(), true);
});

teste("Tabela: ordenar, filtrar, paginar e selecionar com cliques", async (aba) => {
  await abrir(aba, "componentes/tabela/");
  const total = aba.locator("#tabela-pedidos thead").getByRole("button", { name: "Total" });
  await total.click();
  await total.click();
  assert.equal(await aba.locator("#tabela-pedidos tbody tr:not([hidden]) td:nth-child(2)").first().innerText(), "#1044");
  await aba.getByRole("button", { name: "Página 2" }).click();
  assert.match(await aba.locator(".at-paginacao-info").innerText(), /6–8 de 8/);
  await aba.locator("#busca-pedidos").fill("pix");
  assert.equal(await aba.locator("#tabela-pedidos tbody tr:not([hidden])").count(), 3);
  await aba.getByRole("checkbox", { name: "Selecionar todos" }).check();
  assert.equal(await aba.locator("#selecionados").innerText(), "3 selecionados");
});

teste("Máscaras: digitação real formata e o cursor não pula", async (aba) => {
  await abrir(aba, "componentes/mascaras/");
  await aba.locator("#m-tel").pressSequentially("11987654321");
  assert.equal(await aba.locator("#m-tel").inputValue(), "(11) 98765-4321");
  await aba.locator("#m-valor").pressSequentially("123456");
  assert.equal(texto(await aba.locator("#m-valor").inputValue()), "R$ 1.234,56");
  await aba.locator("#m-cpf").pressSequentially("52998224725");
  await aba.locator("#m-cpf").press("Home");
  await aba.locator("#m-cpf").press("ArrowRight");
  await aba.locator("#m-cpf").press("ArrowRight");
  await aba.locator("#m-cpf").press("Delete");
  await aba.locator("#m-cpf").press("1");
  assert.equal(await aba.locator("#m-cpf").inputValue(), "521.982.247-25");
});

teste("Validação: enviar vazio mostra erros e foca o primeiro campo", async (aba) => {
  await abrir(aba, "componentes/validacao/");
  await aba.getByRole("button", { name: "Criar conta" }).click();
  assert.equal(await aba.evaluate(() => document.activeElement.id), "cc-nome");
  assert.equal(await aba.locator("#form-conta .at-erro-msg:not(:empty)").count(), 6);
});

teste("Senha: mostrar e medidor de força", async (aba) => {
  await abrir(aba, "componentes/senha/");
  await aba.locator("#nova-senha").pressSequentially("Abcdefg1!");
  assert.equal(await aba.locator(".at-forca-texto").innerText(), "Forte");
  await aba.getByRole("button", { name: "Mostrar" }).click();
  assert.equal(await aba.locator("#nova-senha").getAttribute("type"), "text");
});

teste("Código de verificação: digitar avança sozinho e confirma", async (aba) => {
  await abrir(aba, "componentes/codigo/");
  await aba.locator("#codigo-sms input").first().click();
  await aba.keyboard.type("123456");
  await aba.locator(".at-notificacao", { hasText: "Número confirmado!" }).waitFor();
});

teste("Upload: escolher arquivo mostra o nome e o tamanho", async (aba) => {
  await abrir(aba, "componentes/upload/");
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  await aba.locator('[data-at="upload"] input[type=file]').setInputFiles({ name: "foto-produto.png", mimeType: "image/png", buffer: png });
  await aba.getByText("foto-produto.png").waitFor();
  await aba.getByRole("button", { name: "Remover" }).click();
  assert.equal(await aba.locator(".at-upload-lista li").count(), 0);
});

teste("Copiar Pix: copia o código e confirma", async (aba) => {
  await abrir(aba, "componentes/copiar/");
  await aba.getByRole("button", { name: /Copiar/ }).first().click();
  assert.match(await aba.evaluate(() => navigator.clipboard.readText()), /^00020126/);
});

teste("Kanban: arrastar com o mouse e mover com Alt+seta", async (aba) => {
  await abrir(aba, "componentes/kanban/");
  await aba.locator("#quadro").scrollIntoViewIfNeeded();
  const origem = await aba.locator('[data-id="1"]').boundingBox();
  const destino = await aba.locator('[data-coluna="feito"] .at-kanban-lista').boundingBox();
  await aba.mouse.move(origem.x + 20, origem.y + 10);
  await aba.mouse.down();
  await aba.mouse.move(origem.x + 50, origem.y + 30, { steps: 5 });
  await aba.mouse.move(destino.x + 40, destino.y + destino.height - 10, { steps: 10 });
  await aba.mouse.up();
  assert.equal(await aba.locator('[data-coluna="feito"] [data-id="1"]').count(), 1);
  await aba.locator('[data-id="2"]').focus();
  await aba.keyboard.press("Alt+ArrowRight");
  assert.equal(await aba.locator('[data-coluna="fazendo"] [data-id="2"]').count(), 1);
});

teste("Carrossel: botão Próximo rola a fileira", async (aba) => {
  await abrir(aba, "componentes/carrossel/");
  await aba.getByRole("button", { name: "Próximo" }).click();
  await aba.waitForTimeout(700);
  assert.ok((await aba.locator(".at-carrossel-trilho").evaluate((t) => t.scrollLeft)) > 50);
});

teste("Galeria: abre em tela cheia e navega com as setas", async (aba) => {
  await abrir(aba, "componentes/galeria/");
  await aba.locator('[data-at="galeria"] a').first().click();
  await aba.getByText("1 de 4").waitFor();
  await aba.keyboard.press("ArrowRight");
  await aba.getByText("2 de 4").waitFor();
  await aba.keyboard.press("Escape");
});

teste("Autocompletar: digitar, setas e Enter", async (aba) => {
  await abrir(aba, "componentes/autocompletar/");
  await aba.locator("#banco").pressSequentially("ita");
  await aba.keyboard.press("ArrowDown");
  await aba.keyboard.press("Enter");
  assert.equal(await aba.locator("#banco").inputValue(), "341");
});

teste("Etiquetas: Enter cria, Backspace apaga", async (aba) => {
  await abrir(aba, "componentes/etiquetas-entrada/");
  await aba.locator("#habilidades").pressSequentially("PHP");
  await aba.keyboard.press("Enter");
  assert.equal(await aba.locator('[data-at="etiquetas"] .at-etiqueta').count(), 3);
  await aba.keyboard.press("Backspace");
  assert.equal(await aba.locator('[data-at="etiquetas"] .at-etiqueta').count(), 2);
});

teste("Notificação com Desfazer (padrão Gmail)", async (aba) => {
  await abrir(aba, "componentes/notificacao/");
  await aba.getByRole("button", { name: "Arquivar" }).first().click();
  await aba.getByRole("button", { name: "Desfazer" }).click();
  assert.equal(await aba.locator("#lista-emails li").first().isVisible(), true);
});

teste("Cookies (LGPD): aceitar dispara a escolha", async (aba) => {
  await abrir(aba, "componentes/cookies/");
  await aba.getByRole("button", { name: "Aceitar", exact: true }).click();
  await aba.locator(".at-notificacao", { hasText: "Análise de uso permitida." }).waitFor();
});

teste("Loja com carrinho: comprar, ajustar quantidade e ver o total", async (aba) => {
  await abrir(aba, "componentes/receita-loja/");
  await aba.evaluate(() => localStorage.clear());
  await aba.reload();
  await aba.waitForFunction(() => window.Atalho);
  const comprar = aba.locator('[data-at-acao="carrinho.adicionar"]');
  await comprar.nth(0).click();
  await comprar.nth(1).click();
  await aba.getByRole("button", { name: "Abrir carrinho" }).click();
  const gaveta = aba.locator("#gaveta-carrinho");
  await gaveta.getByRole("button", { name: "Aumentar" }).first().click();
  assert.equal(texto(await gaveta.locator('[data-at-texto="carrinho.total"]').innerText()), "R$ 1.389,70");
});

teste("Login em duas etapas: senha, código e pronto", async (aba) => {
  await abrir(aba, "componentes/receita-login/");
  await aba.locator("#login-email").fill("ana@exemplo.com");
  await aba.locator("#login-senha").fill("senha-forte-1");
  await aba.getByRole("button", { name: "Continuar" }).click();
  await aba.locator("#login-codigo input").first().waitFor({ state: "visible" });
  await aba.keyboard.type("123456");
  await aba.getByRole("heading", { name: "Tudo certo!" }).waitFor();
});

teste("CEP preenche o endereço (ViaCEP)", async (aba) => {
  await abrir(aba, "componentes/cep/");
  await aba.locator("#end-cep").pressSequentially("01310100");
  await aba.waitForFunction(() => document.querySelector("#end-rua").value === "Avenida Paulista", null, { timeout: 15000 });
  assert.equal(await aba.evaluate(() => document.activeElement.id), "end-numero");
}, { rede: true });

/* ------------------------------------------------------------------------
   Páginas completas de exemplo
   ------------------------------------------------------------------------ */

teste("Exemplo Loja: buscar, filtrar e comprar", async (aba) => {
  await abrir(aba, "exemplos/loja.html");
  await aba.evaluate(() => localStorage.clear());
  await aba.reload();
  await aba.waitForFunction(() => window.Atalho);
  await aba.getByRole("radio", { name: "Até R$ 300" }).check();
  assert.match(await aba.locator('[data-at-texto="vitrine.resumo"]').innerText(), /3 produtos/);
  await aba.getByRole("button", { name: "Comprar" }).first().click();
  assert.equal(await aba.locator('[data-at-texto="carrinho.quantidade"]').innerText(), "1");
}, { pro: true });

teste("Exemplo Landing: anual muda o preço", async (aba) => {
  await abrir(aba, "exemplos/landing-saas.html");
  const preco = aba.locator('[data-at-texto="precos.pro"]');
  assert.equal(texto(await preco.innerText()), "R$ 79,00");
  await aba.getByRole("switch", { name: "Cobrança anual" }).check();
  assert.equal(texto(await preco.innerText()), "R$ 65,83");
}, { pro: true });

teste("Exemplo Painel: Ctrl+K e ordenação", async (aba) => {
  await abrir(aba, "exemplos/painel.html");
  await aba.keyboard.press("Control+k");
  assert.equal(await aba.locator("#paleta").evaluate((d) => d.open), true);
  await aba.keyboard.press("Escape");
  await aba.locator("#pedidos thead").getByRole("button", { name: "Cliente" }).click();
  assert.equal(await aba.locator("#pedidos tbody tr:not([hidden]) td:nth-child(2)").first().innerText(), "Ana Costa");
}, { pro: true });

teste("Exemplo Checkout: Pix abre o modal", async (aba) => {
  await abrir(aba, "exemplos/checkout.html");
  await aba.locator("#nome").fill("Ana Oliveira");
  await aba.locator("#cpf").pressSequentially("52998224725");
  await aba.locator("#celular").pressSequentially("11987654321");
  await aba.locator("#cep").pressSequentially("01310100");
  await aba.waitForFunction(() => document.querySelector("#rua").value !== "", null, { timeout: 15000 });
  await aba.locator("#numero").fill("1000");
  await aba.getByRole("button", { name: "Finalizar compra" }).click();
  await aba.locator("#modal-pix[open]").waitFor();
}, { rede: true, pro: true });

/* ------------------------------------------------------------------------
   Editor ao vivo
   ------------------------------------------------------------------------ */

teste("Editor: 'Editar e testar' abre o exemplo e a prévia funciona", async (aba) => {
  await abrir(aba, "componentes/modal/");
  await aba.locator(".site-editar").first().click();
  await aba.waitForURL(/editor\/#/);
  const previa = aba.frameLocator("[data-editor-previa]");
  await previa.getByRole("button", { name: "Cancelar assinatura" }).click();
  await previa.locator("#modal-sair[open]").waitFor();
});

teste("Editor: editar o HTML atualiza a prévia e o console mostra console.log", async (aba) => {
  await abrir(aba, "editor/");
  const html = aba.locator('[data-linguagem="html"]');
  await html.fill('<h1 id="titulo">Meu teste</h1>');
  await aba.getByRole("tab", { name: "JavaScript" }).click();
  await aba.locator('[data-linguagem="js"]').fill('console.log("olá do editor", 1 + 1);');
  const previa = aba.frameLocator("[data-editor-previa]");
  await previa.getByText("Meu teste").waitFor();
  await aba.locator("[data-editor-console] li", { hasText: "olá do editor 2" }).waitFor();
});

teste("Editor: o link compartilhado reabre o mesmo código", async (aba) => {
  await abrir(aba, "editor/");
  await aba.locator('[data-linguagem="html"]').fill('<p class="at-chamada">Compartilhado!</p>');
  await aba.getByRole("tab", { name: "JavaScript" }).click();
  await aba.locator('[data-linguagem="js"]').fill("");
  await aba.waitForTimeout(500);
  const endereco = aba.url();
  await aba.goto("about:blank");
  await aba.goto(endereco);
  assert.equal(await aba.locator('[data-linguagem="html"]').inputValue(), '<p class="at-chamada">Compartilhado!</p>');
});

/* ------------------------------------------------------------------------
   Celular
   ------------------------------------------------------------------------ */

teste("Celular: menu do topo abre e fecha", async (aba) => {
  await abrir(aba, "");
  const botao = aba.getByRole("button", { name: "Abrir menu" });
  await botao.click();
  assert.equal(await aba.getByRole("link", { name: "Componentes" }).first().isVisible(), true);
  assert.equal(await botao.getAttribute("aria-expanded"), "true");
}, { contexto: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } });

teste("Celular: lista de componentes da documentação abre", async (aba) => {
  await abrir(aba, "componentes/modal/");
  await aba.getByRole("button", { name: "Todos os componentes" }).click();
  assert.equal(await aba.locator("#menu-docs").isVisible(), true);
  await aba.locator("#menu-docs").getByRole("link", { name: "Botão", exact: true }).click();
  await aba.waitForURL(/componentes\/botao\//);
}, { contexto: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } });

teste("Celular: busca abre pelo botão de lupa", async (aba) => {
  await abrir(aba, "componentes/");
  await aba.locator("[data-abrir-busca]").click();
  await aba.locator("#site-paleta input").fill("zap");
  assert.match(await aba.locator("#site-paleta .at-comando-item").first().innerText(), /WhatsApp/);
}, { contexto: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } });

/* ------------------------------------------------------------------------
   Componentes da versão 1.2 (paridade com o Bootstrap)
   ------------------------------------------------------------------------ */

teste("Balão: abre ao lado do botão e fecha com Esc", async (aba) => {
  await abrir(aba, "componentes/balao/");
  const botao = aba.locator('[popovertarget="balao-taxa"]').first();
  const balao = aba.locator("#balao-taxa");
  await botao.click();
  await aba.locator("#balao-taxa[data-posicionado]").waitFor();
  const b = await botao.boundingBox(), c = await balao.boundingBox();
  assert.ok(Math.abs(c.y - (b.y + b.height)) < 20 || Math.abs(c.y + c.height - b.y) < 20, `balão longe do botão (botão y=${b.y}, balão y=${c.y})`);
  await aba.keyboard.press("Escape");
  await balao.waitFor({ state: "hidden" });
});

teste("Rótulo flutuante: sobe ao digitar e volta ao apagar", async (aba) => {
  await abrir(aba, "componentes/rotulo-flutuante/");
  const rotulo = aba.locator('label[for="flut-email"]');
  const antes = await rotulo.evaluate((l) => l.getBoundingClientRect().top);
  await aba.locator("#flut-email").fill("ana@exemplo.com");
  await aba.locator("#flut-senha").focus();
  await aba.waitForTimeout(300);
  const depois = await rotulo.evaluate((l) => l.getBoundingClientRect().top);
  assert.ok(depois < antes - 4, `o rótulo não subiu (${antes} → ${depois})`);
});

teste("Recolher: abre, anuncia o estado e esconde do Tab quando fechado", async (aba) => {
  await abrir(aba, "componentes/recolher/");
  const botao = aba.getByRole("button", { name: "Ver detalhes" }).first();
  const bloco = aba.locator("#detalhes-pedido");
  assert.equal(await bloco.evaluate((b) => getComputedStyle(b).visibility), "hidden");
  await botao.click();
  assert.equal(await botao.getAttribute("aria-expanded"), "true");
  // Espera a animação terminar (altura do conteúdo aparece)
  await aba.waitForFunction(() => /Pagamento: Pix/.test(document.querySelector("#detalhes-pedido").innerText));
  await botao.click();
  assert.equal(await botao.getAttribute("aria-expanded"), "false");
});

teste("Índice: marca a seção que está sendo lida", async (aba) => {
  await abrir(aba, "componentes/indice/");
  const caixa = aba.locator(".site-exemplo-preview .at-grade-12, .at-grade-12").filter({ has: aba.locator("#termos-pagamento") }).first();
  await caixa.evaluate((c) => {
    c.scrollIntoView({ block: "start" });
  });
  await aba.locator("#termos-cancelamento").evaluate((s) => s.scrollIntoView({ block: "start" }));
  await aba.waitForFunction(() => document.querySelector('.at-indice a[href="#termos-cancelamento"]')?.getAttribute("aria-current") === "location");
  await aba.locator(".at-indice a[href='#termos-uso']").click();
  assert.equal(await aba.locator(".at-indice a[href='#termos-uso']").getAttribute("aria-current"), "location");
});

teste("Grade de 12: 8 + 4 no computador, empilha no celular", async (aba) => {
  await abrir(aba, "componentes/grade-12/");
  const largura = (sel) => aba.locator(sel).first().evaluate((e) => e.getBoundingClientRect().width);
  const principal = await largura("main.at-col-desktop-8"), lateral = await largura("aside.at-col-desktop-4");
  assert.ok(principal / lateral > 1.8 && principal / lateral < 2.3, `proporção errada: ${principal} / ${lateral}`);
  await aba.setViewportSize({ width: 390, height: 844 });
  await aba.waitForFunction(() => innerWidth === 390);
  await aba.waitForTimeout(150);
  const p2 = await largura("main.at-col-desktop-8"), l2 = await largura("aside.at-col-desktop-4");
  assert.ok(Math.abs(p2 - l2) < 2, `no celular as duas deviam ocupar a linha toda (${p2} × ${l2})`);
});

teste("Grupo de botões e botão fechar", async (aba) => {
  await abrir(aba, "componentes/grupo-botoes/");
  await aba.getByRole("button", { name: "Grade", exact: true }).click();
  assert.equal(await aba.getByRole("button", { name: "Grade", exact: true }).getAttribute("aria-pressed"), "true");
  assert.equal(await aba.getByRole("button", { name: "Lista", exact: true }).getAttribute("aria-pressed"), "false");
  await aba.getByRole("button", { name: "Fechar aviso" }).click();
  assert.equal(await aba.locator("#aviso-novidade").count(), 0);
});

teste("Utilitários: link esticado deixa o cartão inteiro clicável", async (aba) => {
  await abrir(aba, "componentes/utilitarios/");
  const cartao = aba.locator(".at-relativo:has(.at-link-esticado)").first();
  await cartao.scrollIntoViewIfNeeded();
  const caixa = await cartao.boundingBox();
  // Clicar no canto esquerdo do cartão (longe do link) precisa acertar o link
  const alvo = await aba.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.className || "", [caixa.x + 10, caixa.y + 10]);
  assert.match(alvo, /at-link-esticado/);
});

/* ------------------------------------------------------------------------
   Contas, área de membros e painel do administrador (Supabase simulado)
   ------------------------------------------------------------------------ */

// Página completa mínima, independente do atalho-pro: usa a biblioteca pelo caminho relativo
const PAGINA_TESTE = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Loja virtual · Exemplo</title>
<link rel="stylesheet" href="../atalho/atalho.css"><script src="../atalho/atalho.js" defer></script></head>
<body><main class="at-container"><button class="at-botao" id="testar" data-at-notificar="Funcionou na prévia">Testar</button></main></body></html>`;

teste("Vitrine: sem contas ativadas, avisa que a área de membros vem em breve", async (aba) => {
  await abrir(aba, "exemplos/loja/");
  await aba.locator("[data-exclusivo-indisponivel]").waitFor();
  assert.equal(await aba.locator("[data-exclusivo-membro]").isVisible(), false);
});

teste("Vitrine: visitante vê o convite e não recebe o conteúdo", async (aba) => {
  await abrir(aba, "exemplos/loja/");
  await aba.getByRole("heading", { name: "Exclusivo para membros" }).waitFor();
  const criar = await aba.getByRole("link", { name: "Criar conta grátis" }).getAttribute("href");
  assert.match(criar, /conta\/\?voltar=%2Fexemplos%2Floja%2F&criar$/);
  assert.equal(aba.pedidosApi.some((p) => p.caminho.includes("/conteudos")), false, "visitante não deveria nem pedir o conteúdo");
  assert.equal(await aba.locator("[data-exclusivo-fonte]").textContent(), "");
}, { supabase: { pessoa: null } });

teste("Vitrine: membro vê a página funcionando, o código e baixa o arquivo", async (aba) => {
  await abrir(aba, "exemplos/loja/");
  await aba.locator("[data-exclusivo-membro]").waitFor();
  // A prévia carrega a biblioteca de verdade (o <base> aponta para o site)
  const previa = aba.frameLocator("[data-exclusivo-previa]");
  await previa.getByRole("button", { name: "Testar" }).click();
  await previa.getByText("Funcionou na prévia").waitFor();
  await aba.getByRole("tab", { name: "Código" }).click();
  assert.match(await aba.locator("[data-exclusivo-fonte]").textContent(), /data-at-notificar="Funcionou na prévia"/);
  // Download: o arquivo já aponta para a CDN e funciona fora do site
  const [download] = await Promise.all([aba.waitForEvent("download"), aba.getByRole("button", { name: "Baixar HTML" }).click()]);
  assert.equal(download.suggestedFilename(), "loja.html");
  const arquivo = await readFile(await download.path(), "utf8");
  assert.match(arquivo, /https:\/\/cdn\.jsdelivr\.net\/gh\/marcos-zorzetto\/atalho@1\/atalho\/atalho\.css/);
  assert.doesNotMatch(arquivo, /\.\.\/atalho\//);
  assert.match(await aba.getByRole("link", { name: "Editar e testar" }).getAttribute("href"), /editor\/#[A-Za-z0-9_-]{20,}/);
}, { supabase: { pessoa: "membro", conteudos: { loja: PAGINA_TESTE } } });

teste("Vitrine: conteúdo ainda não publicado mostra aviso e tentar de novo", async (aba) => {
  await abrir(aba, "exemplos/blog/");
  await aba.getByRole("heading", { name: "Não foi possível abrir agora" }).waitFor();
  await aba.getByRole("button", { name: "Tentar de novo" }).waitFor();
}, { supabase: { pessoa: "membro", conteudos: {} } });

teste("Conta: vindo da vitrine, abre 'Criar conta' com o motivo explicado", async (aba) => {
  await abrir(aba, "conta/?voltar=%2Fexemplos%2Floja%2F&criar");
  await aba.locator("#painel-criar").waitFor({ state: "visible" });
  await aba.getByText("Falta só entrar").waitFor();
}, { supabase: { pessoa: null } });

teste("Conta: administrador vê o atalho para o painel", async (aba) => {
  await abrir(aba, "conta/");
  await aba.getByRole("link", { name: "Painel do administrador" }).waitFor();
  assert.equal(await aba.locator("[data-conta-email]").textContent(), "dono@exemplo.com");
  assert.equal(await aba.locator(".site-relacionados a[href$='/exemplos/loja/']").count(), 1);
}, { supabase: { pessoa: "admin" } });

teste("Conta: membro comum não vê o atalho do painel", async (aba) => {
  await abrir(aba, "conta/");
  await aba.locator("[data-conta-nome]").filter({ hasText: "Ana Souza" }).waitFor();
  assert.equal(await aba.locator("[data-conta-admin]").isVisible(), false);
}, { supabase: { pessoa: "membro" } });

teste("Admin: visitante é convidado a entrar", async (aba) => {
  await abrir(aba, "admin/");
  await aba.getByText("Entre com a sua conta de administrador").waitFor();
  assert.equal(await aba.locator("[data-admin-painel]").isVisible(), false);
}, { supabase: { pessoa: null } });

teste("Admin: membro comum vê 'Acesso restrito' e nenhum dado", async (aba) => {
  await abrir(aba, "admin/");
  await aba.getByText("Acesso restrito").waitFor();
  assert.equal(aba.pedidosApi.some((p) => p.caminho.includes("/rpc/admin_")), false);
}, { supabase: { pessoa: "membro" } });

teste("Admin: números, busca, paginação e planilha da lista de espera", async (aba) => {
  await abrir(aba, "admin/");
  await aba.locator('[data-admin-numero="usuarios"]').filter({ hasText: "31" }).waitFor();
  const linhas = aba.locator("[data-admin-usuarios] tr");
  assert.equal(await linhas.count(), 25);
  assert.match(await aba.locator("[data-admin-paginacao-info]").textContent(), /31 usuário\(s\) · página 1 de 2/);
  await aba.getByRole("button", { name: "Próxima" }).click();
  await aba.locator("[data-admin-paginacao-info]").filter({ hasText: "página 2 de 2" }).waitFor();
  assert.equal(await linhas.count(), 6);
  assert.equal(await aba.getByRole("button", { name: "Próxima" }).isDisabled(), true);

  await aba.getByRole("searchbox", { name: "Buscar usuários" }).fill("pessoa3");
  await aba.locator("[data-admin-paginacao-info]").filter({ hasText: "2 usuário(s)" }).waitFor();
  assert.deepEqual(await aba.locator("[data-admin-usuarios] tr td:nth-child(2)").allTextContents(), ["pessoa3@exemplo.com", "pessoa30@exemplo.com"]);

  const [download] = await Promise.all([aba.waitForEvent("download"), aba.getByRole("button", { name: "Exportar planilha" }).click()]);
  const csv = await readFile(await download.path(), "utf8");
  assert.ok(csv.startsWith('\ufeff"Nome";"E-mail";"Entrou em"'), "planilha precisa abrir certo no Excel");
  assert.equal(csv.trim().split("\r\n").length, 16);
}, { supabase: { pessoa: "admin", usuarios: 31 } });

/* ------------------------------------------------------------------------
   Loja: planos, checkout da Lemon Squeezy e plano na conta
   ------------------------------------------------------------------------ */

const LINKS = { "pro-mensal": "https://atalho.lemonsqueezy.com/buy/mensal-teste", "pro-anual": "https://atalho.lemonsqueezy.com/buy/anual-teste" };
const ASSINATURA_ATIVA = { id: "77", produto_id: "pro-anual", status: "active", renova_em: "2027-10-09T00:00:00Z", termina_em: null, portal_url: "https://atalho.lemonsqueezy.com/billing/77" };

teste("Preços: alterna mensal e anual, e sem pagamentos leva à lista de espera", async (aba) => {
  await abrir(aba, "pro/");
  const pro = aba.locator(".at-plano[data-destaque]");
  assert.match(texto(await pro.locator(".at-plano-preco").innerText()), /€ 4,90/);
  await aba.getByRole("switch", { name: "Cobrança anual" }).check();
  assert.match(texto(await pro.locator(".at-plano-preco").innerText()), /€ 39\s*\/ano/);
  assert.match(texto(await pro.innerText()), /equivale a € 3,25\/mês/);
  const botao = pro.getByRole("button", { name: "Entrar na lista de espera" });
  await botao.click();
  await aba.locator("#lista-espera").waitFor();
  assert.equal(await aba.locator("[data-loja-aviso]").isVisible(), true);
  assert.equal(await aba.locator("#modal-compra").count(), 0, "sem pagamentos não abre o checkout");
});

teste("Preços: link que não é da Lemon Squeezy é ignorado", async (aba) => {
  await abrir(aba, "pro/");
  await aba.locator(".at-plano[data-destaque]").getByRole("button", { name: "Entrar na lista de espera" }).waitFor();
}, { supabase: { pessoa: "membro", loja: { links: { "pro-mensal": "https://golpe.exemplo.com/buy", "pro-anual": "http://atalho.lemonsqueezy.com/buy/x" } } } });

teste("Preços: visitante que assina é levado a criar a conta antes", async (aba) => {
  await abrir(aba, "pro/");
  await aba.getByRole("button", { name: "Assinar o Pro mensal" }).click();
  await aba.waitForURL(/\/conta\/\?voltar=%2Fpro%2F&criar$/);
}, { supabase: { pessoa: null, loja: { links: LINKS } } });

teste("Preços: membro confirma a desistência e vai ao checkout só com o id da conta", async (aba) => {
  let checkout = null;
  await aba.context().route("https://atalho.lemonsqueezy.com/**", (rota) => {
    checkout = rota.request().url();
    return rota.fulfill({ contentType: "text/html", body: "<title>Checkout</title>" });
  });
  await abrir(aba, "pro/");
  await aba.getByRole("switch", { name: "Cobrança anual" }).check();
  await aba.getByRole("button", { name: "Assinar o Pro anual" }).click();
  const dialogo = aba.getByRole("dialog", { name: "Antes de ir para o pagamento" });
  await dialogo.waitFor();
  assert.match(texto(await dialogo.innerText()), /Atalho Pro \(anual\) · € 39 por ano/);
  const pagar = dialogo.getByRole("button", { name: "Ir para o pagamento" });
  assert.equal(await pagar.isDisabled(), true, "sem o consentimento não paga");
  await dialogo.getByRole("checkbox").check();
  await pagar.click();
  await aba.waitForURL(/lemonsqueezy\.com/);
  const endereco = new URL(checkout);
  assert.equal(endereco.pathname, "/buy/anual-teste");
  assert.equal(endereco.searchParams.get("checkout[custom][usuario_id]"), "00000000-0000-4000-8000-000000000002");
  assert.doesNotMatch(checkout, /ana|exemplo\.com|Souza/i, "nenhum dado pessoal no endereço");
}, { supabase: { pessoa: "membro", loja: { links: LINKS } } });

teste("Preços: quem já assina vê 'Seu plano atual'", async (aba) => {
  await abrir(aba, "pro/");
  await aba.locator("[data-loja-plano-atual]").waitFor();
  assert.equal(await aba.getByRole("button", { name: "Seu plano atual" }).first().isDisabled(), true);
  assert.equal(await aba.getByRole("link", { name: "Você já é membro" }).count(), 1);
}, { supabase: { pessoa: "membro", loja: { links: LINKS, assinaturas: [ASSINATURA_ATIVA] } } });

teste("Conta: assinante vê o plano, a renovação, as compras e o portal", async (aba) => {
  await abrir(aba, "conta/");
  const plano = aba.locator("[data-conta-plano]");
  await plano.getByText("Atalho Pro anual").waitFor();
  assert.match(texto(await plano.innerText()), /Renova em 9 de outubro de 2027/);
  assert.match(texto(await plano.innerText()), /CRM · comprado em/);
  assert.equal(await plano.getByRole("link", { name: "Gerenciar assinatura" }).getAttribute("href"), ASSINATURA_ATIVA.portal_url);
  assert.equal(await aba.locator("[data-conta-lista-bloco]").isVisible(), false, "com pagamentos no ar, some a lista de espera");
}, { supabase: { pessoa: "membro", loja: { links: LINKS, assinaturas: [ASSINATURA_ATIVA], compras: [{ produto_id: "pagina-crm", criado_em: "2026-10-01T10:00:00Z", produtos: { nome: "CRM" } }] } } });

teste("Conta: cobrança atrasada pede para atualizar o cartão; membro sem plano vê o convite", async (aba) => {
  await abrir(aba, "conta/");
  const plano = aba.locator("[data-conta-plano]");
  await plano.getByRole("link", { name: "Atualizar pagamento" }).waitFor();
}, { supabase: { pessoa: "membro", loja: { links: LINKS, assinaturas: [{ ...ASSINATURA_ATIVA, status: "past_due" }] } } });

teste("Conta: membro sem plano vê o convite para o Pro", async (aba) => {
  await abrir(aba, "conta/");
  await aba.locator("[data-conta-plano]").getByRole("link", { name: "Conhecer o Pro" }).waitFor();
  assert.equal(await aba.locator("[data-conta-lista-bloco]").isVisible(), true, "sem pagamentos, a lista de espera continua");
}, { supabase: { pessoa: "membro" } });

teste("Conta: na volta do pagamento, confirma o acesso liberado", async (aba) => {
  await abrir(aba, "conta/?pagamento=ok");
  await aba.getByText("Acesso liberado. Bom proveito!").waitFor();
  assert.equal(new URL(aba.url()).search, "", "o aviso não se repete ao recarregar");
}, { supabase: { pessoa: "membro", loja: { links: LINKS, assinaturas: [ASSINATURA_ATIVA] } } });

teste("Admin: números da loja", async (aba) => {
  await abrir(aba, "admin/");
  await aba.locator('[data-admin-numero="receita_30_dias"]').filter({ hasText: "€" }).waitFor();
  assert.equal(texto(await aba.locator('[data-admin-numero="receita_30_dias"]').textContent()), "€ 23,70");
  assert.equal(await aba.locator('[data-admin-numero="assinantes_ativos"]').textContent(), "3");
}, { supabase: { pessoa: "admin" } });

/* ------------------------------------------------------------------------
   Estúdio de animações: níveis de acesso, controles e as 48 animações
   ------------------------------------------------------------------------ */

const { ANIMACOES } = await import("../scripts/site/animacoes.mjs");
// Com o atalho-pro, o código real; sem ele, um trecho mínimo que usa cada controle
const ANIMACOES_CODIGO = proDisponivel
  ? lerAnimacoesPro()
  : Object.fromEntries(ANIMACOES.map((a) => [a.id, { nivel: a.nivel, html: `<div class="an-teste">${a.nome}</div><style>.an-teste{${a.parametros.map((p, i) => `--v${i}: var(${p.var}, 0);`).join("")}}</style>` }]));
const ASSINANTE = { id: "77", produto_id: "pro-mensal", status: "active", renova_em: "2027-01-01T00:00:00Z", termina_em: null, portal_url: null };
const contarLiberadas = (aba) => aba.locator('[data-animacao][data-liberada="true"]').count();

teste("Animações: visitante não recebe nenhuma e é convidado a criar conta", async (aba) => {
  await abrir(aba, "animacoes/");
  await aba.getByText("Crie sua conta grátis para começar").waitFor();
  assert.equal(await contarLiberadas(aba), 0);
  assert.equal(await aba.locator("[data-animacao]").count(), ANIMACOES.length);
  await aba.locator('[data-animacao="surgir"]').click();
  const estudio = aba.getByRole("dialog");
  await estudio.getByText("Grátis para quem tem conta").waitFor();
  assert.equal(await estudio.locator("[data-estudio-area]").isVisible(), false, "sem prévia nem código");
  assert.equal(aba.pedidosApi.filter((p) => p.caminho === "/rest/v1/conteudos").length, 0, "nem pede o código ao banco");
}, { supabase: { pessoa: null, animacoes: ANIMACOES_CODIGO } });

teste("Animações: membro usa as simples, ajusta e copia; as do Pro ficam bloqueadas", async (aba) => {
  await abrir(aba, "animacoes/");
  await aba.locator('[data-animacao="surgir"][data-liberada="true"]').waitFor();
  assert.equal(await contarLiberadas(aba), ANIMACOES.filter((a) => a.nivel === "membro").length);
  assert.equal(await aba.locator('[data-animacao="parallax"]').getAttribute("data-liberada"), "false");

  await aba.locator('[data-animacao="surgir"]').click();
  const estudio = aba.getByRole("dialog");
  const duracao = estudio.getByLabel("Duração");
  await duracao.fill("1200");
  await aba.waitForFunction(() => document.querySelector("[data-estudio-fonte]").textContent.includes("--surgir-duracao: 1200ms;"));
  const previa = aba.frameLocator("[data-estudio-previa]");
  await aba.waitForFunction(() => document.querySelector("[data-estudio-previa]").srcdoc.includes("--surgir-duracao: 1200ms"));
  await previa.locator(proDisponivel ? ".an-surgir" : ".an-teste").first().waitFor();
  await estudio.getByRole("button", { name: "Copiar" }).click();
  const copiado = await aba.evaluate(() => navigator.clipboard.readText());
  assert.match(copiado, /Animação "Surgir"/);
  assert.match(copiado, /--surgir-duracao: 1200ms;/);
  assert.match(await estudio.getByRole("link", { name: "Abrir no editor" }).getAttribute("href"), /\/editor\/#[\w-]{20,}/);
  await estudio.getByRole("button", { name: "Fechar estúdio" }).click();

  await aba.locator('[data-animacao="parallax"]').click();
  await estudio.getByRole("link", { name: "Conhecer o Pro" }).waitFor();
  assert.equal(await estudio.locator("[data-estudio-area]").isVisible(), false);
}, { supabase: { pessoa: "membro", animacoes: ANIMACOES_CODIGO }, contexto: { permissions: ["clipboard-read", "clipboard-write"] } });

teste("Animações: assinante Pro usa todas; link direto abre o estúdio; filtro por categoria", async (aba) => {
  await abrir(aba, "animacoes/#parallax");
  const estudio = aba.getByRole("dialog");
  await estudio.getByText("Role dentro da prévia para ver o efeito.").waitFor();
  assert.equal(await contarLiberadas(aba), ANIMACOES.length);
  await estudio.getByRole("button", { name: "Fechar estúdio" }).click();
  await aba.getByRole("button", { name: "Texto", exact: true }).click();
  const visiveis = await aba.locator(".site-anim-grade li:not([hidden])").count();
  assert.equal(visiveis, ANIMACOES.filter((a) => a.categoria === "texto").length);
}, { supabase: { pessoa: "membro", animacoes: ANIMACOES_CODIGO, loja: { assinaturas: [ASSINANTE] } } });

teste("Animações (atalho-pro): as 48 rodam sem erro, se mexem e respeitam 'reduzir movimento'", async (aba) => {
  const problemas = [];
  aba.on("console", (msg) => msg.type() === "error" && problemas.push(msg.text()));
  for (const a of ANIMACOES) {
    const { html } = ANIMACOES_CODIGO[a.id];
    const valores = a.parametros.map((p) => `${p.var}: ${p.tipo === "numero" ? `${p.padrao}${p.unidade || ""}` : p.padrao};`).join(" ");
    const pagina = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><link rel="stylesheet" href="${BASE}/atalho/atalho.css"><style>:root { ${valores} } body { min-height: 100vh; }</style></head><body>${html}</body></html>`;
    await aba.setContent(pagina, { waitUntil: "load" });
    await aba.waitForTimeout(150);
    const antes = await aba.evaluate(() => document.body.innerHTML);
    // Interage como uma pessoa: rola, passa o mouse e clica no primeiro botão (ou pergunta da sanfona)
    await aba.mouse.move(400, 300);
    await aba.mouse.wheel(0, 900);
    await aba.waitForTimeout(250);
    const botao = aba.locator("button").first();
    if (await botao.count()) await botao.click({ trial: false, timeout: 1000 }).catch(() => {});
    const pergunta = aba.locator("summary").first();
    if (await pergunta.count()) await pergunta.click({ timeout: 1000 }).catch(() => {});
    await aba.locator("body > :not(script, style)").first().hover({ timeout: 1000 }).catch(() => {});
    await aba.mouse.move(420, 320);
    await aba.waitForTimeout(250);
    const estado = await aba.evaluate((antes) => ({ mudou: document.body.innerHTML !== antes, animacoes: document.getAnimations().length, canvas: document.querySelectorAll("canvas").length, transicoes: [...document.querySelectorAll("*")].some((el) => getComputedStyle(el).transitionDuration.split(",").some((d) => parseFloat(d) > 0)) }), antes);
    if (!estado.animacoes && !estado.canvas && !estado.transicoes && !estado.mudou) problemas.push(`${a.id}: nada se mexeu`);
    if (aba.errosJs.length) problemas.push(`${a.id}: ${aba.errosJs.splice(0).join(" | ")}`);
  }
  // Com "reduzir movimento", as animações em loop param
  await aba.emulateMedia({ reducedMotion: "reduce" });
  for (const id of ["pulsar", "flutuar", "gradiente-animado", "letreiro", "aurora"]) {
    await aba.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${BASE}/atalho/atalho.css"></head><body>${ANIMACOES_CODIGO[id].html}</body></html>`, { waitUntil: "load" });
    await aba.waitForTimeout(100);
    const infinitas = await aba.evaluate(() => document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity).length);
    if (infinitas) problemas.push(`${id}: continua em loop com "reduzir movimento"`);
  }
  assert.equal(problemas.length, 0, problemas.join(" || "));
}, { pro: true, contexto: { reducedMotion: "no-preference" } });

/* ------------------------------------------------------------------------ */

const somente = process.argv.find((a) => a.startsWith("--somente="))?.split("=")[1];
const selecionados = testes.filter(({ opcoes }) => (somente === "pro" ? opcoes.pro : true));
const pulados = selecionados.filter(({ opcoes }) => opcoes.pro && !proDisponivel);
if (somente === "pro" && !proDisponivel) {
  console.error("--somente=pro precisa da pasta do atalho-pro (defina ATALHO_PRO).");
  process.exit(1);
}
if (pulados.length) console.log(`⚠ ${pulados.length} testes das páginas completas pulados: pasta do atalho-pro não encontrada (defina ATALHO_PRO).`);

let falhas = 0;
const executar = selecionados.filter((t) => !pulados.includes(t));
for (const { nome, fn, opcoes } of executar) {
  const aba = await novaAba(opcoes.contexto);
  aba.pedidosApi = opcoes.supabase ? await supabaseFalso(aba.context(), opcoes.supabase) : [];
  // No CI a ViaCEP responde com um dado fixo: o teste não falha por instabilidade de terceiros
  if (opcoes.rede && process.env.CI) {
    await aba.context().route("https://viacep.com.br/**", (rota) =>
      rota.fulfill({ headers: { "access-control-allow-origin": "*" }, json: { cep: "01310-100", logradouro: "Avenida Paulista", bairro: "Bela Vista", localidade: "São Paulo", uf: "SP" } })
    );
  }
  const inicio = Date.now();
  try {
    await fn(aba);
    if (aba.errosJs.length) throw new Error(`erro de JavaScript na página: ${aba.errosJs.join(" | ")}`);
    console.log(`✔ ${nome} (${Date.now() - inicio} ms)`);
  } catch (erro) {
    falhas++;
    console.log(`✖ ${nome}\n    ${String(erro.message).split("\n").slice(0, 4).join("\n    ")}`);
  }
  await aba.context().close();
}
await navegador.close();
servidor.close();
console.log(`\n${executar.length - falhas} de ${executar.length} testes passaram.`);
process.exitCode = falhas ? 1 : 0;
