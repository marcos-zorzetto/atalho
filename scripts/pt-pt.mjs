#!/usr/bin/env node
/**
 * Converte textos de português do Brasil para português de Portugal, e
 * reais para euros, sem mexer no código: só troca palavras dentro de
 *   - texto entre tags HTML (>texto<) que não pareça código;
 *   - strings com espaço ou com inicial maiúscula ("Salvar", "Digite seu nome");
 *   - comentários.
 * Nomes da API da biblioteca (data-at="...", "salvar", "at:arquivos"…) ficam
 * como estão, porque são uma palavra só e em minúsculas, ou estão colados a
 * hífen, ponto ou dois-pontos.
 *
 *   node scripts/pt-pt.mjs arquivo1 pasta2 …     converte
 *   node scripts/pt-pt.mjs --ver arquivo …       só mostra o que mudaria
 *
 * Termos do Brasil que mudam de sentido (CEP, CPF, CNPJ, Pix, boleto, DDD,
 * Correios) NÃO são trocados: o relatório final lista onde aparecem para
 * revisão à mão.
 */
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

// [Brasil, Portugal] — expressões antes das palavras soltas. A caixa da
// primeira letra é preservada (tela → ecrã, Tela → Ecrã).
const TROCAS = [
  // Ecrã (masculino em Portugal)
  ["tela cheia", "ecrã inteiro"], ["tela inteira", "ecrã inteiro"], ["telas pequenas", "ecrãs pequenos"], ["tela pequena", "ecrã pequeno"],
  ["telas grandes", "ecrãs grandes"], ["tela grande", "ecrã grande"], ["telas largas", "ecrãs largos"], ["tela larga", "ecrã largo"],
  ["nesta tela", "neste ecrã"], ["nessa tela", "nesse ecrã"], ["desta tela", "deste ecrã"], ["dessa tela", "desse ecrã"],
  ["esta tela", "este ecrã"], ["essa tela", "esse ecrã"], ["uma tela", "um ecrã"], ["pela tela", "pelo ecrã"],
  ["na tela", "no ecrã"], ["da tela", "do ecrã"], ["à tela", "ao ecrã"], ["a tela", "o ecrã"],
  ["nas telas", "nos ecrãs"], ["das telas", "dos ecrãs"], ["pelas telas", "pelos ecrãs"], ["às telas", "aos ecrãs"], ["as telas", "os ecrãs"],
  ["toda a tela", "todo o ecrã"], ["toda tela", "todo o ecrã"], ["telas", "ecrãs"], ["tela", "ecrã"],
  ["celulares", "telemóveis"], ["celular", "telemóvel"],
  ["arquivos", "ficheiros"], ["arquivo", "ficheiro"],
  ["usuárias", "utilizadoras"], ["usuária", "utilizadora"], ["usuários", "utilizadores"], ["usuário", "utilizador"],
  ["cadastre-se", "registe-se"], ["cadastrados", "registados"], ["cadastradas", "registadas"], ["cadastrado", "registado"], ["cadastrada", "registada"],
  ["cadastrar", "registar"], ["cadastre", "registe"], ["cadastros", "registos"], ["cadastro", "registo"], ["cadastrou", "registou"],
  ["registrar", "registar"], ["registre", "registe"], ["registrado", "registado"], ["registrada", "registada"], ["registros", "registos"], ["registro", "registo"],
  ["esqueci a senha", "esqueci-me da palavra-passe"], ["esqueci minha senha", "esqueci-me da palavra-passe"], ["esqueceu a senha", "esqueceu-se da palavra-passe"], ["esqueceu sua senha", "esqueceu-se da palavra-passe"],
  ["senhas", "palavras-passe"], ["senha", "palavra-passe"],
  ["fazer login", "iniciar sessão"], ["faça login", "inicie sessão"],
  ["em uma", "numa"], ["em um", "num"], ["em umas", "numas"], ["em uns", "nuns"],
  ["digita", "escreve"], ["digitam", "escrevem"], ["digitando", "a escrever"], ["digitado", "escrito"], ["digitada", "escrita"], ["digitar", "escrever"], ["digite", "escreva"], ["digitou", "escreveu"],
  ["fica salva", "fica guardada"], ["ficam salvas", "ficam guardadas"], ["está salva", "está guardada"], ["foi salva", "foi guardada"], ["ficar salva", "ficar guardada"],
  ["salvando", "a guardar"], ["salvar", "guardar"], ["salvos", "guardados"], ["salvas", "guardadas"], ["salvo", "guardado"], ["salva", "guarda"], ["salve", "guarde"],
  ["baixando", "a descarregar"], ["baixar", "descarregar"], ["baixe", "descarregue"], ["baixado", "descarregado"], ["baixados", "descarregados"],
  ["excluindo", "a eliminar"], ["excluir", "eliminar"], ["exclua", "elimine"], ["excluído", "eliminado"], ["excluída", "eliminada"], ["excluídos", "eliminados"], ["exclusão", "eliminação"],
  ["deletar", "eliminar"],
  ["carregando", "a carregar"], ["enviando", "a enviar"], ["buscando", "a procurar"], ["processando", "a processar"], ["verificando", "a verificar"],
  ["gerando", "a gerar"], ["calculando", "a calcular"], ["aguardando", "a aguardar"], ["conectando", "a ligar"], ["atualizando", "a atualizar"],
  ["abrindo", "a abrir"], ["copiando", "a copiar"], ["entrando", "a entrar"], ["criando", "a criar"], ["mostrando", "a mostrar"],
  ["pesquisando", "a pesquisar"], ["procurando", "a procurar"], ["esperando", "à espera"], ["confirmando", "a confirmar"], ["preparando", "a preparar"],
  ["analisando", "a analisar"], ["pagando", "a pagar"], ["testando", "a testar"], ["redirecionando", "a redirecionar"], ["sincronizando", "a sincronizar"],
  ["vendendo", "a vender"], ["crescendo", "a crescer"], ["funcionando", "a funcionar"], ["trabalhando", "a trabalhar"], ["chegando", "a chegar"],
  ["acontecendo", "a acontecer"], ["acabando", "a acabar"], ["escrevendo", "a escrever"], ["lendo", "a ler"], ["assistindo", "a ver"], ["ouvindo", "a ouvir"],
  ["jogando", "a jogar"], ["estudando", "a estudar"], ["aprendendo", "a aprender"], ["ensinando", "a ensinar"], ["comprando", "a comprar"], ["tentando", "a tentar"],
  ["mudando", "a mudar"], ["fazendo", "a fazer"], ["rodando", "a correr"],
  ["sem conexão com a internet", "sem ligação à internet"], ["conexão com a internet", "ligação à internet"], ["conexões", "ligações"], ["conexão", "ligação"], ["conectar", "ligar"], ["conectado", "ligado"], ["conectada", "ligada"],
  ["contatos", "contactos"], ["contato", "contacto"], ["contatar", "contactar"], ["de fato", "de facto"],
  ["ônibus", "autocarro"], ["trem", "comboio"],
  ["equipes", "equipas"], ["equipe", "equipa"],
  ["esportes", "desportos"], ["esporte", "desporto"], ["esportiva", "desportiva"], ["esportivo", "desportivo"], ["esportivos", "desportivos"],
  ["academias", "ginásios"], ["academia", "ginásio"],
  ["planejamento", "planeamento"], ["planejar", "planear"], ["planeje", "planeie"], ["planejado", "planeado"],
  ["gerenciamento", "gestão"], ["gerenciar", "gerir"], ["gerencie", "gira"], ["gerenciador", "gestor"], ["gerenciado", "gerido"],
  ["o aplicativo", "a app"], ["do aplicativo", "da app"], ["no aplicativo", "na app"], ["pelo aplicativo", "pela app"], ["um aplicativo", "uma app"],
  ["seu aplicativo", "a sua app"], ["aplicativos", "apps"], ["aplicativo", "app"],
  ["o banco de dados", "a base de dados"], ["do banco de dados", "da base de dados"], ["no banco de dados", "na base de dados"], ["banco de dados", "base de dados"],
  ["estoques", "stocks"], ["estoque", "stock"], ["faturamento", "faturação"],
  ["frete grátis", "portes grátis"], ["o frete", "os portes"], ["do frete", "dos portes"], ["no frete", "nos portes"], ["frete", "portes"],
  ["nota fiscal", "fatura"], ["notas fiscais", "faturas"], ["comprovante", "comprovativo"], ["comprovantes", "comprovativos"],
  ["seções", "secções"], ["seção", "secção"], ["recepção", "receção"], ["aspecto", "aspeto"], ["aspectos", "aspetos"],
  ["câmera", "câmara"], ["câmeras", "câmaras"], ["sobrenome", "apelido"],
  ["planilhas", "folhas de cálculo"], ["planilha", "folha de cálculo"], ["ingressos", "bilhetes"], ["ingresso", "bilhete"],
  ["loja virtual", "loja online"], ["lojas virtuais", "lojas online"],
  ["cardápios", "menus"], ["cardápio", "menu"], ["garçom", "empregado de mesa"], ["garçons", "empregados de mesa"],
  ["café da manhã", "pequeno-almoço"], ["suco", "sumo"], ["sucos", "sumos"], ["sorvete", "gelado"], ["sorvetes", "gelados"], ["xícara", "chávena"],
  ["açougue", "talho"], ["geladeira", "frigorífico"], ["mouse", "rato"], ["fone", "telefone"],
  ["desenvolvedores", "programadores"], ["desenvolvedor", "programador"], ["desenvolvedora", "programadora"],
  ["fale conosco", "fale connosco"], ["conosco", "connosco"], ["cupons", "cupões"], ["cupom", "cupão"], ["centavos", "cêntimos"], ["centavo", "cêntimo"],
  ["tênis", "ténis"], ["econômico", "económico"], ["econômica", "económica"], ["econômicos", "económicos"], ["acadêmico", "académico"], ["acadêmica", "académica"],
  ["gênero", "género"], ["prêmio", "prémio"], ["prêmios", "prémios"], ["anônimo", "anónimo"], ["anônima", "anónima"],
  ["eletrônico", "eletrónico"], ["eletrônica", "eletrónica"], ["eletrônicos", "eletrónicos"], ["eletrônicas", "eletrónicas"], ["telefônico", "telefónico"],
  ["sênior", "sénior"], ["gênio", "génio"], ["cômodo", "cómodo"], ["Antônio", "António"], ["bebê", "bebé"], ["bebês", "bebés"],
  ["ergonômico", "ergonómico"], ["ergonômica", "ergonómica"], ["fenômeno", "fenómeno"], ["convênio", "convénio"], ["convênios", "convénios"],
  ["nômade", "nómada"], ["agronômico", "agronómico"], ["ômega", "ómega"], ["harmônico", "harmónico"],
  ["oi", "olá"], ["tchau", "adeus"], ["bacana", "fixe"],
  ["São Paulo", "Lisboa"], ["Rio de Janeiro", "Porto"], ["Belo Horizonte", "Braga"], ["Porto Alegre", "Faro"], ["Curitiba", "Coimbra"],
  ["Recife", "Setúbal"], ["Fortaleza", "Funchal"], ["Brasília", "Évora"], ["Campinas", "Sintra"],
  ["Florianópolis", "Cascais"], ["Goiânia", "Viseu"], ["Manaus", "Leiria"], ["Av. Paulista", "Av. da Liberdade"], ["Avenida Paulista", "Avenida da Liberdade"],
];

// "seu e-mail" → "o seu e-mail" (em Portugal o possessivo leva artigo)
const ARTIGOS = { seu: "o", sua: "a", seus: "os", suas: "as" };
// Sem \b: em JavaScript ele não reconhece letras acentuadas ("à", "às")
const ANTES_SEM_ARTIGO = /(?:^|[^\p{L}])(?:o|a|os|as|do|da|dos|das|no|na|nos|nas|ao|à|aos|às|pelo|pela|pelos|pelas|um|uma|este|esta|esse|essa|num|numa|por|cujo|cuja)\s+$/iu;

const LETRA = "\\p{L}\\p{N}_";
// Não troca nomes de opções e propriedades: { salvar }, salvar:, at-senha, .arquivo
const ANTES = `(?<![${LETRA}\\-.:@/#=$'\`]|\\{\\s)`;
const DEPOIS = `(?![${LETRA}\\-=/]|\\.\\p{L}|:\\p{L}|\\s*[}:])`;

const caixa = (modelo, texto) =>
  modelo === modelo.toUpperCase() && modelo.length > 1 && /\p{L}/u.test(modelo)
    ? texto.toUpperCase()
    : modelo[0] === modelo[0].toUpperCase() && modelo[0] !== modelo[0].toLowerCase()
      ? texto[0].toUpperCase() + texto.slice(1)
      : texto;

const REGRAS = TROCAS.map(([de, para]) => ({
  re: new RegExp(ANTES + de.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+") + DEPOIS, "giu"),
  para,
}));

/** Troca as palavras num pedaço de prosa. */
export function converterProsa(texto) {
  let t = texto;
  for (const { re, para } of REGRAS) t = t.replace(re, (achado) => caixa(achado, para));
  // Preposição + possessivo: "de seu" → "do seu", "em sua" → "na sua"
  t = t.replace(new RegExp(`${ANTES}(de|em)\\s+(seu|sua|seus|suas)${DEPOIS}`, "giu"), (achado, prep, poss) => {
    const p = poss.toLowerCase();
    const junto = (prep.toLowerCase() === "de" ? "d" : "n") + ARTIGOS[p];
    return `${caixa(prep, junto)} ${poss}`;
  });
  t = t.replace(new RegExp(`${ANTES}(seu|sua|seus|suas)${DEPOIS}`, "giu"), (achado, poss, pos, inteiro) => {
    if (ANTES_SEM_ARTIGO.test(inteiro.slice(Math.max(0, pos - 12), pos))) return achado;
    const artigo = ARTIGOS[poss.toLowerCase()];
    return poss[0] === poss[0].toUpperCase() ? `${artigo[0].toUpperCase() + artigo.slice(1)} ${poss.toLowerCase()}` : `${artigo} ${poss}`;
  });
  // R$ 1.234,56 → 1234,56 € (5 algarismos ou mais: 12 345,56 €)
  t = t.replace(/R\$\s?(\d{1,3}(?:\.\d{3})*|\d+)(,\d{2})?(?![\d.,])/g, (achado, inteiro, centavos = "") => {
    const n = inteiro.replace(/\./g, "");
    const agrupado = n.length >= 5 ? n.replace(/\B(?=(\d{3})+$)/g, " ") : n;
    return `${agrupado}${centavos} €`;
  });
  // Telefones de exemplo do Brasil → Portugal
  t = t.replace(/\+?55\s?\(?11\)?\s?9?\d{4}[-\s]?\d{4}/g, "+351 912 345 678");
  t = t.replace(/\(\d{2}\)\s?9?\d{4}-\d{4}/g, "912 345 678");
  return t;
}

const PARECE_CODIGO = /[;{}=]|&&|\|\||=>|\bfunction\b|\breturn\b|\w\(|"\s*[,\])]|\]\s*,|:\s*\[/;

/** Converte um arquivo inteiro (HTML, JS, MJS, MD), só nas partes de texto. */
export function converterArquivo(conteudo, extensao) {
  let s = conteudo;
  if (extensao === ".md") {
    // Fora dos blocos de código
    return s.split(/(```[\s\S]*?```)/).map((p, i) => (i % 2 ? p : converterProsa(p))).join("");
  }
  // 1) Texto entre tags
  // (um ícone interpolado antes do texto, como "${i.lixo} Excluir", não conta como código)
  s = s.replace(/>([^<>]+)</g, (achado, texto) =>
    PARECE_CODIGO.test(texto.replace(/\$\{[\w.]+\}/g, "")) ? achado : `>${converterProsa(texto)}<`,
  );
  // 2) Strings com aspas duplas: com espaço ou começando por maiúscula
  s = s.replace(/"((?:[^"\\\n]|\\.)*)"/g, (achado, texto) =>
    /\s/.test(texto.trim()) || /^\p{Lu}\p{Ll}/u.test(texto) ? `"${converterProsa(texto)}"` : achado,
  );
  // 3) Template strings sem HTML dentro: `A mostrar ${n} ficheiros`
  s = s.replace(/`([^`<\n]*)`/g, (achado, texto) => (/\s/.test(texto) ? "`" + converterProsa(texto) + "`" : achado));
  // 4) Comentários
  s = s.replace(/<!--[\s\S]*?-->/g, (c) => converterProsa(c));
  s = s.replace(/\/\*[\s\S]*?\*\//g, (c) => converterProsa(c));
  s = s.replace(/(?<![:"'`\\])\/\/[^\n]*/g, (c) => converterProsa(c));
  // 5) Localidade e moeda no código
  s = s.replace(/(["'])pt-BR\1/g, "$1pt-PT$1").replace(/(["'])BRL\1/g, "$1EUR$1").replace(/lang="pt-BR"/g, 'lang="pt-PT"');
  return s;
}

const MARCAS_BRASIL = /\b(CEP|CPF|CNPJ|Pix|boleto|DDD|Correios|SEDEX|Receita Federal|parcel\w*|\d+x sem juros|Brasil|brasileir\w*|ViaCEP|R\$|BRL|pt-BR)\b/g;

async function arquivosDe(alvo) {
  const info = await stat(alvo);
  if (info.isFile()) return [alvo];
  const lista = [];
  for (const nome of await readdir(alvo)) {
    if (nome === "node_modules" || nome.startsWith(".")) continue;
    lista.push(...(await arquivosDe(path.join(alvo, nome))));
  }
  return lista.filter((a) => /\.(html|js|mjs|cjs|md)$/.test(a));
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("pt-pt.mjs")) {
  const ver = process.argv.includes("--ver");
  const alvos = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const revisar = new Map();
  let mudados = 0;
  for (const alvo of alvos) {
    for (const arquivo of await arquivosDe(alvo)) {
      const original = await readFile(arquivo, "utf8");
      const novo = converterArquivo(original, path.extname(arquivo));
      if (novo !== original) {
        mudados++;
        if (ver) {
          const a = original.split("\n"), b = novo.split("\n");
          a.forEach((linha, i) => linha !== b[i] && console.log(`${arquivo}:${i + 1}\n  - ${linha.trim().slice(0, 160)}\n  + ${(b[i] || "").trim().slice(0, 160)}`));
        } else await writeFile(arquivo, novo);
      }
      const marcas = [...novo.matchAll(MARCAS_BRASIL)].map((m) => m[1]);
      if (marcas.length) revisar.set(arquivo, marcas.length);
    }
  }
  console.log(`\n${mudados} arquivos ${ver ? "mudariam" : "convertidos"}.`);
  if (revisar.size) {
    console.log(`Termos do Brasil para revisar à mão (${revisar.size} arquivos):`);
    for (const [a, n] of [...revisar].sort((x, y) => y[1] - x[1]).slice(0, 40)) console.log(`  ${n}\t${a}`);
  }
}
