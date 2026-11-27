# Alan Derinliği Hesaplayıcı / Depth of Field Calculator

Etkileşimli alan derinliği görselleştiricisi ve hesaplayıcı. Odak uzaklığı, diyafram, sensör, konu mesafesi ve drone kadrajı gibi değişkenlerin görüntüdeki keskin alanı nasıl etkilediğini canlı olarak gösterir.

Interactive depth-of-field visualizer and calculator: see how focal length, aperture, sensor size, subject distance and drone framing change the sharp zone of an image.

---

## Ana Yazar

**Çağdaş İNAL** — Türkçe uyarlama, drone modu ve genişletmeler.

Bu depo, Jack Herrington'ın MIT lisanslı [depth-of-field](https://github.com/jherr/depth-of-field) projesinin bir türevidir. Orijinal yazar ve lisans bilgileri korunmuştur (bkz. `LICENSE.txt`).

### Kapsam

- Türkçe arayüz ve Türkiye'de yaygın kamera ve lens verileri
- Drone kadrajı: yükseklik ve gimbal eğimi üzerinden konu mesafesi ve yer aralığı
- Odak, diyafram, sensör ve konu mesafesinin birlikte hesaplanması
- Mobil ve masaüstü uyumlu arayüz

### Temel tanımlar

- **Odak uzaklığı (f):** Merceğin optik merkezi ile sensör düzlemi arasındaki uzaklık, mm.
- **Diyafram (N):** f-sayısı; odak uzaklığının açıklık çapına oranı (f/N).
- **Odak mesafesi (s):** Kameradan odaklanılan konuya olan mesafe.
- **Karıştırma çemberi (c):** Bir noktanın nokta yerine leke olarak algılandığı en büyük çap. Tam kare için yaklaşık 0,03 mm, APS-C için yaklaşık 0,02 mm.
- **Hiperfokal mesafe (H):** Arka planın sonsuza kadar kabul edilebilir keskinlikte kaldığı, odaklanılan en yakın mesafe.

### Formüller

- H ≈ f² / (N · c) + f
- Yakın sınır: D_yakın = s · (H − f) / (H + s − 2f)
- Uzak sınır: D_uzak = s · (H − f) / (H − s)  (s ≥ H ise uzak sınır sonsuzdur)
- Alan derinliği: DoF = D_uzak − D_yakın

### Bilinen sorunlar

Açık hata ve iyileştirme listesi [CHANGES.md](CHANGES.md) dosyasında tutulur.

---

## Geliştiriciler

Katkılar memnuniyetle karşılanır. Aşağıdaki adımlar yeni bir geliştiricinin projeyi çalıştırıp test etmesi için yeterlidir.

### Kurulum

```bash
npm install
npm run dev      # geliştirme sunucusu
npm test         # birim testleri (tsx --test)
npm run lint     # ESLint
npm run build    # tip kontrolü + üretim derlemesi
```

Not: Erişilebilirlik ve mobil yerleşim testi (`App.responsive.test.tsx`) için Playwright tarayıcısının kurulu olması gerekir: `npx playwright install chromium`.

### Katkı süreci

1. Depoyu fork edin ve ana daldan yeni bir dal açın (`feature/kisa-ad` veya `fix/kisa-ad`).
2. Değişikliğinizi küçük ve tek amaçlı commit'lerle yapın.
3. `npm test`, `npm run lint` ve `npm run build` komutlarının geçtiğinden emin olun.
4. Pull request açın; ne değiştiğini ve neden değiştiğini kısaca anlatın. Arayüz değişikliklerinde ekran görüntüsü ekleyin.

### Kodun yapısı

- `src/App.tsx`: ana durum yönetimi, kamera, lens ve sensör seçimi
- `src/PhotographyGraphic.tsx`: SVG grafiği; konu, görüş konisi ve drone sahnesi
- `src/DroneCalculator.tsx`: drone yüksekliği ve gimbal eğiminden konu mesafesi hesabı
- `src/drone.ts`: drone geometrisi
- `src/gear.ts`: kamera, lens ve sensör verileri
- `src/i18n.ts`: Türkçe ve İngilizce metinler

### Lisans

MIT. Ayrıntılar için `LICENSE.txt`.

---

## English summary (for contributors)

This repository is a Turkish adaptation of Jack Herrington's MIT-licensed depth-of-field visualizer. The original author and license are preserved in `LICENSE.txt`. To contribute: fork, branch, keep commits small, make sure `npm test`, `npm run lint` and `npm run build` pass, then open a pull request with a short description and, for UI changes, a screenshot. Known issues are tracked in `CHANGES.md`.
