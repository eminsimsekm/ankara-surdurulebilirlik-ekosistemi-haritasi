/*
  İçeriğe erişim katmanı. Sayfa ve bileşenler koleksiyonlara doğrudan değil,
  buradaki fonksiyonlar üzerinden ulaşır; sıralama ve URL kuralları tek yerde
  durur. İçeriğin kaynağı ileride değişirse (ör. Django API) değişecek yer burası.
*/
import { getCollection, type CollectionEntry } from "astro:content";
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

const collator = new Intl.Collator("tr");

export async function getKategoriler(): Promise<Kategori[]> {
  return (await getCollection("kategoriler")).sort(siraya);
}

/** Menü sırası; menuSira'sı olmayanlar sona. */
const menuSirasina = (a: Kategori, b: Kategori) =>
  (a.data.menuSira ?? Infinity) - (b.data.menuSira ?? Infinity) || a.data.sira - b.data.sira;

/** Kurumlar menüsündeki kategoriler (menuSira'sı olanlar), menü sırasıyla. */
export async function getMenuKategorileri(): Promise<Kategori[]> {
  return (await getKategoriler()).filter((k) => k.data.menuSira !== undefined).sort(menuSirasina);
}

/** Öne çıkanlar önce, sonra ada göre (Türkçe alfabe). */
function compareAktor(a: Aktor, b: Aktor): number {
  return Number(b.data.oneCikan) - Number(a.data.oneCikan) || collator.compare(a.data.ad, b.data.ad);
}

/** En az bir aktörü olan kategoriler ve aktörleri. Kategori sayfaları bundan üretilir. */
export async function getAktorGruplari(): Promise<AktorGrubu[]> {
  const [kategoriler, aktorler] = await Promise.all([getKategoriler(), getCollection("aktorler")]);
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
export async function getKurumGruplari(): Promise<AktorGrubu[]> {
  return (await getAktorGruplari()).sort((a, b) => menuSirasina(a.kategori, b.kategori));
}

export async function getAktor(id: string): Promise<{ aktor: Aktor; kategori: Kategori }> {
  for (const { kategori, aktorler } of await getAktorGruplari()) {
    const aktor = aktorler.find((a) => a.id === id);
    if (aktor) return { aktor, kategori };
  }
  throw new Error(`"${id}" aktörü bulunamadı (src/content/aktorler/**/${id}.md).`);
}

/** Kategori sayfasının başlığı; tanımlı değilse kategori adı. */
export const kategoriBasligi = (kategori: Kategori) => kategori.data.baslik ?? kategori.data.ad;

export const kategoriYolu = (kategori: Kategori) => yol(`/${kategori.data.yol}/`);
export const aktorYolu = (kategori: Kategori, aktor: Aktor) => yol(`/${kategori.data.yol}/${aktor.id}/`);
/** Kendi sayfası olmayan kayıtlar (akademisyen, takvim, yatırım) için kategori sayfasındaki satırı. */
export const kayitYolu = (kategori: Kategori, id: string) => yol(`/${kategori.data.yol}/#${id}`);

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

export async function getAlanlar(): Promise<Alan[]> {
  return (await getCollection("alanlar")).sort(siraya);
}

/**
 * Kurumun birincil alanı (dosyadaki ilk alan). "Bu alanda kaç kurum var" sorusunun TEK tanımı:
 * alan sayıları, alan filtresi ve haritadaki dilim bundan beslenir. İkincil alanlar yalnızca
 * gösterim ve arama içindir; sayıma ve filtreye girmez. Böylece alan toplamları her yerde
 * kurum sayısına eşittir.
 */
export const birincilAlanId = (aktor: Aktor): string => aktor.data.alanlar[0]!; // şema en az bir alan istiyor

/** Aktörün alanları, dosyadaki sırayla (ilki birincil alan). */
export async function aktorAlanlari(aktor: Aktor): Promise<Alan[]> {
  const alanlar = idSozlugu(await getAlanlar());
  return aktor.data.alanlar.map((id) => alanlar.get(id)!);
}

/** Kurumlar sayfasını bu alana süzülmüş açan adres. */
export const alanYolu = (alan: Alan) => yol(`/kurumlar/?alan=${alan.id}`);

/** Listedeki aktörlerin birincil alanlarına göre sayıları; alan sırasıyla, boşlar hariç. */
export async function alanSayilari(aktorler: Aktor[]): Promise<{ alan: Alan; sayi: number }[]> {
  const sayilar = (await getAlanlar())
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

export async function getUniversiteler(): Promise<Universite[]> {
  return (await getCollection("universiteler")).sort(siraya);
}

/** Üniversite sırasıyla, her üniversitede ada göre. */
export async function getAkademisyenler(): Promise<Akademisyen[]> {
  const [universiteler, akademisyenler] = await Promise.all([getUniversiteler(), getCollection("akademisyenler")]);
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
export async function getTakvim(): Promise<TakvimKaydi[]> {
  return (await getCollection("takvim")).sort((a, b) => a.data.baslangic.getTime() - b.data.baslangic.getTime());
}

export function takvimAramaMetni(x: TakvimKaydi): string {
  return searchKey(x.data.ad, x.data.duzenleyen, x.data.aciklama);
}

// Yatırımlar

export async function getYatirimTurleri(): Promise<YatirimTuru[]> {
  return (await getCollection("yatirimTurleri")).sort(siraya);
}

/** Tür sırasıyla, her türde en yeni önce (tarihsizler sonda). */
export async function getYatirimlar(): Promise<Yatirim[]> {
  const [turler, yatirimlar] = await Promise.all([getYatirimTurleri(), getCollection("yatirimlar")]);
  const sira = new Map(turler.map((t) => [t.id, t.data.sira]));
  return yatirimlar.sort(
    (a, b) => sira.get(a.data.tur)! - sira.get(b.data.tur)! || (b.data.tarih ?? "").localeCompare(a.data.tarih ?? ""),
  );
}

export function yatirimAramaMetni(x: Yatirim, tur: YatirimTuru): string {
  const d = x.data;
  return searchKey(d.ad, tur.data.ad, d.yatirimci, d.tutar, d.aciklama);
}

export async function getSektorYatirimlari() {
  return (await getCollection("sektorYatirimlari")).sort((a, b) => b.data.tutarMilyonDolar - a.data.tutarMilyonDolar);
}

// İş birlikleri

export async function getIsbirligiTurleri(): Promise<IsbirligiTuru[]> {
  return (await getCollection("isbirligiTurleri")).sort(siraya);
}

/** Tür sırasıyla, her türde en yeni önce. */
export async function getIsbirlikleri(): Promise<Isbirligi[]> {
  const [turler, liste] = await Promise.all([getIsbirligiTurleri(), getCollection("isbirlikleri")]);
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
export async function tarafCoz(taraf: IsbirligiTarafi): Promise<CozulmusTaraf> {
  if (taraf.aktor) {
    const { aktor, kategori } = await getAktor(taraf.aktor);
    return { ad: aktor.data.ad, yol: aktorYolu(kategori, aktor) };
  }
  if (taraf.universite) {
    const universite = (await getUniversiteler()).find((u) => u.id === taraf.universite)!;
    return { ad: universite.data.ad, yol: yol(`/akademisyenler/?universite=${universite.id}`) };
  }
  return { ad: taraf.ad! };
}

export const taraflariCoz = (x: Isbirligi) => Promise.all(x.data.taraflar.map(tarafCoz));

export function isbirligiAramaMetni(x: Isbirligi, taraflar: CozulmusTaraf[]): string {
  return searchKey(taraflar.map((t) => t.ad), x.data.aciklama, x.data.etiketler);
}

// Sayfa metinleri ve ana sayfa

export async function getSayfa(id: string): Promise<Sayfa> {
  const sayfa = (await getCollection("sayfalar")).find((s) => s.id === id);
  if (!sayfa) throw new Error(`src/content/sayfalar/${id}.md bulunamadı.`);
  return sayfa;
}

export async function getOneCikanSayilar() {
  return (await getCollection("oneCikanSayilar")).sort(siraya);
}

/** Sayfa açıklaması (meta description) için gövdenin ilk ~160 karakteri. */
export function kisaOzet(metin: string | undefined, uzunluk = 160): string | undefined {
  const tek = metin?.replace(/\s+/g, " ").trim();
  if (!tek) return undefined;
  return tek.length <= uzunluk ? tek : `${tek.slice(0, uzunluk - 1).replace(/\s+\S*$/, "")}…`;
}
