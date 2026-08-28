# API 명세서 — enrollment-service

> 프로젝트명: HomeOne — B2G2C 분양 정보 통합 플랫폼  
> 담당: #3 백엔드 개발자 (청약 처리 담당)  
> 작성일: 2026-08-27  
> 서비스 포트: 8083  
> Base URL: `http://localhost:8083` (개발) / `http://[서버IP]:8080/api/enrollments` (Gateway 경유)

> 📌 본 명세서는 2026-08-27 11:00 기준 **실행 중인 컨테이너의 OpenAPI 스펙**(`GET http://localhost:8083/api-docs`)과
> `EnrollmentController.java` / `EnrollmentDto.java` / `EnrollmentService.java` 소스를 대조하여 작성했습니다.

---

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | `API-EN` |
| 대상 서비스 | `enrollment-service` (포트 8083) |
| 문서 버전 | v1.0 |
| 작성자 | #3 백엔드 개발자 (청약 처리 담당) |
| 최종 수정일 | 2026-08-27 |
| 대상 독자 | 프론트엔드 개발자, 타 서비스 백엔드 개발자, 평가자 |
| 원본 스펙 | OpenAPI 3.1 — `http://localhost:8083/api-docs` |
| Swagger UI | `http://localhost:8083/swagger-ui.html` |
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

청약 신청 접수와 상태 관리를 담당합니다. **MSA 통신 패턴 3가지가 모두 나타나는 핵심 서비스**입니다.

```
POST /api/enrollments
  ├─ [동기 REST] → course-service  : 공고 존재 확인 (existsCourse)
  ├─ [DB]        → enrollments 생성 (status = PENDING)
  └─ [동기 REST] → payment-service : 결제 요청 (requestPayment)

[Kafka Consumer] payment.completed 수신
  ├─ enrollments.status : PENDING → ACTIVE
  ├─ [동기 REST] → course-service : 접수 건수 +1
  └─ [Kafka Producer] enrollment.completed 발행 → recommend-service
```

### 공통 응답 형식

```json
{
  "success": true,
  "message": "성공",
  "data": { ... }
}
```

> ⚠️ `GET /api/enrollments/internal/history/{userId}` 만 예외적으로 **래퍼 없이 직접 반환**합니다.

### 공통 에러 코드

| HTTP 상태 | 상황 |
|---------|------|
| 400 Bad Request | 파라미터 누락, 존재하지 않는 공고, 중복 신청, X-User-Id 헤더 없음 |
| 401 Unauthorized | 인증 토큰 없음 또는 만료 |
| 404 Not Found | 해당 리소스 없음 |
| 500 Internal Server Error | 서버 내부 오류 |

### Status Enum (도메인 재해석)

| 코드 | 강의 플랫폼 원본 | HomeOne 의미 | 화면 표시 |
|------|---------------|------------|---------|
| `PENDING` | 수강 대기 | **접수완료** (청약금 납부 대기) | 🟡 접수완료 |
| `ACTIVE` | 수강 중 | **접수확정** (납부 완료) | 🟢 접수확정 |
| `CANCELLED` | 수강 취소 | **청약 취소** | ⚪ 취소 |

### 제약 조건

- `UNIQUE (user_id, course_id)` — **동일 사용자가 같은 공고에 중복 청약 불가**

---

## API 목록

| API ID | 메서드 | URI | 설명 | 인증 |
|--------|--------|-----|------|------|
| EN-001 | POST | `/api/enrollments` | 청약 신청 | 필요 (X-User-Id) |
| EN-002 | GET | `/api/enrollments/my` | 내 청약 내역 조회 | 필요 (X-User-Id) |
| EN-003 | GET | `/api/enrollments/user/{userId}` | 특정 사용자 청약 내역 조회 | 필요 |
| EN-INT-001 | GET | `/api/enrollments/internal/history/{userId}` | 청약 이력 조회 (추천용) | 불필요 (내부) |

---

## EN-001. 청약 신청

| 항목 | 내용 |
|------|------|
| API ID | EN-001 |
| HTTP 메서드 | POST |
| URI | `/api/enrollments` |
| 설명 | 특정 분양 공고에 청약을 접수한다. 접수 후 결제 서비스에 청약금 납부를 요청한다 |
| 인증 | 필요 — Gateway가 주입하는 `X-User-Id` 헤더 사용 |
| 호출 주체 | Vue 프론트엔드 (청약 신청 화면) |

**요청 헤더**

| 헤더 | 필수 | 설명 |
|------|------|------|
| Authorization | ✅ | `Bearer {accessToken}` |
| X-User-Id | ✅ | Gateway가 JWT에서 추출해 자동 주입 |
| Content-Type | ✅ | `application/json` |

**요청 Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| courseId | Long | ✅ | 청약할 분양 공고 ID |

```json
{ "courseId": 3 }
```

**처리 흐름**

1. course-service에 `GET /api/courses/internal/exists/{courseId}` 호출 → 공고 존재 확인
2. `existsByUserIdAndCourseId` 로 중복 청약 확인
3. `enrollments` 레코드 생성 (`status = PENDING`) 후 **즉시 커밋**
4. payment-service에 `POST /api/payments/internal/request` 호출 (금액 전달)

**응답 예시** — `201 Created`

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 12,
    "userId": 1,
    "courseId": 3,
    "status": "PENDING",
    "createdAt": "2026-08-27T11:20:00",
    "course": null
  }
}
```

**응답 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 청약 접수 고유 ID |
| userId | Long | 청약자 ID |
| courseId | Long | 분양 공고 ID |
| status | String | PENDING(접수완료) / ACTIVE(접수확정) / CANCELLED |
| createdAt | DateTime | 접수 일시 |
| course | Object | 공고 요약 정보 (신청 응답에서는 `null`, 조회 API에서만 채워짐) |

**에러 응답**

| 상황 | HTTP 상태 | message |
|------|---------|---------|
| 존재하지 않는 공고 | 400 | "존재하지 않는 강의입니다: {courseId}" |
| 이미 청약한 공고 | 400 | "이미 수강신청한 강의입니다" |
| courseId 누락 | 400 | "강의 ID는 필수입니다" |
| X-User-Id 헤더 없음 | 400 | 필수 헤더 누락 |

> ⚠️ **현재 코드 상태**: 에러 메시지가 강의 플랫폼 원문("강의", "수강신청") 그대로입니다.
> 시연 중 노출되면 도메인 불일치가 드러나므로 분양 도메인 문구로 교체 권장.

> ⚠️ **결제 금액 하드코딩**: `EnrollmentService.enroll()` 이 `BigDecimal.valueOf(99000)` 을 고정 전달합니다.
> 분양가(`courses.price`)와 무관하므로, 실제 청약금 정책에 맞게 수정 필요.

---

## EN-002. 내 청약 내역 조회

| 항목 | 내용 |
|------|------|
| API ID | EN-002 |
| HTTP 메서드 | GET |
| URI | `/api/enrollments/my` |
| 설명 | 로그인한 사용자 본인의 청약 내역 전체를 반환한다 |
| 인증 | 필요 — `X-User-Id` 헤더 사용 |
| 호출 주체 | Vue 프론트엔드 (내 청약 내역 화면) |

**요청 헤더**

| 헤더 | 필수 | 설명 |
|------|------|------|
| Authorization | ✅ | `Bearer {accessToken}` |
| X-User-Id | ✅ | Gateway가 자동 주입 |

**요청 파라미터**: 없음

**응답 예시** — `200 OK`

```json
{
  "success": true,
  "message": "성공",
  "data": [
    {
      "id": 12,
      "userId": 1,
      "courseId": 3,
      "status": "ACTIVE",
      "createdAt": "2026-08-27T11:20:00",
      "course": {
        "id": 3,
        "title": "검암역 푸르지오 프라베뉴 84A",
        "description": "인천광역시 서구 검암동 / 시공: 대우건설",
        "category": "DATABASE",
        "price": 48630,
        "thumbnail": null,
        "instructorName": "대우건설",
        "enrollmentCount": 2870
      }
    }
  ]
}
```

**응답 필드 — `course` (공고 요약)**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 공고 ID |
| title | String | 단지명 |
| description | String | 단지 설명 (JSON 문자열 포함 가능) |
| category | String | 지역 코드 |
| price | Integer | 분양가 (만원 단위) |
| thumbnail | String | 썸네일 (현재 미사용, `null`) |
| instructorName | String | 공급사명 |
| enrollmentCount | Integer | 현재 접수 건수 |

> 💡 이 API는 각 청약 건마다 **course-service를 REST로 호출해 공고 정보를 조립**합니다.
> "DB를 공유하지 않고 API로만 데이터를 요청한다"는 MSA 원칙이 코드로 드러나는 지점입니다.

---

## EN-003. 특정 사용자 청약 내역 조회

| 항목 | 내용 |
|------|------|
| API ID | EN-003 |
| HTTP 메서드 | GET |
| URI | `/api/enrollments/user/{userId}` |
| 설명 | 지정한 사용자의 청약 내역을 반환한다 |
| 인증 | 필요 |
| 호출 주체 | 관리/운영 화면 |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | userId | Long | ✅ | 조회할 사용자 ID |

**응답**: EN-002와 동일한 구조 (`data`는 배열)

---

## EN-INT-001. 청약 이력 조회 (추천 서비스용)

| 항목 | 내용 |
|------|------|
| API ID | EN-INT-001 |
| HTTP 메서드 | GET |
| URI | `/api/enrollments/internal/history/{userId}` |
| 설명 | 사용자가 **접수확정(ACTIVE)** 한 공고 ID 목록만 반환한다 |
| 인증 | 불필요 (내부) |
| 호출 주체 | recommend-service (추천 계산 시) |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | userId | Long | ✅ | 조회할 사용자 ID |

**응답 예시** — `200 OK` (⚠️ **ApiResponse 래퍼 없이 직접 반환**)

```json
{
  "userId": 1,
  "activeCourseIds": [3, 7, 15]
}
```

**응답 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| userId | Long | 사용자 ID |
| activeCourseIds | List\<Long\> | status가 **ACTIVE인 것만** 필터링한 공고 ID 목록 |

> 💡 `PENDING`(접수완료·납부 대기)은 제외됩니다. 추천은 "확정된 청약"만 근거로 삼습니다.

---

## Kafka 이벤트 명세

REST가 아닌 **비동기 이벤트**로 처리되는 구간입니다. 슬라이드 13(이벤트 시퀀스)의 근거 자료입니다.

### 수신 — `payment.completed`

| 항목 | 내용 |
|------|------|
| 토픽 | `payment.completed` |
| Producer | payment-service |
| Consumer | enrollment-service (`EnrollmentKafkaConsumer`) |
| 컨슈머 그룹 | `enrollment-service` |
| 처리 | `activateEnrollment(userId, courseId)` → status `PENDING` → `ACTIVE` |

**이벤트 페이로드**

```json
{
  "paymentId": 5,
  "userId": 1,
  "courseId": 3,
  "status": "COMPLETED"
}
```

> ℹ️ payment-service가 `JsonSerializer` type header 없이 발행하므로,
> Consumer는 특정 DTO가 아닌 `Map<String, Object>` 로 수신해 파싱합니다.

### 발행 — `enrollment.completed`

| 항목 | 내용 |
|------|------|
| 토픽 | `enrollment.completed` |
| Producer | enrollment-service (`EnrollmentKafkaProducer`) |
| Consumer | recommend-service |
| 컨슈머 그룹 | `recommend-service` |
| 발행 시점 | 청약이 ACTIVE로 전환된 직후 |
| 메시지 키 | `userId` (String) |

**이벤트 페이로드**

```json
{
  "enrollmentId": 12,
  "userId": 1,
  "courseId": 3
}
```

### 동기 vs 비동기 구분 근거

| 구간 | 방식 | 이유 |
|------|------|------|
| enrollment → course (존재 확인) | **동기 REST** | 신청 처리에 결과가 당장 필요 |
| enrollment → payment (결제 요청) | **동기 REST** | 결제 결과를 즉시 알아야 함 |
| payment → enrollment (상태 변경) | **비동기 Kafka** | 결제가 상태 변경 완료를 기다릴 이유 없음 |
| enrollment → recommend (추천 갱신) | **비동기 Kafka** | 추천 갱신은 늦어도 되는 작업 |

---

## 참고

- Swagger UI: `http://localhost:8083/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8083/api-docs`  ⚠️ `/v3/api-docs` 아님
- Kafka 토픽 확인: `docker exec lecture-kafka kafka-topics --bootstrap-server localhost:9092 --list`
- 이벤트 실제 흐름 확인: `docker exec lecture-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --group enrollment-service --describe`
