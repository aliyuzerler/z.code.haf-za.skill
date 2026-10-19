---
description: ECC-Z skill senkronizasyonu — resmî ECC kataloğu
---

Skill kataloğunu resmî kaynaktan senkronize et:

```bash
npm run ecc:sync --list   # önce durum
npm run ecc:sync          # resmî affaan-m/ECC'den indir
```

Kaynak yalnızca `affaan-m/ECC` (resmî) olabilir; fork/üçüncü parti kaynak yasaktır.
Başarısız indirmeleri raporla; manifest: `ecc-z/memory/synced-skills.json`.
