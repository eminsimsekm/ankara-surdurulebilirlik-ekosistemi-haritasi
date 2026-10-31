# WP-02: Topluluklar

**Durum:** `in-progress`
**Bağımlı:** -
**Tahmini efor:** ~2.5g

## Amaç

Ekosistemdeki öğrenci kulüpleri, gönüllü topluluklar, dernekler ve meetup grupları haritada ayrı bir
**Topluluk** kategorisi olarak görünsün. Kullanıcı `/topluluklar/` sayfasında Ankara'daki toplulukları
bulabilsin, haritada kendi diliminde görebilsin ve bu toplulukların hangi kurumlarla, üniversitelerle
ve etkinliklerle bağlantılı olduğunu kurum sayfalarından izleyebilsin. Toplulukların etkinliklerini
duyurduğu uygulamalar (Meetup, Luma, Kommunity, Masqot…) ayrı bir **Uygulama** kategorisinde listelenir.

## Neden

Haritada kurumlar (teknopark, TEKMER, girişim…) var ama ekosistemi besleyen topluluklar yok. Özellikle
yapay zekâ toplulukları üniversitelerde ve meetup'larda çok aktif; yetenek ve girişim akışının önemli
bir kısmı buradan geliyor. Sürdürülebilirlik ve iklim toplulukları da aynı kategoride toplanmalı.

## Kapsam

**Kapsamda:**
- `topluluk` kategorisi (menü, harita dilimi, renk, liste sayfası)
- Ankara'daki yapay zekâ toplulukları
- Üniversitelerin girişimcilik, teknoloji, enerji ve sürdürülebilirlik toplulukları
- Üniversite dışında etkinlik yapan topluluklar (meetup'lar, profesyonel topluluklar)
- `uygulama` kategorisi: toplulukların kullandığı etkinlik ve topluluk platformları
- Toplulukların kurumlara, üniversitelere ve takvim kayıtlarına bağlanması

**Kapsam dışı:**
- Topluluklara üyelik, takip ya da bildirim (Django işi, GELISTIRME.md 3)
- Topluluk etkinliklerinin otomatik çekilmesi (Luma, community.dev vb.); takvime elle girilir
- Türkiye geneli topluluklar; yalnızca Ankara'da faaliyeti ya da buluşması olanlar alınır
- Spor ve hobi toplulukları (ör. bisiklet dernekleri); ekosistemle bağı zayıf
- Sektör dernekleri (GÜNDER, TÜREB gibi); gerekirse `kamu` (küme) kategorisine girer

## Kararlar

| Karar | Sonuç | Nerede |
|-------|-------|--------|
| Ayrı kategori mi, platform'un altı mı | Ayrı kategori (`topluluk`, `/topluluklar/`). Platform kategorisi hızlandırıcı ve programlar içindir; topluluklar gönüllü ve üyelik temelli (2026-10-30). | TASK-01 |
| Kod değişikliği | Gerekmez: `kategoriler.yaml` + `tokens.css` rengi yeterli (GELISTIRME.md 4-O). | TASK-01 |
| Topluluk türü (öğrenci kulübü, dernek, meetup) | Şimdilik `etiketler`'de. Filtre gerekirse ayrı alan açılır. | TASK-02 |
| Faaliyet alanı | Yapay zekâ toplulukları `bilisim`. Yeni alan açılmadı. | TASK-02 |
| Kayıt alma ölçütü | Ankara'da faaliyeti/buluşması olan ve en az bir doğrulanabilir kaynak bağlantısı olan topluluklar. Yalnızca tek etkinlik sayfası olanlar alınmaz. | TASK-02 |
| Bilkent YES | `platform`'dan `topluluk`'a taşındı (öğrenci kulübü). Kimlik aynı kaldı; adres `/platformlar/bilkent-yes/` → `/topluluklar/bilkent-yes/` oldu (2026-10-30). | TASK-05 |
| Etkinlik platformları nerede | Ayrı `uygulama` kategorisi (`/uygulamalar/`); topluluk değil, topluluğun kullandığı araç (2026-10-30). | TASK-07 |
| Uygulamalar haritada görünsün mü | (açık) | TASK-07 |
| Öğrenci kulübünü üniversiteye bağlama | (açık) | TASK-04 |

## Task'lar

| Task | Başlık | Bağımlı | Efor | Durum |
|------|--------|---------|------|-------|
| [TASK-01](tasks/TASK-01-topluluk-kategorisi.md) | Topluluk kategorisi | - | ~0.1g | `review` |
| [TASK-02](tasks/TASK-02-yapay-zeka-topluluklari.md) | Yapay zekâ toplulukları (ilk kayıtlar) | TASK-01 | ~0.4g | `review` |
| [TASK-03](tasks/TASK-03-surdurulebilirlik-topluluklari.md) | Sürdürülebilirlik, enerji ve iklim toplulukları | TASK-01 | ~0.5g | `review` |
| [TASK-04](tasks/TASK-04-topluluk-iliskileri.md) | Toplulukları kurum, üniversite ve takvime bağlamak | TASK-02, 03, 05, 06 | ~0.5g | `todo` |
| [TASK-05](tasks/TASK-05-universite-girisimcilik-topluluklari.md) | Üniversite girişimcilik ve teknoloji toplulukları | TASK-01 | ~0.4g | `review` |
| [TASK-06](tasks/TASK-06-universite-disi-topluluklar.md) | Üniversite dışı topluluklar ve meetup'lar | TASK-01 | ~0.3g | `review` |
| [TASK-07](tasks/TASK-07-uygulamalar.md) | Uygulamalar (etkinlik ve topluluk platformları) | - | ~0.3g | `review` |

```
TASK-01 ─┬─► TASK-02 ─┐
         ├─► TASK-03 ─┤
         ├─► TASK-05 ─┼─► TASK-04
         └─► TASK-06 ─┘
TASK-07 (bağımsız)
```

TASK-02, 03, 05, 06 ve 07 birbirinden bağımsızdır; TASK-04 hepsinin kayıtlarını bağlar.

## Bitti sayılması için

- [ ] Tüm task'lar `done` ya da `cancelled`
- [x] `npm run build` 0 hata, 0 uyarı
- [x] Belgeler güncel (README "İçerik ekleme" tablosu)
- [x] Yeni kayıtlarda K01–K05 uyarısı yok
- [ ] Topluluk kayıtlarında K06 (ilişkisiz kurum) bilgisi kalmadı ya da gerekçesi task notunda
- [ ] Task notları ve WP kararları güncel (yapılan işin kaydı burası)
