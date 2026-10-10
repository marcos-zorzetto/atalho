<?php
// api/codigo-postal.php?cp=1250-096 — morada pelo código postal (GEO API PT), com cache
declare(strict_types=1);

require __DIR__ . '/../atalho.php';

use function Atalho\{exigirMetodo, buscarCodigoPostal, responderErro, responderJson, validarCodigoPostal};

exigirMetodo('GET');
$codigo = (string) ($_GET['cp'] ?? '');

if (!validarCodigoPostal($codigo)) {
    responderErro('Código postal inválido (formato 0000-000).', 422);
}

try {
    $morada = buscarCodigoPostal($codigo, __DIR__ . '/cache-cp');
} catch (RuntimeException $erro) {
    responderErro($erro->getMessage(), 503);
}

$morada ?? responderErro('Código postal não encontrado.', 404);

header('Cache-Control: public, max-age=86400');
responderJson($morada);
