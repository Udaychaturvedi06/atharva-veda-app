#!/usr/bin/env node

/**
 * Resumable Batch Audio Generation Pipeline
 * 
 * Pre-generates high-fidelity Vedic chanting audio assets and alignment metadata
 * for offline and high-traffic caching.
 * 
 * Usage:
 *   node scripts/batch-audio-generation.mjs --veda=atharva --division=1 --limit=5
 *   node scripts/batch-audio-generation.mjs --veda=rig --division=1 --limit=10 --concurrency=2
 *   node scripts/batch-audio-generation.mjs --resume
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { audioGenerationService } from '../api/services/tts/audioGenerationService.js';
import { audioCacheStorage } from '../api/services/tts/audioCacheStorage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, '..', 'data', 'corpus', 'batch-generation-report.json');

// Parse CLI flags
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    veda: 'atharva',
    division: 1,
    limit: 10,
    concurrency: 2,
    resume: false
  };

  for (const arg of args) {
    if (arg.startsWith('--veda=')) options.veda = arg.split('=')[1];
    else if (arg.startsWith('--division=')) options.division = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--limit=')) options.limit = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--concurrency=')) options.concurrency = parseInt(arg.split('=')[1], 10);
    else if (arg === '--resume') options.resume = true;
  }

  return options;
}

// Load partition verses
function loadVersesToProcess(options) {
  const veda = options.veda.toLowerCase();
  let partitionPath = '';

  if (veda === 'rig' || veda === 'rigveda') {
    partitionPath = path.join(__dirname, '..', 'public', 'corpus', 'rigveda', `mandala_${options.division}.json`);
  } else if (veda === 'atharva' || veda === 'atharvaveda') {
    partitionPath = path.join(__dirname, '..', 'public', 'corpus', 'atharvaveda', `kaanda_${options.division}.json`);
  } else if (veda === 'yajur' || veda === 'yajurveda') {
    partitionPath = path.join(__dirname, '..', 'public', 'corpus', 'yajurveda', 'madhyandina_part_1.json');
  } else if (veda === 'sama' || veda === 'samaveda') {
    partitionPath = path.join(__dirname, '..', 'public', 'corpus', 'samaveda', 'purvarcika.json');
  }

  if (!fs.existsSync(partitionPath)) {
    throw new Error(`Partition file not found: ${partitionPath}`);
  }

  const data = JSON.parse(fs.readFileSync(partitionPath, 'utf8'));
  const verses = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.verses && Array.isArray(item.verses)) {
        for (const v of item.verses) {
          verses.push({
            verseId: v.id,
            canonicalRef: v.canonicalRef,
            devanagari: v.accentedText || v.displayText,
            iast: v.displayText,
            words: (v.displayText || '').split(/\s+/).map(t => ({ text: t })),
            meter: item.meter
          });
        }
      } else if (item.accentedText) {
        // Direct verse array
        verses.push({
          verseId: item.id,
          canonicalRef: item.canonicalRef,
          devanagari: item.accentedText,
          iast: item.displayText,
          words: (item.displayText || '').split(/\s+/).map(t => ({ text: t })),
          meter: item.meter
        });
      }
    }
  }

  return verses;
}

async function main() {
  const options = parseArgs();
  console.log('='.repeat(70));
  console.log('FOUR VEDAS: BATCH RECITATION SYNTHESIS WORKER');
  console.log('='.repeat(70));
  console.log(`Target Veda: ${options.veda}`);
  console.log(`Target Division: ${options.division}`);
  console.log(`Limit: ${options.limit}`);
  console.log(`Concurrency: ${options.concurrency}`);
  console.log(`Resume Mode: ${options.resume ? 'ENABLED' : 'DISABLED'}\n`);

  // Load previous report if resuming
  let report = {
    startedAt: new Date().toISOString(),
    options,
    completed: [],
    failed: [],
    metrics: {}
  };

  if (options.resume && fs.existsSync(REPORT_PATH)) {
    try {
      report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
      console.log(`Resumed prior run. Completed items so far: ${report.completed.length}`);
    } catch {
      // fresh
    }
  }

  const allVerses = loadVersesToProcess(options);
  const completedKeys = new Set(report.completed.map(c => c.verseId));
  const queue = allVerses.filter(v => !completedKeys.has(v.verseId)).slice(0, options.limit);

  console.log(`Total Verses in Partition: ${allVerses.length}`);
  console.log(`Verses to Process this Run: ${queue.length}\n`);

  const saveReport = () => {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  };

  process.on('SIGINT', () => {
    console.log('\nProcess interrupted by user. Saving progress report...');
    saveReport();
    process.exit(0);
  });

  const startTime = Date.now();
  let processed = 0;

  // Process with concurrency limit
  for (let i = 0; i < queue.length; i += options.concurrency) {
    const batch = queue.slice(i, i + options.concurrency);
    await Promise.all(
      batch.map(async (verseItem) => {
        const itemStart = Date.now();
        try {
          const result = await audioGenerationService.synthesizeVerse({
            verseId: verseItem.verseId,
            devanagari: verseItem.devanagari,
            iast: verseItem.iast,
            words: verseItem.words,
            meter: verseItem.meter
          });

          const timeTaken = Date.now() - itemStart;
          console.log(`  [OK] ${verseItem.verseId} (${verseItem.canonicalRef}) - ${result.durationMs}ms audio generated in ${timeTaken}ms [${result.engine}]`);

          report.completed.push({
            verseId: verseItem.verseId,
            canonicalRef: verseItem.canonicalRef,
            cacheKey: result.cacheKey,
            audioUrl: result.audioUrl,
            durationMs: result.durationMs,
            engine: result.engine,
            generationTimeMs: timeTaken,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.warn(`  [FAIL] ${verseItem.verseId} (${verseItem.canonicalRef}): ${err.message}`);
          report.failed.push({
            verseId: verseItem.verseId,
            error: err.message,
            timestamp: new Date().toISOString()
          });
        } finally {
          processed++;
          saveReport();
        }
      })
    );
  }

  const totalTime = Date.now() - startTime;
  report.metrics = {
    totalRequested: queue.length,
    totalCompleted: report.completed.length,
    totalFailed: report.failed.length,
    elapsedMs: totalTime,
    avgMsPerVerse: queue.length > 0 ? Math.round(totalTime / queue.length) : 0,
    timestamp: new Date().toISOString()
  };

  saveReport();

  console.log('\n' + '='.repeat(70));
  console.log('BATCH AUDIO SYNTHESIS SUMMARY:');
  console.log(`  Processed: ${processed}`);
  console.log(`  Total Completed: ${report.completed.length}`);
  console.log(`  Total Failed: ${report.failed.length}`);
  console.log(`  Average Time: ${report.metrics.avgMsPerVerse} ms / verse`);
  console.log(`  Report Saved: ${REPORT_PATH}`);
  console.log('='.repeat(70));
}

main().catch((err) => {
  console.error('Fatal Batch Worker Error:', err);
  process.exit(1);
});
