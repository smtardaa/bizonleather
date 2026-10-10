// SSS: Türkçe duyarlı anlık arama; eşleşmeler vurgulanır ve açılır.
const norm = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i');

export function init(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('[data-faq-q]')!;
  const count = root.querySelector<HTMLElement>('[data-faq-count]')!;
  const empty = root.querySelector<HTMLElement>('[data-faq-empty]')!;
  const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-faq-group]'));
  const items = Array.from(root.querySelectorAll<HTMLDetailsElement>('[data-faq-item]'));
  const orig = new Map(items.map((d) => [d, { q: d.querySelector('summary span')!.textContent!, a: d.querySelector('p')!.textContent! }]));

  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const highlight = (text: string, q: string) => {
    if (!q) return esc(text);
    const n = norm(text);
    let out = '';
    let i = 0;
    let at = n.indexOf(q);
    while (at !== -1) {
      out += esc(text.slice(i, at)) + '<mark>' + esc(text.slice(at, at + q.length)) + '</mark>';
      i = at + q.length;
      at = n.indexOf(q, i);
    }
    return out + esc(text.slice(i));
  };

  let t = 0;
  const run = () => {
    const q = norm(input.value.trim());
    let shown = 0;
    items.forEach((d) => {
      const o = orig.get(d)!;
      const hit = !q || norm(o.q).includes(q) || norm(o.a).includes(q);
      d.hidden = !hit;
      d.querySelector('summary span')!.innerHTML = highlight(o.q, q);
      d.querySelector('p')!.innerHTML = highlight(o.a, q);
      if (q && hit && q.length > 2) d.open = true;
      if (!q) d.open = false;
      if (hit) shown++;
    });
    groups.forEach((g) => (g.hidden = !g.querySelector('[data-faq-item]:not([hidden])')));
    empty.hidden = shown > 0;
    count.textContent = q ? `${shown} sonuç` : '';
  };
  input.addEventListener('input', () => {
    clearTimeout(t);
    t = window.setTimeout(run, 120);
  });

  // Bağlantıyla gelinen başlığın ilk sorusunu aç
  if (location.hash) {
    const g = root.querySelector<HTMLElement>(location.hash);
    const first = g?.querySelector<HTMLDetailsElement>('details');
    if (first) first.open = true;
  }
}
