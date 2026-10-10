// Tüm içerik bizonleather.com (Shopify) ürün verisinden alınmıştır.
// Fiyatlar TRY. `compareAt` = indirim öncesi fiyat (açılışa özel %10 indirim).
import type { ImageMetadata } from 'astro';
import { url } from '../lib/url';

const imgs = import.meta.glob<{ default: ImageMetadata }>('../assets/img/*.jpg', { eager: true });
export const img = (name: string): ImageMetadata => {
  const m = imgs[`../assets/img/${name}.jpg`];
  if (!m) throw new Error(`Görsel bulunamadı: ${name}`);
  return m.default;
};

export const STORE = 'https://www.bizonleather.com';

export type ColorKey = 'yesil' | 'kahverengi';
export const COLORS: Record<ColorKey, { label: string; swatch: string }> = {
  yesil: { label: 'Yeşil', swatch: '#1f4a35' },
  kahverengi: { label: 'Kahverengi', swatch: '#7a4a2a' },
};

export interface Variant {
  id: number;
  color: ColorKey | null;
  available: boolean;
  images: string[];
}

export interface Product {
  slug: string;
  handle: string; // Shopify handle
  name: string;
  kind: string;
  category: 'cuzdan' | 'ajanda' | 'matara';
  price: number;
  compareAt: number;
  lead: string;
  features: { title: string; text: string }[];
  why: string;
  details: [string, string][];
  note: string;
  personalizable?: boolean;
  variants: Variant[];
}

const CARE =
  'Hakiki deri ürünlerin doğal dokusu zamanla kullanıma bağlı olarak karakteristik bir görünüm kazanır. Ürününüzü uzun yıllar korumak için nemli bir bezle temizleyip kuru bir ortamda saklayabilirsiniz.';

export const products: Product[] = [
  {
    slug: 'veyra',
    handle: 'veyra-hakiki-deri-para-masali-kisisellestirilebilir-cuzdan',
    name: 'Veyra',
    kind: 'Para maşalı deri cüzdan',
    category: 'cuzdan',
    price: 850,
    compareAt: 950,
    lead:
      'Zarafet ve pratikliği bir arada sunan Veyra, hakiki deri dokusu ve şık tasarımıyla günlük kullanımınıza eşlik ediyor. İnce yapısı, güçlü metal para maşası ve kullanışlı kart gözleriyle cebinizde şişkinlik yapmaz.',
    features: [
      { title: 'Hakiki deri dokusu', text: 'Uzun ömürlü kullanım sunar ve zamanla kullanıma bağlı olarak kendine has bir karakter (patina) kazanır.' },
      { title: 'Metal para maşası', text: 'Banknotlarınızı katlamadan, güvenle ve tek elle kolayca tutmanızı sağlar.' },
      { title: 'İnce tasarım', text: 'Cebinizde yer kaplamaz, şişkinlik yapmaz.' },
      { title: 'Kart gözleri', text: 'Kredi kartlarınıza ve kimliklerinize hızlı erişim sağlayan bölmeler.' },
      { title: 'Kişiye özel', text: 'İsim, tarih veya baş harf seçenekleriyle size özel hale getirilebilir.' },
    ],
    why:
      'Veyra sadece bir cüzdan değil, tarzınızı yansıtan bir detay. Kişiselleştirme seçeneğiyle sevdiklerinize verebileceğiniz hediyeye duygusal bir değer katar.',
    details: [
      ['Materyal', 'Hakiki deri'],
      ['Renk', 'Kahverengi / Yeşil'],
      ['Kapanış', 'Metal para maşası'],
      ['Bölmeler', 'Çift taraflı kart gözleri, para maşası'],
      ['Kişiselleştirme', 'İsim, tarih veya baş harf baskısı (opsiyonel)'],
    ],
    note: CARE,
    personalizable: true,
    variants: [
      { id: 44266441375831, color: 'yesil', available: true, images: ['veyra-6', 'veyra-0', 'veyra-5'] },
      { id: 44266441343063, color: 'kahverengi', available: true, images: ['veyra-3', 'veyra-1', 'veyra-2', 'veyra-4'] },
    ],
  },
  {
    slug: 'atlas',
    handle: 'atlas-yesil-deri-para-masali-cuzdan',
    name: 'Atlas',
    kind: 'Para maşalı deri cüzdan',
    category: 'cuzdan',
    price: 720,
    compareAt: 800,
    lead:
      'Minimalist tarzı ve dikkat çekici dokusuyla Atlas, şıklığı ve pratikliği bir arada arayanlar için tasarlandı. Geleneksel cüzdanların şişkinliğine son veren ince yapısı sayesinde cebinizde neredeyse yok gibi hissettirir.',
    features: [
      { title: 'Hakiki deri', text: 'Uzun ömürlü kullanım sunan, dokusu ve rengiyle göz alıcı deri malzeme.' },
      { title: 'Pirinç çıtçıt', text: 'Kapağın güvenle kapanmasını sağlayan, vintage görünümlü pirinç çıtçıt.' },
      { title: 'Para maşası', text: 'Banknotlarınızı katlamadan, tek elle kolayca tutmanızı sağlar.' },
      { title: 'Kart gözü', text: 'Kartlarınıza ve kimliğinize hızlı erişim.' },
      { title: 'Ultra ince', text: 'Cebinizde şişkinlik yapmaz, gün boyu konforlu kullanım sağlar.' },
    ],
    why:
      'Atlas, sadece bir para maşası değil, tarzınızı yansıtan bir detay. Hem erkekler hem kadınlar için uygun minimalist bir tasarım.',
    details: [
      ['Materyal', 'Hakiki deri'],
      ['Renk', 'Yeşil / Kahverengi, pirinç detay'],
      ['Kapanış', 'Pirinç çıtçıt'],
      ['Bölmeler', 'Kart gözü ve para maşası'],
      ['Stil', 'Minimalist / Unisex'],
    ],
    note: CARE,
    variants: [
      { id: 44277937406039, color: 'yesil', available: true, images: ['atlas-0', 'atlas-1', 'atlas-2'] },
      { id: 44277937373271, color: 'kahverengi', available: true, images: ['atlas-3', 'atlas-4', 'atlas-5'] },
    ],
  },
  {
    slug: 'daren',
    handle: 'daren-vintage-hakiki-deri-cuzdan',
    name: 'Daren',
    kind: 'Bifold deri cüzdan',
    category: 'cuzdan',
    price: 1125,
    compareAt: 1250,
    lead:
      'Karakteri ve tarzıyla fark yaratan Daren, vintage dokulu hakiki derisi ve özel mavi dikiş detaylarıyla öne çıkıyor. Zamanla kullanıma bağlı olarak kendine has bir patina kazanan deri yapısı, nostalji ve derinlik sunar.',
    features: [
      { title: 'Vintage hakiki deri', text: 'Çizilmeye dayanıklı, kalın ve dokulu hakiki deri.' },
      { title: 'Mavi dikiş', text: 'Deriyle kontrast oluşturan mavi iplik dikişleri ürüne modern bir karakter katar.' },
      { title: 'Kabartma bizon logosu', text: 'bizon.leather kalitesini simgeleyen kabartma logo.' },
      { title: 'Çift taraflı kart gözleri', text: 'Kartlarınıza ve kimliklerinize kolay erişim için geniş bölmeler.' },
      { title: 'Banknot bölmesi', text: 'Banknotlarınızı katlamadan taşıyabileceğiniz geniş iç hacim.' },
    ],
    why:
      'Daren, sıradan bir cüzdanın ötesinde, günlük stilinize rustik ve sofistike bir dokunuş katan bir aksesuar.',
    details: [
      ['Materyal', 'Hakiki deri (vintage doku)'],
      ['Renk', 'Kahverengi / Yeşil, mavi dikiş'],
      ['Tasarım', 'Çift katlı (bifold) cüzdan'],
      ['Bölmeler', 'Çift taraflı kart gözleri, banknot bölmesi'],
      ['Logo', 'Kabartma bizon (bizon.leather)'],
    ],
    note: CARE,
    variants: [
      { id: 44277938454615, color: 'kahverengi', available: true, images: ['daren-0', 'daren-1', 'daren-2'] },
      { id: 44277938487383, color: 'yesil', available: true, images: ['daren-3', 'daren-4', 'daren-5'] },
    ],
  },
  {
    slug: 'kora',
    handle: 'kora-hakiki-deri-trifold-cuzdan',
    name: 'Kora',
    kind: 'Trifold deri cüzdan',
    category: 'cuzdan',
    price: 990,
    compareAt: 1100,
    lead:
      'Damarlı hakiki deri dokusu ve üç katlı tasarımıyla Kora, ihtiyaç duyduğunuz tüm kartları ve nakit parayı tek bir yerde, güvenle taşımanızı sağlar. Kullanıma bağlı olarak zamanla kendine has bir karakter kazanır.',
    features: [
      { title: 'Damarlı hakiki deri', text: 'Uzun ömürlü kullanım sunar, kolay kolay yıpranmaz.' },
      { title: 'Trifold tasarım', text: 'Açıldığında geniş kullanım alanı, kapandığında minimal yer.' },
      { title: 'Şeffaf kimlik gözü', text: 'Kimliğinizi çıkarmadan gösterebileceğiniz şeffaf pencere.' },
      { title: 'Çoklu kart gözleri', text: 'Kartlarınızı düzenli saklayabileceğiniz geniş bölmeler.' },
      { title: 'Kabartma bizon logosu', text: 'Sol alt köşede, el işçiliğinin imzası.' },
    ],
    why:
      'Kora, geniş kart ve nakit kapasitesiyle kalabalık cüzdanlara son veren, günlük stilinizi tamamlayan pratik bir aksesuar.',
    details: [
      ['Materyal', 'Hakiki deri'],
      ['Renk', 'Kahverengi / Yeşil (damarlı doku)'],
      ['Tasarım', 'Trifold (üç katlı) cüzdan'],
      ['Bölmeler', 'Kart gözleri, şeffaf kimlik penceresi, nakit bölmesi'],
      ['Logo', 'Kabartma bizon (bizon.leather)'],
    ],
    note: CARE,
    variants: [
      { id: 44277882323031, color: 'kahverengi', available: true, images: ['kora-0', 'kora-1'] },
      { id: 44277882355799, color: 'yesil', available: true, images: ['kora-2', 'kora-3'] },
    ],
  },
  {
    slug: 'journals',
    handle: 'journals-deri-ajanda-kilifi-coklu-defter-tutucu',
    name: "Journal's",
    kind: 'Deri ajanda kılıfı',
    category: 'ajanda',
    price: 900,
    compareAt: 990,
    lead:
      "Yazma tutkunuzu sanata dönüştüren Journal's, birden fazla ajandanızı veya defterinizi tek bir yerde, şık ve güvenli biçimde bir arada tutar. Vintage hakiki deri dokusu ve mavi elastik bandıyla hem koruyucu bir kılıf hem de tarzınızı yansıtan bir aksesuar.",
    features: [
      { title: 'Çoklu ajanda tutucu', text: 'Birden fazla defteri veya ajandayı tek bir kapak altında toplar.' },
      { title: 'Vintage hakiki deri', text: 'Dokulu hakiki deri; zamanla kendine has bir patina kazanır.' },
      { title: 'Mavi elastik bant', text: 'Ajandalarınızı sabit tutar, kapağın düzgün durmasını sağlar.' },
      { title: 'Metal figürler', text: 'Saat, anahtar ve spiral figürleri nostaljik bir karakter katar.' },
      { title: 'Değiştirilebilir iç defterler', text: 'İçindeki ajandalar bittiğinde kolayca yenilerini takabilirsiniz.' },
    ],
    why:
      "Journal's sadece bir kılıf değil, yaratıcılığınızı besleyen bir araç. Sanatçılar, yazarlar, seyahat severler ve günlük tutanlar için.",
    details: [
      ['Materyal', 'Hakiki deri (vintage doku)'],
      ['Renk', 'Koyu ton, mavi detaylar'],
      ['Kapanış', 'Mavi elastik bant'],
      ['Kapasite', 'Çoklu ajanda / defter'],
      ['Aksesuar', 'Saat, anahtar ve spiral metal figürler'],
    ],
    note: CARE,
    variants: [{ id: 44269591396439, color: null, available: true, images: ['journals-0', 'journals-1'] }],
  },
  {
    slug: 'matara',
    handle: '25-oz-deri-kaplamali-paslanmaz-celik-matara',
    name: 'Matara',
    kind: 'Deri kaplı paslanmaz çelik matara',
    category: 'matara',
    price: 1170,
    compareAt: 1300,
    lead:
      'Hakiki deri kaplaması ve paslanmaz çelik gövdesiyle hem şıklığı hem işlevselliği bir arada sunar. İster doğa yürüyüşünde, ister kamp ateşi başında, ister şehirde.',
    features: [
      { title: 'Paslanmaz çelik gövde', text: 'Gıdaya uygun, paslanmaya dirençli; içeceğinizin tadını değiştirmez.' },
      { title: 'Hakiki deri kaplama', text: 'Ortadan geçen dikiş detayı ve alttaki kabartma logo el işçiliğini yansıtır.' },
      { title: 'Güvenli kapak', text: 'Menteşeli, sızdırmaz vidalı kapak; çantanızda sızıntı yapmaz.' },
      { title: 'Dayanıklı yüzey', text: 'Çizilmeye karşı korumalı deri kaplama.' },
    ],
    why:
      'Sadece bir içecek kabı değil, tarzınızı yansıtan bir aksesuar. Kampçılar, doğa sporu tutkunları ve klasik tarzı sevenler için.',
    details: [
      ['Materyal', 'Paslanmaz çelik + hakiki deri'],
      ['Renk', 'Kahverengi / Yeşil, çelik gövde'],
      ['Kapak', 'Menteşeli, sızdırmaz vidalı'],
    ],
    note: 'Ürünün uzun ömürlü olması için elde yıkanması ve deri kısmının uzun süre suya maruz bırakılmaması önerilir.',
    variants: [
      { id: 44277940715607, color: 'kahverengi', available: true, images: ['matara-3', 'matara-4', 'matara-5'] },
      { id: 44277940748375, color: 'yesil', available: false, images: ['matara-0', 'matara-1', 'matara-2'] },
    ],
  },
];

export interface GiftSet {
  slug: string;
  handle: string;
  id: number;
  name: string;
  items: ('cuzdan' | 'matara' | 'zippo')[];
  price: number;
  image: string;
  note?: string;
}

export const sets: GiftSet[] = [
  { slug: 'cuzdan-matara', handle: 'cuzdan-matara-hediye-seti', id: 44308343095383, name: 'Cüzdan + Matara', items: ['cuzdan', 'matara'], price: 1300, image: 'set-cuzdan-matara' },
  { slug: 'matara-zippo', handle: 'matara-zippo-hediye-seti', id: 44308342702167, name: 'Matara + Zippo', items: ['matara', 'zippo'], price: 1200, image: 'set-matara-zippo' },
  { slug: 'cuzdan-zippo-kompakt', handle: 'cuzdan-zippo-hediye-seti-1', id: 44308342079575, name: 'Cüzdan + Zippo', items: ['cuzdan', 'zippo'], price: 1200, image: 'set-cuzdan-zippo-a', note: 'Çıtçıtlı kompakt cüzdan' },
  { slug: 'cuzdan-zippo-bifold', handle: 'cuzdan-zippo-hediye-seti', id: 44308340736087, name: 'Cüzdan + Zippo', items: ['cuzdan', 'zippo'], price: 1700, image: 'set-cuzdan-zippo-b', note: 'Bifold cüzdan' },
  { slug: 'uclu', handle: 'matara-cuzdan-zippo-hediye-seti', id: 44308341751895, name: 'Matara + Cüzdan + Zippo', items: ['matara', 'cuzdan', 'zippo'], price: 2000, image: 'set-uclu' },
];

export const ITEM_LABEL = { cuzdan: 'Cüzdan', matara: 'Matara', zippo: 'Zippo' } as const;

export const tl = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n) + ' TL';

export const productUrl = (p: Product) => url(`/urun/${p.slug}/`);
export const storeUrl = (handle: string, variant?: number) =>
  `${STORE}/products/${handle}${variant ? `?variant=${variant}` : ''}`;
export const coverImage = (p: Product) => p.variants[0].images[0];
export const colorsOf = (p: Product) => p.variants.filter((v) => v.color).map((v) => v.color as ColorKey);

// Büyük harfli başlıklarda marka adının Türkçe İ ile yazılmasını önler (ZIPPO, ZİPPO değil).
export const brandHtml = (s: string) => s.replace(/Zippo/g, '<span lang="en">Zippo</span>');
