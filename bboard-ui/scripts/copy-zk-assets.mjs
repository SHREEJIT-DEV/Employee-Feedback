import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contractAssets = resolve(root, '..', 'contract', 'src', 'managed', 'bboard');
const dist = resolve(root, 'dist');

for (const name of ['keys', 'zkir']) {
  const from = resolve(contractAssets, name);
  const to = resolve(dist, name);

  if (!existsSync(from)) {
    throw new Error(`Missing ZK asset directory: ${from}`);
  }

  mkdirSync(dist, { recursive: true });
  cpSync(from, to, { recursive: true, force: true });
}