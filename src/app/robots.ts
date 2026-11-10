import type { MetadataRoute } from 'next';

// 業務アプリは検索に載せないため、すべてのクローラーを断る。
// robots.txt だけでは他のサイトからリンクされた URL が検索結果に出るため、layout.tsx の metadata.robots と
// next.config.ts の X-Robots-Tag も合わせて置く（外し方は page-metadata.md）
const robots = (): MetadataRoute.Robots => ({
  rules: { disallow: '/', userAgent: '*' },
});

export default robots;
