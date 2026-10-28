# Yapılanlar

Bitmiş işlerin kısa özetleri. Her dosya tek bir iştir: ne yapıldı, neden, nereye dokunuldu ve
bilinmesi gerekenler. Ayrıntı ve kodun kendisi git geçmişinde.

`yapilacaklar/` klasöründeki bir iş bitince oradaki dosyası silinir, buraya özeti eklenir.
Planlanmadan yapılan işler (küçük düzeltmeler hariç) de buraya yazılır.

**Yeni kayıt eklemek:** `YYYY-AA-GG-kisa-ad.md` adıyla bir dosya açılır (aşağıdaki şablon) ve
tablonun en üstüne bir satır eklenir.

| Tarih | İş | Özet |
|---|---|---|
| 2026-10-28 | [Harita panelinde kısa kurum kartı](2026-10-28-harita-paneli-ozet.md) | Panelde yalnızca önemli bilgiler, ayrıntılar kurum sayfasında |
| 2026-10-28 | [Haritada kategori görünümü](2026-10-28-haritada-kategori-gorunumu.md) | Seçilen kategori tüm daireye yayılır, alanlara göre dilimlenir; mobilde numaralı lejant |
| 2026-10-28 | [Kurumlara faaliyet alanı](2026-10-28-kurumlara-alan-filtresi.md) | 17 alanlık kontrollü liste, alan filtre çipleri |
| 2026-10-28 | [Kayıtları kurumlara bağlama](2026-10-28-kayitlari-kurumlara-baglama.md) | Yatırım, iş birliği, takvim ve akademisyenler kurum sayfalarında |
| 2026-10-28 | [Geliştirme kuralları](2026-10-28-gelistirme-kurallari.md) | Django'ya hazırlık ve SOLID kuralları (`GELISTIRME.md`) |
| 2026-10-28 | [GitHub Pages önizlemesi](2026-10-28-github-pages-onizleme.md) | Geliştirme sürecinde siteyi paylaşmak için geçici yayın |
| 2026-10-27 | [Kurumlar sayfası ve iki katmanlı menü](2026-10-27-kurumlar-sayfasi-ve-menu.md) | Tüm kurumlar tek sayfada, menüde kurum kategorileri alt satırda |
| 2026-10-26 | [Astro'ya geçiş](2026-10-26-astro-gecisi.md) | Tek HTML dosyası çok sayfalı Astro sitesine dönüştü |
| 2026-10-22 | [İlk sürüm](2026-10-22-ilk-surum.md) | Tek dosyalık HTML harita |

## Şablon

```markdown
# <İşin adı>

**Tarih:** YYYY-AA-GG

## Ne yapıldı
Kullanıcının göreceği değişiklik, 2–5 madde.

## Neden
Bir iki cümle.

## Nereye dokunuldu
Önemli dosyalar ve yeni uzatma noktaları.

## Bilinmesi gerekenler
Verilen kararlar, sınırlamalar, sonraya bırakılanlar.
```
