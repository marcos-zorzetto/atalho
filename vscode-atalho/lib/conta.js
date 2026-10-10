/**
 * Conta do Atalho na extensão: login no Supabase pela API REST, com a mesma
 * chave publicável do site. Só o "refresh token" é guardado, no cofre de
 * segredos do VS Code (SecretStorage); o token de acesso fica só na memória.
 * Quem decide o que cada pessoa recebe é o banco (RLS), não a extensão.
 */
"use strict";

const ERROS = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar (veja a caixa de entrada e o spam).",
  over_request_rate_limit: "Muitas tentativas. Espere alguns minutos e tente de novo.",
  user_banned: "Esta conta está bloqueada. Fale com o suporte.",
};

class ErroConta extends Error {}

class Conta {
  /**
   * @param {{ url: string, chavePublica: string, cofre: { ler(): Promise<string|undefined>, gravar(v: string): Promise<void>, apagar(): Promise<void> }, fetch?: typeof fetch, agora?: () => number }} opcoes
   */
  constructor({ url, chavePublica, cofre, fetch: f = globalThis.fetch, agora = Date.now }) {
    this.url = url.replace(/\/$/, "");
    this.chave = chavePublica;
    this.cofre = cofre;
    this.fetch = f;
    this.agora = agora;
    this.sessao = null; // { acesso, expiraEm, email }
  }

  async pedir(caminho, { metodo = "GET", corpo, autenticado = false } = {}) {
    const cabecalhos = { apikey: this.chave, "Content-Type": "application/json" };
    if (autenticado) cabecalhos.Authorization = `Bearer ${await this.tokenValido()}`;
    let resposta;
    try {
      resposta = await this.fetch(this.url + caminho, { method: metodo, headers: cabecalhos, body: corpo ? JSON.stringify(corpo) : undefined });
    } catch {
      throw new ErroConta("Sem conexão com o Atalho. Confira sua internet.");
    }
    const texto = await resposta.text();
    const dados = texto ? JSON.parse(texto) : null;
    if (!resposta.ok) {
      const codigo = dados && (dados.error_code || dados.code || dados.error);
      throw new ErroConta(ERROS[codigo] || (dados && (dados.msg || dados.message || dados.error_description)) || `Erro ${resposta.status}`);
    }
    return dados;
  }

  async guardar(dados) {
    this.sessao = { acesso: dados.access_token, expiraEm: this.agora() + dados.expires_in * 1000, email: dados.user && dados.user.email };
    await this.cofre.gravar(dados.refresh_token);
    return this.sessao;
  }

  async entrar(email, senha) {
    return this.guardar(await this.pedir("/auth/v1/token?grant_type=password", { metodo: "POST", corpo: { email, password: senha } }));
  }

  /** Recupera a sessão guardada. Devolve null se não houver ou se tiver expirado. */
  async restaurar() {
    const renovacao = await this.cofre.ler();
    if (!renovacao) return null;
    try {
      return await this.guardar(await this.pedir("/auth/v1/token?grant_type=refresh_token", { metodo: "POST", corpo: { refresh_token: renovacao } }));
    } catch (erro) {
      // Token recusado (conta excluída, senha trocada…): esquece. Sem internet: mantém para a próxima vez.
      if (!/conexão/.test(erro.message)) await this.cofre.apagar();
      return null;
    }
  }

  async tokenValido() {
    if (!this.sessao) throw new ErroConta("Entre na sua conta do Atalho.");
    if (this.sessao.expiraEm - this.agora() < 60_000) {
      const renovada = await this.restaurar();
      if (!renovada) {
        this.sessao = null;
        throw new ErroConta("Sua sessão expirou. Entre de novo.");
      }
    }
    return this.sessao.acesso;
  }

  async sair() {
    if (this.sessao) await this.pedir("/auth/v1/logout", { metodo: "POST", autenticado: true }).catch(() => {});
    this.sessao = null;
    await this.cofre.apagar();
  }

  async temPro() {
    return (await this.pedir("/rest/v1/rpc/tem_pro", { metodo: "POST", corpo: {}, autenticado: true })) === true;
  }

  /** Administrador do Atalho (vê tudo, como no site). */
  async ehAdmin() {
    return (await this.pedir("/rest/v1/rpc/eh_admin", { metodo: "POST", corpo: {}, autenticado: true })) === true;
  }

  /** Componentes avançados e animações que o banco libera para esta pessoa. */
  async conteudos() {
    return this.pedir("/rest/v1/conteudos?select=id,tipo,html&tipo=in.(componente,animacao)&order=id", { autenticado: true });
  }
}

module.exports = { Conta, ErroConta };
