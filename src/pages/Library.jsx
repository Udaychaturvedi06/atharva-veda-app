import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/soundEngine';
import {
  BookOpen,
  Search,
  ChevronRight,
  Filter,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

// Canonical Four Vedas Metadata
const VEDAS = [
  {
    id: 'atharva',
    name: 'Atharvaveda',
    sanskrit: 'अथर्ववेद',
    count: '730 Suktas',
    color: '#FF5E1E',
    desc: 'Spells of healing, domestic alchemy, ecology, and psychological harmony.'
  },
  {
    id: 'rig',
    name: 'Rigveda',
    sanskrit: 'ऋग्वेद',
    count: '1,028 Suktas',
    color: '#FFE259',
    desc: 'Primordial cosmic chants, solar revelations, and elemental deities.'
  },
  {
    id: 'sama',
    name: 'Samaveda',
    sanskrit: 'सामवेद',
    count: '1,875 Mantras',
    color: '#63B3ED',
    desc: 'Transcendent musical frequencies and chants that dissolve the mortal ego.'
  },
  {
    id: 'yajur',
    name: 'Yajurveda',
    sanskrit: 'यजुर्वेद',
    count: '1,975 Shlokas',
    color: '#FF7B00',
    desc: 'Alchemical inner and outer sacrificial rites and focused spiritual action.'
  }
];

// Rich Suktas Database with Devanagari Excerpts, Meter & Translations
const SUKTAS_DB = {
  atharva: [
    {
      book: 12,
      hymn: 1,
      verse: 1,
      title: 'Prithvi Sukta (Ode to Mother Earth)',
      sanskrit: 'सत्यं बृहदृतमुग्रं दीक्षा तपो ब्रह्म यज्ञः पृथिवीं धारयन्ति',
      translation: 'Truth, vast eternal cosmic order, austerity, dedication, and sacred sacrifice uphold the Earth.',
      verses: 63,
      meter: 'Trishtubh',
      tag: 'Sacred Soil'
    },
    {
      book: 1,
      hymn: 1,
      verse: 1,
      title: 'Medha Sukta (Prayer for Divine Intellect)',
      sanskrit: 'ये त्रिषप्ताः परियन्ति विश्वा रूपाणि बिभ्रतः',
      translation: 'May the triple-seven divine forces infuse us with supreme wisdom, memory, and cognitive brilliance.',
      verses: 4,
      meter: 'Gayatri',
      tag: 'Mind Clarity'
    },
    {
      book: 9,
      hymn: 2,
      verse: 1,
      title: 'Kama Sukta (Primordial Cosmic Desire)',
      sanskrit: 'सपत्नहनमृषभो घृतेन कामं शिक्षामि हविषा स्वस्तये',
      translation: 'I propitiate the primal desire that was the first seed of mind, transcending all inner conflicts.',
      verses: 25,
      meter: 'Anushtubh',
      tag: 'Creation'
    },
    {
      book: 19,
      hymn: 53,
      verse: 1,
      title: 'Kala Sukta (The Mystery of Cosmic Time)',
      sanskrit: 'कालो अश्वो वहति सप्तरश्मिः सहस्राक्षो अजरो भूरिरेताः',
      translation: 'Time is the cosmic steed with seven reins, thousand-eyed, unaging, bearing the infinite universe.',
      verses: 10,
      meter: 'Trishtubh',
      tag: 'Eternity'
    },
    {
      book: 11,
      hymn: 4,
      verse: 1,
      title: 'Prana Sukta (Universal Life Breath)',
      sanskrit: 'नमस्ते प्राण प्राणते नमो अस्तु निमिषते',
      translation: 'Salutations to Prana, the all-pervading life breath, when it exhales and when it gathers within.',
      verses: 26,
      meter: 'Jagati',
      tag: 'Vital Force'
    }
  ],
  rig: [
    {
      book: 1,
      hymn: 1,
      verse: 1,
      title: 'Agni Sukta (Cosmic Flame of Aspiration)',
      sanskrit: 'अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम्',
      translation: 'I magnify Agni, the cosmic priest, the divine minister of the sacrificial offering.',
      verses: 9,
      meter: 'Gayatri',
      tag: 'Divine Will'
    },
    {
      book: 10,
      hymn: 129,
      verse: 1,
      title: 'Nasadiya Sukta (The Hymn of Creation)',
      sanskrit: 'नासदासीन्नो सदासीत्तदानीं नासीद्रजो नो व्योमा परो यत्',
      translation: 'Then there was neither non-existence nor existence; there was no realm of air, no sky beyond.',
      verses: 7,
      meter: 'Trishtubh',
      tag: 'Cosmology'
    },
    {
      book: 10,
      hymn: 90,
      verse: 1,
      title: 'Purusha Sukta (The Universal Cosmic Being)',
      sanskrit: 'सहस्रशीर्षा पुरुषः सहस्राक्षः सहस्रपात्',
      translation: 'A thousand heads has the Cosmic Being, a thousand eyes, a thousand feet—pervading all realms.',
      verses: 16,
      meter: 'Anushtubh',
      tag: 'Cosmic Form'
    },
    {
      book: 3,
      hymn: 62,
      verse: 10,
      title: 'Gayatri Sukta (Invocation of Savita)',
      sanskrit: 'तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
      translation: 'We meditate upon that adorable solar splendor; may that divine light illuminate our intellect.',
      verses: 18,
      meter: 'Gayatri',
      tag: 'Illumination'
    },
    {
      book: 10,
      hymn: 191,
      verse: 2,
      title: 'Samjnana Sukta (Hymn of Unity & Concord)',
      sanskrit: 'सं गच्छध्वं सं वदध्वं सं वो मनांसि जानताम्',
      translation: 'Walk together, speak together, let your minds resonate in sacred mutual understanding.',
      verses: 4,
      meter: 'Anushtubh',
      tag: 'Harmony'
    }
  ],
  sama: [
    {
      book: 1,
      hymn: 1,
      verse: 1,
      title: 'Purvarchika (Invocation to Agni and Indra)',
      sanskrit: 'अग्न आयाहि वीतये गृणानो हव्यदातये',
      translation: 'Come, O Agni, to the banquet of cosmic light, praised by our melodic chants.',
      verses: 10,
      meter: 'Gayatri',
      tag: 'Rhythmic Chant'
    },
    {
      book: 2,
      hymn: 1,
      verse: 1,
      title: 'Uttararchika (Songs of Soma & Ecstasy)',
      sanskrit: 'पुनानः सोम धारया पवित्रमन्वर्षसि',
      translation: 'Clarified in rhythmic stream, O divine Soma, flow through the subtle spiritual filter of the heart.',
      verses: 12,
      meter: 'Trishtubh',
      tag: 'Melodic Joy'
    },
    {
      book: 1,
      hymn: 4,
      verse: 1,
      title: 'Maha-Namni (The Great Sacred Names)',
      sanskrit: 'ओम् भूः ओम् भुवः ओम् स्वः तत्सवितुः',
      translation: 'Resonances of the primordial realms that uplift the spiritual subtle body beyond sorrow.',
      verses: 8,
      meter: 'Jagati',
      tag: 'Transcendence'
    }
  ],
  yajur: [
    {
      book: 40,
      hymn: 1,
      verse: 1,
      title: 'Isha Upanishad (The All-Pervading Divine)',
      sanskrit: 'ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्',
      translation: 'All this, whatever moves in this changing world, is enveloped and permeated by the Supreme Divine.',
      verses: 18,
      meter: 'Anushtubh',
      tag: 'Non-Duality'
    },
    {
      book: 31,
      hymn: 1,
      verse: 1,
      title: 'Purusha Medha (Cosmic Consciousness)',
      sanskrit: 'वेदाहमेतं पुरुषं महान्तमादित्यवर्णं तमसः परस्तात्',
      translation: 'I know this great Purusha, radiant as the golden sun beyond all darkness and ignorance.',
      verses: 22,
      meter: 'Trishtubh',
      tag: 'Inner Dedication'
    },
    {
      book: 1,
      hymn: 1,
      verse: 1,
      title: 'Prarthana (Prayers for Energy & Strength)',
      sanskrit: 'इषे त्वोर्जे त्वा वायव स्थ देवो वः सविता प्रार्पयतु',
      translation: 'For food, for vital vigor, like cosmic winds may Savitr dispatch you toward highest excellence.',
      verses: 14,
      meter: 'Gayatri',
      tag: 'Vitality'
    }
  ]
};

export const Library = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentParamVeda = searchParams.get('veda') || 'atharva';

  const [activeVeda, setActiveVeda] = useState(currentParamVeda);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState('all');

  const THEME_BUBBLES = ['All', 'Sacred Soil', 'Mind Clarity', 'Creation', 'Eternity', 'Illumination', 'Harmony', 'Cosmology'];

  // Sync state if URL changes
  useEffect(() => {
    const v = searchParams.get('veda');
    if (v && v !== activeVeda && SUKTAS_DB[v]) {
      setActiveVeda(v);
    }
  }, [searchParams, activeVeda]);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleVedaChange = (vedaId) => {
    sounds.playTibetanBowl();
    setActiveVeda(vedaId);
    setSelectedBook('all');
    setSearchParams({ veda: vedaId });
  };

  const suktas = useMemo(() => SUKTAS_DB[activeVeda] || [], [activeVeda]);

  // Available books for current active Veda
  const availableBooks = useMemo(() => {
    const books = new Set(suktas.map((s) => s.book));
    return Array.from(books).sort((a, b) => a - b);
  }, [suktas]);

  // Filtered Suktas
  const filteredSuktas = useMemo(() => {
    return suktas.filter((s) => {
      const matchesBook = selectedBook === 'all' || s.book.toString() === selectedBook;
      if (!matchesBook) return false;

      const matchesTheme = selectedTheme === 'all' || selectedTheme === 'All' || s.tag.toLowerCase().includes(selectedTheme.toLowerCase());
      if (!matchesTheme) return false;

      if (!debouncedQuery.trim()) return true;

      const q = debouncedQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchTag = s.tag.toLowerCase().includes(q);
      const matchSanskrit = s.sanskrit.toLowerCase().includes(q);
      const matchTrans = s.translation.toLowerCase().includes(q);
      const matchNum = `book ${s.book} hymn ${s.hymn}`.toLowerCase().includes(q);

      return matchTitle || matchTag || matchSanskrit || matchTrans || matchNum;
    });
  }, [suktas, selectedBook, selectedTheme, debouncedQuery]);

  return (
    <div className="library-container">
      {/* Header */}
      <div className="library-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)' }}>
          <BookOpen size={16} />
          <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Sacred Canonical Archives
          </span>
        </div>
        <h1 className="library-title">The Four Sacred Vedas</h1>
        <p className="library-subtitle">
          Explore verbatim Sanskrit hymns, analytical translations, and meter structures preserved
          across thousands of years of oral and written transmission.
        </p>
      </div>

      {/* 4 Veda Portal Tabs with Shared layoutId */}
      <div className="veda-portals-grid">
        {VEDAS.map((v) => {
          const isActive = activeVeda === v.id;
          return (
            <button
              key={v.id}
              type="button"
              className={`veda-portal-card ${isActive ? 'active' : ''}`}
              onClick={() => handleVedaChange(v.id)}
            >
              {isActive && (
                <motion.div
                  layoutId="veda-portal-glow"
                  className="veda-portal-active-glow"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}

              <div>
                <div className="veda-portal-header">
                  <span className="veda-portal-name">{v.name}</span>
                  <span className="veda-portal-count" style={{ color: v.color }}>
                    {v.count}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-sanskrit)', fontSize: '1rem', color: v.color, marginBottom: '6px' }}>
                  {v.sanskrit}
                </div>
                <p className="veda-portal-desc">{v.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Book/Mandala Filters Bar */}
      <GlassCard spotlight className="library-filters-bar">
        {/* Debounced Search Input */}
        <div className="library-search-wrap">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={`Search ${activeVeda.toUpperCase()} by Sanskrit hymn, English concept, or Book #...`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="library-search-input"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* Book / Mandala Selector */}
        <div className="library-select-wrap">
          <Filter size={16} style={{ color: 'var(--gold)' }} />
          <select
            value={selectedBook}
            onChange={(e) => {
              sounds.playTibetanBowl();
              setSelectedBook(e.target.value);
            }}
            className="library-select"
          >
            <option value="all">All Books / Mandalas</option>
            {availableBooks.map((b) => (
              <option key={b} value={b.toString()}>
                Book / Mandala {b}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Theme Lens Bubble Cloud */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0 24px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4, marginRight: 6 }}>
          <Sparkles size={14} color="var(--gold)" /> Themes:
        </span>
        {THEME_BUBBLES.map((t) => {
          const isAct = selectedTheme === t;
          return (
            <button
              key={t}
              onClick={() => {
                sounds.playTap();
                setSelectedTheme(t);
              }}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: isAct ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: isAct ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isAct ? 'var(--gold-bright)' : 'var(--text-2)',
                fontSize: '0.8rem',
                fontWeight: isAct ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Suktas / Verses Grid */}
      {filteredSuktas.length > 0 ? (
        <div className="library-grid">
          <AnimatePresence mode="popLayout">
            {filteredSuktas.map((sukta) => (
              <motion.div
                key={`${activeVeda}-${sukta.book}-${sukta.hymn}`}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <GlassCard
                  tilt
                  spotlight
                  className="sukta-card"
                  onClick={() => {
                    sounds.playUnlockChime();
                    navigate(`/verse/${sukta.book}/${sukta.hymn}/${sukta.verse || 1}?veda=${activeVeda}`);
                  }}
                >
                  <div>
                    <div className="sukta-card-meta">
                      <span className="sukta-coord-badge">
                        BOOK {sukta.book} • HYMN {sukta.hymn}
                      </span>
                      <Chip variant="gold" icon={Sparkles}>
                        {sukta.tag}
                      </Chip>
                    </div>

                    <h3 className="sukta-card-title">{sukta.title}</h3>

                    <div className="sukta-preview-sanskrit">
                      {sukta.sanskrit}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, margin: '8px 0 0' }}>
                      "{sukta.translation}"
                    </p>
                  </div>

                  <div className="sukta-card-footer">
                    <div>
                      <span style={{ color: 'var(--soma)', marginRight: '8px' }}>
                        {sukta.meter}
                      </span>
                      <span>• {sukta.verses} Mantras</span>
                    </div>

                    <div className="sukta-study-action">
                      <span>Study Verse</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <GlassCard spotlight className="library-empty-state">
          <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '14px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', margin: '0 0 8px' }}>
            No Hymns Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
            No matching verses for "{debouncedQuery}". Try searching by another concept, hymn title, or clear your filters.
          </p>
          <Button
            variant="cyber"
            icon={RotateCcw}
            onClick={() => {
              setSearchInput('');
              setSelectedBook('all');
            }}
          >
            Clear All Filters
          </Button>
        </GlassCard>
      )}
    </div>
  );
};

export default Library;
