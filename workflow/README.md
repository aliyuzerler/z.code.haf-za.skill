# workflow/ — Geliştirme Döngüsü ve Oturum Ritüeli

ECC'nin `workflow/` klasörünün ECC-Z eşdeğeri: standart geliştirme döngüsü, oturum ritüeli
ve agent kompozisyon desenleri.

## Standart Geliştirme Döngüsü

```text
plan(planner) → implement → review(code-reviewer)
→ verify(ecc:verify) → security(ecc:shield) → remember(ecc:save)
```

- **Basit görevlerde** (tek dosya, net kapsam): plan atlanabilir; review + verify yeterli.
- **Karmaşık görevlerde**: plan zorunlu (V5); review ve security raporları oturum özetine eklenir.

## Oturum Ritüeli

### Açılış (SessionStart eşdeğeri)

1. `npm run ecc:context` → Session Brief'i oku (bellek + içgüdüler + son 3 oturum).
2. Brief'teki içgüdüler bu oturumda bağlayıcıdır.
3. Görev listesi oluştur (TodoWrite).

### Geliştirme sırasında

1. Karmaşık iş → `ecc-z/agents/INDEX.md` router'ından agent seç → Task-Tool ile çalıştır.
2. Her anlamlı düzenleme turundan sonra → `npm run ecc:verify` (FAIL = dur, düzelt).
3. Kod sonrası → çalışma zamanı log çıktısını kontrol et.

### Kapanış (SessionEnd eşdeğeri)

1. `npm run ecc:shield` → HIGH varsa dur, önce çöz.
2. `npm run ecc:save --summary "..."` → ne yapıldı, kararlar, sonraki adımlar.
3. Yeni davranış kuralı öğrenildiyse → `npm run ecc:save --instinct "tetik::aksiyon::0.X::domain"`.
4. Kalıcı karar varsa → `npm run ecc:save --note "..."`.

## Agent Kompozisyon Desenleri

| Desen | Sıra |
|---|---|
| Plan → onay | `planner` → kullanıcı onayı → implement |
| Mimari karar | `planner` → `architect` (ADR üretimi) |
| Kalite kapısı | implement → `code-reviewer` → `ecc:verify` |
| Hata kurtarma | `ecc:verify` FAIL → `build-error-resolver` → yeniden verify |
| Güvenlik kapısı | commit öncesi `security-reviewer` → `ecc:shield` |
| Bilgi güncelleme | değişiklik sonrası `doc-updater` → `ecc:save --note` |

## İhlal Tanımları (yumuşak hook)

| İhlal | Tanım |
|---|---|
| V1 | Oturumu brief okumadan başlatmak |
| V2 | `ecc:verify` FAIL iken devam etmek |
| V3 | `ecc:shield` HIGH bulguyu görmezden gelmek |
| V4 | Oturumu özet kaydetmeden kapatmak |
| V5 | Router'sız karmaşık işe koda başlamak |
| V6 | Kanıtsız "tamamlandı" beyanı |
