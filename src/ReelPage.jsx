import React, { useEffect, useRef, useState } from 'react';
import { text, ui } from './content';
import { sitePath, localePath } from './paths';
import './reel.css';

const clock = seconds => `${Math.floor((seconds||0)/60)}:${String(Math.floor((seconds||0)%60)).padStart(2,'0')}`;

export default function ReelPage({lang}) {
  const video = useRef(null);
  const [playing,setPlaying] = useState(false);
  const [muted,setMuted] = useState(false);
  const [elapsed,setElapsed] = useState(0);
  const [duration,setDuration] = useState(0);
  const [failed,setFailed] = useState(false);
  const tx = key => text(ui[key],lang);

  useEffect(() => {
    document.documentElement.lang=lang==='pt'?'pt-BR':lang;
    document.title='CINE BECK — Reel';
    const player=video.current;
    let disposed=false;
    player.play().catch(async error => {
      if(disposed||error.name!=='NotAllowedError')return;
      player.muted=true;
      setMuted(true);
      try { await player.play(); } catch { if(!disposed)setPlaying(false); }
    });
    return () => { disposed=true;player.pause(); };
  },[lang]);

  function togglePlayback() {
    const player=video.current;
    if(player.paused){
      if(player.ended)player.currentTime=0;
      player.play().catch(()=>setPlaying(false));
    }else player.pause();
  }

  function toggleSound() {
    const player=video.current;
    player.muted=!player.muted;
    setMuted(player.muted);
    if(!player.muted&&player.paused)player.play().catch(()=>setPlaying(false));
  }

  return <main className="standalone-reel">
    <div className="standalone-reel-top"><a href={localePath(lang)}>← {tx('reelBack')}</a><span>CINE BECK / REEL</span></div>
    <div className="standalone-reel-stage">
      <video ref={video} src={sitePath('media/hero-reel-novo-v1.mp4')} poster={sitePath('media/hero-reel-novo-v1.jpg')} playsInline autoPlay preload="auto" aria-label="CINE BECK — Reel" onClick={togglePlayback} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onVolumeChange={event=>setMuted(event.currentTarget.muted)} onTimeUpdate={event=>setElapsed(event.currentTarget.currentTime)} onLoadedMetadata={event=>setDuration(event.currentTarget.duration)} onError={()=>setFailed(true)}/>
    </div>
    {failed&&<p className="standalone-reel-error">{tx('reelError')}</p>}
    <div className="standalone-reel-controls">
      <button onClick={togglePlayback} aria-label={tx(playing?'reelPause':'reelPlay')}><span aria-hidden="true">{playing?'Ⅱ':'▶'}</span><span>{tx(playing?'reelPause':'reelPlay')}</span></button>
      <div className="standalone-reel-timeline"><input type="range" min="0" max={duration||1} step="0.1" value={Math.min(elapsed,duration||1)} aria-label={tx('reelProgress')} onChange={event=>{video.current.currentTime=Number(event.target.value);setElapsed(Number(event.target.value));}}/><span>{clock(elapsed)} / {clock(duration)}</span></div>
      <button onClick={toggleSound} aria-label={tx(muted?'enableSound':'disableSound')} aria-pressed={!muted}><span aria-hidden="true">{muted?'♪̸':'♪'}</span><span>{tx(muted?'enableSound':'disableSound')}</span></button>
    </div>
  </main>;
}
