// 漫画 — the year as a manga page: focus lines, a shout panel, and a screentone calendar.
import { rng, f, fmt, niceDate, MONTHS, SANS_CJK } from '../lib.js';

const W = 840, H = 444;
const IMPACT = `Impact,'Haettenschweiler','Arial Narrow Bold','Arial Black',sans-serif`;

function focusLines(cx, cy, seed, n = 84) {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ((i + r() * 0.8) / n) * Math.PI * 2, w = 0.006 + r() * 0.02;
    const rin = 78 + r() * 62, R = 640;
    const p = (ang, rad) => `${f(cx + Math.cos(ang) * rad * 1.75)},${f(cy + Math.sin(ang) * rad)}`;
    d += `M${p(a - w, R)}L${p(a, rin)}L${p(a + w, R)}Z`;
  }
  return d;
}

function burst(cx, cy, rx, ry, seed, spikes = 18) {
  const r = rng(seed), pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2, k = i % 2 ? 0.66 + r() * 0.1 : 0.94 + r() * 0.22;
    pts.push(`${f(cx + Math.cos(a) * rx * k)},${f(cy + Math.sin(a) * ry * k)}`);
  }
  return pts.join(' ');
}

export default function manga(data) {
  const A = '12,12 524,12 494,252 12,252', B = '538,12 828,12 828,252 508,252';
  const cx = 262, cy = 138;

  // screentone calendar: dot size carries the count
  const cell = 14, gx = 50, gy = 316;
  let dots = '', hot = '';
  data.weeks.forEach((w, i) =>
    w.forEach((d) => {
      const x = gx + i * cell, y = gy + d.weekday * cell;
      if (d.level === 0) dots += `<circle cx="${x}" cy="${y}" r="1" fill="#b9b9b9"/>`;
      else if (d.level === 4) hot += `<circle class="p${(i + d.weekday) % 4}" cx="${x}" cy="${y}" r="6.6"/>`;
      else dots += `<circle cx="${x}" cy="${y}" r="${[0, 2.4, 3.9, 5.3][d.level]}"/>`;
    })
  );
  const months = data.monthStarts
    .filter((m) => m.week < data.weeks.length - 4)
    .map((m) => `<text x="${gx + m.week * cell - 5}" y="${gy + 7 * cell + 8}">${MONTHS[m.month].toUpperCase()}</text>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${data.login}'s year of commits as a manga page">
<defs>
  <clipPath id="ca"><polygon points="${A}"/></clipPath>
  <clipPath id="cb"><polygon points="${B}"/></clipPath>
  <pattern id="tone" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="2.5" cy="2.5" r="1" fill="#111"/></pattern>
  <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
  <mask id="toneMask"><rect width="${W}" height="${H}" fill="#000"/><rect x="12" y="266" width="816" height="166" fill="url(#fade)"/></mask>
</defs>
<style>
  .la{animation:flick .56s steps(1) infinite}
  .lb{animation:flick .56s steps(1) infinite -.28s}
  .sfx{animation:shake .32s steps(2) infinite;transform-origin:center;transform-box:fill-box}
  .num{animation:punch 2.8s cubic-bezier(.2,1.6,.4,1) infinite;transform-origin:center;transform-box:fill-box}
  .p0,.p1,.p2,.p3{animation:pop 2.4s ease-in-out infinite;transform-origin:center;transform-box:fill-box}
  .p1{animation-delay:-.6s}.p2{animation-delay:-1.2s}.p3{animation-delay:-1.8s}
  @keyframes flick{0%{opacity:1}50%{opacity:0}}
  @keyframes shake{0%{transform:translate(0,0) rotate(0)}50%{transform:translate(1.5px,-1px) rotate(.6deg)}}
  @keyframes punch{0%,70%,100%{transform:scale(1)}78%{transform:scale(1.07)}}
  @keyframes pop{50%{transform:scale(.72)}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}.lb{opacity:0}}
</style>
<rect width="${W}" height="${H}" rx="6" fill="#fbfaf6"/>

<!-- panel A: the total -->
<g clip-path="url(#ca)">
  <rect width="540" height="260" fill="#fff"/>
  <path class="la" d="${focusLines(cx, cy, 3)}" fill="#111"/>
  <path class="lb" d="${focusLines(cx, cy, 8)}" fill="#111"/>
  <g class="num" text-anchor="middle" font-family="${IMPACT}" font-style="italic" fill="#111" stroke="#fff" stroke-linejoin="round" paint-order="stroke">
    <text x="${cx}" y="${cy + 26}" font-size="92" stroke-width="12" transform="rotate(-4 ${cx} ${cy})">${fmt(data.total)}</text>
    <text x="${cx + 6}" y="${cy + 58}" font-size="21" stroke-width="7" letter-spacing="5" transform="rotate(-4 ${cx} ${cy})">CONTRIBUTIONS!!</text>
  </g>
  <text class="sfx" x="30" y="62" font-family="${SANS_CJK}" font-weight="900" font-size="46" fill="#111" stroke="#fff" stroke-width="8" stroke-linejoin="round" paint-order="stroke" transform="rotate(-9 30 62)">ドドドド</text>
  <text class="sfx" x="398" y="238" font-family="${SANS_CJK}" font-weight="900" font-size="30" fill="#111" stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke" transform="rotate(7 398 238)">ゴゴゴ</text>
</g>
<polygon points="${A}" fill="none" stroke="#111" stroke-width="3.5" stroke-linejoin="miter"/>

<!-- panel B: best day -->
<g clip-path="url(#cb)">
  <rect x="500" width="340" height="260" fill="#111"/>
  <rect x="500" width="340" height="260" fill="url(#tone)" opacity=".0"/>
  <polygon class="num" points="${burst(660, 118, 122, 88, 5)}" fill="#fff"/>
  <g text-anchor="middle" font-family="${IMPACT}" font-style="italic" fill="#111">
    <text x="658" y="136" font-size="70">${fmt(data.bestDay.count)}</text>
    <text x="660" y="158" font-size="14" letter-spacing="3">IN A SINGLE DAY</text>
  </g>
  <text x="806" y="30" font-family="${SANS_CJK}" font-weight="900" font-size="21" fill="#fff" writing-mode="vertical-rl" letter-spacing="4">限界突破</text>
  <g transform="translate(530 208)">
    <rect width="170" height="30" fill="#fff" stroke="#111" stroke-width="2"/>
    <text x="10" y="20" font-family="${SANS_CJK}" font-weight="700" font-size="13" fill="#111">最高記録 — ${niceDate(data.bestDay.date)}</text>
  </g>
</g>
<polygon points="${B}" fill="none" stroke="#111" stroke-width="3.5"/>

<!-- panel C: the calendar as screentone -->
<rect x="12" y="266" width="816" height="166" fill="#fff"/>
<rect x="12" y="266" width="816" height="166" fill="url(#tone)" opacity=".2" mask="url(#toneMask)"/>
<g fill="#111">${dots}${hot}</g>
<g font-family="${IMPACT}" font-size="9.5" fill="#555" letter-spacing="1.2">${months}</g>
<rect x="12" y="266" width="816" height="166" fill="none" stroke="#111" stroke-width="3.5"/>
<g transform="translate(30 255)">
  <rect width="318" height="42" fill="#fff" stroke="#111" stroke-width="2"/>
  <text x="12" y="18" font-family="${SANS_CJK}" font-weight="700" font-size="13" fill="#111">この一年、${data.activeDays}日コードを書いた。</text>
  <text x="12" y="34" font-family="Georgia,serif" font-style="italic" font-size="11" fill="#444">${data.activeDays} days with ink on the page · longest streak ${data.longest}</text>
</g>
<g transform="translate(728 276)">
  <rect width="86" height="24" fill="#111"/>
  <text x="43" y="16.5" text-anchor="middle" font-family="${IMPACT}" font-size="12" fill="#fff" letter-spacing="1.5">@${data.login.toUpperCase()}</text>
</g>
<text x="816" y="426" text-anchor="end" font-family="${SANS_CJK}" font-weight="700" font-size="11" fill="#111">つづく…</text>
</svg>`;
}
