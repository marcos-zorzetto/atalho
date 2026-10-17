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
import { ilustracaoGrupo } from "./ilustracoes-grupos.mjs";

export const SISTEMAS = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "sistemas-catalogo.json"), "utf8"));

/** Áreas da página (por ordem de aparição): cor, frase e sistemas de cada uma. */
const GRUPOS = [
  { id: "vendas", titulo: "Vendas e clientes", cor: "#4f46e5", frase: "Do primeiro contacto à fatura pró-forma: clientes, propostas, encomendas, contratos e contas.", ids: ["crm", "orcamentos", "loja", "pedidos-orcamento", "encomendas-pastelaria", "compras", "contratos", "financas", "mediacao-seguros"] },
  { id: "marcacoes", titulo: "Marcações e reservas", cor: "#0f766e", frase: "Agenda online em que o cliente marca sozinho, sem sobreposições e com tudo num calendário.", ids: ["agendamentos", "reservas", "alojamento-local", "clinica", "veterinario", "ginasio", "eventos", "escola-conducao"] },
  { id: "restauracao", titulo: "Restauração e eventos", cor: "#c2410c", frase: "Menus com alergénios, encomendas e eventos por convidados, da cozinha à mesa.", ids: ["restaurante", "catering"] },
  { id: "atendimento", titulo: "Atendimento e serviços", cor: "#0369a1", frase: "Pedidos, reparações, talões e alugueres com um estado que o cliente consulta sem telefonar.", ids: ["helpdesk", "portal-cliente", "assistencia-tecnica", "oficina", "lavandaria", "aluguer-equipamentos", "reclamacoes"] },
  { id: "operacoes", titulo: "Operações e equipa", cor: "#a16207", frase: "Stock, projetos, obras, horas, frota e pessoas organizados em quadros e listas.", ids: ["inventario", "projetos", "obras", "folha-horas", "frota", "equipamentos-ti", "recrutamento", "formacao"] },
  { id: "imoveis", titulo: "Imóveis", cor: "#15803d", frase: "Imóveis à venda e para arrendar, condomínios, rendas e quotas com avisos de prazo.", ids: ["imobiliaria", "condominio", "arrendamentos"] },
  { id: "comunidades", titulo: "Comunidades e conteúdo", cor: "#be185d", frase: "Sócios, atletas, alunos, donativos, livros, artigos e listas de e-mail.", ids: ["associacao", "clube-desportivo", "donativos", "explicacoes", "biblioteca", "blog", "newsletter"] },
];
const OUTROS = { id: "outros", titulo: "Outros", cor: "#475569", frase: "Mais sistemas prontos a instalar.", ids: [] };

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
  const busca = [s.nome, s.descricao, grupo.titulo, ...s.tabelas, ...publicas].join(" ").toLowerCase();
  return `<article class="site-sistema" style="--sistema-cor: ${esc(s.cor)}" id="${esc(s.id)}" data-sistema data-grupo="${grupo.id}" data-busca="${esc(busca)}">
        <h3 class="site-sistema-nome">${esc(s.nome)}</h3>
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
  const grupos = GRUPOS.map((g) => {
    const lista = g.ids.map((i) => porId.get(i)).filter(Boolean);
    lista.forEach((s) => usados.add(s.id));
    return [g, lista];
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
          ${visiveis.map(([g, lista]) => `<button type="button" class="site-filtro" aria-pressed="false" data-sistemas-filtro="${g.id}">${esc(g.titulo)} <span>${lista.length}</span></button>`).join("")}
        </div>
      </div>
    </div>
    ${visiveis
      .map(
        ([g, lista]) => `<section class="site-secao-curta site-sistemas-grupo" data-sistemas-grupo="${g.id}" aria-labelledby="grupo-${g.id}" style="--grupo-cor: ${g.cor}">
      <div class="site-container">
        <header class="site-grupo-faixa">
          <div class="site-grupo-texto">
            <span class="site-grupo-contagem">${lista.length === 1 ? "1 sistema" : `${lista.length} sistemas`}</span>
            <h2 class="site-grupo-titulo" id="grupo-${g.id}">${esc(g.titulo)}</h2>
            <p class="site-grupo-frase">${esc(g.frase)}</p>
            <ul class="site-grupo-atalhos" aria-label="Sistemas de ${esc(g.titulo)}">${lista.map((s) => `<li><a href="#${esc(s.id)}">${esc(s.nome)}</a></li>`).join("")}</ul>
          </div>
          ${ilustracaoGrupo(g.id)}
        </header>
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
