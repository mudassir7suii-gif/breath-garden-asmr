// Procedural ASMR Web Audio Engine for Breath Garden
// 100% Client-side synthetic acoustic pipeline: Zero audio files to fetch, zero latency.
// Follows Design Pillar #1 (<2s instant tactile reward) and #5 (Acoustic priority with discrete sub-busses).

export interface AudioVolumeConfig {
  master: number;
  breath: number;
  plant: number;
  ambient: number;
  binaural: number;
  muted: boolean;
}

class BotanicalAudioEngine {
  private ctx: AudioContext | null = null;
  public isInitialized = false;

  // Master and Sub-busses
  private masterGain: GainNode | null = null;
  private breathGain: GainNode | null = null;
  private plantGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private binauralGain: GainNode | null = null;

  // Active audio nodes for active breath state
  private inhaleNodes: {
    sources: AudioNode[];
    gains: GainNode[];
    filter?: BiquadFilterNode;
  } | null = null;

  private exhaleNodes: {
    sources: AudioNode[];
    gains: GainNode[];
  } | null = null;

  private ambientNodes: AudioNode[] = [];
  private binauralNodes: AudioNode[] = [];

  // Current volume levels (0.0 to 1.0)
  public volumes: AudioVolumeConfig = {
    master: 0.85,
    breath: 0.9,
    plant: 0.85,
    ambient: 0.45,
    binaural: 0.25,
    muted: false,
  };

  /**
   * Initialize Web Audio Context upon first player gesture
   */
  public init(): void {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Master bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumes.muted ? 0 : this.volumes.master, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Breath bus (Air swells & wind)
      this.breathGain = this.ctx.createGain();
      this.breathGain.gain.setValueAtTime(this.volumes.breath, this.ctx.currentTime);
      this.breathGain.connect(this.masterGain);

      // Plant bus (Dew drops, stem clicks, blossom chimes)
      this.plantGain = this.ctx.createGain();
      this.plantGain.gain.setValueAtTime(this.volumes.plant, this.ctx.currentTime);
      this.plantGain.connect(this.masterGain);

      // Ambient bus (Low dusk breeze & night crickets)
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.volumes.ambient, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Binaural bus (Theta relaxation drone 6Hz beat)
      this.binauralGain = this.ctx.createGain();
      this.binauralGain.gain.setValueAtTime(this.volumes.binaural, this.ctx.currentTime);
      this.binauralGain.connect(this.masterGain);

      this.isInitialized = true;
      this.startAmbientSoundscape();
      this.startBinauralDrone();
    } catch (e) {
      console.warn('AudioContext initialization deferred:', e);
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Procedural noise generator (Pink for breath, Brown for deep dusk wind)
   */
  private createNoiseBuffer(seconds: number = 4, type: 'pink' | 'brown' = 'pink'): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        // Brown noise: warm, deep, pillowy
        b0 = (b0 + (0.02 * white)) / 1.02;
        data[i] = b0 * 3.5;
      }
    }
    return buffer;
  }

  /**
   * Inhale: Soft rising airy texture accompanied by a warm major harmonic undertone
   */
  public startInhale(duration: number = 4.0): void {
    if (!this.isInitialized) this.init();
    if (!this.ctx || !this.breathGain) return;
    this.resume();
    this.stopInhale();
    this.stopExhale();

    const t = this.ctx.currentTime;

    // 1. Air noise swell (breath in)
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.createNoiseBuffer(duration + 2, 'pink');
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.setValueAtTime(2.2, t);
    noiseFilter.frequency.setValueAtTime(200, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(750, t + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.32, t + duration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.breathGain);
    noiseSource.start(t);

    // 2. Harmonic warm undertone (F3: 174.61Hz, A3: 220Hz, C4: 261.63Hz)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'sine';
    osc1.frequency.setValueAtTime(174.61, t);
    osc2.frequency.setValueAtTime(220.00, t);
    osc3.frequency.setValueAtTime(261.63, t);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(0.05, t + duration);

    osc1.connect(oscGain);
    osc2.connect(oscGain);
    osc3.connect(oscGain);
    oscGain.connect(this.breathGain);
    osc1.start(t);
    osc2.start(t);
    osc3.start(t);

    this.inhaleNodes = {
      sources: [noiseSource, osc1, osc2, osc3],
      gains: [noiseGain, oscGain],
      filter: noiseFilter,
    };
  }

  public stopInhale(): void {
    if (!this.inhaleNodes || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.inhaleNodes.gains.forEach((g) => {
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0.0001, t + 0.25);
      } catch {}
    });

    const sources = this.inhaleNodes.sources;
    setTimeout(() => {
      sources.forEach((s) => {
        try {
          if ('stop' in s) (s as AudioScheduledSourceNode).stop();
          s.disconnect();
        } catch {}
      });
    }, 300);
    this.inhaleNodes = null;
  }

  /**
   * Exhale: Falling gentle wind with soft settling harmonic release
   */
  public startExhale(duration: number = 6.0): void {
    if (!this.isInitialized) this.init();
    if (!this.ctx || !this.breathGain) return;
    this.resume();
    this.stopInhale();
    this.stopExhale();

    const t = this.ctx.currentTime;

    // 1. Falling wind noise
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.createNoiseBuffer(duration + 2, 'pink');
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(750, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(170, t + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.38, t);
    noiseGain.gain.linearRampToValueAtTime(0.0001, t + duration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.breathGain);
    noiseSource.start(t);

    // 2. Soft settling harmonic tone
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(146.83, t); // D3
    osc.frequency.linearRampToValueAtTime(130.81, t + duration); // C3

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.05, t);
    oscGain.gain.linearRampToValueAtTime(0.0001, t + duration);

    osc.connect(oscGain);
    oscGain.connect(this.breathGain);
    osc.start(t);

    this.exhaleNodes = {
      sources: [noiseSource, osc],
      gains: [noiseGain, oscGain],
    };
  }

  public stopExhale(): void {
    if (!this.exhaleNodes || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.exhaleNodes.gains.forEach((g) => {
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0.0001, t + 0.25);
      } catch {}
    });

    const sources = this.exhaleNodes.sources;
    setTimeout(() => {
      sources.forEach((s) => {
        try {
          if ('stop' in s) (s as AudioScheduledSourceNode).stop();
          s.disconnect();
        } catch {}
      });
    }, 300);
    this.exhaleNodes = null;
  }

  /**
   * Growth Step: Stem unfurl tactile texture + crystal dew drop
   */
  public playGrowthStep(): void {
    if (!this.isInitialized) this.init();
    if (!this.ctx || !this.plantGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    // A. Dew drop ping: Pure gentle sine drip (~1500Hz -> 820Hz)
    const dropOsc = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();

    dropOsc.type = 'sine';
    const baseFreq = 1420 + Math.random() * 220;
    dropOsc.frequency.setValueAtTime(baseFreq, t);
    dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.54, t + 0.12);

    dropGain.gain.setValueAtTime(0.24, t);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    dropOsc.connect(dropGain);
    dropGain.connect(this.plantGain);
    dropOsc.start(t);
    dropOsc.stop(t + 0.36);

    // B. Organic stem creak / leaf unfurl friction texture
    const creakBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.2), this.ctx.sampleRate);
    const cData = creakBuffer.getChannelData(0);
    for (let i = 0; i < cData.length; i++) {
      const p = i / cData.length;
      cData[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI * 16) * Math.exp(-p * 12);
    }
    const creakSource = this.ctx.createBufferSource();
    creakSource.buffer = creakBuffer;

    const creakFilter = this.ctx.createBiquadFilter();
    creakFilter.type = 'bandpass';
    creakFilter.frequency.setValueAtTime(420 + Math.random() * 120, t);
    creakFilter.Q.setValueAtTime(3.5, t);

    const creakGain = this.ctx.createGain();
    creakGain.gain.setValueAtTime(0.16, t);

    creakSource.connect(creakFilter);
    creakFilter.connect(creakGain);
    creakGain.connect(this.plantGain);
    creakSource.start(t + 0.02);
  }

  /**
   * Bloom: Shimmering pentatonic wind chimes cluster & soft wing flutter
   */
  public playBloom(): void {
    if (!this.isInitialized) this.init();
    if (!this.ctx || !this.plantGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Pentatonic chime series: C5, E5, G5, C6, E6, G6
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.plantGain) return;
      const delay = idx * 0.15 + (Math.random() * 0.04);
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, t + delay);

      chimeGain.gain.setValueAtTime(0.0001, t + delay);
      chimeGain.gain.linearRampToValueAtTime(0.15 / (idx * 0.18 + 1), t + delay + 0.015);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 2.5);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.plantGain);

      chimeOsc.start(t + delay);
      chimeOsc.stop(t + delay + 2.6);
    });

    // Soft wing flutter sound for nocturnal visitor arriving
    const flutterSource = this.ctx.createBufferSource();
    flutterSource.buffer = this.createNoiseBuffer(2.6, 'pink');
    const flutterFilter = this.ctx.createBiquadFilter();
    flutterFilter.type = 'bandpass';
    flutterFilter.frequency.setValueAtTime(880, t);
    flutterFilter.Q.setValueAtTime(1.8, t);

    const flutterGain = this.ctx.createGain();
    flutterGain.gain.setValueAtTime(0.001, t + 0.4);
    flutterGain.gain.linearRampToValueAtTime(0.11, t + 1.1);
    flutterGain.gain.linearRampToValueAtTime(0.001, t + 2.6);

    flutterSource.connect(flutterFilter);
    flutterFilter.connect(flutterGain);
    flutterGain.connect(this.plantGain);
    flutterSource.start(t + 0.4);
    flutterSource.stop(t + 2.7);
  }

  /**
   * Ambient soundscape: Warm low-frequency wind drift + subtle night cricket pulses
   */
  private startAmbientSoundscape(): void {
    if (!this.ctx || !this.ambientGain || this.ambientNodes.length > 0) return;
    const t = this.ctx.currentTime;

    // 1. Low dusk wind drone
    const droneNoise = this.ctx.createBufferSource();
    droneNoise.buffer = this.createNoiseBuffer(6, 'brown');
    droneNoise.loop = true;

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(115, t);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.32, t);

    droneNoise.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.ambientGain);
    droneNoise.start(t);
    this.ambientNodes.push(droneNoise);

    // 2. Procedural twilight cricket trill (intermittent subtle pulse)
    const cricketOsc = this.ctx.createOscillator();
    cricketOsc.type = 'sine';
    cricketOsc.frequency.setValueAtTime(4500, t);

    const cricketAmp = this.ctx.createGain();
    cricketAmp.gain.setValueAtTime(0.012, t);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(3.2, t);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.010, t);

    lfo.connect(lfoGain);
    lfoGain.connect(cricketAmp.gain);

    cricketOsc.connect(cricketAmp);
    cricketAmp.connect(this.ambientGain);

    cricketOsc.start(t);
    lfo.start(t);
    this.ambientNodes.push(cricketOsc, lfo);
  }

  /**
   * Binaural Theta calming drone: 108Hz Left channel, 114Hz Right channel (6Hz Theta difference)
   */
  private startBinauralDrone(): void {
    if (!this.ctx || !this.binauralGain || this.binauralNodes.length > 0) return;
    const t = this.ctx.currentTime;

    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(108, t); // Left channel: 108Hz

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(114, t); // Right channel: 114Hz (6Hz Theta beat)

    const leftGain = this.ctx.createGain();
    leftGain.gain.setValueAtTime(0.05, t);

    const rightGain = this.ctx.createGain();
    rightGain.gain.setValueAtTime(0.05, t);

    oscLeft.connect(leftGain);
    leftGain.connect(merger, 0, 0);

    oscRight.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    merger.connect(this.binauralGain);

    oscLeft.start(t);
    oscRight.start(t);

    this.binauralNodes.push(oscLeft, oscRight, merger);
  }

  /**
   * Set volume of individual category bus
   */
  public setVolume(category: keyof AudioVolumeConfig, value: number): void {
    if (category === 'muted') {
      this.volumes.muted = !!value;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(this.volumes.muted ? 0 : this.volumes.master, this.ctx.currentTime, 0.05);
      }
      return;
    }

    this.volumes[category] = Math.max(0, Math.min(1, value));
    if (!this.ctx) return;

    let targetNode: GainNode | null = null;
    if (category === 'master') targetNode = this.masterGain;
    else if (category === 'breath') targetNode = this.breathGain;
    else if (category === 'plant') targetNode = this.plantGain;
    else if (category === 'ambient') targetNode = this.ambientGain;
    else if (category === 'binaural') targetNode = this.binauralGain;

    if (targetNode) {
      targetNode.gain.setTargetAtTime(this.volumes[category], this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(category: keyof AudioVolumeConfig): number {
    return this.volumes[category] as number;
  }
}

export const botanicalAudio = new BotanicalAudioEngine();
