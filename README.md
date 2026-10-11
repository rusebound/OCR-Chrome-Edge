# OCR — Türkçe Metin Tanıma (Chrome & Edge)

![Sürüm](https://img.shields.io/badge/sürüm-1.2.0-blue) ![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Edge-informational)

**OCR**, web sayfalarında fareyle seçtiğiniz görünür alanlardaki Türkçe metni çevrimdışı tanıyarak panoya kopyalayan tarayıcı eklentisidir. Tesseract.js, WebAssembly motoru ve Türkçe dil modeli pakete dahildir.

**[İndir: GitHub Releases](https://github.com/rusebound/OCR-Chrome-Edge/releases/tag/v1.2.0)**

## Özellikler

- Sayfa üzerinde dikdörtgen alan seçme ve Türkçe metin tanıma.
- Tanınan metni inceleme, düzeltme ve kopyalama.
- Normal kullanımda yerel/çevrimdışı OCR.
- Chrome ve Edge desteği; kullanıcı tarafından değiştirilebilen kısayol.
- Varsayılan kısayol: **Alt+Shift+O**.

## Kurulum

1. Releases bölümünden `Chrome-OCR.zip`, `Edge-OCR.zip` veya `OCR-Chrome-Edge.zip` indirin. **Üçü SHA-256 düzeyinde aynı pakettir; tek dosya yeterlidir.**
2. ZIP'i tamamen çıkarın. İçinde `OCR/manifest.json` bulunan **OCR** klasörünü seçin.
3. Chrome için `chrome://extensions`, Edge için `edge://extensions` açın.
4. **Geliştirici modu** → **Paketlenmemiş öğe yükle / Açılmışı yükle** seçimini kullanın.
5. İzinleri inceleyin, sonra eklenti simgesi veya **Alt+Shift+O** ile görünür sekmeden alan seçin.
6. Kısayolu değiştirmek için `chrome://extensions/shortcuts` veya `edge://extensions/shortcuts` sayfasını açın.

## İzinler, gizlilik ve önemli sınırlar

`manifest.json`, `activeTab`, `scripting`, `offscreen`, `clipboardWrite` ve **`<all_urls>`** izinlerini içerir. Geniş site izni kullanıcı tarafından sınırlandırılabilir. Eklenti **Windows masaüstündeki başka programları tarayamaz**; `chrome://`, `edge://`, mağazalar, bazı korumalı PDF görünümleri gibi tarayıcı özel sayfalarına erişemez. Yerel dosya ve gizli pencere izni ayrı gerekebilir.

OCR doğruluğu kaynak görselin kalitesiyle değişir; %100 garanti edilmez. Bu yayın kapsamında bağımsız uçtan uca tarayıcı testi veya güvenlik denetimi yapılmamıştır.

## Bütünlük doğrulaması

Her üç ZIP'in SHA-256 değeri:

`647297DAA9B158832AB8C849C33DA87E8706026C100BD4B4540E1DB8151994B8`

Windows PowerShell: `Get-FileHash .\OCR-Chrome-Edge.zip -Algorithm SHA256`

## Geliştirici bilgisi

Manifest V3, JavaScript, Tesseract.js, WebAssembly, Türkçe dil verisi. Bu depoda uzantı kodu ve lisans metinleri bulunur. Üçüncü taraf bileşenlerin lisanslarına uyun; proje sahibinin kodunun başka projelerde kullanımı için ayrı bir lisans açıklaması gereklidir.

**English:** Offline Turkish OCR browser extension for Chrome and Edge. Select part of a visible web page and copy recognized text. Not a system-wide Windows OCR application.

Sorunlar ve öneriler: [Issues](https://github.com/rusebound/OCR-Chrome-Edge/issues). Kişisel veri içeren görüntüler paylaşmayın.
