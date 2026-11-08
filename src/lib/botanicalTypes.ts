export interface PlantSpecies {
  id: 'moonflower' | 'jasmine' | 'fern';
  name: string;
  poeticTitle: string;
  description: string;
  quote: string;
  color: string;
  petalColor: string;
  petalHighlight: string;
  centerColor: string;
  leafColor: string;
  stemColor: string;
  glowColor: string;
  maxSteps: number;
}

export const PLANT_SPECIES: Record<string, PlantSpecies> = {
  moonflower: {
    id: 'moonflower',
    name: 'Celestia Moonflower',
    poeticTitle: 'The Midnight Healer',
    description: 'Blooms exclusively in the twilight quiet, opening silk-white petals imbued with moonlight calm.',
    quote: 'Like the moon, you do not need to be whole to shine.',
    color: '#8A9BA8',
    petalColor: '#F0F4FC',
    petalHighlight: '#FFFFFF',
    centerColor: '#FFEAA7',
    leafColor: '#3A6351',
    stemColor: '#2B4237',
    glowColor: 'rgba(235, 242, 255, 0.55)',
    maxSteps: 10,
  },
  jasmine: {
    id: 'jasmine',
    name: 'Imperial Night Jasmine',
    poeticTitle: 'The Fragrant Solace',
    description: 'Slender arching branches crowned with starry florets that release calming sweetness on every exhale.',
    quote: 'In the stillness of the dark, the sweet scent lingers.',
    color: '#95D5B2',
    petalColor: '#FFFDF2',
    petalHighlight: '#FFF8E1',
    centerColor: '#F4A261',
    leafColor: '#2D6A4F',
    stemColor: '#3A3633',
    glowColor: 'rgba(255, 248, 220, 0.5)',
    maxSteps: 10,
  },
  fern: {
    id: 'fern',
    name: 'Ancient Silver Fern',
    poeticTitle: 'The Unfurling Peace',
    description: 'Geometric spiral fiddleheads that gently unfurl with silver-dusted fronds and glistening crystal dew.',
    quote: 'Growth is not forced; it unfolds one breath at a time.',
    color: '#74C69D',
    petalColor: '#D8F3DC',
    petalHighlight: '#EDFBF0',
    centerColor: '#52B788',
    leafColor: '#1B4332',
    stemColor: '#254B3B',
    glowColor: 'rgba(216, 243, 220, 0.45)',
    maxSteps: 10,
  },
};

export interface NurturedPlantRecord {
  id: string;
  speciesId: 'moonflower' | 'jasmine' | 'fern';
  name: string;
  timestamp: number;
  breathsCount: number;
  reflectionPrompt?: string;
}

export interface AudioSettings {
  master: number;
  breath: number;
  nature: number;
  binaural: number;
  ambient: number;
  muted: boolean;
}
