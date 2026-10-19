# ECC-Z Stack Kuralları — Next.js 16 + TypeScript

> ECC `rules/typescript` uyarlaması. Ortamına özgü kısıtların varsa (port, gateway,
> log yolu) bu dosyaya ekle — her proje kendi kısıtlarını burada taşır.

## Çerçeve ve Çalıştırma

- Next.js 16 App Router + TypeScript 5 + Tailwind CSS 4 + shadcn/ui (New York) + Lucide ikonlar.
- Dev: `npm run dev` / `bun run dev` (proje standardına göre).
- Kalite: `npm run lint`; tip kontrolü: `npm run ecc:verify --types` (tsc --noEmit).
- Kod sonrası: dev sunucu log / terminal çıktısının son satırları kontrol edilir.

## API ve Ağ (Gateway Kısıtları)

- İstek yolları **yalnızca relatif**: `fetch('/api/...')` — mutlak `http://localhost` YASAK.
- Gateway/proxy'li ortamlarda farklı servislere istek, ortamın belirlediği query
  parametresi/mekanizma ile yapılır (ortam dokümanını MEMORY.md'ye not et).
- Backend mantığı API route'larında; server action yerine API kullan.
- Ortama özgü SDK'lar (varsa) SADECE backend'de; client bundle'a sızmaz.

## Veri Katmanı

- Prisma ORM + SQLite; şema `prisma/schema.prisma`; push: `bun run db:push`.
- Erişim: `import { db } from '@/lib/db'`; şema primitive alanları liste tipi olamaz.
- Migration riskli işlemlerde `--accept-data-loss` etkisini kullanıcıya açıkla.

## Bileşen ve UI

- Mevcut shadcn/ui bileşenleri (`src/components/ui/`) kullan; sıfırdan yazma.
- Kart hizası: `p-4`/`p-6` içerik, `gap-4`/`gap-6` boşluk.
- Uzun listeler: `max-h-96 overflow-y-auto` + özelleştirilmiş scrollbar.
- Footer varsa sticky: kök `min-h-screen flex flex-col`, footer `mt-auto`.
- Duyarlılık: mobil öncelikli; `sm: md: lg: xl:` kırılımları; 44px dokunma hedefi.
- Renk: indigo/mavi yalnızca kullanıcı isterse; Tailwind semantik değişkenleri (`bg-primary` vb.).

## Real-time

- Gerçek zamanlı iletişim için socket.io/websocket kullan; backend'i bağımsız mini-servis olarak
  ayır (kendi package.json + sabit port). Bağlantı adresini ortamın proxy kuralına göre kur.

## Kimlik ve Durum

- Client durumu: Zustand; server durumu: TanStack Query.
- Kimlik: NextAuth.js v4 (gerektiğinde).

## Dosya Yerleşimi

- Prisma şema: `prisma/`; SQLite dosyası: `db/`; mini-servisler: `mini-services/<ad>/`
  (kendi package.json + sabit port + `bun --hot`).
- Test kodu yazılmaz (bu sandbox kuralı); doğrulama lint + tsc + tarayıcı kontrolüdür.
