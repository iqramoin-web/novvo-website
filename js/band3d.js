// Procedural 3D strap: loop geometry, material textures, tracker pods, clasp,
// charms and live laser engraving. Everything is generated in code, no model files.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { fontFor, isArabic } from './data.js';

const EXP = 2.3;                             // loop superellipse exponent
const U_SEG = 260;
const TEX_W = 2048, TEX_H = 512;
const ENGRAVE_U = 0.75;                      // bottom of the loop
const CLASP_U = 0.6;
const PRINT_U = 0.5;                         // left side of the loop
const CHARM_U = [0.06, 0.94, 0.14, 0.86];

// Proportions measured from each device's official product photo
// (loop radii rx/ry, strap width w, thickness t, edge radius r).
export const DEVICE_SPEC = {
  whoop:  { rx: 0.9,  ry: 0.95, w: 0.7,  t: 0.08,  r: 0.032 },
  garmin: { rx: 0.8,  ry: 0.74, w: 1.1,  t: 0.09,  r: 0.04 },
  fitbit: { rx: 0.86, ry: 0.92, w: 0.44, t: 0.07,  r: 0.028 },
};
const specOf = (dev) => DEVICE_SPEC[dev] || DEVICE_SPEC.whoop;

const METALS = { gold: '#d6b06a', silver: '#cfd3d7', rose: '#d79e88', black: '#2a2b2e' };

// ---------- geometry ----------
function loopPoint(t, s) {
  const c = Math.cos(t), si = Math.sin(t);
  return new THREE.Vector2(
    s.rx * Math.sign(c) * Math.pow(Math.abs(c), 2 / EXP),
    s.ry * Math.sign(si) * Math.pow(Math.abs(si), 2 / EXP),
  );
}

// Resample the loop by arc length so vertices and the u texture coord are uniform.
function buildLoop(s) {
  const N = 3000, pts = [];
  for (let i = 0; i < N; i++) pts.push(loopPoint((i / N) * Math.PI * 2, s));
  const cum = [0];
  for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + pts[i % N].distanceTo(pts[i - 1]));
  const len = cum[N];
  const p = [];
  let k = 0;
  for (let i = 0; i <= U_SEG; i++) {
    const d = (i / U_SEG) * len;
    while (k < N - 1 && cum[k + 1] < d) k++;
    const a = pts[k], b = pts[(k + 1) % N];
    const f = (d - cum[k]) / (cum[k + 1] - cum[k] || 1);
    p.push(a.clone().lerp(b, Math.min(1, Math.max(0, f))));
  }
  const n = p.map((_, i) => {
    const prev = p[i === 0 ? U_SEG - 1 : i - 1];
    const next = p[i === U_SEG ? 1 : i + 1];
    const tg = next.clone().sub(prev);
    return new THREE.Vector2(tg.y, -tg.x).normalize();
  });
  return { p, n, len };
}

// Rounded-rectangle cross-section in (n = radial, z = across) with arc-length v.
function buildProfile(s) {
  const W = s.w, T = s.t, r = s.r;
  const hw = W / 2, ht = T / 2, P = [];
  const push = (n, z, nn, nz) => P.push({ n, z, nn, nz });
  const line = (n0, z0, n1, z1, nn, nz, seg) => {
    for (let i = 0; i < seg; i++) push(n0 + (n1 - n0) * (i / seg), z0 + (z1 - z0) * (i / seg), nn, nz);
  };
  const arc = (cn, cz, a0, seg = 6) => {
    for (let i = 0; i < seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      push(cn + r * Math.cos(a), cz + r * Math.sin(a), Math.cos(a), Math.sin(a));
    }
  };
  line(ht, -hw + r, ht, hw - r, 1, 0, 24);          // outer face
  arc(ht - r, hw - r, 0);
  line(ht - r, hw, -ht + r, hw, 0, 1, 2);            // side +z
  arc(-ht + r, hw - r, Math.PI / 2);
  line(-ht, hw - r, -ht, -hw + r, -1, 0, 24);        // inner face
  arc(-ht + r, -hw + r, Math.PI);
  line(-ht + r, -hw, ht - r, -hw, 0, -1, 2);         // side -z
  arc(ht - r, -hw + r, Math.PI * 1.5);
  P.push({ ...P[0] });
  let acc = 0;
  P[0].v = 0;
  for (let i = 1; i < P.length; i++) {
    acc += Math.hypot(P[i].n - P[i - 1].n, P[i].z - P[i - 1].z);
    P[i].v = acc;
  }
  P.forEach((q) => (q.v /= acc));
  return { P, len: acc, faceV1: (W - 2 * r) / acc, innerV0: ((W - 2 * r) + Math.PI * r + (T - 2 * r)) / acc };
}

// Loop, profile and mesh geometry per device, built once.
const shapeCache = {};
function shapeFor(dev) {
  if (shapeCache[dev]) return shapeCache[dev];
  const s = specOf(dev), LOOP = buildLoop(s), PROFILE = buildProfile(s);
  const { P } = PROFILE, cols = P.length, rows = U_SEG + 1;
  const pos = new Float32Array(rows * cols * 3), nor = new Float32Array(rows * cols * 3), uv = new Float32Array(rows * cols * 2);
  for (let i = 0; i < rows; i++) {
    const p = LOOP.p[i], n = LOOP.n[i];
    for (let j = 0; j < cols; j++) {
      const q = P[j], k = i * cols + j;
      pos.set([p.x + n.x * q.n, p.y + n.y * q.n, q.z], k * 3);
      nor.set([n.x * q.nn, n.y * q.nn, q.nz], k * 3);
      uv.set([i / U_SEG, q.v], k * 2);
    }
  }
  const idx = [];
  for (let i = 0; i < U_SEG; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j, b = (i + 1) * cols + j, c = b + 1, d = a + 1;
      idx.push(a, d, b, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(idx);
  // Point + outward normal on the strap surface at loop coordinate u (side: 1 outer, -1 inner).
  const surfaceAt = (u, lift = 0, side = 1) => {
    const i = Math.round(u * U_SEG) % U_SEG;
    const p = LOOP.p[i], n = LOOP.n[i], d = side * (s.t / 2 + lift);
    return { pos: new THREE.Vector3(p.x + n.x * d, p.y + n.y * d, 0), n: new THREE.Vector3(n.x, n.y, 0) };
  };
  return (shapeCache[dev] = { spec: s, LOOP, PROFILE, geometry, surfaceAt });
}

// ---------- textures ----------
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Greyscale surface patterns (tinted by the material colour), one per material and device.
const patternCache = {};
function patternCanvas(type, dev) {
  const key = `${type}:${dev}`;
  if (patternCache[key]) return patternCache[key];
  const { PROFILE } = shapeFor(dev);
  const c = document.createElement('canvas');
  c.width = TEX_W; c.height = TEX_H;
  const g = c.getContext('2d');
  const rand = rng(11);
  const faceY1 = PROFILE.faceV1 * TEX_H, innerY0 = PROFILE.innerV0 * TEX_H;
  const gray = (v) => `rgb(${v | 0},${v | 0},${v | 0})`;
  const noise = (n, lo, hi, s = 2) => { for (let i = 0; i < n; i++) { g.fillStyle = gray(lo + rand() * (hi - lo)); g.fillRect(rand() * TEX_W, rand() * TEX_H, s, s); } };

  if (type === 'silicone') {
    g.fillStyle = gray(236); g.fillRect(0, 0, TEX_W, TEX_H);
    noise(9000, 226, 246);
    g.fillStyle = gray(214);
    for (let x = 0; x < TEX_W; x += 16) g.fillRect(x, innerY0 + 10, 6, (TEX_H - innerY0) - 30);
  } else if (type === 'nylon' && dev === 'garmin') {
    // Cirqa: heathered melange knit — short fibres of mixed tone, no ribs
    g.fillStyle = gray(222); g.fillRect(0, 0, TEX_W, TEX_H);
    for (let i = 0; i < 70000; i++) {
      const v = rand() < 0.5 ? 192 + rand() * 26 : 228 + rand() * 27;
      g.fillStyle = gray(v);
      g.fillRect(rand() * TEX_W, rand() * TEX_H, 4 + rand() * 14, 2);
    }
    // finished edge rows along both long edges of the outer face
    g.fillStyle = gray(150);
    [[0, 10], [faceY1 - 10, 10]].forEach(([y, h]) => g.fillRect(0, y, TEX_W, h));
    // the hook-and-loop tail that wraps over the lower edge of the cuff
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(0, 10, TEX_W, faceY1 * 0.16);
    g.fillStyle = gray(120);
    g.fillRect(0, 10 + faceY1 * 0.16, TEX_W, 4);
  } else if (type === 'nylon' && dev === 'fitbit') {
    // Air: fine chevron knit
    g.fillStyle = gray(205); g.fillRect(0, 0, TEX_W, TEX_H);
    const s = 7;
    for (let y = 0; y < TEX_H; y += s) {
      for (let x = 0; x < TEX_W; x += s) {
        const chev = ((x / s + Math.abs(((y / s) % 6) - 3)) % 3) < 1.5;
        g.fillStyle = gray((chev ? 236 : 186) + (rand() - 0.5) * 16);
        g.fillRect(x, y, s - 1, s - 1);
      }
    }
  } else if (type === 'nylon') {
    // WHOOP SuperKnit: fine knit with bold diagonal ribs across the band
    g.fillStyle = gray(196); g.fillRect(0, 0, TEX_W, TEX_H);
    noise(60000, 170, 235, 3);
    g.save();
    g.beginPath(); g.rect(0, 0, TEX_W, TEX_H); g.clip();
    const pitch = 30, slant = faceY1 * 0.75;
    for (let x = -slant; x < TEX_W + slant; x += pitch) {
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 12, 0); g.lineTo(x + 12 + slant, TEX_H); g.lineTo(x + slant, TEX_H); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.beginPath(); g.moveTo(x + 14, 0); g.lineTo(x + 20, 0); g.lineTo(x + 20 + slant, TEX_H); g.lineTo(x + 14 + slant, TEX_H); g.fill();
    }
    g.restore();
  } else if (type === 'leather') {
    g.fillStyle = gray(236); g.fillRect(0, 0, TEX_W, TEX_H);
    for (let i = 0; i < 60000; i++) {
      g.fillStyle = gray(212 + rand() * 43);
      g.beginPath(); g.ellipse(rand() * TEX_W, rand() * TEX_H, 1 + rand() * 2.5, 1 + rand() * 2, rand() * 3, 0, 7); g.fill();
    }
    g.strokeStyle = gray(255); g.lineWidth = 5; g.setLineDash([18, 11]); g.lineCap = 'round';
    [12, faceY1 - 12].forEach((y) => { g.beginPath(); g.moveTo(0, y); g.lineTo(TEX_W, y); g.stroke(); });
    g.setLineDash([]);
  } else if (type === 'sportflex') {
    g.fillStyle = gray(232); g.fillRect(0, 0, TEX_W, TEX_H);
    noise(6000, 220, 245);
    g.fillStyle = gray(40);
    const rows = 3, pad = faceY1 * 0.2;
    for (let rI = 0; rI < rows; rI++) {
      const y = pad + (rI * (faceY1 - 2 * pad)) / (rows - 1);
      for (let x = (rI % 2) * 22; x < TEX_W; x += 44) {
        // keep the engraving zone clean
        if (Math.abs(x - ENGRAVE_U * TEX_W) < 230) continue;
        g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill();
      }
    }
  }
  return (patternCache[key] = c);
}

const MATERIAL_PROPS = {
  silicone:  { roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.35, sheen: 0, bumpScale: 0.6 },
  nylon:     { roughness: 0.96, clearcoat: 0, clearcoatRoughness: 1, sheen: 0.22, sheenRoughness: 0.85, bumpScale: 1.6 },
  leather:   { roughness: 0.72, clearcoat: 0.08, clearcoatRoughness: 0.6, sheen: 0, bumpScale: 1.2 },
  sportflex: { roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4, sheen: 0, bumpScale: 1.5 },
};

// ---------- charms ----------
function charmShape(kind) {
  const s = new THREE.Shape();
  if (kind === 'star') {
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.045 : 0.1;
      i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
  } else if (kind === 'heart') {
    s.moveTo(0, -0.08);
    s.bezierCurveTo(-0.02, -0.06, -0.11, -0.01, -0.1, 0.04);
    s.bezierCurveTo(-0.09, 0.09, -0.03, 0.1, 0, 0.055);
    s.bezierCurveTo(0.03, 0.1, 0.09, 0.09, 0.1, 0.04);
    s.bezierCurveTo(0.11, -0.01, 0.02, -0.06, 0, -0.08);
  } else if (kind === 'bolt') {
    [[0.03, 0.1], [-0.06, -0.01], [-0.005, -0.01], [-0.03, -0.1], [0.06, 0.02], [0.005, 0.02]].forEach(([x, y], i) =>
      (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  } else {
    s.absarc(0, 0, 0.085, 0, Math.PI * 2, false);
  }
  s.closePath();
  return s;
}

const charmGeoCache = {};
function charmGeometry(kind) {
  if (!charmGeoCache[kind]) {
    const g = new THREE.ExtrudeGeometry(charmShape(kind), { depth: 0.022, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 24 });
    g.center();
    charmGeoCache[kind] = g;
  }
  return charmGeoCache[kind];
}

function letterTexture(letter) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `600 170px ${/[؀-ۿ]/.test(letter) ? '"IBM Plex Sans Arabic"' : '"Instrument Serif", serif'}`;
  g.fillText(letter, 128, 140);
  const tex = new THREE.CanvasTexture(c);
  // extrude cap UVs are in shape units (disc radius 0.085)
  tex.repeat.set(1 / 0.17, 1 / 0.17);
  tex.offset.set(0.5, 0.5);
  return tex;
}

export function metalMaterial(name) {
  return new THREE.MeshPhysicalMaterial({ color: METALS[name] || name, metalness: 0.9, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 2.2 });
}

export function makeCharm(kind, metal = 'gold', letter = 'N') {
  const mesh = new THREE.Mesh(charmGeometry(kind), metalMaterial(metal));
  if (kind === 'disc') {
    const m = new THREE.MeshPhysicalMaterial({ color: METALS[metal] || metal, metalness: 0.9, roughness: 0.28, envMapIntensity: 2.2, bumpMap: letterTexture(letter), bumpScale: 4 });
    mesh.material = [m, mesh.material];
  }
  return mesh;
}

// ---------- flat charm icons ----------
const CHARM_PATHS = {
  star: 'M12 2.2l2.9 6.4 7 .7-5.3 4.7 1.5 6.9L12 17.4l-6.1 3.5 1.5-6.9L2.1 9.3l7-.7z',
  heart: 'M12 20.6s-7.6-4.6-9.6-9.3C1.1 8.1 3.2 4.6 6.7 4.6c2 0 3.7 1.1 5.3 3 1.6-1.9 3.3-3 5.3-3 3.5 0 5.6 3.5 4.3 6.7-2 4.7-9.6 9.3-9.6 9.3z',
  bolt: 'M13.6 1.8 4 13.4h6.6L9 22.2l11-12.6h-6.9z',
};
const METAL_STOPS = {
  gold: ['#fbe7a6', '#d6ad5c', '#9c7330'],
  silver: ['#ffffff', '#cfd4d9', '#8a9097'],
  rose: ['#fbd8c6', '#d99d86', '#a2654f'],
};
const charmTexCache = {};
function charmIconTexture(kind, metal = 'gold', letter = 'N') {
  const key = `${kind}:${metal}:${kind === 'disc' ? letter : ''}`;
  if (charmTexCache[key]) return charmTexCache[key];
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const [hi, mid, lo] = METAL_STOPS[metal] || METAL_STOPS.gold;
  const grad = g.createLinearGradient(40, 20, 216, 236);
  grad.addColorStop(0, hi); grad.addColorStop(0.55, mid); grad.addColorStop(1, lo);
  g.translate(128, 128); g.scale(9.2, 9.2); g.translate(-12, -12);
  const path = kind === 'disc' ? (() => { const p = new Path2D(); p.arc(12, 12, 10, 0, Math.PI * 2); return p; })() : new Path2D(CHARM_PATHS[kind] || CHARM_PATHS.star);
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 1.2; g.shadowOffsetY = 0.5;
  g.fillStyle = grad; g.fill(path);
  g.shadowColor = 'transparent';
  g.lineWidth = 0.55; g.strokeStyle = 'rgba(255,255,255,0.65)'; g.stroke(path);
  if (kind === 'disc') {
    g.fillStyle = 'rgba(60,40,10,0.75)';
    g.font = `600 13px ${/[\u0600-\u06FF]/.test(letter) ? '"IBM Plex Sans Arabic"' : '"Instrument Serif", serif'}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(letter, 12, 12.8);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return (charmTexCache[key] = tex);
}

// ---------- the strap ----------
const podShell = () => new THREE.MeshPhysicalMaterial({ color: '#16171a', roughness: 0.42, metalness: 0.25, clearcoat: 0.4, clearcoatRoughness: 0.35, envMapIntensity: 0.9 });
const gunmetal = () => new THREE.MeshPhysicalMaterial({ color: '#2b2c30', roughness: 0.28, metalness: 0.9, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.4 });

// Box oriented on the loop: x along the strap, y along the surface normal, z across.
function placeOnLoop(mesh, at) {
  mesh.position.copy(at.pos);
  mesh.rotation.z = Math.atan2(at.n.y, at.n.x) - Math.PI / 2;
  return mesh;
}

export class Band {
  constructor(cfg = {}) {
    this.group = new THREE.Group();
    this.cfg = { device: 'whoop', material: 'silicone', color: '#1c1d20', engraving: '', font: 'sans', charms: [], clasp: 'silver', charmMetal: 'gold', initial: 'N', ...cfg };

    this.colorCanvas = document.createElement('canvas');
    this.emiCanvas = document.createElement('canvas');
    [this.colorCanvas, this.emiCanvas].forEach((c) => { c.width = TEX_W; c.height = TEX_H; });
    const tex = (c, srgb) => {
      const t = new THREE.CanvasTexture(c);
      t.flipY = false; t.anisotropy = 8;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    this.map = tex(this.colorCanvas, true);
    this.emap = tex(this.emiCanvas, false);
    this.mat = new THREE.MeshPhysicalMaterial({
      color: this.cfg.color, map: this.map, bumpMap: this.map, emissive: '#ffffff', emissiveMap: this.emap,
      emissiveIntensity: 0.22, sheenColor: new THREE.Color('#ffffff'), side: THREE.DoubleSide, envMapIntensity: 0.65,
    });
    this.strap = new THREE.Mesh(undefined, this.mat);
    this.group.add(this.strap);
    // customer prints sit on their own transparent layer so the strap colour doesn't tint them
    this.printCanvas = document.createElement('canvas');
    this.printCanvas.width = TEX_W; this.printCanvas.height = TEX_H;
    this.printTex = tex(this.printCanvas, true);
    this.printMesh = new THREE.Mesh(undefined, new THREE.MeshStandardMaterial({
      map: this.printTex, transparent: true, roughness: 0.55, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide,
    }));
    this.printMesh.visible = false;
    this.group.add(this.printMesh);
    this.pod = new THREE.Group(); this.group.add(this.pod);
    this.charmGroup = new THREE.Group(); this.group.add(this.charmGroup);
    this.claspMesh = new THREE.Mesh(undefined, metalMaterial(this.cfg.clasp));
    this.group.add(this.claspMesh);

    this._applyDevice();
    this._applyMaterial();
  }

  get shape() { return shapeFor(this.cfg.device); }

  set(next = {}) {
    const prev = this.cfg;
    this.cfg = { ...prev, ...next };
    const c = this.cfg;
    if (c.device !== prev.device) this._applyDevice();
    else if (c.material !== prev.material || c.engraving !== prev.engraving || c.font !== prev.font || c.print !== prev.print) this._redraw();
    if (c.material !== prev.material) this._applyMaterial();
    if (c.color !== prev.color) this.setColor(c.color, next.animate !== false);
    if (c.clasp !== prev.clasp) this.claspMesh.material.color.set(METALS[c.clasp] || c.clasp);
    if (JSON.stringify(c.charms) !== JSON.stringify(prev.charms) || c.charmMetal !== prev.charmMetal || c.initial !== prev.initial) this._buildCharms();
  }

  setColor(hex, animate = true) {
    this.cfg.color = hex;
    const target = new THREE.Color(hex);
    if (animate && window.gsap) gsap.to(this.mat.color, { r: target.r, g: target.g, b: target.b, duration: 0.7, ease: 'power2.out' });
    else this.mat.color.copy(target);
  }

  // Swap geometry, pod and hardware when the device changes.
  _applyDevice() {
    const { geometry, spec, surfaceAt } = this.shape;
    this.strap.geometry = geometry;
    this.printMesh.geometry = geometry;
    this.claspMesh.geometry = new RoundedBoxGeometry(0.24, 0.05, spec.w * 1.06, 2, 0.02);
    placeOnLoop(this.claspMesh, surfaceAt(CLASP_U, 0.022));
    this._buildPod();
    this._redraw();
    this._buildCharms();
    this._updateClasp();
  }

  _applyMaterial() {
    Object.assign(this.mat, MATERIAL_PROPS[this.cfg.material] || MATERIAL_PROPS.silicone);
    this.mat.needsUpdate = true;
    this._updateClasp();
  }

  // Garmin's cuff closes with its own buckle, so the generic clasp is hidden there.
  _updateClasp() {
    this.claspMesh.visible = ['nylon', 'leather'].includes(this.cfg.material) && this.cfg.device !== 'garmin';
  }

  _redraw() {
    const { LOOP, PROFILE } = this.shape;
    const g = this.colorCanvas.getContext('2d'), e = this.emiCanvas.getContext('2d');
    g.drawImage(patternCanvas(this.cfg.material, this.cfg.device), 0, 0);
    e.fillStyle = '#000'; e.fillRect(0, 0, TEX_W, TEX_H);
    const faceH = PROFILE.faceV1 * TEX_H;
    // compensate for different texel density along u vs v
    const kx = (TEX_W / LOOP.len) / (TEX_H / PROFILE.len);

    this._drawPrint(faceH, kx);

    const text = (this.cfg.engraving || '').trim();
    if (text) {
      const arabic = isArabic(text);
      const font = fontFor(this.cfg.font, text);
      const draw = (ctx, fill) => {
        ctx.save();
        ctx.translate(ENGRAVE_U * TEX_W, faceH / 2);
        ctx.scale(kx, -1);
        let size = faceH * (arabic ? 0.42 : 0.46);
        ctx.font = `${font.weight} ${size}px ${font.family}`;
        if (!arabic) ctx.letterSpacing = `${size * 0.08}px`;
        const maxW = (TEX_W * 0.3) / kx;
        const w = ctx.measureText(text).width;
        if (w > maxW) { size *= maxW / w; ctx.font = `${font.weight} ${size}px ${font.family}`; }
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = fill;
        ctx.fillText(font.upper ? text.toUpperCase() : text, 0, size * 0.04);
        ctx.restore();
      };
      draw(g, 'rgba(70,70,70,0.92)');
      draw(e, '#ffffff');
    }
    this.map.needsUpdate = true;
    this.emap.needsUpdate = true;
  }

  _drawPrint(faceH, kx) {
    const g = this.printCanvas.getContext('2d');
    g.clearRect(0, 0, TEX_W, TEX_H);
    const img = this.cfg.print;
    this.printMesh.visible = !!(img && img.width);
    if (this.printMesh.visible) {
      const h = faceH * 0.9, w = Math.min((h * img.width) / img.height, (TEX_W * 0.28) / kx);
      g.save();
      g.translate(PRINT_U * TEX_W, faceH / 2);
      g.scale(kx, -1);
      g.drawImage(img, -w / 2, -h / 2, w, h);
      g.restore();
    }
    this.printTex.needsUpdate = true;
  }

  _buildPod() {
    this.pod.clear();
    const dev = this.cfg.device, { spec, surfaceAt } = this.shape;
    if (dev === 'garmin') {
      // Cirqa: the sensor sits inside the cuff; only a slim slab and a metal buckle bar show.
      const slab = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.16, spec.w * 0.62, 6, 0.06), podShell());
      this.pod.add(placeOnLoop(slab, surfaceAt(0, 0.075, -1)));
      const button = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.05, 0.16, 3, 0.02), gunmetal());
      const at = surfaceAt(0.985, 0.075 + 0.08, -1);
      button.position.copy(at.pos).add(new THREE.Vector3(0, 0, spec.w * 0.2));
      button.rotation.z = Math.atan2(at.n.y, at.n.x) - Math.PI / 2;
      this.pod.add(button);
      const buckle = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.07, spec.w * 1.04, 3, 0.03), gunmetal());
      this.pod.add(placeOnLoop(buckle, surfaceAt(0.09, 0.03)));
      return;
    }
    if (dev === 'fitbit') {
      // Air: a slim rounded slab sleeved into the top of the band
      const L = 0.82, H = 0.12, D = spec.w * 1.04;
      const body = new THREE.Mesh(new RoundedBoxGeometry(L, H, D, 8, 0.055), podShell());
      body.position.set(0, spec.ry + spec.t / 2 + H / 2 - 0.04, 0);
      this.pod.add(body);
      return;
    }
    // WHOOP: long slim pod with a gunmetal end cap
    const L = 1.2, H = 0.19, D = spec.w * 0.86;
    const y = spec.ry + spec.t / 2 + H / 2 - 0.035;
    const body = new THREE.Mesh(new RoundedBoxGeometry(L, H, D, 8, 0.08), podShell());
    body.position.set(0, y, 0);
    const cap = new THREE.Mesh(new RoundedBoxGeometry(0.2, H * 1.04, D * 1.025, 6, 0.08), gunmetal());
    cap.position.set(L / 2 - 0.09, y, 0);
    this.pod.add(body, cap);
  }

  // Charms render as flat metal icons (sprites) that always turn to face the viewer.
  _buildCharms() {
    this.charmGroup.clear();
    const { surfaceAt } = this.shape;
    (this.cfg.charms || []).slice(0, CHARM_U.length).forEach((kind, i) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: charmIconTexture(kind, this.cfg.charmMetal, this.cfg.initial), transparent: true, depthWrite: false, toneMapped: false }));
      sprite.position.copy(surfaceAt(CHARM_U[i], 0.13).pos);
      sprite.scale.setScalar(0.32);
      this.charmGroup.add(sprite);
    });
  }
}

// ---------- stage ----------
export class Stage {
  constructor(canvas, { orbit = false, fov = 30, distance = 7.2, shadow = false, rim = 0 } = {}) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    this.camera.position.set(0, 0, distance);

    const key = new THREE.DirectionalLight('#ffffff', 3.2); key.position.set(3, 5, 5); this.scene.add(key);
    const fill = new THREE.DirectionalLight('#ffffff', 0.9); fill.position.set(-4, -2, 3); this.scene.add(fill);
    if (rim) { const r = new THREE.PointLight('#7dffcf', rim, 12, 1.6); r.position.set(-2.5, 1.5, -2.5); this.scene.add(r); this.rim = r; }

    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    if (shadow) {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
      plane.rotation.x = -Math.PI / 2; plane.position.y = -1.35;
      this.scene.add(plane);
    }

    if (orbit) {
      this.controls = new OrbitControls(this.camera, canvas);
      Object.assign(this.controls, { enableDamping: true, enablePan: false, autoRotate: true, autoRotateSpeed: 1.6, minDistance: 4.2, maxDistance: 10 });
      const stop = () => (this.controls.autoRotate = false);
      this.controls.addEventListener('start', stop);
    }

    this.callbacks = [];
    this.clock = new THREE.Clock();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    this.running = false;
  }

  resize() {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  onFrame(fn) { this.callbacks.push(fn); }

  start() {
    if (this.running) return;
    this.running = true;
    this.renderer.setAnimationLoop(() => {
      const dt = Math.min(this.clock.getDelta(), 0.05), time = this.clock.elapsedTime;
      this.callbacks.forEach((f) => f(dt, time));
      this.controls?.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  stop() { this.running = false; this.renderer.setAnimationLoop(null); }

  dispose() {
    this.stop();
    this.ro.disconnect();
    this.controls?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

// ---------- product thumbnails ----------
let thumbStage, thumbBand, thumbCharm;
const thumbCache = new Map();
const queue = [];
let busy = false;

function ensureThumbStage() {
  if (thumbStage) return;
  const c = document.createElement('canvas');
  c.width = c.height = 640;
  c.style.cssText = 'position:fixed;left:-9999px;top:0;width:640px;height:640px';
  document.body.appendChild(c);
  thumbStage = new Stage(c, { distance: 6.4 });
  thumbStage.renderer.setPixelRatio(1);
  thumbStage.renderer.setSize(640, 640, false);
  thumbStage.camera.aspect = 1; thumbStage.camera.updateProjectionMatrix();
  thumbStage.ro.disconnect();
  thumbBand = new Band();
  thumbStage.pivot.add(thumbBand.group);
}

// Camera angles per device, posed like each brand's own product shot ('a'),
// plus a second angle for the hover swap ('b').
const ANGLES = {
  whoop:  { a: { rx: 0.25, ry: -0.95, rz: -1.42 }, b: { rx: -0.5, ry: 0.85, rz: -0.08 } },
  garmin: { a: { rx: -1.32, ry: 0, rz: -0.12 },   b: { rx: -0.9, ry: 0.5, rz: -0.6 } },
  fitbit: { a: { rx: 0.18, ry: 0.55, rz: 0.95 },  b: { rx: -0.45, ry: 0.8, rz: -0.06 } },
};

function renderThumb(spec) {
  ensureThumbStage();
  const ang = (ANGLES[spec.device] || ANGLES.whoop)[spec.angle || 'a'];
  thumbStage.pivot.rotation.set(ang.rx, ang.ry, ang.rz);
  if (spec.kind === 'charm') {
    thumbBand.group.visible = false;
    if (thumbCharm) thumbStage.pivot.remove(thumbCharm);
    thumbCharm = makeCharm(spec.shape, spec.metal, 'N');
    thumbCharm.scale.setScalar(9);
    thumbCharm.rotation.set(spec.angle === 'b' ? 0.5 : 0.15, spec.angle === 'b' ? -0.9 : 0.35, 0);
    thumbStage.pivot.rotation.set(0, 0, 0);
    thumbStage.pivot.add(thumbCharm);
  } else {
    thumbBand.group.visible = true;
    if (thumbCharm) { thumbStage.pivot.remove(thumbCharm); thumbCharm = null; }
    thumbBand.set({ device: spec.device, material: spec.material, color: spec.color, engraving: spec.engraving || '', charms: [], animate: false });
  }
  thumbStage.renderer.render(thumbStage.scene, thumbStage.camera);
  return thumbStage.canvas.toDataURL('image/webp', 0.9);
}

// Queue a thumbnail render; resolves to a data URL. Rendering yields between items.
export function thumb(spec) {
  const key = JSON.stringify(spec);
  if (thumbCache.has(key)) return Promise.resolve(thumbCache.get(key));
  return new Promise((resolve) => {
    queue.push({ spec, key, resolve });
    pump();
  });
}

async function pump() {
  if (busy) return;
  busy = true;
  while (queue.length) {
    const job = queue.shift();
    if (!thumbCache.has(job.key)) thumbCache.set(job.key, renderThumb(job.spec));
    job.resolve(thumbCache.get(job.key));
    await new Promise((r) => requestAnimationFrame(r));
  }
  busy = false;
}

export const THREE_NS = THREE;
