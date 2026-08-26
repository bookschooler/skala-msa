# API 명세서 — course-service

> 프로젝트명: HomeOne — B2G2C 분양 정보 통합 플랫폼  
> 작성자: #2 백엔드 개발자 (공공 API 통합 담당)  
> 작성일: 2026-08-27  
> 서비스 포트: 8082  
> Base URL: `http://localhost:8082` (개발) / `http://[서버IP]:8080/api/courses` (Gateway 경유)

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

### 공통 에러 코드

| HTTP 상태 | 상황 |
|---------|------|
| 400 Bad Request | 요청 파라미터 누락 또는 형식 오류 |
| 401 Unauthorized | 인증 토큰 없음 또는 만료 |
| 403 Forbidden | 권한 없음 (공급사 전용 API에 일반 유저 접근 등) |
| 404 Not Found | 해당 ID의 리소스 없음 |
| 500 Internal Server Error | 서버 내부 오류 |

### Category Enum (지역 코드)

| 코드 | 실제 의미 |
|------|---------|
| `SECURITY` | 서울 |
| `MOBILE` | 경기 |
| `DATABASE` | 인천 |
| `OTHER` | 기타 지역 |

> ⚠️ `BACKEND`, `FRONTEND`, `DEVOPS`, `DATA_SCIENCE` 는 사용하지 않음 (기존 강의 플랫폼 코드 재활용)

---

## API 목록

| API ID | 메서드 | URI | 설명 | 인증 |
|--------|--------|-----|------|------|
| CS-001 | GET | `/api/courses` | 전체 분양 공고 목록 조회 | 불필요 |
| CS-002 | GET | `/api/courses/{id}` | 분양 공고 상세 조회 | 불필요 |
| CS-003 | GET | `/api/courses/category/{category}` | 지역별 공고 목록 조회 | 불필요 |
| CS-004 | POST | `/api/courses` | 신규 공고 등록 | 필요 (공급사) |
| CS-INT-001 | GET | `/api/courses/internal/exists/{id}` | 공고 존재 여부 확인 | 불필요 (내부) |
| CS-INT-002 | GET | `/api/courses/internal/{id}` | 공고 상세 조회 (내부용) | 불필요 (내부) |
| CS-INT-003 | POST | `/api/courses/internal/{id}/enrollment-count` | 접수 건수 증가 | 불필요 (내부) |
| CS-INT-004 | GET | `/api/courses/internal/recommend` | 추천용 미신청 공고 목록 | 불필요 (내부) |

---

## CS-001. 전체 분양 공고 목록 조회

| 항목 | 내용 |
|------|------|
| API ID | CS-001 |
| HTTP 메서드 | GET |
| URI | `/api/courses` |
| 설명 | 등록된 전체 분양 공고 목록을 반환한다 |
| 인증 | 불필요 |
| 호출 주체 | Vue 프론트엔드 (분양 목록 화면) |

**요청**

없음

**응답 예시**

```json
{
  "success": true,
  "message": "성공",
  "data": [
    {
      "id": 1,
      "title": "검암역 푸르지오 프라베뉴 84A",
      "description": "인천광역시 서구 검암동",
      "category": "DATABASE",
      "price": 48630.00,
      "instructorId": 2,
      "enrollmentCount": 2870,
      "status": "ACTIVE",
      "createdAt": "2026-08-21T09:00:00"
    }
  ]
}
```

**응답 필드**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 공고 고유 ID |
| title | String | 단지명 (예: "검암역 푸르지오 84A") |
| description | String | 단지 설명, 주소, 시공사 등 |
| category | String | 지역 코드 (SECURITY/MOBILE/DATABASE/OTHER) |
| price | Decimal | 분양가 **만원 단위** (48630 = 4억 8,630만원) |
| instructorId | Long | 공급사 ID (users 테이블 참조) |
| enrollmentCount | Integer | 현재 접수 건수 |
| status | String | ACTIVE / INACTIVE |
| createdAt | DateTime | 공고 등록일시 |

---

## CS-002. 분양 공고 상세 조회

| 항목 | 내용 |
|------|------|
| API ID | CS-002 |
| HTTP 메서드 | GET |
| URI | `/api/courses/{id}` |
| 설명 | 특정 ID의 분양 공고 상세 정보를 반환한다 |
| 인증 | 불필요 |
| 호출 주체 | Vue 프론트엔드 (단지 상세 화면) |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | id | Long | ✅ | 조회할 공고 ID |

**응답 예시**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 1,
    "title": "검암역 푸르지오 프라베뉴 84A",
    "description": "인천광역시 서구 검암동 / 시공: 대우건설",
    "category": "DATABASE",
    "price": 48630.00,
    "instructorId": 2,
    "enrollmentCount": 2870,
    "status": "ACTIVE",
    "createdAt": "2026-08-21T09:00:00"
  }
}
```

**에러 응답**

| 상황 | HTTP 상태 | message |
|------|---------|---------|
| 해당 ID 공고 없음 | 404 | "강의를 찾을 수 없습니다" |

---

## CS-003. 지역별 공고 목록 조회

| 항목 | 내용 |
|------|------|
| API ID | CS-003 |
| HTTP 메서드 | GET |
| URI | `/api/courses/category/{category}` |
| 설명 | 특정 지역의 분양 공고 목록을 반환한다 |
| 인증 | 불필요 |
| 호출 주체 | Vue 프론트엔드 (지역 필터 기능) |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | category | String | ✅ | SECURITY / MOBILE / DATABASE / OTHER |

**응답 예시**

```json
{
  "success": true,
  "message": "성공",
  "data": [ { ... } ]
}
```

---

## CS-004. 신규 분양 공고 등록

| 항목 | 내용 |
|------|------|
| API ID | CS-004 |
| HTTP 메서드 | POST |
| URI | `/api/courses` |
| 설명 | 공급사(INSTRUCTOR 권한)가 새 분양 공고를 등록한다 |
| 인증 | **필요** — JWT 토큰 + INSTRUCTOR 역할 |
| 호출 주체 | 공급사 관리자 화면 |

**요청 헤더**

| 헤더 | 필수 | 설명 |
|------|------|------|
| X-User-Id | ✅ | API Gateway가 JWT에서 추출한 사용자 ID |
| Content-Type | ✅ | application/json |

**요청 Body**

```json
{
  "title": "한빛마을 3단지 84A",
  "description": "경기도 광명시 / 국민주택 공공분양",
  "category": "MOBILE",
  "price": 68000
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | String | ✅ | 단지명 |
| description | String | ❌ | 단지 설명, 주소, 시공사 등 |
| category | String | ✅ | SECURITY / MOBILE / DATABASE / OTHER |
| price | Decimal | ✅ | 분양가 (만원 단위, 0 이상) |

**응답 (201 Created)**

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "id": 10,
    "title": "한빛마을 3단지 84A",
    ...
  }
}
```

---

## CS-INT-001. 공고 존재 여부 확인 (내부 API)

| 항목 | 내용 |
|------|------|
| API ID | CS-INT-001 |
| HTTP 메서드 | GET |
| URI | `/api/courses/internal/exists/{id}` |
| 설명 | 해당 ID의 공고가 존재하는지 Boolean으로 반환 |
| 호출 주체 | enrollment-service (청약 신청 시 유효성 검증) |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | id | Long | ✅ | 확인할 공고 ID |

**응답 (200 OK)**

```json
true
```

---

## CS-INT-002. 공고 상세 조회 (내부 API, 래퍼 없음)

| 항목 | 내용 |
|------|------|
| API ID | CS-INT-002 |
| HTTP 메서드 | GET |
| URI | `/api/courses/internal/{id}` |
| 설명 | enrollment-service가 내 청약 내역 조립 시 사용. ApiResponse 래퍼 없이 CourseResponse 직접 반환 |
| 호출 주체 | enrollment-service |

**응답 (200 OK)**

```json
{
  "id": 1,
  "title": "검암역 푸르지오 84A",
  "category": "DATABASE",
  "price": 48630.00,
  ...
}
```

---

## CS-INT-003. 접수 건수 증가 (내부 API)

| 항목 | 내용 |
|------|------|
| API ID | CS-INT-003 |
| HTTP 메서드 | POST |
| URI | `/api/courses/internal/{id}/enrollment-count` |
| 설명 | 청약 신청 완료 시 해당 공고의 접수 건수를 1 증가시킨다 |
| 호출 주체 | enrollment-service |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Path | id | Long | ✅ | 공고 ID |

**응답 (200 OK)**

없음 (Void)

---

## CS-INT-004. 추천용 미신청 공고 목록 (내부 API)

| 항목 | 내용 |
|------|------|
| API ID | CS-INT-004 |
| HTTP 메서드 | GET |
| URI | `/api/courses/internal/recommend` |
| 설명 | recommend-service가 특정 카테고리(지역)에서 사용자가 아직 신청하지 않은 공고 목록을 조회한다 |
| 호출 주체 | recommend-service |

**요청 파라미터**

| 위치 | 파라미터명 | 타입 | 필수 | 설명 |
|------|----------|------|------|------|
| Query | category | String | ✅ | 지역 코드 (SECURITY/MOBILE/DATABASE/OTHER) |
| Query | excludeIds | List\<Long\> | ❌ | 제외할 공고 ID 목록 (사용자가 이미 신청한 것) |

**요청 예시**

```
GET /api/courses/internal/recommend?category=DATABASE&excludeIds=1,3,5
```

**응답 (200 OK)**

```json
[
  {
    "id": 2,
    "title": "검암역 푸르지오 59B",
    "category": "DATABASE",
    "price": 36000.00,
    "enrollmentCount": 1200,
    ...
  }
]
```

---

## 다른 조원 작성 안내

> 아래 형식을 참고해서 각자 담당 서비스의 API 명세를 같은 포맷으로 추가해주세요.
>
> **파일**: 각자 `API명세서_{서비스명}.md` 파일을 PLAN 폴더에 추가
>
> **포함할 항목:**
> - API ID (서비스코드-번호, 예: EN-001, PM-001, RC-001)
> - HTTP 메서드 + URI
> - 설명 + 인증 여부
> - 요청 파라미터 (Path / Query / Body)
> - 응답 JSON 예시 + 필드 설명
> - 주요 에러 코드
