import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from './lib.js';
import shanshui from './drafts/shanshui.js';
import manga from './drafts/manga.js';
import seigaiha from './drafts/seigaiha.js';
import lanterns from './drafts/lanterns.js';
import hanami from './drafts/hanami.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = load(path.join(root, 'data', 'contributions.json'));
const out = path.join(root, 'drafts');
fs.mkdirSync(out, { recursive: true });

const drafts = [
  ['shanshui', '山水 · Ink Mountains', 'Each week is a peak — taller means more commits. One bird per thousand contributions; the red sun hangs by your biggest week. Mist drifts, a boat crosses the year.', shanshui],
  ['manga', '漫画 · Chapter of the Year', 'Your year as a manga page: flickering focus lines around the total, a shout panel for your best day, and the calendar drawn as screentone dots.', manga],
  ['seigaiha', '青海波 · Indigo Tide', 'A wave-print textile where every scale is one day, read like text. Busy days crest white; koi drift across the cloth.', seigaiha],
  ['lanterns', '灯籠流し · Lantern Festival', 'One lantern per week: more commits float higher and glow brighter. Empty weeks leave an unlit lantern on the water.', lanterns],
  ['hanami-night', '夜桜 · Pixel Hanami (dark mode)', 'The night version shown to visitors using GitHub dark theme: moon and stars, lanterns in the blooming trees, fireflies, and a lawn where busy days glow brightest.', (d) => hanami(d, 'night')],
  ['hanami', '花見 · Pixel Hanami', 'Pixel-art cherry blossom park: one sakura tree per month (fuller bloom = more commits), the calendar is a petal-strewn lawn, cats nap under your three busiest months, and a sprout spirit hops on your best day.', hanami],
];

// the banner used by README.md
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets', 'hanami.svg'), hanami(data));
fs.writeFileSync(path.join(root, 'assets', 'hanami-dark.svg'), hanami(data, 'night'));
console.log('assets/hanami.svg, assets/hanami-dark.svg');
if (process.argv.includes('--banner-only')) process.exit(0);

for (const [id, , , fn] of drafts) {
  const svg = fn(data);
  fs.writeFileSync(path.join(out, `${id}.svg`), svg);
  console.log(`${id}.svg  ${(svg.length / 1024).toFixed(1)} kB`);
}

const cards = drafts
  .map(([id, title, desc], i) => `<section><h2><span>${i + 1}</span>${title}</h2><p>${desc}</p><img src="${id}.svg" alt="${title}"></section>`)
  .join('\n');
fs.writeFileSync(
  path.join(out, 'preview.html'),
  `<!doctype html><meta charset="utf-8"><title>Profile drafts</title>
<style>
  body{margin:0;padding:32px 16px 64px;background:#0d1117;color:#e6edf3;font:15px/1.5 -apple-system,'Segoe UI',sans-serif}
  body.light{background:#fff;color:#1f2328}
  main{max-width:846px;margin:0 auto}
  h1{font-size:20px;margin:0 0 4px} .sub{color:#8b949e;margin:0 0 28px}
  section{margin:0 0 44px} h2{font-size:17px;margin:0 0 4px;display:flex;gap:10px;align-items:center}
  h2 span{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#c5362b;color:#fff;font-size:12px}
  p{margin:0 0 12px;color:#8b949e} img{display:block;width:100%;height:auto}
  button{float:right;background:none;border:1px solid #8b949e;color:inherit;border-radius:6px;padding:4px 10px;cursor:pointer}
</style>
<main><button onclick="document.body.classList.toggle('light')">light / dark</button>
<h1>@${data.login} — profile drafts</h1><p class="sub">Built from your real last-12-months contribution calendar, shown at GitHub README width.</p>
${cards}</main>`
);
console.log('preview.html');
