import { gsap } from 'gsap';
import { EASE, reduceMotion, introDelay } from './motion';
import { fitStitch } from './util';
import { addToCart } from './cart';

interface V {
  id: number;
  color: string | null;
  label: string;
  available: boolean;
  thumb: string;
}

export function init(root: HTMLElement) {
  const reduce = reduceMotion();
  const variants: V[] = JSON.parse(root.querySelector('[data-variants]')!.textContent || '[]');
  const stage = root.querySelector<HTMLElement>('[data-pg-stage]')!;
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-pg-slide]'));
  const thumbs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-pg-thumb]'));
  const count = root.querySelector<HTMLElement>('[data-pg-count]')!;
  const radios = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="variant"]'));
  const colorLabel = root.querySelector<HTMLElement>('[data-color-label]');
  const stock = root.querySelector<HTMLElement>('[data-stock]')!;
  const addBtn = root.querySelector<HTMLButtonElement>('[data-add]')!;
  const buy = root.querySelector<HTMLAnchorElement>('[data-buy]')!;
  const store = root.dataset.store!;
  const disposers: (() => void)[] = [];

  disposers.push(fitStitch(stage.querySelector('svg')!, 12, 12));

  let vid = Number(radios.find((r) => r.checked)?.value ?? variants[0].id);
  let idx = 0;
  let busy = false;

  const slidesOf = (id: number) => slides.filter((s) => Number(s.dataset.variant) === id);
  const current = () => slidesOf(vid)[idx];

  const syncUi = () => {
    const v = variants.find((x) => x.id === vid)!;
    const list = slidesOf(vid);
    count.textContent = `${idx + 1} / ${list.length}`;
    thumbs.forEach((t) => {
      const mine = Number(t.dataset.variant) === vid;
      t.hidden = !mine;
      t.setAttribute('aria-pressed', String(mine && Number(t.dataset.index) === idx));
    });
    if (colorLabel) colorLabel.textContent = v.label;
    stock.classList.toggle('is-out', !v.available);
    stock.querySelector('span')!.textContent = v.available ? 'Stokta · 1–3 iş günü içinde kargoda' : 'Bu renk şu an tükendi';
    addBtn.disabled = !v.available;
    buy.href = `${store}/cart/${v.id}:1`;
    if (v.available) buy.removeAttribute('aria-disabled');
    else buy.setAttribute('aria-disabled', 'true');
  };

  const show = (next: HTMLElement, mode: 'cut' | 'circle', dir = 1, origin?: { x: number; y: number }) => {
    const prev = slides.find((s) => s.classList.contains('is-on'));
    if (!prev || prev === next) return;
    const img = next.querySelector('img');
    if (img && img.loading === 'lazy') img.loading = 'eager';
    next.hidden = false;
    next.classList.add('is-on');
    if (reduce) {
      prev.hidden = true;
      prev.classList.remove('is-on');
      return;
    }
    busy = true;
    gsap.set(next, { zIndex: 2 });
    gsap.set(prev, { zIndex: 1 });
    const tl = gsap.timeline({
      onComplete: () => {
        prev.hidden = true;
        prev.classList.remove('is-on');
        gsap.set([next, prev], { clearProps: 'zIndex,clipPath' });
        gsap.set(prev.querySelector('img'), { clearProps: 'transform,filter' });
        busy = false;
      },
    });
    if (mode === 'circle' && origin) {
      // Renk örneğinden yayılan daire: deri boyası gibi
      tl.fromTo(
        next,
        { clipPath: `circle(0% at ${origin.x}px ${origin.y}px)` },
        { clipPath: `circle(150% at ${origin.x}px ${origin.y}px)`, duration: 1.1, ease: EASE.cut },
        0,
      ).fromTo(next.querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 1.4, ease: EASE.settle }, 0);
    } else {
      const a = dir > 0 ? 'polygon(100% 0%, 100% 0%, 125% 100%, 125% 100%)' : 'polygon(-25% 0%, -25% 0%, 0% 100%, 0% 100%)';
      const b = dir > 0 ? 'polygon(-25% 0%, 100% 0%, 125% 100%, 0% 100%)' : 'polygon(-25% 0%, 100% 0%, 125% 100%, 0% 100%)';
      tl.fromTo(next, { clipPath: a }, { clipPath: b, duration: 0.9, ease: EASE.cut }, 0).fromTo(
        next.querySelector('img'),
        { scale: 1.15, xPercent: 5 * dir },
        { scale: 1, xPercent: 0, duration: 1.3, ease: EASE.settle },
        0,
      );
    }
    tl.to(prev.querySelector('img'), { scale: 1.05, filter: 'brightness(.4)', duration: 0.9, ease: EASE.cut }, 0);
  };

  const goIndex = (n: number) => {
    const list = slidesOf(vid);
    const k = (n + list.length) % list.length;
    if (k === idx || busy) return;
    const dir = n > idx ? 1 : -1;
    idx = k;
    show(list[k], 'cut', dir);
    syncUi();
  };

  const setVariant = (id: number, from?: HTMLElement) => {
    if (id === vid) return;
    vid = id;
    idx = 0;
    let origin: { x: number; y: number } | undefined;
    if (from) {
      const r = from.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      origin = { x: r.left + r.width / 2 - s.left, y: r.top + r.height / 2 - s.top };
    }
    show(slidesOf(vid)[0], 'circle', 1, origin ?? { x: stage.clientWidth / 2, y: stage.clientHeight / 2 });
    syncUi();
    const v = variants.find((x) => x.id === vid)!;
    if (v.color) {
      const u = new URL(location.href);
      u.searchParams.set('renk', v.color);
      history.replaceState(history.state, '', u);
    }
  };

  radios.forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) setVariant(Number(r.value), r.parentElement!.querySelector('.pc-dot') as HTMLElement);
    }),
  );
  thumbs.forEach((t) => t.addEventListener('click', () => goIndex(Number(t.dataset.index))));
  root.querySelector('[data-pg-prev]')!.addEventListener('click', () => goIndex(idx - 1));
  root.querySelector('[data-pg-next]')!.addEventListener('click', () => goIndex(idx + 1));

  // Dokunmatik kaydırma
  let sx = 0,
    sy = 0;
  stage.addEventListener('touchstart', (e) => ((sx = e.touches[0].clientX), (sy = e.touches[0].clientY)), { passive: true });
  stage.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) goIndex(idx + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  addBtn.addEventListener('click', () => {
    const v = variants.find((x) => x.id === vid)!;
    if (!v.available) return;
    addToCart({
      id: v.id,
      name: root.dataset.name!,
      meta: [root.dataset.kind, v.label].filter(Boolean).join(' · '),
      price: Number(root.dataset.price),
      image: v.thumb,
      url: root.dataset.url! + (v.color ? `?renk=${v.color}` : ''),
    });
  });

  // Mobil: satın alma düğmeleri görünmezken yapışkan çubuk
  const sticky = root.querySelector<HTMLElement>('[data-sticky-buy]');
  const actions = root.querySelector<HTMLElement>('.pdp-actions');
  if (sticky && actions) {
    const sBtn = sticky.querySelector<HTMLButtonElement>('[data-sticky-add]')!;
    sBtn.addEventListener('click', () => addBtn.click());
    let past = false;
    const io = new IntersectionObserver(([e]) => {
      past = !e.isIntersecting && e.boundingClientRect.top < 0;
      const on = past && !addBtn.disabled;
      sticky.classList.toggle('is-on', on);
      sticky.setAttribute('aria-hidden', String(!on));
      sBtn.tabIndex = on ? 0 : -1;
    });
    io.observe(actions);
    disposers.push(() => io.disconnect());
  }

  // URL'deki renk
  const want = new URL(location.href).searchParams.get('renk');
  const wantV = variants.find((v) => v.color === want);
  if (wantV && wantV.id !== vid) {
    const r = radios.find((x) => Number(x.value) === wantV.id);
    if (r) r.checked = true;
    const prev = slides.find((s) => s.classList.contains('is-on'))!;
    prev.hidden = true;
    prev.classList.remove('is-on');
    vid = wantV.id;
    const n = slidesOf(vid)[0];
    n.hidden = false;
    n.classList.add('is-on');
    const im = n.querySelector('img');
    if (im) im.loading = 'eager';
  }
  syncUi();

  // Giriş: galeri bıçakla açılır
  if (!reduce) {
    gsap.fromTo(stage, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, delay: introDelay, ease: EASE.cut, clearProps: 'clipPath' });
    gsap.fromTo(current().querySelector('img'), { scale: 1.25 }, { scale: 1, duration: 1.7, delay: introDelay, ease: EASE.settle });
  }

  return () => disposers.forEach((d) => d());
}
