'use client';

import React from 'react';
import { PlantSpecies } from '../lib/botanicalTypes';
import { Moon, RefreshCw, BookOpen } from 'lucide-react';

interface RestModalProps {
  species: PlantSpecies;
  breathsCount: number;
  onRest: () => void;
  onOpenSanctuary: () => void;
  onNurtureAnother: () => void;
}

export const RestModal: React.FC<RestModalProps> = ({
  species,
  breathsCount,
  onRest,
  onOpenSanctuary,
  onNurtureAnother,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-zen-950/70 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-sm rounded-3xl bg-zen-900/90 border border-zen-700/60 p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: species.glowColor }}
        />

        {/* Poetic Icon badge */}
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 relative"
          style={{
            backgroundColor: 'rgba(22, 27, 38, 0.95)',
            border: `1px solid ${species.petalColor}50`,
            boxShadow: `0 0 20px ${species.glowColor}`,
          }}
        >
          <div
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: species.petalColor }}
          />
        </div>

        {/* Title & Species */}
        <h2 className="font-serif text-2xl font-light text-zen-mist tracking-wide">
          {species.name}
        </h2>
        <p className="font-sans text-xs italic text-zen-gold/80 mt-0.5">
          {species.poeticTitle}
        </p>

        {/* Soothing Quote */}
        <div className="my-5 px-4 py-3.5 rounded-2xl bg-zen-850/80 border border-zen-800/80">
          <p className="font-serif text-sm italic text-zen-mist/85 leading-relaxed">
            &ldquo;{species.quote}&rdquo;
          </p>
          <span className="block mt-2 font-sans text-[11px] text-zen-mist/40">
            Nurtured peacefully across {breathsCount} breaths
          </span>
        </div>

        {/* Action Buttons: Design Rule #3 - Defaults to 'Rest' */}
        <div className="space-y-2.5 mt-6">
          <button
            onClick={onRest}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-zen-leaf to-zen-leaf/90 hover:from-zen-leaf/90 hover:to-zen-leaf text-zen-mist font-medium text-sm tracking-wide shadow-lg shadow-zen-leaf/20 hover:shadow-zen-leaf/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Moon className="w-4 h-4 text-zen-dew" />
            <span>Rest in the Garden</span>
          </button>

          <button
            onClick={onOpenSanctuary}
            className="w-full py-2.5 px-4 rounded-xl bg-zen-800/70 hover:bg-zen-800 text-zen-mist/80 hover:text-white text-xs font-medium border border-zen-700/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <BookOpen className="w-3.5 h-3.5 text-zen-gold" />
            <span>View Herbarium</span>
          </button>

          <button
            onClick={onNurtureAnother}
            className="w-full py-2 px-4 rounded-xl text-zen-mist/40 hover:text-zen-mist/70 text-xs font-light transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Nurture another seed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
