-- One-time migration (Neon SQL Editor): normalize blinds/stakes to plain #/# without $ or spaces.
-- Example: $0.25/$0.50 → 0.25/0.50 (matches app validation in src/utils/blindsFormat.js).
--
-- Preview before running:
--   SELECT id, blinds FROM poker_sessions WHERE blinds IS NOT NULL ORDER BY id LIMIT 50;
--
-- Optional: restrict to rows that still contain $ or whitespace:
--   WHERE blinds IS NOT NULL AND (blinds ~ '\$' OR blinds ~ '\s');

BEGIN;

UPDATE poker_sessions
SET blinds = regexp_replace(
  regexp_replace(regexp_replace(trim(blinds), '\$', '', 'g'), ',', '', 'g'),
  '\s+',
  '',
  'g'
)
WHERE blinds IS NOT NULL;

COMMIT;
