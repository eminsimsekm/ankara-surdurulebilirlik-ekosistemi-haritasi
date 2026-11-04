# TASK-04: İngilizce içerik katmanı (`src/content/en/`)

**WP:** [WP-03](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-01
**Tahmini efor:** ~0.4g

## Ne yapılacak, neden?

İngilizce içerik Türkçe dosyalardan ayrı durur ve `content.ts` tarafından Türkçe kaydın üzerine
bindirilir. Bileşenler değişmez; bir alanın çevirisi yoksa Türkçesi görünür.

## Teknik tarif

```
src/content/en/
├── sozluk.yaml          kategoriler, alanlar, türler, etiketler, unvanlar, birimler, sayılar
├── aktorler.yaml        <kimlik>: { govde, uzmanlik, surdurulebilirlik, kisiler, konum, yonetim, ... }
├── akademisyenler.yaml  <kimlik>: { govde }
├── takvim.yaml          <kimlik>: { aciklama, durumNotu }
├── yatirimlar.yaml      <kimlik>: { aciklama, tutar }
├── isbirlikleri.yaml    <kimlik>: { aciklama }
└── sayfalar/<id>.md     sayfanın tam İngilizcesi (Türkçesiyle aynı şema)
```

- Kayıt dosyaları (`aktorler.yaml`…) özel bir yükleyiciyle okunur: anahtar Türkçe kaydın kimliğidir,
  bilinmeyen kimlik build'i durdurur (yanlış yazılan çeviri sessizce kaybolmasın). `govde` Markdown'dır;
  yükleyici Astro'nun `renderMarkdown`'ıyla HTML'e çevirir, böylece `render()` çalışmaya devam eder.
- `content.ts`'teki her `getX()` fonksiyonu `dil` alır; `en` ise bindirme yapar.
- Arama metni (`data-search`) bulunulan dildeki metinden üretilir.

## Adımlar

1. Şemaları ve yükleyiciyi `content.config.ts`'e ekle.
2. `content.ts`'e bindirme fonksiyonlarını ve `dil` parametrelerini ekle.
3. Bileşen ve sayfalardaki çağrılara dili geçir.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] Çevirisi olan alan İngilizce, olmayan Türkçe görünüyor
- [x] Bilinmeyen kimlikli çeviri build'i durduruyor
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı (2026-10-30). Yükleyiciler `content.config.ts`'te (`ceviriDosyasi`, `tekBelge`); bindirme `content.ts`'te.
- `render()` kaydın `rendered` alanını kullandığı için İngilizce gövde yükleyicide `renderMarkdown` ile HTML'e çevrilip kayda bindiriliyor; bileşenler değişmedi.
- İlk tam build'de süre 4,5 dk göründü; sebep makinedeki yük (`diskimagesiod`, load 83). Normal yükte 329 sayfa ~4–7 sn.
