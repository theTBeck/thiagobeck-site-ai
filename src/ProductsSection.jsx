import React, { useState } from 'react';
import { text, projects, ui } from './content';
import { products, productGroups, productUI } from './products';
import HoverClip from './HoverClip';
import { sitePath } from './paths';
import './products.css';

const Arrow = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5"/></svg>;

export default function ProductsSection({lang,groupId,onGroupChange,onExplore}) {
  const [openProduct,setOpenProduct]=useState(null);
  const group=productGroups.find(item=>item.id===groupId)||productGroups[0];
  const items=products.filter(item=>item.group===group.id);
  const illustration=projects.find(item=>item.id===(group.projectId||group.image));
  const tx=key=>text(productUI[key],lang);
  return <section id="products" className="products-section section-shell" aria-labelledby="products-title">
    <div className="products-heading">
      <div><p className="eyebrow">{tx('kicker')}</p><h2 id="products-title">{tx('title')}</h2></div>
      <p>{tx('intro')}</p>
    </div>
    <div className="product-filters" role="group" aria-label={tx('choose')}>
      {productGroups.map(item=><button key={item.id} aria-pressed={group.id===item.id} aria-controls="product-catalog" onClick={()=>{onGroupChange(item.id);setOpenProduct(null);}}>
        <span>{text(item.title,lang)}</span><small>{products.filter(p=>p.group===item.id).length}</small>
      </button>)}
    </div>
    <div id="product-catalog" className="product-catalog" aria-labelledby="product-group-title">
      <div className="product-story">
        <div>
          {group.pilot&&<span className="product-pilot">{tx('pilot')}</span>}
          <h3 id="product-group-title">{text(group.headline,lang)}</h3>
        </div>
        <p>{text(group.body,lang)}</p>
      </div>
      <figure className="product-visual">
        <div className="product-visual-media has-hover-clip" data-group={group.id}>
          <img src={sitePath('media/'+group.image+'.jpg')} alt="" width="1440" height="810" loading="lazy"/>
          <HoverClip key={group.id} src={sitePath('media/loops/'+(group.preview||group.id)+'.mp4')} poster={sitePath('media/'+group.image+'.jpg')}/>
        </div>
        <figcaption className="product-photo-credit">{tx('portfolio')} · {group.credit}{illustration&&<> · {text(ui[illustration.kind],lang)}</>}</figcaption>
      </figure>
      <div className="product-list">
        {items.map(item=>{
          const expanded=openProduct===item.id;
          const contact='https://wa.me/5511999902811?text='+encodeURIComponent(tx('message')+text(item.title,lang)+'.');
          return <article key={item.id} className={'product-entry '+(expanded?'expanded':'')}>
            <h4><button id={'product-button-'+item.id} aria-expanded={expanded} aria-controls={'product-detail-'+item.id} onClick={()=>setOpenProduct(expanded?null:item.id)}><span>{text(item.title,lang)}</span><span className="product-expand" aria-hidden="true">{expanded?'−':'+'}</span></button></h4>
            <div id={'product-detail-'+item.id} hidden={!expanded} aria-labelledby={'product-button-'+item.id}>
              <p>{text(item.description,lang)}</p>
              <dl><dt>{tx('delivery')}</dt><dd>{text(item.delivery,lang)}</dd></dl>
              <a className="product-contact" href={contact} target="_blank" rel="noreferrer">{tx(group.pilot?'pilotCta':'cta')}<Arrow/></a>
            </div>
          </article>;
        })}
      </div>
    </div>
    <div className="products-footer"><p>{tx('foot')}</p><a href="#work" onClick={event=>{event.preventDefault();onExplore();}}>{tx('explore')}<Arrow/></a></div>
  </section>;
}

