# HomeOne 통합 API 명세서

> **프로젝트**: HomeOne — B2G2C 분양 정보 통합 플랫폼  
> **문서 성격**: 프로젝트 통합본 (Consolidated API Specification)

---

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | `API-ALL` |
| 문서 버전 | v1.0 |
| 작성일 | 2026-08-27 |
| 작성 주체 | HomeOne 팀 (#1 PM·프론트 / #2 백엔드 / #3 백엔드 / #4 AI) |
| 대상 독자 | 프론트엔드 개발자, 백엔드 개발자, 평가자 |
| 대상 시스템 | 마이크로서비스 5종 + 인프라 5종 |
| 총 엔드포인트 | **21개** |
| 검증 방법 | 실행 중인 컨테이너의 OpenAPI 스펙과 자동 대조 (2026-08-27 11:10, 전체 일치) |

### 문서 체계

본 통합본은 **릴리스 시점 스냅샷**입니다. 서비스별 문서가 원본(Single Source of Truth)이며,
엔드포인트를 수정할 때는 **서비스별 문서를 먼저 고치고** 통합본에 반영합니다.

| 문서 | 소유자 | 역할 |
|------|--------|------|
| **`API명세서_전체.md`** (본 문서) | 팀 공동 | 통합 인덱스 · 공통 규약 · 서비스 간 관계 |
| `API명세서_user-service.md` | #1 | user-service 상세 |
| `API명세서_course-service.md` | #2 | course-service 상세 |
| `API명세서_enrollment-service.md` | #3 | enrollment-service 상세 |
| `API명세서_payment-service.md` | #3 | payment-service 상세 |
| `API명세서_recommend-service.md` | #4 | recommend-service 상세 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|---------|
| v1.0 | 2026-08-27 | 팀 공동 | 최초 작성. 5개 서비스 21개 엔드포인트 통합, 서비스 간 호출 관계·이벤트 명세 포함 |

---

# 1. 시스템 개요

## 1.1 서비스 구성

```
                        [ Vue Frontend :3000 ]
                                 │ REST
                                 ▼
                     [ API Gateway :8080 ]  ──조회──▶ [ Eureka :8761 ]
                                 │ JWT 검증                    ▲
                                 │ X-User-Id 주입              │ 서비스 등록
        ┌────────────┬───────────┼────────────┬───────────────┴──┐
        ▼            ▼           ▼            ▼                  ▼
  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌─────────┐ ┌─────────────┐
  │   user   │ │  course  │ │enrollment │ │ payment │ │  recommend  │
  │   8081   │ │   8082   │ │   8083    │ │  8084   │ │  8085 (Py)  │
  └──────────┘ └──────────┘ └─────┬─────┘ └────┬────┘ └──────┬──────┘
                                  │ publish    │ publish     │ consume
                                  ▼            ▼             │
                            [ Kafka :9092 ] ─────────────────┘
                                  │
                                  ▼
                          [ MariaDB :3306→3379 ]
                          (단일 인스턴스, 테이블 단위 분리)
```

| 구성요소 | 포트 | 역할 | 기술 | API 명세 대상 |
|---------|------|------|------|-------------|
| api-gateway | 8080 | 단일 진입점, JWT 검증, 헤더 주입 | Spring Cloud Gateway | ✕ 인프라 (사전 빌드 이미지) |
| eureka-server | 8761 | 서비스 등록·탐색 | Spring Cloud Netflix | ✕ 인프라 |
| auth-server | 9000 | OAuth2 토큰 발급 | Spring Authorization Server | ✕ 인프라 (사전 빌드 이미지) |
| **user-service** | 8081 | 회원 가입·조회 | Spring Boot 3.4 / JPA | ✅ 4개 |
| **course-service** | 8082 | 분양 공고 조회·등록 | Spring Boot 3.4 / JPA | ✅ 8개 |
| **enrollment-service** | 8083 | 청약 접수·상태 관리 | Spring Boot 3.4 / JPA / Kafka | ✅ 4개 |
| **payment-service** | 8084 | 청약금 납부 처리 | Spring Boot 3.4 / JPA / Kafka | ✅ 3개 |
| **recommend-service** | 8085 | 맞춤 공고 추천 | **Python / FastAPI** | ✅ 2개 |
| kafka | 9092 | 비동기 이벤트 버스 | Kafka 7.7 (KRaft) | ✕ |
| mariadb | 3306→3379 | 데이터 저장 | MariaDB 11.2 | ✕ |

> ℹ️ **DB per Service가 아닙니다.** 실습 환경 제약으로 MariaDB 단일 인스턴스에 **테이블 단위 분리**입니다.
> 다만 서비스들은 다른 서비스의 테이블을 직접 조회하지 않고 **반드시 API로만** 데이터를 요청합니다.

## 1.2 API 요약

| 서비스 | 접두사 | 공개 API | 내부 API | 계 | 담당 |
|--------|--------|---------|---------|-----|------|
| user-service | `US-` | 3 | 1 | 4 | #1 |
| course-service | `CS-` | 4 | 4 | 8 | #2 |
| enrollment-service | `EN-` | 3 | 1 | 4 | #3 |
| payment-service | `PM-` | 2 | 1 | 3 | #3 |
| recommend-service | `RC-` | 2 | 0 | 2 | #4 |
| | | **14** | **7** | **21** | |

- **공개 API**: 프론트엔드가 Gateway를 통해 호출
- **내부 API**: 다른 마이크로서비스가 WebClient로 호출 (`/internal/` 경로)

---

# 2. 공통 규약

## 2.1 인증

개별 서비스가 토큰을 발급하지 않고 **auth-server(9000)** 가 담당합니다.

```
1. 로그인          Client ──▶ auth-server:9000        (OAuth2 Authorization Code)
2. 토큰 발급       auth-server ──▶ Client             (JWT Access Token)
3. API 호출        Client ──▶ api-gateway:8080        [Authorization: Bearer {token}]
4. 토큰 검증       gateway ──▶ auth-server:9000/oauth2/jwks   (공개키로 서명 검증)
5. 헤더 주입       gateway ──▶ 각 서비스              [X-User-Id / X-User-Email / X-User-Role]
```

| 항목 | 값 |
|------|-----|
| 토큰 형식 | JWT (Bearer) |
| 요청 헤더 | `Authorization: Bearer {accessToken}` |
| JWK Set URI | `http://auth-server:9000/oauth2/jwks` |
| 사용자 인증 | OAuth2 Authorization Code Grant |
| 서비스 간 인증 | Client Credentials Grant (`service.read` 스코프) |

### Gateway 주입 헤더

| 헤더 | 설명 | 사용하는 API |
|------|------|------------|
| `X-User-Id` | JWT에서 추출한 사용자 ID | `US-003`, `EN-001`, `EN-002` |
| `X-User-Email` | 사용자 이메일 | — |
| `X-User-Role` | STUDENT(청약자) / INSTRUCTOR(공급사) | `CS-004` 권한 판정 |

> 🔴 **알려진 이슈 — issuer 설정 불일치**  
> `docker-compose.yml` 기준 `api-gateway`·`recommend-service` 의 issuer는 `http://localhost:8080`,
> `user`·`course`·`enrollment`·`payment` 는 `http://auth-server:9000` 으로 서로 다릅니다.
> 이 때문에 Gateway 경유 시 401이 발생하며, 현재 프론트는 `vite.config.js` 프록시로
> course-service(8082)를 직접 호출해 우회 중입니다. 상세는 §8 참조.

## 2.2 공통 응답 형식

모든 **공개 API**는 아래 래퍼를 사용합니다.

```json
{
  "success": true,
  "message": "성공",
  "data": { }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| success | Boolean | 요청 성공 여부 |
| message | String | 결과 메시지 |
| data | Object / Array / null | 실제 응답 데이터 |

### 래퍼를 쓰지 않는 API (예외)

**내부 API는 래퍼 없이 본문을 직접 반환**합니다. 호출 측이 서비스이므로 파싱 단계를 줄이기 위함입니다.

| API ID | URI | 반환 타입 |
|--------|-----|---------|
| US-INT-001 | `GET /api/users/internal/{id}` | `UserResponse` |
| CS-INT-001 | `GET /api/courses/internal/exists/{id}` | `boolean` (raw) |
| CS-INT-002 | `GET /api/courses/internal/{id}` | `CourseResponse` |
| CS-INT-004 | `GET /api/courses/internal/recommend` | `List<CourseResponse>` |
| EN-INT-001 | `GET /api/enrollments/internal/history/{userId}` | `EnrollmentHistoryResponse` |
| PM-INT-001 | `POST /api/payments/internal/request` | `InternalPaymentResult` |
| RC-001 | `GET /api/recommend/{user_id}` | `RecommendResponse` (FastAPI, 래퍼 미사용) |

## 2.3 공통 에러 코드

| HTTP 상태 | 의미 | 대표 상황 |
|---------|------|---------|
| 400 Bad Request | 요청 오류 | 필수 파라미터 누락, 검증 실패, 중복 청약, `X-User-Id` 헤더 없음 |
| 401 Unauthorized | 인증 실패 | 토큰 없음·만료·서명 검증 실패 |
| 403 Forbidden | 권한 없음 | 공급사 전용 API에 일반 사용자 접근 |
| 404 Not Found | 리소스 없음 | 해당 ID의 공고·사용자 없음 |
| 405 Method Not Allowed | 메서드 불일치 | GET 전용 경로에 POST 호출 |
| 415 Unsupported Media Type | 미디어 타입 오류 | `Content-Type` 누락 |
| **422 Unprocessable Entity** | 검증 실패 (**FastAPI만**) | Path 파라미터 타입 불일치 |
| 500 Internal Server Error | 서버 오류 | 하위 서비스 호출 실패 등 |

**에러 응답 형식**

```json
{
  "success": false,
  "message": "분양 공고를 찾을 수 없습니다: 9999",
  "data": null
}
```

> ⚠️ **서비스별 예외 처리 수준이 다릅니다.**
> `course-service`만 `GlobalExceptionHandler`로 404/405/415/400을 정확히 분기합니다(2026-08-27 보완).
> `user`·`enrollment`·`payment` 는 핸들러가 없어 404가 400/500으로 나갈 수 있습니다.
> `recommend-service`(FastAPI)는 Spring의 400 대신 **422**를 반환합니다.

## 2.4 Enum 정의 — 도메인 매핑

교수님이 제공한 DDL(`init-db/01_init.sql`)을 변경하지 않고 **의미만 재해석**했습니다.
컬럼명·enum 값은 강의 플랫폼 원본 그대로이며, 도메인 의미만 분양으로 치환됩니다.

### `users.role`

| 코드 | 원본 | HomeOne 의미 |
|------|------|------------|
| `STUDENT` | 수강생 | **청약 신청자 (C)** |
| `INSTRUCTOR` | 강사 | **공급사 · 시행사 (B)** |

### `courses.category` — 공급 지역

| 코드 | 원본 | HomeOne 의미 | 적재 건수 |
|------|------|------------|---------|
| `SECURITY` | 보안 | **서울** | 292 |
| `MOBILE` | 모바일 | **경기** | 982 |
| `DATABASE` | 데이터베이스 | **인천** | 249 |
| `OTHER` | 기타 | 기타 지역 | 0 |

> ⚠️ `BACKEND`, `FRONTEND`, `DEVOPS`, `DATA_SCIENCE` 는 **사용하지 않습니다.**

### `enrollments.status` — 청약 상태

| 코드 | HomeOne 의미 | 화면 표시 |
|------|------------|---------|
| `PENDING` | 접수완료 (청약금 납부 대기) | 🟡 접수완료 |
| `ACTIVE` | 접수확정 (납부 완료) | 🟢 접수확정 |
| `CANCELLED` | 청약 취소 | ⚪ 취소 |

### `payments.status` — 납부 상태

| 코드 | HomeOne 의미 |
|------|------------|
| `PENDING` | 납부 대기 |
| `COMPLETED` | 납부 완료 → enrollment이 ACTIVE로 전환 |
| `FAILED` | 납부 실패 |
| `CANCELLED` | 납부 취소 |

### `courses.status` — 공고 상태

| 코드 | HomeOne 의미 |
|------|------------|
| `ACTIVE` | 공고 공개 (접수 가능) |
| `INACTIVE` | 공고 비공개 (마감) |

## 2.5 데이터 규약

| 항목 | 규약 |
|------|------|
| **금액 단위** | `price`, `amount` 는 **만원 단위**. `48630` = 4억 8,630만원. 표시 변환은 프론트 담당 |
| 날짜 형식 | ISO-8601 (`2026-08-27T11:20:00`) |
| ID 타입 | `BIGINT` / Java `Long` / Python `int` |
| 문자 인코딩 | UTF-8 (`utf8mb4`) |
| 페이징 | **미지원.** 전체 목록을 한 번에 반환 (§8 참조) |

> 📌 **`courses.description` 특수 규약**  
> 스키마 변경이 금지되어 분양 도메인 고유 필드 18종을 `description`(TEXT)에 **JSON 문자열로 저장**합니다.
> 프론트는 `JSON.parse()` 후 사용하며, 실패 시 `{}` 로 폴백합니다.
>
> ```
> source, sourceLabel, summary, housingType, supplyType, region, address,
> unitType, areaM2, totalUnits, announcementDate, applyStart, applyEnd,
> resultDate, moveInYm, contact, builder, detailUrl
> ```

## 2.6 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| Base Path | `/api/{서비스 복수형}` | `/api/courses` |
| 내부 API | `/api/{리소스}/internal/...` | `/api/courses/internal/exists/{id}` |
| API ID | `{서비스코드}-{일련번호}` / 내부는 `-INT-` | `CS-001`, `CS-INT-001` |
| JSON 필드 | camelCase | `enrollmentCount` |
| DB 컬럼 | snake_case | `enrollment_count` |
| Kafka 토픽 | `{도메인}.{과거형 동사}` | `payment.completed` |

---

# 3. 전체 API 인덱스

21개 엔드포인트 전체입니다. 상세는 §6 및 서비스별 문서를 참조하세요.

| API ID | 메서드 | URI | 설명 | 인증 | 호출 주체 |
|--------|--------|-----|------|------|---------|
| **US-001** | POST | `/api/users/register` | 회원가입 | 불필요 | 프론트 |
| **US-002** | GET | `/api/users/{id}` | 사용자 조회 | 필요 | 프론트 |
| **US-003** | GET | `/api/users/me` | 내 정보 조회 | 필요 (X-User-Id) | 프론트 |
| US-INT-001 | GET | `/api/users/internal/{id}` | 사용자 조회 (내부) | 내부 | 타 서비스 |
| **CS-001** | GET | `/api/courses` | 전체 분양 공고 목록 | 불필요 | 프론트 |
| **CS-002** | GET | `/api/courses/{id}` | 분양 공고 상세 | 불필요 | 프론트 |
| **CS-003** | GET | `/api/courses/category/{category}` | 지역별 공고 목록 | 불필요 | 프론트 |
| **CS-004** | POST | `/api/courses` | 신규 공고 등록 | 필요 (공급사) | 프론트 |
| CS-INT-001 | GET | `/api/courses/internal/exists/{id}` | 공고 존재 확인 | 내부 | enrollment |
| CS-INT-002 | GET | `/api/courses/internal/{id}` | 공고 상세 (내부) | 내부 | enrollment |
| CS-INT-003 | POST | `/api/courses/internal/{id}/enrollment-count` | 접수 건수 증가 | 내부 | enrollment |
| CS-INT-004 | GET | `/api/courses/internal/recommend` | 추천용 미신청 공고 | 내부 | recommend |
| **EN-001** | POST | `/api/enrollments` | 청약 신청 | 필요 (X-User-Id) | 프론트 |
| **EN-002** | GET | `/api/enrollments/my` | 내 청약 내역 | 필요 (X-User-Id) | 프론트 |
| **EN-003** | GET | `/api/enrollments/user/{userId}` | 특정 사용자 청약 내역 | 필요 | 프론트/운영 |
| EN-INT-001 | GET | `/api/enrollments/internal/history/{userId}` | 청약 이력 (추천용) | 내부 | recommend |
| PM-INT-001 | POST | `/api/payments/internal/request` | 청약금 납부 요청 | 내부 | enrollment |
| **PM-001** | GET | `/api/payments/{id}` | 결제 단건 조회 | 필요 | 프론트 |
| **PM-002** | GET | `/api/payments/user/{userId}` | 사용자 결제 내역 | 필요 | 프론트 |
| **RC-001** | GET | `/api/recommend/{user_id}` | 맞춤 공고 추천 | 필요 | 프론트 |
| RC-002 | GET | `/health` | 헬스 체크 | 불필요 | Eureka/Docker |

---

# 4. 서비스 간 호출 관계

## 4.1 동기 호출 매트릭스 (WebClient / REST)

행 = 호출하는 쪽, 열 = 호출받는 쪽.

| 호출자 ＼ 피호출자 | user | course | enrollment | payment | recommend |
|---|---|---|---|---|---|
| **프론트엔드** | US-001~003 | CS-001~004 | EN-001~003 | PM-001~002 | RC-001 |
| **user** | — | — | — | — | — |
| **course** | — | — | — | — | — |
| **enrollment** | — | CS-INT-001<br>CS-INT-002<br>CS-INT-003 | — | PM-INT-001 | — |
| **payment** | — | — | — | — | — |
| **recommend** | — | CS-INT-004 | EN-INT-001 | — | — |

**읽는 법**
- `course`·`payment`·`user` 는 **다른 서비스를 호출하지 않습니다** (말단 서비스)
- `enrollment` 가 가장 많은 의존을 가집니다 (course 3건 + payment 1건)
- **순환 의존이 없습니다** — enrollment → course/payment, recommend → course/enrollment 단방향

## 4.2 비동기 이벤트 (Kafka)

| 토픽 | Producer | Consumer | 컨슈머 그룹 | 트리거 | 처리 |
|------|----------|----------|-----------|--------|------|
| `payment.completed` | payment | enrollment | `enrollment-service` | 납부 COMPLETED 확정 | status `PENDING` → `ACTIVE` |
| `enrollment.completed` | enrollment | recommend | `recommend-service` | 청약 ACTIVE 전환 | 추천 결과 갱신 |

## 4.3 동기 / 비동기 선택 기준

| 구간 | 방식 | 이유 |
|------|------|------|
| 프론트 → Gateway → 각 서비스 | **REST** | 사용자가 화면에서 즉시 응답을 기다림 |
| enrollment → course (존재 확인) | **REST** | 신청 처리에 결과가 당장 필요 |
| enrollment → payment (납부 요청) | **REST** | 납부 결과를 즉시 알아야 함 |
| recommend → course / enrollment | **REST** | 추천 계산에 데이터가 당장 필요 |
| payment → enrollment (상태 변경) | **Kafka** | 납부가 상태 변경 완료를 기다릴 이유 없음 |
| enrollment → recommend (추천 갱신) | **Kafka** | 추천 갱신은 늦어도 되는 작업 |

> 💡 **한 줄 원칙**: 결과가 **당장 필요하면 REST**, 알리기만 하면 되면 **Kafka**.

---

# 5. 유스케이스별 API 호출 흐름

API 명세서는 서비스 단위로 나누지만, **기능은 여러 서비스에 걸칩니다.**
아래는 기능 → API 매핑입니다. 발표 데모 시나리오와 동일합니다.

## UC-1. 회원가입 · 로그인

```
① 회원가입    프론트 → US-001  POST /api/users/register        → 201 Created
② 로그인      프론트 → auth-server:9000 (OAuth2)               → Access Token
③ 내 정보     프론트 → US-003  GET  /api/users/me               → 사용자 정보
```

## UC-2. 분양 공고 조회 (Sprint 1 핵심)

```
① 목록        프론트 → CS-001  GET /api/courses                 → 1,523건
② 지역 필터   프론트 → CS-003  GET /api/courses/category/MOBILE  → 경기 982건
③ 상세        프론트 → CS-002  GET /api/courses/{id}             → 단지 상세
```

## UC-3. 청약 신청 (Sprint 2 핵심) — **MSA 통신 3종이 모두 등장**

```
① 신청 요청
   프론트 ──[POST]──▶ EN-001  POST /api/enrollments  { courseId: 3 }
                        │
② 공고 검증 (동기 REST)  ├──▶ CS-INT-001  GET /api/courses/internal/exists/3
                        │                                   → true
③ 접수 생성             ├──▶ enrollments INSERT (status = PENDING)
                        │
④ 납부 요청 (동기 REST)  └──▶ PM-INT-001  POST /api/payments/internal/request
                                          { userId, courseId, amount }
                                                    │
⑤ 납부 처리                                        ├─ payments INSERT (PENDING)
                                                   ├─ transactionId 발급 (UUID)
                                                   ├─ status → COMPLETED
                                                   │
⑥ 이벤트 발행 (비동기)                             └──[Kafka]──▶ payment.completed
                                                                       │
⑦ 상태 변경                          enrollment ◀──[consume]──────────┘
                                          ├─ status: PENDING → ACTIVE   🟡 → 🟢
                                          ├──▶ CS-INT-003  접수 건수 +1
                                          │
⑧ 이벤트 발행 (비동기)                    └──[Kafka]──▶ enrollment.completed
                                                              │
⑨ 추천 갱신                          recommend ◀──[consume]───┘
```

**응답 시점**: 사용자는 ④까지 완료된 시점에 `201 Created` + `status: PENDING` 을 받습니다.
⑦의 `ACTIVE` 전환은 **비동기로 뒤따르므로**, 프론트는 내역 화면을 다시 조회해야 🟢 접수확정이 보입니다.

## UC-4. 내 청약 내역 조회

```
① 내역 조회   프론트 → EN-002  GET /api/enrollments/my
                        │
② 공고 조립   각 건마다 └──▶ CS-INT-002  GET /api/courses/internal/{courseId}
                                          → title, price, 공급사명 등을 붙여 반환
```

> 💡 enrollment는 courses 테이블을 **직접 조회하지 않습니다.** 반드시 course-service의 API를 호출합니다.
> "DB를 공유하지 않는다"는 MSA 원칙이 코드로 드러나는 지점입니다.

## UC-5. AI 맞춤 추천

```
① 추천 요청   프론트 → RC-001  GET /api/recommend/{userId}
                        │
② 이력 조회   (동기 REST) ├──▶ EN-INT-001  GET /api/enrollments/internal/history/{userId}
                        │                     → activeCourseIds: [3, 7, 15]
③ 지역 분석             ├─ 신청 공고들의 category 최빈값 산출
                        │
④ 후보 조회   (동기 REST) └──▶ CS-INT-004  GET /api/courses/internal/recommend
                                            ?category=DATABASE&excludeIds=3,7,15
⑤ 정렬·상위 5건 반환
```

## UC → API 커버리지 매트릭스

| 유스케이스 | user | course | enrollment | payment | recommend |
|---|---|---|---|---|---|
| UC-1 회원가입·로그인 | ✅ | | | | |
| UC-2 공고 조회 | | ✅ | | | |
| UC-3 청약 신청 | | ✅ | ✅ | ✅ | ✅ |
| UC-4 내 청약 내역 | | ✅ | ✅ | | |
| UC-5 AI 추천 | | ✅ | ✅ | | ✅ |

---

# 6. 서비스별 API 상세

각 API의 전체 요청/응답 예시는 서비스별 문서에 있습니다. 여기서는 **계약 핵심**만 정리합니다.

## 6.1 user-service (8081) — 담당 #1

| API ID | 메서드 · URI | 요청 | 응답 (`data`) | 주요 에러 |
|--------|------------|------|-------------|---------|
| US-001 | POST `/api/users/register` | Body: `email`✅, `password`✅(8자↑), `name`✅, `role` | `id, email, name, role, createdAt` | 400 이메일 형식/비밀번호 길이/중복 |
| US-002 | GET `/api/users/{id}` | Path: `id`✅ | 동일 | 404 사용자 없음 |
| US-003 | GET `/api/users/me` | Header: `X-User-Id`✅ | 동일 | 400 헤더 없음 / 401 토큰 |
| US-INT-001 | GET `/api/users/internal/{id}` | Path: `id`✅ | **래퍼 없이** `UserResponse` | 404 |

> 🔒 `password` 는 어떤 응답에도 포함되지 않습니다.

## 6.2 course-service (8082) — 담당 #2

| API ID | 메서드 · URI | 요청 | 응답 (`data`) | 주요 에러 |
|--------|------------|------|-------------|---------|
| CS-001 | GET `/api/courses` | 없음 | `List<CourseResponse>` (1,523건) | — |
| CS-002 | GET `/api/courses/{id}` | Path: `id`✅ | `CourseResponse` | 404 공고 없음 |
| CS-003 | GET `/api/courses/category/{category}` | Path: `category`✅ | `List<CourseResponse>` | 400 잘못된 enum |
| CS-004 | POST `/api/courses` | Header: `X-User-Id`✅ / Body: `title`✅, `description`, `category`✅, `price`✅ | `CourseResponse` (201) | 401·403 공급사 아님 |
| CS-INT-001 | GET `/api/courses/internal/exists/{id}` | Path: `id`✅ | **raw** `true` / `false` | — |
| CS-INT-002 | GET `/api/courses/internal/{id}` | Path: `id`✅ | **래퍼 없이** `CourseResponse` | 404 |
| CS-INT-003 | POST `/api/courses/internal/{id}/enrollment-count` | Path: `id`✅ | `Void` | 404 |
| CS-INT-004 | GET `/api/courses/internal/recommend` | Query: `category`✅, `excludeIds` | **래퍼 없이** `List<CourseResponse>` | — |

**`CourseResponse` 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 공고 ID |
| title | String | 단지명 (예: `검암역 푸르지오 프라베뉴 84A`) |
| description | String | **JSON 문자열** — 주소·시공사·접수일정 등 18필드 (§2.5 참조) |
| category | String | 지역 코드 (SECURITY/MOBILE/DATABASE/OTHER) |
| price | Decimal | 분양가 **만원 단위** |
| instructorId | Long | 공급사 ID (users.id) |
| enrollmentCount | Integer | 현재 접수 건수 |
| status | String | ACTIVE / INACTIVE |
| createdAt | DateTime | 공고 등록일시 |

## 6.3 enrollment-service (8083) — 담당 #3

| API ID | 메서드 · URI | 요청 | 응답 (`data`) | 주요 에러 |
|--------|------------|------|-------------|---------|
| EN-001 | POST `/api/enrollments` | Header: `X-User-Id`✅ / Body: `courseId`✅ | `EnrollmentResponse` (201, status=PENDING) | 400 없는 공고 / 400 중복 청약 |
| EN-002 | GET `/api/enrollments/my` | Header: `X-User-Id`✅ | `List<EnrollmentResponse>` (+`course` 조립) | 400 헤더 없음 |
| EN-003 | GET `/api/enrollments/user/{userId}` | Path: `userId`✅ | 동일 | — |
| EN-INT-001 | GET `/api/enrollments/internal/history/{userId}` | Path: `userId`✅ | **래퍼 없이** `{userId, activeCourseIds}` | — |

**`EnrollmentResponse` 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 청약 접수 ID |
| userId | Long | 청약자 ID |
| courseId | Long | 분양 공고 ID |
| status | String | PENDING / ACTIVE / CANCELLED |
| createdAt | DateTime | 접수 일시 |
| course | Object / null | 공고 요약. **EN-001 응답에서는 `null`**, EN-002/003에서만 채워짐 |

**제약**: `UNIQUE (user_id, course_id)` — 동일 사용자가 같은 공고에 중복 청약 불가

## 6.4 payment-service (8084) — 담당 #3

| API ID | 메서드 · URI | 요청 | 응답 | 주요 에러 |
|--------|------------|------|------|---------|
| PM-INT-001 | POST `/api/payments/internal/request` | Body: `userId`✅, `courseId`✅, `amount`✅ | **래퍼 없이** `{paymentId, status}` | 실패해도 **200** + `status: FAILED` |
| PM-001 | GET `/api/payments/{id}` | Path: `id`✅ | `PaymentResponse` | 400/500 결제 없음 |
| PM-002 | GET `/api/payments/user/{userId}` | Path: `userId`✅ | `List<PaymentResponse>` | — |

**`PaymentResponse` 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| **paymentId** | Long | 결제 ID (다른 서비스와 달리 `id`가 아님) |
| userId / courseId | Long | 청약자 / 공고 ID |
| amount | Decimal | 납부 금액 |
| status | String | PENDING / COMPLETED / FAILED / CANCELLED |
| transactionId | String | UUID, UNIQUE |
| createdAt | DateTime | 결제 생성 일시 |

> ⚠️ `payments` 는 `enrollments` 와 **직접 FK가 없습니다.** `(user_id, course_id)` 조합으로 논리 연결됩니다.

## 6.5 recommend-service (8085) — 담당 #4

| API ID | 메서드 · URI | 요청 | 응답 | 주요 에러 |
|--------|------------|------|------|---------|
| RC-001 | GET `/api/recommend/{user_id}` | Path: `user_id`✅ / Header: `Authorization`✅ | `{userId, recommendedCourses[], basedOnCategory, message}` | 401 토큰 / **422** 타입 오류 |
| RC-002 | GET `/health` | 없음 | `{status: "UP", service: "recommend-service"}` | — |

**추천 규칙 (규칙 기반, 최대 5건)**

```
1. 청약 이력 조회 (ACTIVE만)
2. 이력 없음 → 전체 공고 인기순(접수건수 DESC) 상위 5건
3. 이력 있음 → 신청 공고들의 지역(category) 최빈값 산출
4. 해당 지역의 미신청 공고 조회 (excludeIds)
5. 접수 건수 내림차순 정렬 → 상위 5건
```

> ⚠️ **도메인 전환 미완**: 청약에서는 **인기 = 경쟁률 높음 = 당첨 확률 낮음** 입니다.
> 경쟁률 오름차순으로 정렬을 뒤집어야 도메인에 맞습니다. 현재는 원본(인기순) 상태입니다.

> ⚠️ **버전 2종 존재**: 현재 실행 중인 것은 템플릿 원본(2개). `feature/minseoai1` 브랜치에
> 청약 적격성 기반으로 재작성된 버전(7개)이 있으나 **미머지** 상태입니다. 상세는 서비스별 문서 부록 참조.

---

# 7. 비동기 이벤트 명세

Kafka 7.7 (KRaft 모드), 브로커 `kafka:9092`. 토픽 2개, 파티션 3개씩.

## 7.1 `payment.completed`

| 항목 | 내용 |
|------|------|
| Producer | payment-service (`PaymentKafkaProducer`) |
| Consumer | enrollment-service (`EnrollmentKafkaConsumer`) |
| 컨슈머 그룹 | `enrollment-service` |
| 발행 시점 | 납부가 COMPLETED로 확정된 직후 |
| 수신 처리 | `activateEnrollment(userId, courseId)` → status `PENDING` → `ACTIVE` |

```json
{ "paymentId": 5, "userId": 1, "courseId": 3, "status": "COMPLETED" }
```

> ℹ️ payment-service가 `JsonSerializer` type header 없이 발행하므로,
> Consumer는 DTO가 아닌 `Map<String, Object>` 로 수신해 파싱합니다.

## 7.2 `enrollment.completed`

| 항목 | 내용 |
|------|------|
| Producer | enrollment-service (`EnrollmentKafkaProducer`) |
| Consumer | recommend-service (`kafka-python`) |
| 컨슈머 그룹 | `recommend-service` |
| 발행 시점 | 청약이 ACTIVE로 전환된 직후 |
| 메시지 키 | `userId` (String) |
| 수신 처리 | 추천 결과 갱신 트리거 |

```json
{ "enrollmentId": 12, "userId": 1, "courseId": 3 }
```

## 7.3 검증 방법

```bash
# 토픽 목록
docker exec lecture-kafka kafka-topics --bootstrap-server localhost:9092 --list

# 컨슈머 그룹 및 오프셋 (메시지가 실제로 흘렀는지 확인)
docker exec lecture-kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 --group enrollment-service --describe
```

**2026-08-27 11:05 기준 상태**

| 항목 | 상태 |
|------|------|
| 토픽 생성 | ✅ `payment.completed`, `enrollment.completed` |
| 컨슈머 구독 | ✅ `enrollment-service`, `recommend-service` 모두 연결됨 |
| **LOG-END-OFFSET** | 🔴 **0** — 아직 이벤트가 한 건도 발행되지 않음 |

> 🔴 발표 전에 **청약 신청 1건을 실제로 태워야** 오프셋이 올라가고 Kafka 흐름이 증명됩니다.

---

# 8. 알려진 이슈 및 제약

발표 시 "한계 · 개선 방향" 슬라이드의 근거 자료입니다. 전부 코드로 확인된 사실입니다.

## 8.1 인증 · 게이트웨이

| # | 이슈 | 상세 | 영향 |
|---|------|------|------|
| 1 | **issuer 설정 불일치** | gateway·recommend = `localhost:8080` / user·course·enrollment·payment = `auth-server:9000` | Gateway 경유 시 401. 프론트가 vite 프록시로 8082 직접 호출 중 |
| 2 | **course-service 인증 비활성화** | `SecurityConfig` 가 `.anyRequest().permitAll()`, OAuth2 블록 전체 주석 처리 | `POST /api/courses` 가 무인증 개방 |
| 3 | Gateway·Auth 소스 부재 | 사전 빌드 이미지(`msa-lecture/api-gateway:1.0`)만 제공 | 라우팅·보안 규칙을 팀에서 수정 불가 → 1번의 근본 원인 |

## 8.2 도메인 전환 미완

| # | 이슈 | 상세 |
|---|------|------|
| 4 | 에러 메시지가 강의 플랫폼 문구 | `"강의를 찾을 수 없습니다"`, `"이미 수강신청한 강의입니다"`, `"...추천 강의입니다"` |
| 5 | `category` enum이 강의 카테고리 | 지역을 `SECURITY/MOBILE/DATABASE` 로 억지 매핑 → **수도권 3곳 외 표현 불가** (전국 2,903건을 1,523건으로 축소한 이유) |
| 6 | 결제 금액 하드코딩 | `EnrollmentService.enroll()` 이 `BigDecimal.valueOf(99000)` 고정. 분양가와 무관 |
| 7 | 추천 정렬 방향 | 인기순(`enrollmentCount DESC`) — 청약 도메인에서는 경쟁률 오름차순이 맞음 |

## 8.3 아키텍처 제약

| # | 제약 | 사유 / 개선 방향 |
|---|------|---------------|
| 8 | **DB per Service 미적용** | 실습 환경이 MariaDB 단일 인스턴스. 테이블 단위 분리로 대체. 운영 시 서비스별 DB 분리 |
| 9 | 스키마 변경 금지 | 제공 DDL 고정 → `courses.description` 에 JSON 18필드 저장으로 우회 |
| 10 | 페이징 미지원 | `GET /api/courses` 가 1,523건을 한 번에 반환. 운영 시 `page`/`size` 필요 |
| 11 | 예외 처리 수준 불균일 | `GlobalExceptionHandler` 가 course-service에만 존재 |
| 12 | PG 연동 없음 | payment는 UUID 발급으로 대체, **항상 성공**. 실패 시나리오 미구현 |
| 13 | 서비스 간 인증 미적용 | 내부 API가 `permitAll` 상태. 설계상으로는 Client Credentials + `service.read` 스코프 |

## 8.4 통합 미완 (2026-08-27 11:00 기준)

| # | 이슈 |
|---|------|
| 14 | `feature/minseoai1`(recommend 재작성)이 어느 브랜치에도 머지되지 않음 |
| 15 | 재작성 버전은 별도 `recommend_db` 사용 → 적재된 공고 1,523건을 볼 수 없음 |
| 16 | Kafka 이벤트 실제 발행 이력 0건 (LOG-END-OFFSET = 0) |

---

# 부록 A. 검증 방법

## A.1 OpenAPI 스펙 확인

| 서비스 | Swagger UI | OpenAPI JSON |
|--------|-----------|-------------|
| user | `http://localhost:8081/swagger-ui.html` | `http://localhost:8081/api-docs` |
| course | `http://localhost:8082/swagger-ui.html` | `http://localhost:8082/api-docs` |
| enrollment | `http://localhost:8083/swagger-ui.html` | `http://localhost:8083/api-docs` |
| payment | `http://localhost:8084/swagger-ui.html` | `http://localhost:8084/api-docs` |
| recommend | `http://localhost:8085/docs` | `http://localhost:8085/openapi.json` |

> ⚠️ Spring 서비스의 OpenAPI 경로는 기본값 `/v3/api-docs` 가 **아니라 `/api-docs`** 입니다.
> `application.yml` 에 `springdoc.api-docs.path: /api-docs` 로 지정되어 있습니다.

## A.2 인프라 확인

```bash
# 실행 중인 컨테이너
docker ps

# Eureka 등록 서비스 (7개 UP)
curl -s -H "Accept: application/json" http://localhost:8761/eureka/apps

# DB 적재 건수
docker exec lecturedb mariadb -umanager -pSqlDba-1 lecture_db \
  -e "SELECT COUNT(*) FROM courses;"
```

## A.3 명세서 ↔ 실제 서버 대조

본 문서의 21개 엔드포인트는 실행 중인 컨테이너의 OpenAPI 스펙과 자동 대조하여
**2026-08-27 11:10 기준 전체 일치**를 확인했습니다.

| 서비스 | 서버 | 문서 | 결과 |
|--------|------|------|------|
| user-service | 4 | 4 | ✅ |
| course-service | 8 | 8 | ✅ |
| enrollment-service | 4 | 4 | ✅ |
| payment-service | 3 | 3 | ✅ |
| recommend-service | 2 | 2 | ✅ |
| **계** | **21** | **21** | **✅** |

---

# 부록 B. 데이터 모델 (ERD 요약)

MariaDB `lecture_db`, 4개 테이블. 상세는 `ERD_전체.md` 참조.

```
users ─┬─(1:N instructor_id)─▶ courses ─┬─(1:N course_id)─▶ enrollments
       ├─(1:N user_id)───────▶ enrollments                  ▲
       ├─(1:N user_id)───────▶ payments                     │
       └                       courses ──(1:N course_id)──▶ payments
                                                            │
                        payments ⟷ enrollments : FK 없음, (user_id, course_id) 로 논리 연결
```

| 테이블 | HomeOne 의미 | 주요 컬럼 | 건수 |
|--------|------------|---------|------|
| `users` | 청약자(C) / 공급사(B) | id, email, name, role | 7 |
| `courses` | 분양 공고 (단지·주택형) | id, title, description(JSON), category, price, instructor_id, enrollment_count, status | **1,523** |
| `enrollments` | 청약 신청 | id, user_id, course_id, status | — |
| `payments` | 청약금 납부 | id, user_id, course_id, amount, status, transaction_id | — |

**공급사 시드** (`init-db/02_seed_suppliers.sql`, id 101~105)
한국토지주택공사 / 경기주택도시공사 / 포스코이앤씨 / 지에스건설 / 대우건설

**공고 시드** (`init-db/03_seed_courses.sql`)
청약홈(한국부동산원) + LH청약플러스 공공 API 실데이터. 경기 982 / 서울 292 / 인천 249.

---

*본 문서는 실행 중인 서비스의 OpenAPI 스펙과 커밋된 소스 코드를 근거로 작성되었습니다.*
