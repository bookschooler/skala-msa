# API 명세서 — recommend-service

> 프로젝트명: HomeOne — B2G2C 분양 정보 통합 플랫폼  
> 담당: #4 AI 개발자 (맞춤 추천 시스템)  
> 작성일: 2026-08-27  
> 서비스 포트: 8085  
> 기술 스택: **Python / FastAPI** (다른 서비스는 Java/Spring Boot)  
> Base URL: `http://localhost:8085` (개발) / `http://[서버IP]:8080/api/recommend` (Gateway 경유)

> 📌 본 명세서는 2026-08-27 11:00 기준 **실행 중인 컨테이너의 OpenAPI 스펙**(`GET http://localhost:8085/openapi.json`)과
> `recommend_router.py` / `schemas.py` / `recommend_service.py` 소스를 대조하여 작성했습니다.

> ⚠️ **중요 — 두 가지 버전이 존재합니다.**
> - **현재 실행 중 (본 명세서 기준)**: 템플릿 원본. 엔드포인트 2개
> - **`feature/minseoai1` 브랜치**: 청약 적격성 기반으로 전면 재작성, 엔드포인트 7개. **아직 어느 브랜치에도 머지되지 않음**
>
> 발표 전에 어느 쪽을 시연할지 팀 결정이 필요합니다. 미머지 버전 명세는 문서 하단 부록 참조.

---

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | `API-RC` |
| 대상 서비스 | `recommend-service` (포트 8085) |
| 문서 버전 | v1.0 |
| 작성자 | #4 AI 개발자 (맞춤 추천 시스템) |
| 최종 수정일 | 2026-08-27 |
| 대상 독자 | 프론트엔드 개발자, 타 서비스 백엔드 개발자, 평가자 |
| 원본 스펙 | OpenAPI 3.1 — `http://localhost:8085/openapi.json` |
| Swagger UI | `http://localhost:8085/docs` |
| 관련 문서 | `ERD_전체.md`, `도메인매핑표_전체.md`, `아키텍처_설계서.md` |

> ⚠️ OpenAPI JSON 경로는 springdoc 기본값 `/v3/api-docs` 가 아니라 **`/api-docs`** 입니다
> (`application.yml` 의 `springdoc.api-docs.path: /api-docs`). FastAPI는 `/openapi.json`.

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|---------|
| v1.0 | 2026-08-27 | #4 AI 개발자 (맞춤 추천 시스템) | 최초 작성. 실행 중인 컨테이너의 OpenAPI 스펙과 소스 코드를 대조하여 엔드포인트 전수 기재 |

---

## 인증 방식

전 서비스 공통입니다. 개별 서비스가 토큰을 발급하지 않고 **auth-server(9000)** 가 담당합니다.

### 토큰 발급 및 사용 흐름

```
1. 사용자 로그인        Client → auth-server:9000  (OAuth2 Authorization Code)
2. Access Token 발급    auth-server → Client
3. API 호출             Client → api-gateway:8080  [Authorization: Bearer {token}]
4. 토큰 검증            gateway → auth-server:9000/oauth2/jwks  (공개키 조회 후 서명 검증)
5. 헤더 주입            gateway → 각 서비스        [X-User-Id / X-User-Email / X-User-Role]
```

| 항목 | 값 |
|------|-----|
| 인증 서버 | `http://auth-server:9000` (Spring Authorization Server) |
| 토큰 형식 | JWT (Bearer) |
| 요청 헤더 | `Authorization: Bearer {accessToken}` |
| JWK Set URI | `http://auth-server:9000/oauth2/jwks` |
| 사용자 인증 | OAuth2 Authorization Code Grant |
| 서비스 간 인증 | Client Credentials Grant (`service.read` 스코프) |

### Gateway 주입 헤더

| 헤더 | 설명 |
|------|------|
| `X-User-Id` | JWT에서 추출한 사용자 ID. 컨트롤러가 `@RequestHeader` 로 직접 사용 |
| `X-User-Email` | 사용자 이메일 |
| `X-User-Role` | STUDENT(청약자) / INSTRUCTOR(공급사) |

> 🔴 **알려진 이슈 — issuer 설정 불일치**
> `docker-compose.yml` 기준 `api-gateway`·`recommend-service` 의 issuer는 `http://localhost:8080` 인 반면,
> `user`·`course`·`enrollment`·`payment` 는 `http://auth-server:9000` 으로 서로 다릅니다.
> 이 때문에 Gateway(8080) 경유 시 401이 발생하며, 현재 프론트는 `vite.config.js` 프록시로
> course-service(8082)를 직접 호출해 우회하고 있습니다. **운영 전 반드시 통일 필요.**

---

## 공통 사항

### 서비스 역할

사용자의 청약 이력을 분석해 맞춤 분양 공고를 추천합니다.
**자체 DB를 갖지 않고**, 필요한 데이터를 다른 서비스에 REST로 요청하는 것이 이 서비스의 설계 특징입니다.

```
GET /api/recommend/{userId}
  ├─ [동기 REST] → enrollment-service : 청약 이력 조회 (ACTIVE만)
  ├─ [동기 REST] → course-service     : 공고 상세 조회 (카테고리 분석용)
  └─ [동기 REST] → course-service     : 미신청 공고 목록 조회
  
[Kafka Consumer] enrollment.completed 수신 → 추천 갱신 트리거
```

### 왜 이 서비스만 Python/FastAPI인가 (폴리글랏 아키텍처)

| 이유 | 설명 |
|------|------|
| ML 생태계 | 추천 로직은 향후 협업 필터링·모델 서빙으로 확장될 영역 |
| 비동기 처리 | Starlette 기반. `lifespan`에서 Eureka 등록과 Kafka Consumer를 async로 기동 |
| 자동 문서화 | 별도 작업 없이 `/docs` Swagger UI 생성 |
| Pydantic 검증 | `schemas.py`에서 요청/응답 구조를 타입으로 고정 |

> 💡 **서비스가 분리돼 있으니 서비스마다 다른 언어를 쓸 수 있다** — 이것이 MSA의 실질적 장점 중 하나입니다.
> Eureka 레지스트리는 Java 서비스와 공유합니다 (`py-eureka-client` 사용).

### 공통 에러 코드

| HTTP 상태 | 상황 |
|---------|------|
| 401 Unauthorized | 토큰 없음 또는 검증 실패 (`verify_token` 의존성) |
| 422 Unprocessable Entity | Path/Query 타입 불일치 (FastAPI 기본 검증) |
| 500 Internal Server Error | 하위 서비스 호출 실패 등 |

> ℹ️ FastAPI는 검증 실패 시 Spring의 400이 아니라 **422**를 반환합니다. 프론트 에러 처리 시 주의.

### Category Enum

`schemas.py`의 `CourseCategory`는 강의 플랫폼 원본 8개를 그대로 유지합니다.

| 코드 | HomeOne 의미 |
|------|------------|
| `SECURITY` | 서울 |
| `MOBILE` | 경기 |
| `DATABASE` | 인천 |
| `OTHER` | 기타 지역 |
| `BACKEND` / `FRONTEND` / `DEVOPS` / `DATA_SCIENCE` | 미사용 (강의 플랫폼 잔재) |

---

## API 목록

| API ID | 메서드 | URI | 설명 | 인증 |
|--------|--------|-----|------|------|
| RC-001 | GET | `/api/recommend/{user_id}` | 사용자 맞춤 분양 공고 추천 | 필요 |
| RC-002 | GET | `/health` | 헬스 체크 | 불필요 |

---

## RC-001. 사용자 맞춤 분양 공고 추천

| 항목 | 내용 |
|------|------|
| API ID | RC-001 |
| HTTP 메서드 | GET |
| URI | `/api/recommend/{user_id}` |
| 설명 | 사용자의 청약 이력을 분석해 맞춤 분양 공고를 최대 5건 반환한다 |
| 인증 | 필요 (`Authorization: Bearer {token}`) |
| 호출 주체 | Vue 프론트엔드 (AI 맞춤 추천 화면) |

**요청 헤더**

| 헤더 | 필수 | 설명 |
|------|------|------|
| Authorization | ✅ | `Bearer {accessToken}` |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | user_id | Integer | ✅ | 추천 대상 사용자 ID |

**추천 알고리즘 (규칙 기반)**

```
1. enrollment-service에서 청약 이력 조회 (status = ACTIVE 만)
2. 이력이 없으면 → 신규 사용자 경로: 전체 공고 중 인기순(접수건수 DESC) 상위 5건
3. 이력이 있으면 → 신청한 공고들의 지역(category) 분석 → 최빈 지역 선택
4. 해당 지역의 미신청 공고 조회 (excludeIds = 이미 신청한 공고)
5. 접수 건수 기준 내림차순 정렬 → 상위 5건 반환
```

| 상수 | 값 | 위치 |
|------|-----|------|
| `MAX_RECOMMEND_COUNT` | 5 | `recommend_service.py` |

> ⚠️ **도메인 전환이 필요한 지점 (발표 포인트)**
> 원본은 `enrollmentCount DESC`(인기순)입니다. 그런데 **청약에서는 인기 = 경쟁률 높음 = 당첨 확률 낮음**입니다.
> 경쟁률(`enrollment_count / supply_units`) **오름차순**으로 정렬을 뒤집으면
> 스키마 변경 없이 **정렬 기준 한 줄로 도메인 의미가 완전히 바뀝니다.**
> 현재 실행 중인 코드는 아직 원본(인기순) 상태입니다.

**응답 예시** — `200 OK`

```json
{
  "userId": 1,
  "recommendedCourses": [
    {
      "id": 7,
      "title": "검암역 푸르지오 프라베뉴 59B",
      "description": "인천광역시 서구 검암동 / 시공: 대우건설",
      "category": "DATABASE",
      "price": 36000.00,
      "instructorId": 105,
      "enrollmentCount": 1200,
      "status": "ACTIVE",
      "createdAt": "2026-08-21T09:00:00"
    }
  ],
  "basedOnCategory": "DATABASE",
  "message": "DATABASE 카테고리 기반 추천 강의입니다"
}
```

**응답 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| userId | Integer | 추천 대상 사용자 ID |
| recommendedCourses | Array\<CourseResponse\> | 추천 공고 목록 (최대 5건) |
| basedOnCategory | String / null | 추천 근거가 된 지역 코드. 신규 사용자면 `null` |
| message | String | 추천 사유 설명 문구 |

**`CourseResponse` 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Integer | 공고 ID |
| title | String | 단지명 |
| description | String / null | 단지 설명 |
| category | String | 지역 코드 |
| price | Decimal | 분양가 (만원 단위) |
| instructorId | Integer | 공급사 ID |
| enrollmentCount | Integer | 현재 접수 건수 |
| status | String | ACTIVE / INACTIVE |
| createdAt | DateTime / null | 공고 등록일시 |

> ⚠️ `message` 필드가 **"추천 강의입니다"** 로 강의 플랫폼 문구입니다.
> 화면에 그대로 노출되므로 "추천 분양 공고입니다"로 교체 필요.

**에러 응답**

| 상황 | HTTP 상태 | 설명 |
|------|---------|------|
| 토큰 없음 / 검증 실패 | 401 | `verify_token` 의존성에서 차단 |
| user_id가 정수가 아님 | 422 | FastAPI 자동 검증 |
| 하위 서비스 호출 실패 | 500 | enrollment/course 서비스 장애 시 |

---

## RC-002. 헬스 체크

| 항목 | 내용 |
|------|------|
| API ID | RC-002 |
| HTTP 메서드 | GET |
| URI | `/health` |
| 설명 | 서비스 생존 여부를 반환한다 |
| 인증 | 불필요 |
| 호출 주체 | Eureka / Docker healthcheck |

**응답 예시** — `200 OK`

```json
{ "status": "UP", "service": "recommend-service" }
```

> ℹ️ 라우터에도 `/api/recommend/health`가 정의돼 있으나 `include_in_schema=False`이고,
> 경로 순서상 `/{user_id}` 보다 먼저 선언되어 있습니다.

---

## Kafka 이벤트 명세

### 수신 — `enrollment.completed`

| 항목 | 내용 |
|------|------|
| 토픽 | `enrollment.completed` |
| Producer | enrollment-service |
| Consumer | recommend-service (`app/kafka/consumer.py`) |
| 컨슈머 그룹 | `recommend-service` |
| 클라이언트 | `kafka-python` |
| 처리 | 청약 확정 시 추천 결과 갱신 트리거 |

**이벤트 페이로드**

```json
{
  "enrollmentId": 12,
  "userId": 1,
  "courseId": 3
}
```

> 💡 **왜 비동기인가** — 추천 갱신은 사용자가 즉시 기다릴 필요가 없는 작업입니다.
> 청약 처리 응답이 추천 갱신 완료를 기다리면 응답이 느려지므로 이벤트로 분리했습니다.

---

## 부록 — `feature/minseoai1` 브랜치 버전 (미머지)

청약 적격성 판정 기반으로 전면 재작성된 버전입니다. **현재 실행 중이 아니며 어느 브랜치에도 머지되지 않았습니다.**

| 메서드 | URI | 설명 |
|--------|-----|------|
| POST | `/api/recommend` | 조건 기반 추천 생성 |
| GET | `/api/recommend/{user_id}` | 사용자 추천 조회 |
| PUT | `/api/recommend/{user_id}/preferences` | 사용자 희망 조건 저장 |
| POST | `/api/recommend/notices/sync` | 공공 API 공고 동기화 |
| GET | `/api/recommend/notices` | 공고 목록 조회 |
| PUT | `/api/recommend/notices/{id}/eligibility` | 공고별 자격 요건 등록 |
| POST | `/api/recommend/interactions` | 사용자 행동 로그 저장 |

**추가 구현 내용**

- **적격성 판정 7규칙** (`eligibility_service.py`): 무주택 / 세대주 / 거주기간 / 청약통장 가입기간 / 예치금 / 소득·자산 / 생애최초 → `ELIGIBLE` / `NEEDS_CHECK` / `INELIGIBLE` 3단계
- **스코어링** (`scoring_service.py`): 희망지역 30점 + 예산 25점 + 면적 15점 + 공급유형 10점 + 적격비율 15점 + 일정 5점 = 100점
- **별도 DB** (`recommend_db`): `notices`, `housing_types`, `eligibility_rules`, `user_preferences`, `interaction_events` 5테이블

**🔴 통합 시 확인 필요한 문제**

1. `recommend_db`는 course-service의 `lecture_db.courses`와 **완전히 별개**입니다.
   현재 적재된 분양공고 1,523건을 이 버전의 추천 서비스는 **볼 수 없습니다.**
2. `PUBLIC_DATA_SERVICE_KEY` 환경변수가 비어 있으면 `notices` 테이블이 영구히 비어 추천 결과가 0건입니다.
3. `eligibility_rules` 를 채우는 자동 경로가 없어, 수동 PUT 없이는 모든 공고가 `NEEDS_CHECK` 로만 나옵니다.

---

## 참고

- Swagger UI: `http://localhost:8085/docs` (FastAPI 기본 경로. Spring 서비스와 다름)
- OpenAPI JSON: `http://localhost:8085/openapi.json`
- Eureka 등록 확인: `http://localhost:8761` → `RECOMMEND-SERVICE` UP
