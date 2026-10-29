// Tüm veri ve ilişkiler tek okunaklı Markdown dosyasında: bir AI'a (ya da insana) "incele, hataları
// bul" diye verilir. Her kaydın kaynak dosya yolu yazılı; düzeltme o dosyada yapılır, burada değil.
import type { APIRoute } from "astro";
import { sorunlariBul, type Sorun } from "../../lib/veri-kontrol";
import { veriPaketi, type VeriPaketi } from "../../lib/veri-paketi";

const SEVIYE_ADLARI: Record<Sorun["seviye"], string> = { uyari: "uyarı", bilgi: "bilgi" };

/** "anahtar: değer" satırı; değer boşsa satır yazılmaz. */
const alan = (ad: string, deger: string | number | undefined) => (deger === undefined || deger === "" ? [] : [`${ad}: ${deger}`]);

function veriMarkdown(paket: VeriPaketi, sorunlar: Sorun[]): string {
  const t = paket.tablolar;
  const adlar = (tablo: "kategoriler" | "alanlar" | "universiteler" | "yatirimTurleri" | "isbirligiTurleri") =>
    new Map(t[tablo].map((x) => [x.id, String(x.ad)]));
  const [kategori, alanAdi, universite, yatirimTuru, isbirligiTuru] = [
    adlar("kategoriler"),
    adlar("alanlar"),
    adlar("universiteler"),
    adlar("yatirimTurleri"),
    adlar("isbirligiTurleri"),
  ];
  const kurumAdi = new Map(t.kurumlar.map((k) => [k.id, k.ad]));
  const kurumlar = (ids: string[]) => ids.map((id) => `${kurumAdi.get(id) ?? id} (\`${id}\`)`).join(", ");

  const s: string[] = [];
  s.push("# Ankara Sürdürülebilirlik Haritası — veri paketi", "");
  s.push(
    `Üretildi: ${paket.uretildi} · paket sürümü ${paket.surum} · ${t.kurumlar.length} kurum · ${t.akademisyenler.length} akademisyen · ` +
      `${t.yatirimlar.length} yatırım · ${t.takvim.length} takvim kaydı · ${t.isbirlikleri.length} iş birliği · ${paket.iliskiler.length} kayıt→kurum ilişkisi`,
    "",
  );
  s.push(
    "> Bu dosya üretilmiştir, düzenlenmez. Düzeltmeler her kaydın `dosya:` satırındaki kaynak dosyada yapılır.",
    "> Alanların anlamı ve biçimi: README.md \"İçerik ekleme\". Kimlik = dosya adı; ilişkiler kimlikle kurulur.",
    "> Kurumun ilk alanı birincil alandır (sayım, filtre ve haritadaki dilim buna göre).",
    "",
  );

  s.push(`## Sorunlar (${sorunlar.length})`, "");
  for (const x of sorunlar) s.push(`- [${SEVIYE_ADLARI[x.seviye]} ${x.kural}] ${x.kayitAdi}: ${x.mesaj} — dosya: ${x.kaynakDosya}`);
  s.push("");

  s.push(`## Kurumlar (${t.kurumlar.length})`, "");
  let sonKategori = "";
  for (const k of t.kurumlar) {
    if (k.kategori !== sonKategori) {
      s.push(`### ${kategori.get(k.kategori) ?? k.kategori}`, "");
      sonKategori = k.kategori;
    }
    const alanlar = t.kurumAlanlari.filter((a) => a.kurum === k.id).map((a) => alanAdi.get(a.alan) + (a.sira === 1 ? " (birincil)" : ""));
    const iliskiler = (tur: string) => paket.iliskiler.filter((r) => r.kurum === k.id && r.kayitTuru === tur).map((r) => r.kayitAdi);
    const yoneticiler = t.kurumYoneticileri.filter((y) => y.kurum === k.id).map((y) => `${y.ad} (${y.rol})`);
    s.push(`#### ${k.ad} (\`${k.id}\`)`);
    s.push(
      ...[
        `dosya: ${k.kaynakDosya}`,
        `alanlar: ${alanlar.join(", ")}`,
        ...alan("konum", k.konum),
        ...alan("kaynak", k.kaynak),
        ...alan("açıklama", k.aciklama),
        ...alan("uzmanlık", k.uzmanlik),
        ...alan("sürdürülebilirlik", k.surdurulebilirlik),
        ...alan("kişiler", k.kisiler),
        ...alan("yönetim", yoneticiler.join("; ")),
        ...alan("etiketler", k.etiketler.join(", ")),
        ...alan("yatırımlar", iliskiler("yatirim").join("; ")),
        ...alan("iş birlikleri", iliskiler("isbirligi").join("; ")),
        ...alan("takvim", iliskiler("takvim").join("; ")),
        ...alan("araştırmacılar", iliskiler("akademisyen").join("; ")),
      ].map((x) => `- ${x}`),
      "",
    );
  }

  s.push(`## Yatırımlar (${t.yatirimlar.length})`, "");
  for (const y of t.yatirimlar) {
    const ilgili = t.yatirimKurumlari.filter((r) => r.yatirim === y.id).map((r) => r.kurum);
    s.push(
      `- **${y.ad}** (\`${y.id}\`) · ${yatirimTuru.get(y.tur)} · ${y.tarih ?? "tarih yok"} · ${y.tutar} · yatırımcı: ${y.yatirimci}` +
        (ilgili.length ? ` · yatırım alan: ${kurumlar(ilgili)}` : "") +
        ` — dosya: ${y.kaynakDosya}`,
    );
  }
  s.push("");

  s.push(`## İş birlikleri (${t.isbirlikleri.length})`, "");
  for (const x of t.isbirlikleri) {
    const taraflar = t.isbirligiTaraflari
      .filter((r) => r.isbirligi === x.id)
      .map((r) => (r.kurum ? `${kurumAdi.get(r.kurum)} (\`${r.kurum}\`)` : r.universite ? `${universite.get(r.universite)} (üniversite)` : `${r.ad} (düz ad)`));
    s.push(`- **${taraflar.join(" ⟷ ")}** (\`${x.id}\`) · ${isbirligiTuru.get(x.tur)}${x.yil ? ` · ${x.yil}` : ""} — ${x.aciklama} — dosya: ${x.kaynakDosya}`);
  }
  s.push("");

  s.push(`## Takvim (${t.takvim.length})`, "");
  for (const x of t.takvim) {
    const ilgili = t.takvimKurumlari.filter((r) => r.takvim === x.id).map((r) => r.kurum);
    s.push(
      `- **${x.ad}** (\`${x.id}\`) · ${kategori.get(x.tur) ?? x.tur} · ${x.baslangic} – ${x.bitis}${x.yillik ? " · yıllık" : ""} · düzenleyen: ${x.duzenleyen}` +
        (ilgili.length ? ` · ilgili: ${kurumlar(ilgili)}` : "") +
        ` — dosya: ${x.kaynakDosya}`,
    );
  }
  s.push("");

  s.push(`## Akademisyenler (${t.akademisyenler.length})`, "");
  for (const a of t.akademisyenler) {
    const ilgili = t.akademisyenKurumlari.filter((r) => r.akademisyen === a.id).map((r) => r.kurum);
    s.push(
      `- **${a.unvan} ${a.ad}** (\`${a.id}\`) · ${universite.get(a.universite)} · ${a.birim}` +
        (ilgili.length ? ` · merkez: ${kurumlar(ilgili)}` : "") +
        ` — dosya: ${a.kaynakDosya}`,
    );
  }
  s.push("");

  s.push("## Sözlükler", "");
  for (const tablo of ["kategoriler", "alanlar", "universiteler", "yatirimTurleri", "isbirligiTurleri"] as const) {
    s.push(`- ${tablo}: ${t[tablo].map((x) => `\`${x.id}\` ${x.ad}`).join(" · ")}`);
  }
  s.push("");
  return s.join("\n");
}

export const GET: APIRoute = async () => {
  const paket = await veriPaketi();
  return new Response(veriMarkdown(paket, sorunlariBul(paket, new Date())), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
