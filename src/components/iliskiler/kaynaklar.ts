/*
  Kurum sayfasındaki "ilgili kayıtlar" bölümleri. Her kaynak bir içerik türüne
  bakar ve verilen kuruma bağlı kayıtları bir bölüm olarak döndürür. Kurum
  sayfası yalnızca bu arayüzü tanır; kaydın yatırım mı iş birliği mi olduğunu
  bilmez (harita/kaynaklar.ts ile aynı desen).

  Yeni bir ilişki türü eklemek: bir kaynak fonksiyonu yazıp ILISKI_KAYNAKLARI
  listesine eklemek. Kurum sayfası değişmez.
*/
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import {
  getAkademisyenler,
  getIsbirligiTurleri,
  getIsbirlikleri,
  getKategoriler,
  getTakvim,
  getUniversiteler,
  getYatirimlar,
  getYatirimTurleri,
  idSozlugu,
} from "../../lib/content";
import type { Dil } from "../../lib/dil";
import { metinler } from "../../i18n";
import AkademisyenSatiri from "../satirlar/AkademisyenSatiri.astro";
import IsbirligiKarti from "../satirlar/IsbirligiKarti.astro";
import TakvimSatiri from "../satirlar/TakvimSatiri.astro";
import YatirimSatiri from "../satirlar/YatirimSatiri.astro";

export interface IliskiBolumu {
  baslik: string;
  /** Sayının yanındaki birim: "3 kayıt" (dilde ve sayıya göre çekimli) */
  birim: string;
  /** Satırlar alt alta liste, kartlar ızgara olarak çizilir */
  duzen: "liste" | "kartlar";
  ogeler: { Bilesen: AstroComponentFactory; props: Record<string, unknown> }[];
}

type IliskiKaynagi = (aktorId: string, dil: Dil) => Promise<IliskiBolumu>;

const yatirimlar: IliskiKaynagi = async (aktorId, dil) => {
  const [liste, turler] = await Promise.all([getYatirimlar(dil), getYatirimTurleri(dil).then(idSozlugu)]);
  const ilgili = liste.filter((y) => y.data.aktorler.includes(aktorId));
  const t = metinler(dil);
  return {
    baslik: t.iliskiler.yatirimlar,
    birim: t.birim.kayit(ilgili.length),
    duzen: "liste",
    ogeler: ilgili
      .map((yatirim) => ({ Bilesen: YatirimSatiri, props: { yatirim, tur: turler.get(yatirim.data.tur)! } })),
  };
};

const isbirlikleri: IliskiKaynagi = async (aktorId, dil) => {
  const [liste, turler] = await Promise.all([getIsbirlikleri(dil), getIsbirligiTurleri(dil).then(idSozlugu)]);
  const ilgili = liste.filter((x) => x.data.taraflar.some((taraf) => taraf.aktor === aktorId));
  const t = metinler(dil);
  return {
    baslik: t.iliskiler.isbirlikleri,
    birim: t.birim.kayit(ilgili.length),
    duzen: "kartlar",
    ogeler: ilgili
      .map((isbirligi) => ({ Bilesen: IsbirligiKarti, props: { isbirligi, tur: turler.get(isbirligi.data.tur)! } })),
  };
};

const takvim: IliskiKaynagi = async (aktorId, dil) => {
  const [liste, kategoriler] = await Promise.all([getTakvim(dil), getKategoriler(dil).then(idSozlugu)]);
  const ilgili = liste.filter((k) => k.data.aktorler.includes(aktorId));
  const t = metinler(dil);
  return {
    baslik: t.iliskiler.takvim,
    birim: t.birim.kayit(ilgili.length),
    duzen: "liste",
    ogeler: ilgili
      .map((kayit) => ({ Bilesen: TakvimSatiri, props: { kayit, kategori: kategoriler.get(kayit.data.tur)! } })),
  };
};

const arastirmacilar: IliskiKaynagi = async (aktorId, dil) => {
  const [liste, universiteler] = await Promise.all([getAkademisyenler(dil), getUniversiteler().then(idSozlugu)]);
  const ilgili = liste.filter((a) => a.data.aktorler.includes(aktorId));
  const t = metinler(dil);
  return {
    baslik: t.iliskiler.arastirmacilar,
    birim: t.birim.kisi(ilgili.length),
    duzen: "liste",
    ogeler: ilgili
      .map((akademisyen) => ({
        Bilesen: AkademisyenSatiri,
        props: { akademisyen, universite: universiteler.get(akademisyen.data.universite)! },
      })),
  };
};

const ILISKI_KAYNAKLARI: IliskiKaynagi[] = [yatirimlar, isbirlikleri, takvim, arastirmacilar];

/** Boş olmayan bölümler, listedeki sırayla. */
export async function iliskiliBolumler(aktorId: string, dil: Dil): Promise<IliskiBolumu[]> {
  return (await Promise.all(ILISKI_KAYNAKLARI.map((kaynak) => kaynak(aktorId, dil)))).filter((b) => b.ogeler.length > 0);
}
