'use client';

import React from 'react';
import { NurturedPlantRecord, PLANT_SPECIES } from '../lib/botanicalTypes';
import { X, Sparkles, Calendar, Wind } from 'lucide-react';

interface SanctuaryHerbariumProps {
  isOpen: boolean;
  onClose: () => void;
  plants: NurturedPlantRecord[];
}

export const SanctuaryHerbarium: React.FC<SanctuaryHerbariumProps> = ({
  isOpen,
  onClose,
  plants,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-zen-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-md max-h-[85vh] rounded-3xl bg-zen-900 border border-zen-700/70 p-6 flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zen-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zen-800 flex items-center justify-center border border-zen-700">
              <Sparkles className="w-4 h-4 text-zen-gold" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light text-zen-mist tracking-wide">
                Sanctuary Herbarium
              </h2>
              <p className="font-sans text-[11px] text-zen-mist/50">
                {plants.length} {plants.length === 1 ? 'bloom' : 'blooms'} preserved in quiet stillness
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zen-800/80 hover:bg-zen-700 text-zen-mist/70 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close Herbarium"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Plants List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar pr-1">
          {plants.length === 0 ? (
            <div className="py-16 text-center px-4">
              <p className="font-serif text-sm italic text-zen-mist/60 leading-relaxed">
                Your sanctuary is quiet. Breathe with a seed to unfurl your first bloom.
              </p>
            </div>
          ) : (
            plants.map((p) => {
              const spec = PLANT_SPECIES[p.speciesId] || PLANT_SPECIES.moonflower;
              const dateStr = new Date(p.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-zen-850/90 border border-zen-800 hover:border-zen-700 transition-all flex items-start gap-3.5 group"
                >
                  {/* Plant Color Beacon */}
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
                    style={{
                      backgroundColor: 'rgba(22, 27, 38, 0.95)',
                      border: `1.5px solid ${spec.petalColor}50`,
                      boxShadow: `0 0 12px ${spec.glowColor}`,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: spec.petalColor }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-medium text-zen-mist group-hover:text-white truncate">
                        {p.name || spec.name}
                      </h4>
                    </div>
                    <p className="font-sans text-[11px] italic text-zen-gold/75">
                      {spec.poeticTitle}
                    </p>

                    <p className="font-serif text-xs italic text-zen-mist/70 mt-1.5 leading-snug">
                      &ldquo;{spec.quote}&rdquo;
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-zen-mist/40">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Wind className="w-3 h-3" />
                        {p.breathsCount || 10} breaths
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zen-800 text-center">
          <p className="text-[11px] text-zen-mist/40 font-sans">
            Every plant stays forever. No streaks, no decay, no guilt.
          </p>
        </div>
      </div>
    </div>
  );
};
