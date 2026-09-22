# 🛑 ZamanRadarı · YouTube için Bilişsel STOP Kalkanı
> **YouTube ana sayfası ve önerilerindeki zaman hırsızı videoları bilişsel radardan geçir; tık tuzaklarını ve boş tüketim vitrinlerini doğrudan küçük resim üzerinde teşhis et.**

[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-blue?style=flat-square&logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![TypeSafe Jev AI](https://img.shields.io/badge/Powered%20by-TypeSafe%20Jev-8b5cf6?style=flat-square)](https://typesafe.ai)
[![Privacy First](https://img.shields.io/badge/Gizlilik-Sıfır%20İzleme-10b981?style=flat-square)](#-gizlilik-ve-opsec)
[![License: MIT](https://img.shields.io/badge/Lisans-MIT-yellow?style=flat-square)](LICENSE)

---

## ⚡ Nedir ve Neden Var?

Modern video platformlarının algoritmaları, kullanıcının **zihinsel gelişimini veya zaman değerini** değil; platformda geçirilen **süreyi (watch time)** maksimize etmek üzere tasarlanmıştır. Bu durum kullanıcıları içi boş "oda turları", "çantamda ne var" tüketim vitrinleri ve abartılı tık tuzakları (clickbait) sarmalına hapseder.

**ZamanRadarı**, YouTube ile prefrontal korteksiniz arasına bilişsel bir kalkan yerleştirir. **TypeSafe Jev (System One AI)** motorunu kullanarak video başlıklarını, açıklamalarını ve izleyici konsensüsünü saniyenin onda biri hızında tartar; videoların üzerine doğrudan avant-garde bilişsel damgalar basar.

---

## 🎯 5 Bilişsel Karar Sınıfı (Verdicts)

| Karar Damgası | Renk / Stil | Anlamı ve İçerik Türü | Davranış |
| :--- | :--- | :--- | :--- |
| **🛑 STOP · ZAMAN KAYBI** | Derin Kırmızı Radyal | Kişisel eşya vitrinleri, bavul/oda turları, somut bilgi içermeyen rutin vloglar ve vakit hırsızı içerikler. | Görseli blurlar, merkezde net teşhis metni ve atık oranı (%) gösterir. |
| **⚠️ TIK TUZAĞI · DİKKAT** | Kehribar / Turuncu | Abartılı merak yemi, panik dili, başlık ile içerik vaadi uyuşmayan clickbait videolar. | Orta derece blur ve tık tuzağı uyarısı basar. |
| **✦ İZLENİR · DEĞERLİ** | Zümrüt Cam Rozet | Yüksek bilgi yoğunluğuna sahip belgeseller, derin teknik rehberler ve analitik incelemeler. | Görseli bozmaz; sol üstte şık, yarı saydam bir zümrüt rozet yerleştirir. |
| **✦ EĞLENCE · KEYFÎ** | Mor / Ametist Rozet | Kafa dağıtmalık mizah, skeç, oyun veya rahatlatıcı içerikler (bilgi iddiası olmayan). | Görseli bozmaz; sol üstte minimalist mor rozet basar. |
| **✦ BELİRSİZ · NÖTR** | Duman / Gri Cam Rozet | Başlık veya bağlamdan içerik kalitesi netleştirilemeyen nötr videolar. | Görseli karartmaz; sol üstte zarif duman rozetiyle tarafsız kalır. |

---

## ✨ Öne Çıkan Özellikler

* **🖼️ Küçük Resim Üzeri Doğrudan Teşhis (Thumbnail Overlay):** Harici kutular veya sayfa düzenini bozan bloklar yok. Her şey doğrudan YouTube küçük resminin üzerinde entegre çalışır.
* **👁️ Hover-to-Reveal (Kusursuz İnceleme):** Blurlanmış bir STOP videosunun üzerine fareyle geldiğinizde overlay anında kaybolur (`opacity: 0`), blur sıfırlanır ve YouTube'un hareketli video önizlemesi pürüzsüzce görünür.
* **📊 İzleyici Konsensüsü ve Atık Oranı (%):** Video izleme sayfalarında (`/watch`) yorumları ve açıklamayı derinlemesine tarayarak *"İzleyiciler: Zaman Kaybı 👎"* veya *"İzleyiciler: Çok Faydalı 👍"* gibi konsensüs hapları sunar.
* **🌐 Tüm YouTube Sayfalarında Aktif:** Yalnızca ana sayfa değil; arama sonuçları, `/feed/subscriptions` (Abonelikler), kanal sayfaları ve öneri sütunlarında kesintisiz çalışır.
* **💾 Akıllı Oturum ve Kalıcı Bellek:** TypeSafe API anahtarını ister sadece oturum süresince tutun, ister "Bu tarayıcıda hatırla" seçeneğiyle kalıcı olarak güvenle saklayın.
* **⚡ 24 Saatlik Yerel Önbellek (Sub-ms Cache):** Daha önce taranan videolar yerel belleğe alınır; aynı video için tekrar tekrar API çağrısı yapılmaz, kota ve token israfı önlenir.

---

## 🚀 Kurulum (Adım Adım)

Bu eklenti Chrome Web Store gerektirmeden doğrudan **Geliştirici Modu (Developer Mode)** ile kurulur:

1. Bu depoyu indirin veya klonlayın:
   ```bash
   git clone https://github.com/kullanici-adiniz/zaman-radari.git
   ```
2. Chrome, Brave, Edge veya Arc tarayıcınızda eklentiler sayfasına gidin:
   * Chrome / Brave: `chrome://extensions`
   * Edge: `edge://extensions`
3. Sağ üst köşedeki **Geliştirici Modu (Developer Mode)** anahtarını açın.
4. Sol üstteki **Paketlenmemiş Öğe Yükle (Load Unpacked)** butonuna tıklayın.
5. Klonladığınız klasörü seçin.
6. Tarayıcı araç çubuğundaki 🛑 simgesine tıklayın, [TypeSafe](https://typesafe.ai) API anahtarınızı girin ve **"Kaydet ve Radarı Başlat"** butonuna basın.
7. YouTube sekmenizi yenileyin ve bilişsel kalkanın tadını çıkarın!

---

## 🔒 Gizlilik ve OPSEC

* **Sıfır Telemetri:** Eklenti hiçbir analiz veya kullanıcı verisini üçüncü taraf sunuculara göndermez.
* **Sıfır Çerez Erişimi:** YouTube hesap bilgileriniz, oturum çerezleriniz veya izleme geçmişiniz asla okunmaz veya saklanmaz.
* **Yalnızca Herkese Açık Metaveri:** Analiz için yalnızca video başlığı, kanal adı ve varsa ilk birkaç herkese açık yorum satırı TypeSafe API'sine iletilir.

---

## 🛠️ Mimari & Dosya Yapısı

```
├── manifest.json        # Chrome Manifest V3 konfigürasyonu
├── background.js       # Service worker, kuyruk yönetimi, rate-limit ve oturum belleği
├── core.js             # Jev System One soru matrisi, karar sınıflandırıcısı ve temizleme motoru
├── content.js          # YouTube DOM gözlemcisi (IntersectionObserver), thumbnail overlay renderer
├── content.css         # Avant-garde görsel üzeri CSS, radial vignette ve cam efektleri
├── popup.html          # Modern minimalist ayarlar ve kontrol arayüzü
├── popup.css           # Popup dark-theme stili
├── popup.js            # Popup reaktif durum yönetimi ve test tetiği
├── icons/              # 16, 32, 48, 128 px eklenti ikonları
└── LICENSE             # MIT Lisansı
```

---

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) altında açık kaynak olarak sunulmaktadır.
İstediğiniz gibi çatallayabilir (fork), geliştirebilir ve kendi filtrelerinizi ekleyebilirsiniz.
