import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../utils/soundEngine';
import { 
  MessageSquareQuote, 
  Send, 
  Sparkles, 
  Bot, 
  User
} from 'lucide-react';

const SUGGESTIONS = [
  'What is the spiritual significance of Mother Earth in Atharvaveda?',
  'Explain the meaning of "Ekam Sat Vipra Bahudha Vadanti".',
  'How do the Vedas guide us to overcome inner grief and anxiety?',
  'What is the connection between Atharvaveda and Ayurveda?'
];

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Om Namo Narayanaya. I am your Vedic Companion, tuned to the sacred verses of the Rig, Atharva, Sama, and Yajur Vedas. Inquire into any mystery of the four Vedas—from metaphysics and cosmic time to herbal medicine and daily living.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
        content: `[Vedic Oracle Mode] ${randomAns}` 
      }]);
      sounds.playUnlockChime();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div>
        <div className="badge gold" style={{ marginBottom: '8px' }}>
          <MessageSquareQuote size={13} />
          <span>Vedic AI Companion</span>
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: '#FFF', margin: '4px 0 0' }}>
          Rishi AI Oracle
        </h1>
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              className="cyber-btn"
              style={{ fontSize: '0.8rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
              onClick={() => sendMessage(s)}
            >
              <Sparkles size={13} style={{ color: '#FFE259' }} />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Messages Card */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: m.role === 'assistant' ? 'flex-start' : 'flex-end',
                maxWidth: '85%'
              }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: m.role === 'assistant' ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: m.role === 'assistant' ? '#FFE259' : '#FFF',
                flexShrink: 0
              }}>
                {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>

              <div 
                className={m.role === 'assistant' ? 'chat-bubble-bot' : 'chat-bubble-user'}
                style={{ padding: '14px 18px', borderRadius: '16px', lineHeight: '1.6', fontSize: '0.95rem' }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: m.role === 'assistant' ? '#FFE259' : '#94A3B8', marginBottom: '4px' }}>
                  {m.role === 'assistant' ? 'Rishi Oracle' : 'Seeker'}
                </div>
                <p style={{ margin: 0 }}>{m.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFE259' }}>
                <Bot size={16} />
              </div>
              <div className="chat-bubble-bot" style={{ padding: '14px 18px', borderRadius: '16px', color: '#FFE259', fontSize: '0.9rem' }}>
                Reflecting upon the cosmic scriptures...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          style={{ padding: '14px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px', background: 'rgba(10,10,18,0.4)' }}
        >
          <input
            type="text"
            placeholder="Ask the Rishi Oracle about any Vedic hymn, ritual, or philosophy..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', color: '#FFF', fontSize: '0.95rem', outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Ask</span>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
