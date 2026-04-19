import { useEffect, useRef } from 'react';

/**
 * Optimized interactive particle constellation.
 * Uses spatial grid for O(n) connection checks instead of O(n²).
 */
export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, particles, mouse, animId;
    const COUNT = 80; // reduced for performance
    const CONN_DIST = 130;
    const MOUSE_R = 180;

    const G = { r: 212, g: 175, b: 55 };
    const GL = { r: 232, g: 213, b: 163 };
    mouse = { x: -1000, y: -1000 };

    class P {
      constructor() { this.init(); }
      init() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.s = 1 + Math.random() * 1.8;
        this.bs = this.s;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.o = 0.2 + Math.random() * 0.35;
        this.bo = this.o;
        this.glow = Math.random() < 0.12;
        this.ph = Math.random() * 6.28;
        this.ps = 0.01 + Math.random() * 0.008;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.ph += this.ps;
        const pulse = Math.sin(this.ph) * 0.25 + 0.75;
        this.o = this.bo * pulse;
        this.s = this.bs * (0.9 + pulse * 0.2);

        // Mouse
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R) {
          const f = (1 - d / MOUSE_R) * 0.6;
          this.vx += (dx / d) * f * 0.2;
          this.vy += (dy / d) * f * 0.2;
          this.o = Math.min(this.bo + f * 0.4, 0.85);
          this.s = this.bs + f * 1.5;
        }

        this.vx *= 0.992;
        this.vy *= 0.992;
        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (spd > 1) { this.vx *= 0.96; this.vy *= 0.96; }

        if (this.x < -10) this.x = w + 10;
        if (this.x > w + 10) this.x = -10;
        if (this.y < -10) this.y = h + 10;
        if (this.y > h + 10) this.y = -10;
      }

      draw() {
        if (this.glow) {
          const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.s * 3.5);
          g.addColorStop(0, `rgba(${GL.r},${GL.g},${GL.b},${this.o})`);
          g.addColorStop(0.4, `rgba(${G.r},${G.g},${G.b},${this.o * 0.3})`);
          g.addColorStop(1, `rgba(${G.r},${G.g},${G.b},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.s * 3.5, 0, 6.28);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(${G.r},${G.g},${G.b},${this.o})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.s, 0, 6.28);
          ctx.fill();
        }
      }
    }

    function drawConns() {
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > CONN_DIST * CONN_DIST) continue;

          const d = Math.sqrt(d2);
          let op = (1 - d / CONN_DIST) * 0.1;

          // Mouse boost
          const mx = (a.x + b.x) * 0.5 - mouse.x;
          const my = (a.y + b.y) * 0.5 - mouse.y;
          const md = Math.sqrt(mx * mx + my * my);
          if (md < MOUSE_R) op += (1 - md / MOUSE_R) * 0.15;

          ctx.strokeStyle = `rgba(${G.r},${G.g},${G.b},${op})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5); // cap DPR for perf
      w = canvas.parentElement.clientWidth;
      h = canvas.parentElement.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      particles = Array.from({ length: COUNT }, () => new P());
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      // Mouse glow
      if (mouse.x > 0 && mouse.x < w && mouse.y > 0 && mouse.y < h) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_R * 0.5);
        g.addColorStop(0, `rgba(${G.r},${G.g},${G.b},0.03)`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      drawConns();
      for (const p of particles) { p.update(); p.draw(); }
      animId = requestAnimationFrame(frame);
    }

    const onMouse = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -1000; mouse.y = -1000; };

    init();
    animId = requestAnimationFrame(frame);

    const onResize = () => { resize(); particles.forEach(p => { if (p.x > w || p.y > h) p.init(); }); };
    window.addEventListener('resize', onResize);
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
    />
  );
}
