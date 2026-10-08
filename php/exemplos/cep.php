<?php
// api/cep.php?cep=01310100 — consulta o ViaCEP pelo seu servidor, com cache
declare(strict_types=1);

require __DIR__ . '/../atalho.php';

use function Atalho\{exigirMetodo, buscarCep, responderErro, responderJson, validarCep};

exigirMetodo('GET');
$cep = (string) ($_GET['cep'] ?? '');

if (!validarCep($cep)) {
    responderErro('CEP inválido.', 422);
}

try {
    $endereco = buscarCep($cep, __DIR__ . '/cache-cep');
} catch (RuntimeException $erro) {
    responderErro($erro->getMessage(), 503);
}

$endereco ?? responderErro('CEP não encontrado.', 404);

header('Cache-Control: public, max-age=86400');
responderJson($endereco);
