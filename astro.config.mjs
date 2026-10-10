import { defineConfig } from 'astro/config';

// GitHub Actions bu iki değeri depo ayarlarından otomatik doldurur
// (bkz. .github/workflows/deploy.yml). Yerelde varsayılanlar kullanılır.
//   SITE_URL  → https://kullanici.github.io   (veya özel alan adı)
//   BASE_PATH → /depo-adi                      (kullanici.github.io deposunda veya özel alan adında boş)
const site = process.env.SITE_URL || 'https://www.bizonleather.com';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
