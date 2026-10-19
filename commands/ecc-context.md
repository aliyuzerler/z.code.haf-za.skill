---
description: ECC-Z oturum başlangıcı — Session Brief üret ve oku
---

Aşağıdaki komutu çalıştır ve çıktıyı (Session Brief) baştan sona oku:

```bash
npm run ecc:context
```

Sonra:
1. Brief'teki çekirdek belleği (MEMORY.md) proje bağlamı olarak kabul et.
2. İçgüdüler (confidence ≥ 0.7) bu oturumda bağlayıcıdır.
3. Son oturum özetinden kaldığı yerden devam et; kullanıcı yeni görev verdiyse öncelik onundur.
4. Görev listesi oluştur (TodoWrite) ve sürdür.

Anayasa: `ecc-z/AGENTS.md` — V1 ihlali: brief okumadan işe başlamak.
