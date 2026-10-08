/*
 * Conexão com o Supabase usada pela conta, pela área de membros e pelo painel
 * do administrador. Carregado depois do supabase-js e do site/config.js.
 *
 * Segurança: aqui só existe a chave PÚBLICA. Quem decide o que cada pessoa pode
 * ler são as regras do banco (servicos/supabase/schema.sql), não este arquivo.
 */
(function () {
  "use strict";

  const config = (window.ATALHO_CONFIG || {}).supabase || {};
  const ativo = Boolean(config.url && config.chavePublica && window.supabase);

  const TRADUCOES = [
    [/invalid login credentials/i, "E-mail ou senha incorretos."],
    [/email not confirmed/i, "Confirme seu e-mail pelo link que enviamos antes de entrar."],
    [/user already registered|already been registered/i, "Já existe uma conta com esse e-mail. Tente entrar."],
    [/password should be at least/i, "A senha precisa ter pelo menos 8 caracteres."],
    [/same.*password|different from the old/i, "A nova senha precisa ser diferente da atual."],
    [/email address not authorized/i, "O envio de e-mails ainda não foi configurado no site. Tente mais tarde."],
    [/rate limit|too many requests|security purposes/i, "Muitas tentativas seguidas. Aguarde um minuto e tente de novo."],
    [/acesso restrito|permission denied|42501/i, "Acesso restrito ao administrador."],
    [/jwt|token.*(expired|invalid)|session.*missing/i, "Sua sessão expirou. Entre de novo."],
    [/network|fetch/i, "Sem conexão com o servidor. Confira sua internet."],
    [/weak password|pwned|leaked/i, "Essa senha é fraca ou já apareceu em vazamentos. Escolha outra."],
  ];
  const traduzir = (erro) => {
    const mensagem = `${erro?.message || erro || ""} ${erro?.code || ""}`;
    return (TRADUCOES.find(([padrao]) => padrao.test(mensagem)) || [, "Algo deu errado. Tente de novo em instantes."])[1];
  };

  const notificar = (texto, tipo = "info", extras = {}) => window.Atalho.notificar(texto, { tipo, ...extras });

  const cliente = ativo
    ? window.supabase.createClient(config.url, config.chavePublica, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

  /** Usuário da sessão guardada no navegador (renova o acesso sozinho se precisar). */
  async function usuario() {
    if (!cliente) return null;
    const { data } = await cliente.auth.getSession();
    return data.session?.user || null;
  }

  /** Endereço da página de conta que volta para a página atual depois do login. */
  function linkConta({ criar = false } = {}) {
    const base = document.body.dataset.base || "/";
    const parametros = new URLSearchParams({ voltar: location.pathname });
    if (criar) parametros.set("criar", "");
    return `${base}conta/?${parametros.toString().replace(/criar=$/, "criar")}`;
  }

  const projeto = ativo ? new URL(config.url).hostname.split(".")[0] : "";

  window.AtalhoSupabase = { ativo, cliente, traduzir, notificar, usuario, linkConta, projeto };
})();
