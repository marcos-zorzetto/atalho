#!/usr/bin/env node
/**
 * Testes de ponta a ponta: um navegador de verdade clica, digita, arrasta e usa
 * o teclado como uma pessoa faria, nos componentes e nas páginas de exemplo.
 *
 * Uso: node testes/interacoes.mjs   (gere antes: node scripts/gerar-site.mjs --local)
 */
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { RAIZ } from "../scripts/docs.mjs";

const DIST = path.join(RAIZ, "dist");
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const servidor = createServer(async (req, res) => {
  let caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (caminho.endsWith("/")) caminho += "index.html";
  const arquivo = path.join(DIST, caminho);
  try {
    if (!arquivo.startsWith(DIST) || !(await stat(arquivo)).isFile()) throw new Error();
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
  const aba = await contexto.newPage();
  aba.errosJs = [];
  aba.on("pageerror", (erro) => aba.errosJs.push(erro.message));
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
  await aba.waitForFunction(() => document.querySelector("#menu-projeto").matches(":popover-open"));
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
});

teste("Exemplo Landing: anual muda o preço", async (aba) => {
  await abrir(aba, "exemplos/landing-saas.html");
  const preco = aba.locator('[data-at-texto="precos.pro"]');
  assert.equal(texto(await preco.innerText()), "R$ 79,00");
  await aba.getByRole("switch", { name: "Cobrança anual" }).check();
  assert.equal(texto(await preco.innerText()), "R$ 65,83");
});

teste("Exemplo Painel: Ctrl+K e ordenação", async (aba) => {
  await abrir(aba, "exemplos/painel.html");
  await aba.keyboard.press("Control+k");
  assert.equal(await aba.locator("#paleta").evaluate((d) => d.open), true);
  await aba.keyboard.press("Escape");
  await aba.locator("#pedidos thead").getByRole("button", { name: "Cliente" }).click();
  assert.equal(await aba.locator("#pedidos tbody tr:not([hidden]) td:nth-child(2)").first().innerText(), "Ana Costa");
});

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
}, { rede: true });

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

/* ------------------------------------------------------------------------ */

let falhas = 0;
for (const { nome, fn, opcoes } of testes) {
  const aba = await novaAba(opcoes.contexto);
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
console.log(`\n${testes.length - falhas} de ${testes.length} testes passaram.`);
process.exitCode = falhas ? 1 : 0;
