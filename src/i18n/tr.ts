/*
  Arayüz metinleri (Türkçe). Bileşen ve sayfalardaki sabit metinlerin tek kaynağı; içerik
  metinleri (kurum açıklamaları vb.) burada değil, src/content/'te. İngilizcesi en.ts'te ve
  aynı anahtarları taşımak zorunda (eksik anahtar derlemede hata verir).

  Sayıya bağlı metinler fonksiyondur; dilin çoğul kuralı burada kalır.
*/
export const tr = {
  siteAdi: "Ankara Sürdürülebilirlik Haritası",
  siteAciklamasi:
    "Ankara'nın sürdürülebilirlik ekosistemi: teknoparklar, TEKMER'ler, girişimler, akademisyenler, yatırımlar ve destekler.",
  anaSayfaUst: "Ankara ekosistemi",

  tema: { dugme: "Temayı değiştir", etiket: "Tema", acik: "Açık tema", koyu: "Koyu tema" },
  dil: { secici: "Dil", tr: "Türkçe", en: "English" },

  menu: {
    bolumler: "Bölümler",
    kurumKategorileri: "Kurum kategorileri",
    harita: "Harita",
    kurumlar: "Kurumlar",
    akademisyenler: "Akademisyenler",
    yatirimlar: "Yatırımlar",
    takvim: "Takvim",
    isbirlikleri: "İş Birlikleri",
    netzero: "NetZero TEKMER",
    tumu: "Tümü",
  },

  birim: {
    kayit: (_n: number) => "kayıt",
    kisi: (_n: number) => "kişi",
    kurum: (_n: number) => "kurum",
    akademisyen: (_n: number) => "akademisyen",
    kategori: (_n: number) => "kategori",
    universite: (_n: number) => "üniversite",
    isbirligi: (_n: number) => "iş birliği",
    islem: (_n: number) => "işlem",
  },

  ortak: {
    tumu: "Tümü",
    ara: "Ara…",
    kaynak: "Kaynak",
    akademikProfil: "Akademik profil",
    tumAyrintilar: "Tüm ayrıntılar →",
    ile: "ile",
    tarihYok: "—",
  },

  filtre: {
    kategoriFiltresi: "Kategori filtresi",
    kategori: "Kategori",
    alanFiltresi: "Alan filtresi",
    alan: "Alan",
    universiteFiltresi: "Üniversite filtresi",
    turFiltresi: "Tür filtresi",
    yatirimTuru: "Yatırım türü",
    isbirligiTuru: "İş birliği türü",
  },

  kurumlar: {
    ara: "Kurumlarda ara",
    araOrnek: "Ara: güneş, atık, ODTÜ, batarya…",
    excel: "Excel olarak indir",
    bos: "Bu filtreyle eşleşen kurum yok.",
  },
  kategoriSayfasi: {
    ara: (baslik: string) => `${baslik} içinde ara`,
    araOrnek: "Ara: ad, konu, konum…",
    bos: "Eşleşen kayıt yok. Farklı bir kelime deneyin.",
  },
  akademisyenler: {
    ara: "Akademisyen ara",
    araOrnek: "Ara: hidrojen, perovskit, CO₂…",
    bos: "Bu aramayla eşleşen akademisyen yok. Farklı bir anahtar kelime deneyin.",
  },
  takvim: {
    ara: "Takvimde ara",
    araOrnek: "Ara: TÜBİTAK, hidrojen, KOBİ…",
    bos: "Eşleşen kayıt yok.",
    tarih: "Tarih",
    durum: "Durum",
  },
  yatirimlar: {
    ara: "Yatırımlarda ara",
    araOrnek: "Ara: Evreka, TÜBİTAK, fon…",
    bos: "Eşleşen yatırım yok.",
    tutar: "Tutar",
    rapor: "Rapor",
  },
  isbirlikleri: {
    ara: "İş birliklerinde ara",
    araOrnek: "Ara: ODTÜ, hidrojen, fon…",
    bos: "Eşleşen iş birliği yok.",
  },

  aktor: {
    alan: "Alan",
    uzmanlik: "Uzmanlık",
    surdurulebilirlik: "Sürdürülebilirlik",
    yonetim: "Yönetim",
    yoneticiYok: "Yönetici bilgisi açık kaynaklarda bulunamadı.",
    capaFirmalar: "Çapa firmalar",
    firmaYok: "Kaynaklarda sürdürülebilirlik alanında isim bazında firma bulunamadı.",
    kisiler: "Kişiler",
    kisi: "Kişi:",
    surdurulebilirlikSatir: "Sürdürülebilirlik:",
    alanBaglantisi: (alan: string) => `${alan} alanındaki tüm kurumlar`,
    ikincilAlan: "İkincil alan",
  },

  iliskiler: {
    yatirimlar: "Yatırımlar",
    isbirlikleri: "İş birlikleri",
    takvim: "Etkinlikler ve çağrılar",
    arastirmacilar: "Araştırmacılar",
  },

  kurumSayfasi: { dizinKaydi: "Dizindeki kaydı", haritadaGor: "Haritada gör" },

  sayilar: {
    kurumHaritada: "kurum haritada",
    akademisyen: (universite: number) => `akademisyen · ${universite} üniversite`,
  },

  harita: {
    merkez: "ANKARA",
    ara: "Haritada ara",
    araOrnek: "Haritada ara: hidrojen, ODTÜ, atık…",
    svg: "Kategori dilimlerine ayrılmış Ankara ekosistem haritası",
    lejant: "Harita dilimleri",
  },

  durum: {
    etkinlik: { yaklasiyor: "Yaklaşıyor", acik: "Sürüyor", kapandi: "Gerçekleşti" },
    destek: { yaklasiyor: "Açılacak", acik: "Başvuruya açık", kapandi: "Kapandı" },
    yillik: "Yıllık · gelecek dönem",
  },
};

export type Metinler = typeof tr;
