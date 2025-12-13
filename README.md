# Prism

**Prism** - 일기를 작성하면 AI가 내용을 분석하고, 그날에 맞는 이미지를 자동 생성하는 웹 서비스입니다.

---

## 미리 보기

<p>
  <img src="https://github.com/user-attachments/assets/f2a75b14-3e9a-4380-8c50-4d84a4c271b9" width="49%" />
  <img src="https://github.com/user-attachments/assets/8218fda6-6c3f-46d5-b385-2af2728074f0" width="49%" />
</p>

---

## 개요

Prism은 사용자가 작성한 일기를 Google Gemini AI로 분석하여 감정 키워드를 추출하고, Cloudflare Stable Diffusion XL로 그날에 맞는 이미지를 자동 생성합니다.

**주요 특징**

- AI 기반 감정 분석 (대표 감정, 감정 점수, 핵심 키워드 추출)
- 감정 키워드 기반 이미지 자동 생성 및 Supabase Storage 저장
- 월별/연도별 감정 통계 및 키워드 순위 시각화
- JWT 기반 Stateless 인증
- Docker 기반 MSA 아키텍처

---

## 개발 기간

2025.12.07 ~ 2025.12.13 (약 일주일)

---

## 기술 스택

**Backend**

- Java 17
- Spring Boot 3.4
- Spring Security (JWT)
- Spring Data JPA
- Spring WebFlux (WebClient)
- PostgreSQL (Supabase)
- Gradle

**Frontend**

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand
- Chart.js

**Infra**


- Supabase (PostgreSQL, Storage)
- Docker / Docker Compose
- Nginx (Reverse Proxy)
- GitHub Actions (CI/CD)
- Docker Hub

**External API**

- Google Gemini 2.5 Flash (일기 내용 분석 및 프롬프트 생성)
- Cloudflare Stable Diffusion XL (이미지 생성)

---

## 아키텍처

```
[Client] --> [Nginx :80]
                 |
      +----------+----------+
      |                     |
   /api/*                  /*
      |                     |
[Spring Boot]         [Next.js]
      |
      +---> [Supabase PostgreSQL]
      +---> [Supabase Storage] (이미지 저장)
      +---> [Gemini API]
      +---> [Stable Diffusion API]
```

**이미지 생성 흐름**

```

일기 작성 → Gemini가 일기 분석 → 키워드 추출 → Stable Diffusion 이미지 생성 → Supabase Storage 저장

```

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 일기 작성 | 날짜별 일기 CRUD |
| 일기 분석 | Gemini API로 대표 감정, 점수(0~100), 키워드 추출 |
| 이미지 생성 | 감정 키워드 기반 Stable Diffusion 이미지 생성 |
| 이미지 저장 | 생성된 이미지 Supabase Storage에 저장 및 URL 관리 |
| 대시보드 | 월별/연도별 인기 키워드, 감정 변화 추이 시각화 |
| 인증 | JWT + Access Token 기반 인증 |

---

## 프로젝트 구조

```
Prism/
├── .github/workflows/
├── backend/
│   ├── src/main/java/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── global/
│   │   ├── mood/
│   │   └── user/
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   └── Dockerfile
└── docker-compose.yml
```

---

## API 예시

**일기 작성**
```http
POST /api/logs?date=2025-12-14
```

**달력 조회**
```http
GET /api/logs/monthly?year=2025&month=12
```

**키워드 통계 조회**
```http
GET /api/admin/stats/keywords?year=2025&month=12
```

---

## 실행 방법

**1. Clone**
```bash
git clone https://github.com/dodo5517/Prism.git
cd prism
```

**2. 환경 설정**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# .env 파일에 DB, JWT, API Key 설정 입력
```

**3. Docker 실행**
```bash
docker-compose up --build
```

`http://localhost:3000`
에서 확인할 수 있습니다.


**로컬 개발**

```bash
# Backend
cd backend
./gradlew bootRun

# Frontend
cd frontend
npm install
npm run dev

```
