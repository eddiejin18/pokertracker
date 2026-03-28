import React, { useEffect } from 'react';

const HOME_SEO = {
  title: 'Free Poker Tracker & Bankroll Tracker | Live & Online Sessions',
  description:
    'Free poker tracker and bankroll tracker: log live and online sessions, profit, hourly rate, charts, and friend groups. No subscription.',
  keywords:
    'free poker tracker, poker bankroll tracker, poker session tracker, track poker winnings, poker profit tracker, online poker tracker, live poker tracker, poker analytics',
};

const ABSOLUTE_ORIGIN = 'https://freepokertracker.com';

const SEOContent = () => {
  useEffect(() => {
    const path = window.location.pathname || '/';
    const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    const seoConfigs = {
      '/free-poker-tracker-app': {
        title: 'Free Poker Tracker App | Web Poker Tracking',
        description:
          'Use our free poker tracker in the browser — sessions, bankroll, and analytics without installing desktop software.',
        keywords:
          'free poker tracker app, poker tracker app, web poker tracker, browser poker tracker',
      },
      '/free-poker-tracker-download': {
        title: 'Free Poker Tracker — Sign Up & Start Tracking',
        description:
          'Create a free account and start tracking poker sessions, profit, and hourly rate. No download required for the web app.',
        keywords:
          'free poker tracker, poker tracker sign up, poker tracking software, web poker tracker',
      },
      '/best-free-poker-tracker': {
        title: 'Best Free Poker Tracker | Sessions & Bankroll',
        description:
          'A focused free poker tracker for logging results, understanding your hourly rate, and reviewing performance over time.',
        keywords:
          'best free poker tracker, free poker tracking, poker results tracker, poker hourly rate',
      },
      '/poker-tracker-4': {
        title: 'Poker Tracker 4 Alternative | Modern Free Tracker',
        description:
          'A modern, free alternative focused on fast session entry, clear analytics, and bankroll visibility — web-based, no PT4 install.',
        keywords:
          'poker tracker 4 alternative, pt4 alternative, free poker tracker, online poker tracking',
      },
      '/poker-tracker-4-free': {
        title: 'Free Poker Tracker vs Paid Tools',
        description:
          'Free poker tracking for sessions, profit, and hourly stats. Compare features and start without a desktop install.',
        keywords:
          'poker tracker 4 free alternative, free poker tracker, poker bankroll tracker',
      },
      '/poker-tracker-app': {
        title: 'Poker Tracker Web App | Sessions & Analytics',
        description:
          'Track poker sessions in your browser — live and online games, bankroll trends, and group leaderboards.',
        keywords:
          'poker tracker app, web poker tracker, online poker tracker app',
      },
      '/poker-bankroll-tracker': {
        title: 'Poker Bankroll Tracker | Manage Your Poker Bankroll',
        description:
          'Monitor bankroll trajectory, session profit, and risk — one ledger for live and online poker.',
        keywords:
          'poker bankroll tracker, bankroll management poker, poker profit tracker',
      },
      '/online-poker-tracker': {
        title: 'Online Poker Tracker | Sites & Sessions',
        description:
          'Log online poker sessions by site or platform, track hourly rate, and keep bankroll history in one place.',
        keywords:
          'online poker tracker, online poker results, poker site tracker',
      },
      '/poker-tracker-download': {
        title: 'Poker Tracker — Get Started Free',
        description:
          'Start tracking poker sessions and bankroll for free. Web-based — sign up and log your first session in minutes.',
        keywords:
          'poker tracker free, start poker tracker, poker session log',
      },
      '/poker-tracker-pt4': {
        title: 'Poker Tracker PT4 Alternative | Free Web Tracker',
        description:
          'Web-based poker tracking with session history, profit, and hourly metrics — no legacy desktop install required.',
        keywords:
          'poker tracker pt4 alternative, free poker tracker, poker results',
      },
      '/poker-tracker-free': {
        title: 'Free Poker Tracker | No Subscription',
        description:
          'Free poker tracker for serious players: sessions, profit, hourly rate, analytics, and optional friend groups.',
        keywords:
          'free poker tracker, poker bankroll tracker free, poker session tracker',
      },
    };

    const config = seoConfigs[normalized];
    const isHome = normalized === '/' || normalized === '';

    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el && value) el.setAttribute(attr, value);
    };

    if (isHome) {
      document.title = HOME_SEO.title;
      setMeta('meta[name="description"]', 'content', HOME_SEO.description);
      setMeta('meta[name="keywords"]', 'content', HOME_SEO.keywords);
      setMeta('meta[property="og:title"]', 'content', HOME_SEO.title);
      setMeta('meta[property="og:description"]', 'content', HOME_SEO.description);
      setMeta('meta[property="og:url"]', 'content', `${ABSOLUTE_ORIGIN}/`);
      setMeta('meta[name="twitter:title"]', 'content', HOME_SEO.title);
      setMeta('meta[name="twitter:description"]', 'content', HOME_SEO.description);
    } else if (config) {
      document.title = config.title;
      setMeta('meta[name="description"]', 'content', config.description);
      setMeta('meta[name="keywords"]', 'content', config.keywords);
      setMeta('meta[property="og:title"]', 'content', config.title);
      setMeta('meta[property="og:description"]', 'content', config.description);
      setMeta('meta[property="og:url"]', 'content', `${ABSOLUTE_ORIGIN}${normalized}`);
      setMeta('meta[name="twitter:title"]', 'content', config.title);
      setMeta('meta[name="twitter:description"]', 'content', config.description);
    }
  }, []);

  return null;
};

export default SEOContent;
