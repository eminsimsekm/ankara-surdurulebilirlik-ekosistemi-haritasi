# WP-01: Veri kontrolü ve dışa aktarım

**Durum:** `todo`
**Bağımlı:** -
**Tahmini efor:** ~3g

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
- `npm run veri` komutu, GitHub Actions'ta sorun özeti, belgeler

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
| Çıktılar GitHub Pages'te yayınlansın mı | (açık) | TASK-06 |

## Task'lar

| Task | Başlık | Bağımlı | Efor | Durum |
|------|--------|---------|------|-------|
| [TASK-01](tasks/TASK-01-veri-paketi-modeli.md) | Veri paketi modeli (normalize tablolar) | - | ~0.5g | `todo` |
| [TASK-02](tasks/TASK-02-sorun-kurallari.md) | Sorun kuralları ve raporu | TASK-01 | ~0.75g | `todo` |
| [TASK-03](tasks/TASK-03-json-ciktisi.md) | JSON çıktısı | TASK-02 | ~0.25g | `todo` |
| [TASK-04](tasks/TASK-04-excel-ciktisi.md) | Excel çıktısı | TASK-02 | ~0.75g | `todo` |
| [TASK-05](tasks/TASK-05-ai-icin-okunur-paket.md) | AI için okunur paket (`veri.md`) | TASK-02 | ~0.25g | `todo` |
| [TASK-06](tasks/TASK-06-komutlar-yayin-ve-belgeler.md) | Komutlar, yayın kararı, CI özeti, belgeler | TASK-03, 04, 05 | ~0.5g | `todo` |

```
TASK-01 → TASK-02 ─┬─► TASK-03 ─┐
                   ├─► TASK-04 ─┼─► TASK-06
                   └─► TASK-05 ─┘
```

TASK-03, 04 ve 05 birbirinden bağımsızdır, herhangi bir sırayla yapılabilir.

## Bitti sayılması için

- [ ] Tüm task'lar `done` ya da `cancelled`
- [ ] `npm run veri` tek komutla üç çıktıyı ve sorun özetini üretiyor
- [ ] Excel'deki sayılar sitedekiyle aynı (kurum, alan, ilişki sayıları; örneklerle kontrol)
- [ ] `npm run build` 0 hata, 0 uyarı
- [ ] README ve GELISTIRME.md güncel
- [ ] Task notları ve WP kararları güncel (yapılan işin kaydı burası)
