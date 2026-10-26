/*
  Radyal ekosistem haritasının geometrisi. Saf fonksiyon: kategorileri ve
  düğüm kimliklerini alır, koordinatları döndürür. Çizim (SVG) ve renkler
  Harita.astro'da; bu dosya hiçbir şey çizmez.

  Her kategori bir dilimdir; dilim genişliği kayıt sayısıyla büyür ama en az
  3 kayıtlık yer kaplar. Düğümler içten dışa halkalara yerleştirilir.
*/

export interface DilimGirdisi {
  kategori: string;
  etiket: string;
  dugumIdleri: string[];
}

export interface Nokta {
  x: number;
  y: number;
}

export interface Yerlesim {
  merkez: Nokta;
  halkalar: number[];
  merkezYaricap: number;
  dilimler: {
    kategori: string;
    cizgi: { bas: Nokta; son: Nokta };
    etiket: Nokta & { metin: string; hiza: "start" | "middle" | "end" };
  }[];
  dugumler: (Nokta & { id: string; kategori: string })[];
}

const C = 360; // merkez
const HALKALAR = [120, 220, 320];
const MERKEZ_YARICAP = 46;
const CIZGI = { ic: 50, dis: 330 };
const ETIKET_YARICAP = 358;
const DUGUM_ARALIGI = 22; // halka üzerinde düğümler arası en az mesafe
const HALKA = { ilk: 78, son: 318, adim: 24 };
const DILIM_DOLULUK = 0.86; // dilimin kenarlarında boşluk kalsın

const yuvarla = (n: number) => Math.round(n * 10) / 10;
const kutupsal = (aci: number, r: number): Nokta => ({
  x: yuvarla(C + Math.cos(aci) * r),
  y: yuvarla(C + Math.sin(aci) * r),
});

export function haritaYerlesimi(girdiler: DilimGirdisi[]): Yerlesim {
  const agirlik = (g: DilimGirdisi) => Math.max(3, g.dugumIdleri.length ** 0.8);
  const toplam = girdiler.reduce((s, g) => s + agirlik(g), 0);

  const dilimler: Yerlesim["dilimler"] = [];
  const dugumler: Yerlesim["dugumler"] = [];
  let a0 = -Math.PI / 2; // saat 12'den başla

  for (const g of girdiler) {
    const aralik = (2 * Math.PI * agirlik(g)) / toplam;
    const orta = a0 + aralik / 2;
    const cos = Math.cos(orta);

    dilimler.push({
      kategori: g.kategori,
      cizgi: { bas: kutupsal(a0, CIZGI.ic), son: kutupsal(a0, CIZGI.dis) },
      etiket: {
        ...kutupsal(orta, ETIKET_YARICAP),
        metin: g.etiket,
        hiza: Math.abs(cos) < 0.3 ? "middle" : cos > 0 ? "start" : "end",
      },
    });

    let i = 0;
    for (let r = HALKA.ilk; i < g.dugumIdleri.length && r <= HALKA.son; r += HALKA.adim) {
      const kapasite = Math.max(1, Math.floor((aralik * r * DILIM_DOLULUK) / DUGUM_ARALIGI));
      const n = Math.min(kapasite, g.dugumIdleri.length - i);
      for (let j = 0; j < n; j++, i++) {
        const aci = a0 + aralik * ((1 - DILIM_DOLULUK) / 2) + aralik * DILIM_DOLULUK * ((j + 0.5) / n);
        dugumler.push({ id: g.dugumIdleri[i]!, kategori: g.kategori, ...kutupsal(aci, r) });
      }
    }
    if (i < g.dugumIdleri.length) {
      throw new Error(`Harita: "${g.kategori}" dilimine ${g.dugumIdleri.length - i} düğüm sığmadı; halka sayısını artırın.`);
    }
    a0 += aralik;
  }

  return { merkez: { x: C, y: C }, halkalar: HALKALAR, merkezYaricap: MERKEZ_YARICAP, dilimler, dugumler };
}

/** SVG viewBox: etiketler dahil haritanın tamamı. */
export const HARITA_VIEWBOX = "-90 -70 900 860";
