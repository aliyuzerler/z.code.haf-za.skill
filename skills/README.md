# skills/ — Küratörlü Skill Kataloğu

Bu dizin, resmî [affaan-m/ECC](https://github.com/affaan-m/ECC) deposunun `skills/` klasöründen
**seçilmiş 20 skill'in** (SKILL.md) kopyasıdır. Tam ECC kataloğu **311 skill** içerir; bu repo
sadece Next.js/TypeScript geliştirme döngüsünde en çok işe yarayan alt kümeyi taşır.

## Neden 20?

ECC-Z felsefesi: *"Optimize the context window. Persist everything else."* — 311 skill'i
taşımak yerine, seçilmiş az sayıda yüksek etkili skill + talep üzerine senkronizasyon.
İlk küme 11 geliştirme disiplini skill'iydi; ikinci dal olarak resmî katalogdaki
**frontend arayüz tasarımı** grubundan 9 skill eklendi (toplam 20).

## Skill Listesi

### Geliştirme disiplini (11)

| Skill | Kapsam |
|---|---|
| `api-design` | REST endpoint tasarımı, pagination, hata yanıtları, sürümleme |
| `backend-patterns` | Backend mimari desenleri, API route veri erişimi |
| `tdd-workflow` | Test-öncelikli geliştirme disiplini |
| `security-review` | Güvenlik checklist'i ve desenleri |
| `agent-security-hardening` | Agent runtime'ları için güvenlik sertleştirme |
| `react-performance` | React/Next.js performans desenleri (70+ kural) |
| `react-patterns` | React 18/19 kompozisyon ve hook disiplini |
| `error-handling` | Türlendirilmiş hata yönetimi, retry, circuit breaker |
| `bun-runtime` | Bun çalışma zamanı ve paket yöneticisi rehberi |
| `architecture-decision-records` | ADR dokümantasyon pratiği |
| `git-workflow` | Dal stratejileri, commit hijyeni, merge/rebase |

### Frontend arayüz tasarımı (9)

| Skill | Kapsam |
|---|---|
| `frontend-design-direction` | Ürün odaklı tasarım yönü: landing, dashboard, bileşen görsel kararları |
| `design-system` | Tasarım sistemi çıkarımı/denetimi; tokenlar, 10 boyutlu tutarlılık skoru |
| `make-interfaces-feel-better` | Arayüz parlatma: boşluk, tipografi, gölge, hareket, hit alanları |
| `frontend-patterns` | React/Next.js bileşen desenleri ve UI en iyi pratikleri |
| `frontend-a11y` | Erişilebilirlik: semantik HTML, ARIA, klavye, odak yönetimi |
| `motion-foundations` | motion/react temel katmanı: hareket tokenları, yay ön ayarları, SSR güvenliği |
| `motion-patterns` | Üretim animasyon desenleri: buton, modal, toast, sayfa geçişi, scroll |
| `motion-advanced` | İleri hareket: sürükle-bırak, jestler, SVG çizim, useAnimate |
| `frontend-slides` | Animasyon zengini HTML sunum sayfaları üretimi |

> Not: `motion-advanced`, `motion-foundations`'a bağlıdır; üç motion skill'i birlikte
> kullanılmak üzere tasarlanmıştır.

## Değerlendirilip Dahil Edilmeyenler

311 skill'lik katalogda tasarım-temalı görünen ama bu ortamın kapsamına girmeyenler:

- `accessibility` — WCAG 2.2 kapsamı Web+iOS+Android; web tarafı `frontend-a11y` ile karşılanıyor
- `liquid-glass-design` — iOS 26 özel (SwiftUI/UIKit); Next.js ortamına uymuyor
- `taste` / `taste-application` / `taste-distillation` — isim yanıltıcı: video estetiği/yönetmenliği
- `dashboard-builder` — Grafana/SigNoz operasyon panoları (web UI tasarımı değil)
- `ui-demo` — Playwright ile demo videosu kaydı (tasarım değil, tanıtım aracı)
- `vue-patterns` / `ui-to-vue` / `nuxt4-patterns` / `angular-developer` / `swiftui-patterns` — framework'e özel; yığın React/Next

## Güncelleme

```bash
npm run ecc:sync         # resmî affaan-m/ECC'den yeniden senkronize eder
npm run ecc:sync --list  # katalog durumunu gösterir
```

Senkronizasyon **yalnızca resmî kaynak** (`affaan-m/ECC`) üzerinden yapılır; fork'lar ECC
README'sinin üçüncü parti uyarısına tabidir.

## Kurulumda Nereye Gider?

`install.mjs`, bu dizindeki her skill'i hedef projenin `skills/<ad>/SKILL.md` yoluna kopyalar
(mevcut olanları atlar). Z.ai Code oturumları `skills/` altındaki SKILL.md dosyalarını
otomatik keşfeder.
