import { gsap } from 'gsap';
import { NAV } from '../data/site';
import { stripBase } from '../lib/url';

const el = () => document.querySelector<HTMLElement>('[data-curtain]');
let active = false;

const labelFor = (full: string) => {
  const path = stripBase(full);
  if (path === '/') return 'Ana sayfa';
  if (path.startsWith('/urun/')) return 'Ürün';
  return NAV.find((n) => path.startsWith(n.href))?.label ?? '';
};

export const curtainActive = () => active;

// Kapak alttan yükselir: dikişli kenar önde, kesim eğrisiyle.
export function curtainIn(path: string): Promise<void> {
  const c = el();
  if (!c) return Promise.resolve();
  active = true;
  const panel = c.querySelector<HTMLElement>('.curtain-panel')!;
  const mark = c.querySelector<HTMLElement>('.curtain-mark');
  const label = c.querySelector<HTMLElement>('[data-curtain-label]');
  const seam = c.querySelector<SVGLineElement>('.curtain-seam line');
  if (label) label.textContent = labelFor(path);
  c.classList.add('is-active');
  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: () => resolve() })
      .set(panel, { y: 0, yPercent: 110, borderRadius: '40px 40px 0 0' })
      .set([mark, label], { autoAlpha: 0, y: 20 })
      .fromTo(seam, { strokeDashoffset: 160 }, { strokeDashoffset: 0, duration: 0.6, ease: 'none' }, 0)
      .to(panel, { yPercent: 0, borderRadius: '0px 0px 0 0', duration: 0.55, ease: 'expo.inOut' }, 0)
      .to([mark, label], { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power3.out' }, 0.3);
  });
}

export function curtainOut() {
  const c = el();
  if (!c) return;
  const panel = c.querySelector<HTMLElement>('.curtain-panel')!;
  const mark = c.querySelector<HTMLElement>('.curtain-mark');
  const label = c.querySelector<HTMLElement>('[data-curtain-label]');
  gsap
    .timeline({
      onComplete: () => {
        c.classList.remove('is-active');
        active = false;
      },
    })
    .to([mark, label], { autoAlpha: 0, y: -16, duration: 0.25, ease: 'power2.in' }, 0)
    .to(panel, { yPercent: -110, borderRadius: '0 0 40px 40px', duration: 0.7, ease: 'expo.inOut' }, 0.05);
}
