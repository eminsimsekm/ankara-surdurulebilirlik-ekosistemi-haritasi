# Kayıtları kurumlara bağlamak

**Durum:** Başlanmadı. 5. bölümdeki eşleştirme tablosu ve 6. bölümdeki kararlar onay bekliyor.

---

## 1. Ne yapılacak, neden?

### Şu anki durum

Sitede iki tür kayıt var:

- **Kurumlar** (girişimler, teknoparklar, TEKMER'ler…): her birinin kendi sayfası var, ör. `/girisimler/evreka/`.
- **Kurumların başına gelenler ya da aralarında olanlar**: yatırımlar, iş birlikleri, etkinlik ve destek
  çağrıları, akademisyenler. Bunların kendi sayfası yok; her biri kendi listesinde bir satır.

Sorun şu: bu iki tür birbirini tanımıyor.

- Evreka'nın sayfasını açan kişi, Evreka'nın üç yatırım turu aldığını göremiyor. Bunun için Yatırımlar
  sayfasına gidip Evreka'yı araması gerekiyor.
- İş Birlikleri sayfasındaki "ODTÜ Teknokent ⟷ NetZero TEKMER" kartında iki ad da düz yazı;
  tıklanıp kurum sayfasına gidilemiyor.
- ODTÜ-GÜNAM'ın sayfasında, GÜNAM'da çalışan 7 akademisyenden hiç söz edilmiyor.

### Yapılınca

Her yatırım, iş birliği, takvim kaydı ve akademisyen, **ilgili olduğu kurumları kimlikleriyle** söyleyecek.
Site de bunu iki yönde kullanacak:

```
/girisimler/evreka/                         /isbirlikleri/
┌──────────────────────────────┐            ┌──────────────────────────────────┐
│ EVREKA                       │            │ AR-GE & ARAŞTIRMA · 2022         │
│ Dijital atık yönetimi…       │            │ [ODTÜ Teknokent] ⟷ [NetZero TEKMER] │
│                              │            │   ↑ artık ikisi de bağlantı      │
│ ── Yatırımlar (3) ────────── │            └──────────────────────────────────┘
│ 2024-05  Kurumsal yatırım    │
│ 2022-01  Büyüme turu  $2,2mn │            /arastirma-merkezleri/odtu-gunam/
│ 2017-03  İlk tur      $740bin│            ┌──────────────────────────────┐
└──────────────────────────────┘            │ ── Araştırmacılar (7) ────── │
                                            │ Prof. Dr. Raşit Turan …      │
                                            └──────────────────────────────┘
```

Kurum sayfaları böylece o kurumla ilgili her şeyin toplandığı yer olur. Yatırım, iş birliği gibi
kayıtlara ayrı sayfa açılmaz (içerikleri bir satırdan ibaret olduğu için sayfaları boş kalırdı).

### Kurum kimliği nedir?

Her kurumun dosya adı onun kimliğidir:

```
src/content/aktorler/girisim/evreka.md              → kimlik: evreka
src/content/aktorler/tekmer/netzero-tekmer.md       → kimlik: netzero-tekmer
src/content/aktorler/arastirma/odtu-gunam.md        → kimlik: odtu-gunam
```

Bağlamak demek, bir yatırımın dosyasına "bu yatırım `evreka` ile ilgili" diye yazmaktır. Kimlik yanlış
yazılırsa (`evreeka`) site derlenmez ve hatanın hangi dosyada olduğu söylenir; yani yanlış bağlantı
sessizce yayına çıkamaz.

---

## 2. İçerik dosyalarında ne değişecek?

Kod değişikliği bittikten sonra içerik ekleyen kişinin göreceği fark bu kadar:

### Yatırım (`src/content/yatirimlar/*.yaml`)

```yaml
# Önce
ad: Evreka · büyüme turu
tur: girisim
tarih: 2022-01
tutar: $2,2 mn
yatirimci: Logo Ventures, TechOne, Teknoloji Yatırım TTGV1 Fonu, Fark Labs
aciklama: …

# Sonra: tek satır eklenir
aktorler: [evreka]
```

### Takvim (`src/content/takvim/*.yaml`)

```yaml
ad: True Zero Global Prize Demo Day
…
aktorler: [netzero-tekmer, sparklabs-group]
```

### Akademisyen (`src/content/akademisyenler/**/*.md`, frontmatter)

```yaml
ad: Raşit Turan
unvan: Prof. Dr.
universite: odtu
birim: Fizik · ODTÜ-GÜNAM kurucusu, SiPV koordinatörü
aktorler: [odtu-gunam]
```

### İş birliği (`src/content/isbirlikleri/*.yaml`)

Burada alan değişiyor, çünkü tarafların bir kısmı haritada kurum, bir kısmı değil (Dünya Bankası,
Macaristan…). Her taraf ya bir kurum kimliği ya da düz bir ad olur:

```yaml
# Önce
taraflar:
  - ODTÜ Teknokent
  - NetZero TEKMER

# Sonra
taraflar:
  - aktor: odtu-teknokent
  - aktor: netzero-tekmer
```

```yaml
# Kurum olmayan taraf düz ad olarak kalır
taraflar:
  - aktor: inovat
  - ad: Macaristan
```

Kurum kimliği verilen tarafın ekranda görünen adı kurum dosyasından gelir. Kurumun adı değişirse iş
birliği kartı da kendiliğinden güncellenir.

Bugün bazı kayıtlarda iki kurum tek tarafa sıkıştırılmış ("Teknopark Ankara · İnovest"). Yeni yapıda
taraf sayısı 2 ile sınırlı olmayacak; bunlar ayrı taraflar olarak yazılacak.

---

## 3. Teknik tasarım (uygulayacak kişi için)

Projede iki kural var ve bu iş de onlara uymalı:

1. **Yeni kayıt eklemek kod değiştirmeyi gerektirmez.** İçerik dosyası eklemek yeterli olmalı.
2. **Bir parça diğerinin iç yapısını bilmez.** Kurum sayfası, kendisine bağlanan kaydın yatırım mı
   iş birliği mi olduğunu bilmez; ona "ilgili bölümler" listesi verilir.

Harita aynı deseni zaten kullanıyor (`src/components/harita/kaynaklar.ts`): her içerik türü bir
"kaynak" fonksiyonu yazar, harita sadece ortak biçimi tanır. Bu iş için aynı desen kurulacak.

### Alan adı kararı

Yatırım, takvim ve akademisyende alanın adı aynı olacak: `aktorler`. Akademisyende anlamı "çalıştığı
merkez" olsa da tek ad, tek doğrulayıcı ve tek sorgu demek. Kurum sayfasındaki bölüm başlığı anlamı
taşır ("Araştırmacılar", "Yatırımlar"…). İş birliğinde alan `taraflar` olarak kalır, çünkü kurum
olmayan tarafları da tutar.

---

## 4. Uygulama adımları

Her adımdan sonra `npm run build` çalıştırılmalı; 0 hata ile geçmeden sonrakine geçilmemeli.

### Adım 1: Kurum kimliği doğrulayıcısı (`src/content.config.ts`)

`idIn()` sözlük YAML'larının anahtarlarını okuyor. Kurumlar YAML değil, klasördeki `.md` dosyaları
olduğu için ayrı bir doğrulayıcı gerekir:

```ts
import { readdirSync } from "node:fs";

/** src/content/aktorler altındaki tüm .md dosyalarının adları (= kurum kimlikleri). */
const aktorIdleri = () =>
  (readdirSync("src/content/aktorler", { recursive: true }) as string[])
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/^.*[\\/]/, "").replace(/\.md$/, ""));

const aktorId = () => {
  const ids = aktorIdleri();
  return z.string().refine((v) => ids.includes(v), {
    error: (issue) => `"${String(issue.input)}" adında bir kurum yok (src/content/aktorler/**/${String(issue.input)}.md).`,
  });
};
```

Not: Windows'ta `readdirSync` yolları `\` ile döndürür; yukarıdaki regex iki ayırıcıyı da kapsıyor.

### Adım 2: Şemalara alanları eklemek (`src/content.config.ts`)

```ts
// yatirimlar, takvim, akademisyenler şemalarına:
aktorler: z.array(aktorId()).default([]),

// isbirlikleri şemasında taraflar değişir:
const taraf = z.union([
  z.object({ aktor: aktorId() }),
  z.object({ ad: z.string() }),
  // 6. bölümdeki karar "evet" ise:
  // z.object({ universite: idIn("universiteler") }),
]);
taraflar: z.array(taraf).min(2),
```

Bu adımdan sonra build **kırılır**, çünkü mevcut iş birliği dosyalarında taraflar hâlâ düz metin.
8. adımda veri dönüştürülene kadar bu beklenen bir durum. İsterseniz 2. ve 8. adımlar birlikte yapılır.

### Adım 3: Veri katmanı (`src/lib/content.ts`)

- `getIsbirlikleri()` ve diğer fonksiyonlar aynı kalır.
- Yeni yardımcı: bir iş birliği tarafının ekrandaki adını ve (varsa) bağlantısını çözen
  `tarafCoz(taraf)` → `{ ad: string; yol?: string }`. Kurum kimliğiyse `getAktor()` ile ad ve
  `aktorYolu()` ile yol bulunur; düz adsa yalnızca ad döner.
- `isbirligiAramaMetni()` artık `x.data.taraflar` metin dizisi olmadığı için çözülmüş adları kullanmalı.
  Aksi halde iş birliklerinde kurum adıyla arama çalışmaz.

### Adım 4: İlişki kaynakları (`src/components/iliskiler/kaynaklar.ts`, yeni dosya)

Harita kaynaklarının ikizi. Her kaynak bir kurum kimliği alır ve o kuruma bağlı kayıtları bir
"bölüm" olarak döndürür:

```ts
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

export interface IliskiBolumu {
  baslik: string; // "Yatırımlar", "İş birlikleri", "Etkinlikler ve çağrılar", "Araştırmacılar"
  ogeler: { Bilesen: AstroComponentFactory; props: Record<string, unknown> }[];
}

type IliskiKaynagi = (aktorId: string) => Promise<IliskiBolumu>;

const yatirimlar: IliskiKaynagi = async (aktorId) => ({
  baslik: "Yatırımlar",
  ogeler: (await getYatirimlar())
    .filter((y) => y.data.aktorler.includes(aktorId))
    .map((yatirim) => ({ Bilesen: YatirimSatiri, props: { yatirim, tur: … } })),
});
// isbirlikleri: taraflardan biri { aktor: aktorId } olanlar → IsbirligiKarti
// takvim: aktorler içinde aktorId olanlar → TakvimSatiri
// arastirmacilar: akademisyenlerden aktorler içinde aktorId olanlar → AkademisyenSatiri

const ILISKI_KAYNAKLARI: IliskiKaynagi[] = [yatirimlar, isbirlikleri, takvim, arastirmacilar];

/** Boş olmayan bölümler, listedeki sırayla. */
export async function iliskiliBolumler(aktorId: string): Promise<IliskiBolumu[]> {
  return (await Promise.all(ILISKI_KAYNAKLARI.map((k) => k(aktorId)))).filter((b) => b.ogeler.length > 0);
}
```

İleride yeni bir ilişki türü eklemek (ör. "Ödüller") bu listeye bir kaynak eklemekten ibaret olur;
kurum sayfası değişmez.

### Adım 5: Kurum sayfasında bölümler

- Yeni bileşen `src/components/iliskiler/IliskiliBolumler.astro`: `aktorId` alır,
  `iliskiliBolumler()` sonucunu her bölüm için `ListeGrubu` başlığı altında çizer.
- `src/pages/[kategori]/[aktor].astro`: `AktorDetay` kutusunun altına `<IliskiliBolumler aktorId={aktor.id} />`.
- Satırlar ve kartlar zaten hazır (`satirlar/` klasörü); yeniden yazılmaz. Satırlardaki `id`
  ve `data-filter-*` nitelikleri bu sayfada zararsız; kaldırılmasına gerek yok.
- **Haritanın yan paneline eklenmez.** Panel detayları ana sayfaya gömülü; 105 kurumun ilişkileri
  eklenirse sayfa gereksiz büyür. Panelde başlık zaten kurum sayfasına bağlantı.

### Adım 6: İş birliği kartında taraflar bağlantı olsun

`src/components/satirlar/IsbirligiKarti.astro`: taraflar 2'den fazla olabileceği için
`const [a, b] = d.taraflar` yerine liste çizilir; her taraf `tarafCoz()` ile çözülür, `yol` varsa
`<a>`, yoksa düz metin. Taraflar arasındaki ⟷ işareti korunur.

### Adım 7: (İsteğe bağlı) Yatırım ve takvim satırlarında kurum bağlantıları

Satırın altına "İlgili kurumlar: Evreka" gibi bağlantılar eklenebilir. Kurum sayfasında kendi adı
tekrar etmesin diye satır bileşenine `haricTut?: string` (o sayfanın kurum kimliği) verilebilir.
Bu adım atlanırsa işin geri kalanı yine çalışır.

### Adım 8: Verileri bağlamak

5. bölümdeki **onaylanmış** tabloya göre dosyalar güncellenir. 63 akademisyen, 17 yatırım ve 13 takvim
kaydının çoğuna dokunulmaz; yalnızca tablodaki kayıtlar değişir. İş birliklerinin 27'si de taraf
biçimi değiştiği için güncellenir.

Bu iş elle de yapılabilir, tek seferlik küçük bir script ile de. Script yazılırsa iş bitince silinmeli
(daha önceki `migrate-legacy.mjs` gibi).

### Adım 9: Belgeleri güncellemek

- Kök `README.md` → "İçerik ekleme" tablosuna `aktorler` ve yeni `taraflar` biçimi, örnekle.
- Bu dosya silinir, `yapilacaklar/README.md` tablosundan satırı çıkarılır.

---

## 5. Önerilen eşleştirmeler (onay bekliyor)

Ad benzerliğine ve kayıtların açıklamalarına bakılarak hazırlandı. **?** işaretli satırlar
yorum gerektiriyor; uygulamadan önce kesinleştirilmeli. "düz ad" = haritada karşılığı olmayan taraf.

### İş birlikleri (27 dosya)

`üniversite:` satırları 6. bölümdeki 1. karara bağlı; karar "hayır" ise o taraflar düz ad olur.

| Dosya | Şu anki taraflar | Önerilen taraflar |
|---|---|---|
| abb-ego-genel-mudurlugu | ABB ⟷ EGO Genel Müdürlüğü | aktor: `ankara-buyuksehir-belediyesi` · düz ad: EGO Genel Müdürlüğü |
| ankara-ka-dunya-bankasi | Ankara KA ⟷ Dünya Bankası | düz ad: Ankara Kalkınma Ajansı · düz ad: Dünya Bankası |
| ankara-ka-teknopark-ankara-inovest | Ankara KA ⟷ Teknopark Ankara · İnovest | düz ad: Ankara Kalkınma Ajansı · aktor: `teknopark-ankara` · aktor: `inovest` |
| ankara-ka-tse-global | Ankara KA ⟷ TSE Global | düz ad: Ankara Kalkınma Ajansı · düz ad: TSE Global |
| aso-odtu-teknokent | ASO ⟷ ODTÜ Teknokent | aktor: `ankara-sanayi-odasi` · aktor: `odtu-teknokent` · **?** `aso-teknopark` üçüncü taraf olarak eklensin mi (açıklama ASO Teknopark'ı anlatıyor) |
| atilim-universitesi-werer-energy | Atılım Üniversitesi ⟷ Werer Energy | üniversite: `atilim` · aktor: `werer-energy` |
| aybu-teknopark-ankara | AYBÜ ⟷ Teknopark Ankara | üniversite: `aybu` · aktor: `teknopark-ankara` |
| bilkent-cyberpark-ankara-buyuksehir-belediyesi | Bilkent CYBERPARK ⟷ Ankara Büyükşehir Belediyesi | aktor: `bilkent-cyberpark` · aktor: `ankara-buyuksehir-belediyesi` · **?** ortaya çıkan `ankara-teknoloji-koprusu` eklensin mi |
| botas-ab-ipa-fonu | BOTAŞ ⟷ AB IPA Fonu | düz ad: BOTAŞ · düz ad: AB IPA Fonu |
| enerjisa-enerji-ankara-uni-teknokent | Enerjisa Enerji ⟷ Ankara Üni Teknokent | düz ad: Enerjisa Enerji · aktor: `ankara-universitesi-teknokent` |
| hacettepe-universitesi-carbonit | Hacettepe Üniversitesi ⟷ CarbonIT | üniversite: `hacettepe` · aktor: `carbonit` |
| hacettepe-universitesi-some-carbon | Hacettepe Üniversitesi ⟷ Some Carbon | üniversite: `hacettepe` · aktor: `some-carbon` |
| inovat-macaristan | iNOVAT ⟷ Macaristan | aktor: `inovat` · düz ad: Macaristan |
| ivedik-osb-dunya-bankasi-sanayi-bakanligi | İvedik OSB ⟷ Dünya Bankası · Sanayi Bakanlığı | düz ad: İvedik OSB · düz ad: Dünya Bankası · düz ad: Sanayi Bakanlığı |
| leap-investment-ankara-tekmer | LEAP Investment ⟷ Ankara TEKMER | düz ad: LEAP Investment · aktor: `ankara-tekmer` |
| netzero-tekmer-sparklabs-cop31-antalya | NetZero TEKMER · SparkLabs ⟷ COP31 Antalya | aktor: `netzero-tekmer` · aktor: `sparklabs-group` · düz ad: COP31 Antalya |
| netzero-tekmer-sparklabs-truezero | NetZero TEKMER ⟷ SparkLabs TrueZero | aktor: `netzero-tekmer` · aktor: `sparklabs-group` |
| odtu-70-yil-gsyf-m-based | ODTÜ 70. Yıl GSYF ⟷ M-Based | düz ad: ODTÜ 70. Yıl GSYF · aktor: `m-based` |
| odtu-kybeles-garden | ODTÜ ⟷ Kybele's Garden | üniversite: `odtu` · aktor: `kybeles-garden` |
| odtu-sensgreen | ODTÜ ⟷ Sensgreen | üniversite: `odtu` · aktor: `sensgreen` |
| odtu-teknokent-netzero-tekmer | ODTÜ Teknokent ⟷ NetZero TEKMER | aktor: `odtu-teknokent` · aktor: `netzero-tekmer` |
| ostim-osb-ostim-teknopark-ostim-teknik-uni | OSTİM OSB ⟷ OSTİM Teknopark · OSTİM Teknik Üni | aktor: `ostim-osb` · aktor: `ostim-teknopark` · üniversite: `ostimtu` |
| spacelis-nato-diana | Spacelis ⟷ NATO DIANA | aktor: `spacelis` · düz ad: NATO DIANA |
| startupcentrum-arz-portfoy | StartupCentrum ⟷ ARZ Portföy | aktor: `startupcentrum` · düz ad: ARZ Portföy |
| tenmak-aybu-h2team | TENMAK ⟷ AYBÜ H2TEAM | **?** aktor: `tenmak-temiz-enerji-arastirma-enst` (haritadaki kayıt TENMAK'ın bir enstitüsü; tüm TENMAK'ı temsil ediyor mu?) · düz ad: AYBÜ H2TEAM |
| tobb-etu-yesil-hidrojen-dernegi | TOBB ETÜ ⟷ Yeşil Hidrojen Derneği | **?** üniversite: `tobb` ya da aktor: `tobb-etu-enerji-arastirma-lab` (iş birliğini yürüten laboratuvar) · düz ad: Yeşil Hidrojen Derneği |
| tubitak-odtu-gunam | TÜBİTAK ⟷ ODTÜ GÜNAM | düz ad: TÜBİTAK · aktor: `odtu-gunam` |

### Yatırımlar (17 dosya)

| Dosya | Önerilen `aktorler` |
|---|---|
| aisfield | `aisfield` |
| ankara-universitesi-teknokent-yesil-elektrik | `ankara-universitesi-teknokent` |
| baskent-edas-sebeke-yatirimlari | `baskent-edas-esarj` |
| cfl-malzeme-teknolojileri | `cfl-malzeme-teknolojileri` |
| evreka-buyume-turu | `evreka` · **?** yatırımcı tarafı `ttgv` de eklensin mi (6. bölüm, 2. karar) |
| evreka-ilk-tur | `evreka` |
| evreka-kurumsal-yatirim | `evreka` |
| hane-gsyf | **?** `bilkent-tekmer` (fon Bilkent TEKMER girişimlerine açık) ya da boş |
| kalyon-pv-entegre-gunes-fabrikasi | `kalyon-pv` |
| leap-yatirim-fonu | `ankara-tekmer` |
| microfert-biyoteknoloji | `microfert-biyoteknoloji` |
| ostim-otopark-gesleri | `ostim-osb` |
| temelli-veri-merkezi | `ronesans-digital-realty` |
| tenmak-hidrojen-ar-ge-merkezi | `tenmak-temiz-enerji-arastirma-enst` |
| tt-ventures-gsyf | `tt-ventures` |
| ttgv-iklim-oncusu-vc-fonu | `ttgv` |
| yeka-2026-ruzgar-ve-gunes-yarismalari | boş (belirli bir kurum yok) |

### Takvim (13 dosya)

| Dosya | Önerilen `aktorler` |
|---|---|
| deep-techankara-2026-demo-day | `teknopark-ankara` · `inovest` · **?** `techankara` (programın adı Deep TechAnkara) |
| techankara-proje-pazari | `techankara` |
| tenmak-ar-ge-tesvik-cagrilari | `tenmak-temiz-enerji-arastirma-enst` |
| true-zero-global-prize-demo-day | `netzero-tekmer` · `sparklabs-group` |
| gcip-turkiye-hizlandiricisi, gcip-turkiye-odul-toreni, kosgeb-cop31-odakli-hizlandirma-destegi, sanayi-bakanligi-yesil-donusum-programi, sogreen-sosyal-kapsayici-yesil-gecis, tubitak-1831-…, tubitak-1832-…, tubitak-1833-…, turkiye-hidrojen-zirvesi-2026 | boş (ulusal programlar ya da düzenleyeni haritada olmayan etkinlikler) |

### Akademisyenler (63 dosyanın 19'u)

`birim` alanında haritadaki bir merkezin adı geçenler:

| Kurum | Akademisyenler (dosya adları) |
|---|---|
| `odtu-gunam` | rasit-turan, selcuk-yerci, gorkem-gunbas, onur-taylan, murat-gol, talat-ozden, bilge-senturk |
| `odtu-ruzgem` | oguz-uzol, ozan-keysan, ismail-hakki-tuncer |
| `odtu-iklim` | baris-salihoglu, ipek-gursel-dino, gulizar-ozyurt-tarakcioglu, ebru-voyvoda, pinar-derin-gure, yasemin-dilsad-yilmazel-tokel, gaye-teksoz |
| `tobb-etu-enerji-arastirma-lab` | **?** mehmet-sankir (açıklamasında laboratuvarın lideri olduğu yazıyor), **?** nurdan-demirci-sankir |

AYBÜ H2TEAM müdürü Selahattin Çelik'in merkezi haritada kurum olarak yok; bağlanmaz.

---

## 6. Uygulamadan önce verilmesi gereken kararlar

1. **Üniversiteler iş birliği tarafı olabilsin mi?** "ODTÜ", "Hacettepe Üniversitesi" gibi taraflar
   haritada kurum değil ama `universiteler.yaml`'da var. "Evet" ise bu taraflar Akademisyen rehberinin
   o üniversiteye süzülmüş haline bağlantı olur (`/akademisyenler/?universite=odtu`). "Hayır" ise düz ad
   kalırlar. **Öneri: evet**, 7 iş birliğini bağlıyor ve kodu küçük.
2. **Yatırımlarda yatırımcı kurumlar da bağlansın mı?** Örneğin Evreka'nın büyüme turuna TTGV fonu
   katılmış; `aktorler: [evreka, ttgv]` yazılırsa yatırım TTGV'nin sayfasında da görünür. Bunun için
   bölüm başlığı "Yatırımlar" yerine "İlgili yatırımlar" olmalı. **Öneri: şimdilik yalnızca yatırım
   alan kurum**; yatırımcı tarafı ileride ayrı bir alanla (`yatirimcilar:`) eklenebilir.
3. **5. bölümdeki ? işaretli satırlar.** Her biri için evet/hayır.
4. **Kurum sayfasındaki bölüm sırası.** Öneri: Yatırımlar, İş birlikleri, Etkinlikler ve çağrılar,
   Araştırmacılar.

---

## 7. Bitti sayılması için kontrol listesi

- [ ] `npm run build` 0 hata, 0 uyarı.
- [ ] Bir yatırım dosyasına geçici olarak `aktorler: [yok-boyle-bir-kurum]` yazınca build anlaşılır bir
      mesajla duruyor; geçici değişiklik geri alındı.
- [ ] Ekran görüntüsüyle kontrol: `/girisimler/evreka/` (3 yatırım), `/tekmerler/netzero-tekmer/`
      (iş birlikleri + takvim), `/arastirma-merkezleri/odtu-gunam/` (7 araştırmacı), `/isbirlikleri/`
      (taraflar bağlantı). Açık ve koyu tema, dar ekran.
- [ ] İş Birlikleri sayfasında "netzero" araması hâlâ NetZero kartlarını buluyor (arama metni çözülmüş
      adları kullanıyor).
- [ ] Sitedeki tüm iç bağlantılar çalışıyor (kırık bağlantı taraması 0).
- [ ] Kök `README.md` güncellendi; bu dosya silindi, `yapilacaklar/README.md` tablosundan çıkarıldı.

---

## 8. Kapsam dışı

- Yatırım, iş birliği, takvim ve akademisyen için ayrı detay sayfaları (bilinçli olarak yapılmıyor).
- Haritada kurumlar arası çizgiler (ilişki ağı görselleştirmesi). Bu iş bittikten sonra veri hazır
  olacağı için ayrıca ele alınabilir.
- Django tarafı. Burada kullanılan kimlikler (dosya adları) ileride favorilerde de aynen kullanılacak;
  bu iş o tasarımı değiştirmez.
