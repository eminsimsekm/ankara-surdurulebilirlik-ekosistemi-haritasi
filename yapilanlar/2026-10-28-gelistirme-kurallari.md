# Geliştirme kuralları

**Tarih:** 2026-10-28

## Ne yapıldı
- `GELISTIRME.md` yazıldı: hedef mimari (Astro önyüz + Django API), katmanlar, Django'ya hazırlık
  kuralları, SOLID'in bu projedeki karşılığı ve her özellikten önce bakılacak kontrol listesi.
- `yapilacaklar/` klasörüne üç iş tarifi eklendi (01, 02, 03); üçü de aynı gün uygulandı.

## Neden
Django eklendiğinde bugünkü önyüz çalışmasının boşa gitmemesi ve kod büyüdükçe dağılmaması.

## Bilinmesi gerekenler
- Django geldiğinde yalnızca `src/lib/content.ts` (içerik kaynağı) ve yazılacak `src/scripts/api.ts`
  (kullanıcı işlemleri) değişmeli.
- Kişiye özel özellikler (favori, giriş, mail) statik sayfanın üzerine tarayıcıda JavaScript ile eklenecek.
