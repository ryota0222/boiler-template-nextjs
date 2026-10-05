import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // next dev は AGENTS.md に独自の案内を書き足すが、このテンプレートの案内は手で書いた AGENTS.md に置くため
  agentRules: false,
  /* config options here */
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  output: 'standalone',
  reactCompiler: true,
  // packages/ui は TypeScript のソースのまま公開しているため、アプリのビルドで変換する
  transpilePackages: ['@template/ui'],
};

export default nextConfig;
