# Haritada dilim vurgusu

**Tarih:** 2026-10-28

## Ne yapıldı
- Fareyle bir dilimin (ya da bir noktanın) üzerine gelince o dilim vurgulanıyor: alanı kategori
  rengiyle hafifçe dolup %4 büyüyor, noktaları büyüyor, etiketi kalınlaşıyor.
- Diğer dilimlerin noktaları soluyor; fare haritadan çıkınca her şey eski hâline dönüyor.
- Vurgu sırasında merkezdeki yazının yerine dilimin kayıt sayısı ve birimi geliyor
  (ör. "39 kayıt", "24 akademisyen", "4 kurum"); arama varsa eşleşen/toplam ("1/5").
- Genel görünümde dilim = kategori, kategori görünümünde dilim = alan / üniversite / tür.

## Neden
Haritanın fareye tepki vermesi; hangi noktanın hangi dilime ait olduğu bir bakışta görünsün.

## Nereye dokunuldu
- `src/lib/harita-yerlesim.ts`: her dilimin halka parçası şekli (`alan`)
- `src/components/harita/Harita.astro`: dilim alanları, noktalarda `data-dilim-genel` / `data-dilim-kategori`, stiller
- `src/scripts/harita.ts`: `vurgula()` (merkez sayısı da burada)
- Birim görünüm başına `data-birim`: menüdeki kategoriler "kurum", akademisyen "akademisyen", diğerleri "kayıt"

## Bilinmesi gerekenler
- Yalnızca fareyle çalışır; telefonda dokunuşta takılı kalmasın diye kapalı.
- "Hareketi azalt" ayarı açıksa büyüme animasyonu yok, yalnız renk vurgusu var.
- Seçili nokta ve arama sonucu soluklaştırılan noktalar vurgudan etkilenmez.
