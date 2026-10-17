/**
 * Página inicial "cinema": cena 3D no topo, manifesto que se acende ao rolar,
 * números grandes, grelha de demonstrações vivas, vitrine Pro com aurora em
 * WebGL, instalador dos sistemas e o resto do conteúdo do Atalho.
 * Estilos em site/inicio.css; comportamento em site/inicio.js.
 */
import { url } from "./config.mjs";
import { ICONES_SITE } from "./layout.mjs";
import { svgPhosphor } from "./icones-phosphor.mjs";
import { esc, realcarHTML, realcarTS, realcarPHP } from "./realce.mjs";

const ANIMACOES_PRO = [
  ["cube", "Produto 3D que gira com o scroll"],
  ["drop", "Vidro líquido"],
  ["sparkle", "Partículas que formam o seu logótipo"],
  ["sun-horizon", "Aurora de luz"],
  ["globe-hemisphere-west", "Globo de clientes"],
  ["stack", "Camadas a abrir em 3D"],
  ["film-strip", "Vídeo que avança com o scroll"],
  ["magic-wand", "Texto com brilho de cinema"],
];

export function conteudoInicio({ total, exemplos, docs, vitrine, categorias, baseline, recursos, amplos, linksPt, dataDados, autor }) {
  return `
    <section class="cine-hero" aria-labelledby="cine-titulo">
      <canvas class="cine-hero-3d" aria-hidden="true" data-cena-3d></canvas>
      <div class="cine-hero-luz" aria-hidden="true"></div>
      <div class="site-container cine-hero-texto">
        <button type="button" class="site-novidade cine-entrar" data-abrir-assistente>
          <span class="at-selo at-destaque">Novo</span> Descreva o que precisa e o assistente monta ${ICONES_SITE.seta}
        </button>
        <h1 id="cine-titulo" class="cine-titulo"><span class="cine-entrar">O atalho para sites</span> <span class="cine-entrar cine-ouro">que vendem.</span></h1>
        <p class="cine-sub cine-entrar">${total} componentes grátis, animações de cinema em 3D e sistemas completos que se instalam com um clique. Em português, para Portugal e para a Europa.</p>
        <div class="cine-acoes cine-entrar">
          <a class="cine-botao cine-botao-primario" href="${url("componentes/instalacao/")}">Começar grátis</a>
          <a class="cine-botao cine-botao-vidro" href="${url("animacoes/")}">Ver as animações ${ICONES_SITE.seta}</a>
        </div>
        <div class="site-busca cine-busca cine-entrar" role="search">
          <label class="site-busca-campo">
            ${ICONES_SITE.busca}
            <span class="at-sr">O que quer construir?</span>
            <input id="busca-inicio" type="search" placeholder="O que quer construir?" autocomplete="off"
                   role="combobox" aria-expanded="false" aria-controls="busca-inicio-resultados" aria-autocomplete="list">
            <kbd class="at-tecla at-so-desktop">Ctrl K</kbd>
          </label>
          <ul class="site-busca-resultados" id="busca-inicio-resultados" role="listbox" aria-label="Componentes encontrados" hidden></ul>
        </div>
        <div class="site-sugestoes cine-entrar">
          Experimente:
          ${["máscara de NIF", "carrinho de compras", "janela de confirmação", "tabela com filtro", "login com código"].map((s) => `<button type="button" class="site-sugestao" data-sugestao="${s}">${s}</button>`).join("")}
        </div>
      </div>
      <a class="cine-rolar" href="#manifesto" aria-label="Continuar a ler"><span></span></a>
    </section>

    <section class="cine-manifesto" id="manifesto" aria-label="O que é o Atalho">
      <p class="site-container cine-manifesto-texto" data-palavras>Componentes prontos a copiar. Animações com qualidade de cinema. Sistemas inteiros que se instalam com um clique. Tudo explicado em português, sem rodeios, para quem quer vender mais e programar menos.</p>
    </section>

    <section class="cine-numeros" aria-label="O Atalho em números">
      <div class="site-container cine-numeros-grade">
        <div data-revelar><strong data-contar="${total}">${total}</strong><span>componentes e receitas grátis</span></div>
        <div data-revelar><strong data-contar="119">119</strong><span>componentes avançados</span></div>
        <div data-revelar><strong data-contar="48">48</strong><span>animações editáveis</span></div>
        <div data-revelar><strong>0</strong><span>dependências para instalar</span></div>
      </div>
    </section>

    <section class="cine-secao" aria-labelledby="bento-titulo">
      <div class="site-container">
        <p class="cine-sobretitulo" data-revelar>Feito para vender</p>
        <h2 class="cine-h2" id="bento-titulo" data-revelar>Tudo o que o Bootstrap tem.<br><span class="cine-suave">E o que faltava a quem vende em português.</span></h2>
        <div class="cine-bento">
          <article class="cine-bloco cine-bloco-largo cine-bloco-loja" data-revelar aria-label="Demonstração ao vivo">
            <div class="cine-bloco-texto">
              <span class="site-etiqueta-viva">AO VIVO</span>
              <h3>Uma loja que já funciona.</h3>
              <p>Carrinho, contador e notificação ligados pelo estado do Atalho. Sem framework, sem build.</p>
            </div>
            <article class="at-cartao cine-produto">
              <div class="at-cartao-cabecalho">
                <h4 class="at-texto-pequeno">Loja exemplo</h4>
                <button class="at-botao at-icone at-contador-selo at-pequeno" aria-label="Carrinho">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6"/></svg>
                  <span data-contador data-at-texto="vitrineInicio.quantidade" data-at-mostrar="vitrineInicio.quantidade"></span>
                </button>
              </div>
              <div class="at-cartao-corpo at-linha at-topo" style="--at-gap: 16px">
                <img src="https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp" alt="Ténis cano alto vermelho e preto" width="104" height="104" style="background:#fff;border-radius:14px;object-fit:contain">
                <div class="at-cresce at-pilha" style="--at-gap: 2px">
                  <span class="at-texto-pequeno">Ténis cano alto vermelho e preto</span>
                  <span class="at-preco-antigo">799,90 €</span>
                  <div><span class="at-preco">599,90 €</span><span class="at-preco-desconto">25% OFF</span></div>
                  <span class="at-parcelas">ou 3x 199,97 € sem juros</span>
                  <button class="at-botao at-primario at-pequeno at-mt-2" data-at-acao="vitrineInicio.adicionar">Comprar</button>
                </div>
              </div>
            </article>
          </article>

          <article class="cine-bloco" data-revelar>
            <h3>NIF, IBAN e código postal.</h3>
            <p>Validados enquanto se escreve. A morada preenche-se sozinha.</p>
            <form class="at-formulario cine-form" data-at-validar id="form-inicio">
              <div class="at-campo at-meio">
                <label class="at-rotulo" for="inicio-cpf">NIF</label>
                <input class="at-entrada" id="inicio-cpf" name="nif" required data-at-mascara="nif" placeholder="123 456 789">
              </div>
              <div class="at-campo at-meio">
                <label class="at-rotulo" for="inicio-cep">Código postal</label>
                <input class="at-entrada" id="inicio-cep" name="codigo_postal" required data-at-mascara="codigo-postal" data-at-codigo-postal placeholder="1250-096">
              </div>
              <div class="at-campo">
                <label class="at-rotulo" for="inicio-rua">Morada</label>
                <input class="at-entrada" id="inicio-rua" name="rua" required data-at-cp-preencher="rua" placeholder="Preenche-se sozinha pelo código postal">
              </div>
              <button class="at-botao at-bloco">Validar</button>
            </form>
          </article>

          <article class="cine-bloco cine-bloco-escuro cine-bloco-mbway" data-revelar>
            <div class="cine-telemovel" aria-hidden="true">
              <div class="cine-telemovel-ecra">
                <span class="cine-telemovel-app">MB WAY</span>
                <strong>189,90 €</strong>
                <span>Loja Exemplo, Lda.</span>
                <span class="cine-telemovel-ok">Confirmar</span>
              </div>
            </div>
            <h3>Pagamentos que os portugueses usam.</h3>
            <p>MB WAY, referência Multibanco, cartão e 3x sem juros nos exemplos. Euro em todo o lado.</p>
          </article>

          <article class="cine-bloco" data-revelar>
            <span class="cine-bloco-icone">${svgPhosphor("person-arms-spread", "duotone", 34)}</span>
            <h3>Acessível de verdade.</h3>
            <p>Teclado, leitores de ecrã e ARIA corretos em cada componente. Testado em cinco tamanhos de ecrã a cada mudança.</p>
          </article>

          <article class="cine-bloco" data-revelar>
            <span class="cine-bloco-icone">${svgPhosphor("lightning", "duotone", 34)}</span>
            <h3>Estado reativo, sem React.</h3>
            <p>Muda o dado e o ecrã acompanha. Atributos em português, direto no HTML.</p>
          </article>

          <article class="cine-bloco cine-bloco-largo cine-bloco-ouro" data-revelar>
            <div>
              <span class="cine-bloco-icone">${svgPhosphor("robot", "duotone", 34)}</span>
              <h3>Sempre atualizado, sozinho.</h3>
              <p>Toda a semana um robô confere os dados oficiais dos navegadores e os links do MDN, e propõe as atualizações. Dados atuais: web-features ${esc(baseline.versao || "—")}, de ${dataDados}.</p>
            </div>
            <div class="cine-robo-numeros">
              <div><strong>${recursos}</strong><span>recursos monitorizados</span></div>
              <div><strong>${amplos}</strong><span>já em todos os navegadores</span></div>
              <div><strong>${linksPt}</strong><span>links do MDN em português</span></div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="cine-pro" aria-labelledby="pro-titulo">
      <canvas class="cine-aurora" data-aurora aria-hidden="true"></canvas>
      <div class="site-container cine-pro-conteudo">
        <p class="cine-sobretitulo cine-sobretitulo-ouro" data-revelar>Atalho Pro</p>
        <h2 class="cine-h2" id="pro-titulo" data-revelar>Animações de cinema.<br><span class="cine-ouro">No seu site, em minutos.</span></h2>
        <p class="cine-sub" data-revelar>Produtos em 3D que giram com o scroll, vidro líquido, partículas que desenham o seu logótipo, auroras de luz como esta. O nível das páginas da Apple e da Samsung, para copiar, colar e mudar as cores.</p>
        <ul class="cine-pro-lista" data-revelar>
          ${ANIMACOES_PRO.map(([icone, nome]) => `<li>${svgPhosphor(icone, "duotone", 22)}<span>${nome}</span></li>`).join("")}
        </ul>
        <div class="cine-acoes" data-revelar>
          <a class="cine-botao cine-botao-primario" href="${url("animacoes/")}">Experimentar grátis</a>
          <a class="cine-botao cine-botao-vidro" href="${url("pro/")}">Conhecer o Pro ${ICONES_SITE.seta}</a>
        </div>
      </div>
    </section>

    <section class="cine-secao cine-sistemas" aria-labelledby="sistemas-titulo">
      <div class="site-container cine-duas">
        <div>
          <p class="cine-sobretitulo" data-revelar>Sistemas completos</p>
          <h2 class="cine-h2" id="sistemas-titulo" data-revelar>Descarregue. Instale.<br><span class="cine-suave">O negócio já está a funcionar.</span></h2>
          <p class="cine-sub" data-revelar>Clínicas, barbearias, lojas, restaurantes, escolas. Cada sistema vem com painel, base de dados e página para os seus clientes num só zip: envia para qualquer alojamento com PHP, abre o endereço e está a funcionar.</p>
          <ul class="cine-lista-ok" data-revelar>
            <li>Instala em qualquer alojamento com PHP, sem base de dados para configurar</li>
            <li>Personalize nomes, campos e textos sem programar</li>
            <li>No seu domínio, com os dados guardados no seu alojamento</li>
          </ul>
        </div>
        <div class="cine-janela" data-revelar aria-hidden="true">
          <div class="cine-janela-barra"><span></span><span></span><span></span><b>Atalho Sistemas</b></div>
          <div class="cine-janela-corpo">
            <div class="cine-janela-icone">A</div>
            <strong>A instalar a Clínica Sorriso</strong>
            <div class="cine-progresso"><span></span></div>
            <ul class="cine-ficheiros">
              <li>index.php</li>
              <li>sistema.php</li>
              <li>nucleo/</li>
              <li>dados/clinica.sqlite</li>
              <li>LEIA-ME.md</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="cine-secao cine-galeria-secao" aria-labelledby="paginas-titulo">
      <div class="site-container">
        <p class="cine-sobretitulo" data-revelar>Páginas completas</p>
        <h2 class="cine-h2" id="paginas-titulo" data-revelar>Copie o ecrã inteiro,<br><span class="cine-suave">não só o botão.</span></h2>
      </div>
      <div class="cine-galeria" tabindex="0" aria-label="Páginas completas">
        ${exemplos
          .slice(0, 6)
          .map(
            (e) => `<a class="cine-galeria-item" href="${url(`exemplos/${e.id}/`)}">
          <span class="cine-galeria-moldura"><img src="${url(`exemplos/miniaturas/${e.id}.png`)}" alt="" loading="lazy" width="600" height="375"><span class="site-galeria-cadeado">${ICONES_SITE.cadeado} ${e.acesso === "pro" ? "Pro" : "Membros"}</span></span>
          <strong>${esc(e.nome)}</strong><span>${esc(e.resumo)}</span>
        </a>`,
          )
          .join("")}
      </div>
      <div class="site-container"><a class="cine-botao cine-botao-contorno" href="${url("exemplos/")}">Todas as páginas ${ICONES_SITE.seta}</a></div>
    </section>

    <section class="cine-secao cine-codigo" aria-labelledby="codigo-titulo">
      <div class="site-container cine-duas">
        <div>
          <p class="cine-sobretitulo" data-revelar>Do HTML ao servidor</p>
          <h2 class="cine-h2" id="codigo-titulo" data-revelar>Um só jeito de pensar,<br><span class="cine-suave">nas três camadas.</span></h2>
          <p class="cine-sub" data-revelar>No navegador, atributos em português. No TypeScript, tipos que se completam sozinhos. No PHP, as mesmas regras validadas no servidor, onde a segurança acontece.</p>
          <div class="cine-acoes" data-revelar>
            <a class="cine-botao cine-botao-contorno" href="${url("typescript/")}">Guia de TypeScript</a>
            <a class="cine-botao cine-botao-contorno" href="${url("php/")}">Guia de PHP</a>
          </div>
        </div>
        <div class="site-exemplo-caixa cine-codigo-caixa" data-revelar>
          <div class="site-codigo-abas">
            <div class="site-codigo-lista" role="tablist" aria-label="Linguagem do código">
              <button type="button" role="tab" aria-selected="true" aria-controls="vit-html" id="vit-aba-html">HTML</button>
              <button type="button" role="tab" aria-selected="false" aria-controls="vit-ts" id="vit-aba-ts" tabindex="-1">TypeScript</button>
              <button type="button" role="tab" aria-selected="false" aria-controls="vit-php" id="vit-aba-php" tabindex="-1">PHP</button>
            </div>
            <button type="button" class="at-botao at-pequeno site-copiar" data-copiar-codigo>Copiar</button>
          </div>
          <pre class="site-codigo" id="vit-html" role="tabpanel" aria-labelledby="vit-aba-html" tabindex="0"><code>${realcarHTML(vitrine.html)}</code></pre>
          <pre class="site-codigo" id="vit-ts" role="tabpanel" aria-labelledby="vit-aba-ts" tabindex="0" hidden><code>${realcarTS(vitrine.ts)}</code></pre>
          <pre class="site-codigo" id="vit-php" role="tabpanel" aria-labelledby="vit-aba-php" tabindex="0" hidden><code>${realcarPHP(vitrine.php)}</code></pre>
        </div>
      </div>
    </section>

    <section class="cine-secao" aria-labelledby="categorias-titulo">
      <div class="site-container">
        <p class="cine-sobretitulo" data-revelar>O que tem dentro</p>
        <h2 class="cine-h2" id="categorias-titulo" data-revelar>${total} componentes e receitas.</h2>
        <div class="site-categorias cine-categorias">${categorias}</div>
      </div>
    </section>

    <section class="cine-secao cine-historia">
      <div class="site-container site-historia">
        <blockquote data-revelar>“Eu desisti de programar mais de uma vez. Não foi por falta de vontade.”</blockquote>
        <div class="site-historia-texto" data-revelar>
          <p>Via um tutorial e percebia uma coisa. Via outro e percebia outra. Na hora de juntar tudo num projeto a sério, nada encaixava. E a documentação oficial ajudava pouco: boa parte só existe em inglês e mostra cada peça isolada, nunca o ecrã pronto.</p>
          <p>O Atalho é o material que eu queria ter tido no começo. <strong>Cada componente vem completo</strong>, resolvido como as grandes empresas resolvem, explicado em português e, principalmente, <strong>a mostrar como se liga aos outros</strong> para virar um ecrã a sério.</p>
          <p class="at-mb-0">— ${esc(autor)}, criador do Atalho</p>
        </div>
      </div>
    </section>

    <section class="cine-final" aria-labelledby="final-titulo">
      <div class="cine-final-brilho" aria-hidden="true"></div>
      <div class="site-container">
        <h2 class="cine-h2 cine-final-titulo" id="final-titulo" data-revelar>Comece hoje.<br><span class="cine-ouro">É grátis.</span></h2>
        <p class="cine-sub" data-revelar>Crie a conta em um minuto e liberte as páginas completas, 20 componentes avançados e 10 animações.</p>
        <div class="cine-acoes cine-acoes-centro" data-revelar>
          <a class="cine-botao cine-botao-primario" href="${url("conta/?criar")}">Criar conta grátis</a>
          <a class="cine-botao cine-botao-vidro" href="${url("pro/")}">Ver o Pro ${ICONES_SITE.seta}</a>
        </div>
      </div>
    </section>`;
}
