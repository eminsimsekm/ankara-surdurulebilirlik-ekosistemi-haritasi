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
  aktorAlanlari,
  birincilAlanId,
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
  /** Kategori görünümünde girdiği dilim. Yoksa kategorinin tamamı tek dilimdir. */
  altGrup?: { id: string; etiket: string; sira: number };
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
  Promise.all(
    (await getAktorGruplari()).flatMap(({ kategori, aktorler }) =>
      aktorler.map(async (aktor) => {
        const alanlar = await aktorAlanlari(aktor);
        const birincil = alanlar.find((a) => a.id === birincilAlanId(aktor))!;
        return {
          id: aktorDugumId(aktor.id),
          kategori: kategori.id,
          ad: aktor.data.ad,
          aramaMetni: aktorAramaMetni(aktor, alanlar),
          oneCikan: aktor.data.oneCikan,
          altGrup: { id: birincil.id, etiket: birincil.data.ad, sira: birincil.data.sira },
          detay: { Bilesen: AktorDetay, props: { aktor, kategori, sayfaYolu: aktorYolu(kategori, aktor), ozet: true } },
        };
      }),
    ),
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
      altGrup: { id: universite.id, etiket: universite.data.ad, sira: universite.data.sira },
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
      altGrup: { id: tur.id, etiket: tur.data.ad, sira: tur.data.sira },
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
