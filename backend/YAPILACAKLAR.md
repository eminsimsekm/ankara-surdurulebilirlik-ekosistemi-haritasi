# Backend: istekler (müsvedde)

Bu dosya ham not defteridir. Aklına gelen her şeyi ilgili başlığın altına yaz.

Liste olgunlaşınca buradan `plans/WP-XX-.../` altında adım adım iş paketleri (WP) ve task'lar çıkarılacak.

Çerçeve (`CLAUDE.md`, bölüm 1 ve 7): Django **yalnızca API**'dir, HTML sayfa üretmez. Herkese açık sayfaları Astro
üretmeye devam eder. API aynı alan adında `/api/` altında çalışır.

Maddelerin sonundaki işaretler: **[API]** Django tarafı, **[Önyüz]** Astro tarafı, **[İkisi]** ikisi birden,
**[Sonra]** yayından sonraya bırakılan.

---

## 0. Temel geliştirme (altyapı)

Diğer bütün başlıklar bunun üzerine kurulur; ilk yapılacaklar burada.

- Django projesinin iskeleti `backend/` altında (proje, ayarlar, uygulamalar, `requirements`). [API]
- Ortam değişkenleri ve sırlar `.env` ile; repoya yalnızca `.env.example` girer. [API]
- Veritabanı seçimi ve kurulumu (PostgreSQL). [API]
- Docker: Django, veritabanı (ve ileride Elasticsearch) için `Dockerfile` + `docker-compose`. Yerelde tek komutla ayağa kalkmalı. [API]
- API yapısı: `/api/` altında, sürümlü (`/api/v1/`), JSON anahtarları `content.ts`'in bugün döndürdüğüyle aynı. [API]
- Gateway'e uygun yapı: ileride rol tabanlı erişim (RBAC) gelecek; yetki kontrolü baştan tek bir katmanda toplanmalı. [API]
- Sayfalama (pagination): veri çoğaldıkça listeler sayfa sayfa gelmeli; liste ya da başka biçimlerde. [İkisi]
- İlk veri yüklemesi `veri.json`'dan (`npm run build` → `veri-cikti/`). [API]
- Önyüzde tek API istemcisi: `src/scripts/api.ts`. [Önyüz]
- Deploy: sunucuya aktarım ve otomatik yayın (ayrı workflow, yalnızca `backend/**` değişince). [API]
- 

## 1. Veri modeli ve standardizasyon

- Uygulamadaki kurum ve kayıt türleri:
  - Girişimler, Şirketler, KOBİ'ler
  - Teknoparklar, TEKMER'ler
  - Araştırma, Kamu & Küme, Platform
  - Topluluklar, Uygulamalar
  - Akademisyenler
  - Yatırımlar, Takvim, İş birlikleri
- Bütün kuruluşlar (TEKMER, teknopark, girişim, şirket, akademisyen…) faaliyet alanına göre kategorize edilmeli.
  - Firmaların kategorisi ile firmaları bünyesinde barındıran kurumlar (teknopark, TEKMER) ayrı kategorize edilmeli.
- Kurumun alanı doğrudan etiket (TAG) olarak görünmeli. [İkisi]
- Bütün firma ve kuruluşların verisi standart bir yapıya göre çıkarılıp işlenmeli; veriler birbiriyle ilişkili ve düzgün
  olmalı ki filtreleme, genel bakış, karşılaştırma ve kıyas yapılabilsin.
- Bir kurumun odakları, yaptıkları ve yapacakları çıkarılırsa misyon ve vizyonu genel olarak görülebilir.
- Karşılaştırma için aynı türdeki kurumlar ortak özelliklere sahip olmalı (bkz. 4. Karşılaştırma).
- 

## 2. Keşif: harita, filtreleme ve arama

Hedef kullanıcı: Destek arayan bir girişimci, seçenekler arasında rahatça gezinip aradığını kolayca bulabilmeli ve inceleyebilmeli.

- Haritalama ve filtreleme seçenekleri:
  - Türkiye haritası (ülke ve şehir bazlı). [Önyüz]
  - Filtreleme seçenekleri: alan, şehir, sağladığı artılar vb. Örnek: sıfır atık alanındaki bir girişim buna göre filtreleyebilmeli. [İkisi]
  - Hem bir tür içinde hem genel filtreleme. [İkisi]
- Haritaya çok sayıda kurum eklendiğinde gösterim karmaşıklaşmamalı (kümeleme, yakınlaştırma vb. bir çözüm). [Önyüz]
- Arama için Elasticsearch kesinlikle olmalı. [API]
- 

## 3. Kullanıcılar, giriş ve kayıtlı kurumlar

- Kullanıcı kaydı, giriş ve çıkış. [İkisi]
- Kullanıcı beğendiği kuruluşları ve tüzel kişilikleri kaydedebilmeli (favoriler). [İkisi]
- 

## 4. Karşılaştırma

- Kurumlar ortak özelliklere göre karşılaştırılabilmeli: konum, verdiği destekler, bina içi hizmet, yemek ve mutfak
  hizmeti, gerektiğinde ekibe ulaşım vb. [İkisi]
- Listede olmayan hizmetler "Diğer" altına eklenebilmeli ya da o kuruma özel bir özellik olarak ayrıntısıyla yazılabilmeli.
- Yalnızca aynı tür kendi arasında karşılaştırılır: teknoparklar, TEKMER'ler, akademisyenler, araştırma merkezleri,
  destek ve fonlamalar. Karşılaştırmaya ilk eklenen kaydın türü, eklenebilecek diğer kayıtların türünü belirler.
- 

## 5. İletişim ve takip sistemi

Örnek senaryo: Bir girişimci birkaç TEKMER'i kaydetti ve onlarla iletişime geçecek.

- Kurum sayfasında "İletişime geç" butonu olmalı. [İkisi]
- İletişim mail ile yapılır: Gönderim uygulama üzerinden olur ve gönderilen mailin kaydı (log) uygulamaya düşer.
  Kullanıcı gönderdiği mailleri uygulamada görebilir. [API]
- Kurum yanıt verirken doğrudan kullanıcının mail adresine yazar. Uygulamada yalnızca ilk gönderilen mailin kaydı
  tutulur, yanıtlar kullanıcının kendi mail kutusuna düşer. [API]
- Kullanıcı iletişime geçtiği kurumlara iletişimin sonucunu etiketleyebilir: olumlu, olumsuz, reddedildi, beklemede,
  kararsız, onaylandı vb. Etiketler istendiğinde güncellenebilir. [İkisi]
- 

## 6. Yapay zekâ desteği

- Yerleşik, basit bir yapay zekâ asistanından destek alınabilmeli (ör. "bana uygun destek nerede?"). [İkisi]
- 

## 7. Abonelik ve uygulama içi mesajlaşma [Sonra]

- Uygulama içinden doğrudan yazışmak isteyenler için ücretli abonelik: Konuşma uygulama üzerinden başlar ve orada sürer.
  Uygulama yayına çıktıktan sonra eklenecek.
- 

## 8. İçerik yönetimi (Django admin)

<!-- İçerik dosyalarda mı kalacak (Seçenek A), admin'den mi girilecek (Seçenek B)? Bkz. CLAUDE.md bölüm 7 -->

- 

## 9. Güvenlik

- 

## 10. Diğer / aklıma gelenler

- 

---

## Açık sorular

- İçerik dosyalarda mı kalacak, Django admin'den mi yönetilecek? (Karşılaştırma özellikleri ve standart veri yapısı bu kararı etkiliyor.)
- Harita Türkiye geneline mi açılacak? Şu an kapsam Ankara; şehir bazlı harita veri modelini (şehir alanı) etkiler.
- Elasticsearch ilk sürümde mi gelmeli, yoksa önce veritabanı araması yeterli mi?
- Yapay zekâ asistanı hangi veriye dayanacak ve hangi model/servisle çalışacak?
- Rol tabanlı erişimde hangi roller olacak (girişimci, kurum temsilcisi, yönetici…)? Kurumlar da kullanıcı olacak mı?
- **Önyüzü kim çizecek: Astro mu, Django mu?** Eğilim: Astro'da kalmak.
  - Veri her durumda Django veritabanında durur. Ekleme admin ya da API (add endpoint'leri) ile yapılır, push gerekmez.
  - **Astro + Django API (Seçenek B):** Kayıt eklenince Django bir webhook ile build'i tetikler, yeni veri 1–2 dk'da
    yayına çıkar. Mevcut önyüz (harita, i18n, bileşenler) korunur, herkese açık sayfalar statik ve hızlı kalır.
    Kullanıcıya özel işler (favori, takip, arama, yapay zekâ) tarayıcıdan doğrudan API'ye gider.
  - **Tamamen Django (şablonlar + HTMX):** Veri anında yayına çıkar, teknoloji tek olur, oturum ve yetki hazır gelir.
    Ancak önyüz baştan yazılır.
  - **Ara yol:** Herkese açık rehber Astro'da kalır. Giriş yapılan panel (takip, etiketler, karşılaştırma geçmişi)
    Django şablonlarıyla `/panel/` altında yazılır. Bu yol CLAUDE.md'deki "Django HTML üretmez" kuralının değişmesini gerektirir.
  - **Karar zamanı:** İlk panel özelliği (iletişim takibi ya da etiketleme) yazılmadan önce. Uygulama gibi kısımlar
    ağır basarsa Django şablonlarına kaymak daha az iş çıkarır.
- 
