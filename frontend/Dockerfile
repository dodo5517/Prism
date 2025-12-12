# 기본 베이스 (Alpine 리눅스 사용으로 용량 최소화)
FROM node:20-alpine AS base

# 의존성 설치 단계
FROM base AS deps
# libc6-compat: 일부 Node 라이브러리가 필요로 하는 시스템 라이브러리 추가
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package.json package-lock.json* ./
RUN npm ci

# 빌드 단계
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 빌드 실행
RUN npm run build

# 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# 텔레메트리(정보수집) 끄기
ENV NEXT_TELEMETRY_DISABLED 1

# 시스템 사용자 생성 (보안상 root 대신 사용)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 정적 파일들 복사
COPY --from=builder /app/public ./public

# Standalone 모드 결과물 복사
# .next/standalone 폴더 안에는 실행에 필요한 최소한의 파일만 들어있음
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 사용자 변경
USER nextjs

# 포트 노출
EXPOSE 3000
ENV PORT 3000

# 실행
CMD ["node", "server.js"]