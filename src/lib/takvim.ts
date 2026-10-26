/*
  Takvim kayıtlarının tarih ve durum hesapları. Saf fonksiyonlar: build sırasında
  ilk durumu yazmak, tarayıcıda da güncel tarihe göre yeniden hesaplamak için
  aynı kod kullanılır (statik sayfa günler sonra açılsa da durum doğru kalır).

  Tarihler "YYYY-AA-GG" metni olarak karşılaştırılır; saat dilimi kayması olmaz.
*/

export type TakvimTuru = "etkinlik" | "destek";
export type DurumKodu = "acik" | "yaklasiyor" | "yillik" | "kapandi";

export interface DurumGirdisi {
  tur: TakvimTuru;
  baslangic: string; // YYYY-AA-GG
  bitis: string; // YYYY-AA-GG
  yillik: boolean;
  durumNotu?: string;
}

export interface Durum {
  kod: DurumKodu;
  etiket: string;
}

const ETIKET: Record<TakvimTuru, Record<"yaklasiyor" | "acik" | "kapandi", string>> = {
  etkinlik: { yaklasiyor: "Yaklaşıyor", acik: "Sürüyor", kapandi: "Gerçekleşti" },
  destek: { yaklasiyor: "Açılacak", acik: "Başvuruya açık", kapandi: "Kapandı" },
};

export function takvimDurumu(x: DurumGirdisi, bugun: string): Durum {
  if (x.durumNotu) return { kod: "yaklasiyor", etiket: x.durumNotu };
  if (bugun < x.baslangic) return { kod: "yaklasiyor", etiket: ETIKET[x.tur].yaklasiyor };
  if (bugun <= x.bitis) return { kod: "acik", etiket: ETIKET[x.tur].acik };
  if (x.yillik) return { kod: "yillik", etiket: "Yıllık · gelecek dönem" };
  return { kod: "kapandi", etiket: ETIKET[x.tur].kapandi };
}

const DURUM_SIRASI: Record<DurumKodu, number> = { acik: 0, yaklasiyor: 1, yillik: 2, kapandi: 3 };

/** Takvim listesinin sırası: önce açık, sonra yaklaşan…; aynı durumda erken başlayan önce. */
export function takvimSiralamasi(a: { kod: DurumKodu; baslangic: string }, b: { kod: DurumKodu; baslangic: string }) {
  return DURUM_SIRASI[a.kod] - DURUM_SIRASI[b.kod] || a.baslangic.localeCompare(b.baslangic);
}

/** YAML'dan gelen tarih (UTC gece yarısı) → "YYYY-AA-GG". */
export const isoGun = (d: Date) => d.toISOString().slice(0, 10);

/** Türkiye saatine göre bugünün tarihi, "YYYY-AA-GG". */
export const bugun = (simdi = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(simdi);

const gunBicimi = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "22 Eki 2026" ya da "22 Eki 2026 – 23 Eki 2026" */
export function tarihAraligi(baslangic: Date, bitis: Date): string {
  const a = gunBicimi.format(baslangic);
  return isoGun(baslangic) === isoGun(bitis) ? a : `${a} – ${gunBicimi.format(bitis)}`;
}
