#!/usr/bin/env node
/**
 * ECC-Z Otomatik Kurulum Betiği
 *
 * Kullanım:
 *   node install.mjs [hedef-proje-dizini]
 *
 * Bu repodaki dosyaları hedef projeye ECC-Z düzeninde kurar.
 *
 * GÜVENLİK GARANTİSİ:
 *   - Mevcut bellek dosyalarını (memory/MEMORY.md, instincts.json, allowlist, manifest) ASLA üzerine yazmaz.
 *   - Mevcut kök AGENTS.md dosyasını üzerine yazmaz; birleştirme talimatı gösterir.
 *   - package.json'a yalnızca eksik "ecc:*" script'lerini ekler (diğer alanlara dokunmaz).
 *
 * Bağımlılık gerektirmez (yalnızca Node.js stdlib, >= 18).
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = dirname(fileURLToPath(import.meta.url));
const target = resolve(process.argv[2] ?? process.cwd());

const ok = (m) => console.log(`  ✓ ${m}`);
const skip = (m) => console.log(`  ↷ ${m} (zaten var, korundu)`);
const fail = (m) => { console.error(`  ✗ ${m}`); process.exitCode = 1; };

console.log(`\n═══ ECC-Z Kurulum ═══`);
console.log(`Kaynak (repo): ${REPO}`);
console.log(`Hedef (proje): ${target}\n`);

if (!existsSync(target)) {
  fail(`Hedef dizin bulunamadı: ${target}`);
  process.exit(1);
}
if (existsSync(join(target, 'ecc-z')) && !process.argv.includes('--force')) {
  console.log('Hedefte zaten bir ecc-z/ dizini var. Yeniden kurmak için: node install.mjs <hedef> --force');
  console.log('(Bellek dosyaları her durumda korunur.)');
  if (!process.argv.includes('--force')) process.exit(1);
}

// 1) Sistem dosyaları (üzerine yazılabilir — sistem tarafı)
const eccz = join(target, 'ecc-z');
for (const dir of ['core', 'agents', 'rules', 'commands', 'hooks', 'workflow']) {
  mkdirSync(join(eccz, dir), { recursive: true });
  cpSync(join(REPO, dir), join(eccz, dir), { recursive: true });
  ok(`ecc-z/${dir}/ kopyalandı`);
}
cpSync(join(REPO, 'AGENTS.md'), join(eccz, 'AGENTS.md'));
ok('ecc-z/AGENTS.md (disiplin anayasası) kopyalandı');
cpSync(join(REPO, 'SKILL.md'), join(eccz, 'SKILL.md'));
ok('ecc-z/SKILL.md kopyalandı');

// 2) Bellek dosyaları (yalnızca YOKSA yaz — kullanıcı verisi)
mkdirSync(join(eccz, 'memory', 'session-data'), { recursive: true });
mkdirSync(join(eccz, 'memory', 'metrics'), { recursive: true });
for (const f of ['MEMORY.md', 'instincts.json', 'shield-allowlist.json', 'synced-skills.json']) {
  const dst = join(eccz, 'memory', f);
  if (!existsSync(dst)) { cpSync(join(REPO, 'memory', f), dst); ok(`ecc-z/memory/${f} oluşturuldu`); }
  else skip(`ecc-z/memory/${f}`);
}
ok('ecc-z/memory/session-data/ ve metrics/ hazır');

// 3) Skill keşfi: Z.ai Code tarzı skills/ dizinine meta-skill + küratörlü skill kataloğu
const skillDir = join(target, 'skills', 'ecc-z');
mkdirSync(skillDir, { recursive: true });
cpSync(join(REPO, 'SKILL.md'), join(skillDir, 'SKILL.md'));
ok('skills/ecc-z/SKILL.md yerleştirildi (otomatik skill keşfi için)');

// 3.5) Küratörlü skill kataloğu: repo/skills/<ad>/SKILL.md → hedef/skills/<ad>/SKILL.md
const repoSkillsDir = join(REPO, 'skills');
if (existsSync(repoSkillsDir)) {
  let n = 0;
  for (const entry of readdirSync(repoSkillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const src = join(repoSkillsDir, entry.name, 'SKILL.md');
    if (!existsSync(src)) continue;
    const dstDir = join(target, 'skills', entry.name);
    mkdirSync(dstDir, { recursive: true });
    cpSync(src, join(dstDir, 'SKILL.md'));
    n++;
  }
  ok(`skills/ kataloğundan ${n} skill yerleştirildi`);
}

// 4) Proje kökü AGENTS.md (agent CLI'ların otomatik okuduğu dosya)
const rootAgents = join(target, 'AGENTS.md');
if (!existsSync(rootAgents)) {
  cpSync(join(REPO, 'PROJECT-AGENTS.md'), rootAgents);
  ok('AGENTS.md (proje kökü) oluşturuldu');
} else {
  skip('AGENTS.md (proje kökü)');
  console.log('    ⚠ Mevcut AGENTS.md dosyana şu bloğu elle ekle:');
  console.log('      ──────────────────────────────────────────────');
  console.log('      ## ECC-Z Protokolü');
  console.log('      1. Oturum başında: `npm run ecc:context` → Session Brief\'i oku');
  console.log('      2. Karmaşık işlerde: `ecc-z/agents/INDEX.md` router\'ından agent seç');
  console.log('      3. Her anlamlı düzenlemeden sonra: `npm run ecc:verify`');
  console.log('      4. Commit öncesi: `npm run ecc:shield` (HIGH bulgu varsa dur)');
  console.log('      5. Oturum kapanışında: `npm run ecc:save --summary "..."`');
  console.log('      Tam anayasa: ecc-z/AGENTS.md');
  console.log('      ──────────────────────────────────────────────');
}

// 5) package.json script'leri
const pkgPath = join(target, 'package.json');
const scripts = {
  'ecc:context': 'node ecc-z/core/context-loader.mjs',
  'ecc:save': 'node ecc-z/core/session-save.mjs',
  'ecc:verify': 'node ecc-z/core/verify.mjs',
  'ecc:shield': 'node ecc-z/core/shield-scan.mjs',
  'ecc:sync': 'node ecc-z/core/skill-sync.mjs',
};
if (existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkg.scripts = pkg.scripts ?? {};
    const added = [];
    for (const [k, v] of Object.entries(scripts)) {
      if (!pkg.scripts[k]) { pkg.scripts[k] = v; added.push(k); }
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    if (added.length) ok(`package.json'a eklendi: ${added.join(', ')}`);
    else ok('package.json script\'leri zaten mevcut');
  } catch (e) {
    fail(`package.json okunamadı (${e.message}) — script'leri elle ekle (bkz. package-scripts.json)`);
  }
} else {
  writeFileSync(pkgPath, JSON.stringify({ name: 'my-project', private: true, scripts }, null, 2) + '\n');
  ok('package.json oluşturuldu (ecc:* script\'leriyle)');
}

// 6) Sonraki adımlar
console.log(`\n═══ Kurulum tamamlandı ═══\n`);
console.log('Sonraki adımlar:');
console.log('  1. ecc-z/memory/MEMORY.md → "Proje Bağlamı" bölümünü kendi projenle doldur');
console.log('  2. Doğrula:      npm run ecc:context   (Session Brief üretilmeli)');
console.log('  3. Doğrula:      npm run ecc:shield    (tarama çalışmalı, 0 HIGH beklenir)');
console.log('  4. Agent CLI\'na (zcode vb.) şunu söyletir:');
console.log('     "Her oturum başında ecc:context çalıştır, AGENTS.md anayasasına uy."');
console.log('\nDetaylı rehber: bu reponun KURULUM.md dosyası.');
