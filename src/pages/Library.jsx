import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Shuffle
} from 'lucide-react';

const VEDAS = [
  { id: 'atharva', name: 'Atharvaveda', count: '730 Suktas', color: '#10B981', desc: 'Healing, Society, and Practical Mysticism' },
  { id: 'rig', name: 'Rigveda', count: '1,028 Suktas', color: '#F59E0B', desc: 'Cosmic Chants and Solar Revelations' },
  { id: 'sama', name: 'Samaveda', count: '1,875 Mantras', color: '#3B82F6', desc: 'Transcendent Harmonic Melodies' },
  { id: 'yajur', name: 'Yajurveda', count: '1,975 Shlokas', color: '#EC4899', desc: 'Alchemical Rituals of Inner Sacrifice' }
];

const SUKTAS_DB = {
  atharva: [
    { book: 12, hymn: 1, title: 'Prithvi Sukta (Ode to Mother Earth)', verses: 63, tag: 'Sacred Soil' },
    { book: 1, hymn: 1, title: 'Medha Sukta (Prayer for Divine Intellect)', verses: 4, tag: 'Mind Clarity' },
    { book: 9, hymn: 2, title: 'Kama Sukta (Primordial Cosmic Desire)', verses: 25, tag: 'Creation' },
    { book: 19, hymn: 53, title: 'Kala Sukta (The Mystery of Cosmic Time)', verses: 10, tag: 'Eternity' },
    { book: 11, hymn: 4, title: 'Prana Sukta (Hymn to Universal Life Breath)', verses: 26, tag: 'Vital Force' }
  ],
  rig: [
    { book: 1, hymn: 1, title: 'Agni Sukta (Cosmic Flame of Aspiration)', verses: 9, tag: 'Divine Will' },
    { book: 10, hymn: 129, title: 'Nasadiya Sukta (The Hymn of Creation)', verses: 7, tag: 'Cosmology' },
    { book: 10, hymn: 90, title: 'Purusha Sukta (The Universal Cosmic Being)', verses: 16, tag: 'Cosmic Form' },
    { book: 3, hymn: 62, title: 'Gayatri Sukta (Invocation of Savita)', verses: 18, tag: 'Illumination' },
    { book: 10, hymn: 191, title: 'Samjnana Sukta (Hymn of Unity & Concord)', verses: 4, tag: 'Harmony' }
  ],
  sama: [
    { book: 1, hymn: 1, title: 'Purvarchika (Invocation to Agni and Indra)', verses: 10, tag: 'Rhythmic Chant' },
    { book: 2, hymn: 1, title: 'Uttararchika (Songs of Soma & Ecstasy)', verses: 12, tag: 'Melodic Joy' },
    { book: 1, hymn: 4, title: 'Maha-Namni (The Great Sacred Names)', verses: 8, tag: 'Transcendence' }
  ],
  yajur: [
    { book: 40, hymn: 1, title: 'Isha Upanishad (The All-Pervading Divine)', verses: 18, tag: 'Non-Duality' },
    { book: 31, hymn: 1, title: 'Purusha Medha (Cosmic Consciousness)', verses: 22, tag: 'Inner Dedication' },
    { book: 1, hymn: 1, title: 'Prarthana (Prayers for Energy & Strength)', verses: 14, tag: 'Vitality' }
  ]
};

const Library = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialVeda = searchParams.get('veda') || 'atharva';
  
  const [activeVeda, setActiveVeda] = useState(initialVeda);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const v = searchParams.get('veda');
    if (v && v !== activeVeda) setActiveVeda(v);
  }, [searchParams]);

  const handleVedaChange = (vedaId) => {
    sounds.playTibetanBowl();
    setActiveVeda(vedaId);
    setSearchParams({ veda: vedaId });
  };

  const suktas = SUKTAS_DB[activeVeda] || [];
  const filteredSuktas = suktas.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `Book ${s.book} Hymn ${s.hymn}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div className="badge gold" style={{ marginBottom: '8px' }}>
          <BookOpen size={13} />
          <span>Scripture Archives</span>
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#FFF', margin: '4px 0 8px' }}>
          The Four Sacred Vedas
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
          Explore thousands of verses preserved across millennia with authentic word-by-word breakdowns.
        </p>
      </div>

      {/* Veda Switcher Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {VEDAS.map((v) => (
          <button
            key={v.id}
            className="glass-panel"
            style={{
              padding: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              borderColor: activeVeda === v.id ? '#FFE259' : 'var(--glass-border)',
              background: activeVeda === v.id ? 'rgba(212, 175, 55, 0.1)' : 'var(--glass-bg)',
              boxShadow: activeVeda === v.id ? '0 0 20px rgba(212, 175, 55, 0.2)' : 'none'
            }}
            onClick={() => handleVedaChange(v.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#FFF', fontSize: '1rem' }}>{v.name}</span>
              <span style={{ fontSize: '0.75rem', color: v.color, fontWeight: 700 }}>{v.count}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '6px 0 0', lineHeight: '1.4' }}>
              {v.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} style={{ color: '#94A3B8' }} />
        <input 
          type="text" 
          placeholder={`Search ${activeVeda.toUpperCase()} Veda by hymn, book number, or theme...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1, background: 'none', border: 'none', color: '#FFF', fontSize: '0.95rem', outline: 'none'
          }}
        />
      </div>

      {/* Suktas Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredSuktas.map((sukta) => (
          <div
            key={`${sukta.book}-${sukta.hymn}`}
            className="glass-panel"
            style={{ padding: '22px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onClick={() => {
              sounds.playUnlockChime();
              navigate(`/verse/${sukta.book}/${sukta.hymn}/1?veda=${activeVeda}`);
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'Orbitron, monospace' }}>
                  Book {sukta.book} • Sukta {sukta.hymn}
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#FFE259' }}>
                  {sukta.tag}
                </span>
              </div>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.15rem', color: '#FFF', margin: '12px 0 8px' }}>
                {sukta.title}
              </h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{sukta.verses} Sacred Mantras</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFE259', fontSize: '0.8rem', fontWeight: 700 }}>
                <span>Study</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
