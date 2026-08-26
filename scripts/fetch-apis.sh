#!/usr/bin/env bash
# 청약홈 / LH 공공 API 실데이터 조회 스크립트
#
# 사용법:
#   export DATA_GO_KR_KEY='공공데이터포털 Decoding 인증키'
#   ./scripts/fetch-apis.sh              # 둘 다 조회
#   ./scripts/fetch-apis.sh cheongyak    # 청약홈만
#   ./scripts/fetch-apis.sh lh           # LH만
#   ./scripts/fetch-apis.sh fields       # 응답 필드명만 뽑기 (통합 모델 설계용)

set -uo pipefail

# 프로젝트 루트의 .env.local 에 키가 있으면 자동으로 읽어옵니다
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT/.env.local" ]]; then
  # 값이 비어 있는 줄은 무시합니다 (빈 값이 기존 환경변수를 덮어쓰지 않도록)
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*(.*)$ ]] || continue
    k="${BASH_REMATCH[1]}"; v="${BASH_REMATCH[2]}"
    v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"   # 따옴표 제거
    v="${v%"${v##*[![:space:]]}"}"                          # 우측 공백 제거
    [[ -z "$v" ]] && continue
    [[ -n "${!k:-}" ]] && continue   # 이미 export 된 값이 우선
    export "$k=$v"
  done < "$ROOT/.env.local"
fi

# 기관별 키가 있으면 그걸, 없으면 공통 키를 씁니다
COMMON_KEY="${DATA_GO_KR_KEY:-}"
CY_KEY="${CHEONGYAK_KEY:-$COMMON_KEY}"
LH_KEY="${LH_KEY:-$COMMON_KEY}"

need_key() {  # $1=키값  $2=기관명  $3=.env.local 변수명
  if [[ -z "$1" ]]; then
    echo "❌ $2 인증키가 비어 있습니다."
    echo "   .env.local 의 $3= (또는 DATA_GO_KR_KEY=) 에 Decoding 키를 넣으세요."
    return 1
  fi
  return 0
}

CY_BASE="https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1"
LH_BASE="https://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1"

FROM="${FROM:-2026-01-01}"
TO="${TO:-2026-12-31}"
N="${N:-3}"

pp() { python3 -m json.tool --no-ensure-ascii 2>/dev/null || cat; }

# ── 청약홈: APT 분양정보 ───────────────────────────────────────────────
fetch_cheongyak() {
  need_key "$CY_KEY" "청약홈" "CHEONGYAK_KEY" || return 1
  echo "════════ 청약홈 · APT 분양정보 (${FROM} ~ ${TO}, ${N}건) ════════"
  # -G + --data-urlencode → Decoding 키를 curl이 알아서 인코딩해 줍니다
  curl -s -G "${CY_BASE}/getAPTLttotPblancDetail" \
    --data-urlencode "serviceKey=${CY_KEY}" \
    --data "page=1" \
    --data "perPage=${N}" \
    --data "returnType=JSON" \
    --data-urlencode "cond[RCRIT_PBLANC_DE::GTE]=${FROM}" \
    --data-urlencode "cond[RCRIT_PBLANC_DE::LTE]=${TO}" \
    | pp
  echo
}

# ── LH: 분양임대공고문 ─────────────────────────────────────────────────
fetch_lh() {
  need_key "$LH_KEY" "LH" "LH_KEY" || return 1
  echo "════════ LH · 분양임대공고문 (${FROM} ~ ${TO}, ${N}건) ════════"
  curl -s -G "${LH_BASE}" \
    --data-urlencode "serviceKey=${LH_KEY}" \
    --data "PG_SZ=${N}" \
    --data "PAGE=1" \
    --data "PAN_ST_DT=${FROM//-/}" \
    --data "PAN_ED_DT=${TO//-/}" \
    --data "UPP_AIS_TP_CD=05" \
    | pp
  echo
}

# ── 응답 필드명만 추출 (통합 공고 모델 설계용) ─────────────────────────
fetch_fields() {
  echo "════════ 응답 필드 목록 ════════"
  need_key "$CY_KEY" "청약홈" "CHEONGYAK_KEY" || return 1
  need_key "$LH_KEY" "LH" "LH_KEY" || return 1

  echo "── 청약홈 getAPTLttotPblancDetail ──"
  curl -s -G "${CY_BASE}/getAPTLttotPblancDetail" \
    --data-urlencode "serviceKey=${CY_KEY}" \
    --data "page=1" --data "perPage=1" --data "returnType=JSON" \
  | python3 -c '
import sys, json
try: d = json.load(sys.stdin)
except Exception: print("  (JSON 파싱 실패 — 원문 확인 필요)"); sys.exit()
rows = d.get("data") or []
if not rows: print("  ", d); sys.exit()
for k, v in rows[0].items():
    print(f"  {k:<28} = {v}")
'
  echo
  echo "── LH lhLeaseNoticeInfo1 ──"
  curl -s -G "${LH_BASE}" \
    --data-urlencode "serviceKey=${LH_KEY}" \
    --data "PG_SZ=1" --data "PAGE=1" \
    --data "PAN_ST_DT=${FROM//-/}" --data "PAN_ED_DT=${TO//-/}" \
  | python3 -c '
import sys, json
try: d = json.load(sys.stdin)
except Exception: print("  (JSON 파싱 실패 — 원문 확인 필요)"); sys.exit()
# LH 응답은 [{resHeader}, {dsList:[...]}] 형태의 배열입니다
rows = []
if isinstance(d, list):
    for blk in d:
        if isinstance(blk, dict) and "dsList" in blk: rows = blk["dsList"]
if not rows: print("  ", json.dumps(d, ensure_ascii=False)[:800]); sys.exit()
for k, v in rows[0].items():
    print(f"  {k:<28} = {v}")
'
  echo
}

case "${1:-all}" in
  cheongyak|cy) fetch_cheongyak ;;
  lh)           fetch_lh ;;
  fields)       fetch_fields ;;
  all)          fetch_cheongyak; fetch_lh ;;
  *) echo "사용법: $0 [all|cheongyak|lh|fields]"; exit 1 ;;
esac
