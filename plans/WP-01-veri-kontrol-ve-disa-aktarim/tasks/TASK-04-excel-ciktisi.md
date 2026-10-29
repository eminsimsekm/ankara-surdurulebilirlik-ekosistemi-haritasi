# TASK-04: Excel çıktısı

**WP:** [WP-01](../WP.md)
**Durum:** `todo`
**Bağımlı:** TASK-02
**Tahmini efor:** ~0.75g

## Ne yapılacak, neden?

İnsanların veriyi inceleyip paylaşacağı dosya. Teknik olmayan biri de açıp süzebilmeli, "hangi
kurumların yatırımı var", "sorunlu kayıtlar hangileri" gibi sorulara birkaç tıkla cevap bulabilmeli.

## Teknik tarif

**Yeni dosya:** `src/pages/veri/veri.xlsx.ts`, statik endpoint; `veriPaketi()` + `sorunlariBul()`
sonucundan çalışma kitabı üretir, `Uint8Array` olarak döndürür. Build sonunda `dist/veri/veri.xlsx`.

**Kütüphane:** `exceljs` (yalnızca build sırasında kullanılır, siteye JavaScript olarak gitmez).
Kurulumdan önce güncel sürümü ve Node 22 uyumu kontrol edilir.

**Sayfalar:**

| Sayfa | İçerik |
|-------|--------|
| Özet | Üretim tarihi, tablo başına sayılar, seviyeye göre sorun sayıları, "bu dosya salt okunurdur; düzeltme kaynak dosyada" notu |
| Kurumlar | Kurum başına bir satır: ad, kategori, konum, birincil alan, diğer alanlar, yatırım/iş birliği/takvim/araştırmacı sayıları, kaynak, sayfa bağlantısı, kaynak dosya, açıklama |
| İlişkiler | `iliskiler` görünümü: kayıt türü, kayıt, kurum |
| Yatırımlar, İş birlikleri, Takvim, Akademisyenler | Tablo başına bir sayfa; ilgili kurumlar virgülle tek sütunda; iş birliğinde taraflar ayrı sütunlarda |
| Sözlükler | Kategoriler, alanlar, üniversiteler, türler (her biri ayrı blok ya da sayfa) |
| Sorunlar | Seviye, kural, kayıt, mesaj, kaynak dosya |

**Biçim:** başlık satırı kalın ve dondurulmuş; otomatik filtre açık; sütun genişlikleri içeriğe göre;
URL'ler tıklanabilir bağlantı; dizi alanlar (etiketler) virgülle birleştirilmiş metin; sorunlarda
seviyeye göre satır rengi (uyarı sarı, bilgi gri).

## Adımlar

1. `exceljs`'i kur (sürüm kontrolüyle).
2. Sayfa başına bir küçük fonksiyon (`kurumlarSayfasi(kitap, paket)`…); endpoint bunları sırayla çağırır.
3. Build al, dosyayı Excel'de (ya da LibreOffice'te) aç; üç örnek kurumla siteyi karşılaştır.

## Açık kararlar

1. **Uzun metinler** (açıklama, yönetici özgeçmişi) Kurumlar sayfasında tam mı, kısaltılmış mı olsun?
   Öneri: tam, ama sütun dar ve "metni kaydır" kapalı; hücreye tıklayınca okunur.

## Kabul kriterleri

- [ ] `dist/veri/veri.xlsx` Excel'de hatasız açılıyor
- [ ] Kurumlar sayfasındaki ilişki sayıları, kurum sayfalarındaki bölüm sayılarıyla aynı
      (Evreka: 3 yatırım; ODTÜ-GÜNAM: 7 araştırmacı; NetZero TEKMER: 3 iş birliği + 1 takvim)
- [ ] Filtreler ve dondurulmuş başlıklar çalışıyor; Türkçe karakterler doğru
- [ ] `exceljs` siteye giden JavaScript'e girmiyor (sayfa boyutları değişmedi)
- [ ] `npm run build` 0 hata, 0 uyarı

## Notlar

- Excel'den geri yükleme kapsam dışı (WP kararı).
