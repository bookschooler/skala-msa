# 🔌 공공 API 연동 가이드 — 청약홈 · LH

> 담당: **#2 통합 분양공고 (course-service)**
> 목적: 2개 공공기관의 서로 다른 응답을 **하나의 통합 공고 모델**로 정규화

---

## 1. 인증키 발급 (5분, 자동승인)

| # | 기관 | 서비스 | 신청 페이지 | 트래픽 |
|---|---|---|---|---|
| ① | 한국부동산원 | 청약홈 분양정보 조회 서비스 | data.go.kr/data/**15098547**/openapi.do | 40,000건/일 |
| ② | 한국토지주택공사 | 분양임대공고문 조회 서비스 | data.go.kr/data/**15058530**/openapi.do | 10,000건/일 |

1. data.go.kr 로그인 → 위 두 페이지에서 각각 **[활용신청]**
2. 활용목적 **"학습/교육"**, 사유 한 줄 → **개발계정 자동승인 (즉시)**
3. `마이페이지 > 데이터활용 > Open API > 개발계정` 에서 인증키 확인

> 💡 **키 하나로 둘 다 됩니다.** 계정당 인증키는 1개고, 서비스별로 "활용신청"만 각각 해두면
> 같은 키로 모든 승인된 API를 호출합니다.

---

## 2. ⚠️ 가장 많이 막히는 지점 — 인증키 인코딩

포털이 **Encoding 키 / Decoding 키** 2개를 줍니다. 잘못 쓰면 계속 인증 실패합니다.

| 상황 | 쓸 키 | 이유 |
|---|---|---|
| 브라우저 주소창 / URL 문자열에 직접 붙여넣기 | **Encoding** | 이미 URL-safe |
| curl `-G --data-urlencode`, WebClient, axios, requests | **Decoding** | 라이브러리가 인코딩함 |

Decoding 키를 URL에 그대로 넣으면 `+` `/` `=` 가 깨집니다. **인증 실패의 90%가 이것입니다.**

---

## 3. curl로 먼저 확인 (코드 짜기 전에 반드시)

```bash
export DATA_GO_KR_KEY='발급받은_Decoding_키'

./scripts/fetch-apis.sh all        # 두 API 실데이터 조회
./scripts/fetch-apis.sh fields     # 응답 필드명 전체 추출 ← 통합 모델 설계용
./scripts/fetch-apis.sh cheongyak  # 청약홈만
./scripts/fetch-apis.sh lh         # LH만

FROM=2025-01-01 TO=2025-12-31 N=10 ./scripts/fetch-apis.sh   # 기간·건수 조정
```

### 인증키 없이도 서비스 존재 확인하는 법
```bash
curl -s "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?serviceKey=test"
# code:-4 (인증키 오류) = 서비스 존재 ✅   /   code:-3 = 그런 오퍼레이션 없음 ❌
```

---

## 4. 두 API 호출 방식 (완전히 다릅니다)

### ① 청약홈 — odcloud 방식, 연산자가 파라미터명에 박힘

```
GET https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail
    ?serviceKey={key}
    &page=1&perPage=10&returnType=JSON
    &cond[RCRIT_PBLANC_DE::GTE]=2026-01-01      # 모집공고일 >=
    &cond[RCRIT_PBLANC_DE::LTE]=2026-12-31      # 모집공고일 <=
    &cond[SUBSCRPT_AREA_CODE_NM::EQ]=서울       # 공급지역 =
```
연산자: `EQ`(=) `LT`(<) `LTE`(<=) `GT`(>) `GTE`(>=)

**오퍼레이션** (호출로 존재 확인 완료)

| operationId | 내용 |
|---|---|
| `getAPTLttotPblancDetail` | **APT 분양정보** ← 메인 |
| `getAPTLttotPblancMdl` | APT 주택형별 상세 (면적·세대수·분양가) |
| `getUrbtyOfctlLttotPblancDetail` / `Mdl` | 오피스텔·도시형·민간임대·생활숙박 |
| `getRemndrLttotPblancDetail` / `Mdl` | 무순위·잔여세대 |
| `getOPTLttotPblancDetail` | 임의공급 |
| `getPblPvtRentLttotPblancMdl` | 공공지원 민간임대 주택형별 |

**응답 형태**
```json
{ "currentCount":10, "page":1, "perPage":10, "totalCount":123,
  "data": [ { "HOUSE_MANAGE_NO":"...", "HOUSE_NM":"...", ... } ] }
```

### ② LH — 표준 data.go.kr 방식, 응답이 배열로 감싸짐

```
GET https://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1
    ?serviceKey={key}
    &PG_SZ=10&PAGE=1
    &PAN_ST_DT=20260101          # 공고게시일 시작 ⚠️ YYYYMMDD, 하이픈 없음
    &PAN_ED_DT=20261231          # 공고게시일 종료 ⚠️ 이름이 PAN_NT_ 가 아닙니다
    &UPP_AIS_TP_CD=05            # 공고유형: 01/05/06/13/22/39
```

**응답 형태 — 2원소 배열입니다. 여기서 파싱 많이 틀립니다.**
```json
[
  { "dsSch": [ {...검색조건...} ] },
  { "resHeader": [ { "SS_CODE": "Y", "RESULT_MSG": "..." } ],
    "dsList":    [ { "PAN_ID":"...", "PAN_NM":"...", ... } ] }
]
```
- 실제 데이터는 **두 번째 원소의 `dsList`**
- `dsSch` 에 **서버가 실제로 인식한 검색조건이 그대로 echo** 됩니다 → 파라미터 검증에 쓰세요

> 🔴 **LH는 파라미터명이 틀려도 에러를 내지 않고 조용히 무시합니다.**
> `PAN_NT_ST_DT` 로 보내면 최근 2개월 기본값으로 응답이 와서 **성공한 줄 압니다.**
> 반드시 `dsSch` 의 echo 값이 내가 보낸 값과 같은지 확인하세요.
> 올바른 이름: **`PAN_ST_DT` / `PAN_ED_DT`**, 포맷 **`YYYYMMDD`**.

---

## 5. 통합 공고 모델 — 이게 님 역할의 핵심 산출물

두 기관 응답이 다르므로, course-service에 **어댑터 계층**을 두고 하나로 정규화합니다.

```
청약홈 응답 ─┐
             ├─→ [Adapter] ─→ UnifiedNotice ─→ Course(courses 테이블) ─→ GET /api/courses
LH 응답    ─┘
```

### 필드 매핑표 ✅ 실제 응답으로 검증 완료 (2026-08-26)

| 통합 모델 | 청약홈 `getAPTLttotPblancDetail` | LH `lhLeaseNoticeInfo1` | → `courses` |
|---|---|---|---|
| `externalId` | `PBLANC_NO` `2026000404` | `PAN_ID` `BN-0001342` | — |
| `title` | `HOUSE_NM` `검암역 푸르지오 프라베뉴 (B-1BL) 공공분양주택` | `PAN_NM` | `title` |
| `supplier` | `BSNS_MBY_NM` (사업주체, 컨소시엄이면 쉼표 다수) | (LH 고정) | `instructor_id` 치환 |
| `builder` | `CNSTRCT_ENTRPS_NM` (시공사) | — | `description` |
| `region` | `SUBSCRPT_AREA_CODE_NM` `인천` | `CNP_CD_NM` `경기도`/`전국` | `category` enum |
| `address` | `HSSPLY_ADRES` + `HSSPLY_ZIP` | — | `description` |
| `totalUnits` | `TOT_SUPLY_HSHLDCO` `441` | — | `supply_units` |
| `noticeDate` | `RCRIT_PBLANC_DE` `2026-08-21` | `PAN_NT_ST_DT` `2026.08.26` | `created_at` |
| `receiptBgn` | `RCEPT_BGNDE` `2026-08-31` | — | — |
| `receiptEnd` | `RCEPT_ENDDE` `2026-09-02` | `CLSG_DT` `2026.12.31` | `status` 산출 |
| `announceDate` | `PRZWNER_PRESNATN_DE` (당첨자발표) | — | — |
| `moveInYm` | `MVN_PREARNGE_YM` `202907` | — | — |
| `price` | **`getAPTLttotPblancMdl` 의 `LTTOT_TOP_AMOUNT`** | — | `price` |
| `supplyType` | **`HOUSE_DTL_SECD_NM`** `국민`/`민영` | 공공 고정 | DTO 계산 필드 |
| `detailUrl` | `PBLANC_URL` | `DTL_URL` | — |
| `phone` | `MDHS_TELNO` | — | — |

**날짜 포맷이 다릅니다:** 청약홈 `2026-08-21` / LH `2026.08.26` → 어댑터에서 통일 필요.

### 💡 실제 응답에서 발견한 것 3가지

**① 공공/민간은 `HOUSE_DTL_SECD_NM` 이 정답입니다**
사업주체명(`BSNS_MBY_NM`) 문자열을 파싱할 필요가 없습니다.
`HOUSE_DTL_SECD_NM` = **`국민`(국민주택 = 공공분양)** / **`민영`(민영주택 = 민간분양)**.
LH는 전부 공공이므로 고정.

**② 분양가는 이미 「만원 단위」입니다 — 나누지 마세요**
```
LTTOT_TOP_AMOUNT = 48630   →  4억 8,630만원
```
`courses.price` 가 `DECIMAL(10,2)`(최대 약 1억)인데 **만원 단위라 그대로 들어갑니다.**
원 단위인 줄 알고 `/10000` 하면 **분양가가 4만원**이 됩니다.

**③ `getAPTLttotPblancMdl` 은 공고당 여러 행(주택형별)입니다**
`HOUSE_MANAGE_NO` 로 조회하면 `060.9495A`, `060.6527B` … 주택형마다 1행 + 각각 다른
`LTTOT_TOP_AMOUNT` / `SUPLY_AR`(공급면적) / `SUPLY_HSHLDCO`(세대수).
→ 공고 1건에 최고가만 쓸지, 주택형별로 `courses` 여러 건을 만들지 **결정 필요**.
(도메인매핑표의 `한빛마을 3단지 84A` 예시를 보면 **주택형별로 1건**이 원래 의도입니다.)

## 6. Spring 연동 코드 (course-service)

### 6-1. `application.yml`

```yaml
# 키는 절대 커밋하지 않습니다. 환경변수로 주입.
public-api:
  key: ${DATA_GO_KR_KEY:}
  cheongyak:
    base-url: https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1
  lh:
    base-url: https://apis.data.go.kr/B552555/lhLeaseNoticeInfo1
```
```bash
# docker-compose.yml 의 course-service 에
environment:
  - DATA_GO_KR_KEY=${DATA_GO_KR_KEY}
```

### 6-2. WebClient 설정

```java
package com.lecture.course.config;

import org.springframework.context.annotation.*;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;

@Configuration
public class PublicApiConfig {

    // 공공 API는 느릴 때가 있어 타임아웃을 넉넉히 + 응답이 커서 버퍼도 키웁니다
    private WebClient build(String baseUrl) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(
                        HttpClient.create().responseTimeout(Duration.ofSeconds(10))))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                .build();
    }

    @Bean WebClient cheongyakClient(@Value("${public-api.cheongyak.base-url}") String url) {
        return build(url);
    }

    @Bean WebClient lhClient(@Value("${public-api.lh.base-url}") String url) {
        return build(url);
    }
}
```

### 6-3. 청약홈 클라이언트

```java
package com.lecture.course.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class CheongyakClient {

    private final @Qualifier("cheongyakClient") WebClient client;

    @Value("${public-api.key}")
    private String serviceKey;

    /** APT 분양정보 목록 조회 */
    public List<Map<String, Object>> fetchAptNotices(String from, String to, int perPage) {
        Map<String, Object> res = client.get()
            .uri(uri -> uri.path("/getAPTLttotPblancDetail")
                // ⚠️ queryParam 은 자동 인코딩됩니다 → Decoding 키를 넣으세요
                .queryParam("serviceKey", serviceKey)
                .queryParam("page", 1)
                .queryParam("perPage", perPage)
                .queryParam("returnType", "JSON")
                .queryParam("cond[RCRIT_PBLANC_DE::GTE]", from)
                .queryParam("cond[RCRIT_PBLANC_DE::LTE]", to)
                .build())
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        if (res == null || res.get("data") == null) {
            log.warn("청약홈 응답 이상: {}", res);
            return List.of();   // 외부 API 실패가 우리 목록 API를 죽이면 안 됩니다
        }
        return (List<Map<String, Object>>) res.get("data");
    }
}
```

### 6-4. LH 클라이언트 (배열 응답 파싱 주의)

```java
package com.lecture.course.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class LhClient {

    private final @Qualifier("lhClient") WebClient client;

    @Value("${public-api.key}")
    private String serviceKey;

    /** 분양임대공고문 목록 조회 */
    public List<Map<String, Object>> fetchNotices(String from, String to, int size) {
        List<Map<String, Object>> res = client.get()
            .uri(uri -> uri.path("/lhLeaseNoticeInfo1")
                .queryParam("serviceKey", serviceKey)
                .queryParam("PG_SZ", size)
                .queryParam("PAGE", 1)
                // ⚠️ PAN_NT_ST_DT 아닙니다. 틀리면 에러 없이 최근 2개월 기본값이 옵니다.
                .queryParam("PAN_ST_DT", from)   // YYYYMMDD
                .queryParam("PAN_ED_DT", to)     // YYYYMMDD
                .queryParam("UPP_AIS_TP_CD", "05")
                .build())
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
            .block();

        if (res == null) { log.warn("LH 응답 null"); return List.of(); }

        // 응답이 [{dsSch}, {resHeader, dsList}] 형태라 dsList 를 가진 블록을 찾습니다
        for (Map<String, Object> block : res) {
            Object list = block.get("dsList");
            if (list instanceof List<?> l) return (List<Map<String, Object>>) l;
        }
        log.warn("LH dsList 없음: {}", res);
        return List.of();
    }
}
```

### 6-5. 어댑터 — 두 응답을 하나로

```java
package com.lecture.course.external;

import com.lecture.course.entity.Course;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public final class NoticeAdapter {

    // 지역명 → courses.category enum (3개 고정) 매핑
    private static Course.Category toCategory(String regionName) {
        if (regionName == null) return Course.Category.OTHER;
        if (regionName.contains("서울")) return Course.Category.SECURITY;   // 서울
        if (regionName.contains("경기")) return Course.Category.MOBILE;     // 경기
        if (regionName.contains("인천")) return Course.Category.DATABASE;   // 인천
        return Course.Category.OTHER;
    }

    // LTTOT_TOP_AMOUNT 는 이미 "만원" 단위입니다 (48630 = 4억 8,630만원).
    // ⚠️ 나누지 마세요. /10000 하면 분양가가 4만원이 됩니다.
    private static BigDecimal toManwon(Object amount) {
        if (amount == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(amount.toString().replaceAll("[^0-9]", ""));
        } catch (Exception e) { return BigDecimal.ZERO; }
    }

    // 날짜 포맷 통일: 청약홈 "2026-08-21" / LH "2026.08.26" → LocalDate
    private static LocalDate toDate(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String d = raw.replace(".", "-").trim();
        try { return LocalDate.parse(d); } catch (Exception e) { return null; }
    }

    private static String s(Map<String, Object> m, String k) {
        Object v = m.get(k);
        return v == null ? "" : v.toString();
    }

    /** 청약홈 → 통합 */
    public static UnifiedNotice fromCheongyak(Map<String, Object> r) {
        return UnifiedNotice.builder()
                .source("청약홈")
                .externalId(s(r, "PBLANC_NO"))
                .title(s(r, "HOUSE_NM"))
                .supplier(s(r, "BSNS_MBY_NM"))
                .category(toCategory(s(r, "SUBSCRPT_AREA_CODE_NM")))
                .address(s(r, "HSSPLY_ADRES"))
                .noticeDate(toDate(s(r, "RCRIT_PBLANC_DE")))
                .receiptEnd(toDate(s(r, "RCEPT_ENDDE")))
                .totalUnits(s(r, "TOT_SUPLY_HSHLDCO"))
                .detailUrl(s(r, "PBLANC_URL"))
                // HOUSE_DTL_SECD_NM: "국민"=국민주택(공공) / "민영"=민영주택(민간)
                .supplyType("국민".equals(s(r, "HOUSE_DTL_SECD_NM")) ? "공공분양" : "민간분양")
                .build();
    }

    /** LH → 통합 */
    public static UnifiedNotice fromLh(Map<String, Object> r) {
        return UnifiedNotice.builder()
                .source("LH")
                .externalId(s(r, "PAN_ID"))
                .title(s(r, "PAN_NM"))
                .supplier("한국토지주택공사")
                .category(toCategory(s(r, "CNP_CD_NM")))
                .noticeDate(toDate(s(r, "PAN_NT_ST_DT")))   // LH 는 "2026.08.26" 형식
                .receiptEnd(toDate(s(r, "CLSG_DT")))
                .detailUrl(s(r, "DTL_URL"))
                .supplyType("공공분양")     // LH 는 항상 공공
                .build();
    }
}
```

### 6-6. 통합 조회 서비스

```java
public List<UnifiedNotice> fetchAll(String from, String to, int n) {
    List<UnifiedNotice> result = new ArrayList<>();

    // 한쪽 기관이 죽어도 나머지는 나오게 — 발표 데모 안전장치
    try {
        cheongyakClient.fetchAptNotices(from, to, n)
            .forEach(r -> result.add(NoticeAdapter.fromCheongyak(r)));
    } catch (Exception e) { log.warn("청약홈 조회 실패, 건너뜀", e); }

    try {
        lhClient.fetchNotices(from, to, n)
            .forEach(r -> result.add(NoticeAdapter.fromLh(r)));
    } catch (Exception e) { log.warn("LH 조회 실패, 건너뜀", e); }

    return result;   // ← "2개 공공기관 통합" 이 여기서 증명됩니다
}
```

---

## 7. 🔴 발표 데모 안전장치 (권장)

실 API를 라이브로 호출하면 **네트워크·트래픽 한도·기관 점검** 때문에 하필 발표 때 터집니다.

**권장 구성 — 실 API로 한 번 받아서 파일로 저장, 데모는 파일 재생**

```bash
# 미리 실데이터를 받아 캐시해 둡니다
./scripts/fetch-apis.sh all > msa-lecture/course-service/src/main/resources/mock/notices.json
```
```yaml
public-api:
  mode: cache      # live | cache  ← 발표 때는 cache
```

발표 멘트:
> "두 공공기관의 실제 오픈 API 응답 스키마를 그대로 사용하되,
> 데모 안정성을 위해 응답을 캐시해서 재생합니다. 어댑터 계층은 동일하게 동작합니다."

이러면 **실 API 연동했다는 점수는 다 받고, 데모가 터질 위험은 0** 입니다.

---

## 8. 체크리스트

- [ ] data.go.kr 가입 + 두 서비스 활용신청 (자동승인)
- [ ] `export DATA_GO_KR_KEY=...` (Decoding 키)
- [ ] `./scripts/fetch-apis.sh all` 성공 — 두 기관 실데이터 확인
- [ ] `./scripts/fetch-apis.sh fields` — **5장 필드 매핑표를 실제 응답으로 수정**
- [ ] 지역명 → enum 3개 매핑 확인 (그 외는 `OTHER`)
- [ ] 분양가 **만원 단위** 변환 확인 (원 단위 넣으면 오버플로)
- [ ] 한쪽 API 실패해도 목록이 뜨는지 확인
- [ ] 인증키가 커밋되지 않았는지 확인 (`git grep` )
