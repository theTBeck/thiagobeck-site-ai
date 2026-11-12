import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

/** One entrance per page visit. The default markup is always readable. */
export default function useHeroEntrance(rootRef, playedRef) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const section = root.closest('.hero');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (playedRef.current || reduced.matches || document.hidden) {
      playedRef.current = true;
      root.dataset.motion = 'complete';
      return;
    }

    const names = [...root.querySelectorAll('.hero-name-line')];
    const copy = [...root.querySelectorAll('.hero-role,.hero-statement,.hero-disciplines')];
    const top = root.querySelector('.hero-top');
    const splits = [];
    let timeline;
    let observer;
    let sizeObserver;
    let watchdog;
    let fontTimeout;
    let finished = false;
    let started = false;
    let fontsReady = !document.fonts || document.fonts.status === 'loaded';
    let visible = false;
    let disposed = false;
    const context = gsap.context(() => {}, root);

    function finish() {
      if (finished) return;
      finished = true;
      playedRef.current = true;
      clearTimeout(watchdog);
      clearTimeout(fontTimeout);
      observer?.disconnect();
      sizeObserver?.disconnect();
      timeline?.kill();
      splits.forEach(split => split.revert());
      context.revert();
      root.dataset.motion = 'complete';
    }

    function start() {
      if (disposed || finished || started || !visible || !fontsReady) return;
      if (reduced.matches || document.hidden) { finish(); return; }
      started = true;
      playedRef.current = true;
      watchdog = window.setTimeout(finish, 2400);
      root.dataset.motion = 'playing';
      observer?.disconnect();
      try {
        context.add(() => {
          copy.forEach(element => splits.push(SplitText.create(element, {
            type: 'lines', mask: 'lines', linesClass: 'hero-copy-line', aria: 'auto'
          })));
          gsap.set(copy, { opacity: 1 });
          timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
          if (names.length) timeline.fromTo(names, { yPercent: 115, opacity: 1 },
            { yPercent: 0, duration: .75, stagger: .1 }, 0);
          timeline.to(top, { opacity: 1, duration: .35 }, 0);
          const timings = [
            { at: .15, duration: .35, spread: .08 },
            { at: .45, duration: .55, spread: .08 },
            { at: .65, duration: .45, spread: .25 }
          ];
          splits.forEach((split, index) => {
            const { at, duration, spread } = timings[index];
            timeline.fromTo(split.lines, { yPercent: 115, opacity: 0 },
              { yPercent: 0, opacity: 1, duration, stagger: { amount: spread } }, at);
          });
          timeline.call(finish, [], 1.4);
        });
        // A width change ends the entrance and restores native line wrapping.
        const initialWidth = section.getBoundingClientRect().width;
        if ('ResizeObserver' in window) {
          sizeObserver = new ResizeObserver(() => {
            if (Math.abs(section.getBoundingClientRect().width - initialWidth) > .5) finish();
          });
          sizeObserver.observe(section);
        }
      } catch {
        finish();
      }
    }

    try {
      context.add(() => gsap.set([...names, ...copy, top], { opacity: 0 }));
      root.dataset.motion = 'waiting';
      // Never leave text hidden behind slow or failed font loading.
      if (!fontsReady) {
        document.fonts.ready.then(() => {
          if (disposed || finished) return;
          clearTimeout(fontTimeout);
          fontsReady = true;
          start();
        }).catch(finish);
      }
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (!fontsReady && !fontTimeout) fontTimeout = window.setTimeout(finish, 650);
          start();
        }
      }, { rootMargin: '-86px 0px 0px 0px', threshold: .1 });
      observer.observe(section);
    } catch {
      finish();
    }

    const onPreference = () => { if (reduced.matches) finish(); };
    const onVisibility = () => { if (document.hidden) finish(); };
    reduced.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    root.addEventListener('focusin', finish);
    return () => {
      disposed = true;
      clearTimeout(watchdog);
      clearTimeout(fontTimeout);
      observer?.disconnect();
      sizeObserver?.disconnect();
      timeline?.kill();
      splits.forEach(split => split.revert());
      context.revert();
      reduced.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      root.removeEventListener('focusin', finish);
    };
  }, [rootRef, playedRef]);
}
