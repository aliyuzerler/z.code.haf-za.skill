#!/usr/bin/env node
/**
 * ECC-Z Context Loader — SessionStart eşdeğeri (Z.ai Code uyarlama)
 *
 * ECC'nin SessionStart hook'unun Z.ai Code karşılığı: otomatik enjeksiyon
 * yoktur; disiplin sözleşmesi (ecc-z/AGENTS.md) gereği her oturumun başında
 * çalıştırılır ve üretilen "Session Brief" okunur.
 *
 * Toplar:
 *   1. memory/MEMORY.md                     → çekirdek bellek (tam metin)
 *   2. memory/instincts.json                → confidence eşiğini geçen içgüdüler (max N)
 *   3. memory/session-data/*.md             → son N oturum özeti (ilk satırları)
 *   4. memory/synced-skills.json            → senkronize ECC skill kataloğu
 *
 * Çıktı: stdout'a markdown "Session Brief" (--json ile makine okunur).
 * Kullanım: bun run ecc:context [--json] [--max-chars 6000]
 */

import { readFileSync, readdirSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ECCZ_ROOT = resolve(__dirname, '..');
const MEMORY_DIR = join(ECCZ_ROOT, 'memory');
const SESSION_DIR = join(MEMORY_DIR, 'session-data');
const METRICS_DIR = join(MEMORY_DIR, 'metrics');

// ECC ortam değişkenleriyle uyumlu ayarlanabilir limitler
const MAX_CHARS = Number(process.env.ECCZ_SESSION_START_MAX_CHARS ?? 6000);
const MAX_INSTINCTS = Number(process.env.ECCZ_MAX_INJECTED_INSTINCTS ?? 6);
const INSTINCT_THRESHOLD = Number(process.env.ECCZ_INSTINCT_CONFIDENCE_THRESHOLD ?? 0.7);
const SESSION_COUNT = Number(process.env.ECCZ_SESSION_COUNT ?? 3);
const SESSION_SNIPPET_CHARS = 700;

const args = process.argv.slice(2);
const asJson = args.includes('--json');

function readIfExists(p, fallback = '') {
  try {
    return existsSync(p) ? readFileSync(p, 'utf8') : fallback;
  } catch {
    return fallback;
  }
}

function loadInstincts() {
  const raw = readIfExists(join(MEMORY_DIR, 'instincts.json'), '[]');
  let list = [];
  try {
    list = JSON.parse(raw);
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }
  return list
    .filter((i) => Number(i.confidence) >= INSTINCT_THRESHOLD)
    .sort((a, b) => Number(b.confidence) - Number(a.confidence))
    .slice(0, MAX_INSTINCTS);
}

function loadRecentSessions() {
  if (!existsSync(SESSION_DIR)) return [];
  const files = readdirSync(SESSION_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, SESSION_COUNT);
  return files.map((f) => {
    const content = readFileSync(join(SESSION_DIR, f), 'utf8');
    return {
      file: f,
      snippet:
        content.length > SESSION_SNIPPET_CHARS
          ? content.slice(0, SESSION_SNIPPET_CHARS) + ' …'
          : content,
    };
  });
}

function loadSkillCatalog() {
  const raw = readIfExists(join(MEMORY_DIR, 'synced-skills.json'), '[]');
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.map((s) => s.name).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function buildBrief() {
  const coreMemory = readIfExists(join(MEMORY_DIR, 'MEMORY.md'), '(boş)');
  const instincts = loadInstincts();
  const sessions = loadRecentSessions();
  const skills = loadSkillCatalog();

  const now = new Date().toISOString();
  const lines = [];

  lines.push('# ECC-Z Session Brief');
  lines.push(`> Üretim: ${now} | içgüdü eşiği: ${INSTINCT_THRESHOLD} | bütçe: ${MAX_CHARS} karakter`);
  lines.push('');
  lines.push('## 1. Çekirdek Bellek (MEMORY.md)');
  lines.push(coreMemory.trim());
  lines.push('');

  lines.push(`## 2. İçgüdüler (confidence ≥ ${INSTINCT_THRESHOLD}, max ${MAX_INSTINCTS})`);
  if (instincts.length === 0) {
    lines.push('- (henüz öğrenilmiş içgüdü yok)');
  } else {
    for (const i of instincts) {
      lines.push(
        `- [${Number(i.confidence).toFixed(2)}] ${i.trigger} → ${i.action}${i.domain ? ` (${i.domain})` : ''}`
      );
    }
  }
  lines.push('');

  lines.push(`## 3. Son ${SESSION_COUNT} Oturum Özeti`);
  if (sessions.length === 0) {
    lines.push('- (henüz oturum kaydı yok)');
  } else {
    for (const s of sessions) {
      lines.push(`### ${s.file}`);
      lines.push('```');
      lines.push(s.snippet.trim());
      lines.push('```');
      lines.push('');
    }
  }

  lines.push('## 4. Senkronize ECC Skill Kataloğu');
  lines.push(
    skills.length > 0
      ? skills.map((s) => `- ${s}`).join('\n')
      : '- (senkronize skill yok — `bun run ecc:sync` ile ekle)'
  );
  lines.push('');
  lines.push('> Disiplin hatırlatması: önemli dosya düzenlemelerinden sonra `bun run ecc:verify`,');
  lines.push('> oturum sonunda `bun run ecc:save --summary "..."`, commitlemeden önce `bun run ecc:shield`.');

  return lines.join('\n');
}

function clamp(text) {
  if (text.length <= MAX_CHARS) return text;
  return (
    text.slice(0, MAX_CHARS) +
    `\n\n… (brief ${text.length - MAX_CHARS} karakter kısaltıldı; ECCZ_SESSION_START_MAX_CHARS ile artır)`
  );
}

const brief = clamp(buildBrief());

// Metrik logla (sessizce; hata olursa akışı bozma)
try {
  mkdirSync(METRICS_DIR, { recursive: true });
  appendFileSync(
    join(METRICS_DIR, 'context-log.jsonl'),
    JSON.stringify({ ts: new Date().toISOString(), chars: brief.length }) + '\n'
  );
} catch {
  /* metrik yazımı kritik değil */
}

if (asJson) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), chars: brief.length, brief }));
} else {
  console.log(brief);
}
