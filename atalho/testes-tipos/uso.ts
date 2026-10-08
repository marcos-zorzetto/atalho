// Confere se os tipos do Atalho funcionam como prometido no guia de TypeScript.
// Roda no CI: tsc -p atalho/testes-tipos (só checagem, nada é executado).

interface Produto {
  id: number;
  nome: string;
  preco: number;
}

interface Carrinho {
  itens: Produto[];
  readonly total: number;
  adicionar(produto: Produto): void;
}

const carrinho = Atalho.estado<Carrinho>(
  "carrinho",
  {
    itens: [],
    get total(): number {
      return this.itens.reduce((soma, item) => soma + item.preco, 0);
    },
    adicionar(produto) {
      this.itens = [...this.itens, produto];
    },
  },
  { salvar: true }
);

carrinho.adicionar({ id: 1, nome: "Camiseta", preco: 59.9 });
const texto: string = Atalho.formatar.moeda(carrinho.total);
const valido: boolean = Atalho.validar.cnpj("12.ABC.345/01DE-35");

document.addEventListener("at:cep", (evento) => {
  const cidade: string = evento.detail.localidade;
  console.log(cidade, texto, valido);
});

document.querySelector<HTMLFormElement>("form")?.addEventListener("at:enviar", (evento) => {
  const { dados, botao } = evento.detail;
  botao?.setAttribute("aria-busy", "true");
  console.log(dados);
});

async function buscar(): Promise<void> {
  const cliente = await Atalho.requisitar<{ nome: string }>("/api", { metodo: "POST", corpo: { a: 1 } });
  const nome: string = cliente.nome;
  Atalho.notificar(nome, { tipo: "sucesso", acao: { texto: "Desfazer", aoClicar: () => undefined } });
}
void buscar;

// @ts-expect-error: tipo de notificação inexistente deve dar erro
Atalho.notificar("x", { tipo: "verde" });

// @ts-expect-error: produto sem preço deve dar erro
carrinho.adicionar({ id: 2, nome: "Boné" });

const parar = Atalho.observar<Carrinho>("carrinho", (estado) => console.log(estado.total));
parar();
