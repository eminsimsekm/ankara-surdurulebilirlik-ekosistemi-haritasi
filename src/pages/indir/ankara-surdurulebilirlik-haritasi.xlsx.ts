// Genel Excel: sitede "Excel olarak indir" butonuyla indirilen dosya. İç çalışma notları (sorunlar,
// kaynak dosya yolları) yok. Site her derlendiğinde yeniden üretilir; sitede ne varsa dosyada da o var.
import type { APIRoute } from "astro";
import { excelKitabi } from "../../lib/veri-excel";
import { veriPaketi } from "../../lib/veri-paketi";

export const GET: APIRoute = async () =>
  new Response(await excelKitabi(await veriPaketi(), [], "genel"), {
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  });
