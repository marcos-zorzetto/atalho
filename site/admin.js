/*
 * Painel do administrador. Todas as consultas usam funções do banco (admin_*)
 * que recusam quem não está na tabela "administradores". Esconder ou mostrar
 * partes do ecrã aqui é só conforto visual; a proteção está no servidor.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const raiz = $("[data-admin]");
  if (!raiz) return;

  const { ativo, cliente, traduzir, notificar, usuario, projeto } = window.AtalhoSupabase;
  const POR_PAGINA = 25;
  const formatar = window.Atalho.formatar;
  const estado = { pagina: 0, total: 0, busca: "", lista: [] };

  const data = (valor) => (valor ? formatar.data(valor, "short") : "—");
  const dataHora = (valor) => (valor ? formatar.dataHora(valor) : "Nunca");
  const numero = (valor) => formatar.numero(Number(valor) || 0);

  function mostrar(nome) {
    for (const item of ["carregando", "indisponivel", "entrar", "negado", "erro"]) {
      $(`[data-admin-${item}]`, raiz).hidden = item !== nome;
    }
    $("[data-admin-painel]", raiz).hidden = nome !== "painel";
    $("[data-admin-acoes]", raiz).hidden = nome !== "painel";
  }

  /** Cria uma linha de tabela só com textContent (nada de HTML vindo do banco). */
  function linha(celulas) {
    const tr = document.createElement("tr");
    for (const celula of celulas) {
      const td = document.createElement("td");
      if (celula instanceof Node) td.append(celula);
      else if (celula && typeof celula === "object") {
        td.textContent = celula.texto;
        if (celula.classe) td.className = celula.classe;
      } else td.textContent = celula ?? "";
      tr.append(td);
    }
    return tr;
  }

  const selo = (texto, tipo) => Object.assign(document.createElement("span"), { className: `at-selo ${tipo ? `at-${tipo}` : ""}`, textContent: texto });

  function vazio(tbody, colunas, texto) {
    const td = Object.assign(document.createElement("td"), { colSpan: colunas, className: "at-texto-suave at-texto-centro", textContent: texto });
    const tr = document.createElement("tr");
    tr.append(td);
    tbody.replaceChildren(tr);
  }

  async function chamar(funcao, parametros) {
    const { data: dados, error } = await cliente.rpc(funcao, parametros);
    if (error) throw error;
    return dados;
  }

  async function carregarResumo() {
    const [resumo, dias] = await Promise.all([chamar("admin_resumo"), chamar("admin_cadastros_por_dia", { dias: 30 })]);
    for (const [chave, valor] of Object.entries(resumo)) {
      const campo = $(`[data-admin-numero="${chave}"]`, raiz);
      if (campo) campo.textContent = numero(valor);
    }
    $('[data-admin-detalhe="usuarios"]', raiz).textContent = `${numero(resumo.confirmados)} com e-mail confirmado`;
    $('[data-admin-detalhe="lista_espera"]', raiz).textContent = `${numero(resumo.favoritos)} favoritos guardados`;
    $("[data-admin-total-conteudos]", raiz).textContent = `${numero(resumo.conteudos)} páginas`;

    const maximo = Math.max(1, ...dias.map((d) => Number(d.cadastros)));
    const total = dias.reduce((soma, d) => soma + Number(d.cadastros), 0);
    const grafico = $("[data-admin-grafico]", raiz);
    grafico.replaceChildren(
      ...dias.map((d) => {
        const barra = document.createElement("span");
        barra.style.setProperty("--h", `${(Number(d.cadastros) / maximo) * 100}%`);
        barra.title = `${formatar.data(`${d.dia}T12:00:00`, "short")}: ${d.cadastros} registo(s)`;
        return barra;
      })
    );
    grafico.setAttribute("aria-label", `${total} registos nos últimos 30 dias; o maior dia teve ${maximo === 1 && total === 0 ? 0 : maximo}.`);
    $("[data-admin-total-periodo]", raiz).textContent = `${numero(total)} no período`;
  }

  async function carregarUsuarios() {
    const corpo = $("[data-admin-usuarios]", raiz);
    corpo.setAttribute("aria-busy", "true");
    const usuarios = await chamar("admin_usuarios", { busca: estado.busca, limite: POR_PAGINA, deslocamento: estado.pagina * POR_PAGINA });
    corpo.removeAttribute("aria-busy");
    estado.total = Number(usuarios[0]?.total || 0);
    if (!usuarios.length) vazio(corpo, 6, estado.busca ? "Ninguém encontrado com essa pesquisa." : "Nenhum utilizador ainda.");
    else {
      corpo.replaceChildren(
        ...usuarios.map((u) => {
          const situacao = document.createElement("span");
          situacao.className = "at-linha site-admin-selos";
          situacao.append(u.confirmado ? selo("Confirmado", "sucesso") : selo("Pendente", "aviso"));
          if (u.lista_espera) situacao.append(selo("Pro"));
          if (u.admin) situacao.append(selo("Admin", "perigo"));
          return linha([u.nome || "—", u.email, data(u.criado_em), dataHora(u.ultimo_acesso), situacao, { texto: numero(u.favoritos), classe: "at-direita" }]);
        })
      );
    }
    const paginas = Math.max(1, Math.ceil(estado.total / POR_PAGINA));
    $("[data-admin-paginacao-info]", raiz).textContent = `${numero(estado.total)} utilizador(es) · página ${estado.pagina + 1} de ${paginas}`;
    $('[data-admin-pagina="-1"]', raiz).disabled = estado.pagina === 0;
    $('[data-admin-pagina="1"]', raiz).disabled = estado.pagina + 1 >= paginas;
  }

  async function carregarListaEConteudos() {
    const [lista, conteudos] = await Promise.all([chamar("admin_lista_espera"), chamar("admin_conteudos")]);
    estado.lista = lista;
    const corpoLista = $("[data-admin-lista]", raiz);
    if (!lista.length) vazio(corpoLista, 3, "Ninguém na lista ainda.");
    else corpoLista.replaceChildren(...lista.map((p) => linha([p.nome || "—", p.email, data(p.entrou_em)])));
    $("[data-admin-exportar]", raiz).disabled = !lista.length;

    const base = document.body.dataset.base || "/";
    const corpoConteudos = $("[data-admin-conteudos]", raiz);
    if (!conteudos.length) vazio(corpoConteudos, 3, "Nada publicado ainda. Execute o workflow do repositório atalho-pro.");
    else {
      corpoConteudos.replaceChildren(
        ...conteudos.map((c) => {
          const link = Object.assign(document.createElement("a"), { href: `${base}exemplos/${c.id}/`, textContent: c.titulo });
          return linha([link, dataHora(c.atualizado_em), { texto: `${formatar.numero(c.tamanho / 1024, 1)} KB`, classe: "at-direita" }]);
        })
      );
    }
  }

  /** Loja: a receita é o total pago; a Revolut deposita na conta descontando a taxa dela (cerca de 1% + 0,20 €). */
  async function carregarLoja() {
    const loja = await chamar("admin_loja");
    const euro = (centavos) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(centavos / 100);
    $('[data-admin-numero="assinantes_ativos"]', raiz).textContent = numero(loja.assinantes_ativos);
    $('[data-admin-numero="compras_avulsas"]', raiz).textContent = numero(loja.compras_avulsas);
    $('[data-admin-numero="receita_30_dias"]', raiz).textContent = euro(loja.receita_30_dias_centavos);
    $('[data-admin-numero="receita_total"]', raiz).textContent = euro(loja.receita_total_centavos);
    $('[data-admin-detalhe="receita_total"]', raiz).textContent = "valor pago, antes de IVA e taxas";
  }

  /** Funções da loja no Supabase (revolut-loja), com a sessão do administrador. */
  async function funcaoLoja(corpo) {
    const { data: dados, error } = await cliente.functions.invoke("revolut-loja", { body: corpo });
    if (error) {
      let mensagem = "Não foi possível falar com o serviço de pagamentos.";
      try {
        mensagem = (await error.context.json()).erro || mensagem;
      } catch {}
      throw new Error(mensagem);
    }
    return dados;
  }

  /** Cartão "Pagamentos": diz se a loja vende e, se não, o que falta (e liga-a com um clique). */
  async function carregarPagamentos() {
    const selo = $("[data-admin-pagamentos-selo]", raiz);
    const texto = $("[data-admin-pagamentos-texto]", raiz);
    const passos = $("[data-admin-pagamentos-passos]", raiz);
    const botao = $("[data-admin-ligar-loja]", raiz);
    let ligada = false;
    try {
      ligada = Boolean((await funcaoLoja({ acao: "estado" }))?.ativo);
    } catch {
      texto.textContent = "Não foi possível consultar o estado da loja. Tente atualizar o painel.";
      selo.textContent = "Sem resposta";
      return;
    }
    selo.textContent = ligada ? "A vender" : "Desligada";
    selo.className = `at-selo ${ligada ? "at-sucesso" : "at-aviso"}`;
    texto.textContent = ligada
      ? "A loja está ligada: os botões de compra levam à página de pagamento da Revolut e o dinheiro entra na sua conta Revolut Business."
      : "A loja ainda não vende: os visitantes veem a lista de espera. Siga os passos e carregue em Ligar a loja.";
    passos.hidden = ligada;
    botao.hidden = ligada;
  }

  async function ligarLoja(botao) {
    botao.setAttribute("aria-busy", "true");
    botao.disabled = true;
    try {
      const r = await funcaoLoja({ acao: "configurar" });
      notificar(r?.mensagem || "Loja ligada à Revolut.", "sucesso", { duracao: 8000 });
      await carregarPagamentos();
    } catch (erro) {
      notificar(erro.message, "perigo", { duracao: 10000 });
    } finally {
      botao.removeAttribute("aria-busy");
      botao.disabled = false;
    }
  }

  async function carregarTudo() {
    await Promise.all([carregarResumo(), carregarUsuarios(), carregarListaEConteudos(), carregarLoja(), carregarPagamentos()]);
  }

  /** Folha de cálculo em CSV com ";" e BOM: abre certinho no Excel em português. */
  function exportarLista() {
    const celula = (valor) => {
      let texto = String(valor ?? "");
      if (/^[=+\-@]/.test(texto)) texto = `'${texto}`; // evita fórmula maliciosa na folha de cálculo
      return `"${texto.replace(/"/g, '""')}"`;
    };
    const linhas = [["Nome", "E-mail", "Entrou em"], ...estado.lista.map((p) => [p.nome, p.email, data(p.entrou_em)])];
    const csv = "﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n");
    const link = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })),
      download: `lista-espera-pro-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function iniciar() {
    if (!ativo) return mostrar("indisponivel");
    const pessoa = await usuario();
    if (!pessoa) return mostrar("entrar");
    const { data: admin, error } = await cliente.rpc("eh_admin");
    if (error) throw error;
    if (admin !== true) return mostrar("negado");

    $("[data-admin-quem]", raiz).textContent = `Ligado como ${pessoa.email}`;
    $("[data-admin-supabase]", raiz).href = `https://supabase.com/dashboard/project/${projeto}/auth/users`;
    mostrar("painel");
    await carregarTudo();
  }

  let espera;
  $("[data-admin-busca]", raiz).addEventListener("input", (evento) => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      estado.busca = evento.target.value.trim();
      estado.pagina = 0;
      carregarUsuarios().catch(falhar);
    }, 300);
  });

  raiz.addEventListener("click", (evento) => {
    const passo = evento.target.closest("[data-admin-pagina]")?.dataset.adminPagina;
    if (passo) {
      estado.pagina = Math.max(0, estado.pagina + Number(passo));
      carregarUsuarios().catch(falhar);
    }
    if (evento.target.closest("[data-admin-atualizar]")) {
      carregarTudo()
        .then(() => notificar("Painel atualizado.", "sucesso"))
        .catch(falhar);
    }
    if (evento.target.closest("[data-admin-exportar]")) exportarLista();
    const ligar = evento.target.closest("[data-admin-ligar-loja]");
    if (ligar && !ligar.disabled) ligarLoja(ligar);
  });

  function falhar(erro) {
    console.error(erro);
    const mensagem = traduzir(erro);
    if (!$("[data-admin-painel]", raiz).hidden) return notificar(mensagem, "perigo");
    $("[data-admin-erro-texto]", raiz).textContent = mensagem;
    mostrar("erro");
  }

  iniciar().catch(falhar);
})();
