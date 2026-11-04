# TASK-07: Uygulamalar (etkinlik ve topluluk platformları)

**WP:** [WP-02](../WP.md)
**Durum:** `review`
**Bağımlı:** -
**Tahmini efor:** ~0.3g

## Ne yapılacak, neden?

Toplulukların etkinliklerini duyurduğu ve üye topladığı platformlar (Meetup, Luma, Masqot…) ayrı bir
**Uygulamalar** bölümünde listelenir. Ankara'daki buluşmaları takip etmek isteyen biri nereye bakacağını
bilir. Bunlar topluluk değil, topluluğun kullandığı araç olduğu için ayrı kategoride durur.

## Teknik tarif

CLAUDE.md 4-O "Yeni kategori" satırı; kod değişmez.

- `kategoriler.yaml`: `uygulama` (`yol: uygulamalar`, `sira: 14`, `menuSira: 10`).
- `tokens.css`: `--c-uygulama: light-dark(#5E6A75, #A9B6C2)` (nötr gri; kurum renklerinden ayrışsın).
- Kayıtlar `src/content/aktorler/uygulama/<ad>.md`, `konum: Çevrim içi`. Gövdede Ankara'da hangi
  toplulukların kullandığı yazılır.

## Adımlar

1. Kategoriyi ve rengi ekle.
2. Ankara topluluklarının kullandığı platformları kaynaklarıyla ekle.
3. `npm run build`; `/uygulamalar/` ve menüyü kontrol et.

## Açık kararlar

- **Uygulamalar haritada görünsün mü?** Şu an `menuSira` olduğu için haritada da bir dilim olarak
  görünüyorlar ve kurum sayısına giriyorlar. Öneri: haritadan ve kurum sayısından çıkarmak için
  `kategoriler.yaml`'a `haritada: false` gibi bir alan açmak (`harita/kaynaklar.ts` bu alana bakar).
  Küçük bir kod değişikliği; kategoriye göre `if` yazılmadan veriyle çözülür.

## Kabul kriterleri

- [x] `/uygulamalar/` sayfası ve menüde "Uygulamalar"
- [x] Masqot ve Meetup dahil platformlar eklendi
- [x] Yeni kayıtlar için K01–K05 uyarısı yok
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

Uygulandı (2026-10-30). Eklenen 8 kayıt:

| Kimlik | Ne |
|---|---|
| `meetup` | Küresel topluluk ve buluşma platformu |
| `luma` | Etkinlik sayfası ve kayıt; Ankara'daki yapay zekâ meetup'larının çoğu burada |
| `kommunity` | Yerli topluluk ve etkinlik platformu (Türkiye Java Community, GDG Ankara) |
| `masqot` | Teknoloji ekosistemi için ağ kurma platformu (2025, Buse Mağden) |
| `youthall` | Kariyer platformu ve öğrenci kulübü dizini |
| `anbean-kampus` | Öğrenci kulübü profilleri ve etkinlikleri |
| `gdg-community-dev` | GDG ve GDG on Campus topluluklarının platformu |
| `techcareer` | Hackathon ve bootcamp duyuruları |

- "Masqot" ilk aramada çıkmadı; doğru alan adı `masqot.co`.
- Uygulamaların `alanlar`'ı `bilisim` ya da `egitim`; uygun bir "platform" alanı yok, gerekirse açılır.
