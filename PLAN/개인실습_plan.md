# 개인 실습 실행 계획서 (Day 1)

> **한 줄 목표**: 이미 만들어진 MSA를 **직접 켜서, 써보고, 정리해서 제출**한다.
> 코드를 새로 짜는 게 아니다. "신입 개발자가 회사 시스템 가져다 쓰듯" 하는 게 전부다.
>
> **제출물**: 서브노트 → 반별 슬랙 스레드
> **출처**: 가이드1(운영), 가이드2(실습), 가이드3(코드 템플릿), 교재, 보강1(사례), 보강2(Docker)

---

## ⛔ Step −1. 시작 전에 반드시 확인 (안 하면 100% 막힘)

실측으로 확인된 문제들입니다. 순서대로 처리하세요.

### ① 소스 코드가 아직 없다
현재 폴더에는 **실행용 이미지(tar)와 PDF만** 있습니다.
`course-service/`, `enrollment-service/`, `payment-service/`, `recommend-service/`, `vue-frontend/`, `init-db/` 폴더가 **하나도 없습니다.**

- 개인 실습 Phase 0~6은 **소스 없이도 가능** (이미지만으로 기동·조회·실험 다 됨)
- **Phase 7(코드 수정)과 조별 실습은 소스가 있어야 시작 가능**
- → **강사님께 전날 미리 요청**하세요. 요청 문구:
  > "가이드1에 있는 소스 디렉터리 패키지(course/enrollment/payment/recommend/vue-frontend/init-db)와
  > build 가능한 docker-compose.yml을 어디서 받을 수 있을까요?"

> ⚠️ `docker-compose.local.yml`은 `./init-db`를 마운트합니다. 이 폴더가 없으면 Docker가
> **빈 폴더를 자동으로 만들어서** 마운트합니다. 에러가 안 나고 **강의 데이터가 0건**으로 뜹니다.
> "화면은 뜨는데 목록이 비어 있다" = 이 증상입니다.

### ② 지금 이 PC는 8080·3000 포트가 이미 막혀 있다 (실측)
예전 실습 컨테이너가 아직 떠 있습니다. 그대로 켜면 `port is already allocated`로 실패합니다.

```bash
docker ps                                                          # 뭐가 떠 있는지 확인
docker stop spring-backend frontend vue-frontend fastapi-backend   # 끄기
docker ps                                                          # 비었는지 재확인
```

### ③ Docker 메모리를 올려야 한다
현재 **7.75 GiB**. 컨테이너 10개(JVM 8개 + Kafka + MariaDB)에는 빠듯합니다.

**Docker Desktop → Settings → Resources → Memory → 10~12 GB → Apply & Restart**

### ④ 강사님께 물어볼 질문 5개 (문서끼리 내용이 서로 달라서 확인이 필요합니다)

1. **로그인 API가 정확히 뭔가요?** `POST /api/users/login`인가요, auth-server의 `/oauth2/token`인가요?
   후자라면 client_id / client_secret / scope 값을 알려주세요.
   *(가이드2 예제와 가이드3 설계표가 서로 다릅니다)*
2. **게이트웨이(8080)로 `GET /api/courses`를 부를 때 토큰이 필요한가요?**
   compose에서 gateway·recommend는 issuer가 `http://localhost:8080`인데
   user·course·enrollment·payment는 `http://auth-server:9000`입니다. 어느 쪽이 맞나요?
3. **소스 패키지와 `init-db`는 언제 받을 수 있나요?** `courses` 테이블에 `enrollment_count` 컬럼이 있나요?
4. **vue-frontend는 컨테이너인가요, `npm run dev`인가요?** 가이드2 부록처럼 순수 HTML/JS로 해도 되나요? Node 버전은?
5. **Sprint1에서 바꿔도 되는 필드와 동결해야 할 필드** 목록을 주실 수 있나요?
   (`/internal/**` 경로·DTO·DB 컬럼명)

---

## 📋 전체 시간표

| 단계 | 시간 | 필수 여부 | 소스 필요 |
|---|---|---|---|
| Phase 0. 사전 준비 | 10분 (쉬는 시간에 미리) | ★필수 | ✕ |
| Phase 1. 기동 | 20분 (대기 포함) | ★필수 | ✕ |
| Phase 2. Swagger 첫 성공 | 20분 | ★필수 | ✕ |
| Phase 3. 전체 흐름 타보기 | 25분 | ★필수 | ✕ |
| Phase 4. 이벤트 흐름 확인 | 15분 | 여유 있을 때 | ✕ |
| Phase 5. 서비스 독립성 실험 | 10분 | 여유 있을 때 | ✕ |
| Phase 6. 코드 구조 훑기 | 20분 | 여유 있을 때 | △ |
| Phase 7. 작은 수정 배포 | 10~30분 | 선택 | ○ |
| Phase 8. 서브노트 작성 | 30분 | ★필수 | ✕ |

> **15:00~16:00 한 시간 안에는 Phase 1·2·3만 합니다.** 나머지는 조별 Sprint 진행 중에 자연스럽게 하거나
> 저녁에 이어서 하세요. (원래 계획대로면 200분짜리를 60분에 넣는 셈이라 반드시 잘라야 합니다.)

---

## Phase 0. 사전 준비 (10분)

```bash
# 1) 포트 비우기
docker stop spring-backend frontend vue-frontend fastapi-backend

# 2) 작업 폴더로 이동
cd ~/skala-workspace/skala-MSA/msa-lecture

# 3) 프론트 작업용 Node 확인 (없으면 나중에 프론트 못 함)
node -v
npm -v
```

- [ ] Docker Desktop 메모리 10GB 이상으로 변경 완료
- [ ] `docker ps` 결과가 비어 있음
- [ ] `node -v`가 버전을 출력함

---

## Phase 1. 기동 (20분) ★필수

### 1-1. 이미지 불러오기

> 분할된 파일은 **tar가 아니라 gzip**입니다(실측: 시그니처 `1f 8b 08 08`, 내장명 `msa-lecture-images-arm64.tar`).
> 그리고 이 안에 auth-server·api-gateway가 **이미 들어 있어서** `infra-images.tar`(359MB)는 **안 써도 됩니다.**

```bash
cd ~/skala-workspace/skala-MSA/msa-lecture

# 분할 파일 3개를 순서대로 합치기
cat msa-lecture-images.part.a* > msa-lecture-images-arm64.tar.gz

# 도커에 이미지 등록 (1~3분 걸림)
docker load -i msa-lecture-images-arm64.tar.gz

# 이미지 10개가 들어왔는지 확인
docker images | grep -E 'msa-lecture|mariadb|kafka'
```

**들어와야 하는 이미지 10개**
`mariadb:11.2` / `confluentinc/cp-kafka:7.7.0` / `msa-lecture-eureka-server` / `msa-lecture/auth-server:1.0` /
`msa-lecture/api-gateway:1.0` / `msa-lecture-user-service` / `msa-lecture-course-service` /
`msa-lecture-enrollment-service` / `msa-lecture-payment-service` / `msa-lecture-recommend-service`

### 1-2. 컨테이너 띄우기

```bash
docker compose -f docker-compose.local.yml up -d --pull never
```

### 🛑 1-3. 여기서 최소 3분 기다립니다 — 가장 중요한 안내

**`docker ps`에 컨테이너가 몇 개 안 보여도 정상입니다. 고장난 게 아닙니다.**

컨테이너들이 **줄을 서서** 켜지도록 만들어져 있습니다:

```
mariadb(30초) · kafka(60초)  →  eureka(60초)  →  auth-server(최대 120초)
   →  api-gateway + user + course + enrollment + payment  →  recommend
```

**auth-server가 준비될 때까지 뒤쪽 5개는 "시작조차" 안 합니다.** 최초 기동은 **3~5분**입니다.

> ❌ 이 구간에 `Ctrl+C` 누르거나 `up -d`를 다시 실행하지 마세요. 처음부터 다시 시작됩니다.
> ⭕ 아래 명령으로 상태만 지켜보세요.

```bash
# healthy 개수만 본다 (30초마다 한 번씩)
docker compose -f docker-compose.local.yml ps

# 답답하면 auth-server 로그를 본다 (Started ... 가 뜨면 성공)
docker compose -f docker-compose.local.yml logs -f auth-server
```

### ✅ 1-4. 체크포인트

**http://localhost:8761** 접속 → `Instances currently registered with Eureka`에 **7개**가 UP

| 보여야 하는 것 |
|---|
| API-GATEWAY, AUTH-SERVER, USER-SERVICE, COURSE-SERVICE, ENROLLMENT-SERVICE, PAYMENT-SERVICE, RECOMMEND-SERVICE |

📸 **스크린샷 ①** — 서브노트 §1에 넣습니다.

### 1-5. 안 될 때 대응표

| 증상 | 원인 | 해결 |
|---|---|---|
| `port is already allocated` | 다른 컨테이너가 포트 점유 | `docker ps` → `docker stop <이름>` |
| 3분 지나도 컨테이너가 안 뜸 | auth-server가 healthy가 안 됨 | `logs -f auth-server` 확인. 메모리 부족이면 Docker 메모리 증설 후 `down` → `up -d` |
| 컨테이너가 계속 재시작 | 메모리 부족(OOM) | Docker Desktop 메모리 12GB로 |
| Eureka에 서비스가 3~4개만 | 아직 다 안 뜬 것 | 2분 더 기다린 뒤 새로고침 |
| `image not found` | `--pull never`인데 이미지 미로드 | 1-1을 다시 |
| 화면은 뜨는데 목록이 비어 있음 | `init-db` 폴더가 없어서 시드 0건 | 강사님께 `init-db` 요청 |

**전체 끄기 / 다시 켜기**
```bash
docker compose -f docker-compose.local.yml down      # 끄기 (데이터는 남음)
docker compose -f docker-compose.local.yml down -v   # 끄기 + DB 데이터까지 삭제 ⚠️
```

---

## Phase 2. Swagger에서 "첫 성공" 만들기 (20분) ★필수

> 💥 **작년 실패 사례 ①** (보강1 PART3): Swagger 연결법을 몰라 목업 데이터로만 화면을 만든 팀이 있었습니다.
> 발표에서 새로고침하니 원래 데이터로 돌아갔습니다. **원인은 단 하나 — Try it out을 한 번도 안 눌러본 것.**
> 이 Phase가 그 유일한 예방책입니다.

### 2-1. 토큰 없이 되는 것부터 (여기서 첫 성공을 만든다)

**http://localhost:8082/swagger-ui.html** 접속

1. `GET /api/courses` 항목을 펼친다
2. **Try it out** 버튼 클릭
3. **Execute** 클릭
4. → **Response body에 JSON이 나오면 성공.** 이게 첫 성공입니다.

> 왜 8080이 아니라 8082냐면: **게이트웨이(8080)는 토큰이 없으면 대부분 401**입니다.
> course-service는 조회가 공개라서 8082로 직접 부르면 토큰 없이 200이 나옵니다.
> 첫 성공을 여기서 만들고, 토큰은 그다음에 붙입니다.

5. 응답 JSON을 **그대로 복사해 서브노트 §3**에 붙여넣기
6. Execute 아래에 나오는 **`curl` 명령어도 복사해 두기** ← 나중에 화면 만들 때 그대로 옮기면 됨

### 2-2. Swagger 주소 정리

| 서비스 | 포트 | Swagger 주소 |
|---|---|---|
| user-service | 8081 | http://localhost:8081/swagger-ui.html |
| **course-service** | 8082 | **http://localhost:8082/swagger-ui.html** ← 여기서 시작 |
| enrollment-service | 8083 | http://localhost:8083/swagger-ui.html |
| payment-service | 8084 | http://localhost:8084/swagger-ui.html |
| recommend-service | 8085 | http://localhost:8085/docs (FastAPI라 주소가 다름) |

### 🔑 2-3. 헷갈리기 쉬운 규칙 두 줄 (외우세요)

> **① Swagger로 테스트할 때 → 개별 포트(8081~8085)**
> **② 내가 만든 화면(fetch/axios)에서 부를 때 → 반드시 게이트웨이 8080**

②를 어기고 화면에서 8082를 직접 부르면 **CORS 오류**가 납니다(가이드2 §부록1 5단계).
Swagger는 8082 페이지가 8082를 부르는 거라 같은 출처여서 CORS가 원리상 안 납니다. **서로 다른 이야기입니다.**

### 2-4. 토큰이 필요한 API 호출하기

1. 로그인 API를 Try it out으로 호출 → 응답에서 **토큰 복사**
   - ⚠️ 로그인 경로가 문서마다 다릅니다. **강사 질문 ①**로 확인하세요.
   - 후보: `POST /api/users/login` (user-service 8081) 또는 auth-server `POST /oauth2/token` (9000)
2. Swagger 화면 **우측 상단 `Authorize` 버튼** 클릭
3. `Bearer <복사한토큰>` 형식으로 입력 → Authorize
4. 이후 인증 필요한 API가 그냥 됩니다

**호출해 볼 순서**
```
GET  /api/courses                 (분양 단지 목록)
GET  /api/courses/{id}            (상세)
POST /api/enrollments             (신청 → status: PENDING 확인!)
GET  /api/enrollments/user/{id}   (내 신청 목록)
GET  /api/recommend/{userId}      (추천, 8085/docs 에서)
```

### 2-5. 401이 나오면 (자책하지 마세요, 설정 문제입니다)

compose 파일에 **issuer 설정이 서로 다르게** 들어 있습니다(실측):
- `api-gateway`, `recommend-service` → `http://localhost:8080`
- `user`, `course`, `enrollment`, `payment` → `http://auth-server:9000`

토큰 안의 발급자 정보는 하나뿐이라 **한쪽은 반드시 검증에 실패**합니다.
→ **8080에서 401이면 개별 포트(8082 등)로 우회**하고, 강사 질문 ②로 확인하세요.

📸 **스크린샷 ②** — Try it out 성공 화면

---

## Phase 3. 전체 흐름 한 번 타보기 (25분) ★필수

원본 시스템의 핵심 흐름입니다. **이 순서를 한 번 완주하는 게 목적**입니다.

```
회원가입 → 로그인 → 목록 조회 → 상세 조회 → 신청(PENDING)
   → 결제 → 상태가 자동으로 ACTIVE 로 바뀜 → 추천 목록 확인
```

**화면(vue-frontend)이 있으면**: http://localhost:3000 에서 위 순서대로 클릭하며 단계마다 캡처
**화면이 없으면**(현재 자료엔 프론트 이미지가 없습니다): Swagger만으로 같은 순서를 태웁니다

```
POST /api/enrollments        → 응답의 status 가 "PENDING" 인지 확인 📸
(결제 트리거)                → payment 쪽 처리
GET  /api/enrollments/user/{userId}  → status 가 "ACTIVE" 로 바뀌었는지 확인 📸
```

### ★ 여기가 이 실습의 핵심 관찰 포인트

**신청 직후엔 PENDING이었는데, 결제하고 나니 아무도 안 눌렀는데 ACTIVE로 바뀐다.**
이걸 바꾼 건 사람이 아니라 **Kafka 이벤트**입니다. 이게 "왜 MSA인가"의 실물입니다.

📸 **스크린샷 ③~⑥** — 각 단계. 서브노트 §2에 순서대로 배치.

---

## Phase 4. 이벤트 흐름을 눈으로 확인 (15분)

로그만 봐서는 잘 안 믿깁니다. **실제 메시지와 DB를 직접 봅니다.**

### 4-1. Kafka 메시지를 직접 꺼내 보기

```bash
docker exec -it lecture-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic payment.completed --from-beginning
```
→ 결제할 때마다 JSON 메시지가 한 줄씩 올라옵니다. `Ctrl+C`로 나갑니다.

```bash
# 다른 이벤트도
docker exec -it lecture-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic enrollment.completed --from-beginning
```

### 4-2. DB에서 상태 전환을 직접 확인

```bash
docker exec -it lecturedb mariadb -umanager -pSqlDba-1 lecture_db \
  -e "select id, user_id, course_id, status from enrollments"
```
→ `PENDING` → `ACTIVE`가 눈으로 보입니다.

```bash
# 다른 테이블도
docker exec -it lecturedb mariadb -umanager -pSqlDba-1 lecture_db -e "show tables"
docker exec -it lecturedb mariadb -umanager -pSqlDba-1 lecture_db -e "select * from courses limit 5"
```

### 4-3. 로그로 흐름 추적

```bash
docker compose -f docker-compose.local.yml logs -f payment-service     # 이벤트 발행
docker compose -f docker-compose.local.yml logs -f enrollment-service  # 이벤트 수신 → ACTIVE
docker compose -f docker-compose.local.yml logs -f recommend-service   # 추천 갱신
```

### 4-4. 서브노트 §4용 정리표 (직접 채우세요)

| 구간 | 방식 | 왜 이렇게 했을까 |
|---|---|---|
| enrollment → course (존재 확인) | 동기 REST | 즉시 답이 있어야 다음 단계 진행 가능 |
| enrollment → payment (결제 요청) | 동기 REST | 결제 결과를 바로 알아야 함 |
| payment → enrollment (`payment.completed`) | **비동기 Kafka** | 결제가 끝나고 나서 천천히 처리해도 됨 |
| enrollment → recommend (`enrollment.completed`) | **비동기 Kafka** | 추천 갱신은 급하지 않음 |

> **교재 p33 기준**: *"즉시 응답이 필요하면 REST, 서비스 간 느슨한 결합·이벤트 전파가 목적이면 Kafka"*

---

## Phase 5. 서비스 독립성 실험 (10분) — "왜 MSA인가"의 결정적 증거

> 출처: **보강1 CASE 02 apply** — Netflix의 Chaos Monkey(운영 중 서버를 무작위로 꺼서 장애 대응력을
> 상시 검증하는 도구)를 실습 규모로 줄인 것입니다.

```bash
# 1) 수강신청 서비스 하나만 끈다
docker compose -f docker-compose.local.yml stop enrollment-service

# 2) 그 상태에서 강의 조회가 여전히 되는지 확인
curl http://localhost:8082/api/courses

# 3) 다시 켠다
docker compose -f docker-compose.local.yml start enrollment-service
```

**해석**
- 조회가 **정상(200)** → 서비스가 진짜로 독립돼 있다는 뜻. 모놀리식이었다면 **전체가 같이 죽습니다.**
- 에러가 **전파됨** → 어디서 결합돼 있는지 로그로 추적 → 그것도 좋은 서브노트 소재입니다

### 5-1. 컨테이너 안에 들어가 보기 (보강2 Ⅸ장)

```bash
docker exec -it lecture-course /bin/sh   # ⚠️ bash가 아니라 sh (경량 JRE 이미지엔 bash가 없음)
```
컨테이너 안에서:
```sh
env | grep -i eureka     # 환경변수가 제대로 주입됐는지
env | grep -i datasource # DB 접속 주소
ps aux                   # 앱이 실제로 돌고 있는지
exit                     # 나가기 (컨테이너는 계속 실행됨! 멈추려면 docker stop)
```

> **보강2 핵심 개념**: 컨테이너들이 서로를 이름으로 찾는 이유는 두 가지입니다.
> ① compose의 `networks`가 같은 가상 네트워크로 묶고 **컨테이너 이름 기반 내부 DNS**를 자동 제공
> ② `environment`에 `http://eureka-server:8761/eureka/`처럼 상대 서비스 이름을 직접 적어둠
> 이 두 개가 없으면 이미지는 똑같이 만들어져도 컨테이너들은 서로를 전혀 못 찾습니다.

📸 **스크린샷 ⑦** — 실험 결과

---

## Phase 6. 코드는 "이만큼만" 읽는다 (20분)

> 💥 **작년 실패 사례 ②** (보강1 PART3): Eureka 설정 파일을 3시간째 들여다보다
> "나는 개발자 자격이 없나 보다"라고 자책한 팀이 있었습니다.
> **이해가 안 되는 게 정상입니다. 실습 범위를 벗어난 질문을 스스로에게 던진 것뿐입니다.**

### 6-1. 가이드2 §4 — 알아야 할 것 vs 몰라도 되는 것

| 구성요소 | **알아야 할 것** | **몰라도 되는 것** |
|---|---|---|
| user-service | 회원가입·로그인 요청 형식, 응답으로 오는 토큰 | 비밀번호 암호화 로직, DB 내부 구조 |
| course-service | 상품(과목) 등록·조회 API 형식 | JPA 매핑, 내부 쿼리 |
| enrollment-service | "신청하면 이벤트가 발생하고, 결제 후 자동으로 상태가 바뀐다"는 흐름 | Kafka Producer/Consumer 코드 |
| payment-service | 결제 완료 호출 → 이후 enrollment 상태가 바뀐다는 결과 | 결제 처리 내부 로직 |
| auth-server / api-gateway / eureka | 로그인하면 토큰이 나오고, 그 토큰을 헤더에 넣으면 다른 API가 동작한다는 **사용법** | 내부 설정, 서명 알고리즘, 서비스 등록 방식 |

### 6-2. 읽을 파일 목록 (이것만, 소스가 있을 때)

**course-service — 딱 4개 파일**
```
controller/CourseController.java   ← 어떤 API가 열려 있나
service/CourseService.java         ← 그 API가 무슨 일을 하나
repository/CourseRepository.java   ← DB에서 뭘 가져오나
entity/Course.java                 ← 어떤 데이터를 갖고 있나
```
읽는 관점은 딱 3줄: **"이 서비스는 ①어떤 데이터를 갖고 ②어떤 API를 열어주고 ③누구를 부르는가"**

**enrollment-service — kafka 폴더 3개 파일은 "언제 무슨 이벤트를 보내나"만**
```
kafka/KafkaEvent.java                 ← 이벤트에 뭐가 담기나
kafka/EnrollmentKafkaConsumer.java    ← payment.completed 를 받으면 뭘 하나
kafka/EnrollmentKafkaProducer.java    ← enrollment.completed 를 언제 보내나
```

### ⛔ 6-3. 절대 열지 않는 것
```
auth-server/     ← 수정 대상 아님. OAuth2는 실습 범위 밖(가이드1 명시)
api-gateway/     ← 수정 대상 아님
eureka-server/   ← 수정 대상 아님
```

---

## Phase 7. 작은 수정 1개 배포해 보기 (소스를 받은 뒤에만)

조별 실습의 예행연습입니다. **난이도 순으로 3개 중 하나를 고르세요.**

### 🟢 난이도 1 — 시드 데이터 값만 바꾸기 (10분)

`init-db/*.sql` 안의 `INSERT INTO courses ...` 문자열을 바꿉니다. **컬럼·스키마는 절대 건드리지 않습니다.**

```sql
-- 전
INSERT INTO courses (title, category, price, instructor_id) VALUES ('Spring Boot MSA 완성', 'BACKEND', 89000, 2);
-- 후
INSERT INTO courses (title, category, price, instructor_id) VALUES ('한빛마을 3단지 84A', 'SEOUL', 98000, 2);
```

**⚠️ 반영하려면 볼륨을 지워야 합니다 — 이게 제일 많이 걸리는 함정**
```bash
docker compose -f docker-compose.local.yml down -v      # -v 는 DB를 통째로 삭제합니다
docker compose -f docker-compose.local.yml up -d --pull never
```
> MariaDB는 **데이터 폴더가 비어 있을 때만** 초기화 SQL을 실행합니다.
> `down`만 하면 볼륨이 남아서 **SQL을 아무리 고쳐도 절대 반영되지 않습니다.**
> "내 SQL이 왜 안 먹지"로 몇 시간 태우는 지점이 정확히 여기입니다.

### 🟡 난이도 2 — 문구만 바꾸기 (20분)

컴파일이 깨질 위험이 거의 없고 Swagger에서 바로 눈에 보입니다.

```java
// course-service/src/main/java/com/lecture/course/controller/CourseController.java
@Operation(summary = "강의 목록 조회")      // → "분양 단지 목록 조회" 로 변경

// config/GlobalExceptionHandler.java
"강의를 찾을 수 없습니다"                   // → "해당 분양 단지를 찾을 수 없습니다"
```
```bash
docker compose -f docker-compose.local.yml up -d --build course-service
```

### 🔴 난이도 3 — 조회 API 1개 추가 (30분, DB 변경 없음)

기존 컬럼만 쓰므로 DB 마이그레이션 리스크가 0입니다.

```java
// 1) repository/CourseRepository.java — 한 줄 추가
List<Course> findByTitleContaining(String keyword);

// 2) service/CourseService.java — 위임 메서드 추가
public List<Course> search(String keyword) {
    return courseRepository.findByTitleContaining(keyword);
}

// 3) controller/CourseController.java — 3줄 추가
@GetMapping("/search")
public List<Course> search(@RequestParam String keyword) {
    return courseService.search(keyword);
}
```
```bash
docker compose -f docker-compose.local.yml up -d --build course-service
```
→ http://localhost:8082/swagger-ui.html 에 `GET /api/courses/search`가 새로 생겼는지 확인

### ✅ 7-1. 수정 후 반드시 하는 확인 — 여기가 MSA의 체감 포인트

```bash
docker compose -f docker-compose.local.yml ps
```
**course-service만 새로 뜨고, 나머지 9개는 그대로 살아 있습니다.**
→ *"기능 하나 고치려고 전체를 다시 배포할 필요가 없다"* — 이게 MSA를 쓰는 이유입니다.
이 문장을 서브노트에 **본인 관찰 기록으로** 적으세요.

### 7-2. 망가뜨렸을 때 되돌리기
```bash
# 소스를 되돌린다 (git이 있다면)
git checkout -- course-service/

# 그래도 안 되면 원본 이미지로 다시 기동
docker compose -f docker-compose.local.yml down
docker compose -f docker-compose.local.yml up -d --pull never
```

---

## Phase 8. 서브노트 작성 & 제출 (30분)

> **참고**: '서브노트'는 교재 100페이지 어디에도 나오지 않습니다. **SKALA 운영 가이드(가이드1)만의 요구사항**입니다.
> 아래 목차는 교재·가이드가 요구하는 산출 항목에서 역산한 안입니다. 강사 안내가 따로 있으면 그쪽을 우선하세요.

### 📄 서브노트 목차 (그대로 복사해서 채우세요)

```markdown
# Agile·MSA 실습 서브노트 — (이름)

## 1. 시스템 한눈에 보기
- 구성도 (가이드3의 그림을 캡처하거나 직접 그림)
- 📸 스크린샷 ① Eureka 대시보드
- 포트/역할 표

| 구성요소 | 포트 | 역할 | 내가 수정하나 |
|---|---|---|---|
| api-gateway | 8080 | 모든 요청의 단일 진입점, 라우팅·인증 필터 | ✕ 인프라 |
| eureka-server | 8761 | 서비스들이 서로를 찾는 주소록 | ✕ 인프라 |
| auth-server | 9000 | 로그인·토큰 발급 | ✕ 인프라 |
| user-service | 8081 | 회원가입·로그인·회원 조회 | △ |
| course-service | 8082 | 상품(과목) 등록·조회·검색 | ○ |
| enrollment-service | 8083 | 신청·상태 관리 (Kafka 송수신) | ○ |
| payment-service | 8084 | 결제 처리 (Kafka 발행) | ○ |
| recommend-service | 8085 | 규칙 기반 추천 (FastAPI) | ○ |
| kafka | 9092 | 서비스 간 비동기 이벤트 통로 | ✕ |
| mariadb | 3306→3379 | 데이터 저장 (테이블 단위 분리) | ✕ |

## 2. 내가 직접 태워본 전체 흐름
📸 스크린샷 ③~⑥ 을 순서대로 배치하고, 각 단계에서 어떤 API가 호출됐는지 한 줄씩

| 단계 | 화면에서 한 행동 | 실제로 호출된 API | 확인한 결과 |
|---|---|---|---|
| 1 | 로그인 | POST /api/users/login | 토큰 받음 |
| 2 | 목록 조회 | GET /api/courses | 6건 |
| 3 | 신청 | POST /api/enrollments | status = PENDING |
| 4 | 결제 | (내부) POST /api/payments/internal/request | COMPLETED |
| 5 | (자동) | Kafka payment.completed | status = ACTIVE 로 자동 변경 |
| 6 | 추천 | GET /api/recommend/{userId} | 5건 |

## 3. 내가 호출해 본 API 명세
(Swagger에서 Try it out 한 것만. 실제 요청/응답 JSON을 그대로 붙여넣기)

### GET /api/courses
요청: (없음)
응답:
```json
(여기에 붙여넣기)
```

### POST /api/enrollments
요청:
```json
{ "userId": 1, "courseId": 3 }
```
응답:
```json
(여기에 붙여넣기)
```

## 4. 동기(REST) vs 비동기(Kafka) — 어디서 왜 나뉘는가
(Phase 4-4 표를 붙이고, 마지막에 내 문장으로 한 줄)
> 교재 p33: 즉시 응답이 필요하면 REST, 느슨한 결합·이벤트 전파가 목적이면 Kafka

## 5. 인증 흐름 (사용법 수준까지만)
로그인 → 토큰 발급 → 이후 모든 요청 헤더에 `Authorization: Bearer <토큰>` → 각 서비스가 검증
- 내가 실제로 한 것: Swagger의 Authorize 버튼에 `Bearer xxx` 입력
- 몰라도 되는 것: JWK, 서명 알고리즘, issuer 검증 내부 동작

## 6. ★ 시행착오 로그 (가장 중요한 항목)
| # | 증상 | 내가 추측한 원인 | 실제 원인 | 해결 방법 | 배운 것 |
|---|---|---|---|---|---|
| 1 | up -d 했는데 컨테이너가 4개만 보임 | 빌드 실패인 줄 | auth-server healthy 대기(최대 120초) 중 | 3분 기다림 | depends_on 이 줄을 세운다 |
| 2 | port is already allocated | ... | 예전 실습 컨테이너 점유 | docker stop | 포트는 호스트 것이 하나뿐 |
| 3 | 시드 SQL을 고쳤는데 반영이 안 됨 | 오타인 줄 | down 만 해서 볼륨이 남음 | down -v | MariaDB는 빈 폴더일 때만 초기화 |
| 4 | 8080 호출 시 401 | 내 토큰이 잘못된 줄 | compose의 issuer 설정이 서로 다름 | 개별 포트로 우회 | 설정 문제일 수도 있다 |

## 7. 몰라도 된다고 판단하고 넘긴 것
| 넘긴 것 | 넘긴 이유 |
|---|---|
| auth-server의 AuthorizationServerConfig | 수정 대상 아님, OAuth2는 실습 범위 밖(가이드1 명시) |
| Kafka Producer/Consumer 내부 코드 | 가이드2 §4 "몰라도 되는 것" |
| JPA 매핑·내부 쿼리 | 위와 동일 |

## 8. 서비스 독립성 실험 결과 (Phase 5)
- 실험: enrollment-service 만 stop → course 조회 호출
- 결과: (200 / 에러)
- 📸 스크린샷 ⑦
- 해석: (모놀리식이었다면 어땠을까 한 줄)

## 9. 우리 팀 아이디어 치환 초안
| 템플릿 개념 | 우리 팀 |
|---|---|
| 강사 | |
| 과목 등록 | |
| 수강신청 | |
| 결제 | |
| 수강권한 노출 | |
| 추천(AI) | |
```

### 제출
- 반별 **슬랙 스레드**에 업로드
- 마크다운 그대로 / PDF / 노션 링크 — 강사 안내에 따름

---

## 📌 부록 A. 막혔을 때 질문하는 법 (가이드2 §9)

| ❌ 이렇게 묻지 마세요 | ⭕ 이렇게 물으세요 |
|---|---|
| "Eureka가 왜 이렇게 짜여 있나요?" | "이 API에 이 요청을 보냈는데 왜 이런 응답이 오나요?" |
| "OAuth2가 뭔가요?" | "8080으로 부르면 401인데 8082는 200입니다. 어느 쪽이 맞나요?" |

**질문에 반드시 붙일 3가지**: ① 내가 보낸 요청(URL·헤더·body) ② 받은 응답 ③ 관련 로그

> **15분 막히면 무조건 물어봅니다.** 혼자 3시간 = 작년 실패 사례 ②.
> 질문 범위를 좁히면 훨씬 빨리 답을 얻고, 야간 보강에서도 이 레벨의 질문을 우선 다룹니다.

## 📌 부록 B. 자주 쓰는 명령어 모음

```bash
# 상태 확인
docker compose -f docker-compose.local.yml ps
docker ps
docker images | grep msa-lecture

# 로그
docker compose -f docker-compose.local.yml logs -f <서비스명>
docker compose -f docker-compose.local.yml logs --tail 50 <서비스명>

# 컨테이너 안으로 (bash 없음! sh 사용)
docker exec -it lecture-course /bin/sh
docker exec -it lecture-kafka /bin/bash        # kafka 이미지는 bash 있음

# DB 접속
docker exec -it lecturedb mariadb -umanager -pSqlDba-1 lecture_db

# 서비스 하나만 재시작 / 재빌드
docker compose -f docker-compose.local.yml restart course-service
docker compose -f docker-compose.local.yml up -d --build course-service

# 끄기
docker compose -f docker-compose.local.yml down       # 데이터 유지
docker compose -f docker-compose.local.yml down -v    # ⚠️ DB 삭제
```

## 📌 부록 C. Docker 용어 3초 정리 (보강2 Ⅰ장)

| 용어 | 비유 | 뜻 |
|---|---|---|
| Dockerfile | 설계도 | 이미지를 어떻게 만들지 적은 파일 |
| 이미지 | 진공포장된 밀키트 | 읽기 전용, 불변. 하나로 여러 컨테이너를 만들 수 있음 |
| 컨테이너 | 조리 중인 상태 | 이미지를 꺼내 실행 중인 것 |
| `docker save` / `load` | 밀키트를 택배로 보내기 / 받기 | 이미지를 tar 파일로 내보내기 / 불러오기 |
| 포트 `8082:8082` | 벽에 구멍 뚫기 | 앞=내 PC 포트, 뒤=컨테이너 안 포트 |
| 볼륨 | 냉장고 | 컨테이너를 지워도 남는 저장소 (그래서 `down -v` 가 필요) |

> 도커의 뿌리 개념은 **"격리(Isolation)"** 하나입니다. 포트를 두 번 적는 이유도, 컨테이너 여러 개를 묶으려면
> 네트워크 설정이 필요한 이유도 전부 "격리된 벽에 어디를 어떻게 뚫을 것인가"에서 나옵니다.

## 📌 부록 D. 오늘의 자가진단 (보강1 PART4)

- [ ] Swagger UI에서 **Try it out을 최소 1번** 눌러 200 응답을 받았는가
- [ ] "몰라도 되는 것" 표를 읽고, 실제로 안 읽고 넘긴 코드가 있는가
- [ ] 신청 → 결제 → **자동 ACTIVE 전환**을 직접 눈으로 확인했는가
- [ ] 서비스 하나만 껐을 때 다른 서비스가 살아 있는 것을 확인했는가
- [ ] 시행착오 로그(§6)에 최소 3건을 적었는가
