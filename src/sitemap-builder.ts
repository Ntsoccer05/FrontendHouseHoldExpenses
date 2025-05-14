import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 動的にURLリストを取得
const urls = [
  '/',
  '/category',
  '/report',
  '/login',
  '/register'
  // 他のURLを追加
];

const generateSitemap = () => {
  const urlSet = urls.map((url) => {
    return `
    <url>
      <loc>${'https://your-domain.com' + url}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
    `;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlSet}
  </urlset>`;

  // public/sitemap.xml に書き込む
  fs.writeFileSync(path.resolve(__dirname, '../public', 'sitemap.xml'), sitemap);
};

// 実行
generateSitemap();
