/**
 * Vercel 등 "Output = public/" 배포에서 루트 SPA(index.html, css, js)가
 * 포함되도록 프로젝트 루트 정적 자산을 public/ 으로 복사합니다.
 * (public/app 은 build:app 에서 이미 생성)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'public');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn('skip missing:', src);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log('copied', path.relative(root, src), '->', path.relative(root, dest));
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn('skip missing file:', src);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('copied', path.relative(root, src), '->', path.relative(root, dest));
}

fs.mkdirSync(pub, { recursive: true });

copyFile(path.join(root, 'index.html'), path.join(pub, 'index.html'));
copyDir(path.join(root, 'css'), path.join(pub, 'css'));
copyDir(path.join(root, 'js'), path.join(pub, 'js'));
copyDir(path.join(root, 'config'), path.join(pub, 'config'));
copyDir(path.join(root, 'data'), path.join(pub, 'data'));

for (const name of ['sitemap.xml', 'robots.txt', 'ads.txt']) {
  const p = path.join(root, name);
  if (fs.existsSync(p)) copyFile(p, path.join(pub, name));
}

for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
  if (ent.isFile() && ent.name.startsWith('google') && ent.name.endsWith('.html')) {
    copyFile(path.join(root, ent.name), path.join(pub, ent.name));
  }
}

console.log('sync-static-to-public: done');
