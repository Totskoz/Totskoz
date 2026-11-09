// 山水 — ink-wash mountains. Each week of the year is a peak; taller = more commits.
import { rng, f, fmt, smooth, lerp, MONTHS, SERIF_CJK } from '../lib.js';

const W = 840, H = 320, BASE = 252;

function ridge(vals, { maxH, minH, dip, jag, seed, sub = 4 }) {
  const r = rng(seed), n = vals.length, pts = [];
  const x0 = -24, x1 = W + 24;
  for (let i = 0; i <= (n - 1) * sub; i++) {
    const t = i / sub, a = Math.floor(t), fr = t - a;
    const s = fr * fr * (3 - 2 * fr);
    let v = lerp(vals[a], vals[Math.min(a + 1, n - 1)], s);
    v *= 1 - dip * Math.sin(Math.PI * fr);
    const h = Math.max(0, v * maxH + (r() - 0.5) * jag * (0.25 + v) * maxH) + minH;
    pts.push([x0 + ((x1 - x0) * t) / (n - 1), BASE - h]);
  }
  // quadratic smoothing through midpoints: soft, brushy silhouette
  let d = `M${f(x0)},${BASE} L${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${f(pts[i][0])},${f(pts[i][1])} ${f(mx)},${f(my)}`;
  }
  const last = pts[pts.length - 1];
  return { d: `${d} L${f(last[0])},${f(last[1])} L${f(x1)},${BASE} Z`, pts, sub };
}

export default function shanshui(data) {
  const r = rng(7);
  const v = data.weekTotals.map((t) => Math.sqrt(t / data.maxWeek));
  const far = ridge(smooth(v, 6).map((x) => x * 0.9 + 0.12), { maxH: 120, minH: 18, dip: 0, jag: 0.1, seed: 11, sub: 2 });
  const mid = ridge(smooth(v, 2).map((x) => x * 0.95 + 0.05), { maxH: 150, minH: 10, dip: 0.08, jag: 0.14, seed: 23, sub: 3 });
  const near = ridge(smooth(v, 0), { maxH: 178, minH: 3, dip: 0.22, jag: 0.06, seed: 37 });

  const peak = data.weekTotals.indexOf(data.maxWeek);
  const xOf = (i) => -24 + ((W + 48) * i) / (v.length - 1);

  // 皴 texture strokes falling from the taller near peaks
  let cun = '';
  v.forEach((val, i) => {
    if (val < 0.3) return;
    const [px, py] = near.pts[i * near.sub];
    for (let k = 0; k < 3; k++) {
      const dx = (r() - 0.5) * 9, len = (BASE - py) * (0.25 + r() * 0.35);
      cun += `<path d="M${f(px + dx)},${f(py + 5 + r() * 6)} q${f(dx * 0.5 - 2)},${f(len / 2)} ${f(dx)},${f(len)}"/>`;
    }
  });

  // one bird per thousand contributions
  const nBirds = Math.max(1, Math.round(data.total / 1000));
  let birds = '';
  for (let i = 0; i < nBirds; i++) {
    const bx = 170 + (i % 5) * 26 + r() * 12, by = 52 + Math.floor(i / 5) * 16 + r() * 14, s = 3.5 + r() * 2.5;
    birds += `<path d="M${f(bx - s)},${f(by - s * 0.5)} q${f(s * 0.6)},${f(-s * 0.1)} ${f(s)},${f(s * 0.6)} q${f(s * 0.4)},${f(-s * 0.8)} ${f(s * 1.1)},${f(-s * 0.7)}"/>`;
  }

  let ripples = '';
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = BASE + 8 + r() * 40, len = 14 + r() * 46;
    ripples += `<path d="M${f(x)},${f(y)} h${f(len)}" opacity="${f(0.12 + r() * 0.2)}"/>`;
  }

  const months = data.monthStarts
    .filter((m) => xOf(m.week) > 20 && xOf(m.week) < W - 20)
    .map((m) => `<text x="${f(xOf(m.week))}" y="${H - 12}">${MONTHS[m.month].toUpperCase()}</text>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${data.login}'s year of commits as ink-wash mountains">
<defs>
  <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3ebd9"/><stop offset="1" stop-color="#e9dfc8"/></linearGradient>
  <linearGradient id="inkFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4a4f" stop-opacity=".34"/><stop offset="1" stop-color="#3b4a4f" stop-opacity="0"/></linearGradient>
  <linearGradient id="inkMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3336" stop-opacity=".6"/><stop offset=".7" stop-color="#2c3336" stop-opacity=".12"/><stop offset="1" stop-color="#2c3336" stop-opacity="0"/></linearGradient>
  <linearGradient id="inkNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#161412" stop-opacity=".96"/><stop offset=".5" stop-color="#1d1b18" stop-opacity=".62"/><stop offset="1" stop-color="#1d1b18" stop-opacity=".04"/></linearGradient>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .18  0 0 0 .16 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  <filter id="bleed" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="9"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
  <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
  <clipPath id="card"><rect width="${W}" height="${H}" rx="10"/></clipPath>
</defs>
<style>
  .mist{animation:drift 26s ease-in-out infinite alternate}
  .mist.b{animation-duration:38s;animation-direction:alternate-reverse}
  .boat{animation:sail 90s linear infinite}
  .birds{animation:fly 70s linear infinite}
  .sun{animation:breathe 9s ease-in-out infinite;transform-origin:center;transform-box:fill-box}
  @keyframes drift{from{transform:translateX(-40px)}to{transform:translateX(50px)}}
  @keyframes sail{from{transform:translateX(-60px)}to{transform:translateX(${W + 60}px)}}
  @keyframes fly{from{transform:translate(-160px,10px)}to{transform:translate(${W}px,-30px)}}
  @keyframes breathe{50%{transform:scale(1.05);opacity:.86}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <circle class="sun" cx="${f(Math.min(W - 150, Math.max(90, xOf(peak) - 70)))}" cy="74" r="27" fill="#c5362b" opacity=".92"/>
  <path d="${far.d}" fill="url(#inkFar)" filter="url(#bleed)"/>
  <ellipse class="mist" cx="300" cy="${BASE - 30}" rx="260" ry="16" fill="#f3ebd9" opacity=".8" filter="url(#soft)"/>
  <path d="${mid.d}" fill="url(#inkMid)" filter="url(#bleed)"/>
  <ellipse class="mist b" cx="560" cy="${BASE - 16}" rx="300" ry="14" fill="#f3ebd9" opacity=".85" filter="url(#soft)"/>
  <g filter="url(#bleed)">
    <path d="${near.d}" fill="url(#inkNear)"/>
    <g fill="none" stroke="#f3ebd9" stroke-width=".9" stroke-linecap="round" opacity=".3">${cun}</g>
  </g>
  <ellipse class="mist" cx="200" cy="${BASE - 2}" rx="340" ry="9" fill="#efe6d2" opacity=".9" filter="url(#soft)"/>
  <g stroke="#2c3336" stroke-width="1" stroke-linecap="round">${ripples}</g>
  <g class="boat"><g transform="translate(0 ${BASE + 20})" fill="#1d1b18">
    <path d="M-15,0 q15,6 31,0 l-4,4.5 h-23z"/><path d="M-1,-1 v-13 l8,11z" opacity=".85"/><path d="M-10,7 h22" stroke="#1d1b18" stroke-width=".8" opacity=".3"/>
  </g></g>
  <g class="birds" fill="none" stroke="#1d1b18" stroke-width="1.3" stroke-linecap="round">${birds}</g>
  <g font-family="ui-monospace,'SF Mono',Consolas,monospace" font-size="8.5" fill="#6b6152" letter-spacing="1.5" text-anchor="middle">${months}</g>
  <g font-family="${SERIF_CJK}" fill="#1d1b18">
    <text x="40" y="30" font-size="25" font-weight="700" writing-mode="vertical-rl" letter-spacing="5">一年山水</text>
    <text x="68" y="32" font-size="10.5" writing-mode="vertical-rl" letter-spacing="2.5" fill="#5b5346">${fmt(data.total)} contributions</text>
  </g>
  <g transform="translate(27 150)">
    <rect width="26" height="26" rx="3.5" fill="#c5362b"/>
    <text x="13" y="11.5" font-family="${SERIF_CJK}" font-size="10" font-weight="700" fill="#f3ebd9" text-anchor="middle">精</text>
    <text x="13" y="22.5" font-family="${SERIF_CJK}" font-size="10" font-weight="700" fill="#f3ebd9" text-anchor="middle">進</text>
  </g>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity=".55"/>
</g>
</svg>`;
}
