/*
  Site içi bağlantıların tek giriş noktası. Site bir alt klasörde yayınlanabilir
  (ör. GitHub Pages: /ankara-surdurulebilirlik-ekosistemi-haritasi/); kökten
  yazılmış yollar ("/kurumlar/") buradan geçerek o klasörün önüne eklenir.
  Kökte yayında (Altun Hosting) yol olduğu gibi kalır.
*/
const KOK = import.meta.env.BASE_URL.replace(/\/?$/, "/");

/** "/kurumlar/" → "<kök>/kurumlar/" */
export const yol = (kokYolu: string) => KOK + kokYolu.replace(/^\//, "");
