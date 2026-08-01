import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 検索エンジンに見せる価値のある公開ページのみを列挙する。
// /category, /report, /login, /register 等はログイン必須または認証フォームのみのページで、
// 未ログインクロール時にリダイレクトや重複コンテンツ判定を受けるためsitemapには含めない（robots.txt側でnoindex/Disallow対応）。
const urls = [
  '/',
  // 他のURLを追加
];

const generateSitemap = () => {
  const urlSet = urls.map((url) => {
    return `
    <url>
      <loc>${'https://kake-pon.com' + url}</loc>
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
