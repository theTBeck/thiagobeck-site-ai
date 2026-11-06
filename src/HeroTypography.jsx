import React, { useRef } from 'react';
import useHeroEntrance from './useHeroEntrance';

export default function HeroTypography({ labels, playedRef, reelHref, playIcon, arrowIcon }) {
  const root = useRef(null);
  useHeroEntrance(root, playedRef);
  return <div ref={root} className="hero-typography">
    <div className="hero-top"><span className="eyebrow">{labels.label}</span><span className="hero-location">{labels.countries}</span></div>
    <div className="hero-main">
      <div className="hero-identity">
        <p className="hero-role">{labels.role}</p>
        <h1 id="hero-title" aria-label="THIAGO BECK">
          <span className="hero-name-mask" aria-hidden="true"><span className="hero-name-line">THIAGO</span></span>
          <span className="hero-name-mask" aria-hidden="true"><span className="hero-name-line">BECK</span></span>
        </h1>
      </div>
      <div className="hero-aside">
        <div className="hero-message"><p className="hero-statement">{labels.heading}</p><p className="hero-disciplines">{labels.body}</p></div>
        <a href={reelHref} className="hero-explore"><span className="play-circle">{playIcon}</span><span>{labels.watch}</span>{arrowIcon}</a>
      </div>
    </div>
  </div>;
}
