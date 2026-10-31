# TASK-02: Bayraklı dil seçici

**WP:** [WP-03](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-01
**Tahmini efor:** ~0.2g

## Ne yapılacak, neden?

Sağ üstte, tema düğmesinin yanında Türkiye ve Birleşik Krallık bayrakları. Tıklanan bayrak aynı sayfanın
o dildeki hâline götürür; seçili dil vurgulu görünür.

## Teknik tarif

- **Yeni `src/components/DilSecici.astro`**: iki bağlantı, satır içi SVG bayrak, `hreflang` ve `lang`
  nitelikleri, seçili olanda `aria-current="true"`.
- Hedef adres sunucuda hesaplanır (`digerDilYolu`); tıklanınca küçük bir script adresteki `?…` ve `#…`
  kısmını ekler, böylece filtre, arama ve seçili kayıt korunur.

## Adımlar

1. Bileşeni yaz, `BaseLayout`'un üst satırına ekle.
2. Dar ekranda (≤ 400px) sığdığını kontrol et.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] Her sayfada iki bayrak; tıklayınca aynı sayfanın diğer dili açılıyor
- [x] Filtreli bir listede dil değişince filtre korunuyor
- [x] Ekran okuyucu için anlamlı etiketler ("Türkçe", "English")
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı (2026-10-30): `src/components/DilSecici.astro`, `BaseLayout` üst satırında tema düğmesinin solunda.
- Bayrak + kod (TR/EN); 420px altında yalnızca bayrak. Ekran okuyucu için dil adı gizli metin olarak.
- Masaüstü, 390px ve 360px genişlikte ekran görüntüsüyle kontrol edildi; tema düğmesi tek satıra alındı (`white-space: nowrap`).
