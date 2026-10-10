import { gsap } from 'gsap';
import { reduceMotion } from './motion';

// Yerel sepet. Ödeme, Shopify "cart permalink" ile mevcut mağazanın
// güvenli ödeme sayfasına aktarılır: /cart/{variantId}:{adet},...
export interface CartLine {
  id: number;
  name: string;
  meta: string;
  price: number;
  image: string;
  url: string;
  qty: number;
}

const KEY = 'bizon-cart-v1';
const FREE_SHIP = 3000;
const fmt = (n: number) => new Intl.NumberFormat('tr-TR').format(n) + ' TL';

let lines: CartLine[] = [];

const load = () => {
  try {
    lines = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(lines)) lines = [];
  } catch {
    lines = [];
  }
};
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {}
};

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);

function render() {
  const dlg = $<HTMLDialogElement>('[data-cart]');
  if (!dlg) return;
  const list = dlg.querySelector<HTMLElement>('[data-cart-items]')!;
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);

  document.querySelectorAll('[data-cart-count]').forEach((c) => (c.textContent = String(count)));
  dlg.querySelector<HTMLElement>('[data-cart-empty]')!.hidden = lines.length > 0;
  dlg.querySelector<HTMLElement>('[data-cart-foot]')!.hidden = lines.length === 0;
  dlg.querySelector<HTMLElement>('[data-cart-total]')!.textContent = fmt(total);

  const pct = Math.min(100, (total / FREE_SHIP) * 100);
  dlg.querySelector<HTMLElement>('[data-ship-bar]')!.style.width = pct + '%';
  dlg.querySelector<HTMLElement>('[data-ship-text]')!.textContent =
    total === 0
      ? '3.000 TL ve üzeri siparişlerde kargo ücretsiz.'
      : total >= FREE_SHIP
        ? 'Kargo ücretsiz. Türkiye geneli.'
        : `Ücretsiz kargoya ${fmt(FREE_SHIP - total)} kaldı.`;

  const store = dlg.dataset.store!;
  const checkout = dlg.querySelector<HTMLAnchorElement>('[data-cart-checkout]')!;
  checkout.href = lines.length ? `${store}/cart/${lines.map((l) => `${l.id}:${l.qty}`).join(',')}` : '#';

  list.innerHTML = '';
  for (const l of lines) {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${l.image}" alt="" width="76" height="76" loading="lazy" />
      <div>
        <a class="ci-name link-u" href="${l.url}"></a>
        <div class="ci-meta mono"></div>
        <div class="qty" role="group" aria-label="Adet">
          <button type="button" data-dec aria-label="Azalt">−</button>
          <output aria-live="polite">${l.qty}</output>
          <button type="button" data-inc aria-label="Artır">+</button>
        </div>
      </div>
      <div style="text-align:right">
        <div class="price">${fmt(l.price * l.qty)}</div>
        <button type="button" class="ci-remove" data-remove>Kaldır</button>
      </div>`;
    li.querySelector('.ci-name')!.textContent = l.name;
    li.querySelector('.ci-meta')!.textContent = l.meta;
    li.querySelector('[data-dec]')!.addEventListener('click', () => setQty(l.id, l.qty - 1));
    li.querySelector('[data-inc]')!.addEventListener('click', () => setQty(l.id, l.qty + 1));
    li.querySelector('[data-remove]')!.addEventListener('click', () => setQty(l.id, 0));
    list.appendChild(li);
  }
}

function setQty(id: number, qty: number) {
  const l = lines.find((x) => x.id === id);
  if (!l) return;
  if (qty <= 0) lines = lines.filter((x) => x.id !== id);
  else l.qty = Math.min(qty, 20);
  save();
  render();
}

export function addToCart(line: Omit<CartLine, 'qty'>, qty = 1) {
  load();
  const ex = lines.find((l) => l.id === line.id);
  if (ex) ex.qty = Math.min(ex.qty + qty, 20);
  else lines.push({ ...line, qty });
  save();
  render();
  document.querySelectorAll('[data-cart-count]').forEach((c) => {
    c.classList.remove('bump');
    void (c as HTMLElement).offsetWidth;
    c.classList.add('bump');
  });
  openCart();
}

export function openCart() {
  const dlg = $<HTMLDialogElement>('[data-cart]');
  if (!dlg || dlg.open) return;
  render();
  dlg.showModal();
  document.documentElement.style.overflow = 'hidden';
  if (!reduceMotion()) {
    gsap.fromTo(dlg, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: 'expo.out' });
    gsap.fromTo(
      dlg.querySelectorAll('.cart-item, .cart-empty > *'),
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out', delay: 0.12 },
    );
  }
}

function closeCart(instant = false) {
  const dlg = $<HTMLDialogElement>('[data-cart]');
  if (!dlg || !dlg.open) return;
  const done = () => {
    dlg.close();
    document.documentElement.style.overflow = '';
  };
  if (instant || reduceMotion()) return done();
  gsap.to(dlg, { xPercent: 100, duration: 0.45, ease: 'expo.in', onComplete: done });
}

export function initCart() {
  load();
  render();
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const quick = t.closest<HTMLElement>('[data-quick-add]');
    if (quick) {
      try {
        addToCart(JSON.parse(quick.dataset.quickAdd!));
      } catch {}
      return;
    }
    if (t.closest('[data-cart-open]')) openCart();
    else if (t.closest('[data-cart-close]')) closeCart();
  });
  const dlg = $<HTMLDialogElement>('[data-cart]')!;
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeCart();
  });
  // Arka plana tıklayınca kapan
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) closeCart();
    const a = (e.target as HTMLElement).closest('a');
    if (a && a.getAttribute('href')?.startsWith('/')) setTimeout(() => closeCart(true), 560);
  });
  addEventListener('storage', (e) => {
    if (e.key === KEY) {
      load();
      render();
    }
  });
}
