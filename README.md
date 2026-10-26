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
| Teknopark, TEKMER, girişim, şirket, KOBİ, araştırma merkezi, kamu, platform | `src/content/aktorler/<kategori>/<ad>.md` | frontmatter + açıklama metni |
| Akademisyen | `src/content/akademisyenler/<universite>/<ad-soyad>.md` | frontmatter + çalışma alanları |
| Etkinlik ya da destek çağrısı | `src/content/takvim/<ad>.yaml` | YAML |
| Yatırım | `src/content/yatirimlar/<ad>.yaml` | YAML |
| İş birliği | `src/content/isbirlikleri/<taraf-a>-<taraf-b>.yaml` | YAML |
| Yeni kategori | `src/content/kategoriler.yaml` + `tokens.css`'e `--c-<anahtar>` rengi | YAML |
| Yeni üniversite | `src/content/universiteler.yaml` | YAML |
| Sayfa metinleri (NetZero, Yatırımlar, Takvim, Akademisyenler, İş Birlikleri) | `src/content/sayfalar/<sayfa>.md` | frontmatter + Markdown |
| Ana sayfadaki sayı şeridi | `src/content/one-cikan-sayilar.yaml` (aktör ve akademisyen sayıları otomatik) | YAML |
| Sektör grafiği | `src/content/sektor-yatirimlari-2025.yaml` | YAML |

Markdown metinlerinde `~` işareti üstü çizili yazı başlatabilir; "yaklaşık" anlamında `\~` yazın.

En kolay yol, aynı klasördeki benzer bir dosyayı kopyalayıp düzenlemektir.

**Dosya adı kaydın kalıcı kimliğidir** (sayfa adresi ve ileride favoriler bunu kullanır). Küçük harf,
Türkçe karaktersiz ve tireli yazın (`netzero-tekmer.md`); yayına çıktıktan sonra değiştirmeyin.

## Yapı

- `src/content/`: tüm içerik (yukarıya bakın)
- `src/content.config.ts`: içerik şemaları
- `src/lib/`: saf fonksiyonlar; `content.ts` içeriğe erişim katmanı (sıralama, URL'ler), `text.ts` Türkçe arama,
  `takvim.ts` tarih ve durum hesabı, `harita-yerlesim.ts` harita geometrisi
- `src/components/`: ortak bileşenler (arama kutusu, filtre çipleri, menü…)
- `src/components/satirlar/`: liste satırları ve kartlar (aktör, akademisyen, takvim, yatırım, iş birliği)
- `src/components/detay/`: aktör, akademisyen, takvim ve yatırım detayları (ortak kabuk: `DetayKabuk.astro`)
- `src/components/bloklar/`: sayfa blokları (sayı şeridi, istatistikler, grafik, kurum sayfası, Markdown metni)
- `src/components/harita/`: harita; `kaynaklar.ts` hangi içeriğin haritada nasıl görüneceğini tanımlar
  (yeni bir içerik türünü haritaya eklemek için oraya bir kaynak eklenir)
- `src/scripts/`: yalnızca tarayıcıda çalışan kod (liste süzme, harita etkileşimi, takvim durumu)
- `src/pages/[kategori]/`: tüm kategori ve aktör sayfalarını üreten iki şablon
- `src/pages/*.astro`: harita (ana sayfa), NetZero, akademisyenler, yatırımlar, takvim, iş birlikleri
- `src/styles/tokens.css`: renkler, yazı tipleri, açık/koyu tema. Önizleme: `/tasarim`
- `src/styles/base.css`: sayfa geneli temel stiller
- `src/layouts/BaseLayout.astro`: tüm sayfaların iskeleti

Eski tek dosyalık HTML sürümü ve veriyi ondan aktaran script `df9265a` commit'inde duruyor
(`legacy/`, `scripts/migrate-legacy.mjs`).
