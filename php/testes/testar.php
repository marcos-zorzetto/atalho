<?php
/**
 * Testes da biblioteca PHP. Rodam no GitHub a cada push: php php/testes/testar.php
 * Sai com código 1 se algum teste falhar.
 */

declare(strict_types=1);

require __DIR__ . '/../atalho.php';

use function Atalho\{validarCpf, validarCnpj, validarEmail, validarTelefone, validarCep, formatarMoeda, formatarCpf, formatarCnpj, somenteDigitos, limparTexto, e, validar, paginar};

$falhas = 0;
$total = 0;

function confere(string $descricao, mixed $obtido, mixed $esperado): void
{
    global $falhas, $total;
    $total++;
    if ($obtido === $esperado) {
        echo "ok  {$descricao}\n";
        return;
    }
    $falhas++;
    echo "ERRO {$descricao}\n     esperado: " . var_export($esperado, true) . "\n     obtido:   " . var_export($obtido, true) . "\n";
}

// CPF
confere('CPF válido com máscara', validarCpf('529.982.247-25'), true);
confere('CPF válido sem máscara', validarCpf('52998224725'), true);
confere('CPF com dígito errado', validarCpf('529.982.247-24'), false);
confere('CPF com todos os dígitos iguais', validarCpf('111.111.111-11'), false);
confere('CPF incompleto', validarCpf('123'), false);
confere('CPF nulo', validarCpf(null), false);

// CNPJ numérico e alfanumérico (mesmos casos usados no atalho.js)
confere('CNPJ numérico válido', validarCnpj('11.222.333/0001-81'), true);
confere('CNPJ alfanumérico válido', validarCnpj('12.ABC.345/01DE-35'), true);
confere('CNPJ alfanumérico em minúsculas', validarCnpj('12abc34501de35'), true);
confere('CNPJ com dígito errado', validarCnpj('11.222.333/0001-82'), false);
confere('CNPJ repetido', validarCnpj('00.000.000/0000-00'), false);

// Outros
confere('e-mail completo', validarEmail('ana@exemplo.com.br'), true);
confere('e-mail sem domínio completo', validarEmail('ana@exemplo'), false);
confere('celular com DDD', validarTelefone('(11) 98765-4321'), true);
confere('telefone sem DDD', validarTelefone('98765-4321'), false);
confere('CEP válido', validarCep('01310-100'), true);
confere('CEP incompleto', validarCep('0131'), false);

// Formatação
confere('moeda', formatarMoeda(1234.5), 'R$ 1.234,50');
confere('moeda zero', formatarMoeda(0), 'R$ 0,00');
confere('formatar CPF', formatarCpf('52998224725'), '529.982.247-25');
confere('formatar CNPJ alfanumérico', formatarCnpj('12abc34501de35'), '12.ABC.345/01DE-35');
confere('somente dígitos', somenteDigitos('(11) 9-8765'), '1198765');
confere('limpar texto', limparTexto("  olá\x00 mundo  "), 'olá mundo');
confere('escapar HTML', e('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');

// Validação em lote
$erros = validar(
    ['nome' => 'An', 'email' => 'ana@exemplo', 'cpf' => '529.982.247-25', 'obs' => ''],
    ['nome' => ['obrigatorio', 'min:3'], 'email' => ['obrigatorio', 'email'], 'cpf' => ['obrigatorio', 'cpf'], 'obs' => ['max:10'], 'cep' => ['obrigatorio']]
);
confere('validar: nome curto', $erros['nome'] ?? null, 'Use pelo menos 3 caracteres.');
confere('validar: e-mail', $erros['email'] ?? null, 'Digite um e-mail válido, como nome@exemplo.com.');
confere('validar: CPF ok', isset($erros['cpf']), false);
confere('validar: opcional vazio passa', isset($erros['obs']), false);
confere('validar: obrigatório ausente', $erros['cep'] ?? null, 'Preencha este campo.');

// Paginação
confere('paginar', paginar(95, 3, 20), ['pagina' => 3, 'porPagina' => 20, 'paginas' => 5, 'total' => 95, 'deslocamento' => 40]);
confere('paginar além do fim', paginar(10, 99, 20)['pagina'], 1);

echo "\n" . ($total - $falhas) . " de {$total} testes passaram.\n";
exit($falhas > 0 ? 1 : 0);
