/*
  Veri paketindeki şüpheli kayıtları bulan kurallar. Şema kesin hataları zaten yakalayıp
  build'i durdurur; bunlar yanlış olmayabilir ama bakılması gereken durumlardır ve build'i
  durdurmaz. Excel, JSON ve AI paketi aynı listeyi gösterir.

  Yeni kural eklemek: KURALLAR dizisine bir öğe. Saf fonksiyonlar; Astro'ya ve DOM'a bağımlı değil.
*/
import { searchKey } from "./text";
import type { VeriPaketi } from "./veri-paketi";

export type SorunSeviyesi = "uyari" | "bilgi";

export interface Sorun {
  kural: string;
  seviye: SorunSeviyesi;
  kayitTuru: string;
  kayitId: string;
  kayitAdi: string;
  mesaj: string;
  kaynakDosya: string;
}

export interface Kural {
  kod: string;
  seviye: SorunSeviyesi;
  aciklama: string;
  bul: (paket: VeriPaketi, bugun: Date) => Omit<Sorun, "kural" | "seviye">[];
}

/** Karşılaştırma için ad: aramadaki biçim, harf ve rakam dışı karakterler atılmış. */
const sade = (ad: string) => searchKey(ad).replace(/[^a-z0-9]/g, "");

/** İki metin arasındaki düzenleme mesafesi (Levenshtein). */
function mesafe(a: string, b: string): number {
  let onceki = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const satir = [i];
    for (let j = 1; j <= b.length; j++) {
      satir[j] = Math.min(onceki[j]! + 1, satir[j - 1]! + 1, onceki[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    onceki = satir;
  }
  return onceki[b.length]!;
}

/**
 * Aynı ya da yazım farkı kadar yakın. İzin verilen fark ada göre ölçeklenir (kabaca her 7 harfte 1):
 * "inovat" / "inovest" gibi kısa ve gerçekten farklı adlar yanlış alarm vermez.
 */
const cokBenzer = (a: string, b: string) => {
  const [x, y] = [sade(a), sade(b)];
  const kisa = Math.min(x.length, y.length);
  return x === y || (kisa >= 6 && mesafe(x, y) <= Math.max(1, Math.floor(kisa / 7)));
};

const KISA_ACIKLAMA = 60;
const BOS_DEGERLER = new Set(["", "-", "—"]);

export const KURALLAR: Kural[] = [
  {
    kod: "K01",
    seviye: "uyari",
    aciklama: "Kaynağı olmayan kayıt",
    bul: ({ tablolar: t }) => [
      ...t.kurumlar.filter((x) => !x.kaynak).map((x) => ({ kayitTuru: "kurum", kayitId: x.id, kayitAdi: x.ad, mesaj: "Kaynak bağlantısı yok.", kaynakDosya: x.kaynakDosya })),
      ...t.yatirimlar.filter((x) => !x.kaynak).map((x) => ({ kayitTuru: "yatirim", kayitId: x.id, kayitAdi: x.ad, mesaj: "Kaynak bağlantısı yok.", kaynakDosya: x.kaynakDosya })),
      ...t.takvim.filter((x) => !x.kaynak).map((x) => ({ kayitTuru: "takvim", kayitId: x.id, kayitAdi: x.ad, mesaj: "Kaynak bağlantısı yok.", kaynakDosya: x.kaynakDosya })),
      ...t.akademisyenler.filter((x) => !x.profil).map((x) => ({ kayitTuru: "akademisyen", kayitId: x.id, kayitAdi: `${x.unvan} ${x.ad}`, mesaj: "Akademik profil bağlantısı yok.", kaynakDosya: x.kaynakDosya })),
    ],
  },
  {
    kod: "K02",
    seviye: "uyari",
    aciklama: "Olası tekrar: adı çok benzer iki kurum",
    bul: ({ tablolar: { kurumlar } }) =>
      kurumlar.flatMap((a, i) =>
        kurumlar
          .slice(i + 1)
          .filter((b) => cokBenzer(a.ad, b.ad))
          .map((b) => ({ kayitTuru: "kurum", kayitId: a.id, kayitAdi: a.ad, mesaj: `"${b.ad}" (${b.id}) ile adı çok benzer; aynı kurum olabilir.`, kaynakDosya: a.kaynakDosya })),
      ),
  },
  {
    kod: "K03",
    seviye: "uyari",
    aciklama: "İş birliğinde düz ad olan taraf, haritadaki bir kurumun adına çok benziyor",
    bul: ({ tablolar: t }) =>
      t.isbirligiTaraflari
        .filter((taraf) => taraf.ad)
        .flatMap((taraf) =>
          t.kurumlar
            .filter((k) => cokBenzer(taraf.ad!, k.ad))
            .map((k) => {
              const x = t.isbirlikleri.find((i) => i.id === taraf.isbirligi)!;
              return { kayitTuru: "isbirligi", kayitId: x.id, kayitAdi: taraf.ad!, mesaj: `Taraf "${taraf.ad}" düz ad; "aktor: ${k.id}" olarak bağlanabilir.`, kaynakDosya: x.kaynakDosya };
            }),
        ),
  },
  {
    kod: "K04",
    seviye: "uyari",
    aciklama: `Kurum açıklaması çok kısa (< ${KISA_ACIKLAMA} karakter)`,
    bul: ({ tablolar: { kurumlar } }) =>
      kurumlar
        .filter((x) => x.aciklama.length < KISA_ACIKLAMA)
        .map((x) => ({ kayitTuru: "kurum", kayitId: x.id, kayitAdi: x.ad, mesaj: `Açıklama ${x.aciklama.length} karakter: "${x.aciklama}"`, kaynakDosya: x.kaynakDosya })),
  },
  {
    kod: "K05",
    seviye: "uyari",
    aciklama: "Yatırımın tarihi ya da tutarı yok",
    bul: ({ tablolar: { yatirimlar } }) =>
      yatirimlar
        .filter((x) => !x.tarih || BOS_DEGERLER.has(x.tutar.trim()))
        .map((x) => ({
          kayitTuru: "yatirim",
          kayitId: x.id,
          kayitAdi: x.ad,
          mesaj: [!x.tarih && "tarih yok", BOS_DEGERLER.has(x.tutar.trim()) && "tutar yok"].filter(Boolean).join(", ") + ".",
          kaynakDosya: x.kaynakDosya,
        })),
  },
  {
    kod: "K06",
    seviye: "bilgi",
    aciklama: "Hiç ilişkisi olmayan kurum (yatırım, iş birliği, takvim, araştırmacı yok)",
    bul: ({ tablolar: { kurumlar }, iliskiler }) => {
      const iliskili = new Set(iliskiler.map((r) => r.kurum));
      return kurumlar
        .filter((x) => !iliskili.has(x.id))
        .map((x) => ({ kayitTuru: "kurum", kayitId: x.id, kayitAdi: x.ad, mesaj: "Hiçbir yatırım, iş birliği, takvim kaydı ya da araştırmacıyla bağlı değil.", kaynakDosya: x.kaynakDosya }));
    },
  },
  {
    kod: "K07",
    seviye: "bilgi",
    aciklama: "Tarihi geçmiş, yıllık olmayan takvim kaydı",
    bul: ({ tablolar: { takvim } }, bugun) => {
      const gun = bugun.toISOString().slice(0, 10);
      return takvim
        .filter((x) => !x.yillik && x.bitis < gun)
        .map((x) => ({ kayitTuru: "takvim", kayitId: x.id, kayitAdi: x.ad, mesaj: `${x.bitis} tarihinde bitti; arşivlenebilir ya da güncellenebilir.`, kaynakDosya: x.kaynakDosya }));
    },
  },
  {
    kod: "K08",
    seviye: "bilgi",
    aciklama: "Yalnızca bu kurumda kullanılmış etiketler (etiket temizliği için)",
    bul: ({ tablolar: { kurumlar } }) => {
      const kullanim = new Map<string, number>();
      for (const k of kurumlar) for (const e of new Set(k.etiketler.map((e) => searchKey(e)))) kullanim.set(e, (kullanim.get(e) ?? 0) + 1);
      return kurumlar.flatMap((k) => {
        const tekil = k.etiketler.filter((e) => kullanim.get(searchKey(e)) === 1);
        return tekil.length
          ? [{ kayitTuru: "kurum", kayitId: k.id, kayitAdi: k.ad, mesaj: `Yalnızca bu kurumda: ${tekil.join(", ")}`, kaynakDosya: k.kaynakDosya }]
          : [];
      });
    },
  },
  {
    kod: "K09",
    seviye: "bilgi",
    aciklama: "İngilizce çevirisi olmayan kayıt (sitenin /en/ sürümünde Türkçe görünür)",
    bul: ({ tablolar: t, ingilizce }) => {
      const eksik = <T extends { id: string; kaynakDosya: string }>(
        satirlar: T[],
        cevrilen: string[],
        kayitTuru: string,
        dosya: string,
        ad: (x: T) => string,
      ) => {
        const var_ = new Set(cevrilen);
        return satirlar
          .filter((x) => !var_.has(x.id))
          .map((x) => ({ kayitTuru, kayitId: x.id, kayitAdi: ad(x), mesaj: `src/content/en/${dosya} içinde "${x.id}" yok.`, kaynakDosya: x.kaynakDosya }));
      };
      return [
        ...eksik(t.kurumlar, ingilizce.kurum, "kurum", "aktorler.yaml", (x) => x.ad),
        ...eksik(t.akademisyenler, ingilizce.akademisyen, "akademisyen", "akademisyenler.yaml", (x) => x.ad),
        ...eksik(t.takvim, ingilizce.takvim, "takvim", "takvim.yaml", (x) => x.ad),
        ...eksik(t.yatirimlar, ingilizce.yatirim, "yatirim", "yatirimlar.yaml", (x) => x.ad),
        ...eksik(t.isbirlikleri, ingilizce.isbirligi, "isbirligi", "isbirlikleri.yaml", (x) => x.aciklama.slice(0, 60)),
      ];
    },
  },
];

const SEVIYE_SIRASI: Record<SorunSeviyesi, number> = { uyari: 0, bilgi: 1 };

/** Tüm kuralların bulduğu sorunlar; önce uyarılar, sonra kural ve kayıt adına göre. */
export function sorunlariBul(paket: VeriPaketi, bugun: Date): Sorun[] {
  return KURALLAR.flatMap((k) => k.bul(paket, bugun).map((s) => ({ kural: k.kod, seviye: k.seviye, ...s }))).sort(
    (a, b) =>
      SEVIYE_SIRASI[a.seviye] - SEVIYE_SIRASI[b.seviye] ||
      a.kural.localeCompare(b.kural) ||
      a.kayitAdi.localeCompare(b.kayitAdi, "tr"),
  );
}
