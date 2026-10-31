# TASK-05: Sözlük çevirileri

**WP:** [WP-03](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-04
**Tahmini efor:** ~0.3g

## Ne yapılacak, neden?

Birçok yerde tekrar eden sözlük değerleri tek dosyada çevrilir: kategoriler, faaliyet alanları, yatırım
ve iş birliği türleri, etiketler, akademik unvanlar, akademik birimler, ana sayfa sayıları, sektör grafiği.

## Teknik tarif

`src/content/en/sozluk.yaml`. Üniversite adları özel isim olduğu için çevrilmez. Etiket sözlüğünde
olmayan etiket (ör. "LEAP Investment") olduğu gibi kalır.

## Adımlar

1. Tüm etiket, birim ve unvanları listele.
2. Çevirileri yaz.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] Tüm kategori, alan ve türlerin İngilizcesi var
- [x] Özel isim olmayan tüm etiketlerin İngilizcesi var
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı (2026-10-30): 14 kategori, 17 alan, türler, 6 unvan, 49 birim, ~370 etiket.
- Özel isim olan etiketler (AI Fest, LEAP Investment, Kristal Ağaç, Yeşil Şehir Eylem Planı…) sözlükte yok; Türkçe kalıyor.
- Şemadaki varsayılan firma başlığı ("Bu alandaki firmalar") her kategori için İngilizceye yazıldı.
