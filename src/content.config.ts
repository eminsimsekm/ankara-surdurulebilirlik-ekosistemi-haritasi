/*
  İçerik koleksiyonları ve şemaları.

  Kayıt başına bir dosya: yeni bir aktör, akademisyen, etkinlik, yatırım ya da
  iş birliği eklemek için ilgili klasöre bir dosya eklemek yeterli. Şema hatalı
  ya da eksik alanı build sırasında dosya adıyla birlikte bildirir.

  Dosya adı = kalıcı kimlik (URL'lerde ve ileride favorilerde kullanılır), bu
  yüzden yayına çıktıktan sonra dosya adı değiştirilmemeli. Alt klasörler
  (aktorler/tekmer/, akademisyenler/odtu/) yalnızca düzen içindir; kategori ve
  üniversite frontmatter'dan okunur.
*/
import { readdirSync, readFileSync } from "node:fs";
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import YAML from "yaml";

const SOZLUKLER = {
  kategoriler: "src/content/kategoriler.yaml",
  universiteler: "src/content/universiteler.yaml",
  isbirligiTurleri: "src/content/isbirligi-turleri.yaml",
  yatirimTurleri: "src/content/yatirim-turleri.yaml",
  alanlar: "src/content/alanlar.yaml",
} as const;

/*
  Bir sözlük dosyasındaki anahtarlardan biri olmalı. Astro'nun reference() alanı
  kaydın varlığını build sırasında denetlemediği için (yanlış yazılan kategori
  sessizce kaybolur) geçerli değerler doğrudan YAML'dan okunur. Sözlüğe yeni
  anahtar eklemek yeterli; burada kod değişmez.
*/
const idIn = (sozluk: keyof typeof SOZLUKLER) => {
  const ids = Object.keys(YAML.parse(readFileSync(SOZLUKLER[sozluk], "utf8")) ?? {});
  return z.string().refine((v) => ids.includes(v), {
    error: (issue) => `"${String(issue.input)}" ${SOZLUKLER[sozluk]} içinde yok. Geçerli değerler: ${ids.join(", ")}`,
  });
};

/*
  Bir kurum kimliği olmalı (src/content/aktorler altındaki bir .md dosyasının adı).
  Yatırım, takvim, akademisyen ve iş birliği kayıtlarını kurumlara bağlar; yanlış
  yazılan kimlik build'i durdurur.
*/
const aktorId = () => {
  const ids = (readdirSync("src/content/aktorler", { recursive: true }) as string[])
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/^.*[\\/]/, "").replace(/\.md$/, ""));
  return z.string().refine((v) => ids.includes(v), {
    error: (issue) => `"${String(issue.input)}" adında bir kurum yok (src/content/aktorler/<kategori>/${String(issue.input)}.md dosyası bulunamadı).`,
  });
};

/** Kaydın ilgili olduğu kurumlar. Kurum sayfasında ilgili bölümde listelenir. */
const ilgiliAktorler = () => z.array(aktorId()).default([]);

const idFromFileName = ({ entry }: { entry: string }) =>
  entry.replace(/^.*\//, "").replace(/\.(md|ya?ml)$/, "");

const recordsIn = (folder: string, pattern: string) =>
  glob({ pattern, base: `src/content/${folder}`, generateId: idFromFileName });

// YAML'da tırnaksız yazılan 2024 sayı olarak okunur; metne çevirip biçimini doğrula.
const yearOrMonth = z.coerce.string().regex(/^\d{4}(-\d{2})?$/, "YYYY ya da YYYY-AA biçiminde olmalı");

// Sözlük koleksiyonları (tek YAML dosyası, anahtar = id)

const kategoriler = defineCollection({
  loader: file(SOZLUKLER.kategoriler),
  schema: z.object({
    ad: z.string(),
    kisaAd: z.string(),
    // Yalnızca aktör kategorileri için (kategori sayfasının başlığı ve girişi);
    // diğer sayfaların metinleri sayfalar/*.md'de
    baslik: z.string().optional(),
    aciklama: z.string().optional(),
    yol: z.string().regex(/^[a-z0-9-]+$/),
    sira: z.number().int(),
    menuAdi: z.string().optional(),
    menuSira: z.number().int().optional(),
    firmaBasligi: z.string().default("Bu alandaki firmalar"),
    yonetimBekleniyor: z.boolean().default(false),
  }),
});

const universiteler = defineCollection({
  loader: file(SOZLUKLER.universiteler),
  schema: z.object({
    ad: z.string(),
    sira: z.number().int(),
  }),
});

const isbirligiTurleri = defineCollection({
  loader: file(SOZLUKLER.isbirligiTurleri),
  schema: z.object({
    ad: z.string(),
    sira: z.number().int(),
  }),
});

const yatirimTurleri = defineCollection({
  loader: file(SOZLUKLER.yatirimTurleri),
  schema: z.object({
    ad: z.string(),
    sira: z.number().int(),
  }),
});

/** Kurumların faaliyet alanları (filtre çipleri). */
const alanlar = defineCollection({
  loader: file(SOZLUKLER.alanlar),
  schema: z.object({
    ad: z.string(),
    aciklama: z.string().optional(),
    sira: z.number().int(),
  }),
});

const sektorYatirimlari = defineCollection({
  loader: file("src/content/sektor-yatirimlari-2025.yaml"),
  schema: z.object({
    ad: z.string(),
    islem: z.number().int().nonnegative(),
    tutarMilyonDolar: z.number().nonnegative(),
    vurgu: z.boolean().default(false),
  }),
});

/** Ana sayfadaki sayı şeridinin elle girilen değerleri (hesaplananlar kodda). */
const oneCikanSayilar = defineCollection({
  loader: file("src/content/one-cikan-sayilar.yaml"),
  schema: z.object({
    deger: z.string(),
    etiket: z.string(),
    yol: z.string().startsWith("/").optional(),
    sira: z.number().int(),
  }),
});

/*
  Sayfa metinleri. Her sayfa yalnızca ihtiyaç duyduğu blokları doldurur; şablon
  dolu olan blokları çizer. Gövde (Markdown) sayfanın ana metnidir.
*/
const adAciklama = z.object({ ad: z.string(), aciklama: z.string() });

const sayfalar = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/sayfalar", generateId: idFromFileName }),
  schema: z.object({
    baslik: z.string(),
    ust: z.string().optional(),
    /** Başlık altındaki giriş cümlesi; sayfa açıklaması (meta) olarak da kullanılır */
    ozet: z.string().optional(),
    /** Sayfanın ilgili olduğu aktör (dosya adı): aktör sayfasına ve haritaya bağlantı verilir */
    aktor: z.string().optional(),
    kartlar: z.array(adAciklama).optional(),
    vurgu: z.object({ baslik: z.string(), metin: z.string(), kaynak: z.url().optional() }).optional(),
    liste: z.object({ baslik: z.string(), ogeler: z.array(adAciklama).min(1) }).optional(),
    bilgiler: z.array(z.object({ etiket: z.string(), deger: z.string() })).optional(),
    baglantilar: z.array(z.object({ ad: z.string(), url: z.url() })).optional(),
    istatistikler: z
      .array(z.object({ deger: z.string(), etiket: z.string(), vurgu: z.boolean().default(false) }))
      .optional(),
    grafik: z.object({ baslik: z.string(), not: z.string(), kaynak: z.url().optional() }).optional(),
  }),
});

// Kayıt koleksiyonları (kayıt başına bir dosya)

const yonetici = z.object({
  ad: z.string(),
  rol: z.string(),
  ozgecmis: z.string().optional(),
  kaynak: z.url().optional(),
});

/** Teknopark, TEKMER, girişim, şirket, KOBİ, araştırma merkezi, kamu, platform. Gövde = açıklama. */
const aktorler = defineCollection({
  loader: recordsIn("aktorler", "**/*.md"),
  schema: z.object({
    ad: z.string(),
    kategori: idIn("kategoriler"),
    konum: z.string(),
    // Faaliyet alanları (alanlar.yaml); ilki birincil alan. Etiketlerden farkı: kontrollü liste, filtre olur.
    alanlar: z
      .array(idIn("alanlar"))
      .min(1, "Kurumun en az bir alanı olmalı (alanlar.yaml).")
      .max(3, "Kurum başına en fazla 3 alan yazılabilir."),
    etiketler: z.array(z.string()).default([]),
    uzmanlik: z.string().optional(),
    surdurulebilirlik: z.string().optional(),
    kisiler: z.string().optional(),
    kaynak: z.url().optional(),
    oneCikan: z.boolean().default(false),
    yonetim: z.array(yonetici).optional(),
    capaFirmalar: z
      .object({
        firmalar: z.array(z.string()).min(1),
        not: z.string().optional(),
        kaynak: z.url().optional(),
      })
      .optional(),
    // Boş liste "kaynaklarda firma bulunamadı" anlamına gelir; alanın hiç olmaması "bu bilgi bu aktör için geçerli değil".
    firmalar: z.array(z.string()).optional(),
  }),
});

/** Gövde = çalışma alanları. */
const akademisyenler = defineCollection({
  loader: recordsIn("akademisyenler", "**/*.md"),
  schema: z.object({
    ad: z.string(),
    unvan: z.string(),
    universite: idIn("universiteler"),
    birim: z.string(),
    etiketler: z.array(z.string()).default([]),
    profil: z.url().optional(),
    // Çalıştığı merkez(ler); merkezin kurum sayfasında "Araştırmacılar" altında görünür
    aktorler: ilgiliAktorler(),
  }),
});

/** Etkinlikler ve destek çağrıları. Durum (açık/yaklaşıyor/kapandı) tarihlerden hesaplanır. */
const takvim = defineCollection({
  loader: recordsIn("takvim", "**/*.yaml"),
  schema: z
    .object({
      ad: z.string(),
      tur: z.enum(["etkinlik", "destek"]),
      duzenleyen: z.string(),
      baslangic: z.coerce.date(),
      bitis: z.coerce.date(),
      yillik: z.boolean().default(false),
      // Tarihten hesaplanan durumun yerine gösterilecek not (ör. "Değerlendirmede")
      durumNotu: z.string().optional(),
      aciklama: z.string(),
      kaynak: z.url().optional(),
      aktorler: ilgiliAktorler(),
    })
    .refine((x) => x.bitis >= x.baslangic, { message: "bitis, baslangic'tan önce olamaz", path: ["bitis"] }),
});

const yatirimlar = defineCollection({
  loader: recordsIn("yatirimlar", "**/*.yaml"),
  schema: z.object({
    ad: z.string(),
    tur: idIn("yatirimTurleri"),
    tarih: yearOrMonth.optional(),
    tutar: z.string(),
    yatirimci: z.string(),
    aciklama: z.string(),
    kaynak: z.url().optional(),
    // Yatırımı alan kurum(lar); yatırımcılar değil
    aktorler: ilgiliAktorler(),
  }),
});

/*
  İş birliği tarafı: haritadaki bir kurum, bir üniversite (akademisyen rehberine
  bağlanır) ya da haritada karşılığı olmayan düz bir ad. Tam olarak biri yazılır.
*/
const taraf = z
  .object({
    aktor: aktorId().optional(),
    universite: idIn("universiteler").optional(),
    ad: z.string().optional(),
  })
  .refine((t) => [t.aktor, t.universite, t.ad].filter(Boolean).length === 1, {
    message: "Taraf için aktor, universite ya da ad alanlarından tam olarak biri yazılmalı.",
  });

const isbirlikleri = defineCollection({
  loader: recordsIn("isbirlikleri", "**/*.yaml"),
  schema: z.object({
    taraflar: z.array(taraf).min(2),
    tur: idIn("isbirligiTurleri"),
    aciklama: z.string(),
    etiketler: z.array(z.string()).default([]),
    yil: z.number().int().optional(),
  }),
});

export const collections = {
  kategoriler,
  universiteler,
  isbirligiTurleri,
  yatirimTurleri,
  alanlar,
  sektorYatirimlari,
  oneCikanSayilar,
  sayfalar,
  aktorler,
  akademisyenler,
  takvim,
  yatirimlar,
  isbirlikleri,
};
