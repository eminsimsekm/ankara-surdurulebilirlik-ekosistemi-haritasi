# Ankara Sürdürülebilirlik Ekosistemi Haritası

Astro ile üretilen statik site. Çıktı (`dist/`) doğrudan hostinge yüklenir.

## Geliştirme

Node 22.12 veya üstü gerekir.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # tip kontrolü + dist/ üretimi
npm run preview  # dist/ çıktısını yerelde sun
```

## İçerik ekleme

Her kayıt ayrı bir dosyadır; yeni kayıt için kod değiştirmek gerekmez. Alanlar ve kurallar
`src/content.config.ts` dosyasında tanımlıdır. Hatalı alan build sırasında dosya adıyla bildirilir.

| Ne eklenecek | Nereye | Biçim |
|---|---|---|
| Teknopark, TEKMER, girişim, şirket, KOBİ, araştırma merkezi, kamu, platform, topluluk, uygulama | `src/content/aktorler/<kategori>/<ad>.md` | frontmatter + açıklama metni |
| Akademisyen | `src/content/akademisyenler/<universite>/<ad-soyad>.md` | frontmatter + çalışma alanları |
| Etkinlik ya da destek çağrısı | `src/content/takvim/<ad>.yaml` | YAML |
| Yatırım | `src/content/yatirimlar/<ad>.yaml` | YAML |
| İş birliği | `src/content/isbirlikleri/<taraf-a>-<taraf-b>.yaml` | YAML |
| Yeni kategori | `src/content/kategoriler.yaml` + `tokens.css`'e `--c-<anahtar>` rengi | YAML |
| Yeni üniversite | `src/content/universiteler.yaml` | YAML |
| Yeni faaliyet alanı (kurum filtresi) | `src/content/alanlar.yaml` | YAML |
| Sayfa metinleri (NetZero, Yatırımlar, Takvim, Akademisyenler, İş Birlikleri) | `src/content/sayfalar/<sayfa>.md` | frontmatter + Markdown |
| Ana sayfadaki sayı şeridi | `src/content/one-cikan-sayilar.yaml` (aktör ve akademisyen sayıları otomatik) | YAML |
| Sektör grafiği | `src/content/sektor-yatirimlari-2025.yaml` | YAML |
| Bir kaydın İngilizcesi | `src/content/en/<tür>.yaml` (`aktorler`, `akademisyenler`, `takvim`, `yatirimlar`, `isbirlikleri`), anahtar = kaydın kimliği | YAML |
| Sözlüklerin İngilizcesi (kategori, alan, tür, etiket, unvan, birim) | `src/content/en/sozluk.yaml` | YAML |
| Sayfa metninin İngilizcesi | `src/content/en/sayfalar/<sayfa>.md` (Türkçesiyle aynı şema) | frontmatter + Markdown |
| Arayüz metinleri (menü, düğmeler, boş liste mesajları…) | `src/i18n/tr.ts` ve `src/i18n/en.ts` | TypeScript |

### İngilizce

Site Türkçe kökte (`/kurumlar/`), İngilizce `/en/` altında (`/en/kurumlar/`) yayınlanır; sağ üstteki
bayraklarla aynı sayfanın diğer diline geçilir. Türkçe dosyalara dokunulmaz: İngilizce çeviri
`src/content/en/`'de ayrı durur ve kimliğiyle Türkçe kaydın üzerine bindirilir. Yazılmayan alan Türkçe
görünür, site kırılmaz; çevirisi olmayan kayıtlar sorun raporunda K09 olarak listelenir.

Özel isimler çevrilmez: kurum, kişi, üniversite, program ve etkinlik adları İngilizce metinde de Türkçe
yazılır (gerekirse yanına parantez içinde İngilizce açıklama). Yeni kayıt eklerken İngilizcesi aynı
kimlikle ilgili `en/*.yaml` dosyasına yazılır:

```yaml
# src/content/en/aktorler.yaml
werer-energy:
  govde: Maker of LiFePO4 battery systems and modular energy storage containers…
  uzmanlik: …            # Türkçede olan alanlar; yazılmayan Türkçe kalır
```

### Kurumların faaliyet alanı

Her kurum dosyasında 1–3 alan zorunludur. Değerler `alanlar.yaml`'daki anahtarlardır; **ilk yazılan birincil
alandır**, bu yüzden kurumun en belirgin alanı başa yazılır:

```yaml
ad: Werer Energy
kategori: girisim
konum: Çukurambar, Ankara
alanlar: [enerji-depolama, e-mobilite]   # filtre çipi olur, kurumlar sayfasına bağlanır
etiketler: [LFP batarya, enerji depolama, EV şarj]   # serbest ayrıntı; filtre olmaz
```

Sayım, alan filtresi ve haritadaki dilim **yalnızca birincil alana** göredir; böylece alan sayılarının
toplamı her zaman kurum sayısına eşittir (tutmazsa build durur). İkincil alanlar kurum satırında ve
sayfasında bilgi olarak görünür ve aramada bulunur. Tanım tek yerde: `birincilAlanId()` (`src/lib/content.ts`).

### Kayıtları kurumlara bağlamak

Yatırım, takvim ve akademisyen kayıtlarına `aktorler` alanı yazılırsa kayıt, o kurumların sayfasında
ilgili bölümde (Yatırımlar, Etkinlikler ve çağrılar, Araştırmacılar) görünür. Değer kurumun dosya adıdır:

```yaml
aktorler: [evreka]                    # yatırım: yatırımı alan kurum (yatırımcılar değil)
aktorler: [netzero-tekmer, sparklabs-group]   # takvim: düzenleyen / ilgili kurumlar
aktorler: [odtu-gunam]                # akademisyen: çalıştığı merkez
```

İş birliklerinde her taraf üç biçimden biriyle yazılır; kurum ve üniversite tarafları bağlantı olur:

```yaml
taraflar:
  - aktor: odtu-teknokent     # haritadaki kurum (adı kurum dosyasından gelir)
  - universite: odtu          # universiteler.yaml'daki üniversite (akademisyen rehberine bağlanır)
  - ad: Dünya Bankası         # haritada karşılığı olmayan taraf
```

Yanlış yazılan kurum kimliği build'i durdurur ve hangi dosyada olduğunu söyler.

Markdown metinlerinde `~` işareti üstü çizili yazı başlatabilir; "yaklaşık" anlamında `\~` yazın.

En kolay yol, aynı klasördeki benzer bir dosyayı kopyalayıp düzenlemektir.

**Dosya adı kaydın kalıcı kimliğidir** (sayfa adresi ve ileride favoriler bunu kullanır). Küçük harf,
Türkçe karaktersiz ve tireli yazın (`netzero-tekmer.md`); yayına çıktıktan sonra değiştirmeyin.

## Veriyi incelemek

```sh
npm run build    # site + veri-cikti/ klasörüne üç dosya + konsola sorun özeti
```

| Dosya | Ne için |
|---|---|
| `veri-cikti/veri.xlsx` | İnsan incelemesi ve paylaşım: Kurumlar (ilişki sayılarıyla), İlişkiler, kayıt türleri, Sözlükler, **Sorunlar** |
| `veri-cikti/veri.md` | Tüm veri ve ilişkiler tek okunaklı dosyada; bir AI'a "incele, hataları bul" diye verilir |
| `veri-cikti/veri.json` | Normalize tablolar; araçlar ve ileride Django veritabanına ilk yükleme için |

Üçü de üretilen, **salt okunur** kopyalardır: düzeltme her satırdaki "kaynak dosya"da yapılır, bir
sonraki `npm run build` ile çıktılar güncellenir. Sorunlar iki seviyededir: *uyarı* (bakılmalı:
kaynaksız kayıt, olası tekrar, çok kısa açıklama…) ve *bilgi* (temizlik listesi: ilişkisiz kurum,
tek kullanımlık etiket…). Kesin hatalar zaten build'i durdurur; uyarılar durdurmaz.

GitHub'da her push'ta özet, Actions iş özetinde görünür; üç dosya o çalıştırmanın `veri-ciktilari`
artifact'ından indirilir. Bu iç çıktılar siteyle birlikte yayınlanmaz.

**Sitede herkese açık Excel:** Kurumlar sayfasındaki "Excel olarak indir" butonu
`/indir/ankara-surdurulebilirlik-haritasi.xlsx` dosyasını indirir. Aynı koddan (`src/lib/veri-excel.ts`)
üretilir ama Sorunlar sayfası, uyarı sayıları ve kaynak dosya yolları yoktur. Site her derlendiğinde
yeniden üretildiği için sitede ne varsa dosyada da o vardır.

## Yapı

- `src/content/`: tüm içerik (yukarıya bakın)
- `src/content.config.ts`: içerik şemaları
- `src/content/en/`: İngilizce çeviriler (kayıtlar, sözlükler, sayfa metinleri)
- `src/i18n/`: arayüz metinleri (`tr.ts`, `en.ts`); `src/lib/dil.ts`: diller ve adres kuralı
- `src/lib/`: saf fonksiyonlar; `content.ts` içeriğe erişim katmanı (sıralama, URL'ler, çeviri bindirme), `text.ts` Türkçe arama,
  `takvim.ts` tarih ve durum hesabı, `harita-yerlesim.ts` harita geometrisi
- `src/components/`: ortak bileşenler (arama kutusu, filtre çipleri, menü…)
- `src/components/satirlar/`: liste satırları ve kartlar (aktör, akademisyen, takvim, yatırım, iş birliği)
- `src/components/detay/`: aktör, akademisyen, takvim ve yatırım detayları (ortak kabuk: `DetayKabuk.astro`)
- `src/components/bloklar/`: sayfa blokları (sayı şeridi, istatistikler, grafik, kurum sayfası, Markdown metni)
- `src/components/iliskiler/`: kurum sayfasındaki ilgili kayıt bölümleri; `kaynaklar.ts` hangi kaydın
  kurum sayfasında nasıl görüneceğini tanımlar (yeni bir ilişki türü için oraya bir kaynak eklenir)
- `src/components/harita/`: harita; bir kategori seçilince yalnızca o kategori kalır ve düğümler `altGrup`'larına
  (kurumlarda birincil alan, akademisyenlerde üniversite, yatırımlarda tür) göre dilimlenir; `kaynaklar.ts` hangi içeriğin haritada nasıl görüneceğini tanımlar
  (yeni bir içerik türünü haritaya eklemek için oraya bir kaynak eklenir)
- `src/lib/veri-paketi.ts`: tüm verinin normalize tablolar hâli (Excel/JSON/MD'nin tek kaynağı);
  `src/lib/veri-kontrol.ts`: sorun kuralları (yeni kural `KURALLAR` dizisine eklenir)
- `src/lib/veri-excel.ts`: Excel çalışma kitabı, iki kapsam (iç / genel)
- `src/pages/veri/`: iç çıktılar `veri.json`, `veri.xlsx`, `veri.md`; `src/pages/indir/`: sitedeki genel Excel
- `scripts/veri-cikti.mjs`: `npm run build`'in son adımı; iç çıktıları `veri-cikti/`'ye kopyalar, sorun özetini yazar
- `src/scripts/`: yalnızca tarayıcıda çalışan kod (liste süzme, harita etkileşimi, takvim durumu)
- `src/pages/[...dil]/`: tüm sayfalar; her sayfa iki dilde üretilir (Türkçe kök, İngilizce `/en/`)
- `src/pages/[...dil]/[kategori]/`: tüm kategori ve aktör sayfalarını üreten iki şablon
- `src/pages/[...dil]/*.astro`: harita (ana sayfa), kurumlar, NetZero, akademisyenler, yatırımlar, takvim, iş birlikleri
- `src/components/DilSecici.astro`: sağ üstteki bayraklı dil seçici
- `src/components/SiteNav.astro`: iki katmanlı menü; kurum kategorileri yalnızca Kurumlar bölümünde alt satırda
- `src/styles/tokens.css`: renkler, yazı tipleri, açık/koyu tema. Önizleme: `/tasarim`
- `src/styles/base.css`: sayfa geneli temel stiller
- `src/layouts/BaseLayout.astro`: tüm sayfaların iskeleti

Kod yazarken uyulacak kurallar (Django'ya hazırlık, SOLID, dil desteğinin işleyişi) [CLAUDE.md](CLAUDE.md) dosyasında.

İş planı Work Package (WP) yapısıyla [`plans/`](plans/) klasöründe; bitmiş WP'ler de kararları ve notlarıyla orada kalır.

Eski tek dosyalık HTML sürümü ve veriyi ondan aktaran script `df9265a` commit'inde duruyor
(`legacy/`, `scripts/migrate-legacy.mjs`). 
