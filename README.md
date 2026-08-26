# 애자일 방법론과 MSA 프로젝트

청약홈과 LH청약플러스로 나뉜 청약 사용자 경험을 하나로 통합하는 팀 프로젝트입니다.

기반 소스와 실행 안내는 [`msa-lecture`](./msa-lecture) 디렉터리에 있습니다.

## 저장소 구성

- `msa-lecture/vue-frontend`: Vue 3 프론트엔드
- `msa-lecture/user-service`: 사용자 서비스
- `msa-lecture/course-service`: 공고 도메인으로 전환할 기반 서비스
- `msa-lecture/enrollment-service`: 청약 신청 도메인으로 전환할 기반 서비스
- `msa-lecture/payment-service`: 결제 기반 서비스
- `msa-lecture/recommend-service`: 추천 서비스
- `msa-lecture/eureka-server`: 서비스 디스커버리
- `msa-lecture/init-db`: 초기 데이터베이스 스크립트

## 처음 실행할 때

```bash
cd msa-lecture/vue-frontend
cp .env.example .env
npm install
npm run dev
```

전체 MSA 실행 방법은 [`msa-lecture/readme.md`](./msa-lecture/readme.md)를 참고하세요.

## 저장소에 포함하지 않는 파일

- 실제 `.env` 및 비밀값
- `node_modules`, Gradle 빌드 결과물
- `infra-images.tar`: GitHub 단일 파일 크기 제한을 넘는 교육용 Docker 이미지 묶음이므로 원본 교육자료에서 별도로 받아야 합니다.

## 브랜치 규칙

- `main`: 시연 가능한 안정 버전
- 기능 개발: `feature/기능명`
- 버그 수정: `fix/버그명`

변경사항은 기능 브랜치에서 작업한 뒤 Pull Request로 `main`에 합칩니다.
