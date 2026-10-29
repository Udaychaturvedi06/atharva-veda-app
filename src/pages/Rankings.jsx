import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import {
  Trophy,
  Crown,
  Sparkles,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { Chip } from '../components/ui/Chip';
import { ProgressBar } from '../components/ui/ProgressBar';

// League Divisions Data
const LEAGUE_DIVISIONS = [
  { id: 'all', label: 'All Leagues' },
  { id: 'immortals', label: 'Immortals (Brahmarshi)', minRp: 15000 },
  { id: 'master', label: 'Masters (Rishi / Maharshi)', minRp: 3500 },
  { id: 'adept', label: 'Adepts (Sadhaka / Upadhyaya)', minRp: 750 },
  { id: 'novice', label: 'Novices (Jijnasu / Brahmachari)', minRp: 0 }
];

// Top Global Sages
const GLOBAL_LEADERS = [
  { rank: 1, name: 'Vasishta_Cosmic', title: 'Brahmarshi', rp: 16840, streak: 42, badge: '🌟', league: 'immortals' },
  { rank: 2, name: 'Arya_Agni33', title: 'Maharshi', rp: 9420, streak: 28, badge: '⚡', league: 'master' },
  { rank: 3, name: 'Soma_Chanter', title: 'Rishi', rp: 4890, streak: 19, badge: '🌙', league: 'master' },
  { rank: 4, name: 'Vidya_Pravin', title: 'Upadhyaya', rp: 2450, streak: 14, badge: '📜', league: 'adept' },
  { rank: 5, name: 'Ananda_Seeker', title: 'Sadhaka', rp: 1210, streak: 9, badge: '📿', league: 'adept' },
  { rank: 6, name: 'Kavi_Shloka', title: 'Brahmachari', rp: 520, streak: 6, badge: '🪶', league: 'novice' },
  { rank: 7, name: 'Mitra_Dharma', title: 'Jijnasu', rp: 180, streak: 3, badge: '🌱', league: 'novice' }
];

// 7-Day RP Velocity Data for Recharts
const RP_HISTORY_DATA = [
  { day: 'Mon', rp: 820, mantras: 4 },
  { day: 'Tue', rp: 940, mantras: 6 },
  { day: 'Wed', rp: 1080, mantras: 8 },
  { day: 'Thu', rp: 1150, mantras: 7 },
  { day: 'Fri', rp: 1320, mantras: 11 },
  { day: 'Sat', rp: 1480, mantras: 14 },
  { day: 'Sun', rp: 1650, mantras: 16 }
];

// Custom Cyber-Vedic Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(10, 10, 18, 0.95)',
          border: '1px solid var(--gold)',
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}
      >
        <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {label} Tapasya
        </span>
        <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', color: 'var(--gold-bright)', fontWeight: 700 }}>
          {payload[0].value} Radiance Points
        </div>
      </div>
    );
  }
  return null;
};

export const Rankings = ({ playerRp: propPlayerRp }) => {
  const { user } = useAuth();
  const getRank = useGameStore((state) => state.getRank);
  const storeRp = useGameStore((state) => state.rp);
  const streak = useGameStore((state) => state.streak);
  const consumePrana = useGameStore((state) => state.consumePrana);

  const playerRp = propPlayerRp !== undefined ? propPlayerRp : storeRp;
  const currentRank = getRank();

  const [activeTab, setActiveTab] = useState('leagues'); // 'leagues' or 'sangha'
  const [activeLeague, setActiveLeague] = useState('all');
  const [sanghaNotice, setSanghaNotice] = useState(null);

  // Cooperative Sangha Circle Data
  const [sanghaMembers] = useState([
    { name: user?.username || 'You', rp: playerRp, status: 'Chanting', color: '#D4AF37', avatar: '🧘' },
    { name: 'Ananda_Sage', rp: 640, status: 'Meditating', color: '#00F0FF', avatar: '🌿' },
    { name: 'Soma_Kavi', rp: 520, status: 'Resting', color: '#FF7B00', avatar: '✨' },
    { name: 'Maitri_Devi', rp: 480, status: 'Chanting', color: '#9F7AEA', avatar: '🕊️' },
    { name: 'Brahma_Jijnasu', rp: 390, status: 'Resting', color: '#4FD1C5', avatar: '🌱' },
    { name: 'Rishi_Vani', rp: 420, status: 'Meditating', color: '#FF4D6D', avatar: '🔥' }
  ]);

  const sanghaTotalRp = sanghaMembers.reduce((sum, m) => sum + m.rp, 0);
  const sanghaGoal = 3000;
  const sanghaProgress = Math.min(100, Math.round((sanghaTotalRp / sanghaGoal) * 100));

  const handleGiftPrana = (memberName) => {
    if (!consumePrana(15)) {
      setSanghaNotice('Not enough Prana! Need 15');
      setTimeout(() => setSanghaNotice(null), 2500);
      return;
    }
    sounds.playSuccess();
    setSanghaNotice(`15 Prana gifted to ${memberName}!`);
    setTimeout(() => setSanghaNotice(null), 2500);
  };

  const handleNudge = (memberName) => {
    sounds.playTap();
    setSanghaNotice(`Gentle Vedic encouragement sent to ${memberName}.`);
    setTimeout(() => setSanghaNotice(null), 2500);
  };

  // Top 3 Podium Seekers
  const first = GLOBAL_LEADERS[0];
  const second = GLOBAL_LEADERS[1];
  const third = GLOBAL_LEADERS[2];

  // Filtered leaderboard
  const displayedLeaders = GLOBAL_LEADERS.filter((leader) => {
    if (activeLeague === 'all') return true;
    return leader.league === activeLeague;
  });

  // Calculate gap to overtake next seeker
  const nextSeekerAbove = GLOBAL_LEADERS.slice().reverse().find((l) => l.rp > playerRp) || first;
  const rpGap = Math.max(0, nextSeekerAbove.rp - playerRp);
  const overtakeProgress = Math.min(
    100,
    Math.max(10, ((playerRp) / (nextSeekerAbove.rp || 1)) * 100)
  );

  return (
    <div className="rankings-container">
      {/* Header */}
      <div className="rankings-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)' }}>
          <Trophy size={16} />
          <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Hall of Sages & Celestial Leagues
          </span>
        </div>
        <h1 className="rankings-title">Astral Leaderboards & Sangha Circles</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Witness seekers ascending through tapasya, mantra recitation, and inner conquests across the 7 Lokas.
        </p>

        {/* Top Tab Switcher */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('leagues');
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'leagues' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.04)',
              border: activeTab === 'leagues' ? '1.5px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === 'leagues' ? 'var(--gold-bright)' : 'var(--text-2)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Weekly Leagues
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('sangha');
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'sangha' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255,255,255,0.04)',
              border: activeTab === 'sangha' ? '1.5px solid var(--cyan)' : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === 'sangha' ? 'var(--cyan)' : 'var(--text-2)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cooperative Sangha Circle
          </button>
        </div>
      </div>

      {sanghaNotice && (
        <div style={{ background: 'rgba(0, 240, 255, 0.15)', border: '1px solid var(--cyan)', color: 'var(--cyan)', padding: '10px 16px', borderRadius: 8, textAlign: 'center', marginBottom: 20 }}>
          {sanghaNotice}
        </div>
      )}

      {activeTab === 'sangha' ? (
        /* COOPERATIVE SANGHA CIRCLE VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
          <GlassCard elevation={2} style={{ padding: 28, textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', margin: '0 0 6px', fontSize: '1.6rem' }}>
              Weekly Sangha Sacred Mandala
            </h3>
            <p style={{ color: 'var(--text-1)', fontSize: '0.9rem', maxWidth: 520, margin: '0 auto 20px' }}>
              6 seekers walking together. When the shared yantra reaches 3,000 RP, the collective Soma Chest unlocks for all.
            </p>

            {/* Circular Shared Yantra Progress */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
                border: '3px solid var(--cyan)',
                margin: '0 auto 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)'
              }}
            >
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>
                {sanghaProgress}%
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>
                {sanghaTotalRp} / {sanghaGoal} RP
              </span>
            </div>

            <ProgressBar value={sanghaTotalRp} max={sanghaGoal} variant="cyan" size="md" shimmer />
          </GlassCard>

          {/* Sangha Members Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {sanghaMembers.map((m) => (
              <GlassCard key={m.name} elevation={1} style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.8rem' }}>{m.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: m.color }}>{m.status}</div>
                    </div>
                  </div>
                  <Chip label={`${m.rp} RP`} variant="gold" />
                </div>

                {m.name !== (user?.username || 'You') && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => handleNudge(m.name)}
                      style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Nudge
                    </button>
                    <button
                      onClick={() => handleGiftPrana(m.name)}
                      style={{ padding: '6px 12px', background: 'rgba(0,240,255,0.2)', border: '1px solid var(--cyan)', borderRadius: 6, color: 'var(--cyan)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Gift Prana (-15)
                    </button>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      ) : (
        /* LEAGUES COMPETITION VIEW */
        <>

      {/* League Division Navigation Tabs */}
      <div className="league-tabs-wrap">
        {LEAGUE_DIVISIONS.map((div) => {
          const isActive = activeLeague === div.id;
          return (
            <button
              key={div.id}
              type="button"
              className={`league-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                sounds.playTibetanBowl();
                setActiveLeague(div.id);
              }}
            >
              {div.label}
              {isActive && (
                <motion.div layoutId="league-tab-line" className="league-tab-line" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3D Stepped Podium for Top 3 Seekers */}
      <GlassCard spotlight>
        <div style={{ textAlign: 'center', paddingTop: '16px' }}>
          <Chip variant="gold" icon={Crown}>
            Top Consecrated Sages
          </Chip>
        </div>

        <div className="podium-stage-wrap">
          {/* 2nd Place: Silver (Left) */}
          <div className="podium-column">
            <div className="podium-seeker-badge">
              <div className="podium-avatar silver">
                <span>{second.badge}</span>
              </div>
              <div className="podium-seeker-name">{second.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{second.title}</div>
              <div className="podium-seeker-rp">{second.rp.toLocaleString()} RP</div>
            </div>
            <div className="podium-step-pedestal silver">
              #2
            </div>
          </div>

          {/* 1st Place: Gold (Center) */}
          <div className="podium-column">
            <div className="podium-seeker-badge">
              <div className="podium-avatar gold">
                <Crown size={22} className="podium-crown-icon" />
                <span>{first.badge}</span>
              </div>
              <div className="podium-seeker-name" style={{ color: 'var(--gold-bright)' }}>{first.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>{first.title}</div>
              <div className="podium-seeker-rp" style={{ color: 'var(--gold-bright)', fontWeight: 800 }}>
                {first.rp.toLocaleString()} RP
              </div>
            </div>
            <div className="podium-step-pedestal gold">
              #1
            </div>
          </div>

          {/* 3rd Place: Bronze (Right) */}
          <div className="podium-column">
            <div className="podium-seeker-badge">
              <div className="podium-avatar bronze">
                <span>{third.badge}</span>
              </div>
              <div className="podium-seeker-name">{third.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{third.title}</div>
              <div className="podium-seeker-rp">{third.rp.toLocaleString()} RP</div>
            </div>
            <div className="podium-step-pedestal bronze">
              #3
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Pinned Logged-In Player Status Card */}
      <GlassCard spotlight className="pinned-player-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: `2px solid ${currentRank.color}`,
              boxShadow: `0 0 16px ${currentRank.color}66`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#FFF',
              background: 'rgba(19, 17, 28, 0.9)'
            }}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'ॐ'}
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: currentRank.color, fontFamily: 'var(--font-hud)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Your Soul Standing • {currentRank.tier}
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.25rem', margin: '2px 0 0' }}>
              {user?.username || 'Seeker'} — {currentRank.title}
            </h3>
          </div>
        </div>

        {/* Overtake Progress Bar */}
        <div className="pinned-player-gap-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Gap to overtake {nextSeekerAbove.name}
            </span>
            <span style={{ color: 'var(--gold-bright)', fontFamily: 'var(--font-hud)' }}>
              +{rpGap.toLocaleString()} RP Needed
            </span>
          </div>
          <ProgressBar progress={overtakeProgress} variant="gold" />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Chip variant="gold" icon={Sparkles}>
            {playerRp.toLocaleString()} RP
          </Chip>
          <Chip variant="danger" icon={Flame}>
            {streak}d Streak
          </Chip>
        </div>
      </GlassCard>

      {/* Recharts 7-Day RP Velocity Area Chart */}
      <GlassCard spotlight className="rankings-chart-card">
        <div className="rankings-chart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} style={{ color: 'var(--gold-bright)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#FFF', margin: 0 }}>
              7-Day Radiance Points Velocity
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontFamily: 'var(--font-hud)' }}>
            +830 RP This Week
          </span>
        </div>

        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={RP_HISTORY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFE259" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF7B00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <RechartsTooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="rp"
                stroke="#FFE259"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#goldAreaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Leaderboard Table */}
      <GlassCard spotlight style={{ padding: 0, overflow: 'hidden' }}>
        <div className="leaderboard-table-wrap">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="leaderboard-th">Rank</th>
                <th className="leaderboard-th">Seeker</th>
                <th className="leaderboard-th">Vedic Title</th>
                <th className="leaderboard-th">Tapasya Streak</th>
                <th className="leaderboard-th" style={{ textAlign: 'right' }}>Radiance (RP)</th>
              </tr>
            </thead>
            <tbody>
              {displayedLeaders.map((leader) => {
                const isTop3 = leader.rank <= 3;
                return (
                  <tr key={leader.rank}>
                    <td className="leaderboard-td" style={{ fontWeight: 800, color: isTop3 ? 'var(--gold-bright)' : 'var(--text-muted)' }}>
                      {leader.rank === 1 && '🥇 #1'}
                      {leader.rank === 2 && '🥈 #2'}
                      {leader.rank === 3 && '🥉 #3'}
                      {leader.rank > 3 && `#${leader.rank}`}
                    </td>
                    <td className="leaderboard-td" style={{ color: '#FFF', fontWeight: 600 }}>
                      <span style={{ marginRight: '8px' }}>{leader.badge}</span>
                      <span>{leader.name}</span>
                    </td>
                    <td className="leaderboard-td" style={{ color: 'var(--text-secondary)' }}>
                      {leader.title}
                    </td>
                    <td className="leaderboard-td" style={{ color: 'var(--saffron)', fontWeight: 600 }}>
                      {leader.streak}d
                    </td>
                    <td className="leaderboard-td" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gold-bright)', fontFamily: 'var(--font-hud)' }}>
                      {leader.rp.toLocaleString()} RP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
      </>
      )}
    </div>
  );
};

export default Rankings;
