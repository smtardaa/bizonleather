import { gsap } from 'gsap';
import { reduceMotion, EASE } from './motion';
import { addToCart } from './cart';
import { url } from '../lib/url';

interface SetData {
  slug: string;
  id: number;
  name: string;
  items: string[];
  price: number;
  note?: string;
  thumb: string;
  store: string;
}

const fmt = (n: number) => new Intl.NumberFormat('tr-TR').format(Math.round(n)) + ' TL';

export function init(root: HTMLElement) {
  const reduce = reduceMotion();
  const sets: SetData[] = JSON.parse(root.querySelector('[data-set-json]')!.textContent || '[]');
  const toggles = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-item]'));
  const priceEl = root.querySelector<HTMLElement>('[data-set-price]')!;
  const resultEl = priceEl.parentElement!;
  const variantsEl = root.querySelector<HTMLElement>('[data-set-variants]')!;
  const msg = root.querySelector<HTMLElement>('[data-set-msg]')!;
  const addBtn = root.querySelector<HTMLButtonElement>('[data-set-add]')!;
  const store = root.querySelector<HTMLAnchorElement>('[data-set-store]')!;
  const box = root.querySelector<HTMLElement>('[data-set-box]')!;
  const cap = root.querySelector<HTMLElement>('[data-set-cap]')!;
  const slides = new Map(
    Array.from(root.querySelectorAll<HTMLElement>('[data-set-slide]')).map((el) => [el.dataset.setSlide!, el]),
  );

  let current: SetData | null = sets[0];
  let variantIdx = 0;
  const shown = { price: sets[0].price };

  const selected = () => toggles.filter((t) => t.getAttribute('aria-pressed') === 'true').map((t) => t.dataset.item!);
  const matchesFor = (sel: string[]) =>
    sets.filter((s) => s.items.length === sel.length && sel.every((x) => s.items.includes(x)));

  const showSlide = (slug: string) => {
    const next = slides.get(slug)!;
    const prev = Array.from(slides.values()).find((s) => s.classList.contains('is-on') && s !== next);
    if (next.classList.contains('is-on') && !prev) return;
    next.classList.add('is-on');
    if (reduce || !prev) {
      prev?.classList.remove('is-on');
      return;
    }
    gsap.set(next, { zIndex: 2 });
    gsap.set(prev, { zIndex: 1 });
    gsap
      .timeline({
        onComplete: () => {
          prev.classList.remove('is-on');
          gsap.set([next, prev], { clearProps: 'zIndex,clipPath' });
          gsap.set(prev.querySelector('img'), { clearProps: 'all' });
        },
      })
      // Kutu kapağı: yukarıdan aşağı açılır
      .fromTo(next, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: EASE.cut }, 0)
      .fromTo(next.querySelector('img'), { scale: 1.2, yPercent: -6 }, { scale: 1, yPercent: 0, duration: 1.3, ease: EASE.settle }, 0)
      .to(prev.querySelector('img'), { scale: 0.94, filter: 'brightness(.4)', duration: 0.9, ease: EASE.cut }, 0);
  };

  const countTo = (n: number) => {
    gsap.to(shown, {
      price: n,
      duration: reduce ? 0 : 0.7,
      ease: 'power3.out',
      onUpdate: () => (priceEl.textContent = fmt(shown.price)),
    });
  };

  const renderVariants = (m: SetData[]) => {
    variantsEl.innerHTML = '';
    if (m.length < 2) {
      variantsEl.hidden = true;
      return;
    }
    variantsEl.hidden = false;
    m.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(i === variantIdx));
      b.innerHTML = `<b></b><span class="mono"></span>`;
      b.querySelector('b')!.textContent = s.note || s.name;
      b.querySelector('span')!.textContent = fmt(s.price);
      b.addEventListener('click', () => {
        variantIdx = i;
        update();
      });
      variantsEl.appendChild(b);
    });
  };

  const update = () => {
    const sel = selected();
    const m = matchesFor(sel);
    if (variantIdx >= m.length) variantIdx = 0;
    renderVariants(m);
    current = m[variantIdx] ?? null;
    box.classList.toggle('is-empty', !current);
    resultEl.classList.toggle('is-empty', !current);
    addBtn.disabled = !current;
    if (!current) {
      msg.textContent = sel.length === 0 ? 'En az iki parça seç.' : 'Bir parça daha seç — setler en az iki parçadan oluşur.';
      priceEl.textContent = '—';
      shown.price = 0;
      cap.textContent = 'Set seçilmedi';
      return;
    }
    msg.textContent = '';
    countTo(current.price);
    cap.textContent = current.name + (current.note ? ` · ${current.note}` : '');
    store.href = current.store;
    showSlide(current.slug);
  };

  toggles.forEach((t) =>
    t.addEventListener('click', () => {
      const on = t.getAttribute('aria-pressed') === 'true';
      t.setAttribute('aria-pressed', String(!on));
      variantIdx = 0;
      if (!reduce) {
        gsap.fromTo(t, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      }
      update();
    }),
  );

  addBtn.addEventListener('click', () => {
    if (!current) return;
    addToCart({
      id: current.id,
      name: `${current.name} Hediye Seti`,
      meta: current.note ? current.note : 'Hediye seti',
      price: current.price,
      image: current.thumb,
      url: url('/hediye-setleri/'),
    });
  });

  update();
}
