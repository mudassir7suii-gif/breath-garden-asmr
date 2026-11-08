'use client';

import React from 'react';
import { PLANT_SPECIES, PlantSpecies } from '../lib/botanicalTypes';
import { Sparkles, BookOpen } from 'lucide-react';

interface SeedSelectorProps {
  onSelectSeed: (speciesId: 'moonflower' | 'jasmine' | 'fern') => void;
  onOpenSanctuary: () => void;
  sanctuaryCount: number;
}

export const SeedSelector: React.FC<SeedSelectorProps> = ({
  onSelectSeed,
  onOpenSanctuary,
  sanctuaryCount,
}) => {
  const speciesList = Object.values(PLANT_SPECIES);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 z-20 pointer-events-auto bg-gradient-to-b from-zen-950/85 via-zen-900/75 to-zen-950/90 backdrop-blur-sm animate-fade-in">
      {/* Top Header */}
      <div className="text-center pt-8 max-w-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase bg-zen-800/80 text-zen-gold border border-zen-700/60 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-zen-gold animate-pulse" />
          Breath Garden ASMR
        </span>
        <h1 className="font-serif text-3xl font-light text-zen-mist mt-3 tracking-wide">
          Choose a Seed
        </h1>
        <p className="font-sans text-xs text-zen-mist/60 mt-1.5 leading-relaxed">
          Hold to breathe in, release to unfurl. No scores, no rush, only peaceful growth.
        </p>
      </div>

      {/* 3 Seed Cards Carousel / Grid */}
      <div className="w-full max-w-sm space-y-3.5 my-auto">
        {speciesList.map((seed: PlantSpecies) => (
          <button
            key={seed.id}
            onClick={() => onSelectSeed(seed.id)}
            className="group w-full text-left p-4 rounded-2xl bg-zen-850/80 hover:bg-zen-800/95 border border-zen-700/50 hover:border-zen-gold/50 shadow-lg hover:shadow-zen-gold/10 transition-all duration-300 flex items-center gap-4 active:scale-[0.98]"
          >
            {/* Seed Glow Icon */}
            <div
              className="relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundColor: 'rgba(22, 27, 38, 0.9)',
                border: `1.5px solid ${seed.color}40`,
                boxShadow: `0 0 16px ${seed.glowColor}`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full transition-transform duration-500 group-hover:rotate-45"
                style={{
                  backgroundColor: seed.petalColor,
                  boxShadow: `0 0 10px ${seed.glowColor}`,
                }}
              />
            </div>

            {/* Seed Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base text-zen-mist group-hover:text-white truncate">
                  {seed.name}
                </h3>
              </div>
              <p className="font-sans text-xs italic text-zen-gold/80 mt-0.5">
                {seed.poeticTitle}
              </p>
              <p className="font-sans text-[11px] text-zen-mist/55 line-clamp-2 mt-1 leading-normal">
                {seed.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Sanctuary Herbarium Button */}
      <div className="w-full max-w-sm pb-6 flex items-center justify-center">
        <button
          onClick={onOpenSanctuary}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium text-zen-mist/80 bg-zen-800/60 hover:bg-zen-700/80 hover:text-white border border-zen-600/40 backdrop-blur-md transition-all active:scale-95 shadow-sm"
        >
          <BookOpen className="w-4 h-4 text-zen-dew" />
          <span>Sanctuary Herbarium</span>
          {sanctuaryCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-zen-700 text-zen-gold font-semibold">
              {sanctuaryCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
