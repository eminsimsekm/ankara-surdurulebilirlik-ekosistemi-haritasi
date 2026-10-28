# GitHub Pages önizlemesi

**Tarih:** 2026-10-28

## Ne yapıldı
- `main`'e her push'ta siteyi derleyip GitHub Pages'e yayınlayan iş akışı eklendi.
- Site GitHub Pages'te alt klasörde açıldığı için tüm site içi bağlantılar tek bir yardımcıdan
  (`yol()`) geçecek şekilde düzenlendi. Markdown metinlerindeki bağlantılar da otomatik düzeltiliyor.

## Neden
Geliştirme sürerken başkalarının siteyi görebilmesi. Asıl yayın Altun Hosting'de olacak.

## Nereye dokunuldu
- `.github/workflows/pages.yml`, `astro.config.mjs` (`BASE_PATH`, `SITE_URL`)
- `src/lib/yol.ts`: site içi bağlantılar

## Bilinmesi gerekenler
- Yeni site içi bağlantı `href="/..."` diye yazılmaz, `yol("/...")` kullanılır.
- Repo private ise GitHub Pages için repo public olmalı ya da hesap Pro olmalı.
- Altun Hosting'e geçince `pages.yml` silinir; kod değişmez.
