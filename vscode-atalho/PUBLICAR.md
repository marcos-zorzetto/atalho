# Publicar a extensão

A extensão sai em duas lojas, e as duas são grátis:

- **Visual Studio Marketplace**: a loja do VS Code;
- **Open VSX**: usada pelo Cursor, VSCodium, Windsurf e Gitpod.

## 1. Testar no seu VS Code (antes de publicar)

```bash
npm run extensao
```

```bash
code --install-extension "C:\Users\marco\Documents\claude\loja-ajax-json\vscode-atalho\atalho-1.0.0.vsix"
```

Use o caminho completo: com o caminho curto, o comando só funciona de dentro da pasta do projeto.

Abra o VS Code e clique no ícone do Atalho na barra lateral. Depois:

1. Clique em **Entrar**.
2. Abra um `.html` e digite `at-`.

Para remover a extensão:

```bash
code --uninstall-extension marcos-zorzetto.atalho
```

## 2. Visual Studio Marketplace (uma vez só)

1. Crie uma conta em <https://marketplace.visualstudio.com/manage>. Ela usa uma conta Microsoft.
2. Clique em **Create publisher**:
   - **ID**: `marcos-zorzetto`, que tem de ser igual ao campo `publisher` do `package.json`;
   - **Name**: `Marcos Zorzetto`.
3. Envie a extensão de um destes jeitos:
   - **Mais simples:** na página do publisher, use **New extension → Visual Studio Code** e envie o arquivo `atalho-1.0.0.vsix`. Não precisa de token.
   - **Pela linha de comando:** crie um token (Personal Access Token) no Azure DevOps com o escopo *Marketplace → Manage* e rode:

     ```bash
     npx @vscode/vsce publish
     ```

     O token é seu: não cole em conversas nem em arquivos do projeto.

## 3. Open VSX

1. Entre em <https://open-vsx.org> com o GitHub e aceite o acordo de publicação. Esse aceite é seu, não posso fazê-lo por você.
2. Em **Settings → Access Tokens**, crie um token.
3. Publique com o token num terminal seu:

   ```bash
   npx ovsx create-namespace marcos-zorzetto -p SEU_TOKEN
   ```

   ```bash
   npx ovsx publish vscode-atalho/atalho-1.0.0.vsix -p SEU_TOKEN
   ```

## 4. Novas versões

1. Mude `version` em `vscode-atalho/package.json`, por exemplo para 1.0.1.
2. Anote a mudança no `CHANGELOG.md`.
3. Rode `npm run extensao`.
4. Envie o novo `.vsix` nas duas lojas.

Os componentes avançados e as animações **não** precisam de nova versão. Eles vêm do banco quando a pessoa entra, então o que for publicado no site aparece na extensão sozinho.

## 5. Domínio próprio

Quando o site mudar para atalhoui.com:

1. Rode com `ATALHO_URL=https://atalhoui.com/ node scripts/gerar-extensao.mjs`.
2. Troque `homepage` no `package.json` e os links do `README.md`.
3. Publique uma nova versão.
