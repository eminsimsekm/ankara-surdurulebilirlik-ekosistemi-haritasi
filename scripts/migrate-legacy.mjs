/*
  Tek seferlik taşıma: legacy/ HTML'deki veri dizilerini (D, A, T, I, IB, SEC, UNIS)
  src/content/ altında kayıt başına dosyalara yazar.

    node scripts/migrate-legacy.mjs           # hedef klasörler doluysa durur
    node scripts/migrate-legacy.mjs --force   # üretilen klasör ve dosyaları silip baştan yazar

  Elle yazılan sözlükler (kategoriler.yaml, isbirligi-turleri.yaml, yatirim-turleri.yaml)
  bu script tarafından değiştirilmez. Taşıma bitip legacy/ silinince bu script de silinmeli.
*/
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import YAML from "yaml";

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const FORCE = process.argv.includes("--force");
const RECORD_DIRS = ["aktorler", "akademisyenler", "takvim", "yatirimlar", "isbirlikleri"];
const GENERATED_FILES = ["universiteler.yaml", "sektor-yatirimlari-2025.yaml"];

// Eski kısa kodlar → yeni kimlikler
const KATEGORI = { tgb: "teknopark", tek: "tekmer", gir: "girisim", kur: "sirket", kob: "kobi", mrk: "arastirma", kam: "kamu", eko: "platform" };
const TAKVIM_TUR = { etk: "etkinlik", des: "destek" };
const YATIRIM_TUR = { "Girişim": "girisim", "Kurumsal": "kurumsal", "Altyapı": "altyapi", "Fon": "fon" };
const ONE_CIKANLAR = new Set(["netzero"]);

// 1. Eski veriyi oku

function readLegacyData(html) {
  const start = html.search(/const\s+CATS\s*=/);
  const end = html.search(/const\s+TODAY\s*=/);
  if (start < 0 || end < start) throw new Error("Eski HTML'de veri bloğu bulunamadı.");
  return vm.runInNewContext(`${html.slice(start, end)}\n;({ D, UNIS, A, IB, T, SEC, I })`);
}

const { D, UNIS, A, IB, T, SEC, I } = readLegacyData(readFileSync(root("legacy/ankara-surdurulebilirlik-haritasi.html"), "utf8"));

// 2. Hedefi hazırla

const existing = RECORD_DIRS.filter((d) => existsSync(root(`src/content/${d}`)) && readdirSync(root(`src/content/${d}`)).length);
if (existing.length && !FORCE) {
  console.error(`Dolu klasörler var: ${existing.join(", ")}. Elle yapılan değişiklikler silinir; emin iseniz --force ile çalıştırın.`);
  process.exit(1);
}
for (const d of RECORD_DIRS) rmSync(root(`src/content/${d}`), { recursive: true, force: true });
for (const f of GENERATED_FILES) rmSync(root(`src/content/${f}`), { force: true });

// 3. Yardımcılar

const TR = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u" };
const slugify = (s) =>
  s.replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR[c])
    .replace(/['’]/g, "") // Kybele's → kybeles, GES'leri → gesleri
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// undefined, null ve "" alanları at; boş diziler bilinçli olarak korunur.
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ""));
const nonEmpty = (arr) => (arr && arr.length ? arr : undefined);
const yaml = (obj) => YAML.stringify(obj, { lineWidth: 0 });

const ids = new Map(); // koleksiyon → Set(id)
const counts = {};
const warnings = [];

function write(collection, relPath, text) {
  const id = relPath.replace(/^.*\//, "").replace(/\.\w+$/, "");
  const seen = ids.get(collection) ?? ids.set(collection, new Set()).get(collection);
  if (seen.has(id)) throw new Error(`${collection}: "${id}" kimliği iki kez üretildi (${relPath}).`);
  seen.add(id);
  const path = root(`src/content/${collection}/${relPath}`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  counts[collection] = (counts[collection] ?? 0) + 1;
}

function markdown(front, body, label) {
  if (/[*_`<>\[\]#]|^\s*\d+\.\s/m.test(body)) warnings.push(`${label}: gövdede Markdown'da anlam taşıyan karakter var, kontrol edin.`);
  return `---\n${yaml(front)}---\n\n${body.trim()}\n`;
}

// 4. Aktörler

for (const x of D) {
  const kategori = KATEGORI[x.k];
  if (!kategori) throw new Error(`Bilinmeyen kategori "${x.k}" (${x.id})`);
  const front = clean({
    ad: x.n,
    kategori,
    konum: x.l,
    etiketler: nonEmpty(x.t),
    uzmanlik: x.uz,
    surdurulebilirlik: x.bg,
    kisiler: x.p,
    kaynak: x.u,
    oneCikan: ONE_CIKANLAR.has(x.id) || undefined,
    yonetim: nonEmpty(x.yon)?.map(([ad, rol, ozgecmis, kaynak]) => clean({ ad, rol, ozgecmis, kaynak })),
    capaFirmalar: x.cp?.length ? clean({ firmalar: x.cp, not: x.cpn, kaynak: x.cpu }) : undefined,
    firmalar: Array.isArray(x.fr) ? x.fr : undefined,
  });
  write("aktorler", `${kategori}/${slugify(x.n)}.md`, markdown(front, x.d ?? "", `aktör ${x.n}`));
}

// 5. Akademisyenler (aynı üniversitede aynı isim = aynı kişi; kayıtlar birleştirilir)

const people = new Map();
const merges = [];
for (const a of A) {
  const key = `${a.un}|${a.n}`;
  const prev = people.get(key);
  if (!prev) {
    people.set(key, { ...a, w: [a.w], t: [...a.t], legacyIds: [a.id] });
    continue;
  }
  prev.legacyIds.push(a.id);
  if (a.b.length > prev.b.length) prev.b = a.b;
  if (!prev.w.includes(a.w)) prev.w.push(a.w);
  for (const t of a.t) if (!prev.t.includes(t)) prev.t.push(t);
  merges.push(`${a.ti} ${a.n} (${UNIS[a.un]}): ${prev.legacyIds.join(" + ")}`);
}
for (const a of people.values()) {
  const front = clean({ ad: a.n, unvan: a.ti, universite: a.un, birim: a.b, etiketler: nonEmpty(a.t), profil: a.u });
  write("akademisyenler", `${a.un}/${slugify(a.n)}.md`, markdown(front, a.w.join("\n\n"), `akademisyen ${a.n}`));
}

// 6. Takvim

for (const x of T) {
  const tur = TAKVIM_TUR[x.k];
  if (!tur) throw new Error(`Bilinmeyen takvim türü "${x.k}" (${x.id})`);
  const front = clean({
    ad: x.n, tur, duzenleyen: x.o, baslangic: x.from, bitis: x.to,
    yillik: x.yearly || undefined, durumNotu: x.st, aciklama: x.d, kaynak: x.u,
  });
  write("takvim", `${slugify(x.n)}.yaml`, yaml(front));
}

// 7. Yatırımlar

for (const x of I) {
  const tur = YATIRIM_TUR[x.ty];
  if (!tur) throw new Error(`Bilinmeyen yatırım türü "${x.ty}" (${x.id})`);
  const front = clean({ ad: x.n, tur, tarih: x.dt, tutar: x.a, yatirimci: x.inv, aciklama: x.d, kaynak: x.u });
  write("yatirimlar", `${slugify(x.n)}.yaml`, yaml(front));
}

// 8. İş birlikleri

for (const x of IB) {
  const front = clean({ taraflar: [x.a, x.b], tur: x.tip, aciklama: x.d, etiketler: nonEmpty(x.t), yil: x.y ? Number(x.y) : undefined });
  write("isbirlikleri", `${slugify(`${x.a} ${x.b}`)}.yaml`, yaml(front));
}

// 9. Üretilen sözlükler

const uniYaml = Object.fromEntries(Object.entries(UNIS).map(([id, ad], i) => [id, { ad, sira: i + 1 }]));
writeFileSync(
  root("src/content/universiteler.yaml"),
  `# Üniversiteler. Anahtar, akademisyen dosyalarındaki \`universite:\` alanında kullanılır.\n# \`sira\`: rehberdeki sıra.\n\n${yaml(uniYaml)}`,
);

const secYaml = Object.fromEntries(
  SEC.map(([ad, islem, tutarMilyonDolar]) => [slugify(ad), clean({ ad, islem, tutarMilyonDolar, vurgu: ad.startsWith("Sürdürülebilirlik") || undefined })]),
);
writeFileSync(
  root("src/content/sektor-yatirimlari-2025.yaml"),
  `# 2025 Ankara girişim yatırımları, sektöre göre.\n# Kaynak: Ankara Kalkınma Ajansı, 2025 Yılsonu Ankara Girişimcilik Ekosistemi.\n# \`vurgu: true\` olan satır grafikte öne çıkarılır.\n\n${yaml(secYaml)}`,
);

// 10. Özet

console.log("Yazılan kayıtlar:", counts);
console.log(`Üniversite: ${Object.keys(uniYaml).length}, sektör satırı: ${Object.keys(secYaml).length}`);
if (merges.length) console.log(`\nBirleştirilen akademisyen kayıtları (${merges.length}):\n  ${merges.join("\n  ")}`);
if (warnings.length) console.log(`\nUyarılar (${warnings.length}):\n  ${warnings.join("\n  ")}`);
