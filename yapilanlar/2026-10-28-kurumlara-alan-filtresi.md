# Kurumlara faaliyet alanı

**Tarih:** 2026-10-28 (yapilacaklar/02)

## Ne yapıldı
- `alanlar.yaml` sözlüğü oluşturuldu; 105 kurumun her birine 1–3 alan yazıldı (zorunlu).
- Kategori sayfalarında alan çipleri, Kurumlar sayfasında kategori + alan çipleri birlikte süzüyor.
- Kurum satırında ve sayfasında alanlar, Kurumlar sayfasını o alana süzülmüş açan bağlantılar.
- Arama alan adıyla da buluyor ("hidrojen" → alanı Hidrojen olanlar).
- Aynı gün liste 12'den 17 alana çıkarıldı: Sağlık ve biyomedikal, Eğitim teknolojileri, Bilişim ve
  yapay zekâ, Sanayi ve ileri imalat, Yatırım ve finansman. 17 kurum yeniden düzenlendi;
  "Sektörden bağımsız" 27 kurumdan 16'ya indi.

## Nereye dokunuldu
- `src/content/alanlar.yaml`, kurum dosyalarında `alanlar:` satırı
- `src/scripts/list-filter.ts`: bir sayfada birden çok çip grubu ve çok değerli öğeler
  (`data-facet-<param>`)
- `src/components/AlanBaglantilari.astro`

## Bilinmesi gerekenler
- **Listedeki ilk alan birincil alandır**; kurum haritada o alanın diliminde durur.
- Teknopark ve TEKMER'lerde kurumun kendi odağı esas alınır, barındırdığı firmalar değil.
- Bilişim alanı yalnızca odağı bu olan kurumlara verilir, yazılımı araç olarak kullanan her girişime değil.
- Etiketler aynen duruyor; serbest ayrıntıdır, filtre olmaz.
- Eğitim ve Sanayi alanlarında şimdilik birer kurum var.
