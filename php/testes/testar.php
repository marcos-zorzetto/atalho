<?php
/**
 * Testes da biblioteca PHP. Rodam no GitHub a cada push: php php/testes/testar.php
 * Sai com código 1 se algum teste falhar.
 */

declare(strict_types=1);

require __DIR__ . '/../atalho.php';

use function Atalho\{validarNif, validarIban, validarCodigoPostal, validarTelemovel, validarCpf, validarCnpj, validarEmail, validarTelefone, validarCep, formatarMoeda, formatarCpf, formatarCnpj, somenteDigitos, limparTexto, e, validar, paginar};

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

// NIF, IBAN, código postal e telemóvel (mesmos casos usados no atalho.js)
confere('NIF válido', validarNif('123 456 789'), true);
confere('NIF de empresa válido', validarNif('501442600'), true);
confere('NIF com dígito errado', validarNif('123456780'), false);
confere('NIF começando por 0', validarNif('023456789'), false);
confere('NIF nulo', validarNif(null), false);
confere('IBAN PT válido', validarIban('PT50 0002 0123 1234 5678 9015 4'), true);
confere('IBAN DE válido', validarIban('DE89370400440532013000'), true);
confere('IBAN GB válido', validarIban('GB82 WEST 1234 5698 7654 32'), true);
confere('IBAN com dígito errado', validarIban('PT50 0002 0123 1234 5678 9015 5'), false);
confere('IBAN com tamanho errado', validarIban('PT50000201231234567890'), false);
confere('código postal com hífen', validarCodigoPostal('1250-096'), true);
confere('código postal sem hífen', validarCodigoPostal('1250096'), true);
confere('código postal curto', validarCodigoPostal('125-096'), false);
confere('telemóvel', validarTelemovel('912 345 678'), true);
confere('telemóvel com +351', validarTelemovel('+351 936 123 456'), true);
confere('telefone fixo não é telemóvel', validarTelemovel('212345678'), false);

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
confere('telefone de Portugal', validarTelefone('212 345 678'), true);
confere('telefone internacional', validarTelefone('+44 20 7946 0958'), true);
confere('telefone curto', validarTelefone('1234'), false);
confere('celular do Brasil com DDD', validarTelefone('(11) 98765-4321', 'BR'), true);
confere('telefone do Brasil sem DDD', validarTelefone('98765-4321', 'BR'), false);
confere('CEP válido', validarCep('01310-100'), true);
confere('CEP incompleto', validarCep('0131'), false);

// Formatação
confere('moeda em euro', formatarMoeda(1234.5), '1234,50 €');
confere('moeda em euro com milhares', formatarMoeda(12345.5), '12 345,50 €');
confere('moeda zero', formatarMoeda(0), '0,00 €');
confere('moeda em real', formatarMoeda(1234.5, 'BRL'), 'R$ 1.234,50');
confere('outra moeda', formatarMoeda(10, 'GBP'), '10,00 GBP');
confere('formatar CPF', formatarCpf('52998224725'), '529.982.247-25');
confere('formatar CNPJ alfanumérico', formatarCnpj('12abc34501de35'), '12.ABC.345/01DE-35');
confere('somente dígitos', somenteDigitos('(11) 9-8765'), '1198765');
confere('limpar texto', limparTexto("  olá\x00 mundo  "), 'olá mundo');
confere('escapar HTML', e('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');

// Validação em lote
$erros = validar(
    ['nome' => 'An', 'email' => 'ana@exemplo', 'nif' => '123 456 789', 'iban' => 'PT50 1', 'cpf' => '529.982.247-25', 'obs' => ''],
    ['nome' => ['obrigatorio', 'min:3'], 'email' => ['obrigatorio', 'email'], 'nif' => ['obrigatorio', 'nif'], 'iban' => ['iban'], 'cpf' => ['obrigatorio', 'cpf'], 'obs' => ['max:10'], 'cep' => ['obrigatorio']]
);
confere('validar: nome curto', $erros['nome'] ?? null, 'Use pelo menos 3 caracteres.');
confere('validar: e-mail', $erros['email'] ?? null, 'Introduza um e-mail válido, como nome@exemplo.pt.');
confere('validar: NIF ok', isset($erros['nif']), false);
confere('validar: IBAN errado', $erros['iban'] ?? null, 'IBAN inválido. Verifique o país e os números.');
confere('validar: CPF ok', isset($erros['cpf']), false);
confere('validar: opcional vazio passa', isset($erros['obs']), false);
confere('validar: obrigatório ausente', $erros['cep'] ?? null, 'Preencha este campo.');

// Paginação
confere('paginar', paginar(95, 3, 20), ['pagina' => 3, 'porPagina' => 20, 'paginas' => 5, 'total' => 95, 'deslocamento' => 40]);
confere('paginar além do fim', paginar(10, 99, 20)['pagina'], 1);

echo "\n" . ($total - $falhas) . " de {$total} testes passaram.\n";
exit($falhas > 0 ? 1 : 0);
