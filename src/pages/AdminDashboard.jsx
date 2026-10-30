import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import {
  ShieldAlert,
  Users,
  Database,
  ArrowLeft,
  Lock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Zap,
  Radio,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

// Engagement & Performance Metrics for Recharts
const ENGAGEMENT_DATA = [
  { day: 'Mon', seekers: 1840, latency: 42 },
  { day: 'Tue', seekers: 2190, latency: 38 },
  { day: 'Wed', seekers: 2450, latency: 45 },
  { day: 'Thu', seekers: 2780, latency: 36 },
  { day: 'Fri', seekers: 3120, latency: 40 },
  { day: 'Sat', seekers: 3680, latency: 34 },
  { day: 'Sun', seekers: 4150, latency: 32 }
];

// Initial Seekers Roster
const INITIAL_USERS = [
  { id: 'usr-1', username: 'Vasishta_Cosmic', role: 'admin', rp: 16840, status: 'Active', joined: '2026-08-14' },
  { id: 'usr-2', username: 'Arya_Agni33', role: 'scholar', rp: 9420, status: 'Active', joined: '2026-09-02' },
  { id: 'usr-3', username: 'Soma_Chanter', role: 'scholar', rp: 4890, status: 'Active', joined: '2026-09-18' },
  { id: 'usr-4', username: 'Vidya_Pravin', role: 'user', rp: 2450, status: 'Active', joined: '2026-10-01' },
  { id: 'usr-5', username: 'Ananda_Seeker', role: 'user', rp: 1210, status: 'Active', joined: '2026-10-12' },
  { id: 'usr-6', username: 'Kavi_Shloka', role: 'user', rp: 520, status: 'Suspended', joined: '2026-10-20' },
  { id: 'usr-7', username: 'Mitra_Dharma', role: 'user', rp: 180, status: 'Active', joined: '2026-10-25' }
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Strict role enforcement: Only authenticated users with role === 'admin' can access
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Paginated Users
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // User Actions: Toggle Role
  const handleToggleRole = (id) => {
    sounds.playUnlockChime();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextRole = u.role === 'admin' ? 'user' : u.role === 'scholar' ? 'admin' : 'scholar';
          return { ...u, role: nextRole };
        }
        return u;
      })
    );
  };

  // User Actions: Toggle Suspend
  const handleToggleStatus = (id) => {
    sounds.playCombatHit(false);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' };
        }
        return u;
      })
    );
  };

  // Access Denied Screen if not admin
  if (!isAdmin) {
    return (
      <div className="admin-portal-container">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate('/dashboard')}
          style={{ width: 'fit-content' }}
        >
          Return to Sanctuary
        </Button>

        <GlassCard spotlight className="admin-denied-wrap">
          <div className="admin-lock-icon">
            <Lock size={36} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.8rem', margin: 0 }}>
            Sanctum Chamber Restricted
          </h2>

          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.6, margin: 0 }}>
            This chamber is reserved for consecrated administrators (Brahmashasan).
            Your current soul profile ({user?.username || 'Guest'}) does not possess administrative privileges.
          </p>

          <div style={{ display: 'flex', gap: '14px', marginTop: '14px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              icon={ArrowLeft}
              onClick={() => navigate('/dashboard')}
            >
              Return to Sanctuary
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="admin-portal-container">
      {/* Top Header */}
      <div className="admin-header-row">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)' }}>
            <ShieldAlert size={16} />
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Brahmashasan • Supreme Oversight
            </span>
          </div>
          <h1 className="admin-title">Sanctum Oversight Portal</h1>
        </div>

        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate('/dashboard')}
        >
          Return to Sanctuary
        </Button>
      </div>

      {/* KPI Metric Tiles with AnimatedNumber */}
      <div className="admin-kpi-grid">
        <GlassCard spotlight className="admin-kpi-card">
          <div className="admin-kpi-icon-wrap" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-bright)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="admin-kpi-val">
              <AnimatedNumber value={14280} />
            </div>
            <span className="admin-kpi-label">Total Registered Seekers</span>
          </div>
        </GlassCard>

        <GlassCard spotlight className="admin-kpi-card">
          <div className="admin-kpi-icon-wrap" style={{ background: 'rgba(0, 240, 255, 0.15)', color: 'var(--cyan)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="admin-kpi-val">
              <AnimatedNumber value={3450} />
            </div>
            <span className="admin-kpi-label">Active Contemplations</span>
          </div>
        </GlassCard>

        <GlassCard spotlight className="admin-kpi-card">
          <div className="admin-kpi-icon-wrap" style={{ background: 'rgba(255, 123, 0, 0.15)', color: 'var(--saffron)' }}>
            <Zap size={24} />
          </div>
          <div>
            <div className="admin-kpi-val">
              <AnimatedNumber value={89240} />
            </div>
            <span className="admin-kpi-label">Mantras Recited</span>
          </div>
        </GlassCard>

        <GlassCard spotlight className="admin-kpi-card">
          <div className="admin-kpi-icon-wrap" style={{ background: 'rgba(79, 209, 197, 0.15)', color: 'var(--success)' }}>
            <Radio size={24} />
          </div>
          <div>
            <div className="admin-kpi-val" style={{ color: 'var(--success)' }}>
              99.98%
            </div>
            <span className="admin-kpi-label">Platform Core Health</span>
          </div>
        </GlassCard>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="admin-charts-grid">
        <GlassCard spotlight className="admin-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.15rem', margin: 0 }}>
              Daily Active Seekers
            </h3>
            <Chip variant="gold">This Week</Chip>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENGAGEMENT_DATA}>
                <defs>
                  <linearGradient id="adminAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="seekers" stroke="#00F0FF" strokeWidth={2} fill="url(#adminAreaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard spotlight className="admin-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.15rem', margin: 0 }}>
              System Response Latency (ms)
            </h3>
            <Chip variant="cyber">Avg 38ms</Chip>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENGAGEMENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} domain={[20, 60]} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="latency" stroke="#FFE259" strokeWidth={2} dot={{ r: 4, fill: '#FFE259' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Users Management Table Card */}
      <GlassCard spotlight className="admin-table-card">
        <div className="admin-table-controls">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.25rem', margin: 0 }}>
              Seeker Soul Management
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {filteredUsers.length} Seekers registered across Sanctum realms
            </span>
          </div>

          <div className="admin-table-search">
            <input
              type="text"
              placeholder="Filter by moniker or role..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(10, 10, 18, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFF',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th className="admin-th">Seeker Moniker</th>
                <th className="admin-th">Role Standing</th>
                <th className="admin-th">Radiance (RP)</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Joined Date</th>
                <th className="admin-th" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u) => {
                const isAdminRole = u.role === 'admin';
                const isScholar = u.role === 'scholar';
                const isSuspended = u.status === 'Suspended';

                return (
                  <tr key={u.id}>
                    <td className="admin-td" style={{ color: '#FFF', fontWeight: 600 }}>
                      {u.username}
                    </td>
                    <td className="admin-td">
                      <Chip variant={isAdminRole ? 'gold' : isScholar ? 'cyber' : 'ghost'}>
                        {u.role.toUpperCase()}
                      </Chip>
                    </td>
                    <td className="admin-td" style={{ color: 'var(--gold-bright)', fontFamily: 'var(--font-hud)' }}>
                      {u.rp.toLocaleString()} RP
                    </td>
                    <td className="admin-td">
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: isSuspended ? 'var(--danger)' : 'var(--success)',
                          fontWeight: 700
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="admin-td" style={{ color: 'var(--text-muted)' }}>
                      {u.joined}
                    </td>
                    <td className="admin-td" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Button
                          variant="ghost"
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          onClick={() => handleToggleRole(u.id)}
                        >
                          Change Role
                        </Button>
                        <Button
                          variant={isSuspended ? 'primary' : 'danger'}
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          onClick={() => handleToggleStatus(u.id)}
                        >
                          {isSuspended ? 'Reinstate' : 'Suspend'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="ghost"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="cyber"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminDashboard;
