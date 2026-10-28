# Kurumlar sayfasında kategoriye bağlı alan çipleri

**Tarih:** 2026-10-28

## Ne yapıldı
- Kurumlar sayfasında bir kategori seçilince Alan satırında yalnızca o kategorinin kurumlarının
  bulunduğu alanlar görünüyor; çiplerdeki sayılar da o kategoriye göre (ör. KOBİ'ler → Yenilenebilir enerji 6).
- Kategori çipleri ve sayıları hiç değişmiyor.
- Seçili alan yeni kategoride yoksa alan seçimi "Tümü"ye dönüyor (adres de güncelleniyor).

## Neden
Kategori seçiliyken tüm alanların genel sayılarla görünmesi kafa karıştırıyordu; tıklanınca boş
liste veren çipler çıkıyordu.

## Nereye dokunuldu
- `src/scripts/list-filter.ts`: çip grubu başka bir gruba bağlanabiliyor (`data-filter-bagli`)
- `src/components/FiltreCipleri.astro`: `bagli` prop'u
- `src/pages/kurumlar.astro`: alan grubu `bagli="kategori"`

## Bilinmesi gerekenler
- Genel bir özellik: başka bir sayfada da bir çip grubu `bagli="<üst parametre>"` ile bağlanabilir.
- Sayılar yalnızca üst gruptaki seçime göre; arama kutusuna yazılanı hesaba katmıyor.
