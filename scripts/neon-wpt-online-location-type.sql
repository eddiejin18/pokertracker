-- Set location_type to 'online' for sessions whose location text suggests online play:
--   - contains "WPT Gold" (case-insensitive), OR
--   - contains "Online" (e.g. "PokerStars (Online)")
-- Run in Neon SQL Editor: preview (SELECT) first, then UPDATE.

-- 1) Preview rows that will change
SELECT id, user_id, location, location_type, timestamp
FROM poker_sessions
WHERE (
    location ILIKE '%WPT Gold%'
    OR location ILIKE '%Online%'
  )
  AND COALESCE(TRIM(LOWER(location_type)), '') <> 'online'
ORDER BY timestamp DESC;

-- 2) Apply
UPDATE poker_sessions
SET location_type = 'online'
WHERE (
    location ILIKE '%WPT Gold%'
    OR location ILIKE '%Online%'
  )
  AND COALESCE(TRIM(LOWER(location_type)), '') <> 'online';

-- 3) Verify (should return 0 rows)
-- SELECT id, location, location_type
-- FROM poker_sessions
-- WHERE (location ILIKE '%WPT Gold%' OR location ILIKE '%Online%')
--   AND COALESCE(TRIM(LOWER(location_type)), '') <> 'online';
