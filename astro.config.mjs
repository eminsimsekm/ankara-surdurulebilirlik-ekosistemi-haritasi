// @ts-check
import { defineConfig } from "astro/config";

// Statik çıktı (Astro varsayılanı): dist/ klasörü Altun Hosting'e olduğu gibi yüklenir.
// Alan adı belli olunca `site` doldurulmalı (sitemap ve canonical URL'ler için).
export default defineConfig({
  // site: "https://ornek.kav.org.tr",
  trailingSlash: "ignore",
  build: {
    // /tekmerler/ → /tekmerler/index.html; paylaşımlı hostingde en sorunsuz biçim
    format: "directory",
  },
});
