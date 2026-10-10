# Bizon Leather — web sitesi

Astro 5 + GSAP ile statik olarak üretilen, Türkçe, çok sayfalı site. İçerik ve görseller
bizonleather.com (Shopify) mağazasından alınmıştır.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ klasörüne statik çıktı
npm run preview
```

## GitHub Pages'te yayınlama

Derleme GitHub'ın kendisinde yapılır ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).
`index.html` ve diğer sayfalar her `main` gönderiminde otomatik üretilir; depoya eklenmez.

1. Bu klasörü bir GitHub deposuna gönderin (`node_modules` ve `dist` .gitignore ile hariçtir).
2. Depo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. `main` dalına her gönderimde site derlenir ve yayınlanır (Actions sekmesinden izlenebilir).

Adres ve alt yol otomatik ayarlanır: `kullanici.github.io/depo-adi/`, `kullanici.github.io`
veya Pages ayarlarından eklenen özel alan adı (ör. `www.bizonleather.com`) için ek ayar gerekmez.
İç bağlantılar her zaman `src/lib/url.ts` içindeki `url()` ile yazılmalıdır.

## Yapı

- `src/data/products.ts` — ürünler, varyant (Shopify) kimlikleri, fiyatlar, hediye setleri
- `src/data/site.ts` — iletişim bilgileri, menü, SSS
- `src/components/` — başlık/menü, sepet çekmecesi, geçiş perdesi, baskı stüdyosu, set seçici
- `src/scripts/` — sayfa modülleri (yalnızca ilgili sayfada yüklenir)
  - `emboss.ts` — WebGL sıcak gömme baskı simülasyonu (imza etkileşim)
  - `curtain.ts` — sayfa geçişi; `hero.ts`, `atelier.ts`, `collection.ts`, `product.ts` …
- `src/styles/global.css` — tasarım belirteçleri (renk, tipografi, hareket eğrileri)

## Sepet ve ödeme

Sepet tarayıcıda (localStorage) tutulur. "Güvenli ödemeye geç" ve "Hemen satın al",
Shopify cart permalink'i (`https://www.bizonleather.com/cart/{varyantId}:{adet}`) ile mevcut
mağazanın ödeme sayfasını açar. Fiyat/stok değişirse `src/data/products.ts` güncellenmelidir
(ya da ileride Shopify Storefront API'ye bağlanabilir).

## İletişim formu

Sunucu tarafı yoktur; form, mesajı kullanıcının e-posta uygulamasında `mailto:` ile hazırlar.
Gerçek gönderim için bir form servisi (ör. Shopify iletişim formu, Formspree) bağlanabilir.
