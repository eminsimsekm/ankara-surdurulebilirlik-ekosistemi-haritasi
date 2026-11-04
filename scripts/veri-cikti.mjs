// `npm run build`'in son adımı: build'in ürettiği iç veri çıktılarını (dist/veri/) veri-cikti/'ye
// kopyalar ve sorun özetini yazar. Veriyi kendisi yorumlamaz; yalnızca üretilmiş veri.json'u okur (tek kaynak: src/lib/veri-paketi.ts).
// GitHub Actions'ta GITHUB_STEP_SUMMARY tanımlıysa özeti iş özetine de Markdown olarak ekler.
import { appendFileSync, cpSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const KAYNAK = "dist/veri";
const HEDEF = "veri-cikti";

if (!existsSync(`${KAYNAK}/veri.json`)) {
  console.error(`${KAYNAK}/veri.json yok; astro build veri çıktılarını üretmemiş.`);
  process.exit(1);
}

const paket = JSON.parse(readFileSync(`${KAYNAK}/veri.json`, "utf8"));
const { sayilar, sorunlar } = paket;
const say = (seviye) => sorunlar.filter((s) => s.seviye === seviye).length;
const kurallar = Object.entries(
  sorunlar.reduce((m, s) => ({ ...m, [`${s.kural} (${s.seviye})`]: (m[`${s.kural} (${s.seviye})`] ?? 0) + 1 }), {}),
);

const ozet =
  `Veri paketi: ${sayilar.kurumlar} kurum · ${sayilar.akademisyenler} akademisyen · ${sayilar.yatirimlar} yatırım · ` +
  `${sayilar.takvim} takvim · ${sayilar.isbirlikleri} iş birliği · ${paket.iliskiler.length} ilişki`;
const sorunSatiri = `Sorunlar: ${say("uyari")} uyarı, ${say("bilgi")} bilgi`;

cpSync(KAYNAK, HEDEF, { recursive: true });
console.log(`\n${ozet}\n${sorunSatiri}  (${kurallar.map(([k, n]) => `${k}: ${n}`).join(", ")})`);
// Klasör .gitignore'da olduğu için editörün dosya gezgininde görünmeyebilir; tam yolu yaz
console.log(`İç çıktılar: ${resolve(HEDEF)}\n  veri.xlsx · veri.json · veri.md   (açmak için: start ${HEDEF})\n`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const uyarilar = sorunlar.filter((s) => s.seviye === "uyari");
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      "## Veri kontrolü",
      "",
      ozet,
      "",
      `**${sorunSatiri}** — ayrıntı için bu çalıştırmanın \`veri-ciktilari\` artifact'ındaki \`veri.xlsx\` (Sorunlar sayfası).`,
      "",
      "| Kural | Kayıt | Mesaj |",
      "|---|---|---|",
      ...uyarilar.map((s) => `| ${s.kural} | ${s.kayitAdi} | ${s.mesaj.replaceAll("|", "\\|")} |`),
      "",
    ].join("\n"),
  );
}
