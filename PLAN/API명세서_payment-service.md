# API 명세서 — payment-service

> 프로젝트명: HomeOne — B2G2C 분양 정보 통합 플랫폼  
> 담당: #3 백엔드 개발자 (청약 처리 담당)  
> 작성일: 2026-08-27  
> 서비스 포트: 8084  
> Base URL: `http://localhost:8084` (개발) / `http://[서버IP]:8080/api/payments` (Gateway 경유)

> 📌 본 명세서는 2026-08-27 11:00 기준 **실행 중인 컨테이너의 OpenAPI 스펙**(`GET http://localhost:8084/api-docs`)과
> `PaymentController.java` / `PaymentDto.java` / `PaymentService.java` 소스를 대조하여 작성했습니다.

---

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | `API-PM` |
| 대상 서비스 | `payment-service` (포트 8084) |
| 문서 버전 | v1.0 |
| 작성자 | #3 백엔드 개발자 (청약 처리 담당) |
| 최종 수정일 | 2026-08-27 |
| 대상 독자 | 프론트엔드 개발자, 타 서비스 백엔드 개발자, 평가자 |
| 원본 스펙 | OpenAPI 3.1 — `http://localhost:8084/api-docs` |
| Swagger UI | `http://localhost:8084/swagger-ui.html` |
| 관련 문서 | `ERD_전체.md`, `도메인매핑표_전체.md`, `아키텍처_설계서.md` |

> ⚠️ OpenAPI JSON 경로는 springdoc 기본값 `/v3/api-docs` 가 아니라 **`/api-docs`** 입니다
> (`application.yml` 의 `springdoc.api-docs.path: /api-docs`). FastAPI는 `/openapi.json`.

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|---------|
| v1.0 | 2026-08-27 | #3 백엔드 개발자 (청약 처리 담당) | 최초 작성. 실행 중인 컨테이너의 OpenAPI 스펙과 소스 코드를 대조하여 엔드포인트 전수 기재 |

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

청약금(접수 수수료) 납부를 처리하고, 완료 사실을 **Kafka 이벤트로 방송**합니다.
결제 완료를 enrollment-service에 직접 알리지 않고 이벤트로 던지는 것이 이 서비스의 설계 핵심입니다.

```
POST /api/payments/internal/request   ← enrollment-service가 동기 REST로 호출
  ├─ payments 레코드 생성 (status = PENDING)
  ├─ 트랜잭션 ID 발급 (실습: UUID로 PG 연동 대체)
  ├─ status → COMPLETED
  └─ [Kafka Producer] payment.completed 발행 → enrollment-service
```

### 공통 응답 형식

```json
{
  "success": true,
  "message": "성공",
  "data": { ... }
}
```

> ⚠️ `POST /api/payments/internal/request` 만 예외적으로 **래퍼 없이 `InternalPaymentResult`를 직접 반환**합니다.

### 공통 에러 코드

| HTTP 상태 | 상황 |
|---------|------|
| 400 Bad Request | 파라미터 누락 또는 형식 오류 |
| 401 Unauthorized | 인증 토큰 없음 또는 만료 |
| 404 Not Found | 해당 ID의 결제 정보 없음 |
| 500 Internal Server Error | 서버 내부 오류 |

### Status Enum (도메인 재해석)

| 코드 | HomeOne 의미 |
|------|------------|
| `PENDING` | 청약금 납부 대기 |
| `COMPLETED` | **납부 완료** → enrollment이 ACTIVE로 전환됨 |
| `FAILED` | 납부 실패 |
| `CANCELLED` | 납부 취소 |

### 데이터 모델 주의사항

`payments` 테이블은 `enrollments`와 **직접 FK가 없습니다.**
`(user_id + course_id)` 조합으로 논리적으로만 연결됩니다.

```
payments.user_id   → users.id     (FK)
payments.course_id → courses.id   (FK)
payments ⟷ enrollments : FK 없음, (user_id, course_id)로 매칭
```

> 💡 발표 예상 질문 대비: "왜 enrollment_id FK를 안 쓰나요?"
> → 서비스가 분리돼 있어 enrollment의 PK를 payment가 참조하면 서비스 간 결합이 생깁니다.
> 실습 스키마는 두 서비스가 공통으로 아는 `user_id + course_id`로 느슨하게 연결합니다.

---

## API 목록

| API ID | 메서드 | URI | 설명 | 인증 |
|--------|--------|-----|------|------|
| PM-INT-001 | POST | `/api/payments/internal/request` | 청약금 납부 요청 | 불필요 (내부) |
| PM-001 | GET | `/api/payments/{id}` | 결제 단건 조회 | 필요 |
| PM-002 | GET | `/api/payments/user/{userId}` | 사용자 결제 내역 조회 | 필요 |

---

## PM-INT-001. 청약금 납부 요청 (내부)

| 항목 | 내용 |
|------|------|
| API ID | PM-INT-001 |
| HTTP 메서드 | POST |
| URI | `/api/payments/internal/request` |
| 설명 | 청약 접수 후 청약금 납부를 처리하고 완료 이벤트를 발행한다 |
| 인증 | 불필요 (내부 서비스 간 호출) |
| 호출 주체 | **enrollment-service** (`PaymentServiceClient`, WebClient 동기 호출) |

**요청 헤더**

| 헤더 | 필수 | 값 |
|------|------|-----|
| Content-Type | ✅ | `application/json` |

**요청 Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| userId | Long | ✅ | 청약자 ID |
| courseId | Long | ✅ | 분양 공고 ID |
| amount | BigDecimal | ✅ | 납부 금액 |

```json
{
  "userId": 1,
  "courseId": 3,
  "amount": 99000
}
```

**처리 흐름**

1. `payments` 레코드 생성 (`status = PENDING`)
2. 트랜잭션 ID 발급 — 실습 환경이라 **PG 연동 없이 `UUID.randomUUID()` 로 대체, 항상 성공 처리**
3. `status → COMPLETED`
4. Kafka `payment.completed` 이벤트 발행
5. 예외 발생 시 `payment.fail()` 호출 후 `status = FAILED` 로 응답

**응답 예시** — `200 OK` (⚠️ **ApiResponse 래퍼 없이 직접 반환**)

```json
{
  "paymentId": 5,
  "status": "COMPLETED"
}
```

**응답 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| paymentId | Long | 생성된 결제 ID |
| status | String | `COMPLETED` 또는 `FAILED` |

> ⚠️ 이 API는 **실패해도 HTTP 200을 반환**하고 body의 `status`로 결과를 알립니다.
> 예외를 던지지 않고 `FAILED`를 담아 응답하므로, 호출 측은 status 값을 반드시 확인해야 합니다.

> ⚠️ **실습 한계 (발표 시 정직하게 언급 권장)**: 실제 PG사 연동이 없고 항상 성공합니다.
> 결제 실패 시나리오(잔액 부족, 카드 거절)는 구현 범위 밖입니다.

---

## PM-001. 결제 단건 조회

| 항목 | 내용 |
|------|------|
| API ID | PM-001 |
| HTTP 메서드 | GET |
| URI | `/api/payments/{id}` |
| 설명 | 특정 결제 건의 상세 정보를 반환한다 |
| 인증 | 필요 |
| 호출 주체 | Vue 프론트엔드 (납부 상세 화면) |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | id | Long | ✅ | 조회할 결제 ID |

**응답 예시** — `200 OK`

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "paymentId": 5,
    "userId": 1,
    "courseId": 3,
    "amount": 99000.00,
    "status": "COMPLETED",
    "transactionId": "7f3c1a2b-9e4d-4c8a-b1f2-6d0e5a7c3b91",
    "createdAt": "2026-08-27T11:20:03"
  }
}
```

**응답 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| paymentId | Long | 결제 고유 ID |
| userId | Long | 청약자 ID |
| courseId | Long | 분양 공고 ID |
| amount | Decimal | 납부 금액 |
| status | String | PENDING / COMPLETED / FAILED / CANCELLED |
| transactionId | String | 트랜잭션 ID (UUID, UNIQUE) |
| createdAt | DateTime | 결제 생성 일시 |

> ℹ️ 응답 필드명이 `id`가 아니라 **`paymentId`** 입니다 (다른 서비스와 다름).

**에러 응답**

| 상황 | HTTP 상태 | message |
|------|---------|---------|
| 해당 ID 결제 없음 | 400 / 500 | "결제 정보를 찾을 수 없습니다: {id}" |

> ⚠️ `IllegalArgumentException` 을 던지는데 payment-service에는 `GlobalExceptionHandler`가 없어
> 404가 아닌 400 또는 500으로 나갑니다. course-service처럼 예외 핸들러 추가 권장.

---

## PM-002. 사용자 결제 내역 조회

| 항목 | 내용 |
|------|------|
| API ID | PM-002 |
| HTTP 메서드 | GET |
| URI | `/api/payments/user/{userId}` |
| 설명 | 특정 사용자의 전체 납부 내역을 반환한다 |
| 인증 | 필요 |
| 호출 주체 | Vue 프론트엔드 (마이페이지 납부 내역) |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | userId | Long | ✅ | 조회할 사용자 ID |

**응답 예시** — `200 OK`

```json
{
  "success": true,
  "message": "성공",
  "data": [
    {
      "paymentId": 5,
      "userId": 1,
      "courseId": 3,
      "amount": 99000.00,
      "status": "COMPLETED",
      "transactionId": "7f3c1a2b-9e4d-4c8a-b1f2-6d0e5a7c3b91",
      "createdAt": "2026-08-27T11:20:03"
    }
  ]
}
```

내역이 없으면 `data`는 빈 배열 `[]` 입니다.

---

## Kafka 이벤트 명세

### 발행 — `payment.completed`

| 항목 | 내용 |
|------|------|
| 토픽 | `payment.completed` |
| Producer | payment-service (`PaymentKafkaProducer`) |
| Consumer | enrollment-service |
| 컨슈머 그룹 | `enrollment-service` |
| 발행 시점 | 납부가 COMPLETED로 확정된 직후 |

**이벤트 페이로드**

```json
{
  "paymentId": 5,
  "userId": 1,
  "courseId": 3,
  "status": "COMPLETED"
}
```

**이 이벤트가 하는 일**

```
payment-service          Kafka                enrollment-service
      │                    │                         │
      ├─ 납부 COMPLETED    │                         │
      ├──── publish ──────▶│                         │
      │                    ├──── consume ───────────▶│
      │                    │                         ├─ status: PENDING → ACTIVE
      │                    │                         ├─ course에 접수건수 +1 (REST)
      │                    │◀─── publish ────────────┤ enrollment.completed
```

> 💡 **왜 REST가 아니라 Kafka인가** — payment-service는 "납부가 끝났다"는 사실만 알리면 되고,
> enrollment의 상태 변경이 끝날 때까지 기다릴 이유가 없습니다. 두 서비스의 결합을 끊는 지점입니다.

---

## 참고

- Swagger UI: `http://localhost:8084/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8084/api-docs`  ⚠️ `/v3/api-docs` 아님
- payment-service에는 **Swagger에 노출되는 외부용 결제 생성 API가 없습니다.**
  `PaymentDto.PaymentRequest`(courseId, amount) 클래스는 정의만 되어 있고 컨트롤러에서 쓰이지 않습니다.
