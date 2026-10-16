#!/bin/bash
# Publicação automática do Atalho na PTServidor (corre por cron no cPanel, de 10 em 10 minutos).
# Vai buscar o ramo ptservidor-site (gerado pelo GitHub Actions) e, se houver versão nova,
# copia-a para a pasta do domínio. Repositório público: não precisa de palavras-passe.
set -euo pipefail
REPO="https://github.com/marcos-zorzetto/atalho.git"
RAMO="ptservidor-site"
CLONE="$HOME/atalho-deploy"
DESTINO="$HOME/atalho.com.pt"
MARCA="$HOME/.atalho-publicado"

if [ ! -d "$CLONE/.git" ]; then
  git clone -q --depth 1 -b "$RAMO" "$REPO" "$CLONE"
fi
cd "$CLONE"
git fetch -q --depth 1 origin "$RAMO"
NOVA=$(git rev-parse FETCH_HEAD)
[ -f "$MARCA" ] && [ "$(cat "$MARCA")" = "$NOVA" ] && exit 0

git reset -q --hard FETCH_HEAD
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude=.git --exclude=.well-known ./ "$DESTINO/"
else
  find "$DESTINO" -mindepth 1 -maxdepth 1 ! -name .well-known -exec rm -rf {} +
  tar --exclude=.git -cf - . | (cd "$DESTINO" && tar -xf -)
fi
echo "$NOVA" > "$MARCA"
echo "$(date '+%F %T') publicado $NOVA"
