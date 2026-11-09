// 灯籠 — lantern festival. One sky lantern per week; the more commits, the higher and
// brighter it floats. Weeks with nothing leave an unlit lantern resting on the water.
import { rng, f, fmt, MONTHS, SERIF_CJK } from '../lib.js';

const W = 840, H = 330, SHORE = 252;

export default function lanterns(data) {
  const r = rng(21);
  const n = data.weekTotals.length;
  const xOf = (i) => 34 + (i * (W - 68)) / (n - 1);

  let stars = '';
  for (let i = 0; i < 90; i++) {
    stars += `<circle class="t${i % 4}" cx="${f(r() * W)}" cy="${f(r() * 190)}" r="${f(0.4 + r() * 0.9)}" opacity="${f(0.25 + r() * 0.6)}"/>`;
  }

  let lit = '', refl = '', unlit = '';
  data.weekTotals.forEach((t, i) => {
    const x = xOf(i);
    if (t === 0) {
      unlit += `<path d="M${f(x - 4)},${SHORE + 6} h8 l-1.2,5 h-5.6z"/>`;
      return;
    }
    const v = Math.sqrt(t / data.maxWeek);
    const s = 0.62 + v * 0.75, y = SHORE - 22 - v * 178 + (r() - 0.5) * 10;
    const sway = (r() - 0.5) * 6;
    lit += `<g transform="translate(${f(x)} ${f(y)})"><g class="b${i % 5}"><circle r="${f(15 + v * 26)}" fill="url(#glow)" opacity="${f(0.35 + v * 0.55)}"/><g transform="scale(${f(s)}) rotate(${f(sway)})"><path d="M-5.2,-8 h10.4 l2.3,13.5 q-7.5,3 -15,0z" fill="url(#paperL)"/><path d="M-5.2,-8 h10.4" stroke="#7a2c12" stroke-width="1.3"/><ellipse cy="5.6" rx="3" ry="1.5" fill="#fff6c9"/></g></g></g>`;
    const ry = 4 + v * 17;
    refl += `<ellipse class="w${i % 3}" cx="${f(x)}" cy="${f(SHORE + 6 + ry * 0.8)}" rx="${f(2 + v * 3)}" ry="${f(ry)}" opacity="${f(0.12 + v * 0.4)}"/>`;
  });

  const months = data.monthStarts
    .filter((m) => m.week > 0 && m.week < n - 3)
    .map((m) => `<text x="${f(xOf(m.week))}" y="${H - 11}">${MONTHS[m.month].toUpperCase()}</text>`)
    .join('');

  // distant hills
  let hills = `M0,${SHORE}`;
  for (let x = 0; x <= W; x += 20) hills += ` L${x},${f(SHORE - 10 - 16 * Math.abs(Math.sin(x / 97)) - 9 * Math.sin(x / 31) ** 2)}`;
  hills += ` L${W},${SHORE}Z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${data.login}'s year of commits as floating lanterns">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b1f"/><stop offset=".62" stop-color="#1a1740"/><stop offset=".78" stop-color="#3a2150"/><stop offset=".78" stop-color="#0b0d22"/><stop offset="1" stop-color="#05060f"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#ffb347" stop-opacity=".85"/><stop offset=".4" stop-color="#ff7a2f" stop-opacity=".28"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
  <linearGradient id="paperL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2562a"/><stop offset=".6" stop-color="#ff9f3f"/><stop offset="1" stop-color="#ffe08a"/></linearGradient>
  <radialGradient id="moonG"><stop offset=".8" stop-color="#f5ecd2"/><stop offset="1" stop-color="#f5ecd2" stop-opacity="0"/></radialGradient>
  <clipPath id="card"><rect width="${W}" height="${H}" rx="10"/></clipPath>
</defs>
<style>
  .b0,.b1,.b2,.b3,.b4{animation:bob 7s ease-in-out infinite}
  .b1{animation-delay:-1.4s;animation-duration:8s}.b2{animation-delay:-2.8s}.b3{animation-delay:-4.2s;animation-duration:9s}.b4{animation-delay:-5.6s}
  .w0,.w1,.w2{animation:shim 4s ease-in-out infinite;transform-origin:center;transform-box:fill-box}
  .w1{animation-delay:-1.3s}.w2{animation-delay:-2.6s}
  .t0,.t1,.t2,.t3{animation:twinkle 6s ease-in-out infinite}
  .t1{animation-delay:-1.5s}.t2{animation-delay:-3s}.t3{animation-delay:-4.5s}
  @keyframes bob{0%,100%{transform:translate(0,0)}50%{transform:translate(2px,-6px)}}
  @keyframes shim{50%{transform:scaleX(1.7);opacity:.12}}
  @keyframes twinkle{50%{opacity:.15}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <g fill="#fff">${stars}</g>
  <circle cx="712" cy="62" r="30" fill="url(#moonG)"/>
  <circle cx="712" cy="62" r="60" fill="#f5ecd2" opacity=".05"/>
  <path d="${hills}" fill="#0a0b1c"/>
  <!-- torii standing in the shallows -->
  <g transform="translate(92 ${SHORE + 8})" fill="#9c1f1a">
    <path d="M-27,-52 q27,7 54,0 l2,6 q-29,7 -58,0z"/><rect x="-22" y="-39" width="44" height="3.6"/>
    <path d="M-17,-46 h4.5 l1.5,48 h-7.5z M12.5,-46 h4.5 l1.5,48 h-7.5z"/>
    <g opacity=".22"><rect x="-18" y="3" width="6" height="22"/><rect x="12" y="3" width="6" height="22"/></g>
  </g>
  <g fill="#ffa64a">${refl}</g>
  <g fill="#2a2a4a">${unlit}</g>
  ${lit}
  <g font-family="ui-monospace,'SF Mono',Consolas,monospace" font-size="8.5" fill="#6f6a94" letter-spacing="1.5" text-anchor="middle">${months}</g>
  <text x="${W - 30}" y="112" font-family="${SERIF_CJK}" font-size="23" font-weight="700" fill="#f5ecd2" writing-mode="vertical-rl" letter-spacing="6">灯籠流し</text>
  <text x="24" y="28" font-family="Georgia,serif" font-style="italic" font-size="12.5" fill="#b9b3d6">one lantern per week — ${fmt(data.total)} contributions lit by @${data.login}</text>
</g>
</svg>`;
}
