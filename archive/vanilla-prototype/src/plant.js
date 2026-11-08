// Procedural Botanical Simulation for Breath Garden
// Smooth organic growth, dew drops, wind sway, and blooming

const PLANT_TYPES = {
  moonflower: {
    name: 'Moonflower',
    description: 'Blooms under twilight with soft luminous petals',
    color: '#8A9BA8',
    petalColor: '#E8ECF5',
    centerColor: '#FFEAA7',
    leafColor: '#4A6B5D',
    stemColor: '#3B5249',
    glowColor: 'rgba(232, 236, 245, 0.45)',
    maxSteps: 10
  },
  jasmine: {
    name: 'Night Jasmine',
    description: 'Slender branches with clusters of sweet starry florets',
    color: '#95D5B2',
    petalColor: '#FFFDF0',
    centerColor: '#F4A261',
    leafColor: '#2D6A4F',
    stemColor: '#403D39',
    glowColor: 'rgba(255, 253, 240, 0.45)',
    maxSteps: 10
  },
  fern: {
    name: 'Silver Fern',
    description: 'Ancient spiral fronds that unfurl with silver dew drops',
    color: '#74C69D',
    petalColor: '#D8F3DC',
    centerColor: '#52B788',
    leafColor: '#1B4332',
    stemColor: '#2D6A4F',
    glowColor: 'rgba(216, 243, 220, 0.4)',
    maxSteps: 10
  }
};

class PlantSimulation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.plantType = PLANT_TYPES.moonflower;
    this.growthStep = 0;
    this.targetGrowth = 0;
    this.currentGrowth = 0; // interpolated 0..10
    this.time = 0;
    this.dewDrops = [];
    this.pollenParticles = [];
    this.ripples = [];
    this.visitor = null; // Bee or Moth
    this.isBloomed = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || this.canvas.clientWidth || window.innerWidth || 400;
    const height = rect.height || this.canvas.clientHeight || window.innerHeight || 750;
    
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    if (this.ctx.resetTransform) {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.scale(dpr, dpr);
    this.w = width;
    this.h = height;
  }

  setPlantType(typeKey) {
    this.plantType = PLANT_TYPES[typeKey] || PLANT_TYPES.moonflower;
    this.reset();
  }

  reset() {
    this.growthStep = 0;
    this.targetGrowth = 0;
    this.currentGrowth = 0;
    this.dewDrops = [];
    this.pollenParticles = [];
    this.ripples = [];
    this.visitor = null;
    this.isBloomed = false;
  }

  advanceStep() {
    if (this.growthStep < this.plantType.maxSteps) {
      this.growthStep++;
      this.targetGrowth = this.growthStep;

      // Spawn dew drop on growth
      if (this.growthStep >= 3) {
        this.spawnDewDrop();
      }

      // Check for bloom
      if (this.growthStep === this.plantType.maxSteps) {
        this.isBloomed = true;
        this.spawnVisitor();
      }

      return true;
    }
    return false;
  }

  spawnDewDrop() {
    this.dewDrops.push({
      x: this.w * 0.5 + (Math.random() - 0.5) * 60,
      y: this.h * 0.65 - (this.growthStep * 20),
      radius: 3 + Math.random() * 2.5,
      alpha: 0.9,
      falling: false,
      vy: 0
    });
  }

  spawnVisitor() {
    this.visitor = {
      x: this.w * 0.1,
      y: this.h * 0.3,
      targetX: this.w * 0.5 + 18,
      targetY: this.h * 0.38,
      wingPhase: 0,
      glow: 0,
      landed: false
    };

    // Burst of gentle pollen
    for (let i = 0; i < 35; i++) {
      this.pollenParticles.push({
        x: this.w * 0.5 + (Math.random() - 0.5) * 30,
        y: this.h * 0.42 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.3 - Math.random() * 0.7,
        alpha: 0.8 + Math.random() * 0.2,
        life: 1.0,
        decay: 0.003 + Math.random() * 0.004,
        size: 1.5 + Math.random() * 2
      });
    }
  }

  update(dt) {
    this.time += dt;

    // Smooth growth interpolation
    if (this.currentGrowth < this.targetGrowth) {
      this.currentGrowth += (this.targetGrowth - this.currentGrowth) * 0.08;
    }

    // Update dew drops
    for (let i = this.dewDrops.length - 1; i >= 0; i--) {
      const drop = this.dewDrops[i];
      if (drop.falling) {
        drop.vy += 0.15;
        drop.y += drop.vy;
        if (drop.y >= this.h * 0.86) {
          // Trigger gentle ripple on soil
          this.ripples.push({
            x: drop.x,
            y: this.h * 0.86,
            radius: 2,
            alpha: 0.6
          });
          this.dewDrops.splice(i, 1);
        }
      } else {
        if (Math.random() < 0.01 && this.currentGrowth > 4) {
          drop.falling = true;
        }
      }
    }

    // Update ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += 0.45;
      rip.alpha -= 0.015;
      if (rip.alpha <= 0) {
        this.ripples.splice(i, 1);
      }
    }

    // Update pollen
    for (let i = this.pollenParticles.length - 1; i >= 0; i--) {
      const p = this.pollenParticles[i];
      p.x += p.vx + Math.sin(this.time * 2 + p.y * 0.05) * 0.3;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.pollenParticles.splice(i, 1);
      }
    }

    // Update visitor (honeybee / moth)
    if (this.visitor) {
      this.visitor.wingPhase += 0.4;
      const dx = this.visitor.targetX - this.visitor.x;
      const dy = this.visitor.targetY - this.visitor.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        this.visitor.x += dx * 0.03;
        this.visitor.y += dy * 0.03 + Math.sin(this.time * 6) * 0.6;
      } else {
        this.visitor.landed = true;
        this.visitor.glow = Math.min(1, this.visitor.glow + 0.02);
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    const progress = this.currentGrowth / this.plantType.maxSteps;

    // Wind sway factor
    const sway = Math.sin(this.time * 1.5) * 4 * (0.3 + progress * 0.7);

    // Draw Soil Mound at base
    this.renderSoil();

    if (this.currentGrowth <= 0.05) return;

    // Stem Coordinates
    const baseX = this.w * 0.5;
    const baseY = this.h * 0.86;
    const maxStemHeight = this.h * 0.44;
    const currentHeight = maxStemHeight * Math.min(1, progress * 1.15);

    const midX = baseX + sway * 0.6 + Math.sin(this.time * 1.2) * 5;
    const midY = baseY - currentHeight * 0.55;
    const tipX = baseX + sway;
    const tipY = baseY - currentHeight;

    // Draw Stem
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(baseX, baseY);
    this.ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    this.ctx.strokeStyle = this.plantType.stemColor;
    this.ctx.lineWidth = Math.max(3, 7 * (1 - progress * 0.35));
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Draw Leaves
    const numLeaves = Math.floor(this.currentGrowth);
    for (let i = 1; i <= numLeaves; i++) {
      const leafProg = i / this.plantType.maxSteps;
      const leafY = baseY - (currentHeight * (leafProg * 0.85));
      const leafX = baseX + (sway * leafProg * 0.6);
      const isRight = i % 2 === 0;
      const leafSize = Math.min(32, 12 + i * 2.2);

      this.renderLeaf(leafX, leafY, isRight, leafSize, leafProg);
    }

    // Draw Dew drops on leaves
    this.dewDrops.forEach(drop => {
      this.ctx.beginPath();
      this.ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(235, 248, 255, 0.85)';
      this.ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
      this.ctx.shadowBlur = 4;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Draw Flower / Bloom
    if (this.currentGrowth >= 7) {
      const bloomProgress = (this.currentGrowth - 7) / 3; // 0..1
      this.renderBloom(tipX, tipY, bloomProgress);
    }

    // Draw Pollen
    this.pollenParticles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 235, 175, ${p.alpha * p.life})`;
      this.ctx.shadowColor = 'rgba(255, 235, 175, 0.8)';
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Draw Visitor (Gentle Nocturnal Moth / Bee)
    if (this.visitor) {
      this.renderVisitor(this.visitor.x, this.visitor.y, this.visitor.wingPhase, this.visitor.glow);
    }

    this.ctx.restore();
  }

  renderSoil() {
    const baseX = this.w * 0.5;
    const baseY = this.h * 0.86;

    this.ctx.save();
    // Warm gentle mound
    const gradient = this.ctx.createRadialGradient(baseX, baseY + 6, 5, baseX, baseY + 6, 80);
    gradient.addColorStop(0, '#26221E');
    gradient.addColorStop(0.7, '#1C1917');
    gradient.addColorStop(1, 'rgba(20, 18, 16, 0)');

    this.ctx.beginPath();
    this.ctx.ellipse(baseX, baseY + 6, 75, 18, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Small organic pebbles / soil flecks
    this.ctx.fillStyle = '#3E3731';
    for (let i = -3; i <= 3; i++) {
      this.ctx.beginPath();
      this.ctx.arc(baseX + i * 18 + Math.sin(i) * 6, baseY + 4 + Math.cos(i) * 2, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Dew drop soil ripples
    this.ripples.forEach(rip => {
      this.ctx.beginPath();
      this.ctx.ellipse(rip.x, rip.y, rip.radius * 2.2, rip.radius * 0.7, 0, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(180, 215, 230, ${rip.alpha})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  renderLeaf(x, y, isRight, size, prog) {
    this.ctx.save();
    this.ctx.translate(x, y);
    const angle = isRight ? 0.45 : -0.45;
    const sway = Math.sin(this.time * 2 + prog * 4) * 0.08;
    this.ctx.rotate(angle + sway);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.quadraticCurveTo(size * 0.7, -size * 0.5, size * 1.4, 0);
    this.ctx.quadraticCurveTo(size * 0.7, size * 0.5, 0, 0);

    const grad = this.ctx.createLinearGradient(0, 0, size * 1.4, 0);
    grad.addColorStop(0, this.plantType.stemColor);
    grad.addColorStop(1, this.plantType.leafColor);

    this.ctx.fillStyle = grad;
    this.ctx.fill();

    // Delicate vein line
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(size * 1.2, 0);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.restore();
  }

  renderBloom(x, y, progress) {
    this.ctx.save();
    this.ctx.translate(x, y);

    const numPetals = this.plantType === PLANT_TYPES.fern ? 7 : 8;
    const petalLength = 28 * progress;
    const petalWidth = 12 * progress;

    // Luminous halo when fully blooming
    if (progress > 0.6) {
      const glowAlpha = (progress - 0.6) * 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 45 * progress, 0, Math.PI * 2);
      this.ctx.fillStyle = this.plantType.glowColor;
      this.ctx.shadowColor = this.plantType.petalColor;
      this.ctx.shadowBlur = 18;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // Outer Petals
    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * Math.PI * 2 + Math.sin(this.time + i) * 0.05;
      this.ctx.save();
      this.ctx.rotate(angle);

      this.ctx.beginPath();
      this.ctx.ellipse(petalLength * 0.6, 0, petalLength * 0.6, petalWidth * 0.5, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = this.plantType.petalColor;
      this.ctx.shadowColor = 'rgba(255,255,255,0.4)';
      this.ctx.shadowBlur = 4;
      this.ctx.fill();
      this.ctx.restore();
    }

    // Golden/warm Core
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 8 * progress, 0, Math.PI * 2);
    this.ctx.fillStyle = this.plantType.centerColor;
    this.ctx.shadowColor = this.plantType.centerColor;
    this.ctx.shadowBlur = 8;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.ctx.restore();
  }

  renderVisitor(x, y, wingPhase, glow) {
    this.ctx.save();
    this.ctx.translate(x, y);

    // Soft luminous moth/bee glow
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 235, 175, ${0.15 + glow * 0.2})`;
    this.ctx.fill();

    // Wings
    const wingFlap = Math.sin(wingPhase) * 0.75;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.beginPath();
    this.ctx.ellipse(-4, -6 * wingFlap, 9, 5 * Math.abs(wingFlap) + 2, -0.4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(4, -6 * wingFlap, 9, 5 * Math.abs(wingFlap) + 2, 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.ctx.fillStyle = '#4A3B32';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 3, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Warm golden thorax stripes
    this.ctx.fillStyle = '#F4A261';
    this.ctx.fillRect(-2, -1, 4, 1.5);
    this.ctx.fillRect(-2, 2, 4, 1.5);

    this.ctx.restore();
  }
}

window.PlantSimulation = PlantSimulation;
window.PLANT_TYPES = PLANT_TYPES;
