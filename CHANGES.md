# Değişiklik ve Hata Notları

## Orijinal geliştirici

Bu projenin orijinal yazarı **Jack Herrington**'dır (github.com/jherr/depth-of-field, MIT lisansı).
Aşağıdaki hatalar ve iyileştirme önerileri orijinal koda yapılan bir incelemeden çıkmıştır; amaç
projeyi küçültmek değil, hangi noktaların düzeltilmesi gerektiğini kayda geçirmektir.

## Orijinal koddaki hatalar

Durum: **açık** (bu sürümde düzeltilmedi; her biri ayrı onayla ele alınacak).

| # | Dosya | Hata | Etki | Doğrulama |
|---|-------|------|------|-----------|
| 1 | `src/App.tsx` (~satır 326) | Uzak sınır 360 inç (9.14 m) üstündeyse "∞" gösteriliyor, değer sonlu olsa bile. | Yanlış okuma. Örnek: 50 mm f/1.8, tam kare, konu 8 m. Uzak sınır 9.59 m, ama uygulama ∞ gösteriyor. | Elle hesaplandı: H ≈ 47.94 m. |
| 2 | `src/PhotographyGraphic.tsx` ve `App.tsx` mesafe kaydırıcısı | Kaydırıcı 10–400 inç; sürükleme (`Math.min(farDistanceInInches, …)`) 360 inç ile sınırlı. İki kontrol farklı aralıkta. | Sürükleme ile kaydırıcı aynı değeri vermiyor. | Kod okuması. |
| 3 | `src/App.tsx` otomatik pozlama | `autoIso` hesaplanmış ISO yerine ham `iso` ile çalışıyor (`correctShutter(ev, aperture, iso)`). | Otomatik modda pozlama hesabı gösterilen ISO ile uyuşmayabilir. | Kod okuması. |
| 4 | `src/App.tsx` özel sensör | Genişlik ve yükseklik 0 girilirse CoC 0 olur ve DoF formüllerinde sıfıra bölme oluşur. | Sonsuz veya NaN sonuçlar. | Kod okuması. |
| 5 | `src/utils/units.ts` `toImperial` | Kesir yuvarlaması fitten sonra yapılıyor. 11.96 inç → `0' 12.0"`. | Yanlış biçim. | Hesap. |
| 6 | `src/PhotographyGraphic.tsx` | `onMouseLeave` ve dokunmatik olay yok; fare SVG dışına çıkınca sürükleme takılabiliyor. | Mobilde kullanılamaz sürükleme. | Kod okuması. |
| 7 | `src/App.tsx` | Kısayol tooltip'i devre dışı butonu sarıyor; devre dışı öğelerde tooltip çalışmıyor. | Küçük UX hatası. | Kod okuması. |
| 8 | `src/i18n.ts` | `void CAT_KEYS;` ölü kod. | Okunabilirlik. | Kod okuması. |
| 9 | `src/App.tsx` | Bazı `aria-label` ve `alt` değerleri İngilizce sabit (`"Toggle color mode"`, `"Fisheye lens"`, `"100-400 lens"` vb.). | Çok dilli arayüzde erişilebilirlik tutarsız. | Kod okuması. |
| 10 | `src/App.tsx` giriş kutuları | Sabit `#ccc` kenarlık; koyu temada kontrast zayıf. | Görsel. | Kod okuması. |
| 11 | `.github/workflows/deploy.yml` | Dağıtım yalnızca build yapıyor; lint ve testler çalışmıyor. | Kırık kod yayına çıkabilir. | Dosya okuması. |
| 12 | Testler | 4 test var, optik hesaplar (DoF, hiperfokal, pozlama) için test yok. | Regresyon riski. | Dosya sayımı. |
| 13 | `src/App.responsive.test.tsx` | Playwright tarayıcısı kurulu değilse test düşüyor. | Yerel ortamda testler yeşil değil. | `npm test` çıktısı. Ortama bağlı, kod hatası değil. |
| 14 | `src/utils/units.ts` `toMetric` | Her zaman santimetre; metre gösterilmiyor. | Uzun mesafelerde okunabilirlik. | Kod okuması. |

Not: Kullanıcı incelemesinde verilen "596 kB paket boyutu" ve "2197 px sayfa yüksekliği" değerleri
bu sürümde doğrulanmadı.

## Yapılan geliştirmeler (Çağdaş İNAL)

### Cihaz veritabanı (`src/gear.ts`)
- Insta360: Ace Pro 2, Ace Pro, Ace, GO Ultra, Luna Ultra, Link 2 (webcam) eklendi.
- DJI: Osmo Pocket 4, Osmo Pocket 4P eklendi.
- Tüm değerler resmi kaynaklardan (insta360.com, onlinemanual.insta360.com, dji.com destek sayfaları) doğrulandı.
- Pocket 4P için 1/1.28" sensör gerekiyordu; buna ilişkin CoC girişi `App.tsx`'e eklendi.
- Insta360 Link 2 Pro eklendi: 1/1.3" sensör, f/1.9, 24 mm eşdeğer (Insta360 resmi sayfaları; eşdeğer odak DE sayfasından).
- Atlananlar: Logitech Brio 4K (sensör boyutu yayımlanmamış). Link 2 log profili doğrulanamadı.
- Doğrulanmamış değerler: üreticinin yayımlamadığı eşdeğer odaklar (ör. DJI Osmo Action 5 Pro 12 mm, Insta360 X3/X4/X5/X6 360° değerleri) artık satır adında "tahmini" ile işaretli. Uygulama menüsünde bu metin görünür.
- Akıllı telefon ön ayarı için iPhone 17 Pro'nun ana kamerası (24 mm eşdeğer, f/1.78, Apple) doğrulandı ama Apple sensör boyutunu yayımlamıyor. Pixel 10 Pro ana kamerası 1/1.3", f/1.68 (Google resmi sayfası) doğrulandı; telefon cihazları henüz veritabanına eklenmedi.

### Drone kadrajı
- `src/drone.ts`: İrtifa ve gimbal eğimine göre konu mesafesi ve yerdeki kare aralığı hesaplanır.
- `src/drone.test.tsx`: 6 birim testi.
- `src/DroneCalculator.tsx`: Mesafe kaydırıcısının altına eklenen panel. Hesaplanan mesafe tek tıkla uygulanabilir.
- Kaydırıcı en fazla 10.2 m olduğu için daha uzak konular sınırlanır ve uyarı gösterilir.

### Ön ayarlar, paylaşım ve kayıt
- `Drone` ön ayarı eklendi (1/1.3", f/1.7, 6.67 mm; DJI Mini 4 Pro sınıfı).
- `src/setupState.ts`: mesafe, odak, diyafram ve sensör değerleri URL'de (`?d=&f=&n=&s=`) tutulur; sayfa açılışında URL, yoksa son kayıt (`localStorage`, anahtar `dof-setup`) okunur. Geçersiz değerler atılır.
- `src/setupState.test.tsx`: 4 test (gidiş-dönüş, geçersiz değer, eksik anahtar, bilinmeyen sensör).

### Çok dilli metinler (`src/i18n.ts`)
- Drone panel metinleri 12 dilde (`DRONE_TEXT`).
- Dil seçicide Türkçe en üstte.

### Açılış
- Kayıtlı dil seçimi yoksa uygulama Türkçe açılır; tarayıcı dili artık dikkate alınmaz.
- `index.html`: `lang="tr"`.
- `package.json`: `contributors` alanına Çağdaş İNAL eklendi. `author` alanı orijinal geliştiricide kaldı.

### Kod notları
- Yukarıdaki açık hatalardan 1, 4, 5 ve 6 numaralı olanların yanına `KNOWN ISSUE` yorumu eklendi. Davranış değişmedi.

## Doğrulama

- `tsc --noEmit`: temiz.
- Birim testleri: drone (6), setupState (4), selectStyles (1), PhotographyGraphic (2) geçiyor. `App.responsive.test.tsx` Playwright tarayıcısı olmadığı için başarısız (ortam kaynaklı, koddan değil).
- Production build: başarılı.
- Hata listesindeki maddeler henüz düzeltilmedi.
