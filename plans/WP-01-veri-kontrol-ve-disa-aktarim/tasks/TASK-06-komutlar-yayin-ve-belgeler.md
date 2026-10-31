# TASK-06: Komutlar, yayın kararı, CI özeti, belgeler

**WP:** [WP-01](../WP.md)
**Durum:** `done`
**Bağımlı:** TASK-03, TASK-04, TASK-05
**Tahmini efor:** ~0.5g

## Ne yapılacak, neden?

Üç çıktının tek komutla alınması, her push'ta sorun özetinin görünmesi ve kullanımın belgelenmesi.

## Teknik tarif

**`npm run veri`** (`package.json`): build alır, `dist/veri/` içindekileri depo kökündeki
`veri-cikti/` klasörüne kopyalar (git'e girmez, `.gitignore`), konsola sorun özetini yazar:

```
Veri paketi: 105 kurum · 63 akademisyen · 17 yatırım · 13 takvim · 27 iş birliği
Sorunlar: 4 uyarı, 31 bilgi  →  veri-cikti/veri.xlsx (Sorunlar sayfası)
```

Kopyalama ve özet için küçük bir Node script'i (`scripts/veri-cikti.mjs`); yalnızca `dist/veri/veri.json`'u
okur, veriyi kendisi yorumlamaz.

**GitHub Actions** (`.github/workflows/pages.yml`): build adımından sonra aynı özet iş özetine
(`$GITHUB_STEP_SUMMARY`) yazılır; uyarılar iş akışını başarısız yapmaz.

**Belgeler:**
- Kök `README.md`: "Veriyi incelemek" bölümü (komut, üç dosya, ne için hangisi, "düzeltme kaynak dosyada").
- `CLAUDE.md`: yeni sorun kuralı ve yeni tablo eklemenin yeri (O tablosu); Django bölümünde
  "ilk yükleme `veri.json`'dan".

## Adımlar

1. Script ve `npm run veri`.
2. `.gitignore`'a `veri-cikti/`.
3. Yayın kararını uygula (aşağıda).
4. Actions özeti.
5. Belgeler; task notlarını tamamla, WP'yi `done` yap.

## Açık kararlar

Kapandı (2026-10-29): (b) yayınlanmasın.

1. **Çıktılar GitHub Pages'te yayınlansın mı?** `dist/veri/` olduğu gibi kalırsa `…/veri/veri.xlsx`
   herkese açık indirilebilir olur. Verinin kendisi sitede zaten açık, ama sorun listesi iç
   çalışma notudur.
   - (a) Yayınlansın: bağlantıyla paylaşmak kolay.
   - (b) **Yayınlanmasın (öneri):** Pages iş akışında yüklemeden önce `dist/veri/` silinir; çıktılar
     yalnızca `npm run veri` ile yerelde ve Actions'ta indirilebilir artifact olarak alınır.

## Kabul kriterleri

- [x] `npm run veri` üç dosyayı `veri-cikti/`'ye koyuyor ve özeti yazıyor
- [ ] Push sonrası Actions iş özetinde sorun sayıları görünüyor
- [ ] Yayın kararı uygulandı ve canlıda doğrulandı
- [x] README ve CLAUDE.md güncel
- [x] `npm run build` 0 hata, 0 uyarı

## Notlar

- **TASK-07 ile değişti (2026-10-29):** ayrı `npm run veri` komutu kaldırıldı; aynı işi artık
  `npm run build`'in son adımı yapıyor. Actions'taki ayrı özet adımı da kaldırıldı (build yazıyor).

- Uygulandı (2026-10-29): `scripts/veri-cikti.mjs`, `npm run veri`, `.gitignore`'da `veri-cikti/`,
  `pages.yml`'de özet + `veri-ciktilari` artifact'ı + yüklemeden önce `rm -rf dist/veri`,
  README "Veriyi incelemek", CLAUDE.md O tablosu ve Django bölümü.
- İş özeti Markdown'ı yerelde `GITHUB_STEP_SUMMARY` ile denendi. **Push sonrası Actions'ta ve canlıda
  `/veri/` adreslerinin 404 verdiği doğrulanmalı** (`review` nedeni).

- Altun Hosting'e geçişte de aynı karar geçerli: `dist/veri/` yüklenmez (karar (b) ise).
