/*
  İçeriğe erişim katmanı. Sayfa ve bileşenler koleksiyonlara doğrudan değil,
  buradaki fonksiyonlar üzerinden ulaşır; sıralama ve URL kuralları tek yerde
  durur. İçeriğin kaynağı ileride değişirse (ör. Django API) değişecek yer burası.

  Dil: her fonksiyon `dil` alır. İngilizcede src/content/en/'deki çeviri Türkçe kaydın
  üzerine bindirilir (aynı biçimde döner); çevrilmemiş alan Türkçe kalır. Bileşenler
  verinin hangi dilde olduğunu bilmez.
*/
import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { Dil } from "./dil";
import { searchKey } from "./text";
import { yol } from "./yol";

export type Kategori = CollectionEntry<"kategoriler">;
export type Aktor = CollectionEntry<"aktorler">;
export type Universite = CollectionEntry<"universiteler">;
export type Akademisyen = CollectionEntry<"akademisyenler">;
export type TakvimKaydi = CollectionEntry<"takvim">;
export type Yatirim = CollectionEntry<"yatirimlar">;
export type YatirimTuru = CollectionEntry<"yatirimTurleri">;
export type Isbirligi = CollectionEntry<"isbirlikleri">;
export type IsbirligiTuru = CollectionEntry<"isbirligiTurleri">;
export type Sayfa = CollectionEntry<"sayfalar">;
export type Alan = CollectionEntry<"alanlar">;

/** Kimliğe göre arama için. */
export const idSozlugu = <T extends { id: string }>(liste: T[]) => new Map(liste.map((x) => [x.id, x]));

const siraya = <T extends { data: { sira: number } }>(a: T, b: T) => a.data.sira - b.data.sira;

// interface değil type: getStaticPaths props'u olarak doğrudan kullanılabilmesi için
export type AktorGrubu = {
  kategori: Kategori;
  aktorler: Aktor[];
};

// Adlar her dilde Türkçe olduğu için sıralama Türkçe alfabeyle
const collator = new Intl.Collator("tr");

// Çeviri bindirme

type Sozluk = CollectionEntry<"sozlukEn">["data"];
const BOS_SOZLUK: Sozluk = {
  kategoriler: {},
  alanlar: {},
  yatirimTurleri: {},
  isbirligiTurleri: {},
  oneCikanSayilar: {},
  sektorYatirimlari: {},
  etiketler: {},
  unvanlar: {},
  birimler: {},
};

async function sozluk(dil: Dil): Promise<Sozluk> {
  if (dil === "tr") return BOS_SOZLUK;
  return (await getEntry("sozlukEn", "sozluk"))?.data ?? BOS_SOZLUK;
}

/** Kimliğe göre çeviriler; Türkçede boş. */
async function ceviriler<C extends "aktorlerEn" | "akademisyenlerEn" | "takvimEn" | "yatirimlarEn" | "isbirlikleriEn">(
  koleksiyon: C,
  dil: Dil,
): Promise<Map<string, CollectionEntry<C>>> {
  if (dil === "tr") return new Map();
  return idSozlugu(await getCollection(koleksiyon));
}

/** Sözlük alanlarını (ad, açıklama…) kaydın verisinin üzerine yazar. */
const sozlukBindir = <T extends { id: string; data: object }>(kayit: T, ceviri: object | undefined): T =>
  ceviri ? { ...kayit, data: { ...kayit.data, ...ceviri } } : kayit;

const etiketleriCevir = (etiketler: string[], s: Sozluk) => etiketler.map((e) => s.etiketler[e] ?? e);

/** Gövdesi çevrilmiş kayıtta metin ve HTML İngilizce kaydınkidir; çevrilmemişse Türkçe kalır. */
const govdeBindir = <T extends { body?: string; rendered?: unknown }>(kayit: T, ceviri: { body?: string; rendered?: unknown } | undefined): T =>
  ceviri?.body ? { ...kayit, body: ceviri.body, rendered: ceviri.rendered } : kayit;

export async function getKategoriler(dil: Dil): Promise<Kategori[]> {
  const s = await sozluk(dil);
  return (await getCollection("kategoriler")).map((k) => sozlukBindir(k, s.kategoriler[k.id])).sort(siraya);
}

/** Menü sırası; menuSira'sı olmayanlar sona. */
const menuSirasina = (a: Kategori, b: Kategori) =>
  (a.data.menuSira ?? Infinity) - (b.data.menuSira ?? Infinity) || a.data.sira - b.data.sira;

/** Kurumlar menüsündeki kategoriler (menuSira'sı olanlar), menü sırasıyla. */
export async function getMenuKategorileri(dil: Dil): Promise<Kategori[]> {
  return (await getKategoriler(dil)).filter((k) => k.data.menuSira !== undefined).sort(menuSirasina);
}

/** Öne çıkanlar önce, sonra ada göre (Türkçe alfabe). */
function compareAktor(a: Aktor, b: Aktor): number {
  return Number(b.data.oneCikan) - Number(a.data.oneCikan) || collator.compare(a.data.ad, b.data.ad);
}

/** En az bir aktörü olan kategoriler ve aktörleri. Kategori sayfaları bundan üretilir. */
async function getAktorler(dil: Dil): Promise<Aktor[]> {
  const [aktorler, cevir, s] = await Promise.all([getCollection("aktorler"), ceviriler("aktorlerEn", dil), sozluk(dil)]);
  if (dil === "tr") return aktorler;
  return aktorler.map((aktor) => {
    const en = cevir.get(aktor.id);
    const d = aktor.data;
    const e = en?.data;
    return govdeBindir(
      {
        ...aktor,
        data: {
          ...d,
          konum: e?.konum ?? d.konum,
          uzmanlik: e?.uzmanlik ?? d.uzmanlik,
          surdurulebilirlik: e?.surdurulebilirlik ?? d.surdurulebilirlik,
          kisiler: e?.kisiler ?? d.kisiler,
          etiketler: e?.etiketler ?? etiketleriCevir(d.etiketler, s),
          yonetim: d.yonetim?.map((y, i) => ({ ...y, ...e?.yonetim?.[i] })),
          capaFirmalar: d.capaFirmalar && { ...d.capaFirmalar, not: e?.capaFirmalarNot ?? d.capaFirmalar.not },
        },
      },
      en,
    );
  });
}

export async function getAktorGruplari(dil: Dil): Promise<AktorGrubu[]> {
  const [kategoriler, aktorler] = await Promise.all([getKategoriler(dil), getAktorler(dil)]);
  const gruplar = kategoriler
    .map((kategori) => ({
      kategori,
      aktorler: aktorler.filter((a) => a.data.kategori === kategori.id).sort(compareAktor),
    }))
    .filter((g) => g.aktorler.length > 0);

  const yollar = new Set<string>();
  for (const { kategori } of gruplar) {
    if (yollar.has(kategori.data.yol)) {
      throw new Error(`kategoriler.yaml: "${kategori.data.yol}" yolu birden fazla aktör kategorisinde kullanılmış.`);
    }
    yollar.add(kategori.data.yol);
  }
  return gruplar;
}

/** Kurumlar sayfası için: aktör grupları menü sırasıyla. */
export async function getKurumGruplari(dil: Dil): Promise<AktorGrubu[]> {
  return (await getAktorGruplari(dil)).sort((a, b) => menuSirasina(a.kategori, b.kategori));
}

export async function getAktor(id: string, dil: Dil): Promise<{ aktor: Aktor; kategori: Kategori }> {
  for (const { kategori, aktorler } of await getAktorGruplari(dil)) {
    const aktor = aktorler.find((a) => a.id === id);
    if (aktor) return { aktor, kategori };
  }
  throw new Error(`"${id}" aktörü bulunamadı (src/content/aktorler/**/${id}.md).`);
}

/** Kategori sayfasının başlığı; tanımlı değilse kategori adı. */
export const kategoriBasligi = (kategori: Kategori) => kategori.data.baslik ?? kategori.data.ad;

export const kategoriYolu = (kategori: Kategori, dil: Dil) => yol(`/${kategori.data.yol}/`, dil);
export const aktorYolu = (kategori: Kategori, aktor: Aktor, dil: Dil) => yol(`/${kategori.data.yol}/${aktor.id}/`, dil);
/** Sitede indirilebilen genel Excel (src/pages/indir/; üretim kodu lib/veri-excel.ts). Yalnızca Türkçe. */
export const genelExcelYolu = () => yol("/indir/ankara-surdurulebilirlik-haritasi.xlsx");
/** Kendi sayfası olmayan kayıtlar (akademisyen, takvim, yatırım) için kategori sayfasındaki satırı. */
export const kayitYolu = (kategori: Kategori, id: string, dil: Dil) => yol(`/${kategori.data.yol}/#${id}`, dil);

/** Aktörün aramada eşleşeceği tüm metin. `alanlar`: aktorAlanlari() sonucu; "hidrojen" araması alanı Hidrojen olanları da bulur. */
export function aktorAramaMetni(aktor: Aktor, alanlar: Alan[]): string {
  const d = aktor.data;
  return searchKey(
    d.ad,
    d.konum,
    aktor.body,
    d.etiketler,
    alanlar.map((a) => a.data.ad),
    d.kisiler,
    d.uzmanlik,
    d.surdurulebilirlik,
  );
}

// Faaliyet alanları

export async function getAlanlar(dil: Dil): Promise<Alan[]> {
  const s = await sozluk(dil);
  return (await getCollection("alanlar")).map((a) => sozlukBindir(a, s.alanlar[a.id])).sort(siraya);
}

/**
 * Kurumun birincil alanı (dosyadaki ilk alan). "Bu alanda kaç kurum var" sorusunun TEK tanımı:
 * alan sayıları, alan filtresi ve haritadaki dilim bundan beslenir. İkincil alanlar yalnızca
 * gösterim ve arama içindir; sayıma ve filtreye girmez. Böylece alan toplamları her yerde
 * kurum sayısına eşittir.
 */
export const birincilAlanId = (aktor: Aktor): string => aktor.data.alanlar[0]!; // şema en az bir alan istiyor

/** Aktörün alanları, dosyadaki sırayla (ilki birincil alan). */
export async function aktorAlanlari(aktor: Aktor, dil: Dil): Promise<Alan[]> {
  const alanlar = idSozlugu(await getAlanlar(dil));
  return aktor.data.alanlar.map((id) => alanlar.get(id)!);
}

/** Kurumlar sayfasını bu alana süzülmüş açan adres. */
export const alanYolu = (alan: Alan, dil: Dil) => yol(`/kurumlar/?alan=${alan.id}`, dil);

/** Listedeki aktörlerin birincil alanlarına göre sayıları; alan sırasıyla, boşlar hariç. */
export async function alanSayilari(aktorler: Aktor[], dil: Dil): Promise<{ alan: Alan; sayi: number }[]> {
  const sayilar = (await getAlanlar(dil))
    .map((alan) => ({ alan, sayi: aktorler.filter((a) => birincilAlanId(a) === alan.id).length }))
    .filter((x) => x.sayi > 0);
  // Değişmez kural: her kurum tam bir alanda sayılır. Tutmazsa sayım tanımı bir yerde bozulmuştur.
  const toplam = sayilar.reduce((n, x) => n + x.sayi, 0);
  if (toplam !== aktorler.length) {
    throw new Error(`Alan sayıları (${toplam}) kurum sayısını (${aktorler.length}) tutmuyor; birincilAlanId() tanımına bakın.`);
  }
  return sayilar;
}

// Akademisyenler

/** Üniversite adları özel isimdir; her dilde Türkçe. */
export async function getUniversiteler(): Promise<Universite[]> {
  return (await getCollection("universiteler")).sort(siraya);
}

/** Üniversite sırasıyla, her üniversitede ada göre. */
export async function getAkademisyenler(dil: Dil): Promise<Akademisyen[]> {
  const [universiteler, liste, cevir, s] = await Promise.all([
    getUniversiteler(),
    getCollection("akademisyenler"),
    ceviriler("akademisyenlerEn", dil),
    sozluk(dil),
  ]);
  const akademisyenler =
    dil === "tr"
      ? liste
      : liste.map((a) => {
          const en = cevir.get(a.id);
          const d = a.data;
          return govdeBindir(
            {
              ...a,
              data: {
                ...d,
                unvan: s.unvanlar[d.unvan] ?? d.unvan,
                birim: en?.data.birim ?? s.birimler[d.birim] ?? d.birim,
                etiketler: en?.data.etiketler ?? etiketleriCevir(d.etiketler, s),
              },
            },
            en,
          );
        });
  const sira = new Map(universiteler.map((u) => [u.id, u.data.sira]));
  return akademisyenler.sort(
    (a, b) => sira.get(a.data.universite)! - sira.get(b.data.universite)! || collator.compare(a.data.ad, b.data.ad),
  );
}

export const akademisyenTamAdi = (a: Akademisyen) => `${a.data.unvan} ${a.data.ad}`;

export function akademisyenAramaMetni(a: Akademisyen, universite: Universite): string {
  const d = a.data;
  return searchKey(d.unvan, d.ad, universite.data.ad, d.birim, a.body, d.etiketler);
}

// Takvim

/** Başlangıç tarihine göre. Durum sırası tarayıcıda (güncel tarihle) belirlenir. */
export async function getTakvim(dil: Dil): Promise<TakvimKaydi[]> {
  const [liste, cevir] = await Promise.all([getCollection("takvim"), ceviriler("takvimEn", dil)]);
  return liste
    .map((k) => sozlukBindir(k, cevir.get(k.id)?.data))
    .sort((a, b) => a.data.baslangic.getTime() - b.data.baslangic.getTime());
}

export function takvimAramaMetni(x: TakvimKaydi): string {
  return searchKey(x.data.ad, x.data.duzenleyen, x.data.aciklama);
}

// Yatırımlar

export async function getYatirimTurleri(dil: Dil): Promise<YatirimTuru[]> {
  const s = await sozluk(dil);
  return (await getCollection("yatirimTurleri")).map((t) => sozlukBindir(t, s.yatirimTurleri[t.id])).sort(siraya);
}

/** Tür sırasıyla, her türde en yeni önce (tarihsizler sonda). */
export async function getYatirimlar(dil: Dil): Promise<Yatirim[]> {
  const [turler, liste, cevir] = await Promise.all([getYatirimTurleri(dil), getCollection("yatirimlar"), ceviriler("yatirimlarEn", dil)]);
  const yatirimlar = liste.map((y) => sozlukBindir(y, cevir.get(y.id)?.data));
  const sira = new Map(turler.map((t) => [t.id, t.data.sira]));
  return yatirimlar.sort(
    (a, b) => sira.get(a.data.tur)! - sira.get(b.data.tur)! || (b.data.tarih ?? "").localeCompare(a.data.tarih ?? ""),
  );
}

export function yatirimAramaMetni(x: Yatirim, tur: YatirimTuru): string {
  const d = x.data;
  return searchKey(d.ad, tur.data.ad, d.yatirimci, d.tutar, d.aciklama);
}

export async function getSektorYatirimlari(dil: Dil) {
  const s = await sozluk(dil);
  return (await getCollection("sektorYatirimlari")).map((x) => sozlukBindir(x, s.sektorYatirimlari[x.id])).sort((a, b) => b.data.tutarMilyonDolar - a.data.tutarMilyonDolar);
}

// İş birlikleri

export async function getIsbirligiTurleri(dil: Dil): Promise<IsbirligiTuru[]> {
  const s = await sozluk(dil);
  return (await getCollection("isbirligiTurleri")).map((t) => sozlukBindir(t, s.isbirligiTurleri[t.id])).sort(siraya);
}

/** Tür sırasıyla, her türde en yeni önce. */
export async function getIsbirlikleri(dil: Dil): Promise<Isbirligi[]> {
  const [turler, ham, cevir, s] = await Promise.all([
    getIsbirligiTurleri(dil),
    getCollection("isbirlikleri"),
    ceviriler("isbirlikleriEn", dil),
    sozluk(dil),
  ]);
  const liste =
    dil === "tr"
      ? ham
      : ham.map((x) => {
          const e = cevir.get(x.id)?.data;
          return {
            ...x,
            data: { ...x.data, aciklama: e?.aciklama ?? x.data.aciklama, etiketler: e?.etiketler ?? etiketleriCevir(x.data.etiketler, s) },
          };
        });
  const sira = new Map(turler.map((t) => [t.id, t.data.sira]));
  return liste.sort((a, b) => sira.get(a.data.tur)! - sira.get(b.data.tur)! || (b.data.yil ?? 0) - (a.data.yil ?? 0));
}

export type IsbirligiTarafi = Isbirligi["data"]["taraflar"][number];

/** Ekranda gösterilecek taraf: ad ve (kurum ya da üniversiteyse) bağlantı. */
export interface CozulmusTaraf {
  ad: string;
  yol?: string;
}

/** Kurum tarafının adı kurum dosyasından gelir; üniversite akademisyen rehberine süzülmüş haline bağlanır. */
export async function tarafCoz(taraf: IsbirligiTarafi, dil: Dil): Promise<CozulmusTaraf> {
  if (taraf.aktor) {
    const { aktor, kategori } = await getAktor(taraf.aktor, dil);
    return { ad: aktor.data.ad, yol: aktorYolu(kategori, aktor, dil) };
  }
  if (taraf.universite) {
    const universite = (await getUniversiteler()).find((u) => u.id === taraf.universite)!;
    return { ad: universite.data.ad, yol: yol(`/akademisyenler/?universite=${universite.id}`, dil) };
  }
  return { ad: taraf.ad! };
}

export const taraflariCoz = (x: Isbirligi, dil: Dil) => Promise.all(x.data.taraflar.map((t) => tarafCoz(t, dil)));

export function isbirligiAramaMetni(x: Isbirligi, taraflar: CozulmusTaraf[]): string {
  return searchKey(taraflar.map((t) => t.ad), x.data.aciklama, x.data.etiketler);
}

// Sayfa metinleri ve ana sayfa

/** Sayfa metni; İngilizcesi (en/sayfalar/<id>.md) yoksa Türkçesi. */
export async function getSayfa(id: string, dil: Dil): Promise<Sayfa> {
  if (dil === "en") {
    const en = (await getCollection("sayfalarEn")).find((s) => s.id === id);
    if (en) return { ...en, collection: "sayfalar" };
  }
  const sayfa = (await getCollection("sayfalar")).find((s) => s.id === id);
  if (!sayfa) throw new Error(`src/content/sayfalar/${id}.md bulunamadı.`);
  return sayfa;
}

export async function getOneCikanSayilar(dil: Dil) {
  const s = await sozluk(dil);
  return (await getCollection("oneCikanSayilar")).map((x) => sozlukBindir(x, s.oneCikanSayilar[x.id])).sort(siraya);
}

/** İngilizce çevirisi yazılmış kayıtların kimlikleri (veri kontrolündeki eksik çeviri kuralı için). */
export async function getCevrilmisKimlikler() {
  const kimlikler = async (k: "aktorlerEn" | "akademisyenlerEn" | "takvimEn" | "yatirimlarEn" | "isbirlikleriEn") =>
    (await getCollection(k)).map((x) => x.id);
  const [kurum, akademisyen, takvim, yatirim, isbirligi] = await Promise.all([
    kimlikler("aktorlerEn"),
    kimlikler("akademisyenlerEn"),
    kimlikler("takvimEn"),
    kimlikler("yatirimlarEn"),
    kimlikler("isbirlikleriEn"),
  ]);
  return { kurum, akademisyen, takvim, yatirim, isbirligi };
}

/** Sayfa açıklaması (meta description) için gövdenin ilk ~160 karakteri. */
export function kisaOzet(metin: string | undefined, uzunluk = 160): string | undefined {
  const tek = metin?.replace(/\s+/g, " ").trim();
  if (!tek) return undefined;
  return tek.length <= uzunluk ? tek : `${tek.slice(0, uzunluk - 1).replace(/\s+\S*$/, "")}…`;
}
