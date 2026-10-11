<!-- TARAYICIDA_CEVRIMDISI_SURUM -->
**[TARAYICIDA CALISAN SURUMU AC](https://rusebound.github.io/OCR-Chrome-Edge/)** - Kurulumsuz, belgeyi sunucuya yuklemeden calisir. Bu web surumu Windows EXE motorunun tum ozelliklerine esdeger degildir. Ayrintilar: [Gizlilik ve Sinirlar](docs/GIZLILIK_VE_SINIRLAR.md).
Web kaynak kodu: [web-src](web-src/). GitHub Pages yayinindan once ve sonra kurum BT politikaniza uyun.
<!-- /TARAYICIDA_CEVRIMDISI_SURUM -->

# OCR — Chrome ve Edge için Türkçe Metin Tanıma

**Yayıncı: DEMİRHAN ÖZDEMİR** · **Arayüz ve belgeler: Türkçe** · **Sürüm: 1.2.0** · **Platform: Google Chrome / Microsoft Edge**

![Türkçe](https://img.shields.io/badge/Dil-Türkçe-blue) ![Çevrimdışı OCR](https://img.shields.io/badge/OCR-Çevrimdışı-informational) ![Durum](https://img.shields.io/badge/Yayın-Önizleme-orange)

Web sayfalarında seçtiğiniz alanın içindeki **Türkçe yazıları tanıyıp kopyalanabilir metne dönüştüren** tarayıcı eklentisi. Resimdeki metni elle yeniden yazmak yerine alan seçerek sonuç almayı hedefler.

**[⬇ OCR 1.2.0 — GitHub'dan İndir](https://github.com/rusebound/OCR-Chrome-Edge/releases/tag/v1.2.0)**

## Ne işe yarar, kime fayda sağlar?

| Kullanım | Sağladığı fayda |
|---|---|
| Web sayfasındaki metin içeren görseller | Metni elle yazmak yerine seçip kopyalamak |
| Kopyalanamayan görsel yazılar | Kopyalanabilir Türkçe metin üretmek |
| Ekrandaki alıntı veya notlar | Seçilen bölümü alıp notlara aktarmak |
| Uzun Türkçe ifadeler | Yazım süresini azaltmak; sonradan kontrol ederek kullanmak |

### Öne çıkan özellikler

- **Türkçe odaklı:** Paketlenmiş Tesseract Türkçe dil modeliyle metin tanıma.
- **Alan seçme:** Görünen web sekmesinde fareyle bir dikdörtgen çizme.
- **Tek kısayolla başlatma:** Varsayılan `Alt+Shift+O`; tarayıcı ayarlarından değiştirilebilir.
- **Metni kopyalama:** Tanınan metni inceleyerek veya düzelterek kullanma.
- **Çevrimdışı tanıma:** Tesseract.js, WebAssembly ve Türkçe dil paketi arşivde bulunur.
- **İki tarayıcı:** Chrome ve Edge için aynı eklenti dosyaları kullanılabilir.

## 1 dakikada kurulum

1. **[Releases](https://github.com/rusebound/OCR-Chrome-Edge/releases/tag/v1.2.0)** sayfasından `Chrome-OCR.zip`, `Edge-OCR.zip` veya `OCR-Chrome-Edge.zip` dosyalarından **yalnızca birini** indirin. Üçünün içeriği aynıdır.
2. ZIP dosyasını bir klasöre çıkarın. İçinde `manifest.json` bulunan **OCR** klasörünü bulun.
3. Chrome'da `chrome://extensions`; Edge'de `edge://extensions` adresini açın.
4. **Geliştirici modu**nu etkinleştirip **Paketlenmemiş öğe yükle / Açılmışı yükle** seçeneğiyle **OCR** klasörünü yükleyin.
5. Eklentinin istediği site izinlerini dikkatle gözden geçirin.

## Günlük kullanım

1. Metin bulunan web sayfasını açın.
2. **Alt+Shift+O** tuşlarına basın veya OCR eklenti simgesini tıklayın.
3. Fareyle okunmasını istediğiniz alanı seçin.
4. Tanınan Türkçe metni kontrol edin; gerekirse düzeltin.
5. Metni kopyalayıp istediğiniz yere **Ctrl+V** ile yapıştırın.

**Kısayol değiştirme:** Chrome `chrome://extensions/shortcuts`; Edge `edge://extensions/shortcuts`.

## Sık sorulan sorular

**Windows masaüstündeki bütün uygulamaları tarayabilir mi?** Hayır. Bu bir **tarayıcı eklentisidir**; diğer Windows pencerelerini veya tüm ekranı okuyamaz. Web sayfasındaki görünür sekme alanıyla sınırlıdır.

**Bütün sitelerde çalışır mı?** Normal HTTP/HTTPS sayfaları için geniş site izni istenir, ancak tarayıcı özel sayfaları (`chrome://`, `edge://`), mağazalar ve bazı korumalı görüntüleyiciler erişilemez. `file://` ve gizli pencereler ek izin gerektirebilir.

**İnternet bağlantısı gerekiyor mu?** OCR modelleri pakete dahildir; metin tanıma internet hizmetine bağımlı değildir.

**Metni her zaman hatasız tanır mı?** Hayır. Küçük yazı, düşük çözünürlük, eğik metin ve karmaşık arka plan doğruluğu düşürebilir. Özellikle tarih, sayı ve özel isimleri kontrol edin.

## Güvenlik ve gizlilik

Uzantı manifestinde `activeTab`, `scripting`, `offscreen`, `clipboardWrite` ve `<all_urls>` izinleri yer alır. **Tüm sitelere erişim geniş bir yetkidir**; yalnızca güvenilir kodu yükleyin ve tarayıcıdan izinleri ihtiyaçlarınıza göre sınırlandırın. Kaynak JavaScript dosyaları bu depoda görülebilir. Bağımsız kapsamlı güvenlik/ağ trafiği sertifikasyonu yapılmamıştır.

## Geliştirici bilgileri ve indirme doğrulaması

**Teknolojiler:** JavaScript, Manifest V3, Tesseract.js, WebAssembly, Türkçe `tur.traineddata`.

Üç ZIP'in de SHA-256 değeri: `647297DAA9B158832AB8C849C33DA87E8706026C100BD4B4540E1DB8151994B8`.

PowerShell ile: `Get-FileHash '.\OCR-Chrome-Edge.zip' -Algorithm SHA256`.

**Yayın durumu:** Önizleme sürümü. GitHub yüklemesi ve dosya bütünlüğü doğrulandı; bağımsız uçtan uca tarayıcı ve güvenlik testleri yapılmadı. Üçüncü taraf bileşenlerin lisans metinleri paket içindedir.

**Sorun bildirme:** [GitHub Issues](https://github.com/rusebound/OCR-Chrome-Edge/issues) — gizli veya kişisel verilerinizi paylaşmayın.

---

**Yayıncı: DEMİRHAN ÖZDEMİR** · [GitHub profili](https://github.com/rusebound)

**English (short summary):** Offline Turkish OCR extension for Chrome and Edge. Select a visible webpage region, recognize text locally and copy the result. This is not a system-wide screen capture tool.
