# Seven ASMR Games for Calming & Low-Energy Play

## Overview
Seven single-mechanic ASMR games designed specifically for adults experiencing stress, depression, or anhedonia. Scoped for a small team (1 developer, 1 artist, 1 sound designer) to ship playable versions rapidly (weeks, not months).

**Platform target:** Mobile first (touch & haptics carry core sensation, one-hand portrait, playable lying down).

---

## Core Pillars & Design Rules
1. **Instant gratification:** First sound-and-touch reward within 2 seconds of the first tap. Zero tutorial screens.
2. **Zero pressure:** No fail states, scores, lives, streaks, leaderboards, or timers.
3. **Gentle natural endings:** 2 to 8 minutes per session. Ending screens default to "Rest".
4. **Forgiving by default:** Missing days costs nothing.
5. **Tactile acoustic priority:** Object sounds by default; mouth/whispering off. Independent volume sliders per sound category. High-fidelity close-mic audio and haptics.
6. **Passive notifications:** Off by default. If enabled, at most one gentle line per day.
7. **Ethical boundaries:** No medical or therapeutic claims. A discreet, quiet "Need to talk to someone?" helpline link in settings.

---

## The 7 Game Blueprints

### 1. Kintsugi (The Flagship)
- **Pitch:** Mend broken pottery with gold. Every finished bowl joins your shelf; no two cracks are ever alike.
- **Core Loop:**
  1. Unwrap linen from broken bowl.
  2. Drag ceramic pieces near neighbours (snaps with resonant clink).
  3. Trace seams with finger (lacquer then molten gold follows finger speed).
  4. Brush gold dust over seams; swipe cloth to polish.
  5. Place bowl on wooden shelf, lighting warms, session ends.
- **Session Shape:** 4–7 minutes.
- **Key Risk:** Procedural fracture generation that fits back together cleanly.

### 2. Breath Garden (The Audio/Haptics Benchmark)
- **Pitch:** Breathe slowly; a plant grows on every exhale.
- **Core Loop:**
  1. Pick one of three seeds.
  2. Press & hold to inhale (gentle ring swells ~4s).
  3. Release to exhale (~6s). Plant unfurls leaf, dew drops.
  4. ~10 breaths to full bloom; visiting bee or bird arrives.
  5. Settle plant in garden; screen gently settles.
- **Session Shape:** 2–4 minutes.
- **Pacing:** Responsive to player's natural breath (3–5s in, 5–8s out), never penalizing fast breaths.

### 3. Untangle
- **Pitch:** Pull knotted threads loose one strand at a time until everything lies in neat coils.
- **Core Loop:** Touch/hold reveals free strands; drag strand out of knot with friction; strand auto-coils into basket.
- **Session Shape:** 3–6 minutes.
- **Safeguard:** Inactivity (~30s) subtly brightens the next free strand.

### 4. The Lighthouse
- **Pitch:** Light the lamp once a day, then watch the sea as an ambient ritual.
- **Core Loop:** Swipe up stairs -> strike match -> wind clockwork -> watch ships and weather. Ambient mode with sleep timer.
- **Session Shape:** 1–2 minutes action + endless ambient mode.

### 5. Wax Seal Letters
- **Pitch:** Write one line or nothing at all, fold paper, melt wax, stamp seal into drawer.
- **Core Loop:** Prompt displayed ("Something small today") or "Seal it blank" -> fold paper -> melt and drip wax -> press seal.
- **Privacy Safeguard:** Fully local encrypted storage; no cloud sync; optional lock; helpline link in drawer.

### 6. Tea House (Folded with Fogged Window)
- **Pitch:** Brew tea for quiet animal visitors with realistic steeping time.
- **Core Loop:** Fill kettle -> boil water -> scoop leaves -> pour -> steep 2–3 minutes with ambient rain/fogged window -> serve.
- **Safeguard:** Early pouring allowed anytime (tea is lighter, guest remains grateful).

### 7. Fogged Window
- **Pitch:** Wipe condensation off glass to reveal a living diorama matching current time of day.
- **Integration:** Integrated into the Tea House window or standalone quick-touch ritual.

---

## MVP Estimates & Roadmap

| Order | Game | Core Sensation | Session | MVP Estimate | Main Risk |
|---|---|---|---|---|---|
| 1 | **Breath Garden** | Breath, wind, leaves | 2–4 min | 3–4 weeks | Meditation app comparison |
| 2 | **Kintsugi** | Ceramic clinks, gold pour | 4–7 min | 6–8 weeks | Fracture generation |
| 3 | **Wax Seal Letters** | Paper, wax, seal crunch | 2–4 min | 3–5 weeks | Privacy & encryption |
| 4 | **Tea House** (+ Fogged Window) | Water, steam, ceramic, glass wipe | 4–6 min | 4–6 weeks | Quality of writing |
| 5 | **The Lighthouse** | Match, clockwork, waves | 1–2 min + ambient | 4–6 weeks | Action may feel thin |
| 6 | **Untangle** | Friction, knot pops | 3–6 min | 6–8 weeks | Rope physics feel |

---

## Key Discussion Decisions
1. **Packaging:** One cohesive hub app (a sanctuary or house with rooms) vs. standalone micro-apps.
2. **Monetization:** Premium one-off purchase vs. freemium with cosmetic seasonal packs.
3. **Audio Pipeline:** Bespoke foley recordings vs. curated high-res library layering.
4. **Safety & Copy Review:** Mental health specialist consultation for text and tone.
5. **Privacy in Wax Seal:** Local encryption + helpline approach vs. keyword sniffing.
6. **Target Launch Stack:** Web/PWA prototype -> Flutter / React Native / Unity engine choice.
