import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduceMotion } from './motion';

// Kaydırdıkça kamera atölye masasındaki ilgili alete yaklaşır.
export function init(root: HTMLElement) {
  const reduce = reduceMotion();
  const frame = root.querySelector<HTMLElement>('.atl-frame')!;
  const cam = root.querySelector<HTMLElement>('[data-atl-cam]')!;
  const spot = root.querySelector<HTMLElement>('[data-atl-spot]')!;
  const tag = root.querySelector<HTMLElement>('[data-atl-tag]')!;
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-atl-step]'));
  const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-atl-dot]'));
  const img = cam.querySelector('img')!;
  const IW = 1293,
    IH = 1217;
  const ZOOM = 2.1;
  let active = -1;
  const sv = { x: 0, y: 0, r: 0, ring: 0 };

  const applySpot = () => {
    frame.style.setProperty('--ring', String(sv.ring));
    frame.style.setProperty('--x', `${sv.x}px`);
    frame.style.setProperty('--y', `${sv.y}px`);
    frame.style.setProperty('--r', `${sv.r}px`);
    spot.style.setProperty('--x', `${sv.x}px`);
    spot.style.setProperty('--y', `${sv.y}px`);
    spot.style.setProperty('--r', `${sv.r}px`);
    tag.style.setProperty('--x', `${sv.x}px`);
    tag.style.setProperty('--y', `${sv.y}px`);
    tag.style.setProperty('--r', `${sv.r}px`);
  };

  const focus = (i: number, instant = false) => {
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const d = reduce || instant ? 0 : 1.3;
    if (i < 0) {
      gsap.to(cam, { x: 0, y: 0, scale: 1, duration: d, ease: 'expo.inOut' });
      gsap.to(sv, { r: Math.max(fw, fh), x: fw / 2, y: fh / 2, ring: 0, duration: d, ease: 'expo.inOut', onUpdate: applySpot });
      gsap.to(tag, { opacity: 0, duration: 0.3 });
      return;
    }
    const st = steps[i];
    const fx = parseFloat(st.dataset.fx!);
    const fy = parseFloat(st.dataset.fy!);
    const sc = Math.max(fw / IW, fh / IH);
    const dw = IW * sc,
      dh = IH * sc;
    const px = (fw - dw) / 2 + fx * dw;
    const py = (fh - dh) / 2 + fy * dh;
    let tx = fw / 2 - px * ZOOM;
    let ty = fh / 2 - py * ZOOM;
    tx = gsap.utils.clamp(fw - fw * ZOOM, 0, tx);
    ty = gsap.utils.clamp(fh - fh * ZOOM, 0, ty);
    gsap.to(cam, { x: tx, y: ty, scale: ZOOM, duration: d, ease: 'expo.inOut' });
    gsap.to(sv, {
      x: px * ZOOM + tx,
      y: py * ZOOM + ty,
      r: Math.min(fw, fh) * 0.2,
      ring: 1,
      duration: d,
      ease: 'expo.inOut',
      onUpdate: applySpot,
    });
    tag.textContent = st.dataset.tool || '';
    gsap.fromTo(tag, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.7, ease: 'expo.out' });
  };

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    dots.forEach((s, k) => s.classList.toggle('is-on', k === i));
    focus(i);
  };

  gsap.set(cam, { transformOrigin: '0 0' });
  const init0 = () => {
    sv.x = frame.clientWidth / 2;
    sv.y = frame.clientHeight / 2;
    sv.r = Math.max(frame.clientWidth, frame.clientHeight);
    applySpot();
  };
  if (img.complete) init0();
  else img.addEventListener('load', init0, { once: true });
  init0();

  steps.forEach((s, i) => {
    ScrollTrigger.create({
      trigger: s,
      start: 'top 60%',
      end: 'bottom 60%',
      onToggle: (self) => {
        if (self.isActive) setActive(i);
        else if (i === 0 && self.direction < 0) setActive(-1);
      },
    });
  });

  const spin = reduce ? null : gsap.to(frame, { '--rot': '360deg', duration: 60, repeat: -1, ease: 'none' });
  const ro = new ResizeObserver(() => {
    if (active >= 0) focus(active, true);
    else init0();
  });
  ro.observe(frame);
  return () => {
    ro.disconnect();
    spin?.kill();
  };
}
