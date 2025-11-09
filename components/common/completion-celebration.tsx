'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

export type CompletionCelebrationProps = {
  readonly isComplete: boolean;
  readonly onDone?: () => void;
};

export type CompletionCelebrationEventDetail = {
  readonly runId: number;
};

export const COMPLETION_CELEBRATION_EVENT = 'completion-celebration-run';

declare global {
  interface WindowEventMap {
    'completion-celebration-run': CustomEvent<CompletionCelebrationEventDetail>;
  }
}

const FIREWORK_DURATION_MS = 1800;
const TOAST_DURATION_MS = 2500;
const MAX_PARTICLES = 750;
const BURST_COUNT = 3;
const PARTICLES_PER_BURST = Math.floor(MAX_PARTICLES / BURST_COUNT);
const GRAVITY = 380;
const FRICTION = 0.96;
const COLOR_PALETTE = ['#ecfdf5', '#d1fae5', '#bbf7d0', '#86efac', '#34d399'];

export function CompletionCelebration({ isComplete, onDone }: CompletionCelebrationProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [canTrigger, setCanTrigger] = useState(true);
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [renderToast, setRenderToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const runCounterRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hideToastTimeoutRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);
  const burstsTimeoutRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isComplete) {
      setCanTrigger(true);
      return;
    }

    if (!canTrigger) {
      return;
    }

    if (prefersReducedMotion) {
      setCanTrigger(false);
      onDone?.();
      return;
    }

    const nextRunId = runCounterRef.current + 1;
    runCounterRef.current = nextRunId;
    setRenderToast(true);
    setToastVisible(true);
    setActiveRunId(nextRunId);
    setCanTrigger(false);
  }, [canTrigger, isComplete, onDone, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (hideToastTimeoutRef.current != null) {
        window.clearTimeout(hideToastTimeoutRef.current);
      }
      if (finishTimeoutRef.current != null) {
        window.clearTimeout(finishTimeoutRef.current);
      }
      burstsTimeoutRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      burstsTimeoutRef.current = [];
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (activeRunId == null) {
      return;
    }

    if (typeof window !== 'undefined') {
      const detail: CompletionCelebrationEventDetail = { runId: activeRunId };
      window.dispatchEvent(new CustomEvent(COMPLETION_CELEBRATION_EVENT, { detail }));
    }

    if (hideToastTimeoutRef.current != null) {
      window.clearTimeout(hideToastTimeoutRef.current);
    }
    if (finishTimeoutRef.current != null) {
      window.clearTimeout(finishTimeoutRef.current);
    }

    hideToastTimeoutRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, TOAST_DURATION_MS - 320);

    finishTimeoutRef.current = window.setTimeout(() => {
      setRenderToast(false);
      setActiveRunId(null);
      setToastVisible(false);
      onDone?.();
    }, TOAST_DURATION_MS);
  }, [activeRunId, onDone]);

  useEffect(() => {
    if (activeRunId == null) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;

    const positionsX = new Float32Array(MAX_PARTICLES);
    const positionsY = new Float32Array(MAX_PARTICLES);
    const velocitiesX = new Float32Array(MAX_PARTICLES);
    const velocitiesY = new Float32Array(MAX_PARTICLES);
    const lifetimes = new Float32Array(MAX_PARTICLES);
    const sizes = new Float32Array(MAX_PARTICLES);
    const colorIndexes = new Uint8Array(MAX_PARTICLES);

    let particlesUsed = 0;

    const resize = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const devicePixelRatio = window.devicePixelRatio ?? 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(devicePixelRatio, devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const spawnBurst = (originX: number, originY: number, baseSpeed: number) => {
      const available = Math.min(PARTICLES_PER_BURST, MAX_PARTICLES - particlesUsed);
      for (let i = 0; i < available; i += 1) {
        const index = particlesUsed + i;
        const angle = Math.random() * Math.PI * 2;
        const speed = baseSpeed * (0.5 + Math.random() * 0.8);
        positionsX[index] = originX;
        positionsY[index] = originY;
        velocitiesX[index] = Math.cos(angle) * speed;
        velocitiesY[index] = Math.sin(angle) * speed;
        lifetimes[index] = 1;
        sizes[index] = 1 + Math.random() * 2;
        colorIndexes[index] = Math.floor(Math.random() * COLOR_PALETTE.length) as number;
      }
      particlesUsed += available;
    };

    const spawnDelays = [0, 260, 560];
    burstsTimeoutRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    burstsTimeoutRef.current = spawnDelays.map((delay, index) =>
      window.setTimeout(() => {
        const origin =
          index === 0
            ? { x: width / 2, y: height / 2 }
            : {
                x: width * (0.2 + Math.random() * 0.6),
                y: height * (0.25 + Math.random() * 0.4),
              };
        spawnBurst(origin.x, origin.y, 240);
      }, delay)
    );

    let lastTime = performance.now();
    const startTime = lastTime;

    const step = (timestamp: number) => {
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      context.clearRect(0, 0, width, height);

      let activeParticles = 0;

      for (let i = 0; i < particlesUsed; i += 1) {
        const life = lifetimes[i];
        if (life <= 0) {
          continue;
        }

        activeParticles += 1;

        velocitiesX[i] *= FRICTION;
        velocitiesY[i] = velocitiesY[i] * FRICTION + GRAVITY * delta;

        positionsX[i] += velocitiesX[i] * delta;
        positionsY[i] += velocitiesY[i] * delta;

        lifetimes[i] = life - delta / 1.1;

        if (lifetimes[i] <= 0) {
          continue;
        }

        const opacity = Math.min(1, Math.max(0, lifetimes[i]));
        context.globalAlpha = opacity;
        context.fillStyle = COLOR_PALETTE[colorIndexes[i]];
        const size = sizes[i];
        context.fillRect(positionsX[i], positionsY[i], size, size);
      }

      context.globalAlpha = 1;

      const elapsed = timestamp - startTime;
      if (elapsed < FIREWORK_DURATION_MS || activeParticles > 0) {
        animationFrameRef.current = requestAnimationFrame(step);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      burstsTimeoutRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      burstsTimeoutRef.current = [];
      window.removeEventListener('resize', resize);
      context.clearRect(0, 0, width, height);
    };
  }, [activeRunId]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <>
      {renderToast ? (
        <motion.div
          className="pointer-events-none fixed top-6 z-[70]"
          style={{ left: '50%' }}
          initial={{ opacity: 0, transform: 'translate(-50%, -16px) scale(0.9)' }}
          animate={{
            opacity: toastVisible ? 1 : 0,
            transform: toastVisible
              ? 'translate(-50%, 0px) scale(1)'
              : 'translate(-50%, -12px) scale(0.96)',
          }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <div className="rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 dark:bg-emerald-500">
            All done!
          </div>
        </motion.div>
      ) : null}
      {activeRunId != null ? (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
      ) : null}
    </>
  );
}
