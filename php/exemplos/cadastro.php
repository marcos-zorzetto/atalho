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
    'cpf' => ['obrigatorio', 'cpf'],
    'celular' => ['obrigatorio', 'telefone'],
]);

if ($erros) {
    responderErro('Confira os dados do formulário.', 422, $erros);
}

$cliente = [
    'nome' => limparTexto($dados['nome'], 120),
    'email' => mb_strtolower(trim($dados['email'])),
    'cpf' => somenteDigitos($dados['cpf']),        // guarde só os dígitos
    'celular' => somenteDigitos($dados['celular']),
];

// Aqui você salvaria no banco (veja o exemplo de pedidos com PDO)
responderJson(['id' => 123, 'nome' => $cliente['nome']], 201);
