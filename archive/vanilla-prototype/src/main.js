// Main Application Orchestrator for Breath Garden

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('garden-canvas');
  const plantSim = new PlantSimulation(canvas);
  const fireflies = new FireflySystem(24);

  // UI Elements
  const breathZone = document.getElementById('breath-touch-zone');
  const breathPrompt = document.getElementById('breath-prompt');
  const breathRing = document.getElementById('breath-ring');
  const seedSelector = document.getElementById('seed-selector');
  const restingScreen = document.getElementById('resting-screen');
  const gardenOverview = document.getElementById('garden-overview');
  const settingsModal = document.getElementById('settings-modal');

  let activeSeed = 'moonflower';
  let totalBreathesThisSession = 0;
  let isInSession = false;
  let currentView = 'select'; // 'select' | 'growing' | 'resting' | 'garden'

  // Initialize Fireflies with logical dimensions
  fireflies.init(plantSim.w || 400, plantSim.h || 750);

  // Warm audio context on very first user gesture anywhere
  const warmAudio = () => {
    window.BreathAudio?.init();
    window.removeEventListener('pointerdown', warmAudio);
    window.removeEventListener('keydown', warmAudio);
  };
  window.addEventListener('pointerdown', warmAudio, { once: true });
  window.addEventListener('keydown', warmAudio, { once: true });

  // Initialize Breathing Controller
  const breathCtrl = new BreathController({
    inhaleTime: 4.0,
    exhaleTime: 6.0,
    onInhaleStart: () => {
      if (!isInSession) return;
      breathPrompt.textContent = 'Breathe in...';
      breathPrompt.classList.add('inhaling');
      breathPrompt.classList.remove('exhaling');
      breathRing.classList.add('inhale-active');
      breathRing.classList.remove('exhale-active');
    },
    onExhaleStart: () => {
      if (!isInSession) return;
      breathPrompt.textContent = 'Breathe out...';
      breathPrompt.classList.remove('inhaling');
      breathPrompt.classList.add('exhaling');
      breathRing.classList.remove('inhale-active');
      breathRing.classList.add('exhale-active');
    },
    onGrowthStep: (stepNumber) => {
      if (!isInSession) return;
      totalBreathesThisSession = stepNumber;
      const grew = plantSim.advanceStep();

      // Fade prompt text away after 2 breaths so player is immersed in peaceful visuals
      if (stepNumber >= 2 && stepNumber < 9) {
        breathPrompt.style.opacity = '0.35';
      }

      // Check if bloomed
      if (plantSim.isBloomed) {
        handleBloom();
      }
    },
    onBreathCycleComplete: () => {
      if (isInSession && !plantSim.isBloomed) {
        breathPrompt.textContent = 'Hold gently to breathe in';
        breathRing.classList.remove('exhale-active');
      }
    }
  });

  function startGrowingPlant(seedKey) {
    activeSeed = seedKey;
    plantSim.setPlantType(seedKey);
    totalBreathesThisSession = 0;
    isInSession = true;
    currentView = 'growing';

    seedSelector.classList.add('hidden');
    restingScreen.classList.add('hidden');
    gardenOverview.classList.add('hidden');
    breathZone.classList.remove('hidden');

    breathPrompt.textContent = 'Touch and hold to breathe in';
    breathPrompt.style.opacity = '0.85';

    // Immediate tactile feedback within 1 second of tap
    window.BreathAudio?.init();
    window.BreathAudio?.playGrowthStep();
    breathCtrl.vibrate(12);
  }

  function handleBloom() {
    isInSession = false;
    window.BreathAudio?.playBloom();
    breathCtrl.vibrate([25, 45, 25, 45, 30]);

    breathPrompt.textContent = 'Bloomed';
    breathPrompt.style.opacity = '1';
    breathRing.classList.remove('inhale-active', 'exhale-active');

    // Save to persistent garden
    GardenStorage.addPlant(activeSeed);

    // After a peaceful pause, present gentle Rest options (no pressure)
    setTimeout(() => {
      restingScreen.classList.remove('hidden');
    }, 2800);
  }

  // Seed Button Handlers
  document.querySelectorAll('.seed-card').forEach(card => {
    card.addEventListener('click', () => {
      const seedKey = card.dataset.seed;
      startGrowingPlant(seedKey);
    });
  });

  // Resting Screen Action Buttons
  document.getElementById('btn-rest')?.addEventListener('click', () => {
    // Player chooses to just rest in the ambient dusk soundscape
    restingScreen.classList.add('hidden');
    breathZone.classList.add('hidden');
    breathPrompt.textContent = 'Resting in the garden';
  });

  document.getElementById('btn-another-plant')?.addEventListener('click', () => {
    plantSim.reset();
    restingScreen.classList.add('hidden');
    seedSelector.classList.remove('hidden');
    breathZone.classList.add('hidden');
    currentView = 'select';
  });

  document.getElementById('btn-view-garden')?.addEventListener('click', () => {
    showGardenView();
  });

  // Garden Overview Screen
  function showGardenView() {
    currentView = 'garden';
    restingScreen.classList.add('hidden');
    seedSelector.classList.add('hidden');
    breathZone.classList.add('hidden');
    gardenOverview.classList.remove('hidden');

    const listEl = document.getElementById('garden-plants-list');
    const plants = GardenStorage.getPlants();

    listEl.innerHTML = '';
    if (plants.length === 0) {
      listEl.innerHTML = '<p class="empty-garden-note">Your sanctuary is quiet. Breathe with a seed to plant your first bloom.</p>';
    } else {
      plants.slice().reverse().forEach(p => {
        const info = PLANT_TYPES[p.type] || PLANT_TYPES.moonflower;
        const item = document.createElement('div');
        item.className = 'garden-item';
        const dateStr = new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        item.innerHTML = `
          <div class="garden-item-icon" style="background:${info.petalColor}; box-shadow: 0 0 10px ${info.glowColor}"></div>
          <div class="garden-item-details">
            <div class="garden-item-title">${info.name}</div>
            <div class="garden-item-date">Nurtured on ${dateStr}</div>
          </div>
        `;
        listEl.appendChild(item);
      });
    }
  }

  document.getElementById('btn-close-garden')?.addEventListener('click', () => {
    gardenOverview.classList.add('hidden');
    if (plantSim.isBloomed) {
      restingScreen.classList.remove('hidden');
    } else {
      seedSelector.classList.remove('hidden');
    }
  });

  // Settings Modal Handlers
  const btnSettings = document.getElementById('btn-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');

  btnSettings?.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });

  btnCloseSettings?.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  // Audio Sliders
  document.getElementById('vol-breath')?.addEventListener('input', (e) => {
    window.BreathAudio?.setVolume('breath', parseFloat(e.target.value));
  });

  document.getElementById('vol-plant')?.addEventListener('input', (e) => {
    window.BreathAudio?.setVolume('plant', parseFloat(e.target.value));
  });

  document.getElementById('vol-ambient')?.addEventListener('input', (e) => {
    window.BreathAudio?.setVolume('ambient', parseFloat(e.target.value));
  });

  // Pacing Sliders
  const inhaleSlider = document.getElementById('pace-inhale');
  const exhaleSlider = document.getElementById('pace-exhale');
  const inhaleValText = document.getElementById('pace-inhale-val');
  const exhaleValText = document.getElementById('pace-exhale-val');

  function updatePacing() {
    const inVal = parseFloat(inhaleSlider.value);
    const outVal = parseFloat(exhaleSlider.value);
    inhaleValText.textContent = `${inVal}s`;
    exhaleValText.textContent = `${outVal}s`;
    breathCtrl.setPacing(inVal, outVal);
  }

  inhaleSlider?.addEventListener('input', updatePacing);
  exhaleSlider?.addEventListener('input', updatePacing);

  // Animation Loop (60fps)
  let lastTime = performance.now();
  function loop(currentTime) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    breathCtrl.update(dt);
    plantSim.update(dt);
    fireflies.update(plantSim.w, plantSim.h);

    // Dynamic Ring Scaling to match breath
    if (breathCtrl.state === 'inhaling') {
      const p = breathCtrl.getInhaleProgress();
      const scale = 1 + p * 0.45;
      breathRing.style.transform = `scale(${scale})`;
      breathRing.style.opacity = `${0.3 + p * 0.5}`;
    } else if (breathCtrl.state === 'exhaling') {
      const p = 1 - breathCtrl.getExhaleProgress();
      const scale = 1 + p * 0.45;
      breathRing.style.transform = `scale(${scale})`;
      breathRing.style.opacity = `${0.2 + p * 0.4}`;
    }

    // Render Scene
    plantSim.render();
    fireflies.render(plantSim.ctx);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
