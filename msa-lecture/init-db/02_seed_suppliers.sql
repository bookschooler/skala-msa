-- ═══════════════════════════════════════════════════════════════════
-- 공급사(users) 시드 — 담당: #2 통합 분양공고 (course-service)
--
-- ⚠️ PUBLIC_SUPPLIER_IDS = [101, 102]   (한국토지주택공사, 경기주택도시공사)
--    이 값을 바꾸면 course-service 의 SupplierRegistry 를 함께 수정할 것.
--
-- ── 왜 이 파일이 필요한가 ──────────────────────────────────────────
--   courses.instructor_id 에 users(id) 외래키가 걸려 있어서,
--   users 에 공급사 행이 없으면 분양공고 적재가 전부 FK 에러로 실패합니다.
--
-- ── 왜 01_init.sql 을 안 건드리나 ──────────────────────────────────
--   ./init-db 가 /docker-entrypoint-initdb.d 로 마운트되어 알파벳 순 실행되므로
--   02_ 는 01_ 이후에 자동 실행됩니다. 파일 분리로 팀원과 충돌을 피합니다.
--
-- ── 왜 id 가 101 부터인가 ──────────────────────────────────────────
--   DB 에 이미 id 1(홍길동/STUDENT), id 2(김강사/INSTRUCTOR) 가 있습니다.
--   담당 #3 이 로그인 테스트에 쓰고 있을 수 있어 덮어쓰지 않습니다.
--   101~ 대역을 시드 전용으로 쓰고, 신규 가입은 1000 번대부터 나가게 합니다.
--
--   id   1 ~  99 : 일반 가입 계정 (기존)
--   id 101 ~ 105 : 시드 공급사 ← 이 파일
--   id 1000 ~    : 앞으로의 신규 가입
--
-- ── 사업주체 선정 근거 ─────────────────────────────────────────────
--   한국부동산원 청약홈 오픈API 실데이터 301건(서울/경기/인천, 2024년 이후) 집계.
--   공공 = HOUSE_DTL_SECD_NM='국민' 의 BSNS_MBY_NM 상위
--          (한국토지주택공사 48건, 경기주택도시공사 2건)
--   민간 = HOUSE_DTL_SECD_NM='민영' 의 CNSTRCT_ENTRPS_NM(시공사) 상위
--          (포스코이앤씨 19, 지에스건설 18, 대우건설 17)
--          ※ 민영은 사업주체의 26%가 신탁사(케이비부동산신탁 등)라
--            화면에 신탁사가 뜨면 도메인상 어색하므로 시공사를 공급사로 사용.
--
-- 비밀번호: 전부 'Passw0rd!' (BCrypt cost 10)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES
  -- 공공 시행기관 → 공공분양
  (101, 'lh@homeone.test',     '$2y$10$C7C/Ywev7cBXdHT04jTO1O/8fJFQdY1RW22UD5zDauUI.bUP5sMtO', '한국토지주택공사', 'INSTRUCTOR', NOW(6), NOW(6)),
  (102, 'gh@homeone.test',     '$2y$10$C7C/Ywev7cBXdHT04jTO1O/8fJFQdY1RW22UD5zDauUI.bUP5sMtO', '경기주택도시공사', 'INSTRUCTOR', NOW(6), NOW(6)),
  -- 민간 건설사 → 민간분양
  (103, 'posco@homeone.test',  '$2y$10$C7C/Ywev7cBXdHT04jTO1O/8fJFQdY1RW22UD5zDauUI.bUP5sMtO', '포스코이앤씨',     'INSTRUCTOR', NOW(6), NOW(6)),
  (104, 'gs@homeone.test',     '$2y$10$C7C/Ywev7cBXdHT04jTO1O/8fJFQdY1RW22UD5zDauUI.bUP5sMtO', '지에스건설',       'INSTRUCTOR', NOW(6), NOW(6)),
  (105, 'daewoo@homeone.test', '$2y$10$C7C/Ywev7cBXdHT04jTO1O/8fJFQdY1RW22UD5zDauUI.bUP5sMtO', '대우건설',         'INSTRUCTOR', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE
  name = VALUES(name), role = VALUES(role), updated_at = NOW(6);

-- (AUTO_INCREMENT 는 건드리지 않습니다. id 105 를 명시 INSERT 했으므로
--  MariaDB 가 자동으로 다음 값을 106 으로 올려 시드 대역과 겹치지 않습니다.)
