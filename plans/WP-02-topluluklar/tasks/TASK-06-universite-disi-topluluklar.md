# TASK-06: Üniversite dışı topluluklar ve meetup'lar

**WP:** [WP-02](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-01
**Tahmini efor:** ~0.3g

## Ne yapılacak, neden?

Kampüs dışında, piyasada düzenli etkinlik yapan topluluklar (meetup'lar, profesyonel ve gönüllü
topluluklar) eklenir. Bunlar öğrencilerle sektörü buluşturan ve girişimcilerin ağ kurduğu yerler.

## Teknik tarif

TASK-02'deki kayıt biçimi. `konum` olarak buluşmaların yapıldığı yer yazılır (ör. `Ankara TEKMER, Çankaya`);
belirli bir yer yoksa `Ankara`.

## Adımlar

1. Luma, Kommunity, Meetup ve community.dev'de Ankara'da etkinlik yapan toplulukları ara.
2. Ankara'da birden fazla etkinliği ya da kalıcı bir sayfası olanları ekle.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] Ankara'da düzenli etkinlik yapan en az 3 topluluk eklendi
- [x] Yeni kayıtlar için K01–K05 uyarısı yok
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

Uygulandı (2026-10-30). Eklenen 4 kayıt (TASK-02'deki AI Meetup Ankara, AI Safety Türkiye ve AIPA'ya ek olarak):

| Kimlik | Ne | Kaynak |
|---|---|---|
| `gdg-ankara` | 2011'den beri; DevFest Ankara 2024 (Hacettepe Beytepe, 20 konuşmacı) | IEEE vTools etkinlik sayfası |
| `startup-grind-ankara` | Startup Grind'ın Ankara ayağı, 170 üye; ODTÜ Z-Garage etkinlikleri | startupgrind.com |
| `turkiye-java-community` | Ankara merkezli, 5500+ üye, 125 etkinlik; Ankara TEKMER'de buluşuyor | kommunity.com |
| `acm-w-ankara` | 2019, Türkiye'nin ilk ACM-W profesyonel kulübü | women.acm.org |

- **Alınmayanlar:** Ankara Microsoft Azure Kullanıcıları Topluluğu (1 üye, etkinlik yok), Kollektif Zeka
  Ankara ve Yapay Zekâ Kümelenmesi (tek etkinlik sayfası), Startup Weekend Ankara (son kayıt 2013),
  BİLGEM TechTalks (TÜBİTAK'ın etkinlik serisi, topluluk değil), Devnot (Türkiye geneli).
- Startup Grind Ankara'nın sayfasındaki son etkinlikler küresel/çevrim içi; Ankara'daki güncel takvim doğrulanmadı.
