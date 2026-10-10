import { gsap } from 'gsap';
import { reduceMotion } from './motion';
import { stripBase } from '../lib/url';

export function updateActiveNav() {
  const path = stripBase(location.pathname);
  document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((a) => {
    const href = stripBase(new URL(a.href).pathname);
    const on = href === '/' ? path === '/' : path.startsWith(href);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

export function initChrome() {
  const header = document.querySelector<HTMLElement>('[data-header]')!;
  const menu = document.querySelector<HTMLDialogElement>('[data-menu]')!;

  // Başlık: aşağı kaydırırken çekilir, yukarı kaydırınca geri gelir.
  let lastY = scrollY;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      // Başlığın altındaki bölüm açık renkliyse koyu temaya geç
      const probe = document.elementsFromPoint(innerWidth / 2, 30).find((el) => !header.contains(el));
      header.classList.toggle('on-light', !!probe?.closest('.chalk'));
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingDown && y > 300) header.classList.add('is-hidden');
      else if (goingUp || y < 300) header.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('astro:page-load', () => {
    lastY = scrollY;
    header.classList.remove('is-hidden');
    onScroll();
  });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  // Menü
  const items = () => menu.querySelectorAll<HTMLElement>('.menu-item');
  let tl: gsap.core.Timeline | null = null;

  const open = () => {
    if (menu.open) return;
    menu.showModal();
    document.documentElement.style.overflow = 'hidden';
    if (reduceMotion()) return;
    tl?.kill();
    tl = gsap
      .timeline()
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.inOut' })
      .fromTo(
        items(),
        { yPercent: 60, opacity: 0, fontStretch: '125%' },
        { yPercent: 0, opacity: 1, fontStretch: '100%', duration: 0.8, stagger: 0.045, ease: 'expo.out', clearProps: 'fontStretch' },
        0.3,
      )
      .fromTo('.menu-foot', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.55);
  };

  const close = (instant = false) => {
    if (!menu.open) return;
    const done = () => {
      menu.close();
      document.documentElement.style.overflow = '';
      gsap.set(menu, { clearProps: 'clipPath' });
    };
    if (instant || reduceMotion()) return done();
    tl?.kill();
    tl = gsap.timeline({ onComplete: done }).to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'expo.inOut' });
  };

  document.querySelector('[data-menu-open]')!.addEventListener('click', open);
  menu.querySelector('[data-menu-close]')!.addEventListener('click', () => close());
  menu.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  menu.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a');
    if (a && a.getAttribute('href')?.startsWith('/')) {
      // Geçiş perdesi zaten ekranı kapatacak
      setTimeout(() => close(true), 560);
    }
  });
}
