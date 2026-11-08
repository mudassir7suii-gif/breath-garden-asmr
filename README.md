# Breath Garden • ASMR Tactile Botanical Sanctuary

An interactive, single-mechanic ASMR botanical relaxation game built with **Next.js 14, React 18, TypeScript, Tailwind CSS, HTML5 Canvas, and procedural Web Audio synthesis**.

Designed specifically for adults experiencing stress, exhaustion, burnout, or anhedonia. Following the design pillars of the **Seven ASMR Games Blueprints**:

---

## 🌿 Core Design Pillars

1. **Instant Gratification (<2 Seconds):** First sound-and-touch reward within 2 seconds of the first tap. Zero mandatory tutorial screens or account setups.
2. **Zero Pressure / No Fail States:** No accuracy scores, no countdown timers, no lives, no leaderboards, and no guilt. Whether you take a 2-second breath or a deep 6-second breath, the plant always unfurls and grows gently.
3. **Gentle Natural Endings:** Natural session shape of 2 to 4 minutes (~10 breaths to full bloom). Ending screen defaults to "Rest in the Garden" rather than forcing another session.
4. **Forgiving by Default:** No daily streaks, no penalties for missing days, and plants in your Herbarium never decay or wither.
5. **Tactile Acoustic Priority:** Procedural object sounds by default; mouth/whispering off. Independent volume mixers for Breath Swell, Stem/Dew Drops, Dusk Ambience, and Binaural Theta Calming Tone.
6. **One-Hand Portrait Mobile-First:** Designed to be played comfortably lying down with one thumb or on desktop with Spacebar hold.
7. **Ethical Boundaries:** No medical or therapeutic claims. Discreet, quiet crisis support and helpline directory in settings.

---

## 🌱 Poetic Seed Species

- **Celestia Moonflower (*The Midnight Healer*):** Blooms in the quiet of dusk, unfurling silk-white petals and a soft moonlight aura.
  > *"Like the moon, you do not need to be whole to shine."*
- **Imperial Night Jasmine (*The Fragrant Solace*):** Slender arching branches crowned with clusters of starry florets that release calming sweetness on every release.
  > *"In the stillness of the dark, the sweet scent lingers."*
- **Ancient Silver Fern (*The Unfurling Peace*):** Sacred spiral fiddlehead that gently unrolls silver-dusted fronds and glistening crystal dew.
  > *"Growth is not forced; it unfolds one breath at a time."*

---

## 🎧 Procedural ASMR Sound Architecture

The game uses **100% procedural synthetic audio via Web Audio API**:
- **Inhale Swell:** Bandpass-filtered pink noise + warm major triad resonance (F3, A3, C4).
- **Exhale Descent:** Lowpass filtered falling wind noise + gentle settling harmonic tones (D3 to C3).
- **Dew Drop Ping:** Sine droplet glissando (1420Hz → 820Hz) with natural exponential decay.
- **Stem Creak / Unfurl:** Modulated bandpass friction clicks mimicking physical plant fibers expanding.
- **Full Bloom Chimes:** Shimmering pentatonic bell cluster (C5, E5, G5, C6, E6, G6) with ambient wing flutter.
- **Dusk Ambience:** Low-frequency warm brown-noise wind drift + subtle procedural night crickets.
- **Binaural Calming Drone:** Stereo split oscillators with a 6Hz Theta frequency difference (108Hz Left, 114Hz Right) for deep nervous system calming.

---

## 🛠️ Local Development & Running

### Prerequisites
- Node.js 18+ and npm

### Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Build Production Bundle
```bash
npm run build
npm start
```

---

## 🎮 Controls
- **Touch / Mouse Hold:** Inhale (Ring swells, rising breath chord, tactile haptic pulse)
- **Release:** Exhale (Ring relaxes, plant grows, dew drop ping, subtle stem creak)
- **Desktop Keyboard:** Hold **Spacebar** to inhale, release **Spacebar** to exhale
- **Top Right Gear Icon:** Open ASMR Mixer (adjust individual audio stems) and customize breath pacing (3–6s inhale, 4–10s exhale)
- **Sanctuary Button:** View your permanent collection of past blooms in the Herbarium
