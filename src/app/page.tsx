'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PLANT_SPECIES, PlantSpecies, AudioSettings, NurturedPlantRecord } from '../lib/botanicalTypes';
import { botanicalAudio } from '../lib/botanicalAudio';
import {
  getSanctuaryPlants,
  saveSanctuaryPlant,
  loadSavedAudioSettings,
  saveAudioSettings,
  loadSavedPacing,
  savePacingSettings,
  PacingSettings,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_PACING,
} from '../lib/storage';
import { GardenCanvas } from '../components/GardenCanvas';
import { BreathingRing } from '../components/BreathingRing';
import { SeedSelector } from '../components/SeedSelector';
import { RestModal } from '../components/RestModal';
import { SanctuaryHerbarium } from '../components/SanctuaryHerbarium';
import { SettingsModal } from '../components/SettingsModal';
import { Settings, BookOpen, ArrowLeft, Moon } from 'lucide-react';

export default function BreathGardenPage() {
  const [activeSpeciesId, setActiveSpeciesId] = useState<'moonflower' | 'jasmine' | 'fern'>('moonflower');
  const [viewMode, setViewMode] = useState<'select' | 'growing' | 'resting'>('select');
  const [breathState, setBreathState] = useState<'idle' | 'inhaling' | 'exhaling' | 'bloomed'>('idle');
  const [stepCount, setStepCount] = useState<number>(0);
  const [inhaleProgress, setInhaleProgress] = useState<number>(0);
  const [exhaleProgress, setExhaleProgress] = useState<number>(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHerbariumOpen, setIsHerbariumOpen] = useState<boolean>(false);

  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [pacingSettings, setPacingSettings] = useState<PacingSettings>(DEFAULT_PACING);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [sanctuaryPlants, setSanctuaryPlants] = useState<NurturedPlantRecord[]>([]);

  // Load local state on client mount
  useEffect(() => {
    setAudioSettings(loadSavedAudioSettings());
    setPacingSettings(loadSavedPacing());
    setSanctuaryPlants(getSanctuaryPlants());
  }, []);

  // Sync audio mixer values
  useEffect(() => {
    botanicalAudio.setVolume('master', audioSettings.master);
    botanicalAudio.setVolume('breath', audioSettings.breath);
    botanicalAudio.setVolume('plant', audioSettings.nature);
    botanicalAudio.setVolume('ambient', audioSettings.ambient);
    botanicalAudio.setVolume('binaural', audioSettings.binaural);
    botanicalAudio.setVolume('muted', audioSettings.muted ? 1 : 0);
  }, [audioSettings]);

  // Audio settings updater
  const handleUpdateAudio = useCallback((key: keyof AudioSettings, val: number | boolean) => {
    setAudioSettings((prev) => {
      const next = { ...prev, [key]: val };
      saveAudioSettings(next);
      return next;
    });
  }, []);

  // Pacing settings updater
  const handleUpdatePacing = useCallback((key: keyof PacingSettings, val: number) => {
    setPacingSettings((prev) => {
      const next = { ...prev, [key]: val };
      savePacingSettings(next);
      return next;
    });
  }, []);

  const handleToggleHaptics = useCallback(() => {
    setHapticsEnabled((prev) => !prev);
  }, []);

  // When player selects a seed: Start immediately (<2 second rule)
  const handleSelectSeed = useCallback((speciesId: 'moonflower' | 'jasmine' | 'fern') => {
    setActiveSpeciesId(speciesId);
    setStepCount(0);
    setBreathState('idle');
    setViewMode('growing');

    // Instant acoustic & tactile feedback
    botanicalAudio.init();
    botanicalAudio.playGrowthStep();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  }, []);

  // Handle plant blooming (at breath 10)
  const handleBloom = useCallback(() => {
    const currentSpecies = PLANT_SPECIES[activeSpeciesId] || PLANT_SPECIES.moonflower;

    // Save to persistent Herbarium
    const saved = saveSanctuaryPlant({
      speciesId: activeSpeciesId,
      name: currentSpecies.name,
      breathsCount: 10,
      reflectionPrompt: currentSpecies.quote,
    });
    setSanctuaryPlants((prev) => [saved, ...prev]);

    // Give player a serene pause before showing gentle rest choices
    setTimeout(() => {
      setViewMode('resting');
    }, 2400);
  }, [activeSpeciesId]);

  const activeSpecies = PLANT_SPECIES[activeSpeciesId] || PLANT_SPECIES.moonflower;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-zen-950 via-zen-900 to-zen-950 flex flex-col justify-between">
      {/* Background Interactive Botanical Canvas */}
      <div className="absolute inset-0 z-0">
        <GardenCanvas
          speciesId={activeSpeciesId}
          pacing={pacingSettings}
          hapticsEnabled={hapticsEnabled}
          isInSession={viewMode === 'growing'}
          onStepChange={setStepCount}
          onBloom={handleBloom}
          onStateChange={setBreathState}
          onProgressUpdate={(inProg, exProg) => {
            setInhaleProgress(inProg);
            setExhaleProgress(exProg);
          }}
        />
      </div>

      {/* Top Floating Controls Bar */}
      <header className="relative z-20 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
        {/* Left Action: Return to Seed Selection or Sanctuary */}
        <div className="pointer-events-auto flex items-center gap-2">
          {viewMode !== 'select' && (
            <button
              onClick={() => {
                setViewMode('select');
                setBreathState('idle');
              }}
              className="p-2.5 rounded-full bg-zen-900/60 hover:bg-zen-800 text-zen-mist/75 hover:text-white border border-zen-700/40 backdrop-blur-md transition-all active:scale-95 shadow-sm"
              aria-label="Back to seed selection"
              title="Return to seed selection"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsHerbariumOpen(true)}
            className="px-3.5 py-2 rounded-full bg-zen-900/60 hover:bg-zen-800 text-zen-mist/75 hover:text-white border border-zen-700/40 backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95 text-xs shadow-sm"
            aria-label="Open Sanctuary Herbarium"
          >
            <BookOpen className="w-3.5 h-3.5 text-zen-dew" />
            <span className="hidden sm:inline">Sanctuary</span>
            {sanctuaryPlants.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zen-800 text-zen-gold">
                {sanctuaryPlants.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Action: ASMR Mixer & Settings */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-full bg-zen-900/60 hover:bg-zen-800 text-zen-mist/75 hover:text-white border border-zen-700/40 backdrop-blur-md transition-all active:scale-95 shadow-sm"
            aria-label="Sanctuary Audio & Breath Settings"
            title="Settings & Audio"
          >
            <Settings className="w-4 h-4 text-zen-gold" />
          </button>
        </div>
      </header>

      {/* Center Breathing Aura & Ring Guide (when in growing session) */}
      {viewMode === 'growing' && (
        <BreathingRing
          state={breathState}
          inhaleProgress={inhaleProgress}
          exhaleProgress={exhaleProgress}
          stepCount={stepCount}
        />
      )}

      {/* Seed Selection View */}
      {viewMode === 'select' && (
        <SeedSelector
          onSelectSeed={handleSelectSeed}
          onOpenSanctuary={() => setIsHerbariumOpen(true)}
          sanctuaryCount={sanctuaryPlants.length}
        />
      )}

      {/* Gentle Natural Ending Modal (Rule #3: Defaults to 'Rest') */}
      {viewMode === 'resting' && (
        <RestModal
          species={activeSpecies}
          breathsCount={stepCount || 10}
          onRest={() => {
            // Dismiss ending screen, allow player to linger in peaceful ambient mode
            setViewMode('growing');
          }}
          onOpenSanctuary={() => setIsHerbariumOpen(true)}
          onNurtureAnother={() => {
            setViewMode('select');
            setStepCount(0);
            setBreathState('idle');
          }}
        />
      )}

      {/* Floating Bottom Pill when Resting peacefully in Ambient Mode */}
      {viewMode === 'growing' && breathState === 'bloomed' && (
        <div className="relative z-20 pb-8 flex items-center justify-center pointer-events-auto">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-zen-900/80 border border-zen-700/60 backdrop-blur-md shadow-lg animate-fade-in text-xs text-zen-mist/80">
            <span className="flex items-center gap-1.5 text-zen-gold font-medium">
              <Moon className="w-3.5 h-3.5" />
              Resting in the garden
            </span>
            <span className="text-zen-700">|</span>
            <button
              onClick={() => {
                setViewMode('select');
                setStepCount(0);
                setBreathState('idle');
              }}
              className="text-zen-mist/60 hover:text-white transition-colors"
            >
              Plant another
            </button>
          </div>
        </div>
      )}

      {/* Sanctuary Herbarium Drawer / Modal */}
      <SanctuaryHerbarium
        isOpen={isHerbariumOpen}
        onClose={() => setIsHerbariumOpen(false)}
        plants={sanctuaryPlants}
      />

      {/* Audio Mixer & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        audioSettings={audioSettings}
        pacingSettings={pacingSettings}
        hapticsEnabled={hapticsEnabled}
        onUpdateAudio={handleUpdateAudio}
        onUpdatePacing={handleUpdatePacing}
        onToggleHaptics={handleToggleHaptics}
      />
    </main>
  );
}
