"use client";

import { useEffect, useRef } from "react";

// Interactive glowing-dots background. Dots drift slowly and react to the cursor:
// nearby dots are gently pushed and brighten, then ease back. Canvas-based, light.

interface Dot {
  bx: number; // base position
  by: number;
  x: number;
  y: number;
  r: number;
  phase: number; // ambient drift phase
  speed: number;
  hue: number; // 0 = white-ish, 1 = lime
}

export function HeroDots() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let dots: Dot[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let raf = 0;
    let t = 0;

    function build() {
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area, capped for performance.
      const count = Math.min(110, Math.floor((w * h) / 13000));
      dots = Array.from({ length: count }, (_, i) => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          bx: x,
          by: y,
          x,
          y,
          r: 0.6 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.6,
          // most dots are faint white, a minority are lime — sparser accent
          hue: Math.random() < 0.28 ? 1 : 0,
        };
      });
    }

    function frame() {
      t += 0.005;
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";

      for (const d of dots) {
        // Ambient drift around the base point.
        const driftX = Math.cos(d.phase + t * d.speed) * 10;
        const driftY = Math.sin(d.phase * 1.3 + t * d.speed) * 10;
        let tx = d.bx + driftX;
        let ty = d.by + driftY;

        // Cursor repulsion + proximity glow.
        let glow = 0;
        if (mouse.active) {
          const dx = tx - mouse.x;
          const dy = ty - mouse.y;
          const dist2 = dx * dx + dy * dy;
          const R = 150;
          if (dist2 < R * R) {
            const dist = Math.sqrt(dist2) || 1;
            const force = (1 - dist / R) * 26;
            tx += (dx / dist) * force;
            ty += (dy / dist) * force;
            glow = 1 - dist / R;
          }
        }

        // Ease toward target for a soft, springy feel.
        d.x += (tx - d.x) * 0.12;
        d.y += (ty - d.y) * 0.12;

        const baseAlpha = d.hue === 1 ? 0.55 : 0.4;
        const alpha = Math.min(1, baseAlpha + glow * 0.6);
        const radius = d.r + glow * 1.6;

        // soft glow
        const grad = ctx!.createRadialGradient(d.x, d.y, 0, d.x, d.y, radius * 4);
        const core = d.hue === 1 ? "203,255,77" : "235,235,245";
        grad.addColorStop(0, `rgba(${core},${alpha})`);
        grad.addColorStop(1, `rgba(${core},0)`);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, radius * 4, 0, Math.PI * 2);
        ctx!.fill();

        // crisp core
        ctx!.fillStyle = `rgba(${core},${alpha})`;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    build();
    if (reduce) {
      // Draw a single static frame, no animation.
      ctx.globalCompositeOperation = "lighter";
      for (const d of dots) {
        const core = d.hue === 1 ? "203,255,77" : "235,235,245";
        ctx.fillStyle = `rgba(${core},${d.hue === 1 ? 0.5 : 0.35})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => build();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="hero-dots pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
