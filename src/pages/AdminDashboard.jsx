import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Database, ArrowLeft } from 'lucide-react';
import { GlassCard, Button } from '../components/ui';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Button
        variant="cyber"
        style={{ width: 'fit-content', padding: '8px 16px' }}
        onClick={() => navigate('/dashboard')}
        icon={ArrowLeft}
      >
        Back to Sanctuary
      </Button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldAlert size={28} style={{ color: 'var(--gold-bright)' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '2rem', margin: 0 }}>
          Sanctum Oversight (Admin Portal)
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <GlassCard style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-bright)' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Seekers</span>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: '1.4rem', color: '#FFF', fontWeight: 700 }}>4 Profiles</div>
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,240,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
            <Database size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cached Translations</span>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: '1.4rem', color: '#FFF', fontWeight: 700 }}>3 Verified Shlokas</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
