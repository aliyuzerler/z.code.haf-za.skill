# ECC-Z Kurulum Rehberi

> Bu rehber, ECC-Z disiplin sistemini **herhangi bir projeye** (zcode masaüstü, Z.ai Code,
> Claude Code, Cursor, Codex vb. hangi agent CLI kullanıyorsan) adım adım kurmanı sağlar.
> Toplam süre: **~5 dakika**. Kurulum sonrası sistem otomatik çalışır; tek gereken, agent'ına
> oturum ritüelini söyletmektir (Bölüm 5).

---

## İçindekiler

1. [Bu Sistem Neyi Kurar?](#1-bu-sistem-neyi-kurar)
2. [Ön Koşullar](#2-ön-koşullar)
3. [Yöntem A — Otomatik Kurulum (önerilen)](#3-yöntem-a--otomatik-kurulum-önerilen)
4. [Yöntem B — Manuel Kurulum](#4-yöntem-b--manuel-kurulum)
5. [Agent'ına Sistem Tanıtma (en kritik adım)](#5-agentına-sistem-tanıtma-en-kritik-adım)
6. [Kurulum Doğrulama Checklist](#6-kurulum-doğrulama-checklist)
7. [Günlük Kullanım Akışı](#7-günlük-kullanım-akışı)
8. [Yapılandırma](#8-yapılandırma)
9. [Güncelleme ve Kaldırma](#9-güncelleme-ve-kaldırma)
10. [Sorun Giderme](#10-sorun-giderme)

---

## 1. Bu Sistem Neyi Kurar?

ECC-Z, [affaan-m/ECC](https://github.com/affaan-m/ECC) "Agent Harness OS"inin agent CLI'lara
uyarlanmış halidir. Kurduğunda şunları kazanır:

| Bileşen | Ne yapar | Nerede |
|---|---|---|
| **Bellek (hafıza)** | Proje bağlamı + öğrenilmiş davranış kuralları (içgüdüler) + oturum özetleri kalıcı tutulur | `ecc-z/memory/` |
| **Bağlam yükleyici** | Her oturum başında "Session Brief" üretir: bellek + içgüdüler + son 3 oturum özeti + skill kataloğu | `ecc-z/core/context-loader.mjs` |
| **Doğrulayıcı** | Her düzenlemeden sonra lint (+ istersen tsc) çalıştırır; FAIL varsa devam edilmez | `ecc-z/core/verify.mjs` |
| **Güvenlik taraması (Shield)** | Secret sızıntısı, prompt injection, tehlikeli kod desenleri taraması | `ecc-z/core/shield-scan.mjs` |
| **Oturum kaydedici** | Kapanışta özet + içgüdü pekiştirme + 30 gün prune | `ecc-z/core/session-save.mjs` |
| **Agent ordusu** | 8 uzman agent (planner, architect, code-reviewer, security-reviewer, tdd-guide, build-error-resolver, refactor-cleaner, doc-updater) + yönlendirici | `ecc-z/agents/` |
| **Kural seti** | Evrensel kurallar + Next.js/TS stack kuralları | `ecc-z/rules/` |
| **Skill senkronizasyonu** | Resmî ECC deposundan küratörlü skill'ler (api-design, security-review, tdd-workflow…) | `ecc-z/core/skill-sync.mjs` |

**Mimari detay:** `ARCHITECTURE.md` dosyasına bak.

---

## 2. Ön Koşullar

- **Node.js ≥ 18** veya **bun** (core script'leri bağımlılıksız ESM'dir; ikisi de çalışır)
- Kurulum yapacağın bir proje dizini (boş veya mevcut fark etmez)
- Git (repo klonlamak için)
- Bir agent CLI: zcode masaüstü, Z.ai Code, Claude Code, Cursor vb.

---

## 3. Yöntem A — Otomatik Kurulum (önerilen)

Tek komutla kurar. **Güvenlidir:** mevcut bellek dosyalarını ve mevcut `AGENTS.md`'ni asla
üzerine yazmaz.

```bash
# 1) Repoyu geçici bir yere klonla
git clone https://github.com/aliyuzerler/z.code.haf-za.skill.git /tmp/ecc-z

# 2) Hedef projene kur (yolu kendi projenle değiştir)
node /tmp/ecc-z/install.mjs /yol/projenim/dizini

# (bun kullanıyorsan)
bun /tmp/ecc-z/install.mjs /yol/projenim/dizini
```

Beklenen çıktı:

```
═══ ECC-Z Kurulum ═══
  ✓ ecc-z/core/ kopyalandı
  ✓ ecc-z/agents/ kopyalandı
  ✓ ecc-z/rules/ kopyalandı
  ✓ ecc-z/AGENTS.md (disiplin anayasası) kopyalandı
  ✓ ecc-z/memory/MEMORY.md oluşturuldu
  ...
═══ Kurulum tamamlandı ═══
```

Kurulum şu yerleşimi yapar:

```
<proje>/
├── AGENTS.md                  ← agent CLI'ların otomatik okuduğu talimat dosyası
├── package.json               ← "ecc:*" script'leri eklendi
├── ecc-z/                     ← SİSTEMİN TAMAMI
│   ├── AGENTS.md              ← disiplin anayasası (7 madde + V1-V6 ihlal tanımları)
│   ├── SKILL.md               ← meta-skill
│   ├── core/                  ← 5 script + tsconfig.verify.json
│   ├── agents/                ← 8 agent + INDEX.md (router)
│   ├── rules/                 ← RULES.md + nextjs-typescript.md
│   └── memory/                ← MEMORY.md, instincts.json, allowlist, manifest
│       ├── session-data/      ← oturum özetleri (runtime)
│       └── metrics/           ← loglar (runtime)
└── skills/
    └── ecc-z/SKILL.md         ← skill otomatik keşfi için (Z.ai Code bunu kayıt eder)
```

Kurulumdan sonra **Bölüm 5**'e geç (agent'a sistem tanıtma) ve **8. Bölüm**'de MEMORY.md'yi
doldur.

---

## 4. Yöntem B — Manuel Kurulum

Script çalıştırmak istemiyorsan, repoyu klonla ve dosyaları elle yerleştir:

```bash
git clone https://github.com/aliyuzerler/z.code.haf-za.skill.git /tmp/ecc-z
cd /tmp/ecc-z
```

**Adım 1 — Dosya yerleşimi:**

| Repo içindeki | Hedef (projenin içinde) |
|---|---|
| `core/` | `ecc-z/core/` |
| `agents/` | `ecc-z/agents/` |
| `rules/` | `ecc-z/rules/` |
| `commands/` | `ecc-z/commands/` |
| `hooks/` | `ecc-z/hooks/` |
| `workflow/` | `ecc-z/workflow/` |
| `memory/` | `ecc-z/memory/` |
| `skills/<ad>/SKILL.md` | `skills/<ad>/SKILL.md` (proje kökü — skill keşfi için) |
| `AGENTS.md` | `ecc-z/AGENTS.md` |
| `SKILL.md` | `ecc-z/SKILL.md` **ve** `skills/ecc-z/SKILL.md` |
| `PROJECT-AGENTS.md` | `<proje kökü>/AGENTS.md` (yoksa; varsa içeriğini birleştir) |

**Adım 2 — `package.json`'a script'leri ekle** (`package-scripts.json` dosyasından kopyala):

```json
{
  "scripts": {
    "ecc:context": "node ecc-z/core/context-loader.mjs",
    "ecc:save": "node ecc-z/core/session-save.mjs",
    "ecc:verify": "node ecc-z/core/verify.mjs",
    "ecc:shield": "node ecc-z/core/shield-scan.mjs",
    "ecc:sync": "node ecc-z/core/skill-sync.mjs"
  }
}
```

> `npm` yerine bun kullanıyorsan komutlar aynıdır: `bun run ecc:context` vs.

**Adım 3 — Runtime dizinlerini oluştur:**

```bash
mkdir -p ecc-z/memory/session-data ecc-z/memory/metrics
```

---

## 5. Agent'ına Sistem Tanıtma (en kritik adım)

Dosyalar kurulduktan sonra sistemin çalışması, agent'ının (zcode masaüstü vb.) şu iki dosyayı
okumasına ve oturum ritüeline uymasına bağlıdır.

### 5.1 Otomatik katman (çoğu CLI bunu kendisi yapar)

- **`AGENTS.md` (proje kökü):** zcode, Claude Code, Cursor, Codex vb. araçlar proje kökündeki
  `AGENTS.md` / `CLAUDE.md` dosyasını **her oturumda otomatik bağlama alır**. Kurulum bu dosyayı
  oluşturduğu için genelde ek işlem gerekmez.
- **`skills/ecc-z/SKILL.md`:** skill keşfi destekleyen ortamlarda (Z.ai Code gibi) bu dosya
  otomatik kayıt edilir; agent "ne zaman kullanacağını" frontmatter'daki `description`'dan bilir.

### 5.2 Ritüel prompt'u (garantiye alma)

En sağlam yol: agent'ına oturumun **başında ve sonunda** ne yapacağını prompt ile söyletmektir.
zcode masaüstünde (veya kullandığın CLI'da) şu metni sistem prompt'una / ilk mesaja yapıştır:

**Oturum açılış prompt'u (kopyala-yapıştır):**

```text
Bu proje ECC-Z disiplin sistemiyle çalışır. Şu kurallara uy:

1. Oturum başında İLK İŞ olarak şunu çalıştır ve çıktıyı (Session Brief) tamamen oku:
   npm run ecc:context
2. Session Brief'teki içgüdüler (instincts) bu oturumda bağlayıcıdır.
3. Karmaşık işlerde önce ecc-z/agents/INDEX.md router'ından uygun agent'ı seç,
   tanım dosyasını oku ve koddan önce plan üret.
4. Her anlamlı kod düzenlemesinden sonra şunu çalıştır; FAIL varsa düzeltmeden devam etme:
   npm run ecc:verify
5. Commit veya teslim öncesinde şunu çalıştır; HIGH bulgu varsa dur ve önce çöz:
   npm run ecc:shield
6. Oturum kapanışında şunu çalıştır (özeti verdiğim içerikle):
   npm run ecc:save --summary "..."
7. Anayasa: ecc-z/AGENTS.md — kuralları ihlal etme (V1-V6 ihlal tanımları orada).
```

**Oturum kapanış prompt'u:**

```text
Oturumu kapat. Şunu çalıştır:
npm run ecc:save --summary "<bu oturumda yapılanlar, kararlar, sonraki adımlar>"
Öğrenilen bir davranış kuralı varsa:
npm run ecc:save --instinct "tetik::aksiyon::0.9::domain"
```

> **Not:** `npm`'i kendi paket yöneticinle değiştir (bun/pnpm/yarn — komutlar aynıdır).
> Ayrıca `npm run ecc:context` çıktısı iletiye yapıştırılmaz; agent çıktıyı okumakla yükümlüdür.

### 5.3 Komut dosyaları (commands/)

`ecc-z/commands/` altındaki 7 dosya, agent'ına doğrudan verebileceğin hazır prompt'lardır:
`/ecc-context`, `/ecc-verify`, `/ecc-shield`, `/ecc-save`, `/ecc-sync`, `/ecc-plan`, `/ecc-review`.
Hook API'si olan CLI'larda (Claude Code vb.) `ecc-z/hooks/README.md`'deki örnek config ile bu
adımları otomatik tetikleyebilirsin.

### 5.4 zcode masaüstü için özel not

- zcode masaüstü proje bazlı çalışır: sistemi kurmak istediğin **her proje için** bu kurulumu
  o projenin dizininde tekrarla (install.mjs idempotent'tir — istediğin kadar çalıştırabilirsin).
- Global (tüm projelerde geçerli) istersen: zcode'un global talimat dosyasına (varsa
  `~/.zcode/AGENTS.md` veya ayarlardaki system prompt alanına) Bölüm 5.2'deki ritüel prompt'unu
  koy; proje bazlı bellek yine de her projedeki `ecc-z/memory/` altında tutulur.
- zcode hook API'si sunmuyorsa sistem yine çalışır — çünkü zorlama katmanı `AGENTS.md`
  anayasasıdır (yumuşak hook). İhlaller V1-V6 olarak tanımlıdır; agent'a "bunlara uy" denir.

---

## 6. Kurulum Doğrulama Checklist

Kurulumdan sonra sırayla çalıştır; hepsi geçmeli:

| # | Komut | Beklenen |
|---|---|---|
| 1 | `npm run ecc:context` | "Session Brief" başlıklı çıktı: bellek + içgüdüler (≥5 bootstrap) + boş oturum listesi |
| 2 | `npm run ecc:verify` | PASS (lint çalışır; projede lint yoksa bilgilendirir, hata değil) |
| 3 | `npm run ecc:shield` | "0 HIGH" veya düşük sayıda bulgu raporu |
| 4 | `npm run ecc:sync --list` | Katalog listesi (11 skill yüklü değilse "yüklü değil" işaretli) |
| 5 | `npm run ecc:save --summary "kurulum testi"` | `ecc-z/memory/session-data/` altında yeni .md dosyası |
| 6 | `npm run ecc:save --prune` | Test kaydı temizlenir (30 gün kuralı) veya sayı raporlanır |

Hepsi geçtiyse sistem kuruludur. ✅

---

## 7. Günlük Kullanım Akışı

```
┌─ OTURUM AÇILIŞI ────────────────────────────────────────┐
│ agent: npm run ecc:context → Session Brief'i oku        │
│ (bellek + içgüdüler + son oturumlar yüklenir)           │
└──────────────────────────────────────────────────────────┘
┌─ GELİŞTİRME ─────────────────────────────────────────────┐
│ karmaşık iş → INDEX.md router → agent seç → plan         │
│ her düzenleme turu → npm run ecc:verify                  │
│ kritik adım → npm run ecc:verify --types                 │
└──────────────────────────────────────────────────────────┘
┌─ KAPANIŞ ────────────────────────────────────────────────┐
│ npm run ecc:shield        (HIGH varsa dur)               │
│ npm run ecc:save --summary "..."  (özet)                 │
│ npm run ecc:save --instinct "..." (yeni kural öğrenildi) │
│ npm run ecc:save --note "..."     (kalıcı karar)         │
└──────────────────────────────────────────────────────────┘
```

İçgüdüler zamanla pekişir: aynı tetik-aksiyon tekrar kaydedilirse `confidence` artar,
eşik üstündekiler (≥0.7) her Session Brief'e girer. Sistem kullandıkça öğrenir.

---

## 8. Yapılandırma

### 8.1 Zorunlu ilk ayar — MEMORY.md

`ecc-z/memory/MEMORY.md` dosyasını aç, "Proje Bağlamı" bölümünü kendi projenle doldur.
Bu dosya her Session Brief'in çekirdeğidir.

### 8.2 Ortam değişkenleri (opsiyonel)

| Değişken | Varsayılan | Anlamı |
|---|---|---|
| `ECCZ_SESSION_START_MAX_CHARS` | 6000 | Session Brief karakter bütçesi |
| `ECCZ_MAX_INJECTED_INSTINCTS` | 6 | Brief'e giren maksimum içgüdü sayısı |
| `ECCZ_INSTINCT_CONFIDENCE_THRESHOLD` | 0.7 | Brief'e girme eşiği |
| `ECCZ_SESSION_COUNT` | 3 | Brief'e giren oturum özeti sayısı |
| `ECCZ_RETENTION_DAYS` | 30 | Oturum özeti saklama süresi |

### 8.3 Tip kontrolü kapsamı

`ecc-z/core/tsconfig.verify.json` varsayılan olarak proje kökündeki `tsconfig.json`'ı extend
eder ve `src/` altını tarar. Proje yapın farklıysa `include` dizisini kendi düzenine göre
değiştir. `src/` olmayan projelerde include'u `["**/*.ts", "**/*.tsx"]` gibi düzenleyebilir veya
tip kontrolünü kapatıp yalnızca lint'e bırakabilirsin.

### 8.4 Kuralları özelleştirme

- `ecc-z/rules/RULES.md` — evrensel kurallar (her projeye uyar)
- `ecc-z/rules/nextjs-typescript.md` — Next.js + TS stack'i kullanmıyorsan sil veya kendi
  stack'ine göre düzenle
- `ecc-z/AGENTS.md` — anayasa; maddeleri projene göre yumuşat/sertleştir

### 8.5 Skill ekleme

```bash
npm run ecc:sync            # resmî affaan-m/ECC deposundan küratörlü skill'leri indirir
npm run ecc:sync --list     # katalog durumu
```

Kaynak **yalnızca resmî `affaan-m/ECC`** deposudur; fork'lar üçüncü parti risk taşır
(ECC README'sinin uyarısı).

---

## 9. Güncelleme ve Kaldırma

**Güncelleme:**

```bash
git -C /tmp/ecc-z pull https://github.com/aliyuzerler/z.code.haf-za.skill.git
node /tmp/ecc-z/install.mjs /yol/projen
```

Sistem dosyaları yenilenir; **bellek (memory) korunur** (install.mcs üzerine yazmaz).

**Kaldırma:**

```bash
# proje içinden:
rm -rf ecc-z skills/ecc-z
# package.json'dan ecc:* script satırlarını sil
# AGENTS.md'den ECC-Z Protokolü bloğunu sil (tüm dosya ECC-Z'ye aitse dosyayı sil)
```

Bellek dosyalarını (`ecc-z/memory/`) silmeden önce yedeklemen önerilir — oturum geçmişin
ve içgüdülerin oradadır.

---

## 10. Sorun Giderme

| Belirti | Neden | Çözüm |
|---|---|---|
| `ecc:context` "memory bulunamadı" diyor | Kurulum eksik / yanlış dizinden çalıştırılıyor | `ecc-z/` klasörünün proje kökünde olduğundan emin ol; komutu proje kökünden çalıştır |
| `ecc:verify` tsc "No inputs were found" hatası | `src/` dizini yok | `ecc-z/core/tsconfig.verify.json` include'unu kendi yapına göre düzenle (Bölüm 8.3) |
| `ecc:sync` indiremiyor | Ağ erişimi / GitHub oran limiti | Birkaç dakika sonra tekrar dene; manifest `ecc-z/memory/synced-skills.json` |
| Agent brief'i okumuyor | Otomatik AGENTS.md okuma kapalı | Bölüm 5.2 ritüel prompt'unu sistem prompt'una ekle |
| İçgüdüler brief'e girmiyor | confidence < 0.7 | `--instinct` kaydını tekrarla (confidence artar) veya eşiği düşür (`ECCZ_INSTINCT_CONFIDENCE_THRESHOLD`) |
| `bun`/`npm` bulunamadı | Paket yöneticisi yok | Script'ler düz node ile de çalışır: `node ecc-z/core/context-loader.mjs` |

---

## Ek: Dosya Haritası

```
z.code.haf-za.skill (bu repo)
├── README.md              ← kısa tanıtım + ECC yapısal eşleme tablosu
├── KURULUM.md             ← bu rehber
├── ARCHITECTURE.md        ← mimari eşleme detayları
├── install.mjs            ← otomatik kurulum betiği
├── package-scripts.json   ← package.json script şablonu
├── SKILL.md               ← meta-skill (skills/ecc-z/ altına kurulur)
├── PROJECT-AGENTS.md      ← proje kökü AGENTS.md şablonu
├── AGENTS.md              ← disiplin anayasası (ecc-z/ altına kurulur)
├── core/                  ← 5 çekirdek script + tsconfig.verify.json
├── agents/                ← 8 uzman agent + INDEX.md router
├── commands/              ← 7 komut dosyası (ECC commands eşdeğeri)
├── hooks/                 ← hook eşlemesi + örnek hook config
├── workflow/              ← geliştirme döngüsü + oturum ritüeli
├── rules/                 ← kural setleri
├── skills/                ← resmî ECC'den küratörlü 11 skill + README
└── memory/                ← başlangıç belleği (MEMORY.md, instincts, manifest, allowlist)
```
