// Local Sanctuary Storage & Preferences
// Rule #2 & #4: Zero streaks, zero pressure, forgiving by default.

import { NurturedPlantRecord, AudioSettings } from './botanicalTypes';

const PLANTS_STORAGE_KEY = 'breath_garden_sanctuary_records';
const SETTINGS_STORAGE_KEY = 'breath_garden_audio_settings';
const PACING_STORAGE_KEY = 'breath_garden_pacing_settings';

export interface PacingSettings {
  inhale: number; // e.g. 4.0
  exhale: number; // e.g. 6.0
}

export const DEFAULT_PACING: PacingSettings = {
  inhale: 4.0,
  exhale: 6.0,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  master: 0.85,
  breath: 0.90,
  nature: 0.85,
  binaural: 0.25,
  ambient: 0.45,
  muted: false,
};

export function getSanctuaryPlants(): NurturedPlantRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PLANTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load sanctuary plants', err);
    return [];
  }
}

export function saveSanctuaryPlant(record: Omit<NurturedPlantRecord, 'id' | 'timestamp'>): NurturedPlantRecord {
  const current = getSanctuaryPlants();
  const newEntry: NurturedPlantRecord = {
    ...record,
    id: `plant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to sanctuary', err);
  }
  return newEntry;
}

export function loadSavedAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) } : DEFAULT_AUDIO_SETTINGS;
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save audio settings', e);
  }
}

export function loadSavedPacing(): PacingSettings {
  if (typeof window === 'undefined') return DEFAULT_PACING;
  try {
    const raw = localStorage.getItem(PACING_STORAGE_KEY);
    return raw ? { ...DEFAULT_PACING, ...JSON.parse(raw) } : DEFAULT_PACING;
  } catch {
    return DEFAULT_PACING;
  }
}

export function savePacingSettings(pacing: PacingSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PACING_STORAGE_KEY, JSON.stringify(pacing));
  } catch (e) {
    console.error('Failed to save pacing settings', e);
  }
}
