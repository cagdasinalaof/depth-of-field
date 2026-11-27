# depth-of-field

## Türkçe

Depth of field (DoF, alan derinliği): kamerada görüntünün kabul edilebilir keskinlikte göründüğü en yakın ve en uzak nokta arasındaki mesafe aralığı.

### Temel tanımlar

Odak uzaklığı (f): Merceğin optik merkezi ile sensör düzlemi arasındaki uzaklık, mm cinsinden.

Diyafram (N): f-sayısı; odak uzaklığının açıklık çapına oranı (f/N).

Odak mesafesi (s): Kameradan odaklanılan konuya olan mesafe.

Karıştırma çemberi (c): Bir noktanın nokta yerine leke olarak algılandığı en büyük çap. Tam kare için yaklaşık 0,03 mm, APS-C için yaklaşık 0,02 mm.

Hiperfokal mesafe (H): Arka planın sonsuza kadar kabul edilebilir keskinlikte kaldığı, odaklanılan en yakın mesafe.

### Formüller

H ≈ f² / (N · c) + f

Yakın sınır: D_yakın = s · (H − f) / (H + s − 2f)

Uzak sınır: D_uzak = s · (H − f) / (H − s)  (s ≥ H ise uzak sınır sonsuzdur)

Alan derinliği: DoF = D_uzak − D_yakın

## English

Depth of field (DoF) is the range of distance within a scene that appears acceptably sharp in the image.

### Core definitions

Focal length (f): The distance between the lens's optical center and the sensor plane, in mm.

Aperture (N): The f-number; the ratio of focal length to aperture diameter (f/N).

Subject distance (s): The distance from the camera to the focused subject.

Circle of confusion (c): The largest spot a point can blur into while still looking like a point. About 0.03 mm for full frame, about 0.02 mm for APS-C.

Hyperfocal distance (H): The closest focus distance at which the background stays acceptably sharp out to infinity.

### Formulas

H ≈ f² / (N · c) + f

Near limit: D_near = s · (H − f) / (H + s − 2f)

Far limit: D_far = s · (H − f) / (H − s)  (if s ≥ H, the far limit is infinity)

Depth of field: DoF = D_far − D_near
