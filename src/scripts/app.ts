import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initMotion, reduceMotion, setIntroDelay } from './motion';
import { initCart } from './cart';
import { initChrome, updateActiveNav } from './chrome';
import { curtainIn, curtainOut, curtainActive } from './curtain';

gsap.registerPlugin(ScrollTrigger);

type Cleanup = (() => void) | void;
type Mod = { init: (root: HTMLElement) => Cleanup | Promise<Cleanup> };

// Sayfa modülleri yalnızca ilgili öğe sayfada varsa yüklenir.
const MODULES: [string, () => Promise<Mod>][] = [
  ['[data-hero]', () => import('./hero')],
  ['[data-idx-root]', () => import('./index-list')],
  ['[data-emboss]', () => import('./emboss')],
  ['[data-setbuilder]', () => import('./setbuilder')],
  ['[data-atelier]', () => import('./atelier')],
  ['[data-product]', () => import('./product')],
  ['[data-faq]', () => import('./faq')],
  ['[data-contact]', () => import('./contact')],
  ['[data-stitch-demo]', () => import('./stitch-demo')],
  ['[data-collection]', () => import('./collection')],
];

let cleanups: (() => void)[] = [];
let booted = false;

async function initPage() {
  clearTimeout((window as any).__bizonFallback);
  document.documentElement.classList.add('js');
  updateActiveNav();

  const motionCleanup = initMotion();
  cleanups.push(motionCleanup);

  await Promise.all(
    MODULES.map(async ([sel, load]) => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(sel));
      if (!els.length) return;
      const mod = await load();
      for (const el of els) {
        try {
          const c = await mod.init(el);
          if (typeof c === 'function') cleanups.push(c);
        } catch (err) {
          console.error('[bizon]', sel, err);
          el.classList.add('is-fallback');
        }
      }
    }),
  );
  ScrollTrigger.refresh();
}

document.addEventListener('astro:page-load', () => {
  if (!booted) {
    booted = true;
    initChrome();
    initCart();
  }
  setIntroDelay(curtainActive() ? 0.4 : 0);
  initPage();
  if (curtainActive()) curtainOut();
});

document.addEventListener('astro:before-swap', () => {
  cleanups.forEach((c) => {
    try {
      c();
    } catch {}
  });
  cleanups = [];
  ScrollTrigger.getAll().forEach((t) => t.kill());
});

document.addEventListener('astro:after-swap', () => {
  document.documentElement.classList.add('js');
});

document.addEventListener('astro:before-preparation', (e: any) => {
  if (reduceMotion()) return;
  const original = e.loader;
  const to: URL = e.to;
  e.loader = async () => {
    await Promise.all([curtainIn(to.pathname), original()]);
  };
});
