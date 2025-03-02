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

## Phase 2 관련 문제

### 1. 자동 라벨링 문제

#### 증상

- 라벨이 적용되지 않음
- 잘못된 라벨이 적용됨
- 파일 패턴 매칭 실패

#### 해결 방법

1. 라벨링 규칙 확인

   ```typescript
   const labelRules = [
     {
       name: 'backend',
       filePatterns: ['src/services/**/*'],
     },
   ];
   ```

2. 파일 경로 매칭 확인

   ```bash
   # 테스트 파일 경로 확인
   ls -R src/services/
   ls -R src/test-files/services/
   ```

3. Git 작업 디렉토리 확인
   ```bash
   git status
   git add -f src/test-files/services/
   ```

### 2. 리뷰어 할당 문제

#### 증상

- 리뷰어가 할당되지 않음
- 특정 리뷰어에게 과도한 할당
- 팀 매칭 실패

#### 해결 방법

1. 리뷰어 설정 확인

   ```typescript
   const reviewerConfig = {
     username: 'reviewer',
     team: 'backend',
     maxReviews: 5,
   };
   ```

2. 워크로드 밸런싱 확인

   ```typescript
   // 현재 리뷰 수 확인
   const currentReviews = await githubClient.getCurrentReviews(username);
   ```

3. 팀 매칭 규칙 검증
   ```typescript
   // 팀 매칭 로직 확인
   const matchedReviewers = reviewers.filter((r) => r.team === team);
   ```

### 3. 충돌 감지 문제

#### 증상

- 충돌 감지 실패
- 잘못된 충돌 알림
- 알림 전송 실패

#### 해결 방법

1. PR 상태 확인

   ```typescript
   const prStatus = await githubClient.getPullRequestStatus(prNumber);
   console.log('Mergeable State:', prStatus.mergeable_state);
   ```

2. 충돌 상태 검증

   ```bash
   # 로컬에서 충돌 상태 확인
   git fetch origin
   git checkout feature-branch
   git merge main
   ```

3. 알림 설정 확인
   ```typescript
   // 알림 서비스 설정
   const notificationConfig = {
     channels: ['slack', 'email'],
     templates: {
       conflict: '충돌이 발생했습니다: ${prUrl}',
     },
   };
   ```

### 4. 통합 테스트 문제

#### 증상

- 테스트 타임아웃
- 임시 파일 정리 실패
- Git 작업 실패

#### 해결 방법

1. 테스트 타임아웃 설정

   ```typescript
   it('테스트 케이스', async () => {
     // 테스트 코드
   }, 10000); // 타임아웃 10초로 설정
   ```

2. 임시 파일 정리

   ```typescript
   afterAll(async () => {
     await fs.rm('src/test-files', { recursive: true, force: true });
     await execAsync('git checkout main');
     await execAsync(`git branch -D ${testBranch}`);
   });
   ```

3. Git 작업 에러 처리
   ```typescript
   try {
     await execAsync('git add .');
     await execAsync('git commit -m "test commit"');
   } catch (error) {
     console.error('Git 작업 실패:', error);
     // 정리 작업 수행
   }
   ```

## Phase 4 관련 문제

### 1. 코드 변경 분석 문제

#### 증상

- 복잡도 계산 결과가 부정확함
- 코드 스멜 감지가 누락됨
- 보안 이슈 탐지가 과도하게 민감함

#### 해결 방법

1. 복잡도 계산 로직 검증

   ```typescript
   // 순환 복잡도 계산 검증
   const complexity = calculateCyclomaticComplexity(content);
   console.log('Cyclomatic Complexity:', complexity);

   // 인지 복잡도 계산 검증
   const cognitive = calculateCognitiveComplexity(content);
   console.log('Cognitive Complexity:', cognitive);
   ```

2. 코드 스멜 감지 규칙 조정

   ```typescript
   const codeSmells = detectCodeSmells(content, {
     maxLineLength: 120,
     maxNestingLevel: 4,
     maxFunctionLength: 50,
   });
   ```

3. 보안 이슈 감도 조정
   ```typescript
   const securityIssues = detectSecurityIssues(content, {
     severity: 'high',
     ignorePatterns: ['test/', 'mock/'],
   });
   ```

### 2. 전문가 매칭 시스템 문제

#### 증상

- 부적절한 리뷰어 매칭
- 점수 계산 오류
- 워크로드 불균형

#### 해결 방법

1. 전문성 점수 계산 검증

   ```typescript
   const scores = {
     language: calculateLanguageScore(reviewer.languages, analysis.languages),
     framework: calculateFrameworkScore(
       reviewer.frameworks,
       analysis.frameworks
     ),
     domain: calculateDomainScore(reviewer.domains, analysis.domains),
     pattern: calculatePatternScore(reviewer.filePatterns, analysis.patterns),
   };
   console.log('Expertise Scores:', scores);
   ```

2. 워크로드 밸런싱 조정

   ```typescript
   const workloadScore = calculateWorkloadScore({
     currentReviews: reviewer.currentReviews,
     maxReviews: reviewer.maxReviews,
     minScore: 0.3,
   });
   ```

3. 매칭 기준 최적화
   ```typescript
   const matchCriteria = {
     minExpertiseScore: 0.5,
     maxWorkload: 0.8,
     requiredDomains: ['backend'],
   };
   ```

### 3. 자동 머지 시스템 문제

#### 증상

- 머지 조건 검증 실패
- 테스트 상태 확인 오류
- 재시도 메커니즘 무한 루프

#### 해결 방법

1. 머지 조건 검증 강화

   ```typescript
   const canMerge = await validateMergeability(prNumber, {
     requireApproval: true,
     requiredChecks: ['build', 'test'],
     blockingLabels: ['do-not-merge'],
   });
   ```

2. 테스트 상태 모니터링 개선

   ```typescript
   const testStatus = await validateTestStatus(checks, {
     timeout: 3600000, // 1시간
     requiredChecks: ['ci/build', 'ci/test'],
     waitForChecks: true,
   });
   ```

3. 재시도 로직 최적화
   ```typescript
   const retryConfig = {
     maxAttempts: 3,
     initialDelay: 1000,
     maxDelay: 5000,
     backoffFactor: 2,
     retryableErrors: ['CONFLICT', 'NETWORK_ERROR'],
   };
   ```

### 4. 승인 검증 문제

#### 증상

- 승인 상태 잘못된 판단
- 블로킹 라벨 무시
- 자기 승인 정책 오작동

#### 해결 방법

1. 승인 상태 검증 로직 개선

   ```typescript
   const approvalStatus = validateApprovalStatus(reviews, {
     requiredReviewers: ['senior-dev', 'tech-lead'],
     requiredApprovalsCount: 2,
     allowAuthorSelfApproval: false,
   });
   ```

2. 블로킹 라벨 처리 강화

   ```typescript
   const hasBlockingLabels = checkBlockingLabels(labels, {
     blockingPatterns: ['hold', 'wip', 'do-not-merge'],
     caseSensitive: false,
   });
   ```

3. 리뷰어 권한 검증
   ```typescript
   const isValidReviewer = validateReviewerPermissions(reviewer, {
     requiredPermission: 'write',
     excludeAuthor: true,
     teamMembership: ['engineering'],
   });
   ```

### 5. 테스트 상태 검증 문제

#### 증상

- 체크 상태 잘못된 해석
- 타임아웃 처리 오류
- 필수 체크 누락

#### 해결 방법

1. 체크 상태 해석 개선

   ```typescript
   const checkStatus = validateCheckStatus(checks, {
     requiredStates: ['success'],
     allowedConclusions: ['success', 'skipped'],
     ignoreChecks: ['optional-check'],
   });
   ```

2. 타임아웃 처리 강화

   ```typescript
   const isTimedOut = checkTimeout(check, {
     maxDuration: 3600000, // 1시간
     warningThreshold: 0.8, // 80% 경과 시 경고
   });
   ```

3. 필수 체크 검증
   ```typescript
   const hasRequiredChecks = validateRequiredChecks(checks, {
     required: ['build', 'test', 'lint'],
     allowPartialSuccess: false,
   });
   ```

### 6. 성능 및 안정성 문제

#### 증상

- 대규모 PR 분석 시 성능 저하
- 메모리 사용량 급증
- API 요청 병목 현상

#### 해결 방법

1. 성능 최적화

   ```typescript
   // 분할 처리로 메모리 사용 최적화
   const analyzeInChunks = async (files: PullRequestFile[], chunkSize = 10) => {
     const results = [];
     for (let i = 0; i < files.length; i += chunkSize) {
       const chunk = files.slice(i, i + chunkSize);
       results.push(await analyzeFiles(chunk));
       await new Promise((resolve) => setTimeout(resolve, 100));
     }
     return results.flat();
   };
   ```

2. 캐시 구현

   ```typescript
   const cacheConfig = {
     ttl: 300000, // 5분
     maxSize: 1000,
     cleanupInterval: 60000, // 1분
   };
   ```

3. API 요청 최적화
   ```typescript
   const batchProcessor = new BatchProcessor({
     maxBatchSize: 100,
     maxWaitTime: 1000,
     retryOptions: {
       maxAttempts: 3,
       backoff: true,
     },
   });
   ```
