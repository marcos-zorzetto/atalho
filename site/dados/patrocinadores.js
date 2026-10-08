/*
 * Patrocinadores exibidos no site. Lista vazia = mostra o convite "Anuncie aqui".
 *
 * Formato de cada item:
 * {
 *   nome: "Hospedagem Exemplo",
 *   texto: "Hospede seu primeiro site com 50% de desconto.",   // até ~70 caracteres
 *   url: "https://exemplo.com/?utm_source=atalho",
 *   imagem: "https://exemplo.com/logo-64.png",                // opcional, quadrada
 *   posicoes: ["lateral", "inicio"],                           // onde aparece
 *   ate: "2026-12-31",                                         // fim do contrato (some sozinho depois)
 * }
 *
 * O site é gerado de novo a cada push e toda segunda-feira, então contratos
 * vencidos saem do ar automaticamente.
 */
window.ATALHO_PATROCINADORES = [];
