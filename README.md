# z.code.haf-za.skill — ECC-Z

> **ECC-Z**: [affaan-m/ECC](https://github.com/affaan-m/ECC) ("Agent Harness OS", MIT) projesinin
> herhangi bir agent CLI'a (zcode masaüstü, Z.ai Code, Claude Code, Cursor vb.) kurulabilen
> hafıza + disiplin uyarlaması.
>
> Motto: *"Optimize the context window. Persist everything else."*

## Ne kazandırır?

- 🧠 **Kalıcı bellek** — proje bağlamı, öğrenilmiş davranış kuralları (içgüdüler), oturum özetleri
- 📥 **Session Brief** — her oturum başında otomatik bağlam yüklemesi (bellek + içgüdüler + geçmiş)
- ✅ **Doğrulama disiplini** — her düzenlemeden sonra lint/tsc; FAIL varsa devam yok
- 🛡️ **Shield güvenlik taraması** — secret sızıntısı, prompt injection, tehlikeli desen taraması
- 🤖 **11 uzman agent** — planner, architect, code-reviewer, security-reviewer, tdd-guide,
  build-error-resolver, refactor-cleaner, doc-updater + frontend tasarım üçlüsü
  (frontend-designer, motion-designer, a11y-auditor) + yönlendirici (INDEX.md)
- ⚡ **7 komut** — `/ecc-context`, `/ecc-verify`, `/ecc-shield`, `/ecc-save`, `/ecc-sync`, `/ecc-plan`, `/ecc-review`
- 📚 **Skill senkronizasyonu** — resmî ECC (311 skill) içinden küratörlü 20 skill: geliştirme disiplini (11) + frontend arayüz tasarımı (9)

## Hızlı Kurulum (3 komut)

```bash
git clone https://github.com/aliyuzerler/z.code.haf-za.skill.git /tmp/ecc-z
node /tmp/ecc-z/install.mjs /yol/projenin/dizini
# sonra: ecc-z/memory/MEMORY.md'yi projene göre doldur
```

📖 **Detaylı kurulum rehberi: [KURULUM.md](KURULUM.md)** — otomatik/manuel kurulum, agent'a
sistem tanıtma (ritüel prompt'ları dahil), doğrulama checklist, günlük akış, yapılandırma ve
sorun giderme.

## Komutlar

```bash
npm run ecc:context            # Session Brief üret (oturum başında okunur)
npm run ecc:save --summary "…" # oturum özeti yaz
npm run ecc:save --instinct "tetik::aksiyon::0.9::domain"  # içgüdü kaydet/pekiştir
npm run ecc:save --note "…"    # MEMORY.md'ye kalıcı not
npm run ecc:save --prune       # 30 günden eski oturumları sil
npm run ecc:verify             # lint (+ --types ile tsc) — düzenleme sonrası
npm run ecc:shield             # güvenlik taraması — commit/oturum öncesi
npm run ecc:sync               # ECC'den küratörlü skill'leri senkronize et
npm run ecc:sync --list        # katalog durumu
```

> bağımlılık yoktur — `npm`/`bun`/`pnpm` hepsi çalışır; dilersen doğrudan
> `node ecc-z/core/<script>.mjs` de çalıştırabilirsin.

## Nasıl çalışır? (30 saniye)

1. **Oturum açılır** → agent `ecc:context` çalıştırır, Session Brief'i okur (içgüdüler yüklendi).
2. **Görev gelir** → karmaşıksa `agents/INDEX.md` router'ından agent seçilir (plan → uygulama).
3. **Kod yazılır** → her tur `ecc:verify`; hata varsa build-error-resolver devreye girer.
4. **Kapanış** → `ecc:shield` (güvenlik) → `ecc:save` (bellek) → içgüdüler pekiştirilir.

## Dizin Yapısı

```
├── KURULUM.md        ← detaylı kurulum rehberi (buradan başla)
├── ARCHITECTURE.md   ← mimari eşleme (ECC → ECC-Z)
├── install.mjs       ← otomatik kurulum betiği
├── SKILL.md          ← meta-skill
├── AGENTS.md         ← disiplin anayasası (V1-V6 ihlal tanımları)
├── PROJECT-AGENTS.md ← proje kökü AGENTS.md şablonu
├── core/             ← 5 çekirdek script (bağımlılıksız ESM)
├── agents/           ← 11 uzman agent + INDEX.md router (8 geliştirme + 3 frontend tasarım)
├── commands/         ← 7 komut dosyası (/ecc-context, /ecc-verify, …)
├── hooks/            ← hook eşlemesi + hook destekleyen CLI'lar için örnek config
├── workflow/         ← geliştirme döngüsü, oturum ritüeli, kompozisyon desenleri
├── rules/            ← evrensel + stack kuralları
├── skills/           ← resmî ECC'den küratörlü 20 skill + README (11 geliştirme + 9 frontend tasarım)
└── memory/           ← başlangıç belleği + skill manifest'i (üzerine yazılmaz)
```

## ECC ile Yapısal Eşleme

| ECC (Claude Code) | Bu repoda | Durum |
|---|---|---|
| `skills/` (311 skill) | `skills/` (küratörlü 20: geliştirme + frontend tasarım) + `core/skill-sync.mjs` | ✅ seçilmiş küme + talep üzerine senkron |
| `hooks/` (hook runtime) | `hooks/README.md` + AGENTS.md anayasası | ✅ eşlendi (zcode hook API'si sunmadığı için yumuşak katman) |
| `commands/` (97 komut) | `commands/` (7 komut) + `npm run ecc:*` script'leri | ✅ eşlendi |
| `workflow/` | `workflow/README.md` | ✅ eşlendi |
| `manifest` | `memory/synced-skills.json` | ✅ eşlendi |
| `rules/` | `rules/` | ✅ birebir |
| `.claude/agents/` (71 agent) | `agents/` (11 küratörlü + INDEX.md router) | ✅ seçilmiş küme |

## Sınırlar (dürüst not)

- **Zorlama yok:** agent CLI'ların çoğu hook deny API'si sunmaz; bu sistem disiplin sözleşmesiyle
  çalışır (anayasa: `AGENTS.md`, ihlaller V1-V6).
- **Otomatik agent keşfi yok:** agent'lar sistem menüsüne düşmez; agent dosyayı okuyarak kullanır
  (bilinçli tasarım — INDEX.md router).
- **Kaynak disiplini:** skill senkronizasyonu yalnızca resmî `affaan-m/ECC` deposundan yapılır.

## Krediler ve Lisans

- Orijinal sistem: [affaan-m/ECC](https://github.com/affaan-m/ECC) (MIT)
- Bu uyarlama: ECC-Z — hafıza/disiplin katmanının genel agent CLI'lar için sadeleştırılmış hali
