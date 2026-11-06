import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { ui,text } from '../src/content.js';
const html=await readFile('dist/index.html','utf8');
for(const lang of ['pt','en','it']){
  const localized=html.replace('lang="pt-BR"','lang="'+(lang==='pt'?'pt-BR':lang)+'"').replace(/<title>.*?<\/title>/,'<title>Thiago Beck — '+text(ui.role,lang)+'</title>').replace(/(<meta name="description" content=")[^"]*/,'$1'+text(ui.heroBody,lang)+' '+text(ui.role,lang)+'.');
  await mkdir('dist/'+lang,{recursive:true});
  await writeFile('dist/'+lang+'/index.html',localized);
  await mkdir('dist/'+lang+'/reel',{recursive:true});
  await writeFile('dist/'+lang+'/reel/index.html',localized.replace(/<title>.*?<\/title>/,'<title>Thiago Beck — Reel</title>'));
}
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://thetbeck.github.io/thiagobeck-site-ai/sitemap.xml\n');
await writeFile('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['pt','en','it'].map(lang=>'<url><loc>https://thetbeck.github.io/thiagobeck-site-ai/'+lang+'/</loc></url>').join('')+'</urlset>');
await writeFile('dist/.nojekyll','');
await writeFile('dist/index.html','<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=pt/"><title>Thiago Beck</title><a href="pt/">Português</a></html>');
console.log('Built /pt/, /en/ and /it/ for GitHub Pages.');
