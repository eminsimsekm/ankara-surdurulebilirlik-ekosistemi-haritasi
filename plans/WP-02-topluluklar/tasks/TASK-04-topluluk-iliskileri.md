# TASK-04: Toplulukları kurum, üniversite ve takvime bağlamak

**WP:** [WP-02](../WP.md)
**Durum:** `todo`
**Bağımlı:** TASK-02, 03, 05, 06
**Tahmini efor:** ~0.5g

## Ne yapılacak, neden?

Topluluk kayıtları şu an hiçbir kayda bağlı değil; veri kontrolü her biri için K06 (ilişkisiz kurum)
bilgisi veriyor. Bağlantılar kurulunca topluluklar ilgili kurum sayfalarında görünür, harita ve
çıktılarda ilişkiler tamamlanır.

## Teknik tarif

Bilinen bağlantılar ve mevcut yapıyla nasıl kurulacakları:

| Bağlantı | Nasıl |
|---|---|
| AI Meetup Ankara ↔ Ankara TEKMER (buluşmaların yeri ve sponsoru) | `isbirlikleri/ai-meetup-ankara-ankara-tekmer.yaml`, tür `program` |
| Türkiye Java Community ↔ Ankara TEKMER (düzenli buluşma yeri) | `isbirlikleri/turkiye-java-community-ankara-tekmer.yaml`, tür `program` |
| ODTÜ Ar-Ge, ODTÜ GGT, Startup Grind Ankara ↔ ODTÜ Teknokent / Z-Garage | Somut ortak etkinlik kaynağı bulunursa iş birliği |
| ACM Bilkent ↔ Bilkent AI Society (AI Talks), AI Safety Türkiye ↔ Bilkent AI Society | `isbirlikleri/`, tür `program` (iki taraf da topluluk) |
| Hacettepe Enerji Topluluğu (Ankara Enerji Zirvesi), ODTÜ ÇEMÜT (Çevrenin Geleceği Zirvesi), DevFest Ankara (GDG Ankara) | `takvim/<ad>.yaml`, `tur: etkinlik`, `yillik: true` |
| GDG on Campus OSTİMTECH ↔ OSTİM ekosistemi | Gerekirse iş birliği; önce somut ortak etkinlik kaynağı bulunmalı |
| AI Tomorrow Summit (AIPA), AI Fest (Hacettepe) | `takvim/<ad>.yaml`, `tur: etkinlik`, `yillik: true`, `aktorler: [<topluluk>]` |
| Öğrenci kulübü ↔ üniversitesi (ODTÜ, Bilkent, Hacettepe, Gazi, Ankara Ü., TOBB ETÜ, AYBÜ, OSTİM TÜ) | Açık karar (aşağıda) |

İş birliği tarafı olarak `universite:` zaten kullanılabiliyor (`content.config.ts` → `taraf`).

## Adımlar

1. Açık kararı ver.
2. İş birliği ve takvim kayıtlarını ekle; her birine kaynak yaz.
3. `npm run build`; topluluklar için K06 sayısının düştüğünü ve kurum sayfalarında bağlantıların
   göründüğünü kontrol et.

## Açık kararlar

- **Öğrenci kulübü üniversitesine nasıl bağlansın?**
  - A) Her kulüp için `taraflar: [{aktor: <kulup>}, {universite: <id>}]` biçiminde iş birliği kaydı.
    Kod değişmez, ama "iş birliği" anlamı zorlanır ve 25+ yapay kayıt oluşur.
  - B) Aktör şemasına isteğe bağlı `universite: idIn("universiteler")` alanı. `content.config.ts`,
    `content.ts`, `iliskiler/kaynaklar.ts` (yeni ilişki kaynağı) ve `veri-paketi.ts`'e sütun eklenir.
  - **Öneri: B.** İlişki gerçek bir aidiyet; GELISTIRME.md 3.5'e uygun olarak kimlikle kurulur ve
    Django'da `ForeignKey` olur. Ayrıca üniversitenin akademisyen rehberinden kulüplerine bağlantı verir.

## Kabul kriterleri

- [ ] AI Meetup Ankara, Ankara TEKMER kurum sayfasında görünüyor
- [ ] En az iki topluluk etkinliği takvimde
- [ ] Öğrenci kulüpleri üniversitelerine bağlı (seçilen yöntemle)
- [ ] Bağlanamayan topluluklar ve nedenleri notlarda
- [ ] `npm run build` 0 hata, 0 uyarı

## Notlar

-
