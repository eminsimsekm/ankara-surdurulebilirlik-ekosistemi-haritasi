# Haritada kategori görünümü: seçilen tür, alanlara göre gruplanır

**Durum:** Başlanmadı. 6. bölümdeki kararlar onay bekliyor.
**Bağımlılık:** `02-kurumlara-alan-filtresi.md` **bitmiş olmalı.** Bu iş, o işte kurumlara eklenen
`alanlar` alanını kullanır.

---

## 1. Ne yapılacak, neden?

### Şu anki durum

Ana sayfadaki haritada her kategori (Teknopark, TEKMER, Girişim…) dairenin bir dilimidir. Üstteki
çiplerden bir kategori seçildiğinde diğer kategorilerin noktaları **soluklaşır**, ama haritada yerinde
kalır. Seçilen kategori yine dairenin küçük bir diliminde sıkışık durur. Örneğin 14 TEKMER'e bakmak
isteyen kişi, haritanın yalnızca bir köşesine bakar.

Dilimin içinde de bir düzen yoktur. Noktalar dosya sırasıyla halkalara dizilir. Hangi TEKMER'in enerjiye,
hangisinin savunmaya odaklandığı haritadan okunamaz.

### Yapılınca

```
Tümü seçili (bugünkü gibi)              "TEKMER" seçili
        TEKNOPARK                          YENİLENEBİLİR
    ·  ·  ·  ·  ·  GİRİŞİM                   ·   ·
  ·   ·  ┌──────┐  ·  ·  ·          KARBON  ·  ·  ·      HİDROJEN
TEKMER · │ANKARA│ ·  ·  ·             ·  ·  ┌──────┐  ·  ·
  ·  ·   └──────┘  ·  ·                 ·    │TEKMER│    ·
    ·  ·  ·  ·  ·  KOBİ                 ·  · └──────┘  ·  ·
       AKADEMİSYEN                    GENEL  ·   ·   ·  SAVUNMA
```

- Bir kategori seçildiğinde haritada **yalnızca o kategorinin noktaları** kalır. Diğerleri soluklaşmaz,
  tamamen kaybolur.
- Kalan noktalar **dairenin tamamına** yayılır. Dilimler artık kategoriler değil, o kategorideki
  kurumların **alanlarıdır** (Yenilenebilir enerji, Hidrojen, Savunma…).
- Ortadaki yazı "ANKARA" yerine seçilen kategorinin adı olur.
- Noktalar eski yerlerinden yeni yerlerine **kayarak** geçer. Böylece kullanıcı aynı kurumları
  gördüğünü anlar.
- "Tümü" seçilince harita bugünkü haline döner.
- Arama kutusu ve nokta seçimi aynen çalışır. Arama, görünen noktalar içinde soluklaştırır.
- Seçim adres çubuğunda zaten tutuluyor (`/?kategori=tekmer`). Bu adres paylaşılınca harita doğrudan
  kategori görünümünde açılır.

---

## 2. İçerik dosyalarında ne değişecek?

İki küçük ek. Yeni veri dosyası yok.

**`src/content/alanlar.yaml`'a isteğe bağlı `kisaAd`.** Haritanın dilim etiketleri büyük harfle ve küçük
yazılır. "Enerji verimliliği ve akıllı şebeke" sığmaz. `kategoriler.yaml`'daki `kisaAd` gibi:

```yaml
enerji-verimliligi:
  ad: Enerji verimliliği ve akıllı şebeke
  kisaAd: Verimlilik      # yeni, isteğe bağlı; yoksa `ad` kullanılır
  sira: 4
```

**Kurum dosyalarında `alanlar` listesinin sırası anlam kazanır.** Bir kurumun birden çok alanı
olabilir, ama haritada tek noktası vardır. Nokta, listedeki **ilk alanın** (birincil alan)
diliminde durur (6. bölüm, 1. karar):

```yaml
alanlar: [enerji-depolama, e-mobilite]   # haritada "Enerji depolama" diliminde
```

02 numaralı işin 7. adımında veriler doldurulurken kurumun en belirgin alanı başa yazılmalı.

---

## 3. Teknik tasarım

### Temel fikir: her noktanın iki yeri var

Harita build sırasında çizilir ve tarayıcıda yeniden hesaplama yapılmaz. Her kayıt tek bir kategoriye
ait olduğu için her noktanın yalnızca **iki** olası yeri vardır:

1. **Genel görünümdeki yeri:** bugünkü `cx`/`cy`.
2. **Kendi kategorisinin görünümündeki yeri:** yeni, build sırasında hesaplanır.

İkinci yer, noktanın üzerinde fark olarak tutulur. Script yalnızca hangi görünümün açık olduğunu
değiştirir. Kaydırma animasyonu CSS ile yapılır:

```html
<g class="node" data-id="aktor:netzero-tekmer" data-kategori="tekmer"
   style="--c:var(--c-tekmer); --dx:-142.5; --dy:88.1">
  <circle class="nokta" cx="512.3" cy="201.7" r="7" />
</g>
```

```css
.node { transition: transform .4s ease, opacity .2s; }
.harita[data-gorunum="kategori"] .node {
  transform: translate(calc(var(--dx) * 1px), calc(var(--dy) * 1px));
}
.harita[data-gorunum="kategori"] .node:not(.gorunur) { opacity: 0; visibility: hidden; }
@media (prefers-reduced-motion: reduce) { .node { transition: none; } }
```

(SVG öğelerinde CSS `transform`'daki `px` değeri SVG birimi olarak işler. `visibility: hidden` olan nokta
klavyeyle de seçilemez.)

Dilim çizgileri ve etiketleri her görünüm için ayrı bir grupta çizilir. Yalnızca açık görünümün grubu
görünür:

```html
<g class="gorunum" data-gorunum-anahtari="">        … kategori dilimleri (bugünkü) …</g>
<g class="gorunum" data-gorunum-anahtari="tekmer" hidden>  … TEKMER'in alan dilimleri …</g>
<g class="gorunum" data-gorunum-anahtari="girisim" hidden> … Girişim'in alan dilimleri …</g>
```

Bu yaklaşımın iyi yanları:
- Her kayıt DOM'da **tek** noktadır. Seçim, detay paneli, klavye ve adres çubuğu mantığı değişmez.
- Ek HTML azdır: kategori başına bir avuç çizgi ve etiket.
- Tarayıcıda geometri hesabı yoktur. Hesap, bugünkü gibi build sırasında saf bir fonksiyonda yapılır.

### Gruplamayı harita değil, kaynak belirler (SOLID: O ve D)

Harita bileşeni "alan" kavramını bilmemeli. Bugün "aktör mü akademisyen mi" bilmediği gibi. Her düğüm,
kategori görünümünde hangi gruba gireceğini kendisi söyler. `HaritaDugumu`'na isteğe bağlı bir alan
eklenir:

```ts
// components/harita/kaynaklar.ts
export interface HaritaDugumu {
  // … mevcut alanlar …
  /** Kategori görünümünde girdiği dilim. Yoksa kategorinin tamamı tek dilimdir. */
  altGrup?: { id: string; etiket: string; sira: number };
}
```

| Kaynak | `altGrup` | Not |
|---|---|---|
| `aktorler` | birincil alan (`alanlar[0]`) → `{ id, etiket: kisaAd ?? ad, sira }` | Asıl istenen |
| `akademisyenler` | üniversite → `{ id, etiket: ad, sira }` | 6. bölüm, 3. karar |
| `yatirimlar` | yatırım türü → `{ id, etiket: ad, sira }` | 6. bölüm, 3. karar |
| `takvim` | yok | Kategori tek dilim olarak tüm daireye yayılır |

İleride başka bir gruplama gerekirse (ör. kurumları ilçeye göre) yalnızca ilgili kaynak değişir.
Harita, geometri ve script değişmez.

### Geometri (`src/lib/harita-yerlesim.ts`)

`haritaYerlesimi()` zaten "dilimler ve içlerindeki düğüm kimlikleri" alıp koordinat döndüren saf bir
fonksiyondur. Kategori görünümü de aynı şekilde çalışır, yalnızca dilimler kategori değil alt grup olur.
Bu yüzden:

- `DilimGirdisi.kategori` → `anahtar` olarak yeniden adlandırılır (dilim artık kategori olmak zorunda
  değil). `Yerlesim.dugumler[].kategori` de `anahtar` olur.
- Fonksiyon her görünüm için ayrı çağrılır: bir kez genel görünüm için, sonra her kategori için bir kez.
- Fonksiyonun mantığı değişmez. Tek dilimli girdi (tüm daire) için çizgi çizilmemeli. Bu tek ek kural.

### Tarayıcı (`src/scripts/harita.ts`)

Bugünkü `suz()` fonksiyonu kategori seçilince eşleşmeyenleri soluklaştırıyor (`dim`). Yeni davranış:

- `seciliKategori` boşsa: `root.dataset.gorunum = "genel"`, bütün noktalar `gorunur`, genel dilim grubu
  açık.
- Bir kategori seçiliyse: `root.dataset.gorunum = "kategori"`, yalnızca o kategorinin noktaları `gorunur`,
  o kategorinin dilim grubu açık, ortadaki yazı kategori adı (çipin `ad`'ından ya da bir `data-` değerinden).
- Arama, görünür noktalar içinde bugünkü gibi `dim` uygular.
- **Seçim etiketi:** `sec()` etiket konumunu dairenin `cx`/`cy`'sinden hesaplıyor. Kategori görünümünde
  `--dx`/`--dy` eklenmeli. Görünüm değişince açık seçimin etiketi yeniden konumlanmalı.
- **Seçili nokta görünümden çıkarsa:** Panel olduğu gibi kalır, yalnızca haritadaki etiket gizlenir
  (6. bölüm, 4. karar).

---

## 4. Uygulama adımları

Her adımdan sonra `npm run build` 0 hata ile geçmeli.

### Adım 1: Alan kısa adları

- `content.config.ts`: `alanlar` şemasına `kisaAd: z.string().optional()`.
- `alanlar.yaml`: uzun adlı alanlara `kisaAd` (5. bölümdeki tablo).

### Adım 2: Geometri

- `harita-yerlesim.ts`: `kategori` → `anahtar` yeniden adlandırması. Tek dilimde çizgi üretmeme.
- `Harita.astro`'daki mevcut çağrı yeni adlara uyarlanır. **Bu adımdan sonra harita piksel piksel
  aynı görünmeli** (davranış değişikliği yok, yalnızca adlandırma).

### Adım 3: Kaynaklar

- `HaritaDugumu`'na `altGrup?`.
- `aktorler` kaynağı `getAlanlar()` sözlüğünden birincil alanı doldurur. 3. kararda "evet" denirse
  `akademisyenler` ve `yatirimlar` kaynakları da doldurur.

### Adım 4: Çizim (`Harita.astro`)

- Her kategori için: düğümleri `altGrup`'a göre grupla (sıra: `altGrup.sira`; `altGrup`'u olmayanlar
  tek grup) ve `haritaYerlesimi()` çağır.
- Her düğüme `--dx`/`--dy` (kategori görünümündeki yer − genel görünümdeki yer).
- Genel dilimler `data-gorunum-anahtari=""` grubunda. Her kategorinin dilimleri kendi grubunda, `hidden`.
  Dilim etiketlerinin rengi kategorinin rengi.
- Ortadaki yazı için kategori adları (`kisaAd`) `data-` değeri olarak.
- 3. bölümdeki CSS.

### Adım 5: Script (`harita.ts`)

- 3. bölümdeki "Tarayıcı" maddeleri.
- Dosyanın başındaki açıklama güncellenir ("Listelerden farkı: eşleşmeyen düğümler soluklaştırılır"
  cümlesi artık yalnızca arama için doğru).

### Adım 6: Belgeler

- Kök `README.md`: `alanlar.yaml` satırına "haritadaki dilim etiketi için `kisaAd`".
  `harita/kaynaklar.ts` açıklamasına "`altGrup`: kategori görünümündeki dilim".
- `GELISTIRME.md` 4. bölüm, O maddesindeki tabloya "Haritada kategori görünümünün gruplaması →
  ilgili kaynağın `altGrup`'u" satırı.
- Bu dosya silinir ve `yapilacaklar/README.md` tablosundan çıkarılır.

---

## 5. Sınır durumları ve öneriler

| Durum | Ne olur | Öneri |
|---|---|---|
| Kategoride tek alan var (ör. hepsi `genel`) | Tek dilim, tüm daire | Sorun değil. Çizgi yok, etiket üstte. |
| Bir alanda tek kurum | Dilim en az 3 kayıtlık yer kaplar (mevcut kural) | Sorun değil |
| Uzun alan adı | Etiket dairenin dışına taşar | `kisaAd`: Verimlilik, Döngüsel, Karbon, Tarım-gıda, Su-çevre, Biyo-malzeme, Savunma |
| Girişim (39 kayıt, ~10 alan) | Dilimler dar ama halkalar yetiyor | Build hatası verirse (`sığmadı`) halka eklenir |
| Akademisyen (84 kayıt, 10 üniversite) | En kalabalık görünüm | Build sırasında sığdığı denetlenir |
| Mobil | Aynı SVG küçülür | Etiket yazı boyutu kontrol edilir |

---

## 6. Uygulamadan önce verilmesi gereken kararlar

1. **Birden çok alanı olan kurum nerede durur?**
   (a) Yalnızca **ilk (birincil) alanının** diliminde, tek nokta.
   (b) Her alanında ayrı bir nokta.
   **Öneri: (a).** (b) aynı kurumu haritada iki-üç kez gösterir, sayılar şişer, seçim karışır.

2. **Görünmeyen kategoriler:** tamamen gizlensin mi, yoksa bugünkü gibi soluk mu kalsın?
   **Öneri: gizlensin.** İstenen buydu, ve noktalar daireye yayıldığında soluk noktalarla üst üste biner.

3. **Kurum olmayan kategoriler nasıl gruplansın?**
   Akademisyen → üniversite, Yatırım → yatırım türü, Etkinlik/Destek → gruplama yok (tek dilim).
   **Öneri: evet.** Kod aynı (`altGrup`), her kaynak için birkaç satır. İstenmezse bu kategoriler
   gruplanmadan tüm daireye yayılır.

4. **Seçili nokta görünümden çıkınca** (ör. bir girişim seçiliyken "TEKMER"e geçildi): Panel olduğu gibi
   kalsın mı, yoksa yeni kategorinin ilk (ya da `oneCikan`) kaydı mı seçilsin?
   **Öneri: panel kalsın,** haritadaki etiket gizlensin. Kullanıcının okuduğu şey kaybolmasın.

5. **Kategori görünümünde alan çipleri de çıksın mı?** (Ör. TEKMER seçiliyken altta
   "Yenilenebilir · Hidrojen · …" çipleri, biri seçilince o dilim vurgulansın.)
   **Öneri: şimdilik hayır.** Dilim etiketleri bu bilgiyi zaten veriyor. Gerekirse ayrı iş olur.

---

## 7. Bitti sayılması için kontrol listesi

- [ ] `npm run build` 0 hata, 0 uyarı.
- [ ] Adım 2'den sonra genel görünüm öncekiyle aynı (ekran görüntüsü karşılaştırması).
- [ ] Her kategori çipi için: yalnızca o kategorinin noktaları görünüyor, alan dilimleri ve etiketleri
      doğru, ortada kategori adı yazıyor.
- [ ] Noktalar kayarak yer değiştiriyor. "Hareketi azalt" ayarı açıkken animasyon yok.
- [ ] "Tümü"ye dönünce harita eski haline geliyor.
- [ ] `/?kategori=tekmer` adresi doğrudan kategori görünümünde açılıyor. `&secim=…` ile seçili kayıt ve
      etiketi doğru yerde.
- [ ] Arama, kategori görünümünde görünen noktaları soluklaştırıyor. Gizli noktalar aramayla geri
      gelmiyor.
- [ ] Gizli noktalara Tab ile ulaşılamıyor. Görünen noktalar Enter/boşlukla seçilebiliyor.
- [ ] Bir kurumu `alanlar` sırasını değiştirerek başka dilime taşıyınca harita doğru güncelleniyor.
- [ ] Ekran görüntüsüyle kontrol: açık/koyu tema, dar ekran (etiketler taşmıyor).
- [ ] Belgeler güncellendi. Bu dosya silindi ve `yapilacaklar/README.md` tablosundan çıkarıldı.

---

## 8. Kapsam dışı

- Kategori görünümünde alan çipleri ve dilim vurgulama (6. bölüm, 5. karar).
- Birden çok kategoriyi aynı anda seçmek. Çipler bugünkü gibi tek seçimli kalır.
- Haritayı yakınlaştırma/kaydırma (zoom/pan).
- Genel görünümde dilimlerin içini alanlara göre sıralamak. Mümkün ve ucuz (aynı `altGrup` ile
  dilim içi sıralama), ama istenmedi. Ayrı iş olarak eklenebilir.
