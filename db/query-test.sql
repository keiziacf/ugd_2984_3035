-- =========================================================
-- SIWEB Chapter 11 - Query Test Cheat Sheet
-- Domain: Air Cargo Tracking / AWB Operations
-- Important tables:
--   Master     : airports, airlines, commodity_categories, handling_services
--   Transaction: users, user_profiles, flights, shipments, tracking_events
--   Junction   : shipment_services
-- =========================================================

-- 1. Cek jumlah data setiap tabel penting
SELECT 'airports' AS table_name, COUNT(*)::int AS total_rows FROM airports
UNION ALL
SELECT 'airlines', COUNT(*)::int FROM airlines
UNION ALL
SELECT 'commodity_categories', COUNT(*)::int FROM commodity_categories
UNION ALL
SELECT 'handling_services', COUNT(*)::int FROM handling_services
UNION ALL
SELECT 'users', COUNT(*)::int FROM users
UNION ALL
SELECT 'user_profiles', COUNT(*)::int FROM user_profiles
UNION ALL
SELECT 'flights', COUNT(*)::int FROM flights
UNION ALL
SELECT 'shipments', COUNT(*)::int FROM shipments
UNION ALL
SELECT 'tracking_events', COUNT(*)::int FROM tracking_events
UNION ALL
SELECT 'shipment_services', COUNT(*)::int FROM shipment_services
ORDER BY table_name;

-- 2. Cek data master
SELECT code, name, city, province, cargo_terminal
FROM airports
ORDER BY code;

SELECT code, name, service_type, home_base
FROM airlines
ORDER BY code;

SELECT code, name, handling_notes
FROM commodity_categories
ORDER BY code;

SELECT code, name, sla_minutes
FROM handling_services
ORDER BY code;

-- 3. Relasi one-to-many: flights -> shipments
SELECT
  f.flight_number,
  f.airline,
  COUNT(s.awb)::int AS total_shipments,
  SUM(s.weight)::numeric(12,2) AS total_weight
FROM flights f
JOIN shipments s ON s.flight_number = f.flight_number
GROUP BY f.flight_number, f.airline
ORDER BY total_shipments DESC, f.flight_number;

-- 4. Relasi one-to-many: shipments -> tracking_events
SELECT
  s.awb,
  s.shipper,
  s.current_status,
  COUNT(te.id)::int AS total_tracking_events
FROM shipments s
JOIN tracking_events te ON te.shipment_awb = s.awb
GROUP BY s.awb, s.shipper, s.current_status
ORDER BY total_tracking_events DESC, s.awb;

-- 5. Relasi one-to-one: users -> user_profiles
SELECT
  u.id,
  u.name,
  u.role,
  up.employee_number,
  up.phone,
  up.shift_name
FROM users u
JOIN user_profiles up ON up.user_id = u.id
ORDER BY u.id;

-- 6. Relasi many-to-many: shipments -> shipment_services -> handling_services
SELECT
  s.awb,
  s.commodity,
  hs.code AS service_code,
  hs.name AS service_name,
  ss.assignment_note
FROM shipment_services ss
JOIN shipments s ON ss.shipment_awb = s.awb
JOIN handling_services hs ON ss.service_code = hs.code
ORDER BY s.awb, hs.code;

-- 7. Tabel yang masih kosong
WITH public_tables AS (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
),
table_counts AS (
  SELECT
    pt.table_name,
    (
      xpath(
        '/row/count/text()',
        query_to_xml(
          format('SELECT COUNT(*) AS count FROM %I', pt.table_name),
          false,
          true,
          ''
        )
      )
    )[1]::text::int AS total_rows
  FROM public_tables pt
)
SELECT table_name, total_rows
FROM table_counts
WHERE total_rows = 0
ORDER BY table_name;

-- 8. Foreign key tidak terhubung / data yatim
SELECT
  'flights.airline -> airlines.name' AS relation_name,
  COUNT(*)::int AS orphan_rows
FROM flights f
LEFT JOIN airlines a ON f.airline = a.name
WHERE a.name IS NULL

UNION ALL

SELECT
  'flights.origin_code -> airports.code',
  COUNT(*)::int
FROM flights f
LEFT JOIN airports a ON f.origin_code = a.code
WHERE a.code IS NULL

UNION ALL

SELECT
  'shipments.flight_number -> flights.flight_number',
  COUNT(*)::int
FROM shipments s
LEFT JOIN flights f ON s.flight_number = f.flight_number
WHERE f.flight_number IS NULL

UNION ALL

SELECT
  'shipments.commodity_category_code -> commodity_categories.code',
  COUNT(*)::int
FROM shipments s
LEFT JOIN commodity_categories c ON s.commodity_category_code = c.code
WHERE s.commodity_category_code IS NOT NULL
  AND c.code IS NULL

UNION ALL

SELECT
  'tracking_events.shipment_awb -> shipments.awb',
  COUNT(*)::int
FROM tracking_events te
LEFT JOIN shipments s ON te.shipment_awb = s.awb
WHERE s.awb IS NULL

UNION ALL

SELECT
  'user_profiles.user_id -> users.id',
  COUNT(*)::int
FROM user_profiles up
LEFT JOIN users u ON up.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT
  'shipment_services.service_code -> handling_services.code',
  COUNT(*)::int
FROM shipment_services ss
LEFT JOIN handling_services hs ON ss.service_code = hs.code
WHERE hs.code IS NULL;

-- 9. Sample query JOIN utama untuk test query
WITH latest_tracking AS (
  SELECT DISTINCT ON (shipment_awb)
    shipment_awb,
    status,
    location,
    event_timestamp,
    event_order
  FROM tracking_events
  ORDER BY shipment_awb, event_order DESC
)
SELECT
  s.awb,
  s.shipper,
  s.consignee,
  s.commodity,
  cc.name AS commodity_category,
  s.current_status,
  f.flight_number,
  f.airline,
  ao.name AS origin_airport,
  ad.name AS destination_airport,
  lt.status AS latest_tracking_status,
  lt.location AS latest_tracking_location,
  lt.event_timestamp AS latest_tracking_time
FROM shipments s
JOIN flights f ON s.flight_number = f.flight_number
LEFT JOIN airports ao ON s.origin_code = ao.code
LEFT JOIN airports ad ON s.destination_code = ad.code
LEFT JOIN commodity_categories cc ON s.commodity_category_code = cc.code
LEFT JOIN latest_tracking lt ON s.awb = lt.shipment_awb
ORDER BY s.awb;

-- 10. Sample join master + junction
SELECT
  s.awb,
  s.shipper,
  hs.name AS handling_service,
  hs.sla_minutes,
  ss.assignment_note
FROM shipments s
JOIN shipment_services ss ON s.awb = ss.shipment_awb
JOIN handling_services hs ON ss.service_code = hs.code
ORDER BY s.awb, hs.name;

-- 11. Pencarian shipment per bandara asal / tujuan
SELECT
  s.awb,
  s.shipper,
  s.consignee,
  s.origin_code,
  s.destination_code,
  s.flight_number,
  s.current_status
FROM shipments s
WHERE s.origin_code = 'CGK'
ORDER BY s.awb;

SELECT
  s.awb,
  s.shipper,
  s.consignee,
  s.origin_code,
  s.destination_code,
  s.flight_number,
  s.current_status
FROM shipments s
WHERE s.destination_code = 'CGK'
ORDER BY s.awb;

-- 12. Agregasi komoditas dan layanan handling
SELECT
  cc.name AS commodity_category,
  COUNT(s.awb)::int AS shipment_count,
  SUM(s.weight)::numeric(12,2) AS total_weight
FROM shipments s
LEFT JOIN commodity_categories cc
  ON s.commodity_category_code = cc.code
GROUP BY cc.name
ORDER BY shipment_count DESC, commodity_category;

SELECT
  hs.name AS handling_service,
  COUNT(ss.shipment_awb)::int AS shipment_count
FROM handling_services hs
LEFT JOIN shipment_services ss
  ON hs.code = ss.service_code
GROUP BY hs.name
ORDER BY shipment_count DESC, hs.name;
