// Veri paketi + sorun listesi, makine için (araçlar, AI, ileride Django'ya ilk yükleme).
// Üretilen, salt okunur kopya; düzeltme her satırdaki `kaynakDosya`da yapılır.
import type { APIRoute } from "astro";
import { sorunlariBul } from "../../lib/veri-kontrol";
import { veriPaketi } from "../../lib/veri-paketi";

export const GET: APIRoute = async () => {
  const paket = await veriPaketi();
  const sorunlar = sorunlariBul(paket, new Date());
  return new Response(JSON.stringify({ ...paket, sorunlar }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
