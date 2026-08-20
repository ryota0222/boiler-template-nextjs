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
# すべて取り除く
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN node -e "\
  const pkg = require('./package.json'); \
  pkg.dependencies = { prisma: pkg.devDependencies.prisma, dotenv: pkg.devDependencies.dotenv }; \
  pkg.devDependencies = {}; \
  require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2)); \
  " \
  && pnpm prune --prod --ignore-scripts

FROM base AS migrator
COPY --from=deps-migrator /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts package.json ./
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]
