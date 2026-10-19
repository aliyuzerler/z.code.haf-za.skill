---
description: ECC-Z güvenlik taraması — HIGH bulgu varsa dur
---

Commit veya teslim öncesinde aşağıdaki komutu çalıştır:

```bash
npm run ecc:shield
```

- HIGH bulgu varsa: işleme devam etme; önce kök nedeni çöz.
- Bulgu yanlış pozitifse: gerekçesini yaz ve `ecc-z/memory/shield-allowlist.json`'a
  `id/path/reason/reviewedAt` alanlarıyla ekle (gerekçe olmadan allowlist'e alma = V3 ihlali).
- Raporu kısaltmadan kullanıcıya göster.
