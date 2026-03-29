import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Upload, Copy, Trash2, FileSpreadsheet } from 'lucide-react';
import ApiService from '../services/api';
import {
  parseCsvWithHeaders,
  rowToFields,
  validateAndBuildSession,
  inferColumnMap,
  DEFAULT_GAME_TYPE,
  isCsvLikeFile,
} from '../utils/csvSessionImport';

const FIELD_KEYS = [
  { key: 'blinds', label: 'Blinds', required: true },
  { key: 'locationType', label: 'Location type', required: true },
  { key: 'location', label: 'Location', required: false },
  { key: 'date', label: 'Date', required: true },
  { key: 'buyIn', label: 'Buy in', required: true },
  { key: 'endAmount', label: 'End amount', required: true },
  { key: 'duration', label: 'Duration', required: true },
  { key: 'gameType', label: 'Variation', required: false },
  { key: 'notes', label: 'Notes', required: false },
];

function newRowId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-${Math.random()}`;
}

const EMPTY_FIELDS = {
  blinds: '',
  locationType: '',
  location: '',
  date: '',
  buyIn: '',
  endAmount: '',
  duration: '',
  gameType: '',
  notes: '',
};

function buildRowsFromData(dataRows, columnMap) {
  return dataRows.map((cells) => {
    const fields = { ...EMPTY_FIELDS, ...rowToFields(cells, columnMap) };
    const { errors, payload } = validateAndBuildSession(fields);
    return {
      id: newRowId(),
      cells,
      fields,
      errors,
      payload,
      selected: false,
    };
  });
}

const SessionCsvImportModal = ({ isOpen, onClose, onImported, initialFile = null, onInitialFileConsumed }) => {
  const [busy, setBusy] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rawDataRows, setRawDataRows] = useState([]);
  const [columnMap, setColumnMap] = useState({});
  const [rows, setRows] = useState([]);
  const [dropActive, setDropActive] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const reset = useCallback(() => {
    setParseError(null);
    setHeaders([]);
    setRawDataRows([]);
    setColumnMap({});
    setRows([]);
    setDropActive(false);
    setDiscardConfirmOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setDropActive(false);
      setDiscardConfirmOpen(false);
    }
  }, [isOpen]);

  const finishLoad = useCallback((text, onDone) => {
    try {
      const { headers: h, dataRows, columnMap: cm } = parseCsvWithHeaders(text);
      if (!h.length) {
        setParseError('Could not read CSV headers.');
        onDone?.();
        return;
      }
      setHeaders(h);
      setRawDataRows(dataRows);
      setColumnMap(cm);
      setRows(buildRowsFromData(dataRows, cm));
      onDone?.();
    } catch (err) {
      setParseError(err?.message || 'Failed to parse CSV');
      onDone?.();
    }
  }, []);

  const loadFileFromFile = useCallback(
    (file, { onDone } = {}) => {
      if (!file || !isCsvLikeFile(file)) {
        setParseError('Please use a .csv file.');
        onDone?.();
        return;
      }
      setParseError(null);
      const reader = new FileReader();
      reader.onload = () => {
        finishLoad(String(reader.result || ''), onDone);
      };
      reader.onerror = () => {
        setParseError('Could not read file');
        onDone?.();
      };
      reader.readAsText(file, 'UTF-8');
    },
    [finishLoad]
  );

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFileFromFile(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (!isOpen || !initialFile) return;
    loadFileFromFile(initialFile, { onDone: () => onInitialFileConsumed?.() });
  }, [isOpen, initialFile, loadFileFromFile, onInitialFileConsumed]);

  const handleModalDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(true);
  };

  const handleModalDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropActive(false);
    }
  };

  const handleModalDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleModalDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFileFromFile(file);
  };

  const recomputeColumnMap = useCallback(
    (map) => {
      setColumnMap(map);
      setRows(buildRowsFromData(rawDataRows, map));
    },
    [rawDataRows]
  );

  const updateField = (rowId, key, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const fields = { ...EMPTY_FIELDS, ...r.fields, [key]: value };
        const { errors, payload } = validateAndBuildSession(fields);
        return { ...r, fields, errors, payload };
      })
    );
  };

  const duplicateRow = (rowId) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === rowId);
      if (idx < 0) return prev;
      const r = prev[idx];
      const fields = { ...EMPTY_FIELDS, ...r.fields };
      const { errors, payload } = validateAndBuildSession(fields);
      const copy = {
        id: newRowId(),
        cells: [...(r.cells || [])],
        fields,
        errors,
        payload,
        selected: false,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const deleteRowsById = (ids) => {
    const set = new Set(ids);
    setRows((prev) => prev.filter((r) => !set.has(r.id)));
  };

  const toggleSelect = (rowId) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, selected: !r.selected } : r)));
  };

  const toggleSelectAll = () => {
    const valid = rows.filter((r) => r.payload);
    if (!valid.length) return;
    const allOn = valid.every((r) => r.selected);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        selected: r.payload ? !allOn : false,
      }))
    );
  };

  const validRows = useMemo(() => rows.filter((r) => r.payload), [rows]);
  const selectedValid = useMemo(
    () => rows.filter((r) => r.selected && r.payload),
    [rows]
  );

  const handleImport = async () => {
    const toImport = selectedValid.length ? selectedValid : validRows;
    const payloads = toImport.map((r) => r.payload).filter(Boolean);
    if (!payloads.length) return;
    setBusy(true);
    try {
      for (const p of payloads) {
        await ApiService.createSession(p);
      }
      onImported?.();
      reset();
      onClose();
    } catch (err) {
      alert(err?.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSelectedPreview = () => {
    const ids = rows.filter((r) => r.selected).map((r) => r.id);
    if (!ids.length) return;
    deleteRowsById(ids);
  };

  if (!isOpen) return null;

  const performClose = () => {
    setDiscardConfirmOpen(false);
    reset();
    onClose();
  };

  const requestClose = () => {
    if (headers.length > 0) {
      setDiscardConfirmOpen(true);
    } else {
      performClose();
    }
  };

  return (
    <>
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onMouseDown={requestClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl border border-gray-100 shadow-luxury w-full max-w-5xl max-h-[92vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-import-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
            <h2 id="csv-import-title" className="text-lg font-semibold text-charcoal">
              Import sessions from CSV
            </h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-50 overflow-y-auto flex-1 min-h-0">
          <div className="text-[13px] text-gray-600 mb-3 space-y-2">
            <p>
              <span className="font-medium text-gray-800">Required</span> for each row to import as a session:{' '}
              <span className="text-gray-700">
                blinds, location type, date, buy in, end amount, duration
              </span>
              . <span className="text-gray-600">Location is optional.</span>
            </p>
            <ul className="list-disc pl-5 text-[12px] text-gray-600 space-y-1">
              <li>
                <span className="font-medium text-gray-800">Blinds</span> — two numbers in the form{' '}
                <span className="font-mono text-gray-700">#/#</span> (e.g.{' '}
                <span className="font-mono text-gray-700">0.25/0.50</span>,{' '}
                <span className="font-mono text-gray-700">0.0002/5</span>); dollar signs are optional.
              </li>
              <li>
                <span className="font-medium text-gray-800">Location type</span> —{' '}
                <span className="text-gray-700">online</span>, <span className="text-gray-700">casino</span>, or{' '}
                <span className="text-gray-700">home</span>.
              </li>
              <li>
                <span className="font-medium text-gray-800">Location</span> — optional. When present: online room or
                site (e.g. PokerStars), casino name (e.g. Bellagio), or a home-game label. Leave blank if you prefer.
              </li>
            </ul>
            <p className="text-[12px] text-gray-500 pt-0.5">
              Variation defaults to <span className="font-medium text-gray-700">{DEFAULT_GAME_TYPE}</span> if omitted.
            </p>
          </div>

          <div
            className={`rounded-xl border-2 border-dashed px-4 py-8 mb-3 text-center transition-colors ${
              dropActive ? 'border-sky-400 bg-sky-50/90' : 'border-gray-200 bg-gray-50/50'
            }`}
            onDragEnter={handleModalDragEnter}
            onDragLeave={handleModalDragLeave}
            onDragOver={handleModalDragOver}
            onDrop={handleModalDrop}
            role="region"
            aria-label="Drop CSV file to import sessions"
          >
            <FileSpreadsheet className={`h-8 w-8 mx-auto mb-2 ${dropActive ? 'text-sky-600' : 'text-gray-400'}`} strokeWidth={1.25} />
            <p className="text-[13px] font-medium text-gray-700">Drop a CSV file here</p>
            <p className="text-[12px] text-gray-400 mt-1 mb-4">Import sessions from CSV</p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-charcoal cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
              <Upload className="h-4 w-4" />
              Choose file
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            </label>
          </div>
          {parseError && <p className="text-[13px] text-red-600 mb-2">{parseError}</p>}

          {headers.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Map columns</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {FIELD_KEYS.map(({ key, label, required }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-500 w-28 shrink-0 truncate" title={label}>
                      {label}
                      {required ? <span className="text-red-500">*</span> : null}
                    </span>
                    <select
                      className="flex-1 min-w-0 border border-gray-200 rounded-lg pl-2.5 pr-10 py-1.5 text-[12px] bg-white appearance-none bg-[length:0.875rem] bg-[right_0.65rem_center] bg-no-repeat"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      }}
                      value={columnMap[key] !== undefined ? String(columnMap[key]) : ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        const next = { ...columnMap };
                        if (v === '') delete next[key];
                        else next[key] = parseInt(v, 10);
                        recomputeColumnMap(next);
                      }}
                    >
                      <option value="">—</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>
                          {h || `Column ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-2 text-[12px] text-gray-500 hover:text-charcoal underline"
                onClick={() => {
                  const cm = inferColumnMap(headers);
                  recomputeColumnMap(cm);
                }}
              >
                Re-run auto-detect
              </button>
            </div>
          )}

          {rows.length > 0 && (
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[13px] text-gray-600">
                  {validRows.length} valid · {rows.length - validRows.length} need fixes
                </span>
                <button
                  type="button"
                  onClick={handleDeleteSelectedPreview}
                  disabled={!rows.some((r) => r.selected)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove selected rows
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full min-w-[900px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="p-2 w-10">
                        <input
                          type="checkbox"
                          checked={validRows.length > 0 && validRows.every((r) => r.selected)}
                          onChange={toggleSelectAll}
                          title="Select all valid"
                        />
                      </th>
                      <th className="p-2 text-gray-500 font-medium">Blinds</th>
                      <th className="p-2 text-gray-500 font-medium">Loc. type</th>
                      <th className="p-2 text-gray-500 font-medium">Location</th>
                      <th className="p-2 text-gray-500 font-medium">Date</th>
                      <th className="p-2 text-gray-500 font-medium">Buy in</th>
                      <th className="p-2 text-gray-500 font-medium">End</th>
                      <th className="p-2 text-gray-500 font-medium">Hrs</th>
                      <th className="p-2 text-gray-500 font-medium">Game</th>
                      <th className="p-2 text-gray-500 font-medium">Notes</th>
                      <th className="p-2 text-gray-500 font-medium">Status</th>
                      <th className="p-2 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 align-top">
                        <td className="p-1.5">
                          <input
                            type="checkbox"
                            checked={r.selected}
                            disabled={!r.payload}
                            onChange={() => toggleSelect(r.id)}
                          />
                        </td>
                        {['blinds', 'locationType', 'location', 'date', 'buyIn', 'endAmount', 'duration', 'gameType', 'notes'].map(
                          (k) => (
                            <td key={k} className="p-1">
                              <input
                                className="w-full min-w-[56px] border border-gray-200 rounded px-1 py-0.5 text-[11px]"
                                value={r.fields[k] ?? ''}
                                onChange={(e) => updateField(r.id, k, e.target.value)}
                              />
                            </td>
                          )
                        )}
                        <td className="p-1.5 text-[11px]">
                          {r.payload ? (
                            <span className="text-emerald-600">OK</span>
                          ) : (
                            <span className="text-red-600">{r.errors.join('; ')}</span>
                          )}
                        </td>
                        <td className="p-1">
                          <button
                            type="button"
                            className="p-1 text-gray-400 hover:text-charcoal"
                            title="Duplicate row"
                            onClick={() => duplicateRow(r.id)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 shrink-0">
          <button type="button" className="btn text-[13px]" onClick={requestClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary text-[13px]"
            disabled={busy || !(selectedValid.length || validRows.length)}
            onClick={handleImport}
          >
            {busy ? 'Importing…' : `Import ${selectedValid.length || validRows.length} session(s)`}
          </button>
        </div>
      </div>
    </div>

    {discardConfirmOpen && (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
        onMouseDown={() => setDiscardConfirmOpen(false)}
        role="presentation"
      >
        <div
          className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full p-5"
          onMouseDown={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="csv-discard-title"
          aria-describedby="csv-discard-desc"
        >
          <h3 id="csv-discard-title" className="text-lg font-semibold text-charcoal">
            Discard imported data?
          </h3>
          <p id="csv-discard-desc" className="text-[13px] text-gray-600 mt-2">
            You have a CSV loaded in this window. Closing will clear the preview and column mapping.
          </p>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5">
            <button
              type="button"
              className="btn text-[13px] w-full sm:w-auto"
              onClick={() => setDiscardConfirmOpen(false)}
            >
              Keep editing
            </button>
            <button type="button" className="btn btn-primary text-[13px] w-full sm:w-auto" onClick={performClose}>
              Discard and close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default SessionCsvImportModal;
