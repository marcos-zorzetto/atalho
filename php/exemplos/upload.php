<?php
// api/upload.php — recebe as fotos do componente "Enviar arquivos"
declare(strict_types=1);

require __DIR__ . '/../atalho.php';

use function Atalho\{exigirMetodo, validarCsrf, salvarUpload, responderErro, responderJson};

exigirMetodo('POST');
validarCsrf();

$fotos = $_FILES['fotos'] ?? null;
if (!$fotos || !is_array($fotos['name'])) {
    responderErro('Nenhuma foto enviada.', 422);
}

$salvas = [];
foreach (array_keys($fotos['name']) as $i) {
    $arquivo = [
        'name' => $fotos['name'][$i],
        'tmp_name' => $fotos['tmp_name'][$i],
        'size' => $fotos['size'][$i],
        'error' => $fotos['error'][$i],
    ];
    try {
        // Confere o tipo REAL do arquivo, não a extensão do nome
        $salvas[] = salvarUpload($arquivo, __DIR__ . '/uploads', ['image/jpeg', 'image/png', 'image/webp'], 5);
    } catch (RuntimeException $erro) {
        responderErro("{$arquivo['name']}: {$erro->getMessage()}", 422);
    }
}

responderJson(['arquivos' => $salvas], 201);
