/*
  Arayüz metinleri (İngilizce). Anahtarlar tr.ts ile aynı olmak zorunda.
  Özel isimler (NetZero TEKMER, ODTÜ, TÜBİTAK…) Türkçe kalır.
*/
import type { Metinler } from "./tr";

const cogul = (tekil: string, cok: string) => (n: number) => (n === 1 ? tekil : cok);

export const en: Metinler = {
  siteAdi: "Ankara Sustainability Map",
  siteAciklamasi:
    "Ankara's sustainability ecosystem: technoparks, TEKMERs, startups, academics, investments and support programmes.",
  anaSayfaUst: "Ankara ecosystem",

  tema: { dugme: "Change theme", etiket: "Theme", acik: "Light theme", koyu: "Dark theme" },
  dil: { secici: "Language", tr: "Türkçe", en: "English" },

  menu: {
    bolumler: "Sections",
    kurumKategorileri: "Institution categories",
    harita: "Map",
    kurumlar: "Institutions",
    akademisyenler: "Academics",
    yatirimlar: "Investments",
    takvim: "Calendar",
    isbirlikleri: "Collaborations",
    netzero: "NetZero TEKMER",
    tumu: "All",
  },

  birim: {
    kayit: cogul("record", "records"),
    kisi: cogul("person", "people"),
    kurum: cogul("institution", "institutions"),
    akademisyen: cogul("academic", "academics"),
    kategori: cogul("category", "categories"),
    universite: cogul("university", "universities"),
    isbirligi: cogul("collaboration", "collaborations"),
    islem: cogul("deal", "deals"),
  },

  ortak: {
    tumu: "All",
    ara: "Search…",
    kaynak: "Source",
    akademikProfil: "Academic profile",
    tumAyrintilar: "Full details →",
    ile: "with",
    tarihYok: "—",
  },

  filtre: {
    kategoriFiltresi: "Category filter",
    kategori: "Category",
    alanFiltresi: "Field filter",
    alan: "Field",
    universiteFiltresi: "University filter",
    turFiltresi: "Type filter",
    yatirimTuru: "Investment type",
    isbirligiTuru: "Collaboration type",
  },

  kurumlar: {
    ara: "Search institutions",
    araOrnek: "Search: solar, waste, ODTÜ, battery…",
    excel: "Download as Excel",
    bos: "No institutions match this filter.",
  },
  kategoriSayfasi: {
    ara: (baslik: string) => `Search ${baslik}`,
    araOrnek: "Search: name, topic, location…",
    bos: "No matching records. Try a different word.",
  },
  akademisyenler: {
    ara: "Search academics",
    araOrnek: "Search: hydrogen, perovskite, CO₂…",
    bos: "No academics match this search. Try a different keyword.",
  },
  takvim: {
    ara: "Search the calendar",
    araOrnek: "Search: TÜBİTAK, hydrogen, SME…",
    bos: "No matching records.",
    tarih: "Date",
    durum: "Status",
  },
  yatirimlar: {
    ara: "Search investments",
    araOrnek: "Search: Evreka, TÜBİTAK, fund…",
    bos: "No matching investments.",
    tutar: "Amount",
    rapor: "Report",
  },
  isbirlikleri: {
    ara: "Search collaborations",
    araOrnek: "Search: ODTÜ, hydrogen, fund…",
    bos: "No matching collaborations.",
  },

  aktor: {
    alan: "Field",
    uzmanlik: "Expertise",
    surdurulebilirlik: "Sustainability",
    yonetim: "Management",
    yoneticiYok: "No management information was found in open sources.",
    capaFirmalar: "Anchor companies",
    firmaYok: "No named companies in the sustainability field were found in the sources.",
    kisiler: "People",
    kisi: "Contact:",
    surdurulebilirlikSatir: "Sustainability:",
    alanBaglantisi: (alan: string) => `All institutions in ${alan}`,
    ikincilAlan: "Secondary field",
  },

  iliskiler: {
    yatirimlar: "Investments",
    isbirlikleri: "Collaborations",
    takvim: "Events and calls",
    arastirmacilar: "Researchers",
  },

  kurumSayfasi: { dizinKaydi: "Directory entry", haritadaGor: "Show on map" },

  sayilar: {
    kurumHaritada: "institutions on the map",
    akademisyen: (universite: number) => `academics · ${universite} universities`,
  },

  harita: {
    merkez: "ANKARA",
    ara: "Search the map",
    araOrnek: "Search the map: hydrogen, ODTÜ, waste…",
    svg: "Map of the Ankara ecosystem divided into category slices",
    lejant: "Map slices",
  },

  durum: {
    etkinlik: { yaklasiyor: "Upcoming", acik: "Ongoing", kapandi: "Took place" },
    destek: { yaklasiyor: "Opening soon", acik: "Open for applications", kapandi: "Closed" },
    yillik: "Annual · next round",
  },
};
