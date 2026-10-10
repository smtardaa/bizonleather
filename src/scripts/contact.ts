// İletişim formu: doğrular ve mesajı kullanıcının e-posta uygulamasında hazırlar (mailto).
const EMAIL = 'leatherbizon@gmail.com';

export function init(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-ct-form]')!;
  const done = root.querySelector<HTMLElement>('[data-ct-done]')!;
  let lastBody = '';

  // URL'den konu ön seçimi (?konu=kurumsal)
  const konu = new URL(location.href).searchParams.get('konu');
  if (konu) {
    const r = form.querySelector<HTMLInputElement>(`input[name="topic"][value="${CSS.escape(konu)}"]`);
    if (r) r.checked = true;
  }

  const setErr = (el: HTMLInputElement | HTMLTextAreaElement, msg: string) => {
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const e = el.parentElement!.querySelector('.f-err');
    if (e) e.textContent = msg;
  };

  const validate = () => {
    const name = form.elements.namedItem('name') as HTMLInputElement;
    const email = form.elements.namedItem('email') as HTMLInputElement;
    const msg = form.elements.namedItem('message') as HTMLTextAreaElement;
    let ok = true;
    let first: HTMLElement | null = null;
    const check = (el: HTMLInputElement | HTMLTextAreaElement, cond: boolean, m: string) => {
      setErr(el, cond ? '' : m);
      if (!cond) {
        ok = false;
        first ??= el;
      }
    };
    check(name, name.value.trim().length > 1, 'Adınızı yazın.');
    check(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), 'Geçerli bir e-posta adresi yazın.');
    check(msg, msg.value.trim().length > 4, 'Kısa bir mesaj yazın.');
    (first as HTMLElement | null)?.focus();
    return ok;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData(form);
    const topicEl = form.querySelector<HTMLInputElement>('input[name="topic"]:checked');
    const topic = topicEl?.parentElement?.textContent?.trim() || 'Genel';
    const lines = [
      String(fd.get('message')).trim(),
      '',
      '—',
      `Ad: ${String(fd.get('name')).trim()}`,
      `E-posta: ${String(fd.get('email')).trim()}`,
      fd.get('phone') ? `Telefon: ${String(fd.get('phone')).trim()}` : '',
      fd.get('order') ? `Sipariş no: ${String(fd.get('order')).trim()}` : '',
    ].filter((l, i) => l !== '' || i < 2);
    lastBody = lines.join('\n');
    const subject = `${topic} — ${String(fd.get('name')).trim()}`;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lastBody)}`;
    done.hidden = false;
  });

  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.getAttribute('aria-invalid') === 'true') setErr(t, '');
  });

  const copy = async (text: string, btn: HTMLElement) => {
    try {
      await navigator.clipboard.writeText(text);
      const old = btn.textContent;
      btn.textContent = 'Kopyalandı';
      setTimeout(() => (btn.textContent = old), 1600);
    } catch {
      btn.textContent = 'Kopyalanamadı';
    }
  };
  root.querySelector<HTMLElement>('[data-ct-copymsg]')!.addEventListener('click', (e) => copy(lastBody, e.currentTarget as HTMLElement));
  root.querySelectorAll<HTMLElement>('[data-copy]').forEach((b) => b.addEventListener('click', () => copy(b.dataset.copy!, b)));
}
