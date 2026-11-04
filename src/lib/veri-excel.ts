/*
  Veri paketinden Excel çalışma kitabı. İki kapsam, tek kod (ikisi birbirinden kopamaz):
  - "ic":    ekibin kullandığı tam dosya (src/pages/veri/veri.xlsx.ts): Sorunlar sayfası, uyarı
             sayıları ve her satırda kaynak dosya yolu. Yayınlanmaz.
  - "genel": sitede indirilebilen dosya (src/pages/indir/): iç çalışma notları olmadan.
  Üretilen, salt okunur kopyalardır; düzeltme kaynak dosyada yapılır.
  exceljs yalnızca build sırasında çalışır, siteye JavaScript olarak gitmez.
*/
import ExcelJS from "exceljs";
import type { Sorun } from "./veri-kontrol";
import type { IliskiTuru, VeriPaketi } from "./veri-paketi";

export type ExcelKapsami = "ic" | "genel";

/** Bir sütun: başlık, genişlik ve satırdan değer. `link` verilirse hücre tıklanabilir bağlantı olur. */
interface Sutun<T> {
  baslik: string;
  genislik: number;
  deger: (satir: T) => string | number | boolean | undefined;
  link?: (satir: T) => string | undefined;
  /** Yalnızca iç dosyada (kaynak dosya yolu, uyarı sayısı gibi çalışma notları) */
  ic?: boolean;
}

const SITE = import.meta.env.SITE?.replace(/\/$/, "");
const ILISKI_ADLARI: Record<IliskiTuru, string> = {
  yatirim: "Yatırım",
  isbirligi: "İş birliği",
  takvim: "Takvim",
  akademisyen: "Araştırmacı",
};
const SEVIYE_ADLARI: Record<Sorun["seviye"], string> = { uyari: "Uyarı", bilgi: "Bilgi" };
const SEVIYE_RENKLERI: Record<Sorun["seviye"], string> = { uyari: "FFFFF2CC", bilgi: "FFF2F2F2" };

/** Başlığı kalın ve dondurulmuş, filtresi açık bir tablo sayfası. */
function sayfaEkle<T>(kitap: ExcelJS.Workbook, ad: string, sutunlar: Sutun<T>[], satirlar: T[]) {
  const sayfa = kitap.addWorksheet(ad, { views: [{ state: "frozen", ySplit: 1 }] });
  sayfa.columns = sutunlar.map((s) => ({ header: s.baslik, width: s.genislik }));
  sayfa.getRow(1).font = { bold: true };
  for (const satir of satirlar) {
    const r = sayfa.addRow(sutunlar.map((s) => s.deger(satir) ?? ""));
    sutunlar.forEach((s, i) => {
      const hedef = s.link?.(satir);
      if (hedef) {
        const hucre = r.getCell(i + 1);
        hucre.value = { text: String(hucre.value), hyperlink: hedef };
        hucre.font = { color: { argb: "FF1F6FB2" }, underline: true };
      }
    });
  }
  sayfa.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sutunlar.length } };
  return sayfa;
}

const liste = (x: string[] | undefined) => (x ?? []).join(", ");
/** Kurum sayfasının tam adresi; `url` alt klasörü (base) zaten içerir. Site adresi bilinmiyorsa (yerel build) bağlantı yok. */
const siteLinki = (yol: string) => (SITE ? SITE + yol : undefined);

function ozetSayfasi(kitap: ExcelJS.Workbook, paket: VeriPaketi, sorunlar: Sorun[], kapsam: ExcelKapsami) {
  const ic = kapsam === "ic";
  const sayfa = kitap.addWorksheet("Özet");
  sayfa.columns = [{ width: 28 }, { width: 70 }];
  const satirlar: [string, string | number][] = [
    ["Ankara Sürdürülebilirlik Haritası — veri paketi", ""],
    ["Üretildi", paket.uretildi],
    ["Paket sürümü", paket.surum],
    ["", ""],
    ic
      ? ["Bu dosya üretilmiştir, salt okunurdur.", "Düzeltmeler her satırdaki \"Kaynak dosya\" sütunundaki dosyada yapılır."]
      : ["Kaynak", "Ankara Sürdürülebilirlik Haritası; veriler kurumların açık kaynaklarından derlenmiştir."],
    ["", ""],
    ["Kurum", paket.sayilar.kurumlar!],
    ["Akademisyen", paket.sayilar.akademisyenler!],
    ["Yatırım", paket.sayilar.yatirimlar!],
    ["Takvim kaydı", paket.sayilar.takvim!],
    ["İş birliği", paket.sayilar.isbirlikleri!],
    ["Kayıt → kurum ilişkisi", paket.iliskiler.length],
    ...(ic
      ? ([
          ["", ""],
          ["Uyarı", sorunlar.filter((s) => s.seviye === "uyari").length],
          ["Bilgi", sorunlar.filter((s) => s.seviye === "bilgi").length],
        ] as [string, number | string][])
      : []),
  ];
  for (const s of satirlar) sayfa.addRow(s);
  sayfa.getRow(1).font = { bold: true, size: 14 };
  sayfa.getRow(5).font = { bold: true };
}

/** Çalışma kitabını üretir, .xlsx dosyasının baytlarını döndürür. */
export async function excelKitabi(paket: VeriPaketi, sorunlar: Sorun[], kapsam: ExcelKapsami): Promise<Uint8Array<ArrayBuffer>> {
  const t = paket.tablolar;

  const ad = <K extends "kategoriler" | "alanlar" | "universiteler" | "yatirimTurleri" | "isbirligiTurleri">(tablo: K) => {
    const m = new Map(t[tablo].map((x) => [x.id, String(x.ad)]));
    return (id: string | undefined) => (id ? (m.get(id) ?? id) : "");
  };
  const [kategoriAdi, alanAdi, universiteAdi, yatirimTuruAdi, isbirligiTuruAdi] = [
    ad("kategoriler"),
    ad("alanlar"),
    ad("universiteler"),
    ad("yatirimTurleri"),
    ad("isbirligiTurleri"),
  ];
  const kurumAdi = new Map(t.kurumlar.map((k) => [k.id, k.ad]));
  const iliskiSayisi = (kurum: string, tur: IliskiTuru) =>
    paket.iliskiler.filter((r) => r.kurum === kurum && r.kayitTuru === tur).length;
  const kurumlariOf = <R extends { kurum: string }>(rows: R[], anahtar: keyof R, id: string) =>
    rows.filter((r) => r[anahtar] === id).map((r) => kurumAdi.get(r.kurum) ?? r.kurum);
  const sorunSayisi = (kayitId: string) => sorunlar.filter((s) => s.kayitId === kayitId && s.seviye === "uyari").length;

  const kitap = new ExcelJS.Workbook();
  kitap.creator = "Ankara Sürdürülebilirlik Haritası";
  kitap.created = new Date(paket.uretildi);
  /** Kapsama göre sütunları süzerek sayfa ekler. */
  const ekle = <T,>(ad: string, sutunlar: Sutun<T>[], satirlar: T[]) =>
    sayfaEkle(kitap, ad, kapsam === "ic" ? sutunlar : sutunlar.filter((s) => !s.ic), satirlar);

  ozetSayfasi(kitap, paket, sorunlar, kapsam);

  ekle(
    "Kurumlar",
    [
      { baslik: "Ad", genislik: 32, deger: (k) => k.ad, link: (k) => siteLinki(k.url) },
      { baslik: "Kimlik", genislik: 26, deger: (k) => k.id },
      { baslik: "Kategori", genislik: 22, deger: (k) => kategoriAdi(k.kategori) },
      { baslik: "Konum", genislik: 24, deger: (k) => k.konum },
      { baslik: "Birincil alan", genislik: 26, deger: (k) => alanAdi(k.birincilAlan) },
      {
        baslik: "Diğer alanlar",
        genislik: 30,
        deger: (k) => liste(t.kurumAlanlari.filter((a) => a.kurum === k.id && a.sira > 1).map((a) => alanAdi(a.alan))),
      },
      { baslik: "Yatırım", genislik: 9, deger: (k) => iliskiSayisi(k.id, "yatirim") },
      { baslik: "İş birliği", genislik: 10, deger: (k) => iliskiSayisi(k.id, "isbirligi") },
      { baslik: "Takvim", genislik: 9, deger: (k) => iliskiSayisi(k.id, "takvim") },
      { baslik: "Araştırmacı", genislik: 11, deger: (k) => iliskiSayisi(k.id, "akademisyen") },
      { baslik: "Uyarı", genislik: 8, deger: (k) => sorunSayisi(k.id), ic: true },
      { baslik: "Kaynak", genislik: 30, deger: (k) => k.kaynak, link: (k) => k.kaynak },
      { baslik: "Açıklama", genislik: 60, deger: (k) => k.aciklama },
      { baslik: "Uzmanlık", genislik: 40, deger: (k) => k.uzmanlik },
      { baslik: "Sürdürülebilirlik", genislik: 40, deger: (k) => k.surdurulebilirlik },
      { baslik: "Kişiler", genislik: 30, deger: (k) => k.kisiler },
      { baslik: "Etiketler", genislik: 36, deger: (k) => liste(k.etiketler) },
      { baslik: "Kaynak dosya", genislik: 50, ic: true, deger: (k) => k.kaynakDosya },
    ],
    t.kurumlar,
  );

  ekle(
    "İlişkiler",
    [
      { baslik: "Kayıt türü", genislik: 13, deger: (r) => ILISKI_ADLARI[r.kayitTuru] },
      { baslik: "Kayıt", genislik: 50, deger: (r) => r.kayitAdi },
      { baslik: "Kayıt kimliği", genislik: 36, deger: (r) => r.kayitId },
      { baslik: "Kurum", genislik: 32, deger: (r) => r.kurumAdi },
      { baslik: "Kurum kimliği", genislik: 26, deger: (r) => r.kurum },
    ],
    paket.iliskiler,
  );

  ekle(
    "Yatırımlar",
    [
      { baslik: "Ad", genislik: 40, deger: (y) => y.ad },
      { baslik: "Tür", genislik: 12, deger: (y) => yatirimTuruAdi(y.tur) },
      { baslik: "Tarih", genislik: 10, deger: (y) => y.tarih },
      { baslik: "Tutar", genislik: 14, deger: (y) => y.tutar },
      { baslik: "Yatırım alan kurum(lar)", genislik: 30, deger: (y) => liste(kurumlariOf(t.yatirimKurumlari, "yatirim", y.id)) },
      { baslik: "Yatırımcı", genislik: 40, deger: (y) => y.yatirimci },
      { baslik: "Açıklama", genislik: 60, deger: (y) => y.aciklama },
      { baslik: "Kaynak", genislik: 30, deger: (y) => y.kaynak, link: (y) => y.kaynak },
      { baslik: "Kaynak dosya", genislik: 50, ic: true, deger: (y) => y.kaynakDosya },
    ],
    t.yatirimlar,
  );

  const taraflar = (id: string) => t.isbirligiTaraflari.filter((x) => x.isbirligi === id);
  const tarafAdi = (x: (typeof t.isbirligiTaraflari)[number]) =>
    x.kurum ? (kurumAdi.get(x.kurum) ?? x.kurum) : x.universite ? `${universiteAdi(x.universite)} (üniversite)` : `${x.ad} (düz ad)`;
  const enCokTaraf = Math.max(...t.isbirlikleri.map((x) => taraflar(x.id).length));
  ekle(
    "İş birlikleri",
    [
      { baslik: "Tür", genislik: 22, deger: (x) => isbirligiTuruAdi(x.tur) },
      { baslik: "Yıl", genislik: 7, deger: (x) => x.yil },
      ...Array.from({ length: enCokTaraf }, (_, i) => ({
        baslik: `Taraf ${i + 1}`,
        genislik: 30,
        deger: (x: (typeof t.isbirlikleri)[number]) => {
          const taraf = taraflar(x.id)[i];
          return taraf ? tarafAdi(taraf) : "";
        },
      })),
      { baslik: "Açıklama", genislik: 60, deger: (x) => x.aciklama },
      { baslik: "Etiketler", genislik: 30, deger: (x) => liste(x.etiketler) },
      { baslik: "Kaynak dosya", genislik: 50, ic: true, deger: (x) => x.kaynakDosya },
    ],
    t.isbirlikleri,
  );

  ekle(
    "Takvim",
    [
      { baslik: "Ad", genislik: 44, deger: (x) => x.ad },
      { baslik: "Tür", genislik: 10, deger: (x) => kategoriAdi(x.tur) },
      { baslik: "Başlangıç", genislik: 11, deger: (x) => x.baslangic },
      { baslik: "Bitiş", genislik: 11, deger: (x) => x.bitis },
      { baslik: "Yıllık", genislik: 7, deger: (x) => (x.yillik ? "evet" : "") },
      { baslik: "Durum notu", genislik: 18, deger: (x) => x.durumNotu },
      { baslik: "İlgili kurum(lar)", genislik: 30, deger: (x) => liste(kurumlariOf(t.takvimKurumlari, "takvim", x.id)) },
      { baslik: "Düzenleyen", genislik: 36, deger: (x) => x.duzenleyen },
      { baslik: "Açıklama", genislik: 60, deger: (x) => x.aciklama },
      { baslik: "Kaynak", genislik: 30, deger: (x) => x.kaynak, link: (x) => x.kaynak },
      { baslik: "Kaynak dosya", genislik: 50, ic: true, deger: (x) => x.kaynakDosya },
    ],
    t.takvim,
  );

  ekle(
    "Akademisyenler",
    [
      { baslik: "Unvan", genislik: 14, deger: (a) => a.unvan },
      { baslik: "Ad", genislik: 28, deger: (a) => a.ad },
      { baslik: "Üniversite", genislik: 30, deger: (a) => universiteAdi(a.universite) },
      { baslik: "Birim", genislik: 40, deger: (a) => a.birim },
      { baslik: "Bağlı kurum(lar)", genislik: 28, deger: (a) => liste(kurumlariOf(t.akademisyenKurumlari, "akademisyen", a.id)) },
      { baslik: "Çalışma alanları", genislik: 60, deger: (a) => a.calismaAlanlari },
      { baslik: "Etiketler", genislik: 30, deger: (a) => liste(a.etiketler) },
      { baslik: "Profil", genislik: 30, deger: (a) => a.profil, link: (a) => a.profil },
      { baslik: "Kaynak dosya", genislik: 50, ic: true, deger: (a) => a.kaynakDosya },
    ],
    t.akademisyenler,
  );

  // Sözlükler: tek sayfada, tablo adı sütunuyla
  const sozlukler = (["kategoriler", "alanlar", "universiteler", "yatirimTurleri", "isbirligiTurleri"] as const).flatMap((tablo) =>
    t[tablo].map((kayit) => ({ tablo, kayit })),
  );
  ekle(
    "Sözlükler",
    [
      { baslik: "Sözlük", genislik: 18, deger: (x) => x.tablo },
      { baslik: "Kimlik", genislik: 24, deger: (x) => x.kayit.id },
      { baslik: "Ad", genislik: 36, deger: (x) => String(x.kayit.ad ?? "") },
      { baslik: "Sıra", genislik: 6, deger: (x) => Number(x.kayit.sira) },
      { baslik: "Açıklama", genislik: 60, deger: (x) => (x.kayit.aciklama ? String(x.kayit.aciklama) : "") },
    ],
    sozlukler,
  );

  // Sorunlar yalnızca iç dosyada
  if (kapsam === "ic") {
    const sorunSayfasi = ekle(
      "Sorunlar",
      [
        { baslik: "Seviye", genislik: 8, deger: (s) => SEVIYE_ADLARI[s.seviye] },
        { baslik: "Kural", genislik: 7, deger: (s) => s.kural },
        { baslik: "Kayıt türü", genislik: 12, deger: (s) => s.kayitTuru },
        { baslik: "Kayıt", genislik: 32, deger: (s) => s.kayitAdi },
        { baslik: "Mesaj", genislik: 80, deger: (s) => s.mesaj },
        { baslik: "Kaynak dosya", genislik: 50, ic: true, deger: (s) => s.kaynakDosya },
      ],
      sorunlar,
    );
    sorunlar.forEach((s, i) => {
      sorunSayfasi.getRow(i + 2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SEVIYE_RENKLERI[s.seviye] } };
    });
  }

  return new Uint8Array((await kitap.xlsx.writeBuffer()) as ArrayBuffer);
}
