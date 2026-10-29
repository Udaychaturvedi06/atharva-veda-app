/**
 * DPR-aware Canvas setup and rendering utilities
 */
export const setupCanvas = (canvas, width = 800, height = 600) => {
  if (!canvas) return { ctx: null, dpr: 1 };
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;

  return { ctx, dpr, width, height };
};

/**
 * Screen-Shake Manager
 */
export class ScreenShake {
  constructor() {
    this.intensity = 0;
    this.decay = 0.9;
  }

  trigger(amount = 8) {
    this.intensity = amount;
  }

  apply(ctx) {
    if (this.intensity > 0.3) {
      const offsetX = (Math.random() - 0.5) * this.intensity * 2;
      const offsetY = (Math.random() - 0.5) * this.intensity * 2;
      ctx.translate(offsetX, offsetY);
      this.intensity *= this.decay;
    } else {
      this.intensity = 0;
    }
  }
}

/**
 * Floating Score Popups Manager
 */
export class ScorePopups {
  constructor() {
    this.popups = [];
  }

  add(x, y, text, color = '#FFE259') {
    this.popups.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.5,
      life: 40
    });
  }

  updateAndDraw(ctx) {
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.y += p.vy;
      p.alpha -= 0.025;
      p.life--;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.font = 'bold 16px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();

      if (p.life <= 0 || p.alpha <= 0) {
        this.popups.splice(i, 1);
      }
    }
  }
}

/**
 * Particle Spark System
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawn(x, y, count = 12, colors = ['#FFE259', '#FF7B00', '#FF5E1E']) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.03 + 0.015
      });
    }
  }

  updateAndDraw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    ctx.restore();
  }
}
