import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import divineBooks from 'divine-books'; // Import the local repo!
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Fail-closed JWT verification: In production, missing JWT_SECRET MUST throw a fatal error
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing in production environment.');
  throw new Error('FATAL: JWT_SECRET environment variable is mandatory in production.');
}

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'test' 
    ? 'test-jwt-secret-for-automated-suites-min32' 
    : 'sutra-dev-secret-key-local-only-not-for-prod'
);

const { RigVeda, Atharvaveda, Samaveda } = divineBooks;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Schemas & Input Validation ---
const verseRequestSchema = z.object({
  veda: z.enum(['rig', 'atharva', 'sama', 'yajur']).default('rig'),
  book: z.number().int().positive(),
  hymn: z.number().int().positive(),
  verse: z.number().int().positive()
});

const translateRequestSchema = z.object({
  veda: z.enum(['rig', 'atharva', 'sama', 'yajur']).default('rig'),
  book: z.number().int().positive(),
  hymn: z.number().int().positive(),
  verse: z.number().int().positive(),
  sanskrit: z.string().min(1)
});

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'model', 'system']),
  content: z.string().min(1)
});

const chatRequestSchema = z.union([
  z.object({
    messages: z.array(chatMessageSchema).min(1)
  }),
  z.object({
    message: z.string().min(1),
    history: z.array(
      z.object({
        role: z.string(),
        text: z.string().optional(),
        content: z.string().optional()
      })
    ).optional()
  }).transform((data) => {
    const messages = [];
    if (Array.isArray(data.history)) {
      for (const item of data.history) {
        const text = item.content || item.text;
        if (text && typeof text === 'string' && text.trim().length > 0) {
          const role = item.role === 'assistant' || item.role === 'model' ? 'assistant' : 'user';
          messages.push({ role, content: text.trim() });
        }
      }
    }
    messages.push({ role: 'user', content: data.message.trim() });
    return { messages };
  })
]);

const authRequestSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain alphanumeric characters and underscores (no spaces or email signs)." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." })
});

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || error.errors || [];
      const compiledError = issues.map((err) => err.message).join(' ');
      return res.status(400).json({ error: compiledError || 'Invalid request payload.' });
    }
    next(error);
  }
};

// --- Atomic File Writing System (Anti-Corruption Lock) ---
const writeQueue = new Map();
const writeJsonAtomic = async (filePath, data) => {
  if (!writeQueue.has(filePath)) {
    writeQueue.set(filePath, Promise.resolve());
  }
  
  const currentWrite = writeQueue.get(filePath)
    .then(async () => {
      const tempPath = `${filePath}.tmp`;
      const jsonString = JSON.stringify(data, null, 2);
      await fs.promises.writeFile(tempPath, jsonString, 'utf8');
      await fs.promises.rename(tempPath, filePath);
    })
    .catch((err) => {
      console.error(`Atomic write failure on ${filePath}:`, err);
    });
    
  writeQueue.set(filePath, currentWrite);
  return currentWrite;
};

// --- User Database Management ---
const usersPath = process.env.NODE_ENV === 'production' 
    ? '/tmp/users.json'
    : path.join(__dirname, '..', 'users.json');

if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ PERSISTENCE NOTICE: Server is configured with ephemeral file storage (/tmp/users.json). Durable managed database is recommended for production accounts.');
}

let usersDb = {};
const loadUsers = () => {
    try {
        if (fs.existsSync(usersPath)) {
            usersDb = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
            console.log(`Loaded ${Object.keys(usersDb).length} user accounts.`);
        } else {
            // Secure explicit bootstrap: Never seed default credentials in code
            if (process.env.ADMIN_INIT_USERNAME && process.env.ADMIN_INIT_PASSWORD) {
                const initUser = process.env.ADMIN_INIT_USERNAME.toLowerCase().trim();
                const initHash = bcrypt.hashSync(process.env.ADMIN_INIT_PASSWORD, 12);
                usersDb = {
                    [initUser]: {
                        username: process.env.ADMIN_INIT_USERNAME.trim(),
                        passwordHash: initHash,
                        role: 'admin',
                        createdAt: new Date().toISOString()
                    }
                };
                fs.writeFileSync(usersPath, JSON.stringify(usersDb, null, 2));
                console.log("Initialized designated administrator account from environment variables.");
            } else {
                // Initialize clean empty store without hardcoded accounts
                usersDb = {};
                fs.writeFileSync(usersPath, JSON.stringify(usersDb, null, 2));
                console.log("Initialized clean empty user store.");
            }
        }
    } catch (e) {
        console.error("Failed to load or initialize users DB:", e);
    }
};
loadUsers();

const saveUsers = () => {
    writeJsonAtomic(usersPath, usersDb);
};

// --- Yajur Veda Stub Setup ---
const yajurStub = {
    books: [
        {
            book_number: 1,
            title: "Prarthana Adhyaya (Prayers for Energy)",
            hymns: [
                {
                    hymn_number: 1,
                    verses: [
                        { verse_number: 1, sanskrit: "इषे त्वोर्जे त्वा वायव स्थ देवो वः सविता प्रार्पयतु श्रेष्ठतमाय कर्मणे" },
                        { verse_number: 2, sanskrit: "वसोः पवित्रमसि शतधारं वसोः पवित्रमसि सहस्रधारम्" }
                    ]
                }
            ]
        },
        {
            book_number: 31,
            title: "Purusha Adhyaya (Cosmic Consciousness)",
            hymns: [
                {
                    hymn_number: 1,
                    verses: [
                        { verse_number: 1, sanskrit: "सहस्रशीर्षा पुरुषः सहस्राक्षः सहस्रपात् स भूमिं विश्वतो वृत्वात्यतिष्ठद्दशाङ्गुलम्" },
                        { verse_number: 2, sanskrit: "पुरुष एवेदं सर्वं यद्भूतं यच्च भव्यम् उतामृतत्वस्येशानो यदन्नेनातिरोहति" },
                        { verse_number: 3, sanskrit: "एतावानस्य महिमातो ज्यायाँश्च पूरुषः पादोऽस्य विश्वा भूतानि त्रिपादस्यामृतं दिवि" }
                    ]
                }
            ]
        },
        {
            book_number: 40,
            title: "Isha Adhyaya (Sacred Non-Duality)",
            hymns: [
                {
                    hymn_number: 1,
                    verses: [
                        { verse_number: 1, sanskrit: "ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत् तेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्" },
                        { verse_number: 2, sanskrit: "कुर्वन्नेवेह कर्माणि जिजीविषेच्छतं समाः एवं त्वयि नान्यथेतोऽस्ति न कर्म लिप्यते नरे" }
                    ]
                }
            ]
        }
    ],
    all: () => yajurStub.books,
    book: (b) => yajurStub.books.find(x => x.book_number === b) || null,
    hymn: (b, h) => {
        const bk = yajurStub.book(b);
        if (!bk) return null;
        return bk.hymns.find(x => x.hymn_number === h) || null;
    },
    verse: (b, h, v) => {
        const hm = yajurStub.hymn(b, h);
        if (!hm) return null;
        return hm.verses.find(x => x.verse_number === v) || null;
    }
};

const vedasMap = {
    'rig': RigVeda,
    'atharva': Atharvaveda,
    'sama': Samaveda,
    'yajur': yajurStub
};

// --- Translation Cache System ---
const cachePath = process.env.NODE_ENV === 'production' 
    ? '/tmp/translation_cache.json'
    : path.join(__dirname, '..', 'translation_cache.json');

let translationCache = {};
try {
  if (fs.existsSync(cachePath)) {
    translationCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    console.log(`Loaded ${Object.keys(translationCache).length} cached verses.`);
  }
} catch {
  console.log("Translation cache empty or unreadable. Bootstrapping freshly.");
}

const saveCache = () => {
    writeJsonAtomic(cachePath, translationCache);
};

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;

// --- Authentication Middleware ---
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Access denied. No authentication token provided." });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
};

// eslint-disable-next-line no-unused-vars
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access forbidden. Admin role required." });
  }
  next();
};

// --- Authentication Endpoints ---
app.post('/api/auth/register', validate(authRequestSchema), (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username.toLowerCase().trim();
    
    if (usersDb[normalizedUsername]) {
      return res.status(400).json({ error: "Username is already taken." });
    }
    
    const passwordHash = bcrypt.hashSync(password, 10);
    usersDb[normalizedUsername] = {
      username: username.trim(),
      passwordHash,
      role: 'user'
    };
    saveUsers();
    
    const token = jwt.sign(
      { username: usersDb[normalizedUsername].username, role: usersDb[normalizedUsername].role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: { username: usersDb[normalizedUsername].username, role: usersDb[normalizedUsername].role }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal registration failure." });
  }
});

app.post('/api/auth/login', validate(authRequestSchema), (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username.toLowerCase().trim();
    const userRecord = usersDb[normalizedUsername];
    
    if (!userRecord || !bcrypt.compareSync(password, userRecord.passwordHash)) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    
    const token = jwt.sign(
      { username: userRecord.username, role: userRecord.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: { username: userRecord.username, role: userRecord.role }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal login failure." });
  }
});

app.post('/api/auth/guest', (req, res) => {
  try {
    const guestUsername = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    const token = jwt.sign(
      { username: guestUsername, role: 'guest', isGuest: true },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    
    res.json({
      success: true,
      token,
      user: { username: guestUsername, role: 'guest', isGuest: true }
    });
  } catch (error) {
    console.error("Guest session error:", error);
    res.status(500).json({ error: "Failed to initialize guest session." });
  }
});

app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Library Tree Structure Endpoint (Lightweight)
app.get('/api/library', (req, res) => {
  const vedaType = req.query.veda || 'rig';
  const vedaEngine = vedasMap[vedaType] || RigVeda;
  
  try {
      const allBooks = vedaEngine.all() || [];
      const tree = allBooks.map(b => ({
        book: b.book_number || b.book, // Handle potential schema differences
        title: b.title || `Book ${b.book_number}`,
        suktas: (b.hymns || b.suktas || []).map(s => ({
           hymn: s.hymn_number || s.hymn,
           verseCount: s.verses ? s.verses.length : 0
        }))
      }));
      res.json(tree);
  } catch(e) {
      console.log(e);
      res.json([]);
  }
});

// Dynamic Search Engine for Sanskrit, English, or Hindi keywords
app.get('/api/search', verifyToken, (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase().trim();
    if (!query) {
        return res.json([]);
    }
    
    const results = [];
    const maxResults = 15;
    
    // Search translation cache for matches (highest quality query matching)
    for (const [verseId, data] of Object.entries(translationCache)) {
        const matchText = `${data.english || ''} ${data.hindi || ''} ${data.transliteration || ''} ${data.sanskrit || ''} ${(data.topics || []).join(' ')}`.toLowerCase();
        if (matchText.includes(query)) {
            const [veda, book, hymn, verse] = verseId.split('-');
            results.push({
                id: verseId,
                veda, 
                book: parseInt(book), 
                hymn: parseInt(hymn), 
                verse: parseInt(verse),
                sanskrit: data.sanskrit || '',
                english: data.english || '',
                hindi: data.hindi || '',
                topics: data.topics || []
            });
            if (results.length >= maxResults) break;
        }
    }
    
    // Fallback: If cache has few results, scan Rig Veda locally for Sanskrit direct text matching
    if (results.length < maxResults) {
        try {
            const allBooks = RigVeda.all() || [];
            for (const b of allBooks) {
                for (const h of b.hymns || []) {
                    for (const v of h.verses || []) {
                        if (v.sanskrit && v.sanskrit.includes(query)) {
                            const verseId = `rig-${b.book_number}-${h.hymn_number}-${v.verse_number}`;
                            if (!results.some(r => r.id === verseId)) {
                                results.push({
                                    id: verseId,
                                    veda: 'rig',
                                    book: b.book_number,
                                    hymn: h.hymn_number,
                                    verse: v.verse_number,
                                    sanskrit: v.sanskrit,
                                    english: "Sanskrit text match found locally. Decrypt to translate.",
                                    hindi: "संस्कृत पाठ स्थानीय रूप से मिला।",
                                    topics: ["Search Match"]
                                });
                            }
                        }
                        if (results.length >= maxResults) break;
                    }
                    if (results.length >= maxResults) break;
                }
                if (results.length >= maxResults) break;
            }
        } catch (scanError) {
            console.error("Local RigVeda scan failed:", scanError.message);
        }
    }
    
    res.json(results);
  } catch (err) {
    console.error("Search API error:", err);
    res.status(500).json({ error: "Failed to query Vedic records." });
  }
});

// Dynamic fast-fetch for Sanskrit
app.post('/api/verse', validate(verseRequestSchema), async (req, res) => {
  try {
    const { veda = 'rig', book, hymn, verse } = req.body;
    const vedaEngine = vedasMap[veda] || RigVeda;
    
    let sanskritRaw = "Verse not found locally.";
    try {
        const v = vedaEngine.verse(book, hymn, verse);
        if(v && v.sanskrit) {
            sanskritRaw = v.sanskrit;
        }
    } catch(e) {
        console.error("Local verse fetch error:", e.message);
    }

    res.json({
        id: `${veda}-${book}-${hymn}-${verse}`,
        veda, book, hymn, verse,
        sanskrit: sanskritRaw,
        transliteration: "Loading contextual transliteration...",
        english: "Fetching translation via Free Local Engine...",
        hindi: "विशेष अनुवाद लाया जा रहा है...",
        practicalMeaning: "Extracting insights...",
        topics: ["Vedic"]
    });
  } catch {
    res.status(500).json({ error: "Failed to grab base verse mapping." });
  }
});

// 100% Free / Context-Aware Translation Pipeline using Gemini AI or Local Fallbacks
app.post('/api/verse/translate', verifyToken, validate(translateRequestSchema), async (req, res) => {
  try {
    const { veda = 'rig', book, hymn, verse, sanskrit } = req.body;
    const verseId = `${veda}-${book}-${hymn}-${verse}`;
    
    // 1. Instantly return from JSON cache if this verse has already been translated before!
    if (translationCache[verseId]) {
       return res.json(translationCache[verseId]);
    }
    
    let generatedData = null;

    // 2. Try translating via Gemini API for Vedic-context awareness
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Translate and explain the following Sanskrit verse from the ${veda.toUpperCase()} Veda (Book ${book}, Hymn ${hymn}, Verse ${verse}):
        "${sanskrit}"
        
        Provide the response in strict JSON format matching this schema:
        {
          "english": "English translation reflecting accurate Vedic/philosophical context",
          "hindi": "Hindi translation reflecting accurate Vedic/philosophical context",
          "transliteration": "Pronunciation transliteration",
          "practicalMeaning": "Profound philosophical and practical meaning of this verse for today",
          "topics": ["Vedic", "Ayurveda", "Philosophy", etc. (2-3 relevant tags)],
          "challenge": {
            "question": "A multiple-choice question testing understanding of a key Sanskrit word, its root meaning, or core concept in this verse.",
            "options": ["Option A", "Option B", "Option C", "Option D (exactly 4 distinct options)"],
            "correctIndex": 0-3
          }
        }`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        if (response && response.text) {
          generatedData = JSON.parse(response.text);
        }
      } catch (geminiError) {
        console.error("Gemini Translation failed, falling back to Google Translate:", geminiError);
      }
    }

    // 3. Fallback: Google Translate (Free unofficial API with error handling)
    if (!generatedData) {
      try {
        const translateFree = async (text, tl) => {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=sa&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
            const r = await fetch(url);
            if (!r.ok) throw new Error(`Google Translate returned HTTP ${r.status}`);
            const j = await r.json();
            return j[0].map(i => i[0]).join('');
        };

        const [english, hindi] = await Promise.all([
            translateFree(sanskrit, 'en'),
            translateFree(sanskrit, 'hi')
        ]);
        
        const fallbackPuzzles = [
            {
                question: "What is the primary element/energy represented by the root word in this verse?",
                options: ["Sacred Fire (Agni)", "Cosmic Water (Apas)", "Universal Wind (Vayu)", "Earth Mother (Prithvi)"],
                correctIndex: 0
            },
            {
                question: "Which quality does the speaker invoke to bestow strength and protection?",
                options: ["Wealth and Pride", "Wisdom and Knowledge", "Force and Anger", "Fear and Doubt"],
                correctIndex: 1
            },
            {
                question: "What is the ultimate target of Vedic consciousness and meditation?",
                options: ["Brahman (Universal Soul)", "Karma (Ego)", "Krodha (Anger)", "Samsara (Worldly bond)"],
                correctIndex: 0
            }
        ];
        const randomChallenge = fallbackPuzzles[Math.floor(Math.random() * fallbackPuzzles.length)];

        generatedData = {
            transliteration: "Listen via Audio Read-Aloud",
            english: english,
            hindi: hindi,
            practicalMeaning: "Literal translations provided by Backup Free Offline Engine.",
            topics: [veda.toUpperCase() + " Veda"],
            challenge: randomChallenge
        };
      } catch (fallbackError) {
        console.error("Google Translate Fallback failed:", fallbackError);
        // Absolute fallback to avoid crashing or hanging the client
        generatedData = {
            transliteration: "Transliteration unavailable",
            english: "Translation temporarily unavailable.",
            hindi: "अनुवाद वर्तमान में अनुपलब्ध है।",
            practicalMeaning: "The translation engine is experiencing high load. Please try again later.",
            topics: [veda.toUpperCase() + " Veda"]
        };
      }
    }
    
    // Store in cache
    translationCache[verseId] = generatedData;
    saveCache();

    res.json(generatedData);
  } catch (error) {
    console.error("Translation Engine error:", error);
    res.status(500).json({ error: "Failed to translate verse dynamically." });
  }
});

app.post('/api/chat', verifyToken, validate(chatRequestSchema), async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Wise fallback if no API key is provided
      const fallbacks = [
        "The Vedas teach that true knowledge comes to those who seek with a pure heart. Continue your journey of exploration.",
        "As the Atharva Veda says, 'Earth is my mother, and I am her child.' We are all connected to the ancient wisdom of the land.",
        "Wisdom is like the eternal flame; it illuminates the path but requires a steady hand to guide. Reflect on your inquiry."
      ];
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return res.json({ reply: `[Offline Wisdom Mode] ${randomFallback}` });
    }

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }]
    }));
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      systemInstruction: "You are a wise AI guide drawing wisdom from the Vedas (Rig, Atharva, Sama, Yajur). Keep your answers concise, profound, and relevant."
    });
    
    res.json({ reply: response.text });
  } catch (error) {
    console.error("Chat Engine upstream error:", error?.message || error);
    const fallbacks = [
      "The Vedas teach that true knowledge comes to those who seek with a pure heart. Reflect on your inquiry as stillness returns.",
      "As the Atharva Veda reveals, 'Earth is my mother, and I am her child.' Truth and cosmic order sustain all existence.",
      "Wisdom is like the eternal flame; it illuminates the path when contemplated with patience."
    ];
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json({ reply: `[Offline Wisdom Mode] ${randomFallback}` });
  }
});

// ============ CONTACT FORM ENDPOINT ============
const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(300),
  message: z.string().min(1).max(5000),
});

app.post('/api/contact', async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);
    const contactEntry = {
      ...data,
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    };
    
    // Persist to local JSON file
    const contactsFile = process.env.NODE_ENV === 'production' 
      ? '/tmp/contact-messages.json' 
      : path.join(__dirname, 'contact-messages.json');
    let messages = [];
    try {
      if (fs.existsSync(contactsFile)) {
        messages = JSON.parse(fs.readFileSync(contactsFile, 'utf-8'));
      }
    } catch { /* fresh file */ }
    
    messages.push(contactEntry);
    fs.writeFileSync(contactsFile, JSON.stringify(messages, null, 2));
    
    console.log(`📩 New contact message from ${data.name} (${data.email})`);
    res.json({ success: true, message: 'Message received successfully.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid form data. Please check your inputs.' });
    }
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

// Safe 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// Centralized Safe Error Handler (Never leak stack traces in responses)
app.use((err, req, res, next) => {
  console.error('Unhandled API exception:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred in the sacred sanctum.'
      : err.message || 'Internal server error'
  });
});

// Vercel handles frontend hosting, but locally we need to start the server
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Sutra: Vedic Journey Backend running on port ${PORT} (Local Dev Mode)`);
    });
}

// Export the Express API for Vercel Serverless deployment
export default app;
