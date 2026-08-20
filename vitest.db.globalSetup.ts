import { execFileSync } from 'node:child_process';

// テスト用 database は compose の initdb で作られるだけでスキーマを持たない。
// 実行のたびに適用しておかないと、開発者が手順を1つ覚えていないと落ちる
export default function setup(): void {
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST },
    stdio: 'inherit',
  });
}
