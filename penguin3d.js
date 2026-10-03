/**
 * PENGUIN 3D INTERACTIVE MASCOT ENGINE
 * A high-performance, procedural 3D Canvas mascot with real-time lighting,
 * physics-based animations, accessories, and grooming routines.
 */

class Penguin3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Responsive sizing
    this.width = this.canvas.parentElement.clientWidth || 400;
    this.height = this.canvas.parentElement.clientHeight || 380;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Orientation & Physics
    this.rotY = 0;
    this.targetRotY = 0;
    this.rotX = 0;
    this.targetRotX = 0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Penguin Animation State
    this.mode = 'idle'; // 'idle', 'shampoo', 'skin', 'nail', 'teeth', 'dance'
    this.time = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.flipperL = 0;
    this.flipperR = 0;
    this.flipperYOffset = 0;
    this.headBob = 0;

    // Particle system (soap bubbles, sparkles, foam)
    this.particles = [];

    // Audio SFX synthesizer (Web Audio API)
    this.audioEnabled = true;
    this.initAudio();

    // Event listeners
    this.initEvents();

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  playBubbleSound() {
    if (!this.audioEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'sine';
    const startFreq = 400 + Math.random() * 300;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playChimeSound() {
    if (!this.audioEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    });
  }

  initEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      if (!this.canvas || !this.canvas.parentElement) return;
      this.width = this.canvas.parentElement.clientWidth;
      this.height = this.canvas.parentElement.clientHeight;
      this.canvas.width = this.width * window.devicePixelRatio;
      this.canvas.height = this.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    });

    // Mouse Tracking for 3D tilt
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDragging) {
        const deltaX = mouseX - this.lastMouseX;
        const deltaY = mouseY - this.lastMouseY;
        this.targetRotY += deltaX * 0.015;
        this.targetRotX = Math.max(-0.4, Math.min(0.4, this.targetRotX + deltaY * 0.015));
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
      } else {
        // Subtle tilt tracking cursor
        this.targetRotY = ((mouseX / this.width) - 0.5) * 0.6;
        this.targetRotX = ((mouseY / this.height) - 0.5) * 0.3;
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      const rect = this.canvas.getBoundingClientRect();
      this.lastMouseX = e.clientX - rect.left;
      this.lastMouseY = e.clientY - rect.top;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Click to react
    this.canvas.addEventListener('click', () => {
      this.triggerReaction();
    });
  }

  triggerReaction() {
    this.playChimeSound();
    this.headBob = -25;
    // Spawn 10 sparkles
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 120,
        y: this.height / 2 + (Math.random() - 0.5) * 120,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 2,
        size: Math.random() * 8 + 4,
        life: 1.0,
        type: 'sparkle'
      });
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.particles = [];

    if (mode === 'shampoo') {
      this.playBubbleSound();
    } else if (mode === 'teeth' || mode === 'skin' || mode === 'nail') {
      this.playChimeSound();
    }
  }

  spawnParticles() {
    if (this.mode === 'shampoo' && Math.random() < 0.28) {
      this.playBubbleSound();
      this.particles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 140,
        y: this.height / 2 - 30 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 1,
        size: Math.random() * 12 + 6,
        life: 1.0,
        type: 'bubble'
      });
    } else if (this.mode === 'skin' && Math.random() < 0.2) {
      this.particles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 100,
        y: this.height / 2 - 40 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 1,
        vy: -Math.random() * 1.5 - 0.5,
        size: Math.random() * 6 + 3,
        life: 1.0,
        type: 'glow'
      });
    } else if (this.mode === 'nail' && Math.random() < 0.18) {
      this.particles.push({
        x: this.width / 2 + 75 + (Math.random() - 0.5) * 30,
        y: this.height / 2 + 40 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 1,
        size: Math.random() * 8 + 4,
        life: 1.0,
        type: 'sparkle'
      });
    } else if (this.mode === 'teeth' && Math.random() < 0.22) {
      this.particles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 40,
        y: this.height / 2 - 40 + (Math.random() - 0.5) * 25,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 1,
        size: Math.random() * 7 + 4,
        life: 1.0,
        type: 'foam'
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.015;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === 'bubble') {
        // Translucent iridescent bubble
        const grad = ctx.createRadialGradient(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.1, p.x, p.y, p.size);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.6, 'rgba(147, 222, 255, 0.4)');
        grad.addColorStop(1, 'rgba(0, 180, 255, 0.7)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.35, p.y - p.size * 0.35, p.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle' || p.type === 'glow') {
        // 4-point star sparkle
        ctx.fillStyle = p.type === 'glow' ? '#38bdf8' : '#38bdf8';
        ctx.shadowColor = '#00d2ff';
        ctx.shadowBlur = 10;
        this.drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.3);
      } else if (p.type === 'foam') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  renderPenguin(ctx) {
    const cx = this.width / 2;
    const cy = this.height / 2 + 15 + this.headBob;

    ctx.save();
    ctx.translate(cx, cy);

    // Apply 3D perspective rotation
    ctx.scale(1 + this.rotX * 0.15, 1);
    const skewX = this.rotY * 0.18;
    ctx.transform(1, 0, skewX, 1, 0, 0);

    // 1. Soft Ambient Floor Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 115, 80 + Math.abs(this.rotY) * 10, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(14, 116, 178, 0.22)';
    ctx.filter = 'blur(6px)';
    ctx.fill();
    ctx.restore();

    // 2. Penguin Feet
    const footWiggle = Math.sin(this.time * 4) * 3;
    this.drawFoot(ctx, -38, 108 + (this.mode === 'dance' ? footWiggle : 0), -0.15);
    this.drawFoot(ctx, 38, 108 + (this.mode === 'dance' ? -footWiggle : 0), 0.15);

    // 3. Penguin Body (Back Navy Plump Shell)
    ctx.save();
    const bodyGrad = ctx.createRadialGradient(-20 + this.rotY * 20, -10, 20, 0, 20, 120);
    bodyGrad.addColorStop(0, '#334155');
    bodyGrad.addColorStop(0.5, '#1e293b');
    bodyGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    // Round penguin egg body
    ctx.ellipse(0, 20, 78, 92, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body 3D Light Rim
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.45)';
    ctx.stroke();
    ctx.restore();

    // 4. White Belly (Anime curved stomach)
    ctx.save();
    const bellyShift = this.rotY * 18;
    const bellyGrad = ctx.createRadialGradient(bellyShift - 10, 25, 15, bellyShift, 35, 75);
    bellyGrad.addColorStop(0, '#ffffff');
    bellyGrad.addColorStop(0.7, '#f1f5f9');
    bellyGrad.addColorStop(1, '#cbd5e1');

    ctx.fillStyle = bellyGrad;
    ctx.beginPath();
    ctx.ellipse(bellyShift, 32, 54, 68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Cute Bathrobe / Towel Trim
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(14, 165, 233, 0.2)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(this.rotY * 15, 92, 45, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Flippers (Left & Right Arms)
    this.drawFlippers(ctx);

    // 7. Head & Face (Eyes, Beak, Blush, Accessories)
    this.drawHead(ctx);

    // 8. Specific Mode Accessories (Shower cap, toothbrush, etc.)
    this.drawAccessories(ctx);

    ctx.restore();
  }

  drawFoot(ctx, x, y, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Vibrant golden orange foot
    const footGrad = ctx.createRadialGradient(-3, -2, 4, 0, 0, 18);
    footGrad.addColorStop(0, '#fbbf24');
    footGrad.addColorStop(0.8, '#f59e0b');
    footGrad.addColorStop(1, '#d97706');

    ctx.fillStyle = footGrad;
    ctx.beginPath();
    // 3 rounded toes
    ctx.ellipse(0, 0, 18, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Toe notches
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-6, 6);
    ctx.moveTo(6, -4);
    ctx.lineTo(6, 6);
    ctx.stroke();

    ctx.restore();
  }

  drawFlippers(ctx) {
    const time = this.time;

    // LEFT FLIPPER
    ctx.save();
    ctx.translate(-72, 10);
    let leftRot = 0.2 + Math.sin(time * 2.5) * 0.1;
    if (this.mode === 'shampoo') {
      // Reaching up to head
      leftRot = -1.4 + Math.sin(time * 6) * 0.18;
    } else if (this.mode === 'skin') {
      leftRot = -0.9 + Math.sin(time * 4) * 0.12;
    } else if (this.mode === 'teeth') {
      leftRot = 0.3;
    }
    ctx.rotate(leftRot);

    this.drawFlipperShape(ctx, -1);
    ctx.restore();

    // RIGHT FLIPPER
    ctx.save();
    ctx.translate(72, 10);
    let rightRot = -0.2 - Math.sin(time * 2.5) * 0.1;
    if (this.mode === 'shampoo') {
      // Reaching up to head
      rightRot = 1.4 - Math.sin(time * 6) * 0.18;
    } else if (this.mode === 'skin') {
      rightRot = 0.9 - Math.sin(time * 4) * 0.12;
    } else if (this.mode === 'nail') {
      rightRot = -0.7 + Math.sin(time * 7) * 0.2;
    } else if (this.mode === 'teeth') {
      rightRot = 1.2 + Math.sin(time * 8) * 0.15; // Toothbrush motion!
    }
    ctx.rotate(rightRot);

    this.drawFlipperShape(ctx, 1);

    // If teeth mode: draw electric toothbrush in right flipper
    if (this.mode === 'teeth') {
      this.drawToothbrush(ctx);
    }
    // If nail mode: draw glass nail file in right flipper
    if (this.mode === 'nail') {
      this.drawNailFile(ctx);
    }

    ctx.restore();
  }

  drawFlipperShape(ctx, dir) {
    const fGrad = ctx.createLinearGradient(0, 0, 0, 60);
    fGrad.addColorStop(0, '#1e293b');
    fGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = fGrad;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(dir * 18, 25, dir * 16, 50, 0, 65);
    ctx.bezierCurveTo(-dir * 8, 45, -dir * 10, 20, 0, 0);
    ctx.fill();

    // Highlight
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawHead(ctx) {
    const headShift = this.rotY * 20;

    ctx.save();
    ctx.translate(headShift, -48);

    // Head base (round top)
    const headGrad = ctx.createRadialGradient(-15, -15, 10, 0, 0, 58);
    headGrad.addColorStop(0, '#334155');
    headGrad.addColorStop(0.6, '#1e293b');
    headGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 55, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    // White eye-patches / anime face mask
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-20, -2, 17, 22, -0.1, 0, Math.PI * 2);
    ctx.ellipse(20, -2, 17, 22, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Anime Eyes (with blink animation)
    if (!this.isBlinking) {
      this.drawAnimeEye(ctx, -20, -2, -1);
      this.drawAnimeEye(ctx, 20, -2, 1);
    } else {
      // Cute closed curved blink line (^_^)
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#0f172a';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-20, 2, 9, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(20, 2, 9, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }

    // Kawaii Pink Cheek Blushes
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-32, 14, 10, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(32, 14, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute Orange Beak
    const beakGrad = ctx.createLinearGradient(0, -6, 0, 14);
    beakGrad.addColorStop(0, '#fde047');
    beakGrad.addColorStop(0.7, '#f59e0b');
    beakGrad.addColorStop(1, '#d97706');

    ctx.fillStyle = beakGrad;
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.quadraticCurveTo(0, -6, 16, 2);
    ctx.quadraticCurveTo(0, 18, -16, 2);
    ctx.fill();

    // Smile / Beak line
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14, 3);
    ctx.quadraticCurveTo(0, 8, 14, 3);
    ctx.stroke();

    ctx.restore();
  }

  drawAnimeEye(ctx, x, y, dir) {
    ctx.save();
    ctx.translate(x, y);

    // Eye tracking offset
    const lookX = this.rotY * 4;
    const lookY = this.rotX * 4;

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(lookX, lookY, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vibrant deep blue iris reflection
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(lookX, lookY + 3, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Large anime highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lookX - 3, lookY - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Secondary tiny highlight
    ctx.beginPath();
    ctx.arc(lookX + 3, lookY + 3, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawAccessories(ctx) {
    const headShift = this.rotY * 20;

    // SHAMPOO ACCESSORY: Shower Cap & Floating Foam Crown
    if (this.mode === 'shampoo') {
      ctx.save();
      ctx.translate(headShift, -82);

      // Polka-dot shower cap
      const capGrad = ctx.createLinearGradient(0, -25, 0, 20);
      capGrad.addColorStop(0, '#38bdf8');
      capGrad.addColorStop(1, '#0284c7');

      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 56, 32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Elastic ruffle hem
      ctx.fillStyle = '#bae6fd';
      for (let i = -52; i <= 52; i += 12) {
        ctx.beginPath();
        ctx.arc(i, 20, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Polka dots
      ctx.fillStyle = '#ffffff';
      [[-25, -8], [-5, -15], [20, -8], [-10, 4], [15, 6], [-35, 6], [35, 4]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Lather Foam Cloud on Cap
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 10;
      [[25, -20, 14], [40, -15, 11], [15, -28, 12], [32, -30, 10]].forEach(([fx, fy, fr]) => {
        ctx.beginPath();
        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // SKINCARE ACCESSORY: Cucumber Slices or Glow Hydration Aura
    if (this.mode === 'skin') {
      ctx.save();
      ctx.translate(headShift, -48);

      // Glowing hydration halo
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 62, 0, Math.PI * 2);
      ctx.stroke();

      // Cute Moisturizer dollop on cheek
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-22, 12, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(22, 12, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  drawToothbrush(ctx) {
    ctx.save();
    ctx.translate(0, 45);
    ctx.rotate(-1.1);

    // Sleek cyan electric toothbrush handle
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-4, 0, 8, 45, 4);
    } else {
      ctx.rect(-4, 0, 8, 45);
    }
    ctx.fill();

    // White brush neck
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2.5, -18, 5, 18);

    // Bristles with foam
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-6, -26, 8, 8);

    // Foam puff
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, -28, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawNailFile(ctx) {
    ctx.save();
    ctx.translate(0, 45);
    ctx.rotate(-0.8);

    // Crystal glass nail file (gradient cyan/ice blue)
    const fileGrad = ctx.createLinearGradient(0, -30, 0, 30);
    fileGrad.addColorStop(0, '#e0f2fe');
    fileGrad.addColorStop(0.5, '#7dd3fc');
    fileGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = fileGrad;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-3, -25, 6, 50, 3);
    } else {
      ctx.rect(-3, -25, 6, 50);
    }
    ctx.fill();

    // Sparkle edge
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  animate() {
    this.time += 0.03;

    // Smooth rotation easing
    this.rotY += (this.targetRotY - this.rotY) * 0.1;
    this.rotX += (this.targetRotX - this.rotX) * 0.1;

    // Head bobbing physics
    this.headBob += (0 - this.headBob) * 0.08;

    // Blink timer
    this.blinkTimer++;
    if (this.blinkTimer > 130 + Math.random() * 80) {
      this.isBlinking = true;
      if (this.blinkTimer > 142 + Math.random() * 80) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    // Update Particles
    this.spawnParticles();
    this.updateParticles();

    // Clear Canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Particles behind (some depth)
    this.drawParticles(this.ctx);

    // Draw Penguin 3D
    this.renderPenguin(this.ctx);

    requestAnimationFrame(this.animate);
  }
}

// Global instance helper
window.Penguin3D = Penguin3D;
