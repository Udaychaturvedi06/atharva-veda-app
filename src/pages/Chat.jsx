import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/soundEngine';
import {
  MessageSquareQuote,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  Compass,
  Flame
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

// Contemplative Preset Inquiries
const INQUIRY_PRESETS = [
  {
    label: 'Mother Earth in Atharvaveda',
    query: 'What is the esoteric significance of the Bhumi Sukta (Ode to Mother Earth) in the Atharvaveda?'
  },
  {
    label: 'Ekam Sat Vipra Bahudha',
    query: 'Expound upon the Rigvedic declaration: "एकं सद्विप्रा बहुधा वदन्ति" (Truth is One, the wise speak of it in many ways).'
  },
  {
    label: 'Overcoming Modern Anxiety',
    query: 'How do the Atharvavedic chants guide seekers to dissolve chronic anxiety, mental restlessness, and grief?'
  },
  {
    label: 'Agni as Inner Fire',
    query: 'Explain the deeper metaphysical nature of Agni beyond physical combustion as revealed by the Vedic Rishis.'
  },
  {
    label: 'Ayurveda & Atharvaveda',
    query: 'What is the authentic genetic link between Atharvavedic healing incantations and classical Ayurveda?'
  }
];

// Helper to format structured Vedic exegesis (quotes & takeaways)
const renderFormattedExegesis = (content) => {
  const parts = content.split('\n\n');

  return parts.map((part, pIdx) => {
    const trimmed = part.trim();

    // Check if this paragraph contains a Devanagari Sanskrit quote
    const hasDevanagari = /[\u0900-\u097F]/.test(trimmed);
    const isQuote = trimmed.startsWith('"') || trimmed.startsWith('“') || hasDevanagari;

    if (isQuote && hasDevanagari) {
      return (
        <div key={pIdx} className="rishi-devanagari-quote">
          {trimmed}
        </div>
      );
    }

    if (trimmed.startsWith('💡') || trimmed.startsWith('Key Takeaway:') || trimmed.startsWith('Philosophical Realization:')) {
      return (
        <div key={pIdx} className="rishi-takeaway-box">
          {trimmed}
        </div>
      );
    }

    return (
      <p key={pIdx} style={{ margin: '0 0 10px', lineHeight: 1.65 }}>
        {trimmed}
      </p>
    );
  });
};

export const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'ॐ शान्तिः। I am Rishi Angiras, the primordial voice of the Atharvaveda. Ask of the celestial fires, the seven Lokas, the sacred meters, or the conquest of the inner enemies. What philosophical inquiry stirs within your consciousness?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBottomPill, setShowScrollBottomPill] = useState(false);

  const scrollContainerRef = useRef(null);
  const scrollBottomAnchorRef = useRef(null);

  // Scroll to bottom smoothly
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollBottomAnchorRef.current) {
      scrollBottomAnchorRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, []);

  // Monitor scroll position to surface "Jump to latest" pill
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBottomPill(distanceFromBottom > 140);
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isTyping, scrollToBottom]);

  // Simulated Streaming Typewriter Effect
  const streamRishiResponse = useCallback((fullText) => {
    setIsTyping(true);

    // Initial placeholder empty message
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    let currentLength = 0;
    const chunkSize = 3;
    const interval = setInterval(() => {
      currentLength += chunkSize;

      setMessages((prev) => {
        const next = [...prev];
        const lastMsg = next[next.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = fullText.slice(0, currentLength);
        }
        return next;
      });

      if (currentLength >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
        sounds.playUnlockChime();
      }
    }, 24);
  }, []);

  const sendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    sounds.playTibetanBowl();
    const updatedMessages = [...messages, { role: 'user', content: query }];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('sutra_token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (res.ok) {
        const data = await res.json();
        streamRishiResponse(data.reply);
      } else {
        throw new Error('API offline');
      }
    } catch {
      // Offline fallback rich philosophical exegesis
      const fallbackExegesis = [
        `"सत्यं बृहदृतमुग्रं दीक्षा तपो ब्रह्म यज्ञः पृथिवीं धारयन्ति"\n\nIn Atharvaveda 12.1.1, the Rishi commands us to recognize that truth (Satya) and cosmic harmony (Ṛta) are not abstract doctrines, but the living energetic foundations that preserve the cosmos.\n\n💡 Philosophical Realization: Align your daily thoughts with universal welfare (Lokasangraha). When the personal ego surrenders to eternal order, inner turbulence dissolves completely.`,
        `"एकं सद्विप्रा बहुधा वदन्ति अग्निं यमं मातरिश्वानमाहुः"\n\nFrom Rigveda 1.164.46: Reality is indivisible, non-dual consciousness. Sages designate It by countless names—Agni, Yama, or the cosmic breath Matarishvan.\n\n💡 Philosophical Realization: Do not be misled by superficial variations in linguistic terminology. Seek the witness consciousness that remains constant across all waking and sleeping states.`,
        `"माता भूमिः पुत्रो अहं पृथिव्याः | पर्जन्यः पिता स उ नः पिपर्तु ||"\n\nAtharvaveda 12.1.12 lays down the eternal ecological covenant: Earth is our sacred mother, and we are the children born of her dust. We do not own the earth; we belong to her.\n\n💡 Philosophical Realization: Anxiety dissipates when you ground your barefoot awareness into the soil and remember your immortal kinship with all elemental forms.`
      ];

      const chosen = fallbackExegesis[Math.floor(Math.random() * fallbackExegesis.length)];
      streamRishiResponse(chosen);
    }
  };

  return (
    <div className="chat-chamber-root">
      {/* Header */}
      <div className="chat-chamber-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)' }}>
            <MessageSquareQuote size={16} />
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Vedic AI Oracle Chamber
            </span>
          </div>
          <h1 className="chat-chamber-title">Rishi Angiras AI</h1>
        </div>

        <Chip variant="gold" icon={Sparkles}>
          Active Discourse
        </Chip>
      </div>

      {/* Preset Contemplative Inquiry Chips */}
      <div className="chat-suggestions-bar">
        {INQUIRY_PRESETS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            className="chat-suggestion-chip"
            onClick={() => sendMessage(item.query)}
          >
            <Compass size={14} style={{ color: 'var(--gold)' }} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Messages Stage */}
      <GlassCard spotlight className="chat-messages-stage">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="chat-scroll-area"
        >
          {messages.map((m, idx) => {
            const isRishi = m.role === 'assistant';
            return (
              <div
                key={idx}
                className={`chat-message-row ${isRishi ? 'rishi' : 'seeker'}`}
              >
                <div className={`chat-avatar-wrap ${isRishi ? 'rishi' : 'seeker'}`}>
                  {isRishi ? <Flame size={18} /> : <User size={18} />}
                </div>

                <div className={`chat-bubble ${isRishi ? 'rishi' : 'seeker'}`}>
                  <div className="chat-bubble-author">
                    {isRishi ? (
                      <>
                        <span>Rishi Angiras</span>
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(212,175,55,0.18)', color: 'var(--gold-bright)' }}>
                          Atharva Seer
                        </span>
                      </>
                    ) : (
                      <span>Seeker of Truth</span>
                    )}
                  </div>

                  <div>
                    {isRishi
                      ? renderFormattedExegesis(m.content)
                      : m.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pulsing Diya Typing Indicator */}
          {isTyping && (
            <div className="chat-message-row rishi">
              <div className="chat-avatar-wrap rishi">
                <Flame size={18} />
              </div>
              <div className="diya-typing-box">
                <svg className="diya-flame-svg" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C12 2 7 8 7 13C7 16.31 9.24 19 12 19C14.76 19 17 16.31 17 13C17 8 12 2 12 2Z"
                    fill="url(#diyaGrad)"
                  />
                  <ellipse cx="12" cy="20" rx="9" ry="3" fill="#D4AF37" opacity="0.6" />
                  <defs>
                    <linearGradient id="diyaGrad" x1="12" y1="2" x2="12" y2="19" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFE259" />
                      <stop offset="0.6" stopColor="#FF7B00" />
                      <stop offset="1" stopColor="#FF5E1E" />
                    </linearGradient>
                  </defs>
                </svg>
                <span>Rishi Angiras contemplates the eternal scriptures...</span>
              </div>
            </div>
          )}

          <div ref={scrollBottomAnchorRef} />
        </div>

        {/* Floating "Jump to Latest" Pill */}
        <AnimatePresence>
          {showScrollBottomPill && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              onClick={() => scrollToBottom(true)}
              className="jump-to-latest-pill"
            >
              <ChevronDown size={15} />
              <span>Jump to Latest</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Composer Input Bar */}
        <form
          className="chat-composer-wrap"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            className="chat-input-field"
            placeholder="Pose a philosophical inquiry to the Rishi (e.g., 'What is Tapasya?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={!input.trim() || isTyping}
            icon={Send}
          >
            Inquire
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default Chat;
