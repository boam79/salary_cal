import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'frontend', 'dist');
const dest = path.join(root, 'public', 'app');

if (!fs.existsSync(dist)) {
  console.error('frontend/dist not found. Run vite build first.');
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(dist, dest, { recursive: true });
console.log('Synced frontend/dist -> public/app');
