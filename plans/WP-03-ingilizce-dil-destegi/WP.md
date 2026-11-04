# WP-03: İngilizce dil desteği

**Durum:** `review`
**Bağımlı:** -
**Tahmini efor:** ~3g

## Amaç

Sitenin tamamı İngilizce de okunabilsin. Sağ üstteki Türkiye ve Birleşik Krallık bayraklarıyla iki dil
arasında geçilir; geçişte aynı sayfada kalınır (filtre ve arama korunur). Özel isimler (kurum, kişi,
program, etkinlik adları) iki dilde de Türkçe kalır; arayüz metinleri, açıklamalar ve içerik İngilizcedir.

## Neden

Ekosistemin yatırımcı, uluslararası program ve araştırma ortakları Türkçe bilmiyor. Harita, Ankara
ekosistemini dışarıya tanıtmanın aracı olarak da kullanılmak isteniyor.

## Kapsam

**Kapsamda:**
- Türkçe kökte (`/kurumlar/`), İngilizce `/en/` altında (`/en/kurumlar/`): her sayfanın statik iki hâli
- Sağ üstte bayraklı dil seçici
- Arayüz metinleri (menü, düğmeler, başlıklar, filtreler, durum rozetleri, tarih ve sayı biçimleri)
- Sözlükler (kategoriler, alanlar, türler, etiketler, unvanlar, birimler) ve tüm kayıtların açıklamaları
- Sayfa metinleri (`sayfalar/*.md`)
- Çevirisi olmayan kayıtta Türkçeye düşme (site kırılmaz)

**Kapsam dışı:**
- Adreslerin (slug) çevrilmesi: `/en/tekmerler/` kalır; kimlikler kalıcıdır (CLAUDE.md 3.3)
- İndirilen Excel, `veri.json` ve `veri.md` çıktılarının İngilizcesi
- `/tasarim` önizleme sayfası (iç sayfa, yalnızca Türkçe)
- Otomatik/makine çevirisinin build sırasında yapılması; çeviriler dosyada durur ve elle düzeltilebilir

## Kararlar

| Karar | Sonuç | Nerede |
|-------|-------|--------|
| Dil nasıl seçilir | Ayrı adres: Türkçe kökte, İngilizce `/en/`. İstemci tarafında metin değiştirme yok; her dil statik HTML (arama motorları ve paylaşılan bağlantılar için doğru dil). | TASK-01 |
| Rotalar | Sayfalar `src/pages/[...dil]/` altına taşınır; her sayfa tek dosya, `getStaticPaths` iki dili üretir. Kopya sayfa dosyası yok. | TASK-01 |
| Çeviriler nerede | Türkçe dosyalara dokunulmaz. İngilizce içerik `src/content/en/` altında ayrı dosyalarda; arayüz metinleri `src/i18n/tr.ts` ve `src/i18n/en.ts`. | TASK-03, 04 |
| Neler Türkçe kalır | Kayıt adları (`ad`), kişi adları, üniversite adları, düzenleyen kurum, yatırımcı adları, konumdaki yer adları. | WP |
| Çeviri birleştirme | `content.ts` İngilizce alanları Türkçe kaydın üzerine bindirir; bileşenler verinin hangi dilde olduğunu bilmez (CLAUDE.md 4-L). Eksik alan Türkçe kalır. | TASK-04 |
| Etiket çevirisi | Tek sözlükten (`etiketler: tr → en`); sözlükte olmayan etiket (özel isim) olduğu gibi kalır. | TASK-05 |
| Bayraklar | Satır içi SVG (emoji bayrak Windows'ta görünmüyor). İngilizce için Birleşik Krallık bayrağı. | TASK-02 |
| Metin içindeki kurum adları | İngilizce metinde de Türkçe ("Ankara Kalkınma Ajansı", "Hacettepe Üniversitesi"); anlam gerekirse parantez içinde İngilizce açıklama. Yabancı kurumlar kendi adıyla. Akademik bölüm adları (Makine Mühendisliği…) unvan gibi çevrilir. (2026-10-30) | TASK-06 |
| İstisnalar | Yatırım adı açıklayıcı başlıksa (`Evreka · büyüme turu`) ve takvimde `duzenleyen` hedef kitle açıklamasıysa (`KOBİ'ler`) İngilizcesi yazılabilir. | TASK-06 |
| `dil` parametresi | `content.ts` fonksiyonlarında zorunlu: unutulan çağrıyı `astro check` yakalar (varsayılan Türkçe olsaydı İngilizce sayfada sessizce Türkçe görünürdü). | TASK-04 |
| Veri çıktıları | Excel, JSON, MD Türkçe kalır; JSON'a yalnızca çevirisi olan kimlikler (`ingilizce`) eklendi, paket sürümü 2. | TASK-08 |

## Task'lar

| Task | Başlık | Bağımlı | Efor | Durum |
|------|--------|---------|------|-------|
| [TASK-01](tasks/TASK-01-dil-altyapisi-ve-rotalar.md) | Dil altyapısı ve `/en/` rotaları | - | ~0.5g | `review` |
| [TASK-02](tasks/TASK-02-bayrakli-dil-secici.md) | Bayraklı dil seçici | TASK-01 | ~0.2g | `review` |
| [TASK-03](tasks/TASK-03-arayuz-metinleri.md) | Arayüz metinleri | TASK-01 | ~0.5g | `review` |
| [TASK-04](tasks/TASK-04-ingilizce-icerik-katmani.md) | İngilizce içerik katmanı (`src/content/en/`) | TASK-01 | ~0.4g | `review` |
| [TASK-05](tasks/TASK-05-sozluk-cevirileri.md) | Sözlük çevirileri | TASK-04 | ~0.3g | `review` |
| [TASK-06](tasks/TASK-06-kayit-cevirileri.md) | Kayıt çevirileri | TASK-04 | ~0.8g | `review` |
| [TASK-07](tasks/TASK-07-sayfa-metinleri.md) | Sayfa metinleri | TASK-04 | ~0.2g | `review` |
| [TASK-08](tasks/TASK-08-eksik-ceviri-kontrolu-ve-belgeler.md) | Eksik çeviri kontrolü ve belgeler | TASK-06 | ~0.2g | `review` |

```
TASK-01 ─┬─► TASK-02
         ├─► TASK-03
         └─► TASK-04 ─┬─► TASK-05
                      ├─► TASK-06 ─► TASK-08
                      └─► TASK-07
```

## Bitti sayılması için

- [ ] Tüm task'lar `done` ya da `cancelled`
- [x] Her Türkçe sayfanın `/en/` karşılığı var; bayrakla aynı sayfaya geçiliyor
- [x] İngilizce sayfalarda Türkçe arayüz metni kalmadı (özel isimler hariç)
- [x] `npm run build` 0 hata, 0 uyarı
- [x] README ve CLAUDE.md'de yeni kayıt eklerken İngilizcenin nereye yazılacağı anlatılıyor
- [x] Task notları ve WP kararları güncel
