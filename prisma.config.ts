import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    // Prisma 7 の env() は設定ロード時点で即座に解決するため、DB 接続を
    // 必要としない prisma generate まで失敗する。postinstall で generate を
    // 走らせる以上、解決は各コマンドの実行時に委ねる
    url: process.env['DATABASE_URL'] as string,
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
});
