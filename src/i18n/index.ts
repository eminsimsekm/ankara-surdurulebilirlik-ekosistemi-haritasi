/** Arayüz metinlerinin giriş noktası: bileşenler `metinler(sayfaDili(Astro.url))` çağırır. */
import type { Dil } from "../lib/dil";
import { en } from "./en";
import { tr, type Metinler } from "./tr";

const METINLER: Record<Dil, Metinler> = { tr, en };

export const metinler = (dil: Dil): Metinler => METINLER[dil];
export type { Metinler };
