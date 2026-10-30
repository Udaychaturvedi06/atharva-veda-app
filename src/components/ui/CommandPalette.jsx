import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Book, Sparkles, Trophy, Settings, Terminal, Gamepad2, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';
import { dataAccess } from '../../services/dataAccess';

const COMMANDS = [
  { id: 'dash', title: 'Sanctuary (Home)', category: 'Navigation', path: '/dashboard', icon: Sparkles },
  { id: 'library', title: 'Manuscripts Archive & Four Vedas', category: 'Navigation', path: '/library', icon: Book },
  { id: 'path', title: 'Pada Spiral (Living Path)', category: 'Navigation', path: '/path', icon: ArrowRight },
  { id: 'arcade', title: 'Arcade Hub & Vedic Mini-Games', category: 'Navigation', path: '/arcade', icon: Gamepad2 },
  { id: 'svara', title: 'Svara Strike (Rhythm & Svara)', category: 'Arcade', path: '/arcade/svara', icon: Gamepad2 },
  { id: 'sandhi', title: 'Sandhi Smash (Compounds)', category: 'Arcade', path: '/arcade/sandhi', icon: Gamepad2 },
  { id: 'chandas', title: 'Chandas Craft (Meter Blocks)', category: 'Arcade', path: '/arcade/chandas', icon: Gamepad2 },
  { id: 'campaign', title: 'Inner Trials (Ariṣaḍvarga)', category: 'Contemplation', path: '/campaign', icon: Trophy },
  { id: 'chat', title: 'Rishi AI (Philosophical Council)', category: 'Hermeneutic AI', path: '/chat', icon: Terminal },
  { id: 'rankings', title: 'Sangha Leagues & Community', category: 'Community', path: '/rankings', icon: Trophy },
  { id: 'settings', title: 'Sanctum Settings & Altar', category: 'Configuration', path: '/settings', icon: Settings }
];

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();

  // Combine static navigation routes with live scriptural manuscript search
  const combinedResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    // 1. Filter navigation commands
    const navResults = COMMANDS.filter((cmd) =>
      cmd.title.toLowerCase().includes(cleanQuery) ||
      cmd.category.toLowerCase().includes(cleanQuery)
    );

    if (!cleanQuery) return navResults;

    // 2. Query canonical manuscripts database
    const manuscriptMatches = dataAccess.searchManuscripts(cleanQuery).map((m) => ({
      id: `manuscript-${m.id}`,
      title: `${m.title} (${m.veda.toUpperCase()} ${m.book}.${m.hymn})`,
      category: 'Manuscripts (Living Archive)',
      path: `/verse/${m.book}/${m.hymn}/${m.verse || 1}?veda=${m.veda}`,
      icon: Book,
      snippet: m.sanskrit
    }));

    // If query looks like a coordinate ("12.1", "1.1", "12.1.1"), place manuscript results first
    const isCoordQuery = /^(\d+)[.\s-](\d+)/.test(cleanQuery);
    return isCoordQuery
      ? [...manuscriptMatches, ...navResults]
      : [...manuscriptMatches.slice(0, 5), ...navResults];
  }, [query]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        sounds.playHover();
        setSelectedIdx((prev) => (prev + 1) % (combinedResults.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        sounds.playHover();
        setSelectedIdx((prev) => (prev - 1 + (combinedResults.length || 1)) % (combinedResults.length || 1));
      } else if (e.key === 'Enter' && combinedResults[selectedIdx]) {
        e.preventDefault();
        sounds.playSuccess();
        navigate(combinedResults[selectedIdx].path);
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, combinedResults, selectedIdx, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 11, 10, 0.78)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '14vh',
          zIndex: 100000
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 620,
            background: 'rgba(22, 23, 21, 0.96)',
            border: '1px solid var(--border-subtle, rgba(213, 211, 203, 0.18))',
            borderRadius: 14,
            boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 0 40px rgba(197, 154, 86, 0.12)',
            overflow: 'hidden'
          }}
        >
          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(213, 211, 203, 0.08)',
              gap: 12
            }}
          >
            <Search size={20} color="var(--amber-warm, #C59A56)" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hymns (e.g. 12.1.1, Prithvi, Peace), arcade, or pages..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--silver-moon, #D5D3CB)',
                fontFamily: 'var(--font-body, serif)',
                fontSize: '1.05rem',
                outline: 'none'
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--silver-muted, #94A3B8)',
                fontWeight: 600
              }}
            >
              ESC
            </span>
          </div>

          {/* Results list */}
          <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
            {combinedResults.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--silver-muted, #94A3B8)' }}>
                No scriptural verses or destinations found matching &quot;{query}&quot;
              </div>
            ) : (
              combinedResults.map((item, idx) => {
                const isSelected = idx === selectedIdx;
                const Icon = item.icon;
                const isManuscript = item.category.startsWith('Manuscripts');

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      sounds.playSuccess();
                      navigate(item.path);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      background: isSelected ? 'rgba(197, 154, 86, 0.16)' : 'transparent',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '3px solid var(--amber-warm, #C59A56)' : '3px solid transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(197, 154, 86, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? 'var(--amber-warm, #C59A56)' : 'var(--silver-muted, #94A3B8)',
                          flexShrink: 0
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          color: isSelected ? '#FFFFFF' : 'var(--silver-moon, #D5D3CB)',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.title}
                        </div>
                        <div style={{ color: isManuscript ? 'var(--amber-warm, #C59A56)' : 'var(--silver-muted, #94A3B8)', fontSize: '0.75rem' }}>
                          {item.category} {item.snippet ? `• ${item.snippet.slice(0, 36)}...` : ''}
                        </div>
                      </div>
                    </div>
                    {isSelected && <ArrowRight size={16} color="var(--amber-warm, #C59A56)" style={{ flexShrink: 0, marginLeft: 10 }} />}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
