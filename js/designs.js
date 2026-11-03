// Preset print designs, drawn procedurally so they stay crisp at any size.
// Each returns a canvas in strap proportions (long and narrow), used for the 3D print and the picker swatch.
const W = 1200, H = 300;

function make(draw) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  draw(c.getContext('2d'));
  return c;
}

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const DRAW = {
  stripes: (g) => {
    g.fillStyle = '#111'; g.fillRect(0, 0, W, H);
    [['#f2f2f2', 70], ['#e5322d', 40], ['#f2f2f2', 20]].reduce((y, [c, h]) => { g.fillStyle = c; g.fillRect(0, y, W, h); return y + h + 14; }, 80);
  },
  camo: (g) => {
    seed = 11;
    g.fillStyle = '#c9b48a'; g.fillRect(0, 0, W, H);
    ['#a8915f', '#7d6a45', '#5a4b33', '#d8c7a0'].forEach((c) => {
      g.fillStyle = c;
      for (let i = 0; i < 26; i++) {
        g.beginPath();
        const x = rand() * W, y = rand() * H, r = 30 + rand() * 60;
        for (let a = 0; a < 7; a++) { const ang = (a / 7) * Math.PI * 2, rr = r * (0.6 + rand() * 0.6); g.lineTo(x + Math.cos(ang) * rr * 1.6, y + Math.sin(ang) * rr); }
        g.fill();
      }
    });
  },
  kuwait: (g) => {
    g.fillStyle = '#007a3d'; g.fillRect(0, 0, W, H / 3);
    g.fillStyle = '#ffffff'; g.fillRect(0, H / 3, W, H / 3);
    g.fillStyle = '#ce1126'; g.fillRect(0, (2 * H) / 3, W, H / 3);
    g.fillStyle = '#000'; g.beginPath(); g.moveTo(0, 0); g.lineTo(220, H / 3); g.lineTo(220, (2 * H) / 3); g.lineTo(0, H); g.fill();
  },
  waves: (g) => {
    g.fillStyle = '#0d3b66'; g.fillRect(0, 0, W, H);
    g.lineWidth = 14;
    ['#1d6fa5', '#5fb3d6', '#f4f1de'].forEach((c, k) => {
      g.strokeStyle = c;
      for (let row = -1; row < 6; row++) {
        g.beginPath();
        for (let x = 0; x <= W; x += 10) g.lineTo(x, row * 60 + k * 18 + Math.sin(x / 45 + k) * 16);
        g.stroke();
      }
    });
  },
  check: (g) => {
    const s = 50;
    for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) { g.fillStyle = ((x + y) / s) % 2 ? '#111' : '#f4f4f4'; g.fillRect(x, y, s, s); }
  },
  stars: (g) => {
    seed = 3;
    g.fillStyle = '#16123a'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#ffd66b';
    for (let i = 0; i < 40; i++) {
      const x = rand() * W, y = rand() * H, r = 8 + rand() * 16;
      g.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      g.fill();
    }
  },
  geo: (g) => {
    const s = 75, cols = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'];
    for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
      const i = ((x / s) * 3 + (y / s) * 2) % cols.length;
      g.fillStyle = cols[i]; g.fillRect(x, y, s, s);
      g.fillStyle = cols[(i + 2) % cols.length];
      g.beginPath(); g.moveTo(x, y + s); g.lineTo(x + s, y); g.lineTo(x + s, y + s); g.fill();
    }
  },
  leopard: (g) => {
    seed = 5;
    g.fillStyle = '#d9a35b'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) {
      const x = rand() * W, y = rand() * H, r = 10 + rand() * 14;
      g.fillStyle = '#7a4a1e'; g.beginPath(); g.ellipse(x, y, r, r * 0.8, rand() * 3, 0, 7); g.fill();
      g.strokeStyle = '#1d140c'; g.lineWidth = 5; g.beginPath(); g.ellipse(x, y, r + 4, r * 0.8 + 4, rand() * 3, 0.4, 5.2); g.stroke();
    }
  },
};

const cache = {};
export function designCanvas(id) {
  if (!DRAW[id]) return null;
  return (cache[id] ||= make(DRAW[id]));
}
