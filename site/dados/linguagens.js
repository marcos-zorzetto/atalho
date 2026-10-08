/*
 * Abas de TypeScript e PHP nos exemplos já existentes.
 * Fica num arquivo separado para os exemplos principais continuarem simples.
 */
(function () {
  const { componentes } = window.ATALHO_DOCS;
  const em = (id, indice, campos) => {
    const componente = componentes.find((c) => c.id === id);
    if (!componente || !componente.exemplos[indice]) throw new Error(`Exemplo ${id}[${indice}] não existe`);
    Object.assign(componente.exemplos[indice], campos);
  };

  em("validacao", 0, {
    ts: `const formulario = document.querySelector<HTMLFormElement>("#form-conta")!;

formulario.addEventListener("at:enviar", async (evento) => {
  const { dados, botao } = evento.detail; // dados: Record<string, FormDataEntryValue>
  botao?.setAttribute("aria-busy", "true");
  try {
    await Atalho.requisitar<{ id: number }>("api/cadastro.php", { metodo: "POST", corpo: dados });
    Atalho.notificar("Conta criada!", { tipo: "sucesso" });
  } catch (erro) {
    if (erro instanceof Error) Atalho.notificar(erro.message, { tipo: "perigo" });
  } finally {
    botao?.removeAttribute("aria-busy");
  }
});`,
    php: `<?php
// api/cadastro.php — as mesmas regras, conferidas de novo no servidor
require __DIR__ . '/atalho.php';
use function Atalho\\{exigirMetodo, lerJson, validar, responderErro, responderJson};

exigirMetodo('POST');
$dados = lerJson();

$erros = validar($dados, [
    'nome'  => ['obrigatorio', 'min:3'],
    'email' => ['obrigatorio', 'email'],
    'cpf'   => ['obrigatorio', 'cpf'],
    'senha' => ['obrigatorio', 'min:8'],
]);
if ($erros) {
    responderErro('Confira os dados do formulário.', 422, $erros);
}

$hash = password_hash($dados['senha'], PASSWORD_DEFAULT); // nunca salve a senha pura
responderJson(['id' => 123], 201);`,
  });

  em("mascaras", 1, {
    ts: `const campo = document.querySelector<HTMLInputElement>("#cpf-teste")!;

function cpfValido(): boolean {
  return Atalho.validar.cpf(campo.value); // (texto: string) => boolean
}`,
    php: `<?php
require __DIR__ . '/atalho.php';

var_dump(Atalho\\validarCpf('529.982.247-25'));      // true
var_dump(Atalho\\validarCnpj('12.ABC.345/01DE-35'));  // true (CNPJ alfanumérico)
echo Atalho\\formatarCpf('52998224725');              // 529.982.247-25`,
  });

  em("cep", 0, {
    ts: `const cep = document.querySelector<HTMLInputElement>("#end-cep")!;

cep.addEventListener("at:cep", (evento) => {
  const { localidade, uf, ddd } = evento.detail; // tipos do ViaCEP
  console.log(\`\${localidade}/\${uf}, DDD \${ddd}\`);
});`,
    php: `<?php
// api/cep.php?cep=01310100 — CEP pelo seu servidor, com cache
require __DIR__ . '/atalho.php';
use function Atalho\\{buscarCep, responderErro, responderJson};

$endereco = buscarCep($_GET['cep'] ?? '', __DIR__ . '/cache-cep');
$endereco ?? responderErro('CEP não encontrado.', 404);
responderJson($endereco);`,
  });

  em("upload", 0, {
    php: `<?php
// api/upload.php — confere o tipo REAL do arquivo, não a extensão
require __DIR__ . '/atalho.php';
use function Atalho\\{exigirMetodo, salvarUpload, responderErro, responderJson};

exigirMetodo('POST');
try {
    $nome = salvarUpload($_FILES['foto'], __DIR__ . '/uploads', ['image/jpeg', 'image/png', 'image/webp'], 5);
    responderJson(['arquivo' => $nome], 201);
} catch (RuntimeException $erro) {
    responderErro($erro->getMessage(), 422);
}`,
  });

  em("tabela", 0, {
    php: `<?php
// api/pedidos.php?pagina=1&busca=maria — lista paginada com PDO
require __DIR__ . '/atalho.php';
use function Atalho\\{paginar, limparTexto, responderJson};

$pdo = new PDO('mysql:host=localhost;dbname=loja;charset=utf8mb4', 'usuario', 'senha', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);
$filtro = '%' . limparTexto($_GET['busca'] ?? '', 100) . '%';

$total = $pdo->prepare('SELECT COUNT(*) FROM pedidos WHERE cliente LIKE ?');
$total->execute([$filtro]);
$pagina = paginar((int) $total->fetchColumn(), (int) ($_GET['pagina'] ?? 1), 20);

// Parâmetros (?) evitam SQL injection
$consulta = $pdo->prepare('SELECT id, cliente, status, total FROM pedidos WHERE cliente LIKE ? LIMIT ? OFFSET ?');
$consulta->bindValue(1, $filtro);
$consulta->bindValue(2, $pagina['porPagina'], PDO::PARAM_INT);
$consulta->bindValue(3, $pagina['deslocamento'], PDO::PARAM_INT);
$consulta->execute();

responderJson(['pedidos' => $consulta->fetchAll(PDO::FETCH_ASSOC), 'paginacao' => $pagina]);`,
  });

  em("estado", 0, {
    ts: `interface Contador {
  valor: number;
  readonly alto: boolean;
  aumentar(): void;
  diminuir(): void;
}

Atalho.estado<Contador>("contador", {
  valor: 0,
  get alto(): boolean { return this.valor > 5; },
  aumentar() { this.valor++; },
  diminuir() { this.valor = Math.max(0, this.valor - 1); },
});`,
  });

  em("estado", 1, {
    ts: `interface Tarefa { id: number; texto: string }

interface Tarefas {
  itens: Tarefa[];
  readonly resumo: string;
  adicionar(dados: { texto: string }, evento: SubmitEvent): void;
  remover(tarefa: Tarefa): void;
}

Atalho.estado<Tarefas>("tarefas", {
  itens: [],
  get resumo(): string {
    return Atalho.formatar.plural(this.itens.length, "tarefa pendente", "tarefas pendentes");
  },
  adicionar(dados, evento) {
    this.itens = [...this.itens, { id: Date.now(), texto: dados.texto }];
    (evento.target as HTMLFormElement).reset();
  },
  remover(tarefa) {
    this.itens = this.itens.filter((t) => t.id !== tarefa.id);
  },
}, { salvar: true });`,
  });

  em("requisitar", 1, {
    ts: `interface Cliente { id: number; nome: string }

async function salvarCliente(dados: Omit<Cliente, "id">, token: string): Promise<void> {
  try {
    const cliente = await Atalho.requisitar<Cliente>("/api/clientes", {
      metodo: "POST",
      corpo: dados,
      cabecalhos: { Authorization: \`Bearer \${token}\` },
    });
    Atalho.notificar(\`Cliente \${cliente.nome} cadastrado.\`, { tipo: "sucesso" });
  } catch (erro) {
    if (erro instanceof Error) Atalho.notificar(erro.message, { tipo: "perigo" });
  }
}`,
    php: `<?php
// api/clientes.php — o outro lado da requisição
require __DIR__ . '/atalho.php';
use function Atalho\\{exigirMetodo, lerJson, validar, responderErro, responderJson, limparTexto};

exigirMetodo('POST');
$dados = lerJson();
if ($erros = validar($dados, ['nome' => ['obrigatorio', 'min:2']])) {
    responderErro('Confira os dados do formulário.', 422, $erros);
}
responderJson(['id' => 42, 'nome' => limparTexto($dados['nome'], 120)], 201);`,
  });

  em("receita-cadastro", 0, {
    php: `<?php
// api/clientes.php — recebe a ficha de cadastro completa
require __DIR__ . '/atalho.php';
use function Atalho\\{exigirMetodo, lerJson, validar, responderErro, responderJson, somenteDigitos};

exigirMetodo('POST');
$dados = lerJson();
$erros = validar($dados, [
    'nome' => ['obrigatorio', 'min:5'],
    'cpf' => ['obrigatorio', 'cpf'],
    'email' => ['obrigatorio', 'email'],
    'celular' => ['obrigatorio', 'telefone'],
    'cep' => ['obrigatorio', 'cep'],
    'numero' => ['obrigatorio'],
    'senha' => ['obrigatorio', 'min:8'],
    'termos' => ['obrigatorio'],
]);
if ($erros) {
    responderErro('Confira os dados do formulário.', 422, $erros);
}

$cliente = [
    'cpf' => somenteDigitos($dados['cpf']),
    'senha_hash' => password_hash($dados['senha'], PASSWORD_DEFAULT),
    'aceitou_termos_em' => date('c'), // guarde a prova do aceite
];
responderJson(['ok' => true], 201);`,
  });

  em("receita-login", 0, {
    php: `<?php
// api/login.php — senha com hash, nova sessão e limite de tentativas
require __DIR__ . '/atalho.php';
use function Atalho\\{exigirMetodo, lerJson, iniciarSessao, responderErro, responderJson};

exigirMetodo('POST');
iniciarSessao();
$dados = lerJson();
$usuario = buscarUsuario($dados['email'] ?? ''); // sua consulta ao banco

if (!$usuario || !password_verify($dados['senha'] ?? '', $usuario['senha_hash'])) {
    responderErro('E-mail ou senha incorretos.', 401); // não diga qual dos dois errou
}

session_regenerate_id(true);
$_SESSION['aguardando_codigo'] = $usuario['id'];
// Envie o código por SMS ou e-mail e confira em outra rota (api/codigo.php)
responderJson(['proximo' => 'codigo']);`,
  });
})();
