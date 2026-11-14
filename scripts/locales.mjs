import { mkdir, writeFile } from 'node:fs/promises';
const target = 'https://thetbeck.github.io/ESTUDIO-CINE.BECK/';
const page = (path) => '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=' + target + path + '"><link rel="canonical" href="' + target + path + '"><title>Estudio CINE.BECK</title><a href="' + target + path + '">Estudio CINE.BECK</a></html>';
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', page('pt/'));
for (const lang of ['pt', 'en', 'it']) {
  await mkdir('dist/' + lang + '/reel', { recursive: true });
  await writeFile('dist/' + lang + '/index.html', page(lang + '/'));
  await writeFile('dist/' + lang + '/reel/index.html', page(lang + '/reel/'));
}
await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\n');
await writeFile('dist/.nojekyll', '');
console.log('Redirect to ESTUDIO-CINE.BECK');