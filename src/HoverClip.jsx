import { useEffect, useRef } from 'react';

export default function HoverClip({src,poster}) {
  const ref=useRef(null);

  useEffect(()=>{
    const video=ref.current;
    const target=video?.parentElement;
    if(!video||!target)return;

    const start=()=>{
      if(!window.matchMedia('(hover:hover)').matches)return;
      if(video.paused)video.play().catch(()=>{});
    };
    const stop=()=>{
      video.pause();
      video.currentTime=0;
    };

    target.addEventListener('mouseenter',start);
    target.addEventListener('mousemove',start);
    target.addEventListener('mouseleave',stop);
    return ()=>{
      target.removeEventListener('mouseenter',start);
      target.removeEventListener('mousemove',start);
      target.removeEventListener('mouseleave',stop);
      stop();
    };
  },[src]);

  return <video ref={ref} className="hover-clip" src={src} poster={poster} muted playsInline loop preload="none" aria-hidden="true"/>;
}
