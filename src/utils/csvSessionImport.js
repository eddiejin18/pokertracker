/**
 * CSV parsing + column inference for poker session import.
 */

import { normalizeBlindsInput, BLINDS_INVALID_MESSAGE } from './blindsFormat';

export const DEFAULT_GAME_TYPE = "No Limit Hold'em";

const FIELD_ALIASES = {
  blinds: ['blinds', 'stakes', 'stakes blinds', 'blind level', 'limit', 'stakes limit', 'blinds stakes'],
  locationType: [
    'location type',
    'locationtype',
    'venue type',
    'loc type',
    'where',
    'setting',
  ],
  location: [
    'location',
    'venue',
    'city',
    'place',
    'room',
    'casino name',
    'cardroom',
    'site',
    'platform',
    'site platform',
    'site / platform',
    'poker site',
    'online site',
    'skin',
    'network',
  ],
  date: ['date', 'session date', 'day', 'played', 'session day', 'timestamp'],
  buyIn: ['buy in', 'buyin', 'buy-in', 'buy_in', 'buy', 'starting stack', 'stack'],
  endAmount: ['end amount', 'cashout', 'cash out', 'end', 'left table', 'ending stack', 'end stack'],
  duration: ['duration', 'hours', 'time', 'length', 'hrs', 'played hours'],
  gameType: ['game', 'game type', 'variation', 'poker variation', 'variant', 'format'],
  notes: ['notes', 'note', 'comments', 'comment', 'memo'],
};

/** @returns {string[]} */
export function parseCsvText(text) {
  if (!text || typeof text !== 'string') return [];
  const normalized = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const lines = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < normalized.length; i++) {
    const c = normalized[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      current += c;
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (c === '\r' && normalized[i + 1] === '\n') i += 1;
      lines.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  if (current.length || lines.length === 0) lines.push(current);
  return lines.filter((l) => l.trim().length > 0);
}

/** @returns {string[]} */
export function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      fields.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields.map((f) => {
    let s = f.trim();
    if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1).replace(/""/g, '"');
    return s;
  });
}

function normalizeHeaderKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\uFEFF/g, '')
    .replace(/[_\-/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Map CSV header labels to field keys (best-effort).
 * @param {string[]} headers
 * @returns {Record<string, number>} fieldKey -> column index
 */
export function inferColumnMap(headers) {
  const normHeaders = headers.map((h) => normalizeHeaderKey(h));
  const used = new Set();
  /** @type {Record<string, number>} */
  const map = {};

  const tryField = (fieldKey) => {
    const aliases = FIELD_ALIASES[fieldKey];
    let bestIdx = -1;
    let bestScore = 0;
    normHeaders.forEach((nh, idx) => {
      if (used.has(idx)) return;
      for (const al of aliases) {
        const a = normalizeHeaderKey(al);
        if (nh === a) {
          if (100 > bestScore) {
            bestScore = 100;
            bestIdx = idx;
          }
          return;
        }
        if (nh.includes(a) || a.includes(nh)) {
          if (nh.length >= 3 && a.length >= 3) {
            const s = 60;
            if (s > bestScore) {
              bestScore = s;
              bestIdx = idx;
            }
          }
        }
      }
    });
    if (bestIdx >= 0) {
      used.add(bestIdx);
      map[fieldKey] = bestIdx;
    }
  };

  ['blinds', 'locationType', 'location', 'date', 'buyIn', 'endAmount', 'duration', 'gameType', 'notes'].forEach(tryField);

  return map;
}

/** @param {string} raw */
export function normalizeLocationType(raw) {
  const x = normalizeHeaderKey(String(raw || ''));
  if (!x) return null;
  if (['online', 'on line', 'internet', 'web', 'online poker'].includes(x)) return 'online';
  if (['casino', 'live', 'card room', 'cardroom', 'brick', 'b&m', 'bm'].includes(x)) return 'casino';
  if (['home', 'house', 'private', 'friends'].includes(x)) return 'home';
  if (x.includes('online')) return 'online';
  if (x.includes('casino') || x.includes('live')) return 'casino';
  return null;
}

/** @param {string} s */
export function parseMoney(s) {
  if (s == null || s === '') return NaN;
  let t = String(s).replace(/[$€£\s]/g, '');
  t = t.replace(/,/g, '');
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : NaN;
}

/** @param {string} s */
export function parseDurationHours(s) {
  if (s == null || s === '') return NaN;
  const str = String(s).trim().toLowerCase();
  const plain = parseFloat(str.replace(',', '.'));
  if (!Number.isNaN(plain) && /^\d+\.?\d*$/.test(str.replace(',', '.'))) return plain;

  let hours = 0;
  const hm = str.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?/i);
  const mm = str.match(/(\d+)\s*m(?:in(?:utes?)?)?/i);
  if (hm) hours += parseFloat(hm[1]);
  if (mm) hours += parseInt(mm[1], 10) / 60;
  if (hm || mm) return hours;

  const colon = str.match(/^(\d+):(\d{1,2})$/);
  if (colon) {
    return parseInt(colon[1], 10) + parseInt(colon[2], 10) / 60;
  }
  return NaN;
}

/** @param {string} s */
export function parseDateToTimestamp(s) {
  if (!s || !String(s).trim()) return null;
  const t = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = t.includes('T') ? t : `${t.slice(0, 10)}T12:00:00`;
    return d;
  }
  const parsed = Date.parse(t);
  if (Number.isNaN(parsed)) return null;
  const d = new Date(parsed);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}T12:00:00`;
}

/**
 * Single location string for API (online, casino, or home — e.g. site name, casino, or “Home game”).
 * Legacy CSVs may still have a separate `site` column; we treat it as fallback if `location` is empty.
 */
export function buildLocationField(p) {
  return (p.location || '').trim() || (p.site || '').trim();
}

/**
 * @param {Record<string, string>} rowByField - keyed by FIELD_ALIASES keys
 * @returns {{ errors: string[], payload: object | null }}
 */
export function validateAndBuildSession(rowByField) {
  const errors = [];
  const blindsRaw = (rowByField.blinds || '').trim();
  const blindsNormalized = normalizeBlindsInput(blindsRaw);
  const ltRaw = rowByField.locationType;
  const locationType = normalizeLocationType(ltRaw);
  const location = buildLocationField({
    location: rowByField.location,
    site: rowByField.site,
  });
  const dateRaw = rowByField.date;
  const buyIn = parseMoney(rowByField.buyIn);
  const endAmount = parseMoney(rowByField.endAmount);
  const duration = parseDurationHours(rowByField.duration);
  const ts = parseDateToTimestamp(dateRaw);

  if (!blindsNormalized) errors.push(blindsRaw ? BLINDS_INVALID_MESSAGE : 'Missing blinds');
  if (!locationType) errors.push('Invalid or missing location type (use online, casino, or home)');
  if (!ts) errors.push('Invalid or missing date');
  if (!Number.isFinite(buyIn)) errors.push('Invalid buy in');
  if (!Number.isFinite(endAmount)) errors.push('Invalid end amount');
  if (!Number.isFinite(duration) || duration <= 0) errors.push('Invalid duration (hours)');

  const gameRaw = (rowByField.gameType || '').trim();
  const gameType = gameRaw || DEFAULT_GAME_TYPE;

  const notes = (rowByField.notes || '').trim() || undefined;

  if (errors.length) {
    return { errors, payload: null };
  }

  return {
    errors: [],
    payload: {
      gameType,
      blinds: blindsNormalized,
      location,
      locationType,
      buyIn,
      endAmount,
      duration,
      notes,
      timestamp: ts,
    },
  };
}

/**
 * @param {string[][]} rows - first row headers
 * @returns {{ headers: string[], dataRows: string[][], columnMap: Record<string, number> }}
 */
export function parseCsvWithHeaders(text) {
  const lines = parseCsvText(text);
  if (!lines.length) {
    return { headers: [], dataRows: [], columnMap: {} };
  }
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine);
  const columnMap = inferColumnMap(headers);
  const dataRows = lines.slice(1).map((line) => parseCsvLine(line));
  return { headers, dataRows, columnMap };
}

/**
 * Extract field object from a data row using columnMap.
 * @param {string[]} rowCells
 * @param {Record<string, number>} columnMap
 */
export function rowToFields(rowCells, columnMap) {
  /** @type {Record<string, string>} */
  const out = {};
  Object.entries(columnMap).forEach(([key, idx]) => {
    if (idx >= 0 && idx < rowCells.length) {
      out[key] = rowCells[idx] ?? '';
    }
  });
  return out;
}

/** Accept .csv by name or common MIME types (browsers vary for dragged files). */
export function isCsvLikeFile(file) {
  if (!file || typeof file !== 'object') return false;
  const name = String(file.name || '').toLowerCase();
  const type = String(file.type || '').toLowerCase();
  if (name.endsWith('.csv')) return true;
  if (type.includes('csv')) return true;
  if (type === 'text/plain' || type === 'application/vnd.ms-excel' || type === 'text/comma-separated-values') {
    return true;
  }
  return false;
}
