# TASK-05: Üniversite girişimcilik ve teknoloji toplulukları

**WP:** [WP-02](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-01
**Tahmini efor:** ~0.4g

## Ne yapılacak, neden?

Ankara'daki üniversitelerin girişimcilik, inovasyon ve teknoloji toplulukları topluluk kaydı olarak
eklenir. Girişimlerin önemli bir kısmı bu kulüplerden çıkıyor; haritada TEKMER ve teknoparklarla aynı
ekosistemin parçası olarak görünmeleri gerekiyor.

## Teknik tarif

TASK-02'deki kayıt biçimi. Girişimcilik toplulukları `alanlar: [genel]` (sektörden bağımsız) alır;
teknik topluluklar `bilisim`, sanayi odaklılar `sanayi`. Platform kategorisinde duran öğrenci kulübü
(Bilkent YES) `topluluk`'a taşınır: dosya `aktorler/topluluk/`'a, `kategori: topluluk`.

## Adımlar

1. Her üniversite için girişimcilik, inovasyon, IEEE/ACM ve teknoloji topluluklarını araştır.
2. Kaynağı doğrulanabilenleri ekle.
3. `platform` kategorisindeki öğrenci kulüplerini taşı.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] ODTÜ, Bilkent, Hacettepe, Gazi, Ankara Ü., TOBB ETÜ için en az bir topluluk ya da notlarda neden yok
- [x] Bilkent YES `topluluk` kategorisinde
- [x] Yeni kayıtlar için K01–K05 uyarısı yok
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

Uygulandı (2026-10-30). Eklenen 13 kayıt, taşınan 1 kayıt:

| Üniversite | Kayıtlar |
|---|---|
| ODTÜ | `odtu-genc-girisimciler-toplulugu` (2003, 300+), `odtu-ar-ge-toplulugu` (500+, TEDxMETUAnkara), `odtu-istatistik-ve-veri-bilimi-toplulugu` (1991) |
| Bilkent | `bilkent-yes` (platform'dan taşındı), `bilkent-innovation-and-research-society`, `bilkent-180-degrees-consulting`, `ieee-bilkent`, `acm-bilkent` |
| Hacettepe | `hacettepe-girisim-ve-yatirim-toplulugu` (2012, 2000+) |
| Gazi | `gazi-girisimcilik-ve-iletisim-toplulugu` (300+), `gazi-g2mg` (2024) |
| Ankara Ü. | `ankara-universitesi-girisimcilik-ve-inovasyon-toplulugu` (2018, Hult Prize), `gdg-on-campus-ankara-universitesi` |
| TOBB ETÜ | `tobb-etu-evt` (Endüstri ve Verimlilik Topluluğu, 2005) |

- `bilkent-yes` taşınınca adresi `/platformlar/bilkent-yes/` → `/topluluklar/bilkent-yes/` oldu. Kimlik
  aynı; başka kayıt bu kimliğe bağlı değildi. Kısa açıklaması (K04) da düzeltildi.
- **Alınmayanlar:** TOBB ETÜ Girişimcilik Topluluğu (yalnızca bir haber başlığı var), ODTÜ ve Hacettepe
  İşletme toplulukları (kariyer odaklı, ekosistemle bağı zayıf), BEST Ankara (genel öğrenci ağı),
  GDG on Campus Çankaya ve THK (etkinlikleri doğrulanmadı).
- Atılım, Çankaya, Başkent ve OSTİM TÜ'de girişimcilik topluluğu bulunamadı; kulüp listeleri doğrudan taranmalı.
- Bilkent kulüplerinden `ieee-bilkent` ve `bilkent-innovation-and-research-society` için kaynak yalnızca resmi kulüp listesi.
