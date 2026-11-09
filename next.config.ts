import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // next dev は AGENTS.md に独自の案内を書き足すが、このテンプレートの案内は手で書いた AGENTS.md に置くため
  agentRules: false,
  /* config options here */
  // 業務アプリは検索に載せない。HTML 以外の応答（API や PDF など）にも効くよう、ヘッダーで全部に付ける
  headers: async () => [
    {
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      source: '/:path*',
    },
  ],
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  output: 'standalone',
  reactCompiler: true,
  // packages/ui は TypeScript のソースのまま公開しているため、アプリのビルドで変換する
  transpilePackages: ['@template/ui'],
};

export default nextConfig;
