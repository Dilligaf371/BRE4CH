import { useEffect, useRef, type RefObject } from 'react';
import {
  ATTACK_CORRIDORS,
  FLOW_COLORS,
  type AttackCorridor,
} from '../data/attackCorridors';

// ── Active flow instance ─────────────────────────────────────────
interface Flow {
  corridor: AttackCorridor;
  progress: number;       // 0 → 1 (in-flight), > 1 (impact phase)
  speed: number;          // progress increment per frame (~0.003-0.008)
  trailLen: number;       // how far back the trail stretches (0.08-0.20)
  impactAge: number;      // frames since impact (for ring animation)
  opacity: number;        // master opacity (fades during impact)
}

// ── Helpers ──────────────────────────────────────────────────────
function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Quadratic bezier point: P = (1-t)²·A + 2(1-t)t·C + t²·B */
function getArcPoint(
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number,
  t: number,
) {
  const u = 1 - t;
  return {
    x: u * u * ax + 2 * u * t * cx + t * t * bx,
    y: u * u * ay + 2 * u * t * cy + t * t * by,
  };
}

/** Convert a hex colour string to {r,g,b} */
function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// ── Hook ─────────────────────────────────────────────────────────
export function useAttackFlowCanvas(
  mapRef: RefObject<google.maps.Map | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  showConventional: boolean,
  showCyber: boolean,
) {
  // Refs to keep mutable state across rAF frames
  const flowsRef = useRef<Flow[]>([]);
  const lastSpawnRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const map = mapRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const active = showConventional || showCyber;
    if (!active) {
      // Clear canvas and stop animation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flowsRef.current = [];
      return;
    }

    // ── Canvas sizing (retina) ────────────────────────────────
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Lat/Lng → pixel conversion ────────────────────────────
    function latLngToPixel(lat: number, lng: number): { x: number; y: number } | null {
      const proj = map!.getProjection();
      if (!proj) return null;
      const bounds = map!.getBounds();
      if (!bounds) return null;

      const topRight = proj.fromLatLngToPoint(bounds.getNorthEast())!;
      const bottomLeft = proj.fromLatLngToPoint(bounds.getSouthWest())!;
      const point = proj.fromLatLngToPoint(new google.maps.LatLng(lat, lng))!;

      const scale = Math.pow(2, map!.getZoom()!);
      const rect = canvas!.getBoundingClientRect();

      // Handle world wrapping
      let worldWidth = topRight.x - bottomLeft.x;
      if (worldWidth < 0) worldWidth += 256;

      const x = ((point.x - bottomLeft.x) / worldWidth) * rect.width;
      const y =
        ((point.y - topRight.y) / (bottomLeft.y - topRight.y)) * rect.height;

      return { x, y };
    }

    // ── Spawn logic ───────────────────────────────────────────
    const eligible = ATTACK_CORRIDORS.filter((c) => {
      if (c.category === 'conventional' && showConventional) return true;
      if (c.category === 'cyber' && showCyber) return true;
      return false;
    });

    const MAX_CONV = 25;
    const MAX_CYBER = 15;

    function spawnFlow() {
      if (eligible.length === 0) return;

      // Enforce pool limits
      const convCount = flowsRef.current.filter(
        (f) => f.corridor.category === 'conventional',
      ).length;
      const cyberCount = flowsRef.current.filter(
        (f) => f.corridor.category === 'cyber',
      ).length;

      // Pick a random eligible corridor
      const corridor = eligible[Math.floor(Math.random() * eligible.length)];
      if (corridor.category === 'conventional' && convCount >= MAX_CONV) return;
      if (corridor.category === 'cyber' && cyberCount >= MAX_CYBER) return;

      flowsRef.current.push({
        corridor,
        progress: 0,
        speed: corridor.category === 'cyber' ? rand(0.004, 0.009) : rand(0.003, 0.007),
        trailLen: corridor.category === 'cyber' ? rand(0.06, 0.12) : rand(0.10, 0.22),
        impactAge: 0,
        opacity: 1,
      });
    }

    // ── Animation frame ───────────────────────────────────────
    let lastTime = 0;
    const IMPACT_FRAMES = 40; // ~0.67s at 60fps

    function frame(time: number) {
      rafRef.current = requestAnimationFrame(frame);

      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);

      // Spawn new flows every 600–1400ms
      if (time - lastSpawnRef.current > rand(600, 1400)) {
        spawnFlow();
        lastSpawnRef.current = time;
      }

      // Update & render each flow
      const nextFlows: Flow[] = [];

      for (const flow of flowsRef.current) {
        const { corridor } = flow;
        const color = FLOW_COLORS[corridor.type];
        const rgb = hexToRgb(color);
        const isCyber = corridor.category === 'cyber';

        const srcPx = latLngToPixel(corridor.source.lat, corridor.source.lng);
        const tgtPx = latLngToPixel(corridor.target.lat, corridor.target.lng);
        if (!srcPx || !tgtPx) {
          nextFlows.push(flow);
          continue;
        }

        // Control point for arc (midpoint raised upward)
        const midX = (srcPx.x + tgtPx.x) / 2;
        const midY = (srcPx.y + tgtPx.y) / 2;
        const dist = Math.hypot(tgtPx.x - srcPx.x, tgtPx.y - srcPx.y);
        const arcHeight = dist * (isCyber ? 0.15 : 0.3);
        const ctrlX = midX;
        const ctrlY = midY - arcHeight;

        if (flow.progress <= 1) {
          // ── In-flight ────────────────────────────────────
          flow.progress += flow.speed;

          // Trail
          const trailStart = Math.max(0, flow.progress - flow.trailLen);
          const steps = isCyber ? 20 : 30;

          ctx!.save();
          if (isCyber) {
            ctx!.setLineDash([4, 6]);
          }

          for (let i = 0; i < steps; i++) {
            const t0 = trailStart + ((flow.progress - trailStart) * i) / steps;
            const t1 =
              trailStart + ((flow.progress - trailStart) * (i + 1)) / steps;
            const p0 = getArcPoint(srcPx.x, srcPx.y, tgtPx.x, tgtPx.y, ctrlX, ctrlY, Math.min(t0, 1));
            const p1 = getArcPoint(srcPx.x, srcPx.y, tgtPx.x, tgtPx.y, ctrlX, ctrlY, Math.min(t1, 1));

            const alpha = (i / steps) * 0.7 * flow.opacity;
            ctx!.beginPath();
            ctx!.moveTo(p0.x, p0.y);
            ctx!.lineTo(p1.x, p1.y);
            ctx!.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
            ctx!.lineWidth = isCyber ? 1 : 1.5;
            ctx!.stroke();
          }
          ctx!.restore();

          // Head particle (glowing dot)
          const head = getArcPoint(
            srcPx.x, srcPx.y, tgtPx.x, tgtPx.y, ctrlX, ctrlY,
            Math.min(flow.progress, 1),
          );
          ctx!.save();
          ctx!.shadowColor = color;
          ctx!.shadowBlur = isCyber ? 8 : 14;
          ctx!.beginPath();
          ctx!.arc(head.x, head.y, isCyber ? 2 : 3, 0, Math.PI * 2);
          ctx!.fillStyle = color;
          ctx!.fill();
          ctx!.restore();

          // Source pulse (early flight)
          if (flow.progress < 0.3) {
            const pulseR = 6 + Math.sin(flow.progress * 30) * 3;
            const pulseAlpha = (1 - flow.progress / 0.3) * 0.5;
            ctx!.beginPath();
            ctx!.arc(srcPx.x, srcPx.y, pulseR, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${pulseAlpha})`;
            ctx!.fill();
          }

          nextFlows.push(flow);
        } else {
          // ── Impact phase ─────────────────────────────────
          flow.impactAge++;
          flow.opacity = 1 - flow.impactAge / IMPACT_FRAMES;

          if (flow.impactAge < IMPACT_FRAMES) {
            // Expanding ring at target
            const ringR = 4 + (flow.impactAge / IMPACT_FRAMES) * 20;
            ctx!.beginPath();
            ctx!.arc(tgtPx.x, tgtPx.y, ringR, 0, Math.PI * 2);
            ctx!.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${flow.opacity * 0.8})`;
            ctx!.lineWidth = 1.5;
            ctx!.stroke();

            // Inner glow
            const grad = ctx!.createRadialGradient(
              tgtPx.x, tgtPx.y, 0,
              tgtPx.x, tgtPx.y, ringR,
            );
            grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${flow.opacity * 0.4})`);
            grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
            ctx!.beginPath();
            ctx!.arc(tgtPx.x, tgtPx.y, ringR, 0, Math.PI * 2);
            ctx!.fillStyle = grad;
            ctx!.fill();

            nextFlows.push(flow);
          }
          // else: expired, don't keep
        }
      }

      flowsRef.current = nextFlows;
    }

    rafRef.current = requestAnimationFrame(frame);

    // Also re-render on map changes
    const listeners = [
      map.addListener('bounds_changed', () => {}),
      map.addListener('zoom_changed', () => {}),
    ];

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      listeners.forEach((l) => google.maps.event.removeListener(l));
    };
  }, [mapRef, canvasRef, showConventional, showCyber]);
}
