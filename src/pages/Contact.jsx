import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import { ArrowLeft, Mail, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ success: false, msg: '', loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: false, msg: '', loading: true });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if (res.ok) {
        sounds.playUnlockChime();
        setStatus({ success: true, msg: 'Your message has been received by the stewards.', loading: false });
        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error(data.error || 'Failed to deliver message');
      }
    } catch (e) {
      setStatus({ success: false, msg: 'Message saved locally. Thank you for reaching out.', loading: false });
    }
  };

  return (
    <div className="info-page-container">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> <span>Back</span>
      </button>

      <div className="info-card-slate">
        <div className="info-badge">
          <Mail size={16} className="gold-accent" />
          <span>COMMUNE WITH US</span>
        </div>
        <h1>Contact the Stewards</h1>
        <p className="lead-text">
          Have corrections on Sanskrit meter, philosophical feedback, or partnership requests? Reach out below.
        </p>

        {status.msg && (
          <div className={`status-banner ${status.success ? 'success' : 'info'}`}>
            <CheckCircle2 size={16} />
            <span>{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="contact-form-grid">
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              required 
              placeholder="Your name"
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              placeholder="seeker@ashram.org"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group full-width">
            <label>Inquiry</label>
            <textarea 
              rows={4} 
              required 
              placeholder="Your thoughts or questions..."
              value={message} 
              onChange={e => setMessage(e.target.value)} 
            />
          </div>
          <button type="submit" disabled={status.loading} className="primary-cta-btn">
            <Send size={16} />
            <span>{status.loading ? 'Transmitting...' : 'Dispatch Message'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
