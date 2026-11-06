import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import { ui, text, projects as sourceProjects, cupNoodlesProject as sourceCupNoodlesProject, services, steps, toolGroups, featureCredits, archive, archiveGroups, languages, languageNames } from './content';
import { sitePath, localePath } from './paths';
import ProductsSection from './ProductsSection';
import HoverClip from './HoverClip';
import HeroTypography from './HeroTypography';
import ReelPage from './ReelPage';
import { productGroups, productUI } from './products';
import './style.css';
import './hero.css';

const Arrow = ({diagonal=false,...props}) => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d={diagonal?'M5 19 19 5M5 5h14v14':'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5"/></svg>;
const Play = props => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="m9 5 11 7-11 7V5Z" fill="currentColor"/></svg>;
const Sound = ({muted}) => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 4 6 8H3v8h3l5 4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>{muted?<path d="m16 9 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>:<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}</svg>;
const Close = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.4"/></svg>;
const typeLabel = { ai:'ai', filmed:'filmed', hybrid:'hybridFilm' };
const hostedProject = project => ({...project,image:sitePath(project.image),video:sitePath(project.video)});
const projects = sourceProjects.map(hostedProject);
const cupNoodlesProject = hostedProject(sourceCupNoodlesProject);
const allProjects = [...projects,cupNoodlesProject];
const clipByProject = {'sonic-telecine':'sonic-telecine','sony-bravia':'sony-bravia',granola:'food','amazon-rally':'amazon-rally-agua','steve-spiegel':'characters','ram-monster':'worlds-performance','cup-noodles':'concept',jetour:'jetour'};
const clipFor=id=>sitePath('media/loops/'+clipByProject[id]+'.mp4');
const startLocale=()=>languages.find(lang=>location.pathname.split('/').includes(lang))||'pt';
const whatsapp = lang => 'https://wa.me/5511999902811?text='+encodeURIComponent(text(ui.whatsappMessage,lang));

function FilmDialog({project,lang,onClose,onNext}) {
  const dialog=useRef(null);
  const [failed,setFailed]=useState(false);
  const tx=key=>text(ui[key],lang);
  useEffect(()=>{
    const trigger=document.activeElement;
    dialog.current.showModal();
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=previous; if(trigger?.isConnected) trigger.focus();};
  },[]);
  useEffect(()=>setFailed(false),[project.id,project.url]);
  const source=project.video||project.url;
  return <dialog ref={dialog} className="film-dialog" aria-labelledby="film-title" onCancel={onClose} onClick={e=>{if(e.target===dialog.current)onClose();}}>
    <div className="dialog-inner">
      <div className="dialog-top"><span className="eyebrow">{tx('filmLabel')}</span><button className="icon-button" onClick={onClose} aria-label={tx('close')} autoFocus><Close/></button></div>
      <div className="dialog-player">
        <video key={source} controls playsInline preload="metadata" poster={project.image} src={source} onError={()=>setFailed(true)} />
        {failed&&<p className="video-error">{tx('playbackError')} <a href={source} target="_blank" rel="noreferrer">{tx('sourceLink')} ↗</a></p>}
      </div>
      <div className="dialog-details">
        <div><p className="eyebrow">{project.category?text(project.category,lang):text(archiveGroups[project.group],lang)}</p><h2 id="film-title">{project.title}</h2>{project.status&&<span className="status-note">{tx(project.status)}</span>}</div>
        <div className="dialog-copy"><p>{project.description?text(project.description,lang):tx('archiveCredit')}</p>
          {project.role&&<dl><dt>{tx('roleLabel')}</dt><dd>{text(project.role,lang)}</dd><dt>{tx('productionProcess')}</dt><dd>{tx(typeLabel[project.kind])}</dd>{project.tools&&<><dt>{tx('tools')}</dt><dd>{project.tools.join(' · ')}</dd></>}</dl>}
          {project.id==='ram-monster'&&<p className="fineprint">{tx('brandNote')}</p>}
        </div>
      </div>
      {onNext&&<button className="text-button next-film" onClick={onNext}>{tx('nextProject')}<Arrow/></button>}
    </div>
  </dialog>;
}

function App(){
  const [lang,setLang]=useState(startLocale);
  const [menu,setMenu]=useState(false);
  const [filter,setFilter]=useState('all');
  const [selected,setSelected]=useState(()=>allProjects.find(p=>p.id===new URLSearchParams(location.search).get('project'))||null);
  const [archiveOpen,setArchiveOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [archiveFilter,setArchiveFilter]=useState('all');
  const [playing,setPlaying]=useState(false);
  const [heroMuted,setHeroMuted]=useState(false);
  const [onHero,setOnHero]=useState(true);
  const [reduceMotion,setReduceMotion]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [activeService,setActiveService]=useState('advertising');
  const [activeProcess,setActiveProcess]=useState(null);
  const [productGroup,setProductGroup]=useState('campaigns');
  const hero=useRef(null);
  const heroSection=useRef(null);
  const heroEntrancePlayed=useRef(false);
  const menuTrigger=useRef(null);
  const mega=useRef(null);
  const tx=key=>text(ui[key],lang);
  const filtered=projects.filter(p=>filter==='all'||p.kind===filter);
  const foundArchive=archive.filter(p=>(archiveFilter==='all'||p.group===archiveFilter)&&p.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()));
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduceMotion(media.matches);
    media.addEventListener('change',update);
    const back=()=>{setLang(startLocale());setSelected(allProjects.find(p=>p.id===new URLSearchParams(location.search).get('project'))||null);};
    window.addEventListener('popstate',back);
    return ()=>{media.removeEventListener('change',update);window.removeEventListener('popstate',back);};
  },[]);
  useEffect(()=>{
    document.documentElement.lang=lang==='pt'?'pt-BR':lang;
    document.title='Thiago Beck — '+text(ui.role,lang);
    document.querySelector('meta[name="description"]').setAttribute('content',text(ui.heroBody,lang)+' '+text(ui.role,lang)+'.');
  },[lang]);
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>setOnHero(entry.isIntersecting),{rootMargin:'-86px 0px 0px 0px'});
    if(heroSection.current)observer.observe(heroSection.current);
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const video=hero.current;
    let disposed=false;
    let resumeOnReturn=false;
    // Start with the original soundtrack; browser policy may require muted playback.
    const playWithFallback=()=>video.play().catch(async error=>{
      if(disposed||error.name!=='NotAllowedError')return;
      video.muted=true;
      setHeroMuted(true);
      try{await video.play();}catch{if(!disposed)setPlaying(false);}
    });
    playWithFallback();
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){
        if(resumeOnReturn){resumeOnReturn=false;playWithFallback();}
      }else if(!video.paused){
        resumeOnReturn=true;
        video.pause();
      }
    },{threshold:.05});
    observer.observe(video);
    return ()=>{disposed=true;observer.disconnect();video.pause();};
  },[]);
  useEffect(()=>{if(selected)hero.current?.pause();},[selected]);
  useEffect(()=>{
    if(!menu)return;
    const handler=e=>{
      if(e.key==='Escape'){setMenu(false);menuTrigger.current.focus();}
      if(e.key==='Tab'){
        const controls=[menuTrigger.current,...mega.current.querySelectorAll('a,button')].filter(x=>!x.disabled);
        const first=controls[0],last=controls.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',handler);
    return ()=>document.removeEventListener('keydown',handler);
  },[menu]);
  function changeLanguage(next){
    setLang(next);history.pushState({},'',localePath(next)+location.search+location.hash);
  }
  function toggleHeroSound(){
    const video=hero.current;
    video.muted=!video.muted;
    setHeroMuted(video.muted);
    if(!video.muted&&video.paused)video.play().catch(()=>setPlaying(false));
  }
  function navigate(id,kind){
    setMenu(false);
    if(kind)setFilter(kind);
    if(services.some(s=>s.id===id)){
      setActiveService(id);
      id=({food:'food-feature',packshots:'packshot-feature',entertainment:'entertainment-feature'})[id]||id;
    }
    history.replaceState({},'',location.pathname+location.search+'#'+id);
    requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'}));
  }
  function openProject(project){
    setSelected(project);
    const search=new URLSearchParams(location.search);
    search.set('project',project.id||project.title);
    history.replaceState({},'',location.pathname+'?'+search+location.hash);
  }
  function closeProject(){
    setSelected(null);
    const search=new URLSearchParams(location.search);search.delete('project');
    history.replaceState({},'',location.pathname+(search.size?'?'+search:'')+location.hash);
  }
  const navLink=(id,label,extra='')=><a href={'#'+id} className={extra} onClick={e=>{e.preventDefault();navigate(id);}}>{label}</a>;
  return <>
    <a className="skip-link" href="#main">{tx('skip')}</a>
    <header className={'site-header '+(menu?'menu-open ':'')+(onHero?'over-hero':'')}>
      <a href={localePath(lang)} className="brand" aria-label="Thiago Beck"><span className="monogram">TB<span>.</span></span><span className="brand-name">THIAGO<br/>BECK</span></a>
      <nav className="desktop-links" aria-label={tx('menu')}>{navLink('work',tx('work'))}{navLink('products',text(productUI.title,lang))}{navLink('about',tx('about'))}{navLink('contact',tx('contact'))}</nav>
      <div className="header-tools"><div className="language-switch" aria-label={tx('language')}>{languages.map(code=><button key={code} lang={code} aria-label={languageNames[code]} aria-pressed={lang===code} onClick={()=>changeLanguage(code)}>{code==='pt'?'PT':code.toUpperCase()}</button>)}</div>
      <button ref={menuTrigger} className={'menu-toggle '+(menu?'is-open':'')} aria-label={menu?tx('close'):tx('menu')} aria-expanded={menu} aria-controls="mega-menu" onClick={()=>setMenu(v=>!v)}><span className="menu-label">{menu?tx('close'):tx('menuLabel')}</span><span className="menu-glyph" aria-hidden="true"><i/><i/></span></button></div>
    </header>
    {menu&&<>
      <button className="menu-backdrop" aria-label={tx('close')} tabIndex={-1} onClick={()=>setMenu(false)}/>
      <nav id="mega-menu" ref={mega} className="mega-menu" aria-label={tx('menu')}>
        <div className="mega-primary"><p className="eyebrow">{tx('work')}</p>{['all','ai','filmed','hybrid'].map(kind=><a key={kind} href="#work" onClick={e=>{e.preventDefault();navigate('work',kind);}}>{tx(kind)}<Arrow/></a>)}<a href="#archive" onClick={e=>{e.preventDefault();setArchiveOpen(true);navigate('archive');}}>{tx('archiveOpen')}<Arrow/></a></div>
        <div className="mega-services"><p className="eyebrow">{text(productUI.title,lang)}</p><div>{productGroups.map(group=><a key={group.id} href="#products" onClick={e=>{e.preventDefault();setProductGroup(group.id);navigate('products');}}>{text(group.title,lang)}</a>)}</div></div>
        <div className="mega-extra">{navLink('expertise',tx('services'))}{navLink('about',tx('about'))}{navLink('process',tx('process'))}{navLink('beyond',tx('beyond'))}{navLink('contact',tx('contact'))}<a href={whatsapp(lang)} target="_blank" rel="noreferrer">WhatsApp <Arrow diagonal/></a></div>
      </nav>
    </>}
    <main id="main">
      <section ref={heroSection} className="hero" aria-labelledby="hero-title">
        <video ref={hero} className="hero-video" src={sitePath('media/hero-reel-novo-v1.mp4')} poster={sitePath('media/hero-reel-novo-v1.jpg')} muted={heroMuted} loop playsInline autoPlay preload="auto" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onVolumeChange={event=>setHeroMuted(event.currentTarget.muted)} aria-hidden="true"/>
        <div className="hero-shade"/>
        <HeroTypography key={lang} playedRef={heroEntrancePlayed} labels={{label:tx('heroLabel'),countries:tx('countries'),role:tx('heroRole'),heading:tx('heroHeading'),body:tx('heroBody'),watch:tx('watch')}} reelHref={localePath(lang,'reel/')} playIcon={<Play/>} arrowIcon={<Arrow diagonal/>}/>
        <div className="hero-bottom"><a href="#work" onClick={e=>{e.preventDefault();navigate('work');}}><span className="down-arrow">↓</span>{tx('work')}</a><div className="hero-controls"><button className="hero-sound-toggle" onClick={toggleHeroSound} aria-label={tx(heroMuted?'enableSound':'disableSound')} aria-pressed={!heroMuted}><Sound muted={heroMuted}/><span>{tx(heroMuted?'enableSound':'disableSound')}</span></button><button className="pause-button" onClick={()=>{if(playing)hero.current.pause();else hero.current.play().catch(()=>setPlaying(false));}} aria-label={tx(playing?'pause':'play')}>{playing?<span className="pause-bars">Ⅱ</span>:<Play/>}</button></div></div>
      </section>
      <section id="work" className="work-section section-shell">
        <div className="section-heading"><div><p className="eyebrow">{tx('selectedLabel')}</p><h2>{tx('selected')}</h2></div><p>{tx('selectedBody')}</p></div>
        <div className={'project-grid '+(filter!=='all'?'is-filtered':'')}>{filtered.map((project,index)=><button key={project.id} className={'project-card project-'+project.id} onClick={()=>openProject(project)} aria-label={tx('viewProject')+': '+project.title}>
          <div className="project-image has-hover-clip"><img src={project.image} alt={project.title} loading={index<2?'eager':'lazy'} width="1440" height="810"/><HoverClip src={clipFor(project.id)} poster={project.image}/><span className="project-play"><Play/></span>{project.status==='inDevelopment'&&<span className="project-status">{tx('inDevelopment')}</span>}</div>
          <div className="project-caption"><div><span className="project-process">{project.kind==='ai'?'A.I':tx(typeLabel[project.kind])}</span><h3>{project.title}</h3><p>{text(project.role,lang)}</p></div><Arrow diagonal/></div>
        </button>)}</div>
      </section>
      <ProductsSection lang={lang} groupId={productGroup} onGroupChange={setProductGroup} onExplore={()=>navigate('work')}/>
      <section id="reels" className="reels-section section-shell">
        <div className="section-heading"><h2 className="display-title">{tx('reelsTitle')}</h2><p>{tx('reelsIntro')}</p></div>
        <div className="reel-lanes">{[['ai','jetour-driver','aiReel','jetour-driver'],['filmed','sony-bravia-model','filmedReel','sony-bravia-model'],['hybrid','cup-noodles','hybridReel','concept']].map(([kind,id,body,clip])=>{
          const opened=activeProcess===kind;
          const title=kind==='filmed'?tx('filmedReelTitle'):tx(kind);
          return <article key={kind} className={'reel-lane reel-lane-'+kind+(opened?' is-open':'')} onMouseEnter={()=>setActiveProcess(kind)} onMouseLeave={()=>setActiveProcess(null)} onFocus={()=>setActiveProcess(kind)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setActiveProcess(null)}}>
            <div className="reel-lane-media has-hover-clip"><img src={sitePath('media/'+id+'.jpg')} alt="" loading="lazy"/><HoverClip src={sitePath('media/loops/'+clip+'.mp4')} poster={sitePath('media/'+id+'.jpg')}/>
            <button className="reel-lane-trigger" aria-expanded={opened} aria-controls={'process-panel-'+kind} aria-label={tx('processReveal')+': '+title} onClick={()=>setActiveProcess(window.matchMedia('(hover: hover)').matches?kind:opened?null:kind)}><span className="reel-lane-front"><span className="eyebrow">{tx('processReveal')} +</span><span className="reel-lane-title" role="heading" aria-level="3">{title}</span></span></button></div>
            <div id={'process-panel-'+kind} className="reel-lane-panel" aria-hidden={!opened}><span className="eyebrow">{tx('processLabel')}</span><strong>{title}</strong><p>{tx(body)}</p></div>
          </article>;
        })}</div>
      </section>
      <section id="food-feature" className="food-feature">
        <div className="food-image has-hover-clip"><img src={sitePath('media/granola.jpg')} alt="" loading="lazy"/><HoverClip src={sitePath('media/loops/food.mp4')} poster={sitePath('media/granola.jpg')}/></div>
        <div className="food-copy"><p className="eyebrow">{tx('foodEyebrow')}</p><h2 className="display-title">{tx('foodTitle')}</h2><p>{tx('foodBody')}</p></div>
      </section>
      <section id="packshot-feature" className="packshot-section section-shell">
        <div className="packshot-copy"><p className="eyebrow">{tx('packLabel')}</p><h2>{tx('packTitle')}</h2><p>{tx('packBody')}</p><span className="eyebrow pack-items">{tx('packItems')}</span><a className="text-button" href={whatsapp(lang)} target="_blank" rel="noreferrer">{tx('projectCta')}<Arrow diagonal/></a></div>
        <div className="packshot-visual has-hover-clip"><img src={sitePath('media/cup-noodles.jpg')} alt="" loading="lazy"/><HoverClip src={sitePath('media/loops/concept.mp4')} poster={sitePath('media/cup-noodles.jpg')}/></div>
      </section>
      <section id="entertainment-feature" className="entertainment-feature has-hover-clip">
        <img src={sitePath('media/steve-spiegel.jpg')} alt="" loading="lazy"/><HoverClip src={sitePath('media/loops/characters.mp4')} poster={sitePath('media/steve-spiegel.jpg')}/><div className="entertainment-shade"/><div className="entertainment-copy"><p className="eyebrow">{tx('entertainment')}</p><h2 className="display-title">{tx('entertainmentTitle')}</h2><p>{tx('entertainmentBody')}</p><div className="entertainment-films">{[['Steve Spiegel','steve-spiegel.mp4'],['A História de Davi Santos','historia-davi.mp4'],['Nike Football','nike-football.mp4'],['Epson Canudos','epson-canudos.mp4']].map(([title,file])=><a key={file} className="text-button light" href={sitePath('media/'+file)} target="_blank" rel="noreferrer">{title}<Arrow diagonal/></a>)}</div></div>
      </section>
      <section id="expertise" className="expertise-section section-shell">
        <div className="section-heading"><div><p className="eyebrow">{tx('services')}</p><h2>{tx('fieldTitle')}</h2></div><p>{tx('fieldBody')}</p></div>
        <div className="services-layout">
          <div className="service-list">{services.map(s=><div id={s.id} className={'service-row '+(activeService===s.id?'active':'')} key={s.id}>
            <button aria-expanded={activeService===s.id} aria-controls={'service-content-'+s.id} onClick={()=>setActiveService(activeService===s.id?null:s.id)}>{text(s.title,lang)}<span>{activeService===s.id?'−':'+'}</span></button>
            <div id={'service-content-'+s.id} hidden={activeService!==s.id}><p>{text(s.description,lang)}</p><a href={whatsapp(lang)} target="_blank" rel="noreferrer">{tx('projectCta')} ↗</a></div>
          </div>)}</div>
          <div className="service-photo has-hover-clip"><img src={sitePath('media/expertise-universos.jpg')} alt="" loading="lazy"/><HoverClip src={sitePath('media/loops/expertise-universos.mp4')} poster={sitePath('media/expertise-universos.jpg')}/><span className="vertical-note">THIAGO BECK / IMAGEM · IMAGE · IMMAGINE</span></div>
        </div>
      </section>
      <section id="archive" className="archive-section section-shell"><div className="archive-heading"><div><p className="eyebrow">{tx('archiveLabel')}</p><h2>{tx('archive')}</h2><p>{tx('archiveBody')}</p></div><button className="round-arrow" aria-label={tx('archiveOpen')} aria-expanded={archiveOpen} aria-controls="archive-panel" onClick={()=>setArchiveOpen(v=>!v)}>{archiveOpen?<Close/>:<Arrow diagonal/>}</button></div>
        <div id="archive-panel" hidden={!archiveOpen}><div className="archive-controls"><label className="search-field"><span>{tx('search')}</span><input type="search" placeholder={tx('search')} value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="archive-filters">{['all',...Object.keys(archiveGroups)].map(group=><button key={group} aria-pressed={archiveFilter===group} onClick={()=>setArchiveFilter(group)}>{group==='all'?tx('all'):text(archiveGroups[group],lang)}</button>)}</div></div>
          <p className="fineprint">{tx('archiveNotice')}</p><div className="archive-list">{foundArchive.map(p=><button key={p.title} onClick={()=>openProject(allProjects.find(x=>x.id===p.projectId)||p)}><span>{p.title}</span><small>{text(archiveGroups[p.group],lang)}</small><Arrow diagonal/></button>)}</div>{!foundArchive.length&&<p className="empty-search" role="status">{tx('noResults')}</p>}
        </div></section>
      <section id="about" className="about-section section-shell"><p className="eyebrow">{tx('aboutKicker')}</p><div className="about-grid"><h2 className="display-title">{tx('aboutTitle')}</h2><div className="about-copy"><p className="large-copy">{tx('bio')}</p><p className="vision-copy">{tx('vision')}</p><p>{tx('education')}</p><div className="career-stats"><div><strong>2003</strong><span>{tx('since')}</span></div></div></div></div>
        <div className="feature-credits"><div><p className="eyebrow">{tx('creditsTitle')}</p><h3>{tx('assistant')}</h3><p>{tx('creditsNote')}</p></div><ul>{featureCredits.map(film=><li key={film}>{film}<span>{tx('assistant')}</span></li>)}</ul></div>
      </section>
      <section id="process" className="process-section section-shell"><div className="section-heading"><h2 className="display-title">{tx('processTitle')}</h2><p>{tx('processBody')}</p></div><div className="process-steps">{steps.map((step,index)=><div key={index}><span className="step-number">{String(index+1).padStart(2,'0')}</span><h3>{text(step.title,lang)}</h3><p>{text(step.body,lang)}</p></div>)}</div><div className="toolbox"><div><h3>{tx('toolTitle')}</h3><p>{tx('toolBody')}</p></div><div>{toolGroups.map(group=><div className="tool-group" key={group.title.pt}><span className="eyebrow">{text(group.title,lang)}</span><p>{group.items.map(item=><span key={item}>{item}</span>)}</p></div>)}</div></div></section>
      <section id="beyond" className="beyond-section section-shell"><div className="section-heading"><div><p className="eyebrow">{tx('beyond')}</p><h2>{tx('beyondTitle')}</h2></div></div><div className="beyond-grid"><a className="book-card" href="https://thetbeck.github.io/O-ECLIPSE-DO-RIO-ARAGUAIA/" target="_blank" rel="noreferrer"><div className="book-art preview-journey"><img src={sitePath('media/book-lp-hero.png')} alt="Página inicial do livro O Eclipse do Rio Araguaia" loading="lazy"/><img src={sitePath('media/book-lp-joao.png')} alt="" loading="lazy"/><img src={sitePath('media/book-lp-pai.png')} alt="" loading="lazy"/></div><div className="beyond-copy"><span className="eyebrow">{tx('bookType')}</span><h3>O Eclipse do Rio Araguaia</h3><p>{tx('bookBody')}</p><span className="text-button">{tx('bookCta')}<Arrow diagonal/></span></div></a><a className="website-card" href="https://thetbeck.github.io/DoPSite_Reel/" target="_blank" rel="noreferrer"><div className="website-art preview-journey"><img src={sitePath('media/cine-beck-hero.png')} alt="Página inicial do CINE BECK" loading="lazy"/><img src={sitePath('media/cine-beck-documentarios.png')} alt="" loading="lazy"/><img src={sitePath('media/cine-beck-documentarios.png')} alt="" loading="lazy"/></div><div className="beyond-copy"><span className="eyebrow">{tx('siteType')}</span><h3>CINE BECK</h3><p>{tx('siteBody')}</p><span className="text-button">{tx('siteCta')}<Arrow diagonal/></span></div></a><a className="instagram-card" href="https://www.instagram.com/cine.beck/" target="_blank" rel="noreferrer"><div className="instagram-art"><img src={sitePath('media/sonic-telecine-hd.jpg')} alt="" loading="lazy"/><img src={sitePath('media/sony-bravia-rosas-upscale.jpg')} alt="" loading="lazy"/><img src={sitePath('media/amazon-rally-indigena.jpg')} alt="" loading="lazy"/><span>@CINE.BECK</span></div><div className="beyond-copy"><span className="eyebrow">{tx('instagramType')}</span><h3>@cine.beck</h3><p>{tx('instagramBody')}</p><span className="text-button">Instagram <Arrow diagonal/></span></div></a></div></section>
      <section id="contact" className="contact-section section-shell"><p className="eyebrow">{tx('contactEyebrow')}</p><div className="contact-main"><h2 className="display-title">{tx('contactTitle')}</h2><a className="contact-arrow" href={whatsapp(lang)} target="_blank" rel="noreferrer" aria-label={tx('whatsapp')}><Arrow diagonal/></a></div><div className="contact-bottom"><p>{tx('contactBody')}</p><div className="contact-methods"><a className="whatsapp-link" href={whatsapp(lang)} target="_blank" rel="noreferrer">{tx('whatsapp')}<Arrow diagonal/></a><a className="email-link" href="mailto:thiago.vincentiis@gmail.com">thiago.vincentiis@gmail.com <Arrow diagonal/></a></div></div><div className="social-row"><span>{tx('socials')}</span><a href="https://www.instagram.com/cine.beck/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://vimeo.com/thiagobeck" target="_blank" rel="noreferrer">Vimeo ↗</a><span className="spoken-languages">Português · English · Italiano</span></div></section>
    </main>
    <footer><a href={localePath(lang)} className="footer-wordmark">THIAGO BECK<span>.</span></a><div><span>© 2026 THIAGO BECK</span><span>{tx('shortRole')}</span><a href="#main">{tx('backTop')} ↑</a></div></footer>
    {selected&&<FilmDialog project={selected} lang={lang} onClose={closeProject} onNext={selected.id?()=>openProject(projects[(projects.findIndex(p=>p.id===selected.id)+1)%projects.length]):null}/>}
  </>;
}
const appRoot=createRoot(document.getElementById('root'));
appRoot.render(/\/(pt|en|it)\/reel\/?$/.test(location.pathname)?<ReelPage lang={startLocale()}/>:<App/>);
if(import.meta.hot)import.meta.hot.dispose(()=>appRoot.unmount());



