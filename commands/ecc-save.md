---
description: ECC-Z oturum kapanışı — özet ve içgüdü kaydı
---

Oturumu kapatmadan önce şunları çalıştır (V4 ihlali: kayıtsız kapanmak):

```bash
# 1) Oturum özeti (ne yapıldı, kararlar, sonraki adımlar):
npm run ecc:save --summary "<özet>"

# 2) Öğrenilen davranış kuralı varsa (tetik::aksiyon::güven::domain):
npm run ecc:save --instinct "tetik::aksiyon::0.9::domain"

# 3) Kalıcı proje kararı varsa (MEMORY.md'ye işlenir):
npm run ecc:save --note "<karar>"

# 4) 30 günden eski oturum kayıtlarını temizle:
npm run ecc:save --prune
```

Özeti uydurma; gerçek yapılan işleri, alınan kararları ve açık kalan soruları yaz.
