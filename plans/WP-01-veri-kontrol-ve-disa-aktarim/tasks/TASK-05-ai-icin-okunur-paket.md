# TASK-05: AI için okunur paket (`veri.md`)

**WP:** [WP-01](../WP.md)
**Durum:** `done`
**Bağımlı:** TASK-02
**Tahmini efor:** ~0.25g

## Ne yapılacak, neden?

Tüm veriyi ve ilişkileri tek bir okunaklı Markdown dosyasında toplamak. Bu dosya bir AI'a (ya da
insana) "bunu incele, hataları ve eksikleri bul" diye verilir. Her kaydın yanında kaynak dosya yolu
olduğu için AI düzeltmeyi doğrudan doğru dosyada önerebilir ya da yapabilir.

## Teknik tarif

**Yeni dosya:** `src/pages/veri/veri.md.ts`, statik endpoint; `dist/veri/veri.md` üretir.

**Yapı:**

```markdown
# Ankara Sürdürülebilirlik Haritası — veri paketi
Üretildi: 2026-…  ·  105 kurum · 63 akademisyen · …

> Bu dosya üretilmiştir, düzenlenmez. Düzeltmeler her kaydın `dosya:` satırındaki kaynak
> dosyada yapılır. Alanların anlamı: README.md "İçerik ekleme".

## Sorunlar (N)
- [uyarı K01] Evreka: kaynak yok — dosya: src/content/…

## Kurumlar
### Evreka (`evreka`) — Girişim
dosya: src/content/aktorler/girisim/evreka.md
alanlar: Atık ve döngüsel ekonomi (birincil)
konum: … · kaynak: …
açıklama: …
- Yatırımlar: Evreka · ilk tur (2017-03, $740 bin); …
- İş birlikleri: …
- Takvim: …
- Araştırmacılar: …

## Akademisyenler / Yatırımlar / Takvim / İş birlikleri / Sözlükler
(kısa satırlar, kimlik + dosya yoluyla)
```

Kurumlar kategori sırasıyla, kategori içinde sitedeki sırayla.

## Adımlar

1. Endpoint'i yaz; bölüm başına küçük fonksiyonlar.
2. Dosyayı bir AI'a örnek bir görevle ver ("kaynağı eksik kurumları ve olası tekrarları bul") ve
   cevabın doğru dosya yollarını gösterdiğini kontrol et.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] `dist/veri/veri.md` üretiliyor; başında "üretilmiştir, düzenlenmez" notu var
- [x] Her kayıtta kaynak dosya yolu var ve yol gerçekten var
- [x] Bir kurumun ilişkileri kurum sayfasındakilerle aynı (Evreka, NetZero TEKMER, ODTÜ-GÜNAM)
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı: `src/pages/veri/veri.md.ts` (2026-10-29). Dosya ~126 KB (kabaca 35 bin token); 225 dosya
  yolunun hepsi doğrulandı. Sırası: Sorunlar, Kurumlar (kategori başlıklarıyla), Yatırımlar, İş birlikleri,
  Takvim, Akademisyenler, Sözlükler.
- Adım 2 (bir AI'a örnek görevle vermek) ayrıca yapılmadı; dosya yolları ve ilişkiler programla doğrulandı.

- Dosya büyürse (yüzlerce kurum) AI bağlam sınırına takılabilir; o zaman kategori başına ayrı
  dosyalara bölünür.
