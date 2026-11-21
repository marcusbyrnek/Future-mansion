// Canvas-generated textures for the Modern Hillside Palace.
// Everything is procedural — no external assets required.
import * as THREE from 'three';

export function makeCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function grassTexture() {
  const tex = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#2c3a1e';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const g = 40 + Math.random() * 60;
      ctx.fillStyle = `rgb(${g * 0.75 | 0},${g | 0},${g * 0.38 | 0})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2 + Math.random() * 3);
    }
    // mowing stripes
    ctx.globalAlpha = 0.08;
    for (let x = 0; x < w; x += 64) {
      ctx.fillStyle = '#4a5c2c';
      ctx.fillRect(x, 0, 32, h);
    }
    ctx.globalAlpha = 1;
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return tex;
}

export function roofGrassTexture() {
  const tex = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#33431f';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 7000; i++) {
      const g = 55 + Math.random() * 70;
      ctx.fillStyle = `rgb(${g * 0.8 | 0},${g | 0},${g * 0.4 | 0})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2 + Math.random() * 4);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

export function cliffTexture() {
  const tex = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#4c423b';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 6) {
      const shade = 52 + Math.sin(y * 0.11) * 18 + Math.random() * 22;
      ctx.fillStyle = `rgb(${shade + 14},${shade},${shade - 12})`;
      ctx.fillRect(0, y, w, 5);
    }
    for (let i = 0; i < 2500; i++) {
      const s = 30 + Math.random() * 60;
      ctx.fillStyle = `rgba(${s + 20},${s},${s - 14},0.6)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 6, 2);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 2);
  return tex;
}

export function barkTexture() {
  const tex = makeCanvas(256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#5a4a38';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 14) {
      ctx.fillStyle = `rgba(30,22,14,${0.5 + Math.random() * 0.4})`;
      ctx.fillRect(0, y, w, 5 + Math.random() * 4);
      ctx.fillStyle = 'rgba(140,120,90,0.35)';
      ctx.fillRect(0, y + 8, w, 3);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function asphaltTexture() {
  const tex = makeCanvas(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#1c1d20';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      const s = 22 + Math.random() * 40;
      ctx.fillStyle = `rgb(${s},${s},${s + 4})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 2);
  return tex;
}

export function travertineTexture() {
  const tex = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#cfc4b0';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      ctx.strokeStyle = `rgba(120,110,92,${0.12 + Math.random() * 0.2})`;
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 18, w * 0.7, y + (Math.random() - 0.5) * 18, w, y);
      ctx.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Warm emissive "interior seen through glass" texture: cove gradient,
// pendant lights and dark furniture silhouettes.
export function interiorTexture() {
  const tex = makeCanvas(2048, 512, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.0, '#59331a');
    grad.addColorStop(0.28, '#8a5426');
    grad.addColorStop(0.52, '#d99a52');
    grad.addColorStop(0.78, '#a2632c');
    grad.addColorStop(1.0, '#40220f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // soft vertical light pools
    for (let i = 0; i < 9; i++) {
      const x = (i + 0.5) * (w / 9) + (Math.random() - 0.5) * 60;
      const rg = ctx.createRadialGradient(x, h * 0.42, 10, x, h * 0.42, 190);
      rg.addColorStop(0, 'rgba(255,224,160,0.85)');
      rg.addColorStop(1, 'rgba(255,224,160,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
    }
    // pendant lights
    ctx.fillStyle = '#ffe9b0';
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * w;
      ctx.fillRect(x, 60, 2, 70 + Math.random() * 60);
      ctx.beginPath();
      ctx.arc(x + 1, 130 + Math.random() * 60, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    // furniture silhouettes
    ctx.fillStyle = 'rgba(28,14,6,0.88)';
    const sofa = (x, y, sw) => { ctx.beginPath(); ctx.roundRect(x, y, sw, 60, 18); ctx.fill(); ctx.fillRect(x + 8, y + 60, 12, 30); ctx.fillRect(x + sw - 20, y + 60, 12, 30); };
    sofa(w * 0.06, h * 0.66, 340);
    sofa(w * 0.34, h * 0.7, 300);
    sofa(w * 0.62, h * 0.66, 330);
    // piano silhouette
    ctx.beginPath(); ctx.moveTo(w * 0.82, h * 0.78); ctx.quadraticCurveTo(w * 0.88, h * 0.45, w * 0.97, h * 0.78); ctx.closePath(); ctx.fill();
    // figures of people, sparse
    for (let i = 0; i < 4; i++) {
      const x = Math.random() * w;
      ctx.beginPath(); ctx.arc(x, h * 0.6, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - 8, h * 0.6 + 8, 16, 46);
    }
    // black marble accent columns
    ctx.fillStyle = 'rgba(12,10,10,0.9)';
    for (let i = 0; i < 6; i++) ctx.fillRect(Math.random() * w, 0, 26, h);
    // floor line glow
    ctx.fillStyle = 'rgba(255,205,130,0.55)';
    ctx.fillRect(0, h * 0.86, w, 6);
  });
  return tex;
}

// Small radial glow used by sprite lights (lanterns, fire pit, pool, horizon ember).
export function glowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const tex = makeCanvas(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.35, inner.replace('1)', '0.55)'));
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
  return tex;
}

export function bottleShelfTexture() {
  const tex = makeCanvas(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = '#241206';
    ctx.fillRect(0, 0, w, h);
    for (let shelf = 0; shelf < 3; shelf++) {
      const y = 30 + shelf * 78;
      ctx.fillStyle = 'rgba(255,190,110,0.28)';
      ctx.fillRect(0, y + 44, w, 6);
      for (let x = 12; x < w - 12; x += 26 + Math.random() * 14) {
        const bh = 30 + Math.random() * 14;
        const hue = Math.random();
        ctx.fillStyle = hue < 0.33 ? '#7a4a12' : hue < 0.66 ? '#3d2a10' : '#59331a';
        ctx.fillRect(x, y + 44 - bh, 12, bh);
        ctx.fillStyle = 'rgba(255,225,150,0.5)';
        ctx.fillRect(x + 2, y + 44 - bh + 4, 3, bh * 0.5);
      }
    }
  });
  return tex;
}
