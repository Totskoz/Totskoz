// 青海波 — the year as an indigo wave print. Every scale is one day, read like text:
// left to right, top to bottom. Brighter crests = busier days. Koi drift across.
import { f, fmt, SERIF_CJK } from '../lib.js';

const W = 840, H = 264, COLS = 28, SX = 30, SY = 15, R = 15.6;
const FILL = ['#16224a', '#1f3a78', '#3767a8', '#8fb6d6', '#f2e8d0'];
const RING = ['#5d77b3', '#9db8e0', '#dbe7f3', '#1f3a78', '#1f3a78'];
const RING_O = [0.28, 0.5, 0.6, 0.7, 0.8];

const koi = (id, spots) => `<g id="${id}">
  <path d="M-13,0 l-9,-6 q3,6 0,12z" fill="#f4eee2"/>
  <path d="M2,-5 l-4,-6 q6,1 8,5z M2,5 l-4,6 q6,-1 8,-5z" fill="#f4eee2" opacity=".8"/>
  <path d="M16,0 C12,-6 -4,-6.5 -14,0 C-4,6.5 12,6 16,0Z" fill="#f7f2e8"/>
  ${spots}
</g>`;

export default function seigaiha(data) {
  const rows = Math.ceil(data.days.length / COLS);
  const waveH = (rows - 1) * SY + R;
  let scales = '';
  for (let row = 0; row < rows; row++) {
    for (let col = -1; col <= COLS; col++) {
      const idx = row * COLS + col;
      const d = col >= 0 && col < COLS ? data.days[idx] : null;
      const lv = d ? d.level : 0;
      const x = col * SX + (row % 2 ? SX / 2 : 0) + SX / 2, y = row * SY + R;
      const shimmer = lv >= 3 ? ` class="s${(row * 3 + col) % 5}"` : '';
      scales += `<g transform="translate(${f(x)} ${f(y)})"${shimmer}><circle r="${R}" fill="${FILL[lv]}"/><g fill="none" stroke="${RING[lv]}" stroke-opacity="${RING_O[lv]}" stroke-width="1.3"><circle r="${R - 0.7}"/><circle r="11"/><circle r="7"/><circle r="3"/></g></g>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${data.login}'s year of commits as a seigaiha wave pattern">
<defs>
  <clipPath id="card"><rect width="${W}" height="${H}" rx="10"/></clipPath>
  <clipPath id="waves"><rect width="${W}" height="${f(waveH)}"/></clipPath>
  <filter id="sh" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.5"/></filter>
  ${koi('koiA', '<ellipse cx="6" cy="-1" rx="6" ry="3.6" fill="#e2552a"/><ellipse cx="-6" cy="1.5" rx="3.5" ry="2.4" fill="#e2552a"/>')}
  ${koi('koiB', '<ellipse cx="9" cy="0" rx="4" ry="3" fill="#1b1b1b"/><ellipse cx="-2" cy="-1" rx="5" ry="3" fill="#e9a03b"/>')}
  <path id="pa" d="M-60,150 C140,40 260,230 430,120 S700,30 900,170"/>
  <path id="pb" d="M900,70 C720,170 560,20 380,110 S120,210 -60,60"/>
</defs>
<style>
  .s0,.s1,.s2,.s3,.s4{animation:glint 5s ease-in-out infinite}
  .s1{animation-delay:-1s}.s2{animation-delay:-2s}.s3{animation-delay:-3s}.s4{animation-delay:-4s}
  @keyframes glint{0%,100%{opacity:1}50%{opacity:.72}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="#101a3a"/>
  <g clip-path="url(#waves)">${scales}</g>
  <g>
        <use href="#koiA" transform="scale(1.9)"><animateMotion dur="46s" repeatCount="indefinite" rotate="auto"><mpath href="#pa"/></animateMotion></use>
    <use href="#koiB" transform="scale(1.5)"><animateMotion dur="61s" begin="-20s" repeatCount="indefinite" rotate="auto"><mpath href="#pb"/></animateMotion></use>
  </g>
  <rect y="${f(waveH)}" width="${W}" height="${f(H - waveH)}" fill="#0d1530"/>
  <rect y="${f(waveH)}" width="${W}" height="1.5" fill="#c9a24b"/>
  <g transform="translate(22 ${f(waveH + (H - waveH) / 2)})">
    <rect x="0" y="-13" width="26" height="26" rx="3" fill="#c5362b"/>
    <text x="13" y="6" text-anchor="middle" font-family="${SERIF_CJK}" font-size="16" font-weight="700" fill="#f2e8d0">波</text>
    <text x="40" y="6" font-family="${SERIF_CJK}" font-size="17" font-weight="700" fill="#f2e8d0" letter-spacing="4">青海波</text>
    <text x="118" y="5" font-family="Georgia,serif" font-style="italic" font-size="12.5" fill="#aab8d8">one wave per day · ${fmt(data.total)} contributions · ${data.activeDays} days at sea</text>
  </g>
  <text x="${W - 22}" y="${f(waveH + (H - waveH) / 2 + 4.5)}" text-anchor="end" font-family="ui-monospace,'SF Mono',Consolas,monospace" font-size="11" fill="#c9a24b" letter-spacing="2">@${data.login}</text>
</g>
</svg>`;
}
