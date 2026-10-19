# ECC-Z — ECC'nin Z.ai Code Uyarlaması

> "Optimize the context window. Persist everything else."
> Orijinal proje: [affaan-m/ECC](https://github.com/affaan-m/ECC) (MIT) — bu dizin, onun
> Z.ai Code ortamına uyarlanmış alt kümesidir.

## Mimari Eşleme

| ECC (Claude Code) | ECC-Z (Z.ai Code) | Mekanizma |
|---|---|---|
| SessionStart hook (otomatik bağlam) | `core/context-loader.mjs` | Disiplin: oturum başında çalıştır + oku |
| SessionEnd hook + sürekli öğrenme | `core/session-save.mjs` | Oturum özeti + içgüdü pekiştirme + prune |
| PreToolUse/PostToolUse deny | `core/verify.mjs` + `ecc-z/AGENTS.md` | Yumuşak hook: disiplin sözleşmesi |
| AgentShield | `core/shield-scan.mjs` | Secret/injection/gateway kuralı taraması |
| `.claude/agents/` otomatik keşif | `agents/INDEX.md` router | Oku → Task-Tool prompt şablonu → Task tool |
| Selective installer | `core/skill-sync.mjs` | Resmî repodan seçilmiş SKILL.md senkronizasyonu |
| `.claude/rules/` | `rules/` | Evrensel + stack kuralları |

## Komutlar

```bash
bun run ecc:context           # Session Brief üret (oturum başında okunur)
bun run ecc:save --summary "…" # oturum özeti yaz
bun run ecc:save --instinct "tetik::aksiyon::0.9::domain"  # içgüdü kaydet/pekiştir
bun run ecc:save --note "…"   # MEMORY.md'ye kalıcı not
bun run ecc:save --prune      # 30 günden eski oturumları sil
bun run ecc:verify            # lint (+ --types ile tsc) — düzenleme sonrası
bun run ecc:shield            # güvenlik taraması — commit/oturum öncesi
bun run ecc:sync              # ECC'den küratörlü skill'leri senkronize et
bun run ecc:sync --list       # katalog durumu
```

## Diziyi Anlamak (30 saniye)

1. **Oturum açılır** → ajan `ecc:context` çalıştırır, Session Brief okur (içgüdüler yüklendi).
2. **Görev gelir** → karmaşıksa INDEX.md router'ından agent seçilir (plan → uygulama).
3. **Kod yazılır** → her tur `ecc:verify`; hata varsa build-error-resolver devreye girer.
4. **Kapanış** → `ecc:shield` (güvenlik) → `ecc:save` (bellek) → içgüdüler pekiştirilir.

## Sınırlar (dürüst not)

- **Zorlama yok:** Z.ai Code hook deny API'si sunmaz; bu sistem disiplin sözleşmesiyle çalışır
  (ihlal tanımları: `ecc-z/AGENTS.md` §7).
- **Otomatik keşif yok:** agent'lar ve senkronize skill'ler sistem menüsüne düşmez; ajan dosyayı
  okuyarak kullanır (bu bilinçli tasarım).
- **Kaynak disiplini:** skill senkronizasyonu yalnızca resmî `affaan-m/ECC` deposundan yapılır;
  fork'lar ve üçüncü parti kopyalar ECC README'sinin uyarısına tabidir.

## Ayarlanabilir Ortam Değişkenleri

| Değişken | Varsayılan | Anlamı |
|---|---|---|
| `ECCZ_SESSION_START_MAX_CHARS` | 6000 | Brief karakter bütçesi |
| `ECCZ_MAX_INJECTED_INSTINCTS` | 6 | Brief'e girer içgüdü sayısı |
| `ECCZ_INSTINCT_CONFIDENCE_THRESHOLD` | 0.7 | İçgüdü eşiği |
| `ECCZ_SESSION_COUNT` | 3 | Brief'e girer oturum özeti sayısı |
| `ECCZ_RETENTION_DAYS` | 30 | Oturum özeti saklama süresi |

## Repo Dizini ↔ ECC Eşlemesi (2026-10-19 güncellemesi)

Repoya ECC'nin klasör iskeleti birebir değil, **eşlenmiş haliyle** dahildir:

| ECC klasörü | Bu repodaki karşılık | Not |
|---|---|---|
| `skills/` (311) | `skills/` (11 küratörlü) | Tamamı için `npm run ecc:sync` (resmî kaynak) |
| `hooks/` | `hooks/README.md` + AGENTS.md | zcode hook API'si yok → yumuşak katman + örnek config |
| `commands/` (97) | `commands/` (7) + `ecc:*` script'leri | En sık kullanılanlar seçildi |
| `workflow/` | `workflow/README.md` | Döngü + ritüel + kompozisyon |
| manifest | `memory/synced-skills.json` | Kurulumla taşınır, üzerine yazılmaz |
| `.claude/agents/` (71) | `agents/` (8) + `INDEX.md` router | Küratörlü çekirdek ekip |

Sebep: ECC-Z felsefesi "context window'u optimize et, gerisini kalıcı tut" — 311 skill ve
97 komutun tamamı taşınmaz; seçilmiş çekirdek + talep üzerine senkronizasyon tercih edilir.
