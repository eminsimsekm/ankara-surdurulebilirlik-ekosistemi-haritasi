# TASK-01: Dil altyapısı ve `/en/` rotaları

**WP:** [WP-03](../WP.md)
**Durum:** `review`
**Bağımlı:** -
**Tahmini efor:** ~0.5g

## Ne yapılacak, neden?

Her sayfanın Türkçe (kök) ve İngilizce (`/en/`) iki statik hâli üretilir. Bağlantılar bulunulan dilde kalır.

## Teknik tarif

- **Yeni `src/lib/dil.ts`** (saf): `Dil` tipi (`"tr" | "en"`), `DILLER`, `dilYollari()` (getStaticPaths
  parametreleri: Türkçe için `dil: undefined`), adresten dil bulma, diğer dildeki adres, yerel ayar
  (`tr-TR`, `en-GB`).
- **`src/lib/yol.ts`**: `yol(kokYolu, dil = "tr")`; İngilizcede `/en` öneki eklenir.
- **Sayfalar** `src/pages/[...dil]/` altına taşınır. Statik sayfalar `getStaticPaths = dilYollari`;
  dinamik sayfalar kendi yollarını her dil için çoğaltır. `indir/`, `veri/` uç noktaları ve `tasarim.astro` kökte kalır.
- Bileşenler dili `Astro.url`'den okur (`sayfaDili(Astro.url)`); dil prop olarak her bileşene taşınmaz.
- `BaseLayout`: `<html lang>`, `hreflang` alternatif bağlantıları.

## Adımlar

1. `dil.ts`, `yol.ts`.
2. Sayfaları taşı, `getStaticPaths`'leri iki dile aç.
3. `content.ts`'teki adres fonksiyonlarına `dil` ekle.

## Açık kararlar

Yok. (`[...dil]` rotasının Astro 6'da kök ve `/en/` için birlikte çalıştığı ayrı bir deneme projesinde doğrulandı.)

## Kabul kriterleri

- [x] Her sayfanın `/en/` karşılığı üretiliyor; Türkçe adresler değişmedi
- [x] İngilizce sayfadaki site içi bağlantılar `/en/` altında
- [x] `<html lang>` ve `hreflang` doğru
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı (2026-10-30). `src/lib/dil.ts`, `src/lib/yol.ts` (`yol(…, dil)`, `sayfaDili`, `baskaDilde`).
- Sayfalar `git mv` ile `src/pages/[...dil]/` altına taşındı; Türkçe adresler değişmedi. 165 Türkçe + 164 İngilizce sayfa
  (`/tasarim` yalnızca Türkçe; `BaseLayout`'a `tekDil` eklendi, orada dil seçici ve hreflang çizilmez).
- `hreflang` yalnızca `SITE_URL` tanımlıyken yazılır (tam adres gerekiyor).
- Alt klasörde yayın (`BASE_PATH=/harita/`) ile de denendi: bağlantılar, `lang`, `hreflang` doğru.
