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
  eşleşmeyen düğümleri gizlemez, soluklaştırır (.dim).
*/
import { matchesQuery, searchKey } from "../lib/text";
import { durumlariGuncelle } from "./takvim-durum";

const ETIKET_UZUNLUGU = 28;

function kur(root: HTMLElement) {
  const facet = root.querySelector<HTMLElement>("[data-filter-facet]");
  const chips = [...root.querySelectorAll<HTMLButtonElement>("[data-filter-chip]")];
  const nodes = [...root.querySelectorAll<SVGGElement>("[data-id]")];
  const gorunumler = [...root.querySelectorAll<SVGGElement>("[data-gorunum-anahtari]")];
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
    etiketiKonumla();
  }

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
  for (const chip of chips) {
    chip.addEventListener("click", () => {
      kategoriSec(chip.dataset.deger ?? "");
      suz();
      adresiGuncelle(kategoriParam, seciliKategori || null);
    });
  }

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

  for (const node of nodes) {
    const id = node.dataset.id!;
    node.addEventListener("click", () => sec(id, { kaydir: true }));
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        sec(id, { kaydir: true });
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
