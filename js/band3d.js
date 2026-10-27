// Procedural 3D strap: loop geometry, material textures, tracker pods, clasp,
// charms and live laser engraving. Everything is generated in code, no model files.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const RX = 1.0, RY = 0.84, EXP = 2.6;      // loop superellipse
const W = 0.6, T = 0.075, R = 0.03;          // strap width, thickness, edge radius
const U_SEG = 260;
const TEX_W = 2048, TEX_H = 512;
const ENGRAVE_U = 0.75;                      // bottom of the loop
const CLASP_U = 0.6;
const CHARM_U = [0.06, 0.94, 0.14, 0.86];

const METALS = { gold: '#d6b06a', silver: '#cfd3d7', rose: '#d79e88', black: '#2a2b2e' };

// ---------- geometry ----------
function loopPoint(t) {
  const c = Math.cos(t), s = Math.sin(t);
  return new THREE.Vector2(
    RX * Math.sign(c) * Math.pow(Math.abs(c), 2 / EXP),
    RY * Math.sign(s) * Math.pow(Math.abs(s), 2 / EXP),
  );
}

// Resample the loop by arc length so vertices and the u texture coord are uniform.
function buildLoop() {
  const N = 3000, pts = [];
  for (let i = 0; i < N; i++) pts.push(loopPoint((i / N) * Math.PI * 2));
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
function buildProfile() {
  const hw = W / 2, ht = T / 2, r = R, P = [];
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

const LOOP = buildLoop();
const PROFILE = buildProfile();
let bandGeometry;

function getBandGeometry() {
  if (bandGeometry) return bandGeometry;
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
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  bandGeometry = g;
  return g;
}

// Point + outward normal on the strap's outer surface at loop coordinate u.
function surfaceAt(u, lift = 0) {
  const i = Math.round(u * U_SEG) % U_SEG;
  const p = LOOP.p[i], n = LOOP.n[i];
  return { pos: new THREE.Vector3(p.x + n.x * (T / 2 + lift), p.y + n.y * (T / 2 + lift), 0), n: new THREE.Vector3(n.x, n.y, 0) };
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

const patternCache = {};
function patternCanvas(type) {
  if (patternCache[type]) return patternCache[type];
  const c = document.createElement('canvas');
  c.width = TEX_W; c.height = TEX_H;
  const g = c.getContext('2d');
  const rand = rng(11);
  const faceY1 = PROFILE.faceV1 * TEX_H, innerY0 = PROFILE.innerV0 * TEX_H;
  const gray = (v) => `rgb(${v},${v},${v})`;

  if (type === 'silicone') {
    g.fillStyle = gray(236); g.fillRect(0, 0, TEX_W, TEX_H);
    for (let i = 0; i < 9000; i++) { g.fillStyle = gray(226 + rand() * 20); g.fillRect(rand() * TEX_W, rand() * TEX_H, 2, 2); }
    // subtle grip ribs on the inner face
    g.fillStyle = gray(214);
    for (let x = 0; x < TEX_W; x += 16) g.fillRect(x, innerY0 + 10, 6, (TEX_H - innerY0) - 30);
  } else if (type === 'nylon') {
    g.fillStyle = gray(210); g.fillRect(0, 0, TEX_W, TEX_H);
    const s = 8;
    for (let y = 0; y < TEX_H; y += s) {
      for (let x = 0; x < TEX_W; x += s) {
        const twill = ((x / s + y / s) % 4) < 2;
        const v = (twill ? 232 : 200) + (rand() - 0.5) * 18;
        g.fillStyle = gray(Math.max(0, Math.min(255, v | 0)));
        g.fillRect(x, y, s - 1, s - 1);
      }
    }
    // diagonal ribbing on the inside of the loop
    g.save();
    g.beginPath(); g.rect(0, innerY0, TEX_W, TEX_H - innerY0); g.clip();
    g.fillStyle = 'rgba(0,0,0,0.3)';
    for (let x = -TEX_H; x < TEX_W; x += 64) {
      g.beginPath();
      g.moveTo(x, TEX_H); g.lineTo(x + 20, TEX_H); g.lineTo(x + 20 + TEX_H * 0.6, innerY0); g.lineTo(x + TEX_H * 0.6, innerY0);
      g.fill();
    }
    g.restore();
  } else if (type === 'leather') {
    g.fillStyle = gray(236); g.fillRect(0, 0, TEX_W, TEX_H);
    for (let i = 0; i < 60000; i++) {
      g.fillStyle = gray((212 + rand() * 43) | 0);
      g.beginPath(); g.ellipse(rand() * TEX_W, rand() * TEX_H, 1 + rand() * 2.5, 1 + rand() * 2, rand() * 3, 0, 7); g.fill();
    }
    g.strokeStyle = gray(255); g.lineWidth = 5; g.setLineDash([18, 11]); g.lineCap = 'round';
    [12, faceY1 - 12].forEach((y) => { g.beginPath(); g.moveTo(0, y); g.lineTo(TEX_W, y); g.stroke(); });
    g.setLineDash([]);
  } else if (type === 'sportflex') {
    g.fillStyle = gray(232); g.fillRect(0, 0, TEX_W, TEX_H);
    for (let i = 0; i < 6000; i++) { g.fillStyle = gray(220 + rand() * 25); g.fillRect(rand() * TEX_W, rand() * TEX_H, 2, 2); }
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
  patternCache[type] = c;
  return c;
}

const MATERIAL_PROPS = {
  silicone:  { roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.35, sheen: 0, bumpScale: 0.6 },
  nylon:     { roughness: 0.9, clearcoat: 0, clearcoatRoughness: 1, sheen: 0.5, sheenRoughness: 0.6, bumpScale: 1 },
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

// ---------- the strap ----------
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
    this.strap = new THREE.Mesh(getBandGeometry(), this.mat);
    this.group.add(this.strap);

    this.pod = new THREE.Group(); this.group.add(this.pod);
    this.charmGroup = new THREE.Group(); this.group.add(this.charmGroup);
    this.claspMesh = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.05, W * 1.06, 2, 0.02), metalMaterial(this.cfg.clasp));
    const s = surfaceAt(CLASP_U, 0.022);
    this.claspMesh.position.copy(s.pos);
    this.claspMesh.rotation.z = Math.atan2(s.n.y, s.n.x) - Math.PI / 2;
    this.group.add(this.claspMesh);

    this._applyMaterial();
    this._buildPod();
    this._redraw();
    this._buildCharms();
  }

  set(next = {}) {
    const prev = this.cfg;
    this.cfg = { ...prev, ...next };
    const c = this.cfg;
    if (c.material !== prev.material) { this._applyMaterial(); this._redraw(); }
    else if (c.engraving !== prev.engraving || c.font !== prev.font) this._redraw();
    if (c.device !== prev.device) this._buildPod();
    if (c.color !== prev.color) this.setColor(c.color, next.animate !== false);
    if (c.clasp !== prev.clasp) this.claspMesh.material.color.set(METALS[c.clasp] || c.clasp);
    if (JSON.stringify(c.charms) !== JSON.stringify(prev.charms) || c.charmMetal !== prev.charmMetal || c.initial !== prev.initial) this._buildCharms();
    this.claspMesh.visible = c.material === 'nylon' || c.material === 'leather';
  }

  setColor(hex, animate = true) {
    this.cfg.color = hex;
    const target = new THREE.Color(hex);
    if (animate && window.gsap) gsap.to(this.mat.color, { r: target.r, g: target.g, b: target.b, duration: 0.7, ease: 'power2.out' });
    else this.mat.color.copy(target);
  }

  _applyMaterial() {
    const p = MATERIAL_PROPS[this.cfg.material] || MATERIAL_PROPS.silicone;
    Object.assign(this.mat, p);
    this.mat.needsUpdate = true;
    this.claspMesh && (this.claspMesh.visible = this.cfg.material === 'nylon' || this.cfg.material === 'leather');
  }

  _redraw() {
    const g = this.colorCanvas.getContext('2d'), e = this.emiCanvas.getContext('2d');
    g.drawImage(patternCanvas(this.cfg.material), 0, 0);
    e.fillStyle = '#000'; e.fillRect(0, 0, TEX_W, TEX_H);
    const text = (this.cfg.engraving || '').trim();
    if (text) {
      const arabic = /[؀-ۿ]/.test(text);
      const faceH = PROFILE.faceV1 * TEX_H;
      // compensate for different texel density along u vs v
      const kx = (TEX_W / LOOP.len) / (TEX_H / PROFILE.len);
      const family = arabic ? '"IBM Plex Sans Arabic"' : this.cfg.font === 'serif' ? '"Instrument Serif", serif' : 'Archivo, sans-serif';
      const weight = this.cfg.font === 'serif' && !arabic ? 400 : 700;
      const draw = (ctx, fill) => {
        ctx.save();
        ctx.translate(ENGRAVE_U * TEX_W, faceH / 2);
        ctx.scale(kx, -1);
        let size = faceH * (arabic ? 0.5 : 0.56);
        ctx.font = `${weight} ${size}px ${family}`;
        if (!arabic) ctx.letterSpacing = `${size * 0.08}px`;
        const maxW = (TEX_W * 0.3) / kx;
        const w = ctx.measureText(text).width;
        if (w > maxW) { size *= maxW / w; ctx.font = `${weight} ${size}px ${family}`; }
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = fill;
        ctx.fillText(arabic || this.cfg.font === 'serif' ? text : text.toUpperCase(), 0, size * 0.04);
        ctx.restore();
      };
      draw(g, 'rgba(70,70,70,0.92)');
      draw(e, '#ffffff');
    }
    this.map.needsUpdate = true;
    this.emap.needsUpdate = true;
  }

  _buildPod() {
    this.pod.clear();
    const dev = this.cfg.device;
    const shell = new THREE.MeshPhysicalMaterial({ color: '#141518', roughness: 0.55, metalness: 0.15, clearcoat: 0.35, clearcoatRoughness: 0.45 });
    const top = RY + T / 2;
    let body, h, len, wid;
    if (dev === 'fitbit') {
      len = 0.86; wid = 0.5; h = 0.2;
      body = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.36, 12, 32), shell);
      body.rotation.z = Math.PI / 2;
      body.scale.set(h / 0.5, 1, 1);
    } else if (dev === 'garmin') {
      len = 0.84; wid = 0.6; h = 0.19;
      body = new THREE.Mesh(new RoundedBoxGeometry(len, h, wid, 6, 0.09), shell);
    } else {
      len = 0.92; wid = 0.68; h = 0.21;
      body = new THREE.Mesh(new RoundedBoxGeometry(len, h, wid, 6, 0.07), shell);
    }
    this.pod.add(body);
    // glow strip (stylised sensor light)
    const glow = new THREE.Mesh(new THREE.BoxGeometry(len * 0.55, 0.012, 0.006), new THREE.MeshBasicMaterial({ color: '#dfe6e2' }));
    glow.position.set(0, -h * 0.18, wid / 2 + 0.002);
    this.pod.add(glow);
    this.glow = glow;
    this.pod.position.set(0, top + h / 2 - 0.035, 0);
  }

  _buildCharms() {
    this.charmGroup.clear();
    (this.cfg.charms || []).slice(0, CHARM_U.length).forEach((kind, i) => {
      const m = makeCharm(kind, this.cfg.charmMetal, this.cfg.initial);
      const s = surfaceAt(CHARM_U[i], 0.03);
      m.position.copy(s.pos);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), s.n);
      m.rotateZ(Math.PI / 2 * (s.n.x > 0 ? 1 : -1));
      this.charmGroup.add(m);
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

const ANGLES = {
  a: { rx: 0.32, ry: -0.42, rz: 0.04 },
  b: { rx: -0.55, ry: 0.85, rz: -0.08 },
};

function renderThumb(spec) {
  ensureThumbStage();
  const ang = ANGLES[spec.angle || 'a'];
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
