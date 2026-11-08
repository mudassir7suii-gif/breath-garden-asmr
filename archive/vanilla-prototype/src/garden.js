// Persistent Garden Sanctuary and Fireflies Simulation

class GardenStorage {
  static KEY = 'asmr_breath_garden_collection';

  static getPlants() {
    try {
      const data = localStorage.getItem(GardenStorage.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static addPlant(plantTypeKey) {
    const plants = GardenStorage.getPlants();
    plants.push({
      id: Date.now(),
      type: plantTypeKey,
      date: new Date().toISOString()
    });
    try {
      localStorage.setItem(GardenStorage.KEY, JSON.stringify(plants));
    } catch (e) {}
    return plants;
  }
}

class FireflySystem {
  constructor(count = 20) {
    this.fireflies = [];
    this.count = count;
  }

  init(width, height) {
    this.fireflies = [];
    for (let i = 0; i < this.count; i++) {
      this.fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.75 + height * 0.15,
        radius: 1.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3
      });
    }
  }

  update(width, height) {
    this.fireflies.forEach(f => {
      f.phase += f.speed;
      f.x += f.vx + Math.sin(f.phase) * 0.2;
      f.y += f.vy + Math.cos(f.phase * 0.7) * 0.2;

      // Wrap edges
      if (f.x < -10) f.x = width + 10;
      if (f.x > width + 10) f.x = -10;
      if (f.y < -10) f.y = height + 10;
      if (f.y > height + 10) f.y = -10;
    });
  }

  render(ctx) {
    ctx.save();
    this.fireflies.forEach(f => {
      const glow = (Math.sin(f.phase) + 1) * 0.5; // 0..1 pulse
      if (glow < 0.05) return;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius + glow * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 255, 140, ${glow * 0.75})`;
      ctx.shadowColor = 'rgba(210, 255, 120, 0.9)';
      ctx.shadowBlur = 10 * glow;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.restore();
  }
}

window.GardenStorage = GardenStorage;
window.FireflySystem = FireflySystem;
