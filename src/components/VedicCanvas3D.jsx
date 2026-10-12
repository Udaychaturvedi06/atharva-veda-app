import React, { useRef, useEffect } from 'react';

const VedicCanvas3D = ({ intensity = 1.0 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for 3D tilt
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle Embers System (Agni Sparks)
    const particleCount = 70;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: -Math.random() * 0.9 - 0.2, // Drifting upwards like flame embers
      alpha: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? 'rgba(255, 179, 71,' : 'rgba(255, 94, 30,' // Gold and Agni Orange
    }));

    let rotationAngle = 0;

    const render = () => {
      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2 + (mouse.x - width / 2) * 0.04;
      const centerY = height / 2 + (mouse.y - height / 2) * 0.04;

      // 1. Draw 3D Rotating Concentric Sacred Mandala
      rotationAngle += 0.003 * intensity;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Layer 1: Outermost Petal Ring
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)'; // Golden foil wire
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const outerRadius = Math.min(width, height) * 0.38;
      ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Layer 2: Rotating 16-point geometric stars
      const rings = [
        { r: outerRadius * 0.85, pts: 16, rot: rotationAngle * 0.7, color: 'rgba(255, 198, 88, 0.12)' },
        { r: outerRadius * 0.65, pts: 12, rot: -rotationAngle * 1.1, color: 'rgba(255, 140, 0, 0.16)' },
        { r: outerRadius * 0.45, pts: 8,  rot: rotationAngle * 1.5, color: 'rgba(255, 215, 0, 0.22)' },
        { r: outerRadius * 0.22, pts: 6,  rot: -rotationAngle * 2.0, color: 'rgba(255, 94, 30, 0.35)' }
      ];

      rings.forEach(ring => {
        ctx.save();
        ctx.rotate(ring.rot);
        ctx.strokeStyle = ring.color;
        ctx.beginPath();
        for (let i = 0; i < ring.pts * 2; i++) {
          const r = i % 2 === 0 ? ring.r : ring.r * 0.65;
          const theta = (i * Math.PI) / ring.pts;
          const x = r * Math.cos(theta);
          const y = r * Math.sin(theta);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Little radiant nodes on vertices
        for (let i = 0; i < ring.pts; i++) {
          const theta = (i * 2 * Math.PI) / ring.pts;
          const px = ring.r * Math.cos(theta);
          const py = ring.r * Math.sin(theta);
          ctx.fillStyle = ring.color;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Layer 3: Central Golden Bindu Core (Vedic Cosmic Center)
      const binduPulse = Math.sin(rotationAngle * 4) * 3 + 6;
      const binduGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, binduPulse * 2.5);
      binduGrad.addColorStop(0, 'rgba(255, 240, 180, 0.9)');
      binduGrad.addColorStop(0.5, 'rgba(255, 160, 40, 0.5)');
      binduGrad.addColorStop(1, 'rgba(255, 94, 30, 0)');
      ctx.fillStyle = binduGrad;
      ctx.beginPath();
      ctx.arc(0, 0, binduPulse * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 2. Render Agni Embers Particles
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.03;

        // Reset if drifted off screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const dynamicAlpha = Math.max(0.05, Math.min(0.9, p.alpha + Math.sin(p.pulse) * 0.2));
        ctx.fillStyle = `${p.color} ${dynamicAlpha})`;
        ctx.shadowColor = 'rgba(255, 140, 0, 0.5)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.95
      }}
    />
  );
};

export default VedicCanvas3D;
