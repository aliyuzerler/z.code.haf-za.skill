# commands/ — Komut Dosyaları

ECC'nin 97 slash-komutunun ECC-Z eşdeğeri: **7 odaklı komut**. Her `.md` dosyası, agent'a
yapıştırılabilir/verilebilir bir prompt şablonudur (Claude Code `.claude/commands/`, zcode
özel prompt ayarları veya doğrudan sohbete yapıştırma ile kullanılır).

| Komut | Dosya | Ne yapar |
|---|---|---|
| `/ecc-context` | `ecc-context.md` | Session Brief üret + oku (oturum başlangıcı) |
| `/ecc-verify` | `ecc-verify.md` | lint/tsc çalıştır, FAIL ise düzelt |
| `/ecc-shield` | `ecc-shield.md` | Güvenlik taraması, HIGH varsa dur |
| `/ecc-save` | `ecc-save.md` | Oturum özeti + içgüdü kaydı (kapanış) |
| `/ecc-sync` | `ecc-sync.md` | Skill kataloğunu senkronize et |
| `/ecc-plan` | `ecc-plan.md` | planner agent ile koddan önce plan |
| `/ecc-review` | `ecc-review.md` | code-reviewer agent ile kalite incelemesi |

Bunlara karşılık gelen çekirdek script'ler `npm run ecc:*` olarak da çalışır
(`package.json` → `ecc:context`, `ecc:verify`, `ecc:shield`, `ecc:save`, `ecc:sync`).
