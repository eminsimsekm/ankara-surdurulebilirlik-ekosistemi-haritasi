/*
  Sitenin dilleri. Türkçe kökte (/kurumlar/), diğer diller kendi önekiyle (/en/kurumlar/)
  yayınlanır; her dil ayrı statik HTML'dir. Saf modül: Astro ve DOM bilgisi yok.
*/
export const DILLER = ["tr", "en"] as const;
export type Dil = (typeof DILLER)[number];
export const VARSAYILAN_DIL: Dil = "tr";

/** Tarih ve sayı biçimleri için. */
export const YEREL_AYAR: Record<Dil, string> = { tr: "tr-TR", en: "en-GB" };

/** Adres öneki: Türkçe için boş, diğerleri için "en/". */
export const dilOneki = (dil: Dil) => (dil === VARSAYILAN_DIL ? "" : `${dil}/`);

/**
 * getStaticPaths parametresi: `[...dil]` rotasında Türkçe için undefined (kök), diğerleri için dil kodu.
 * Dinamik sayfalar kendi parametreleriyle birleştirir: dilYollari().flatMap(...).
 */
export const dilParametresi = (dil: Dil) => (dil === VARSAYILAN_DIL ? undefined : dil);
export const dilYollari = () => DILLER.map((dil) => ({ params: { dil: dilParametresi(dil) }, props: {} }));

/**
 * Adresin (base dahil) hangi dilde olduğu. `kok`: sitenin yayın kökü ("/" ya da "/alt-klasor/").
 */
export function adrestenDil(pathname: string, kok: string): Dil {
  const kalan = pathname.startsWith(kok) ? pathname.slice(kok.length) : pathname.replace(/^\//, "");
  const ilk = kalan.split("/")[0];
  return DILLER.find((d) => d !== VARSAYILAN_DIL && d === ilk) ?? VARSAYILAN_DIL;
}

/** Aynı sayfanın başka dildeki adresi. */
export function baskaDildeAdres(pathname: string, kok: string, hedef: Dil): string {
  const simdiki = adrestenDil(pathname, kok);
  const kalan = (pathname.startsWith(kok) ? pathname.slice(kok.length) : pathname.replace(/^\//, "")).slice(
    dilOneki(simdiki).length,
  );
  return kok + dilOneki(hedef) + kalan;
}
