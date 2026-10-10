import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, reduceMotion, isTouch } from './motion';

gsap.registerPlugin(Flip);

export function init(root: HTMLElement) {
  const reduce = reduceMotion();
  const grid = root.querySelector<HTMLElement>('[data-col-grid]')!;
  const items = Array.from(grid.querySelectorAll<HTMLElement>('.col-item'));
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const status = root.querySelector<HTMLElement>('[data-col-status]')!;

  // Kartlar sırayla, kesimle açılır
  if (!reduce) {
    items.forEach((it) => {
      const media = it.querySelector<HTMLElement>('.ci-media')!;
      gsap.fromTo(
        media,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: EASE.cut, scrollTrigger: { trigger: it, start: 'top 90%', once: true } },
      );
      gsap.fromTo(
        it.querySelector('.ci-info'),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, delay: 0.25, ease: EASE.settle, scrollTrigger: { trigger: it, start: 'top 90%', once: true } },
      );
    });
  }

  const apply = (key: string, animate = true) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));
    const state = Flip.getState(items);
    let n = 0;
    items.forEach((it) => {
      const show = key === 'tumu' || it.dataset.cat === key;
      it.hidden = !show;
      if (show) n++;
    });
    status.textContent = `${n} ürün gösteriliyor`;
    if (animate && !reduce) {
      Flip.from(state, {
        duration: 0.8,
        ease: EASE.cut,
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, ease: EASE.settle }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.4 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    }
    const u = new URL(location.href);
    if (key === 'tumu') u.searchParams.delete('kategori');
    else u.searchParams.set('kategori', key);
    history.replaceState(history.state, '', u);
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter!)));
  const initial = new URL(location.href).searchParams.get('kategori');
  if (initial && buttons.some((b) => b.dataset.filter === initial)) apply(initial, false);

  // Diğer renk, imlecin olduğu noktadan "boyanarak" açılır
  if (!isTouch()) {
    grid.querySelectorAll<HTMLElement>('[data-dye]').forEach((a) => {
      const media = a.querySelector<HTMLElement>('.ci-media')!;
      const b = media.querySelector<HTMLElement>('.ci-b');
      if (!b) return;
      const enter = (e: PointerEvent) => {
        const r = media.getBoundingClientRect();
        media.style.setProperty('--mx', `${e.clientX - r.left}px`);
        media.style.setProperty('--my', `${e.clientY - r.top}px`);
        gsap.to(b, { clipPath: `circle(150% at ${e.clientX - r.left}px ${e.clientY - r.top}px)`, duration: reduce ? 0 : 1, ease: EASE.cut });
      };
      const leave = (e: PointerEvent) => {
        const r = media.getBoundingClientRect();
        gsap.to(b, { clipPath: `circle(0% at ${e.clientX - r.left}px ${e.clientY - r.top}px)`, duration: reduce ? 0 : 0.7, ease: EASE.cut });
      };
      media.addEventListener('pointerenter', enter);
      media.addEventListener('pointerleave', leave);
    });
  }
}
