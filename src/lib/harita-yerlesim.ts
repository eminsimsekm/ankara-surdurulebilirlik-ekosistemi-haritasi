/*
  Radyal ekosistem haritasının geometrisi. Saf fonksiyon: dilimleri ve
  düğüm kimliklerini alır, koordinatları döndürür. Çizim (SVG) ve renkler
  Harita.astro'da; bu dosya hiçbir şey çizmez.

  Her dilim bir gruptur: genel görünümde kategoriler, kategori görünümünde o
  kategorinin alt grupları (ör. kurumların alanları). Dilim genişliği kayıt
  sayısıyla büyür ama en az 3 kayıtlık yer kaplar. Düğümler içten dışa
  halkalara yerleştirilir. Tek dilim tüm daireyi kaplar ve ayırıcı çizgisi olmaz.
*/

export interface DilimGirdisi {
  anahtar: string;
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
    anahtar: string;
    /** Dilimin başındaki ayırıcı; tek dilimde yok */
    cizgi?: { bas: Nokta; son: Nokta };
    /** Dilimin kapladığı halka parçası (SVG path); üzerine gelince vurgulanır */
    alan: string;
    etiket: Nokta & { metin: string; hiza: "start" | "middle" | "end" };
  }[];
  dugumler: (Nokta & { id: string; anahtar: string })[];
}

const C = 360; // merkez
const HALKALAR = [120, 220, 320];
const MERKEZ_YARICAP = 46;
const CIZGI = { ic: 50, dis: 330 };
const ETIKET_YARICAP = 358;
const DUGUM_ARALIGI = 22; // halka üzerinde düğümler arası en az mesafe
/** Düğüm halkaları: ilk yarıçap, son yarıçap, adım. */
export interface HalkaAyari {
  ilk: number;
  son: number;
  adim: number;
}
const HALKA: HalkaAyari = { ilk: 78, son: 318, adim: 24 };
const DILIM_DOLULUK = 0.86; // dilimin kenarlarında boşluk kalsın

const yuvarla = (n: number) => Math.round(n * 10) / 10;
const kutupsal = (aci: number, r: number): Nokta => ({
  x: yuvarla(C + Math.cos(aci) * r),
  y: yuvarla(C + Math.sin(aci) * r),
});

/** a0'dan a1'e (saat yönünde) iç ve dış yarıçap arasındaki halka parçası. Tam daire için iki yarım yay. */
function halkaParcasi(a0: number, a1: number, ic: number, dis: number): string {
  const yay = (r: number, bas: number, son: number, yon: 0 | 1) => {
    const p = kutupsal(son, r);
    return `A${r} ${r} 0 ${Math.abs(son - bas) > Math.PI ? 1 : 0} ${yon} ${p.x} ${p.y}`;
  };
  const m = (r: number, a: number) => {
    const p = kutupsal(a, r);
    return `M${p.x} ${p.y}`;
  };
  if (a1 - a0 >= 2 * Math.PI - 1e-6) {
    const orta = a0 + Math.PI;
    return `${m(dis, a0)} ${yay(dis, a0, orta, 1)} ${yay(dis, orta, a0 + 2 * Math.PI, 1)}Z ${m(ic, a0)} ${yay(ic, a0, orta, 1)} ${yay(ic, orta, a0 + 2 * Math.PI, 1)}Z`;
  }
  const ic1 = kutupsal(a1, ic);
  return `${m(dis, a0)} ${yay(dis, a0, a1, 1)} L${ic1.x} ${ic1.y} ${yay(ic, a1, a0, 0)}Z`;
}

/**
 * `halka`: düğümlerin yerleştiği halkalar. Az düğümlü görünümlerde (kategori görünümü)
 * daha dıştan başlatılırsa düğümler merkeze yığılmaz, etiketlerine yaklaşır.
 */
export function haritaYerlesimi(girdiler: DilimGirdisi[], halka: HalkaAyari = HALKA): Yerlesim {
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
      anahtar: g.anahtar,
      cizgi: girdiler.length > 1 ? { bas: kutupsal(a0, CIZGI.ic), son: kutupsal(a0, CIZGI.dis) } : undefined,
      alan: halkaParcasi(a0, a0 + aralik, CIZGI.ic, CIZGI.dis),
      etiket: {
        ...kutupsal(orta, ETIKET_YARICAP),
        metin: g.etiket,
        hiza: Math.abs(cos) < 0.3 ? "middle" : cos > 0 ? "start" : "end",
      },
    });

    let i = 0;
    for (let r = halka.ilk; i < g.dugumIdleri.length && r <= halka.son; r += halka.adim) {
      const kapasite = Math.max(1, Math.floor((aralik * r * DILIM_DOLULUK) / DUGUM_ARALIGI));
      const n = Math.min(kapasite, g.dugumIdleri.length - i);
      for (let j = 0; j < n; j++, i++) {
        const aci = a0 + aralik * ((1 - DILIM_DOLULUK) / 2) + aralik * DILIM_DOLULUK * ((j + 0.5) / n);
        dugumler.push({ id: g.dugumIdleri[i]!, anahtar: g.anahtar, ...kutupsal(aci, r) });
      }
    }
    if (i < g.dugumIdleri.length) {
      throw new Error(`Harita: "${g.anahtar}" dilimine ${g.dugumIdleri.length - i} düğüm sığmadı; halka sayısını artırın.`);
    }
    a0 += aralik;
  }

  return { merkez: { x: C, y: C }, halkalar: HALKALAR, merkezYaricap: MERKEZ_YARICAP, dilimler, dugumler };
}

/** SVG viewBox: etiketler dahil haritanın tamamı. */
export const HARITA_VIEWBOX = "-90 -70 900 860";
