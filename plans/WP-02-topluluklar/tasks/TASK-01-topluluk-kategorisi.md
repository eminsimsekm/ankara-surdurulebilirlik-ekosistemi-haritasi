# TASK-01: Topluluk kategorisi

**WP:** [WP-02](../WP.md)
**Durum:** `review`
**Bağımlı:** -
**Tahmini efor:** ~0.1g

## Ne yapılacak, neden?

Haritaya yeni bir **Topluluk** kategorisi eklenir. Böylece topluluk kayıtları üst menüde "Topluluklar"
adıyla, haritada kendi renginde bir dilim olarak ve `/topluluklar/` liste sayfasında görünür.

## Teknik tarif

GELISTIRME.md 4-O tablosundaki "Yeni kategori" satırı: yalnızca veri ve renk değişir.

- `src/content/kategoriler.yaml`: `topluluk` anahtarı (`yol: topluluklar`, `sira: 13`, `menuSira: 9`).
  `menuSira` olduğu için Kurumlar menüsüne ve kurum sayısına kendiliğinden girer.
- `src/styles/tokens.css`: `--c-topluluk: light-dark(#4F46B8, #A39BF2)` (çivit; diğer kategori
  renklerinden ayrışıyor).
- Kayıtlar: `src/content/aktorler/topluluk/<ad>.md`, `kategori: topluluk`.
- Sayfa, menü, harita ve veri çıktıları (`veri.xlsx/json/md`) kod değişmeden yeni kategoriyi alır.

## Adımlar

1. `kategoriler.yaml`'a `topluluk` kaydını ekle.
2. `tokens.css`'e rengi ekle.
3. README "İçerik ekleme" tablosu ve `content.config.ts`'teki aktör yorumuna "topluluk" ekle.
4. `npm run build`; `/topluluklar/`, menü ve harita dilimini kontrol et. `/tasarim` sayfasında renk dolu görünmeli.

## Açık kararlar

Yok.

## Kabul kriterleri

- [x] `/topluluklar/` sayfası ve her kayıt için detay sayfası üretiliyor
- [x] Üst menüde "Topluluklar" var; haritada topluluk dilimi görünüyor
- [x] Renk açık ve koyu temada tanımlı
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- Uygulandı (2026-10-30). Kodda değişiklik gerekmedi; yalnızca veri, renk ve iki belge satırı.
- Build ilk denemede `exceljs` kurulu olmadığı için durdu (paket `package.json`'da vardı ama
  `node_modules`'ta yoktu). `npm install` ile çözüldü; bu task'la ilgisi yok.
