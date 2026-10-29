import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, BookOpen, Lock, CheckCircle2, Play, Trophy, X, List, Eye } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { sounds } from '../utils/soundEngine';
import LessonPlayer from '../learning/LessonPlayer';
import { buildSession } from '../learning/sessionBuilder';

const SPIRAL_NODES = Array.from({ length: 48 }, (_, i) => {
  const nodeNum = i + 1;
  const isMastered = nodeNum <= 6;
  const isCurrent = nodeNum === 7;
  const isLocked = nodeNum > 7;

  const themes = ['Agni (Sacred Fire)', 'Prithvi (Mother Earth)', 'Apas (Cosmic Waters)', 'Vayu (Life Breath)', 'Akasha (Ether)', 'Brahman (Truth)'];
  const theme = themes[i % themes.length];

  // Spiral geometry: polar coordinates r = a * theta
  const theta = i * 0.45;
  const r = 40 + i * 16;
  const x = Math.cos(theta) * r;
  const y = Math.sin(theta) * r;

  return {
    id: `node-${nodeNum}`,
    num: nodeNum,
    title: `Sutra ${nodeNum}: ${theme}`,
    theme,
    type: nodeNum % 8 === 0 ? 'boss' : nodeNum % 4 === 0 ? 'review' : 'lesson',
    isMastered,
    isCurrent,
    isLocked,
    x,
    y
  };
});

export const PadaSpiral = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [viewMode, setViewMode] = useState('spiral'); // 'spiral' or 'list'

  const handleNodeClick = (node) => {
    if (node.isLocked) {
      sounds.playError();
      return;
    }
    sounds.playTap();
    setSelectedNode(node);
  };

  const startLesson = () => {
    sounds.playSuccess();
    const session = buildSession({ minutes: 5 });
    setActiveSession(session);
    setSelectedNode(null);
  };

  return (
    <div style={{ padding: '24px 16px 100px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--gold-bright)', margin: 0 }}>
            The Pada Spiral
          </h1>
          <p style={{ color: 'var(--text-1)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            A continuous mandala path threading through all four Vedas
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            size="sm"
            variant={viewMode === 'spiral' ? 'primary' : 'ghost'}
            icon={<Eye size={14} />}
            onClick={() => setViewMode('spiral')}
          >
            Spiral Mandala
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            icon={<List size={14} />}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>
      </div>

      {viewMode === 'spiral' ? (
        /* 2D / 3D Canvas Spiral Map */
        <div
          style={{
            height: '70vh',
            minHeight: 520,
            background: 'rgba(11, 10, 20, 0.6)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            position: 'relative',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Spiral Center Viewport */}
          <div style={{ position: 'relative', width: 900, height: 900, transform: 'scale(0.85)' }}>
            {/* SVG Connecting Thread */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <path
                d={SPIRAL_NODES.map((n, i) => `${i === 0 ? 'M' : 'L'} ${450 + n.x} ${450 + n.y}`).join(' ')}
                fill="none"
                stroke="rgba(212, 175, 55, 0.3)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Nodes */}
            {SPIRAL_NODES.map((node) => {
              const posX = 450 + node.x;
              const posY = 450 + node.y;

              return (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => !node.isLocked && sounds.playHover()}
                  style={{
                    position: 'absolute',
                    left: posX - 22,
                    top: posY - 22,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: node.isMastered
                      ? 'rgba(212, 175, 55, 0.25)'
                      : node.isCurrent
                      ? 'rgba(0, 240, 255, 0.3)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: node.isMastered
                      ? '2px solid var(--gold)'
                      : node.isCurrent
                      ? '2px solid var(--cyan)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    color: node.isMastered ? 'var(--gold-bright)' : node.isCurrent ? 'var(--cyan)' : 'var(--text-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: node.isLocked ? 'not-allowed' : 'pointer',
                    boxShadow: node.isCurrent
                      ? '0 0 16px var(--cyan)'
                      : node.isMastered
                      ? '0 0 10px rgba(212, 175, 55, 0.4)'
                      : 'none',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  {node.isMastered ? (
                    <CheckCircle2 size={18} />
                  ) : node.isCurrent ? (
                    <Play size={16} />
                  ) : node.isLocked ? (
                    <Lock size={14} />
                  ) : (
                    node.num
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Accessible List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SPIRAL_NODES.map((node) => (
            <GlassCard
              key={node.id}
              elevation={1}
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: node.isLocked ? 0.5 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: node.isMastered ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                    color: node.isMastered ? '#000' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  {node.num}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-0)' }}>{node.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{node.theme}</div>
                </div>
              </div>

              {!node.isLocked ? (
                <Button size="sm" variant={node.isCurrent ? 'primary' : 'ghost'} onClick={() => handleNodeClick(node)}>
                  {node.isMastered ? 'Review' : 'Continue'}
                </Button>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={14} /> Locked
                </span>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Node Preview Bottom Sheet */}
      <AnimatePresence>
        {selectedNode && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(10px)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16
            }}
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 440,
                background: 'rgba(15, 13, 24, 0.95)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Chip label={`Node ${selectedNode.num}`} variant="gold" />
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold-bright)', margin: '0 0 8px' }}>
                {selectedNode.title}
              </h3>
              <p style={{ color: 'var(--text-1)', fontSize: '0.9rem', marginBottom: 20 }}>
                Immerse your consciousness in the metric cadence and esoteric wisdom of this Vedic pada.
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="primary" icon={<Play size={16} />} onClick={startLesson}>
                  Begin Chant Practice
                </Button>
                <Button variant="ghost" onClick={() => setSelectedNode(null)}>
                  Contemplate
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Active Lesson Modal */}
      {activeSession && (
        <LessonPlayer
          session={activeSession}
          onClose={() => setActiveSession(null)}
          onComplete={() => setActiveSession(null)}
        />
      )}
    </div>
  );
};

export default PadaSpiral;
