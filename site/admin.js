/*
 * Painel do administrador. Todas as consultas usam funções do banco (admin_*)
 * que recusam quem não está na tabela "administradores". Esconder ou mostrar
 * partes da tela aqui é só conforto visual; a proteção está no servidor.
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
    $('[data-admin-detalhe="lista_espera"]', raiz).textContent = `${numero(resumo.favoritos)} favoritos salvos`;
    $("[data-admin-total-conteudos]", raiz).textContent = `${numero(resumo.conteudos)} páginas`;

    const maximo = Math.max(1, ...dias.map((d) => Number(d.cadastros)));
    const total = dias.reduce((soma, d) => soma + Number(d.cadastros), 0);
    const grafico = $("[data-admin-grafico]", raiz);
    grafico.replaceChildren(
      ...dias.map((d) => {
        const barra = document.createElement("span");
        barra.style.setProperty("--h", `${(Number(d.cadastros) / maximo) * 100}%`);
        barra.title = `${formatar.data(`${d.dia}T12:00:00`, "short")}: ${d.cadastros} cadastro(s)`;
        return barra;
      })
    );
    grafico.setAttribute("aria-label", `${total} cadastros nos últimos 30 dias; o maior dia teve ${maximo === 1 && total === 0 ? 0 : maximo}.`);
    $("[data-admin-total-periodo]", raiz).textContent = `${numero(total)} no período`;
  }

  async function carregarUsuarios() {
    const corpo = $("[data-admin-usuarios]", raiz);
    corpo.setAttribute("aria-busy", "true");
    const usuarios = await chamar("admin_usuarios", { busca: estado.busca, limite: POR_PAGINA, deslocamento: estado.pagina * POR_PAGINA });
    corpo.removeAttribute("aria-busy");
    estado.total = Number(usuarios[0]?.total || 0);
    if (!usuarios.length) vazio(corpo, 6, estado.busca ? "Ninguém encontrado com essa busca." : "Nenhum usuário ainda.");
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
    $("[data-admin-paginacao-info]", raiz).textContent = `${numero(estado.total)} usuário(s) · página ${estado.pagina + 1} de ${paginas}`;
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
    if (!conteudos.length) vazio(corpoConteudos, 3, "Nada publicado ainda. Rode o workflow do repositório atalho-pro.");
    else {
      corpoConteudos.replaceChildren(
        ...conteudos.map((c) => {
          const link = Object.assign(document.createElement("a"), { href: `${base}exemplos/${c.id}/`, textContent: c.titulo });
          return linha([link, dataHora(c.atualizado_em), { texto: `${formatar.numero(c.tamanho / 1024, 1)} KB`, classe: "at-direita" }]);
        })
      );
    }
  }

  /** Loja: a receita é o total pago; a Lemon Squeezy repassa descontando o IVA e as taxas dela. */
  async function carregarLoja() {
    const loja = await chamar("admin_loja");
    const euro = (centavos) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "EUR" }).format(centavos / 100);
    $('[data-admin-numero="assinantes_ativos"]', raiz).textContent = numero(loja.assinantes_ativos);
    $('[data-admin-numero="compras_avulsas"]', raiz).textContent = numero(loja.compras_avulsas);
    $('[data-admin-numero="receita_30_dias"]', raiz).textContent = euro(loja.receita_30_dias_centavos);
    $('[data-admin-numero="receita_total"]', raiz).textContent = euro(loja.receita_total_centavos);
    $('[data-admin-detalhe="receita_total"]', raiz).textContent = "valor pago, antes de IVA e taxas";
  }

  async function carregarTudo() {
    await Promise.all([carregarResumo(), carregarUsuarios(), carregarListaEConteudos(), carregarLoja()]);
  }

  /** Planilha em CSV com ";" e BOM: abre certinho no Excel em português. */
  function exportarLista() {
    const celula = (valor) => {
      let texto = String(valor ?? "");
      if (/^[=+\-@]/.test(texto)) texto = `'${texto}`; // evita fórmula maliciosa na planilha
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

    $("[data-admin-quem]", raiz).textContent = `Conectado como ${pessoa.email}`;
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
