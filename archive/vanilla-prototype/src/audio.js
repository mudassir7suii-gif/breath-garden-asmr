// Procedural ASMR Web Audio Engine for Breath Garden
// No external audio files needed - 100% responsive, zero latency, customizable

class BreathAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    
    // Volume nodes
    this.masterGain = null;
    this.breathGain = null;
    this.plantGain = null;
    this.ambientGain = null;

    // Active nodes
    this.inhaleNode = null;
    this.exhaleNode = null;
    this.ambientNodes = [];
    
    // Default volumes
    this.volumes = {
      master: 0.85,
      breath: 0.9,
      plant: 0.85,
      ambient: 0.4
    };
  }

  init() {
    if (this.isInitialized) {
      this.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Master
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volumes.master, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Sub-busses
    this.breathGain = this.ctx.createGain();
    this.breathGain.gain.setValueAtTime(this.volumes.breath, this.ctx.currentTime);
    this.breathGain.connect(this.masterGain);

    this.plantGain = this.ctx.createGain();
    this.plantGain.gain.setValueAtTime(this.volumes.plant, this.ctx.currentTime);
    this.plantGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.volumes.ambient, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    this.isInitialized = true;
    this.startAmbient();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create pink/brown noise buffer for natural breath & wind texture
  createNoiseBuffer(seconds = 4, type = 'pink') {
    const bufferSize = this.ctx.sampleRate * seconds;
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
        // Soft brown noise
        b0 = (b0 + (0.02 * white)) / 1.02;
        data[i] = b0 * 3.5;
      }
    }
    return buffer;
  }

  // Inhale: Rising airy tone + soil shifting warm resonance
  startInhale(targetDuration = 4) {
    if (!this.isInitialized) this.init();
    this.resume();
    this.stopInhale();
    this.stopExhale();

    const t = this.ctx.currentTime;

    // 1. Air noise swell (breath)
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.createNoiseBuffer(targetDuration + 2, 'pink');
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.setValueAtTime(2.2, t);
    noiseFilter.frequency.setValueAtTime(220, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(750, t + targetDuration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.35, t + targetDuration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.breathGain);
    noiseSource.start(t);

    // 2. Harmonic warm undertone (F/A calming major 3rd swell)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(174.61, t); // F3
    osc2.frequency.setValueAtTime(220.00, t); // A3

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(0.07, t + targetDuration);

    osc1.connect(oscGain);
    osc2.connect(oscGain);
    oscGain.connect(this.breathGain);
    osc1.start(t);
    osc2.start(t);

    this.inhaleNode = {
      sources: [noiseSource, osc1, osc2],
      gains: [noiseGain, oscGain],
      filter: noiseFilter
    };
  }

  stopInhale() {
    if (!this.inhaleNode) return;
    const t = this.ctx.currentTime;
    this.inhaleNode.gains.forEach(g => {
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0.001, t + 0.3);
      } catch (e) {}
    });
    const sources = this.inhaleNode.sources;
    setTimeout(() => {
      sources.forEach(s => {
        try { s.stop(); s.disconnect(); } catch (e) {}
      });
    }, 350);
    this.inhaleNode = null;
  }

  // Exhale: Falling gentle wind + soft leaf rustle
  startExhale(targetDuration = 6) {
    if (!this.isInitialized) this.init();
    this.resume();
    this.stopInhale();
    this.stopExhale();

    const t = this.ctx.currentTime;

    // 1. Falling wind noise
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.createNoiseBuffer(targetDuration + 2, 'pink');
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(800, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(180, t + targetDuration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.linearRampToValueAtTime(0.001, t + targetDuration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.breathGain);
    noiseSource.start(t);

    // 2. Soft settling harmonic tone
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(146.83, t); // D3
    osc.frequency.linearRampToValueAtTime(130.81, t + targetDuration); // C3

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.06, t);
    oscGain.gain.linearRampToValueAtTime(0.001, t + targetDuration);

    osc.connect(oscGain);
    oscGain.connect(this.breathGain);
    osc.start(t);

    this.exhaleNode = {
      sources: [noiseSource, osc],
      gains: [noiseGain, oscGain]
    };
  }

  stopExhale() {
    if (!this.exhaleNode) return;
    const t = this.ctx.currentTime;
    this.exhaleNode.gains.forEach(g => {
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0.001, t + 0.3);
      } catch (e) {}
    });
    const sources = this.exhaleNode.sources;
    setTimeout(() => {
      sources.forEach(s => {
        try { s.stop(); s.disconnect(); } catch (e) {}
      });
    }, 350);
    this.exhaleNode = null;
  }

  // Growth Step: Stem creak + single crystal dew drop
  playGrowthStep() {
    if (!this.isInitialized) this.init();
    this.resume();
    const t = this.ctx.currentTime;

    // A. Dew drop (glistening sine drip: ~1600Hz -> 850Hz with pure gentle decay)
    const dropOsc = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();

    dropOsc.type = 'sine';
    const baseFreq = 1450 + Math.random() * 200;
    dropOsc.frequency.setValueAtTime(baseFreq, t);
    dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, t + 0.12);

    dropGain.gain.setValueAtTime(0.28, t);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    dropOsc.connect(dropGain);
    dropGain.connect(this.plantGain);
    dropOsc.start(t);
    dropOsc.stop(t + 0.36);

    // B. Organic stem creak / unfurl texture
    const creakBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.2), this.ctx.sampleRate);
    const cData = creakBuffer.getChannelData(0);
    for (let i = 0; i < cData.length; i++) {
      // Modulated click texture
      const p = i / cData.length;
      cData[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI * 18) * Math.exp(-p * 10);
    }
    const creakSource = this.ctx.createBufferSource();
    creakSource.buffer = creakBuffer;

    const creakFilter = this.ctx.createBiquadFilter();
    creakFilter.type = 'bandpass';
    creakFilter.frequency.setValueAtTime(450 + Math.random() * 100, t);
    creakFilter.Q.setValueAtTime(4, t);

    const creakGain = this.ctx.createGain();
    creakGain.gain.setValueAtTime(0.18, t);

    creakSource.connect(creakFilter);
    creakFilter.connect(creakGain);
    creakGain.connect(this.plantGain);
    creakSource.start(t + 0.03);
  }

  // Bloom: Shimmering pentatonic wind chimes + soft wing flutter
  playBloom() {
    if (!this.isInitialized) this.init();
    this.resume();
    const t = this.ctx.currentTime;

    // Pentatonic chime cluster (calming high bells)
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    notes.forEach((freq, idx) => {
      const delay = idx * 0.14 + (Math.random() * 0.05);
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, t + delay);

      chimeGain.gain.setValueAtTime(0.0001, t + delay);
      chimeGain.gain.linearRampToValueAtTime(0.16 / (idx * 0.2 + 1), t + delay + 0.015);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 2.2);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.plantGain);

      chimeOsc.start(t + delay);
      chimeOsc.stop(t + delay + 2.3);
    });

    // Soft wing flutter (gentle modulated breeze)
    const flutterSource = this.ctx.createBufferSource();
    flutterSource.buffer = this.createNoiseBuffer(2.5, 'pink');
    const flutterFilter = this.ctx.createBiquadFilter();
    flutterFilter.type = 'bandpass';
    flutterFilter.frequency.setValueAtTime(900, t);
    flutterFilter.Q.setValueAtTime(1.5, t);

    const flutterGain = this.ctx.createGain();
    flutterGain.gain.setValueAtTime(0.001, t + 0.5);
    flutterGain.gain.linearRampToValueAtTime(0.12, t + 1.2);
    flutterGain.gain.linearRampToValueAtTime(0.001, t + 2.5);

    flutterSource.connect(flutterFilter);
    flutterFilter.connect(flutterGain);
    flutterGain.connect(this.plantGain);
    flutterSource.start(t + 0.5);
    flutterSource.stop(t + 2.6);
  }

  // Gentle dusk ambient soundscape: low warm wind drift + quiet night crickets
  startAmbient() {
    if (!this.ctx || this.ambientNodes.length > 0) return;
    const t = this.ctx.currentTime;

    // 1. Ultra-low warm wind drone
    const droneNoise = this.ctx.createBufferSource();
    droneNoise.buffer = this.createNoiseBuffer(6, 'brown');
    droneNoise.loop = true;

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(110, t);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.35, t);

    droneNoise.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.ambientGain);
    droneNoise.start(t);
    this.ambientNodes.push(droneNoise);

    // 2. Distant night cricket trill (procedural gentle pulses)
    const cricketOsc = this.ctx.createOscillator();
    cricketOsc.type = 'sine';
    cricketOsc.frequency.setValueAtTime(4600, t);

    const cricketAmp = this.ctx.createGain();
    cricketAmp.gain.setValueAtTime(0.015, t);

    // LFO to create cricket rhythm (intermittent)
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(3.5, t); // rhythmic chirping
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.012, t);

    lfo.connect(lfoGain);
    lfoGain.connect(cricketAmp.gain);

    cricketOsc.connect(cricketAmp);
    cricketAmp.connect(this.ambientGain);

    cricketOsc.start(t);
    lfo.start(t);
    this.ambientNodes.push(cricketOsc, lfo);
  }

  setVolume(category, value) {
    this.volumes[category] = value;
    if (!this.ctx) return;
    const node = this[`${category}Gain`];
    if (node) {
      node.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05);
    }
  }
}

window.BreathAudio = new BreathAudioEngine();
