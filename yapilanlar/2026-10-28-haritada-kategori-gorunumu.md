# Haritada kategori görünümü

**Tarih:** 2026-10-28 (yapilacaklar/03)

## Ne yapıldı
- Haritada bir kategori seçilince yalnızca o kategorinin noktaları kalıyor ve tüm daireye yayılıyor.
  Dilimler: kurumlarda birincil alan, akademisyenlerde üniversite, yatırımlarda tür; etkinlik ve
  destekler tek dilim.
- Noktalar çipe tıklanınca yeni yerlerine kayıyor; adresle (`/?kategori=tekmer`) açılan sayfa
  doğrudan kategori görünümünde geliyor.
- Dilim etiketlerinde tam ad yazıyor, uzun adlar birkaç satıra bölünüyor (panel ve çiplerle aynı ad).
- Dar ekranda (≤700px) etiketlerin yerine numaralar, haritanın altında numaralı lejant.

## Nereye dokunuldu
- `src/components/harita/kaynaklar.ts`: düğümlere `altGrup` (hangi dilime gireceği)
- `src/lib/harita-yerlesim.ts`: dilim anahtarı genelleştirildi, halka ayarı parametre oldu
- `src/components/harita/Harita.astro`, `src/scripts/harita.ts`

## Bilinmesi gerekenler
- Konumlar build sırasında hesaplanır; tarayıcıda yalnızca görünüm değişir (CSS transform).
- Gruplamayı değiştirmek için yalnızca ilgili kaynağın `altGrup`'u değişir.
- Seçili kayıt yeni görünümde yoksa harita etiketi gizlenir, panel olduğu gibi kalır.
- Telefonda noktalar hâlâ küçük (~5px); dokunmak zor olabilir. Ayrı iş olarak ele alınabilir.
