FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# postinstall は playwright install chromium を含み、本番イメージには不要な
# Chromium をビルドのたびに焼き込んでしまう。prisma generate は builder で
# 明示的に実行するため、ここでは install スクリプトを一切走らせない
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# このテンプレートは public/ を持たない（favicon は src/app/favicon.ico）ため、
# runner の COPY --from=builder /app/public が失敗しないよう空ディレクトリを保証する
# src/gateways/prismaClient.ts はモジュール評価時にDATABASE_URL未設定だと即例外を
# 投げる。ビルド時点で実DBに接続するわけではないためダミー値でよいが、CI の
# build ジョブ（run-ci.yaml）と同じ値を与えないと、ページや Route Handler が
# gateway を import した瞬間に CI は通るのに docker build だけ失敗する事態になる
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
RUN mkdir -p public && pnpm exec prisma generate && pnpm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]

FROM base AS deps-migrator
COPY package.json pnpm-lock.yaml ./
# frozen-lockfile は package.json の dependencies/devDependencies を
# セクション単位で pnpm-lock.yaml と一致させる必要があるため、先に無改変の
# package.json でフルインストールし pnpm-lock.yaml の解決結果をそのまま使う
# （新規解決なしでバージョンが完全固定される）。インストール後に package.json の
# dependencies を「migrate deploy に必要な prisma と dotenv（prisma.config.ts が
# import する）だけ」に書き換えてから prune --prod することで、next / react /
# @radix-ui/themes などアプリ本体の依存も含め、migrator に不要なものを
# すべて取り除く。この書き換えは prisma と dotenv が devDependencies にある
# ことを前提にしており、片方でも dependencies 側へ移動されると
# pkg.devDependencies.xxx が undefined になり JSON.stringify でキーごと
# 消える。dotenv が消えると build は成功するが prisma.config.ts の
# `import 'dotenv/config'` がデプロイ実行時に初めて失敗するため、
# ビルド時点で検知できるよう明示的にチェックする
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN node -e "\
  const pkg = require('./package.json'); \
  const prismaVersion = pkg.devDependencies.prisma; \
  const dotenvVersion = pkg.devDependencies.dotenv; \
  if (!prismaVersion || !dotenvVersion) { \
    throw new Error('prisma と dotenv は devDependencies にある前提です。dependencies 側へ移動した場合はこの書き換えスクリプトを更新してください'); \
  } \
  pkg.dependencies = { prisma: prismaVersion, dotenv: dotenvVersion }; \
  pkg.devDependencies = {}; \
  require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2)); \
  " \
  && pnpm prune --prod --ignore-scripts
# --ignore-scripts により @prisma/engines の postinstall（schema engine のダウンロード）が
# スキップされている。ここで明示的に postinstall を再実行してバイナリを
# node_modules 内に焼き込むことで、migrate deploy 実行時に外部ネットワーク
# （binaries.prisma.sh）へアクセスせずに済むようにする。@prisma/engines は
# prisma の依存であり本体の直接依存ではないため `pnpm rebuild @prisma/engines`
# は何もせず終了する（silent no-op）。prisma からの相対解決で postinstall.js を
# 直接 require することで確実に実行する
RUN node -e "\
  const path = require('path'); \
  const enginesPkg = require.resolve('@prisma/engines/package.json', { paths: [path.dirname(require.resolve('prisma/package.json'))] }); \
  require(path.join(path.dirname(enginesPkg), 'scripts/postinstall.js')); \
  "

FROM base AS migrator
COPY --from=deps-migrator /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts package.json ./
CMD ["node", "node_modules/prisma/build/index.js", "migrate", "deploy"]
