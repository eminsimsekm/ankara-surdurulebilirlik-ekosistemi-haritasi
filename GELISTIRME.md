# Geliştirme Kuralları

Bu dosya, siteye yeni bir şey eklerken uyulacak kuralları anlatır. İki amacı var:

1. **Django'ya geçiş kolay olsun.** Bugün yazılan kod, Django eklendiğinde çöpe gitmesin.
2. **Kod büyüdükçe dağılmasın.** Yeni bir özellik eklemek, var olan dosyaların çoğuna dokunmayı gerektirmesin (SOLID).

Kod yazan herkes (Claude Code dahil) bu kurallara uyar. Bir kurala uyulamıyorsa nedeni PR açıklamasına yazılır.

---

## 1. Hedef mimari

```
            ┌───────────────────────────────┐
            │  Astro (önyüz, statik HTML)   │  ← sayfalar, harita, listeler, detaylar
            │  dist/ → Altun Hosting        │
            └──────────────┬────────────────┘
                           │  tarayıcıdan fetch (JSON)
                           ▼
            ┌───────────────────────────────┐
            │  Django (arka uç, API)        │  ← giriş/çıkış, favoriler, mail, mail kayıtları
            │  aynı alan adında: /api/...   │     ileride: içerik yönetimi (admin)
            └───────────────────────────────┘
```

- **Astro önyüz olarak kalır.** Herkese açık içeriğin (harita, kurumlar, akademisyenler…) tamamını Astro üretir.
- **Django yalnızca API'dir.** Kullanıcıya özel ya da veri yazan her iş Django'ya gider. Django HTML sayfa üretmez.
- **Tek alan adı.** API aynı alan adının altında (`/api/`) çalışır. Böylece CORS sorunu çıkmaz ve oturum çerezi doğrudan çalışır.

Geçici önizleme şimdilik GitHub Pages'te (`.github/workflows/pages.yml`). Asıl yayın Django ile birlikte Altun Hosting'e taşınır.

---

## 2. Katmanlar: ne nerede durur

Her katmanın tek bir işi vardır. Bir katman yalnızca kendinden aşağıdakine bağımlıdır.

| Katman | Yer | İşi | Bilmemesi gereken |
|---|---|---|---|
| İçerik | `src/content/` | Ham veri (Markdown/YAML) | Hiçbir kod |
| Şema | `src/content.config.ts` | Alanlar ve doğrulama | Sayfalar, bileşenler |
| **Veri erişimi** | `src/lib/content.ts` | Okuma, sıralama, gruplama, URL'ler | Verinin nasıl gösterileceği |
| Saf mantık | `src/lib/*.ts` | Hesaplama (arama, tarih, harita geometrisi) | Astro, DOM |
| Bağlantılar | `src/lib/yol.ts` | Site içi adresler | Sayfa içeriği |
| Bileşenler | `src/components/` | Gösterim (HTML + CSS) | Verinin nereden geldiği |
| Sayfalar | `src/pages/` | Bileşenleri ve veriyi birleştirmek | Koleksiyonlar (doğrudan) |
| Tarayıcı kodu | `src/scripts/` | Etkileşim (filtre, harita, takvim durumu) | Astro, içerik koleksiyonları |
| *(gelecek)* API istemcisi | `src/scripts/api.ts` | Django ile konuşmak | Sayfa yapısı |

**Altın kural:** Django geldiğinde yalnızca **`src/lib/content.ts`** (içerik nereden okunuyor) ve **`src/scripts/api.ts`** (kullanıcı işlemleri nereye gidiyor) değişmeli. Başka bir dosyanın değişmesi gerekiyorsa sınır bir yerde delinmiştir.

---

## 3. Django'ya hazırlık kuralları

### Yapılacaklar

1. **Veriye yalnızca `content.ts` üzerinden erişin.** Sayfa ve bileşenler `getCollection` / `getEntry` çağırmaz. Yeni bir veri ihtiyacı varsa `content.ts`'e `getXxx()` fonksiyonu eklenir.
2. **Site içi her bağlantı `yol()`'dan geçer.** `href="/kurumlar/"` yazılmaz, `href={yol("/kurumlar/")}` yazılır. Kayıt adresleri için `aktorYolu`, `kategoriYolu`, `kayitYolu` kullanılır.
3. **Kimlikler kalıcıdır.** Dosya adı (`netzero-tekmer`) kaydın kimliğidir. Django'da da aynı değer `slug` olur, favoriler bu kimliğe bağlanır. Yayına çıkan kimlik değiştirilmez.
4. **Alan adları Django modeline aynen taşınabilecek gibi seçilir.** Türkçe, Türkçe karaktersiz ve tutarlı yazılır (`ad`, `konum`, `etiketler`, `kaynak`). Django API'si JSON'da **aynı anahtarları** döndürür. Böylece bileşenler değişmez.
5. **Kayıtlar arası ilişki kimlikle kurulur** (`universite: odtu`, `taraflar: [a, b]`). Bu yapı Django'da doğrudan `ForeignKey` / `ManyToMany`'ye karşılık gelir. Aynı bilgiyi iki dosyaya kopyalamayın.
6. **Tarihler ISO biçimindedir** (`2026-10-28`). Para ve sayılar, gösterim metni değil değer olarak tutulur (gösterim `Intl.NumberFormat` ile yapılır). İstisna: `one-cikan-sayilar.yaml` gibi doğrudan metin olan alanlar.
7. **Tarayıcı kodu veriyi sayfadan okur.** `src/scripts/` altındaki kod veriyi `data-*` öznitelikleri ya da sayfadaki HTML üzerinden alır. Kullanıcıya özel veri (favoriler, oturum) ise yalnızca `api.ts` üzerinden gelir.
8. **API'ye bağlı özellikler API olmadan da kırılmaz.** Sayfa statik haliyle tam çalışır. Favori butonu gibi parçalar API cevap vermezse gizlenir ya da "giriş yapın" der.

### Yapılmayacaklar

- **Astro'nun sunucu özellikleri kullanılmaz:** SSR / adapter, Astro Actions, Sessions, middleware, `astro:env` sunucu değişkenleri, veri yazan API route'ları. Sunucu tarafında yapılacak her iş Django'nundur.
- **Önyüze sır konmaz.** Şifre, API anahtarı ve SMTP bilgisi Astro koduna ya da `PUBLIC_*` değişkenlerine yazılmaz. Mail Django'dan gider.
- **Giriş, favori ya da mail için geçici çözüm yazılmaz** (localStorage'da sahte giriş, `mailto:` ile mail kaydı vb.). Bunlar Django gelince yapılır. Şimdi yapılırsa iki kez yazılır.
- **Kategoriye göre kod dalı açılmaz** (`if (kategori === "tekmer")`). Fark veriye yazılır (aşağıda O maddesi).

### Gelecekteki API istemcisi (şimdiden kural)

Django eklendiğinde tarayıcıdaki bütün istekler tek bir modülden geçer:

```ts
// src/scripts/api.ts (henüz yok — ilk Django özelliğiyle birlikte yazılacak)
const API = import.meta.env.PUBLIC_API_URL ?? "/api";

export async function favorileriGetir(): Promise<string[]> { /* aktör kimlikleri */ }
export async function favoriEkle(id: string): Promise<void> { /* CSRF çerezi + fetch */ }
```

Bileşenler ve diğer scriptler `fetch` çağırmaz, `api.ts`'deki fonksiyonları çağırır. API adresi ya da kimlik doğrulama biçimi değişirse yalnızca bu dosya değişir.

---

## 4. SOLID: bu projede ne anlama geliyor

### S — Tek sorumluluk

Her dosyanın değişmek için tek bir nedeni olsun.

- `content.ts` veriyi **getirir**, bileşen veriyi **gösterir**, `src/scripts/` **etkileşimi** yönetir. Bir bileşen içinde sıralama, filtreleme ya da URL kurma yapılmaz.
- Hesaplama `src/lib/` altına saf fonksiyon olarak yazılır (`takvim.ts`'deki durum hesabı gibi). Saf fonksiyonda Astro ve DOM bilgisi yoktur, kolayca test edilir ve gerekirse Python'a taşınır.
- Bir bileşen ~150 satırı geçiyorsa ya da iki farklı şey gösteriyorsa bölünür.

### O — Değişime kapalı, eklemeye açık

Yeni bir şey eklemek, var olan kodu değiştirmeden mümkün olmalı.

| Eklenecek | Dokunulacak yer | Dokunulmayacak yer |
|---|---|---|
| Yeni kurum | `src/content/aktorler/<kategori>/<ad>.md` | Kodun tamamı |
| Yeni kategori | `kategoriler.yaml` + `tokens.css`'te renk | Sayfalar, menü, harita |
| Haritaya yeni içerik türü | `harita/kaynaklar.ts`'te `HARITA_KAYNAKLARI`'na bir kaynak | `Harita.astro`, `harita.ts` |
| Haritada kategori görünümünün gruplaması | İlgili kaynağın `altGrup`'u (`harita/kaynaklar.ts`) | `Harita.astro`, `harita.ts`, geometri |
| Kurum sayfasına yeni ilişki bölümü | `iliskiler/kaynaklar.ts`'te `ILISKI_KAYNAKLARI`'na bir kaynak | Kurum sayfası, satır bileşenleri |
| Bir kaydı kuruma bağlamak | Kaydın dosyasına `aktorler: [kimlik]` | Kodun tamamı |
| Kategoriye özel davranış | `kategoriler.yaml`'a bir alan (ör. `menuAdi`, `menuSira`) | Bileşenlerde `if` dalı |

Yeni bir özellik "her kategori için ayrı ayrı şunu da değiştir" gerektiriyorsa önce bu tabloya uyan bir uzatma noktası tasarlanır.

### L — Yerine konabilirlik

Aynı işi gören parçalar aynı sözleşmeye uyar. Biri diğerinin yerine kullanılınca hiçbir şey bozulmaz.

- Bütün detay bileşenleri (`AktorDetay`, `AkademisyenDetay`, `TakvimDetay`, `YatirimDetay`) `DetayKabuk` üzerinden aynı yapıyı kurar ve aynı ortak propları (`kategori`, `baslikSeviyesi`, `sayfaYolu`) kabul eder. Yeni bir detay bileşeni de aynı şekilde yazılır.
- Bütün harita kaynakları aynı `HaritaDugumu` biçimini eksiksiz döndürür. Harita, düğümün aktör mü akademisyen mi olduğunu bilmeden çalışır.
- Django'dan gelecek veri de `content.ts`'in bugün döndürdüğü biçimle aynı olmalıdır. Bileşen, verinin dosyadan mı API'den mi geldiğini ayırt edemez.

### I — Arayüz ayrımı

Bileşen yalnızca ihtiyaç duyduğunu ister.

- Bütün koleksiyon ya da büyük bir nesne yerine gereken kayıt ve alanlar prop olarak verilir.
- İsteğe bağlı davranışlar ayrı ve isteğe bağlı proplardır (`sayfaYolu?`, `baslikSeviyesi?`). Her kullanımda doldurulması gereken uzun prop listeleri oluşturulmaz.
- Tarayıcı scriptleri sayfadan yalnızca kendi `data-*` özniteliklerini okur (`data-filter-chip`, `data-detay-panel`). Başka bir bileşenin sınıf adına ya da iç yapısına bağlanmaz.

### D — Bağımlılığın tersine çevrilmesi

Üst katmanlar somut kaynağa değil, onu saklayan fonksiyona bağlıdır.

- Sayfalar `astro:content`'e değil, `content.ts`'e bağlıdır. Kaynak dosyadan Django'ya geçince sayfalar değişmez.
- Bağlantılar sabit metne değil, `yol()` fonksiyonuna bağlıdır. Yayın yeri değişince bağlantılar değişmez.
- Kullanıcı işlemleri `fetch`'e değil, `api.ts`'e bağlı olacaktır.

---

## 5. Yeni özellik eklerken kontrol listesi

PR açmadan önce:

- [ ] Yeni veri ihtiyacı `content.ts`'e fonksiyon olarak eklendi. Sayfada `getCollection` yok.
- [ ] Yeni alanlar `content.config.ts` şemasına eklendi. Alan adları Türkçe, karaktersiz ve tutarlı.
- [ ] Site içi bağlantılarda sabit `"/..."` yok, hepsi `yol()` ya da `*Yolu()` fonksiyonlarından geçiyor.
- [ ] Bileşende kategoriye göre `if` yok, fark veride.
- [ ] Hesaplama varsa `src/lib/` altında saf fonksiyon olarak yazıldı.
- [ ] Astro sunucu özelliği (SSR, Actions, middleware) kullanılmadı.
- [ ] Giriş, favori, mail gibi Django işi gerektiren bir şey sahte biçimde yapılmadı.
- [ ] `npm run build` hatasız geçiyor.
- [ ] İşin kısa özeti `yapilanlar/` klasörüne eklendi (dosya + tablo satırı).
- [ ] Yeni bir uzatma noktası açıldıysa README'deki "İçerik ekleme" tablosu ya da bu dosya güncellendi.

---

## 6. Django geldiğinde ne değişecek

| Parça | Bugün | Django sonrası | Etkilenen dosyalar |
|---|---|---|---|
| Herkese açık içerik | Markdown/YAML | Seçenek A: dosyalarda kalır. Seçenek B: Django admin'den girilir, build sırasında API'den çekilir | B seçilirse yalnızca `content.ts` ve `content.config.ts` (loader) |
| Favoriler | Yok | Django modeli `Favori(kullanici, aktor_slug)` | `api.ts` + favori butonu bileşeni |
| Giriş / çıkış | Yok | Django oturumu (çerez + CSRF) | `api.ts` + menüde küçük bir bileşen |
| Mail ve mail kayıtları | Yok | Django gönderir ve kaydeder | `api.ts` + form bileşeni |
| Yayın | GitHub Pages (geçici) | Altun Hosting: `dist/` + Django uygulaması | `pages.yml` silinir, Altun için deploy eklenir |

İçerik Django admin'e taşınırsa (Seçenek B), veri değiştiğinde siteyi yeniden derleyen bir tetikleyici gerekir (Django'dan GitHub Actions'a ya da sunucudaki build betiğine istek). Bileşenler yine değişmez.

---

## 7. Bilinen borçlar

Kurallara henüz tam uymayan yerler. Bu dosyalara dokunulurken düzeltilir.

- **Markdown gövdesinin işlenmesi Astro'ya bağlı.** `AktorDetay`, `AkademisyenDetay`, `AktorSatiri`, `AkademisyenSatiri`, `KurumSayfasi` ve `yatirimlar.astro`, `astro:content`'ten `render` çağırıyor. İçerik API'den gelirse gövde hazır HTML olarak gelir. O zaman bu çağrılar `content.ts`'te tek bir `govdeyiIsle()` fonksiyonunda toplanmalı.
- **Bileşenler Astro koleksiyon tiplerini kullanıyor** (`CollectionEntry`, `aktor.data.ad`). Tipler `content.ts`'ten dışarı açıldığı için tek noktadan değiştirilebilir. API'ye geçerken API cevabı aynı `{ id, data, body }` biçimine dönüştürülürse bileşenler değişmez.
- **`tasarim.astro` koleksiyonları doğrudan okuyor** (`getCollection`). Yalnızca tasarım önizleme sayfası, ama `content.ts` üzerinden okumalı.
