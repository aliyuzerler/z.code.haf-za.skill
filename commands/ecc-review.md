---
description: ECC-Z inceleme — code-reviewer agent ile kalite kontrolü
---

`ecc-z/agents/code-reviewer.md` dosyasını TAM OLARAK oku. İçindeki "Task-Tool Prompt
Şablonu"nu doldurup Task tool'a (general-purpose) ver; incelenecek kapsamı belirt:

- Kapsam: [DOSYA/DOSYALAR veya SON DEĞİŞİKLİKLER]

Rapor formatı: bulgu / önem (HIGH-MED-LOW) / dosya-satır / önerilen düzeltme.
HIGH bulgular düzeltilmeden "tamamlandı" denmeyecek (V6 ihlali: kanıtsız beyan).
Düzeltmelerden sonra `npm run ecc:verify` çalıştır.
