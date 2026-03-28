-- Fix legacy poker_sessions: users used location_type = home (or similar) with location = "Online"
-- before "online" was a first-class location_type. Run in Neon SQL Editor (preview, then update).

-- 1) Preview rows that will change (location text is exactly "Online", any case)
SELECT id, user_id, location, location_type, timestamp
FROM poker_sessions
WHERE TRIM(LOWER(location)) = 'online'
ORDER BY timestamp DESC;

-- 2) Apply: set location_type to online only where it is not already online (case-insensitive)
UPDATE poker_sessions
SET location_type = 'online'
WHERE TRIM(LOWER(location)) = 'online'
  AND COALESCE(TRIM(LOWER(location_type)), '') <> 'online';

-- 3) Verify none left with wrong type for that location text
-- SELECT id, location, location_type
-- FROM poker_sessions
-- WHERE TRIM(LOWER(location)) = 'online'
--   AND COALESCE(TRIM(LOWER(location_type)), '') <> 'online';
