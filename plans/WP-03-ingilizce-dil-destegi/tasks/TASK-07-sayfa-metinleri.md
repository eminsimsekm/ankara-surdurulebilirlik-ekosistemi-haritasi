# TASK-07: Sayfa metinleri

**WP:** [WP-03](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-04
**Tahmini efor:** ~0.2g

## Ne yapılacak, neden?

`src/content/sayfalar/*.md` dosyalarının (Kurumlar, Akademisyenler, Takvim, Yatırımlar, İş Birlikleri,
NetZero) İngilizcesi yazılır.

## Teknik tarif

`src/content/en/sayfalar/<id>.md`, Türkçe sayfayla aynı şema ve bloklar. Gövdedeki site içi bağlantılar
`/en/…` ile yazılır.

## Adımlar

1. Altı sayfayı çevir.
2. Bağlantıları kontrol et.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] Altı sayfanın İngilizcesi var
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı (2026-10-30): altı sayfa. Türkçe kaynaklara verilen bağlantılara "(Turkish)" notu eklendi.
