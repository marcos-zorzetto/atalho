/**
 * Conteúdo do guia de PHP. Os códigos vêm dos ficheiros reais em php/exemplos,
 * que o CI valida com "php -l": o que aparece no site é o que foi testado.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { RAIZ } from "../docs.mjs";

const ler = (arquivo) => readFile(path.join(RAIZ, "php", "exemplos", arquivo), "utf8").then((t) => t.trimEnd());

export async function carregarGuiaPHP() {
  return {
    funcoes: [
      ["validarNif($nif)", "Verifica o dígito de controlo do NIF/NIPC de Portugal (com ou sem espaços)."],
      ["validarIban($iban)", "IBAN de qualquer país da Europa (tamanho por país e módulo 97)."],
      ["validarEmail / validarTelefone / validarTelemovel / validarCodigoPostal", "Validações comuns, com as mesmas regras do navegador."],
      ["validarCpf / validarCnpj / validarCep", "Documentos do Brasil, para quem também vende para lá (CNPJ alfanumérico incluído)."],
      ["validar($dados, $regras)", "Valida vários campos e devolve as mensagens de erro em português."],
      ["lerJson()", "Lê o JSON enviado pelo navegador, com limite de tamanho."],
      ["responderJson($dados, $status)", "Responde em JSON com o cabeçalho certo e encerra."],
      ["responderErro($mensagem, $status, $campos)", "Erro no formato { erro, campos } que o Atalho entende."],
      ["exigirMetodo('POST')", "Recusa outros métodos HTTP."],
      ["cors($origens)", "Permite chamadas só dos domínios indicados."],
      ["iniciarSessao() / tokenCsrf() / validarCsrf()", "Sessão com cookie seguro e proteção contra CSRF."],
      ["buscarCodigoPostal($cp)", "Morada de um código postal português (GEO API PT), com cache em ficheiro."],
      ["buscarCep($cep)", "Endereço de um CEP do Brasil (ViaCEP), com cache em ficheiro."],
      ["salvarUpload($arquivo, $pasta, $tipos, $mb)", "Guarda o upload, verificando o tipo real do ficheiro e gerando um nome aleatório."],
      ["paginar($total, $pagina, $porPagina)", "Calcula página, deslocamento e total de páginas."],
      ["formatarMoeda($valor, $moeda)", "1234,50 € (euro por omissão; 'BRL' para R$). Também formatarCpf e formatarCnpj."],
      ["e($texto)", "Escapa texto para HTML. Use sempre ao imprimir dados do utilizador (evita XSS)."],
    ],
    exemplos: [
      {
        id: "receber-formulario",
        titulo: "3. Receber um formulário",
        descricao: "O navegador valida para ajudar quem preenche; o PHP valida de novo para proteger o sistema. Erros voltam por campo, no mesmo formato das mensagens do Atalho.",
        html: `<form id="cadastro" data-at-validar>…</form>

<script>
  document.querySelector("#cadastro").addEventListener("at:enviar", async (evento) => {
    const { dados, botao } = evento.detail;
    botao.setAttribute("aria-busy", "true");
    try {
      const cliente = await Atalho.requisitar("api/cadastro.php", { metodo: "POST", corpo: dados });
      Atalho.notificar("Bem-vindo(a), " + cliente.nome + "!", { tipo: "sucesso" });
    } catch (erro) {
      Atalho.notificar(erro.dados?.erro || erro.message, { tipo: "perigo" });
    } finally {
      botao.removeAttribute("aria-busy");
    }
  });
</script>`,
        arquivo: "api/cadastro.php",
        php: await ler("cadastro.php"),
      },
      {
        id: "cep",
        titulo: "4. Código postal pelo seu servidor",
        descricao: "Útil quando quer guardar em cache, registar consultas ou não depender do navegador para falar com a GEO API PT. Há também buscarCep() para o Brasil.",
        arquivo: "api/codigo-postal.php",
        php: await ler("codigo-postal.php"),
      },
      {
        id: "upload",
        titulo: "5. Upload seguro de imagens",
        descricao: "Nunca confie na extensão do nome do ficheiro: um .jpg pode ser um script. A biblioteca verifica o tipo real e gera um nome aleatório.",
        arquivo: "api/upload.php",
        php: await ler("upload.php"),
      },
      {
        id: "login",
        titulo: "6. Login com sessão",
        descricao: "Palavra-passe sempre com password_hash, comparação com password_verify, nova sessão após o login e limite de tentativas.",
        arquivo: "api/login.php",
        php: await ler("login.php"),
      },
      {
        id: "pedidos",
        titulo: "7. Lista paginada com base de dados",
        descricao: "JSON paginado para alimentar a Tabela de dados, com PDO e parâmetros para evitar SQL injection.",
        arquivo: "api/pedidos.php",
        php: await ler("pedidos.php"),
      },
    ],
  };
}
