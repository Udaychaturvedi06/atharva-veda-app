import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/soundEngine';
import { dataAccess } from '../services/dataAccess';
import {
  BookOpen,
  Search,
  ChevronRight,
  Filter,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Compass,
  ArrowRight,
  Bookmark,
  Layers
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

export const Library = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentParamVeda = searchParams.get('veda') || 'atharva';

  const [activeVeda, setActiveVeda] = useState(currentParamVeda);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState('all');

  // Division browser state
  const [activeDivision, setActiveDivision] = useState(1);
  const [divisionSuktas, setDivisionSuktas] = useState([]);
  const [loadingDivision, setLoadingDivision] = useState(false);

  // Continue Reading state
  const [lastRead] = useState(() => {
    try {
      const raw = localStorage.getItem('sutra_last_read');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Vedas catalog from single data access layer
  const vedas = useMemo(() => dataAccess.getAllVedas(), []);

  // Sync state if URL search params change
  useEffect(() => {
    const v = searchParams.get('veda');
    if (v && v !== activeVeda && dataAccess.getVeda(v)) {
      setActiveVeda(v);
      setActiveDivision(1);
    }
  }, [searchParams, activeVeda]);

  // Debounce search input by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleVedaChange = (vedaId) => {
    sounds.playTap();
    setActiveVeda(vedaId);
    setActiveDivision(1);
    setSelectedBook('all');
    setSelectedTheme('all');
    setSearchParams({ veda: vedaId });
  };

  // Load division partition when active Veda or active division changes
  useEffect(() => {
    let isMounted = true;
    setLoadingDivision(true);

    dataAccess.loadDivision(activeVeda, activeDivision).then((data) => {
      if (!isMounted) return;
      setLoadingDivision(false);
      if (Array.isArray(data)) {
        setDivisionSuktas(data);
      } else {
        setDivisionSuktas([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeVeda, activeDivision]);

  // Available books/divisions for current Veda
  const availableBooks = useMemo(() => {
    return dataAccess.getAvailableBooks(activeVeda);
  }, [activeVeda]);

  const allThemes = useMemo(() => {
    return ['All', ...dataAccess.getAllThemes()];
  }, []);

  // Filtered Suktas through data access multi-vocal search
  const filteredSuktas = useMemo(() => {
    return dataAccess.searchManuscripts(debouncedQuery, {
      veda: activeVeda,
      book: selectedBook,
      theme: selectedTheme
    });
  }, [activeVeda, selectedBook, selectedTheme, debouncedQuery]);

  const currentVedaMeta = useMemo(() => {
    return dataAccess.getVeda(activeVeda);
  }, [activeVeda]);

  const divisionLabel = activeVeda === 'rig' ? 'Maṇḍala' : activeVeda === 'atharva' ? 'Kāṇḍa' : activeVeda === 'yajur' ? 'Adhyāya' : 'Ārcika';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 120px' }}>
      {/* 1. ARCHIVAL HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--amber-warm, #C59A56)', marginBottom: 8 }}>
          <BookOpen size={16} />
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
            Complete Four Vedas Digital Library
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display, Cinzel)',
          fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
          color: 'var(--silver-moon, #D5D3CB)',
          margin: '0 0 10px',
          fontWeight: 700,
          letterSpacing: '0.02em'
        }}>
          The Four Vedas: Rig, Yajur, Sama & Atharva
        </h1>
        <p style={{
          color: 'var(--silver-muted, #94A3B8)',
          fontSize: '0.98rem',
          maxWidth: 760,
          lineHeight: 1.6,
          margin: 0
        }}>
          A complete, searchable digital archive of <strong>20,081 canonical mantras</strong> across all four Vedas with authentic Devanagari svara accents, IAST transliteration, and text-to-speech recitation.
        </p>
      </div>

      {/* 2. CONTINUE READING RESUME BANNER */}
      {lastRead && (
        <div style={{
          background: 'rgba(197, 154, 86, 0.1)',
          border: '1px solid rgba(197, 154, 86, 0.25)',
          borderRadius: 12,
          padding: '12px 18px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bookmark size={18} color="var(--amber-warm, #C59A56)" />
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--amber-warm, #C59A56)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Continue Reading
              </span>
              <div style={{ fontSize: '0.92rem', color: 'var(--silver-moon, #D5D3CB)', fontWeight: 600 }}>
                {lastRead.title} &bull; <span style={{ color: 'var(--silver-muted, #94A3B8)' }}>{lastRead.veda} ({lastRead.ref})</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon={<ArrowRight size={14} />}
            onClick={() => {
              sounds.playTap();
              navigate(`/verse/${lastRead.book}/${lastRead.hymn}/${lastRead.verse}?veda=${lastRead.veda}`);
            }}
          >
            Resume Verse
          </Button>
        </div>
      )}

      {/* 3. FOUR VEDA ARCHIVAL PORTALS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
        marginBottom: 28
      }}>
        {vedas.map((v) => {
          const isActive = activeVeda === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => handleVedaChange(v.id)}
              style={{
                background: isActive ? 'rgba(22, 23, 21, 0.95)' : 'rgba(16, 17, 15, 0.65)',
                border: '1px solid ' + (isActive ? 'var(--amber-warm, #C59A56)' : 'rgba(213, 211, 203, 0.12)'),
                borderRadius: 14,
                padding: '20px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(197, 154, 86, 0.12)' : 'none'
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'var(--amber-warm, #C59A56)'
                }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{
                  fontFamily: 'var(--font-display, Cinzel)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: isActive ? '#FFFFFF' : 'var(--silver-moon, #D5D3CB)'
                }}>
                  {v.name}
                </span>
                <span style={{
                  fontFamily: 'var(--font-sanskrit, "Noto Serif Devanagari", serif)',
                  fontSize: '0.95rem',
                  color: 'var(--amber-warm, #C59A56)'
                }}>
                  {v.sanskrit}
                </span>
              </div>

              {/* Recension & Verified Counts */}
              <div style={{ fontSize: '0.75rem', color: 'var(--silver-muted, #94A3B8)', marginBottom: 8, lineHeight: 1.4 }}>
                <strong>{v.recension}</strong> &bull; {v.canonicalScope}
              </div>

              <p style={{
                fontSize: '0.82rem',
                color: 'var(--silver-muted, #94A3B8)',
                lineHeight: 1.5,
                margin: '0 0 12px',
                height: 38,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {v.desc}
              </p>

              {/* Honest Archival Inventory Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: 4,
                background: 'rgba(135, 148, 122, 0.16)',
                border: '1px solid rgba(135, 148, 122, 0.35)',
                color: 'var(--sage-soft, #87947A)',
                fontWeight: 600
              }}>
                <ShieldCheck size={12} />
                {v.archivalCount.toLocaleString()} Ingested Mantras
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. MULTI-STRATEGY SEARCH & FILTERS BAR */}
      <GlassCard elevation={2} style={{
        padding: '16px 20px',
        marginBottom: 24,
        background: 'rgba(22, 23, 21, 0.92)',
        border: '1px solid var(--border-subtle, rgba(213, 211, 203, 0.14))',
        borderRadius: 14
      }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{
            flex: '1 1 300px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(10, 11, 10, 0.6)',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid rgba(213, 211, 203, 0.12)'
          }}>
            <Search size={18} color="var(--amber-warm, #C59A56)" />
            <input
              type="text"
              placeholder={`Search across ${currentVedaMeta.name} by Devanagari (सत्यं), English, or Ref (12.1.1)...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--silver-moon, #D5D3CB)',
                fontFamily: 'var(--font-body, serif)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                style={{ background: 'none', border: 'none', color: 'var(--silver-muted, #94A3B8)', cursor: 'pointer', padding: 2 }}
                title="Clear Search"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>

          {/* Book / Kāṇḍa / Maṇḍala Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(10, 11, 10, 0.6)',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid rgba(213, 211, 203, 0.12)'
          }}>
            <Filter size={15} color="var(--amber-warm, #C59A56)" />
            <select
              value={selectedBook}
              onChange={(e) => {
                sounds.playTap();
                setSelectedBook(e.target.value);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--silver-moon, #D5D3CB)',
                fontFamily: 'var(--font-body, serif)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all" style={{ background: '#161715' }}>All {divisionLabel}s</option>
              {availableBooks.map((b) => (
                <option key={b} value={b.toString()} style={{ background: '#161715' }}>
                  {divisionLabel} {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* 5. DIVISION EXPLORER TABS (MANDALAS / KANDAS / ADHYAYAS) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--amber-warm, #C59A56)', fontWeight: 600 }}>
            <Layers size={16} /> Browse {currentVedaMeta.name} {divisionLabel}s
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--silver-muted, #94A3B8)' }}>
            Select a division to inspect complete hymns and mantras
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'thin'
        }}>
          {availableBooks.map((dNum) => {
            const isSelected = activeDivision === dNum;
            return (
              <button
                key={dNum}
                onClick={() => {
                  sounds.playTap();
                  setActiveDivision(dNum);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  background: isSelected ? 'rgba(197, 154, 86, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid ' + (isSelected ? 'var(--amber-warm, #C59A56)' : 'rgba(213, 211, 203, 0.1)'),
                  color: isSelected ? 'var(--amber-warm, #C59A56)' : 'var(--silver-moon, #D5D3CB)',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {divisionLabel} {dNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. HYMNS IN CURRENT DIVISION LISTING */}
      {divisionSuktas.length > 0 && !debouncedQuery && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{
              fontFamily: 'var(--font-display, Cinzel)',
              fontSize: '1.15rem',
              color: 'var(--silver-moon, #D5D3CB)',
              margin: 0
            }}>
              {currentVedaMeta.name} &bull; {divisionLabel} {activeDivision} ({divisionSuktas.length} {activeVeda === 'yajur' ? 'Adhyāyas' : 'Sūktas'})
            </h3>
            {loadingDivision && (
              <span style={{ fontSize: '0.75rem', color: 'var(--amber-warm, #C59A56)' }}>
                Loading division partition...
              </span>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16
          }}>
            {divisionSuktas.slice(0, 18).map((sukta, sIdx) => {
              const suktaNum = sukta.sukta || sukta.adhyaya || (sIdx + 1);
              const titleText = sukta.title || (sukta.deity ? `${sukta.deity} Sūkta` : `${divisionLabel} ${activeDivision} Sūkta ${suktaNum}`);
              const firstVerse = sukta.verses?.[0];
              const previewText = firstVerse ? (firstVerse.displayText || firstVerse.accentedText || '') : (sukta.translation || '');

              return (
                <div
                  key={sukta.id || sIdx}
                  onClick={() => {
                    sounds.playTap();
                    navigate(`/verse/${activeDivision}/${suktaNum}/1?veda=${activeVeda}`);
                  }}
                  style={{
                    background: 'rgba(22, 23, 21, 0.88)',
                    border: '1px solid rgba(213, 211, 203, 0.12)',
                    borderRadius: 12,
                    padding: 18,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--amber-warm, #C59A56)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(213, 211, 203, 0.12)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Chip variant="gold" label={`${divisionLabel} ${activeDivision}.${suktaNum}`} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--silver-muted, #94A3B8)' }}>
                        {sukta.verseCount || sukta.verses?.length || 1} Mantras
                      </span>
                    </div>

                    <h4 style={{
                      fontFamily: 'var(--font-display, Cinzel)',
                      fontSize: '0.98rem',
                      color: 'var(--silver-moon, #D5D3CB)',
                      margin: '0 0 6px',
                      fontWeight: 600
                    }}>
                      {titleText}
                    </h4>

                    {previewText && (
                      <p style={{
                        fontFamily: firstVerse?.displayText ? 'var(--font-sanskrit, "Noto Serif Devanagari", serif)' : 'var(--font-body, serif)',
                        fontSize: firstVerse?.displayText ? '1.02rem' : '0.85rem',
                        color: firstVerse?.displayText ? 'var(--amber-warm, #C59A56)' : 'var(--silver-muted, #94A3B8)',
                        lineHeight: 1.5,
                        margin: 0,
                        maxHeight: 52,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {previewText}
                      </p>
                    )}
                  </div>

                  <div style={{
                    marginTop: 14,
                    paddingTop: 10,
                    borderTop: '1px solid rgba(213, 211, 203, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--silver-muted, #94A3B8)'
                  }}>
                    <span>{sukta.meter || 'Vedic Meter'}</span>
                    <span style={{ color: 'var(--amber-warm, #C59A56)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                      Read & Recite <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. THEMES & FOUNDATIONAL MANUSCRIPTS SECTION */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{
            fontFamily: 'var(--font-display, Cinzel)',
            fontSize: '1.15rem',
            color: 'var(--silver-moon, #D5D3CB)',
            margin: 0
          }}>
            Cornerstone Hermeneutic Manuscripts ({filteredSuktas.length})
          </h3>
        </div>

        {/* Theme Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--silver-muted, #94A3B8)', display: 'flex', alignItems: 'center', gap: 5, marginRight: 4 }}>
            <Sparkles size={13} color="var(--amber-warm, #C59A56)" /> Themes:
          </span>
          {allThemes.map((t) => {
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
                  borderRadius: 20,
                  background: isAct ? 'rgba(197, 154, 86, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid ' + (isAct ? 'var(--amber-warm, #C59A56)' : 'rgba(213, 211, 203, 0.1)'),
                  color: isAct ? 'var(--amber-warm, #C59A56)' : 'var(--silver-muted, #94A3B8)',
                  fontSize: '0.78rem',
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
      </div>

      {/* 8. CORNERSTONE MANUSCRIPTS GRID */}
      {filteredSuktas.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}>
          <AnimatePresence mode="popLayout">
            {filteredSuktas.map((m) => (
              <motion.div
                key={`${m.veda}-${m.book}-${m.hymn}`}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  onClick={() => {
                    sounds.playTap();
                    navigate(`/verse/${m.book}/${m.hymn}/${m.verse || 1}?veda=${m.veda}`);
                  }}
                  style={{
                    background: 'rgba(22, 23, 21, 0.92)',
                    border: '1px solid var(--border-subtle, rgba(213, 211, 203, 0.14))',
                    borderRadius: 14,
                    padding: 24,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 220,
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--amber-warm, #C59A56)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle, rgba(213, 211, 203, 0.14))';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--amber-warm, #C59A56)', fontWeight: 600 }}>
                        {m.veda.toUpperCase()} &bull; {divisionLabel} {m.book}.{m.hymn}
                      </span>
                      <Chip variant="gold" label={m.tag || 'Sacred Text'} />
                    </div>

                    <h3 style={{
                      fontFamily: 'var(--font-display, Cinzel)',
                      fontSize: '1.15rem',
                      color: 'var(--silver-moon, #D5D3CB)',
                      margin: '0 0 10px',
                      fontWeight: 600
                    }}>
                      {m.title}
                    </h3>

                    <div style={{
                      fontFamily: 'var(--font-sanskrit, "Noto Serif Devanagari", serif)',
                      fontSize: '1.15rem',
                      color: 'var(--amber-warm, #C59A56)',
                      lineHeight: 1.5,
                      marginBottom: 10
                    }}>
                      {m.sanskrit}
                    </div>

                    <p style={{
                      fontSize: '0.88rem',
                      color: 'var(--silver-muted, #94A3B8)',
                      lineHeight: 1.6,
                      margin: 0,
                      fontFamily: 'var(--font-body, serif)'
                    }}>
                      &ldquo;{m.translation}&rdquo;
                    </p>
                  </div>

                  <div style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: '1px solid rgba(213, 211, 203, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    color: 'var(--silver-muted, #94A3B8)'
                  }}>
                    <div>
                      <span>{m.meter}</span> &bull; <span>{m.verses || 1} Verses</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber-warm, #C59A56)', fontWeight: 600 }}>
                      Study in Reader <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: 'rgba(22, 23, 21, 0.85)',
          border: '1px solid var(--border-subtle, rgba(213, 211, 203, 0.12))',
          borderRadius: 16
        }}>
          <BookOpen size={44} color="var(--amber-warm, #C59A56)" style={{ margin: '0 auto 14px', opacity: 0.8 }} />
          <h3 style={{ fontFamily: 'var(--font-display, Cinzel)', color: 'var(--silver-moon, #D5D3CB)', margin: '0 0 10px' }}>
            No Archival Manuscripts Found
          </h3>
          <p style={{ color: 'var(--silver-muted, #94A3B8)', fontSize: '0.92rem', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.6 }}>
            No transcribed hymns matched &ldquo;{debouncedQuery}&rdquo; in {currentVedaMeta.name}. Try a broader concept or consult one of the foundational suktas below.
          </p>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {['Earth', '12.1.1', 'सत्यं', 'Peace', 'Prana'].map((sugg) => (
              <button
                key={sugg}
                onClick={() => {
                  sounds.playTap();
                  setSearchInput(sugg);
                }}
                style={{
                  background: 'rgba(197, 154, 86, 0.15)',
                  border: '1px solid rgba(197, 154, 86, 0.3)',
                  borderRadius: 6,
                  color: 'var(--amber-warm, #C59A56)',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Try &ldquo;{sugg}&rdquo;
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            icon={<RotateCcw size={14} />}
            onClick={() => {
              sounds.playTap();
              setSearchInput('');
              setSelectedBook('all');
              setSelectedTheme('all');
            }}
          >
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Library;
