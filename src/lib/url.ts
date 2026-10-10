// Site bir alt yolda (ör. GitHub Pages: kullanici.github.io/depo-adi/) yayınlanabilir.
// Tüm iç bağlantılar bu yardımcıyla üretilir; BASE_URL astro.config.mjs'deki `base` değeridir.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** '/koleksiyon/' → '/depo-adi/koleksiyon/' */
export const url = (path: string) => BASE + path;

/** '/depo-adi/koleksiyon/' → '/koleksiyon/' */
export const stripBase = (path: string) => (BASE && path.startsWith(BASE) ? path.slice(BASE.length) || '/' : path);
