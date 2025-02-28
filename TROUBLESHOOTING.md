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
