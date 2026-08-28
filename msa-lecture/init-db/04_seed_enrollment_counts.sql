-- ═══════════════════════════════════════════════════════════════════
-- 청약 접수 건수(enrollment_count) 편차 부여
--
-- 배경: 03_seed_courses.sql 은 접수 건수를 전부 0 으로 적재한다.
--       recommend-service 가 enrollment_count 로 정렬하기 때문에
--       값이 전부 같으면 추천 순위가 의미를 갖지 못한다.
--
-- 계산식
--   주택형별 공급세대 = totalUnits / 해당 단지의 주택형 수
--   경쟁률           = 지역별 범위 안에서 title 해시로 결정 (재현 가능)
--   접수 건수        = 공급세대 × 경쟁률
--
-- 지역별 경쟁률 범위 (실제 수도권 청약 경향 반영)
--   SECURITY(서울) 2 ~ 150 배   — 공급 대비 수요 최다
--   MOBILE(경기)   0.3 ~ 30 배  — 지역 편차 큼, 미달 단지 존재
--   DATABASE(인천) 0.1 ~ 12 배  — 미달 비중 높음
--
-- RAND() 대신 CRC32(title) 을 쓰므로 몇 번을 실행해도 같은 값이 나온다(멱등).
-- 낮은 경쟁률이 다수, 높은 경쟁률이 소수가 되도록 3제곱으로 분포를 기울인다.
-- ═══════════════════════════════════════════════════════════════════

-- 단지별 주택형 수 (같은 detailUrl = 같은 분양 공고)
CREATE TEMPORARY TABLE tmp_complex_types AS
SELECT JSON_VALUE(description, '$.detailUrl') AS detail_url,
       COUNT(*)                               AS types_cnt
FROM courses
GROUP BY detail_url;

UPDATE courses c
JOIN tmp_complex_types t
  ON t.detail_url <=> JSON_VALUE(c.description, '$.detailUrl')
SET c.enrollment_count = GREATEST(0, ROUND(
      -- 주택형별 공급세대 (totalUnits 누락 시 100세대로 가정)
      GREATEST(1, COALESCE(CAST(JSON_VALUE(c.description, '$.totalUnits') AS UNSIGNED), 100)
                  / GREATEST(1, t.types_cnt))
      *
      -- 경쟁률: 지역별 [min, max] 구간을 title 해시로 샘플링
      CASE c.category
        WHEN 'SECURITY' THEN 2.0  + 148.0 * POW((CRC32(c.title) % 10000) / 10000.0, 3)
        WHEN 'MOBILE'   THEN 0.3  +  29.7 * POW((CRC32(c.title) % 10000) / 10000.0, 3)
        WHEN 'DATABASE' THEN 0.1  +  11.9 * POW((CRC32(c.title) % 10000) / 10000.0, 3)
        ELSE                 0.5  +   9.5 * POW((CRC32(c.title) % 10000) / 10000.0, 3)
      END
    )),
    c.updated_at = NOW(6);

DROP TEMPORARY TABLE tmp_complex_types;
