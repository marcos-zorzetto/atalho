/**
 * /sistemas/: catálogo público dos sistemas completos do Atalho Pro.
 * Aqui só há descrições (geradas por atalho-pro/scripts/catalogo-publico.mjs);
 * o código chega do Supabase apenas a quem tem o Pro (site/sistemas.js).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { url, urlAbsoluta } from "./config.mjs";
import { pagina, SCRIPTS_SUPABASE } from "./layout.mjs";
import { esc } from "./realce.mjs";

export const SISTEMAS = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "sistemas-catalogo.json"), "utf8"));

/** Grupos para a página (por ordem de aparição). */
const GRUPOS = [
  ["Vendas e clientes", ["crm", "orcamentos", "loja", "pedidos-orcamento", "encomendas-pastelaria", "compras", "contratos", "financas"]],
  ["Marcações e reservas", ["agendamentos", "reservas", "alojamento-local", "clinica", "veterinario", "ginasio", "eventos"]],
  ["Atendimento e serviços", ["helpdesk", "portal-cliente", "assistencia-tecnica", "oficina", "reclamacoes"]],
  ["Operações e equipa", ["inventario", "projetos", "folha-horas", "frota", "equipamentos-ti", "recrutamento", "formacao"]],
  ["Imóveis", ["imobiliaria", "condominio", "arrendamentos"]],
  ["Comunidades e conteúdo", ["associacao", "donativos", "explicacoes", "biblioteca", "blog", "newsletter"]],
];

function cartao(s) {
  const p = s.publico;
  const publicas = [...p.formularios, ...p.listas, ...p.consultas];
  const selos = [
    `${s.tabelas.length} tabelas`,
    publicas.length && "Página para clientes",
    s.calendario && "Calendário",
    s.quadro && "Quadro",
    s.documentos.length && "PDF",
    s.linhas && "IVA por linha",
  ].filter(Boolean);
  return `<article class="site-sistema" style="--sistema-cor: ${esc(s.cor)}" id="${esc(s.id)}">
        <div class="site-sistema-topo"><span class="site-sistema-simbolo" aria-hidden="true"></span><h3>${esc(s.nome)}</h3></div>
        <p>${esc(s.descricao)}</p>
        <p class="site-sistema-tabelas"><span class="at-sr">Tabelas: </span>${s.tabelas.map(esc).join(" · ")}</p>
        ${publicas.length ? `<p class="site-sistema-publico">Para os seus clientes: ${publicas.map(esc).join(", ")}</p>` : ""}
        <ul class="site-sistema-selos" aria-label="Inclui">${selos.map((t) => `<li class="at-selo">${esc(t)}</li>`).join("")}</ul>
        <button class="at-botao at-pequeno at-primario" type="button" data-sistema-baixar="${esc(s.id)}" data-sistema-nome="${esc(s.nome)}">Descarregar (Pro)</button>
      </article>`;
}

export function paginaSistemas() {
  const total = SISTEMAS.length;
  const porId = new Map(SISTEMAS.map((s) => [s.id, s]));
  const usados = new Set();
  const grupos = GRUPOS.map(([titulo, ids]) => {
    const lista = ids.map((id) => porId.get(id)).filter(Boolean);
    lista.forEach((s) => usados.add(s.id));
    return [titulo, lista];
  });
  const outros = SISTEMAS.filter((s) => !usados.has(s.id));
  if (outros.length) grupos.push(["Outros", outros]);

  const conteudo = `
    <section class="site-cabecalho-pagina">
      <div class="site-container">
        <span class="at-sobretitulo">Atalho Pro</span>
        <h1 class="site-titulo site-h2">${total} sistemas completos, prontos a instalar</h1>
        <p class="at-chamada">CRM, marcações, orçamentos, loja, reservas, helpdesk, inventário e muito mais. Instala num passo em qualquer alojamento com PHP, sem base de dados para configurar, tudo em português de Portugal.</p>
      </div>
    </section>
    <section class="site-secao-curta">
      <div class="site-container">
        <ol class="site-passos-sistema">
          <li><strong>Descarregue o zip</strong> do sistema que quer (com o Pro).</li>
          <li><strong>Envie para o alojamento</strong> e extraia (no cPanel: File Manager → Upload → Extract).</li>
          <li><strong>Abra o endereço</strong>, escreva o nome do negócio e a sua palavra-passe. Pronto, com dados de exemplo.</li>
        </ol>
        <div class="site-recursos at-mt-6">
          <div class="site-recurso"><h3>Feito para Portugal</h3><p>NIF, IBAN, código postal, +351, euro e IVA a 23, 13 e 6%. MB WAY, Multibanco e transferência nas instruções de pagamento.</p></div>
          <div class="site-recurso"><h3>RGPD de origem</h3><p>Consentimento nos formulários, histórico de quem fez o quê, exportação dos dados de uma pessoa e anonimização com um clique.</p></div>
          <div class="site-recurso"><h3>Seguro</h3><p>Palavras-passe cifradas, proteção CSRF, limite de tentativas, cabeçalhos de segurança e base de dados fechada ao navegador.</p></div>
          <div class="site-recurso"><h3>Testado a sério</h3><p>Cada sistema é instalado e percorrido página a página num PHP 8.1 real e num navegador, com auditoria de acessibilidade, a cada mudança.</p></div>
        </div>
        <p class="at-texto-suave at-texto-pequeno at-mt-4">Os sistemas de faturação emitem orçamentos e faturas pró-forma; a fatura com valor fiscal sai do seu programa certificado pela AT.</p>
        <p class="at-texto-suave at-texto-pequeno" data-sistemas-aviso hidden></p>
      </div>
    </section>
    ${grupos
      .filter(([, lista]) => lista.length)
      .map(
        ([titulo, lista]) => `<section class="site-secao-curta">
      <div class="site-container">
        <h2 class="site-secao-titulo">${esc(titulo)}</h2>
        <div class="site-sistemas">
      ${lista.map(cartao).join("\n      ")}
        </div>
      </div>
    </section>`
      )
      .join("\n")}
    <section class="site-secao-curta">
      <div class="site-container at-centro">
        <h2 class="site-secao-titulo">Todos os sistemas no Pro</h2>
        <p>Os ${total} sistemas, as páginas completas e os componentes premium, com novidades todos os meses.</p>
        <a class="at-botao at-primario" href="${url("pro/")}">Ver planos e preços</a>
      </div>
    </section>`;

  return pagina({
    titulo: `${total} sistemas completos em PHP para o seu negócio · Atalho Pro`,
    descricao: `CRM, marcações, orçamentos, loja, reservas, helpdesk, inventário e mais ${total - 7}. Instalação num passo em alojamento PHP, em português de Portugal, com RGPD.`,
    caminho: "sistemas/",
    pagina: "sistemas",
    secao: "sistemas",
    conteudo,
    scripts: [...SCRIPTS_SUPABASE, "site/sistemas.js"],
    dadosEstruturados: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Sistemas completos do Atalho Pro",
      numberOfItems: total,
      itemListElement: SISTEMAS.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "SoftwareApplication", name: s.nome, description: s.descricao, applicationCategory: "BusinessApplication", operatingSystem: "PHP 8.1+", url: `${urlAbsoluta("sistemas/")}#${s.id}` },
      })),
    },
  });
}
