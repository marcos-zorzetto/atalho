import { url } from "./config.mjs";
import { pagina, SCRIPTS_SUPABASE } from "./layout.mjs";

/**
 * Painel do administrador. A página é pública (é só HTML), mas os dados vêm de
 * funções do banco que conferem se quem pediu é administrador (eh_admin()).
 * Sem essa permissão, o navegador não recebe nenhum dado.
 */
export function paginaAdmin() {
  const indicador = (chave, rotulo) =>
    `<div class="at-indicador"><span class="at-indicador-rotulo">${rotulo}</span><strong class="at-indicador-valor" data-admin-numero="${chave}">–</strong><span class="at-indicador-variacao" data-admin-detalhe="${chave}"></span></div>`;

  const conteudo = `
    <div class="site-container site-admin" data-admin>
      <header class="site-admin-topo">
        <div>
          <span class="at-sobretitulo">Administração</span>
          <h1 class="site-titulo site-h2">Painel do administrador</h1>
          <p class="at-texto-suave" data-admin-quem></p>
        </div>
        <div class="at-linha" data-admin-acoes hidden>
          <button type="button" class="at-botao at-pequeno" data-admin-atualizar>Atualizar</button>
          <a class="at-botao at-pequeno" data-admin-supabase target="_blank" rel="noopener">Abrir no Supabase</a>
        </div>
      </header>

      <div data-admin-estado="carregando" aria-live="polite">
        <div data-admin-carregando><span class="at-carregando" aria-hidden="true"></span> <span class="at-texto-suave">Conferindo sua permissão…</span></div>
        <div class="at-alerta at-aviso" data-admin-indisponivel hidden><div class="at-alerta-conteudo"><strong>Contas ainda não ativadas</strong><p>Configure o Supabase em <code>site/config.js</code> seguindo o guia <code>servicos/LEIA-ME.md</code>.</p></div></div>
        <div class="at-alerta" data-admin-entrar hidden><div class="at-alerta-conteudo"><strong>Entre com a sua conta de administrador</strong><p><a class="at-botao at-primario at-pequeno at-mt-2" href="${url("conta/")}?voltar=${encodeURIComponent(url("admin/"))}">Entrar</a></p></div></div>
        <div class="at-alerta at-perigo" data-admin-negado hidden><div class="at-alerta-conteudo"><strong>Acesso restrito</strong><p>Esta conta não é de administrador. <a href="${url("conta/")}">Voltar para minha conta</a>.</p></div></div>
        <div class="at-alerta at-perigo" data-admin-erro hidden><div class="at-alerta-conteudo"><strong>Não foi possível carregar o painel</strong><p data-admin-erro-texto></p></div></div>
      </div>

      <div class="at-pilha site-admin-painel" data-admin-painel hidden>
        <div class="at-colunas-4" style="--min: 200px">
          ${indicador("usuarios", "Usuários")}
          ${indicador("novos_7_dias", "Novos em 7 dias")}
          ${indicador("ativos_30_dias", "Ativos em 30 dias")}
          ${indicador("lista_espera", "Lista do Atalho Pro")}
        </div>

        <div class="at-colunas-4" style="--min: 200px" aria-label="Loja">
          ${indicador("assinantes_ativos", "Assinantes Pro")}
          ${indicador("compras_avulsas", "Compras avulsas")}
          ${indicador("receita_30_dias", "Receita em 30 dias")}
          ${indicador("receita_total", "Receita total")}
        </div>

        <section class="at-cartao">
          <div class="at-cartao-cabecalho"><h2>Cadastros nos últimos 30 dias</h2><span class="at-selo" data-admin-total-periodo></span></div>
          <div class="at-cartao-corpo">
            <div class="site-admin-grafico" role="img" data-admin-grafico></div>
          </div>
        </section>

        <section class="at-cartao">
          <div class="at-cartao-cabecalho site-admin-cabecalho">
            <h2>Usuários</h2>
            <div class="at-entrada-icone site-admin-busca"><span class="at-icone-campo" aria-hidden="true">⌕</span><input class="at-entrada" type="search" placeholder="Buscar por nome ou e-mail" aria-label="Buscar usuários" data-admin-busca></div>
          </div>
          <div class="at-tabela-caixa" tabindex="0" role="region" aria-label="Lista de usuários">
            <table class="at-tabela">
              <thead><tr><th>Nome</th><th>E-mail</th><th>Cadastro</th><th>Último acesso</th><th>Situação</th><th class="at-direita">Favoritos</th></tr></thead>
              <tbody data-admin-usuarios></tbody>
            </table>
          </div>
          <nav class="at-paginacao site-admin-paginacao" aria-label="Páginas de usuários">
            <span class="at-paginacao-info" data-admin-paginacao-info></span>
            <div class="at-paginacao-botoes">
              <button type="button" class="at-botao at-pequeno" data-admin-pagina="-1">Anterior</button>
              <button type="button" class="at-botao at-pequeno" data-admin-pagina="1">Próxima</button>
            </div>
          </nav>
        </section>

        <div class="at-colunas-2" style="--min: 320px">
          <section class="at-cartao">
            <div class="at-cartao-cabecalho"><h2>Lista de espera do Pro</h2><button type="button" class="at-botao at-pequeno" data-admin-exportar>Exportar planilha</button></div>
            <div class="at-tabela-caixa" tabindex="0" role="region" aria-label="Lista de espera do Atalho Pro">
              <table class="at-tabela"><thead><tr><th>Nome</th><th>E-mail</th><th>Entrou em</th></tr></thead><tbody data-admin-lista></tbody></table>
            </div>
          </section>
          <section class="at-cartao">
            <div class="at-cartao-cabecalho"><h2>Conteúdo exclusivo</h2><span class="at-selo" data-admin-total-conteudos></span></div>
            <div class="at-tabela-caixa" tabindex="0" role="region" aria-label="Conteúdo exclusivo publicado">
              <table class="at-tabela"><thead><tr><th>Página</th><th>Atualizada em</th><th class="at-direita">Tamanho</th></tr></thead><tbody data-admin-conteudos></tbody></table>
            </div>
          </section>
        </div>

        <p class="at-texto-suave at-texto-pequeno">Para excluir, bloquear ou reenviar a confirmação de um usuário, use a área <strong>Authentication</strong> do Supabase (botão “Abrir no Supabase”). Os dados desta página são pessoais: não compartilhe capturas de tela com e-mails visíveis (RGPD e LGPD).</p>
      </div>
    </div>`;

  return pagina({
    titulo: "Painel do administrador · Atalho",
    descricao: "Área restrita do administrador do Atalho: usuários, cadastros, lista de espera do Pro e conteúdo exclusivo.",
    caminho: "admin/",
    pagina: "admin",
    secao: "",
    indexar: false,
    conteudo,
    scripts: [...SCRIPTS_SUPABASE, "site/admin.js"],
  });
}
