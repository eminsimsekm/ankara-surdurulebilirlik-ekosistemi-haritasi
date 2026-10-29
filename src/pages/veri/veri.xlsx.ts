// İç Excel: ekibin kullandığı tam dosya (Sorunlar sayfası, kaynak dosya yolları). Yayınlanmaz;
// Pages iş akışı dist/veri/'yi siler. Üretim kodu: src/lib/veri-excel.ts.
import type { APIRoute } from "astro";
import { excelKitabi } from "../../lib/veri-excel";
import { sorunlariBul } from "../../lib/veri-kontrol";
import { veriPaketi } from "../../lib/veri-paketi";

export const GET: APIRoute = async () => {
  const paket = await veriPaketi();
  return new Response(await excelKitabi(paket, sorunlariBul(paket, new Date()), "ic"), {
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  });
};
