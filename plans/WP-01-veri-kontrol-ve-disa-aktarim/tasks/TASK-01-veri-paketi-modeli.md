# TASK-01: Veri paketi modeli (normalize tablolar)

**WP:** [WP-01](../WP.md)
**Durum:** `todo`
**Bağımlı:** -
**Tahmini efor:** ~0.5g

## Ne yapılacak, neden?

Tüm verinin tablo hâlindeki tek bir temsili: her kayıt türü bir tablo, her ilişki ayrı bir ilişki
tablosu. Excel, JSON ve AI paketi bu tek temsilden üretilir; böylece üç çıktı birbirinden farklı
bilgi gösteremez. Tablolar, ileride kurulacak veritabanının tablolarına birebir karşılık gelecek
şekilde tasarlanır.

## Teknik tarif

**Yeni dosya:** `src/lib/veri-paketi.ts`. Tek dışa açık fonksiyon:

```ts
export async function veriPaketi(): Promise<VeriPaketi>
```

Veriye yalnızca `src/lib/content.ts` üzerinden erişir (`getAktorGruplari`, `getAkademisyenler`,
`getYatirimlar`, `getTakvim`, `getIsbirlikleri`, sözlük getter'ları, `birincilAlanId`, `aktorYolu`…).
`getCollection` çağırmaz. Kurallar (birincil alan, sıralama, URL) `content.ts`'te olduğu gibi
kullanılır, yeniden yazılmaz.

**Tablolar** (alan adları içerik dosyalarındakiyle aynı):

| Tablo | Satır | Alanlar |
|-------|-------|---------|
| `kategoriler`, `alanlar`, `universiteler`, `yatirimTurleri`, `isbirligiTurleri` | sözlük kaydı | `id`, `ad`, sözlüğe özgü alanlar, `sira` |
| `kurumlar` | kurum | `id`, `ad`, `kategori`, `konum`, `birincilAlan`, `uzmanlik`, `surdurulebilirlik`, `kisiler`, `kaynak`, `oneCikan`, `aciklama` (gövde), `etiketler[]`, `url`, `kaynakDosya` |
| `kurumAlanlari` | kurum × alan | `kurum`, `alan`, `sira` (1 = birincil) |
| `kurumYoneticileri` | yönetici | `kurum`, `sira`, `ad`, `rol`, `ozgecmis`, `kaynak` |
| `akademisyenler` | akademisyen | `id`, `ad`, `unvan`, `universite`, `birim`, `profil`, `calismaAlanlari` (gövde), `etiketler[]`, `kaynakDosya` |
| `akademisyenKurumlari` | ilişki | `akademisyen`, `kurum` |
| `yatirimlar` | yatırım | `id`, `ad`, `tur`, `tarih`, `tutar`, `yatirimci`, `aciklama`, `kaynak`, `kaynakDosya` |
| `yatirimKurumlari` | ilişki | `yatirim`, `kurum` |
| `takvim` | etkinlik/destek | `id`, `ad`, `tur`, `duzenleyen`, `baslangic`, `bitis` (ISO), `yillik`, `durumNotu`, `aciklama`, `kaynak`, `kaynakDosya` |
| `takvimKurumlari` | ilişki | `takvim`, `kurum` |
| `isbirlikleri` | iş birliği | `id`, `tur`, `yil`, `aciklama`, `etiketler[]`, `kaynakDosya` |
| `isbirligiTaraflari` | taraf | `isbirligi`, `sira`, `kurum` \| `universite` \| `ad` (tam biri dolu) |

**Türetilmiş görünüm** (veritabanı tablosu değil, inceleme kolaylığı için):

- `iliskiler`: her satır bir "kayıt → kurum" bağı: `kayitTuru` (yatırım/takvim/akademisyen/iş birliği),
  `kayitId`, `kayitAdi`, `kurum`, `kurumAdi`. Excel'de süzme ve pivot için.

**Paket üst bilgisi:** `surum` (paket biçiminin sürümü, `1`), `uretildi` (ISO tarih-saat), `sayilar`
(tablo başına satır sayısı).

`kaynakDosya`: kaydın depo içindeki yolu (`src/content/aktorler/girisim/evreka.md`). AI ya da insan
düzeltmeyi bu dosyada yapar. Content Collections kaydın `filePath`'ini veriyor; yoksa kategori/id'den
kurulur.

## Adımlar

1. Tipleri yaz (`VeriPaketi`, tablo satır tipleri).
2. `veriPaketi()`: sözlükler → kurumlar ve ilişki tabloları → `iliskiler` görünümü → üst bilgi.
3. Tutarlılık denetimleri (geliştirme sırasında, kalıcı da kalabilir): her ilişki satırındaki
   `kurum` `kurumlar`'da var; `kurumAlanlari`'nda her kurumun tam bir `sira: 1` satırı var ve
   `kurumlar.birincilAlan` ile aynı. Tutmazsa hata fırlat.

## Açık kararlar

Yok.

## Kabul kriterleri

- [ ] `veriPaketi()` yalnızca `content.ts` üzerinden okuyor
- [ ] Satır sayıları: 105 kurum, 63 akademisyen, 17 yatırım, 13 takvim, 27 iş birliği
      (o günkü veriyle; sayılar değişmişse sitedeki sayılarla aynı)
- [ ] `iliskiler` satır sayısı = dört ilişki tablosunun toplamı (iş birliğinde yalnızca `kurum` olan taraflar)
- [ ] Tutarlılık denetimleri geçiyor
- [ ] `npm run build` 0 hata, 0 uyarı

## Notlar

- Django'ya geçişte bu tablolar modellere birebir karşılık gelir; JSON'dan fixture üretmek mekanik bir iş olur.
