# TASK-02: Sorun kuralları ve raporu

**WP:** [WP-01](../WP.md)
**Durum:** `todo`
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

1. **Kural listesi.** Yukarıdaki 8 kural uygun mu; çıkarılacak/eklenecek var mı?
   Öneri: bu liste ile başlansın, veri incelendikçe kural eklensin.
2. **Uyarılar build'i durdursun mu?** Öneri: **hayır**; uyarılar rapordur, kesin hatalar zaten
   şemada. Durdurursa her şüpheli kayıt yayını engeller.

## Kabul kriterleri

- [ ] 8 kural çalışıyor; her biri için mevcut verideki sonuç sayısı task'a not edildi
- [ ] K02 ve K03 için yanlış alarmlar elle kontrol edildi
- [ ] Kurallar saf fonksiyon; `KURALLAR` dizisine eklemekle yeni kural geliyor
- [ ] `npm run build` 0 hata, 0 uyarı

## Notlar

- Kaynak bağlantılarının açılıp açılmadığı (ölü bağlantı) bu task'ta yok; ağ gerektirir. Ayrı bir task/WP olabilir.
