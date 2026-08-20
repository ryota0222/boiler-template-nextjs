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
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]

FROM base AS migrator
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts package.json ./
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]
