# TASK-08: Eksik çeviri kontrolü ve belgeler

**WP:** [WP-03](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-06
**Tahmini efor:** ~0.2g

## Ne yapılacak, neden?

Yeni kayıt eklendiğinde İngilizcesinin unutulduğu görünür olsun ve kayıt ekleyen kişi İngilizceyi nereye
yazacağını bilsin.

## Teknik tarif

- `veri-kontrol.ts`'e yeni kural: "İngilizce çevirisi yok" (bilgi seviyesi; build durmaz).
- README "İçerik ekleme" tablosu ve CLAUDE.md 4-O tablosuna İngilizce satırları.

## Adımlar

1. Kuralı yaz.
2. Belgeleri güncelle.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] Çevirisiz kayıt sorun raporunda görünüyor
- [x] Belgeler güncel
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı (2026-10-30): K09 kuralı. Bir takvim çevirisi geçici olarak silinerek denendi: rapor
  `K09 (bilgi): 1` ve doğru dosya yolunu gösterdi; dosya geri kondu.
- Veri paketine `ingilizce` (çevirisi olan kimlikler) eklendi; `VERI_PAKETI_SURUMU` 2.
- README "İçerik ekleme" tablosu ve "İngilizce" bölümü, CLAUDE.md katman tablosu, 4-O tablosu ve kontrol listesi güncellendi.
