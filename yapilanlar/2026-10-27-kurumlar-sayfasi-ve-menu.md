# Kurumlar sayfası ve iki katmanlı menü

**Tarih:** 2026-10-27

## Ne yapıldı
- Tüm kurumları kategori çipleri ve aramayla tek listede gösteren `/kurumlar/` sayfası eklendi.
- Üst menü iki katmanlı oldu: kurum kategorileri yalnızca Kurumlar bölümündeyken alt satırda görünüyor.
- Haritadaki kategori filtresi, listelerdeki filtre çipleriyle aynı bileşene (`FiltreCipleri`) taşındı.
- Sonraki işler için `yapilacaklar/` klasörü açıldı (kayıtları kurumlara bağlama, alan filtresi).

## Nereye dokunuldu
- `src/pages/kurumlar.astro`, `src/components/SiteNav.astro`
- `src/components/FiltreCipleri.astro`, `src/scripts/harita.ts`
- Menüdeki kategoriler `kategoriler.yaml`'daki `menuAdi` / `menuSira` alanlarından gelir.
