# hooks/ — Hook Katmanı (ECC → ECC-Z eşlemesi)

## Dürüst Durum

ECC, Claude Code'un **hook runtime'ını** kullanır: SessionStart/PreToolUse/PostToolUse
olaylarında script çalıştırır ve gerekirse aracı **engeller** (deny).

zcode ve çoğu agent CLI bu API'yi sunmaz. Bu yüzden ECC-Z'nin hook katmanı **iki katmandan**
oluşur:

1. **Yumuşak hook (her CLI'da çalışır):** `ecc-z/AGENTS.md` disiplin anayasası + `commands/`
   ritüelleri. Zorlama kodla değil sözleşmeyle yapılır; ihlaller V1–V6 olarak tanımlıdır.
2. **Gerçek hook (yalnızca hook destekleyen CLI'larda):** aşağıdaki örnek yapılandırma.

## Destekleyen CLI'lar İçin Örnek (Claude Code tarzı settings.json)

```json
{
  "hooks": {
    "SessionStart": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "npm run ecc:context" }] }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "npm run ecc:verify" }]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "hooks": [{ "type": "command", "command": "npm run ecc:shield" }]
      }
    ],
    "SessionEnd": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "npm run ecc:save --summary 'otomatik kapanış kaydı'" }] }
    ]
  }
}
```

> Bu yalnızca bir **şablondur**: CLI'ının hook formatına ve matcher sözdizimine göre
> uyarlayın. zcode hook API'si sunmuyorsa bu dosyanın işlevi yoktur — yumuşak katman
> (AGENTS.md + commands/) yeterlidir.

## Eşleme Tablosu

| ECC hook | Tetik | ECC-Z karşılığı |
|---|---|---|
| SessionStart | oturum açılışı | `ecc:context` (commands/ecc-context.md) |
| PostToolUse (Edit/Write) | dosya düzenlemesi | `ecc:verify` (commands/ecc-verify.md) |
| PreToolUse (commit) | git commit | `ecc:shield` (commands/ecc-shield.md) |
| SessionEnd | oturum kapanışı | `ecc:save` (commands/ecc-save.md) |
| PreToolUse deny | kural ihlali | AGENTS.md anayasası V1–V6 (yumuşak) |
