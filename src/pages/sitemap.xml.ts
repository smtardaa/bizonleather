import type { APIRoute } from 'astro';
import { products } from '../data/products';
import { url } from '../lib/url';

const pages = ['/', '/koleksiyon/', '/hediye-setleri/', '/kisisellestir/', '/atolye/', '/sss/', '/iletisim/', '/teslimat-ve-iade/', '/gizlilik/'];

export const GET: APIRoute = ({ site }) => {
  const urls = [...pages, ...products.map((p) => `/urun/${p.slug}/`)].map(url);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u, site).href}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
