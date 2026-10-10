<?php
// api/cadastro.php — recebe o formulário enviado pelo evento at:enviar
declare(strict_types=1);

require __DIR__ . '/../atalho.php';

use function Atalho\{exigirMetodo, lerJson, validar, responderErro, responderJson, somenteDigitos, limparTexto};

exigirMetodo('POST');
$dados = lerJson();

// As mesmas regras do navegador, conferidas de novo no servidor
$erros = validar($dados, [
    'nome' => ['obrigatorio', 'min:3', 'max:120'],
    'email' => ['obrigatorio', 'email'],
    'nif' => ['obrigatorio', 'nif'],
    'telemovel' => ['obrigatorio', 'telemovel'],
]);

if ($erros) {
    responderErro('Verifique os dados do formulário.', 422, $erros);
}

$cliente = [
    'nome' => limparTexto($dados['nome'], 120),
    'email' => mb_strtolower(trim($dados['email'])),
    'nif' => somenteDigitos($dados['nif']),            // guarde só os algarismos
    'telemovel' => somenteDigitos($dados['telemovel']),
];

// Aqui guardaria na base de dados (veja o exemplo de pedidos com PDO)
responderJson(['id' => 123, 'nome' => $cliente['nome']], 201);
