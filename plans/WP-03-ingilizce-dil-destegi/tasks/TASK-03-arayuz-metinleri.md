# TASK-03: Arayüz metinleri

**WP:** [WP-03](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-01
**Tahmini efor:** ~0.5g

## Ne yapılacak, neden?

Bileşen ve sayfalardaki sabit Türkçe metinler (menü, arama kutuları, filtre etiketleri, "Tümü",
"Kaynak", boş liste mesajları, durum rozetleri…) tek yerde toplanır ve İngilizceleri yazılır.

## Teknik tarif

- **Yeni `src/i18n/tr.ts`**: Türkçe metinler (bugün bileşenlerde yazılı olanlar, aynen).
- **Yeni `src/i18n/en.ts`**: `typeof tr` tipinde; eksik anahtar derlemede hata verir.
- **Yeni `src/i18n/index.ts`**: `metinler(dil)`.
- Sayıya bağlı metinler fonksiyon: `kayit: (n) => ...`.
- `lib/takvim.ts`: durum etiketleri ve tarih biçimi dile göre; tarayıcıdaki yeniden hesap
  (`scripts/takvim-durum.ts`) dili `<html lang>`'dan alır.
- Sayı biçimi (`Intl.NumberFormat`) ve sektör grafiğindeki ondalık ayırıcı dile göre.

## Adımlar

1. Tüm bileşen ve sayfalarda sabit metinleri tara; `tr.ts`'e taşı.
2. `en.ts`'i yaz.
3. Bileşenleri `metinler(sayfaDili(Astro.url))` kullanacak şekilde değiştir.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] `/en/` sayfalarında Türkçe arayüz metni yok
- [x] Türkçe sayfalar önceki hâliyle aynı
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı (2026-10-30): `src/i18n/tr.ts`, `en.ts`, `index.ts`. Çoğul ekler fonksiyonla (`birim.kayit(n)`).
- Tema düğmesi metinleri `data-*` ile; takvim durumu tarayıcıda dili adresten alıyor (`adrestenDil`).
- `dist/en/` altındaki tüm görünür metin, placeholder ve aria-label'lar Türkçe arayüz kelimelerine karşı tarandı; kalan tek eşleşme özel isim.
