# Kurumlara faaliyet alanı filtresi

**Durum:** Başlanmadı. 5. bölümdeki alan listesi ve 6. bölümdeki kararlar onay bekliyor.
**Bağımlılık:** Yok.

---

## 1. Ne yapılacak, neden?

### Şu anki durum

Takvim, Yatırımlar, İş Birlikleri ve Akademisyenler sayfalarında, arama kutusunun yanında tıklanabilir
filtre çipleri var: takvimde tür (Destek / Etkinlik), akademisyenlerde üniversite gibi.

Kurum sayfalarında (`/girisimler/`, `/teknoparklar/`…) ise yok. 39 girişim tek liste halinde duruyor;
"enerji depolama girişimlerini göster" demenin yolu yok. Yalnızca arama kutusu var, o da yazılan
kelimeye bağlı ("batarya" yazan "LFP"yi bulamaz).

### Neden mevcut etiketler işe yaramıyor?

Her kurumun `etiketler` alanı var ama bunlar serbest metin:

- 105 kurumda **197 farklı etiket** var, bunların **170'i yalnızca bir kez** kullanılmış.
- Aynı konu farklı yazılmış: "güneş enerjisi", "güneş paneli", "güneş EPC", "fotovoltaik", "kampüs GES".
- Bu etiketlerden çip yapılsa 197 çip olur, çoğu tek kurumu gösterir.

Etiketler kurumun ayrıntısını anlatmak için iyi, ama filtre için kontrollü (önceden belirlenmiş, sınırlı)
bir liste gerekiyor.

### Kavramlar: kategori, alan, etiket

Karışmaması için üç ayrı kavram:

| Kavram | Soru | Örnek | Durum |
|---|---|---|---|
| **Kategori** | Bu ne tür bir kurum? | Girişim, Teknopark, TEKMER | Var (`kategori:`), her kurumun tek kategorisi |
| **Alan** | Hangi konuda çalışıyor? | Yenilenebilir enerji, Atık ve döngüsel ekonomi, Savunma | **Yeni**; kontrollü liste, kurum başına 1–3 |
| **Etiket** | Ayrıntıda neler var? | "LFP batarya", "dalga enerjisi" | Var (`etiketler:`), serbest metin; değişmez |

### Yapılınca

```
/girisimler/
┌────────────────────────────────────────────────────────────────────┐
│ Girişimler                                                         │
│ [Ara: ad, konu, konum…]                                            │
│ (Tümü 39) (Yenilenebilir enerji 7) (Enerji depolama 6)             │
│ (Atık ve döngüsel ekonomi 5) (Tarım ve gıda 6) …                   │
└────────────────────────────────────────────────────────────────────┘

/kurumlar/   (iki çip grubu; birlikte çalışır)
  Kategori: (Tümü) (Girişimler) (Teknoparklar) (TEKMER'ler) …
  Alan:     (Tümü) (Yenilenebilir enerji) (Hidrojen) (Savunma ve havacılık) …
  → "TEKMER'ler" + "Yenilenebilir enerji" = enerji odaklı TEKMER'ler
```

- Her kategori sayfasında, o kategoride kullanılan alanların çipleri görünür (sayılarıyla).
- `/kurumlar/` sayfasında mevcut kategori çiplerinin altına alan çipleri eklenir; iki grup birlikte
  süzer.
- Kurum satırında ve kurum sayfasında kurumun alanları küçük bağlantılar olarak görünür;
  tıklayınca o alana süzülmüş Kurumlar sayfası açılır (`/kurumlar/?alan=hidrojen`).
- Seçim adres çubuğunda tutulur, paylaşılabilir (diğer sayfalarda olduğu gibi).

---

## 2. İçerik dosyalarında ne değişecek?

**Yeni sözlük dosyası** `src/content/alanlar.yaml` (kategoriler.yaml gibi):

```yaml
# Kurumların faaliyet alanları. Anahtar, kurum dosyalarındaki `alanlar:` listesinde kullanılır.
# `sira`: çiplerin sırası.

yenilenebilir-enerji:
  ad: Yenilenebilir enerji
  aciklama: Güneş, rüzgâr, biyogaz ve diğer temiz enerji üretimi
  sira: 1
enerji-depolama:
  ad: Enerji depolama
  aciklama: Batarya, batarya yönetimi ve depolama sistemleri
  sira: 2
# …
```

**Her kurum dosyasına bir satır** (`src/content/aktorler/**/*.md` frontmatter):

```yaml
ad: Werer Energy
kategori: girisim
alanlar: [enerji-depolama, e-mobilite]   # yeni
etiketler: [LFP batarya, enerji depolama, EV şarj]   # aynen kalır
```

Yanlış yazılan alan (`enerji-depolma`) build'i durdurur ve geçerli değerleri listeler; kategorilerdeki
gibi.

Yeni bir alan eklemek: `alanlar.yaml`'a bir giriş. Kod değişmez, çip kendiliğinden çıkar.

---

## 3. Teknik tasarım

Mevcut parçalar yeniden kullanılır, yeni bileşen neredeyse yok:

- Doğrulama: `content.config.ts`'teki `idIn()` (kategoriler, üniversiteler için kullanılan) aynen.
- Çipler: `FiltreCipleri.astro` aynen (yalnızca isteğe bağlı görünür bir başlık eklenir).
- Süzme: `scripts/list-filter.ts`. **Asıl değişiklik burada**, iki eksiği var:
  1. Bir sayfada yalnızca **bir** çip grubu destekliyor. `/kurumlar/` iki grup isteyecek (kategori + alan).
  2. Bir öğenin çip değeri **tek** (`data-facet="odtu"`). Kurumların ise birden çok alanı olabilecek.

### Süzme sözleşmesinin yeni hali

```html
<!-- Çip grubu: parametre adı hem adres çubuğunda hem öğedeki nitelikte kullanılır -->
<div data-filter-facet="alan">…çipler…</div>
<div data-filter-facet="kategori">…çipler…</div>

<!-- Öğe: her grup için bir nitelik; birden çok değer boşlukla ayrılır -->
<li data-filter-item
    data-facet-kategori="girisim"
    data-facet-alan="enerji-depolama e-mobilite"
    data-search="…">
```

Kural: öğe, **seçimi olan her grupta** eşleşiyorsa görünür (gruplar arası VE). Bir grupta eşleşmek,
öğenin değer listesinde seçili değerin bulunması demektir.

Bu değişiklikle mevcut sayfaların işaretlemesi de yeni biçime geçer (`data-facet="x"` →
`data-facet-<param>="x"`). Bu sayfalar: akademisyenler (`universite`), takvim (`tur`), yatırımlar (`tur`),
iş birlikleri (`tur`), kurumlar (`kategori`). Hepsinin tek değeri olduğu için davranışları değişmez.

Harita (`scripts/harita.ts`) bu script'i kullanmıyor; etkilenmez.

---

## 4. Uygulama adımları

Her adımdan sonra `npm run build` 0 hata ile geçmeli.

### Adım 1: Alan sözlüğü

- `src/content/alanlar.yaml` (5. bölümdeki onaylı listeyle).
- `src/content.config.ts`:
  - `SOZLUKLER` nesnesine `alanlar: "src/content/alanlar.yaml"`.
  - Yeni koleksiyon `alanlar` (`ad`, `aciklama` isteğe bağlı, `sira`), `collections` listesine ekle.
  - `aktorler` şemasına `alanlar: z.array(idIn("alanlar")).default([])`.
    Veriler doldurulduktan sonra (Adım 7) `.min(1)` yapılması önerilir; böylece alanı unutulan kurum
    build'de yakalanır.

### Adım 2: Veri katmanı (`src/lib/content.ts`)

- `getAlanlar()` (sıraya göre), tip `Alan`.
- `aktorAramaMetni()` kurumun alan adlarını da içersin; "hidrojen" araması alanı Hidrojen olan
  kurumları bulsun. Bunun için fonksiyon alan sözlüğünü almalı (ör. `aktorAramaMetni(aktor, alanlarById)`)
  ya da çağıran yer adları hazırlayıp vermeli.
- Yardımcı: bir kurum listesindeki alanları sayan `alanSayilari(aktorler)` → `{ alan, sayi }[]`
  (sayısı 0 olanlar hariç, sıraya göre). Hem kategori sayfası hem kurumlar sayfası kullanır.

### Adım 3: Süzme script'i (`src/scripts/list-filter.ts`)

- `facet` tek eleman yerine tüm `[data-filter-facet]` grupları alınır; her grup için ayrı seçim
  (`Map<param, deger>`).
- Eşleşme: `item.getAttribute("data-facet-" + param)?.split(" ").includes(secili)`.
- Çip tıklaması yalnızca kendi grubundaki çiplerin `aria-pressed` durumunu değiştirir.
- Adres çubuğu: her grup kendi parametresiyle (`?kategori=…&alan=…`); açılışta her grup kendi
  parametresini okur.
- Dosyanın başındaki sözleşme açıklaması yeni biçime göre güncellenir.

### Adım 4: Mevcut sayfaların işaretlemesi

`data-facet=` kullanan yerler `data-facet-<param>=` olur:

| Dosya | Eski | Yeni |
|---|---|---|
| `components/satirlar/AkademisyenSatiri.astro` | `data-facet={universite.id}` | `data-facet-universite=…` |
| `components/satirlar/TakvimSatiri.astro` | `data-facet={kategori.id}` | `data-facet-tur=…` |
| `components/satirlar/YatirimSatiri.astro` | `data-facet={tur.id}` | `data-facet-tur=…` |
| `components/satirlar/IsbirligiKarti.astro` | `data-facet={tur.id}` | `data-facet-tur=…` |
| `components/satirlar/AktorSatiri.astro` | `data-facet={kategori.id}` | `data-facet-kategori=…` **ve** `data-facet-alan={d.alanlar.join(" ")}` |

Bu adımdan sonra mevcut sayfaların hepsi eskisi gibi çalışmalı (kontrol: 7. bölüm).

### Adım 5: Çip grupları

- `FiltreCipleri.astro`: isteğe bağlı `baslik` prop'u ("Kategori", "Alan"). Bir sayfada tek grup
  varken başlık gerekmez; `/kurumlar/`'da iki grup olduğu için gerekir.
- `src/pages/[kategori]/index.astro`: arama kutusunun altına alan çipleri (`parametre="alan"`), o
  kategorideki kurumların alanlarıyla (`alanSayilari`). Kategoride 2'den az farklı alan varsa grup hiç
  gösterilmez (tek çiplik filtre anlamsız).
- `src/pages/kurumlar.astro`: mevcut kategori çiplerinin altına ikinci grup olarak alan çipleri.

### Adım 6: Alanları göstermek

- `components/satirlar/AktorSatiri.astro`: etiketlerin üstüne ya da yanına alan adları, her biri
  `/kurumlar/?alan=<id>` bağlantısı. Görsel olarak etiketlerden ayrışmalı (etiket gri kutu; alan
  örneğin ince çerçeveli ve vurgu rengi), çünkü biri filtre, diğeri bilgi.
- `components/detay/AktorDetay.astro`: aynı bağlantılar `kv` listesinde "Alan" satırı olarak.
- Kurum sayfası için bir bileşen yazılırsa (`AlanBaglantilari.astro`) iki yerde aynı kullanılır.

### Adım 7: Verileri doldurmak

1. 105 kurum için alan **önerisi** üretilir. Kaynak: kurumun `etiketler`, `uzmanlik`, gövde metni.
   Anahtar kelime eşlemesiyle yapan tek seferlik bir script yazılabilir (ör. "batarya", "LFP",
   "depolama" → `enerji-depolama`). Script iş bitince silinir.
2. Öneri, kurum adı · kategori · önerilen alanlar sütunlarıyla bir tablo olarak çıkarılır ve
   **onaylanır**. Otomatik öneri hatalı olabilir; özellikle teknopark ve TEKMER gibi geniş kurumlar
   elle bakılmalı (6. bölüm, 3. karar).
3. Onaylanan tablo dosyalara işlenir; şemada `.min(1)` açılır. **Kurumun en belirgin alanı listenin
   başına yazılır:** `03-haritada-kategori-gorunumu.md` ilk alanı "birincil alan" sayar ve kurumun
   haritadaki yerini ona göre belirler.

### Adım 8: Belgeler

- Kök `README.md`: "İçerik ekleme" tablosuna "Yeni alan → `alanlar.yaml`" satırı; kurum dosyası
  örneğine `alanlar:`.
- Bu dosya silinir, `yapilacaklar/README.md` tablosundan çıkarılır.

---

## 5. Önerilen alan listesi (onay bekliyor)

Mevcut etiketlerin ve açıklamaların gruplanmasıyla hazırlandı. 12 alan; çoğu kurum 1–2 alana girer.

| Kimlik | Ad | Kapsadığı (mevcut etiketlerden) | Örnek kurumlar |
|---|---|---|---|
| `yenilenebilir-enerji` | Yenilenebilir enerji | güneş enerjisi, güneş paneli, GES, fotovoltaik, rüzgâr, biyogaz | Kalyon PV, Arya Solar, ODTÜ-GÜNAM, Momentum (Karayel) |
| `enerji-depolama` | Enerji depolama | batarya, LFP, enerji depolama, BMS, alüminyum-hava pil | Pomega, Werer Energy, VULCAN, MEATEC |
| `hidrojen` | Hidrojen | yeşil hidrojen, yakıt hücresi, hidrojen depolama | iNOVAT, TENMAK, TOBB ETÜ Enerji Lab. |
| `enerji-verimliligi` | Enerji verimliliği ve akıllı şebeke | enerji verimliliği, akıllı şebeke, akıllı bina, enerji yönetimi | Inavitas, SESASİS, Sensgreen, YEO Teknoloji |
| `e-mobilite` | Elektrikli ulaşım | EV şarj, e-bisiklet, mikromobilite | TRIPY, Ever Şarj, Başkent EDAŞ · Eşarj |
| `atik-dongusel` | Atık ve döngüsel ekonomi | atık yönetimi, döngüsel ekonomi, geri dönüşüm, kompozit | Evreka, Galiboff, DEFTR, M-Based |
| `karbon-iklim` | Karbon ve iklim | karbon yönetimi, ESG, sera gazı, CO₂ yakalama, iklim bilimi | CarbonIT, Some Carbon, ONO Yazılım, ODTÜ İKLİM |
| `tarim-gida` | Tarım ve gıda | akıllı tarım, dikey tarım, biyogübre, gıda güvenliği | FarmLabs, MicroFert, Agriverts, ChemCode |
| `su-cevre` | Su, hava ve çevre | su teknolojisi, iç hava kalitesi, çevre sensörleri, deniz | Plankton, DOA Smart, VSIAS, Loopyon |
| `biyoteknoloji-malzeme` | Biyoteknoloji ve malzeme | biyoteknoloji, alg, biyobozunur, malzeme | Kybele's Garden, As Biyoteknoloji, CFL |
| `savunma-havacilik` | Savunma ve havacılık | savunma, havacılık, uzay, dual-use | Teknopark Ankara, Spacelis, ASELSAN |
| `genel` | Sektörden bağımsız | kuluçka, hızlandırıcı, yatırımcı buluşması | Ankara TEKMER, GarajX, Founder Institute |

Not: Yazılım ve yapay zekâ ayrı alan olarak önerilmedi; neredeyse her girişimin aracı olduğu için
filtre olarak ayırt edici değil. Etiketlerde kalmaya devam eder ve aramayla bulunur.

---

## 6. Uygulamadan önce verilmesi gereken kararlar

1. **Alan listesi.** Yukarıdaki 12 alan uygun mu; birleştirilecek, bölünecek, eklenecek var mı?
   (Örneğin "Yenilenebilir enerji" güneş ve rüzgâr diye ikiye bölünebilir; şu an rüzgârda 2 kurum var.)
2. **Kurum başına en fazla kaç alan?** Öneri: 3. Fazlası filtreyi anlamsızlaştırır (her kurum her
   yerde çıkar).
3. **Teknopark ve TEKMER'ler.** Bunlar birçok alanda firma barındırıyor. İki seçenek:
   (a) kurumun **kendi odağı**: NetZero TEKMER → `karbon-iklim`, `yenilenebilir-enerji`; odağı
   olmayanlar → `genel`.
   (b) **barındırdığı firmaların alanları**: ODTÜ Teknokent → birçok alan.
   **Öneri: (a).** (b) her teknoparkı her filtrede gösterir.
4. **Haritaya da alan filtresi?** Haritadaki çipler şu an kategori. İkinci bir çip grubu eklenebilir,
   ama haritanın üstü kalabalıklaşır. **Öneri: şimdilik hayır**; Kurumlar sayfası bu ihtiyacı karşılıyor. (Haritada kategori seçilince
   alanlara göre gruplama ayrı iş olarak planlandı: `03-haritada-kategori-gorunumu.md`.)
5. **Etiketler ne olacak?** **Öneri: aynen kalsın** (ayrıntı ve arama için). İleride tek kullanımlık
   ve çakışan etiketler ayrı bir temizlikle sadeleştirilebilir; bu işin kapsamında değil.

---

## 7. Bitti sayılması için kontrol listesi

- [ ] `npm run build` 0 hata, 0 uyarı.
- [ ] Bir kurum dosyasına geçici olarak `alanlar: [yok-boyle-alan]` yazınca build, geçerli alanları
      listeleyerek duruyor; geçici değişiklik geri alındı.
- [ ] Alanı boş kurum kalmadı (şemada `.min(1)` açık).
- [ ] `/girisimler/`'de alan çipleri var; birine tıklayınca liste süzülüyor, adres `?alan=…` oluyor;
      sayfa o adresle açılınca aynı seçim geliyor.
- [ ] `/kurumlar/`'da iki grup birlikte çalışıyor: "TEKMER'ler" + bir alan → yalnızca ikisine de uyanlar.
- [ ] **Mevcut filtreler bozulmadı:** akademisyenler (üniversite), takvim, yatırımlar, iş birlikleri
      çipleri eskisi gibi çalışıyor.
- [ ] Arama, alan adıyla da buluyor ("hidrojen" → alanı Hidrojen olan kurumlar).
- [ ] Kurum satırında ve sayfasında alan bağlantıları `/kurumlar/?alan=…` sayfasını doğru süzülmüş açıyor.
- [ ] Ekran görüntüsüyle kontrol: açık/koyu tema, dar ekran (çipler taşmıyor, alt satıra iniyor).
- [ ] Kırık bağlantı taraması 0.
- [ ] Kök `README.md` güncellendi; bu dosya silindi, `yapilacaklar/README.md` tablosundan çıkarıldı.

---

## 8. Kapsam dışı

- Etiketlerin temizlenmesi/birleştirilmesi.
- Akademisyenlere alan eklemek (aynı sözlük ileride akademisyenler için de kullanılabilir; şema hazır
  olur, ama bu işin parçası değil).
- Haritada alan filtresi (6. bölüm, 4. karar "evet" olursa ayrı iş olarak eklenir).
