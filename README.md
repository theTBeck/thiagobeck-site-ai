# Thiago Beck — portfólio

Fonte da landing page em português, inglês e italiano. HTML, React e CSS compõem a interface; Python valida o catálogo e gera os currículos em texto.

## Publicação

Cada envio para `main` compila a página e publica o diretório `dist` no GitHub Pages. Em **Settings → Pages**, a origem deve ser **GitHub Actions**. Endereço previsto: https://thetbeck.github.io/thiagobeck-site-ai/.

Os textos estão em `src/content.js` e `src/products.js`. Imagens e filmes destacados na página estão em `public/media`; as versões públicas dos vídeos são cópias de distribuição. Os originais de montagem permanecem fora deste repositório. O reel da abertura conserva 1080p, a sequência e a trilha sonora. Os 30 links do acervo apontam diretamente para os repositórios GitHub Pages existentes `DoPSite-films-1` e `DoPSite-films-2`.

Para atualizar: altere os arquivos, execute `npm ci` e `npm run build`, revise as rotas `/pt/`, `/en/` e `/it/`, depois envie a alteração para `main`. A publicação ocorre automaticamente.
