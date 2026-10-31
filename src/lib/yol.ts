/*
  Site içi bağlantıların tek giriş noktası. Site bir alt klasörde yayınlanabilir
  (ör. GitHub Pages: /ankara-surdurulebilirlik-ekosistemi-haritasi/); kökten
  yazılmış yollar ("/kurumlar/") buradan geçerek o klasörün önüne eklenir.
  Kökte yayında (Altun Hosting) yol olduğu gibi kalır. Türkçe dışındaki dillerde
  dil öneki de eklenir ("/en/kurumlar/").
*/
import { adrestenDil, baskaDildeAdres, dilOneki, VARSAYILAN_DIL, type Dil } from "./dil";

const KOK = import.meta.env.BASE_URL.replace(/\/?$/, "/");

/** "/kurumlar/" → "<kök>/kurumlar/", İngilizcede "<kök>/en/kurumlar/" */
export const yol = (kokYolu: string, dil: Dil = VARSAYILAN_DIL) => KOK + dilOneki(dil) + kokYolu.replace(/^\//, "");

/** Sayfanın dili; bileşenler Astro.url ile çağırır. */
export const sayfaDili = (url: URL): Dil => adrestenDil(url.pathname, KOK);

/** Bulunulan sayfanın başka dildeki adresi (dil seçici ve hreflang için). */
export const baskaDilde = (url: URL, hedef: Dil) => baskaDildeAdres(url.pathname, KOK, hedef);
