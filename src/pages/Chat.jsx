import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import { recitationEngine } from '../utils/recitationEngine';
import {
  Send,
  Sparkles,
  ChevronDown,
  BookOpen,
  Volume2,
  Award,
  Shield,
  HelpCircle
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

const RISHI_PERSONAS = [
  { id: 'scholar', name: 'Rishi Shaunaka (The Scholar)', desc: 'Precise grammatical roots, meter structures, and canonical citations.', icon: '📜' },
  { id: 'guide', name: 'Rishi Angiras (The Guide)', desc: 'Inner alchemy, pranayama alignment, and practical meditation.', icon: '🧘' },
  { id: 'storyteller', name: 'Rishi Atharvan (The Storyteller)', desc: 'Mythic lore, cosmological allegories, and ancient history.', icon: '🌌' },
  { id: 'examiner', name: 'Rishi Pippalada (The Examiner)', desc: 'Direct philosophical interrogation and knowledge quizzes.', icon: '⚔️' }
];

const INQUIRY_PRESETS = [
  'What is the esoteric meaning of the Bhumi Sukta in Atharvaveda?',
  'Expound upon "Ekam Sat Vipra Bahudha Vadanti".',
  'How do Vedic chants dissolve mental restlessness (Krodha)?',
  'Explain the metaphysical nature of Agni as the inner fire.'
];

export const Chat = () => {
  const navigate = useNavigate();
  const [selectedPersona, setSelectedPersona] = useState(RISHI_PERSONAS[0]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'ॐ शान्तिः। Welcome, noble seeker, to the Council of Seers. I am ready to illuminate the sacred hymns, the meters, or the conquest of the inner enemies. What question moves within your mind?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollContainerRef = useRef(null);
  const scrollBottomAnchorRef = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollBottomAnchorRef.current) {
      scrollBottomAnchorRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    sounds.playTap();
    setInput('');

    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('sutra_token');
      // Construct canonical messages array formatted as [{ role, content }]
      const conversationHistory = newMessages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      // Prepend persona context to the latest user message
      const formattedMessages = [
        ...conversationHistory.slice(0, -1),
        {
          role: 'user',
          content: `[Persona: ${selectedPersona.name}] ${query}`
        }
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ messages: formattedMessages })
      });

      if (res.ok) {
        const data = await res.json();
        sounds.playSuccess();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || data.message }]);
      } else {
        throw new Error('Server returned non-200');
      }
    } catch {
      sounds.playError();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'ॐ। The celestial transmission wavers in the ether. Reflect upon this Atharva truth: "सत्यं बृहदृतमुग्रम्" — Truth and cosmic order sustain all existence. Try inquiring once more when stillness returns.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 100px', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Chip label="Council of Seers" variant="gold" icon={<Sparkles size={14} />} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold-bright)', margin: '6px 0 0' }}>
            Rishi AI Spiritual Exegesis
          </h1>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', maxWidth: 300, textAlign: 'right' }}>
          AI can make mistakes — verify sacred scripture with a qualified Sanskrit scholar.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }} className="chat-layout-grid">
        {/* LEFT PANEL: 4 PERSONA MODES */}
        <div>
          <GlassCard elevation={2} style={{ padding: 18 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', margin: '0 0 12px', fontSize: '0.95rem' }}>
              Choose Spiritual Teacher:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RISHI_PERSONAS.map((p) => {
                const isSelected = selectedPersona.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedPersona(p);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1.5px solid var(--gold)' : '1px solid rgba(255,255,255,0.06)',
                      color: isSelected ? '#fff' : 'var(--text-1)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.85rem', color: isSelected ? 'var(--gold-bright)' : 'var(--text-0)' }}>
                      <span>{p.icon}</span> {p.name.split(' ')[1]}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', marginTop: 4 }}>
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SEATED SAGE SILHOUETTE WITH BREATHING AURA */}
            <div style={{ textAlign: 'center', marginTop: 24, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: isTyping ? 'scale(1.15)' : 'scale(calc(0.9 + 0.15 * var(--breath, 0.5)))',
                  boxShadow: isTyping ? '0 0 24px rgba(0, 240, 255, 0.6)' : '0 0 12px rgba(212, 175, 55, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>🧘</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: 6, display: 'block' }}>
                {isTyping ? 'The Rishi is contemplating...' : 'Silent Awareness'}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT PANEL: CONVERSATION STREAM & COMPOSER */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '68vh' }}>
          <GlassCard elevation={2} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Messages Scroller */}
            <div
              ref={scrollContainerRef}
              style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {messages.map((m, idx) => {
                const isRishi = m.role === 'assistant';
                const hasDevanagari = /[\u0900-\u097F]/.test(m.content);

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: isRishi ? 'flex-start' : 'flex-end',
                      width: '100%'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '82%',
                        padding: '16px 20px',
                        borderRadius: 12,
                        background: isRishi ? 'rgba(22, 23, 21, 0.94)' : 'rgba(197, 154, 86, 0.16)',
                        border: isRishi ? '1px solid var(--border-subtle, rgba(213, 211, 203, 0.16))' : '1px solid rgba(197, 154, 86, 0.35)',
                        color: 'var(--silver-moon, #D5D3CB)',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.75rem', gap: 8 }}>
                        <span style={{ color: isRishi ? 'var(--amber-warm, #C59A56)' : 'var(--sage-soft, #87947A)', fontWeight: 600 }}>
                          {isRishi ? `ॐ ${selectedPersona.name.split(' (')[0]}` : 'Seeker Inquiry'}
                        </span>
                        {isRishi && (
                          <span style={{
                            fontSize: '0.66rem',
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--silver-muted, #94A3B8)',
                            fontWeight: 600
                          }}>
                            AI Synthesis &bull; Not Canonical Scripture
                          </span>
                        )}
                      </div>
                      <div style={{ whiteSpace: 'pre-line' }}>{m.content}</div>

                      {/* If response contains Sanskrit, render real chant and library navigation */}
                      {isRishi && hasDevanagari && (
                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(213, 211, 203, 0.08)', display: 'flex', gap: 8 }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Volume2 size={12} />}
                            onClick={() => {
                              sounds.playTap();
                              recitationEngine.recite(m.content);
                            }}
                          >
                            Recite Mantra
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<BookOpen size={12} />}
                            onClick={() => {
                              sounds.playTap();
                              navigate('/library');
                            }}
                          >
                            Open in Library
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold)', fontSize: '0.85rem' }}>
                  <Sparkles size={16} /> Tuning spiritual frequencies...
                </div>
              )}

              <div ref={scrollBottomAnchorRef} />
            </div>

            {/* Inquiry Preset Chips */}
            <div style={{ padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, overflowX: 'auto' }}>
              {INQUIRY_PRESETS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-2)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {q.slice(0, 36)}...
                </button>
              ))}
            </div>

            {/* Composer Bar */}
            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                background: 'rgba(10, 10, 18, 0.6)'
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask the Rishi about Vedic metaphysics, mantras, or inner trials..."
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <Button
                variant="primary"
                disabled={!input.trim() || isTyping}
                icon={<Send size={16} />}
                onClick={() => handleSend()}
              >
                Inquire
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Chat;
