/*
  Tüm verinin normalize tablolar hâlindeki tek temsili. Excel, JSON ve AI paketi
  (src/pages/veri/) bundan üretilir; böylece üçü birbirinden farklı bilgi gösteremez.

  Tablolar ileride kurulacak veritabanının tablolarına birebir karşılık gelir:
  her kayıt türü bir tablo, her ilişki ayrı bir ilişki tablosu. Alan adları içerik
  dosyalarındakiyle aynıdır (GELISTIRME.md 3.4). Veriye yalnızca content.ts üzerinden
  erişilir; birincil alan, sıralama ve URL kuralları orada tanımlıdır.

  Düzeltme bu tablolarda değil, her satırdaki `kaynakDosya`da yapılır.
*/
import {
  aktorYolu,
  birincilAlanId,
  getAkademisyenler,
  getAktorGruplari,
  getAlanlar,
  getIsbirligiTurleri,
  getIsbirlikleri,
  getKategoriler,
  getTakvim,
  getUniversiteler,
  getYatirimlar,
  getYatirimTurleri,
} from "./content";
import { isoGun } from "./takvim";

/** Paket biçiminin sürümü; tablolar ya da alanlar değişirse artırılır. */
export const VERI_PAKETI_SURUMU = 1;

type Sozluk = { id: string; [alan: string]: unknown };

export interface KurumSatiri {
  id: string;
  ad: string;
  kategori: string;
  konum: string;
  birincilAlan: string;
  uzmanlik?: string;
  surdurulebilirlik?: string;
  kisiler?: string;
  kaynak?: string;
  oneCikan: boolean;
  aciklama: string;
  etiketler: string[];
  url: string;
  kaynakDosya: string;
}

export interface AkademisyenSatiri {
  id: string;
  ad: string;
  unvan: string;
  universite: string;
  birim: string;
  profil?: string;
  calismaAlanlari: string;
  etiketler: string[];
  kaynakDosya: string;
}

export interface YatirimSatiri {
  id: string;
  ad: string;
  tur: string;
  tarih?: string;
  tutar: string;
  yatirimci: string;
  aciklama: string;
  kaynak?: string;
  kaynakDosya: string;
}

export interface TakvimSatiri {
  id: string;
  ad: string;
  tur: string;
  duzenleyen: string;
  baslangic: string;
  bitis: string;
  yillik: boolean;
  durumNotu?: string;
  aciklama: string;
  kaynak?: string;
  kaynakDosya: string;
}

export interface IsbirligiSatiri {
  id: string;
  tur: string;
  yil?: number;
  aciklama: string;
  etiketler: string[];
  kaynakDosya: string;
}

/** Tam olarak biri dolu: kurum, universite ya da ad. */
export interface IsbirligiTarafSatiri {
  isbirligi: string;
  sira: number;
  kurum?: string;
  universite?: string;
  ad?: string;
}

export type IliskiTuru = "yatirim" | "takvim" | "akademisyen" | "isbirligi";

/** Türetilmiş görünüm (veritabanı tablosu değil): her satır bir "kayıt → kurum" bağı. */
export interface IliskiSatiri {
  kayitTuru: IliskiTuru;
  kayitId: string;
  kayitAdi: string;
  kurum: string;
  kurumAdi: string;
}

export interface VeriPaketi {
  surum: number;
  uretildi: string;
  sayilar: Record<string, number>;
  tablolar: {
    kategoriler: Sozluk[];
    alanlar: Sozluk[];
    universiteler: Sozluk[];
    yatirimTurleri: Sozluk[];
    isbirligiTurleri: Sozluk[];
    kurumlar: KurumSatiri[];
    kurumAlanlari: { kurum: string; alan: string; sira: number }[];
    kurumYoneticileri: { kurum: string; sira: number; ad: string; rol: string; ozgecmis?: string; kaynak?: string }[];
    akademisyenler: AkademisyenSatiri[];
    akademisyenKurumlari: { akademisyen: string; kurum: string }[];
    yatirimlar: YatirimSatiri[];
    yatirimKurumlari: { yatirim: string; kurum: string }[];
    takvim: TakvimSatiri[];
    takvimKurumlari: { takvim: string; kurum: string }[];
    isbirlikleri: IsbirligiSatiri[];
    isbirligiTaraflari: IsbirligiTarafSatiri[];
  };
  iliskiler: IliskiSatiri[];
}

const sozluk = (liste: { id: string; data: object }[]): Sozluk[] => liste.map((x) => ({ id: x.id, ...x.data }));
const metin = (govde: string | undefined) => (govde ?? "").trim();
const dosya = (x: { filePath?: string }) => x.filePath ?? "";

export async function veriPaketi(): Promise<VeriPaketi> {
  const [kategoriler, alanlar, universiteler, yatirimTurleri, isbirligiTurleri, gruplar, akademisyenler, yatirimlar, takvim, isbirlikleri] =
    await Promise.all([
      getKategoriler(),
      getAlanlar(),
      getUniversiteler(),
      getYatirimTurleri(),
      getIsbirligiTurleri(),
      getAktorGruplari(),
      getAkademisyenler(),
      getYatirimlar(),
      getTakvim(),
      getIsbirlikleri(),
    ]);

  // Kurumlar (kategori sırasıyla, kategori içinde sitedeki sırayla)
  const kurumlar: KurumSatiri[] = gruplar.flatMap(({ kategori, aktorler }) =>
    aktorler.map((aktor) => {
      const d = aktor.data;
      return {
        id: aktor.id,
        ad: d.ad,
        kategori: kategori.id,
        konum: d.konum,
        birincilAlan: birincilAlanId(aktor),
        uzmanlik: d.uzmanlik,
        surdurulebilirlik: d.surdurulebilirlik,
        kisiler: d.kisiler,
        kaynak: d.kaynak,
        oneCikan: d.oneCikan,
        aciklama: metin(aktor.body),
        etiketler: d.etiketler,
        url: aktorYolu(kategori, aktor),
        kaynakDosya: dosya(aktor),
      };
    }),
  );
  const aktorler = gruplar.flatMap((g) => g.aktorler);
  const kurumAdi = new Map(kurumlar.map((k) => [k.id, k.ad]));

  const kurumAlanlari = aktorler.flatMap((a) => a.data.alanlar.map((alan, i) => ({ kurum: a.id, alan, sira: i + 1 })));
  const kurumYoneticileri = aktorler.flatMap((a) =>
    (a.data.yonetim ?? []).map((y, i) => ({ kurum: a.id, sira: i + 1, ...y })),
  );

  const akademisyenSatirlari: AkademisyenSatiri[] = akademisyenler.map((a) => ({
    id: a.id,
    ad: a.data.ad,
    unvan: a.data.unvan,
    universite: a.data.universite,
    birim: a.data.birim,
    profil: a.data.profil,
    calismaAlanlari: metin(a.body),
    etiketler: a.data.etiketler,
    kaynakDosya: dosya(a),
  }));
  const akademisyenKurumlari = akademisyenler.flatMap((a) => a.data.aktorler.map((kurum) => ({ akademisyen: a.id, kurum })));

  const yatirimSatirlari: YatirimSatiri[] = yatirimlar.map((y) => {
    const { aktorler: _, ...d } = y.data;
    return { id: y.id, ...d, kaynakDosya: dosya(y) };
  });
  const yatirimKurumlari = yatirimlar.flatMap((y) => y.data.aktorler.map((kurum) => ({ yatirim: y.id, kurum })));

  const takvimSatirlari: TakvimSatiri[] = takvim.map((t) => {
    const { aktorler: _, baslangic, bitis, ...d } = t.data;
    return { id: t.id, ...d, baslangic: isoGun(baslangic), bitis: isoGun(bitis), kaynakDosya: dosya(t) };
  });
  const takvimKurumlari = takvim.flatMap((t) => t.data.aktorler.map((kurum) => ({ takvim: t.id, kurum })));

  const isbirligiSatirlari: IsbirligiSatiri[] = isbirlikleri.map((x) => ({
    id: x.id,
    tur: x.data.tur,
    yil: x.data.yil,
    aciklama: x.data.aciklama,
    etiketler: x.data.etiketler,
    kaynakDosya: dosya(x),
  }));
  const isbirligiTaraflari: IsbirligiTarafSatiri[] = isbirlikleri.flatMap((x) =>
    x.data.taraflar.map((t, i) => ({
      isbirligi: x.id,
      sira: i + 1,
      ...(t.aktor ? { kurum: t.aktor } : t.universite ? { universite: t.universite } : { ad: t.ad }),
    })),
  );

  // Türetilmiş: tüm "kayıt → kurum" bağları tek listede
  const universiteAdi = new Map(universiteler.map((u) => [u.id, u.data.ad]));
  const iliski = (kayitTuru: IliskiTuru, kayitId: string, kayitAdi: string, kurum: string): IliskiSatiri => ({
    kayitTuru,
    kayitId,
    kayitAdi,
    kurum,
    kurumAdi: kurumAdi.get(kurum)!,
  });
  const yatirimAdi = new Map(yatirimlar.map((y) => [y.id, y.data.ad]));
  const takvimAdi = new Map(takvim.map((t) => [t.id, t.data.ad]));
  const akademisyenAdi = new Map(akademisyenler.map((a) => [a.id, `${a.data.unvan} ${a.data.ad}`]));
  const tarafAdi = (t: IsbirligiTarafSatiri) => (t.kurum ? kurumAdi.get(t.kurum) : t.universite ? universiteAdi.get(t.universite) : t.ad);
  const isbirligiAdi = new Map(
    isbirlikleri.map((x) => [x.id, isbirligiTaraflari.filter((t) => t.isbirligi === x.id).map(tarafAdi).join(" ⟷ ")]),
  );
  const iliskiler: IliskiSatiri[] = [
    ...yatirimKurumlari.map((r) => iliski("yatirim", r.yatirim, yatirimAdi.get(r.yatirim)!, r.kurum)),
    ...isbirligiTaraflari
      .filter((t) => t.kurum)
      .map((t) => iliski("isbirligi", t.isbirligi, isbirligiAdi.get(t.isbirligi)!, t.kurum!)),
    ...takvimKurumlari.map((r) => iliski("takvim", r.takvim, takvimAdi.get(r.takvim)!, r.kurum)),
    ...akademisyenKurumlari.map((r) => iliski("akademisyen", r.akademisyen, akademisyenAdi.get(r.akademisyen)!, r.kurum)),
  ];

  const tablolar: VeriPaketi["tablolar"] = {
    kategoriler: sozluk(kategoriler),
    alanlar: sozluk(alanlar),
    universiteler: sozluk(universiteler),
    yatirimTurleri: sozluk(yatirimTurleri),
    isbirligiTurleri: sozluk(isbirligiTurleri),
    kurumlar,
    kurumAlanlari,
    kurumYoneticileri,
    akademisyenler: akademisyenSatirlari,
    akademisyenKurumlari,
    yatirimlar: yatirimSatirlari,
    yatirimKurumlari,
    takvim: takvimSatirlari,
    takvimKurumlari,
    isbirlikleri: isbirligiSatirlari,
    isbirligiTaraflari,
  };
  tutarlilikDenetle(tablolar, iliskiler);

  return {
    surum: VERI_PAKETI_SURUMU,
    uretildi: new Date().toISOString(),
    sayilar: Object.fromEntries(Object.entries(tablolar).map(([ad, satirlar]) => [ad, satirlar.length])),
    tablolar,
    iliskiler,
  };
}

/**
 * Paketin kendi içinde tutarlı olduğunu denetler; tutmazsa build durur. Şema tek tek kayıtları
 * denetler, bu ise tablolar arası kuralları: ilişkilerin işaret ettiği kurum var mı, her kurumun
 * tam bir birincil alanı var mı ve kurum tablosundakiyle aynı mı.
 */
function tutarlilikDenetle(t: VeriPaketi["tablolar"], iliskiler: IliskiSatiri[]) {
  const hatalar: string[] = [];
  const kurumIdleri = new Set(t.kurumlar.map((k) => k.id));
  for (const r of iliskiler) {
    if (!kurumIdleri.has(r.kurum)) hatalar.push(`${r.kayitTuru} ${r.kayitId}: "${r.kurum}" kurumu yok`);
  }
  for (const k of t.kurumlar) {
    const birinciller = t.kurumAlanlari.filter((a) => a.kurum === k.id && a.sira === 1);
    if (birinciller.length !== 1 || birinciller[0]!.alan !== k.birincilAlan) {
      hatalar.push(`${k.id}: birincil alan tutarsız`);
    }
  }
  const beklenen =
    t.yatirimKurumlari.length + t.takvimKurumlari.length + t.akademisyenKurumlari.length + t.isbirligiTaraflari.filter((x) => x.kurum).length;
  if (iliskiler.length !== beklenen) hatalar.push(`ilişki görünümü ${iliskiler.length} satır, beklenen ${beklenen}`);
  if (hatalar.length) throw new Error(`Veri paketi tutarsız:\n- ${hatalar.join("\n- ")}`);
}
