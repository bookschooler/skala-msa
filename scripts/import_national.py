#!/usr/bin/env python3
"""
청약홈 + LH 공공 API → 전국 데이터 수집 → 03_seed_courses.sql 생성
- 지역 제한 없음 (전국)
- 2025-01-01 이후 공고
- Docker 없이 SQL 파일만 생성
"""
import json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path("C:/Users/user/Desktop/SKALA/skala-workspace/skala-MSA")
ENV_FILE = ROOT / ".env.local"
OUT_SQL  = ROOT / "msa-lecture/init-db/03_seed_courses.sql"

CY_BASE = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1"
LH_URL  = "https://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1"
START_DATE = "2025-01-01"

# ── 인증키 로드 ───────────────────────────────────────────────────────
env = {}
for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
    m = re.match(r'\s*([A-Za-z_]\w*)\s*=\s*(.*)', line)
    if m and m.group(2).strip():
        env[m.group(1)] = m.group(2).strip().strip('"\'')
CY_KEY = env.get("CHEONGYAK_KEY") or env.get("DATA_GO_KR_KEY", "")
LH_KEY = env.get("LH_KEY") or env.get("DATA_GO_KR_KEY", "")

# ── 공급사 매핑 (02_seed_suppliers.sql 과 일치) ──────────────────────
# 101: 한국토지주택공사, 102: 경기주택도시공사
# 103: 포스코이앤씨, 104: 지에스건설, 105: 대우건설
def match_supplier(row):
    is_public = row.get("HOUSE_DTL_SECD_NM") == "국민"
    if is_public:
        who = re.sub(r'㈜|\(주\)|주식회사|\(유\)|\s+', '', row.get("BSNS_MBY_NM", ""))
        if "경기주택도시공사" in who: return 102
        if "한국토지주택공사" in who or "LH" in who: return 101
        return 101  # 기타 공공기관 → LH로 매핑
    else:
        who = re.sub(r'㈜|\(주\)|주식회사|\(유\)|\s+', '', row.get("CNSTRCT_ENTRPS_NM", ""))
        if "포스코이앤씨" in who or "포스코" in who: return 103
        if "지에스건설" in who or "GS건설" in who:  return 104
        if "대우건설" in who:                       return 105
        # 기타 민간 건설사 → 포스코이앤씨로 매핑
        return 103

# ── 지역 → category enum 매핑 ────────────────────────────────────────
def region_to_category(addr: str) -> str:
    if not addr: return "OTHER"
    if "서울" in addr: return "SECURITY"
    if "경기" in addr: return "MOBILE"
    if "인천" in addr: return "DATABASE"
    return "OTHER"

# ── API 호출 유틸 ─────────────────────────────────────────────────────
def fetch(url, params, retries=3):
    for i in range(retries):
        try:
            q = urllib.parse.urlencode(params, encoding="utf-8")
            with urllib.request.urlopen(f"{url}?{q}", timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:
            if i == retries - 1: raise
            print(f"  재시도 {i+1}/{retries}: {e}")
            time.sleep(2)

# ── SQL 이스케이프 ────────────────────────────────────────────────────
def esc(s): return str(s).replace("\\", "\\\\").replace("'", "''")

# ════════════════════════════════════════════════════════════════════════
# 1) 청약홈: 전국 공고 수집 (페이지네이션)
# ════════════════════════════════════════════════════════════════════════
print("=" * 60)
print("[청약홈] 전국 데이터 수집 시작...")
PER_PAGE = 200
page = 1
all_notices = []

while True:
    print(f"  페이지 {page} 요청 중...", end=" ")
    d = fetch(f"{CY_BASE}/getAPTLttotPblancDetail", {
        "serviceKey": CY_KEY,
        "page": page,
        "perPage": PER_PAGE,
        "returnType": "JSON",
        "cond[RCRIT_PBLANC_DE::GTE]": START_DATE,
    })
    data = d.get("data") or []
    total = d.get("totalCount", 0)
    print(f"{len(data)}건 (총 {total}건)")
    all_notices.extend(data)
    if len(all_notices) >= total or len(data) < PER_PAGE:
        break
    page += 1
    time.sleep(0.3)

print(f"[청약홈] 총 {len(all_notices)}건 수집 완료")

# ── 공급사 매핑 (못 찾으면 공공→101, 민간→103 fallback) ──────────────
notices_matched = []
for r in all_notices:
    sid = match_supplier(r)
    addr = r.get("HSSPLY_ADRES", "")
    r["_supplierId"] = sid
    r["_category"] = region_to_category(addr)
    notices_matched.append(r)

print(f"[청약홈] 공급사 매핑 완료 → {len(notices_matched)}건")

# ── 주택형별 전개 ──────────────────────────────────────────────────────
print("[청약홈] 주택형 상세 조회 중...")
rows = []
seen_titles = set()

for idx, n in enumerate(notices_matched):
    if idx % 10 == 0:
        print(f"  {idx}/{len(notices_matched)} 처리 중...")
    try:
        mdl = fetch(f"{CY_BASE}/getAPTLttotPblancMdl", {
            "serviceKey": CY_KEY,
            "page": 1, "perPage": 50,
            "returnType": "JSON",
            "cond[HOUSE_MANAGE_NO::EQ]": n["HOUSE_MANAGE_NO"],
        })
        types = mdl.get("data") or []
        time.sleep(0.1)
    except Exception as e:
        print(f"  [경고] 주택형 조회 실패 ({n.get('HOUSE_NM','')}): {e}")
        continue

    if not types:
        # 주택형 없으면 단지 자체를 1건으로 처리
        title = n.get("HOUSE_NM", "")[:255]
        if title and title not in seen_titles:
            seen_titles.add(title)
            rows.append({
                "title": title,
                "description": json.dumps({
                    "source": "APPLY_HOME", "sourceLabel": "청약홈",
                    "summary": n.get("HSSPLY_ADRES", ""),
                    "housingType": "공공분양" if n.get("HOUSE_DTL_SECD_NM") == "국민" else "민영분양",
                    "supplyType": n.get("RENT_SECD_NM") or "분양주택",
                    "region": n.get("SUBSCRPT_AREA_CODE_NM", ""),
                    "address": n.get("HSSPLY_ADRES", ""),
                    "announcementDate": n.get("RCRIT_PBLANC_DE"),
                    "applyStart": n.get("RCEPT_BGNDE"),
                    "applyEnd": n.get("RCEPT_ENDDE"),
                    "resultDate": n.get("PRZWNER_PRESNATN_DE"),
                    "moveInYm": n.get("MVN_PREARNGE_YM"),
                    "contact": n.get("MDHS_TELNO"),
                    "builder": n.get("CNSTRCT_ENTRPS_NM"),
                    "detailUrl": n.get("PBLANC_URL"),
                }, ensure_ascii=False),
                "category": n["_category"],
                "price": 0,
                "instructor_id": n["_supplierId"],
            })
        continue

    for t in types:
        price_raw = t.get("LTTOT_TOP_AMOUNT")
        if not price_raw:
            continue
        try:
            price = int(float(str(price_raw).replace(",", "")))
        except:
            continue
        if price > 9999999:  # DECIMAL(10,2) 한도 초과 방지
            price = 9999999

        area  = t.get("SUPLY_AR", "")
        ty    = (t.get("HOUSE_TY") or "").strip()
        label = re.sub(r'^0+', '', ty.split('.')[0]) + (ty[-1] if ty and ty[-1].isalpha() else '')
        title = f"{n['HOUSE_NM']} {label}"[:255]

        if title in seen_titles:
            continue
        seen_titles.add(title)

        rows.append({
            "title": title,
            "description": json.dumps({
                "source": "APPLY_HOME", "sourceLabel": "청약홈",
                "summary": f"{n.get('HSSPLY_ADRES','')} · 전용 {area}㎡ · 총 {n.get('TOT_SUPLY_HSHLDCO','?')}세대",
                "housingType": "공공분양" if n.get("HOUSE_DTL_SECD_NM") == "국민" else "민영분양",
                "supplyType": n.get("RENT_SECD_NM") or "분양주택",
                "region": n.get("SUBSCRPT_AREA_CODE_NM", ""),
                "address": n.get("HSSPLY_ADRES", ""),
                "unitType": label,
                "areaM2": area,
                "totalUnits": n.get("TOT_SUPLY_HSHLDCO"),
                "announcementDate": n.get("RCRIT_PBLANC_DE"),
                "applyStart": n.get("RCEPT_BGNDE"),
                "applyEnd": n.get("RCEPT_ENDDE"),
                "resultDate": n.get("PRZWNER_PRESNATN_DE"),
                "moveInYm": n.get("MVN_PREARNGE_YM"),
                "contact": n.get("MDHS_TELNO"),
                "builder": n.get("CNSTRCT_ENTRPS_NM"),
                "detailUrl": n.get("PBLANC_URL"),
            }, ensure_ascii=False),
            "category": n["_category"],
            "price": price,
            "instructor_id": n["_supplierId"],
        })

print(f"[청약홈] 주택형 전개 완료 → {len(rows)}건")

# ════════════════════════════════════════════════════════════════════════
# 2) LH: 전국 공고 수집 (페이지네이션)
# ════════════════════════════════════════════════════════════════════════
print()
print("[LH] 전국 데이터 수집 시작...")
lh_page = 1
lh_count = 0

while True:
    print(f"  페이지 {lh_page} 요청 중...", end=" ")
    try:
        lh_data = fetch(LH_URL, {
            "serviceKey": LH_KEY,
            "PG_SZ": 100, "PAGE": lh_page,
            "PAN_ST_DT": "20250101",
            "PAN_ED_DT": "20261231",
            "UPP_AIS_TP_CD": "05",
        })
    except Exception as e:
        print(f"[경고] LH 조회 실패: {e}")
        break

    ds = next((b["dsList"] for b in lh_data if isinstance(b, dict) and "dsList" in b), [])
    print(f"{len(ds)}건")

    for r in ds:
        addr = r.get("CNP_CD_NM", "")
        cat = region_to_category(addr)
        dot = lambda v: (v or "").replace(".", "-")
        title = (r.get("PAN_NM") or "")[:255]
        if not title or title in seen_titles:
            continue
        seen_titles.add(title)
        rows.append({
            "title": title,
            "description": json.dumps({
                "source": "LH_PLUS", "sourceLabel": "LH청약플러스",
                "summary": f"{addr} · {r.get('AIS_TP_CD_NM', '')}",
                "housingType": "공공분양",
                "supplyType": r.get("AIS_TP_CD_NM") or "분양주택",
                "region": addr,
                "address": addr,
                "announcementDate": dot(r.get("PAN_NT_ST_DT")),
                "applyStart": dot(r.get("PAN_NT_ST_DT")),
                "applyEnd": dot(r.get("CLSG_DT")),
                "noticeStatus": r.get("PAN_SS"),
                "detailUrl": r.get("DTL_URL"),
            }, ensure_ascii=False),
            "category": cat,
            "price": 0,
            "instructor_id": 101,
        })
        lh_count += 1

    if len(ds) < 100:
        break
    lh_page += 1
    time.sleep(0.3)

print(f"[LH] 총 {lh_count}건 추가")

# ════════════════════════════════════════════════════════════════════════
# 3) SQL 파일 생성
# ════════════════════════════════════════════════════════════════════════
print()
print(f"총 {len(rows)}건 → SQL 파일 생성 중...")

values_sql = ",\n".join(
    f"  ('{esc(r['title'])}', '{esc(r['description'])}', '{r['category']}', "
    f"{r['price']}.00, {r['instructor_id']}, 0, 'ACTIVE', NOW(6), NOW(6))"
    for r in rows
)

header = f"""\
-- ═══════════════════════════════════════════════════════════════════
-- 분양공고(courses) 시드 — 전국 데이터 (자동 생성)
--
-- 출처: 한국부동산원 청약홈 + 한국토지주택공사(LH) 공공데이터 오픈API
-- 기간: {START_DATE} 이후
-- 총 건수: {len(rows)}건
--
-- category enum: SECURITY=서울 / MOBILE=경기 / DATABASE=인천 / OTHER=기타지역
-- price: 만원 단위 (48630 = 4억8630만원)
-- instructor_id: 02_seed_suppliers.sql 의 id 값과 일치
--   101 한국토지주택공사 / 102 경기주택도시공사 (공공)
--   103 포스코이앤씨 / 104 지에스건설 / 105 대우건설 (민간)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO courses
  (title, description, category, price, instructor_id, enrollment_count, status, created_at, updated_at)
VALUES
{values_sql}
ON DUPLICATE KEY UPDATE title = title;
"""

OUT_SQL.write_text(header, encoding="utf-8")
print(f"[완료] 저장: {OUT_SQL}")
print(f"   -> Docker 다음 시작 시 자동 적재됩니다.")
