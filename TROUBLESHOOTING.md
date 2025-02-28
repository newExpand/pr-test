# 트러블 슈팅 가이드

## 일반적인 문제

### 1. GitHub 인증 관련 문제

#### 증상

- "Bad credentials" 에러 메시지
- 401 Unauthorized 응답
- GitHub API 요청 실패

#### 해결 방법

1. GitHub 토큰 확인
   ```
   GITHUB_TOKEN 환경 변수가 올바르게 설정되어 있는지 확인
   ```
2. 토큰 권한 확인
   - repo 접근 권한
   - workflow 접근 권한
   - PR 생성 및 관리 권한

### 2. PR 생성 실패

#### 증상

- "No commits between [branch] and [branch]" 에러
- PR 생성 시 422 응답

#### 해결 방법

1. 브랜치 상태 확인
   ```bash
   git status
   git log --oneline
   ```
2. 커밋 존재 여부 확인
3. 브랜치 간 차이점 확인
   ```bash
   git diff branch1..branch2
   ```

### 3. 설정 파일 로드 실패

#### 증상

- 설정 파일을 찾을 수 없음
- 잘못된 설정 값

#### 해결 방법

1. .env 파일 존재 확인
2. 필수 환경 변수 설정 확인
   ```
   GITHUB_TOKEN
   AUTOPR_GITHUB_OWNER
   AUTOPR_GITHUB_REPO
   AUTOPR_REVIEWERS
   ```

## 테스트 관련 문제

### 1. 통합 테스트 실패

#### 증상

- Git 저장소 초기화 실패
- PR 생성 테스트 실패

#### 해결 방법

1. Git 저장소 상태 확인
   ```bash
   git status
   git remote -v
   ```
2. 테스트 환경 설정 확인
3. GitHub API 응답 확인

### 2. 리뷰어 할당 실패

#### 증상

- 리뷰어가 자동으로 할당되지 않음
- 리뷰어 권한 부족

#### 해결 방법

1. 리뷰어 설정 확인
   ```
   AUTOPR_REVIEWERS 환경 변수 확인
   ```
2. 리뷰어 GitHub 계정 확인
3. 리포지토리 접근 권한 확인

## 로깅 관련 문제

### 1. 로그 레벨 설정

#### 증상

- 로그가 출력되지 않음
- 너무 많은 로그 출력

#### 해결 방법

1. 로그 레벨 설정 확인
   ```
   AUTOPR_LOG_LEVEL 환경 변수 확인
   ```
2. 로거 초기화 확인

## 성능 관련 문제

### 1. API 요청 제한

#### 증상

- Rate limit exceeded 에러
- API 응답 지연

#### 해결 방법

1. GitHub API 사용량 확인
2. 캐싱 구현 검토
3. 요청 간격 조정

## 성능 메트릭 관련 문제

### 1. API 호출 시간 측정 부정확

#### 증상

- 모의 테스트 환경에서 API 호출 시간이 0ms로 측정
- 실제 API 호출과 테스트 환경의 시간 측정 불일치

#### 해결 방법

1. 모의 API 응답에 지연 추가
   ```typescript
   mockImplementation(async () => {
     await new Promise(resolve => setTimeout(resolve, 10));
     return { data: { ... } };
   });
   ```
2. 실제 API 호출 시간 측정 로직 개선
   ```typescript
   const startTime = Date.now();
   try {
     const result = await operation();
     const duration = Date.now() - startTime;
     this.metricsCollector?.recordApiCall(duration);
     return result;
   } catch (error) {
     const duration = Date.now() - startTime;
     this.metricsCollector?.recordApiCall(duration);
     throw error;
   }
   ```

### 2. 메모리 사용량 모니터링

#### 증상

- 메모리 사용량 측정값 불안정
- 가비지 컬렉션으로 인한 측정 오차

#### 해결 방법

1. 메모리 스냅샷 시점 조정
2. 주기적인 메모리 사용량 기록
3. 평균값 기반 측정

## 에러 추적 관련 문제

### 1. 재시도 메커니즘 동작 이슈

#### 증상

- 재시도 간격이 너무 짧거나 김
- 불필요한 재시도 발생

#### 해결 방법

1. 지수 백오프 설정 최적화
   ```typescript
   const retryConfig = {
     maxAttempts: 3,
     initialDelay: 1000,
     maxDelay: 5000,
     backoffFactor: 2,
   };
   ```
2. 재시도 가능 여부 판단 로직 개선

### 2. 에러 컨텍스트 누락

#### 증상

- 에러 스택 트레이스 불완전
- 에러 발생 컨텍스트 정보 부족

#### 해결 방법

1. 에러 컨텍스트 수집 강화
   ```typescript
   const errorContext = {
     operationId: 'unique-id',
     operationType: 'github-api',
     timestamp: new Date().toISOString(),
     additionalData: { ... },
   };
   ```
2. 에러 래핑 구현으로 컨텍스트 보존

## 로깅 시스템 문제

### 1. 구조화된 로그 포맷 이슈

#### 증상

- JSON 형식 로그 파싱 오류
- 중첩된 객체 직렬화 문제

#### 해결 방법

1. 로그 포맷터 개선
   ```typescript
   private formatMessage(logMessage: LogMessage): string {
     const { level, message, context, error } = logMessage;
     return JSON.stringify({
       timestamp: context.timestamp,
       level: level.toUpperCase(),
       message,
       context: { ...context },
       error: error ? {
         name: error.name,
         message: error.message,
         stack: error.stack,
       } : undefined,
     });
   }
   ```
2. 순환 참조 처리 로직 추가
