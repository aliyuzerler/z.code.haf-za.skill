---
description: ECC-Z planlama — planner agent ile koddan önce plan
---

`ecc-z/agents/planner.md` dosyasını TAM OLARAK oku. İçindeki "Task-Tool Prompt Şablonu"nu
şu görev bilgisiyle doldurup Task tool'a (general-purpose) ver:

- Görev: [KULLANICININ GÖREVİ]
- Proje bağlamı: [STACK — ör. Next.js 16 App Router, TypeScript 5, Prisma; kısıt varsa ekle]

Plan gelene kadar KOD YAZMA (V5 ihlali: router'sız karmaşık işe koda başlamak).
Planı kullanıcıya özetle; onaydan sonra uygula. Basit görevlerde (tek dosya, net kapsam)
bu adım atlanabilir — atlanıyorsa bunu açıkça belirt.
