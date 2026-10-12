import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import { useGameStore } from '../store/useGameStore';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Scroll,
  Flame,
  Compass,
  Shuffle,
  Eye
} from 'lucide-react';

const VEDAS = [
  { id: 'atharva', name: 'Atharvaveda', element: '🌿 Prithvi', glyph: 'अथर्व', desc: 'Medicine, Healing, Society & Daily Mysticism', color: '#10B981' },
  { id: 'rig', name: 'Rigveda', element: '🔥 Agni', glyph: 'ऋक्', desc: 'Cosmic Mantras, Divine Vision & Solar Radiance', color: '#F59E0B' },
  { id: 'sama', name: 'Samaveda', element: '🌊 Soma', glyph: 'सामन्', desc: 'Sonic Harmonics & Ecstatic Melodies of Transcendence', color: '#3B82F6' },
  { id: 'yajur', name: 'Yajurveda', element: '💨 Vayu', glyph: 'यजुस्', desc: 'Inner Sacrificial Alchemy & Practical Discipline', color: '#EC4899' }
];

const SUKTAS_DB = {
  atharva: [
    { book: 12, hymn: 1, title: 'Prithvi Sukta (Ode to Mother Earth)', verses: 63, tag: 'Ecology & Sacred Soil' },
    { book: 1, hymn: 1, title: 'Medha Sukta (Prayer for Divine Intellect)', verses: 4, tag: 'Mind Expansion' },
    { book: 9, hymn: 2, title: 'Kama Sukta (The Primordial Desire)', verses: 25, tag: 'Cosmic Creation' },
    { book: 19, hymn: 53, title: 'Kala Sukta (The Mystery of Cosmic Time)', verses: 10, tag: 'Eternity & Time' },
    { book: 11, hymn: 4, title: 'Prana Sukta (Hymn to Universal Life Breath)', verses: 26, tag: 'Vital Force' }
  ],
  rig: [
    { book: 1, hymn: 1, title: 'Agni Sukta (Cosmic Flame of Aspiration)', verses: 9, tag: 'Divine Will' },
    { book: 10, hymn: 129, title: 'Nasadiya Sukta (The Hymn of Creation)', verses: 7, tag: 'Cosmology' },
    { book: 10, hymn: 90, title: 'Purusha Sukta (The Universal Cosmic Being)', verses: 16, tag: 'Universal Form' },
    { book: 3, hymn: 62, title: 'Gayatri Sukta (Invocation of Savita)', verses: 18, tag: 'Illumination' },
    { book: 10, hymn: 191, title: 'Samjnana Sukta (Hymn of Unity & Concord)', verses: 4, tag: 'Human Brotherhood' }
  ],
  sama: [
    { book: 1, hymn: 1, title: 'Purvarchika (Invocation to Agni and Indra)', verses: 10, tag: 'Rhythmic Chant' },
    { book: 2, hymn: 1, title: 'Uttararchika (Songs of Soma & Ecstasy)', verses: 12, tag: 'Melodic Joy' },
    { book: 1, hymn: 4, title: 'Maha-Namni (The Great Sacred Names)', verses: 8, tag: 'Sonic Transcendence' }
  ],
  yajur: [
    { book: 40, hymn: 1, title: 'Isha Upanishad (The All-Pervading One)', verses: 18, tag: 'Non-Duality' },
    { book: 31, hymn: 1, title: 'Purusha Medha (Cosmic Consciousness)', verses: 22, tag: 'Inner Dedication' },
    { book: 1, hymn: 1, title: 'Prarthana (Prayers for Energy & Strength)', verses: 14, tag: 'Vitality' }
  ]
};

const SECRET_SHLOKAS = [
  { veda: 'atharva', title: 'Ayurvardhana Mantra (Life Extension)', quote: 'शतं जीव शरदो वर्धमानः शतं हेमन्ताञ्छतमु वसन्तान् |' },
  { veda: 'rig', title: 'Maha Mrityunjaya (Victory over Mortality)', quote: 'त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् | उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात् ||' },
  { veda: 'sama', title: 'Soma Pavamana (Purifying Nectar)', quote: 'पवस्व सोम मन्दयन्निन्द्राय मधुमत्तमः |' }
];

const Library = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialVeda = searchParams.get('veda') || 'atharva';
  
  const [activeVeda, setActiveVeda] = useState(initialVeda);
  const [searchQuery, setSearchQuery] = useState('');
  const [excavatedShloka, setExcavatedShloka] = useState(null);

  const addRp = useGameStore(state => state.addRp);

  useEffect(() => {
    const v = searchParams.get('veda');
    if (v && v !== activeVeda) setActiveVeda(v);
  }, [searchParams]);

  const handleVedaChange = (vedaId) => {
    sounds.playTibetanBowl();
    setActiveVeda(vedaId);
    setSearchParams({ veda: vedaId });
  };

  const handleExcavate = () => {
    sounds.playUnlockChime();
    const random = SECRET_SHLOKAS[Math.floor(Math.random() * SECRET_SHLOKAS.length)];
    setExcavatedShloka(random);
    addRp(75);
  };

  const currentVedaObj = VEDAS.find(v => v.id === activeVeda) || VEDAS[0];
  const suktas = SUKTAS_DB[activeVeda] || [];
  const filteredSuktas = suktas.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `Book ${s.book} Hymn ${s.hymn}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="akshara-vault">
      {/* Vault Header */}
      <div className="library-header">
        <div className="vault-badge">
          <BookOpen size={16} className="gold-accent" />
          <span>THE AKSHARA ARCHIVES • 10,000+ SUTRAS</span>
        </div>
        <h1>The Palm-Leaf Grimoire</h1>
        <p className="vault-sub">
          Inspect original birch-bark and palm-leaf manuscripts containing unbroken oral transmissions.
        </p>

        {/* Elemental Rune Switcher Bar */}
        <div className="elemental-rune-bar">
          {VEDAS.map((v) => (
            <button
              key={v.id}
              className={`rune-btn ${activeVeda === v.id ? 'active' : ''}`}
              onClick={() => handleVedaChange(v.id)}
            >
              <span className="rune-glyph">{v.glyph}</span>
              <span>{v.name}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({v.element})</span>
            </button>
          ))}
        </div>

        {/* Search & Excavation Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
          <div className="search-bar-wrap" style={{ flex: 1, minWidth: '280px' }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={`Search ${currentVedaObj.name} manuscripts by hymn, book, or concept...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            className="secondary-cta-btn"
            onClick={handleExcavate}
            title="Excavate a hidden uncatalogued shloka"
          >
            <Shuffle size={16} />
            <span>Excavate Hidden Mantra (+75 RP)</span>
          </button>
        </div>
      </div>

      {/* Excavated Secret Box */}
      {excavatedShloka && (
        <div className="combat-log-banner" style={{ borderLeftColor: '#00F0FF', background: 'rgba(0, 240, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#00F0FF', fontWeight: 800, fontSize: '0.75rem' }}>
                🌟 UNCHARTED MANUSCRIPT EXCAVATED: {excavatedShloka.title}
              </span>
              <p style={{ fontFamily: 'Noto Sans Devanagari, serif', fontSize: '1.15rem', color: '#FFF', margin: '6px 0' }}>
                {excavatedShloka.quote}
              </p>
            </div>
            <button 
              className="rune-btn" 
              onClick={() => navigate(`/library?veda=${excavatedShloka.veda}`)}
            >
              Study
            </button>
          </div>
        </div>
      )}

      {/* Palm-Leaf Folio Cards Grid */}
      <div className="suktas-grid">
        {filteredSuktas.map((sukta) => (
          <div
            key={`${sukta.book}-${sukta.hymn}`}
            className="palm-folio-card"
            onClick={() => {
              sounds.playUnlockChime();
              navigate(`/verse/${sukta.book}/${sukta.hymn}/1?veda=${activeVeda}`);
            }}
          >
            <div className="leaf-border-stitch" />
            
            <div className="sukta-card-meta">
              <span className="sukta-coord">Book {sukta.book} • Sukta {sukta.hymn}</span>
              <span className="sukta-verses-tag" style={{ color: currentVedaObj.color, borderColor: currentVedaObj.color }}>
                {sukta.tag}
              </span>
            </div>

            <h3 className="sukta-card-title" style={{ margin: '14px 0 20px' }}>
              {sukta.title}
            </h3>

            <div className="sukta-card-footer">
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{sukta.verses} Sacred Verses</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFE259', fontWeight: 700, fontSize: '0.85rem' }}>
                <span>Unroll Scroll</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
