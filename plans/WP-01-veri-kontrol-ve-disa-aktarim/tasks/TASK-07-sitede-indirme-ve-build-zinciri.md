# TASK-07: Sitede Excel indirme ve build zinciri

**WP:** [WP-01](../WP.md)
**Durum:** `done`
**Bağımlı:** TASK-04, TASK-06
**Tahmini efor:** ~0.5g

## Ne yapılacak, neden?

1. **Sitede "Excel olarak indir" butonu.** Ziyaretçi (ya da ekipten biri yalnızca bağlantıyla) verinin
   güncel hâlini Excel olarak indirebilsin. GitHub Pages'te sunucu yok ama gerekmiyor: site her push'ta
   yeniden derleniyor ve Excel aynı derlemede üretiliyor; sitede ne görünüyorsa dosyada da o var.
2. **İki ayrı Excel.** Herkese açık dosyada iç çalışma notları (Sorunlar sayfası, kaynak dosya yolları,
   uyarı sayıları) olmaz; ekibin kullandığı tam dosya (`veri.xlsx`) bugünkü gibi kalır ve yayınlanmaz.
3. **Tek komut.** `npm run build` iç çıktıları da `veri-cikti/`'ye koyup özeti yazar; ayrıca
   `npm run veri` çalıştırmak gerekmez.

## Teknik tarif

- **`src/lib/veri-excel.ts`** (yeni): çalışma kitabını üreten kod `src/pages/veri/veri.xlsx.ts`'ten buraya
  taşınır. `excelKitabi(paket, sorunlar, { kapsam: "ic" | "genel" })`. "genel"de: Sorunlar sayfası yok,
  "Kaynak dosya" ve "Uyarı" sütunları yok, Özet'te sorun sayıları ve "kaynak dosyada düzelt" notu yok.
  İki dosya aynı koddan üretildiği için birbirinden kopamaz.
- **Endpoint'ler:** `src/pages/veri/veri.xlsx.ts` (iç, yayınlanmaz) ve
  `src/pages/indir/ankara-surdurulebilirlik-haritasi.xlsx.ts` (genel, yayınlanır). Genel dosya ayrı
  klasörde ki Pages iş akışındaki `rm -rf dist/veri` onu silmesin.
- **Buton:** Kurumlar sayfasında arama kutusunun yanında; `yol()` ile, `download` niteliğiyle.
- **Build zinciri:** `package.json` → `"build": "astro check && astro build && node scripts/veri-cikti.mjs"`;
  `"veri"` komutu kaldırılır. Pages iş akışındaki ayrı özet adımı kaldırılır (build zaten yazıyor).

## Adımlar

1. Excel kodunu `veri-excel.ts`'e taşı, `kapsam` seçeneğini ekle.
2. İki endpoint, buton.
3. `package.json`, `pages.yml`, README.
4. Build: iki dosyayı geri okuyup içeriklerini karşılaştır; buton bağlantısı ve GitHub Pages alt klasörü.

## Açık kararlar

Kapandı (2026-10-29, kullanıcı): iki ayrı Excel; genel olan sitede indirilebilir, iç olan yayınlanmaz.
`npm run build` çıktıları da üretir.

## Kabul kriterleri

- [x] Genel dosyada Sorunlar sayfası, "Kaynak dosya" ve "Uyarı" sütunları yok; iç dosya değişmedi
- [x] İki dosyada ortak sayfaların satır sayıları aynı
- [x] Kurumlar sayfasındaki buton dosyayı indiriyor (kökte ve GitHub Pages alt klasöründe)
- [x] `npm run build` sonunda `veri-cikti/` güncel ve özet yazılıyor
- [ ] Pages iş akışında `dist/veri/` siliniyor, `dist/indir/` kalıyor
- [x] `npm run build` 0 hata, 0 uyarı; kırık bağlantı yok

## Notlar

- Uygulandı (2026-10-29): `src/lib/veri-excel.ts` (kapsam: `ic` / `genel`; sütunlarda `ic: true` işareti),
  `src/pages/veri/veri.xlsx.ts` (iç), `src/pages/indir/ankara-surdurulebilirlik-haritasi.xlsx.ts` (genel),
  `genelExcelYolu()` (`content.ts`), Kurumlar sayfasında buton, `package.json` build zinciri, `pages.yml`.
- Doğrulama: iki dosya geri okundu; genelde Sorunlar sayfası, "Uyarı" ve 6 "Kaynak dosya" sütunu ve
  Özet'teki sorun sayıları yok, ortak sayfaların satır sayıları birebir aynı. Buton bağlantısı kökte
  ve GitHub Pages alt klasöründe doğru (kırık bağlantı 0), dosya 200 ile iniyor (~63 KB).
- **`review` nedeni:** push sonrası Actions'ta `dist/veri/`'nin silinip `dist/indir/`'in kaldığı ve
  canlıda butonun indirdiği doğrulanmalı.
