import React, { useEffect, useRef, useState } from 'react';
import { text, ui } from './content';
import { sitePath, localePath } from './paths';
import './reel.css';

const clock = seconds => `${Math.floor((seconds||0)/60)}:${String(Math.floor((seconds||0)%60)).padStart(2,'0')}`;

export default function ReelPage({lang}) {
  const video = useRef(null);
  const [playing,setPlaying] = useState(false);
  const [muted,setMuted] = useState(true);
  const [elapsed,setElapsed] = useState(0);
  const [duration,setDuration] = useState(0);
  const [failed,setFailed] = useState(false);
  const tx = key => text(ui[key],lang);

  useEffect(() => {
    document.documentElement.lang=lang==='pt'?'pt-BR':lang;
    document.title='CINE BECK — Reel';
    const player=video.current;
    let disposed=false;
    player.muted=true;
    player.defaultMuted=true;
    player.volume=0;
    setMuted(true);
    player.play().catch(()=>{if(!disposed)setPlaying(false);});
    return () => { disposed=true;player.pause(); };
  },[lang]);

  function togglePlayback() {
    const player=video.current;
    if(player.paused){
      if(player.ended)player.currentTime=0;
      player.play().catch(()=>setPlaying(false));
    }else player.pause();
  }

  function keepSilent() {
    const player=video.current;
    if(!player)return;
    player.muted=true;
    player.defaultMuted=true;
    player.volume=0;
    setMuted(true);
  }

  return <main className="standalone-reel">
    <div className="standalone-reel-top"><a href={localePath(lang)}>← {tx('reelBack')}</a><span>CINE BECK / REEL</span></div>
    <div className="standalone-reel-stage">
      <video ref={video} src={sitePath('media/hero-reel-novo-v1.mp4')} poster={sitePath('media/hero-reel-novo-v1.jpg')} muted playsInline autoPlay preload="auto" aria-label="CINE BECK — Reel" onClick={togglePlayback} onPlay={event=>{const player=event.currentTarget;if(!player.muted||player.volume!==0){player.muted=true;player.volume=0;}setPlaying(true);setMuted(true);}} onPause={()=>setPlaying(false)} onVolumeChange={event=>{const player=event.currentTarget;if(!player.muted||player.volume!==0){player.muted=true;player.volume=0;}setMuted(true);}} onTimeUpdate={event=>setElapsed(event.currentTarget.currentTime)} onLoadedMetadata={event=>setDuration(event.currentTarget.duration)} onError={()=>setFailed(true)}/>
    </div>
    {failed&&<p className="standalone-reel-error">{tx('reelError')}</p>}
    <div className="standalone-reel-controls">
      <button onClick={togglePlayback} aria-label={tx(playing?'reelPause':'reelPlay')}><span aria-hidden="true">{playing?'Ⅱ':'▶'}</span><span>{tx(playing?'reelPause':'reelPlay')}</span></button>
      <div className="standalone-reel-timeline"><input type="range" min="0" max={duration||1} step="0.1" value={Math.min(elapsed,duration||1)} aria-label={tx('reelProgress')} onChange={event=>{video.current.currentTime=Number(event.target.value);setElapsed(Number(event.target.value));}}/><span>{clock(elapsed)} / {clock(duration)}</span></div>
      <button onClick={keepSilent} aria-label={tx('soundOff')} aria-pressed="true"><span aria-hidden="true">♪̸</span><span>{tx('soundOff')}</span></button>
    </div>
  </main>;
}

