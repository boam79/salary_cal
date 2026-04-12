import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'index.html');
const destDir = path.join(root, 'frontend', 'public');
const dest = path.join(destDir, 'legacy.html');
const rootPublic = path.join(root, 'public');
const rootLegacy = path.join(rootPublic, 'legacy.html');

fs.mkdirSync(destDir, { recursive: true });
fs.mkdirSync(rootPublic, { recursive: true });

let html = fs.readFileSync(src, 'utf8');
/** legacy.html is served under /app/ — use site-root absolute paths for static assets */
html = html.replace(/href="css\//g, 'href="/css/');
html = html.replace(/src="js\//g, 'src="/js/');
html = html.replace(/fetch\(\s*['"]config\//g, "fetch('/config/");
html = html.replace(/fetch\(\s*`config\//g, 'fetch(`/config/');
html = html.replace(/fetch\(\s*['"]data\//g, "fetch('/data/");
html = html.replace(/fetch\(\s*`data\//g, 'fetch(`/data/');

fs.writeFileSync(dest, html, 'utf8');
console.log('Wrote', dest, '(with root-absolute asset paths)');
fs.writeFileSync(rootLegacy, html, 'utf8');
console.log('Wrote', rootLegacy);

const configSrc = path.join(root, 'config');
const configDest = path.join(destDir, 'config');
if (fs.existsSync(configSrc)) {
  fs.cpSync(configSrc, configDest, { recursive: true });
  console.log('Copied config/ -> frontend/public/config/');
}
