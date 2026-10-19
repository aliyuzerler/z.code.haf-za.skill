# ECC-Z Agent Kataloğu ve Router

> ECC'nin `.claude/agents/` otomatik keşfi Z.ai Code'da yoktur. Bunun yerine bu router kullanılır:
> 1. Görev tipini aşağıdaki tabloda eşleştir → 2. İlgili agent .md dosyasını **tam olarak oku** →
> 3. Agent dosyasındaki "Task-Tool Prompt Şablonu"nu, görev bilgisiyle doldurup **Task tool'a
> ver** (subagent_type: general-purpose) → 4. Gelen raporu değerlendir, aksiyona geçir.

## Yönlendirme Tablosu

| Görev / Tetikleyici | Agent | Dosya | Öncelik |
|---|---|---|---|
| Çok adımlı özellik, mimari değişiklik, karmaşık refactor | **planner** | `agents/planner.md` | Koddan önce |
| Sistem tasarımı, teknoloji seçimi, veri modeli tasarımı | **architect** | `agents/architect.md` | Koddan önce |
| Yeni iş mantığı, hata düzeltmesi (test-öncelikli) | **tdd-guide** | `agents/tdd-guide.md` | Uygulama sırasında |
| Kod yazıldıktan sonra kalite/doğruluk incelemesi | **code-reviewer** | `agents/code-reviewer.md` | Koddan sonra |
| API yüzeyi, kimlik doğrulama, hassas akış incelemesi | **security-reviewer** | `agents/security-reviewer.md` | Commit öncesi |
| lint/tsc/build/çalışma zamanı hatası | **build-error-resolver** | `agents/build-error-resolver.md` | Hata anında |
| Ölü kod/tekrar temizliği (davranış korumalı) | **refactor-cleaner** | `agents/refactor-cleaner.md` | Özellik sonrası |
| Doküman/bellek/rules tutarlılığı | **doc-updater** | `agents/doc-updater.md` | Değişiklik sonrası |

## Standart Geliştirme Döngüsü (ECC diziliminin Z eşdeğeri)

```text
plan(planner) → test(tdd-guide) → implement → review(code-reviewer)
→ verify(ecc:verify) → security(ecc:shield) → remember(ecc:save)
```

- **Basit görevlerde** (tek dosya, net kapsam): planner/adımları atlanabilir; review + verify yeterli.
- **Karmaşık görevlerde**: plan zorunlu; review ve security raporları oturum özetine eklenir.

## Çoklu Agent Kompozisyonu

- planner → architect: plan, mimari onayına sunulur (büyük işlerde)
- implement → code-reviewer → build-error-resolver: review bulguları hata çözücüye devredilebilir
- security-reviewer → doc-updater: güvenlik raporu, doküman "Güvenlik Notları"na yansıtılır

## Kayıt

Bir agent tanımı kullanıldıysa ve sonuç öğreticiyse, oturum kaydında belirt:
`bun run ecc:save --instinct "tetik::aksiyon::0.8::domain"`
