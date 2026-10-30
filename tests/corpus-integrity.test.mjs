import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function extractVerses(data) {
  if (!Array.isArray(data)) return [];
  if (data.length === 0) return [];
  if (data[0].verses && Array.isArray(data[0].verses)) {
    return data.flatMap(d => d.verses);
  }
  return data;
}

test('Four Vedas Corpus Integrity & Philological Verification Suite', async (t) => {
  const sourcesPath = path.join(ROOT, 'data/corpus/sources.json');
  const inventoryPath = path.join(ROOT, 'data/corpus/inventory.json');

  await t.test('verifies machine-readable sources registry exists with all 4 Vedas', () => {
    assert.ok(fs.existsSync(sourcesPath), 'sources.json must exist in data/corpus/');
    const { sources } = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

    const rigSrc = sources.find(s => s.vedaSlug === 'rig' || s.vedaId === 'rigveda');
    const atharvaSrc = sources.find(s => s.vedaSlug === 'atharva' || s.vedaId === 'atharvaveda');
    const yajurSrc = sources.find(s => s.vedaSlug === 'yajur' || s.vedaId === 'yajurveda');
    const samaSrc = sources.find(s => s.vedaSlug === 'sama' || s.vedaId === 'samaveda');

    assert.ok(rigSrc, 'Rigveda must be registered in sources');
    assert.ok(atharvaSrc, 'Atharvaveda must be registered in sources');
    assert.ok(yajurSrc, 'Yajurveda must be registered in sources');
    assert.ok(samaSrc, 'Samaveda must be registered in sources');

    assert.strictEqual(rigSrc.recension, 'Śākala Śākhā');
    assert.strictEqual(atharvaSrc.recension, 'Śaunaka Śākhā');
    assert.strictEqual(yajurSrc.recension, 'Vājasaneyi Mādhyandina Saṁhitā');
    assert.strictEqual(samaSrc.recension, 'Kauthuma Śākhā');
  });

  await t.test('verifies public corpus inventory manifests 20,081 canonical mantras', () => {
    assert.ok(fs.existsSync(inventoryPath), 'inventory.json must exist in data/corpus/');
    const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

    assert.strictEqual(inventory.totalMantras, 20081, 'Total corpus must exactly equal 20,081 mantras');
    assert.strictEqual(inventory.corpora.rigveda.totalMantras, 10201, 'Rigveda must have 10,201 mantras');
    assert.strictEqual(inventory.corpora.atharvaveda.totalMantras, 6121, 'Atharvaveda must have 6,121 mantras');
    assert.strictEqual(inventory.corpora.yajurveda.totalMantras, 1965, 'Yajurveda must have 1,965 mantras');
    assert.strictEqual(inventory.corpora.samaveda.totalMantras, 1794, 'Samaveda must have 1,794 mantras');
  });

  await t.test('verifies all partition JSON files exist on disk and contain valid verse schemas', () => {
    const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    let verifiedMantrasCount = 0;

    for (const [vedaKey, vedaData] of Object.entries(inventory.corpora)) {
      assert.ok(vedaData.divisions.length > 0, `${vedaKey} must have divisions`);

      // Group divisions by partition file (e.g. Yajurveda groups 10 adhyayas per partition)
      const partitionMap = new Map();
      for (const divInfo of vedaData.divisions) {
        if (!partitionMap.has(divInfo.partitionFile)) {
          partitionMap.set(divInfo.partitionFile, []);
        }
        partitionMap.get(divInfo.partitionFile).push(divInfo);
      }

      for (const [partitionFile, divInfos] of partitionMap.entries()) {
        const cleanRelPath = partitionFile.replace(/^\//, '');
        const partitionPath = path.join(ROOT, 'public', cleanRelPath);
        assert.ok(fs.existsSync(partitionPath), `Partition file must exist: ${partitionPath}`);

        const partitionData = JSON.parse(fs.readFileSync(partitionPath, 'utf8'));
        assert.ok(Array.isArray(partitionData), `Partition data in ${partitionPath} must be an array`);

        const verses = extractVerses(partitionData);
        const expectedCount = divInfos.reduce((sum, d) => sum + d.mantraCount, 0);
        assert.strictEqual(verses.length, expectedCount, `Count mismatch in ${partitionPath}`);

        // Sample check first and last verse in each partition
        const samples = [verses[0], verses[verses.length - 1]];
        for (const verse of samples) {
          assert.ok(verse.id, `Verse missing ID in ${partitionPath}`);
          assert.strictEqual(typeof verse.id, 'string');
          assert.ok(verse.accentedText && verse.accentedText.length > 0, `Verse missing accentedText in ${partitionPath}`);
          assert.ok(verse.displayText && verse.displayText.length > 0, `Verse missing displayText in ${partitionPath}`);
          assert.ok(verse.searchText && verse.searchText.length > 0, `Verse missing searchText in ${partitionPath}`);
          assert.ok(typeof verse.verseNum === 'number', `Verse number must be number in ${partitionPath}`);
        }

        verifiedMantrasCount += verses.length;
      }
    }

    assert.strictEqual(verifiedMantrasCount, 20081, 'Verified partition mantras must sum to 20,081');
  });

  await t.test('verifies svara preservation and accent marks in Rigveda & Atharvaveda', () => {
    // RV Mandala 1
    const rv1Path = path.join(ROOT, 'public/corpus/rigveda/mandala_1.json');
    const rv1 = JSON.parse(fs.readFileSync(rv1Path, 'utf8'));
    const rvVerses = extractVerses(rv1);
    const agniVerse = rvVerses.find(v => v.id === 'rv-1-1-1');
    assert.ok(agniVerse, 'RV 1.1.1 must exist');
    assert.ok(
      agniVerse.accentedText.includes('\u0951') || agniVerse.accentedText.includes('\u0952'),
      'Rigveda 1.1.1 must preserve Vedic svara markers (udatta or anudatta)'
    );

    // AV Kanda 1
    const av1Path = path.join(ROOT, 'public/corpus/atharvaveda/kaanda_1.json');
    const av1 = JSON.parse(fs.readFileSync(av1Path, 'utf8'));
    const avVerses = extractVerses(av1);
    const trishaptahVerse = avVerses.find(v => v.id === 'av-1-1-1');
    assert.ok(trishaptahVerse, 'AV 1.1.1 must exist');
    assert.ok(
      trishaptahVerse.accentedText.includes('\u0951') || trishaptahVerse.accentedText.includes('\u0952'),
      'Atharvaveda 1.1.1 must preserve Vedic svara markers'
    );
  });
});
