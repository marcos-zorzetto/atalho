/**
 * /sistemas/: catálogo público dos sistemas completos do Atalho Pro.
 * Aqui só há descrições (geradas por atalho-pro/scripts/catalogo-publico.mjs);
 * o código chega do Supabase apenas a quem tem o Pro (site/sistemas.js).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, url, urlAbsoluta } from "./config.mjs";
import { pagina, SCRIPTS_SUPABASE } from "./layout.mjs";
import { esc } from "./realce.mjs";

export const SISTEMAS = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "sistemas-catalogo.json"), "utf8"));

/** Grupos para a página (por ordem de aparição), com o ícone de cada um (traço 24×24). */
const GRUPOS = [
  ["vendas", "Vendas e clientes", '<path d="M3 4h2l2.4 11h11L21 7H7"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>', ["crm", "orcamentos", "loja", "pedidos-orcamento", "encomendas-pastelaria", "compras", "contratos", "financas", "mediacao-seguros"]],
  ["marcacoes", "Marcações e reservas", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3"/>', ["agendamentos", "reservas", "alojamento-local", "clinica", "veterinario", "ginasio", "eventos", "escola-conducao"]],
  ["restauracao", "Restauração e eventos", '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2.5-3 6h3v12"/>', ["restaurante", "catering"]],
  ["atendimento", "Atendimento e serviços", '<path d="M4 13a8 8 0 0 1 16 0"/><rect x="2" y="13" width="4" height="6" rx="1.5"/><rect x="18" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a3 3 0 0 1-3 3h-3"/>', ["helpdesk", "portal-cliente", "assistencia-tecnica", "oficina", "lavandaria", "aluguer-equipamentos", "reclamacoes"]],
  ["operacoes", "Operações e equipa", '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/>', ["inventario", "projetos", "obras", "folha-horas", "frota", "equipamentos-ti", "recrutamento", "formacao"]],
  ["imoveis", "Imóveis", '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>', ["imobiliaria", "condominio", "arrendamentos"]],
  ["comunidades", "Comunidades e conteúdo", '<circle cx="8" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M2 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M14.5 15.5c1-.7 1.9-1 2.5-1 2.5 0 4.5 1.7 5 5"/>', ["associacao", "clube-desportivo", "donativos", "explicacoes", "biblioteca", "blog", "newsletter"]],
];
const icone = (traco) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${traco}</svg>`;
const OUTROS = ["outros", "Outros", '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>'];

/** Recursos sempre pela mesma ordem, para os cartões se lerem de relance. */
function recursos(s) {
  const publicas = [...s.publico.formularios, ...s.publico.listas, ...s.publico.consultas];
  return [
    ["Página para clientes", publicas.length > 0],
    ["Calendário", Boolean(s.calendario)],
    ["Quadro", Boolean(s.quadro)],
    ["PDF", s.documentos.length > 0],
    ["IVA por linha", Boolean(s.linhas)],
  ].filter(([, tem]) => tem);
}

function cartao(s, grupo) {
  const publicas = [...s.publico.formularios, ...s.publico.listas, ...s.publico.consultas];
  const busca = [s.nome, s.descricao, grupo[1], ...s.tabelas, ...publicas].join(" ").toLowerCase();
  return `<article class="site-sistema" style="--sistema-cor: ${esc(s.cor)}" id="${esc(s.id)}" data-sistema data-grupo="${grupo[0]}" data-busca="${esc(busca)}">
        <header class="site-sistema-topo">
          <span class="site-sistema-simbolo">${icone(grupo[2])}</span>
          <div><h3>${esc(s.nome)}</h3><span class="site-sistema-grupo">${esc(grupo[1])}</span></div>
        </header>
        <p class="site-sistema-descricao">${esc(s.descricao)}</p>
        <ul class="site-sistema-selos" aria-label="Inclui">${recursos(s).map(([t]) => `<li>${esc(t)}</li>`).join("")}</ul>
        <details class="site-sistema-detalhes">
          <summary>O que inclui</summary>
          <dl>
            <dt>Tabelas (${s.tabelas.length})</dt><dd>${s.tabelas.map(esc).join(" · ")}</dd>
            ${publicas.length ? `<dt>Para os seus clientes</dt><dd>${publicas.map(esc).join(" · ")}</dd>` : ""}
            ${s.documentos.length ? `<dt>Documentos</dt><dd>${s.documentos.map((d) => esc(typeof d === "string" ? d : d.nome || d.titulo || "PDF")).join(" · ")}</dd>` : ""}
          </dl>
        </details>
        <footer class="site-sistema-rodape">
          <span class="site-sistema-tabelas">${s.tabelas.length} tabelas</span>
          <button class="at-botao at-pequeno at-primario" type="button" data-sistema-baixar="${esc(s.id)}" data-sistema-nome="${esc(s.nome)}">Descarregar (Pro)</button>
        </footer>
      </article>`;
}

export function paginaSistemas() {
  const total = SISTEMAS.length;
  const porId = new Map(SISTEMAS.map((s) => [s.id, s]));
  const usados = new Set();
  const grupos = GRUPOS.map(([id, titulo, traco, ids]) => {
    const lista = ids.map((i) => porId.get(i)).filter(Boolean);
    lista.forEach((s) => usados.add(s.id));
    return [[id, titulo, traco], lista];
  });
  const outros = SISTEMAS.filter((s) => !usados.has(s.id));
  if (outros.length) grupos.push([OUTROS, outros]);
  const visiveis = grupos.filter(([, lista]) => lista.length);

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
          <li><strong>Ajuste ao seu negócio</strong> em Personalizar: nomes, campos, opções e textos da página pública, sem programar.</li>
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
    <div class="site-sistemas-barra" data-sistemas-barra>
      <div class="site-container">
        <div class="site-sistemas-procura">
          <label class="at-sr" for="procurar-sistema">Procurar sistema</label>
          <input class="at-entrada" id="procurar-sistema" type="search" placeholder="Procurar: faturas, marcações, stock…" autocomplete="off" data-sistemas-procura>
          <span class="site-sistemas-contagem" data-sistemas-contagem aria-live="polite">${total} sistemas</span>
        </div>
        <div class="site-sistemas-filtros" role="group" aria-label="Filtrar por área">
          <button type="button" class="site-filtro" aria-pressed="true" data-sistemas-filtro="todos">Todos <span>${total}</span></button>
          ${visiveis.map(([g, lista]) => `<button type="button" class="site-filtro" aria-pressed="false" data-sistemas-filtro="${g[0]}">${esc(g[1])} <span>${lista.length}</span></button>`).join("")}
        </div>
      </div>
    </div>
    ${visiveis
      .map(
        ([g, lista]) => `<section class="site-secao-curta site-sistemas-grupo" data-sistemas-grupo="${g[0]}" aria-labelledby="grupo-${g[0]}">
      <div class="site-container">
        <h2 class="site-secao-titulo site-sistemas-titulo" id="grupo-${g[0]}"><span class="site-sistemas-titulo-icone">${icone(g[2])}</span>${esc(g[1])} <small>${lista.length}</small></h2>
        <div class="site-sistemas">
      ${lista.map((s) => cartao(s, g)).join("")}
        </div>
      </div>
    </section>`
      )
      .join("")}
    <section class="site-secao-curta" data-sistemas-vazio hidden>
      <div class="site-container at-centro"><p>Nenhum sistema com esse nome. Experimente "faturas", "reservas" ou "stock", ou <a href="${SITE.repositorio}/issues/new?title=${encodeURIComponent("Sistema: ")}">peça o seu</a>.</p></div>
    </section>
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
