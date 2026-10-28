# Alan sayımında tek tanım: birincil alan

**Tarih:** 2026-10-28

## Ne yapıldı
- Kurumlar ve kategori sayfalarındaki alan çiplerinin sayıları ve alan filtresi artık yalnızca
  kurumun **birincil alanına** göre. Alan sayılarının toplamı her kategoride "Tümü"ye eşit
  (ör. Şirketler: 4+1+3+1+1 = 10).
- Harita ile Kurumlar sayfası aynı sayıyı veriyor (60 kategori × alan kombinasyonunda doğrulandı).
- Kurum satırında ve sayfasında birincil alan bağlantı (dolu çerçeve), ikincil alanlar bilgi
  (kesikli, soluk; bağlantı değil).
- Build sırasında değişmez kural: alan sayılarının toplamı kurum sayısını tutmazsa build durur.

## Neden
Önceden kurum her alanında sayılıyordu: alan toplamları "Tümü"yü aşıyordu (Girişimler 39 → 60)
ve harita (birincil alan) ile Kurumlar sayfası (tüm alanlar) aynı soruya farklı sayı veriyordu.
Hesap hatası değildi ama iki ayrı tanım vardı; tek tanıma indirildi.

## Nereye dokunuldu
- `src/lib/content.ts`: `birincilAlanId()` (tek tanım), `alanSayilari()` (sayım + kontrol)
- `src/components/satirlar/AktorSatiri.astro`: filtre değeri birincil alan
- `src/components/AlanBaglantilari.astro`: birincil/ikincil ayrımı
- `src/components/harita/kaynaklar.ts`: dilim aynı fonksiyondan

## Bilinmesi gerekenler
- "Hidrojen" çipi yalnızca birincil alanı hidrojen olanları gösterir (3 kurum); hidrojeni ikincil
  olan INRES ve YEO arama kutusuna "hidrojen" yazınca bulunur.
- Bir kurumu başka bir alanın çipinde göstermek için o alanı listenin başına almak gerekir.
