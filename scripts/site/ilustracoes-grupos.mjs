/**
 * Ilustrações das áreas de /sistemas/: mini-ecrãs que mostram o tipo de trabalho de cada
 * grupo (fatura, calendário, menu, pedidos, quadro, imóveis, pessoas). SVG em linha, com
 * as cores do tema (claro e escuro) e a cor do grupo em --grupo-cor; nítidas em qualquer ecrã.
 */

const S = "var(--at-superficie)";
const B = "var(--at-borda)";
const T = "var(--at-texto-suave)";
const C = "var(--grupo-cor)";
const C2 = "color-mix(in srgb, var(--grupo-cor) 18%, var(--at-superficie))";

/** Janela base com barra de título; o conteúdo vem por cima. */
const janela = (x, y, l, a, miolo) =>
  `<g><rect x="${x}" y="${y}" width="${l}" height="${a}" rx="12" fill="${S}" stroke="${B}"/>` +
  `<path d="M${x} ${y + 12}a12 12 0 0 1 12-12h${l - 24}a12 12 0 0 1 12 12v10H${x}z" fill="${C2}"/>` +
  `<circle cx="${x + 14}" cy="${y + 11}" r="3" fill="${C}"/><circle cx="${x + 24}" cy="${y + 11}" r="3" fill="${C}" opacity=".5"/><circle cx="${x + 34}" cy="${y + 11}" r="3" fill="${C}" opacity=".25"/>${miolo}</g>`;
const linha = (x, y, l, cor = T, op = 0.35) => `<rect x="${x}" y="${y}" width="${l}" height="6" rx="3" fill="${cor}" opacity="${op}"/>`;
const selo = (x, y, l) => `<rect x="${x}" y="${y}" width="${l}" height="14" rx="7" fill="${C2}"/><rect x="${x + 6}" y="${y + 5}" width="${l - 12}" height="4" rx="2" fill="${C}"/>`;

const DESENHOS = {
  vendas: () =>
    janela(40, 24, 168, 152,
      linha(56, 50, 70, C, 0.9) + linha(56, 64, 48) +
      [86, 104, 122].map((y) => linha(56, y, 88) + linha(166, y, 26)).join("") +
      `<path d="M56 142h136" stroke="${B}"/>` + linha(56, 152, 40) + `<rect x="150" y="148" width="42" height="14" rx="4" fill="${C}"/>`) +
    janela(196, 70, 104, 96,
      [[214, 136, 18], [234, 120, 34], [254, 128, 26], [274, 106, 48]].map(([x, y, a]) => `<rect x="${x}" y="${y}" width="12" height="${a}" rx="3" fill="${C}" opacity="${0.35 + a / 80}"/>`).join("") +
      `<path d="M210 154h80" stroke="${B}"/>`),

  marcacoes: () =>
    janela(36, 22, 248, 156,
      Array.from({ length: 5 }, (_, c) => linha(54 + c * 46, 44, 26)).join("") +
      Array.from({ length: 15 }, (_, i) => {
        const c = i % 5, l = Math.floor(i / 5);
        const x = 50 + c * 46, y = 60 + l * 36;
        const marcado = [1, 3, 7, 9, 13].includes(i);
        return `<rect x="${x}" y="${y}" width="40" height="30" rx="6" fill="${marcado ? C2 : "none"}" stroke="${marcado ? C : B}"/>` + (marcado ? `<rect x="${x + 6}" y="${y + 8}" width="24" height="4" rx="2" fill="${C}"/><rect x="${x + 6}" y="${y + 17}" width="16" height="4" rx="2" fill="${C}" opacity=".5"/>` : "");
      }).join("")),

  restauracao: () =>
    janela(40, 22, 150, 156,
      linha(58, 48, 60, C, 0.9) +
      [72, 98, 124, 150].map((y) => linha(58, y, 72) + linha(58, y + 10, 46, T, 0.2) + linha(160, y, 18, C, 0.7)).join("")) +
    `<circle cx="250" cy="104" r="44" fill="${S}" stroke="${B}"/><circle cx="250" cy="104" r="30" fill="${C2}" stroke="${C}" stroke-opacity=".4"/>` +
    `<path d="M200 76v24m-5-24v11a5 5 0 0 0 10 0V76M200 106v44" stroke="${T}" stroke-width="3" stroke-linecap="round" opacity=".55"/>` +
    `<path d="M306 76c-6 0-9 8-9 20h9v54" stroke="${T}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".55"/>`,

  atendimento: () =>
    janela(36, 22, 160, 156,
      [[52, 50, 96, false], [92, 80, 88, true], [52, 110, 110, false], [104, 140, 76, true]].map(([x, y, l, meu]) =>
        `<rect x="${x}" y="${y}" width="${l}" height="22" rx="11" fill="${meu ? C : C2}" opacity="${meu ? 0.85 : 1}"/><rect x="${x + 10}" y="${y + 9}" width="${l - 26}" height="4" rx="2" fill="${meu ? S : C}" opacity=".8"/>`).join("")) +
    janela(208, 46, 96, 120,
      [76, 104, 132].map((y, i) => linha(220, y, 44) + `<circle cx="${286}" cy="${y + 3}" r="6" fill="${C}" opacity="${1 - i * 0.3}"/>`).join("")),

  operacoes: () =>
    janela(30, 22, 260, 156,
      [0, 1, 2].map((c) => {
        const x = 44 + c * 82;
        return linha(x, 44, 40, C, 0.8) + Array.from({ length: 3 - c + (c === 2 ? 1 : 0) }, (_, i) => `<rect x="${x}" y="${58 + i * 34}" width="72" height="28" rx="6" fill="${i === 0 ? C2 : S}" stroke="${B}"/>` + linha(x + 8, 66 + i * 34, 44) + linha(x + 8, 76 + i * 34, 28, T, 0.2)).join("");
      }).join("")),

  imoveis: () =>
    `<path d="M48 104l62-52 62 52v66H48z" fill="${C2}" stroke="${C}" stroke-opacity=".5" stroke-linejoin="round"/><rect x="96" y="128" width="28" height="42" rx="3" fill="${S}" stroke="${B}"/><rect x="62" y="114" width="22" height="20" rx="3" fill="${S}" stroke="${B}"/><rect x="136" y="114" width="22" height="20" rx="3" fill="${S}" stroke="${B}"/>` +
    janela(186, 30, 118, 140,
      [58, 96, 134].map((y) => `<rect x="198" y="${y}" width="30" height="28" rx="5" fill="${C2}"/>` + linha(236, y + 4, 52) + linha(236, y + 16, 34, C, 0.7)).join("")),

  comunidades: () =>
    janela(30, 22, 180, 156,
      [50, 82, 114, 146].map((y, i) => `<circle cx="56" cy="${y + 10}" r="11" fill="${C}" opacity="${0.9 - i * 0.18}"/>` + linha(76, y + 2, 70) + linha(76, y + 12, 46, T, 0.2) + selo(158, y + 3, 40)).join("")) +
    `<circle cx="252" cy="76" r="24" fill="${C2}" stroke="${C}" stroke-opacity=".5"/><circle cx="252" cy="70" r="8" fill="${C}"/><path d="M238 92c3-8 8-11 14-11s11 3 14 11" fill="${C}"/>` +
    `<circle cx="226" cy="134" r="18" fill="${S}" stroke="${B}"/><circle cx="278" cy="134" r="18" fill="${S}" stroke="${B}"/><circle cx="226" cy="130" r="6" fill="${T}" opacity=".5"/><circle cx="278" cy="130" r="6" fill="${T}" opacity=".5"/>`,
};

/** SVG da ilustração do grupo (decorativa: o texto ao lado diz o mesmo). */
export function ilustracaoGrupo(id) {
  const desenho = DESENHOS[id];
  if (!desenho) return "";
  return `<svg class="site-grupo-ilustracao" viewBox="0 0 320 200" fill="none" aria-hidden="true" focusable="false">${desenho()}</svg>`;
}
