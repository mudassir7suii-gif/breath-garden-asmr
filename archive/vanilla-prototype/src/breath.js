// Breath Mechanic & Haptic Controller for Breath Garden
// Adapts naturally to the player's pace without punishment or scoring

class BreathController {
  constructor(options = {}) {
    this.targetInhale = options.inhaleTime || 4.0;
    this.targetExhale = options.exhaleTime || 6.0;

    this.state = 'idle'; // 'inhaling' | 'exhaling' | 'idle'
    this.currentHoldTime = 0;
    this.currentExhaleTime = 0;
    this.breathCount = 0;

    this.onInhaleStart = options.onInhaleStart || (() => {});
    this.onExhaleStart = options.onExhaleStart || (() => {});
    this.onGrowthStep = options.onGrowthStep || (() => {});
    this.onBreathCycleComplete = options.onBreathCycleComplete || (() => {});

    this.hasVibrated = false;
    this.hapticsEnabled = true;
    this.bindEvents();
  }

  bindEvents() {
    const triggerEl = document.getElementById('breath-touch-zone') || window;

    // Pointer events for instant touch & mouse response
    triggerEl.addEventListener('pointerdown', (e) => this.handlePointerDown(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.handlePointerUp(e), { passive: false });
    window.addEventListener('pointercancel', (e) => this.handlePointerUp(e), { passive: false });

    // Keyboard support (Spacebar to breathe)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.repeat && this.state !== 'inhaling') {
        e.preventDefault();
        this.startInhale();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && this.state === 'inhaling') {
        e.preventDefault();
        this.startExhale();
      }
    });
  }

  handlePointerDown(e) {
    // Ignore interactive UI buttons
    if (e.target.closest('button, input, select, .no-breath-zone')) return;
    e.preventDefault();
    this.startInhale();
  }

  handlePointerUp(e) {
    if (this.state === 'inhaling') {
      this.startExhale();
    }
  }

  startInhale() {
    if (this.state === 'inhaling') return;
    this.state = 'inhaling';
    this.currentHoldTime = 0;

    // Trigger sound & haptics
    window.BreathAudio?.startInhale(this.targetInhale);
    this.vibrate([10, 40, 15]);

    this.onInhaleStart();
  }

  startExhale() {
    if (this.state !== 'inhaling') return;
    this.state = 'exhaling';
    this.currentExhaleTime = 0;

    // Even if breath was short or long, plant always grows! (No failure state)
    this.breathCount++;
    
    window.BreathAudio?.startExhale(this.targetExhale);
    
    // Plant growth step immediately occurs on exhale release
    setTimeout(() => {
      window.BreathAudio?.playGrowthStep();
      this.vibrate(18); // Tiny crisp tap
      this.onGrowthStep(this.breathCount);
    }, 150);

    this.onExhaleStart();
  }

  update(dt) {
    if (this.state === 'inhaling') {
      this.currentHoldTime += dt;
      // Gentle progressive haptic pulse during deep inhale
      if (this.currentHoldTime > 2.0 && !this.hasVibrated) {
        this.vibrate(8);
        this.hasVibrated = true;
      }
    } else if (this.state === 'exhaling') {
      this.currentExhaleTime += dt;
      this.hasVibrated = false;

      // When exhale finishes settling
      if (this.currentExhaleTime >= this.targetExhale) {
        this.state = 'idle';
        this.onBreathCycleComplete(this.breathCount);
      }
    }
  }

  // Ring expansion ratio (0..1)
  getInhaleProgress() {
    return Math.min(1.0, this.currentHoldTime / this.targetInhale);
  }

  // Ring deflating ratio (0..1)
  getExhaleProgress() {
    return Math.min(1.0, this.currentExhaleTime / this.targetExhale);
  }

  vibrate(pattern) {
    if (!this.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {}
    }
  }

  setPacing(inhale, exhale) {
    this.targetInhale = Math.max(2.5, Math.min(6.0, inhale));
    this.targetExhale = Math.max(4.0, Math.min(10.0, exhale));
  }
}

window.BreathController = BreathController;
