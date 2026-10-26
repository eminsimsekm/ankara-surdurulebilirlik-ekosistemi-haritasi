/*
  Arama için metin normalleştirme. Hem build sırasında (data-search değerleri)
  hem tarayıcıda (kullanıcının yazdığı sorgu) aynı fonksiyon kullanılır; ikisi
  aynı biçime indirgendiği için eşleşme tutarlı olur.
*/

const FOLD: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

type Part = string | null | undefined | readonly string[];

/**
 * Arama anahtarı: Türkçe kurallarıyla küçük harf, Türkçe karakterler sadeleşir.
 * "ODTÜ Güneş" → "odtu gunes"; böylece "odtu" ya da "gunes" yazan da bulur.
 */
export function searchKey(...parts: Part[]): string {
  return parts
    .flat()
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (c) => FOLD[c] ?? c)
    .replace(/\s+/g, " ")
    .trim();
}

/** Sorgudaki her kelime metinde geçiyorsa eşleşir. `query` searchKey'den geçmiş olmalı. */
export function matchesQuery(text: string, query: string): boolean {
  if (!query) return true;
  return query.split(" ").every((word) => text.includes(word));
}
