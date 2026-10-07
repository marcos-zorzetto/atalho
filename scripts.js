const LOJA = {
    origem: { lat: -23.4676, lng: -46.5278 },
    freteGratis: 199,
    descontoPix: 0.05,
    parcelaMinima: 20,
    parcelasMax: 6,
    albumId: 713659451
};

const REGIOES = {
    SP: "SP", RJ: "sudeste", MG: "sudeste", ES: "sudeste",
    PR: "sul", SC: "sul", RS: "sul",
    DF: "centro-oeste", GO: "centro-oeste", MT: "centro-oeste", MS: "centro-oeste",
    BA: "nordeste", SE: "nordeste", AL: "nordeste", PE: "nordeste", PB: "nordeste",
    RN: "nordeste", CE: "nordeste", PI: "nordeste", MA: "nordeste",
    AM: "norte", PA: "norte", AC: "norte", RO: "norte", RR: "norte", AP: "norte", TO: "norte"
};

const KM_POR_REGIAO = {
    "SP": 90,
    "sudeste": 520,
    "sul": 820,
    "centro-oeste": 1050,
    "nordeste": 2100,
    "norte": 2900
};

const ESTADOS_RESERVA = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

const estado = {
    produtos: [],
    categorias: [],
    cupons: [],
    creditos: [],
    listaAtual: [],
    carrinho: lerLocal("plantao-carrinho", []),
    favoritos: lerLocal("plantao-favoritos", []),
    cupom: lerLocal("plantao-cupom", ""),
    moeda: { codigo: "BRL", taxa: 1 },
    cotacoes: null,
    feriados: new Map(),
    entrega: null,
    freteTipo: "pac",
    album: null,
    faixas: [],
    faixaAtual: null,
    produtoAberto: null,
    ultimoCalculo: null,
    passo: 1,
    contadorFiltro: 0,
    estadosCarregados: false
};

const audio = document.getElementById("audio");
const lightbox = new bootstrap.Modal(document.getElementById("lightbox"));
const checkout = new bootstrap.Modal(document.getElementById("checkout"));
const painelCarrinho = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("carrinho"));
const aviso = new bootstrap.Toast(document.getElementById("aviso"), { delay: 3000 });

let temporizadorBusca = null;

function el(id) {
    return document.getElementById(id);
}

function lerLocal(chave, padrao) {
    try {
        const valor = localStorage.getItem(chave);
        return valor === null ? padrao : JSON.parse(valor);
    } catch (erro) {
        return padrao;
    }
}

function salvarLocal(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {
        return;
    }
}

function lerSessao(chave) {
    try {
        const valor = sessionStorage.getItem(chave);
        return valor === null ? null : JSON.parse(valor);
    } catch (erro) {
        return null;
    }
}

function salvarSessao(chave, valor) {
    try {
        sessionStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {
        return;
    }
}

function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function somenteNumeros(texto) {
    return String(texto).replace(/\D/g, "");
}

function semAcento(texto) {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

async function buscarJSON(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) {
        const erro = new Error("Erro " + resposta.status + " em " + url);
        erro.status = resposta.status;
        throw erro;
    }
    return resposta.json();
}

async function buscarComCache(chave, url, minutos) {
    const salvo = lerSessao(chave);
    if (salvo && Date.now() - salvo.hora < minutos * 60000) {
        return salvo.dados;
    }
    const dados = await buscarJSON(url);
    salvarSessao(chave, { hora: Date.now(), dados: dados });
    return dados;
}

function carregarCatalogo() {
    return buscarJSON("catalog.json");
}

function formatarPreco(valorEmReais) {
    const valor = Number(valorEmReais) / estado.moeda.taxa;
    return valor.toLocaleString("pt-BR", { style: "currency", currency: estado.moeda.codigo });
}

function arredondar(valor) {
    return Math.round(valor * 100) / 100;
}

function procurarProduto(id) {
    return estado.produtos.find(function (produto) {
        return produto.id === id;
    }) || null;
}

function nomeCategoria(id) {
    const categoria = estado.categorias.find(function (item) {
        return item.id === id;
    });
    return categoria ? categoria.name : "";
}

function percentualDesconto(produto) {
    if (!produto.oldPrice) {
        return 0;
    }
    return Math.round((1 - Number(produto.price) / Number(produto.oldPrice)) * 100);
}

function textoParcelas(preco) {
    const vezes = Math.min(LOJA.parcelasMax, Math.floor(Number(preco) / LOJA.parcelaMinima));
    if (vezes < 2) {
        return "à vista no cartão";
    }
    return "ou " + vezes + "x de " + formatarPreco(Number(preco) / vezes) + " sem juros";
}

function textoPix(preco) {
    return formatarPreco(Number(preco) * (1 - LOJA.descontoPix)) + " no Pix";
}

function estrelas(nota, avaliacoes) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        if (nota >= i) {
            html += '<i class="bi bi-star-fill"></i>';
        } else if (nota >= i - 0.5) {
            html += '<i class="bi bi-star-half"></i>';
        } else {
            html += '<i class="bi bi-star"></i>';
        }
    }
    const notaTexto = nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 });
    return '<div class="avaliacao" aria-label="Nota ' + notaTexto + ' de 5">' + html + "<span>" + notaTexto + " (" + avaliacoes + ")</span></div>";
}

function mostrarAviso(texto, tipo) {
    const caixa = el("aviso");
    const icones = { sucesso: "bi-check-circle-fill", erro: "bi-exclamation-triangle-fill", info: "bi-tv-fill" };
    const tipoFinal = tipo || "sucesso";
    caixa.classList.toggle("erro", tipoFinal === "erro");
    el("aviso-texto").innerHTML = '<i class="bi ' + icones[tipoFinal] + '"></i><span>' + texto + "</span>";
    aviso.show();
}

function mostrarEsqueletos(quantidade) {
    let html = "";
    for (let i = 0; i < quantidade; i++) {
        html += '<div class="col-6 col-md-4 col-xl-3"><div class="card-esqueleto"></div></div>';
    }
    el("product-list").innerHTML = html;
}

async function iniciar() {
    el("ano").textContent = new Date().getFullYear();
    mostrarEsqueletos(8);
    configurarQrCompartilhar();

    carregarCotacoes();
    carregarFeriados();
    carregarJukebox();
    carregarHistoria();

    try {
        const dados = await carregarCatalogo();
        estado.produtos = dados.products;
        estado.categorias = dados.categories;
        estado.cupons = dados.coupons || [];
        estado.creditos = dados.credits || [];

        preencherCategorias();
        preencherSelectProdutos();
        renderizarHero();
        renderizarOferta();
        renderizarCreditos();
        aplicarFiltros(estado.produtos);
        atualizarCarrinho();
        iniciarContador();
    } catch (erro) {
        el("product-list").innerHTML = "";
        el("message").innerHTML =
            '<div class="estado-vazio"><i class="bi bi-wifi-off"></i>' +
            "<h3 class=\"mt-2\">Eita, a antena caiu.</h3>" +
            "<p>Não deu pra carregar o catálogo. Se você abriu o arquivo direto do computador, use um servidor (Live Server ou GitHub Pages).</p>" +
            '<button type="button" class="btn btn-cartoon btn-amarelo" onclick="location.reload()">Tentar de novo</button></div>';
        el("hero-slides").innerHTML = '<div class="carousel-item active"><div class="slide-carregando">Sem sinal</div></div>';
        el("oferta-produto").innerHTML = '<div class="slide-carregando">Sem sinal</div>';
    }
}

function preencherCategorias() {
    let botoes = '<button type="button" class="categoria-sticker ativa" data-categoria=""><i class="bi bi-grid-3x3-gap-fill"></i>Tudo<small>' + estado.produtos.length + " itens</small></button>";

    estado.categorias.forEach(function (categoria) {
        const total = estado.produtos.filter(function (produto) {
            return produto.category === categoria.id;
        }).length;

        const opcao = document.createElement("option");
        opcao.value = categoria.id;
        opcao.textContent = categoria.name;
        el("category-filter").appendChild(opcao);

        botoes += '<button type="button" class="categoria-sticker" data-categoria="' + categoria.id + '">' +
            '<i class="bi ' + categoria.icon + '"></i>' + escapar(categoria.name) +
            "<small>" + total + (total === 1 ? " item" : " itens") + "</small></button>";
    });

    el("categorias-lista").innerHTML = botoes;
}

function preencherSelectProdutos() {
    const select = el("product");
    select.querySelectorAll("option:not([value=''])").forEach(function (opcao) {
        opcao.remove();
    });
    estado.produtos.forEach(function (produto) {
        const opcao = document.createElement("option");
        opcao.value = produto.id;
        opcao.textContent = produto.name + " - " + formatarPreco(produto.price);
        select.appendChild(opcao);
    });
}

function renderizarHero() {
    const destaques = estado.produtos.filter(function (produto) {
        return produto.featured;
    });

    el("hero-slides").innerHTML = destaques.map(function (produto, indice) {
        return '<div class="carousel-item' + (indice === 0 ? " active" : "") + '">' +
            '<a href="#produtos" class="slide-produto" data-acao="detalhes" data-id="' + produto.id + '">' +
            '<img src="' + produto.images[0] + '" alt="' + escapar(produto.name) + '" width="900" height="900">' +
            '<span class="slide-legenda"><strong>' + escapar(produto.name) + "</strong>" +
            '<span class="preco-tv">' + formatarPreco(produto.price) + "</span></span></a></div>";
    }).join("");

    bootstrap.Carousel.getOrCreateInstance(el("hero-carousel"), { interval: 3500, ride: "carousel" }).cycle();
}

function renderizarOferta() {
    const produto = estado.produtos.find(function (item) {
        return item.flash;
    });

    if (!produto) {
        el("oferta").classList.add("d-none");
        return;
    }

    const desconto = percentualDesconto(produto);
    const porcentagemEstoque = Math.max(8, Math.min(100, produto.stock / 40 * 100));

    el("oferta-produto").innerHTML =
        '<div class="oferta-conteudo">' +
            '<div class="position-relative">' +
                '<img src="' + produto.images[0] + '" alt="' + escapar(produto.name) + '" width="900" height="900" loading="lazy">' +
                (desconto ? '<span class="selo-estrela" style="right:14px;top:14px;">-' + desconto + "%</span>" : "") +
            "</div>" +
            '<div class="oferta-info">' +
                (produto.badge ? '<span class="selo-texto position-static d-inline-block mb-2">' + escapar(produto.badge) + "</span>" : "") +
                "<h3>" + escapar(produto.name) + "</h3>" +
                estrelas(produto.rating, produto.reviews) +
                '<div class="precos">' +
                    (produto.oldPrice ? '<span class="preco-antigo">' + formatarPreco(produto.oldPrice) + "</span>" : "") +
                    '<span class="preco-grande d-block">' + formatarPreco(produto.price) + "</span>" +
                "</div>" +
                '<p class="parcelas mb-2">' + textoParcelas(produto.price) + " · " + textoPix(produto.price) + "</p>" +
                '<small class="fw-bold">Restam só ' + produto.stock + " unidades</small>" +
                '<div class="estoque-barra"><span style="width:' + porcentagemEstoque + '%"></span></div>' +
                '<div class="d-flex flex-wrap gap-2 mt-3">' +
                    '<button type="button" class="btn btn-cartoon btn-amarelo" data-acao="comprar" data-id="' + produto.id + '"><i class="bi bi-cart-plus-fill"></i> Joga no carrinho</button>' +
                    '<button type="button" class="btn btn-cartoon btn-branco" data-acao="detalhes" data-id="' + produto.id + '">Ver detalhes</button>' +
                "</div>" +
            "</div>" +
        "</div>";
}

function iniciarContador() {
    function atualizar() {
        const agora = new Date();
        const meiaNoite = new Date(agora);
        meiaNoite.setHours(24, 0, 0, 0);
        const restante = Math.max(0, meiaNoite - agora);
        const horas = Math.floor(restante / 3600000);
        const minutos = Math.floor(restante % 3600000 / 60000);
        const segundos = Math.floor(restante % 60000 / 1000);
        el("cont-h").textContent = String(horas).padStart(2, "0");
        el("cont-m").textContent = String(minutos).padStart(2, "0");
        el("cont-s").textContent = String(segundos).padStart(2, "0");
    }
    atualizar();
    setInterval(atualizar, 1000);
}

function cardProduto(produto, indice) {
    const desconto = percentualDesconto(produto);
    const favorito = estado.favoritos.includes(produto.id);
    const nome = escapar(produto.name);

    return '<div class="col-6 col-md-4 col-xl-3 col-produto">' +
        '<article class="card-produto" style="animation-delay:' + (indice * 0.04) + 's">' +
            '<div class="foto-produto" data-acao="detalhes" data-id="' + produto.id + '" role="button" tabindex="0" aria-label="Ver detalhes de ' + nome + '">' +
                '<img src="' + produto.images[0] + '" alt="' + nome + '" loading="lazy" width="900" height="900">' +
                '<img src="' + produto.images[1] + '" alt="" class="foto-2" loading="lazy" width="900" height="900">' +
                (produto.badge ? '<span class="selo-texto">' + escapar(produto.badge) + "</span>" : "") +
                (desconto ? '<span class="selo-estrela">-' + desconto + "%</span>" : "") +
            "</div>" +
            '<button type="button" class="btn-fav' + (favorito ? " ativo" : "") + '" data-acao="favoritar" data-id="' + produto.id + '" aria-pressed="' + favorito + '" aria-label="Favoritar ' + nome + '">' +
                '<i class="bi ' + (favorito ? "bi-heart-fill" : "bi-heart") + '"></i></button>' +
            '<div class="corpo-produto">' +
                '<span class="etiqueta-categoria">' + escapar(nomeCategoria(produto.category)) + "</span>" +
                '<h3 class="nome-produto">' + nome + "</h3>" +
                estrelas(produto.rating, produto.reviews) +
                '<div class="precos">' +
                    (produto.oldPrice ? '<span class="preco-antigo">' + formatarPreco(produto.oldPrice) + "</span>" : "") +
                    '<span class="preco-atual">' + formatarPreco(produto.price) + "</span>" +
                "</div>" +
                '<div class="parcelas">' + textoParcelas(produto.price) + "</div>" +
                '<div class="acoes-produto">' +
                    '<button type="button" class="btn btn-cartoon btn-branco btn-detalhes" data-acao="detalhes" data-id="' + produto.id + '"><span class="d-none d-sm-inline">Ver </span>detalhes</button>' +
                    '<button type="button" class="btn btn-cartoon btn-rosa btn-adicionar" data-acao="comprar" data-id="' + produto.id + '" aria-label="Joga no carrinho: ' + nome + '"><i class="bi bi-cart-plus-fill"></i></button>' +
                "</div>" +
            "</div>" +
        "</article>" +
    "</div>";
}

function renderizarVitrine(lista) {
    const vitrine = el("product-list");
    vitrine.classList.remove("opacity-50");
    el("message").innerHTML = "";

    if (lista.length === 0) {
        vitrine.innerHTML = "";
        el("message").innerHTML =
            '<div class="estado-vazio"><i class="bi bi-search-heart"></i>' +
            '<h3 class="mt-2">Nada por aqui.</h3>' +
            "<p>Nem o Jumento Celestino achou esse produto. Tenta outra palavra ou veja todas as ofertas.</p>" +
            '<button type="button" class="btn btn-cartoon btn-amarelo" id="btn-limpar-filtros">Limpar filtros</button></div>';
        el("btn-limpar-filtros").addEventListener("click", limparFiltros);
        el("resultado-info").textContent = "Nenhum produto encontrado";
        return;
    }

    vitrine.innerHTML = lista.map(cardProduto).join("");
    el("resultado-info").textContent = lista.length + (lista.length === 1 ? " produto no ar" : " produtos no ar");
}

function aplicarFiltros(produtos) {
    const categoria = el("category-filter").value;
    const texto = semAcento(el("search").value.trim());
    const soOfertas = el("so-ofertas").checked;
    const soFavoritos = el("so-favoritos").checked;
    const ordem = el("sort").value;

    let filtrados = produtos.filter(function (produto) {
        const textoProduto = semAcento(produto.name + " " + produto.description + " " + nomeCategoria(produto.category));
        return (categoria === "" || produto.category === categoria) &&
            (texto === "" || textoProduto.includes(texto)) &&
            (!soOfertas || produto.oldPrice !== "") &&
            (!soFavoritos || estado.favoritos.includes(produto.id));
    });

    if (ordem === "menor") {
        filtrados.sort(function (a, b) { return a.price - b.price; });
    } else if (ordem === "maior") {
        filtrados.sort(function (a, b) { return b.price - a.price; });
    } else if (ordem === "desconto") {
        filtrados.sort(function (a, b) { return percentualDesconto(b) - percentualDesconto(a); });
    } else if (ordem === "nome") {
        filtrados.sort(function (a, b) { return a.name.localeCompare(b.name, "pt-BR"); });
    }

    document.querySelectorAll(".categoria-sticker").forEach(function (botao) {
        botao.classList.toggle("ativa", botao.dataset.categoria === categoria);
    });

    estado.listaAtual = filtrados;
    renderizarVitrine(filtrados);
}

async function filtrarProdutos() {
    const pedido = ++estado.contadorFiltro;
    el("product-list").classList.add("opacity-50");

    try {
        const dados = await carregarCatalogo();
        if (pedido !== estado.contadorFiltro) {
            return;
        }
        estado.produtos = dados.products;
        aplicarFiltros(estado.produtos);
    } catch (erro) {
        el("product-list").classList.remove("opacity-50");
        mostrarAviso("Eita, a antena caiu. Tenta de novo em instantes.", "erro");
    }
}

function limparFiltros() {
    el("category-filter").value = "";
    el("search").value = "";
    el("sort").value = "";
    el("so-ofertas").checked = false;
    el("so-favoritos").checked = false;
    el("btn-favoritos").classList.remove("ativo");
    filtrarProdutos();
}

function irParaProdutos() {
    el("produtos").scrollIntoView({ behavior: "smooth" });
}

function alternarFavorito(id) {
    const produto = procurarProduto(id);
    const posicao = estado.favoritos.indexOf(id);

    if (posicao === -1) {
        estado.favoritos.push(id);
        mostrarAviso("Guardado nos favoritos: " + escapar(produto.name), "info");
    } else {
        estado.favoritos.splice(posicao, 1);
        mostrarAviso("Tirado dos favoritos.", "info");
    }

    salvarLocal("plantao-favoritos", estado.favoritos);
    atualizarFavoritos();

    if (el("so-favoritos").checked) {
        aplicarFiltros(estado.produtos);
    }
}

function atualizarFavoritos() {
    el("fav-count").textContent = estado.favoritos.length;

    document.querySelectorAll('[data-acao="favoritar"]').forEach(function (botao) {
        const ativo = estado.favoritos.includes(botao.dataset.id);
        botao.classList.toggle("ativo", ativo);
        botao.setAttribute("aria-pressed", ativo);
        botao.querySelector("i").className = "bi " + (ativo ? "bi-heart-fill" : "bi-heart");
    });

    if (estado.produtoAberto) {
        const ativo = estado.favoritos.includes(estado.produtoAberto.id);
        el("lightbox-fav").querySelector("i").className = "bi " + (ativo ? "bi-heart-fill" : "bi-heart");
        el("lightbox-fav").setAttribute("aria-pressed", ativo);
    }
}

function abrirLightbox(id, quantidade) {
    const produto = procurarProduto(id);
    if (!produto) {
        return;
    }

    estado.produtoAberto = produto;
    const desconto = percentualDesconto(produto);

    el("lightbox-title").textContent = produto.name;
    el("lightbox-image").src = produto.images[0];
    el("lightbox-image").alt = produto.name;
    el("lightbox-category").textContent = nomeCategoria(produto.category);
    el("lightbox-description").textContent = produto.description;
    el("lightbox-rating").outerHTML = estrelas(produto.rating, produto.reviews).replace('class="avaliacao"', 'class="avaliacao" id="lightbox-rating"');
    el("lightbox-badges").innerHTML =
        (produto.badge ? '<span class="selo-texto">' + escapar(produto.badge) + "</span>" : "") +
        (desconto ? '<span class="selo-estrela">-' + desconto + "%</span>" : "");

    el("lightbox-thumbs").innerHTML = produto.images.map(function (imagem, indice) {
        return '<button type="button" class="' + (indice === 0 ? "ativo" : "") + '" data-imagem="' + imagem + '" aria-label="Ver foto ' + (indice + 1) + '">' +
            '<img src="' + imagem + '" alt="" width="76" height="76"></button>';
    }).join("");

    if (produto.sizes.length) {
        el("lightbox-sizes").innerHTML = '<span class="titulo-tamanho">Tamanho</span>' + produto.sizes.map(function (tamanho) {
            const idCampo = "tamanho-" + tamanho;
            return '<input type="radio" class="btn-check" name="tamanho" id="' + idCampo + '" value="' + tamanho + '">' +
                '<label for="' + idCampo + '">' + tamanho + "</label>";
        }).join("");
    } else {
        el("lightbox-sizes").innerHTML = "";
    }
    el("lightbox-size-erro").classList.add("d-none");

    el("lightbox-qty").value = quantidade || 1;
    el("lightbox-qty").max = produto.stock;

    const estoque = el("lightbox-estoque");
    estoque.classList.toggle("baixo", produto.stock <= 10);
    estoque.textContent = produto.stock <= 10 ? "Corre! Restam só " + produto.stock + " unidades" : "Em estoque, pronto pra sair de Guarulhos";

    preencherPrecosLightbox();
    atualizarFavoritos();
    renderizarMusicaLightbox();
    lightbox.show();
}

function preencherPrecosLightbox() {
    const produto = estado.produtoAberto;
    if (!produto) {
        return;
    }
    el("lightbox-price").textContent = formatarPreco(produto.price);
    el("lightbox-old-price").textContent = produto.oldPrice ? formatarPreco(produto.oldPrice) : "";
    el("lightbox-parcelas").textContent = textoParcelas(produto.price);
    el("lightbox-pix").textContent = textoPix(produto.price);
}

function renderizarMusicaLightbox() {
    const caixa = el("lightbox-musica");
    const produto = estado.produtoAberto;

    if (!produto || !produto.music || estado.faixas.length === 0) {
        caixa.classList.add("d-none");
        caixa.innerHTML = "";
        return;
    }

    caixa.classList.remove("d-none");
    caixa.innerHTML =
        "<h3><i class=\"bi bi-headphones\"></i> Dá uma ouvidinha</h3>" +
        '<ol class="list-unstyled mb-2">' + estado.faixas.slice(0, 3).map(htmlFaixa).join("") + "</ol>" +
        '<a href="' + estado.album.collectionViewUrl + '" target="_blank" rel="noopener"><i class="bi bi-apple"></i> Ouvir o álbum no Apple Music</a>';
    atualizarInterfacePlayer();
}

function comprarDoLightbox() {
    const produto = estado.produtoAberto;
    const quantidade = Number(el("lightbox-qty").value);
    let tamanho = "";

    if (produto.sizes.length) {
        const marcado = document.querySelector('input[name="tamanho"]:checked');
        if (!marcado) {
            el("lightbox-size-erro").classList.remove("d-none");
            el("lightbox-sizes").classList.remove("balanco");
            void el("lightbox-sizes").offsetWidth;
            el("lightbox-sizes").classList.add("balanco");
            return;
        }
        tamanho = marcado.value;
    }

    if (!Number.isInteger(quantidade) || quantidade < 1) {
        mostrarAviso("Coloca uma quantidade de pelo menos 1.", "erro");
        el("lightbox-qty").value = 1;
        return;
    }

    if (adicionarAoCarrinho(produto.id, quantidade, tamanho)) {
        lightbox.hide();
    }
}

function mudarQuantidadeLightbox(valor) {
    const campo = el("lightbox-qty");
    const maximo = estado.produtoAberto ? estado.produtoAberto.stock : 99;
    let nova = (parseInt(campo.value, 10) || 1) + valor;
    nova = Math.max(1, Math.min(maximo, nova));
    campo.value = nova;
}

function quantidadeValida(texto) {
    const numero = Number(texto);
    return texto !== "" && Number.isInteger(numero) && numero > 0;
}

function calcularTotal() {
    const select = el("product");
    const campo = el("quantity");
    select.classList.remove("is-invalid");
    campo.classList.remove("is-invalid");
    el("add-from-form").disabled = true;
    el("total-value").innerHTML = "";
    estado.ultimoCalculo = null;

    let valido = true;
    if (select.value === "") {
        select.classList.add("is-invalid");
        valido = false;
    }
    if (!quantidadeValida(campo.value.trim())) {
        campo.classList.add("is-invalid");
        valido = false;
    }
    if (!valido) {
        return;
    }

    estado.ultimoCalculo = { id: select.value, quantidade: Number(campo.value) };
    mostrarResultadoCalculo();
    el("add-from-form").disabled = false;
    renderizarFreteSimulador();
}

function mostrarResultadoCalculo() {
    if (!estado.ultimoCalculo) {
        return;
    }

    const produto = procurarProduto(estado.ultimoCalculo.id);
    const quantidade = estado.ultimoCalculo.quantidade;
    const total = Number(produto.price) * quantidade;
    const economia = produto.oldPrice ? (Number(produto.oldPrice) - Number(produto.price)) * quantidade : 0;
    const vezes = Math.min(LOJA.parcelasMax, Math.floor(total / LOJA.parcelaMinima));

    let freteTexto;
    if (total >= LOJA.freteGratis) {
        freteTexto = '<i class="bi bi-gift-fill"></i> Esse pedido já ganha frete grátis (PAC)!';
    } else {
        freteTexto = '<i class="bi bi-truck"></i> Faltam ' + formatarPreco(LOJA.freteGratis - total) + " pro frete grátis.";
    }

    el("total-value").innerHTML =
        '<div class="resultado-calculo">' +
            '<div class="resultado-topo">' +
                '<img src="' + produto.images[0] + '" alt="" width="72" height="72">' +
                "<div><strong>" + escapar(produto.name) + "</strong><br><small>" + quantidade + " x " + formatarPreco(produto.price) + "</small></div>" +
            "</div>" +
            '<dl class="resultado-linhas">' +
                "<div><dt>Subtotal</dt><dd>" + formatarPreco(total) + "</dd></div>" +
                (economia > 0 ? '<div class="texto-verde"><dt>Você economiza</dt><dd>' + formatarPreco(economia) + "</dd></div>" : "") +
                "<div><dt>No Pix (5% OFF)</dt><dd>" + formatarPreco(total * (1 - LOJA.descontoPix)) + "</dd></div>" +
                "<div><dt>No cartão</dt><dd>" + (vezes >= 2 ? vezes + "x de " + formatarPreco(total / vezes) : "à vista") + "</dd></div>" +
            "</dl>" +
            '<div class="resultado-total"><span>Valor total</span><strong>' + formatarPreco(total) + "</strong></div>" +
            '<div class="aviso-frete-gratis">' + freteTexto + "</div>" +
        "</div>";
}

function adicionarDoFormulario() {
    if (!estado.ultimoCalculo) {
        calcularTotal();
        return;
    }
    const produto = procurarProduto(estado.ultimoCalculo.id);
    if (produto.sizes.length) {
        abrirLightbox(produto.id, estado.ultimoCalculo.quantidade);
        mostrarAviso("Escolhe o tamanho e joga no carrinho.", "info");
        return;
    }
    adicionarAoCarrinho(produto.id, estado.ultimoCalculo.quantidade, "");
}

function chaveItem(id, tamanho) {
    return id + "|" + (tamanho || "");
}

function adicionarAoCarrinho(id, quantidade, tamanho) {
    const produto = procurarProduto(id);
    const chave = chaveItem(id, tamanho);
    const existente = estado.carrinho.find(function (item) {
        return item.chave === chave;
    });
    const jaNoCarrinho = estado.carrinho.filter(function (item) {
        return item.id === id;
    }).reduce(function (soma, item) {
        return soma + item.qtd;
    }, 0);

    if (jaNoCarrinho + quantidade > produto.stock) {
        mostrarAviso("Só temos " + produto.stock + " unidades desse item no estoque.", "erro");
        return false;
    }

    if (existente) {
        existente.qtd += quantidade;
    } else {
        estado.carrinho.push({ chave: chave, id: id, tamanho: tamanho || "", qtd: quantidade });
    }

    salvarCarrinho();
    mostrarAviso("Boa! " + escapar(produto.name) + (tamanho ? " (" + tamanho + ")" : "") + " entrou no carrinho.", "sucesso");

    const botao = document.querySelector(".btn-carrinho");
    botao.classList.remove("balanco");
    void botao.offsetWidth;
    botao.classList.add("balanco");
    return true;
}

function alterarQuantidade(chave, valor) {
    const item = estado.carrinho.find(function (atual) {
        return atual.chave === chave;
    });
    if (!item) {
        return;
    }
    const produto = procurarProduto(item.id);
    const totalProduto = estado.carrinho.filter(function (atual) {
        return atual.id === item.id;
    }).reduce(function (soma, atual) {
        return soma + atual.qtd;
    }, 0);

    if (valor > 0 && totalProduto >= produto.stock) {
        mostrarAviso("Esse é todo o estoque que temos.", "erro");
        return;
    }

    item.qtd += valor;
    if (item.qtd < 1) {
        removerDoCarrinho(chave);
        return;
    }
    salvarCarrinho();
}

function removerDoCarrinho(chave) {
    estado.carrinho = estado.carrinho.filter(function (item) {
        return item.chave !== chave;
    });
    salvarCarrinho();
    mostrarAviso("Saiu do carrinho. Sem ressentimentos.", "info");
}

function esvaziarCarrinho() {
    estado.carrinho = [];
    salvarCarrinho();
}

function salvarCarrinho() {
    salvarLocal("plantao-carrinho", estado.carrinho);
    atualizarCarrinho();
}

function calcularResumo() {
    let subtotal = 0;
    let peso = 0;
    let itens = 0;

    estado.carrinho.forEach(function (item) {
        const produto = procurarProduto(item.id);
        if (produto) {
            subtotal += Number(produto.price) * item.qtd;
            peso += produto.weight * item.qtd;
            itens += item.qtd;
        }
    });

    let desconto = 0;
    let avisoCupom = "";
    const cupom = estado.cupons.find(function (atual) {
        return atual.code === estado.cupom;
    });

    if (cupom) {
        if (subtotal < cupom.minimum) {
            avisoCupom = "O cupom " + cupom.code + " vale para compras acima de " + formatarPreco(cupom.minimum) + ".";
        } else if (cupom.type === "percent") {
            desconto = subtotal * cupom.value / 100;
        } else {
            desconto = Math.min(cupom.value, subtotal);
        }
    }

    desconto = arredondar(desconto);
    const base = arredondar(subtotal - desconto);
    let frete = null;
    if (estado.entrega && estado.freteTipo && itens > 0) {
        frete = calcularFrete(estado.freteTipo, peso, base).valor;
    }
    const total = arredondar(base + (frete || 0));

    return {
        subtotal: arredondar(subtotal),
        desconto: desconto,
        base: base,
        peso: peso,
        itens: itens,
        frete: frete,
        total: total,
        totalPix: arredondar(total * (1 - LOJA.descontoPix)),
        cupom: cupom,
        avisoCupom: avisoCupom
    };
}

function atualizarCarrinho() {
    const resumo = calcularResumo();
    const caixa = el("cart-items");

    el("cart-count").textContent = resumo.itens;
    el("cart-total-nav").textContent = formatarPreco(resumo.subtotal);

    if (estado.carrinho.length === 0) {
        caixa.innerHTML =
            '<div class="carrinho-vazio">' +
                '<i class="bi bi-cart-x"></i>' +
                "<h3>Seu carrinho tá mais vazio que a Brasília sem gasolina.</h3>" +
                "<p>As ofertas não se compram sozinhas.</p>" +
                '<button type="button" class="btn btn-cartoon btn-amarelo" data-bs-dismiss="offcanvas">Voltar pras compras</button>' +
            "</div>";
        el("cart-resumo").classList.add("d-none");
        el("estrada-frete").classList.add("d-none");
        return;
    }

    el("cart-resumo").classList.remove("d-none");
    el("estrada-frete").classList.remove("d-none");

    caixa.innerHTML = estado.carrinho.map(function (item) {
        const produto = procurarProduto(item.id);
        if (!produto) {
            return "";
        }
        return '<div class="item-carrinho">' +
            '<img src="' + produto.images[0] + '" alt="" width="72" height="72">' +
            "<div>" +
                '<div class="item-nome">' + escapar(produto.name) + "</div>" +
                '<div class="item-detalhe">' + (item.tamanho ? "Tamanho " + item.tamanho + " · " : "") + formatarPreco(produto.price) + " cada</div>" +
                '<div class="seletor-qtd">' +
                    '<button type="button" data-acao="menos" data-chave="' + item.chave + '" aria-label="Diminuir"><i class="bi bi-dash-lg"></i></button>' +
                    "<span>" + item.qtd + "</span>" +
                    '<button type="button" data-acao="mais" data-chave="' + item.chave + '" aria-label="Aumentar"><i class="bi bi-plus-lg"></i></button>' +
                "</div>" +
            "</div>" +
            '<div class="item-preco">' + formatarPreco(Number(produto.price) * item.qtd) +
                '<br><button type="button" class="btn-remover" data-acao="remover" data-chave="' + item.chave + '" aria-label="Remover ' + escapar(produto.name) + '"><i class="bi bi-trash3"></i></button>' +
            "</div>" +
        "</div>";
    }).join("");

    const progresso = Math.min(100, resumo.base / LOJA.freteGratis * 100);
    el("estrada-barra").style.width = progresso + "%";
    el("estrada-carro").style.left = "calc(" + progresso + "% - 22px)";
    el("frete-gratis-texto").innerHTML = resumo.base >= LOJA.freteGratis ?
        '<i class="bi bi-gift-fill"></i> Uhu! A Brasília te leva de graça até Santos (PAC).' :
        "Faltam <strong>" + formatarPreco(LOJA.freteGratis - resumo.base) + "</strong> pra Brasília te levar de graça até Santos.";

    if (resumo.cupom) {
        el("cupom").value = resumo.cupom.code;
        el("cupom-msg").innerHTML = resumo.avisoCupom ?
            '<span class="texto-erro">' + resumo.avisoCupom + "</span>" :
            '<span class="texto-verde fw-bold"><i class="bi bi-check-circle-fill"></i> ' + escapar(resumo.cupom.label) + "</span> " +
            '<button type="button" class="btn btn-link btn-sm p-0" id="btn-remover-cupom">remover</button>';
        const remover = el("btn-remover-cupom");
        if (remover) {
            remover.addEventListener("click", removerCupom);
        }
    } else {
        el("cupom-msg").innerHTML = "";
    }

    el("cart-subtotal").textContent = formatarPreco(resumo.subtotal);
    el("cart-desconto-linha").classList.toggle("d-none", resumo.desconto === 0);
    el("cart-desconto").textContent = "- " + formatarPreco(resumo.desconto);
    el("cart-frete").textContent = resumo.frete === null ? "Calcule acima" : (resumo.frete === 0 ? "Grátis" : formatarPreco(resumo.frete));
    el("cart-total").textContent = formatarPreco(resumo.total);
    el("cart-pix").innerHTML = "ou <strong>" + formatarPreco(resumo.totalPix) + "</strong> no Pix (5% OFF)";

    if (estado.entrega) {
        el("frete-opcoes").innerHTML = htmlOpcoesFrete(resumo.peso, resumo.base);
    }
    if (el("checkout").classList.contains("show")) {
        atualizarCheckout();
    }
}

function aplicarCupom() {
    const codigo = el("cupom").value.trim().toUpperCase();
    const cupom = estado.cupons.find(function (atual) {
        return atual.code === codigo;
    });

    if (!codigo) {
        el("cupom-msg").innerHTML = '<span class="texto-erro">Digite um cupom.</span>';
        return;
    }

    if (!cupom) {
        el("cupom-msg").innerHTML = '<span class="texto-erro">Esse cupom não passou na TV. Tenta LIGUEJA.</span>';
        mostrarAviso("Esse cupom não passou na TV. Tenta LIGUEJA.", "erro");
        return;
    }

    estado.cupom = cupom.code;
    salvarLocal("plantao-cupom", estado.cupom);
    atualizarCarrinho();
    mostrarAviso("Cupom aplicado! Até o apresentador ficou com inveja.", "sucesso");
}

function removerCupom() {
    estado.cupom = "";
    salvarLocal("plantao-cupom", "");
    el("cupom").value = "";
    atualizarCarrinho();
}

function aplicarMascaraCep(campo) {
    const numeros = somenteNumeros(campo.value).slice(0, 8);
    campo.value = numeros.length > 5 ? numeros.slice(0, 5) + "-" + numeros.slice(5) : numeros;
}

function aplicarMascaraTelefone(campo) {
    const numeros = somenteNumeros(campo.value).slice(0, 11);
    let texto = numeros;
    if (numeros.length > 2) {
        texto = "(" + numeros.slice(0, 2) + ") " + numeros.slice(2);
    }
    if (numeros.length > 7) {
        const meio = numeros.length === 11 ? 7 : 6;
        texto = "(" + numeros.slice(0, 2) + ") " + numeros.slice(2, meio) + "-" + numeros.slice(meio);
    }
    campo.value = texto;
}

async function consultarEndereco(cep) {
    try {
        const dados = await buscarJSON("https://viacep.com.br/ws/" + cep + "/json/");
        if (dados.erro) {
            const erro = new Error("CEP não encontrado");
            erro.naoEncontrado = true;
            throw erro;
        }
        return { cep: dados.cep, rua: dados.logradouro, bairro: dados.bairro, cidade: dados.localidade, uf: dados.uf };
    } catch (erro) {
        if (erro.naoEncontrado) {
            throw erro;
        }
        try {
            const dados = await buscarJSON("https://brasilapi.com.br/api/cep/v2/" + cep);
            return { cep: dados.cep, rua: dados.street || "", bairro: dados.neighborhood || "", cidade: dados.city, uf: dados.state };
        } catch (erroReserva) {
            if (erroReserva.status === 404 || erroReserva.status === 400) {
                erroReserva.naoEncontrado = true;
            }
            throw erroReserva;
        }
    }
}

async function consultarCoordenadas(cep) {
    try {
        const dados = await buscarJSON("https://cep.awesomeapi.com.br/json/" + cep);
        const lat = parseFloat(dados.lat);
        const lng = parseFloat(dados.lng);
        if (isNaN(lat) || isNaN(lng)) {
            return null;
        }
        return { lat: lat, lng: lng };
    } catch (erro) {
        return null;
    }
}

function distanciaKm(origem, destino) {
    const raio = 6371;
    const paraRad = Math.PI / 180;
    const dLat = (destino.lat - origem.lat) * paraRad;
    const dLng = (destino.lng - origem.lng) * paraRad;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(origem.lat * paraRad) * Math.cos(destino.lat * paraRad) * Math.sin(dLng / 2) ** 2;
    return raio * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function buscarEntrega(cepDigitado) {
    const cep = somenteNumeros(cepDigitado);
    if (cep.length !== 8) {
        const erro = new Error("CEP incompleto");
        erro.invalido = true;
        throw erro;
    }

    if (estado.entrega && somenteNumeros(estado.entrega.endereco.cep) === cep) {
        return estado.entrega;
    }

    const respostas = await Promise.all([consultarEndereco(cep), consultarCoordenadas(cep)]);
    const endereco = respostas[0];
    const coordenadas = respostas[1];
    const km = coordenadas ? Math.round(distanciaKm(LOJA.origem, coordenadas) * 1.25) : null;

    estado.entrega = { endereco: endereco, km: km };
    estado.freteTipo = "pac";
    sincronizarCep(endereco.cep);
    atualizarCarrinho();
    return estado.entrega;
}

function sincronizarCep(cep) {
    document.querySelectorAll(".campo-cep").forEach(function (campo) {
        if (somenteNumeros(campo.value) !== somenteNumeros(cep)) {
            campo.value = cep;
            aplicarMascaraCep(campo);
        }
    });
}

function mensagemErroCep(erro) {
    if (erro.invalido) {
        return "Digite os 8 números do CEP.";
    }
    if (erro.naoEncontrado) {
        return "Esse CEP não aparece nem no mapa do porta-luvas. Confere os números?";
    }
    return "Eita, a antena caiu e não deu pra consultar o CEP. Tenta de novo.";
}

function calcularFrete(tipo, peso, base) {
    const entrega = estado.entrega;
    const km = entrega.km !== null ? entrega.km : (KM_POR_REGIAO[REGIOES[entrega.endereco.uf]] || 1500);
    const pesoCobrado = Math.max(0.3, peso);
    let valor;
    let dias;

    if (tipo === "pac") {
        valor = 12.9 + km * 0.011 + pesoCobrado * 3.2;
        dias = 3 + Math.ceil(km / 450);
        if (base >= LOJA.freteGratis) {
            valor = 0;
        }
    } else {
        valor = 21.9 + km * 0.022 + pesoCobrado * 5.5;
        dias = 1 + Math.ceil(km / 900);
    }

    return { valor: arredondar(valor), dias: dias, data: dataDeEntrega(dias) };
}

function dataDeEntrega(diasUteis) {
    const data = new Date();
    const feriadosNoCaminho = [];
    let contados = 0;

    while (contados < diasUteis) {
        data.setDate(data.getDate() + 1);
        const chave = data.getFullYear() + "-" + String(data.getMonth() + 1).padStart(2, "0") + "-" + String(data.getDate()).padStart(2, "0");
        const fimDeSemana = data.getDay() === 0 || data.getDay() === 6;
        if (estado.feriados.has(chave) && !fimDeSemana) {
            feriadosNoCaminho.push(estado.feriados.get(chave));
        } else if (!fimDeSemana) {
            contados++;
        }
    }

    return {
        texto: data.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }),
        feriados: feriadosNoCaminho
    };
}

function htmlOpcoesFrete(peso, base) {
    if (!estado.entrega) {
        return "";
    }

    return ["pac", "sedex"].map(function (tipo) {
        const opcao = calcularFrete(tipo, peso, base);
        const selecionada = estado.freteTipo === tipo;
        const feriado = opcao.data.feriados.length ? " · pula o feriado de " + escapar(opcao.data.feriados[0]) : "";
        return '<button type="button" class="opcao-frete' + (selecionada ? " selecionada" : "") + '" data-frete="' + tipo + '" aria-pressed="' + selecionada + '">' +
            "<span>" + (selecionada ? '<i class="bi bi-check-circle-fill me-1"></i>' : "") + "<span>" + (tipo === "pac" ? "PAC" : "SEDEX") +
            "</span><small>Chega até " + opcao.data.texto + feriado + "</small></span>" +
            "<strong>" + (opcao.valor === 0 ? "Grátis" : formatarPreco(opcao.valor)) + "</strong></button>";
    }).join("");
}

function htmlEndereco() {
    const endereco = estado.entrega.endereco;
    const partes = [endereco.rua, endereco.bairro].filter(Boolean).join(", ");
    const distancia = estado.entrega.km !== null ? "Cerca de " + estado.entrega.km.toLocaleString("pt-BR") + " km de Guarulhos" : "Distância estimada pela região";
    return '<div class="endereco-encontrado"><i class="bi bi-geo-alt-fill"></i><div>' +
        (partes ? escapar(partes) + "<br>" : "") + escapar(endereco.cidade) + "/" + escapar(endereco.uf) +
        '<br><small class="text-secundario">' + distancia + "</small></div></div>";
}

async function calcularFreteCarrinho() {
    const botao = el("btn-frete");
    botao.disabled = true;
    el("frete-endereco").innerHTML = '<div class="carregando-linha"><span class="spinner-border spinner-border-sm"></span> Consultando o CEP...</div>';
    el("frete-opcoes").innerHTML = "";

    try {
        await buscarEntrega(el("cep").value);
        el("frete-endereco").innerHTML = htmlEndereco();
        atualizarCarrinho();
    } catch (erro) {
        el("frete-endereco").innerHTML = '<span class="texto-erro">' + mensagemErroCep(erro) + "</span>";
    }
    botao.disabled = false;
}

function pesoEBaseDoSimulador() {
    if (estado.ultimoCalculo) {
        const produto = procurarProduto(estado.ultimoCalculo.id);
        return {
            peso: produto.weight * estado.ultimoCalculo.quantidade,
            base: Number(produto.price) * estado.ultimoCalculo.quantidade,
            texto: "Frete para " + estado.ultimoCalculo.quantidade + " x " + produto.name
        };
    }
    const resumo = calcularResumo();
    if (resumo.itens > 0) {
        return { peso: resumo.peso, base: resumo.base, texto: "Frete para os itens do seu carrinho" };
    }
    return { peso: 0.3, base: 0, texto: "Frete para um item leve (simule um produto ao lado)" };
}

function renderizarFreteSimulador() {
    if (!estado.entrega) {
        return;
    }
    const dados = pesoEBaseDoSimulador();
    el("frete-simulador").innerHTML = htmlEndereco() +
        '<p class="small fw-bold mb-2">' + escapar(dados.texto) + "</p>" +
        htmlOpcoesFrete(dados.peso, dados.base);
}

async function calcularFreteSimulador() {
    const botao = el("btn-cep-simulador");
    botao.disabled = true;
    el("frete-simulador").innerHTML = '<div class="carregando-linha"><span class="spinner-border spinner-border-sm"></span> Ligando pro carteiro...</div>';

    try {
        await buscarEntrega(el("cep-simulador").value);
        renderizarFreteSimulador();
        el("frete-endereco").innerHTML = htmlEndereco();
    } catch (erro) {
        el("frete-simulador").innerHTML = '<span class="texto-erro">' + mensagemErroCep(erro) + "</span>";
    }
    botao.disabled = false;
}

function escolherFrete(tipo) {
    estado.freteTipo = tipo;
    atualizarCarrinho();
    renderizarFreteSimulador();
}

async function carregarFeriados() {
    const ano = new Date().getFullYear();
    try {
        const listas = await Promise.all([
            buscarComCache("feriados-" + ano, "https://brasilapi.com.br/api/feriados/v1/" + ano, 1440),
            buscarComCache("feriados-" + (ano + 1), "https://brasilapi.com.br/api/feriados/v1/" + (ano + 1), 1440)
        ]);
        listas.flat().forEach(function (feriado) {
            estado.feriados.set(feriado.date, feriado.name);
        });
    } catch (erro) {
        estado.feriados = new Map();
    }
}

async function carregarCotacoes() {
    const select = el("moeda");
    try {
        const dados = await buscarComCache("cotacoes", "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL", 10);
        estado.cotacoes = {
            USD: parseFloat(dados.USDBRL.bid),
            EUR: parseFloat(dados.EURBRL.bid),
            hora: dados.USDBRL.create_date
        };
        const texto = "Dólar do dia: R$ " + estado.cotacoes.USD.toFixed(2).replace(".", ",") +
            " · Euro: R$ " + estado.cotacoes.EUR.toFixed(2).replace(".", ",");
        el("ticker-dolar").textContent = texto;
        document.querySelector(".ticker-dolar-copia").textContent = texto;

        const salva = lerLocal("plantao-moeda", "BRL");
        if (salva !== "BRL" && estado.cotacoes[salva]) {
            select.value = salva;
            trocarMoeda(true);
        }
    } catch (erro) {
        select.querySelectorAll('option:not([value="BRL"])').forEach(function (opcao) {
            opcao.disabled = true;
        });
        el("ticker-dolar").textContent = "Cotação do dólar fora do ar";
        document.querySelector(".ticker-dolar-copia").textContent = "Cotação do dólar fora do ar";
    }
}

function trocarMoeda(silencioso) {
    const codigo = el("moeda").value;

    if (codigo !== "BRL" && !estado.cotacoes) {
        el("moeda").value = "BRL";
        mostrarAviso("A cotação ainda está carregando. Tenta de novo em instantes.", "erro");
        return;
    }

    estado.moeda = { codigo: codigo, taxa: codigo === "BRL" ? 1 : estado.cotacoes[codigo] };
    salvarLocal("plantao-moeda", codigo);
    atualizarPrecosNaTela();

    if (silencioso !== true && codigo !== "BRL") {
        const hora = estado.cotacoes.hora.slice(11, 16);
        mostrarAviso("Preços convertidos pela cotação das " + hora + ". A cobrança seria em reais.", "info");
    }
}

function atualizarPrecosNaTela() {
    document.querySelectorAll("[data-preco]").forEach(function (elemento) {
        elemento.textContent = formatarPreco(elemento.dataset.preco);
    });

    if (estado.produtos.length === 0) {
        return;
    }

    const selecionado = el("product").value;
    preencherSelectProdutos();
    el("product").value = selecionado;

    renderizarVitrine(estado.listaAtual);
    renderizarHero();
    renderizarOferta();
    preencherPrecosLightbox();
    mostrarResultadoCalculo();
    renderizarFreteSimulador();
    atualizarCarrinho();
}

async function carregarJukebox() {
    el("jukebox-erro").classList.add("d-none");
    el("lista-faixas").classList.remove("d-none");

    try {
        const dados = await buscarComCache("itunes-album", "https://itunes.apple.com/lookup?id=" + LOJA.albumId + "&entity=song&country=BR", 60);
        const album = dados.results.find(function (item) {
            return item.wrapperType === "collection";
        });
        const faixas = dados.results.filter(function (item) {
            return item.wrapperType === "track" && item.previewUrl;
        }).sort(function (a, b) {
            return a.discNumber - b.discNumber || a.trackNumber - b.trackNumber;
        });

        if (!album || faixas.length === 0) {
            throw new Error("Álbum sem faixas");
        }

        estado.album = album;
        estado.faixas = faixas;

        const capa = album.artworkUrl100.replace("100x100bb", "600x600bb");
        el("disco-capa").src = capa;
        el("disco-capa").alt = "Capa do álbum " + album.collectionName;
        el("mini-capa").src = album.artworkUrl100;
        el("album-titulo").textContent = album.collectionName;
        el("album-info").textContent = new Date(album.releaseDate).getFullYear() + " · " + faixas.length + " faixas · " + album.primaryGenreName;
        el("album-link").href = album.collectionViewUrl;
        el("album-link").classList.remove("d-none");
        el("lista-faixas").innerHTML = faixas.map(htmlFaixa).join("");
        renderizarMusicaLightbox();
    } catch (erro) {
        el("lista-faixas").classList.add("d-none");
        el("jukebox-erro").classList.remove("d-none");
        el("album-titulo").textContent = "Disco fora do ar";
    }
}

function formatarDuracao(milissegundos) {
    const totalSegundos = Math.round(milissegundos / 1000);
    return Math.floor(totalSegundos / 60) + ":" + String(totalSegundos % 60).padStart(2, "0");
}

function htmlFaixa(faixa) {
    const nome = escapar(faixa.trackName);
    return '<li class="faixa" data-faixa="' + faixa.trackId + '">' +
        '<span class="faixa-numero">' + faixa.trackNumber + "</span>" +
        '<button type="button" class="btn-play" data-acao="tocar" data-faixa="' + faixa.trackId + '" aria-label="Tocar prévia de ' + nome + '"><i class="bi bi-play-fill"></i></button>' +
        '<span class="faixa-nome">' + nome + "</span>" +
        '<span class="equalizador" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="faixa-tempo">' + formatarDuracao(faixa.trackTimeMillis) + "</span>" +
        '<a class="faixa-link" href="' + faixa.trackViewUrl + '" target="_blank" rel="noopener" aria-label="Ouvir ' + nome + ' no Apple Music"><i class="bi bi-apple"></i></a>' +
    "</li>";
}

function tocarFaixa(idFaixa) {
    const faixa = estado.faixas.find(function (item) {
        return String(item.trackId) === String(idFaixa);
    });
    if (!faixa) {
        return;
    }

    if (estado.faixaAtual && estado.faixaAtual.trackId === faixa.trackId) {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
        return;
    }

    estado.faixaAtual = faixa;
    audio.src = faixa.previewUrl;
    el("mini-faixa").textContent = faixa.trackName;
    el("mini-player").classList.add("visivel");
    audio.play().catch(function () {
        mostrarAviso("O navegador bloqueou o som. Clica no play de novo.", "erro");
    });
    atualizarInterfacePlayer();
}

function atualizarInterfacePlayer() {
    const tocando = estado.faixaAtual && !audio.paused;

    document.querySelectorAll(".faixa").forEach(function (item) {
        const ativa = estado.faixaAtual && item.dataset.faixa === String(estado.faixaAtual.trackId);
        item.classList.toggle("ativa", Boolean(ativa));
        item.classList.toggle("tocando", Boolean(ativa && tocando));
        const icone = item.querySelector(".btn-play i");
        if (icone) {
            icone.className = "bi " + (ativa && tocando ? "bi-pause-fill" : "bi-play-fill");
        }
    });

    el("disco").classList.toggle("tocando", Boolean(tocando));
    el("mini-play").innerHTML = '<i class="bi ' + (tocando ? "bi-pause-fill" : "bi-play-fill") + '"></i>';
    el("mini-play").setAttribute("aria-label", tocando ? "Pausar" : "Tocar");
}

function proximaFaixa() {
    if (!estado.faixaAtual) {
        return;
    }
    const posicao = estado.faixas.findIndex(function (item) {
        return item.trackId === estado.faixaAtual.trackId;
    });
    const proxima = estado.faixas[posicao + 1];
    if (proxima) {
        tocarFaixa(proxima.trackId);
    } else {
        atualizarInterfacePlayer();
    }
}

function fecharPlayer() {
    audio.pause();
    el("mini-player").classList.remove("visivel");
}

async function carregarHistoria() {
    try {
        const dados = await buscarComCache("wiki-mamonas", "https://pt.wikipedia.org/api/rest_v1/page/summary/Mamonas_Assassinas", 1440);
        if (dados.extract) {
            el("wiki-texto").textContent = dados.extract;
            el("wiki-link").href = dados.content_urls.desktop.page;
        }
    } catch (erro) {
        el("wiki-texto").textContent = "Os Mamonas Assassinas foram uma banda de rock cômico formada em Guarulhos (SP). Com um único álbum de estúdio, lançado em 1995, misturaram rock, forró, vira português e muito humor, e conquistaram o Brasil inteiro em poucos meses.";
    }
}

function renderizarCreditos() {
    el("lista-creditos").innerHTML = estado.creditos.map(function (credito) {
        return "<li><strong>" + escapar(credito.title) + "</strong>" +
            "Autor: " + escapar(credito.author) + " · " +
            '<a href="' + credito.licenseUrl + '" target="_blank" rel="noopener">' + escapar(credito.license) + "</a> · " +
            '<a href="' + credito.source + '" target="_blank" rel="noopener">Arquivo original</a>' +
            '<br><small class="text-secundario">' + escapar(credito.changes) + "</small></li>";
    }).join("");
}

function configurarQrCompartilhar() {
    const endereco = location.href.split("#")[0];
    el("qr-compartilhar").src = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&data=" + encodeURIComponent(endereco);
}

async function carregarEstados() {
    if (estado.estadosCarregados) {
        return;
    }
    const select = el("ck-uf");
    let estados;

    try {
        const dados = await buscarComCache("ibge-estados", "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome", 1440);
        estados = dados.map(function (item) {
            return { sigla: item.sigla, nome: item.nome };
        });
    } catch (erro) {
        estados = ESTADOS_RESERVA.map(function (sigla) {
            return { sigla: sigla, nome: sigla };
        });
    }

    select.innerHTML = '<option value="">Selecione</option>' + estados.map(function (item) {
        return '<option value="' + item.sigla + '">' + escapar(item.nome) + "</option>";
    }).join("");
    estado.estadosCarregados = true;

    if (estado.entrega) {
        select.value = estado.entrega.endereco.uf;
    }
}

function abrirCheckout() {
    if (estado.carrinho.length === 0) {
        mostrarAviso("Seu carrinho está vazio.", "erro");
        return;
    }

    painelCarrinho.hide();
    irParaPasso(1);
    carregarEstados();

    if (estado.entrega) {
        preencherEnderecoCheckout(estado.entrega.endereco);
    }
    atualizarCheckout();
    checkout.show();
}

function preencherEnderecoCheckout(endereco) {
    el("ck-cep").value = endereco.cep;
    aplicarMascaraCep(el("ck-cep"));
    el("ck-rua").value = endereco.rua || el("ck-rua").value;
    el("ck-bairro").value = endereco.bairro || el("ck-bairro").value;
    el("ck-cidade").value = endereco.cidade;
    el("ck-uf").value = endereco.uf;
    el("ck-cep").classList.remove("is-invalid");
}

function irParaPasso(numero) {
    estado.passo = numero;
    const telas = ["form-dados", "form-entrega", "form-pagamento", "ck-confirmacao"];

    telas.forEach(function (id, indice) {
        el(id).classList.toggle("d-none", indice !== numero - 1);
    });

    document.querySelectorAll("#passos li").forEach(function (item, indice) {
        item.classList.toggle("ativo", indice === numero - 1);
        item.classList.toggle("feito", indice < numero - 1);
    });

    el("ck-voltar").classList.toggle("d-none", numero === 1 || numero === 4);
    el("ck-avancar").innerHTML = numero === 3 ? 'Confirmar pedido <i class="bi bi-check-lg"></i>' :
        (numero === 4 ? "Voltar pra loja" : 'Continuar <i class="bi bi-arrow-right"></i>');
}

function atualizarCheckout() {
    const resumo = calcularResumo();
    const pagamento = document.querySelector('input[name="pagamento"]:checked').value;

    el("ck-frete-opcoes").innerHTML = estado.entrega ? htmlOpcoesFrete(resumo.peso, resumo.base) : '<p class="small text-secundario mb-0">Digite o CEP acima para ver as opções.</p>';

    const linhas = estado.carrinho.map(function (item) {
        const produto = procurarProduto(item.id);
        return '<div class="linha"><span>' + item.qtd + "x " + escapar(produto.name) + (item.tamanho ? " (" + item.tamanho + ")" : "") + "</span><span>" + formatarPreco(Number(produto.price) * item.qtd) + "</span></div>";
    }).join("");

    el("ck-resumo").innerHTML = "<h3>Resumo</h3>" + linhas +
        (resumo.desconto ? '<div class="linha texto-verde"><span>Cupom ' + escapar(resumo.cupom.code) + "</span><span>- " + formatarPreco(resumo.desconto) + "</span></div>" : "") +
        '<div class="linha"><span>Frete (' + (estado.freteTipo || "").toUpperCase() + ")</span><span>" + (resumo.frete === null ? "--" : (resumo.frete === 0 ? "Grátis" : formatarPreco(resumo.frete))) + "</span></div>" +
        '<div class="linha linha-total"><span>Total' + (pagamento === "pix" ? " no Pix" : "") + "</span><span>" + formatarPreco(pagamento === "pix" ? resumo.totalPix : resumo.total) + "</span></div>";
}

function validarDados() {
    const formulario = el("form-dados");
    const email = el("ck-email");
    const telefone = el("ck-telefone");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    const telefoneOk = somenteNumeros(telefone.value).length >= 10;

    email.setCustomValidity(emailOk ? "" : "invalido");
    telefone.setCustomValidity(telefoneOk ? "" : "invalido");
    formulario.classList.add("was-validated");
    return formulario.checkValidity();
}

function validarEntrega() {
    const formulario = el("form-entrega");
    const cepOk = estado.entrega && somenteNumeros(estado.entrega.endereco.cep) === somenteNumeros(el("ck-cep").value);

    el("ck-cep").setCustomValidity(cepOk ? "" : "invalido");
    formulario.classList.add("was-validated");
    el("ck-frete-erro").classList.toggle("d-none", Boolean(cepOk && estado.freteTipo));
    return formulario.checkValidity() && Boolean(estado.freteTipo);
}

async function buscarCepCheckout() {
    const campo = el("ck-cep");
    if (somenteNumeros(campo.value).length !== 8) {
        return;
    }

    el("ck-cep-erro").textContent = "Consultando...";
    try {
        const entrega = await buscarEntrega(campo.value);
        preencherEnderecoCheckout(entrega.endereco);
        el("ck-cep").setCustomValidity("");
        el("frete-endereco").innerHTML = htmlEndereco();
        renderizarFreteSimulador();
        atualizarCheckout();
        el("ck-numero").focus();
    } catch (erro) {
        campo.setCustomValidity("invalido");
        campo.classList.add("is-invalid");
        el("ck-cep-erro").textContent = mensagemErroCep(erro);
    }
}

function avancarCheckout() {
    if (estado.passo === 1 && validarDados()) {
        irParaPasso(2);
        if (estado.entrega) {
            preencherEnderecoCheckout(estado.entrega.endereco);
        }
        atualizarCheckout();
    } else if (estado.passo === 2 && validarEntrega()) {
        irParaPasso(3);
        atualizarCheckout();
    } else if (estado.passo === 3) {
        confirmarPedido();
    } else if (estado.passo === 4) {
        checkout.hide();
    }
}

function confirmarPedido() {
    const resumo = calcularResumo();
    const pagamento = document.querySelector('input[name="pagamento"]:checked').value;
    const valor = pagamento === "pix" ? resumo.totalPix : resumo.total;
    const numero = "#" + (140600 + Math.floor(Math.random() * 9000));
    const entrega = calcularFrete(estado.freteTipo, resumo.peso, resumo.base);
    const primeiroNome = el("ck-nome").value.trim().split(" ")[0];

    el("ck-numero-pedido").textContent = numero;
    el("ck-entrega-data").innerHTML = "Valeu, <strong>" + escapar(primeiroNome) + "</strong>! Pelo " + estado.freteTipo.toUpperCase() +
        ", chegaria em " + escapar(estado.entrega.endereco.cidade) + "/" + escapar(estado.entrega.endereco.uf) + " até <strong>" + entrega.data.texto + "</strong>.";

    if (pagamento === "pix") {
        const codigo = "PLANTAO1406-DEMO-" + numero.slice(1) + "-" + valor.toFixed(2).replace(".", "");
        el("ck-pagamento-info").innerHTML =
            "<p class=\"fw-bold mb-1\">Pix de demonstração no valor de " + formatarPreco(valor) + "</p>" +
            '<img class="qr-pix" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=FFD400&data=' + encodeURIComponent(codigo) + '" alt="QR code de demonstração do pedido" width="200" height="200">' +
            '<div class="input-group codigo-pix"><input type="text" class="form-control" id="codigo-pix" value="' + codigo + '" readonly aria-label="Código Pix de demonstração">' +
            '<button class="btn btn-cartoon btn-escuro" type="button" id="btn-copiar-pix">Copiar</button></div>';
    } else {
        const linha = "14060.19950 " + numero.slice(1) + "1.406140 60199.506140 1 " + Math.round(valor * 100);
        el("ck-pagamento-info").innerHTML =
            "<p class=\"fw-bold mb-1\">Boleto de demonstração no valor de " + formatarPreco(valor) + "</p>" +
            '<div class="input-group codigo-pix"><input type="text" class="form-control" id="codigo-pix" value="' + linha + '" readonly aria-label="Linha digitável de demonstração">' +
            '<button class="btn btn-cartoon btn-escuro" type="button" id="btn-copiar-pix">Copiar</button></div>';
    }

    el("btn-copiar-pix").addEventListener("click", copiarCodigo);

    const pedidos = lerLocal("plantao-pedidos", []);
    pedidos.unshift({ numero: numero, valor: valor, data: new Date().toISOString(), itens: resumo.itens });
    salvarLocal("plantao-pedidos", pedidos.slice(0, 10));

    irParaPasso(4);
    soltarConfete();
    estado.carrinho = [];
    estado.cupom = "";
    salvarLocal("plantao-cupom", "");
    el("cupom").value = "";
    salvarCarrinho();
}

function copiarCodigo() {
    const campo = el("codigo-pix");
    campo.select();
    if (navigator.clipboard) {
        navigator.clipboard.writeText(campo.value).then(function () {
            mostrarAviso("Código copiado!", "sucesso");
        }).catch(function () {
            mostrarAviso("Selecione o código e copie manualmente.", "erro");
        });
    }
}

function soltarConfete() {
    const caixa = document.querySelector(".confete");
    const cores = ["#FFD400", "#FF2D87", "#1F3FFF", "#FF7A00", "#3DDC84"];
    let html = "";
    for (let i = 0; i < 40; i++) {
        html += '<i style="left:' + Math.random() * 100 + "%;background:" + cores[i % cores.length] +
            ";animation-delay:" + (Math.random() * 0.6).toFixed(2) + "s;transform:rotate(" + Math.round(Math.random() * 360) + 'deg)"></i>';
    }
    caixa.innerHTML = html;
}

function cadastrarNewsletter(evento) {
    evento.preventDefault();
    const campo = el("news-email");
    const mensagem = el("news-msg");
    const email = campo.value.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        campo.classList.add("is-invalid");
        mensagem.innerHTML = '<span class="texto-erro">Esse e-mail não parece certo. Confere aí?</span>';
        return;
    }

    const fas = lerLocal("plantao-fa-clube", []);
    campo.classList.remove("is-invalid");
    campo.value = "";

    if (fas.includes(email)) {
        mensagem.innerHTML = '<strong>Você já tá no fã-clube!</strong> A gente não esqueceu de você.';
        return;
    }

    fas.push(email);
    salvarLocal("plantao-fa-clube", fas);
    mensagem.innerHTML = '<strong><i class="bi bi-check-circle-fill"></i> Pronto!</strong> Agora você fica sabendo das ofertas antes do plantão.';
    mostrarAviso("Bem-vindo ao fã-clube!", "sucesso");
}

function tratarCliqueProdutos(evento) {
    const alvo = evento.target.closest("[data-acao]");
    if (!alvo) {
        return;
    }
    const id = alvo.dataset.id;
    const acao = alvo.dataset.acao;

    if (acao === "detalhes") {
        evento.preventDefault();
        abrirLightbox(id);
    } else if (acao === "comprar") {
        const produto = procurarProduto(id);
        if (produto.sizes.length) {
            abrirLightbox(id);
            mostrarAviso("Escolhe o tamanho e joga no carrinho.", "info");
        } else {
            adicionarAoCarrinho(id, 1, "");
        }
    } else if (acao === "favoritar") {
        alternarFavorito(id);
    } else if (acao === "tocar") {
        tocarFaixa(alvo.dataset.faixa);
    }
}

function tratarTeclaProdutos(evento) {
    if ((evento.key === "Enter" || evento.key === " ") && evento.target.matches(".foto-produto")) {
        evento.preventDefault();
        abrirLightbox(evento.target.dataset.id);
    }
}

function filtrarPorCategoria(categoria) {
    el("category-filter").value = categoria;
    filtrarProdutos();
    irParaProdutos();
}

el("product-list").addEventListener("click", tratarCliqueProdutos);
el("product-list").addEventListener("keydown", tratarTeclaProdutos);
el("hero-slides").addEventListener("click", tratarCliqueProdutos);
el("oferta-produto").addEventListener("click", tratarCliqueProdutos);
el("lista-faixas").addEventListener("click", tratarCliqueProdutos);
el("lightbox-musica").addEventListener("click", tratarCliqueProdutos);

el("categorias-lista").addEventListener("click", function (evento) {
    const botao = evento.target.closest("[data-categoria]");
    if (botao) {
        filtrarPorCategoria(botao.dataset.categoria);
    }
});

el("category-filter").addEventListener("change", filtrarProdutos);
el("sort").addEventListener("change", filtrarProdutos);
el("so-ofertas").addEventListener("change", filtrarProdutos);
el("so-favoritos").addEventListener("change", function () {
    el("btn-favoritos").classList.toggle("ativo", el("so-favoritos").checked);
    filtrarProdutos();
});
el("search").addEventListener("input", function () {
    clearTimeout(temporizadorBusca);
    temporizadorBusca = setTimeout(filtrarProdutos, 250);
});

el("btn-busca").addEventListener("click", function () {
    irParaProdutos();
    setTimeout(function () {
        el("search").focus({ preventScroll: true });
    }, 500);
});

el("btn-favoritos").addEventListener("click", function () {
    if (estado.favoritos.length === 0) {
        mostrarAviso("Você ainda não favoritou nada. Clica no coraçãozinho dos produtos!", "info");
        return;
    }
    el("so-favoritos").checked = true;
    el("btn-favoritos").classList.add("ativo");
    filtrarProdutos();
    irParaProdutos();
});

el("btn-colecao-brasilia").addEventListener("click", function () {
    el("category-filter").value = "";
    el("search").value = "Brasília";
    filtrarProdutos();
    irParaProdutos();
});

el("moeda").addEventListener("change", function () {
    trocarMoeda(false);
});

el("lightbox-thumbs").addEventListener("click", function (evento) {
    const botao = evento.target.closest("[data-imagem]");
    if (!botao) {
        return;
    }
    el("lightbox-image").src = botao.dataset.imagem;
    el("lightbox-thumbs").querySelectorAll("button").forEach(function (item) {
        item.classList.toggle("ativo", item === botao);
    });
});
el("lightbox-sizes").addEventListener("change", function () {
    el("lightbox-size-erro").classList.add("d-none");
});
el("lightbox-buy").addEventListener("click", comprarDoLightbox);
el("lightbox-menos").addEventListener("click", function () {
    mudarQuantidadeLightbox(-1);
});
el("lightbox-mais").addEventListener("click", function () {
    mudarQuantidadeLightbox(1);
});
el("lightbox-fav").addEventListener("click", function () {
    if (estado.produtoAberto) {
        alternarFavorito(estado.produtoAberto.id);
    }
});
el("lightbox").addEventListener("hidden.bs.modal", function () {
    estado.produtoAberto = null;
});

el("calculate").addEventListener("click", calcularTotal);
el("add-from-form").addEventListener("click", adicionarDoFormulario);
el("calc-form").addEventListener("submit", function (evento) {
    evento.preventDefault();
    calcularTotal();
});
el("product").addEventListener("change", function () {
    el("add-from-form").disabled = true;
    el("total-value").innerHTML = "";
    estado.ultimoCalculo = null;
    el("product").classList.remove("is-invalid");
    renderizarFreteSimulador();
});
el("quantity").addEventListener("input", function () {
    el("add-from-form").disabled = true;
    el("quantity").classList.remove("is-invalid");
});

document.querySelectorAll(".campo-cep").forEach(function (campo) {
    campo.addEventListener("input", function () {
        aplicarMascaraCep(campo);
    });
});
el("cep").addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        evento.preventDefault();
        calcularFreteCarrinho();
    }
});
el("cep-simulador").addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        evento.preventDefault();
        calcularFreteSimulador();
    }
});
el("btn-frete").addEventListener("click", calcularFreteCarrinho);
el("btn-cep-simulador").addEventListener("click", calcularFreteSimulador);
el("ck-cep").addEventListener("input", function () {
    el("ck-cep").classList.remove("is-invalid");
    el("ck-cep-erro").textContent = "Informe um CEP válido.";
    if (somenteNumeros(el("ck-cep").value).length === 8) {
        buscarCepCheckout();
    }
});
el("ck-telefone").addEventListener("input", function () {
    aplicarMascaraTelefone(el("ck-telefone"));
});

["frete-opcoes", "frete-simulador", "ck-frete-opcoes"].forEach(function (id) {
    el(id).addEventListener("click", function (evento) {
        const opcao = evento.target.closest("[data-frete]");
        if (opcao) {
            escolherFrete(opcao.dataset.frete);
            el("ck-frete-erro").classList.add("d-none");
        }
    });
});

el("cart-items").addEventListener("click", function (evento) {
    const alvo = evento.target.closest("[data-acao]");
    if (!alvo) {
        return;
    }
    if (alvo.dataset.acao === "mais") {
        alterarQuantidade(alvo.dataset.chave, 1);
    } else if (alvo.dataset.acao === "menos") {
        alterarQuantidade(alvo.dataset.chave, -1);
    } else if (alvo.dataset.acao === "remover") {
        removerDoCarrinho(alvo.dataset.chave);
    }
});
el("btn-cupom").addEventListener("click", aplicarCupom);
el("cupom").addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        evento.preventDefault();
        aplicarCupom();
    }
});
el("btn-limpar").addEventListener("click", function () {
    if (confirm("Quer mesmo esvaziar o carrinho?")) {
        esvaziarCarrinho();
    }
});
el("btn-finalizar").addEventListener("click", abrirCheckout);

el("ck-avancar").addEventListener("click", avancarCheckout);
el("ck-voltar").addEventListener("click", function () {
    irParaPasso(Math.max(1, estado.passo - 1));
});
document.querySelectorAll('input[name="pagamento"]').forEach(function (opcao) {
    opcao.addEventListener("change", atualizarCheckout);
});
el("checkout").addEventListener("hidden.bs.modal", function () {
    if (estado.passo === 4) {
        ["form-dados", "form-entrega"].forEach(function (id) {
            el(id).classList.remove("was-validated");
        });
        irParaPasso(1);
    }
});

el("btn-recarregar-jukebox").addEventListener("click", function () {
    sessionStorage.removeItem("itunes-album");
    carregarJukebox();
});
audio.addEventListener("play", atualizarInterfacePlayer);
audio.addEventListener("pause", atualizarInterfacePlayer);
audio.addEventListener("ended", proximaFaixa);
audio.addEventListener("timeupdate", function () {
    const porcentagem = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    el("mini-progresso").style.width = porcentagem + "%";
});
el("mini-play").addEventListener("click", function () {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});
el("mini-fechar").addEventListener("click", fecharPlayer);

el("news-form").addEventListener("submit", cadastrarNewsletter);

document.querySelectorAll("#menu-links .nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
        const menu = el("menu-links");
        if (menu.classList.contains("show")) {
            bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
    });
});

window.addEventListener("scroll", function () {
    el("voltar-topo").classList.toggle("mostrar", window.scrollY > 600);
}, { passive: true });

atualizarFavoritos();
iniciar();
