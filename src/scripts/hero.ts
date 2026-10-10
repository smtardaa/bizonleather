import { gsap } from 'gsap';
import { EASE, reduceMotion, revealLines, isTouch, introDelay } from './motion';
import { fitStitch, whenVisible } from './util';

const AUTOPLAY = 5200;

export function init(root: HTMLElement) {
  const reduce = reduceMotion();
  const disposers: (() => void)[] = [];
  const frame = root.querySelector<HTMLElement>('[data-stage-frame]')!;
  const tilt = root.querySelector<HTMLElement>('[data-stage-tilt]')!;
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
  const caps = Array.from(root.querySelectorAll<HTMLElement>('[data-cap]'));
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-go]'));
  const blade = root.querySelector<HTMLElement>('[data-stage-blade]')!;
  const sheen = root.querySelector<HTMLElement>('[data-stage-sheen]')!;
  const svg = root.querySelector<SVGSVGElement>('.stage-stitch')!;
  const drawRect = svg.querySelector<SVGRectElement>('.stitch-draw')!;
  const title = root.querySelector<HTMLElement>('[data-hero-title]')!;
  const fades = root.querySelectorAll<HTMLElement>('[data-hero-fade]');

  disposers.push(fitStitch(svg, 12, 12));

  // ---------- Giriş koreografisi (~1.4 sn, hiçbir şeyi bloklamaz) ----------
  if (reduce) {
    gsap.set([title, ...fades], { opacity: 1 });
    gsap.set(frame, { clipPath: 'none' });
  } else {
    const firstImg = slides[0].querySelector('img')!;
    const intro = gsap.timeline({ defaults: { ease: EASE.settle }, delay: introDelay });
    intro
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: EASE.cut }, 0)
      .fromTo(firstImg, { scale: 1.3 }, { scale: 1, duration: 1.8 }, 0)
      .fromTo(drawRect, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.45)
      .fromTo(fades, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.55)
      .fromTo(dots, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05 }, 0.9);
    disposers.push(revealLines(title, { delay: 0.1, trigger: false }));
    disposers.push(() => intro.kill());
  }

  // ---------- Ürün sahnesi: bıçak kesimi geçişi ----------
  let current = 0;
  let busy = false;
  let timer: gsap.core.Tween | null = null;
  let paused = false;
  let visible = true;

  const setIndex = (i: number) => {
    dots.forEach((d, k) => d.setAttribute('aria-pressed', String(k === i)));
    caps.forEach((c, k) => (c.hidden = k !== i));
    slides.forEach((s, k) => {
      const on = k === i;
      s.toggleAttribute('aria-hidden', !on);
      s.tabIndex = on ? 0 : -1;
    });
  };

  const go = (next: number, dir = 1) => {
    if (busy || next === current) return;
    const from = slides[current];
    const to = slides[next];
    const img = to.querySelector('img')!;
    if (img.loading === 'lazy') img.loading = 'eager';
    busy = true;
    setIndex(next);
    if (reduce) {
      from.classList.remove('is-active');
      to.classList.add('is-active');
      current = next;
      busy = false;
      return;
    }
    to.classList.add('is-active');
    to.style.zIndex = '2';
    from.style.zIndex = '1';
    const startPoly = dir > 0 ? 'polygon(0% 0%, 0% 0%, -25% 100%, -25% 100%)' : 'polygon(125% 0%, 125% 0%, 100% 100%, 100% 100%)';
    const endPoly = dir > 0 ? 'polygon(0% 0%, 125% 0%, 100% 100%, -25% 100%)' : 'polygon(125% 0%, 0% 0%, -25% 100%, 100% 100%)';
    const cap = caps[next];
    gsap
      .timeline({
        onComplete: () => {
          from.classList.remove('is-active');
          from.style.zIndex = '';
          to.style.zIndex = '';
          gsap.set([to, from, from.querySelector('img')], { clearProps: 'clipPath,transform,filter' });
          current = next;
          busy = false;
        },
      })
      .fromTo(to, { clipPath: startPoly }, { clipPath: endPoly, duration: 1, ease: EASE.cut }, 0)
      .fromTo(img, { scale: 1.18, xPercent: 6 * dir }, { scale: 1, xPercent: 0, duration: 1.5, ease: EASE.settle }, 0)
      .to(from.querySelector('img'), { scale: 1.06, xPercent: -4 * dir, filter: 'brightness(.45)', duration: 1, ease: EASE.cut }, 0)
      .fromTo(
        blade,
        { left: dir > 0 ? '-12%' : '112%', opacity: 1 },
        { left: dir > 0 ? '112%' : '-12%', duration: 1, ease: EASE.cut },
        0,
      )
      .set(blade, { opacity: 0 })
      .fromTo(cap.children, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: EASE.settle }, 0.25);
  };

  const scheduleNext = () => {
    timer?.kill();
    const bar = dots[current]?.querySelector<HTMLElement>('.si-bar i');
    if (reduce) return;
    const prog = { p: 0 };
    timer = gsap.to(prog, {
      p: 1,
      duration: AUTOPLAY / 1000,
      ease: 'none',
      paused: paused || !visible,
      onUpdate: () => bar?.style.setProperty('--p', String(prog.p)),
      onComplete: () => {
        go((current + 1) % slides.length, 1);
        setTimeout(scheduleNext, 50);
      },
    });
  };
  const pause = () => {
    paused = true;
    timer?.pause();
  };
  const resume = () => {
    paused = false;
    if (visible) timer?.resume();
  };

  dots.forEach((d) =>
    d.addEventListener('click', () => {
      const n = Number(d.dataset.go);
      go(n, n > current ? 1 : -1);
      dots.forEach((x) => x.querySelector<HTMLElement>('.si-bar i')?.style.setProperty('--p', '1'));
      setTimeout(scheduleNext, 60);
    }),
  );

  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  stage.addEventListener('pointerenter', pause);
  stage.addEventListener('pointerleave', resume);
  stage.addEventListener('focusin', pause);
  stage.addEventListener('focusout', resume);
  disposers.push(
    whenVisible(root, (v) => {
      visible = v;
      if (v && !paused) timer?.resume();
      else timer?.pause();
    }),
  );
  const onVis = () => (document.hidden ? timer?.pause() : !paused && visible && timer?.resume());
  document.addEventListener('visibilitychange', onVis);
  disposers.push(() => document.removeEventListener('visibilitychange', onVis));

  // Dokunmatik: kaydırarak ürün değiştir
  let sx = 0,
    sy = 0,
    tracking = false;
  frame.addEventListener(
    'touchstart',
    (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      tracking = true;
    },
    { passive: true },
  );
  frame.addEventListener(
    'touchend',
    (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        const dir = dx < 0 ? 1 : -1;
        go((current + dir + slides.length) % slides.length, dir);
        setTimeout(scheduleNext, 60);
      }
    },
    { passive: true },
  );

  // İmleçle eğim + deri parlaması
  if (!reduce && !isTouch()) {
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.9, ease: 'power3.out' });
    const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.9, ease: 'power3.out' });
    const onMove = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      ry((x - 0.5) * 7);
      rx(-(y - 0.5) * 7);
      sheen.style.setProperty('--sx', `${x * 100}%`);
      sheen.style.setProperty('--sy', `${y * 100}%`);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
    };
    frame.addEventListener('pointermove', onMove);
    frame.addEventListener('pointerleave', onLeave);
  }

  const startTimer = window.setTimeout(scheduleNext, reduce ? 0 : 1400);

  // Kaydırarak çıkış: başlık deri gibi gerilir, sahne geri çekilir
  // (giriş koreografisi bittikten sonra kurulur; aynı özellikleri paylaşırlar)
  let out: gsap.core.Timeline | null = null;
  const buildOut = gsap.delayedCall(reduce ? 0 : 1.6, () => {
    if (reduce) return;
    const lines = Array.from(title.querySelectorAll<HTMLElement>('.ln > span'));
    out = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.5 },
    });
    out
      .fromTo(lines, { fontStretch: '68%', xPercent: 0 }, { fontStretch: '118%', xPercent: (i) => [0, 6, -4][i] ?? 0, ease: 'none', stagger: 0.04 }, 0)
      .fromTo(title, { opacity: 1, yPercent: 0 }, { opacity: 0.15, yPercent: -8, ease: 'none' }, 0)
      .fromTo(frame, { scale: 1, yPercent: 0 }, { scale: 0.9, yPercent: 6, ease: 'none' }, 0);
  });
  disposers.push(() => {
    buildOut.kill();
    out?.scrollTrigger?.kill();
    out?.kill();
  });

  return () => {
    clearTimeout(startTimer);
    timer?.kill();
    disposers.forEach((d) => d());
  };
}
