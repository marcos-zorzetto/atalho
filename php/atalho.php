<?php
/**
 * Atalho para PHP — funções de servidor que acompanham a biblioteca do navegador.
 * https://github.com/marcos-zorzetto/atalho · Licença MIT · Marcos Zorzetto
 *
 * Requer PHP 8.1 ou mais novo. Sem dependências: basta "require 'atalho.php';".
 *
 * Regra de ouro: tudo que o navegador valida deve ser validado de novo aqui.
 * Qualquer pessoa pode desligar o JavaScript ou chamar a sua API diretamente.
 */

declare(strict_types=1);

namespace Atalho;

const VERSAO = '1.1.0';

/* -------------------------------------------------------------------------
   Texto e números
   ------------------------------------------------------------------------- */

/** Mantém só os dígitos: "529.982.247-25" → "52998224725" */
function somenteDigitos(?string $texto): string
{
    return preg_replace('/\D+/', '', (string) $texto) ?? '';
}

/** Remove espaços nas pontas e caracteres de controle invisíveis. */
function limparTexto(?string $texto, int $tamanhoMaximo = 1000): string
{
    $limpo = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', trim((string) $texto)) ?? '';
    return mb_substr($limpo, 0, $tamanhoMaximo);
}

/** Escapa texto para colocar dentro do HTML (evita XSS). Use sempre ao imprimir dados do usuário. */
function e(?string $texto): string
{
    return htmlspecialchars((string) $texto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** 1234.5 → "R$ 1.234,50" */
function formatarMoeda(float|int $valor): string
{
    return 'R$ ' . number_format((float) $valor, 2, ',', '.');
}

/** "52998224725" → "529.982.247-25" */
function formatarCpf(string $cpf): string
{
    $d = somenteDigitos($cpf);
    return strlen($d) === 11 ? preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $d) ?? $d : $cpf;
}

/** "12ABC34501DE35" → "12.ABC.345/01DE-35" (aceita o CNPJ alfanumérico) */
function formatarCnpj(string $cnpj): string
{
    $c = strtoupper(preg_replace('/[^0-9A-Za-z]/', '', $cnpj) ?? '');
    return strlen($c) === 14
        ? substr($c, 0, 2) . '.' . substr($c, 2, 3) . '.' . substr($c, 5, 3) . '/' . substr($c, 8, 4) . '-' . substr($c, 12, 2)
        : $cnpj;
}

/* -------------------------------------------------------------------------
   Validação de documentos brasileiros
   ------------------------------------------------------------------------- */

function validarCpf(?string $texto): bool
{
    $cpf = somenteDigitos($texto);
    if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
        return false;
    }
    for ($posicao = 9; $posicao <= 10; $posicao++) {
        $soma = 0;
        for ($i = 0; $i < $posicao; $i++) {
            $soma += (int) $cpf[$i] * (($posicao + 1) - $i);
        }
        $resto = ($soma * 10) % 11;
        if (($resto === 10 ? 0 : $resto) !== (int) $cpf[$posicao]) {
            return false;
        }
    }
    return true;
}

/**
 * CNPJ numérico ou alfanumérico (Receita Federal, a partir de julho de 2026).
 * Cada caractere vale o seu código ASCII menos 48 ("0" = 0, "A" = 17).
 */
function validarCnpj(?string $texto): bool
{
    $cnpj = strtoupper(preg_replace('/[^0-9A-Za-z]/', '', (string) $texto) ?? '');
    if (!preg_match('/^[0-9A-Z]{12}\d{2}$/', $cnpj) || preg_match('/^(.)\1{13}$/', $cnpj)) {
        return false;
    }
    $digito = static function (string $base): int {
        $pesos = strlen($base) === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $soma = 0;
        foreach (str_split($base) as $i => $caractere) {
            $soma += (ord($caractere) - 48) * $pesos[$i];
        }
        $resto = $soma % 11;
        return $resto < 2 ? 0 : 11 - $resto;
    };
    $primeiro = $digito(substr($cnpj, 0, 12));
    $segundo = $digito(substr($cnpj, 0, 12) . $primeiro);
    return substr($cnpj, 12) === "{$primeiro}{$segundo}";
}

function validarEmail(?string $email): bool
{
    $email = trim((string) $email);
    // filter_var aceita "nome@empresa" sem domínio completo; para cadastro, exigimos o ponto
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false && preg_match('/@[^@\s]+\.[^@\s]{2,}$/', $email) === 1;
}

function validarTelefone(?string $telefone): bool
{
    return preg_match('/^\d{10,11}$/', somenteDigitos($telefone)) === 1;
}

function validarCep(?string $cep): bool
{
    return preg_match('/^\d{8}$/', somenteDigitos($cep)) === 1;
}

/**
 * Valida vários campos de uma vez. Devolve os erros por campo (vazio = tudo certo).
 *
 * $erros = Atalho\validar($dados, [
 *     'nome'  => ['obrigatorio', 'min:3'],
 *     'email' => ['obrigatorio', 'email'],
 *     'cpf'   => ['obrigatorio', 'cpf'],
 * ]);
 */
function validar(array $dados, array $regras): array
{
    $erros = [];
    foreach ($regras as $campo => $lista) {
        $valor = is_string($dados[$campo] ?? null) ? trim($dados[$campo]) : ($dados[$campo] ?? null);
        foreach ($lista as $regra) {
            [$nome, $parametro] = array_pad(explode(':', $regra, 2), 2, null);
            $vazio = $valor === null || $valor === '' || $valor === [];
            if ($nome === 'obrigatorio') {
                if ($vazio) { $erros[$campo] = 'Preencha este campo.'; break; }
                continue;
            }
            if ($vazio) {
                continue;
            }
            $mensagem = match ($nome) {
                'email' => validarEmail((string) $valor) ? null : 'Digite um e-mail válido, como nome@exemplo.com.',
                'cpf' => validarCpf((string) $valor) ? null : 'CPF inválido.',
                'cnpj' => validarCnpj((string) $valor) ? null : 'CNPJ inválido.',
                'telefone' => validarTelefone((string) $valor) ? null : 'Telefone incompleto. Inclua o DDD.',
                'cep' => validarCep((string) $valor) ? null : 'CEP inválido.',
                'min' => mb_strlen((string) $valor) >= (int) $parametro ? null : "Use pelo menos {$parametro} caracteres.",
                'max' => mb_strlen((string) $valor) <= (int) $parametro ? null : "Use no máximo {$parametro} caracteres.",
                'numero' => is_numeric($valor) ? null : 'Digite um número.',
                default => null,
            };
            if ($mensagem !== null) {
                $erros[$campo] = $mensagem;
                break;
            }
        }
    }
    return $erros;
}

/* -------------------------------------------------------------------------
   Requisições e respostas JSON (para usar com Atalho.requisitar e at:enviar)
   ------------------------------------------------------------------------- */

/** Responde em JSON e encerra. */
function responderJson(mixed $dados, int $status = 200): never
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
    }
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

/** Responde com erro no formato que o Atalho entende ({ erro, campos }). */
function responderErro(string $mensagem, int $status = 400, array $campos = []): never
{
    responderJson(['erro' => $mensagem, 'campos' => (object) $campos], $status);
}

/** Recusa métodos diferentes do esperado (ex.: só aceita POST). */
function exigirMetodo(string ...$metodos): void
{
    $metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($metodo, $metodos, true)) {
        header('Allow: ' . implode(', ', $metodos));
        responderErro('Método não permitido.', 405);
    }
}

/** Lê o corpo JSON enviado pelo navegador. Limite padrão: 1 MB. */
function lerJson(int $tamanhoMaximo = 1_048_576): array
{
    $corpo = file_get_contents('php://input', false, null, 0, $tamanhoMaximo + 1);
    if ($corpo === false || strlen($corpo) > $tamanhoMaximo) {
        responderErro('Envio grande demais.', 413);
    }
    if ($corpo === '') {
        return [];
    }
    try {
        $dados = json_decode($corpo, true, 32, JSON_THROW_ON_ERROR);
    } catch (\JsonException) {
        responderErro('JSON inválido.', 400);
    }
    return is_array($dados) ? $dados : responderErro('Formato inesperado.', 400);
}

/**
 * Libera chamadas de outros domínios (CORS) só para os endereços informados.
 * Responde sozinho ao "preflight" (OPTIONS).
 */
function cors(array $origensPermitidas, array $metodos = ['GET', 'POST']): void
{
    $origem = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origem, $origensPermitidas, true)) {
        header("Access-Control-Allow-Origin: {$origem}");
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: ' . implode(', ', $metodos));
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
        header('Access-Control-Max-Age: 600');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/* -------------------------------------------------------------------------
   Sessão e CSRF
   ------------------------------------------------------------------------- */

/** Inicia a sessão com configurações seguras (cookie só HTTP, SameSite, HTTPS). */
function iniciarSessao(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    session_start([
        'cookie_httponly' => true,
        'cookie_secure' => $https,
        'cookie_samesite' => 'Lax',
        'use_strict_mode' => true,
    ]);
}

/** Token anti-CSRF para colocar no formulário ou no cabeçalho X-CSRF-Token. */
function tokenCsrf(): string
{
    iniciarSessao();
    return $_SESSION['atalho_csrf'] ??= bin2hex(random_bytes(32));
}

/** Confere o token CSRF (do campo "_csrf" ou do cabeçalho X-CSRF-Token). */
function validarCsrf(?string $token = null): void
{
    iniciarSessao();
    $token ??= $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!isset($_SESSION['atalho_csrf']) || !hash_equals($_SESSION['atalho_csrf'], (string) $token)) {
        responderErro('Sessão expirada. Recarregue a página e tente de novo.', 419);
    }
}

/* -------------------------------------------------------------------------
   CEP (ViaCEP) com cache em arquivo
   ------------------------------------------------------------------------- */

/**
 * Busca o endereço de um CEP. Devolve null se não existir.
 * O cache evita consultar o ViaCEP de novo para o mesmo CEP.
 */
function buscarCep(string $cep, ?string $pastaCache = null, int $tempoLimite = 5): ?array
{
    $cep = somenteDigitos($cep);
    if (!validarCep($cep)) {
        return null;
    }
    $pastaCache ??= sys_get_temp_dir() . '/atalho-cep';
    $arquivo = "{$pastaCache}/{$cep}.json";
    if (is_file($arquivo) && filemtime($arquivo) > time() - 30 * 86400) {
        $guardado = json_decode((string) file_get_contents($arquivo), true);
        return is_array($guardado) ? $guardado : null;
    }
    $contexto = stream_context_create(['http' => ['timeout' => $tempoLimite, 'header' => "Accept: application/json\r\n"]]);
    $resposta = @file_get_contents("https://viacep.com.br/ws/{$cep}/json/", false, $contexto);
    if ($resposta === false) {
        throw new \RuntimeException('Não foi possível consultar o CEP agora.');
    }
    $endereco = json_decode($resposta, true);
    if (!is_array($endereco) || isset($endereco['erro'])) {
        return null;
    }
    if (!is_dir($pastaCache)) {
        @mkdir($pastaCache, 0775, true);
    }
    @file_put_contents($arquivo, json_encode($endereco, JSON_UNESCAPED_UNICODE), LOCK_EX);
    return $endereco;
}

/* -------------------------------------------------------------------------
   Upload seguro
   ------------------------------------------------------------------------- */

/**
 * Salva um arquivo enviado com segurança: confere o tipo REAL (não o nome),
 * o tamanho e gera um nome aleatório. Devolve o nome salvo.
 *
 * $nome = Atalho\salvarUpload($_FILES['foto'], __DIR__ . '/uploads', ['image/jpeg', 'image/png', 'image/webp'], 5);
 */
function salvarUpload(array $arquivo, string $pasta, array $tiposPermitidos, float $tamanhoMaximoMb = 5): string
{
    if (($arquivo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file($arquivo['tmp_name'] ?? '')) {
        throw new \RuntimeException('Envio do arquivo falhou.');
    }
    if ($arquivo['size'] > $tamanhoMaximoMb * 1024 * 1024) {
        throw new \RuntimeException("Arquivo maior que {$tamanhoMaximoMb} MB.");
    }
    $tipo = (new \finfo(FILEINFO_MIME_TYPE))->file($arquivo['tmp_name']) ?: '';
    if (!in_array($tipo, $tiposPermitidos, true)) {
        throw new \RuntimeException('Tipo de arquivo não permitido.');
    }
    $extensoes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'application/pdf' => 'pdf'];
    $nome = bin2hex(random_bytes(16)) . '.' . ($extensoes[$tipo] ?? 'bin');
    if (!is_dir($pasta) && !mkdir($pasta, 0775, true)) {
        throw new \RuntimeException('Não foi possível criar a pasta de envio.');
    }
    if (!move_uploaded_file($arquivo['tmp_name'], rtrim($pasta, '/\\') . DIRECTORY_SEPARATOR . $nome)) {
        throw new \RuntimeException('Não foi possível salvar o arquivo.');
    }
    return $nome;
}

/* -------------------------------------------------------------------------
   Paginação (combina com a Tabela de dados e com a Paginação)
   ------------------------------------------------------------------------- */

/** Calcula página, deslocamento e total de páginas a partir de ?pagina=. */
function paginar(int $total, int $pagina, int $porPagina = 20): array
{
    $porPagina = max(1, min(100, $porPagina));
    $paginas = max(1, (int) ceil($total / $porPagina));
    $pagina = max(1, min($paginas, $pagina));
    return [
        'pagina' => $pagina,
        'porPagina' => $porPagina,
        'paginas' => $paginas,
        'total' => $total,
        'deslocamento' => ($pagina - 1) * $porPagina,
    ];
}
