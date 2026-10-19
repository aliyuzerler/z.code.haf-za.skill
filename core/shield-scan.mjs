#!/usr/bin/env node
/**
 * ECC-Z Shield Scan — AgentShield eşdeğeri (Z.ai Code uyarlama)
 *
 * Taramalar:
 *   [S1] .env dosyaları .gitignore'da mı?                       → HIGH
 *   [S2] Kaynak kodda secret deseni (API key, token, PEM, JWT)  → HIGH
 *   [S3] src içinde mutlak URL/localhost/port'lu fetch (relatif   → MEDIUM
 *        yol kuralı; gateway'li ortamda yönlendirme parametresi)
 *   [S4] dangerouslySetInnerHTML kullanımı                       → MEDIUM
 *   [S5] skill/ecc-z talimatlarında prompt-injection deseni      → HIGH
 *        ("ignore previous instructions", curl|bash vb.)
 *   [S6] skills/ altında beklenmeyen çalıştırılabilir (.sh) dosya → INFO
 *
 * Kullanım: bun run ecc:shield [--json]
 * Çıkış kodu: HIGH bulgu varsa 1, aksi 0.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const METRICS_DIR = join(PROJECT_ROOT, 'ecc-z', 'memory', 'metrics');
const ALLOWLIST_FILE = join(PROJECT_ROOT, 'ecc-z', 'memory', 'shield-allowlist.json');

const SKIP_DIRS = new Set([
  'node_modules', '.next', '.git', 'db', 'public', 'upload', 'download',
  '.turbo', 'dist', 'build', 'coverage',
]);
const SCAN_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.prisma',
  '.sh', '.env.example', '.yml', '.yaml',
]);

const args = process.argv.slice(2);
const asJson = args.includes('--json');

/* ---------------- desenler ---------------- */
const SECRET_PATTERNS = [
  { id: 'openai-style-key', re: /sk-[A-Za-z0-9]{16,}/, hint: 'OpenAI tarzı API anahtarı' },
  { id: 'github-pat', re: /gh[pousr]_[A-Za-z0-9]{20,}/, hint: 'GitHub personal access token' },
  { id: 'aws-access-key', re: /AKIA[0-9A-Z]{16}/, hint: 'AWS access key id' },
  { id: 'slack-token', re: /xox[baprs]-[A-Za-z0-9-]{10,}/, hint: 'Slack token' },
  { id: 'private-key-block', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, hint: 'PEM özel anahtar' },
  { id: 'jwt', re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./, hint: 'JWT gömülü' },
  {
    id: 'generic-secret-assign',
    re: /(api[_-]?key|secret|token|password|passwd)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i,
    hint: 'Kod içine gömülü sırrı andıran atama',
  },
];

const INJECTION_PATTERNS = [
  { re: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i, hint: 'klasik prompt-injection' },
  { re: /disregard\s+(all|previous|your)\s+(instructions|rules)/i, hint: 'kurul yoksayma istemi' },
  { re: /you\s+are\s+now\s+(jailbroken|dan|unrestricted)/i, hint: 'rol kırma istemi' },
  { re: /curl[^|;&]*\|\s*(sudo\s+)?(ba|z|)sh\b/, hint: 'curl|sh boru hattı' },
];

const fetchAbsUrl = /(?:fetch|io)\(\s*["'`]https?:\/\/(localhost|127\.0\.0\.1|[\w.-]+:\d+)/;
const dangerouslySet = /dangerouslySetInnerHTML/;

/* ---------------- yürüyici ---------------- */
function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(p, out);
    } else if (st.isFile()) {
      out.push(p);
    }
  }
  return out;
}

const findings = [];
function add(severity, id, file, message) {
  findings.push({ severity, id, file: relative(PROJECT_ROOT, file), message });
}

/* --- S1: .env gitignore kontrolü --- */
const gitignorePath = join(PROJECT_ROOT, '.gitignore');
const gitignore = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf8') : '';
for (const envName of ['.env', '.env.local', '.env.production']) {
  const p = join(PROJECT_ROOT, envName);
  if (existsSync(p) && !gitignore.split('\n').some((l) => l.trim() === envName || l.trim() === '.env*')) {
    add('HIGH', 'S1', p, `${envName} mevcut ama .gitignore'da yok`);
  }
}

/* --- kaynak dosya taraması --- */
const srcFiles = walk(join(PROJECT_ROOT, 'src'));
const eccFiles = walk(join(PROJECT_ROOT, 'ecc-z'));
const prismaFiles = existsSync(join(PROJECT_ROOT, 'prisma')) ? walk(join(PROJECT_ROOT, 'prisma')) : [];
const miniFiles = existsSync(join(PROJECT_ROOT, 'mini-services')) ? walk(join(PROJECT_ROOT, 'mini-services')) : [];

for (const f of [...srcFiles, ...miniFiles, ...prismaFiles]) {
  if (!SCAN_EXT.has('.' + f.split('.').pop())) continue;
  let text;
  try {
    text = readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  const lines = text.split('\n');

  lines.forEach((line, i) => {
    // S2: secret desenleri (test/örnek dosyalarında da yanlış pozitif olabilir; yine de işaretle)
    for (const sp of SECRET_PATTERNS) {
      if (sp.re.test(line)) {
        add('HIGH', 'S2', f, `${sp.hint} (satır ${i + 1})`);
      }
    }
    // S3: mutlak URL / port'lu istek (gateway kuralı)
    if (fetchAbsUrl.test(line)) {
      add('MEDIUM', 'S3', f, `Mutlak URL'li istek yasak (relatif yol kullan; gateway'li ortamda ilgili yönlendirme parametresini uygula) — satır ${i + 1}`);
    }
    // S4: dangerouslySetInnerHTML
    if (dangerouslySet.test(line)) {
      add('MEDIUM', 'S4', f, `dangerouslySetInnerHTML kullanımı — satır ${i + 1}`);
    }
  });
}

/* --- S5/S6: talimat dosyalarında injection / beklenmeyen script --- */
for (const f of [...eccFiles, ...walk(join(PROJECT_ROOT, 'skills'))]) {
  const isMd = f.endsWith('.md');
  const isSh = f.endsWith('.sh');
  if (isSh && f.includes(`${sep}skills${sep}`)) {
    add('INFO', 'S6', f, 'skills/ altında kabuk scripti — elle incelenmeli');
    continue;
  }
  if (!isMd) continue;
  let text;
  try {
    text = readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const ip of INJECTION_PATTERNS) {
      if (ip.re.test(line)) {
        add('HIGH', 'S5', f, `${ip.hint} (satır ${i + 1})`);
      }
    }
  });
}

/* ---------------- rapor ---------------- */

// Allowlist: elle gözden geçirilmiş, gerekçelendirilmiş bulgular (görünür kalır, exit koduna katılmaz)
function loadAllowlist() {
  try {
    if (!existsSync(ALLOWLIST_FILE)) return [];
    const parsed = JSON.parse(readFileSync(ALLOWLIST_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
const allowlist = loadAllowlist();
const isAllowed = (finding) =>
  allowlist.some((a) => a.id === finding.id && a.path === finding.file);

const allowedFindings = findings.filter(isAllowed);
const activeFindings = findings.filter((f) => !isAllowed(f));

const order = { HIGH: 0, MEDIUM: 1, INFO: 2 };
activeFindings.sort((a, b) => order[a.severity] - order[b.severity]);
const highCount = activeFindings.filter((f) => f.severity === 'HIGH').length;
const mediumCount = activeFindings.filter((f) => f.severity === 'MEDIUM').length;
const infoCount = activeFindings.filter((f) => f.severity === 'INFO').length;

if (asJson) {
  console.log(
    JSON.stringify(
      { ts: new Date().toISOString(), high: highCount, medium: mediumCount, info: infoCount, findings: activeFindings, allowlisted: allowedFindings },
      null,
      2
    )
  );
} else {
  console.log('═══ ECC-Z Shield Scan ═══');
  if (activeFindings.length === 0) {
    console.log('✓ Temiz: aktif bulgu yok.');
  } else {
    for (const f of activeFindings) {
      const icon = f.severity === 'HIGH' ? '🔴' : f.severity === 'MEDIUM' ? '🟠' : '🔵';
      console.log(`${icon} [${f.severity}] ${f.id} ${f.file}\n   ${f.message}`);
    }
  }
  if (allowedFindings.length > 0) {
    console.log(`\n── Allowlist uygulanan bulgular (${allowedFindings.length}) — gözden geçirilmiş, görünür tutulur ──`);
    for (const f of allowedFindings) {
      const entry = allowlist.find((a) => a.id === f.id && a.path === f.file);
      console.log(`⚪ [${f.severity}] ${f.id} ${f.file}\n   Gerekçe: ${entry?.reason ?? 'belirtilmemiş'}`);
    }
  }
  console.log(`\nÖzet: ${highCount} HIGH, ${mediumCount} MEDIUM, ${infoCount} INFO (allowlist dışı)`);
}

try {
  const { appendFileSync, mkdirSync } = await import('node:fs');
  mkdirSync(METRICS_DIR, { recursive: true });
  appendFileSync(
    join(METRICS_DIR, 'shield-log.jsonl'),
    JSON.stringify({ ts: new Date().toISOString(), high: highCount, medium: mediumCount, info: infoCount, allowlisted: allowedFindings.length }) + '\n'
  );
} catch {
  /* metrik kritik değil */
}

process.exit(highCount > 0 ? 1 : 0);
