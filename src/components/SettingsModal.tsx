'use client';

import React from 'react';
import { Volume2, VolumeX, Sliders, HeartHandshake, X, Smartphone, Wind } from 'lucide-react';
import { AudioSettings } from '../lib/botanicalTypes';
import { PacingSettings } from '../lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioSettings: AudioSettings;
  pacingSettings: PacingSettings;
  hapticsEnabled: boolean;
  onUpdateAudio: (key: keyof AudioSettings, val: number | boolean) => void;
  onUpdatePacing: (key: keyof PacingSettings, val: number) => void;
  onToggleHaptics: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  audioSettings,
  pacingSettings,
  hapticsEnabled,
  onUpdateAudio,
  onUpdatePacing,
  onToggleHaptics,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zen-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-md max-h-[88vh] rounded-3xl bg-zen-900 border border-zen-700/70 p-6 flex flex-col shadow-2xl relative overflow-hidden text-zen-mist">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zen-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-zen-gold" />
            <h2 className="font-serif text-lg font-light text-zen-mist tracking-wide">
              Sanctuary Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zen-800/80 hover:bg-zen-700 text-zen-mist/70 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar pr-1">
          {/* Section 1: Tactile ASMR Audio Sliders (Rule #5) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-semibold tracking-wider text-zen-gold/80 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                ASMR Audio Mixer
              </span>
              <button
                onClick={() => onUpdateAudio('muted', !audioSettings.muted)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                  audioSettings.muted
                    ? 'bg-red-950/60 border-red-700/60 text-red-300'
                    : 'bg-zen-800 border-zen-700 text-zen-mist/80 hover:text-white'
                }`}
              >
                {audioSettings.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{audioSettings.muted ? 'Muted' : 'Mute All'}</span>
              </button>
            </div>

            <div className="space-y-3.5 bg-zen-850/70 p-3.5 rounded-2xl border border-zen-800/90">
              {/* Master Volume */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zen-mist/90">Master Volume</span>
                  <span className="text-zen-mist/50 font-mono">
                    {Math.round(audioSettings.master * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioSettings.master}
                  onChange={(e) => onUpdateAudio('master', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zen-700 rounded-lg appearance-none cursor-pointer accent-zen-gold"
                />
              </div>

              {/* Breath Swell */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zen-mist/90">Breath & Wind Swell</span>
                  <span className="text-zen-mist/50 font-mono">
                    {Math.round(audioSettings.breath * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioSettings.breath}
                  onChange={(e) => onUpdateAudio('breath', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zen-700 rounded-lg appearance-none cursor-pointer accent-zen-dew"
                />
              </div>

              {/* Botanical Sounds */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zen-mist/90">Stem Creak & Dew Drops</span>
                  <span className="text-zen-mist/50 font-mono">
                    {Math.round(audioSettings.nature * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioSettings.nature}
                  onChange={(e) => onUpdateAudio('nature', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zen-700 rounded-lg appearance-none cursor-pointer accent-zen-leaf"
                />
              </div>

              {/* Dusk Ambience */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zen-mist/90">Dusk Breeze & Crickets</span>
                  <span className="text-zen-mist/50 font-mono">
                    {Math.round(audioSettings.ambient * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioSettings.ambient}
                  onChange={(e) => onUpdateAudio('ambient', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zen-700 rounded-lg appearance-none cursor-pointer accent-zen-gold"
                />
              </div>

              {/* Binaural Theta Drone */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zen-mist/90">Theta Calming Drone (6Hz Beat)</span>
                  <span className="text-zen-mist/50 font-mono">
                    {Math.round(audioSettings.binaural * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioSettings.binaural}
                  onChange={(e) => onUpdateAudio('binaural', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zen-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Breath Pacing */}
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-zen-gold/80 flex items-center gap-1.5 mb-3">
              <Wind className="w-3.5 h-3.5" />
              Breath Rhythm
            </span>

            <div className="space-y-3.5 bg-zen-850/70 p-3.5 rounded-2xl border border-zen-800/90">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zen-mist/90">Inhale Duration</span>
                  <span className="text-zen-gold font-mono">{pacingSettings.inhale.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="6.0"
                  step="0.5"
                  value={pacingSettings.inhale}
                  onChange={(e) => onUpdatePacing('inhale', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zen-700 rounded-lg appearance-none cursor-pointer accent-zen-gold"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zen-mist/90">Exhale Duration</span>
                  <span className="text-zen-gold font-mono">{pacingSettings.exhale.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="10.0"
                  step="0.5"
                  value={pacingSettings.exhale}
                  onChange={(e) => onUpdatePacing('exhale', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zen-700 rounded-lg appearance-none cursor-pointer accent-zen-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tactile Haptics */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zen-850/70 border border-zen-800/90">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-zen-dew" />
              <div>
                <div className="text-xs font-medium text-zen-mist">Tactile Haptics</div>
                <div className="text-[10px] text-zen-mist/50">Vibrations on inhale swell & release</div>
              </div>
            </div>
            <button
              onClick={onToggleHaptics}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                hapticsEnabled ? 'bg-zen-leaf' : 'bg-zen-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 4: Ethical Safeguard & Support (Rule #7) */}
          <div className="p-4 rounded-2xl bg-zen-850/50 border border-zen-800/80">
            <div className="flex items-center gap-2 mb-2">
              <HeartHandshake className="w-4 h-4 text-zen-gold/80" />
              <span className="text-xs font-medium text-zen-mist/90">
                Need to talk to someone?
              </span>
            </div>
            <p className="text-[11px] text-zen-mist/60 leading-relaxed mb-3">
              Breath Garden is an ambient tactile space for calm moments. It makes no medical or therapeutic claims. If you or someone you know is carrying heavy feelings or needs support, free and confidential help is available:
            </p>
            <div className="space-y-1.5 text-xs">
              <a
                href="https://988lifeline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-zen-gold hover:underline"
              >
                988 Suicide & Crisis Lifeline (US & Canada - Call or Text 988)
              </a>
              <a
                href="https://www.befrienders.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-zen-gold hover:underline"
              >
                Befrienders Worldwide (International Directory)
              </a>
              <a
                href="https://www.crisistextline.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-zen-gold hover:underline"
              >
                Crisis Text Line (Text HOME to 741741)
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zen-800 text-center">
          <p className="text-[10px] text-zen-mist/40">
            Breath Garden ASMR • Designed for quiet restoration
          </p>
        </div>
      </div>
    </div>
  );
};
