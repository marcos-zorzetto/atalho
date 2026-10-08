/**
 * Conteúdo do guia de PHP. Os códigos vêm dos arquivos reais em php/exemplos,
 * que o CI valida com "php -l": o que aparece no site é o que foi testado.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { RAIZ } from "../docs.mjs";

const ler = (arquivo) => readFile(path.join(RAIZ, "php", "exemplos", arquivo), "utf8").then((t) => t.trimEnd());

export async function carregarGuiaPHP() {
  return {
    funcoes: [
      ["validarCpf($cpf)", "Confere os dígitos verificadores do CPF (com ou sem máscara)."],
      ["validarCnpj($cnpj)", "CNPJ numérico e o novo alfanumérico (Receita Federal, julho de 2026)."],
      ["validarEmail / validarTelefone / validarCep", "Validações comuns, com as mesmas regras do navegador."],
      ["validar($dados, $regras)", "Valida vários campos e devolve as mensagens de erro em português."],
      ["lerJson()", "Lê o JSON enviado pelo navegador, com limite de tamanho."],
      ["responderJson($dados, $status)", "Responde em JSON com o cabeçalho certo e encerra."],
      ["responderErro($mensagem, $status, $campos)", "Erro no formato { erro, campos } que o Atalho entende."],
      ["exigirMetodo('POST')", "Recusa outros métodos HTTP."],
      ["cors($origens)", "Libera chamadas só dos domínios informados."],
      ["iniciarSessao() / tokenCsrf() / validarCsrf()", "Sessão com cookie seguro e proteção contra CSRF."],
      ["buscarCep($cep)", "Consulta o ViaCEP com cache em arquivo."],
      ["salvarUpload($arquivo, $pasta, $tipos, $mb)", "Salva upload conferindo o tipo real do arquivo e gerando nome aleatório."],
      ["paginar($total, $pagina, $porPagina)", "Calcula página, deslocamento e total de páginas."],
      ["formatarMoeda / formatarCpf / formatarCnpj", "Formatação brasileira para mostrar ao usuário."],
      ["e($texto)", "Escapa texto para HTML. Use sempre ao imprimir dados do usuário (evita XSS)."],
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
        titulo: "4. CEP pelo seu servidor",
        descricao: "Útil quando você quer guardar em cache, registrar consultas ou não depender do navegador falar direto com o ViaCEP.",
        arquivo: "api/cep.php",
        php: await ler("cep.php"),
      },
      {
        id: "upload",
        titulo: "5. Upload seguro de imagens",
        descricao: "Nunca confie na extensão do nome do arquivo: um .jpg pode ser um script. A biblioteca confere o tipo real e gera um nome aleatório.",
        arquivo: "api/upload.php",
        php: await ler("upload.php"),
      },
      {
        id: "login",
        titulo: "6. Login com sessão",
        descricao: "Senha sempre com password_hash, comparação com password_verify, nova sessão após o login e limite de tentativas.",
        arquivo: "api/login.php",
        php: await ler("login.php"),
      },
      {
        id: "pedidos",
        titulo: "7. Lista paginada com banco de dados",
        descricao: "JSON paginado para alimentar a Tabela de dados, com PDO e parâmetros para evitar SQL injection.",
        arquivo: "api/pedidos.php",
        php: await ler("pedidos.php"),
      },
    ],
  };
}
