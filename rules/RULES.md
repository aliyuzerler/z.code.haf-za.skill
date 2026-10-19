# ECC-Z Evrensel Kurallar (tüm diller)

> ECC `rules/common` uyarlaması. Bu kurallar her görevde geçerlidir.

## Doğruluk ve Dürüstlük

- Emin olmadığın şeyi "eminmiş gibi" sunma; belirsizliği açıkça belirt.
- "Tamamlandı" beyanı doğrulama kanıtı gerektirir (verify PASS, test çıktısı, tarayıcı kontrolü).
- Hata yaptığında gizleme; kök nedeni raporla.

## Plan-Önce-Yürüt

- 3 adımdan fazla her iş için görev listesi (todo) tut ve güncelle.
- Kapsam değişikliği fark edilirse önce kullanıcıya bildir.

## Değişmezlik ve Sadelik

- Mevcut nesneleri mutasyona uğratma; yeni nesil üret (JS/TS).
- En sade çalışan çözüm; gereksiz soyutlama ve erken optimizasyon yasak (YAGNI).
- Tek sorumluluk: fonksiyon/bileşen bir işi yapar.

## Güvenlik Önce

- Tüm dış girdiler doğrulanır; secret kod içinde asla.
- Yetkilendirme, veri yazan her uçta varsayılandır.

## Güvenli Hata Yönetimi

- Hataları yutma; anlamlı mesajla yukarı taşı.
- Kullanıcıya gösterilen hata mesajı: ne oldu + ne yapılmalı (teknik detay log'a).

## Değişiklik Hijyeni

- Küçük, odaklı değişiklikler; ilgisiz dosyaya dokunma.
- Silmeden önce kullanım kanıtı; şüphede kalma → sorma.
