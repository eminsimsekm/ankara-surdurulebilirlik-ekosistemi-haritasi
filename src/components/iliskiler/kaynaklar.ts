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
import AkademisyenSatiri from "../satirlar/AkademisyenSatiri.astro";
import IsbirligiKarti from "../satirlar/IsbirligiKarti.astro";
import TakvimSatiri from "../satirlar/TakvimSatiri.astro";
import YatirimSatiri from "../satirlar/YatirimSatiri.astro";

export interface IliskiBolumu {
  baslik: string;
  /** Sayının yanındaki birim: "3 kayıt" */
  birim: string;
  /** Satırlar alt alta liste, kartlar ızgara olarak çizilir */
  duzen: "liste" | "kartlar";
  ogeler: { Bilesen: AstroComponentFactory; props: Record<string, unknown> }[];
}

type IliskiKaynagi = (aktorId: string) => Promise<IliskiBolumu>;

const yatirimlar: IliskiKaynagi = async (aktorId) => {
  const [liste, turler] = await Promise.all([getYatirimlar(), getYatirimTurleri().then(idSozlugu)]);
  return {
    baslik: "Yatırımlar",
    birim: "kayıt",
    duzen: "liste",
    ogeler: liste
      .filter((y) => y.data.aktorler.includes(aktorId))
      .map((yatirim) => ({ Bilesen: YatirimSatiri, props: { yatirim, tur: turler.get(yatirim.data.tur)! } })),
  };
};

const isbirlikleri: IliskiKaynagi = async (aktorId) => {
  const [liste, turler] = await Promise.all([getIsbirlikleri(), getIsbirligiTurleri().then(idSozlugu)]);
  return {
    baslik: "İş birlikleri",
    birim: "kayıt",
    duzen: "kartlar",
    ogeler: liste
      .filter((x) => x.data.taraflar.some((t) => t.aktor === aktorId))
      .map((isbirligi) => ({ Bilesen: IsbirligiKarti, props: { isbirligi, tur: turler.get(isbirligi.data.tur)! } })),
  };
};

const takvim: IliskiKaynagi = async (aktorId) => {
  const [liste, kategoriler] = await Promise.all([getTakvim(), getKategoriler().then(idSozlugu)]);
  return {
    baslik: "Etkinlikler ve çağrılar",
    birim: "kayıt",
    duzen: "liste",
    ogeler: liste
      .filter((k) => k.data.aktorler.includes(aktorId))
      .map((kayit) => ({ Bilesen: TakvimSatiri, props: { kayit, kategori: kategoriler.get(kayit.data.tur)! } })),
  };
};

const arastirmacilar: IliskiKaynagi = async (aktorId) => {
  const [liste, universiteler] = await Promise.all([getAkademisyenler(), getUniversiteler().then(idSozlugu)]);
  return {
    baslik: "Araştırmacılar",
    birim: "kişi",
    duzen: "liste",
    ogeler: liste
      .filter((a) => a.data.aktorler.includes(aktorId))
      .map((akademisyen) => ({
        Bilesen: AkademisyenSatiri,
        props: { akademisyen, universite: universiteler.get(akademisyen.data.universite)! },
      })),
  };
};

const ILISKI_KAYNAKLARI: IliskiKaynagi[] = [yatirimlar, isbirlikleri, takvim, arastirmacilar];

/** Boş olmayan bölümler, listedeki sırayla. */
export async function iliskiliBolumler(aktorId: string): Promise<IliskiBolumu[]> {
  return (await Promise.all(ILISKI_KAYNAKLARI.map((kaynak) => kaynak(aktorId)))).filter((b) => b.ogeler.length > 0);
}
