# TASK-03: Sürdürülebilirlik, enerji ve iklim toplulukları

**WP:** [WP-02](../WP.md)
**Durum:** `review`
**Bağımlı:** TASK-01
**Tahmini efor:** ~0.5g

## Ne yapılacak, neden?

Haritanın konusu sürdürülebilirlik, ama TASK-02'deki toplulukların hiçbirinde yeşil odak yok. Ankara'daki
iklim, enerji, sıfır atık ve sürdürülebilirlik toplulukları araştırılıp aynı kategoriye eklenir.

## Teknik tarif

TASK-02'deki kayıt biçimi aynen kullanılır. Faaliyet alanı `alanlar.yaml`'dan seçilir
(ör. `karbon-iklim`, `yenilenebilir-enerji`, `atik-dongusel`). Kategoride birden fazla alan olunca
`/topluluklar/` sayfasında alan filtresi kendiliğinden çıkar.

Araştırma için başlangıç noktaları:
- Üniversite toplulukları: ODTÜ, Bilkent, Hacettepe, Gazi, Ankara Üniversitesi, TOBB ETÜ'deki enerji,
  iklim ve çevre toplulukları
- ODTÜ İklim'in "İklim Elçileri" yapısı (topluluk mu, merkezin parçası mı? `odtu-iklim` kaydı zaten var)
- Ankara Kent Konseyi Çevre ve İklim Meclisi, Çevre ve Sıfır Atık Çalışma Grubu
- Gönüllü iklim ağları (Climate Reality Türkiye, Fridays for Future Ankara vb.): Ankara'da faaliyeti var mı?
- COP31 sürecinde Ankara'da kurulan sivil toplum ağları

## Adımlar

1. Adayları araştır ve kaynaklarını doğrula (WP'deki kayıt alma ölçütü).
2. Kurumun parçası olan yapılar (ör. bir merkezin öğrenci elçileri) ayrı kayıt yerine o kurumun
   kaydına not olarak yazılır.
3. Kayıtları ekle, `npm run build`.

## Açık kararlar

- **Kent konseyi meclisleri topluluk mu, kamu mu?** Öneri: kamu. Belediyeye bağlı resmi yapılar
  `kamu` kategorisine girer, gönüllü ve bağımsız olanlar `topluluk`'a.

## Kabul kriterleri

- [x] En az 4 sürdürülebilirlik/iklim topluluğu eklendi ya da bulunamayanlar notlarda
- [x] Her kayıtta `kaynak` var ve açılıyor
- [x] Yeni kayıtlar için K01–K05 uyarısı yok
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

Uygulandı (2026-10-30). Eklenen 8 kayıt:

| Kimlik | Odak | Kaynak |
|---|---|---|
| `hacettepe-enerji-toplulugu` | Enerji (2012, ~2000 üye, Ankara Enerji Zirvesi) | youthall.com |
| `aybu-yenilenebilir-enerji-ve-iklim-kulubu` | Yenilenebilir enerji ve iklim (2020) | aybu.edu.tr |
| `odtu-cemut` | Çevre; Çevrenin Geleceği Zirvesi (20 Nisan 2026) | LinkedIn |
| `odtu-robot-toplulugu` | Temiz Enerji Kulübü (hidrojen, güneş, elektrikli araç) | youthall.com |
| `ieee-odtu` | Güç ve enerji (PES kongresi, PES kampı) | anbeankampus.co |
| `bilkent-environment-and-sustainability-society` | Çevre ve sürdürülebilirlik | Bilkent kulüp listesi |
| `wwf-bilkent` | Doğa koruma | Bilkent kulüp listesi |
| `bilkent-electric-car-society` | Elektrikli ulaşım | Bilkent kulüp listesi |

- **Alınmayanlar:**
  - Fridays for Future Ankara: kaynaklar 2019-2020'den; hâlâ etkin olduğu doğrulanmadı.
  - Ankara Kent Konseyi Çevre ve İklim Meclisi, Bisiklet Meclisi: açık karardaki öneri gereği kamu yapısı sayıldı, eklenmedi.
  - Ankara Bisiklet ve Doğa Sporları Derneği: spor derneği (WP kapsam dışı).
  - AYBÜ Vizyon Enerji Kulübü: bölüm sayfasında yalnızca tek kulüp listeleniyor, doğrulanamadı.
  - ODTÜ Verimlilik Topluluğu: yalnızca dizin kaydı var.
- ODTÜ İklim'in "İklim Elçileri" yapısı merkezin parçası; ayrı kayıt açılmadı (`odtu-iklim` kaydına not olarak eklenebilir).
- Bilkent'in üç kulübü için kaynak yalnızca resmi kulüp listesi (açıklama yok). Faaliyetleri doğrulanınca açıklamalar zenginleştirilmeli.
- Climate Reality Türkiye ve "İklim için Gençlik" için Ankara'da faaliyet bulunamadı.
