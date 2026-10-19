#!/usr/bin/env node
/**
 * ECC-Z Verify — PostToolUse/PostEdit hook eşdeğeri (Z.ai Code uyarlama)
 *
 * Z.ai Code'da engelleyici (deny) hook API'si olmadığı için bu script
 * "yumuşak hook" olarak çalışır: disiplin sözleşmesi (ecc-z/AGENTS.md)
 * önemli her düzenlemeden sonra çağrılmasını zorunlu kılar.
 *
 * Ne yapar:
 *   1. ESLint (bun run lint) — her zaman
 *   2. TypeScript (tsc --noEmit) — yalnızca --types ile (yavaş olabilir)
 *   3. Sonucu memory/metrics/verify-log.jsonl'e yaz
 *   4. Başarısızlıkta exit 1 (ajan akışı durdurabilsin)
 *
 * Kullanım: bun run ecc:verify [--types] [--quiet]
 */

import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const METRICS_DIR = join(PROJECT_ROOT, 'ecc-z', 'memory', 'metrics');

const args = process.argv.slice(2);
const wantTypes = args.includes('--types');
const quiet = args.includes('--quiet');

function run(cmd, cmdArgs, cwd) {
  const r = spawnSync(cmd, cmdArgs, { cwd, encoding: 'utf8', shell: false, timeout: 180_000 });
  return {
    ok: r.status === 0,
    output: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim(),
  };
}

function tail(text, n = 40) {
  const lines = text.split('\n');
  return lines.length <= n ? text : lines.slice(-n).join('\n');
}

const started = Date.now();
const results = { ts: new Date().toISOString(), lint: 'skip', types: 'skip', durationMs: 0 };

console.log('═══ ECC-Z Verify ═══');

/* --- ESLint --- */
if (!quiet) console.log('▶ lint: eslint çalışıyor…');
const lint = run('bun', ['run', 'lint'], PROJECT_ROOT);
results.lint = lint.ok ? 'pass' : 'fail';
if (!quiet) {
  console.log(lint.ok ? '✓ lint: PASS' : '✗ lint: FAIL');
  if (!lint.ok) console.log(tail(lint.output));
}

/* --- TypeScript --- */
if (wantTypes) {
  if (!quiet) console.log('▶ types: tsc --noEmit (src/ sorumluluk alanı) çalışıyor…');
  // Not: examples/ ve skills/ ortamın sağladığı üçüncü parti dosyalardır ve uygulamanın
  // sorumluluk alanına girmez; tip kontrolü src/ ile sınırlanır (tsconfig.verify.json).
  const ts = run('bunx', ['tsc', '-p', join('ecc-z', 'core', 'tsconfig.verify.json')], PROJECT_ROOT);
  results.types = ts.ok ? 'pass' : 'fail';
  if (!quiet) {
    console.log(ts.ok ? '✓ types: PASS' : '✗ types: FAIL');
    if (!ts.ok) console.log(tail(ts.output));
  }
}

results.durationMs = Date.now() - started;

try {
  mkdirSync(METRICS_DIR, { recursive: true });
  appendFileSync(join(METRICS_DIR, 'verify-log.jsonl'), JSON.stringify(results) + '\n');
} catch {
  /* metrik kritik değil */
}

if (!quiet) {
  console.log(`═══ Sonuç: lint=${results.lint} types=${results.types} (${results.durationMs}ms) ═══`);
}

process.exit(results.lint === 'fail' || results.types === 'fail' ? 1 : 0);
