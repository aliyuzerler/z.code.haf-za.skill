# AGENTS.md — Proje Talimatları

> Bu proje **ECC-Z** disiplin sistemiyle çalışır (ECC'nin Z.ai Code uyarlaması).
> Tam anayasa: [`ecc-z/AGENTS.md`](ecc-z/AGENTS.md) · Mimari: [`ecc-z/README.md`](ecc-z/README.md)

## Hızlı Protokol (zorunlu)

1. **Oturum başında:** `bun run ecc:context` çalıştır → Session Brief'i oku (bellek + içgüdüler + son oturumlar). İçgüdüler bu oturumda bağlayıcıdır.
2. **Karmaşık işlerde:** `ecc-z/agents/INDEX.md` router'ından uygun agent'ı seç, tanım dosyasını oku, Task-Tool Prompt Şablonunu doldurup Task tool'a ver. Koddan önce plan.
3. **Her anlamlı düzenlemeden sonra:** `bun run ecc:verify` (FAIL varsa düzeltmeden devam etme; kritik adımlarda `--types`).
4. **Commit/teslim öncesi:** `bun run ecc:shield` (HIGH bulgu varsa dur, önce çöz).
5. **Oturum kapanışında:** `bun run ecc:save --summary "..."` (+ öğrenilen davranış için `--instinct`, kalıcı karar için `--note`).

## Temel Yasaklar

- `@ts-ignore` / `eslint-disable` / `as any` ile hata bastırma (gerekçeli üçüncü parti istisnası hariç — raporla)
- Secret'ı kod içine gömmek; `.env`'i gitignore dışı bırakmak
- API isteklerinde mutlak `http://localhost` — yalnızca relatif yol (ortamın gateway kuralına uy)
- Kanıtsız "tamamlandı" beyanı

## Kurallar

- Evrensel: `ecc-z/rules/RULES.md`
- Stack (Next.js 16 + TS + Tailwind 4 + shadcn + Prisma/SQLite + bun): `ecc-z/rules/nextjs-typescript.md`
