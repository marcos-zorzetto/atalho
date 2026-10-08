/*
 * Contas do Atalho (Supabase). Carregado só nas páginas /conta/ e /pro/.
 * Sem configuração em site/config.js, mostra "Contas em breve" e não quebra nada.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const config = (window.ATALHO_CONFIG || {}).supabase || {};
  const base = document.body.dataset.base || "/";
  const pagina = document.body.dataset.pagina;

  const TRADUCOES = [
    [/invalid login credentials/i, "E-mail ou senha incorretos."],
    [/email not confirmed/i, "Confirme seu e-mail pelo link que enviamos antes de entrar."],
    [/user already registered|already been registered/i, "Já existe uma conta com esse e-mail. Tente entrar."],
    [/password should be at least/i, "A senha precisa ter pelo menos 8 caracteres."],
    [/rate limit|too many requests|security purposes/i, "Muitas tentativas seguidas. Aguarde um minuto e tente de novo."],
    [/network|fetch/i, "Sem conexão com o servidor. Confira sua internet."],
    [/weak password|pwned|leaked/i, "Essa senha é fraca ou já apareceu em vazamentos. Escolha outra."],
  ];
  const traduzir = (erro) => {
    const mensagem = String(erro?.message || erro || "");
    return (TRADUCOES.find(([padrao]) => padrao.test(mensagem)) || [, "Algo deu errado. Tente de novo em instantes."])[1];
  };
  const notificar = (texto, tipo = "info", titulo) => window.Atalho.notificar(texto, { tipo, titulo });

  if (!config.url || !config.chavePublica || !window.supabase) {
    if (pagina === "conta") $("[data-conta-indisponivel]").hidden = false;
    if (pagina === "pro") {
      const estado = $("[data-lista-espera-estado]");
      if (estado) estado.textContent = "A lista de espera abre em breve. Volte daqui a alguns dias!";
    }
    return;
  }

  const cliente = window.supabase.createClient(config.url, config.chavePublica, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  const iniciais = (nome) =>
    String(nome || "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  async function usuarioAtual() {
    const { data } = await cliente.auth.getUser();
    return data.user || null;
  }

  /* ------------------------------------------------------------------------
     Página /conta/
     ------------------------------------------------------------------------ */

  async function mostrarPainel(usuario) {
    $("[data-conta-visitante]").hidden = true;
    $("[data-conta-logado]").hidden = false;

    const { data: perfil } = await cliente.from("perfis").select("nome").eq("id", usuario.id).maybeSingle();
    const nome = perfil?.nome || usuario.user_metadata?.nome || usuario.email.split("@")[0];
    $("[data-conta-nome]").textContent = nome;
    $("[data-conta-email]").textContent = usuario.email;
    $("[data-conta-iniciais]").textContent = iniciais(nome);

    const { data: favoritos, error } = await cliente.from("favoritos").select("componente_id").order("criado_em", { ascending: false });
    const indice = new Map((window.ATALHO_INDICE || []).map((c) => [c.id, c]));
    const lista = $("[data-conta-favoritos]");
    lista.textContent = "";
    for (const { componente_id } of error ? [] : favoritos) {
      const c = indice.get(componente_id);
      if (!c) continue;
      const link = document.createElement("a");
      link.href = c.url;
      link.innerHTML = "<strong></strong><span></span>";
      link.querySelector("strong").textContent = c.nome;
      link.querySelector("span").textContent = c.resumo;
      lista.append(link);
    }
    $("[data-conta-sem-favoritos]").hidden = lista.children.length > 0;

    const chave = $("[data-conta-lista-espera]");
    const { data: naLista } = await cliente.from("lista_espera_pro").select("usuario_id").maybeSingle();
    chave.checked = Boolean(naLista);
    chave.onchange = async () => {
      const operacao = chave.checked
        ? cliente.from("lista_espera_pro").insert({})
        : cliente.from("lista_espera_pro").delete().eq("usuario_id", usuario.id);
      const { error: erroLista } = await operacao;
      if (erroLista) {
        chave.checked = !chave.checked;
        notificar(traduzir(erroLista), "perigo");
      } else {
        notificar(chave.checked ? "Você está na lista do Atalho Pro." : "Você saiu da lista do Atalho Pro.", "sucesso");
      }
    };
  }

  function mostrarVisitante() {
    $("[data-conta-visitante]").hidden = false;
    $("[data-conta-logado]").hidden = true;
  }

  function voltarOuRecarregar() {
    const voltar = new URLSearchParams(location.search).get("voltar");
    // Só volta para páginas do próprio site (evita redirecionamento aberto)
    if (voltar && voltar.startsWith(base) && !voltar.startsWith("//")) location.href = voltar;
    else location.reload();
  }

  async function iniciarPaginaConta() {
    const usuario = await usuarioAtual();
    if (usuario) await mostrarPainel(usuario);
    else mostrarVisitante();

    $("#form-entrar").addEventListener("at:enviar", async (evento) => {
      const { dados, botao } = evento.detail;
      botao.setAttribute("aria-busy", "true");
      const { error } = await cliente.auth.signInWithPassword({ email: dados.email, password: dados.senha });
      botao.removeAttribute("aria-busy");
      if (error) return notificar(traduzir(error), "perigo");
      voltarOuRecarregar();
    });

    $("#form-criar").addEventListener("at:enviar", async (evento) => {
      const { dados, botao, formulario } = evento.detail;
      botao.setAttribute("aria-busy", "true");
      const { data, error } = await cliente.auth.signUp({
        email: dados.email,
        password: dados.senha,
        options: { data: { nome: dados.nome.trim() }, emailRedirectTo: `${location.origin}${base}conta/` },
      });
      botao.removeAttribute("aria-busy");
      if (error) return notificar(traduzir(error), "perigo");
      if (data.session) return voltarOuRecarregar();
      formulario.reset();
      notificar(`Enviamos um link de confirmação para ${dados.email}. Abra o e-mail para ativar sua conta.`, "sucesso", "Quase lá!");
    });

    $("[data-esqueci-senha]").addEventListener("click", async () => {
      const email = $("#entrar-email").value.trim();
      if (!window.Atalho.validar.email(email)) {
        $("#entrar-email").focus();
        return notificar("Digite seu e-mail no campo acima e clique de novo.", "aviso");
      }
      const { error } = await cliente.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${base}conta/` });
      notificar(error ? traduzir(error) : `Se existir uma conta com ${email}, você vai receber um link para criar uma nova senha.`, error ? "perigo" : "sucesso");
    });

    $("[data-sair]").addEventListener("click", async () => {
      await cliente.auth.signOut();
      location.reload();
    });

    $("#modal-excluir-conta").addEventListener("close", async (evento) => {
      if (evento.target.returnValue !== "excluir") return;
      evento.target.returnValue = "";
      const { error } = await cliente.rpc("excluir_minha_conta");
      if (error) return notificar(traduzir(error), "perigo");
      await cliente.auth.signOut();
      notificar("Sua conta e todos os seus dados foram apagados.", "sucesso");
      setTimeout(() => (location.href = base), 1500);
    });

    // Voltou pelo link de "esqueci minha senha": pede a nova senha
    cliente.auth.onAuthStateChange(async (evento) => {
      if (evento !== "PASSWORD_RECOVERY") return;
      const nova = window.prompt("Digite a nova senha (mínimo de 8 caracteres):");
      if (!nova || nova.length < 8) return notificar("A senha precisa ter pelo menos 8 caracteres.", "aviso");
      const { error } = await cliente.auth.updateUser({ password: nova });
      notificar(error ? traduzir(error) : "Senha alterada.", error ? "perigo" : "sucesso");
    });
  }

  /* ------------------------------------------------------------------------
     Página /pro/: lista de espera
     ------------------------------------------------------------------------ */

  async function iniciarPaginaPro() {
    const estado = $("[data-lista-espera-estado]");
    const botao = $("[data-entrar-lista]");
    const usuario = await usuarioAtual();
    if (!usuario) return;
    const { data: naLista } = await cliente.from("lista_espera_pro").select("usuario_id").maybeSingle();
    if (naLista) {
      estado.textContent = "Você já está na lista. Avisaremos no lançamento!";
      return;
    }
    estado.textContent = "Você está conectado. Um clique e pronto:";
    botao.hidden = false;
    botao.addEventListener("click", async () => {
      botao.setAttribute("aria-busy", "true");
      const { error } = await cliente.from("lista_espera_pro").insert({});
      botao.removeAttribute("aria-busy");
      if (error) return notificar(traduzir(error), "perigo");
      botao.hidden = true;
      estado.textContent = "Pronto! Você está na lista do Atalho Pro.";
      notificar("Você está na lista do Atalho Pro.", "sucesso");
    });
  }

  const iniciar = pagina === "conta" ? iniciarPaginaConta : pagina === "pro" ? iniciarPaginaPro : null;
  iniciar?.().catch((erro) => {
    console.error(erro);
    notificar(traduzir(erro), "perigo");
  });
})();
