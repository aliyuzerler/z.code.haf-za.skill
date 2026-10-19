#!/usr/bin/env node
/**
 * ECC-Z Skill Sync — ECC'nin seçici (selective) kurulum yolu (Z.ai Code uyarlama)
 *
 * Orijinal ECC deposundan (affaan-m/ECC — resmi kaynak) seçilmiş skill'leri
 * indirir, Z.ai Code'un skills/ dizinine (aynı SKILL.md formatı) yerleştirir
 * ve manifest'i (memory/synced-skills.json) güncel tutar.
 *
 * Kullanım:
 *   bun run ecc:sync                 → tüm küratörlü listeyi senkronize et
 *   bun run ecc:sync --only a,b      → yalnızca belirtilenler
 *   bun run ecc:sync --list          → küratörlü katalog (durumlarıyla)
 *   bun run ecc:sync --remove a,b    → yerel kopyaları kaldır
 *
 * Not: ECC README'si resmi kaynak dışı kopyalara karşı uyarır; bu script
 * yalnızca resmî depodan (github.com/affaan-m/ECC) çeker ve sürüm tarihini
 * manifest'e yazar.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ECCZ_ROOT = resolve(__dirname, '..');
const PROJECT_ROOT = resolve(ECCZ_ROOT, '..');
const PROJECT_SKILLS = join(PROJECT_ROOT, 'skills');
const MANIFEST = join(ECCZ_ROOT, 'memory', 'synced-skills.json');

// Resmî kaynak (ECC README'nin "Official sources only" uyarısına uygun)
const SOURCE_REPO = 'affaan-m/ECC';
const BASE_URL = `https://raw.githubusercontent.com/${SOURCE_REPO}/main/skills`;

// Küratörlü set: bu Next.js/TypeScript geliştirme ortamı için seçildi
const CURATED = [
  { name: 'api-design', why: 'REST endpoint tasarımı, pagination, hata yanıtları' },
  { name: 'backend-patterns', why: 'Backend mimari desenleri' },
  { name: 'tdd-workflow', why: 'Test-öncelikli geliştirme döngüsü' },
  { name: 'security-review', why: 'Kod güvenlik inceleme kontrol listesi' },
  { name: 'agent-security-hardening', why: 'Agent/LLM yüzeyleri için güvenlik sertleştirme' },
  { name: 'react-performance', why: 'React render/memo/pattern optimizasyonu' },
  { name: 'react-patterns', why: 'React bileşen ve state desenleri' },
  { name: 'error-handling', why: 'Hata yönetimi stratejileri' },
  { name: 'bun-runtime', why: 'Bun runtime özellikleri ve incelikleri' },
  { name: 'architecture-decision-records', why: 'ADR dokümantasyon pratiği' },
  { name: 'git-workflow', why: 'Dal/commit/rebase disiplini' },
];

const args = process.argv.slice(2);

function argValue(flag) {
  const i = args.indexOf(flag);
  return i === -1 || i + 1 >= args.length ? undefined : args[i + 1];
}

function loadManifest() {
  try {
    const parsed = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveManifest(list) {
  mkdirSync(dirname(MANIFEST), { recursive: true });
  writeFileSync(MANIFEST, JSON.stringify(list, null, 2) + '\n', 'utf8');
}

async function fetchSkill(name) {
  const res = await fetch(`${BASE_URL}/${name}/SKILL.md`);
  if (!res.ok) return { ok: false, status: res.status };
  const text = await res.text();
  return { ok: true, text };
}

/* ---------------- komutlar ---------------- */
if (args.includes('--list')) {
  const manifest = loadManifest();
  console.log('═══ ECC-Z Skill Kataloğu (kaynak: ' + SOURCE_REPO + ') ═══');
  for (const s of CURATED) {
    if (s.skip) continue;
    const synced = manifest.find((m) => m.name === s.name);
    const state = synced ? `✓ yüklü (${synced.syncedAt.slice(0, 10)}, ${synced.bytes}B)` : '· yok';
    console.log(`${state.padEnd(28)} ${s.name.padEnd(34)} ${s.why ?? ''}`);
  }
  process.exit(0);
}

const removeArg = argValue('--remove');
if (removeArg) {
  const names = removeArg.split(',').map((s) => s.trim());
  const manifest = loadManifest().filter((m) => {
    if (names.includes(m.name)) {
      const dir = join(PROJECT_SKILLS, m.name);
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        /* yoksay */
      }
      console.log(`✓ kaldırıldı: ${m.name}`);
      return false;
    }
    return true;
  });
  saveManifest(manifest);
  process.exit(0);
}

const onlyArg = argValue('--only');
const onlySet = onlyArg ? new Set(onlyArg.split(',').map((s) => s.trim())) : null;
const targets = CURATED.filter((s) => !s.skip && (!onlySet || onlySet.has(s.name)));

console.log(`▶ ${targets.length} skill senkronize ediliyor (kaynak: ${SOURCE_REPO})…`);
mkdirSync(PROJECT_SKILLS, { recursive: true });

const manifest = loadManifest();
let okCount = 0;
let failCount = 0;

for (const s of targets) {
  try {
    const r = await fetchSkill(s.name);
    if (!r.ok) {
      console.log(`  ✗ ${s.name}: HTTP ${r.status} (atlandı)`);
      failCount++;
      continue;
    }
    const dir = join(PROJECT_SKILLS, s.name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'SKILL.md'), r.text, 'utf8');

    const bytes = Buffer.byteLength(r.text, 'utf8');
    const entry = {
      name: s.name,
      source: `${SOURCE_REPO}:skills/${s.name}/SKILL.md`,
      syncedAt: new Date().toISOString(),
      bytes,
      why: s.why ?? '',
    };
    const idx = manifest.findIndex((m) => m.name === s.name);
    if (idx >= 0) manifest[idx] = entry;
    else manifest.push(entry);

    console.log(`  ✓ ${s.name} (${bytes}B)`);
    okCount++;
  } catch (err) {
    console.log(`  ✗ ${s.name}: ${err.message}`);
    failCount++;
  }
}

saveManifest(manifest);
console.log(`\n═══ Bitti: ${okCount} yüklendi, ${failCount} başarısız. Manifest: ecc-z/memory/synced-skills.json ═══`);
