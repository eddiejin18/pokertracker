import React, { useState, useEffect, useCallback } from 'react';
import { Users, Trophy, Plus, Copy, Trash2, LogOut, RefreshCw, Settings2, X } from 'lucide-react';
import ApiService from '../services/api';
import { useToast } from './ToastProvider';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

const formatHours = (h) => {
  const x = Number(h) || 0;
  const whole = Math.floor(x);
  const m = Math.round((x - whole) * 60);
  return `${whole}h ${m}m`;
};

const GroupsView = ({ initialSelectedGroupId }) => {
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState(initialSelectedGroupId ?? null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [groupSettings, setGroupSettings] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [membersError, setMembersError] = useState(null);

  const loadGroups = useCallback(async () => {
    try {
      const list = await ApiService.getGroups();
      setGroups(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.show(e.message || 'Could not load groups', { type: 'error' });
    } finally {
      setLoadingList(false);
    }
  }, [toast]);

  const loadDetail = useCallback(
    async (id) => {
      if (!id) return;
      setDetailLoading(true);
      try {
        const d = await ApiService.getGroup(id);
        setDetail(d);
      } catch (e) {
        toast.show(e.message || 'Could not load group', { type: 'error' });
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (initialSelectedGroupId) setSelectedId(initialSelectedGroupId);
  }, [initialSelectedGroupId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetail(null);
    loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (!selectedId) return;
    const t = setInterval(() => loadDetail(selectedId), 12000);
    return () => clearInterval(t);
  }, [selectedId, loadDetail]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = createName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const g = await ApiService.createGroup(name);
      setCreateName('');
      await loadGroups();
      setSelectedId(g.id);
      toast.show('Group created — share your invite code with friends', { type: 'success' });
    } catch (err) {
      toast.show(err.message || 'Could not create group', { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const code = joinCode.trim();
    if (!code || busy) return;
    setBusy(true);
    try {
      const g = await ApiService.joinGroup(code);
      setJoinCode('');
      await loadGroups();
      setSelectedId(g.id);
      toast.show(`Joined ${g.name}`, { type: 'success' });
    } catch (err) {
      toast.show(err.message || 'Could not join', { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const copyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(
      () => toast.show('Invite code copied', { type: 'success' }),
      () => toast.show('Could not copy', { type: 'error' })
    );
  };

  const canManage =
    detail && (detail.viewerRole === 'owner' || detail.viewerRole === 'moderator' || detail.isOwner);

  const openSettings = async () => {
    if (!selectedId || !canManage) return;
    setSettingsOpen(true);
    setSettingsLoading(true);
    setMembersLoading(true);
    setSettingsError(null);
    setMembersError(null);
    try {
      const [s, m] = await Promise.all([
        ApiService.getGroupSettings(selectedId),
        ApiService.getGroupMembers(selectedId),
      ]);
      setGroupSettings(s);
      setMembers(Array.isArray(m) ? m : []);
    } catch (e) {
      const msg = e.message || 'Could not load group settings';
      toast.show(msg, { type: 'error' });
      setSettingsError(msg);
      setMembersError(msg);
    } finally {
      setSettingsLoading(false);
      setMembersLoading(false);
    }
  };

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  const handleSaveSettings = async () => {
    if (!selectedId || !groupSettings) return;
    setSettingsSaving(true);
    try {
      await ApiService.updateGroupSettings(selectedId, {
        locationType: groupSettings.locationType,
        location: groupSettings.location,
        gameType: groupSettings.gameType,
        blinds: groupSettings.blinds,
        startDate: groupSettings.startDate,
        endDate: groupSettings.endDate,
      });
      toast.show('Filters updated', { type: 'success' });
      closeSettings();
      await loadDetail(selectedId);
    } catch (e) {
      toast.show(e.message || 'Could not save filters', { type: 'error' });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleMakeModerator = async (userId) => {
    if (!selectedId) return;
    try {
      setBusy(true);
      await ApiService.addModerator(selectedId, userId);
      toast.show('Moderator updated', { type: 'success' });
      const m = await ApiService.getGroupMembers(selectedId);
      setMembers(Array.isArray(m) ? m : []);
      await loadDetail(selectedId);
    } catch (e) {
      toast.show(e.message || 'Could not update moderator', { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedId) return;
    try {
      setBusy(true);
      await ApiService.removeGroupMember(selectedId, userId);
      toast.show('Member removed', { type: 'info' });
      const m = await ApiService.getGroupMembers(selectedId);
      setMembers(Array.isArray(m) ? m : []);
      await loadDetail(selectedId);
    } catch (e) {
      toast.show(e.message || 'Could not remove member', { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!selectedId || !detail || detail.isOwner || busy) return;
    setLeaveConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId || !detail?.isOwner || busy) return;
    setDeleteConfirmOpen(true);
  };

  const confirmLeave = async () => {
    if (!selectedId) return;
    setLeaveConfirmOpen(false);
    setBusy(true);
    try {
      await ApiService.leaveGroup(selectedId);
      setSelectedId(null);
      setDetail(null);
      await loadGroups();
      toast.show('Left group', { type: 'info' });
    } catch (err) {
      toast.show(err.message || 'Could not leave', { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    setDeleteConfirmOpen(false);
    setBusy(true);
    try {
      await ApiService.deleteGroup(selectedId);
      setSelectedId(null);
      setDetail(null);
      await loadGroups();
      toast.show('Group deleted', { type: 'info' });
    } catch (err) {
      toast.show(err.message || 'Could not delete', { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const formatSettingsSummary = (settings) => {
    const s = settings || {};
    const parts = [];

    const lt = s.locationType || 'ALL';
    if (lt !== 'ALL') {
      const label =
        lt === 'home'
          ? 'Home'
          : lt === 'casino'
            ? 'Casino'
            : lt === 'online'
              ? 'Online'
              : lt;
      const loc = s.location ? String(s.location).trim() : '';
      parts.push(loc ? `${label}: ${loc}` : label);
    }

    if (s.gameType && s.gameType !== 'ALL') parts.push(`Game: ${s.gameType}`);
    if (s.blinds && s.blinds !== 'ALL') parts.push(`Stakes: ${s.blinds}`);

    if (s.startDate) {
      try {
        const sd = new Date(s.startDate);
        parts.push(`From ${sd.toLocaleDateString('en-US')}`);
      } catch (_) {}
    }
    if (s.endDate) {
      try {
        const ed = new Date(s.endDate);
        parts.push(`To ${ed.toLocaleDateString('en-US')}`);
      } catch (_) {}
    }

    if (parts.length === 0) return 'All data';
    return parts.join(' · ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Groups</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Create a group, share the invite code, and compare results on a live leaderboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New group
            </h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Group name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                maxLength={120}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-blue-500 focus:border-gray-500"
              />
              <button
                type="submit"
                disabled={busy || !createName.trim()}
                className="btn justify-center text-[13px] disabled:opacity-50"
              >
                Create group
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" strokeWidth={2} />
              Join with code
            </h2>
            <form onSubmit={handleJoin} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-mono tracking-wide focus:ring-2 focus:ring-blue-500 focus:border-gray-500"
              />
              <button
                type="submit"
                disabled={busy || !joinCode.trim()}
                className="btn justify-center text-[13px] disabled:opacity-50"
              >
                Join group
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" strokeWidth={2} />
                Your groups
              </h2>
              <button
                type="button"
                onClick={() => loadGroups()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50"
                title="Refresh list"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            {loadingList ? (
              <p className="text-[13px] text-gray-500">Loading…</p>
            ) : groups.length === 0 ? (
              <p className="text-[13px] text-gray-500">No groups yet — create one or join with a code.</p>
            ) : (
              <ul className="space-y-1">
                {groups.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(g.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-colors border ${
                        selectedId === g.id
                          ? 'border-blue-200 bg-blue-50/80 text-charcoal font-medium'
                          : 'border-transparent hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="block truncate">{g.name}</span>
                      <span className="text-[11px] text-gray-500">{g.memberCount} members</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          {!selectedId ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
              <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-3" strokeWidth={1.25} />
              <p className="text-[14px] text-gray-600">Select a group to see the leaderboard.</p>
            </div>
          ) : detailLoading && !detail ? (
            <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-[13px] text-gray-500">
              Loading leaderboard…
            </div>
          ) : detail ? (
            <div className="rounded-xl border border-gray-100 bg-white shadow-soft overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">{detail.name}</h2>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {detail.memberCount} members · ranked by total profit · updates every ~12s
                  </p>
                  {detail.settings && (
                    <p className="text-[12px] text-gray-500 mt-1">
                      Filters: {formatSettingsSummary(detail.settings)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {detail.inviteCode && (
                    <button
                      type="button"
                      onClick={() => copyCode(detail.inviteCode)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] font-mono hover:bg-gray-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {detail.inviteCode}
                    </button>
                  )}
                  {!detail.isOwner && (
                    <button
                      type="button"
                      onClick={handleLeave}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Leave
                    </button>
                  )}
                  {detail.isOwner && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-[12px] text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete group
                    </button>
                  )}
                  {canManage && (
                    <button
                      type="button"
                      onClick={openSettings}
                      disabled={busy || settingsLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      title="Manage moderators and leaderboard filters"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      Settings
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-500">Rank</th>
                      <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-500">Player</th>
                      <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">
                        Total profit
                      </th>
                      <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">
                        Hourly
                      </th>
                      <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">
                        Sessions
                      </th>
                      <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">
                        Hours played
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.leaderboard.map((row) => (
                      <tr
                        key={row.userId}
                        className={`border-b border-gray-100 last:border-0 ${
                          row.isYou ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-[14px] font-semibold tabular-nums text-neutral-800">
                          #{row.rank}
                        </td>
                        <td className="py-3 px-4 text-[14px]">
                          <span className="font-medium text-neutral-900">{row.name}</span>
                          {row.isYou && (
                            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                              You
                            </span>
                          )}
                        </td>
                        <td
                          className={`py-3 px-4 text-[14px] text-right tabular-nums font-medium ${
                            row.totalWinnings >= 0 ? 'text-neutral-900' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(row.totalWinnings)}
                        </td>
                        <td className="py-3 px-4 text-[14px] text-right tabular-nums text-gray-700">
                          {formatCurrency(row.hourlyProfit)}
                        </td>
                        <td className="py-3 px-4 text-[14px] text-right tabular-nums text-gray-700">
                          {row.sessionCount}
                        </td>
                        <td className="py-3 px-4 text-[14px] text-right tabular-nums text-gray-600">
                          {formatHours(row.totalHours)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {settingsOpen && (
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
                  onMouseDown={(e) => {
                    if (e.target === e.currentTarget) closeSettings();
                  }}
                >
                  <div
                    className="bg-white rounded-xl shadow-luxury border border-gray-100 max-w-2xl w-full overflow-hidden"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-charcoal">Group settings</h3>
                        <p className="text-[12px] text-gray-500 mt-0.5">Moderators can update filters and manage group access.</p>
                      </div>
                      <button
                        type="button"
                        onClick={closeSettings}
                        className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-4 sm:p-5 space-y-6">
                      <div>
                        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Filters</h4>
                        {settingsLoading ? (
                          <p className="text-[13px] text-gray-500">Loading…</p>
                        ) : settingsError || !groupSettings ? (
                          <p className="text-[13px] text-gray-500 bg-amber-50/80 border border-amber-100 px-4 py-3 rounded-lg">
                            Group settings unavailable. Please ensure the server is running the latest backend (restart `npm run server`) and hard refresh.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Location type</label>
                              <div className="relative">
                                <select
                                  value={groupSettings.locationType || 'ALL'}
                                  onChange={(e) =>
                                    setGroupSettings((prev) => ({
                                      ...(prev || {}),
                                      locationType: e.target.value,
                                      location: prev?.location || '',
                                    }))
                                  }
                                  className="w-full appearance-none px-3 pr-11 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-gray-500"
                                >
                                  <option value="ALL">All</option>
                                  <option value="home">Home</option>
                                  <option value="casino">Casino</option>
                                  <option value="online">Online</option>
                                </select>
                                <svg
                                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {groupSettings.locationType === 'casino'
                                  ? 'Casino'
                                  : groupSettings.locationType === 'online'
                                    ? 'Site / platform'
                                    : 'Location'}
                              </label>
                              <input
                                type="text"
                                value={groupSettings.location || ''}
                                onChange={(e) =>
                                  setGroupSettings((prev) => ({
                                    ...(prev || {}),
                                    location: e.target.value,
                                  }))
                                }
                                disabled={(groupSettings.locationType || 'ALL') === 'ALL'}
                                placeholder={
                                  groupSettings.locationType === 'casino'
                                    ? 'e.g. Aria Casino'
                                    : groupSettings.locationType === 'online'
                                      ? 'e.g. PokerStars'
                                      : 'e.g. John\'s house'
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-gray-500"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex gap-3 mt-5">
                          <button
                            type="button"
                            onClick={closeSettings}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveSettings}
                            disabled={settingsSaving || settingsLoading || !groupSettings}
                            className="flex-1 px-4 py-2.5 bg-charcoal text-white rounded-lg text-[14px] font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {settingsSaving ? 'Saving…' : 'Save filters'}
                          </button>
                        </div>
                      </div>

                      {canManage && (
                        <div>
                          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                            Members
                          </h4>
                          {membersLoading ? (
                            <p className="text-[13px] text-gray-500">Loading…</p>
                          ) : membersError ? (
                            <p className="text-[13px] text-gray-500 bg-amber-50/80 border border-amber-100 px-4 py-3 rounded-lg">
                              Members unavailable.
                            </p>
                          ) : members.length === 0 ? (
                            <p className="text-[13px] text-gray-500">No members found.</p>
                          ) : (
                            <div className="space-y-2">
                              {members.map((m) => (
                                <div
                                  key={m.userId}
                                  className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg px-3 py-2 bg-white"
                                >
                                  <div className="min-w-0">
                                    <p className="text-[14px] font-medium text-gray-900 truncate">{m.name}</p>
                                    <p className="text-[12px] text-gray-500">
                                      {m.role === 'owner'
                                        ? 'Owner'
                                        : m.role === 'moderator'
                                          ? 'Moderator'
                                          : 'Member'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {m.role === 'member' && (
                                      <button
                                        type="button"
                                        onClick={() => handleMakeModerator(m.userId)}
                                        disabled={busy}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                      >
                                        Make mod
                                      </button>
                                    )}
                                    {m.role !== 'owner' && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveMember(m.userId)}
                                        disabled={busy}
                                        className="px-3 py-1.5 border border-red-200 rounded-lg text-[13px] font-medium text-red-700 hover:bg-red-50/50 disabled:opacity-50"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {leaveConfirmOpen && (
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
                  onClick={() => setLeaveConfirmOpen(false)}
                  role="dialog"
                  aria-modal="true"
                >
                  <div
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-luxury max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold text-charcoal mb-2">Leave group</h3>
                    <p className="text-[14px] text-gray-500 mb-6">
                      You can rejoin later using the invite code.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setLeaveConfirmOpen(false)}
                        disabled={busy}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-medium text-charcoal hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmLeave}
                        disabled={busy}
                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-[14px] font-medium hover:bg-gray-800 disabled:opacity-50"
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {deleteConfirmOpen && (
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
                  onClick={() => setDeleteConfirmOpen(false)}
                  role="dialog"
                  aria-modal="true"
                >
                  <div
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-luxury max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold text-charcoal mb-2">Delete group</h3>
                    <p className="text-[14px] text-gray-500 mb-6">
                      This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmOpen(false)}
                        disabled={busy}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-medium text-charcoal hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmDelete}
                        disabled={busy}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-[14px] font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Polling happens silently; keep UI stable */}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GroupsView;
