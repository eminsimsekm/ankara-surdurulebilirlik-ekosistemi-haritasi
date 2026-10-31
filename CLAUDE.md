# Geliştirme Kuralları

Bu dosya, siteye yeni bir şey eklerken uyulacak kuralları anlatır. İki amacı var:

1. **Django'ya geçiş kolay olsun.** Bugün yazılan kod, Django eklendiğinde çöpe gitmesin.
2. **Kod büyüdükçe dağılmasın.** Yeni bir özellik eklemek, var olan dosyaların çoğuna dokunmayı gerektirmesin (SOLID).

Kod yazan herkes (Claude Code dahil) bu kurallara uyar. Bir kurala uyulamıyorsa nedeni PR açıklamasına yazılır.
Claude Code bu dosyayı her oturumda kendiliğinden okur; kurallar ve yapı burada güncel tutulur.

İçerik ekleme (hangi kayıt hangi dosyaya) README'de, planlama ve yapılan işin kaydı `plans/` altında (`plans/README.md`).

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
| Arayüz metinleri | `src/i18n/` | Sabit metinler, iki dilde | Bileşenler, içerik |
| Bileşenler | `src/components/` | Gösterim (HTML + CSS) | Verinin nereden geldiği |
| Sayfalar | `src/pages/` | Bileşenleri ve veriyi birleştirmek | Koleksiyonlar (doğrudan) |
| Tarayıcı kodu | `src/scripts/` | Etkileşim (filtre, harita, takvim durumu) | Astro, içerik koleksiyonları |
| *(gelecek)* API istemcisi | `src/scripts/api.ts` | Django ile konuşmak | Sayfa yapısı |

**Altın kural:** Django geldiğinde yalnızca **`src/lib/content.ts`** (içerik nereden okunuyor) ve **`src/scripts/api.ts`** (kullanıcı işlemleri nereye gidiyor) değişmeli. Başka bir dosyanın değişmesi gerekiyorsa sınır bir yerde delinmiştir.

---

## 3. Django'ya hazırlık kuralları

### Yapılacaklar

1. **Veriye yalnızca `content.ts` üzerinden erişin.** Sayfa ve bileşenler `getCollection` / `getEntry` çağırmaz. Yeni bir veri ihtiyacı varsa `content.ts`'e `getXxx()` fonksiyonu eklenir.
2. **Site içi her bağlantı `yol()`'dan geçer.** `href="/kurumlar/"` yazılmaz, `href={yol("/kurumlar/", dil)}` yazılır. Kayıt adresleri için `aktorYolu`, `kategoriYolu`, `kayitYolu` kullanılır. Dil, bileşende `sayfaDili(Astro.url)` ile alınır; böylece İngilizce sayfadaki bağlantı `/en/` altında kalır.
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
| Yeni veri kontrolü (sorun kuralı) | `src/lib/veri-kontrol.ts`'te `KURALLAR`'a bir öğe | Excel, JSON, MD çıktıları (kendiliğinden gelir) |
| Yeni kayıt türü ya da alan | `content.config.ts` + `content.ts`, sonra `veri-paketi.ts`'e tablo/sütun | Çıktı dosyaları yalnızca yeni sütunu göstermek için |
| Kategoriye özel davranış | `kategoriler.yaml`'a bir alan (ör. `menuAdi`, `menuSira`) | Bileşenlerde `if` dalı |
| Bir kaydın ya da sözlüğün İngilizcesi | `src/content/en/*.yaml` (kimlikle) | Türkçe dosya, bileşenler |
| Yeni arayüz metni | `src/i18n/tr.ts` + `src/i18n/en.ts` (aynı anahtar) | Bileşende sabit Türkçe metin |
| Yeni dil | `lib/dil.ts`'te `DILLER`, `i18n/<dil>.ts`, `content/<dil>/` | Sayfalar, bileşenler |

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

## 5. Dil desteği (Türkçe / İngilizce)

Site iki dilde yayınlanır: Türkçe kökte (`/kurumlar/`), İngilizce `/en/` altında (`/en/kurumlar/`). Her dil ayrı
statik HTML'dir; tarayıcıda metin değiştirme yoktur. Planı ve kararları: `plans/WP-03-ingilizce-dil-destegi/`.

**Neden bu yapıda:** Türkçe kayıt dosyaları dile dair hiçbir şey taşımaz; İngilizce ayrı dosyalarda durur ve
kimlikle eşleşir. Django'ya geçince bu, ayrı bir çeviri tablosuna (`kayit_slug`, `dil`, alanlar) birebir
karşılık gelir ve birleştirme yalnızca `content.ts`'te olduğu için bileşenler değişmez. Bu yapı bilinçli
olarak böyle bırakıldı; çeviriyi Türkçe dosyaların içine taşımayın.

### Üç katman

| Katman | Dosyalar | İşi |
|---|---|---|
| Adres ve rota | `src/lib/dil.ts`, `src/lib/yol.ts`, `src/pages/[...dil]/` | Diller (`DILLER`), `/en/` öneki, sayfanın dilini adresten bulma, öbür dildeki adres |
| Arayüz metinleri | `src/i18n/tr.ts`, `src/i18n/en.ts`, `src/i18n/index.ts` | Menü, düğme, filtre, boş liste, durum rozeti gibi sabit metinler |
| İçerik çevirileri | `src/content/en/`, şemaları `content.config.ts` (`*En` koleksiyonları), birleştirme `src/lib/content.ts` | Kayıtların, sözlüklerin ve sayfa metinlerinin İngilizcesi |

### Akış

1. Her sayfa `src/pages/[...dil]/` altında **tek dosyadır**. `getStaticPaths` iki dili üretir: düz sayfalarda
   `export const getStaticPaths = dilYollari;`, dinamik sayfalarda `DILLER.map(...)` + `params: { dil: dilParametresi(dil), ... }`
   (örnek: `[kategori]/[aktor].astro`). Türkçe için `dil` parametresi `undefined`'dır, sayfa kökte çıkar.
2. Sayfa ve bileşen dili adresten alır: `const dil = sayfaDili(Astro.url);`. Dil prop olarak taşınmaz.
3. Arayüz metni: `const t = metinler(dil);` → `t.kurumlar.ara`. Sayıya bağlı metinler fonksiyondur:
   `` `${n} ${t.birim.kurum(n)}` `` (İngilizcede tekil/çoğul burada çözülür).
4. Veri: `content.ts`'teki her fonksiyon `dil` alır ve **zorunludur** (`getAktorGruplari(dil)`, `getSayfa("kurumlar", dil)`).
   İngilizcede çeviri, Türkçe kaydın üzerine bindirilip **aynı biçimde** döner; çevrilmemiş alan Türkçe kalır.
5. Bağlantı: `yol("/kurumlar/", dil)`, `aktorYolu(kategori, aktor, dil)` → İngilizce sayfada `/en/...`.
6. Tarih ve sayı biçimi: `YEREL_AYAR[dil]` (`tr-TR`, `en-GB`) ile `Intl.*Format`.
7. `BaseLayout` `<html lang>` ve `hreflang` bağlantılarını, `DilSecici.astro` bayrakları çizer; seçici aynı
   sayfanın öbür diline gider ve `?…#…` (arama, filtre, seçili kayıt) korunur.

### İçerik çevirileri: ne nereye yazılır

| Çevrilen | Dosya | Eşleşme | Birleştirme |
|---|---|---|---|
| Kurum | `en/aktorler.yaml` | Anahtar = kayıt kimliği (dosya adı) | Yazılan alan Türkçenin yerine geçer |
| Akademisyen | `en/akademisyenler.yaml` | Kimlik | Aynı; unvan ve birim ayrıca sözlükten |
| Takvim, yatırım, iş birliği | `en/takvim.yaml`, `en/yatirimlar.yaml`, `en/isbirlikleri.yaml` | Kimlik | Aynı |
| Kategori, alan, yatırım türü, iş birliği türü | `en/sozluk.yaml` | Sözlük kimliği | Aynı |
| Öne çıkan sayılar, sektör yatırımları | `en/sozluk.yaml` (`oneCikanSayilar`, `sektorYatirimlari`) | Kimlik | Aynı |
| Etiket, unvan, birim | `en/sozluk.yaml` (`etiketler`, `unvanlar`, `birimler`) | **Türkçe metnin kendisi** (`"su yönetimi": water management`) | Sözlükte yoksa olduğu gibi kalır |
| Sayfa metni (`sayfalar/*.md`) | `en/sayfalar/<aynı-ad>.md` | Dosya adı | Türkçe sayfanın **tamamının** yerine geçer |

Kurallar:

- **Adlar çevrilmez:** kurum, kişi, üniversite, program, etkinlik adları; çeviri şemalarında `ad` alanı yoktur
  (istisna: yatırımda açıklayıcı başlık, takvimde hedef kitle olan `duzenleyen`). Metin içindeki Türk kurum adları da
  Türkçe kalır, gerekirse parantezde İngilizce açıklama: `Yeşil Yaka Personel Programı (Green Collar Staff Programme)`.
- `govde` Markdown'dır. İçindeki site içi bağlantılar `/en/...` ile yazılır.
- `yonetim` listesi Türkçedeki sırayla yazılır (yalnızca `rol`, `ozgecmis`; ad yazılmaz).
- Çeviri şemaları `strictObject`'tir: bilinmeyen alan ya da Türkçesi olmayan kimlik build'i durdurur.
- Çevirisi olmayan kayıt sitede Türkçe görünür, site kırılmaz; veri kontrolünde **K09** (bilgi) olarak listelenir.
- Excel, `veri.json` ve `veri.md` Türkçe kalır; `/tasarim` sayfası yalnızca Türkçedir.

### Sık yapılan değişiklikler

| Değişiklik | Yapılacak |
|---|---|
| Yeni kaydın İngilizcesi | İlgili `en/<tür>.yaml`'a kimlikle bir giriş. Kod değişmez. |
| Yeni etiket / unvan / birim | Türkçe değeri anahtar olarak `en/sozluk.yaml`'daki ilgili bölüme ekle (özel isimse ekleme). |
| Türkçe etiketi düzeltmek | `en/sozluk.yaml`'daki anahtarı da aynı biçimde düzelt; yoksa İngilizcesi sessizce düşer. |
| Yeni kategori / alan / tür | Türkçe sözlüğe ek + `en/sozluk.yaml`'da aynı kimlikle İngilizcesi. |
| Yeni arayüz metni | Aynı anahtarı `tr.ts` ve `en.ts`'e ekle; bileşende `t.<bolum>.<anahtar>`. `en.ts`'te eksik anahtar `astro check`'te hata verir. |
| Yeni sayfa | `src/pages/[...dil]/<ad>.astro` + `getStaticPaths = dilYollari`; metni `sayfalar/<ad>.md` ve `en/sayfalar/<ad>.md`. Menüye eklenecekse `tr.ts`/`en.ts` `menu`. |
| Kayda yeni çevrilebilir alan | (1) `content.config.ts`'te ilgili `*En` şemasına alan, (2) `content.ts`'teki `get*` fonksiyonunda bindirme (kurum, akademisyen ve iş birliğinde alan alan elle yazılır; takvim ve yatırımda `sozlukBindir` kendiliğinden alır), (3) `en/*.yaml`'a değerler. |
| Yeni dil | `dil.ts`'te `DILLER` ve `YEREL_AYAR`, `i18n/<dil>.ts` + `index.ts`, `content/<dil>/` ve karşılık koleksiyonlar. Dikkat: `content.ts` (`dil === "tr"`, `getSayfa`'da `dil === "en"`, `sozlukEn`/`*En` adları) ve `DilSecici.astro`'daki bayrak iki dile göre yazılmış; bunlar da genelleştirilmeli. |

Yapılmayacaklar:

- Bileşen ya da sayfaya sabit Türkçe (veya İngilizce) metin yazmak; `if (dil === "en") "..."` ile metin seçmek. Metin `src/i18n/`'e gider.
- Bileşende `getCollection("aktorlerEn")` gibi çeviri koleksiyonunu doğrudan okumak; birleştirme yalnızca `content.ts`'te.
- `/en/` önekini elle yazmak (`href="/en/kurumlar/"`); `yol(..., dil)` kullanılır.
- Türkçe kayıt dosyasına `en:` alanı ya da İngilizce metin eklemek.
- Adresleri (slug) çevirmek: `/en/tekmerler/` kalır, kimlikler kalıcıdır (3.3).

---

## 6. Yeni özellik eklerken kontrol listesi

PR açmadan önce:

- [ ] Yeni veri ihtiyacı `content.ts`'e fonksiyon olarak eklendi. Sayfada `getCollection` yok.
- [ ] Yeni alanlar `content.config.ts` şemasına eklendi. Alan adları Türkçe, karaktersiz ve tutarlı.
- [ ] Site içi bağlantılarda sabit `"/..."` yok, hepsi `yol()` ya da `*Yolu()` fonksiyonlarından geçiyor.
- [ ] Bileşende kategoriye göre `if` yok, fark veride.
- [ ] Bileşen ve sayfalarda sabit arayüz metni yok; metin `src/i18n/`'den (`metinler(dil)`) geliyor.
- [ ] Yeni kayıt ya da alanın İngilizcesi `src/content/en/`'de; `content.ts` fonksiyonlarına `dil` geçiriliyor.
- [ ] Hesaplama varsa `src/lib/` altında saf fonksiyon olarak yazıldı.
- [ ] Astro sunucu özelliği (SSR, Actions, middleware) kullanılmadı.
- [ ] Giriş, favori, mail gibi Django işi gerektiren bir şey sahte biçimde yapılmadı.
- [ ] `npm run build` hatasız geçiyor.
- [ ] İlgili task ve WP dosyalarında durum ve notlar güncellendi (`plans/`).
- [ ] Yeni bir uzatma noktası açıldıysa README'deki "İçerik ekleme" tablosu ya da bu dosya güncellendi.

---

## 7. Django geldiğinde ne değişecek

| Parça | Bugün | Django sonrası | Etkilenen dosyalar |
|---|---|---|---|
| Herkese açık içerik | Markdown/YAML | Seçenek A: dosyalarda kalır. Seçenek B: Django admin'den girilir, build sırasında API'den çekilir | B seçilirse yalnızca `content.ts` ve `content.config.ts` (loader) |
| Favoriler | Yok | Django modeli `Favori(kullanici, aktor_slug)` | `api.ts` + favori butonu bileşeni |
| Giriş / çıkış | Yok | Django oturumu (çerez + CSRF) | `api.ts` + menüde küçük bir bileşen |
| Mail ve mail kayıtları | Yok | Django gönderir ve kaydeder | `api.ts` + form bileşeni |
| Yayın | GitHub Pages (geçici) | Altun Hosting: `dist/` + Django uygulaması | `pages.yml` silinir, Altun için deploy eklenir |

Veritabanına ilk yükleme `veri.json`'dan yapılır (`npm run build` → `veri-cikti/`): tabloları ve alan adları Django
modellerine birebir karşılık gelecek şekilde tasarlandı (`src/lib/veri-paketi.ts`).

İçerik Django admin'e taşınırsa (Seçenek B), veri değiştiğinde siteyi yeniden derleyen bir tetikleyici gerekir (Django'dan GitHub Actions'a ya da sunucudaki build betiğine istek). Bileşenler yine değişmez.

---

## 8. Bilinen borçlar

Kurallara henüz tam uymayan yerler. Bu dosyalara dokunulurken düzeltilir.

- **Markdown gövdesinin işlenmesi Astro'ya bağlı.** `AktorDetay`, `AkademisyenDetay`, `AktorSatiri`, `AkademisyenSatiri`, `KurumSayfasi` ve `yatirimlar.astro`, `astro:content`'ten `render` çağırıyor. İçerik API'den gelirse gövde hazır HTML olarak gelir. O zaman bu çağrılar `content.ts`'te tek bir `govdeyiIsle()` fonksiyonunda toplanmalı.
- **Bileşenler Astro koleksiyon tiplerini kullanıyor** (`CollectionEntry`, `aktor.data.ad`). Tipler `content.ts`'ten dışarı açıldığı için tek noktadan değiştirilebilir. API'ye geçerken API cevabı aynı `{ id, data, body }` biçimine dönüştürülürse bileşenler değişmez.
- **`tasarim.astro` koleksiyonları doğrudan okuyor** (`getCollection`). Yalnızca tasarım önizleme sayfası, ama `content.ts` üzerinden okumalı.
