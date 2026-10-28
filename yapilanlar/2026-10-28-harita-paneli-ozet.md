# Harita panelinde kısa kurum kartı

**Tarih:** 2026-10-28

## Ne yapıldı
- Haritada seçilen kurumun sağdaki kartında yalnızca kategori, konum, açıklama, alanlar ve etiketler
  kalıyor; altta "Tüm ayrıntılar →" bağlantısı.
- Yönetim, çapa firmalar, firmalar, uzmanlık, sürdürülebilirlik, kişiler ve kaynak yalnızca kurum
  sayfasında.

## Neden
Kart, özellikle teknoparklarda yönetim bölümüyle bir ekranı aşıyordu; ayrıntılar zaten kurum sayfasında.

## Nereye dokunuldu
- `src/components/detay/AktorDetay.astro`: `ozet` seçeneği
- `src/components/harita/kaynaklar.ts`: haritada `ozet: true`

## Bilinmesi gerekenler
- Ana sayfa 41 KB küçüldü (kartlar sayfaya gömülü).
- Açıklaması çok kısa olan kurumlarda (ör. OSTİM Teknopark) asıl bilgi "Sürdürülebilirlik"
  satırındaydı; o bilgi artık yalnızca kurum sayfasında. Gerekirse panelde yalnız bu satır geri getirilebilir.
