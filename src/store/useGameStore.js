import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const RANKS = [
  { threshold: 0, title: 'Jijnasu (The Curious Seeker)', tier: 'Novice', color: '#A0AEC0' },
  { threshold: 250, title: 'Brahmachari (Dedicated Student)', tier: 'Adept', color: '#4FD1C5' },
  { threshold: 750, title: 'Sadhaka (Spiritual Practitioner)', tier: 'Ascendant', color: '#63B3ED' },
  { threshold: 1800, title: 'Upadhyaya (Vedic Scholar)', tier: 'Master', color: '#F6E05E' },
  { threshold: 3500, title: 'Rishi (Seer of Mantras)', tier: 'Grandmaster', color: '#ED8936' },
  { threshold: 7000, title: 'Maharshi (Cosmic Sage)', tier: 'Immortal', color: '#9F7AEA' },
  { threshold: 15000, title: 'Brahmarshi (Awakened Light)', tier: 'Transcendent', color: '#F6AD55' }
];

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Player Core Vitals
      rp: 120, // Radiance Points (XP)
      hp: 100, // Spiritual Vitality / Fortitude
      maxHp: 100,
      prana: 85, // Mana / Focus energy for chanting
      maxPrana: 100,
      streak: 3,
      vedaBg: '/bg-rig.png',
      soundEnabled: true,
      hapticsEnabled: true,

      // Inventory & Sacred Relics
      relics: [
        { id: 'rudraksha', name: 'Gauri Shankar Rudraksha', desc: '+15% Tapasya resonance on meditation', rarity: 'Legendary', icon: '📿', count: 1 },
        { id: 'conch', name: 'Panchajanya Conch Shell', desc: 'Emits a sound wave that dispels doubts', rarity: 'Epic', icon: '🐚', count: 1 },
        { id: 'palm_leaf', name: 'Ancient Birch Bark Folio', desc: 'Contains fragments of Atharva healing hymns', rarity: 'Rare', icon: '📜', count: 2 }
      ],

      // Campaign Progression (Arishadvarga Inner Trials)
      unlockedRealms: 2,
      activeTrial: null,
      completedTrials: ['trial-1'],

      // Stats
      versesMastered: 14,
      quizzesWon: 8,
      mantrasRecited: 36,

      // Store Actions
      addRp: (amount) => set((state) => ({ rp: state.rp + amount })),
      
      takeDamage: (amount) => set((state) => ({
        hp: Math.max(0, state.hp - amount)
      })),

      heal: (amount) => set((state) => ({
        hp: Math.min(state.maxHp, state.hp + amount)
      })),

      usePrana: (amount) => {
        const current = get().prana;
        if (current >= amount) {
          set({ prana: current - amount });
          return true;
        }
        return false;
      },

      restorePrana: (amount) => set((state) => ({
        prana: Math.min(state.maxPrana, state.prana + amount)
      })),

      setVedaBg: (bgUrl) => set({ vedaBg: bgUrl }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      getRank: () => {
        const currentRp = get().rp;
        let rank = RANKS[0];
        for (let i = 0; i < RANKS.length; i++) {
          if (currentRp >= RANKS[i].threshold) {
            rank = RANKS[i];
          } else {
            break;
          }
        }
        return rank;
      },

      getNextRankThreshold: () => {
        const currentRp = get().rp;
        const next = RANKS.find(r => r.threshold > currentRp);
        return next ? next.threshold : currentRp;
      },

      unlockRelic: (relic) => set((state) => {
        const existing = state.relics.find(r => r.id === relic.id);
        if (existing) {
          return {
            relics: state.relics.map(r => r.id === relic.id ? { ...r, count: r.count + 1 } : r)
          };
        }
        return { relics: [...state.relics, { ...relic, count: 1 }] };
      }),

      completeTrial: (trialId, rewardRp = 200) => set((state) => ({
        completedTrials: [...new Set([...state.completedTrials, trialId])],
        rp: state.rp + rewardRp,
        unlockedRealms: Math.max(state.unlockedRealms, state.completedTrials.length + 2)
      }))
    }),
    {
      name: 'sutra-game-store',
      partialize: (state) => ({
        rp: state.rp,
        hp: state.hp,
        streak: state.streak,
        relics: state.relics,
        unlockedRealms: state.unlockedRealms,
        completedTrials: state.completedTrials,
        versesMastered: state.versesMastered,
        quizzesWon: state.quizzesWon,
        soundEnabled: state.soundEnabled
      })
    }
  )
);
