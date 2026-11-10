// Seasonal themes for the hanami banner. Each theme has:
//   palette  - replacements for the base scene colours (sky, hills, lawn, title...), by role
//   trees    - paints one plant per month; m.v (0-1) is that month's activity
//   fall     - what drifts down: petals, leaves or rain
//
// Painters get ({ c, months, r, G, PW, night, lamps }) where c is the pixel canvas and G the ground line.

// colour roles as drawn by the base scene; palettes are swapped in by role
export const BASE = {
  sky: ['#bfe4f6', '#cdeaf7', '#dff0f8', '#f1eef6', '#fbe6ee', '#fcd8e4'], sun: ['#fffbe6', '#fff3c9'],
  mtn: ['#aaa6d6', '#bcb8e2'], hills: ['#b9dfb0', '#8fcf8a'], grass: ['#7cc47a', '#a4dd97', '#6ab36b'],
  lawnBg: ['#5a9f5c'], lawn0: ['#6fb86c'], dither: ['#83c97c'], lawn: ['#fbd9e5', '#f8b1c9', '#ef82aa', '#d9548b'],
  label: ['#2f6b3f'], title: ['#e58aae', '#b0527d', '#f3b6cd'], bird: ['#7a74a6'],
};
export const paletteMap = (pal) => {
  const map = {};
  for (const [role, cols] of Object.entries(pal)) BASE[role].forEach((c, i) => (map[c] = cols[i]));
  return map;
};

// ---- shared bits ---------------------------------------------------------------
function trunk(c, x, top, light, dark, G = 55) {
  const th = G - top;
  c.rect(x, top, 2, th + 1, light);
  c.rect(x + 1, top + 2, 1, th - 1, dark);
  c.px(x - 1, top, light); c.px(x - 2, top - 1, light); c.px(x - 3, top - 2, light);
  c.px(x + 2, top, dark); c.px(x + 3, top - 1, dark); c.px(x + 4, top - 3, dark); c.px(x + 3, top - 2, dark);
  c.px(x, top - 1, light); c.px(x, top - 2, light);
}

// a lumpy round canopy made of overlapping discs, lit from the top-left
function canopy(c, r, x, cy, R, cols, { gap = 0 } = {}) {
  const [hi, mid, lo, edge, spark] = cols;
  const blobs = [[0.5, 0, 1], [-R * 0.62, R * 0.32, 0.68], [R * 0.66, R * 0.3, 0.7], [R * 0.15, -R * 0.5, 0.66]];
  for (const [bx, by, k] of blobs) {
    const rr = R * k;
    for (let j = -Math.ceil(rr); j <= Math.ceil(rr); j++) for (let i = -Math.ceil(rr); i <= Math.ceil(rr); i++) {
      const dd = (i * i + j * j) / (rr * rr);
      if (dd > 1 || (gap && r() < gap)) continue;
      const light = (-i * 0.6 - j * 0.8) / rr + (r() - 0.5) * 0.5;
      const col = r() < 0.05 ? spark : light > 0.32 ? hi : light < -0.4 ? lo : mid;
      c.px(x + bx + i, cy + by + j, dd > 0.86 && light < -0.2 ? edge : col);
    }
  }
}

// ---- 桜 sakura ----------------------------------------------------------------------
const SAKURA_DAY = { trunk: ['#9a6f62', '#7d5649'], bloom: ['#ffe6ef', '#fbc3d6', '#f09bbb', '#de84a8', '#fff8fb'] };
// the night theme recolours from the original saturated colours, so it keeps those
const SAKURA_NIGHT = { trunk: ['#7a4a3a', '#5c3528'], bloom: ['#ffd9e6', '#f8a8c4', '#e0749f', '#c95a8a', '#fff4f8'] };

const sakura = {
  name: 'Mochi Sakura',
  palette: {
    sky: ['#d9eef8', '#e2f1f8', '#ebf4f8', '#f5f1f7', '#fbedf2', '#fce4ec'], sun: ['#fffdf0', '#fff6d8'],
    mtn: ['#c9c4e6', '#d6d2ee'], hills: ['#cfe9c6', '#b3dfae'], grass: ['#a6d8a0', '#c4e8b8', '#93cc8f'],
    lawnBg: ['#8fc58f'], lawn0: ['#a3d49d'], dither: ['#b3dcab'], lawn: ['#fde6ee', '#fbc8da', '#f5a3c0', '#e57fa6'],
    label: ['#5f9a6a'], title: ['#f2b8cd', '#c7739a', '#f8d3e0'], bird: ['#9d98c2'],
  },
  trees({ c, months, r, G, night, lamps }) {
    const col = night ? SAKURA_NIGHT : SAKURA_DAY;
    for (const m of months) {
      const top = G - Math.round(8 + m.v * 6);
      trunk(c, m.x, top, ...col.trunk);
      if (m.total === 0) continue;
      if (night && m.v > 0.25) lamps.push([m.x - 3, top - 1]);
      const R = 2.6 + m.v * 6.4;
      canopy(c, r, m.x, top - R * 0.55, R, col.bloom);
    }
  },
  fall: { colors: ['#fff8fb', '#fbc3d6'], night: ['#fff4f8', '#f8a8c4'] },
};

// ---- 藤 wisteria: a pergola, racemes hang longer in busier months ----------------------
const wisteria = {
  name: 'Fuji Wisteria',
  palette: {
    sky: ['#e4e4fa', '#ebe8fa', '#f1edfa', '#f6effa', '#faf0f6', '#fbe9f2'], sun: ['#fffdf0', '#fff6d8'],
    mtn: ['#b8c6ea', '#cbd6f2'], hills: ['#d4ead2', '#bde0c3'], grass: ['#acd8b4', '#c8e9cc', '#98cba3'],
    lawnBg: ['#92c49f'], lawn0: ['#a8d6b2'], dither: ['#b8dfc0'], lawn: ['#ece4fb', '#d6c6f6', '#b9a2ee', '#9a7fde'],
    label: ['#5c8f74'], title: ['#cdbdf0', '#8a6fc6', '#e2d8f8'], bird: ['#8e8bb8'],
  },
  trees({ c, months, r, G, PW }) {
    const wood = '#9a7a6c', woodDk = '#7a5d52', woodHi = '#b8988a';
    const leaf = ['#c4e2b4', '#a9d49c', '#8fc287'];
    const flower = ['#f1eafd', '#d9c9f7', '#bba5ee', '#9e86de', '#8a70cc'];
    const beam = G - 21;
    const bounds = months.map((m, i) => [
      i ? Math.round((months[i - 1].x + m.x) / 2) : 0,
      i < months.length - 1 ? Math.round((m.x + months[i + 1].x) / 2) : PW,
    ]);
    // posts between months, the beam and its rafter ends
    for (const [l] of bounds.slice(1)) {
      c.rect(l, beam, 2, G - beam + 1, wood);
      c.rect(l + 1, beam + 2, 1, G - beam - 1, woodDk);
    }
    c.rect(0, beam, PW, 2, wood);
    c.rect(0, beam, PW, 1, woodHi);
    c.rect(0, beam + 2, PW, 1, woodDk);
    for (let x = 2; x < PW; x += 6) { c.px(x, beam - 1, wood); c.px(x + 1, beam - 1, woodDk); }

    months.forEach((m, i) => {
      const [l, rr] = bounds[i];
      // vines along the beam and twisting up the post
      for (let x = l; x < rr; x++) {
        if (r() < 0.3 + m.v * 0.6) c.px(x, beam - 1 - (r() < 0.4 ? 1 : 0), leaf[Math.floor(r() * 3)]);
        if (r() < 0.2 + m.v * 0.5) c.px(x, beam + 2, leaf[1 + Math.floor(r() * 2)]);
      }
      for (let y = beam + 3; y < G; y += 2) c.px(l + (y % 4 ? 0 : 1), y, leaf[2]);
      if (m.total === 0) return;
      // hanging racemes: pale at the top, deepening to the bud tips
      const L = 2 + m.v * 10;
      for (let x = l + 1; x < rr - 1; x++) {
        if (r() > 0.25 + m.v * 0.55) continue;
        const len = Math.max(2, Math.round(L * (0.45 + r() * 0.65)));
        for (let k = 0; k < len; k++) {
          const t = k / len;
          const fc = r() < 0.06 ? flower[0] : t < 0.3 ? flower[1] : t < 0.65 ? flower[2] : t < 0.9 ? flower[3] : flower[4];
          c.px(x, beam + 3 + k, fc);
          if (t < 0.4 && r() < 0.35) c.px(x + 1, beam + 3 + k, flower[1]);
        }
      }
    });
  },
  fall: { colors: ['#d9c9f7', '#bba5ee'], from: (G) => G - 18 },
};

// ---- 紫陽花 ajisai: hydrangea bushes in the rainy season ---------------------------------
const ajisai = {
  name: 'Ajisai',
  palette: {
    sky: ['#dcecfb', '#e3effb', '#eaf2fa', '#f0f0fa', '#f4eef9', '#efe8f8'], sun: ['#fffdf5', '#fff4dc'],
    mtn: ['#a9bde3', '#bfd0ee'], hills: ['#cfe8d8', '#b6dcc8'], grass: ['#a3d3bd', '#c3e6d4', '#8fc7ae'],
    lawnBg: ['#86bea6'], lawn0: ['#9ccfb8'], dither: ['#addac6'], lawn: ['#e0ecfd', '#bfd6f8', '#9bbcf0', '#7c9fe0'],
    label: ['#4f8a74'], title: ['#bcd0f2', '#6f8fd0', '#d8e4f8'], bird: ['#8b94bc'],
  },
  trees({ c, months, r, G }) {
    const leaf = ['#8fc49a', '#76b386', '#5e9e72'];
    const heads = [
      ['#eef4ff', '#c8dbf8', '#a6c0ee', '#8aa6e0'], // blue
      ['#f3ecff', '#d8c8f5', '#bba5ea', '#a28ad8'], // violet
      ['#fdeef4', '#f4cfe0', '#e6abc8', '#d390b3'], // pink
    ];
    for (const m of months) {
      const cx = m.x + 1, w = 4 + m.v * 7, h = 3 + m.v * 5;
      // leafy mound
      for (let j = 0; j <= Math.ceil(h); j++) for (let i = -Math.ceil(w); i <= Math.ceil(w); i++) {
        if ((i / w) ** 2 + (j / h) ** 2 > 1) continue;
        const s = -i / w * 0.6 + j / h * 0.8 + (r() - 0.5) * 0.6;
        c.px(cx + i, G - j, s > 0.55 ? leaf[0] : s < -0.1 ? leaf[2] : leaf[1]);
      }
      if (m.total === 0) continue;
      // mophead flower clusters sitting on the mound
      const n = 1 + Math.round(m.v * 4);
      for (let k = 0; k < n; k++) {
        const hx = cx + (n === 1 ? 0 : (k / (n - 1) - 0.5) * w * 1.3) + (r() - 0.5) * 2;
        const hy = G - h * 0.75 - r() * h * 0.4;
        const R = 1.4 + m.v * 1.8 + r() * 0.7;
        const [hi, mid, lo, deep] = heads[r() < 0.6 ? 0 : r() < 0.6 ? 1 : 2];
        for (let j = -Math.ceil(R); j <= Math.ceil(R); j++) for (let i = -Math.ceil(R); i <= Math.ceil(R); i++) {
          const dd = (i * i + j * j) / (R * R);
          if (dd > 1) continue;
          const light = (-i * 0.6 - j * 0.8) / R + (r() - 0.5) * 0.5;
          // little four-petal florets read as a checker of light dots
          const floret = (Math.round(hx + i) + Math.round(hy + j)) % 2 === 0 && r() < 0.45;
          c.px(hx + i, hy + j, floret && light > -0.2 ? hi : light > 0.25 ? mid : dd > 0.8 ? deep : light < -0.3 ? lo : mid);
        }
      }
    }
  },
  fall: { rain: true, colors: ['#b4cdee', '#c9dbf5'] },
};

// ---- 銀杏 ichō: golden ginkgo trees on a matcha lawn ---------------------------------------
const ginkgo = {
  name: 'Ichō Matcha',
  palette: {
    sky: ['#e6f4f0', '#ecf6ee', '#f2f7ea', '#f8f7e4', '#fdf5dc', '#fdf0d2'], sun: ['#ffffff', '#fff8e0'],
    mtn: ['#c2d6c8', '#d2e2d6'], hills: ['#d8ecc4', '#c2e2ac'], grass: ['#b2d896', '#cfe8b4', '#9ecb84'],
    lawnBg: ['#8fbd76'], lawn0: ['#a6cf8c'], dither: ['#b6d99e'], lawn: ['#fbeeb0', '#fbdf86', '#f4c85c', '#e3aa3c'],
    label: ['#5f8a4a'], title: ['#f2d48a', '#c08e30', '#fbecc0'], bird: ['#a39f86'],
  },
  trees({ c, months, r, G }) {
    const bark = ['#8f7360', '#73594a'];
    const gold = ['#fff3c4', '#ffe08e', '#f6c95e', '#e2ad44', '#fffbea'];
    for (const m of months) {
      const top = G - Math.round(9 + m.v * 6);
      c.rect(m.x, top, 2, G - top + 1, bark[0]);
      c.rect(m.x + 1, top + 2, 1, G - top - 1, bark[1]);
      if (m.total === 0) {
        // bare: upright twigs
        for (let k = 1; k <= 4; k++) { c.px(m.x - Math.ceil(k / 2), top - k, bark[0]); c.px(m.x + 1 + Math.ceil(k / 2), top - k, bark[1]); c.px(m.x, top - k, bark[0]); }
        continue;
      }
      // tall teardrop crown, widest near the bottom
      const H = Math.round(6 + m.v * 12), W = 2.2 + m.v * 4.8, bottom = top + 3;
      for (let j = 0; j <= H; j++) {
        const t = j / H; // 0 at the crown tip, 1 at the base
        const hw = W * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.62) * (t > 0.85 ? 1 - (t - 0.85) * 2 : 1);
        for (let i = -Math.ceil(hw); i <= Math.ceil(hw); i++) {
          const e = Math.abs(i) / Math.max(hw, 0.5);
          if (e > 1 || (e > 0.75 && r() < 0.35)) continue;
          const light = -i / Math.max(hw, 1) * 0.7 + (1 - t) * 0.5 + (r() - 0.5) * 0.6;
          const col = r() < 0.04 ? gold[4] : light > 0.45 ? gold[0] : light < -0.35 ? gold[2] : gold[1];
          c.px(m.x + 1 + i, bottom - H + j, e > 0.8 && light < 0 ? gold[3] : col);
        }
      }
    }
  },
  fall: { leaf: true, colors: ['#ffe08e', '#f6c95e'] },
};

// ---- 柿 kaki: persimmon trees heavy with fruit -------------------------------------------
const kaki = {
  name: 'Kaki Peach',
  palette: {
    sky: ['#d8f3ea', '#e1f5ec', '#eaf6ee', '#f6f3e8', '#fdeee2', '#fde5d8'], sun: ['#fffaf0', '#ffefd2'],
    mtn: ['#b9d9e0', '#cbe5ea'], hills: ['#d6efd8', '#c0e6c8'], grass: ['#9fdcb6', '#c0ebcd', '#8ccfa5'],
    lawnBg: ['#85c69e'], lawn0: ['#9dd7b3'], dither: ['#aee0c0'], lawn: ['#ffe8da', '#ffd0b5', '#fbb18e', '#f08f6d'],
    label: ['#4e9470'], title: ['#ffc7ad', '#e0805e', '#ffdccb'], bird: ['#8fa8b8'],
  },
  trees({ c, months, r, G }) {
    const bark = ['#8e6a5c', '#6f5045'];
    const leaves = ['#c6e8cf', '#a5d8b6', '#86c49c', '#6eaf87', '#e6f6ea'];
    for (const m of months) {
      const top = G - Math.round(8 + m.v * 5);
      trunk(c, m.x, top, ...bark);
      if (m.total === 0) continue;
      // a dappled crown, wider than tall, with branches showing through
      const R = 2.4 + m.v * 6;
      const cy = top - R * 0.45;
      canopy(c, r, m.x, cy, R, leaves, { gap: 0.12 });
      for (let k = 1; k < R; k++) { c.px(m.x - k * 0.8, top - k * 0.6, bark[0]); c.px(m.x + 1 + k * 0.9, top - k * 0.5, bark[1]); }
      // ripe persimmons: more fruit in busier months
      const n = Math.max(1, Math.round(m.v * 9));
      for (let k = 0; k < n; k++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R * 0.85;
        const fx = Math.round(m.x + Math.cos(a) * d * 1.1), fy = Math.round(cy + Math.sin(a) * d * 0.75);
        c.rect(fx, fy, 2, 2, '#f7a06e');
        c.px(fx, fy, '#ffc9a3');
        c.px(fx + 1, fy + 1, '#e98454');
        c.px(fx + 1, fy - 1, '#5f8f5a');
      }
    }
  },
  fall: { colors: ['#a5d8b6', '#ffc9a3'] },
};

export const THEMES = { sakura, wisteria, ajisai, ginkgo, kaki };
