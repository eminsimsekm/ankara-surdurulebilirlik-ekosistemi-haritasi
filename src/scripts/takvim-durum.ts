/*
  [data-takvim-durum] rozetlerini tarayıcıdaki güncel tarihe göre yeniden hesaplar.
  Build sırasında yazılan durum, site yeniden derlenmeden günler geçse de doğru kalır.
*/
import { bugun, takvimDurumu, type DurumGirdisi } from "../lib/takvim";

export function durumlariGuncelle(kapsam: ParentNode = document) {
  const tarih = bugun();
  kapsam.querySelectorAll<HTMLElement>("[data-takvim-durum]").forEach((el) => {
    const durum = takvimDurumu(JSON.parse(el.dataset.takvimDurum!) as DurumGirdisi, tarih);
    el.dataset.durum = durum.kod;
    el.textContent = durum.etiket;
  });
}

durumlariGuncelle();
