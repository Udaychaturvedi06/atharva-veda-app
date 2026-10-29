import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Book, Sparkles, Trophy, Settings, Terminal, Gamepad2, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

const COMMANDS = [
  { id: 'dash', title: 'Sanctuary (Home)', category: 'Navigation', path: '/dashboard', icon: Sparkles },
  { id: 'path', title: 'Pada Spiral (Learning Path)', category: 'Navigation', path: '/path', icon: ArrowRight },
  { id: 'library', title: 'Veda Library & Manuscripts', category: 'Navigation', path: '/library', icon: Book },
  { id: 'arcade', title: 'Arcade Hub & Retro Realms', category: 'Navigation', path: '/arcade', icon: Gamepad2 },
  { id: 'svara', title: 'Svara Strike (Rhythm & Pitch)', category: 'Arcade', path: '/arcade/svara', icon: Gamepad2 },
  { id: 'sandhi', title: 'Sandhi Smash (Compounds)', category: 'Arcade', path: '/arcade/sandhi', icon: Gamepad2 },
  { id: 'chandas', title: 'Chandas Craft (Meter Blocks)', category: 'Arcade', path: '/arcade/chandas', icon: Gamepad2 },
  { id: 'campaign', title: 'Inner Trials (Arishadvarga)', category: 'Campaign', path: '/campaign', icon: Trophy },
  { id: 'chat', title: 'Rishi AI (Council of Seers)', category: 'Spiritual AI', path: '/chat', icon: Terminal },
  { id: 'rankings', title: 'Sangha Leagues & Rankings', category: 'Community', path: '/rankings', icon: Trophy },
  { id: 'settings', title: 'Sanctum Settings & Altar', category: 'Configuration', path: '/settings', icon: Settings }
];

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();

  const filtered = COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        sounds.playHover();
        setSelectedIdx((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        sounds.playHover();
        setSelectedIdx((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter' && filtered[selectedIdx]) {
        e.preventDefault();
        sounds.playSuccess();
        navigate(filtered[selectedIdx].path);
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIdx, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 5, 10, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '15vh',
          zIndex: 100000
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 580,
            background: 'rgba(15, 13, 24, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(212, 175, 55, 0.15)',
            overflow: 'hidden'
          }}
        >
          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              gap: 12
            }}
          >
            <Search size={20} color="var(--gold)" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Seek hymns, verses, arcade games, or pages (Ctrl+K)..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-0)',
                fontFamily: 'var(--font-body)',
                fontSize: '1.05rem',
                outline: 'none'
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-2)'
              }}
            >
              ESC
            </span>
          </div>

          {/* Results list */}
          <div style={{ maxHeight: 340, overflowY: 'auto', padding: '8px 0' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-2)' }}>
                No sacred realms found matching &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isSelected = idx === selectedIdx;
                const Icon = item.icon;
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
                      background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '3px solid var(--gold)' : '3px solid transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? 'var(--gold-bright)' : 'var(--text-2)'
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ color: isSelected ? 'var(--text-0)' : 'var(--text-1)', fontWeight: 500, fontSize: '0.95rem' }}>
                          {item.title}
                        </div>
                        <div style={{ color: 'var(--text-2)', fontSize: '0.75rem' }}>
                          {item.category}
                        </div>
                      </div>
                    </div>
                    {isSelected && <ArrowRight size={16} color="var(--gold)" />}
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
