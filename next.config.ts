import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
