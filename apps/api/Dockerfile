FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public" pnpm --filter @palmpay/api build

ENV NODE_ENV=production

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["sh", "-c", "if [ \"$AUTH_MODE\" = \"test\" ]; then pnpm exec prisma migrate deploy && pnpm run prisma:seed && pnpm run prisma:bootstrap:test && pnpm run prisma:import:v9-1-projects && pnpm run prisma:import:v9-1-ai-catalog && pnpm run prisma:import:v9-1-design-assets; fi; pnpm run start:deploy"]
