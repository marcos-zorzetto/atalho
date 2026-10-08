<?php
// api/login.php — login com sessão segura, senha com hash e limite de tentativas
declare(strict_types=1);

require __DIR__ . '/../atalho.php';

use function Atalho\{exigirMetodo, lerJson, iniciarSessao, validarCsrf, responderErro, responderJson};

exigirMetodo('POST');
iniciarSessao();
validarCsrf();

// Limite simples: 5 tentativas a cada 15 minutos por sessão
$tentativas = array_filter($_SESSION['tentativas'] ?? [], fn (int $hora) => $hora > time() - 900);
if (count($tentativas) >= 5) {
    responderErro('Muitas tentativas. Aguarde 15 minutos.', 429);
}

$dados = lerJson();
$email = mb_strtolower(trim((string) ($dados['email'] ?? '')));
$senha = (string) ($dados['senha'] ?? '');

// Busque o usuário no banco. Ao cadastrar, salve: password_hash($senha, PASSWORD_DEFAULT)
$usuario = buscarUsuarioPorEmail($email);

// password_verify compara com o hash em tempo constante
if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
    $_SESSION['tentativas'] = [...$tentativas, time()];
    responderErro('E-mail ou senha incorretos.', 401); // não diga qual dos dois errou
}

session_regenerate_id(true); // evita sequestro de sessão
unset($_SESSION['tentativas']);
$_SESSION['usuario_id'] = $usuario['id'];

responderJson(['nome' => $usuario['nome']]);

/** Exemplo: troque pela consulta ao seu banco de dados. */
function buscarUsuarioPorEmail(string $email): ?array
{
    $exemplo = ['id' => 1, 'nome' => 'Ana', 'email' => 'ana@exemplo.com', 'senha_hash' => password_hash('senha-de-teste', PASSWORD_DEFAULT)];
    return $email === $exemplo['email'] ? $exemplo : null;
}
