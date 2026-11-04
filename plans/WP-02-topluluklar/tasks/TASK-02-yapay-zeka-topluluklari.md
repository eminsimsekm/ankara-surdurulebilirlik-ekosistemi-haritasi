# TASK-02: Yapay zekâ toplulukları (ilk kayıtlar)

**WP:** [WP-02](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-01
**Tahmini efor:** ~0.4g

## Ne yapılacak, neden?

Ankara'daki yapay zekâ toplulukları araştırılır ve doğrulanabilir kaynağı olanlar topluluk kaydı olarak
eklenir. Kategorinin ilk içeriği bunlar olur.

## Teknik tarif

Her topluluk için `src/content/aktorler/topluluk/<kimlik>.md`. Aktör şeması aynen kullanılır:

```yaml
ad: Hacettepe Yapay Zeka Kulübü
kategori: topluluk
konum: Hacettepe Üniversitesi Beytepe, Çankaya
alanlar: [bilisim]
etiketler: [öğrenci kulübü, AI Fest, datathon]   # topluluk türü burada
uzmanlik: ...          # ne yaptığı, üye sayısı
surdurulebilirlik: ...  # yeşil odak varsa; yoksa "Doğrudan yeşil odak yok."
kaynak: https://...
```

`firmalar` ve `yonetim` yazılmaz (topluluk için geçerli değil).

## Adımlar

1. Ankara yapay zekâ topluluklarını araştır (öğrenci kulüpleri, GDG, meetup'lar, dernekler).
2. Her aday için kaynak sayfasını aç ve bilgileri doğrula.
3. Kayıtları yaz; `npm run build` ve veri kontrolünde yeni kayıtlar için uyarı olmadığını gör.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] Her kayıtta `kaynak` var ve açılıyor
- [x] Açıklamalar 60 karakterden uzun (K04 yok)
- [x] Yeni kayıtlar için K01–K05 uyarısı yok
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

Uygulandı (2026-10-30). Eklenen 9 kayıt:

| Kimlik | Tür | Kaynak |
|---|---|---|
| `hacettepe-yapay-zeka-kulubu` | Öğrenci kulübü (1000+ üye) | anbeankampus.co |
| `gazi-yapay-zeka-toplulugu` | Öğrenci kulübü (1800+ üye) | anbeankampus.co |
| `odtu-yapay-zeka-toplulugu` | Öğrenci kulübü (2020) | odtuyzt.github.io |
| `bilkent-ai-society` | Öğrenci kulübü | ais.bilkent.edu.tr |
| `gdg-on-campus-odtu` | GDG kampüs (306 üye) | gdg.community.dev |
| `gdg-on-campus-ostimtech` | GDG kampüs (159 üye) | gdg.community.dev |
| `ai-meetup-ankara` | Meetup (Ankara TEKMER'de) | luma.com |
| `ai-safety-turkiye` | Gönüllü topluluk (Ankara buluşmaları) | aistr sitesi |
| `yapay-zeka-politikalari-dernegi` | Dernek (AIPA) | kvkk.gov.tr haberi |

- **Alınmayanlar:** "Kollektif Zeka Ankara" ve Teknopark Ankara'daki "Yapay Zekâ Kümelenmesi". İkisi
  için de tek bir etkinlik sayfasından fazla bilgi bulunamadı. Yeni kaynak çıkarsa eklenebilir.
- **Bulunamayanlar:** TOBB ETÜ, Ankara Üniversitesi ve Atılım'da etkin bir yapay zekâ kulübü kaydı
  bulunamadı. GDG on Campus Ankara Üniversitesi, Çankaya ve THK kampüs grupları var, ama etkinlikleri
  doğrulanmadı.
- Üye sayıları kulüp profillerinden alındı; güncelliği doğrulanmadı.
- Hiçbirinde doğrudan yeşil odak yok (`surdurulebilirlik` alanına bu not yazıldı).
