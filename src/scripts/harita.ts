/*
  Haritanın tarayıcı tarafı: kategori çipleri, arama, düğüm seçimi.
  Detaylar sunucuda <template id="detay:<id>"> olarak hazır; burada yalnızca
  panele kopyalanır. Kategori, arama ve seçim adres çubuğunda tutulur
  (?kategori=…&ara=…&secim=…).

  Kategori çipleri FiltreCipleri bileşenidir (tek seçimli: "Tümü" ya da bir kategori).
  Bir kategori seçilince harita kategori görünümüne geçer: diğer kategorilerin
  düğümleri gizlenir (.gizli), seçilenin düğümleri CSS ile kendi görünümündeki
  yerlerine kayar ve o görünümün dilim çizgileri açılır (.acik). Konumlar build
  sırasında hesaplanmıştır (Harita.astro). Arama ise listelerden farklı olarak
  eşleşmeyen düğümleri gizlemez, soluklaştırır (.dim). Fareyle üzerine gelinen
  dilim (ya da düğümün dilimi) vurgulanır (.vurgulu, diğerleri .soluk); genel
  görünümde vurgulu dilime tıklamak o kategoriyi seçer, kategori görünümünde
  ortadaki daireye tıklamak genel görünüme döner. Genel görünümde bir düğüm
  seçilince onun kategorisine de geçilir.
*/
import { matchesQuery, searchKey } from "../lib/text";
import { durumlariGuncelle } from "./takvim-durum";

const ETIKET_UZUNLUGU = 28;

function kur(root: HTMLElement) {
  const facet = root.querySelector<HTMLElement>("[data-filter-facet]");
  const chips = [...root.querySelectorAll<HTMLButtonElement>("[data-filter-chip]")];
  const nodes = [...root.querySelectorAll<SVGGElement>("[data-id]")];
  const gorunumler = [...root.querySelectorAll<SVGGElement>("[data-gorunum-anahtari]")];
  const merkezSayi = root.querySelector<SVGTextElement>("[data-merkez-sayi]")!;
  const merkezBirim = root.querySelector<SVGTextElement>("[data-merkez-birim]")!;
  const panel = root.querySelector<HTMLElement>("[data-detay-panel]")!;
  const etiket = root.querySelector<SVGTextElement>("[data-secim-etiket]")!;
  const ara = root.querySelector<HTMLInputElement>("[data-harita-ara]");
  const merkezX = Number(root.dataset.merkezX);
  const kategoriParam = facet?.dataset.filterFacet ?? "kategori";

  let seciliKategori = ""; // "" = tümü
  let sorgu = "";
  let seciliDugum: SVGGElement | undefined;

  const adresiGuncelle = (param: string, deger: string | null) => {
    const url = new URL(location.href);
    if (deger) url.searchParams.set(param, deger);
    else url.searchParams.delete(param);
    history.replaceState(history.state, "", url);
  };

  function suz() {
    for (const chip of chips) chip.setAttribute("aria-pressed", String((chip.dataset.deger ?? "") === seciliKategori));
    root.dataset.gorunum = seciliKategori ? "kategori" : "genel";
    for (const g of gorunumler) g.classList.toggle("acik", g.dataset.gorunumAnahtari === seciliKategori);
    for (const n of nodes) {
      const gizli = !!seciliKategori && n.dataset.kategori !== seciliKategori;
      n.classList.toggle("gizli", gizli);
      n.classList.toggle("dim", !gizli && !matchesQuery(n.dataset.search ?? "", sorgu));
    }
    vurgula((vurguluDilim = null)); // görünüm değişince eski dilimin vurgusu kalmasın
    etiketiKonumla();
  }

  /** Açık görünümde verilen dilimi ve noktalarını vurgular; null vurguyu kaldırır. */
  function vurgula(dilim: string | null) {
    const kategoride = root.dataset.gorunum === "kategori";
    const acik = gorunumler.find((g) => g.matches("g.acik")); // lejant (<ol>) değil, SVG görünümü
    for (const d of root.querySelectorAll<SVGGElement>(".dilim")) {
      d.classList.toggle("vurgulu", !!dilim && d.dataset.dilim === dilim && acik?.contains(d) === true);
    }
    let toplam = 0;
    let eslesen = 0;
    for (const n of nodes) {
      const nDilim = kategoride ? n.dataset.dilimKategori : n.dataset.dilimGenel;
      const etkin = !!dilim && !n.classList.contains("gizli"); // başka kategorinin gizli noktası etkilenmez
      n.classList.toggle("vurgulu", etkin && nDilim === dilim);
      n.classList.toggle("soluk", etkin && nDilim !== dilim);
      if (etkin && nDilim === dilim) {
        toplam++;
        if (!n.classList.contains("dim")) eslesen++;
      }
    }

    // Merkezde dilimin kayıt sayısı; arama varsa eşleşen/toplam
    if (dilim) {
      const renkli = acik?.querySelector<SVGGElement>(`.dilim[data-dilim="${CSS.escape(dilim)}"]`);
      merkezSayi.textContent = eslesen < toplam ? `${eslesen}/${toplam}` : String(toplam);
      merkezBirim.textContent = acik?.dataset.birim ?? "";
      merkezSayi.style.setProperty("--c", renkli ? getComputedStyle(renkli).getPropertyValue("--c") : "");
      root.dataset.vurgu = "";
    } else {
      delete root.dataset.vurgu;
    }
  }

  // Yalnızca fare: dokunmatikte "üzerine gelme" yok, vurgu dokunuştan sonra takılı kalırdı
  const svg = root.querySelector("svg")!;
  let vurguluDilim: string | null = null;
  svg.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const hedef = (e.target as Element).closest<SVGGElement>(".dilim, .node");
    const kategoride = root.dataset.gorunum === "kategori";
    const dilim = !hedef
      ? null
      : hedef.classList.contains("node")
        ? ((kategoride ? hedef.dataset.dilimKategori : hedef.dataset.dilimGenel) ?? null)
        : (hedef.dataset.dilim ?? null);
    if (dilim !== vurguluDilim) vurgula((vurguluDilim = dilim));
  });
  svg.addEventListener("pointerleave", () => vurgula((vurguluDilim = null)));

  /** Seçili düğümün ad etiketi; düğüm o anki görünümde yoksa gizlenir (panel olduğu gibi kalır). */
  function etiketiKonumla() {
    const node = seciliDugum;
    if (!node || node.classList.contains("gizli")) {
      etiket.textContent = "";
      return;
    }
    const daire = node.querySelector("circle")!;
    const kategoride = root.dataset.gorunum === "kategori";
    const x = Number(daire.getAttribute("cx")) + (kategoride ? Number(node.dataset.dx) : 0);
    const y = Number(daire.getAttribute("cy")) + (kategoride ? Number(node.dataset.dy) : 0);
    const ad = node.dataset.ad ?? "";
    const sagda = x < merkezX;
    etiket.textContent = ad.length > ETIKET_UZUNLUGU ? `${ad.slice(0, ETIKET_UZUNLUGU - 1)}…` : ad;
    etiket.setAttribute("x", String(sagda ? x + 12 : x - 12));
    etiket.setAttribute("y", String(y + 4));
    etiket.setAttribute("text-anchor", sagda ? "start" : "end");
  }

  // Tek seçim: tıklanan çip seçilir, öncekinin seçimi kalkar. "Tümü" (deger="") hepsini gösterir.
  const kategoriSec = (deger: string) => {
    seciliKategori = chips.some((c) => c.dataset.deger === deger) ? deger : "";
  };
  kategoriSec(new URLSearchParams(location.search).get(kategoriParam) ?? "");
  const kategoriyeGec = (deger: string) => {
    kategoriSec(deger);
    suz();
    adresiGuncelle(kategoriParam, seciliKategori || null);
  };
  for (const chip of chips) chip.addEventListener("click", () => kategoriyeGec(chip.dataset.deger ?? ""));

  // Genel görünümde vurgulanan dilime tıklamak o kategorinin çipine basmakla aynı (dilim anahtarı = kategori).
  // Vurgu yalnızca fareyle oluştuğu için dokunmatikte düğümü ıskalayan dokunuş görünümü değiştirmez.
  // Kategori görünümünde ortadaki daireye tıklamak "Tümü"ye döner.
  svg.addEventListener("click", (e) => {
    const hedef = e.target as Element;
    if (root.dataset.gorunum === "kategori") {
      if (hedef.closest(".merkez")) kategoriyeGec("");
      return;
    }
    const deger = hedef.closest<SVGGElement>(".dilim")?.dataset.dilim;
    if (deger && deger === vurguluDilim) kategoriyeGec(deger);
  });

  if (ara) {
    ara.value ||= new URLSearchParams(location.search).get("ara") ?? "";
    sorgu = searchKey(ara.value);
    ara.addEventListener("input", () => {
      sorgu = searchKey(ara.value);
      suz();
      adresiGuncelle("ara", ara.value.trim() || null);
    });
  }

  function sec(id: string, { kaydir = false, adres = true } = {}) {
    const sablon = document.getElementById(`detay:${id}`);
    const node = nodes.find((n) => n.dataset.id === id);
    if (!(sablon instanceof HTMLTemplateElement) || !node) return false;

    panel.replaceChildren(sablon.content.cloneNode(true));
    durumlariGuncelle(panel);
    for (const n of nodes) n.classList.toggle("sel", n === node);
    seciliDugum = node;
    etiketiKonumla();

    if (adres) adresiGuncelle("secim", id);
    if (kaydir && matchMedia("(max-width: 860px)").matches) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }

  // Genel görünümde seçilen düğümün kategorisine de geçilir; kategori görünümünde zaten oradadır
  const dugumuSec = (node: SVGGElement) => {
    if (!seciliKategori) kategoriyeGec(node.dataset.kategori ?? "");
    sec(node.dataset.id!, { kaydir: true });
  };
  for (const node of nodes) {
    node.addEventListener("click", () => dugumuSec(node));
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dugumuSec(node);
      }
    });
  }

  suz();
  const istenen = new URLSearchParams(location.search).get("secim");
  if (!(istenen && sec(istenen, { adres: false })) && root.dataset.varsayilan) {
    sec(root.dataset.varsayilan, { adres: false });
  }
  // İlk durum çizildikten sonra geçişleri aç; sonraki görünüm değişimleri kayarak olur
  requestAnimationFrame(() => requestAnimationFrame(() => (root.dataset.hazir = "")));
}

document.querySelectorAll<HTMLElement>("[data-harita]").forEach(kur);
