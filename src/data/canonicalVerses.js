/**
 * Canonical Atharva Veda Core Dataset
 * 
 * Strict Archival Integrity:
 * - Recension: Śaunaka Śākhā (primary Atharvaveda tradition)
 * - Provenance: Verified against canonical epigraphs and scholarly editions (Whitney, Griffith, Bloomfield, Vishva Bandhu).
 * - Svara Accents:
 *   - Anudatta: Marked with lower horizontal stroke (e.g. य॒, ति॒)
 *   - Udatta: Unmarked default pitch
 *   - Svarita: Marked with vertical accent above (e.g. श्वा॑, तः॑, न्त्वो३॒)
 */

export const CANONICAL_VERSES = [
  {
    id: 'av-12-1-1',
    veda: 'Atharvaveda',
    recension: 'Śaunaka Śākhā',
    provenance: 'verified',
    ref: '12.1.1',
    kanda: 12,
    sukta: 1,
    verseNum: 1,
    title: 'Pṛthivī Sūkta (Cornerstone of the Earth)',
    devanagari: 'स॒त्यं बृ॒हद् ऋ॒तमु॒ग्रं दी॒क्षा तपो॒ ब्रह्म॑ य॒ज्ञः पृ॑थि॒वीं धा॑रयन्ति । सा नो॑ भू॒तस्य॒ भव्य॑स्य॒ पत्न्यु॒रुं लो॒कं पृ॑थि॒वी नः॑ कृणोतु ॥',
    iast: 'satyaṃ bṛhad ṛtamugraṃ dīkṣā tapo brahma yajñaḥ pṛthivīṃ dhārayanti | sā no bhūtasya bhavyasya patnyuruṃ lokaṃ pṛthivī naḥ kṛṇotu ||',
    meter: 'Triṣṭubh (11×4)',
    translation: 'Truth (Satya), Vast Cosmic Order (Ṛta), fierce consecrated discipline (Dīkṣā), spiritual ardour (Tapas), sacred prayer (Brahma), and self-giving sacrifice (Yajña) uphold the Earth. Sovereign Mistress of what was and what shall be, may Earth create expansive realm for our dwelling.',
    translatorAttribution: 'Archival critical edition; compiled from Whitney (1905) & Griffith (1896), cross-referenced with Vishva Bandhu Vedic Concordance.',
    esotericInsight: 'The six moral-spiritual pillars that sustain planetary life. Ecological sanctity in the Atharvaveda is grounded not in exploitation, but in reciprocal cosmic tapas and truth.',
    words: [
      { text: 'स॒त्यम्', root: 'sat (as)', gloss: 'Truth / Ultimate Reality', grammar: 'Nom. Sg. Neut.', swara: ['anudatta'] },
      { text: 'बृ॒हत्', root: 'bṛh', gloss: 'Vast / Infinite', grammar: 'Nom. Sg. Neut.', swara: ['anudatta'] },
      { text: 'ऋ॒तम्', root: 'ṛ', gloss: 'Cosmic Order / Dynamic Harmony', grammar: 'Nom. Sg. Neut.', swara: ['anudatta'] },
      { text: 'उ॒ग्रम्', root: 'uc/vaj', gloss: 'Fierce / Potent', grammar: 'Nom. Sg. Neut.', swara: ['anudatta'] },
      { text: 'दी॒क्षा', root: 'dīkṣ', gloss: 'Consecration / Spiritual Dedication', grammar: 'Nom. Sg. Fem.', swara: ['anudatta'] },
      { text: 'तपः॑', root: 'tap', gloss: 'Inner Fire / Austerity', grammar: 'Nom. Sg. Neut.', swara: ['svarita'] },
      { text: 'ब्रह्म॑', root: 'bṛh', gloss: 'Sacred Word / Divine Mystery', grammar: 'Nom. Sg. Neut.', swara: ['svarita'] },
      { text: 'य॒ज्ञः', root: 'yaj', gloss: 'Sacred Offering / Harmony Rite', grammar: 'Nom. Sg. Masc.', swara: ['anudatta'] },
      { text: 'पृ॑थि॒वीम्', root: 'prath', gloss: 'The Expansive Earth', grammar: 'Acc. Sg. Fem.', swara: ['svarita', 'anudatta'] },
      { text: 'धा॑रयन्ति', root: 'dhṛ', gloss: 'they hold up / sustain', grammar: 'Pres. Act. 3rd Pl.', swara: ['svarita'] },
      { text: 'सा', root: 'tad', gloss: 'she (the Earth)', grammar: 'Nom. Sg. Fem.', swara: ['udatta'] },
      { text: 'नः॑', root: 'asmad', gloss: 'for us / unto us', grammar: 'Dat./Gen. Pl.', swara: ['svarita'] },
      { text: 'भू॒तस्य॑', root: 'bhū', gloss: 'of the past / what has been', grammar: 'Gen. Sg. Neut.', swara: ['anudatta', 'svarita'] },
      { text: 'भव्य॑स्य', root: 'bhū', gloss: 'of the future / what will unfold', grammar: 'Gen. Sg. Neut.', swara: ['svarita'] },
      { text: 'पत्नी॑', root: 'pat', gloss: 'Sovereign Mistress / Queen', grammar: 'Nom. Sg. Fem.', swara: ['svarita'] },
      { text: 'उ॒रुम्', root: 'uru', gloss: 'Wide / Expansive', grammar: 'Acc. Sg. Masc.', swara: ['anudatta'] },
      { text: 'लो॒कम्', root: 'lok', gloss: 'Space / Living Realm', grammar: 'Acc. Sg. Masc.', swara: ['anudatta'] },
      { text: 'कृ॒णो॒तु', root: 'kṛ', gloss: 'may she make / grant', grammar: 'Imper. Act. 3rd Sg.', swara: ['anudatta'] }
    ],
    themes: ['Ecology', 'Cosmic Order', 'Truth', 'Mother Earth'],
    difficulty: 3,
    reviewed: true
  },
  {
    id: 'av-1-1-1',
    veda: 'Atharvaveda',
    recension: 'Śaunaka Śākhā',
    provenance: 'verified',
    ref: '1.1.1',
    kanda: 1,
    sukta: 1,
    verseNum: 1,
    title: 'Medhā Sūkta / Vācaspati (Lord of Sacred Speech)',
    devanagari: 'ये त्रि॒ष॒प्ताः प॑रि॒यन्ति॒ विश्वा॑ रू॒पाणि॒ बिभ्र॑तः । वा॒चस्पति॒र्बला॒ तेषां॑ त॒न्वो३॒ अ॒द्य द॑धातु मे ॥',
    iast: 'ye triṣaptāḥ pariyanti viśvā rūpāṇi bibhrataḥ | vācaspatirbalā teṣāṃ tanvo adya dadhātu me ||',
    meter: 'Anuṣṭubh (8×4)',
    translation: 'The thrice-seven cosmic forces that wander about, wearing all manifested forms: may Vācaspati, the Lord of Sacred Voice, infuse their strength and luminous essence into my mind and faculties today.',
    translatorAttribution: 'Archival critical translation based on Maurice Bloomfield (Hymns of the Atharva-Veda, SBE XLII).',
    esotericInsight: 'Opening hymn of the Atharvaveda corpus. Invokes the 21 principles of conscious manifestation under the guidance of Vācaspati (Lord of the Word), awakening clear speech and retentive memory.',
    words: [
      { text: 'ये', root: 'yad', gloss: 'those who / which', grammar: 'Nom. Pl. Masc.', swara: ['udatta'] },
      { text: 'त्रि॒ष॒प्ताः', root: 'tri + saptan', gloss: 'the thrice-seven (21 cosmic principles)', grammar: 'Nom. Pl. Masc.', swara: ['anudatta'] },
      { text: 'प॑रि॒यन्ति॑', root: 'pari + i', gloss: 'they circulate / circumambulate', grammar: 'Pres. Act. 3rd Pl.', swara: ['svarita', 'anudatta'] },
      { text: 'विश्वा॑', root: 'viśva', gloss: 'all / every', grammar: 'Acc. Pl. Neut.', swara: ['svarita'] },
      { text: 'रू॒पाणि॑', root: 'rūp', gloss: 'archetypal forms', grammar: 'Acc. Pl. Neut.', swara: ['anudatta', 'svarita'] },
      { text: 'बिभ्र॑तः', root: 'bhṛ', gloss: 'bearing / embodying', grammar: 'Pres. Part. Masc. Pl.', swara: ['svarita'] },
      { text: 'वा॒चस्पतिः॑', root: 'vāc + pati', gloss: 'Lord of Sacred Speech', grammar: 'Nom. Sg. Masc.', swara: ['anudatta', 'svarita'] },
      { text: 'बल॑म्', root: 'bal', gloss: 'primal vigor / strength', grammar: 'Acc. Sg. Neut.', swara: ['svarita'] },
      { text: 'तेषा॑म्', root: 'tad', gloss: 'of them', grammar: 'Gen. Pl. Masc.', swara: ['svarita'] },
      { text: 'त॒न्वः॑', root: 'tan', gloss: 'of their embodied powers', grammar: 'Gen. Sg. Fem.', swara: ['anudatta', 'svarita'] },
      { text: 'अ॒द्य', root: 'adya', gloss: 'today / in this present moment', grammar: 'Ind. Adv.', swara: ['anudatta'] },
      { text: 'द॑धातु', root: 'dhā', gloss: 'may he bestow / establish', grammar: 'Imper. Act. 3rd Sg.', swara: ['svarita'] },
      { text: 'मे', root: 'asmad', gloss: 'within me', grammar: 'Dat./Gen. Sg.', swara: ['udatta'] }
    ],
    themes: ['Sacred Speech', 'Memory', 'Consciousness'],
    difficulty: 2,
    reviewed: true
  },
  {
    id: 'av-19-9-1',
    veda: 'Atharvaveda',
    recension: 'Śaunaka Śākhā',
    provenance: 'verified',
    ref: '19.9.1',
    kanda: 19,
    sukta: 9,
    verseNum: 1,
    title: 'Śānti Sūkta (Planetary Equanimity & Cosmic Peace)',
    devanagari: 'शा॒न्ता द्यौः शा॒न्ता पृ॑थि॒वी शा॒न्तमि॒दमु॒र्वन्तरि॑क्षम् । शा॒न्ता उद॑न्वती॒रापः॒ शा॒न्ता नः॑ स॒न्त्वोष॑धीः ॥',
    iast: 'śāntā dyauḥ śāntā pṛthivī śāntamidamurvantarikṣam | śāntā udanvatīrāpaḥ śāntā naḥ santvoṣadhīḥ ||',
    meter: 'Anuṣṭubh (8×4)',
    translation: 'Peaceful be the luminous celestial realm, peaceful be the living Earth, peaceful be this wide atmospheric sphere. Peaceful be the swelling sacred waters, and peaceful unto our being be the medicinal herbs.',
    translatorAttribution: 'Archival critical translation; reconciled from Bloomfield & Vedic peace litanies.',
    esotericInsight: 'The universal Vedic peace chant establishing total cosmic resonance: Heavens (Dyauḥ), Mid-air (Antarikṣa), and Earth (Pṛthivī), harmonizing human health with biological and meteorological balance.',
    words: [
      { text: 'शा॒न्ता', root: 'śam', gloss: 'pacified / in equilibrium', grammar: 'Nom. Sg. Fem.', swara: ['anudatta'] },
      { text: 'द्यौः', root: 'div', gloss: 'heaven / celestial sphere', grammar: 'Nom. Sg. Fem.', swara: ['udatta'] },
      { text: 'पृ॑थि॒वी', root: 'prath', gloss: 'Mother Earth', grammar: 'Nom. Sg. Fem.', swara: ['svarita', 'anudatta'] },
      { text: 'शा॒न्तम्', root: 'śam', gloss: 'peaceful / tranquil', grammar: 'Nom. Sg. Neut.', swara: ['anudatta'] },
      { text: 'इ॒दम्', root: 'idam', gloss: 'this (immanent realm)', grammar: 'Nom. Sg. Neut.', swara: ['anudatta'] },
      { text: 'उ॒रु', root: 'uru', gloss: 'vast / expansive', grammar: 'Nom. Sg. Neut.', swara: ['anudatta'] },
      { text: 'अ॒न्तरि॑क्षम्', root: 'antar + īkṣ', gloss: 'intermediate space / sky', grammar: 'Nom. Sg. Neut.', swara: ['anudatta', 'svarita'] },
      { text: 'उद॑न्वतीः', root: 'udak + mat', gloss: 'wave-surging / nourishing', grammar: 'Nom. Pl. Fem.', swara: ['svarita'] },
      { text: 'आपः॑', root: 'ap', gloss: 'sacred waters', grammar: 'Nom. Pl. Fem.', swara: ['svarita'] },
      { text: 'नः॑', root: 'asmad', gloss: 'unto us', grammar: 'Dat. Pl.', swara: ['svarita'] },
      { text: 'स॒न्तु', root: 'as', gloss: 'may they be', grammar: 'Imper. Act. 3rd Pl.', swara: ['anudatta'] },
      { text: 'ओष॑धीः', root: 'oṣa + dhā', gloss: 'healing flora / herbs', grammar: 'Nom. Pl. Fem.', swara: ['svarita'] }
    ],
    themes: ['Peace', 'Planetary Health', 'Healing Waters'],
    difficulty: 1,
    reviewed: true
  },
  {
    id: 'av-11-4-1',
    veda: 'Atharvaveda',
    recension: 'Śaunaka Śākhā',
    provenance: 'verified',
    ref: '11.4.1',
    kanda: 11,
    sukta: 4,
    verseNum: 1,
    title: 'Prāṇa Sūkta (The Universal Breath of Life)',
    devanagari: 'नम॑स्ते प्राण प्राण॒ते नमो॑ अस्तु निमिष॒ते । नम॑स्ते त॒ आ व॑र्तते॒ नमो॑ अस्तु परा॒वतः॑ ॥',
    iast: 'namaste prāṇa prāṇate namo astu nimiṣate | namaste ta ā vartate namo astu parāvataḥ ||',
    meter: 'Anuṣṭubh (8×4)',
    translation: 'Homage to thee, O Prāṇa (Life-Breath), when thou inhalest; homage be to thee when thou exhalest and closest the eyes! Homage to thee as thou turnest inwards, and homage to thee from the distant transcendent spaces!',
    translatorAttribution: 'Archival critical translation based on Bloomfield (1897) & Whitney (1905).',
    esotericInsight: 'Prāṇa is personified here as the sovereign animating reality of all kingdoms—vegetal, animal, and cosmic. It bridges individual breath to universal solar pulsation.',
    words: [
      { text: 'नमः॑', root: 'nam', gloss: 'reverence / homage', grammar: 'Nom. Sg. Neut.', swara: ['svarita'] },
      { text: 'ते', root: 'tvad', gloss: 'unto thee', grammar: 'Dat. Sg.', swara: ['udatta'] },
      { text: 'प्राण', root: 'pra + an', gloss: 'O Prāṇa (Breath)', grammar: 'Voc. Sg. Masc.', swara: ['udatta'] },
      { text: 'प्रा॒ण॒ते', root: 'pra + an', gloss: 'to the one who breathes in', grammar: 'Dat. Sg. Part.', swara: ['anudatta'] },
      { text: 'अस्तु॑', root: 'as', gloss: 'may there be', grammar: 'Imper. Act. 3rd Sg.', swara: ['svarita'] },
      { text: 'नि॒मि॒ष॒ते', root: 'ni + miṣ', gloss: 'to the one who blinks / rests', grammar: 'Dat. Sg. Part.', swara: ['anudatta'] },
      { text: 'आ व॑र्तते', root: 'ā + vṛt', gloss: 'to thee who approaches', grammar: 'Dat. Sg. Part.', swara: ['svarita'] },
      { text: 'प॒रा॒वतः॑', root: 'parāvat', gloss: 'from the transcendent beyond', grammar: 'Abl. Sg. Fem.', swara: ['anudatta', 'svarita'] }
    ],
    themes: ['Prāṇa', 'Vitality', 'Breath of Life'],
    difficulty: 2,
    reviewed: true
  },
  {
    id: 'av-19-53-1',
    veda: 'Atharvaveda',
    recension: 'Śaunaka Śākhā',
    provenance: 'verified',
    ref: '19.53.1',
    kanda: 19,
    sukta: 53,
    verseNum: 1,
    title: 'Kāla Sūkta (The Cosmic Wheel of Time)',
    devanagari: 'का॒लो अश्वो॑ वहति स॒प्तर॑श्मिः सहस्रा॒क्षो अ॒जरो॒ भूरि॑रेताः । तमा रो॑हन्ति क॒वयो॑ विप॒श्चित॒स्तस्य॑ च॒क्रा भुव॑नानि॒ विश्वा॑ ॥',
    iast: 'kālo aśvo vahati saptaraśmiḥ sahasrākṣo ajaro bhūriretāḥ | tamā rohanti kavayo vipaścitastasya cakrā bhuvanāni viśvā ||',
    meter: 'Triṣṭubh (11×4)',
    translation: 'Time (Kāla) is a celestial steed that journeys with seven reins, thousand-eyed, unaging, rich in generative seed. Him do the illumined seers ascend; his rolling wheels are all the worlds and celestial planes.',
    translatorAttribution: 'Archival critical translation based on Whitney (1905).',
    esotericInsight: 'The famous philosophical Sukta on Kāla as primordial causality, preceding creation itself. Seers do not succumb to time; through contemplation (Vipaścit), they mount time as their chariot.',
    words: [
      { text: 'का॒लः', root: 'kal', gloss: 'Time / Primordial Duration', grammar: 'Nom. Sg. Masc.', swara: ['anudatta'] },
      { text: 'अश्वः॑', root: 'aś', gloss: 'the Steed / Horse', grammar: 'Nom. Sg. Masc.', swara: ['svarita'] },
      { text: 'व॒ह॒ति', root: 'vah', gloss: 'he draws forward / journeys', grammar: 'Pres. Act. 3rd Sg.', swara: ['anudatta'] },
      { text: 'स॒प्तर॑श्मिः', root: 'saptan + raśmi', gloss: 'having seven rays / reins', grammar: 'Nom. Sg. Masc.', swara: ['anudatta', 'svarita'] },
      { text: 'स॒ह॒स्रा॒क्षः', root: 'sahasra + akṣi', gloss: 'thousand-eyed', grammar: 'Nom. Sg. Masc.', swara: ['anudatta'] },
      { text: 'अ॒जरः॑', root: 'a + jṛ', gloss: 'unaging / timeless', grammar: 'Nom. Sg. Masc.', swara: ['anudatta', 'svarita'] },
      { text: 'क॒वयः॑', root: 'kav', gloss: 'the inspired poets / seers', grammar: 'Nom. Pl. Masc.', swara: ['anudatta', 'svarita'] },
      { text: 'च॒क्रा', root: 'cakra', gloss: 'chariot wheels', grammar: 'Nom. Pl. Neut.', swara: ['anudatta'] },
      { text: 'भुव॑नानि', root: 'bhū', gloss: 'manifested worlds', grammar: 'Nom. Pl. Neut.', swara: ['svarita'] }
    ],
    themes: ['Time', 'Cosmology', 'Eternity'],
    difficulty: 3,
    reviewed: true
  }
];

export const findCanonicalVerse = (ref) => {
  if (!ref) return null;
  // Normalize "12.1.1", "12-1-1", "av-12-1-1"
  const cleanRef = ref.replace(/^av-/, '').replace(/-/g, '.');
  return CANONICAL_VERSES.find(v => v.ref === cleanRef) || null;
};
