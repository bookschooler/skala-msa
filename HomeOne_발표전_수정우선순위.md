# HomeOne 발표 전 수정 우선순위 정리

> 기준: 2일짜리 Agile·MSA 실습 과제, 교수님 발표 요구사항, 기존 코드·DB 구조 최대 유지

---

## 1. 반드시 수정해야 하는 것

### 1-1. `내 신청내역` 화면을 실제 Backend API와 연결

현재 문제:

```text
POST /api/enrollments
→ 프론트 localStorage에 RECEIVED 저장
→ 서버 상태를 다시 조회하지 않음
→ 화면에는 처음부터 접수완료로 표시
```

문제점:

- 발표에서는 `PENDING → Kafka → ACTIVE` 상태 변화를 보여주기로 함
- 하지만 현재 화면은 `GET /api/enrollments/my`를 호출하지 않음
- 따라서 실제 Kafka 처리 결과와 화면이 연결되지 않음

수정 방향:

```text
POST /api/enrollments
→ PENDING
→ Payment Service
→ Kafka
→ ACTIVE
→ GET /api/enrollments/my
→ 실제 접수 상태 화면에 표시
```

프론트 상태 매핑:

```text
PENDING   → 접수 처리 중
ACTIVE    → 접수 완료
CANCELLED → 신청 취소
```

### 1-2. Frontend / Backend 상태값 체계 맞추기

현재:

```text
Backend
PENDING / ACTIVE / CANCELLED

Frontend
RECEIVED / REVIEWING / SELECTED / CANCELLED
```

수정 방향:

- DB와 Backend Enum은 변경하지 않음
- 프론트에서 Backend 상태를 사용자 문구로 변환

```text
PENDING → 접수 처리 중
ACTIVE  → 접수 완료
```

> 1-1의 `GET /api/enrollments/my` 연결 작업과 함께 처리하면 됨.

### 1-3. 발표자료의 대표 Request / Response 채우기

교수님 요구사항:

```text
Method
URL
Request / Response 예시
```

현재 API 목록만 있고 대표 Request / Response 슬라이드가 비어 있으므로 반드시 채워야 함.

대표 예시:

#### Request

```http
POST /api/enrollments
X-User-Id: 1
Content-Type: application/json
```

```json
{
  "courseId": 70
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 4,
    "userId": 1,
    "courseId": 70,
    "status": "PENDING"
  }
}
```

상태 흐름:

```text
PENDING
접수 처리 중
   ↓
Kafka 비동기 처리
   ↓
ACTIVE
접수 완료
```

---

## 2. 최소 수정 권장

### 2-1. 사용자 화면에 노출되는 강의 도메인 표현 제거

Backend 클래스명이나 DB 구조까지 바꾸지는 않음.

그대로 유지:

```text
Course
Enrollment
Payment
```

하지만 사용자 화면에서는 다음 표현이 나오지 않도록 수정 권장:

```text
이미 수강신청한 강의입니다
존재하지 않는 강의입니다
MOBILE
SECURITY
DATABASE
```

사용자 화면에서는 청약 도메인 문구로 변환:

```text
이미 수강신청한 강의입니다
→ 이미 신청한 청약 공고입니다.

존재하지 않는 강의입니다
→ 존재하지 않는 분양 공고입니다.
```

지역 매핑 예:

```text
SECURITY → 서울
MOBILE   → 경기
DATABASE → 인천
OTHER    → 기타
```

> Enum이나 DB 자체는 수정하지 않고 Presentation Layer에서만 변환.

### 2-2. 신청취소 버튼 숨기기

현재 프론트에는 신청취소 기능이 보이지만 실제 Backend DELETE API가 없음.

이번 Sprint 핵심 기능이 아니므로:

```text
취소 Backend API 신규 개발 X
시연 화면에서 신청취소 버튼 숨기기 O
```

시간이 부족하면 버튼만 제거하는 것이 가장 안전함.

### 2-3. 시연 계정 / 공고 데이터 초기화

접수 처리 도중 오류가 발생하면 `PENDING` 신청이 DB에 남아 같은 계정으로 다시 신청하기 어려울 수 있음.

발표 전에:

```text
1. 시연용 사용자 선정
2. 시연용 공고 선정
3. 해당 사용자-공고 신청 이력 확인
4. 리허설 이후 필요 시 테스트 데이터 정리
5. 실제 발표 전 다시 한 번 정상 상태 확인
```

> 복구 로직을 새로 만드는 것보다 시연 데이터를 정리하는 것이 2일 과제에서는 적절함.

---

## 3. 수정하지 않아도 되는 것

### 3-1. Payment Service의 `amount = 99000`

기존 교육 코드의 Payment 모델에 남아 있는 값.

이번 프로젝트에서는 Payment Service를:

```text
청약 신청 이후 접수 처리
```

의 의미로 재사용함.

따라서:

```text
payments 테이블 구조 변경 X
amount 필드 제거 X
Payment Service 재설계 X
```

발표에서는 금액이나 결제 내역을 보여주지 않음.

### 3-2. Payment Service 이름 변경

현재:

```text
Payment Service
```

를 내부 코드에서 그대로 유지.

발표에서는:

```text
Payment Service
(접수 처리)
```

라고 설명.

다음과 같은 대규모 Rename은 하지 않음:

```text
Payment Service → Reception Service
PaymentController Rename
Kafka Topic Rename
DB Table Rename
```

### 3-3. DB / Entity / Enum 구조 변경

교수님 지침에 따라 기존 DB 레이아웃은 유지.

따라서 수정하지 않음:

```text
Course Entity Rename
Enrollment Entity Rename
Payment Entity Rename
Category Enum 자체 변경
DB Table 구조 변경
```

청약 도메인의 의미만 재해석하여 사용.

### 3-4. Kafka Topic 이름 변경

현재:

```text
payment.completed
```

을 그대로 사용.

우리 프로젝트에서는 의미를:

```text
접수 처리 완료 이벤트
```

로 해석.

Topic Rename은 Producer / Consumer / 설정 파일 등을 함께 수정해야 하므로 하지 않음.

### 3-5. 아키텍처에 모든 내부 이벤트 추가

현재 발표 아키텍처는 핵심 흐름을 보여주는 수준이면 충분함.

반드시 추가하지 않아도 되는 세부 흐름:

```text
Enrollment → Kafka → Recommend
Enrollment → Course enrollmentCount 증가
```

코드에는 존재하지만 발표 다이어그램이 틀린 것은 아님.

아키텍처는 한눈에 보이는 것이 더 중요하므로 현재 핵심 구조를 유지.

### 3-6. PENDING 실패 복구 로직 신규 개발

운영 서비스라면 필요하지만 이번 Sprint 범위를 초과함.

새로 구현하지 않음:

```text
Retry 로직
Rollback 구조 변경
PENDING 자동 복구
중복 신청 정책 전면 재설계
```

이번 발표에서는 시연용 데이터를 정리하여 대응.

---

# 4. 실제 작업 우선순위

## 최우선

```text
1. MyApplicationsView에서 GET /api/enrollments/my 실제 호출
2. PENDING / ACTIVE 상태 화면 매핑
3. 청약 신청 전 → PENDING → ACTIVE 흐름 E2E 확인
```

## 그다음

```text
4. 사용자 화면의 강의 관련 문구 제거
5. MOBILE / SECURITY / DATABASE 지역명 표시 보정
6. 필요하면 신청취소 버튼 숨기기
```

## 발표자료

```text
7. 대표 API Request / Response 추가
8. 실제 화면 캡처
9. 청약 신청 전 / 접수 처리 중 / 접수 완료 화면 확보
```

## 하지 않을 것

```text
- DB 레이아웃 변경
- Entity Rename
- Payment Service Rename
- Kafka Topic Rename
- Payment 금액 구조 재설계
- 취소 Backend API 신규 개발
- 실패 복구 로직 신규 구현
```

---

# 5. 발표 전 최소 완료 기준

아래가 모두 되면 발표 가능한 상태로 판단.

```text
[ ] 통합 공고 목록이 실제 화면에 표시됨
[ ] 추천 결과가 실제 화면에 표시됨
[ ] 공고 상세에서 청약 신청 가능
[ ] POST /api/enrollments 실제 호출 확인
[ ] 신청 직후 PENDING = 접수 처리 중 확인
[ ] Kafka 처리 후 ACTIVE = 접수 완료 확인
[ ] GET /api/enrollments/my 결과가 화면에 표시됨
[ ] 강의/수강/MOBILE 등의 어색한 표현이 시연 화면에 노출되지 않음
[ ] 대표 Request / Response 슬라이드 작성 완료
[ ] 발표 직전 시연 계정 및 공고 상태 확인
```

---

# 6. 한 줄 결론

> 백엔드의 `Enrollment → Payment → Kafka → ACTIVE` 핵심 흐름은 이미 동작하므로, 새로운 기능을 확장하기보다 **프론트가 실제 서버 상태를 사용하도록 연결하고 사용자에게 보이는 표현만 청약 도메인에 맞추는 것이 이번 Sprint의 핵심 수정 범위**다.
