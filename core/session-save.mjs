#!/usr/bin/env node
/**
 * ECC-Z Session Save — SessionEnd eşdeğeri (Z.ai Code uyarlama)
 *
 * ECC'nin oturum özeti + sürekli öğrenme + prune akışının Z karşılığı.
 *
 * Kullanım:
 *   bun run ecc:save --summary "Bu oturumda X yapıldı..."           → oturum özeti yazar
 *   bun run ecc:save --instinct "tetik::aksiyon::0.85::domain"      → içgüdü kaydet
 *   bun run ecc:save --note "Proje kararı: Y"                       → MEMORY.md'ye not düş
 *   bun run ecc:save --prune                                        → eski oturum dosyalarını sil
 *
 * Notlar:
 *  - Oturum kaydetme sonrası prune otomatik çalışır (ECCZ_RETENTION_DAYS, varsayılan 30).
 *  - İçgüdü formatı: trigger::action::confidence[::domain]
 */

import {
  writeFileSync,
  appendFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  unlinkSync,
  mkdirSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ECCZ_ROOT = resolve(__dirname, '..');
const MEMORY_DIR = join(ECCZ_ROOT, 'memory');
const SESSION_DIR = join(MEMORY_DIR, 'session-data');
const INSTINCTS_FILE = join(MEMORY_DIR, 'instincts.json');
const MEMORY_FILE = join(MEMORY_DIR, 'MEMORY.md');
const RETENTION_DAYS = Number(process.env.ECCZ_RETENTION_DAYS ?? 30);
const MAX_MEMORY_NOTES = 20;

const args = process.argv.slice(2);

function argValue(flag) {
  const i = args.indexOf(flag);
  if (i === -1 || i + 1 >= args.length) return undefined;
  return args[i + 1];
}

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`,
  };
}

/* ---------------- oturum özeti ---------------- */
function saveSummary(text) {
  mkdirSync(SESSION_DIR, { recursive: true });
  const { date, time } = stamp();
  const file = join(SESSION_DIR, `${date}_${time}.md`);
  const body = [
    `# Oturum: ${date} ${time.replace('-', ':').replace('-', ':')}`,
    '',
    text.trim(),
    '',
  ].join('\n');
  writeFileSync(file, body, 'utf8');
  console.log(`✓ Oturum özeti kaydedildi: ecc-z/memory/session-data/${date}_${time}.md`);
  return file;
}

/* ---------------- içgüdü kaydı ---------------- */
function saveInstinct(raw) {
  const parts = String(raw).split('::').map((s) => s.trim());
  if (parts.length < 3) {
    console.error('✗ İçgüdü formatı hatalı. Beklenen: "trigger::action::confidence[::domain]"');
    process.exit(1);
  }
  const [trigger, action, confRaw, domain] = parts;
  const confidence = Math.max(0, Math.min(1, Number(confRaw)));
  if (!trigger || !action || Number.isNaN(confidence)) {
    console.error('✗ İçgüdü alanları geçersiz (confidence 0-1 arası sayı olmalı).');
    process.exit(1);
  }

  let list = [];
  try {
    if (existsSync(INSTINCTS_FILE)) {
      const parsed = JSON.parse(readFileSync(INSTINCTS_FILE, 'utf8'));
      if (Array.isArray(parsed)) list = parsed;
    }
  } catch {
    list = [];
  }

  // Aynı trigger+action varsa: confidence'ı yükselt (ECC "instinct reinforcement" davranışı)
  const existing = list.find((i) => i.trigger === trigger && i.action === action);
  if (existing) {
    existing.confidence = Math.min(1, Math.max(existing.confidence, confidence));
    existing.updatedAt = new Date().toISOString();
    existing.timesReinforced = (existing.timesReinforced ?? 1) + 1;
    console.log(`✓ İçgüdü pekiştirildi (confidence → ${existing.confidence.toFixed(2)}): ${trigger}`);
  } else {
    list.push({
      id: `inst-${Date.now()}`,
      trigger,
      action,
      confidence,
      domain: domain || 'general',
      source: 'session-save',
      createdAt: new Date().toISOString(),
      timesReinforced: 1,
    });
    console.log(`✓ Yeni içgüdü kaydedildi: ${trigger} (confidence ${confidence.toFixed(2)})`);
  }

  // Maksimum 100 içgüdü tut (en düşük confidence'lıları at)
  if (list.length > 100) {
    list.sort((a, b) => Number(b.confidence) - Number(a.confidence));
    list = list.slice(0, 100);
  }

  writeFileSync(INSTINCTS_FILE, JSON.stringify(list, null, 2) + '\n', 'utf8');
}

/* ---------------- MEMORY.md notu ---------------- */
function appendNote(text) {
  if (!existsSync(MEMORY_FILE)) {
    console.error('✗ MEMORY.md bulunamadı.');
    process.exit(1);
  }
  let content = readFileSync(MEMORY_FILE, 'utf8');
  const sectionHeader = '## Otomatik Eklenen Notlar';
  const bullet = `- [${stamp().date}] ${text.trim()}`;

  if (!content.includes(sectionHeader)) {
    content = content.trimEnd() + `\n\n${sectionHeader}\n${bullet}\n`;
  } else {
    const idx = content.indexOf(sectionHeader);
    const after = content.slice(idx + sectionHeader.length);
    const lines = after.split('\n').filter((l) => l.startsWith('- ['));
    const notes = [...lines, bullet].slice(-MAX_MEMORY_NOTES);
    content = content.slice(0, idx) + sectionHeader + '\n' + notes.join('\n') + '\n';
  }
  writeFileSync(MEMORY_FILE, content, 'utf8');
  console.log('✓ MEMORY.md güncellendi (son ' + MAX_MEMORY_NOTES + ' not korunur).');
}

/* ---------------- prune ---------------- */
function prune() {
  if (!existsSync(SESSION_DIR)) return;
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let removed = 0;
  for (const f of readdirSync(SESSION_DIR)) {
    if (!f.endsWith('.md')) continue;
    // Dosya adındaki tarih (YYYY-MM-DD_...) güvenilir chronology sağlar
    const m = f.match(/^(\d{4}-\d{2}-\d{2})_/);
    const ts = m ? new Date(m[1]).getTime() : 0;
    if (ts && ts < cutoff) {
      unlinkSync(join(SESSION_DIR, f));
      removed++;
    }
  }
  if (removed > 0) console.log(`✓ Prune: ${removed} eski oturum özeti silindi (retention ${RETENTION_DAYS} gün).`);
}

/* ---------------- akış ---------------- */
let didSomething = false;
const summary = argValue('--summary');
const instinct = argValue('--instinct');
const note = argValue('--note');

if (summary) {
  saveSummary(summary);
  didSomething = true;
}
if (instinct) {
  saveInstinct(instinct);
  didSomething = true;
}
if (note) {
  appendNote(note);
  didSomething = true;
}
if (args.includes('--prune') || didSomething) {
  prune();
}
if (!didSomething && !args.includes('--prune')) {
  console.log(
    [
      'ECC-Z Session Save',
      'Kullanım:',
      '  bun run ecc:save --summary "Bu oturumda ..."      # oturum özeti',
      '  bun run ecc:save --instinct "tetik::aksiyon::0.9" # içgüdü kaydet',
      '  bun run ecc:save --note "Karar: ..."              # MEMORY.md notu',
      '  bun run ecc:save --prune                          # eski kayıtları temizle',
    ].join('\n')
  );
}
