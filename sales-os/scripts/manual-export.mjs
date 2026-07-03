// 手动拼装 Next.js 静态导出（追加模式，不删除 out/）
// 用法：先 rm -rf out（手动），再 node scripts/manual-export.mjs
import fs from 'node:fs';
import path from 'node:path';

const SRC_HTML = path.join(process.cwd(), '.next/server/app');
const SRC_STATIC = path.join(process.cwd(), '.next/static');
const OUT = path.join(process.cwd(), 'out');

function copy(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function walk(src, dst) {
  if (!fs.existsSync(src)) return;
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f);
    const d = path.join(dst, f);
    if (fs.statSync(s).isDirectory()) walk(s, d);
    else copy(s, d);
  }
}

console.log('📄 Copying HTML pages...');
for (const f of fs.readdirSync(SRC_HTML)) {
  if (!f.endsWith('.html')) continue;
  const src = path.join(SRC_HTML, f);
  const name = f.replace(/\.html$/, '');
  copy(src, path.join(OUT, f));
  fs.mkdirSync(path.join(OUT, name), { recursive: true });
  copy(src, path.join(OUT, name, 'index.html'));
}

const companyDir = path.join(SRC_HTML, 'company');
if (fs.existsSync(companyDir)) {
  fs.mkdirSync(path.join(OUT, 'company'), { recursive: true });
  for (const f of fs.readdirSync(companyDir)) {
    const fullPath = path.join(companyDir, f);
    if (!fs.statSync(fullPath).isFile() || !f.endsWith('.html')) continue;
    const id = f.replace(/\.html$/, '');
    copy(fullPath, path.join(OUT, 'company', `${id}.html`));
    fs.mkdirSync(path.join(OUT, 'company', id), { recursive: true });
    copy(fullPath, path.join(OUT, 'company', id, 'index.html'));
  }
}

console.log('📦 Copying static assets...');
walk(SRC_STATIC, path.join(OUT, '_next', 'static'));

const notFound = path.join(SRC_HTML, '_not-found.html');
if (fs.existsSync(notFound)) copy(notFound, path.join(OUT, '404.html'));

const count = fs.readdirSync(OUT, { recursive: true }).length;
console.log(`✅ Done. ${count} entries in out/`);
