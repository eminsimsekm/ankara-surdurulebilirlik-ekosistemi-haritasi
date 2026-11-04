# TASK-02: Sorun kuralları ve raporu

**WP:** [WP-01](../WP.md)
**Durum:** `done`
**Bağımlı:** TASK-01
**Tahmini efor:** ~0.75g

## Ne yapılacak, neden?

Şema kesin hataları zaten yakalıyor ve build'i durduruyor (yanlış kurum kimliği, eksik alan, alan
sayımı tutarsızlığı…). Bu task bir adım ötesini yapar: **yanlış olmayabilir ama bakılması gereken**
kayıtları listeler. Rapor Excel'de, JSON'da ve AI paketinde aynı listedir.

## Teknik tarif

**Yeni dosya:** `src/lib/veri-kontrol.ts`. `veriPaketi()` sonucunu alır, sorun listesi döndürür:

```ts
interface Sorun {
  kural: string;          // "K01"
  seviye: "uyari" | "bilgi";
  kayitTuru: string;      // "kurum", "yatirim"…
  kayitId: string;
  kayitAdi: string;
  mesaj: string;          // insan için tek cümle
  kaynakDosya: string;
}
export function sorunlariBul(paket: VeriPaketi, bugun: Date): Sorun[]
```

Kurallar tek bir dizi (`KURALLAR`), her biri `{ kod, seviye, aciklama, bul(paket) }`. Yeni kural
eklemek diziye bir öğe eklemekten ibaret (SOLID: O). Saf fonksiyon: Astro'ya ve DOM'a bağımlı değil.

**İlk kural listesi:**

| Kod | Seviye | Kural |
|-----|--------|-------|
| K01 | uyarı | Kaynağı olmayan kayıt (kurum `kaynak`, yatırım/takvim `kaynak`, akademisyen `profil`) |
| K02 | uyarı | Olası tekrar: adları aramadaki biçimiyle (`searchKey`) aynı ya da çok benzer iki kurum |
| K03 | uyarı | İş birliğinde düz ad (`ad:`) olan taraf, haritadaki bir kurumun adına çok benziyor (bağlanması unutulmuş olabilir) |
| K04 | uyarı | Kurum açıklaması çok kısa (< 60 karakter) |
| K05 | uyarı | Yatırımın tarihi ya da tutarı yok (`—`, boş) |
| K06 | bilgi | Hiç ilişkisi olmayan kurum (yatırım, iş birliği, takvim, araştırmacı yok) |
| K07 | bilgi | Tarihi geçmiş, yıllık olmayan takvim kaydı (kapanmış; arşivlenebilir) |
| K08 | bilgi | Yalnızca bir kurumda kullanılmış etiket (etiket temizliği için) |

"Çok benzer" için basit ve açıklanabilir bir ölçü: `searchKey` sonrası eşitlik ya da biri diğerini
içeriyor ya da düzenleme mesafesi ≤ 2. Yanlış alarm verirse eşik kuralın içinde ayarlanır.

## Adımlar

1. `Sorun` tipi ve `KURALLAR` dizisi.
2. Kuralları tek tek yaz; her biri için mevcut veride kaç sorun çıktığına bak.
3. Yanlış alarmları ayıkla (eşik ayarı ya da istisna); her kural için en az bir gerçek örnek ya da
   "bu veride sorun yok" notu.
4. `sorunlariBul` sonucunu seviye ve kurala göre sırala.

## Açık kararlar

Kapandı (2026-10-29): 8 kuralla başlanır; uyarılar build'i durdurmaz.

1. **Kural listesi.** Yukarıdaki 8 kural uygun mu; çıkarılacak/eklenecek var mı?
   Öneri: bu liste ile başlansın, veri incelendikçe kural eklensin.
2. **Uyarılar build'i durdursun mu?** Öneri: **hayır**; uyarılar rapordur, kesin hatalar zaten
   şemada. Durdurursa her şüpheli kayıt yayını engeller.

## Kabul kriterleri

- [x] 8 kural çalışıyor; her biri için mevcut verideki sonuç sayısı task'a not edildi
- [x] K02 ve K03 için yanlış alarmlar elle kontrol edildi
- [x] Kurallar saf fonksiyon; `KURALLAR` dizisine eklemekle yeni kural geliyor
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı: `src/lib/veri-kontrol.ts` (2026-10-29).
- İlk çalıştırmada (2026-10-29 verisi): K01 2 (M-Based, VULCAN), K02 0, K03 0, K04 20, K05 3
  (HANE GSYF, TENMAK hidrojen merkezi, TTGV İklim Öncüsü fonu), K06 66, K07 3, K08 94 kurum.
  Toplam 25 uyarı (K01, K04, K05), 163 bilgi (K06, K07, K08).
- K02 ilk hâlinde (≤ 2 harf fark) "iNOVAT" ile "İnovest"i tekrar sandı; eşik ada göre ölçeklendi
  (her ~7 harfte 1 fark). Sonra K02 ve K03, veriye geçici yazım hataları eklenerek denendi; ikisi de
  yakaladı, test değişiklikleri geri alındı.
- K04'ün bulduğu 20 kurumun çoğu teknopark, TEKMER ve platform: açıklamaları tek cümle. İçerik işi.
- K08 bir etiket başına değil kurum başına tek satır üretir (etiket başına ~170 satır olurdu).

- Kaynak bağlantılarının açılıp açılmadığı (ölü bağlantı) bu task'ta yok; ağ gerektirir. Ayrı bir task/WP olabilir.
