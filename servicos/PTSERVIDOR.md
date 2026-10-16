# Alojamento na PTServidor (cPanel)

Preparado em 16 de outubro de 2026. O site do Atalho sai do GitHub Pages para o plano
**PTSStart** da PTServidor, com domínio próprio e cabeçalhos
de segurança. O GitHub Pages fica só a redirecionar para o endereço novo.

## O que o plano permite (visto no cPanel)

| Recurso | Uso | Limite |
|---|---|---|
| Domínios adicionais (addon) | 0 | **3** |
| Subdomínios | 0 | ilimitados |
| Disco | 2 MB | 60 GB |
| Bases de dados | 0 | ilimitadas |

O site do Atalho ocupa cerca de 3 MB (zip) e é estático: o "servidor" das contas e do Pro
continua a ser o Supabase. O `.htaccess` gerado traz HTTPS, HSTS, CSP, `nosniff`,
`X-Frame-Options`, cache e a página 404.

## Endereço (decidido a 16/10/2026)

O Atalho tem domínio próprio: **atalho.com.pt**, registado na PTServidor (18 €/ano, renovação
automática, válido até 16/10/2027) e alojado como domínio adicional, com pasta própria
(`~/atalho.com.pt`). O atalho.pt e o atalho.com pertencem a outra empresa.

## Passo a passo (feito a 16/10/2026; serve para refazer noutro alojamento)


1. **Comprar o domínio** atalho.com.pt (área de cliente PTServidor → Domínios → Registar).
   Se for registado na PTServidor, os servidores de nomes já apontam para o alojamento.
2. **cPanel → Domains → Create A New Domain**: `atalho.com.pt`, desmarcar "Share document
   root", pasta `atalho.com.pt` (fica `~/atalho.com.pt`, separada do `public_html`).
3. **cPanel → SSL/TLS Status → Run AutoSSL** para o certificado de atalho.com.pt e www.
4. **Gerar e enviar o site** (no computador):
   ```bash
   node scripts/empacotar-ptservidor.mjs https://atalho.com.pt/
   ```
   No File Manager, abra a pasta `atalho.com.pt`, **Upload** do `atalho-site.zip` (marque
   *Overwrite*) e **Extract**. Depois apague o zip da pasta.
5. **Testar sem a cache**: abra `https://atalho.com.pt/?x=1` (há um nginx com cache à frente
   do Apache; não peça a raiz antes de publicar, ou fica guardada a versão vazia ~20 min).
6. **Supabase → Authentication → URL Configuration**: *Site URL* `https://atalho.com.pt/` e
   acrescente `https://atalho.com.pt/**` aos *Redirect URLs* (para os e-mails de confirmação e
   de recuperação de palavra-passe voltarem ao sítio certo).
7. **Lemon Squeezy** (quando ativar): o *Button link* da confirmação passa a
   `https://atalho.com.pt/conta/?pagamento=ok`.
8. **GitHub → Settings → Secrets and variables → Actions → Variables**:
   `ATALHO_URL` = `https://atalho.com.pt/`, `ATALHO_HOSPEDAGEM` = `ptservidor`.
   O endereço antigo (`marcos-zorzetto.github.io/atalho/`) passa a redirecionar.
9. **Textos do projeto** com o endereço novo: `node scripts/migrar-dominio.mjs https://atalho.com.pt/`.
10. **Google Search Console**: adicionar a propriedade atalho.com.pt e enviar o
    `https://atalho.com.pt/sitemap.xml`.


## Publicação automática (opcional)

Com estes segredos no GitHub (*Secrets*), cada push na `main` envia o site por FTPS:

| Nome | Valor |
|---|---|
| `FTP_SERVIDOR` | `voyager.servidorpt.pt` |
| `FTP_UTILIZADOR` | uma conta FTP criada no cPanel **só para a pasta do Atalho** (FTP Accounts → diretório `atalho.com.pt`) |
| `FTP_PALAVRA_PASSE` | a palavra-passe dessa conta |

E a variável `FTP_PASTA` = `/` (a conta FTP já começa na pasta do domínio). Sem os segredos,
o passo é saltado e publica-se à mão com o zip.

## Testar os cabeçalhos depois de publicar

```bash
curl -sI "https://atalho.com.pt/?x=1"
```

Devem aparecer `strict-transport-security`, `content-security-policy`,
`x-content-type-options: nosniff`, `x-frame-options` e `referrer-policy`. `http://` e `www.`
devem responder 301 para `https://atalho.com.pt/`.

## Publicação automática sem palavras-passe (em uso desde 16/10/2026)

1. A cada push na `main`, o workflow **Publicar site** gera o site e guarda-o no ramo
   `ptservidor-site` (só o `dist/`, já com o `.htaccess`).
2. No cPanel, a tarefa **Cron Jobs** corre `~/publicar-atalho.sh` (cópia de
   `servicos/ptservidor/publicar-atalho.sh`) de 10 em 10 minutos: se o ramo tiver uma versão
   nova, copia-a para `~/atalho.com.pt`. O registo fica em `~/publicar-atalho.log`.
3. Depois de uma publicação, a cache do nginx pode mostrar a versão anterior uns minutos
   (cPanel → página inicial → NGINX Caching → *Clear Cache* resolve na hora).
