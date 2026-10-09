/**
 * Ícones Phosphor (licença MIT, phosphoricons.com): 1.512 ícones em 6 estilos.
 * Na publicação viram um arquivo por estilo (sprite SVG, carregado só quando
 * a pessoa escolhe o estilo) e um índice para a busca em português.
 */
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { RAIZ } from "../docs.mjs";

const PASTA = path.join(RAIZ, "node_modules", "@phosphor-icons", "core");
export const VERSAO_PHOSPHOR = JSON.parse(readFileSync(path.join(PASTA, "package.json"), "utf8")).version;

export const PESOS = [
  ["regular", "Normal"],
  ["duotone", "Duas cores"],
  ["bold", "Negrito"],
  ["fill", "Preenchido"],
  ["light", "Leve"],
  ["thin", "Fino"],
];

export const CATEGORIAS_PT = {
  arrows: "Setas",
  brands: "Marcas",
  commerce: "Comércio",
  communications: "Comunicação",
  design: "Design",
  "technology & development": "Tecnologia",
  editor: "Texto e edição",
  finances: "Finanças",
  games: "Jogos",
  "health & wellness": "Saúde",
  "maps & travel": "Mapas e viagem",
  media: "Mídia",
  nature: "Natureza",
  objects: "Objetos",
  office: "Escritório",
  people: "Pessoas",
  system: "Sistema",
  weather: "Clima",
};

/** Português → termos em inglês dos nomes e etiquetas do Phosphor (busca sem acento). */
export const SINONIMOS = {
  carrinho: "cart basket", compra: "cart bag buy shopping checkout", comprar: "cart bag buy shopping", loja: "storefront store shop market",
  sacola: "bag tote", etiqueta: "tag label", preco: "tag price currency", desconto: "percent tag seal", cupom: "ticket tag percent",
  dinheiro: "money currency coins cash wallet", moeda: "currency coin", real: "currency money", euro: "eur currency", dolar: "dollar currency",
  pix: "pix", cartao: "credit-card card", pagamento: "credit-card money wallet pix receipt", banco: "bank", carteira: "wallet",
  recibo: "receipt invoice", nota: "receipt note invoice", boleto: "barcode", codigo: "barcode qr code", qrcode: "qr-code",
  entrega: "truck package delivery", caminhao: "truck", pacote: "package box", caixa: "package box archive", frete: "truck",
  usuario: "user person", pessoa: "user person", pessoas: "users people", cliente: "user users", perfil: "user identification",
  equipe: "users people team", time: "users team", contato: "address-book phone envelope", amigo: "users",
  casa: "house home", inicio: "house home", menu: "list", configuracao: "gear sliders", configuracoes: "gear sliders", ajustes: "gear sliders",
  buscar: "magnifying-glass search", busca: "magnifying-glass search", pesquisa: "magnifying-glass", lupa: "magnifying-glass", filtro: "funnel sliders",
  fechar: "x close", sair: "sign-out x", entrar: "sign-in", login: "sign-in lock user", senha: "password lock key", cadeado: "lock",
  seguranca: "shield lock", escudo: "shield", chave: "key", olho: "eye", ver: "eye", esconder: "eye-slash",
  seta: "arrow caret", direita: "right", esquerda: "left", cima: "up", baixo: "down", voltar: "arrow-left arrow-u",
  mais: "plus", menos: "minus", adicionar: "plus", remover: "minus trash x", apagar: "trash eraser", lixeira: "trash", excluir: "trash",
  editar: "pencil pen", lapis: "pencil", caneta: "pen", copiar: "copy", colar: "clipboard", salvar: "floppy-disk download",
  baixar: "download", enviar: "upload paper-plane", compartilhar: "share", link: "link", anexo: "paperclip",
  check: "check", certo: "check", erro: "warning x-circle", aviso: "warning info bell", alerta: "warning bell siren", informacao: "info",
  ajuda: "question lifebuoy", pergunta: "question", notificacao: "bell", sino: "bell",
  coracao: "heart", favorito: "heart star bookmark", estrela: "star", avaliacao: "star", curtir: "thumbs-up heart",
  calendario: "calendar", agenda: "calendar", data: "calendar", relogio: "clock", hora: "clock", tempo: "clock timer hourglass",
  cronometro: "timer", alarme: "alarm",
  telefone: "phone", celular: "phone device-mobile", email: "envelope at", mensagem: "chat envelope", conversa: "chat chats",
  whatsapp: "whatsapp", instagram: "instagram", facebook: "facebook", youtube: "youtube", tiktok: "tiktok", linkedin: "linkedin", x: "x-logo twitter",
  mapa: "map", local: "map-pin", localizacao: "map-pin navigation", endereco: "map-pin house", cep: "map-pin", viagem: "airplane suitcase",
  aviao: "airplane", carro: "car", moto: "motorcycle", bicicleta: "bicycle", onibus: "bus",
  foto: "camera image", camera: "camera", imagem: "image", video: "video film", musica: "music", microfone: "microphone", audio: "speaker",
  livro: "book", estudo: "book graduation-cap student", escola: "graduation-cap student chalkboard", curso: "graduation-cap video book",
  trabalho: "briefcase", maleta: "briefcase", escritorio: "briefcase desk building-office", empresa: "building-office buildings",
  grafico: "chart", relatorio: "chart file", painel: "squares-four gauge chart", dados: "database chart",
  arquivo: "file folder", pasta: "folder", documento: "file", impressora: "printer",
  codigofonte: "code", programacao: "code terminal brackets", computador: "desktop laptop computer", notebook: "laptop",
  nuvem: "cloud", internet: "globe wifi", wifi: "wifi", robo: "robot", ia: "robot sparkle brain", inteligencia: "brain robot",
  foguete: "rocket", raio: "lightning", energia: "lightning battery", bateria: "battery", lampada: "lightbulb", ideia: "lightbulb",
  sol: "sun", lua: "moon", chuva: "cloud-rain", neve: "snowflake",
  comida: "fork-knife hamburger pizza", restaurante: "fork-knife chef-hat", pizza: "pizza", hamburguer: "hamburger", cafe: "coffee",
  bebida: "beer wine coffee", cerveja: "beer", vinho: "wine",
  barbearia: "scissors razor", tesoura: "scissors", salao: "scissors hair-dryer", beleza: "sparkle flower",
  saude: "heartbeat first-aid stethoscope", medico: "stethoscope first-aid", clinica: "first-aid hospital stethoscope", hospital: "hospital",
  dentista: "tooth", remedio: "pill", academia: "barbell", treino: "barbell person-simple-run",
  pet: "dog cat paw-print", cachorro: "dog", gato: "cat",
  imovel: "house building", imobiliaria: "house buildings key",
  igreja: "church", presente: "gift", festa: "confetti balloon", evento: "calendar ticket confetti", ingresso: "ticket",
  trofeu: "trophy", medalha: "medal", meta: "target", alvo: "target", marketing: "megaphone target", anuncio: "megaphone",
  aperto: "handshake", acordo: "handshake", contrato: "file-text signature",
  brilho: "sparkle star", magica: "magic-wand sparkle", fogo: "fire", planta: "plant leaf", arvore: "tree",
  mundo: "globe", idioma: "translate globe", tema: "palette moon sun", cor: "palette paint-brush",
};

const sem = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

let cache;
async function carregar() {
  if (cache) return cache;
  const { icons } = await import("@phosphor-icons/core");
  cache = icons;
  return icons;
}

/** SVG de um ícone para usar dentro do site (ex.: cartões da página inicial). */
export function svgPhosphor(nome, peso = "duotone", tamanho = 24, atributos = 'aria-hidden="true"') {
  const arquivo = path.join(PASTA, "assets", peso, `${nome}${peso === "regular" ? "" : `-${peso}`}.svg`);
  const fonte = readFileSync(arquivo, "utf8");
  return fonte.replace("<svg ", `<svg width="${tamanho}" height="${tamanho}" ${atributos} `);
}

/** Escreve dist/icones/phosphor/<peso>.svg (sprites) e indice.json. */
export async function gerarIconesPhosphor(DIST, base) {
  const icones = await carregar();
  const saida = path.join(DIST, "icones", "phosphor");
  await mkdir(saida, { recursive: true });
  for (const [peso] of PESOS) {
    const pasta = path.join(PASTA, "assets", peso);
    const arquivos = new Set(await readdir(pasta));
    const simbolos = [];
    for (const icone of icones) {
      const arquivo = `${icone.name}${peso === "regular" ? "" : `-${peso}`}.svg`;
      if (!arquivos.has(arquivo)) continue;
      const fonte = await readFile(path.join(pasta, arquivo), "utf8");
      const miolo = fonte.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
      simbolos.push(`<symbol id="${icone.name}" viewBox="0 0 256 256">${miolo}</symbol>`);
    }
    await writeFile(path.join(saida, `${peso}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor">${simbolos.join("")}</svg>\n`);
  }
  // Índice da busca: nome, categorias em português e palavras (inglês + português)
  const paraPortugues = {};
  for (const [pt, en] of Object.entries(SINONIMOS)) for (const termo of en.split(" ")) (paraPortugues[termo] ||= []).push(pt);
  const indice = icones.map((i) => {
    const termos = new Set([...i.name.split("-"), ...i.tags.map(sem)]);
    const pt = new Set();
    for (const t of termos) for (const p of paraPortugues[t] || []) pt.add(p);
    for (const [en, lista] of Object.entries(paraPortugues)) if (en.includes("-") && i.name.startsWith(en)) lista.forEach((p) => pt.add(p));
    return [i.name, i.categories.map((c) => CATEGORIAS_PT[c] || c), [...termos].join(" "), [...pt].join(" ")];
  });
  await writeFile(path.join(saida, "indice.json"), JSON.stringify({ versao: VERSAO_PHOSPHOR, base, icones: indice }));
  return icones.length;
}
