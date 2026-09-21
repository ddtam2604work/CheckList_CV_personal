import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const distAssetsDir = path.join(distDir, 'assets');
const rootAssetsDir = path.join(rootDir, 'assets');
const docsDir = path.join(rootDir, 'docs');
const docsAssetsDir = path.join(docsDir, 'assets');

if (!fs.existsSync(distDir)) {
  console.error('[sync-build] Thư mục dist không tồn tại! Hãy chạy vite build trước.');
  process.exit(1);
}

// Đảm bảo các thư mục tồn tại
[rootAssetsDir, docsDir, docsAssetsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Quét file trong dist/assets
const assetFiles = fs.readdirSync(distAssetsDir);
let mainJs = '';
let mainCss = '';

assetFiles.forEach((file) => {
  if (file.startsWith('index-') && file.endsWith('.js')) {
    mainJs = file;
  }
  if (file.startsWith('index-') && file.endsWith('.css')) {
    mainCss = file;
  }

  // Copy sang root assets và docs/assets
  fs.copyFileSync(path.join(distAssetsDir, file), path.join(rootAssetsDir, file));
  fs.copyFileSync(path.join(distAssetsDir, file), path.join(docsAssetsDir, file));
});

// Ghi manifest.json
const manifest = {
  js: mainJs,
  css: mainCss,
  timestamp: new Date().toISOString(),
};

fs.writeFileSync(path.join(rootAssetsDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync(path.join(docsAssetsDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

// Copy index.html sang docs/
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(docsDir, 'index.html'));
}

// Đảm bảo .nojekyll tồn tại
['.nojekyll', path.join('dist', '.nojekyll'), path.join('docs', '.nojekyll')].forEach((relPath) => {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '', 'utf8');
  }
});

console.log('[sync-build] Đồng bộ build thành công:');
console.log(`- Main JS : ${mainJs}`);
console.log(`- Main CSS: ${mainCss}`);
console.log('- Đã cập nhật: assets/, docs/, docs/assets/, manifest.json, .nojekyll');
