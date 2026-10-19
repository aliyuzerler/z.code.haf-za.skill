---
description: ECC-Z doğrulama — lint/tsc çalıştır, FAIL ise düzelt
---

Aşağıdaki komutu çalıştır:

```bash
npm run ecc:verify
```

- Sonuç PASS ise devam et.
- Sonuç FAIL ise kök nedeni çöz, tekrar çalıştır; FAIL iken hiçbir yeni adıma geçme (V2 ihlali).
- Kritik adımlarda (özellik tamamlanması, commit öncesi) tip kontrolüyle çalıştır:

```bash
npm run ecc:verify -- --types
```
