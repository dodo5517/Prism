# 빌드 단계 (Gradle 설치된 이미지 사용)
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app

# 의존성 캐싱을 위해 설정 파일만 먼저 복사 (빌드 속도 최적화)
COPY build.gradle settings.gradle ./

# 소스 코드 복사
COPY src ./src

# 빌드 실행
RUN gradle clean build -x test --no-daemon

# 실행 단계 (가벼운 JRE 이미지 사용)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# 빌드 단계에서 생성된 JAR 파일만 쏙 가져오기
COPY --from=builder /app/build/libs/prism-backend-0.0.1-SNAPSHOT.jar app.jar

# 포트 노출
EXPOSE 8080

# 실행 명령어
ENTRYPOINT ["java", "-jar", "app.jar"]