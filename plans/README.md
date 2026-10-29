# Plans

Bu klasör, projenin iş planlamasını **Work Package (WP)** yapısıyla tutar.
Her WP; belirli bir hedefe yönelik işleri gruplayan bir klasördür ve içinde
o hedefe ulaşmak için yapılması gereken **Task**'lar bulunur.

```
plans/
├── README.md               <- bu dosya
├── _template/              <- yeni WP oluştururken kopyalanacak şablon
│   ├── WP.md
│   └── tasks/
│       └── TASK-00-template.md
└── WP-01-veri-kontrol-ve-disa-aktarim/
    ├── WP.md
    └── tasks/
        ├── TASK-01-veri-paketi-modeli.md
        └── ...
```

## Kurallar

- **Klasör adı:** `WP-<numara>-<kısa-slug>` (örn. `WP-01-veri-kontrol-ve-disa-aktarim`).
  Numara iki haneli ve artan sıradadır (01, 02, 03, ...).
- **WP.md:** Work package'ın özet dosyasıdır; amaç, kapsam, durum, kararlar ve
  task listesini içerir. Şablon: [`_template/WP.md`](_template/WP.md).
- **tasks/ klasörü:** O WP'ye ait her görev ayrı bir dosyadır:
  `TASK-<numara>-<kısa-slug>.md`. Numara her WP içinde kendi başına
  01'den başlar. Şablon: [`_template/tasks/TASK-00-template.md`](_template/tasks/TASK-00-template.md).
- Bir task'ın durumu değişince hem task dosyasındaki **Durum** satırı hem `WP.md`'deki
  task tablosu güncellenir. WP'nin durumu, task'larının durumundan çıkar.
- Bir WP `done` olunca klasörü silinmez: plan, kararlar ve task notları yapılan işin kaydı
  olarak burada kalır. Uygulama sırasında öğrenilenler task'ın **Notlar** bölümüne yazılır.
- Kod yazılırken [`GELISTIRME.md`](../GELISTIRME.md) kuralları geçerlidir; task'ın
  kabul kriterleri bunlara ek olarak sağlanır.

## Yeni bir Work Package oluşturmak

1. `_template/` klasörünü `WP-<numara>-<slug>/` adıyla kopyala.
2. `WP.md` içindeki alanları doldur.
3. `tasks/TASK-00-template.md` dosyasını gerçek görevler için çoğalt
   ve numaralandır (`TASK-01-...`, `TASK-02-...`).
4. `WP.md` içindeki task tablosuna yeni task'ları ekle.
5. Aşağıdaki yol haritası tablosuna WP'yi ekle.

**Claude Code ile yaptırmak için:** "`plans/WP-01-.../tasks/TASK-01-....md` dosyasını oku ve uygula"
demek yeterli. Task'ta ya da WP'de açık karar varsa önce onları sorar.

## Durum etiketleri

Hem WP hem Task dosyalarında aynı durum sözlüğü kullanılır:

| Etiket        | Anlamı                                  |
|---------------|------------------------------------------|
| `todo`        | Henüz başlanmadı                         |
| `in-progress` | Üzerinde çalışılıyor                     |
| `blocked`     | Bir bağımlılık/engel nedeniyle bekliyor  |
| `review`      | Tamamlandı, gözden geçirme bekliyor      |
| `done`        | Tamamlandı ve onaylandı                  |
| `cancelled`   | İptal edildi                             |

## Yol haritası

| WP | Başlık | Bağımlı | Task | Tahmini efor | Durum |
|----|--------|---------|------|--------------|-------|
| [WP-01](WP-01-veri-kontrol-ve-disa-aktarim/WP.md) | Veri kontrolü ve dışa aktarım (sorun raporu, JSON, Excel) | - | 6 | ~3g | `todo` |

Bu yapıdan önce yapılan işler (Astro'ya geçiş, kayıtları kurumlara bağlama, alan filtresi,
harita kategori görünümü…) git geçmişinde.

```
WP-01
```
