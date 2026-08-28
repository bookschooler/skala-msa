# API 명세서 — user-service

> 프로젝트명: HomeOne — B2G2C 분양 정보 통합 플랫폼  
> 담당: #1 PM + 프론트엔드 개발자  
> 작성일: 2026-08-27  
> 서비스 포트: 8081  
> Base URL: `http://localhost:8081` (개발) / `http://[서버IP]:8080/api/users` (Gateway 경유)

> 📌 본 명세서는 2026-08-27 11:00 기준 **실행 중인 컨테이너의 OpenAPI 스펙**(`GET http://localhost:8081/api-docs`)과
> `UserController.java` / `UserDto.java` 소스를 대조하여 작성했습니다.

---

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | `API-US` |
| 대상 서비스 | `user-service` (포트 8081) |
| 문서 버전 | v1.0 |
| 작성자 | #1 PM + 프론트엔드 개발자 |
| 최종 수정일 | 2026-08-27 |
| 대상 독자 | 프론트엔드 개발자, 타 서비스 백엔드 개발자, 평가자 |
| 원본 스펙 | OpenAPI 3.1 — `http://localhost:8081/api-docs` |
| Swagger UI | `http://localhost:8081/swagger-ui.html` |
| 관련 문서 | `ERD_전체.md`, `도메인매핑표_전체.md`, `아키텍처_설계서.md` |

> ⚠️ OpenAPI JSON 경로는 springdoc 기본값 `/v3/api-docs` 가 아니라 **`/api-docs`** 입니다
> (`application.yml` 의 `springdoc.api-docs.path: /api-docs`). FastAPI는 `/openapi.json`.

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|---------|
| v1.0 | 2026-08-27 | #1 PM + 프론트엔드 개발자 | 최초 작성. 실행 중인 컨테이너의 OpenAPI 스펙과 소스 코드를 대조하여 엔드포인트 전수 기재 |

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

### 공통 응답 형식

```json
{
  "success": true,
  "message": "성공",
  "data": { ... }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| success | Boolean | 요청 성공 여부 |
| message | String | 결과 메시지 |
| data | Object / Array | 실제 응답 데이터 |

> ⚠️ `GET /api/users/internal/{id}` 만 예외적으로 **래퍼 없이 `UserResponse`를 직접 반환**합니다.

### 공통 에러 코드

| HTTP 상태 | 상황 |
|---------|------|
| 400 Bad Request | 요청 파라미터 누락 또는 형식 오류 (`@Valid` 검증 실패) |
| 401 Unauthorized | 인증 토큰 없음 또는 만료 |
| 403 Forbidden | 권한 없음 |
| 404 Not Found | 해당 ID의 사용자 없음 |
| 500 Internal Server Error | 서버 내부 오류 |

### Role Enum (도메인 재해석)

| 코드 | 강의 플랫폼 원본 | HomeOne 의미 |
|------|---------------|------------|
| `STUDENT` | 수강생 | **청약 신청자 (C)** |
| `INSTRUCTOR` | 강사 | **공급사 / 시행사 (B)** |

> 시드 데이터에서 공급사 5곳(LH, 경기주택도시공사, 포스코이앤씨, 지에스건설, 대우건설)이
> `id 101~105`, `role = INSTRUCTOR` 로 등록되어 있습니다. (`init-db/02_seed_suppliers.sql`)

### X-User-Id 헤더

API Gateway가 JWT에서 사용자 ID를 추출해 하위 서비스로 전달하는 헤더입니다.
`GET /api/users/me` 는 이 헤더에 의존하므로, **Gateway(8080)를 경유하지 않고 8081을 직접 호출하면 400**이 발생합니다.

---

## API 목록

| API ID | 메서드 | URI | 설명 | 인증 |
|--------|--------|-----|------|------|
| US-001 | POST | `/api/users/register` | 회원가입 | 불필요 |
| US-002 | GET | `/api/users/{id}` | 사용자 조회 | 필요 |
| US-003 | GET | `/api/users/me` | 내 정보 조회 | 필요 (X-User-Id) |
| US-INT-001 | GET | `/api/users/internal/{id}` | 사용자 조회 (내부용) | 불필요 (내부) |

---

## US-001. 회원가입

| 항목 | 내용 |
|------|------|
| API ID | US-001 |
| HTTP 메서드 | POST |
| URI | `/api/users/register` |
| 설명 | 신규 사용자를 등록한다 (청약 신청자 또는 공급사) |
| 인증 | 불필요 (Gateway 공개 경로) |
| 호출 주체 | Vue 프론트엔드 (회원가입 화면) |

**요청 헤더**

| 헤더 | 필수 | 값 |
|------|------|-----|
| Content-Type | ✅ | `application/json` |

**요청 Body**

| 필드 | 타입 | 필수 | 검증 규칙 | 설명 |
|------|------|------|---------|------|
| email | String | ✅ | 이메일 형식 | 로그인 ID로 사용, UNIQUE |
| password | String | ✅ | **8자 이상** | 비밀번호 |
| name | String | ✅ | 공백 불가 | 이름 (공급사는 기관명) |
| role | String | ❌ | STUDENT / INSTRUCTOR | 미지정 시 STUDENT |

```json
{
  "email": "chungyak@homeone.test",
  "password": "password123",
  "name": "김청약",
  "role": "STUDENT"
}
```

**응답 예시** — `201 Created`

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 1,
    "email": "chungyak@homeone.test",
    "name": "김청약",
    "role": "STUDENT",
    "createdAt": "2026-08-27T10:15:00"
  }
}
```

**응답 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 사용자 고유 ID |
| email | String | 이메일 |
| name | String | 이름 |
| role | String | STUDENT(청약자) / INSTRUCTOR(공급사) |
| createdAt | DateTime | 가입일시 |

> 🔒 `password` 는 응답에 **포함되지 않습니다.**

**에러 응답**

| 상황 | HTTP 상태 | message |
|------|---------|---------|
| 이메일 형식 오류 | 400 | "올바른 이메일 형식이 아닙니다" |
| 비밀번호 8자 미만 | 400 | "비밀번호는 8자 이상이어야 합니다" |
| 이름 누락 | 400 | "이름은 필수입니다" |
| 이메일 중복 | 400 | (UserService 검증 메시지) |

---

## US-002. 사용자 조회

| 항목 | 내용 |
|------|------|
| API ID | US-002 |
| HTTP 메서드 | GET |
| URI | `/api/users/{id}` |
| 설명 | 특정 ID의 사용자 정보를 반환한다 |
| 인증 | 필요 |
| 호출 주체 | Vue 프론트엔드 (공급사 정보 표시 등) |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | id | Long | ✅ | 조회할 사용자 ID |

**응답 예시** — `200 OK`

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 101,
    "email": "lh@homeone.test",
    "name": "한국토지주택공사",
    "role": "INSTRUCTOR",
    "createdAt": "2026-08-26T09:00:00"
  }
}
```

**에러 응답**

| 상황 | HTTP 상태 | message |
|------|---------|---------|
| 해당 ID 사용자 없음 | 404 | "사용자를 찾을 수 없습니다" |

---

## US-003. 내 정보 조회

| 항목 | 내용 |
|------|------|
| API ID | US-003 |
| HTTP 메서드 | GET |
| URI | `/api/users/me` |
| 설명 | 로그인한 사용자 본인의 정보를 반환한다 |
| 인증 | 필요 — **Gateway가 주입하는 `X-User-Id` 헤더 사용** |
| 호출 주체 | Vue 프론트엔드 (마이페이지, 헤더 프로필) |

**요청 헤더**

| 헤더 | 필수 | 설명 |
|------|------|------|
| Authorization | ✅ | `Bearer {accessToken}` |
| X-User-Id | ✅ | **Gateway가 JWT에서 추출해 자동 주입** |

**요청 파라미터**: 없음

**응답 예시** — `200 OK`

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 1,
    "email": "chungyak@homeone.test",
    "name": "김청약",
    "role": "STUDENT",
    "createdAt": "2026-08-27T10:15:00"
  }
}
```

**에러 응답**

| 상황 | HTTP 상태 | message |
|------|---------|---------|
| X-User-Id 헤더 없음 (Gateway 미경유) | 400 | 필수 헤더 누락 |
| 토큰 없음/만료 | 401 | — |
| 해당 사용자 없음 | 404 | "사용자를 찾을 수 없습니다" |

---

## US-INT-001. 사용자 조회 (내부용)

| 항목 | 내용 |
|------|------|
| API ID | US-INT-001 |
| HTTP 메서드 | GET |
| URI | `/api/users/internal/{id}` |
| 설명 | 다른 마이크로서비스가 사용자 정보를 조회할 때 사용한다 |
| 인증 | 불필요 (내부 호출 / 설계상 Client Credentials) |
| 호출 주체 | 타 서비스 (WebClient) |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | id | Long | ✅ | 조회할 사용자 ID |

**응답 예시** — `200 OK` (⚠️ **ApiResponse 래퍼 없이 직접 반환**)

```json
{
  "id": 101,
  "email": "lh@homeone.test",
  "name": "한국토지주택공사",
  "role": "INSTRUCTOR",
  "createdAt": "2026-08-26T09:00:00"
}
```

---

## 참고

- Swagger UI: `http://localhost:8081/swagger-ui.html` (→ `/swagger-ui/index.html` 리다이렉트)
- OpenAPI JSON: `http://localhost:8081/api-docs`  ⚠️ `/v3/api-docs` 아님
- 로그인/토큰 발급은 user-service가 아니라 **auth-server(9000, Spring Authorization Server)** 담당입니다.
