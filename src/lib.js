import fs from 'node:fs';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const DAY_CUTS = [3, 10, 30];

export function load(file) {
  const d = JSON.parse(fs.readFileSync(file, 'utf8')).data;
  const v = d.user || d.viewer;
  const cal = v.contributionsCollection.contributionCalendar;
  const weeks = cal.weeks.map((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, weekday: d.weekday }))
  );
  const days = weeks.flat();
  const weekTotals = weeks.map((w) => w.reduce((a, d) => a + d.count, 0));

  let longest = 0, run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    if (run > longest) longest = run;
  }
  const bestDay = days.reduce((a, d) => (d.count > a.count ? d : a), days[0]);

  // fixed levels (0-4), so a quiet year looks quiet: 1-3, 4-10, 11-30, 31+ contributions
  const active = days.filter((d) => d.count > 0);
  for (const d of days) d.level = d.count === 0 ? 0 : 1 + DAY_CUTS.filter((c) => d.count > c).length;

  // first week index of each month, for labels
  const monthStarts = [];
  weeks.forEach((w, i) => {
    const m = +w[0].date.slice(5, 7) - 1;
    if (i === 0 || m !== +weeks[i - 1][0].date.slice(5, 7) - 1) monthStarts.push({ week: i, month: m });
  });

  return {
    login: v.login,
    name: v.name || v.login,
    weeks, days, weekTotals, monthStarts,
    total: cal.totalContributions,
    maxWeek: Math.max(...weekTotals, 1),
    activeDays: active.length,
    longest, bestDay,
  };
}

// small deterministic PRNG so the art is stable between runs
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const f = (n) => (Math.round(n * 10) / 10).toString();
export const fmt = (n) => n.toLocaleString('en-US');
export const lerp = (a, b, t) => a + (b - a) * t;
export const niceDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`;

export function smooth(arr, win) {
  return arr.map((_, i) => {
    let s = 0, n = 0;
    for (let k = -win; k <= win; k++) {
      const j = i + k;
      if (j >= 0 && j < arr.length) { const w = win + 1 - Math.abs(k); s += arr[j] * w; n += w; }
    }
    return s / n;
  });
}

export const SERIF_CJK = `'Yu Mincho','YuMincho','Hiragino Mincho ProN','Songti SC','Noto Serif CJK JP','Noto Serif JP',serif`;
export const SANS_CJK = `'Yu Gothic','YuGothic','Hiragino Kaku Gothic ProN','PingFang SC','Noto Sans CJK JP','Noto Sans JP',sans-serif`;
