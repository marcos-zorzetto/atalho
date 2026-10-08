<?php
// api/pedidos.php?pagina=1&busca=maria — lista paginada para a Tabela de dados
declare(strict_types=1);

require __DIR__ . '/../atalho.php';

use function Atalho\{exigirMetodo, paginar, limparTexto, responderJson};

exigirMetodo('GET');

$pdo = new PDO('mysql:host=localhost;dbname=loja;charset=utf8mb4', 'usuario', 'senha', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$busca = limparTexto($_GET['busca'] ?? '', 100);
$filtro = '%' . $busca . '%';

// Sempre use parâmetros (?), nunca junte texto do usuário no SQL: evita SQL injection
$contar = $pdo->prepare('SELECT COUNT(*) FROM pedidos WHERE cliente LIKE ?');
$contar->execute([$filtro]);
$pagina = paginar((int) $contar->fetchColumn(), (int) ($_GET['pagina'] ?? 1), 20);

$consulta = $pdo->prepare(
    'SELECT id, cliente, status, total, criado_em
       FROM pedidos
      WHERE cliente LIKE ?
      ORDER BY criado_em DESC
      LIMIT ? OFFSET ?'
);
$consulta->bindValue(1, $filtro);
$consulta->bindValue(2, $pagina['porPagina'], PDO::PARAM_INT);
$consulta->bindValue(3, $pagina['deslocamento'], PDO::PARAM_INT);
$consulta->execute();

responderJson(['pedidos' => $consulta->fetchAll(), 'paginacao' => $pagina]);
