import React, { useState, useCallback } from 'react';
import {
  ArrowRight,
  Calendar,
  DollarSign,
  BarChart3,
  CheckCircle,
  Mail,
  LineChart,
  HelpCircle,
  Users,
} from 'lucide-react';
import SupportModal from './SupportModal';

const navItems = [
  { id: 'section-sessions', label: 'Sessions', icon: Calendar },
  { id: 'section-analytics', label: 'Analytics', icon: LineChart },
  { id: 'section-groups', label: 'Groups', icon: Users },
];

const SEO_GUIDE_LINKS = [
  {
    href: '/guides/track-poker-sessions-profit.html',
    title: 'Track sessions & profit',
    blurb: 'What to log, profit, hourly rate, and groups.',
  },
  {
    href: '/guides/poker-bankroll-management.html',
    title: 'Bankroll basics',
    blurb: 'Separate bankroll, risk, and long-term trends.',
  },
  {
    href: '/guides/poker-hourly-rate.html',
    title: 'Hourly rate explained',
    blurb: 'Formula, variance, and why averages help.',
  },
  {
    href: '/guides/spreadsheet-vs-poker-tracker.html',
    title: 'Spreadsheet vs tracker',
    blurb: 'When Excel works and when software fits.',
  },
  {
    href: '/guides/online-vs-live-poker-tracking.html',
    title: 'Online vs live tracking',
    blurb: 'One ledger for sites, casinos, and home games.',
  },
  {
    href: '/guides/poker-tournament-tracking.html',
    title: 'Tournament tracking',
    blurb: 'MTT & SNG buy-ins, cashes, and duration.',
  },
];

const LandingPage = ({ onGetStarted }) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('section-sessions');

  const scrollToSection = useCallback((id) => {
    // Only switch the hero preview for the 3 preview tabs.
    if (id === 'section-sessions' || id === 'section-analytics' || id === 'section-groups') {
      setActiveNav(id);
    }
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Preview tabs: update hero preview without scrolling the page.
  const setPreviewTab = useCallback((id) => {
    setActiveNav(id);
  }, []);

  return (
    <div className="min-h-screen bg-mist text-charcoal antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/pokericon.png"
              alt="Poker Tracker — free poker bankroll and session tracking app"
              className="h-9 w-9 object-contain"
            />
            <span className="text-[15px] font-semibold tracking-tight text-charcoal">Poker Tracker</span>
          </div>
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-charcoal px-5 py-2.5 text-[13px] font-medium text-white tracking-tight shadow-luxury-sm transition hover:bg-charcoal/90"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5 opacity-80" strokeWidth={2} />
          </button>
        </div>
      </header>

      <main id="main-content">
      {/* Hero: sidebar + feature card */}
      <div id="hero" className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 lg:pt-16 pb-20 lg:pb-28 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Sidebar navigation */}
          <aside className="lg:col-span-4 xl:col-span-3" aria-label="Product areas">
            <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-8">
              Free poker tracker · live &amp; online sessions
            </h1>
            <nav className="space-y-1" aria-label="Product sections">
              {navItems.map(({ id, label, icon: Icon }) => {
                const active = activeNav === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPreviewTab(id)}
                    className={`w-full flex items-center gap-4 text-left py-2.5 rounded-xl transition-all duration-300 ${
                      active ? '' : 'hover:opacity-80'
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                        active
                          ? 'bg-gray-100 border-gray-200 text-charcoal'
                          : 'bg-white border-gray-200 text-charcoal shadow-sm'
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <span
                      className={`text-[15px] font-medium tracking-tight rounded-full px-4 py-2 transition-all duration-300 ${
                        active
                          ? 'bg-white text-charcoal shadow-soft border border-gray-200'
                          : 'text-gray-600'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Hero card */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-soft min-h-[290px] lg:min-h-[340px]">
              <div className="absolute inset-0 bg-gray-50/80" />
              <div className="relative p-4 lg:p-7 pt-5 lg:pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                </div>

                {/* Variant-specific mini preview (no scrolling; changes with the active tab) */}
                {activeNav === 'section-analytics' && (
                  <>
                    <div className="grid sm:grid-cols-3 gap-4 w-full mb-6">
                      {[
                        { k: 'This month', v: '+$2,450' },
                        { k: 'Sessions', v: '24' },
                        { k: 'Hourly', v: '$48' },
                      ].map((row) => (
                        <div
                          key={row.k}
                          className="rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
                        >
                          <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                            {row.k}
                          </p>
                          <p className="text-lg font-semibold text-charcoal tracking-tight tabular-nums">
                            {row.v}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="h-px w-full bg-gray-100 mb-5" />
                    <div className="flex items-end gap-1.5 h-24 w-full">
                      {[40, 55, 45, 70, 62, 88, 75, 92, 68, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-violet-200/90"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </>
                )}

                {activeNav === 'section-sessions' && (
                  <>
                    <div className="w-full mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          Recent sessions
                        </p>
                        <p className="text-[11px] text-gray-400">Sample data</p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
                        <div className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider text-gray-500 mb-2">
                          <span className="col-span-3">Date</span>
                          <span className="col-span-7">Session</span>
                          <span className="col-span-2 text-right">Profit</span>
                        </div>

                        <div className="divide-y divide-gray-100">
                          {[
                            {
                              date: 'Today',
                              game: "No Limit Hold'em",
                              stake: '$1/$2',
                              loc: 'Online · PokerStars',
                              profit: '+$150',
                              profitPos: true,
                            },
                            {
                              date: 'Yesterday',
                              game: "Limit Hold'em",
                              stake: '$0.50/$1',
                              loc: "Home · John's house",
                              profit: '-$75',
                              profitPos: false,
                            },
                            {
                              date: '2 days ago',
                              game: 'No Limit Omaha',
                              stake: '$2/$5',
                              loc: 'Casino · Aria Resort',
                              profit: '+$300',
                              profitPos: true,
                            },
                          ].map((r) => (
                            <div
                              key={`${r.date}-${r.game}-${r.profit}`}
                              className="grid grid-cols-12 gap-2 items-center py-2"
                            >
                              <div className="col-span-3 text-[13px] font-medium text-charcoal tabular-nums truncate">
                                {r.date}
                              </div>

                              <div className="col-span-7 min-w-0">
                                <p className="text-[13px] font-semibold text-charcoal truncate">
                                  {r.game} · {r.stake}
                                </p>
                                <p className="text-[12px] text-gray-500 mt-0.5 truncate">{r.loc}</p>
                              </div>

                              <div
                                className={`col-span-2 text-[13px] font-semibold tabular-nums text-right ${
                                  r.profitPos ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {r.profit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeNav === 'section-groups' && (
                  <>
                    <div className="grid sm:grid-cols-3 gap-4 w-full mb-6">
                      {[
                        { k: 'Group', v: '4 friends' },
                        { k: 'Your rank', v: '#3' },
                        { k: 'Hourly', v: '$41' },
                      ].map((row) => (
                        <div
                          key={row.k}
                          className="rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
                        >
                          <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                            {row.k}
                          </p>
                          <p className="text-lg font-semibold text-charcoal tracking-tight tabular-nums">
                            {row.v}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="h-px w-full bg-gray-100 mb-4" />
                    <div className="w-full space-y-2">
                      {[
                        { rank: 1, name: 'Alex', total: '+$1,240', hourly: '$52' },
                        { rank: 2, name: 'Marvin', total: '+$980', hourly: '$41' },
                        { rank: 3, name: 'You', total: '+$760', hourly: '$34', you: true },
                        { rank: 4, name: 'Jordan', total: '+$540', hourly: '$22' },
                      ].map((r, idx) => (
                        <div
                          key={idx}
                          className={`rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm flex items-center justify-between gap-4 ${
                            r.you ? 'bg-blue-50/40 border-blue-100' : ''
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-charcoal">
                              #{r.rank} {r.name}
                              {r.you && (
                                <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-semibold text-charcoal tabular-nums">{r.total}</p>
                            <p className="text-[12px] text-gray-500 mt-0.5 tabular-nums">{r.hourly} / hr</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Feature preview only (no headline/button panel) */}
            </div>
          </div>
        </div>
      </div>

      {/* Platform */}
      <section
        id="section-platform"
        className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 scroll-mt-24 border-t border-gray-100"
      >
        <div className="max-w-2xl mb-16 lg:mb-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">Platform</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-charcoal leading-[1.15] mb-6">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-normal">
            Professional poker tracking without visual noise. Record sessions, follow your bankroll, and read your results at a glance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              icon: Calendar,
              title: 'Session recording',
              copy: 'Cash, tournaments, live or online — logged in one structured place.',
            },
            {
              icon: DollarSign,
              title: 'Bankroll focus',
              copy: 'Profit, hourly rate, and trends without spreadsheet gymnastics.',
            },
            {
              icon: BarChart3,
              title: 'Quiet analytics',
              copy: 'Charts and summaries that respect your attention.',
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="group rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-8 lg:p-9 transition-shadow duration-500 hover:shadow-luxury-sm"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-charcoal shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-charcoal mb-3">{title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-600 font-normal">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sessions */}
      <section
        id="section-sessions"
        className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 scroll-mt-24"
      >
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 rounded-[1.75rem] border border-gray-100 bg-gray-50 p-8 lg:p-10 shadow-luxury-sm">
            <div className="space-y-3">
              {[
                { name: 'PokerStars', sub: '+$150 · 2.5h · Jan 15', amt: '+$150', pos: true },
                { name: 'GGPoker', sub: '−$75 · 1.5h · Jan 14', amt: '−$75', pos: false },
                { name: 'Aria Casino', sub: '+$300 · 4h · Jan 13', amt: '+$300', pos: true },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4"
                >
                  <div>
                    <p className="text-[15px] font-medium text-charcoal tracking-tight">{row.name}</p>
                    <p className="text-[13px] text-gray-500 mt-0.5">{row.sub}</p>
                  </div>
                  <span
                    className={`text-[15px] font-semibold tabular-nums ${row.pos ? 'text-charcoal' : 'text-gray-500'}`}
                  >
                    {row.amt}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1">Today</p>
              <p className="text-2xl font-semibold text-charcoal tracking-tight">+$375</p>
              <p className="text-[13px] text-gray-600 mt-1">8h · $46.88 / hr</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">Sessions</p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-charcoal leading-[1.15] mb-6">
              Track from anywhere.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-10 font-normal">
              One ledger for every game type. See the story your results tell — without clutter.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-charcoal px-6 py-3 text-[14px] font-medium text-white tracking-tight transition hover:bg-charcoal/90"
            >
              Open session log
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <ul className="mt-10 space-y-3 text-[14px] text-gray-600">
              {['Cash and tournaments together', 'Automatic hourly figures', 'Any site or live room'].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section
        id="section-analytics"
        className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 scroll-mt-24 border-t border-gray-100"
      >
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">Analytics</p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-charcoal leading-[1.15] mb-6">
              Progress over time.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-10 font-normal">
              Trends and summaries designed to be read quickly — then you get back to playing.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-charcoal px-6 py-3 text-[14px] font-medium text-white tracking-tight transition hover:bg-charcoal/90"
            >
              View analytics
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <ul className="mt-10 space-y-3 text-[14px] text-gray-600">
              {['Clear charts', 'Hourly rate over any window', 'Breakdowns by game type'].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.75rem] border border-gray-100 bg-gray-50 p-8 lg:p-10 shadow-luxury-sm">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">This month</p>
                <p className="text-xl font-semibold text-charcoal tracking-tight">+$2,450</p>
                <p className="text-[12px] text-gray-500 mt-1">vs prior month</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">Hourly</p>
                <p className="text-xl font-semibold text-charcoal tracking-tight">$28.50</p>
                <p className="text-[12px] text-gray-500 mt-1">Last 30 days</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-[13px] font-medium text-charcoal mb-4">Bankroll</p>
              <div className="flex h-28 items-end gap-1">
                {[35, 48, 42, 58, 52, 68, 62, 78, 72, 88, 85, 92].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-gray-200" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 mt-3 uppercase tracking-wide">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Groups */}
      <section
        id="section-groups"
        className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 scroll-mt-24 border-t border-gray-100"
      >
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">Groups</p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-charcoal leading-[1.15] mb-6">
              Compare with friends.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-10 font-normal">
              Invite a friend, track together, and see real-time ranking based on total profit, hourly rate, and sessions.
            </p>
            <ul className="mt-2 space-y-3 text-[14px] text-gray-600">
              {[
                'Invite links + quick join flow',
                'Live leaderboard for everyone in your group',
                'Moderator controls for what data shows',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-charcoal px-6 py-3 text-[14px] font-medium text-white tracking-tight transition hover:bg-charcoal/90"
              >
                Create your group
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-gray-100 bg-white p-8 lg:p-10 shadow-luxury-sm">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-6">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Example leaderboard</p>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Alex', total: '+$1,240', hourly: '$52', sessions: '18' },
                  { rank: 2, name: 'Marvin', total: '+$980', hourly: '$41', sessions: '17' },
                  { rank: 3, name: 'You', total: '+$760', hourly: '$34', sessions: '16' },
                ].map((row) => (
                  <div key={row.rank} className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-charcoal truncate">
                        #{row.rank} {row.name}
                      </p>
                      <p className="text-[12px] text-gray-500 mt-0.5">{row.sessions} sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-charcoal tabular-nums">{row.total}</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">{row.hourly} / hr</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-gray-100 bg-white px-5 py-4">
              <p className="text-[12px] text-gray-600">
                Members with moderator permissions can update filters (online only, location, blinds, and more).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guides — crawlable text + internal links */}
      <section
        id="section-guides"
        className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 scroll-mt-24 border-t border-gray-100"
      >
        <div className="max-w-2xl mb-12 lg:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">Guides &amp; resources</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-charcoal leading-[1.15] mb-6">
            Learn poker tracking — without the noise
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-normal">
            Practical articles on session logging, bankroll, hourly rate, tournaments, and how a dedicated tracker compares to spreadsheets. Written for players who want
            accurate history and clearer decisions.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {SEO_GUIDE_LINKS.map(({ href, title, blurb }) => (
            <a
              key={href}
              href={href}
              className="group rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm p-6 lg:p-7 transition-shadow duration-300 hover:shadow-luxury-sm hover:border-gray-200"
            >
              <h3 className="text-[15px] font-semibold tracking-tight text-charcoal mb-2 group-hover:text-charcoal">{title}</h3>
              <p className="text-[14px] leading-relaxed text-gray-600 font-normal">{blurb}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-[13px] font-medium text-charcoal">
                Read
                <ArrowRight className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="section-faq" className="max-w-3xl mx-auto px-6 lg:px-10 py-20 lg:py-28 scroll-mt-24">
        <div className="text-center mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">FAQ</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-charcoal">Common questions</h2>
        </div>
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white/60 backdrop-blur-sm overflow-hidden">
          {[
            {
              q: 'Is this poker tracker really free?',
              a: 'Yes. Record sessions, manage your bankroll, and review performance with no subscription or hidden fees.',
            },
            {
              q: 'How is this better than a spreadsheet?',
              a: 'It is built only for poker: fewer steps, no formula maintenance, and views that match how players think about results.',
            },
            {
              q: 'Can I track multiple sites?',
              a: 'Yes. Online and live sessions live in one ledger so you always see the full picture.',
            },
            {
              q: 'What can I track?',
              a: 'Wins, losses, profit, hourly rate, duration, and bankroll trajectory — the essentials for serious study.',
            },
            {
              q: 'What is hourly rate in poker and why does it matter?',
              a: 'Hourly rate is profit divided by hours played. It smooths out luck in single sessions and helps you review performance over many games — something a good tracker calculates for you.',
            },
            {
              q: 'Can I track live and online poker together?',
              a: 'Yes. Label sessions by location type (home, casino, or online) so filters and charts stay meaningful while your bankroll stays in one place.',
            },
            {
              q: 'Does this work for tournaments or only cash games?',
              a: 'You can log tournaments with buy-ins and payouts alongside cash sessions. Net profit and duration still drive your bankroll and hourly figures.',
            },
            {
              q: 'How do groups and leaderboards work?',
              a: 'Create a group, invite friends, and see rankings by metrics like total profit and hourly rate. Moderators can filter which sessions count (e.g. online only).',
            },
            {
              q: 'Do I need to install desktop software?',
              a: 'No. The product runs in your web browser on desktop and mobile — sign up and start logging sessions without a separate install.',
            },
            {
              q: 'Is my data tied to my account?',
              a: 'Your session history is stored with your login so you can access it from any device where you sign in.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="px-6 py-8 lg:px-8">
              <h3 className="text-[17px] font-semibold text-charcoal tracking-tight mb-3">{q}</h3>
              <p className="text-[15px] leading-relaxed text-gray-600 font-normal">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 py-20 lg:py-28" aria-label="Get started">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-charcoal mb-5">
            Ready when you are.
          </h2>
          <p className="text-lg text-gray-600 mb-10 font-normal leading-relaxed">
            Start in minutes. No card required.
          </p>
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-charcoal px-8 py-3.5 text-[15px] font-medium text-white tracking-tight shadow-luxury-sm transition hover:bg-charcoal/90"
          >
            Start tracking free
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-4 gap-12 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="/pokericon.png"
                  alt="Poker Tracker logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-[15px] font-semibold tracking-tight">Poker Tracker</span>
              </div>
              <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                A free tracker for players who want clarity, not clutter.
              </p>
              <button
                type="button"
                onClick={() => setIsSupportOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-charcoal px-4 py-2 text-[13px] font-medium text-white transition hover:bg-charcoal/90"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                Contact
              </button>
            </div>
            {[
              {
                title: 'Product',
                links: [
                  { label: 'Analytics', href: '#section-analytics' },
                  { label: 'Sessions', href: '#section-sessions' },
                  { label: 'Groups', href: '#section-groups' },
                ],
              },
              {
                title: 'Guides',
                links: SEO_GUIDE_LINKS.map(({ href, title }) => ({ label: title, href })),
              },
              {
                title: 'Support',
                links: [
                  { label: 'FAQ', href: '#section-faq' },
                  { label: 'Contact', href: '#section-faq' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4">{col.title}</h3>
                <ul className="space-y-2.5 text-[14px] text-gray-600">
                  {col.links.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="hover:text-charcoal transition-colors">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100 text-[13px] text-gray-500">
            <span>© {new Date().getFullYear()} Poker Tracker</span>
            <div className="flex gap-6">
              <a href="#main-content" className="hover:text-charcoal transition-colors">
                Back to top
              </a>
            </div>
          </div>
        </div>
      </footer>

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
};

export default LandingPage;
