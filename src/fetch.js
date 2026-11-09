// Fetches the last year's contribution calendar into data/contributions.json.
// Only day counts are requested — no repository names or other private details.
//
// Token: PROFILE_TOKEN / GH_TOKEN / GITHUB_TOKEN env, else falls back to `gh auth token`.
// Private contributions are only counted when the token belongs to the profile owner.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const login = process.argv[2] || process.env.PROFILE_LOGIN || process.env.GITHUB_REPOSITORY_OWNER || 'Totskoz';

let token = process.env.PROFILE_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!token) {
  try { token = execSync('gh auth token', { encoding: 'utf8' }).trim(); } catch { /* handled below */ }
}
if (!token) {
  console.error('No token: set PROFILE_TOKEN (or GH_TOKEN), or log in with `gh auth login`.');
  process.exit(1);
}

const query = `query($login:String!){user(login:$login){login name contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount weekday}}}}}}`;
const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { authorization: `bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'profile-banner' },
  body: JSON.stringify({ query, variables: { login } }),
});
const json = await res.json();
if (!res.ok || json.errors || !json.data?.user) {
  console.error('GitHub API error:', JSON.stringify(json.errors || json, null, 2));
  process.exit(1);
}

const total = json.data.user.contributionsCollection.contributionCalendar.totalContributions;
// Guard: never replace a populated calendar with an empty one (e.g. a token that can't see private work).
if (total === 0 && !process.env.ALLOW_EMPTY) {
  console.error('Calendar came back empty — refusing to overwrite. Check the token, or set ALLOW_EMPTY=1.');
  process.exit(1);
}

fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'contributions.json'), JSON.stringify(json));
console.log(`${login}: ${total} contributions`);
