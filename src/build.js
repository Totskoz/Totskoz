// Builds the profile banner (assets/hanami.svg) from data/contributions.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from './lib.js';
import hanami from './hanami.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = load(path.join(root, 'data', 'contributions.json'));
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets', 'hanami.svg'), hanami(data));
console.log('assets/hanami.svg');
