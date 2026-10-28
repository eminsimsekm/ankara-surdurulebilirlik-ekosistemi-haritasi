# Astro'ya geçiş

**Tarih:** 2026-10-26

## Ne yapıldı
- Tek HTML dosyası, Astro ile üretilen çok sayfalı statik siteye dönüştürüldü.
- Her kategori ve her kurum kendi adresine sahip oldu (ör. `/tekmerler/netzero-tekmer/`).
- Veriler Content Collections'a taşındı: kayıt başına bir dosya, Türkçe alan adları
  (`ad`, `konum`, `etiketler`…). Hatalı alan build sırasında dosya adıyla bildiriliyor.
- Eski sürümün tüm bölümleri aktarıldıktan sonra eski dosya ve aktarma script'i kaldırıldı.

## Neden
Projenin büyüyebilmesi: yeni kayıt eklemek kod değiştirmeden mümkün olsun, ileride Django arka ucu
eklenebilsin.

## Nereye dokunuldu
- `src/content/` ve `src/content.config.ts`: içerik ve şemalar
- `src/lib/content.ts`: veri erişim katmanı

## Bilinmesi gerekenler
- Kullanıcının Node sürümü 22.17 olduğu için Astro 6 kullanılıyor (Astro 7, 22.23.4 istiyor).
- Asıl yayın yeri Altun Hosting; Django eklenince oraya geçilecek.
- Dosya adları kalıcı kimliktir; yayına çıktıktan sonra değiştirilmez.
