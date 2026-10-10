// Kaynak: bizonleather.com — İletişim, Hakkımızda, SSS, Teslimat, İade ve Gizlilik sayfaları.
export const SITE = {
  name: 'Bizon Leather',
  url: 'https://www.bizonleather.com',
  email: 'leatherbizon@gmail.com',
  instagram: 'bizongoods',
  instagramUrl: 'https://www.instagram.com/bizongoods/',
  city: 'Eskişehir',
  hours: 'Hafta içi 09:00 – 18:00',
  description:
    "Bizon Leather — Eskişehir'deki atölyesinde %100 hakiki sığır derisinden el yapımı cüzdan, kartlık, ajanda kılıfı ve matara üreten yerli deri aksesuar markası.",
};

export const NAV = [
  { href: '/koleksiyon/', label: 'Koleksiyon', note: 'Cüzdan, ajanda kılıfı, matara' },
  { href: '/hediye-setleri/', label: 'Hediye Setleri', note: 'Kutusunda, hediyeye hazır' },
  { href: '/kisisellestir/', label: 'Adını Bas', note: 'Sıcak gömme baskı stüdyosu' },
  { href: '/atolye/', label: 'Atölye', note: 'Eskişehir, el işçiliği' },
  { href: '/sss/', label: 'Sorular', note: 'Deri, baskı, kargo, iade' },
  { href: '/iletisim/', label: 'İletişim', note: 'leatherbizon@gmail.com' },
];

export type Faq = { q: string; a: string };
export const FAQ: { group: string; items: Faq[] }[] = [
  {
    group: 'Marka',
    items: [
      { q: 'Bizon Leather nasıl bir markadır?', a: "2026 yılında Eskişehir'de iki arkadaşın ortak fikriyle kurulan, tasarım ve el işçiliği süreçlerini kendi bünyesinde yürüten yerli bir deri aksesuar markasıdır. Cüzdan, kartlık, çanta ve kemer gibi ürün gruplarında el emeğiyle hazırlanan koleksiyonlar sunar." },
      { q: 'Yerli üretim mi?', a: "Evet. %100 Türk sermayeli ve Eskişehir'deki atölyesinde el işçiliğiyle üretim yapan yerli bir markadır." },
      { q: 'Ürünleriniz nerede üretiliyor?', a: "Tüm ürünlerimiz Eskişehir'deki kendi atölyemizde, tasarım aşamasından son dikişine kadar el işçiliğiyle üretilmektedir." },
      { q: 'Ürünleriniz fabrika üretimi mi, el yapımı mı?', a: 'Ürünlerimizin tamamı el yapımıdır. Kesim, şekillendirme, dikiş ve perdah süreçlerinin tamamı usta ellerde hazırlanır.' },
      { q: 'Neden el yapımı deri ürün tercih etmeliyim?', a: 'El yapımı deri ürünler, seri üretim ürünlere göre daha dayanıklıdır. Her bir dikiş elde özel tekniklerle (geleneksel saraç dikişi vb.) kilitlendiği için ip kopması durumunda sökülme yapmaz ve uzun ömürlü kullanım sunar.' },
      { q: 'Sizi diğer deri markalarından ayıran nedir?', a: "Eskişehir'deki atölyemizde tamamen el işçiliğiyle üretim yapmamız, %100 hakiki sığır derisi kullanmamız, aracı olmadan doğrudan müşteriye ulaşmamız ve geleneksel zanaatı modern tasarımla buluşturmamız." },
      { q: 'Fiziki mağaza açacak mısınız?', a: 'Şu an için ürünlerimizi aracısız ve en uygun fiyatlarla ulaştırmak adına yalnızca kendi web sitemiz ve sosyal medya kanallarımız üzerinden satış yapıyoruz. İlerleyen süreçte fiziki deneyim alanlarımızı duyuracağız.' },
    ],
  },
  {
    group: 'Deri',
    items: [
      { q: 'Ürünleriniz %100 hakiki deri mi?', a: 'Evet. Ürünlerimizin tamamı %100 hakiki sığır derisinden imal edilir. Yapay, sentetik veya teknolojik deri alternatifleri kullanılmaz.' },
      { q: 'Derilerinizi nereden temin ediyorsunuz?', a: "Hakiki sığır derilerini, Türkiye'nin köklü tabakhanelerinden biri olan İstanbul merkezli Akgün Deri'den temin ediyoruz." },
      { q: 'Hangi hayvanın derisi kullanılıyor?', a: 'Dayanıklılığı, lif yapısı ve kalitesi yüksek olan %100 hakiki sığır derisi.' },
      { q: 'Deri üzerinde çizik veya doku farklılığı normal mi?', a: 'Evet, çok doğaldır. Ton farklılıkları, gözenekler ve hafif çizikler ürünün sentetik değil, hakiki deri olduğunun kanıtıdır.' },
      { q: 'Hakiki deri ile suni deri nasıl ayırt edilir?', a: 'Hakiki deri dokunulduğunda sıcak bir his verir, kendine has doğal bir kokusu vardır ve zamanla eskiyerek güzelleşir. Suni deri plastik kokuludur, yüzey deseni tamamen simetriktir ve zamanla soyulur.' },
      { q: 'Astar veya iç dolgu kullanıyor musunuz?', a: 'Naylon veya kumaş astar yerine derinin kendi yapısını kullanmayı tercih ediyoruz. Ürünlerimizin tamamı %100 deridir.' },
      { q: 'Deri cüzdan zamanla esner mi?', a: 'Hakiki deri, kullanımınıza ve içindeki kart/nakit yoğunluğuna göre hafif bir esneklik kazanır ve kullanımınızın şeklini alır. Bu, derinin doğal yapısının bir parçasıdır.' },
    ],
  },
  {
    group: 'Seçim',
    items: [
      { q: 'Hangi ürün gruplarını sunuyorsunuz?', a: 'Ürün gamımızda hakiki sığır derisinden cüzdan, kartlık, çanta ve kemer modelleri bulunmaktadır.' },
      { q: 'Dikey mi yatay cüzdan mı?', a: 'Dikey cüzdanlar ön ve arka ceplerde daha az yer kaplar. Yatay cüzdanlar daha geniş kağıt para alanı ve yüksek kart kapasitesi arayanlar için idealdir.' },
      { q: 'Cüzdan mı kartlık mı?', a: 'Ağırlıklı olarak kart kullanıp az nakit taşıyorsanız minimalist kartlıklarımızı; çok sayıda kart, kimlik ve nakdi bir arada taşımak istiyorsanız cüzdan modellerimizi tercih edebilirsiniz.' },
      { q: 'Deri kemer ölçüsünü nasıl seçmeliyim?', a: 'Kullandığınız bir kemerin toka hizasından en çok taktığınız deliğe kadar olan mesafeyi ölçebilir veya pantolon bedeninizin 5–10 cm üzerindeki ölçüyü tercih edebilirsiniz.' },
    ],
  },
  {
    group: 'Kişiselleştirme',
    items: [
      { q: 'Kişiye özel isim baskısı yapıyor musunuz?', a: 'Evet. Seçili cüzdan ve kartlık modellerimizde isim, baş harf veya tarih baskısı hizmetimiz mevcuttur.' },
      { q: 'Baskıyı hangi teknikle yapıyorsunuz?', a: 'Sıcak baskı / gömme baskı tekniğiyle, derinin dokusuna işleyerek uyguluyoruz.' },
      { q: 'Sıcak gömme baskının lazer baskıdan farkı nedir?', a: 'Lazer baskı deriyi yakarak siyah bir iz bırakır ve zamanla yüzeysel kalabilir. Sıcak gömme baskı ise özel pirinç harflerin ısıyla deriye bastırılmasıyla yapılır; deriyi yakmaz, dokusunu çökertir ve kalıcı bir görünüm sağlar.' },
      { q: 'İsim baskısı zamanla silinir mi?', a: 'Hayır. Sıcak gömme baskıda boya veya yüzeysel kaplama kullanılmadığı için baskı derinin kendi dokusunda kalıcıdır; silinmez, akmaz, soyulmaz.' },
      { q: 'İsim baskılı ürünler iade edilebilir mi?', a: 'Kişiselleştirilmiş ürünler yalnızca sizin için hazırlandığından mevzuat gereği cayma hakkı ve iade kapsamı dışındadır. Üretim kaynaklı bir kusur olması durumunda değişim sağlanır.' },
      { q: 'Kurumsal logo baskılı hediye yapıyor musunuz?', a: 'Evet. Şirket logonuzu cüzdan, kartlık veya anahtarlık gibi ürünlerimize sıcak gömme baskı tekniğiyle uygulayabiliyoruz.' },
      { q: 'Toptan veya kurumsal sipariş imkânı var mı?', a: 'Evet. Bayram, yılbaşı, bayi toplantıları veya kurumsal hediyeler için toptan satış ve özel üretim imkânımız mevcuttur. Adet ve teslimat süresi için bizimle iletişime geçebilirsiniz.' },
    ],
  },
  {
    group: 'Sipariş & Kargo',
    items: [
      { q: 'Siparişler hediye paketiyle mi gönderiliyor?', a: 'Evet. Ürünlerimiz kendi özel kutusunda, hediyeye hazır şekilde paketlenir. İsteğe bağlı özel hediye paketi ve hediye notu seçeneğimiz de mevcuttur.' },
      { q: 'Ürünlerinizi nereden satın alabilirim?', a: 'Siparişlerinizi web sitemiz, WhatsApp destek hattımız veya resmi Instagram hesabımız üzerinden oluşturabilirsiniz.' },
      { q: 'Kargo ücretli mi?', a: 'Web sitemiz üzerinden verilen 3000 TL ve üzeri siparişlerde Türkiye geneli kargo ücretsizdir.' },
      { q: 'Siparişim kaç günde kargoya verilir?', a: 'Siparişleriniz 1–3 iş günü içerisinde kargoya teslim edilir.' },
      { q: 'Siparişimi nasıl takip edebilirim?', a: 'Siparişiniz kargoya verildiğinde SMS ve e-posta ile kargo takip numarası iletilir.' },
      { q: 'Çalışma saatleriniz nedir?', a: 'Eskişehir atölyemiz ve dijital destek ekibimiz hafta içi 09:00 – 18:00 arasında hizmet verir. WhatsApp ve Instagram mesajlarına en kısa sürede dönüş sağlanır.' },
    ],
  },
  {
    group: 'İade & Garanti',
    items: [
      { q: 'İade ve değişim süreniz ne kadar?', a: 'Kişiselleştirilmemiş standart ürünlerinizi teslim aldığınız tarihten itibaren 14 gün içerisinde iade edebilir veya değiştirebilirsiniz.' },
      { q: 'İade şartları nelerdir?', a: 'Ürünün kullanılmamış, orijinalliği bozulmamış ve özel kutusu/ambalajı ile birlikte eksiksiz gönderilmesi gerekir.' },
      { q: 'İade kargo ücreti kime ait?', a: 'Üretim hatası veya kusurlu ürün durumunda iade kargo ücreti markamıza aittir. Diğer iade ve değişimlerde kargo bedeli alıcıya aittir.' },
      { q: 'Ürünlerinizin garantisi var mı?', a: 'Evet. Eskişehir atölyemizde ürettiğimiz tüm ürünler el işçiliği ve malzeme kaynaklı kusurlara karşı marka garantimiz altındadır.' },
    ],
  },
  {
    group: 'Bakım',
    items: [
      { q: 'Hakiki deri cüzdanın bakımı nasıl yapılır?', a: 'Belirli aralıklarla doğal vazelin veya özel deri bakım kremleriyle, yumuşak bir bez kullanarak dairesel hareketlerle besleyebilirsiniz. Bu işlem derinin beslenmesini ve ömrünün uzamasını sağlar.' },
      { q: 'Cüzdanım ıslanırsa ne yapmalıyım?', a: 'Islanan deriyi kalorifer, saç kurutma makinesi veya doğrudan güneş ışığı altına koymayın. Kuru bir bezle nemini alıp oda sıcaklığında kendiliğinden kurumaya bırakın.' },
      { q: 'Deri cüzdan nasıl temizlenir?', a: 'Kirlenen yüzeyi hafif nemli, yumuşak bir mikrofiber bezle silebilirsiniz.' },
      { q: 'Hangi maddeler kesinlikle kullanılmamalı?', a: 'Alkol, aseton, kolonya, deterjan, ıslak mendil ve solvent içeren hiçbir kimyasal deri yüzeyine temas ettirilmemelidir. Bu maddeler derinin boyasını ve doğal yapısını bozar.' },
    ],
  },
];
