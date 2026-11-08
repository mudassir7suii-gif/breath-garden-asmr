'use client';

import React from 'react';

interface BreathingRingProps {
  state: 'idle' | 'inhaling' | 'exhaling' | 'bloomed';
  inhaleProgress: number; // 0..1
  exhaleProgress: number; // 0..1
  stepCount: number;
}

export const BreathingRing: React.FC<BreathingRingProps> = ({
  state,
  inhaleProgress,
  exhaleProgress,
  stepCount,
}) => {
  // Compute ring expansion scale:
  // Inhaling: scale expands from 1.0 -> 1.45
  // Exhaling: scale gently deflates from 1.45 -> 1.0
  let scale = 1.0;
  let opacity = 0.35;

  if (state === 'inhaling') {
    scale = 1.0 + inhaleProgress * 0.45;
    opacity = 0.3 + inhaleProgress * 0.55;
  } else if (state === 'exhaling') {
    scale = 1.0 + (1 - exhaleProgress) * 0.45;
    opacity = 0.25 + (1 - exhaleProgress) * 0.45;
  } else if (state === 'bloomed') {
    scale = 1.35;
    opacity = 0.75;
  }

  // Text prompt
  let text = 'Touch & hold to breathe in';
  if (state === 'inhaling') {
    text = 'Breathe in slowly...';
  } else if (state === 'exhaling') {
    text = 'Release & breathe out...';
  } else if (state === 'bloomed') {
    text = 'Bloomed into the quiet night';
  }

  // After 2 breaths, fade the guidance text so player enjoys pure sensory immersion
  const textOpacityClass =
    stepCount >= 2 && stepCount < 10 && state !== 'idle'
      ? 'opacity-30 hover:opacity-90 transition-opacity duration-700'
      : 'opacity-85 transition-opacity duration-500';

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center select-none">
      {/* Concentric Breathing Aura */}
      <div
        className="relative flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        {/* Outermost soft ripple */}
        <div
          className="absolute h-64 w-64 rounded-full border border-zen-dew/20 blur-md transition-all duration-300"
          style={{ opacity: opacity * 0.6 }}
        />

        {/* Middle harmonic ring */}
        <div
          className="absolute h-52 w-52 rounded-full border border-zen-mist/30 transition-all duration-300"
          style={{
            opacity: opacity * 0.8,
            boxShadow: `0 0 ${20 * opacity}px rgba(168, 218, 220, ${0.4 * opacity})`,
          }}
        />

        {/* Inner pulsing core ring */}
        <div
          className="h-40 w-40 rounded-full border-2 border-zen-dew/60 backdrop-blur-[2px] transition-all duration-300"
          style={{
            opacity: opacity,
            background: `radial-gradient(circle, rgba(168, 218, 220, ${0.15 * opacity}) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Guidance prompt */}
      <div className={`mt-44 text-center px-4 z-10 ${textOpacityClass}`}>
        <p className="font-serif text-lg tracking-widest text-zen-mist drop-shadow-md">
          {text}
        </p>
        {state === 'idle' && stepCount === 0 && (
          <span className="block mt-2 font-sans text-xs tracking-wider text-zen-mist/50">
            or hold Spacebar on keyboard
          </span>
        )}
        {stepCount > 0 && stepCount < 10 && (
          <span className="block mt-2 font-sans text-xs tracking-widest uppercase text-zen-gold/70">
            Breath {stepCount} of 10
          </span>
        )}
      </div>
    </div>
  );
};
