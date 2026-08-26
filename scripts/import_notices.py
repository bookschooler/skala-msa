#!/usr/bin/env python3
"""
청약홈 + LH 공공 API → courses 테이블 적재 (A안: 주택형별 1건)

사용법:
  python3 scripts/import_notices.py           # 실제 적재
  python3 scripts/import_notices.py --dry     # SQL만 출력, DB 안 건드림
"""
import json, re, subprocess, sys, urllib.parse, urllib.request, collections

ROOT = "/Users/yunsoyoung/skala-workspace/skala-MSA"
CY = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1"
LH = "https://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1"
DRY = "--dry" in sys.argv

# ── 인증키 ──────────────────────────────────────────────────────────
env = {}
for line in open(f"{ROOT}/.env.local", encoding="utf-8"):
    m = re.match(r'\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)', line)
    if m and m.group(2).strip():
        env[m.group(1)] = m.group(2).strip().strip('"\'')
CY_KEY = env.get("CHEONGYAK_KEY") or env["DATA_GO_KR_KEY"]
LH_KEY = env.get("LH_KEY") or env["DATA_GO_KR_KEY"]

# ── 공급사 매핑 (init-db/02_seed_suppliers.sql 과 일치해야 함) ────────
PUBLIC_SUPPLIER_IDS = [101, 102]
SUPPLIERS = {101: "한국토지주택공사", 102: "경기주택도시공사",
             103: "포스코이앤씨",     104: "지에스건설", 105: "대우건설"}
REGION = {"서울": "SECURITY", "경기": "MOBILE", "인천": "DATABASE"}

def norm(s):
    return re.sub(r'\s+', '', re.sub(r'㈜|\(주\)|주식회사|\(유\)', '', s or ''))

def match_supplier(row):
    """국민주택 → 공공 시행기관 / 민영주택 → 시공사. 못 맞추면 None(=건너뜀)."""
    if row.get("HOUSE_DTL_SECD_NM") == "국민":
        who = norm(row.get("BSNS_MBY_NM", ""))
        if "경기주택도시공사" in who: return 102
        if "한국토지주택공사" in who or "LH" in who: return 101
        return None
    who = norm(row.get("CNSTRCT_ENTRPS_NM", ""))
    if "포스코이앤씨" in who: return 103
    if "지에스건설" in who:   return 104
    if "대우건설" in who:     return 105
    return None

def get(url, params):
    q = urllib.parse.urlencode(params, encoding="utf-8")
    with urllib.request.urlopen(f"{url}?{q}", timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

# ── 1) 청약홈: 지역별 공고 수집 ──────────────────────────────────────
notices = []
for region in REGION:
    d = get(f"{CY}/getAPTLttotPblancDetail", {
        "serviceKey": CY_KEY, "page": 1, "perPage": 200, "returnType": "JSON",
        "cond[SUBSCRPT_AREA_CODE_NM::EQ]": region,
        "cond[RCRIT_PBLANC_DE::GTE]": "2024-01-01",
    })
    for r in d.get("data") or []:
        sid = match_supplier(r)
        if sid:
            r["_supplierId"] = sid
            r["_region"] = region
            notices.append(r)

# 공급사별로 최신 2건씩만 (데이터가 한쪽으로 쏠리지 않게)
by_sup = collections.defaultdict(list)
for r in sorted(notices, key=lambda x: x["RCRIT_PBLANC_DE"], reverse=True):
    if len(by_sup[r["_supplierId"]]) < 2:
        by_sup[r["_supplierId"]].append(r)
picked = [r for v in by_sup.values() for r in v]
print(f"[청약홈] 매칭된 공고 {len(notices)}건 → 공급사별 2건씩 {len(picked)}건 선택")

# ── 2) 주택형별 전개 (A안) ──────────────────────────────────────────
rows = []
for n in picked:
    mdl = get(f"{CY}/getAPTLttotPblancMdl", {
        "serviceKey": CY_KEY, "page": 1, "perPage": 50, "returnType": "JSON",
        "cond[HOUSE_MANAGE_NO::EQ]": n["HOUSE_MANAGE_NO"],
    })
    types = mdl.get("data") or []
    if not types:
        print(f"  ⚠️ 주택형 없음, 건너뜀: {n['HOUSE_NM']}")
        continue
    for t in types:
        price = t.get("LTTOT_TOP_AMOUNT")          # 이미 만원 단위
        if not price: continue
        area = t.get("SUPLY_AR")                    # 공급면적 ㎡
        ty   = (t.get("HOUSE_TY") or "").strip()    # 060.9495A
        label = re.sub(r'^0+', '', ty.split('.')[0]) + (ty[-1] if ty and ty[-1].isalpha() else '')
        rows.append({
            "title": f"{n['HOUSE_NM']} {label}"[:255],
            "description": (f"[출처: 한국부동산원 청약홈 공공데이터] "
                            f"{n.get('HSSPLY_ADRES','')} / 공급면적 {area}㎡ / "
                            f"총 {n.get('TOT_SUPLY_HSHLDCO','?')}세대 / "
                            f"모집공고 {n.get('RCRIT_PBLANC_DE','')} / "
                            f"접수 {n.get('RCEPT_BGNDE','')}~{n.get('RCEPT_ENDDE','')} / "
                            f"{n.get('PBLANC_URL','')}"),
            "category": REGION[n["_region"]],
            "price": int(price),
            "instructor_id": n["_supplierId"],
        })

# ── 3) LH 공고 (공공분양) ───────────────────────────────────────────
lh = get(LH, {"serviceKey": LH_KEY, "PG_SZ": 30, "PAGE": 1,
              "PAN_ST_DT": "20260101", "PAN_ED_DT": "20261231", "UPP_AIS_TP_CD": "05"})
ds = next((b["dsList"] for b in lh if isinstance(b, dict) and "dsList" in b), [])
LH_REGION = {"서울": "SECURITY", "경기": "MOBILE", "인천": "DATABASE"}
lh_added = 0
for r in ds:
    cat = next((v for k, v in LH_REGION.items() if k in (r.get("CNP_CD_NM") or "")), None)
    if not cat: continue
    rows.append({
        "title": (r.get("PAN_NM") or "")[:255],
        "description": (f"[출처: 한국토지주택공사 공공데이터] "
                        f"{r.get('CNP_CD_NM','')} / {r.get('AIS_TP_CD_NM','')} / "
                        f"공고 {r.get('PAN_NT_ST_DT','')} / 마감 {r.get('CLSG_DT','')} / "
                        f"{r.get('DTL_URL','')}"),
        "category": cat,
        "price": 0,                    # LH 목록 API 에는 분양가가 없습니다
        "instructor_id": 101,          # 한국토지주택공사
    })
    lh_added += 1
print(f"[LH] 서울/경기/인천 공고 {lh_added}건")

# ── 4) 적재 (title 기준 멱등) ───────────────────────────────────────
def esc(s): return str(s).replace("\\", "\\\\").replace("'", "''")
values = ",\n".join(
    f"  ('{esc(r['title'])}', '{esc(r['description'])}', '{r['category']}', "
    f"{r['price']}.00, {r['instructor_id']}, 0, 'ACTIVE', NOW(6), NOW(6))" for r in rows)
sql = f"""INSERT INTO courses
  (title, description, category, price, instructor_id, enrollment_count, status, created_at, updated_at)
VALUES
{values}
ON DUPLICATE KEY UPDATE title = title;
"""
print(f"\n총 {len(rows)}건 적재 대상")
if DRY:
    print(sql[:1500] + "\n... (생략)")
    sys.exit()

# title 중복 방지: 이미 있는 title 은 제외
existing = subprocess.run(
    ["docker","exec","lecturedb","mariadb","-umanager","-pSqlDba-1","lecture_db","-N","-e",
     "SELECT title FROM courses;"], capture_output=True, text=True).stdout.splitlines()
existing = set(t.strip() for t in existing if t.strip() and "Warning" not in t)
new_rows = [r for r in rows if r["title"] not in existing]
print(f"  이미 있음 {len(rows)-len(new_rows)}건 / 신규 {len(new_rows)}건")
if not new_rows:
    print("  → 넣을 것 없음 (멱등)"); sys.exit()

values = ",\n".join(
    f"  ('{esc(r['title'])}', '{esc(r['description'])}', '{r['category']}', "
    f"{r['price']}.00, {r['instructor_id']}, 0, 'ACTIVE', NOW(6), NOW(6))" for r in new_rows)
sql = f"""INSERT INTO courses
  (title, description, category, price, instructor_id, enrollment_count, status, created_at, updated_at)
VALUES
{values};
"""
p = subprocess.run(["docker","exec","-i","lecturedb","mariadb","-umanager","-pSqlDba-1","lecture_db"],
                   input=sql, capture_output=True, text=True)
err = "\n".join(l for l in p.stderr.splitlines() if "Warning" not in l)
print("✅ 적재 완료" if p.returncode == 0 else f"❌ 실패\n{err}")
