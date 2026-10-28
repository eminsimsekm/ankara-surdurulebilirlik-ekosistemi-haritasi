// @ts-check
import { defineConfig } from "astro/config";

// Statik çıktı (Astro varsayılanı): dist/ klasörü Altun Hosting'e olduğu gibi yüklenir.
// Geçici önizleme GitHub Pages'te alt klasörde yayınlanır; yol ve adres
// .github/workflows/pages.yml'den ortam değişkeni olarak gelir. Yerelde ve
// Altun Hosting'de ikisi de boş kalır, site kökte çalışır.
const base = process.env.BASE_PATH || "/";

/**
 * Markdown gövdelerindeki kökten yazılmış bağlantıları ("/netzero/") `base`
 * altına taşır; bileşenlerdeki bağlantılar src/lib/yol.ts'den geçer.
 * @param {string} kok
 */
const kokBaglantilariniTasi = (kok) => () => {
  const onek = kok.replace(/\/$/, "");
  /** @param {any} dugum */
  const gez = (dugum) => {
    const href = dugum.properties?.href;
    if (onek && typeof href === "string" && href.startsWith("/") && !href.startsWith("//")) {
      dugum.properties.href = onek + href;
    }
    dugum.children?.forEach(gez);
  };
  return gez;
};

export default defineConfig({
  // Alan adı belli olunca doldurulmalı (sitemap ve canonical URL'ler için).
  site: process.env.SITE_URL || undefined,
  base,
  trailingSlash: "ignore",
  build: {
    // /tekmerler/ → /tekmerler/index.html; paylaşımlı hostingde en sorunsuz biçim
    format: "directory",
  },
  markdown: {
    rehypePlugins: [kokBaglantilariniTasi(base)],
  },
});
