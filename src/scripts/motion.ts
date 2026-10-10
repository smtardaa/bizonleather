import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Sayfa geçiş perdesi kalkarken giriş animasyonlarının bekleyeceği süre (sn). */
export let introDelay = 0;
export const setIntroDelay = (d: number) => (introDelay = d);

export const isTouch = () => matchMedia('(hover: none), (pointer: coarse)').matches;

// Ortak hareket sözlüğü
export const EASE = {
  cut: 'expo.inOut', // bıçak: sert başlar, yumuşak biter
  settle: 'expo.out', // deri yerine oturur
  press: 'power3.in', // damga iner
};

/**
 * Başlık satırları: maskeden yükselirken geniş (125%) gelir, daralarak
 * yerine oturur — gerilen derinin bırakılınca toplanması gibi.
 */
export function revealLines(el: HTMLElement, opts: { delay?: number; trigger?: boolean } = {}) {
  let inner = Array.from(el.querySelectorAll<HTMLElement>('.ln > span'));
  let split: SplitText | null = null;
  if (!inner.length) {
    split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ln-auto' });
    inner = split.lines as HTMLElement[];
  }
  const target = getComputedStyle(el).fontStretch || '100%';
  gsap.set(el, { opacity: 1 });
  const tween = gsap.fromTo(
    inner,
    { yPercent: 108, fontStretch: '125%' },
    {
      yPercent: 0,
      fontStretch: target,
      duration: 1.15,
      stagger: 0.08,
      ease: EASE.settle,
      delay: (opts.delay ?? 0) + introDelay,
      clearProps: 'fontStretch',
      onComplete: () => el.querySelectorAll('.ln').forEach((l) => l.classList.add('is-done')),
      scrollTrigger: opts.trigger === false ? undefined : { trigger: el, start: 'top 88%', once: true },
    },
  );
  return () => {
    tween.kill();
    split?.revert();
  };
}

export function initMotion() {
  const disposers: (() => void)[] = [];
  const reveal = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

  if (reduceMotion()) {
    reveal.forEach((el) => gsap.set(el, { opacity: 1, clipPath: 'none' }));
    return () => {};
  }

  for (const el of reveal) {
    const kind = el.dataset.reveal;
    const delay = parseFloat(el.dataset.delay || '0') + introDelay;
    if (el.closest('[data-hero]') && el.dataset.reveal !== 'fade') continue; // hero kendi koreografisini yönetir
    if (kind === 'lines') {
      disposers.push(revealLines(el, { delay }));
    } else if (kind === 'cut') {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.2,
          delay,
          ease: EASE.cut,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      );
      const im = el.querySelector('img');
      if (im) {
        gsap.fromTo(
          im,
          { scale: 1.18 },
          { scale: 1, duration: 1.6, delay, ease: EASE.settle, scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
        );
      }
    } else if (kind === 'stagger') {
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(
        el.children,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.07,
          delay,
          ease: EASE.settle,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      );
    } else {
      gsap.fromTo(
        el,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          ease: EASE.settle,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        },
      );
    }
  }

  // Kaydırmayla hafif derinlik
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax || '0.12');
    gsap.fromTo(
      el,
      { yPercent: -amt * 100 },
      {
        yPercent: amt * 100,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });

  // Büyük kelimeler ekran ortasından geçerken gerilir
  document.querySelectorAll<HTMLElement>('[data-tension]').forEach((el) => {
    gsap.fromTo(
      el,
      { fontStretch: '62%' },
      {
        fontStretch: '125%',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'bottom 25%', scrub: 0.6 },
      },
    );
  });

  return () => disposers.forEach((d) => d());
}
