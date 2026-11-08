'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BotanicalSimulation } from '../lib/botanicalPhysics';
import { botanicalAudio } from '../lib/botanicalAudio';
import { PacingSettings } from '../lib/storage';

interface GardenCanvasProps {
  speciesId: 'moonflower' | 'jasmine' | 'fern';
  pacing: PacingSettings;
  hapticsEnabled: boolean;
  isInSession: boolean;
  onStepChange: (step: number) => void;
  onBloom: () => void;
  onStateChange: (state: 'idle' | 'inhaling' | 'exhaling' | 'bloomed') => void;
  onProgressUpdate: (inhaleProg: number, exhaleProg: number) => void;
}

export const GardenCanvas: React.FC<GardenCanvasProps> = ({
  speciesId,
  pacing,
  hapticsEnabled,
  isInSession,
  onStepChange,
  onBloom,
  onStateChange,
  onProgressUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<BotanicalSimulation | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const breathStateRef = useRef<'idle' | 'inhaling' | 'exhaling' | 'bloomed'>('idle');
  const holdTimeRef = useRef<number>(0);
  const exhaleTimeRef = useRef<number>(0);
  const stepCountRef = useRef<number>(0);
  const hasVibratedMidInhaleRef = useRef<boolean>(false);

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!hapticsEnabled || typeof window === 'undefined') return;
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch {}
      }
    },
    [hapticsEnabled]
  );

  // Initialize simulation
  useEffect(() => {
    if (!canvasRef.current) return;
    const sim = new BotanicalSimulation(canvasRef.current, speciesId);
    simRef.current = sim;

    const handleResize = () => {
      sim.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [speciesId]);

  // Update species if changed
  useEffect(() => {
    if (simRef.current) {
      simRef.current.setSpecies(speciesId);
      stepCountRef.current = 0;
      breathStateRef.current = 'idle';
      onStepChange(0);
      onStateChange('idle');
    }
  }, [speciesId, onStepChange, onStateChange]);

  const startInhale = useCallback(() => {
    if (breathStateRef.current === 'inhaling' || breathStateRef.current === 'bloomed') return;

    breathStateRef.current = 'inhaling';
    holdTimeRef.current = 0;
    hasVibratedMidInhaleRef.current = false;
    onStateChange('inhaling');

    botanicalAudio.init();
    botanicalAudio.startInhale(pacing.inhale);
    vibrate([10, 35, 15]);
  }, [pacing.inhale, onStateChange, vibrate]);

  const startExhale = useCallback(() => {
    if (breathStateRef.current !== 'inhaling') return;

    breathStateRef.current = 'exhaling';
    exhaleTimeRef.current = 0;
    onStateChange('exhaling');

    botanicalAudio.startExhale(pacing.exhale);

    // Organic growth step occurs upon release
    setTimeout(() => {
      if (!simRef.current) return;
      const grew = simRef.current.advanceStep();
      if (grew) {
        stepCountRef.current = simRef.current.growthStep;
        onStepChange(simRef.current.growthStep);
        botanicalAudio.playGrowthStep();
        vibrate(16);

        if (simRef.current.isBloomed) {
          breathStateRef.current = 'bloomed';
          onStateChange('bloomed');
          botanicalAudio.playBloom();
          vibrate([25, 50, 25, 50, 35]);
          onBloom();
        }
      }
    }, 120);
  }, [pacing.exhale, onStateChange, onStepChange, onBloom, vibrate]);

  // Global Pointer & Spacebar listeners for seamless one-handed play
  useEffect(() => {
    if (!isInSession) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Don't trigger if tapping interactive buttons / settings modals
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, input, a, [role="dialog"], .interactive-ui')) {
        return;
      }
      startInhale();
    };

    const handlePointerUp = () => {
      if (breathStateRef.current === 'inhaling') {
        startExhale();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && breathStateRef.current !== 'inhaling') {
        e.preventDefault();
        startInhale();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && breathStateRef.current === 'inhaling') {
        e.preventDefault();
        startExhale();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    window.addEventListener('pointercancel', handlePointerUp, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isInSession, startInhale, startExhale]);

  // Main 60fps Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Update breathing timers
      if (breathStateRef.current === 'inhaling') {
        holdTimeRef.current += dt;
        if (holdTimeRef.current > 2.0 && !hasVibratedMidInhaleRef.current) {
          vibrate(8);
          hasVibratedMidInhaleRef.current = true;
        }
      } else if (breathStateRef.current === 'exhaling') {
        exhaleTimeRef.current += dt;
        if (exhaleTimeRef.current >= pacing.exhale) {
          if (stepCountRef.current < 10) {
            breathStateRef.current = 'idle';
            onStateChange('idle');
          }
        }
      }

      const inhaleProg = Math.min(1.0, holdTimeRef.current / pacing.inhale);
      const exhaleProg = Math.min(1.0, exhaleTimeRef.current / pacing.exhale);
      onProgressUpdate(inhaleProg, exhaleProg);

      // Simulation physics & rendering
      if (simRef.current) {
        simRef.current.update(dt);
        simRef.current.render();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [pacing.inhale, pacing.exhale, onStateChange, onProgressUpdate, vibrate]);

  return (
    <div className="relative w-full h-full overflow-hidden touch-none select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer transition-opacity duration-1000"
      />
    </div>
  );
};
