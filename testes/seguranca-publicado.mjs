#!/usr/bin/env node
/**
 * Segurança do site publicado: cabeçalhos, CSP, redirecionamentos, certificado TLS,
 * ficheiros sensíveis e conteúdo misto. Só faz pedidos GET/HEAD, espaçados (a PTServidor
 * tem uma proteção anti-robô que bloqueia rajadas de pedidos durante uns minutos).
 * Adaptado dos testes do site da Alisense.
 *
 * Uso: node testes/seguranca-publicado.mjs https://atalhoui.com
 */
import tls from "node:tls";

const BASE = (process.argv[2] || "").replace(/\/$/, "");
if (!/^https:\/\//.test(BASE)) {
  console.error("Uso: node testes/seguranca-publicado.mjs https://o-dominio");
  process.exit(1);
}
const host = new URL(BASE).host;
let falhas = 0;
const ok = (cond, msg) => { if (!cond) falhas++; console.log(`${cond ? "✓" : "✗"} ${msg}`); };
const pausa = () => new Promise((r) => setTimeout(r, 1200));
// ?x= evita a cache do nginx à frente do Apache
const pedir = async (u, o = {}) => { await pausa(); return fetch(u + (u.includes("?") ? "&" : "?") + "x=" + Date.now(), { redirect: "manual", ...o }); };

// 1. Cabeçalhos de segurança
const r = await pedir(BASE + "/");
const h = (n) => r.headers.get(n) || "";
ok(r.status === 200, `página inicial responde 200 (${r.status})`);
ok(/max-age=\d{7,}/.test(h("strict-transport-security")), "HSTS ativo");
const csp = h("content-security-policy");
ok(csp.includes("default-src 'self'") && csp.includes("object-src 'none'") && csp.includes("frame-ancestors 'self'") && csp.includes("base-uri 'self'"), "CSP presente e restritiva nas origens");
ok(h("x-content-type-options") === "nosniff", "X-Content-Type-Options: nosniff");
ok(["SAMEORIGIN", "DENY"].includes(h("x-frame-options")), `X-Frame-Options (${h("x-frame-options")})`);
ok(!!h("referrer-policy"), "Referrer-Policy definida");
ok(!!h("permissions-policy"), "Permissions-Policy definida");
ok(!h("x-powered-by"), "não revela a versão do servidor (X-Powered-By)");
ok(!r.headers.get("set-cookie"), "nenhum cookie na página inicial");

// 2. Redirecionamentos para HTTPS e para o domínio canónico
for (const u of [`http://${host}/`, `http://www.${host}/`, `https://www.${host}/`]) {
  await pausa();
  const x = await fetch(u, { redirect: "manual" }).catch(() => null);
  ok(x && x.status === 301 && x.headers.get("location")?.startsWith(`https://${host}/`), `${u} → 301 para https://${host}/ (${x?.status ?? "sem resposta"})`);
}

// 3. Certificado TLS
await new Promise((fim) => {
  const s = tls.connect(443, host, { servername: host }, () => {
    const c = s.getPeerCertificate();
    const dias = Math.round((new Date(c.valid_to) - Date.now()) / 864e5);
    ok(s.authorized, `certificado válido (${c.issuer?.O}, expira em ${dias} dias)`);
    ok(["TLSv1.2", "TLSv1.3"].includes(s.getProtocol()), `protocolo ${s.getProtocol()}`);
    s.end();
    fim();
  });
  s.on("error", (e) => { ok(false, `TLS: ${e.message}`); fim(); });
});

// 4. Ficheiros sensíveis e áreas privadas
for (const f of ["/.htaccess", "/.git/config", "/.env", "/package.json", "/README.md", "/atalho/"]) {
  const x = await pedir(BASE + f);
  ok([403, 404].includes(x.status), `${f} bloqueado (${x.status})`);
}
const admin = await pedir(BASE + "/admin/");
ok(/noindex/.test(admin.headers.get("x-robots-tag") || ""), "/admin/ com X-Robots-Tag: noindex");
const naoExiste = await pedir(BASE + "/pagina-que-nao-existe/");
ok(naoExiste.status === 404, `página inexistente responde 404 (${naoExiste.status})`);

// 5. Conteúdo misto e SEO básico
const html = await (await pedir(BASE + "/")).text();
ok(!/(src|href)="http:\/\//.test(html), "sem conteúdo misto (http://)");
ok(html.includes(`<link rel="canonical" href="https://${host}/">`), "canonical no domínio final");
const sitemap = await pedir(BASE + "/sitemap.xml");
ok(sitemap.status === 200 && (await sitemap.text()).includes(`<loc>https://${host}/</loc>`), "sitemap.xml com o domínio final");

console.log(falhas ? `\n${falhas} problema(s)` : "\nTudo em ordem.");
process.exit(falhas ? 1 : 0);
