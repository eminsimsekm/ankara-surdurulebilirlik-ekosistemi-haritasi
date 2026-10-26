/*
  Sunucuda render edilmiş listeyi tarayıcıda süzer. İşaretleme sözleşmesi:

    [data-filter-root]                    süzmenin kapsamı
      [data-filter-input]                 (isteğe bağlı) arama kutusu
      [data-filter-facet="param"]         (isteğe bağlı) tek seçimli çip grubu (FiltreCipleri)
        [data-filter-chip][data-deger]    çip; data-deger="" = tümü
      [data-filter-group]                 (isteğe bağlı) içinde görünür öğe kalmazsa gizlenir
        [data-filter-item][data-search]   süzülen öğe; data-search = searchKey(...) çıktısı,
                         [data-facet]     çip grubu varsa öğenin değeri
      [data-filter-empty]                 (isteğe bağlı) hiç sonuç yoksa gösterilir

  Yalnızca `hidden` değiştirilir; HTML üretilmez. Sorgu ve çip seçimi adres
  çubuğunda tutulur (arama kutusunun `name`'i ve çip grubunun parametresiyle).
*/
import { matchesQuery, searchKey } from "../lib/text";

function adresiGuncelle(param: string | undefined, deger: string) {
  if (!param) return;
  const url = new URL(location.href);
  if (deger) url.searchParams.set(param, deger);
  else url.searchParams.delete(param);
  history.replaceState(history.state, "", url);
}

function setup(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>("[data-filter-input]");
  const facet = root.querySelector<HTMLElement>("[data-filter-facet]");
  const chips = [...root.querySelectorAll<HTMLButtonElement>("[data-filter-chip]")];
  const items = [...root.querySelectorAll<HTMLElement>("[data-filter-item]")];
  const groups = [...root.querySelectorAll<HTMLElement>("[data-filter-group]")];
  const empty = root.querySelector<HTMLElement>("[data-filter-empty]");
  const adres = new URLSearchParams(location.search);
  const facetParam = facet?.dataset.filterFacet;

  let secili = "";

  const apply = () => {
    const query = searchKey(input?.value ?? "");
    let shown = 0;
    for (const item of items) {
      const match = matchesQuery(item.dataset.search ?? "", query) && (!secili || item.dataset.facet === secili);
      item.hidden = !match;
      if (match) shown++;
    }
    for (const group of groups) group.hidden = !group.querySelector("[data-filter-item]:not([hidden])");
    for (const chip of chips) chip.setAttribute("aria-pressed", String((chip.dataset.deger ?? "") === secili));
    if (empty) empty.hidden = shown > 0;
  };

  const sec = (deger: string) => {
    secili = chips.some((c) => c.dataset.deger === deger) ? deger : "";
    apply();
  };

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      sec(chip.dataset.deger ?? "");
      adresiGuncelle(facetParam, secili);
    });
  }

  if (input) {
    if (input.name && !input.value) input.value = adres.get(input.name) ?? "";
    input.addEventListener("input", () => {
      apply();
      adresiGuncelle(input.name || undefined, input.value.trim());
    });
  }

  sec(facetParam ? (adres.get(facetParam) ?? "") : ""); // adresteki ya da geri tuşuyla korunmuş durumu uygula
}

document.querySelectorAll<HTMLElement>("[data-filter-root]").forEach(setup);
