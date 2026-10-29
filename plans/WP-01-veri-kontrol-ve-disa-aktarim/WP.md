# WP-01: Veri kontrolü ve dışa aktarım

**Durum:** `done`
**Bağımlı:** -
**Tahmini efor:** ~3.5g

## Amaç

Sitenin asıl değeri olan verinin (105 kurum, 63 akademisyen, 17 yatırım, 13 takvim kaydı, 27 iş birliği
ve aralarındaki ilişkiler) bütün olarak hızlıca incelenebilmesi ve hataların yakalanabilmesi:

- **Sorun raporu:** şüpheli kayıtları (kaynaksız, ilişkisiz, olası tekrar…) otomatik listeler.
- **Excel çıktısı:** tüm kayıtlar, ilişkiler ve sorunlar ayrı sayfalarda; süzülebilir, paylaşılabilir.
- **JSON çıktısı:** normalize tablolar; ileride Django veritabanına ilk yükleme için de kullanılır.
- **AI için okunur paket:** tek dosyada tüm veri ve ilişkiler, her kaydın kaynak dosya yoluyla.

## Neden

Kayıtlar dosya dosya duruyor; "hangi kurumun hiç ilişkisi yok", "kaynağı eksik olanlar hangileri",
"bu iki kurum aynı mı" gibi soruların cevabı için tek tek gezmek gerekiyor. Veri büyüdükçe hatalar
fark edilmeden yayına çıkıyor. Ayrıca ileride Django + veritabanına geçileceği için verinin tablo
yapısı şimdiden netleşmeli.

## Kapsam

**Kapsamda:**
- Normalize veri paketi (tablolar + ilişki tabloları), tek yerde üretilir
- Sorun kuralları ve raporu (uyarı/bilgi seviyeleri)
- `veri.json`, `veri.xlsx`, `veri.md` çıktıları
- `npm run build`'e bağlı çıktı üretimi, GitHub Actions'ta sorun özeti, belgeler
- Sitede herkese açık, iç notları olmayan Excel indirme (TASK-07)

**Kapsam dışı:**
- Excel'den geri yükleme (Excel'de düzelt → dosyalara işle). Excel salt okunurdur.
- Sitede ayrı bir inceleme sayfası (`/veri/` tablolu sayfa). Excel ve rapor bu ihtiyacı karşılıyor.
- Django fixture biçimine dönüştürme. JSON tabloları buna uygun tasarlanır; dönüştürme Django WP'sinde.
- Kaynak bağlantılarının internetten tek tek denetlenmesi (yavaş, ağa bağımlı; ayrı iş olabilir).

## Kararlar

| Karar | Sonuç | Nerede |
|-------|-------|--------|
| Tek doğru kaynak | `src/content/` dosyaları. Excel/JSON/MD üretilen, salt okunur kopyalardır; düzeltme kaynak dosyada yapılır. | WP |
| Çıktılar nerede üretilir | Astro build içinde statik endpoint'ler (`src/pages/veri/*.ts`). Sitenin veri katmanını (`content.ts`) aynen kullanır; ayrı Node script'i `astro:content`'e erişemeyeceği için veriyi ikinci kez yorumlamak zorunda kalırdı. | TASK-01 |
| Excel düzenlenebilir mi | Hayır, salt okunur. | WP |
| İnceleme sayfası | Yok; Excel + sorun raporu yeterli. | WP |
| Tablo ve alan adları | İçerik dosyalarındaki adlarla aynı (`ad`, `konum`, `birincilAlan`…); Django modeli ve API'si de bunları kullanacak (GELISTIRME.md 3.4). | TASK-01 |
| Çıktılar GitHub Pages'te yayınlansın mı | İç çıktılar (`veri.xlsx/json/md`) hayır: Pages'e yüklemeden önce `dist/veri/` silinir. Güncellendi (2026-10-29): sorunlar ve dosya yolları olmayan **genel bir Excel** sitede indirilebilir. | TASK-06, TASK-07 |
| Komut | Ayrı `npm run veri` yok; `npm run build` iç çıktıları da üretir (2026-10-29). | TASK-07 |
| Sorun kuralları | TASK-02'deki 8 kuralla başlanır; uyarılar build'i durdurmaz, yalnızca rapordur (2026-10-29). | TASK-02 |
| Excel'de uzun metinler | Tam yazılır, metin kaydırma kapalı (2026-10-29). | TASK-04 |

## Task'lar

| Task | Başlık | Bağımlı | Efor | Durum |
|------|--------|---------|------|-------|
| [TASK-01](tasks/TASK-01-veri-paketi-modeli.md) | Veri paketi modeli (normalize tablolar) | - | ~0.5g | `done` |
| [TASK-02](tasks/TASK-02-sorun-kurallari.md) | Sorun kuralları ve raporu | TASK-01 | ~0.75g | `done` |
| [TASK-03](tasks/TASK-03-json-ciktisi.md) | JSON çıktısı | TASK-02 | ~0.25g | `done` |
| [TASK-04](tasks/TASK-04-excel-ciktisi.md) | Excel çıktısı | TASK-02 | ~0.75g | `review` |
| [TASK-05](tasks/TASK-05-ai-icin-okunur-paket.md) | AI için okunur paket (`veri.md`) | TASK-02 | ~0.25g | `done` |
| [TASK-06](tasks/TASK-06-komutlar-yayin-ve-belgeler.md) | Komutlar, yayın kararı, CI özeti, belgeler | TASK-03, 04, 05 | ~0.5g | `review` |
| [TASK-07](tasks/TASK-07-sitede-indirme-ve-build-zinciri.md) | Sitede Excel indirme ve build zinciri | TASK-04, 06 | ~0.5g | `review` |

```
TASK-01 → TASK-02 ─┬─► TASK-03 ─┐
                   ├─► TASK-04 ─┼─► TASK-06
                   └─► TASK-05 ─┘          TASK-06 ─► TASK-07
```

TASK-03, 04 ve 05 birbirinden bağımsızdır, herhangi bir sırayla yapılabilir.

## Bitti sayılması için

- [ ] Tüm task'lar `done` ya da `cancelled`
- [x] `npm run build` tek komutla siteyi, iç çıktıları ve sorun özetini üretiyor; sitede genel Excel indirilebiliyor
- [x] Excel'deki sayılar sitedekiyle aynı (kurum, alan, ilişki sayıları; örneklerle kontrol)
- [x] `npm run build` 0 hata, 0 uyarı
- [x] README ve GELISTIRME.md güncel
- [x] Task notları ve WP kararları güncel (yapılan işin kaydı burası)
