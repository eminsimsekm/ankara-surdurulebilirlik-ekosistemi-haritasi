/*
  Sunucuda render edilmiş listeyi tarayıcıda süzer. İşaretleme sözleşmesi:

    [data-filter-root]                    süzmenin kapsamı
      [data-filter-input]                 (isteğe bağlı) arama kutusu
      [data-filter-facet="param"]         (isteğe bağlı, birden çok olabilir) tek seçimli çip grubu (FiltreCipleri)
        [data-filter-chip][data-deger]    çip; data-deger="" = tümü
      [data-filter-group]                 (isteğe bağlı) içinde görünür öğe kalmazsa gizlenir
        [data-filter-item][data-search]   süzülen öğe; data-search = searchKey(...) çıktısı,
                  [data-facet-<param>]    her çip grubu için öğenin değer(ler)i, boşlukla ayrılmış
      [data-filter-empty]                 (isteğe bağlı) hiç sonuç yoksa gösterilir

  Öğe, seçimi olan her grupta eşleşiyorsa görünür (gruplar arası VE); bir grupta
  eşleşmek, seçili değerin öğenin değer listesinde bulunmasıdır.

  Yalnızca `hidden` değiştirilir; HTML üretilmez. Sorgu ve çip seçimleri adres
  çubuğunda tutulur (arama kutusunun `name`'i ve her çip grubunun parametresiyle).
*/
import { matchesQuery, searchKey } from "../lib/text";

function adresiGuncelle(param: string | undefined, deger: string) {
  if (!param) return;
  const url = new URL(location.href);
  if (deger) url.searchParams.set(param, deger);
  else url.searchParams.delete(param);
  history.replaceState(history.state, "", url);
}

interface CipGrubu {
  param: string;
  chips: HTMLButtonElement[];
  secili: string; // "" = tümü
}

function setup(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>("[data-filter-input]");
  const items = [...root.querySelectorAll<HTMLElement>("[data-filter-item]")];
  const groups = [...root.querySelectorAll<HTMLElement>("[data-filter-group]")];
  const empty = root.querySelector<HTMLElement>("[data-filter-empty]");
  const adres = new URLSearchParams(location.search);

  const cipGruplari: CipGrubu[] = [...root.querySelectorAll<HTMLElement>("[data-filter-facet]")].map((facet) => ({
    param: facet.dataset.filterFacet!,
    chips: [...facet.querySelectorAll<HTMLButtonElement>("[data-filter-chip]")],
    secili: "",
  }));

  const eslesir = (item: HTMLElement, g: CipGrubu) =>
    !g.secili || (item.getAttribute(`data-facet-${g.param}`) ?? "").split(" ").includes(g.secili);

  const apply = () => {
    const query = searchKey(input?.value ?? "");
    let shown = 0;
    for (const item of items) {
      const match = matchesQuery(item.dataset.search ?? "", query) && cipGruplari.every((g) => eslesir(item, g));
      item.hidden = !match;
      if (match) shown++;
    }
    for (const group of groups) group.hidden = !group.querySelector("[data-filter-item]:not([hidden])");
    for (const g of cipGruplari) {
      for (const chip of g.chips) chip.setAttribute("aria-pressed", String((chip.dataset.deger ?? "") === g.secili));
    }
    if (empty) empty.hidden = shown > 0;
  };

  const sec = (g: CipGrubu, deger: string) => {
    g.secili = g.chips.some((c) => c.dataset.deger === deger) ? deger : "";
  };

  for (const g of cipGruplari) {
    for (const chip of g.chips) {
      chip.addEventListener("click", () => {
        sec(g, chip.dataset.deger ?? "");
        apply();
        adresiGuncelle(g.param, g.secili);
      });
    }
  }

  if (input) {
    if (input.name && !input.value) input.value = adres.get(input.name) ?? "";
    input.addEventListener("input", () => {
      apply();
      adresiGuncelle(input.name || undefined, input.value.trim());
    });
  }

  // Adresteki ya da geri tuşuyla korunmuş durumu uygula
  for (const g of cipGruplari) sec(g, adres.get(g.param) ?? "");
  apply();
}

document.querySelectorAll<HTMLElement>("[data-filter-root]").forEach(setup);
