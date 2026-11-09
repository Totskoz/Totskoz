// 花見 — pixel-art cherry blossom park. One sakura tree per month (fuller bloom = more
// commits), the calendar is a petal-strewn lawn, cats nap under the three busiest months,
// and a little sprout spirit bounces on your single best day.
import { rng, fmt, MONTHS } from '../lib.js';

const PW = 212, PH = 91, S = 4; // pixel grid, scale
const GROUND = 55, GRID_Y = 62;

// ---- tiny pixel canvas -------------------------------------------------------
class Canvas {
  constructor(w, h) { this.w = w; this.h = h; this.p = Array.from({ length: h }, () => Array(w).fill(null)); }
  px(x, y, c) { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y][x] = c; }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); }
  sprite(x, y, rows, pal) { rows.forEach((row, j) => [...row].forEach((ch, i) => this.px(x + i, y + j, pal[ch]))); }
  text(x, y, str, c, scale = 1) {
    let cx = x;
    for (const ch of str.toUpperCase()) {
      const g = FONT[ch];
      if (g) for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j * 3 + i] === '1') this.rect(cx + i * scale, y + j * scale, scale, scale, c);
      cx += 4 * scale;
    }
  }
  svg() { // run-length rows, one <path> per colour
    const by = {};
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; ) {
        const c = this.p[y][x];
        let n = 1;
        while (x + n < this.w && this.p[y][x + n] === c) n++;
        if (c) (by[c] ||= []).push(`M${x} ${y}h${n}v1h-${n}z`);
        x += n;
      }
    }
    return Object.entries(by).map(([c, d]) => `<path fill="${c}" d="${d.join('')}"/>`).join('');
  }
}
const draw = (w, h, fn) => { const c = new Canvas(w, h); fn(c); return c.svg(); };
const textW = (s, scale = 1) => s.length * 4 * scale - scale;

const FONT = Object.fromEntries(Object.entries({
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111',
  9: '111101111001110', ',': '000000000010100', '.': '000000000000010', '-': '000000111000000', '!': '010010010000010',
  '+': '000010111010000', ':': '000010000010000',
}));

// ---- sprites -----------------------------------------------------------------
const CAT_SIT = [
  '.#.....#...',
  '.##...##...',
  '.##s#s##...',
  '.#e###e#...',
  '.###n###...',
  '..#www#.....',
  '.##www##....',
  '.##www##....',
  '.########...',
  '.##.#.##....',
];
const TAIL_UP = ['..#', '..#', '.##'];
const TAIL_DOWN = ['....', '....', '.###'];
const CAT_LOAF = [
  '.#..#.......',
  '.####.#####.',
  '#u##u#######',
  '##n#########',
  '############',
  '.##########.',
];
const ZZZ = ['##.', '.#.', '.##'];
const BIRD_A = ['#...#', '.#.#.', '..#..'];
const BIRD_B = ['.....', '##.##', '..#..'];
const FLY_A = ['#.#', '.#.'];
const FLY_B = ['.#.', '.#.'];
const CAT_WALK_BODY = [
  '#.........#.#.',
  '#.........####',
  '.#........#e#n',
  '..###s#s#####.',
  '..##########..',
  '..#wwwwwww##..',
];
const LEGS_A = ['..#.#....#.#..', '..#.#....#.#..'];
const LEGS_B = ['...##....##...', '..#..#..#..#..'];
const SPIRIT = ['...g...', '..gg...', '.#####.', '#e###e#', '#c###c#', '.#####.'];
const CLOUD = ['....###......', '..#######.##.', '.############', '#############', '.###########.'];

const COATS = [
  { '#': '#f2a154', s: '#d97b34', w: '#fff3e0', e: '#3a2a2a', n: '#ff8fa3' }, // orange tabby
  { '#': '#fffaf2', s: '#fffaf2', w: '#ffffff', e: '#3a2a2a', n: '#ff8fa3' }, // white
  { '#': '#4b4658', s: '#35313f', w: '#6a6478', e: '#ffe27a', n: '#ff8fa3' }, // black
  { '#': '#a9a4b8', s: '#7d7890', w: '#f4f1fa', e: '#3a2a2a', n: '#ff8fa3' }, // grey tabby
];

// night theme: the day scene is drawn first, then every colour is swapped through this map
const NIGHT = {
  '#bfe4f6': '#0f1433', '#cdeaf7': '#141a3d', '#dff0f8': '#1a2048', '#f1eef6': '#232654', '#fbe6ee': '#2d2b5e', '#fcd8e4': '#3a3168',
  '#fffbe6': '#f6f2dc', '#fff3c9': '#c9c6de', '#ffffff': '#d6d4f0', '#aaa6d6': '#34336e', '#bcb8e2': '#414084',
  '#b9dfb0': '#1d3848', '#8fcf8a': '#1a4743', '#7cc47a': '#1e5646', '#a4dd97': '#2c6e57', '#6ab36b': '#174739',
  '#5a9f5c': '#12352f', '#6fb86c': '#1b4a3f', '#83c97c': '#235748',
  '#fbd9e5': '#66487a', '#f8b1c9': '#a55f9a', '#ef82aa': '#cf6aa6', '#d9548b': '#ffb3d9', '#4b4658': '#6f6a88', '#35313f': '#55506c', '#6a6478': '#8a85a2',
  '#ffd9e6': '#f3b4d2', '#f8a8c4': '#c97fae', '#e0749f': '#8d4f8c', '#c95a8a': '#653a76', '#fff4f8': '#ffe9f4',
  '#7a4a3a': '#3b2b3c', '#5c3528': '#2a1e2e', '#2f6b3f': '#7fc9a0',
  '#e58aae': '#6f4686', '#b0527d': '#f3a6c8', '#f3b6cd': '#553a70',
  '#7a74a6': '#090c22', '#f2b632': '#ffe98a', '#9d8ff0': '#b8ffb0', '#8a86b8': '#b9b6e6',
};
const recolor = (svg, map) => svg.replace(/fill="(#[0-9a-f]{6})"/g, (m, c) => `fill="${map[c] || c}"`);

const LAWN = ['#6fb86c', '#fbd9e5', '#f8b1c9', '#ef82aa', '#d9548b'];

export default function hanami(data, theme = 'day') {
  const night = theme === 'night';
  const r = rng(52);

  // months → trees
  const months = [];
  data.weeks.forEach((w, wi) => w.forEach((d) => {
    const key = d.date.slice(0, 7);
    let m = months.at(-1);
    if (!m || m.key !== key) months.push((m = { key, month: +key.slice(5) - 1, total: 0, wsum: 0, n: 0 }));
    m.total += d.count; m.wsum += wi; m.n++;
  }));
  const maxMonth = Math.max(...months.map((m) => m.total), 1);
  months.forEach((m) => { m.x = Math.round((m.wsum / m.n) * 4 + 1); m.v = Math.sqrt(m.total / maxMonth); });
  const busiest = [...months].sort((a, b) => b.total - a.total).slice(0, 3);

  const lamps = [];
  // ---- static scene ----
  const scene = draw(PW, PH, (c) => {
    // banded sky with dithered seams
    const bands = [['#bfe4f6', 9], ['#cdeaf7', 9], ['#dff0f8', 9], ['#f1eef6', 9], ['#fbe6ee', 9], ['#fcd8e4', 10]];
    let y = 0;
    bands.forEach(([col, h], bi) => {
      c.rect(0, y, PW, h, col);
      if (bi) for (let x = 0; x < PW; x += 2) c.px(x + (bi % 2), y, bands[bi - 1][0]);
      y += h;
    });
    if (night) for (let i = 0; i < 70; i++) c.px(r() * PW, r() * 44, r() < 0.3 ? '#fdfdff' : '#9a98cc');
    // sun
    for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) if (i * i + j * j <= 50) c.px(150 + i, 14 + j, i * i + j * j <= 30 ? '#fffbe6' : '#fff3c9');
    // far mountain with snow cap
    for (let j = 0; j < 30; j++) {
      const half = Math.round(j * 1.5 + (j > 6 ? Math.sin(j) * 1.2 : 0));
      for (let i = -half; i <= half; i++) c.px(118 + i, 26 + j, j < 6 + (Math.abs(i) % 3) ? '#ffffff' : i > half * 0.2 ? '#aaa6d6' : '#bcb8e2');
    }
    // rolling hills + hedge
    for (let x = 0; x < PW; x++) {
      const h1 = Math.round(8 + 5 * Math.sin(x / 23) + 3 * Math.sin(x / 9 + 1));
      c.rect(x, GROUND - h1, 1, h1, '#b9dfb0');
      const h2 = Math.round(3 + 1.6 * Math.sin(x / 5) + 1.2 * Math.sin(x / 2.3));
      c.rect(x, GROUND - h2, 1, h2, '#8fcf8a');
    }
    // grass strip
    c.rect(0, GROUND, PW, GRID_Y - GROUND, '#7cc47a');
    c.rect(0, GROUND, PW, 1, '#a4dd97');
    for (let i = 0; i < 26; i++) c.px(r() * PW, GROUND + 1, r() < 0.4 ? '#fbd9e5' : '#6ab36b');

    // trees
    for (const m of months) {
      const th = Math.round(8 + m.v * 6), top = GROUND - th;
      c.rect(m.x, top, 2, th + 1, '#7a4a3a');
      c.rect(m.x + 1, top + 2, 1, th - 1, '#5c3528');
      // fork
      c.px(m.x - 1, top, '#7a4a3a'); c.px(m.x - 2, top - 1, '#7a4a3a'); c.px(m.x - 3, top - 2, '#7a4a3a');
      c.px(m.x + 2, top, '#5c3528'); c.px(m.x + 3, top - 1, '#5c3528'); c.px(m.x + 4, top - 3, '#5c3528'); c.px(m.x + 3, top - 2, '#5c3528');
      c.px(m.x, top - 1, '#7a4a3a'); c.px(m.x, top - 2, '#7a4a3a');
      if (m.total === 0) continue;
      if (night && m.v > 0.25) lamps.push([m.x - 3, top - 1]);
      const R = 2.6 + m.v * 6.4, cy = top - R * 0.55;
      const blobs = [[0.5, 0, 1], [-R * 0.62, R * 0.32, 0.68], [R * 0.66, R * 0.3, 0.7], [R * 0.15, -R * 0.5, 0.66]];
      for (const [bx, by, k] of blobs) {
        const rr = R * k;
        for (let j = -Math.ceil(rr); j <= Math.ceil(rr); j++) for (let i = -Math.ceil(rr); i <= Math.ceil(rr); i++) {
          const dd = (i * i + j * j) / (rr * rr);
          if (dd > 1) continue;
          const light = (-i * 0.6 - j * 0.8) / rr + (r() - 0.5) * 0.5;
          const col = r() < 0.05 ? '#fff4f8' : light > 0.32 ? '#ffd9e6' : light < -0.4 ? '#e0749f' : '#f8a8c4';
          c.px(m.x + bx + i, cy + by + j, dd > 0.86 && light < -0.2 ? '#c95a8a' : col);
        }
      }
    }
    // months with no bloom still get a label
    let lastRight = -9;
    for (const m of months) {
      const lx = m.x + 1 - Math.floor(textW('JAN') / 2);
      if (m.n < 15 || lx < 1 || lx + 11 > PW - 1 || lx < lastRight + 3) continue;
      c.text(lx, GROUND + 1, MONTHS[m.month], '#2f6b3f');
      lastRight = lx + 11;
    }

    // the lawn: one tile per day
    c.rect(0, GRID_Y - 1, PW, PH - GRID_Y + 1, '#5a9f5c');
    data.weeks.forEach((w, i) => w.forEach((d) => {
      const x = i * 4, yy = GRID_Y + d.weekday * 4;
      c.rect(x, yy, 3, 3, LAWN[d.level]);
      if (d.level === 0 && r() < 0.25) c.px(x + (r() < 0.5 ? 0 : 2), yy + 1, '#83c97c');
      if (d.level >= 3) c.px(x, yy, '#fff4f8');
    }));

    // title
    const name = data.login.toUpperCase();
    c.text(7, 6, name, '#e58aae', 2);
    c.text(6, 5, name, '#ffffff', 2);
    const num = fmt(data.total);
    c.text(7, 20, num, '#f3b6cd', 2);
    c.text(6, 19, num, '#b0527d', 2);
    c.text(6 + textW(num, 2) + 4, 24, 'CONTRIBUTIONS', '#b0527d');
    c.sprite(170, 6, CLOUD, { '#': '#ffffff' });
  });

  // ---- animated bits ----
  const sitCat = (m, i, extra) => {
    const pal = COATS[i];
    const body = draw(12, 10, (c) => c.sprite(0, 0, CAT_SIT, pal));
    const tails = `<g class="ta" transform="translate(8 5)">${draw(4, 3, (c) => c.sprite(0, 0, TAIL_UP, pal))}</g><g class="tb" transform="translate(8 5)">${draw(4, 3, (c) => c.sprite(0, 0, TAIL_DOWN, pal))}</g>`;
    const blink = `<path class="blink k${i}" fill="${pal['#']}" d="M2 3h1v1h-1zM6 3h1v1h-1z"/>`;
    return `<g transform="translate(${m.x + 4} ${GROUND - 9})">${body}${tails}${blink}${extra(pal)}</g>`;
  };
  const cats = [
    // busiest month: batting at a petal
    sitCat(busiest[0], 0, (pal) => `<g class="paw"><path fill="${pal['#']}" d="M0 5h1v2h-1z"/><path fill="#f8a8c4" d="M-1 3h1v1h-1z"/></g>`),
    // second: asleep in a loaf
    busiest[1] ? `<g transform="translate(${busiest[1].x + 4} ${GROUND - 5})">${draw(12, 6, (c) => c.sprite(0, 0, CAT_LOAF, { ...COATS[1], u: '#3a2a2a' }))}<g class="zz" transform="translate(-3 -4)">${draw(3, 3, (c) => c.sprite(0, 0, ZZZ, { '#': '#8a86b8' }))}</g></g>` : '',
    // third: just watching, tail flicking
    busiest[2] ? sitCat(busiest[2], 2, () => '') : '',
  ].join('');

  const flock = [[0, 3], [8, 7], [15, 1], [24, 6]].map(([x, y]) => `<g transform="translate(${x} ${y})"><g class="fa">${draw(5, 3, (c) => c.sprite(0, 0, BIRD_A, { '#': '#7a74a6' }))}</g><g class="fb">${draw(5, 3, (c) => c.sprite(0, 0, BIRD_B, { '#': '#7a74a6' }))}</g></g>`).join('');
  const birds = `<g class="birds">${flock}</g>`;
  const fly = (cls, x, y, col) => `<g transform="translate(${x} ${y})"><g class="${cls}"><g class="fa">${draw(3, 2, (c) => c.sprite(0, 0, FLY_A, { '#': col }))}</g><g class="fb">${draw(3, 2, (c) => c.sprite(0, 0, FLY_B, { '#': col }))}</g></g></g>`;
  const quiet = months.filter((m) => m.x > 30 && m.x < 150);
  const butterflies = fly('bf0', (quiet[1]?.x ?? 60) + 5, GROUND - 6, '#f2b632') + fly('bf1', (quiet[3]?.x ?? 100) + 6, GROUND - 8, '#9d8ff0');

  const coat = COATS[3];
  const walker = `<g class="walk"><g transform="translate(0 ${GROUND - 7})">${draw(14, 6, (c) => c.sprite(0, 0, CAT_WALK_BODY, coat))}<g class="fa" transform="translate(0 6)">${draw(14, 2, (c) => c.sprite(0, 0, LEGS_A, coat))}</g><g class="fb" transform="translate(0 6)">${draw(14, 2, (c) => c.sprite(0, 0, LEGS_B, coat))}</g></g></g>`;

  const bw = data.weeks.findIndex((w) => w.some((d) => d.date === data.bestDay.date));
  const sx = Math.min(PW - 8, Math.max(0, bw * 4 - 2)), sy = GRID_Y + data.bestDay.weekday * 4 - 5;
  const spirit = `<g transform="translate(${sx} ${sy})"><g class="hop">${draw(7, 6, (c) => c.sprite(0, 0, SPIRIT, { '#': '#fffdf5', e: '#3a2a2a', c: '#ffb3c7', g: '#5fae5a' }))}</g></g>`;

  // petals fall from the trees that are actually in bloom
  const bloom = months.filter((m) => m.total > 0);
  let petals = '';
  for (let i = 0; i < 44; i++) {
    let pick = r() * bloom.reduce((a, m) => a + m.v, 0), m = bloom[0];
    for (const b of bloom) { pick -= b.v; if (pick <= 0) { m = b; break; } }
    const x = Math.round(m.x + (r() - 0.5) * 16), y = Math.round(GROUND - 16 - m.v * 12 + r() * 8);
    petals += `<rect class="f${i % 4}" x="${x}" y="${y}" width="1" height="1" fill="${r() < 0.4 ? '#fff4f8' : '#f8a8c4'}" style="animation-delay:-${(r() * 12).toFixed(1)}s"/>`;
  }

  const lanterns = lamps.map(([x, y], i) => `<g transform="translate(${x} ${y})"><rect class="glow g${i % 3}" x="-3" y="-2" width="8" height="8" fill="#ffb14a" opacity=".22"/><path fill="#5a3a2a" d="M0 0h2v1h-2z"/><path fill="#ffd27a" d="M0 1h2v2h-2z"/><path fill="#ff8a3c" d="M0 3h2v1h-2z"/></g>`).join('');
  const twinkles = night ? Array.from({ length: 14 }, (_, i) => `<rect class="tw g${i % 3}" x="${Math.round(r() * 140)}" y="${Math.round(r() * 30)}" width="1" height="1" fill="#fdfdff"/>`).join('') : '';

  const cloud = `<g class="cloud" transform="translate(0 20)">${draw(13, 5, (c) => c.sprite(0, 0, CLOUD, { '#': '#ffffff' }))}</g>`;

  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}" width="${PW * S}" height="${PH * S}" shape-rendering="crispEdges" role="img" aria-label="${data.login}'s year of commits as a pixel-art cherry blossom park with cats">
<defs><clipPath id="card"><rect width="${PW}" height="${PH}" rx="2"/></clipPath></defs>
<style>
  .f0,.f1,.f2,.f3{animation:fall0 9s steps(36) infinite}
  .f1{animation-name:fall1;animation-duration:12s}.f2{animation-name:fall2;animation-duration:10s}.f3{animation-name:fall1;animation-duration:14s}
  @keyframes fall0{0%{transform:translate(0,0);opacity:0}8%{opacity:1}85%{opacity:1}100%{transform:translate(9px,36px);opacity:0}}
  @keyframes fall1{0%{transform:translate(0,0);opacity:0}8%{opacity:1}85%{opacity:1}100%{transform:translate(-7px,38px);opacity:0}}
  @keyframes fall2{0%{transform:translate(0,0);opacity:0}8%{opacity:1}85%{opacity:1}100%{transform:translate(14px,34px);opacity:0}}
  .walk{animation:walk 48s steps(250) infinite}
  @keyframes walk{from{transform:translateX(-20px)}to{transform:translateX(${PW + 6}px)}}
  .fa{animation:frame .5s steps(1) infinite}.fb{animation:frame .5s steps(1) infinite -.25s}
  @keyframes frame{0%{opacity:1}50%{opacity:0}}
  .hop{animation:hop .9s steps(1) infinite}
  @keyframes hop{0%{transform:translateY(0)}35%{transform:translateY(-1px)}50%{transform:translateY(-2px)}65%{transform:translateY(-1px)}80%{transform:translateY(0)}}
  .blink{opacity:0;animation:blink 5s steps(1) infinite}.k1{animation-delay:-1.7s}.k2{animation-delay:-3.1s}
  @keyframes blink{0%{opacity:0}92%{opacity:1}97%{opacity:0}}
  .ta{animation:tailA 3.6s steps(1) infinite}.tb{animation:tailB 3.6s steps(1) infinite}
  @keyframes tailA{0%{opacity:1}72%{opacity:0}86%{opacity:1}}
  @keyframes tailB{0%{opacity:0}72%{opacity:1}86%{opacity:0}}
  .paw{opacity:0;animation:paw 4.2s steps(1) infinite}
  @keyframes paw{0%{opacity:0}40%{opacity:1}50%{opacity:0}60%{opacity:1}70%{opacity:0}}
  .zz{animation:zz 3.2s steps(4) infinite}
  @keyframes zz{0%{transform:translate(-3px,-4px);opacity:0}25%{opacity:1}100%{transform:translate(-6px,-10px);opacity:0}}
  .birds{animation:birds 75s steps(300) infinite}
  @keyframes birds{from{transform:translate(${PW + 8}px,22px)}to{transform:translate(-40px,6px)}}
  .bf0{animation:bf 7s steps(1) infinite}.bf1{animation:bf 9s steps(1) infinite reverse}
  @keyframes bf{0%{transform:translate(0,0)}14%{transform:translate(2px,-2px)}28%{transform:translate(5px,-1px)}42%{transform:translate(7px,-4px)}57%{transform:translate(4px,-6px)}71%{transform:translate(1px,-4px)}85%{transform:translate(-1px,-2px)}}
  .glow{animation:glow 2.4s steps(3) infinite}.tw{animation:glow 3.3s steps(2) infinite}.g1{animation-delay:-.8s}.g2{animation-delay:-1.6s}
  @keyframes glow{50%{opacity:.08}}
  .cloud{animation:cloud 110s steps(240) infinite}
  @keyframes cloud{0%{transform:translate(92px,27px);opacity:0}6%{opacity:1}100%{transform:translate(${PW + 4}px,27px);opacity:1}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}.fb,.tb{opacity:0}}
</style>
<g clip-path="url(#card)">
${scene}
${twinkles}
${cloud}
${birds}
${butterflies}
${cats}
${lanterns}
${walker}
<g>${petals}</g>
${spirit}
</g>
</svg>`;
  return night ? recolor(out, NIGHT) : out;
}
