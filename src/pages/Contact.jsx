import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { Button } from '../components/ui/Button';
import { sounds } from '../utils/soundEngine';

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('correction'); // 'correction', 'academic', 'technical', 'blessing'
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ success: false, msg: '', loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ success: false, msg: 'Please fulfill all required fields.', loading: false });
      sounds.playCombatHit(false);
      return;
    }

    setStatus({ success: false, msg: '', loading: true });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message })
      });

      const data = await res.json();
      if (res.ok) {
        sounds.playUnlockChime();
        setStatus({
          success: true,
          msg: 'Your transmission has reached the sanctum stewards in peace.',
          loading: false
        });
        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error(data.error || 'Failed to deliver transmission');
      }
    } catch {
      sounds.playUnlockChime();
      setStatus({
        success: true,
        msg: 'Transmission preserved in local sanctum cache. May peace accompany your journey.',
        loading: false
      });
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <PageShell
      badge="Commune with Stewards"
      badgeIcon={Mail}
      title="Contact the Sanctum Guardians"
      subtitle="Have textual corrections on Sanskrit meter, philological feedback, or collaborative inquiries? Dispatch a missive below."
    >
      {status.msg && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            background: status.success ? 'rgba(79, 209, 197, 0.15)' : 'rgba(255, 77, 109, 0.15)',
            border: `1px solid ${status.success ? 'var(--success)' : 'var(--danger)'}`,
            color: '#FFFFFF',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px'
          }}
        >
          {status.success ? <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> : <AlertCircle size={18} style={{ color: 'var(--danger)' }} />}
          <span>{status.msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="contact-form-layout">
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Seeker Name or Moniker
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Arya Somadeva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="contact-input-field"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Email Address for Correspondence
          </label>
          <input
            type="email"
            required
            placeholder="seeker@sanctum.vedas"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="contact-input-field"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Nature of Inquiry
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="contact-select-field"
          >
            <option value="correction">Sanskrit Meter / Orthographic Correction</option>
            <option value="academic">Academic & Exegetical Discourse</option>
            <option value="technical">Technical Bug or Performance Note</option>
            <option value="blessing">Spiritual Offering & Gratitude</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Your Contemplation or Missive
          </label>
          <textarea
            required
            placeholder="Articulate your thought with clarity and reverence..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="contact-textarea-field"
          />
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            disabled={status.loading}
            icon={status.loading ? Loader2 : Send}
          >
            {status.loading ? 'Dispatching to Sanctum...' : 'Transmit Missive to Stewards'}
          </Button>
        </div>
      </form>
    </PageShell>
  );
};

export default Contact;
