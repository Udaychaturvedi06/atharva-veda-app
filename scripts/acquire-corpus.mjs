#!/usr/bin/env node

/**
 * Corpus Acquisition Script
 * 
 * Fetches verified machine-readable Vedic text collections from authoritative
 * open repositories (DharmicData, Vedic Heritage Portal, GRETIL) into local cache.
 * 
 * Idempotent: Skips existing files unless --force is specified.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.join(__dirname, '..', 'data', 'corpus', 'raw');

const BASE_URL = 'https://raw.githubusercontent.com/bhavykhatri/DharmicData/main';

const CORPUS_FILES = [
  // 1. Rigveda (10 Mandalas)
  ...Array.from({ length: 10 }, (_, i) => ({
    veda: 'rigveda',
    subpath: `Rigveda/rigveda_mandala_${i + 1}.json`,
    localName: `rigveda_mandala_${i + 1}.json`
  })),

  // 2. Atharvaveda (20 Kaandas)
  ...Array.from({ length: 20 }, (_, i) => ({
    veda: 'atharvaveda',
    subpath: `AtharvaVeda/atharvaveda_kaanda_${i + 1}.json`,
    localName: `atharvaveda_kaanda_${i + 1}.json`
  })),

  // 3. Yajurveda (Madhyandina & Kanva)
  {
    veda: 'yajurveda',
    subpath: 'Yajurveda/vajasneyi_madhyadina_samhita.json',
    localName: 'yajurveda_madhyandina_samhita.json'
  },
  {
    veda: 'yajurveda',
    subpath: 'Yajurveda/vajasneyi_kanva_samhita_chapters.json',
    localName: 'yajurveda_kanva_samhita.json'
  },

  // 4. Samaveda (Griffith Verses & Canonical Mapping)
  {
    veda: 'samaveda',
    subpath: 'Samaveda/Samaveda.json',
    localName: 'samaveda_verses.json'
  }
];

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  const text = await res.text();
  fs.writeFileSync(destPath, text, 'utf8');
}

async function main() {
  const force = process.argv.includes('--force');
  fs.mkdirSync(RAW_DIR, { recursive: true });

  console.log('='.repeat(70));
  console.log('THE FOUR VEDAS: RAW CORPUS ACQUISITION PIPELINE');
  console.log('='.repeat(70));
  console.log(`Target Directory: ${RAW_DIR}`);
  console.log(`Total Target Files: ${CORPUS_FILES.length}`);
  console.log(`Force Overwrite: ${force ? 'YES' : 'NO'}\n`);

  let downloaded = 0;
  let cached = 0;
  let failed = 0;

  for (const item of CORPUS_FILES) {
    const dest = path.join(RAW_DIR, item.localName);
    if (fs.existsSync(dest) && !force) {
      console.log(`  [CACHED] ${item.localName} (${(fs.statSync(dest).size / 1024).toFixed(1)} KB)`);
      cached++;
      continue;
    }

    const fileUrl = `${BASE_URL}/${item.subpath}`;
    process.stdout.write(`  [DOWNLOADING] ${item.localName} ... `);
    try {
      await downloadFile(fileUrl, dest);
      const sizeKb = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`OK (${sizeKb} KB)`);
      downloaded++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`ACQUISITION COMPLETE: ${downloaded} downloaded, ${cached} cached, ${failed} failed.`);
  console.log('='.repeat(70));

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Acquisition Error:', err);
  process.exit(1);
});
