import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { products, productGroups, productUI } from '../src/products.js';
const folder = new URL('../../01_planejamento/produtos/',import.meta.url);
const sources = JSON.parse(await readFile(new URL('fontes.json',folder),'utf8'));
const sourceMap = new Map(sources.map(source=>[source.id,source]));
const ids = new Set();
for (const item of products) {
  if (ids.has(item.id)) throw new Error('Duplicate product: '+item.id);
  ids.add(item.id);
  if (!productGroups.some(group=>group.id===item.group)) throw new Error('Unknown group: '+item.id);
  for (const key of ['title','description','delivery']) for (const lang of ['pt','en','it']) {
    if (!item[key]?.[lang]?.trim()) throw new Error('Missing translation: '+item.id+'/'+key+'/'+lang);
  }
  for (const source of item.sources) if (!sourceMap.has(source)) throw new Error('Unknown source: '+source);
}
for (const item of productGroups) for (const key of ['title','headline','body']) for (const lang of ['pt','en','it']) {
  if (!item[key]?.[lang]?.trim()) throw new Error('Missing category translation');
}
for (const item of Object.values(productUI)) for (const lang of ['pt','en','it']) if(!item[lang])throw new Error('Missing UI translation');
const lines=['# Catálogo de produtos para revisão','', '31/10/2026 — '+products.length+' produtos em '+productGroups.length+' áreas. As entregas são propostas comerciais, não novos créditos do portfólio.',''];
for(const group of productGroups){
  lines.push('## '+group.title.pt,'',group.body.pt,'');
  if(group.pilot)lines.push('**Desenvolvimento sob consulta. Entrega inicial: prova de conceito.**','');
  for(const item of products.filter(item=>item.group===group.id)){
    lines.push('### '+item.title.pt,'',item.description.pt,'','**Entrega proposta:** '+item.delivery.pt,'','Base técnica: '+item.sources.map(id=>{const source=sourceMap.get(id);return '['+source.title+']('+source.url+')';}).join('; ')+'.','');
  }
}
lines.push('## Fontes e notas de verificação','');
for(const source of sources)lines.push('- **'+source.id+'** — ['+source.title+']('+source.url+'). '+source.note);
await mkdir(fileURLToPath(folder),{recursive:true});
await writeFile(new URL('CATALOGO_PARA_REVISAO.md',folder),lines.join('\n')+'\n');
console.log('Validated '+products.length+' products, '+productGroups.length+' categories, 3 complete locales and '+sources.length+' source references.');
