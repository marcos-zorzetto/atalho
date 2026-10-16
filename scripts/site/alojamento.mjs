/**
 * Cabeçalhos de segurança e cache do site, numa fonte única:
 *  - .htaccess para o Apache da PTServidor (alojamento oficial);
 *  - _headers para a Cloudflare (alternativa);
 *  - os servidores dos testes (testes/interacoes.mjs e testes/auditoria.mjs) usam
 *    os mesmos cabeçalhos, para a CSP ser testada antes de ir para o ar.
 * Guia: servicos/PTSERVIDOR.md
 */

/** Origens externas que o site usa de facto (cada uma com o motivo). */
const ORIGENS = {
  // atalho.css/js pela CDN nas demonstrações e no editor; Phosphor e three.js
  cdn: "https://cdn.jsdelivr.net",
  // Contas, área de membros e conteúdos Pro
  supabase: "https://*.supabase.co",
  // Assistente de IA (Cloudflare Worker), quando estiver ligado
  assistente: "https://*.workers.dev",
  // Morada pelo código postal (Portugal) e pelo CEP (Brasil)
  moradas: "https://json.geoapi.pt https://viacep.com.br",
  // Produtos de exemplo da receita da loja
  produtos: "https://dummyjson.com",
  // Pagamentos (checkout e portal do cliente)
  pagamentos: "https://*.revolut.com",
  // Letra das páginas completas
  letrasCss: "https://fonts.googleapis.com",
  letras: "https://fonts.gstatic.com",
  // Vídeo leve (YouTube sem cookies) e mapa do contacto
  molduras: "https://www.youtube-nocookie.com https://www.openstreetmap.org",
};

/**
 * Política de segurança de conteúdo.
 * 'unsafe-inline' e 'unsafe-eval' ficam porque as demonstrações correm o código
 * de exemplo de cada componente (new Function) e as prévias usam srcdoc, que herda
 * a política da página. O resto fica fechado: sem plugins, sem <base> alheio, sem
 * formulários para fora e sem o site dentro de molduras de outros domínios.
 */
export function politicaConteudo() {
  const o = ORIGENS;
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: ${o.cdn}`,
    `style-src 'self' 'unsafe-inline' ${o.cdn} ${o.letrasCss}`,
    `font-src 'self' data: ${o.cdn} ${o.letras}`,
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    `connect-src 'self' ${o.cdn} ${o.supabase} ${o.assistente} ${o.moradas} ${o.produtos}`,
    `frame-src 'self' blob: ${o.molduras}`,
    "worker-src 'self' blob:",
    `form-action 'self' ${o.pagamentos}`,
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Cabeçalhos de todas as respostas. */
export function cabecalhosSeguranca() {
  return {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Content-Security-Policy": politicaConteudo(),
  };
}

/** Regras por pasta (o caminho é relativo à base do site, sem "/" no início). */
export const REGRAS = [
  { pasta: "atalho/", cabecalhos: { "Cache-Control": "public, max-age=3600, must-revalidate" } },
  { pasta: "exemplos/capturas/", cabecalhos: { "Cache-Control": "public, max-age=604800" } },
  { pasta: "exemplos/miniaturas/", cabecalhos: { "Cache-Control": "public, max-age=604800" } },
  { pasta: "admin/", cabecalhos: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } },
  { pasta: "conta/", cabecalhos: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" } },
];

/** Cabeçalhos para um pedido (usado pelos servidores dos testes). */
export function cabecalhosPara(caminho) {
  const relativo = caminho.replace(/^\//, "");
  const todos = Object.assign({}, cabecalhosSeguranca(), ...REGRAS.filter((r) => relativo.startsWith(r.pasta)).map((r) => r.cabecalhos));
  // Em http://127.0.0.1 o Safari (WebKit) levaria todos os pedidos para https e nada carregaria
  delete todos["Strict-Transport-Security"];
  todos["Content-Security-Policy"] = todos["Content-Security-Policy"].replace(/; upgrade-insecure-requests$/, "");
  return todos;
}

const aspas = (valor) => `"${valor.replace(/"/g, '\\"')}"`;

/**
 * .htaccess do Apache (PTServidor/cPanel). `base` é o prefixo dos links ("/" ou "/atalho/")
 * e `host` o domínio oficial (para levar www e http ao endereço certo).
 */
export function htaccess({ base = "/", host = "" } = {}) {
  const semBase = (pasta) => `${base}${pasta}`.replace(/\/{2,}/g, "/");
  const regras = REGRAS.map(
    (r) => `<If "%{REQUEST_URI} =~ m#^${semBase(r.pasta)}#">\n${Object.entries(r.cabecalhos).map(([n, v]) => `  Header always set ${n} ${aspas(v)}`).join("\n")}\n</If>`
  ).join("\n");
  const canonico = host && !["localhost", "127.0.0.1"].includes(host) && !host.endsWith(".github.io")
    ? `# http e outros nomes (www, subdomínio do cPanel) levam ao endereço oficial
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !=https
RewriteRule ^ https://${host}%{REQUEST_URI} [L,R=301]
RewriteCond %{HTTP_HOST} !^${host.replace(/\./g, "\\.")}$ [NC]
RewriteRule ^ https://${host}%{REQUEST_URI} [L,R=301]
`
    : `# Força HTTPS
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !=https
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
`;
  return `# Gerado por scripts/site/alojamento.mjs — não edite à mão (as mudanças perdem-se na próxima publicação).
# Guia: servicos/PTSERVIDOR.md

Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 ${semBase("404.html")}
AddDefaultCharset utf-8
AddType application/manifest+json .webmanifest
AddType image/svg+xml .svg
AddType text/javascript .js .mjs

<IfModule mod_rewrite.c>
RewriteEngine On
# Validação do certificado (AutoSSL) passa sem redirecionamento
RewriteRule ^\\.well-known/ - [L]
${canonico}
# Ficheiros escondidos (.git, .env…) nunca são servidos; .well-known continua acessível
RewriteRule (^|/)\\.(?!well-known/) - [F,L]
</IfModule>

<IfModule mod_headers.c>
${Object.entries(cabecalhosSeguranca()).map(([n, v]) => `Header always set ${n} ${aspas(v)}`).join("\n")}

# Páginas: sempre a versão nova (a cache do nginx e do navegador revalida)
<FilesMatch "\\.(html|xml|txt|json)$">
  Header set Cache-Control "no-cache"
</FilesMatch>
<FilesMatch "\\.(svg|png|webp|woff2)$">
  Header set Cache-Control "public, max-age=604800"
</FilesMatch>
${regras}
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml application/xml text/plain
</IfModule>
`;
}

/** _headers da Cloudflare (alternativa ao Apache). */
export function cabecalhosCloudflare({ base = "/" } = {}) {
  const bloco = (rota, cabecalhos) => `${rota}\n${Object.entries(cabecalhos).map(([n, v]) => `  ${n}: ${v}`).join("\n")}\n`;
  return [bloco("/*", cabecalhosSeguranca()), ...REGRAS.map((r) => bloco(`${base}${r.pasta}*`, r.cabecalhos))].join("\n");
}
