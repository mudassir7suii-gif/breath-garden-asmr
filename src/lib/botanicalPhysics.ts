// Procedural Botanical Simulation for Breath Garden
// Realistic organic growth, physics-driven dew drops, wind sway, fireflies, and nocturnal visitor

import { PlantSpecies, PLANT_SPECIES } from './botanicalTypes';

export interface DewDrop {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  falling: boolean;
  vy: number;
}

export interface SoilRipple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

export interface PollenParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  decay: number;
  size: number;
}

export interface Firefly {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
  vx: number;
  vy: number;
}

export interface NocturnalVisitor {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  wingPhase: number;
  glow: number;
  landed: boolean;
}

export class BotanicalSimulation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public species: PlantSpecies;
  public growthStep: number = 0;
  public targetGrowth: number = 0;
  public currentGrowth: number = 0; // Smoothly interpolated 0..10
  public time: number = 0;

  public dewDrops: DewDrop[] = [];
  public soilRipples: SoilRipple[] = [];
  public pollenParticles: PollenParticle[] = [];
  public fireflies: Firefly[] = [];
  public visitor: NocturnalVisitor | null = null;
  public isBloomed: boolean = false;

  public w: number = 400;
  public h: number = 750;

  constructor(canvas: HTMLCanvasElement, speciesId: 'moonflower' | 'jasmine' | 'fern' = 'moonflower') {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D Canvas context not supported');
    this.ctx = context;
    this.species = PLANT_SPECIES[speciesId] || PLANT_SPECIES.moonflower;

    this.initFireflies(24);
    this.resize();
  }

  public resize(): void {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || this.canvas.clientWidth || 400;
    const height = rect.height || this.canvas.clientHeight || 750;

    this.w = width;
    this.h = height;
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);

    if (this.ctx.resetTransform) {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.scale(dpr, dpr);
  }

  public setSpecies(speciesId: 'moonflower' | 'jasmine' | 'fern'): void {
    this.species = PLANT_SPECIES[speciesId] || PLANT_SPECIES.moonflower;
    this.reset();
  }

  public reset(): void {
    this.growthStep = 0;
    this.targetGrowth = 0;
    this.currentGrowth = 0;
    this.dewDrops = [];
    this.soilRipples = [];
    this.pollenParticles = [];
    this.visitor = null;
    this.isBloomed = false;
  }

  public initFireflies(count: number = 24): void {
    this.fireflies = [];
    for (let i = 0; i < count; i++) {
      this.fireflies.push({
        x: Math.random() * (this.w || 400),
        y: Math.random() * (this.h || 750) * 0.75 + (this.h || 750) * 0.12,
        radius: 1.2 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.035,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35,
      });
    }
  }

  public advanceStep(): boolean {
    if (this.growthStep < this.species.maxSteps) {
      this.growthStep++;
      this.targetGrowth = this.growthStep;

      // Spawn crystalline dew drops as moisture condenses
      if (this.growthStep >= 2) {
        this.spawnDewDrop();
      }

      // Check for full bloom at max steps
      if (this.growthStep >= this.species.maxSteps) {
        this.isBloomed = true;
        this.spawnVisitor();
        this.burstPollen();
      }

      return true;
    }
    return false;
  }

  private spawnDewDrop(): void {
    const baseX = this.w * 0.5;
    const baseY = this.h * 0.85;
    const progress = this.growthStep / this.species.maxSteps;
    const currentHeight = this.h * 0.45 * Math.min(1, progress * 1.15);

    this.dewDrops.push({
      x: baseX + (Math.random() - 0.5) * 50,
      y: baseY - currentHeight * (0.3 + Math.random() * 0.6),
      radius: 2.5 + Math.random() * 2.5,
      alpha: 0.9,
      falling: false,
      vy: 0,
    });
  }

  private burstPollen(): void {
    const tipX = this.w * 0.5;
    const tipY = this.h * 0.85 - this.h * 0.45;

    for (let i = 0; i < 40; i++) {
      this.pollenParticles.push({
        x: tipX + (Math.random() - 0.5) * 40,
        y: tipY + (Math.random() - 0.5) * 35,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.35 - Math.random() * 0.85,
        alpha: 0.85 + Math.random() * 0.15,
        life: 1.0,
        decay: 0.0025 + Math.random() * 0.0035,
        size: 1.6 + Math.random() * 2.2,
      });
    }
  }

  private spawnVisitor(): void {
    this.visitor = {
      x: this.w * (Math.random() > 0.5 ? 0.05 : 0.95),
      y: this.h * 0.25,
      targetX: this.w * 0.5 + 20,
      targetY: this.h * 0.85 - this.h * 0.45 + 10,
      wingPhase: 0,
      glow: 0,
      landed: false,
    };
  }

  public update(dt: number): void {
    this.time += dt;

    // Smooth growth lerp
    if (this.currentGrowth < this.targetGrowth) {
      this.currentGrowth += (this.targetGrowth - this.currentGrowth) * 0.09;
    }

    // Dew drops dynamics
    for (let i = this.dewDrops.length - 1; i >= 0; i--) {
      const drop = this.dewDrops[i];
      if (drop.falling) {
        drop.vy += 0.18;
        drop.y += drop.vy;
        if (drop.y >= this.h * 0.85) {
          this.soilRipples.push({
            x: drop.x,
            y: this.h * 0.85,
            radius: 2,
            alpha: 0.65,
          });
          this.dewDrops.splice(i, 1);
        }
      } else {
        // Occasionally drop releases gently under gravity
        if (Math.random() < 0.012 && this.currentGrowth > 3) {
          drop.falling = true;
        }
      }
    }

    // Soil ripples expansion
    for (let i = this.soilRipples.length - 1; i >= 0; i--) {
      const rip = this.soilRipples[i];
      rip.radius += 0.5;
      rip.alpha -= 0.018;
      if (rip.alpha <= 0) {
        this.soilRipples.splice(i, 1);
      }
    }

    // Pollen drift
    for (let i = this.pollenParticles.length - 1; i >= 0; i--) {
      const p = this.pollenParticles[i];
      p.x += p.vx + Math.sin(this.time * 2.2 + p.y * 0.04) * 0.35;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.pollenParticles.splice(i, 1);
      }
    }

    // Fireflies wander smoothly through dusk
    for (const f of this.fireflies) {
      f.phase += f.speed;
      f.x += f.vx + Math.sin(f.phase) * 0.25;
      f.y += f.vy + Math.cos(f.phase * 0.7) * 0.22;

      if (f.x < -15) f.x = this.w + 15;
      if (f.x > this.w + 15) f.x = -15;
      if (f.y < -15) f.y = this.h + 15;
      if (f.y > this.h + 15) f.y = -15;
    }

    // Nocturnal visitor flight path
    if (this.visitor) {
      this.visitor.wingPhase += 0.45;
      const dx = this.visitor.targetX - this.visitor.x;
      const dy = this.visitor.targetY - this.visitor.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        this.visitor.x += dx * 0.032;
        this.visitor.y += dy * 0.032 + Math.sin(this.time * 6.5) * 0.7;
      } else {
        this.visitor.landed = true;
        this.visitor.glow = Math.min(1.0, this.visitor.glow + 0.025);
      }
    }
  }

  public render(): void {
    this.ctx.clearRect(0, 0, this.w, this.h);
    const progress = this.currentGrowth / this.species.maxSteps;

    // Organic wind sway based on current growth
    const sway = Math.sin(this.time * 1.4) * 4.5 * (0.25 + progress * 0.75);

    // 1. Draw soil base mound & ripples
    this.renderSoil();

    // 2. Draw Fireflies
    this.renderFireflies();

    if (this.currentGrowth <= 0.05) return;

    // 3. Draw botanical plant by species
    if (this.species.id === 'jasmine') {
      this.renderJasmine(progress, sway);
    } else if (this.species.id === 'fern') {
      this.renderFern(progress, sway);
    } else {
      this.renderMoonflower(progress, sway);
    }

    // 4. Draw falling dew drops
    for (const drop of this.dewDrops) {
      this.ctx.beginPath();
      this.ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(235, 248, 255, 0.88)';
      this.ctx.shadowColor = 'rgba(255, 255, 255, 0.65)';
      this.ctx.shadowBlur = 5;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // 5. Draw Pollen
    for (const p of this.pollenParticles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 238, 185, ${p.alpha * p.life})`;
      this.ctx.shadowColor = 'rgba(255, 238, 185, 0.8)';
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // 6. Draw Nocturnal Visitor
    if (this.visitor) {
      this.renderVisitor(this.visitor.x, this.visitor.y, this.visitor.wingPhase, this.visitor.glow);
    }
  }

  private renderSoil(): void {
    const baseX = this.w * 0.5;
    const baseY = this.h * 0.85;

    this.ctx.save();
    // Warm gentle mound
    const gradient = this.ctx.createRadialGradient(baseX, baseY + 6, 6, baseX, baseY + 6, 85);
    gradient.addColorStop(0, '#24201C');
    gradient.addColorStop(0.7, '#181614');
    gradient.addColorStop(1, 'rgba(16, 14, 12, 0)');

    this.ctx.beginPath();
    this.ctx.ellipse(baseX, baseY + 6, 80, 20, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Natural soil flecks
    this.ctx.fillStyle = '#3A322C';
    for (let i = -4; i <= 4; i++) {
      this.ctx.beginPath();
      this.ctx.arc(baseX + i * 16 + Math.sin(i * 1.5) * 5, baseY + 5 + Math.cos(i) * 2.5, 1.8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Water ripples
    for (const rip of this.soilRipples) {
      this.ctx.beginPath();
      this.ctx.ellipse(rip.x, rip.y, rip.radius * 2.4, rip.radius * 0.75, 0, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(180, 215, 230, ${rip.alpha})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private renderFireflies(): void {
    this.ctx.save();
    for (const f of this.fireflies) {
      const glow = (Math.sin(f.phase) + 1) * 0.5;
      if (glow < 0.05) continue;

      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.radius + glow * 2.2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(220, 255, 150, ${glow * 0.75})`;
      this.ctx.shadowColor = 'rgba(215, 255, 130, 0.9)';
      this.ctx.shadowBlur = 10 * glow;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
    this.ctx.restore();
  }

  // Species 1: Celestia Moonflower (Curving stalk, silk white petals, moonlight aura)
  private renderMoonflower(progress: number, sway: number): void {
    const baseX = this.w * 0.5;
    const baseY = this.h * 0.85;
    const maxStemHeight = this.h * 0.45;
    const currentHeight = maxStemHeight * Math.min(1, progress * 1.15);

    const midX = baseX + sway * 0.6 + Math.sin(this.time * 1.2) * 5;
    const midY = baseY - currentHeight * 0.55;
    const tipX = baseX + sway;
    const tipY = baseY - currentHeight;

    // Stem
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(baseX, baseY);
    this.ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    this.ctx.strokeStyle = this.species.stemColor;
    this.ctx.lineWidth = Math.max(3, 7.5 * (1 - progress * 0.35));
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Leaves
    const numLeaves = Math.floor(this.currentGrowth);
    for (let i = 1; i <= numLeaves; i++) {
      const leafProg = i / this.species.maxSteps;
      const leafY = baseY - currentHeight * (leafProg * 0.85);
      const leafX = baseX + sway * leafProg * 0.6;
      const isRight = i % 2 === 0;
      const leafSize = Math.min(34, 12 + i * 2.2);

      this.renderLeaf(leafX, leafY, isRight, leafSize, leafProg);
    }

    // Flower Blossom
    if (this.currentGrowth >= 6.5) {
      const bloomProgress = (this.currentGrowth - 6.5) / 3.5;
      this.renderMoonflowerBloom(tipX, tipY, bloomProgress);
    }

    this.ctx.restore();
  }

  private renderMoonflowerBloom(x: number, y: number, progress: number): void {
    this.ctx.save();
    this.ctx.translate(x, y);

    const numPetals = 8;
    const petalLength = 30 * progress;
    const petalWidth = 14 * progress;

    // Moonlight Glow
    if (progress > 0.5) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 48 * progress, 0, Math.PI * 2);
      this.ctx.fillStyle = this.species.glowColor;
      this.ctx.shadowColor = this.species.petalHighlight;
      this.ctx.shadowBlur = 20;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // Layered petals
    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * Math.PI * 2 + Math.sin(this.time + i) * 0.04;
      this.ctx.save();
      this.ctx.rotate(angle);

      this.ctx.beginPath();
      this.ctx.ellipse(petalLength * 0.6, 0, petalLength * 0.6, petalWidth * 0.5, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = this.species.petalColor;
      this.ctx.shadowColor = 'rgba(255,255,255,0.45)';
      this.ctx.shadowBlur = 5;
      this.ctx.fill();
      this.ctx.restore();
    }

    // Golden Core
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 8.5 * progress, 0, Math.PI * 2);
    this.ctx.fillStyle = this.species.centerColor;
    this.ctx.shadowColor = this.species.centerColor;
    this.ctx.shadowBlur = 8;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.ctx.restore();
  }

  // Species 2: Imperial Night Jasmine (Slender arching dual branches, starry florets)
  private renderJasmine(progress: number, sway: number): void {
    const baseX = this.w * 0.5;
    const baseY = this.h * 0.85;
    const maxStemHeight = this.h * 0.44;
    const currentHeight = maxStemHeight * Math.min(1, progress * 1.12);

    const midX = baseX + sway * 0.5;
    const midY = baseY - currentHeight * 0.5;
    const tipX = baseX + sway * 0.8;
    const tipY = baseY - currentHeight;

    this.ctx.save();

    // Central Stem
    this.ctx.beginPath();
    this.ctx.moveTo(baseX, baseY);
    this.ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    this.ctx.strokeStyle = this.species.stemColor;
    this.ctx.lineWidth = Math.max(2.5, 6 * (1 - progress * 0.3));
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Arching branch left & right
    if (this.currentGrowth > 3) {
      const branchProg = (this.currentGrowth - 3) / 7;
      const branchLen = 50 * branchProg;

      // Left arch
      this.ctx.beginPath();
      this.ctx.moveTo(midX, midY);
      this.ctx.quadraticCurveTo(midX - 25 * branchProg, midY - 20, midX - branchLen, midY - 35 * branchProg);
      this.ctx.stroke();

      // Right arch
      this.ctx.beginPath();
      this.ctx.moveTo(midX + 5, midY - 25);
      this.ctx.quadraticCurveTo(midX + 25 * branchProg, midY - 40, midX + branchLen * 0.9, midY - 55 * branchProg);
      this.ctx.stroke();

      // Small starry jasmine clusters along branches
      if (this.currentGrowth > 5) {
        const floretProg = (this.currentGrowth - 5) / 5;
        this.renderStarFloret(midX - branchLen, midY - 35 * branchProg, floretProg);
        this.renderStarFloret(midX + branchLen * 0.9, midY - 55 * branchProg, floretProg);
      }
    }

    // Terminal flower cluster at tip
    if (this.currentGrowth >= 6.5) {
      const bloomProgress = (this.currentGrowth - 6.5) / 3.5;
      this.renderStarFloret(tipX, tipY, bloomProgress, 1.3);
      this.renderStarFloret(tipX - 14, tipY + 10, bloomProgress * 0.8, 0.9);
      this.renderStarFloret(tipX + 14, tipY + 12, bloomProgress * 0.8, 0.9);
    }

    // Slender jasmine leaflets
    const numLeaves = Math.floor(this.currentGrowth);
    for (let i = 1; i <= numLeaves; i++) {
      const leafProg = i / this.species.maxSteps;
      const leafY = baseY - currentHeight * (leafProg * 0.8);
      const leafX = baseX + sway * leafProg * 0.5;
      const isRight = i % 2 === 0;

      this.renderLeaf(leafX, leafY, isRight, 22, leafProg);
    }

    this.ctx.restore();
  }

  private renderStarFloret(x: number, y: number, progress: number, scale: number = 1.0): void {
    this.ctx.save();
    this.ctx.translate(x, y);

    const size = 12 * progress * scale;
    if (size <= 0.5) {
      this.ctx.restore();
      return;
    }

    // Subtle warm halo
    if (progress > 0.6) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 18 * progress * scale, 0, Math.PI * 2);
      this.ctx.fillStyle = this.species.glowColor;
      this.ctx.fill();
    }

    // 5-pointed delicate jasmine star
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      this.ctx.save();
      this.ctx.rotate(angle);
      this.ctx.beginPath();
      this.ctx.ellipse(size * 0.8, 0, size * 0.8, size * 0.28, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = this.species.petalColor;
      this.ctx.fill();
      this.ctx.restore();
    }

    // Tiny golden pistil
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 3 * progress * scale, 0, Math.PI * 2);
    this.ctx.fillStyle = this.species.centerColor;
    this.ctx.fill();

    this.ctx.restore();
  }

  // Species 3: Ancient Silver Fern (Spiral fiddlehead unfurling, feathered fronds)
  private renderFern(progress: number, sway: number): void {
    const baseX = this.w * 0.5;
    const baseY = this.h * 0.85;
    const maxStemHeight = this.h * 0.46;
    const currentHeight = maxStemHeight * Math.min(1, progress * 1.15);

    this.ctx.save();

    // Spiral curve stem
    const tipX = baseX + sway * 1.2 + Math.sin(progress * Math.PI) * 20;
    const tipY = baseY - currentHeight;
    const cpX = baseX + sway * 0.4 - 15;
    const cpY = baseY - currentHeight * 0.5;

    this.ctx.beginPath();
    this.ctx.moveTo(baseX, baseY);
    this.ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
    this.ctx.strokeStyle = this.species.stemColor;
    this.ctx.lineWidth = Math.max(3, 8 * (1 - progress * 0.35));
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Fronds along the spine
    const numFronds = Math.floor(this.currentGrowth * 1.4);
    for (let i = 1; i <= numFronds; i++) {
      const frondProg = i / (this.species.maxSteps * 1.4);
      const fy = baseY - currentHeight * (frondProg * 0.88);
      const fx = baseX + (tipX - baseX) * frondProg;
      const isRight = i % 2 === 0;
      const fLength = Math.sin(frondProg * Math.PI) * 48;

      this.renderFernFrond(fx, fy, isRight, fLength, frondProg);
    }

    // Coiled fiddlehead at the summit that unrolls
    if (progress < 0.95) {
      const coilProg = 1 - progress;
      this.renderFiddlehead(tipX, tipY, coilProg);
    } else {
      // Full unfurl silver crown
      this.renderFernCrown(tipX, tipY, (progress - 0.85) / 0.15);
    }

    this.ctx.restore();
  }

  private renderFernFrond(x: number, y: number, isRight: boolean, length: number, prog: number): void {
    if (length <= 2) return;
    this.ctx.save();
    this.ctx.translate(x, y);

    const angle = (isRight ? 0.6 : -0.6) + Math.sin(this.time * 1.8 + prog * 3) * 0.08;
    this.ctx.rotate(angle);

    // Frond rib
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.quadraticCurveTo(length * 0.5, -length * 0.15, length, 0);
    this.ctx.strokeStyle = this.species.leafColor;
    this.ctx.lineWidth = 1.8;
    this.ctx.stroke();

    // Delicate silver pinnules
    const numPairs = Math.floor(length / 7);
    for (let j = 1; j <= numPairs; j++) {
      const px = j * 6.5;
      const pSize = (1 - j / numPairs) * 10;
      this.ctx.fillStyle = this.species.petalColor;

      // upper pinna
      this.ctx.beginPath();
      this.ctx.ellipse(px, -pSize * 0.5, pSize * 0.6, pSize * 0.25, -0.4, 0, Math.PI * 2);
      this.ctx.fill();

      // lower pinna
      this.ctx.beginPath();
      this.ctx.ellipse(px, pSize * 0.5, pSize * 0.6, pSize * 0.25, 0.4, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private renderFiddlehead(x: number, y: number, coilAmount: number): void {
    this.ctx.save();
    this.ctx.translate(x, y);

    this.ctx.beginPath();
    let currentR = 12 * coilAmount;
    let currentA = 0;
    for (let i = 0; i < 20; i++) {
      const stepR = currentR * Math.exp(-0.08 * i);
      const stepA = currentA + 0.35;
      const sx = Math.cos(stepA) * stepR;
      const sy = Math.sin(stepA) * stepR;
      if (i === 0) this.ctx.moveTo(sx, sy);
      else this.ctx.lineTo(sx, sy);
      currentA = stepA;
    }
    this.ctx.strokeStyle = this.species.centerColor;
    this.ctx.lineWidth = 3 * coilAmount;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private renderFernCrown(x: number, y: number, progress: number): void {
    this.ctx.save();
    this.ctx.translate(x, y);

    const glow = this.species.glowColor;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 36 * progress, 0, Math.PI * 2);
    this.ctx.fillStyle = glow;
    this.ctx.shadowColor = this.species.petalHighlight;
    this.ctx.shadowBlur = 15;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.ctx.restore();
  }

  private renderLeaf(x: number, y: number, isRight: boolean, size: number, prog: number): void {
    this.ctx.save();
    this.ctx.translate(x, y);
    const angle = isRight ? 0.48 : -0.48;
    const sway = Math.sin(this.time * 2.1 + prog * 4) * 0.08;
    this.ctx.rotate(angle + sway);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.quadraticCurveTo(size * 0.7, -size * 0.5, size * 1.35, 0);
    this.ctx.quadraticCurveTo(size * 0.7, size * 0.5, 0, 0);

    const grad = this.ctx.createLinearGradient(0, 0, size * 1.35, 0);
    grad.addColorStop(0, this.species.stemColor);
    grad.addColorStop(1, this.species.leafColor);

    this.ctx.fillStyle = grad;
    this.ctx.fill();

    // Leaf center vein
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(size * 1.15, 0);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private renderVisitor(x: number, y: number, wingPhase: number, glow: number): void {
    this.ctx.save();
    this.ctx.translate(x, y);

    // Soft luminous moth/bee glow
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 235, 175, ${0.16 + glow * 0.22})`;
    this.ctx.fill();

    // Translucent wings with high-frequency flutter
    const wingFlap = Math.sin(wingPhase) * 0.75;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    this.ctx.beginPath();
    this.ctx.ellipse(-4.5, -6 * wingFlap, 9.5, 5.5 * Math.abs(wingFlap) + 2, -0.4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(4.5, -6 * wingFlap, 9.5, 5.5 * Math.abs(wingFlap) + 2, 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.ctx.fillStyle = '#3E3129';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 3.2, 6.5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Warm golden stripes
    this.ctx.fillStyle = '#F4A261';
    this.ctx.fillRect(-2, -1, 4, 1.4);
    this.ctx.fillRect(-2, 2, 4, 1.4);

    this.ctx.restore();
  }
}
