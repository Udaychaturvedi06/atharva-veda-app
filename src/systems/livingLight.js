/**
 * Living Light Engine
 * Maps user's local diurnal cycle (Vedic Praharas) to cosmic lighting & color temperature
 */

export const VEDIC_PERIODS = {
  BRAHMA_MUHURTA: {
    id: 'brahma_muhurta',
    name: 'Brahma Muhurta (Pre-Dawn Silence)',
    ambient: '#09081E',
    glow: '#805AD5',
    accent: '#63B3ED'
  },
  USHAS: {
    id: 'ushas',
    name: 'Ushas (Sacred Sunrise)',
    ambient: '#180B07',
    glow: '#FF7B00',
    accent: '#FFE259'
  },
  MADHYAHNA: {
    id: 'madhyahna',
    name: 'Madhyahna (Zenith White-Gold)',
    ambient: '#0C0C14',
    glow: '#D4AF37',
    accent: '#FFFDF0'
  },
  SANDHYA: {
    id: 'sandhya',
    name: 'Sandhya (Twilight Agni Crimson)',
    ambient: '#1A070F',
    glow: '#FF4D6D',
    accent: '#FF7B00'
  },
  RATRI: {
    id: 'ratri',
    name: 'Ratri (Cosmic Deep Night)',
    ambient: '#06060D',
    glow: '#00F0FF',
    accent: '#63B3ED'
  }
};

export const getDiurnalPeriod = (overrideMode = 'auto') => {
  if (overrideMode === 'dawn') return VEDIC_PERIODS.USHAS;
  if (overrideMode === 'night') return VEDIC_PERIODS.RATRI;
  if (overrideMode === 'zenith') return VEDIC_PERIODS.MADHYAHNA;

  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  if (hour >= 3.5 && hour < 5.5) {
    return VEDIC_PERIODS.BRAHMA_MUHURTA;
  } else if (hour >= 5.5 && hour < 9.0) {
    return VEDIC_PERIODS.USHAS;
  } else if (hour >= 11.0 && hour < 15.0) {
    return VEDIC_PERIODS.MADHYAHNA;
  } else if (hour >= 17.0 && hour < 19.5) {
    return VEDIC_PERIODS.SANDHYA;
  } else {
    return VEDIC_PERIODS.RATRI;
  }
};

let lightIntervalId = null;

export const initLivingLight = (mode = 'auto') => {
  if (typeof window === 'undefined') return;

  const apply = () => {
    const period = getDiurnalPeriod(mode);
    const root = document.documentElement;
    root.style.setProperty('--light-ambient', period.ambient);
    root.style.setProperty('--light-glow', period.glow);
    root.style.setProperty('--light-accent', period.accent);
    root.setAttribute('data-period', period.id);
  };

  apply();
  if (lightIntervalId) clearInterval(lightIntervalId);
  lightIntervalId = setInterval(apply, 60000); // Check every minute
};

export const stopLivingLight = () => {
  if (lightIntervalId) {
    clearInterval(lightIntervalId);
    lightIntervalId = null;
  }
};
