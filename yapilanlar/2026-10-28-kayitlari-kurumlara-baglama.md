# Kayıtları kurumlara bağlama

**Tarih:** 2026-10-28 (yapilacaklar/01)

## Ne yapıldı
- Yatırım, takvim ve akademisyen kayıtlarına `aktorler` alanı eklendi; kayıt ilgili kurumların
  sayfasında görünüyor (Yatırımlar, İş birlikleri, Etkinlikler ve çağrılar, Araştırmacılar).
- İş birliği tarafları üç biçimden biriyle yazılıyor: `aktor` (kurum), `universite`, `ad` (düz ad).
  Kurum ve üniversite tarafları kartta bağlantı oldu; taraf sayısı 2 ile sınırlı değil.
- 27 iş birliği, 16 yatırım, 4 takvim kaydı ve 19 akademisyen onaylanan tabloya göre bağlandı.

## Nereye dokunuldu
- `src/components/iliskiler/`: kurum sayfasındaki bölümler; yeni ilişki türü `kaynaklar.ts`'e eklenir
- `src/lib/content.ts`: `tarafCoz()`, `taraflariCoz()`
- `src/content.config.ts`: kurum kimliği doğrulayıcısı (`aktorId`)

## Bilinmesi gerekenler
- Yanlış yazılan kurum kimliği build'i durdurur.
- Yatırımlarda yalnızca yatırımı alan kurum bağlanır, yatırımcılar değil.
- İş birliği kartındaki taraf adı kurum dosyasından gelir ("TENMAK" → "TENMAK Temiz Enerji Araştırma Enst.").
- Atlanan: yatırım ve takvim satırlarına "İlgili kurumlar" bağlantısı (isteğe bağlı adım).
- İlişkiler haritanın yan panelinde gösterilmiyor; yalnızca kurum sayfasında.
