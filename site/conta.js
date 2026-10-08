/*
 * Contas do Atalho (Supabase). Carregado nas páginas /conta/ e /pro/.
 * Sem configuração em site/config.js, mostra "Contas em breve" e não quebra nada.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const { ativo, cliente, traduzir, notificar, usuario: usuarioAtual } = window.AtalhoSupabase;
  const base = document.body.dataset.base || "/";
  const pagina = document.body.dataset.pagina;
  const parametros = new URLSearchParams(location.search);

  if (!ativo) {
    if (pagina === "conta") $("[data-conta-indisponivel]").hidden = false;
    if (pagina === "pro") {
      const estado = $("[data-lista-espera-estado]");
      if (estado) estado.textContent = "A lista de espera abre em breve. Volte daqui a alguns dias!";
    }
    return;
  }

  const iniciais = (nome) =>
    String(nome || "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  /** Só volta para páginas do próprio site (evita redirecionamento aberto). */
  function destinoSeguro() {
    const voltar = parametros.get("voltar");
    return voltar && voltar.startsWith(base) && !voltar.startsWith("//") && !voltar.includes("\\") ? voltar : null;
  }

  const enderecoRetorno = () => {
    const voltar = destinoSeguro();
    return `${location.origin}${base}conta/${voltar ? `?voltar=${encodeURIComponent(voltar)}` : ""}`;
  };

  function voltarOuRecarregar() {
    const voltar = destinoSeguro();
    if (voltar) location.href = voltar;
    else location.replace(`${base}conta/`);
  }

  /* ------------------------------------------------------------------------
     Página /conta/
     ------------------------------------------------------------------------ */

  async function mostrarPainel(usuario) {
    $("[data-conta-visitante]").hidden = true;
    $("[data-conta-logado]").hidden = false;

    const [{ data: perfil }, { data: favoritos, error: erroFavoritos }, { data: naLista }, { data: admin }] = await Promise.all([
      cliente.from("perfis").select("nome").eq("id", usuario.id).maybeSingle(),
      cliente.from("favoritos").select("componente_id").order("criado_em", { ascending: false }),
      cliente.from("lista_espera_pro").select("usuario_id").maybeSingle(),
      cliente.rpc("eh_admin"),
    ]);

    const nome = perfil?.nome || usuario.user_metadata?.nome || usuario.email.split("@")[0];
    $("[data-conta-nome]").textContent = nome;
    $("[data-conta-email]").textContent = usuario.email;
    $("[data-conta-iniciais]").textContent = iniciais(nome);
    $("[data-conta-admin]").hidden = admin !== true;

    const indice = new Map((window.ATALHO_INDICE || []).map((c) => [c.id, c]));
    const lista = $("[data-conta-favoritos]");
    lista.textContent = "";
    for (const { componente_id } of erroFavoritos ? [] : favoritos) {
      const c = indice.get(componente_id);
      if (!c) continue;
      const link = document.createElement("a");
      link.href = c.url;
      link.append(Object.assign(document.createElement("strong"), { textContent: c.nome }));
      link.append(Object.assign(document.createElement("span"), { textContent: c.resumo }));
      lista.append(link);
    }
    $("[data-conta-sem-favoritos]").hidden = lista.children.length > 0;

    const chave = $("[data-conta-lista-espera]");
    chave.checked = Boolean(naLista);
    chave.onchange = async () => {
      const operacao = chave.checked
        ? cliente.from("lista_espera_pro").insert({})
        : cliente.from("lista_espera_pro").delete().eq("usuario_id", usuario.id);
      const { error } = await operacao;
      if (error) {
        chave.checked = !chave.checked;
        notificar(traduzir(error), "perigo");
      } else {
        notificar(chave.checked ? "Você está na lista do Atalho Pro." : "Você saiu da lista do Atalho Pro.", "sucesso");
      }
    };
  }

  function mostrarVisitante() {
    $("[data-conta-visitante]").hidden = false;
    $("[data-conta-logado]").hidden = true;
    if (parametros.has("criar")) $('[aria-controls="painel-criar"]').click();
    if (destinoSeguro()?.includes("/exemplos/")) $("[data-conta-motivo]").hidden = false;
  }

  function oferecerReenvio(email) {
    notificar("Confirme seu e-mail pelo link que enviamos antes de entrar.", "aviso", {
      titulo: "E-mail ainda não confirmado",
      duracao: 10000,
      acao: {
        texto: "Reenviar e-mail",
        aoClicar: async () => {
          const { error } = await cliente.auth.resend({ type: "signup", email, options: { emailRedirectTo: enderecoRetorno() } });
          notificar(error ? traduzir(error) : `Enviamos um novo link para ${email}.`, error ? "perigo" : "sucesso");
        },
      },
    });
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
      if (error && /email not confirmed/i.test(error.message)) return oferecerReenvio(dados.email);
      if (error) return notificar(traduzir(error), "perigo");
      voltarOuRecarregar();
    });

    $("#form-criar").addEventListener("at:enviar", async (evento) => {
      const { dados, botao, formulario } = evento.detail;
      botao.setAttribute("aria-busy", "true");
      const { data, error } = await cliente.auth.signUp({
        email: dados.email,
        password: dados.senha,
        options: { data: { nome: dados.nome.trim() }, emailRedirectTo: enderecoRetorno() },
      });
      botao.removeAttribute("aria-busy");
      if (error) return notificar(traduzir(error), "perigo");
      if (data.session) return voltarOuRecarregar();
      formulario.reset();
      $("[data-conta-confirmar-email]").textContent = dados.email;
      $("[data-conta-aguardando]").hidden = false;
      $("[data-conta-aguardando]").focus();
    });

    $("[data-conta-reenviar]").addEventListener("click", async () => {
      const email = $("[data-conta-confirmar-email]").textContent;
      const { error } = await cliente.auth.resend({ type: "signup", email, options: { emailRedirectTo: enderecoRetorno() } });
      notificar(error ? traduzir(error) : `Enviamos um novo link para ${email}.`, error ? "perigo" : "sucesso");
    });

    $("[data-esqueci-senha]").addEventListener("click", async () => {
      const campo = $("#entrar-email");
      const email = campo.value.trim();
      if (!window.Atalho.validar.email(email)) {
        campo.focus();
        return notificar("Digite seu e-mail no campo acima e clique de novo.", "aviso");
      }
      const { error } = await cliente.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${base}conta/` });
      notificar(error ? traduzir(error) : `Se existir uma conta com ${email}, você vai receber um link para criar uma nova senha.`, error ? "perigo" : "sucesso");
    });

    $("[data-sair]").addEventListener("click", async () => {
      await cliente.auth.signOut();
      location.replace(`${base}conta/`);
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

    // Voltou pelo link de "esqueci minha senha": pede a nova senha num formulário
    const modalSenha = $("#modal-nova-senha");
    cliente.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY") modalSenha.showModal();
    });
    $("#form-nova-senha").addEventListener("at:enviar", async (evento) => {
      const { dados, botao, formulario } = evento.detail;
      if (dados.senha !== dados.confirmar) return notificar("As duas senhas precisam ser iguais.", "aviso");
      botao.setAttribute("aria-busy", "true");
      const { error } = await cliente.auth.updateUser({ password: dados.senha });
      botao.removeAttribute("aria-busy");
      if (error) return notificar(traduzir(error), "perigo");
      formulario.reset();
      modalSenha.close();
      notificar("Senha alterada. Você já está conectado.", "sucesso");
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
