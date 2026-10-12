import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../utils/soundEngine';
import { 
  MessageSquareQuote, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Flame,
  Volume2,
  Compass
} from 'lucide-react';

const WISDOM_THEMES = [
  { id: 'earth', label: '🌿 Ecology & Mother Earth', prompt: 'What does the Atharva Veda Prithvi Sukta teach us about living in harmony with the planet?' },
  { id: 'anxiety', label: '🌊 Overcoming Fear & Grief', prompt: 'Which Vedic hymns and contemplative practices help calm mental storms and severe anxiety?' },
  { id: 'agni', label: '🔥 The Inner Flame of Will', prompt: 'Explain the deeper esoteric meaning of Agni as the priest of inner sacrifice in Rigveda.' },
  { id: 'ayurveda', label: '🌱 Herbs & Healing (Oshadhi)', prompt: 'How does the Atharvaveda describe plants, herbs, and the biological breath of life?' }
];

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Om Namo Narayanaya. You stand beside the Golden Pool of Divination. Inquire into any mystery of the four Vedas—from metaphysics and cosmic time to herbal medicine and daily discipline.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [omDroneActive, setOmDroneActive] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleOmDrone = () => {
    sounds.playTibetanBowl();
    setOmDroneActive(!omDroneActive);
  };

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    sounds.playTibetanBowl();
    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('sutra_token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ messages: newMessages })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        sounds.playUnlockChime();
      } else {
        throw new Error('API unready');
      }
    } catch (e) {
      const offlineAnswers = [
        `"Truth cannot be suppressed by time. The Atharvaveda reminds us that one who walks in harmony with cosmic order (Rta) is protected by all the devas."`,
        `"In the silence of the heart lies the eternal flame of Agni. Look inward, align your thoughts with dharma, and clarity shall arise naturally."`,
        `"Earth is our Mother, sustain her and be sustained. When questions perturb the intellect, anchor yourself in breath and selfless action."`
      ];
      const randomAns = offlineAnswers[Math.floor(Math.random() * offlineAnswers.length)];
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `[Vedic Divination Mode] ${randomAns}` 
      }]);
      sounds.playUnlockChime();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rishi-chat-sanctuary">
      <div className="divination-pool-wrap">
        {/* Pool Shimmer Header */}
        <div className="pool-shimmer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFE259'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Cinzel, serif', color: '#FFF', fontSize: '1rem', margin: 0 }}>
                The Golden Divination Pool
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#00F0FF' }}>Rishi Consciousness Link Active</span>
            </div>
          </div>

          <button 
            className="rune-btn" 
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            onClick={toggleOmDrone}
          >
            <Volume2 size={14} />
            <span>{omDroneActive ? 'Om Drone Pulsing' : 'Strike Om Resonance'}</span>
          </button>
        </div>

        {/* Thematic Prompt Tablets */}
        {messages.length === 1 && (
          <div style={{ padding: '16px 24px 0', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {WISDOM_THEMES.map(theme => (
              <button
                key={theme.id}
                className="rune-btn"
                style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                onClick={() => sendMessage(theme.prompt)}
              >
                <span>{theme.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Conversation Stream */}
        <div className="oracle-pond-feed">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-bubble-wrap ${m.role}`}>
              <div className="bubble-avatar">
                {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="bubble-content">
                <span className="sender-tag">{m.role === 'assistant' ? 'The Vedic Oracle' : 'Seeker'}</span>
                <p className="bubble-text">{m.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-wrap assistant">
              <div className="bubble-avatar"><Bot size={16} /></div>
              <div className="bubble-content loading-typing">
                <span>Ripples forming across the golden pool of memory...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form 
          className="chat-input-bar"
          style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            className="oracle-input"
            placeholder="Pose your existential inquiry to the Vedic Oracle..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={loading || !input.trim()} className="oracle-send-btn">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
