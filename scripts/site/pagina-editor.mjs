import { url } from "./config.mjs";
import { pagina } from "./layout.mjs";

/** Codifica um exemplo para o endereço do editor (#...), sem servidor. */
export function linkEditor({ html = "", css = "", js = "" }) {
  const dados = Buffer.from(JSON.stringify({ html, css, js }), "utf8").toString("base64url");
  return `${url("editor/")}#${dados}`;
}

export function paginaEditor() {
  const conteudo = `
    <div class="site-editor" data-editor>
      <div class="site-editor-barra">
        <div>
          <h1 class="site-editor-titulo">Editor ao vivo</h1>
          <span class="at-texto-suave at-texto-pequeno">O resultado atualiza enquanto você digita. Nada sai do seu navegador.</span>
        </div>
        <div class="at-linha">
          <button type="button" class="at-botao at-pequeno" data-editor-acao="compartilhar">Copiar link</button>
          <button type="button" class="at-botao at-pequeno" data-editor-acao="baixar">Baixar HTML</button>
          <button type="button" class="at-botao at-pequeno at-fantasma" data-editor-acao="limpar">Começar do zero</button>
        </div>
      </div>
      <div class="site-editor-area">
        <section class="site-editor-codigo" aria-label="Código">
          <div class="at-abas site-editor-abas" data-at="abas" aria-label="Linguagem">
            <button class="at-aba" aria-controls="editor-html">HTML</button>
            <button class="at-aba" aria-controls="editor-css">CSS</button>
            <button class="at-aba" aria-controls="editor-js">JavaScript</button>
          </div>
          <div class="at-painel" id="editor-html"><textarea class="site-editor-texto" data-linguagem="html" spellcheck="false" aria-label="Código HTML"></textarea></div>
          <div class="at-painel" id="editor-css"><textarea class="site-editor-texto" data-linguagem="css" spellcheck="false" aria-label="Código CSS"></textarea></div>
          <div class="at-painel" id="editor-js"><textarea class="site-editor-texto" data-linguagem="js" spellcheck="false" aria-label="Código JavaScript"></textarea></div>
        </section>
        <section class="site-editor-resultado" aria-label="Resultado">
          <iframe title="Resultado do código" sandbox="allow-scripts allow-forms allow-modals allow-popups" data-editor-previa></iframe>
          <div class="site-editor-console" aria-live="polite">
            <div class="site-editor-console-topo"><strong>Console</strong><button type="button" class="at-botao at-link at-pequeno" data-editor-acao="limpar-console">Limpar</button></div>
            <ol data-editor-console></ol>
          </div>
        </section>
      </div>
    </div>`;
  return pagina({
    titulo: "Editor de HTML, CSS e JavaScript online · Atalho",
    descricao: "Editor online grátis, em português: escreva HTML, CSS e JavaScript e veja o resultado na hora, com os componentes do Atalho prontos para usar.",
    caminho: "editor/",
    pagina: "editor",
    secao: "editor",
    classeCorpo: "site-corpo-editor",
    conteudo,
    scripts: ["site/editor.js"],
  });
}
