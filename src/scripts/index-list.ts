import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, reduceMotion } from './motion';

export function init(root: HTMLElement) {
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-idx-item]'));
  const preview = root.querySelector<HTMLElement>('[data-idx-preview]')!;
  const pvs = Array.from(preview.querySelectorAll<HTMLElement>('[data-pv]'));
  const reduce = reduceMotion();
  const desktop = matchMedia('(hover: hover) and (min-width: 1024px)');
  const disposers: (() => void)[] = [];

  // Satırlar sırayla dikilir gibi gelir
  if (!reduce) {
    gsap.fromTo(
      items.map((i) => i.querySelector('.idx-row')),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.07,
        ease: EASE.settle,
        scrollTrigger: { trigger: root.querySelector('.idx-list'), start: 'top 85%', once: true },
      },
    );
  }

  // ---------- Masaüstü: imleci izleyen önizleme ----------
  const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3.out' });
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3.out' });
  const rTo = gsap.quickTo(preview, 'rotation', { duration: 0.9, ease: 'power3.out' });
  let lastX = 0;
  let shown = false;
  let active = -1;

  const show = (i: number) => {
    if (i === active) return;
    const prev = pvs[active];
    active = i;
    const el = pvs[i];
    pvs.forEach((p) => p.classList.toggle('is-on', p === el || p === prev));
    gsap.set(el, { zIndex: 2 });
    if (prev) gsap.set(prev, { zIndex: 1 });
    if (!reduce) {
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: EASE.cut });
      gsap.fromTo(el.querySelector('img'), { scale: 1.25 }, { scale: 1, duration: 0.9, ease: EASE.settle });
    }
    if (!shown) {
      shown = true;
      gsap.set(preview, { visibility: 'visible' });
      gsap.to(preview, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: reduce ? 0 : 0.55, ease: EASE.cut });
    }
  };
  const hide = () => {
    shown = false;
    active = -1;
    gsap.to(preview, {
      clipPath: 'inset(50% 50% 50% 50% round 18px)',
      duration: reduce ? 0 : 0.45,
      ease: EASE.cut,
      onComplete: () => {
        if (!shown) gsap.set(preview, { visibility: 'hidden' });
      },
    });
  };

  const list = root.querySelector<HTMLElement>('.idx-list')!;
  const onMove = (e: PointerEvent) => {
    if (!desktop.matches) return;
    const w = preview.offsetWidth;
    const h = preview.offsetHeight;
    xTo(e.clientX + 40);
    yTo(e.clientY - h / 2);
    if (!reduce) rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4));
    lastX = e.clientX;
    if (e.clientX + 40 + w > innerWidth) xTo(e.clientX - w - 40);
  };
  items.forEach((it, i) => {
    const row = it.querySelector<HTMLElement>('.idx-row')!;
    row.addEventListener('pointerenter', (e) => {
      if (!desktop.matches) return;
      if (!shown) {
        gsap.set(preview, { x: e.clientX + 40, y: e.clientY - preview.offsetHeight / 2 });
      }
      show(i);
    });
  });
  list.addEventListener('pointermove', onMove);
  list.addEventListener('pointerleave', () => desktop.matches && hide());
  const onScroll = () => shown && hide();
  addEventListener('scroll', onScroll, { passive: true });
  disposers.push(() => removeEventListener('scroll', onScroll));

  // ---------- Mobil: ekranın ortasındaki satır aktif olur ----------
  items.forEach((it) => {
    ScrollTrigger.create({
      trigger: it,
      start: 'top 52%',
      end: 'bottom 48%',
      toggleClass: { targets: it, className: 'is-active' },
    });
  });

  return () => disposers.forEach((d) => d());
}
