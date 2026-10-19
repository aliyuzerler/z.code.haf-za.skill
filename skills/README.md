# skills/ — Küratörlü Skill Kataloğu

Bu dizin, resmî [affaan-m/ECC](https://github.com/affaan-m/ECC) deposunun `skills/` klasöründen
**seçilmiş 11 skill'in** (SKILL.md) kopyasıdır. Tam ECC kataloğu 300+ skill içerir; bu repo
sadece Next.js/TypeScript geliştirme döngüsünde en çok işe yarayan alt kümeyi taşır.

## Neden 11?

ECC-Z felsefesi: *"Optimize the context window. Persist everything else."* — 311 skill'i
taşımak yerine, seçilmiş az sayıda yüksek etkili skill + talep üzerine senkronizasyon.

## Skill Listesi

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

## Güncelleme

```bash
npm run ecc:sync         # resmî affaan-m/ECC'den yeniden senkronize eder
npm run ecc:sync --list  # katalog durumunu gösterir
```

Senkronizasyon **yalnızca resmî kaynak** (`affaan-m/ECC`) üzerinden yapılır; fork'lar ECC
README'sinin üçüncü parti uyarısına tabidir.

## Kurulumda Nereye Gider?

`install.mjs`, bu dizindeki her skill'i hedef projenin `skills/<ad>/SKILL.md` yoluna kopyalar
(Z.ai Code tarzı skill otomatik keşfi için). Kurulumdan sonra `memory/synced-skills.json`
manifest'i bu kataloğu işaret eder.
