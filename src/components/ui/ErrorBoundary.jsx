import React from 'react';
import { Button } from './Button';
import { Compass, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cyber-Vedic ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = '/dashboard';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-0, #07070D)',
            color: 'var(--text-0, #FDFBEE)',
            padding: 24,
            textAlign: 'center',
            position: 'relative',
            zIndex: 99999
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid var(--gold, #D4AF37)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}
          >
            <Compass size={32} color="var(--gold, #D4AF37)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display, Cinzel, serif)', color: 'var(--gold-bright, #FFE259)', margin: '0 0 12px' }}>
            Sanctum Realignment Required
          </h2>
          <p style={{ maxWidth: 500, color: 'var(--text-1, #C5D0D6)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 16 }}>
            A temporary cosmic disruption was encountered while rendering the sacred sanctum. Your Tapasya records and progress are safely preserved.
          </p>

          {this.state.error && (
            <div
              style={{
                maxWidth: 600,
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 8,
                color: '#FF6B6B',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                textAlign: 'left',
                overflow: 'auto',
                marginBottom: 20
              }}
            >
              {this.state.error.message || String(this.state.error)}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="primary" icon={RotateCcw} onClick={this.handleReset}>
              Re-enter Sanctuary
            </Button>
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Reload Sanctum
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
