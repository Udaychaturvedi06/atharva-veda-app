# 📚 Divine Books

> A comprehensive JavaScript/TypeScript library providing access to sacred Hindu texts with multi-language support and powerful search capabilities.

[![npm version](https://img.shields.io/npm/v/divine-books.svg)](https://www.npmjs.com/package/divine-books)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-green.svg)](https://www.npmjs.com/package/divine-books)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📖 **Bhagavad Gita** | Complete text with all 18 chapters and 700 verses |
| 📜 **Ramcharitmanas** | Full text with all 7 Kands (chapters) |
| 🏛️ **Mahabharat** | All 18 parvas (books) with complete English translations |
| 📿 **RigVeda** | Complete text with all 10 Mandalas in Sanskrit |
| 📿 **Atharvaveda** | Complete text with all 20 Books in Sanskrit |
| 📿 **Samaveda** | Partial text (1 book available) in Sanskrit |
| 🕉️ **Upanishads** | 11 major Upanishads with clean Sanskrit text (no embedded references) |
| 🌐 **Multi-language** | Sanskrit, Hindi, English, and Transliteration support |
| 🔍 **Text Search** | Powerful search functionality across all verses |
| 📝 **Commentary** | Detailed explanations for Bhagavad Gita verses |
| 💪 **TypeScript** | Full TypeScript support with complete type definitions |
| 🚀 **Zero Dependencies** | Lightweight with no external dependencies |
| 📦 **Dual Format** | Supports both CommonJS and ES Modules |

---

## 🚀 Quick Start

### Installation

```bash
npm install divine-books
```

> **📦 Module Format**: This package uses CommonJS format for maximum compatibility with Node.js, Webpack, Vite, and other bundlers. Both CommonJS (`require`) and ES6 (`import`) syntax are shown in examples below.

### Basic Usage

```javascript
// ES6 Modules (if your bundler supports it)
import { BhagavadGita, Ramcharitmanas, Mahabharata, RigVeda, Atharvaveda, Upanishads } from 'divine-books';

// CommonJS (Node.js, most bundlers)
const { BhagavadGita, Ramcharitmanas, Mahabharata, RigVeda, Atharvaveda, Upanishads } = require('divine-books');

// Get a verse from Bhagavad Gita
const verse = BhagavadGita.verse(2, 47);
console.log(verse.english);

// Get a chapter from Ramcharitmanas
const balkand = Ramcharitmanas.chapter(1);
console.log(balkand.title); // "Balkand"

// Search across Mahabharat
const results = Mahabharata.search('Krishna');
console.log(`Found ${results.length} references to Krishna`);

// Get a verse from RigVeda
const rigVerse = RigVeda.verse(1, 1, 1); // Book 1, Hymn 1, Verse 1
console.log(rigVerse.sanskrit);

// Get a mantra from Upanishads
const isavasyaUpanishad = Upanishads.upanishad('isavasya');
console.log(`${isavasyaUpanishad.title} has ${isavasyaUpanishad.mantras.length} mantras`);
```

---

## 📖 Bhagavad Gita

### Import Methods

```javascript
// ES6 Modules
import { BhagavadGita, getAllBhagavadGitaChapters, getBhagavadGitaVerse } from 'divine-books';

// CommonJS
const { BhagavadGita, getAllBhagavadGitaChapters, getBhagavadGitaVerse } = require('divine-books');
```

### Usage Examples

```javascript
// Get all 18 chapters
const chapters = getAllBhagavadGitaChapters();
console.log(chapters.length); // 18
console.log(chapters[0].title); // "Arjuna Vishada Yoga"

// Get specific chapter
const chapter2 = BhagavadGita.chapter(2);
console.log(chapter2.title); // "Sankhya Yoga"

// Get specific verse (Chapter, Verse)
const famousVerse = BhagavadGita.verse(2, 47);
console.log(famousVerse.sanskrit);     // Sanskrit text
console.log(famousVerse.hindi);        // Hindi translation
console.log(famousVerse.english);      // English translation
console.log(famousVerse.transliteration); // Roman transliteration
console.log(famousVerse.commentary);   // Detailed commentary

// Search functionality
const dharmaVerses = BhagavadGita.search('dharma');
console.log(`Found ${dharmaVerses.length} verses about dharma`);

// Random verse generator
const allChapters = BhagavadGita.all();
const randomChapter = allChapters[Math.floor(Math.random() * allChapters.length)];
const randomVerse = randomChapter.verses[Math.floor(Math.random() * randomChapter.verses.length)];
console.log(`Chapter ${randomChapter.chapter_number}, Verse ${randomVerse.verse_number}`);
console.log(randomVerse.english);
```

### Data Structure

```typescript
interface Chapter {
  chapter_number: number;
  title: string;
  summary?: string;
  verses: Verse[];
}

interface Verse {
  verse_number: number;
  sanskrit?: string;
  hindi?: string;
  english: string;
  transliteration?: string;
  commentary?: string;
}
```

**Verse Format**: `BhagavadGita.verse(chapter, verse)` → Examples: `1`, `34`, `46`

---

## 📜 Ramcharitmanas

### Import Methods

```javascript
// ES6 Modules
import { Ramcharitmanas, getAllRamcharitmanasChapters, getRamcharitmanasVerse } from 'divine-books';

// CommonJS
const { Ramcharitmanas, getAllRamcharitmanasChapters, getRamcharitmanasVerse } = require('divine-books');
```

### Usage Examples

```javascript
// Get all 7 Kands
const kands = getAllRamcharitmanasChapters();
console.log(kands.length); // 7
console.log(kands.map(k => k.title)); 
// ["Balkand", "Ayodhyakand", "Aranyakand", "Kishkindhakand", "Sundarkand", "Lankakand", "Uttarkand"]

// Get specific Kand
const sundarkand = Ramcharitmanas.chapter(5);
console.log(sundarkand.title); // "Sundarkand"

// Get specific verse (Kand, Verse)
const openingVerse = Ramcharitmanas.verse(1, 1.1);
console.log(openingVerse.content); // Hindi content

// Search functionality
const ramReferences = Ramcharitmanas.search('राम');
console.log(`Found ${ramReferences.length} verses mentioning राम`);

// Random verse
const randomKand = Ramcharitmanas.all()[Math.floor(Math.random() * 7)];
const randomVerse = randomKand.verses[Math.floor(Math.random() * randomKand.verses.length)];
console.log(`${randomKand.title}, Verse ${randomVerse.verse_number}`);
console.log(randomVerse.content);
```

### Data Structure

```typescript
interface RamcharitmanasChapter {
  chapter_number: number;
  title: string;
  verses: RamcharitmanasVerse[];
}

interface RamcharitmanasVerse {
  verse_number: number;
  content: string;
}
```

**Verse Format**: `Ramcharitmanas.verse(kand, verse)` → Examples: `1.1`, `3.20`, `6`, `18`

---

## 🏛️ Mahabharat

### Import Methods

```javascript
// ES6 Modules
import { Mahabharata, getAllMahabharataParvas, getMahabharataParva } from 'divine-books';

// CommonJS
const { Mahabharata, getAllMahabharataParvas, getMahabharataParva } = require('divine-books');
```

### Usage Examples

```javascript
// Get all 18 parvas
const allParvas = Mahabharata.all();
console.log(`Total parvas: ${allParvas.length}`); // 18

// Get specific parva by number (1-18)
const adiParva = Mahabharata.parva(1);
console.log(`${adiParva.parva_name} has ${adiParva.total_sections} sections`);

// Get parva by name (partial matching)
const bhishmaParva = Mahabharata.parvaByName('Bhishma');
const sabhaParva = Mahabharata.parvaByName('sabha'); // case-insensitive
console.log(`Found: ${bhishmaParva.parva_name}`);

// Get specific section
const section = Mahabharata.section(1, 1); // Adi Parva, Section 1
console.log(`Section: ${section.title}`);
console.log(`Content length: ${section.content.length} characters`);

// Get section by parva name
const sectionByName = Mahabharata.sectionByName('Bhishma', 1);
console.log(`Section: ${sectionByName.title}`);

// Powerful search
const krishnaRefs = Mahabharata.search('Krishna');
const arjunaRefs = Mahabharata.search('Arjuna');
const dharmaRefs = Mahabharata.search('dharma');

console.log(`Krishna: ${krishnaRefs.length} sections`);
console.log(`Arjuna: ${arjunaRefs.length} sections`);
console.log(`Dharma: ${dharmaRefs.length} sections`);

// Display search results
krishnaRefs.slice(0, 5).forEach(section => {
  console.log(`- ${section.title} (Section ${section.section_number})`);
});
```

### API Reference

| Method | Description | Returns |
|--------|-------------|---------|
| `all()` | Get all 18 parvas | `MahabharataParva[]` |
| `parva(num)` | Get parva by number (1-18) | `MahabharataParva \| undefined` |
| `parvaByName(name)` | Get parva by name (partial match) | `MahabharataParva \| undefined` |
| `section(parvaNum, sectionNum)` | Get specific section | `MahabharataSection \| undefined` |
| `sectionByName(parvaName, sectionNum)` | Get section by parva name | `MahabharataSection \| undefined` |
| `search(query)` | Search across all content | `MahabharataSection[]` |

### Data Structure

```typescript
interface MahabharataParva {
  parva_name: string;
  total_sections: number;
  sections: MahabharataSection[];
}

interface MahabharataSection {
  section_number: number;
  title: string;
  content: string;
}
```

**Section Format**: `Mahabharata.section(parva, section)` → Examples: `36`, `121`

---

## 🔍 Advanced Search Examples

```javascript
// Multi-text search across all scriptures
const gitaResults = BhagavadGita.search('duty karma');
const ramResults = Ramcharitmanas.search('भक्ति');
const mahabharatResults = Mahabharata.search('dharma righteousness');
const rigVedaResults = RigVeda.search('Agni');
const atharvaResults = Atharvaveda.search('Om');
const upanishadResults = Upanishads.search('ब्रह्म');

// Character analysis
const krishnaInGita = BhagavadGita.search('Krishna');
const krishnaInMahabharat = Mahabharata.search('Krishna');
console.log(`Krishna mentioned ${krishnaInGita.length} times in Gita`);
console.log(`Krishna mentioned ${krishnaInMahabharat.length} times in Mahabharat`);

// Vedic deities search
const agniVerses = RigVeda.search('Agni');
const indraVerses = RigVeda.search('Indra');
console.log(`Agni mentioned ${agniVerses.length} times in RigVeda`);
console.log(`Indra mentioned ${indraVerses.length} times in RigVeda`);

// Thematic search across texts
const dharmaTheme = [
  ...BhagavadGita.search('dharma'),
  ...Mahabharata.search('dharma'),
  ...Upanishads.search('धर्म')
];
console.log(`Total dharma references: ${dharmaTheme.length}`);
```

---

## 💻 TypeScript Support

```typescript
// ES6 Modules
import { 
  Chapter, 
  Verse, 
  RamcharitmanasChapter,
  RamcharitmanasVerse,
  MahabharataParva,
  MahabharataSection,
  RigVedaBook,
  RigVedaHymn,
  RigVedaVerse,
  AtharvavedaBook,
  AtharvavedaVerse,
  UpanishadText,
  UpanishadMantra
} from 'divine-books';

// CommonJS
const { 
  Chapter, 
  Verse, 
  RamcharitmanasChapter,
  RamcharitmanasVerse,
  MahabharataParva,
  MahabharataSection,
  RigVedaBook,
  RigVedaVerse,
  UpanishadText,
  UpanishadMantra
} = require('divine-books');

// Strongly typed usage
const chapter: Chapter | undefined = BhagavadGita.chapter(1);
const verse: Verse | undefined = BhagavadGita.verse(1, 1);
const kand: RamcharitmanasChapter | undefined = Ramcharitmanas.chapter(1);
const parva: MahabharataParva | undefined = Mahabharata.parva(1);
const rigBook: RigVedaBook | undefined = RigVeda.book(1);
const rigVerse: RigVedaVerse | undefined = RigVeda.verse(1, 1, 1);
const upanishad: UpanishadText | undefined = Upanishads.upanishad('isavasya');
const mantra: UpanishadMantra | undefined = Upanishads.mantra('isavasya', '।।1.1.1।।');

// Type-safe search results
const searchResults: Verse[] = BhagavadGita.search('dharma');
const mahabharatResults: MahabharataSection[] = Mahabharata.search('Krishna');
const rigResults: RigVedaVerse[] = RigVeda.search('Agni');
const upanishadResults: UpanishadMantra[] = Upanishads.search('आत्मा');
```

---

## 🎯 Practical Examples

### Daily Verse Generator

```javascript
function getDailyVerse() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  
  const chapters = BhagavadGita.all();
  const totalVerses = chapters.reduce((sum, ch) => sum + ch.verses.length, 0);
  const verseIndex = dayOfYear % totalVerses;
  
  let currentIndex = 0;
  for (const chapter of chapters) {
    if (currentIndex + chapter.verses.length > verseIndex) {
      const verse = chapter.verses[verseIndex - currentIndex];
      return {
        chapter: chapter.chapter_number,
        verse: verse.verse_number,
        text: verse.english
      };
    }
    currentIndex += chapter.verses.length;
  }
}

console.log(getDailyVerse());
```

### Wisdom Search Engine

```javascript
function searchWisdom(query) {
  const results = {
    gita: BhagavadGita.search(query),
    ramayana: Ramcharitmanas.search(query),
    mahabharat: Mahabharata.search(query),
    rigveda: RigVeda.search(query),
    atharvaveda: Atharvaveda.search(query),
    upanishads: Upanishads.search(query)
  };
  
  console.log(`🔍 Search Results for "${query}":`);
  console.log(`📖 Bhagavad Gita: ${results.gita.length} matches`);
  console.log(`📜 Ramcharitmanas: ${results.ramayana.length} matches`);
  console.log(`🏛️ Mahabharat: ${results.mahabharat.length} matches`);
  console.log(`📿 RigVeda: ${results.rigveda.length} matches`);
  console.log(`📿 Atharvaveda: ${results.atharvaveda.length} matches`);
  console.log(`🕉️ Upanishads: ${results.upanishads.length} matches`);
  
  return results;
}

searchWisdom('dharma');
searchWisdom('Agni'); // Great for Vedic searches
```

---

## 📝 Reference Format

| Text | Format | Examples | Notes |
|------|--------|----------|-------|
| **Bhagavad Gita** | `chapter, verse` | `1`, `34`, `46` | 18 chapters, 700+ verses |
| **Ramcharitmanas** | `kand, verse` | `1.1`, `3.20`, `6`, `18` | 7 Kands (chapters) |
| **Mahabharat** | `parva, section` | `36`, `121` | 18 Parvas (books) |
| **RigVeda** | `book, hymn, verse` | `1, 1, 1` | 10 Mandalas (books) |
| **Atharvaveda** | `book, hymn, verse` | `1, 1, 1` | 20 Books |
| **Samaveda** | `book, hymn, verse` | `1, 1, 1` | 1 Book (partial) |
| **Upanishads** | `mantra_number` | `।।1.1.1।।`, `।।2.47।।` | 11 major Upanishads, 762+ mantras |

---

## 📿 Vedas

### Import Methods

```javascript
// ES6 Modules
import { RigVeda, Atharvaveda, Samaveda, getAllRigVedaBooks, getRigVedaVerse } from 'divine-books';

// CommonJS
const { RigVeda, Atharvaveda, Samaveda, getAllRigVedaBooks, getRigVedaVerse } = require('divine-books');
```

### Usage Examples

```javascript
// RigVeda - Complete with all 10 Books (Mandalas)
const allRigVedaBooks = RigVeda.all();
console.log(`RigVeda has ${allRigVedaBooks.length} books`); // 10

// Get specific book
const book1 = RigVeda.book(1);
console.log(`Book 1 has ${book1.hymns.length} hymns`);

// Get specific hymn
const hymn = RigVeda.hymn(1, 1); // Book 1, Hymn 1
console.log(`Hymn has ${hymn.verses.length} verses`);

// Get specific verse
const verse = RigVeda.verse(1, 1, 1); // Book 1, Hymn 1, Verse 1
console.log(verse.sanskrit);

// Search across RigVeda
const agneyaVerses = RigVeda.search('Agni');
console.log(`Found ${agneyaVerses.length} verses mentioning Agni`);

// Atharvaveda - Complete with all 20 Books
const atharvaBooks = Atharvaveda.all();
console.log(`Atharvaveda has ${atharvaBooks.length} books`); // 20

// Samaveda - Partial (1 book available)
const samaBooks = Samaveda.all();
console.log(`Samaveda has ${samaBooks.length} books`); // 1
```

### Vedas Availability Status

| Veda | Status | Books Available | Notes |
|------|--------|-----------------|-------|
| **RigVeda** | ✅ Complete | 10/10 Mandalas | Full Sanskrit text |
| **Atharvaveda** | ✅ Complete | 20/20 Books | Full Sanskrit text |
| **Samaveda** | 🟡 Partial | 1/? Books | Limited data available |
| **Yajurveda** | ❌ Unavailable | 0 | Data not found/available |

> **⚠️ Note**: Yajurveda is not included in this package due to unavailability of reliable digitized data sources. We are actively looking for authentic Yajurveda texts to include in future releases.

### Data Structure

```typescript
interface RigVedaBook {
  book_number: number;
  title: string;
  summary: string;
  hymns: RigVedaHymn[];
}

interface RigVedaHymn {
  hymn_number: number;
  verses: RigVedaVerse[];
}

interface RigVedaVerse {
  verse_number: number;
  sanskrit: string;
}

// Similar structure for Atharvaveda and Samaveda
```

**Reference Format**: `Veda.verse(book, hymn, verse)` → Examples: `RigVeda.verse(1, 1, 1)`

---

## 🕉️ Upanishads

### Import Methods

```javascript
// ES6 Modules
import { 
  Upanishads, 
  getAllUpanishads, 
  getUpanishad, 
  getUpanishadMantra,
  searchUpanishadMantras,
  Isavasya,
  Katha,
  Mandukya
} from 'divine-books';

// CommonJS
const { 
  Upanishads, 
  getAllUpanishads, 
  getUpanishad, 
  getUpanishadMantra,
  searchUpanishadMantras,
  Isavasya,
  Katha,
  Mandukya
} = require('divine-books');
```

### Usage Examples

```javascript
// Get all 11 Upanishads
const allUpanishads = Upanishads.all();
console.log(`Found ${allUpanishads.length} Upanishads`); // 11

// List all available Upanishads
allUpanishads.forEach(upanishad => {
  console.log(`${upanishad.title}: ${upanishad.mantras.length} mantras`);
});

// Get specific Upanishad by name
const isavasya = Upanishads.upanishad('isavasya');
const katha = Upanishads.upanishad('katha');
const mandukya = Upanishads.upanishad('mandukya');

console.log(`${isavasya.title} has ${isavasya.mantras.length} mantras`);

// Access through direct exports
console.log(`Direct access: ${Isavasya.title}`);
console.log(`Katha Upanishad: ${Katha.mantras.length} mantras`);

// Get specific mantra
const firstMantra = isavasya.mantras[0];
console.log(`Mantra ${firstMantra.mantra_number}: ${firstMantra.sanskrit}`);

// Search across all Upanishads
const omReferences = Upanishads.search('ॐ');
const brahmanReferences = Upanishads.search('ब्रह्म');
const atmanReferences = Upanishads.search('आत्मा');

console.log(`Om (ॐ) mentioned ${omReferences.length} times`);
console.log(`Brahman mentioned ${brahmanReferences.length} times`);
console.log(`Atman mentioned ${atmanReferences.length} times`);

// Upanishad-specific search
const kathaWisdom = Katha.mantras.filter(mantra => 
  mantra.sanskrit.includes('नचिकेत')
);
console.log(`Nachiketa mentioned ${kathaWisdom.length} times in Katha Upanishad`);
```

### Available Upanishads

| Name | Title | Mantras | Key Themes |
|------|-------|---------|------------|
| **Aitareya** | Aitareya Upanishad | 33 | Creation, Consciousness |
| **Brihadaranyaka** | Brihadaranyaka Upanishad | 104 | Ultimate Reality, Self |
| **Isavasya** | Isavasya Upanishad | 18 | Renunciation, Divine Will |
| **Karika** | Karika Upanishad | 216 | Mandukya Commentary |
| **Katha** | Katha Upanishad | 71 | Death, Eternal Self, Nachiketa |
| **Kena** | Kena Upanishad | 37 | Divine Power, Brahman |
| **Mandukya** | Mandukya Upanishad | 12 | Om, States of Consciousness |
| **Mundaka** | Mundaka Upanishad | 65 | Higher Knowledge, Two Birds |
| **Prasna** | Prasna Upanishad | 73 | Six Questions, Prana |
| **Svetashvatra** | Svetashvatra Upanishad | 113 | Divine Grace, Shiva |
| **Taittiriya** | Taittiriya Upanishad | 20 | Five Sheaths, Bliss |

### API Reference

| Method | Description | Returns |
|--------|-------------|---------|
| `all()` | Get all Upanishads | `UpanishadText[]` |
| `upanishad(name)` | Get Upanishad by name (flexible matching) | `UpanishadText \| undefined` |
| `mantra(upanishadName, mantraNumber)` | Get specific mantra | `UpanishadMantra \| undefined` |
| `search(query)` | Search across all mantras | `UpanishadMantra[]` |

### Data Structure

```typescript
interface UpanishadText {
  title: string;
  mantras: UpanishadMantra[];
}

interface UpanishadMantra {
  mantra_number: string;
  sanskrit: string;
  transliteration?: string;
  english?: string;
}
```

### Advanced Search Examples

```javascript
// Philosophy-focused searches
const mayaRefs = Upanishads.search('माया');           // Illusion
const mokshRefs = Upanishads.search('मोक्ष');          // Liberation  
const tapasRefs = Upanishads.search('तपस्');          // Austerity
const dhyanaRefs = Upanishads.search('ध्यान');        // Meditation

// Theological concepts
const ishvaraRefs = Upanishads.search('ईश्वर');       // God/Lord
const purushaRefs = Upanishads.search('पुरुष');       // Cosmic Being
const prakrtiRefs = Upanishads.search('प्रकृति');     // Nature

// Practical wisdom search
function findUpanishadicWisdom(topic) {
  const results = Upanishads.search(topic);
  console.log(`\n🕉️ Upanishadic wisdom on "${topic}":`);
  
  results.slice(0, 3).forEach((mantra, index) => {
    console.log(`${index + 1}. Mantra ${mantra.mantra_number}`);
    console.log(`   Sanskrit: ${mantra.sanskrit.substring(0, 100)}...`);
  });
  
  return results;
}

findUpanishadicWisdom('आत्मा');  // Self/Soul
findUpanishadicWisdom('सत्य');   // Truth
findUpanishadicWisdom('शान्ति'); // Peace
```

**Reference Format**: Each mantra has a unique reference like `।।1.1.1।।` indicating chapter, section, and verse numbers.

### Usage Examples

```javascript
// CommonJS usage
const { Upanishads, Isavasya, Katha } = require('divine-books');

// ES Module usage  
import { Upanishads, Isavasya, Katha } from 'divine-books';

// Clean Sanskrit text (no embedded mantra numbers)
const firstMantra = Isavasya.mantras[0];
console.log(firstMantra.mantra_number); // "।। 1.1.1 ।।"
console.log(firstMantra.sanskrit);      // Clean Sanskrit text only
```

> **✨ Data Quality**: All mantras have been processed to remove redundant mantra numbers from the Sanskrit text, ensuring clean separation between content and metadata.

---

## 🗺️ Roadmap

- [x] ✅ **Bhagavad Gita** - Complete with commentary
- [x] ✅ **Ramcharitmanas** - All 7 Kands
- [x] ✅ **Mahabharat** - All 18 Parvas
- [x] ✅ **RigVeda** - Complete with all 10 Mandalas
- [x] ✅ **Atharvaveda** - Complete with all 20 Books
- [x] ✅ **Upanishads** - 11 major Upanishads with Sanskrit text
- [x] 🟡 **Samaveda** - Partial (1 book available)
- [ ] ❌ **Yajurveda** - Data not available
- [ ] 🔄 **Audio Support** - Pronunciation guides
- [ ] 🔄 **Cross-references** - Inter-text connections
- [ ] 🔄 **Advanced Analytics** - Verse analysis tools
- [ ] 🔄 **Multilingual Search** - Enhanced search capabilities

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Setup

```bash
git clone https://github.com/itz-rajkeshav/sacred-texts.git
cd sacred-texts
npm install
npm run test
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Sacred texts sourced from authentic translations
- Community contributors and maintainers
- Open source community support

---

## 📞 Support

- 📧 **Email**: [support@divine-books.com](mailto:itsrajkeshav@gmail.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/itz-rajkeshav/sacred-texts/issues)
---

<div align="center">

**Made with ❤️ for the preservation and accessibility of sacred wisdom**

[⭐ Star this project](https://github.com/itz-rajkeshav/sacred-texts) | [🐛 Report Bug](https://github.com/itz-rajkeshav/sacred-texts/issues)

</div>