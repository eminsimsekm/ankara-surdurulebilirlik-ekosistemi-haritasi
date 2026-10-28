/*
  Haritanın veri kaynakları. Her kaynak bir içerik türünü ortak `HaritaDugumu`
  biçimine çevirir ve detay panelinde hangi bileşenin gösterileceğini söyler.
  Harita bileşeni yalnızca bu arayüzü tanır; düğümün aktör mü akademisyen mi
  olduğunu bilmez.

  Haritaya yeni bir içerik türü eklemek: bir kaynak fonksiyonu yazıp
  HARITA_KAYNAKLARI listesine eklemek. Harita kodu değişmez.
*/
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import {
  akademisyenAramaMetni,
  aktorAramaMetni,
  aktorYolu,
  getAkademisyenler,
  getAktorGruplari,
  getKategoriler,
  getTakvim,
  getUniversiteler,
  getYatirimlar,
  getYatirimTurleri,
  idSozlugu,
  kayitYolu,
  takvimAramaMetni,
  yatirimAramaMetni,
  type Kategori,
} from "../../lib/content";
import { yol } from "../../lib/yol";
import AkademisyenDetay from "../detay/AkademisyenDetay.astro";
import AktorDetay from "../detay/AktorDetay.astro";
import TakvimDetay from "../detay/TakvimDetay.astro";
import YatirimDetay from "../detay/YatirimDetay.astro";

export interface HaritaDugumu {
  /** Haritada benzersiz: "<kaynak>:<kayıt id>" */
  id: string;
  /** kategoriler.yaml anahtarı: dilimi ve rengi belirler */
  kategori: string;
  ad: string;
  aramaMetni: string;
  /** Sayfa açıldığında seçili gelecek düğüm adayı */
  oneCikan?: boolean;
  detay: { Bilesen: AstroComponentFactory; props: Record<string, unknown> };
}

type HaritaKaynagi = () => Promise<HaritaDugumu[]>;

export const aktorDugumId = (aktorId: string) => `aktor:${aktorId}`;
/** Haritayı verilen düğüm seçili olarak açan adres. */
export const haritadaGosterYolu = (dugumId: string) => yol(`/?secim=${encodeURIComponent(dugumId)}`);

async function kategoriBul(id: string): Promise<Kategori> {
  const kategori = (await getKategoriler()).find((k) => k.id === id);
  if (!kategori) throw new Error(`Harita: "${id}" kategorisi kategoriler.yaml'da yok.`);
  return kategori;
}

const aktorler: HaritaKaynagi = async () =>
  (await getAktorGruplari()).flatMap(({ kategori, aktorler }) =>
    aktorler.map((aktor) => ({
      id: aktorDugumId(aktor.id),
      kategori: kategori.id,
      ad: aktor.data.ad,
      aramaMetni: aktorAramaMetni(aktor),
      oneCikan: aktor.data.oneCikan,
      detay: { Bilesen: AktorDetay, props: { aktor, kategori, sayfaYolu: aktorYolu(kategori, aktor) } },
    })),
  );

const akademisyenler: HaritaKaynagi = async () => {
  const [liste, universiteler, kategori] = await Promise.all([
    getAkademisyenler(),
    getUniversiteler().then(idSozlugu),
    kategoriBul("akademisyen"),
  ]);
  return liste.map((akademisyen) => {
    const universite = universiteler.get(akademisyen.data.universite)!;
    return {
      id: `akademisyen:${akademisyen.id}`,
      kategori: kategori.id,
      ad: akademisyen.data.ad,
      aramaMetni: akademisyenAramaMetni(akademisyen, universite),
      detay: {
        Bilesen: AkademisyenDetay,
        props: { akademisyen, universite, kategori, sayfaYolu: kayitYolu(kategori, akademisyen.id) },
      },
    };
  });
};

const takvim: HaritaKaynagi = async () => {
  const [liste, kategoriler] = await Promise.all([getTakvim(), getKategoriler().then(idSozlugu)]);
  return liste.map((kayit) => {
    const kategori = kategoriler.get(kayit.data.tur);
    if (!kategori) throw new Error(`Harita: takvim türü "${kayit.data.tur}" kategoriler.yaml'da yok.`);
    return {
      id: `takvim:${kayit.id}`,
      kategori: kategori.id,
      ad: kayit.data.ad,
      aramaMetni: takvimAramaMetni(kayit),
      detay: {
        Bilesen: TakvimDetay,
        props: { kayit, kategori, sayfaYolu: kayitYolu(kategori, kayit.id) },
      },
    };
  });
};

const yatirimlar: HaritaKaynagi = async () => {
  const [liste, turler, kategori] = await Promise.all([
    getYatirimlar(),
    getYatirimTurleri().then(idSozlugu),
    kategoriBul("yatirim"),
  ]);
  return liste.map((yatirim) => {
    const tur = turler.get(yatirim.data.tur)!;
    return {
      id: `yatirim:${yatirim.id}`,
      kategori: kategori.id,
      ad: yatirim.data.ad,
      aramaMetni: yatirimAramaMetni(yatirim, tur),
      detay: {
        Bilesen: YatirimDetay,
        props: { yatirim, tur, kategori, sayfaYolu: kayitYolu(kategori, yatirim.id) },
      },
    };
  });
};

const HARITA_KAYNAKLARI: HaritaKaynagi[] = [aktorler, akademisyenler, takvim, yatirimlar];

export async function haritaDugumleri(): Promise<HaritaDugumu[]> {
  return (await Promise.all(HARITA_KAYNAKLARI.map((kaynak) => kaynak()))).flat();
}
