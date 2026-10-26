/*
  Haritanın tarayıcı tarafı: kategori çipleri, arama, düğüm seçimi.
  Detaylar sunucuda <template id="detay:<id>"> olarak hazır; burada yalnızca
  panele kopyalanır. Seçim ve arama adres çubuğunda tutulur (?secim=…&ara=…).
*/
import { matchesQuery, searchKey } from "../lib/text";
import { durumlariGuncelle } from "./takvim-durum";

const ETIKET_UZUNLUGU = 28;

function kur(root: HTMLElement) {
  const chips = [...root.querySelectorAll<HTMLButtonElement>("[data-kategori-chip]")];
  const nodes = [...root.querySelectorAll<SVGGElement>("[data-id]")];
  const panel = root.querySelector<HTMLElement>("[data-detay-panel]")!;
  const etiket = root.querySelector<SVGTextElement>("[data-secim-etiket]")!;
  const ara = root.querySelector<HTMLInputElement>("[data-harita-ara]");
  const merkezX = Number(root.dataset.merkezX);

  const tumu = chips.map((c) => c.dataset.kategoriChip!);
  let aktif = new Set(tumu);
  let sorgu = "";

  const adresiGuncelle = (param: string, deger: string | null) => {
    const url = new URL(location.href);
    if (deger) url.searchParams.set(param, deger);
    else url.searchParams.delete(param);
    history.replaceState(history.state, "", url);
  };

  function suz() {
    for (const chip of chips) chip.setAttribute("aria-pressed", String(aktif.has(chip.dataset.kategoriChip!)));
    for (const n of nodes) {
      const gorunur = aktif.has(n.dataset.kategori!) && matchesQuery(n.dataset.search ?? "", sorgu);
      n.classList.toggle("dim", !gorunur);
    }
  }

  // Hepsi açıkken tıklanan kategoriyi tek başına göster; sonra tıklananları ekle/çıkar;
  // hiçbiri kalmazsa hepsine dön.
  for (const chip of chips) {
    chip.addEventListener("click", () => {
      const k = chip.dataset.kategoriChip!;
      if (aktif.size === tumu.length) aktif = new Set([k]);
      else if (aktif.has(k)) {
        aktif.delete(k);
        if (!aktif.size) aktif = new Set(tumu);
      } else aktif.add(k);
      suz();
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

    const daire = node.querySelector("circle")!;
    const x = Number(daire.getAttribute("cx"));
    const y = Number(daire.getAttribute("cy"));
    const ad = node.dataset.ad ?? "";
    const sagda = x < merkezX;
    etiket.textContent = ad.length > ETIKET_UZUNLUGU ? `${ad.slice(0, ETIKET_UZUNLUGU - 1)}…` : ad;
    etiket.setAttribute("x", String(sagda ? x + 12 : x - 12));
    etiket.setAttribute("y", String(y + 4));
    etiket.setAttribute("text-anchor", sagda ? "start" : "end");

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
}

document.querySelectorAll<HTMLElement>("[data-harita]").forEach(kur);
