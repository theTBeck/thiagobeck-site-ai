import { mkdir, writeFile } from 'node:fs/promises';
import { projects, archive, services, steps, toolGroups, featureCredits, ui, text, languages } from '../src/content.js';
await mkdir('.build',{recursive:true});
const localized=Object.fromEntries(languages.map(lang=>[lang,{
  locale:lang, name:'Thiago Beck', role:text(ui.role,lang), bio:text(ui.bio,lang),
  education:text(ui.education,lang), assistant:text(ui.assistant,lang),
  projects:projects.map(p=>({id:p.id,title:p.title,role:text(p.role,lang),technique:text(ui[p.kind],lang),description:text(p.description,lang),status:p.status?text(ui[p.status],lang):null,tools:p.tools||[],image:p.image,video:p.video})),
  services:services.map(s=>({id:s.id,title:text(s.title,lang),description:text(s.description,lang)})),
  tools:toolGroups.flatMap(g=>g.items),featureCredits,
  contact:{whatsapp:'+55 11 99990-2811',email:'thiago.vincentiis@gmail.com',instagram:'https://www.instagram.com/cine.beck/',vimeo:'https://vimeo.com/thiagobeck'},
}])); 
await writeFile('.build/catalog.json',JSON.stringify({languages:localized,archive},null,2));
console.log('Catalog exported: 3 languages, 6 featured projects, '+archive.length+' archive works.');
