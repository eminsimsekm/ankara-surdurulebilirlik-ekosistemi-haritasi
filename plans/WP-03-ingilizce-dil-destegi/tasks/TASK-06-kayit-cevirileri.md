# TASK-06: Kayıt çevirileri

**WP:** [WP-03](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-04
**Tahmini efor:** ~0.8g

## Ne yapılacak, neden?

Tüm kayıtların açıklamaları İngilizceye çevrilir: kurumlar (açıklama, uzmanlık, sürdürülebilirlik, kişiler,
yönetim rolleri), akademisyenler (çalışma alanları), takvim, yatırımlar ve iş birlikleri.

## Teknik tarif

`src/content/en/{aktorler,akademisyenler,takvim,yatirimlar,isbirlikleri}.yaml`. Adlar çevrilmez.
Kişi adları ve kurum adları metin içinde de Türkçe kalır.

## Adımlar

1. Her koleksiyonu dosya dosya çevir.
2. Build ve sayfalarda örnek kontrol.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] Her kaydın İngilizce açıklaması var
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı (2026-10-30): 147 kurum, 63 akademisyen, 13 takvim, 17 yatırım, 27 iş birliği; hepsinde eksik yok
  (yönetim listeleri Türkçeyle aynı uzunlukta kontrol edildi).
- İlk çeviride bazı kurum adları İngilizceye çevrilmişti; WP kararı gereği Türkçe asıllarına döndürüldü.
- Çeviriler makine çevirisi değil, elle yazıldı; yine de uzman gözüyle okunması önerilir (özellikle akademik birimler ve hukuki/teşvik terimleri).
