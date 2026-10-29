# TASK-03: JSON çıktısı

**WP:** [WP-01](../WP.md)
**Durum:** `todo`
**Bağımlı:** TASK-02
**Tahmini efor:** ~0.25g

## Ne yapılacak, neden?

Tüm veri paketi ve sorun listesi tek bir JSON dosyasında: makine tarafından okunacak biçim. Başka
araçlara (ve ileride Django'ya ilk yüklemeye) girdi olur; AI'a ham veri olarak da verilebilir.

## Teknik tarif

**Yeni dosya:** `src/pages/veri/veri.json.ts`, statik (prerender) endpoint:

```ts
export const GET: APIRoute = async () => {
  const paket = await veriPaketi();
  const sorunlar = sorunlariBul(paket, new Date());
  return new Response(JSON.stringify({ ...paket, sorunlar }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
```

Build sonunda `dist/veri/veri.json` oluşur. Okunabilirlik için girintili (2 boşluk); dosya küçük
(birkaç yüz KB).

## Adımlar

1. Endpoint'i yaz.
2. Build sonrası dosyayı aç: tablolar, sayılar, `sorunlar` var mı.

## Açık kararlar

Yok. (Yayınlanıp yayınlanmayacağı TASK-06'da.)

## Kabul kriterleri

- [ ] `dist/veri/veri.json` üretiliyor ve geçerli JSON
- [ ] Üst bilgideki `sayilar`, tablo uzunluklarıyla aynı
- [ ] `npm run build` 0 hata, 0 uyarı

## Notlar

- Paket biçimi değişirse `surum` artırılır; JSON'u okuyan araçlar buna bakar.
