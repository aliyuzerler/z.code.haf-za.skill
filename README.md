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
- 🤖 **8 uzman agent** — planner, architect, code-reviewer, security-reviewer, tdd-guide,
  build-error-resolver, refactor-cleaner, doc-updater + yönlendirici (INDEX.md)
- 📚 **Skill senkronizasyonu** — resmî ECC deposundan küratörlü skill'ler (api-design, security-review, …)

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
├── agents/           ← 8 uzman agent + INDEX.md router
├── rules/            ← evrensel + stack kuralları
└── memory/           ← başlangıç belleği (kurulumda kopyalanır, üzerine yazılmaz)
```

## Sınırlar (dürüst not)

- **Zorlama yok:** agent CLI'ların çoğu hook deny API'si sunmaz; bu sistem disiplin sözleşmesiyle
  çalışır (anayasa: `AGENTS.md`, ihlaller V1-V6).
- **Otomatik agent keşfi yok:** agent'lar sistem menüsüne düşmez; agent dosyayı okuyarak kullanır
  (bilinçli tasarım — INDEX.md router).
- **Kaynak disiplini:** skill senkronizasyonu yalnızca resmî `affaan-m/ECC` deposundan yapılır.

## Krediler ve Lisans

- Orijinal sistem: [affaan-m/ECC](https://github.com/affaan-m/ECC) (MIT)
- Bu uyarlama: ECC-Z — hafıza/disiplin katmanının genel agent CLI'lar için sadeleştırılmış hali
