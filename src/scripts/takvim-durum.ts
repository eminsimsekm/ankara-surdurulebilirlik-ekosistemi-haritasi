/*
  [data-takvim-durum] rozetlerini tarayıcıdaki güncel tarihe göre yeniden hesaplar.
  Build sırasında yazılan durum, site yeniden derlenmeden günler geçse de doğru kalır.
*/
import { adrestenDil } from "../lib/dil";
import { bugun, takvimDurumu, type DurumGirdisi } from "../lib/takvim";

// Sayfanın dili adresten (yol() ile aynı kural); <html lang> da aynı değeri taşır
const dil = adrestenDil(location.pathname, import.meta.env.BASE_URL.replace(/\/?$/, "/"));

export function durumlariGuncelle(kapsam: ParentNode = document) {
  const tarih = bugun();
  kapsam.querySelectorAll<HTMLElement>("[data-takvim-durum]").forEach((el) => {
    const durum = takvimDurumu(JSON.parse(el.dataset.takvimDurum!) as DurumGirdisi, tarih, dil);
    el.dataset.durum = durum.kod;
    el.textContent = durum.etiket;
  });
}

durumlariGuncelle();
