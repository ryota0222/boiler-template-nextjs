import { PrismaClient } from '@prisma-client';
import { PrismaPg } from '@prisma/adapter-pg';
import { isDefined } from 'remeda';

const connectionString = process.env.DATABASE_URL;

if (!isDefined(connectionString)) {
  throw new Error(
    'DATABASE_URLが設定されていません（DBテスト実行時はDATABASE_URL_TESTを確認してください）'
  );
}

// Prisma 7 の driver adapter は pg の既定値を使うため接続タイムアウトが 0（無制限）になる。
// 無制限のままだと DB 障害時にリクエストがハングするため v6 相当の 5 秒に戻す
const createClient = (): PrismaClient =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5000 }),
  });

// globalThis は既定で prisma プロパティを持たないため、HMR 用キャッシュの型を付けるには二重アサーションが必要
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

// Next.js の開発時 HMR はモジュールを再評価するため、
// 保持しないとリロードのたびに新しい接続プールが増え続ける
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
