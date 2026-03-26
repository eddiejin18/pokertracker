/**
 * Display string for session location in lists (prefixes online type).
 */
export function formatSessionLocationLine(session) {
  const t = (session.location_type || session.locationType || '').toLowerCase();
  const loc = (session.location || '').trim();
  if (t === 'online') {
    return loc ? `Online · ${loc}` : 'Online';
  }
  return loc || null;
}
